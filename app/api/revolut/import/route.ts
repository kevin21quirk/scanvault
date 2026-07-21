import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// ── CSV Parsing ────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim()); current = "";
    } else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
}

function getField(row: Record<string, string>, ...keys: string[]): string {
  const ci = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v]));
  for (const key of keys) {
    const v = ci[key.toLowerCase().trim()];
    if (v !== undefined && v !== "") return v.trim();
  }
  return "";
}

function parseAmount(s: string): number {
  if (!s) return 0;
  return parseFloat(s.replace(/[£$€,\s]/g, "")) || 0;
}

function parseDate(s: string): string {
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const months: Record<string, string> = {
    jan:"01",feb:"02",mar:"03",apr:"04",may:"05",jun:"06",
    jul:"07",aug:"08",sep:"09",oct:"10",nov:"11",dec:"12",
    january:"01",february:"02",march:"03",april:"04",june:"06",
    july:"07",august:"08",september:"09",october:"10",november:"11",december:"12",
  };
  const m1 = s.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})/i);
  if (m1) {
    const mon = months[m1[2].toLowerCase()];
    if (mon) return `${m1[3]}-${mon}-${m1[1].padStart(2, "0")}`;
  }
  const m2 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m2) return `${m2[3]}-${m2[2].padStart(2, "0")}-${m2[1].padStart(2, "0")}`;
  return s.slice(0, 10);
}

function normalizeRow(row: Record<string, string>, idx: number) {
  const description = getField(row,
    "description", "merchant", "beneficiary / sender", "counterparty",
    "name", "payee", "transaction description", "details", "notes", "reference",
  );
  const dateRaw = getField(row,
    "completed date", "date completed (utc)", "date", "completed_date",
    "transaction date", "value date", "started date",
  );
  const date = parseDate(dateRaw);

  const paidIn  = parseAmount(getField(row, "paid in (gbp)", "credit", "money in", "paid in", "credit amount", "amount in"));
  const paidOut = parseAmount(getField(row, "paid out (gbp)", "debit", "money out", "paid out", "debit amount", "amount out"));
  const amount  = paidIn > 0 || paidOut > 0
    ? paidIn - paidOut
    : parseAmount(getField(row, "amount", "transaction amount"));

  return {
    id: `txn-${idx}`,
    date,
    description: description || `Transaction ${idx + 1}`,
    amount,
    currency: getField(row, "currency") || "GBP",
    reference: getField(row, "payment reference", "reference") || "",
    type: getField(row, "type", "category", "transaction type") || "",
  };
}

// ── Matching Logic ─────────────────────────────────────────────────────────

function jaccardSimilarity(a: string, b: string): number {
  const words = (s: string) =>
    new Set(
      s.toLowerCase()
        .replace(/\blimited\b|\bltd\.?\b|\bplc\b|\bllc\b|\binc\.?\b|\bcare home\b/g, " ")
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 2),
    );
  const aw = words(a); const bw = words(b);
  if (aw.size === 0 || bw.size === 0) return 0;
  const intersection = [...aw].filter(w => bw.has(w)).length;
  return intersection / new Set([...aw, ...bw]).size;
}

function nameScore(desc: string, entity: string): number {
  if (!entity) return 0;
  const sim = jaccardSimilarity(desc, entity);
  const dn = desc.toLowerCase().replace(/[^a-z0-9]/g, " ");
  const en = entity.toLowerCase().replace(/[^a-z0-9]/g, " ");
  const boost = dn.includes(en.trim().slice(0, 8)) || en.includes(dn.trim().slice(0, 8));
  return boost ? Math.max(sim, 0.75) : sim;
}

function daysBetween(a: string, b: Date | string): number {
  try {
    const da = new Date(a).getTime();
    const db = new Date(b).getTime();
    if (isNaN(da) || isNaN(db)) return 999;
    return Math.abs(da - db) / 86_400_000;
  } catch { return 999; }
}

function datePoints(days: number) {
  return days <= 3 ? 10 : days <= 7 ? 6 : days <= 14 ? 2 : 0;
}

// ── Route Handler ──────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try { formData = await request.formData(); }
  catch { return NextResponse.json({ error: "Invalid form data" }, { status: 400 }); }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);
  if (rows.length === 0) {
    return NextResponse.json({ error: "No transactions found in CSV. Check that the file is a valid Revolut export." }, { status: 400 });
  }

  const [invoices, receipts] = await Promise.all([
    prisma.invoice.findMany({
      include: {
        user: { select: { name: true, email: true, companyName: true } },
        careHome: { select: { name: true } },
      },
    }),
    prisma.receipt.findMany({
      include: { user: { select: { name: true, email: true, companyName: true } } },
    }),
  ]);

  const transactions = rows
    .map(normalizeRow)
    .filter(t => t.amount !== 0);

  const results = transactions.map(txn => {
    const abs = Math.abs(txn.amount);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candidates: any[] = [];

    // ── Invoice matching ──
    for (const inv of invoices) {
      let score = 0;
      const labels: string[] = [];

      if (Math.abs(inv.total - abs) < 0.02) {
        score += 50; labels.push(`Full payment £${inv.total.toFixed(2)}`);
      }
      if (inv.depositPercent && inv.depositPercent > 0) {
        const dep = parseFloat((inv.total * inv.depositPercent / 100).toFixed(2));
        if (Math.abs(dep - abs) < 0.02) {
          score += 45; labels.push(`Deposit ${inv.depositPercent}% · £${dep.toFixed(2)}`);
        }
      }
      if (score === 0) continue;

      const names = [
        inv.user.companyName, inv.user.name,
        inv.careHome?.name, (inv as Record<string, unknown>).careHomeName as string,
      ].filter(Boolean) as string[];

      let bestNS = 0; let bestName = "";
      for (const n of names) { const s = nameScore(txn.description, n); if (s > bestNS) { bestNS = s; bestName = n; } }

      score += bestNS >= 0.75 ? 40 : bestNS >= 0.5 ? 20 : bestNS >= 0.25 ? 8 : 0;
      score += datePoints(Math.min(daysBetween(txn.date, inv.dueDate), daysBetween(txn.date, inv.issueDate)));
      score = Math.min(99, score);

      if (score >= 30) {
        candidates.push({
          type: "invoice", id: inv.id, invoiceNumber: inv.invoiceNumber,
          label: labels.join(" / "),
          description: `Invoice ${inv.invoiceNumber}`,
          entityName: bestName || inv.user.companyName || inv.user.name || inv.user.email,
          amount: abs, confidence: score,
        });
      }
    }

    // ── Receipt matching ──
    for (const rec of receipts) {
      if (Math.abs(rec.amount - abs) >= 0.02) continue;
      let score = 50;

      const names = [
        rec.user.companyName, rec.user.name,
        (rec as Record<string, unknown>).careHomeName as string, rec.description,
      ].filter(Boolean) as string[];

      let bestNS = 0; let bestName = "";
      for (const n of names) { const s = nameScore(txn.description, n); if (s > bestNS) { bestNS = s; bestName = n; } }

      score += bestNS >= 0.75 ? 40 : bestNS >= 0.5 ? 20 : bestNS >= 0.25 ? 8 : 0;
      score += datePoints(daysBetween(txn.date, rec.date));
      score = Math.min(99, score);

      if (score >= 30) {
        candidates.push({
          type: "receipt", id: rec.id, receiptNumber: rec.receiptNumber,
          label: rec.description,
          description: `Receipt ${rec.receiptNumber}`,
          entityName: bestName || rec.user.companyName || rec.user.name || rec.user.email,
          amount: rec.amount, confidence: score,
        });
      }
    }

    candidates.sort((a, b) => b.confidence - a.confidence);
    const top = candidates[0]?.confidence ?? 0;

    return {
      ...txn,
      matchStatus: top >= 85 ? "matched" : top >= 50 ? "partial" : "unmatched",
      confidence: top,
      matches: candidates.slice(0, 3),
    };
  });

  return NextResponse.json({ transactions: results, total: results.length });
}
