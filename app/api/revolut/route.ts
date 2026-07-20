import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const REVOLUT_BASE = process.env.REVOLUT_SANDBOX === "true"
  ? "https://sandbox-b2b.revolut.com/api/1.0"
  : "https://b2b.revolut.com/api/1.0";

async function revolut(path: string) {
  const res = await fetch(`${REVOLUT_BASE}${path}`, {
    headers: { Authorization: `Bearer ${process.env.REVOLUT_API_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Revolut API error ${res.status}`);
  return res.json();
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ACCOUNTANT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.REVOLUT_API_KEY) {
      return NextResponse.json({ connected: false }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") ?? new Date(Date.now() - 90 * 86400000).toISOString();
    const to   = searchParams.get("to")   ?? new Date().toISOString();

    const [accounts, transactions] = await Promise.all([
      revolut("/accounts"),
      revolut(`/transactions?from=${from}&to=${to}&count=1000`),
    ]);

    return NextResponse.json({ connected: true, accounts, transactions });
  } catch (error) {
    console.error("Revolut API error:", error);
    return NextResponse.json({ error: "Failed to fetch Revolut data" }, { status: 500 });
  }
}
