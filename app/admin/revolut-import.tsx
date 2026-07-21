"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload, CheckCircle2, AlertTriangle, XCircle,
  Loader2, CloudUpload, ArrowLeft, Trash2, Paperclip,
  Clock, Plus,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface MatchCandidate {
  type: "invoice" | "receipt" | "expense";
  id: string;
  invoiceNumber?: string;
  receiptNumber?: string;
  expenseNumber?: string;
  label: string;
  description: string;
  entityName: string;
  amount: number;
  confidence: number;
}

interface StoredTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  reference: string;
  matchStatus: "matched" | "partial" | "unmatched";
  confidence: number;
  matches: MatchCandidate[];
  review?: "confirmed" | "rejected" | "skipped" | "receipt_uploaded";
  attachedExpenseNumber?: string;
}

interface ReconciliationSession {
  id: string;
  filename: string;
  transactions: StoredTransaction[];
  createdAt: string;
  updatedAt: string;
}

const EXPENSE_CATEGORIES: Record<string, string> = {
  OFFICE_SUPPLIES: "Office Supplies", EQUIPMENT: "Equipment", TRAVEL: "Travel",
  UTILITIES: "Utilities", PROFESSIONAL_SERVICES: "Professional Services",
  MARKETING: "Marketing", SOFTWARE: "Software", WAGES: "Wages", OTHER: "Other",
};

// ── Upload Screen ──────────────────────────────────────────────────────────

function UploadScreen({ onDone }: { onDone: () => void }) {
  const [file, setFile]     = useState<File | null>(null);
  const [importing, setImp] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [dragging, setDrag] = useState(false);
  const inputRef            = useRef<HTMLInputElement>(null);

  const pickFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".csv")) { setError("Please select a CSV file (.csv)"); return; }
    setFile(f); setError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0]; if (f) pickFile(f);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runImport = async () => {
    if (!file) return;
    setImp(true); setError(null);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res  = await fetch("/api/revolut/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      const save = await fetch("/api/bank-reconciliations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, transactions: data.transactions }),
      });
      if (!save.ok) throw new Error("Failed to save reconciliation session");
      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setImp(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Import Bank Statement</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload a Revolut CSV — ScanVault matches transactions against invoices, receipts and expense receipts. Results are saved so you can return to reconcile later.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer select-none transition-colors ${
              dragging ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-red-300 hover:bg-gray-50"
            }`}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <CloudUpload className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            {file ? (
              <>
                <p className="font-semibold text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB — ready to import</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-700">Drop your Revolut CSV here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                <p className="text-xs text-gray-300 mt-4">Revolut Business: Accounts → account → Download → CSV</p>
              </>
            )}
            <input ref={inputRef} type="file" accept=".csv" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
          </div>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          {file && (
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setFile(null); setError(null); }}>Clear</Button>
              <Button className="bg-scanvault-red hover:bg-red-700" onClick={runImport} disabled={importing}>
                {importing
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analysing…</>
                  : <><Upload className="h-4 w-4 mr-2" />Import &amp; Match</>}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Quick Expense Upload Modal ──────────────────────────────────────────────

function QuickExpenseModal({
  txn,
  onSaved,
  onClose,
}: {
  txn: StoredTransaction;
  onSaved: (expenseNumber: string) => void;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    vendor:      txn.description,
    amount:      Math.abs(txn.amount).toFixed(2),
    date:        txn.date,
    category:    "OTHER",
    description: "",
  });
  const [file, setFile]     = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const toBase64 = (f: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(f);
    });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let mimeType: string | null = null;
      if (file) {
        if (file.size > 5 * 1024 * 1024) { alert("File must be under 5 MB"); setSaving(false); return; }
        fileUrl = await toBase64(file); fileName = file.name; mimeType = file.type;
      }
      const res = await fetch("/api/expense-receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fileUrl, fileName, mimeType }),
      });
      if (res.ok) {
        const saved = await res.json();
        onSaved(saved.expenseNumber);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save");
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Upload Expense Receipt</CardTitle>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="w-4 h-4" /></button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium text-gray-700">Bank transaction</p>
            <p className="text-gray-500">{txn.description} · <span className="font-semibold text-gray-800">£{Math.abs(txn.amount).toFixed(2)}</span> · {txn.date}</p>
          </div>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Vendor / Supplier *</Label>
                <Input value={form.vendor} onChange={set("vendor")} required className="mt-1 h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Amount (£) *</Label>
                <Input type="number" step="0.01" min="0" value={form.amount} onChange={set("amount")} required className="mt-1 h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Date *</Label>
                <Input type="date" value={form.date} onChange={set("date")} required className="mt-1 h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <select value={form.category} onChange={set("category")} className="mt-1 w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm">
                  {Object.entries(EXPENSE_CATEGORIES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Description</Label>
                <Input value={form.description} onChange={set("description")} className="mt-1 h-8 text-sm" placeholder="What was purchased" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Attach File (optional, max 5 MB)</Label>
                <div className="mt-1 border-2 border-dashed border-gray-200 rounded-lg p-3 text-center cursor-pointer hover:border-red-300 transition-colors"
                  onClick={() => fileRef.current?.click()}>
                  {file
                    ? <p className="text-xs font-medium text-gray-700">{file.name}</p>
                    : <p className="text-xs text-gray-400"><Paperclip className="w-3 h-3 inline mr-1" />Click to attach</p>}
                  <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                    onChange={e => setFile(e.target.files?.[0] ?? null)} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
              <Button type="submit" size="sm" disabled={saving} className="bg-scanvault-red hover:bg-red-700 text-white">
                {saving ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Saving…</> : "Save & Link"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Transaction Card ────────────────────────────────────────────────────────

function TxnCard({
  txn,
  onReview,
  onExpenseUploaded,
}: {
  txn: StoredTransaction;
  onReview: (id: string, r: StoredTransaction["review"]) => void;
  onExpenseUploaded: (id: string, expNumber: string) => void;
}) {
  const [showUpload, setShowUpload] = useState(false);
  const top    = txn.matches[0];
  const isIn   = txn.amount > 0;
  const review = txn.review;

  return (
    <>
      {showUpload && (
        <QuickExpenseModal
          txn={txn}
          onSaved={expNum => { setShowUpload(false); onExpenseUploaded(txn.id, expNum); }}
          onClose={() => setShowUpload(false)}
        />
      )}
      <div className="border rounded-lg p-3 bg-white space-y-2">
        {/* Row 1: amount + description + date */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 justify-between">
          <div className="flex flex-wrap items-baseline gap-x-2 min-w-0">
            <span className={`font-bold shrink-0 ${isIn ? "text-green-700" : "text-gray-900"}`}>
              {isIn ? "+" : "−"}£{Math.abs(txn.amount).toFixed(2)}
            </span>
            <span className="font-medium text-gray-900 text-sm truncate">{txn.description}</span>
          </div>
          <span className="text-xs text-gray-400 shrink-0">{txn.date}</span>
        </div>

        {/* Row 2: match info */}
        {top && (
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">{top.description}</span>
            {top.entityName ? ` · ${top.entityName}` : ""}
            <span className={`ml-2 font-semibold px-1.5 py-0.5 rounded-full text-xs ${
              txn.confidence >= 85 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>{txn.confidence}%</span>
          </p>
        )}
        {review === "receipt_uploaded" && txn.attachedExpenseNumber && (
          <p className="text-xs text-blue-600 font-medium">📎 Expense {txn.attachedExpenseNumber} attached</p>
        )}

        {/* Row 3: actions */}
        {!review && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {txn.matchStatus !== "unmatched" && (
              <>
                <button
                  onClick={() => onReview(txn.id, "confirmed")}
                  className="text-xs px-2 py-1 rounded border border-green-300 text-green-700 hover:bg-green-50"
                >
                  <CheckCircle2 className="w-3 h-3 inline mr-0.5" />Confirm
                </button>
                <button
                  onClick={() => onReview(txn.id, "rejected")}
                  className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-3 h-3 inline mr-0.5" />Reject
                </button>
              </>
            )}
            <button
              onClick={() => setShowUpload(true)}
              className="text-xs px-2 py-1 rounded border border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-3 h-3 inline mr-0.5" />Upload Receipt
            </button>
            {txn.matchStatus === "unmatched" && (
              <button
                onClick={() => onReview(txn.id, "skipped")}
                className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                Skip
              </button>
            )}
          </div>
        )}
        {review && (
          <div className="flex items-center gap-2 pt-1">
            <span className={`text-xs font-medium ${
              review === "confirmed" ? "text-green-600" :
              review === "receipt_uploaded" ? "text-blue-600" : "text-gray-400"
            }`}>
              {review === "confirmed" ? "✓ Confirmed" :
               review === "rejected"  ? "✗ Rejected"  :
               review === "receipt_uploaded" ? "📎 Receipt uploaded" : "— Skipped"}
            </span>
            <button onClick={() => onReview(txn.id, undefined)}
              className="text-xs text-gray-400 underline">Undo</button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Session Detail (two-column view) ───────────────────────────────────────

function SessionDetail({
  session,
  onBack,
  onDeleted,
}: {
  session: ReconciliationSession;
  onBack: () => void;
  onDeleted: () => void;
}) {
  const [txns, setTxns]       = useState<StoredTransaction[]>(session.transactions);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDel]    = useState(false);

  const persist = async (updated: StoredTransaction[]) => {
    setSaving(true);
    try {
      await fetch(`/api/bank-reconciliations/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: updated }),
      });
    } finally { setSaving(false); }
  };

  const handleReview = (id: string, r: StoredTransaction["review"]) => {
    const updated = txns.map(t => t.id === id ? { ...t, review: r } : t);
    setTxns(updated);
    persist(updated);
  };

  const handleExpenseUploaded = (id: string, expNumber: string) => {
    const updated = txns.map(t =>
      t.id === id ? { ...t, review: "receipt_uploaded" as const, attachedExpenseNumber: expNumber } : t,
    );
    setTxns(updated);
    persist(updated);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this reconciliation session? This cannot be undone.")) return;
    setDel(true);
    await fetch(`/api/bank-reconciliations/${session.id}`, { method: "DELETE" });
    onDeleted();
  };

  const resolved   = txns.filter(t => t.review);
  const matched    = txns.filter(t => (t.matchStatus === "matched" && !t.review) || t.review === "confirmed" || t.review === "receipt_uploaded");
  const needsWork  = txns.filter(t => !t.review && t.matchStatus !== "matched");
  const dismissed  = txns.filter(t => t.review === "rejected" || t.review === "skipped");

  const moneyIn      = txns.filter(t => t.amount > 0).reduce((s, t) =>  s + t.amount, 0);
  const moneyOut     = txns.filter(t => t.amount < 0).reduce((s, t) =>  s + Math.abs(t.amount), 0);
  const netChange    = moneyIn - moneyOut;
  const outstanding  = txns.filter(t => !t.review).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-500">
            <ArrowLeft className="w-4 h-4 mr-1" />Back
          </Button>
          <div>
            <h2 className="text-lg font-bold leading-tight">{session.filename}</h2>
            <p className="text-xs text-gray-400">
              Imported {new Date(session.createdAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
              {saving && <span className="ml-2 text-blue-500">Saving…</span>}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}
          className="text-red-600 border-red-200 hover:bg-red-50">
          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
          Delete
        </Button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",       value: txns.length,      bg: "bg-white",       text: "text-gray-800",  border: "border-gray-200"   },
          { label: "Resolved",    value: resolved.length,  bg: "bg-green-50",    text: "text-green-700", border: "border-green-100"  },
          { label: "Needs Work",  value: needsWork.length, bg: "bg-yellow-50",   text: "text-yellow-700",border: "border-yellow-100" },
          { label: "Dismissed",   value: dismissed.length, bg: "bg-gray-50",     text: "text-gray-500",  border: "border-gray-200"   },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-3 ${s.bg} ${s.border}`}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.text}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border p-3 bg-green-50 border-green-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Money In</p>
          <p className="text-xl font-bold mt-0.5 text-green-700">+£{moneyIn.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border p-3 bg-red-50 border-red-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Money Out</p>
          <p className="text-xl font-bold mt-0.5 text-red-700">−£{moneyOut.toFixed(2)}</p>
        </div>
        <div className={`rounded-xl border p-3 ${netChange >= 0 ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}`}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Net Change</p>
          <p className={`text-xl font-bold mt-0.5 ${netChange >= 0 ? "text-blue-700" : "text-orange-700"}`}>
            {netChange >= 0 ? "+" : "−"}£{Math.abs(netChange).toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border p-3 bg-amber-50 border-amber-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unreconciled</p>
          <p className="text-xl font-bold mt-0.5 text-amber-700">£{outstanding.toFixed(2)}</p>
          <p className="text-xs text-amber-500 mt-0.5">{needsWork.length} transaction{needsWork.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* LEFT: Matched & Resolved */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-green-100">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <h3 className="font-semibold text-green-700 text-sm">Matched &amp; Resolved ({matched.length})</h3>
          </div>
          {matched.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No matched transactions yet</p>
          ) : (
            matched.map(txn => (
              <TxnCard key={txn.id} txn={txn} onReview={handleReview} onExpenseUploaded={handleExpenseUploaded} />
            ))
          )}
          {dismissed.length > 0 && (
            <>
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100 mt-4">
                <h3 className="font-semibold text-gray-400 text-sm">Dismissed ({dismissed.length})</h3>
              </div>
              {dismissed.map(txn => (
                <div key={txn.id} className="opacity-40">
                  <TxnCard txn={txn} onReview={handleReview} onExpenseUploaded={handleExpenseUploaded} />
                </div>
              ))}
            </>
          )}
        </div>

        {/* RIGHT: Needs Review */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-yellow-100">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <h3 className="font-semibold text-yellow-700 text-sm">Needs Review ({needsWork.length})</h3>
          </div>
          {needsWork.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">All transactions reviewed ✓</p>
          ) : (
            needsWork.map(txn => (
              <TxnCard key={txn.id} txn={txn} onReview={handleReview} onExpenseUploaded={handleExpenseUploaded} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sessions List ───────────────────────────────────────────────────────────

function SessionsList({
  sessions,
  loading,
  onOpen,
  onImport,
}: {
  sessions: ReconciliationSession[];
  loading: boolean;
  onOpen: (s: ReconciliationSession) => void;
  onImport: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Bank Reconciliation</h2>
          <p className="text-sm text-gray-500 mt-1">
            Each imported statement is saved as a session — click any to continue reconciling.
          </p>
        </div>
        <Button onClick={onImport} className="bg-scanvault-red hover:bg-red-700 text-white shrink-0">
          <Upload className="w-4 h-4 mr-2" />Import New Statement
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-scanvault-red" />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="border border-gray-100">
          <CardContent className="py-16 text-center text-gray-400">
            <CloudUpload className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No reconciliation sessions yet</p>
            <p className="text-sm mt-1">Import your first Revolut CSV to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <>
        {(() => {
          const latest = sessions[0];
          const lt = latest.transactions;
          const latestIn  = lt.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
          const latestOut = lt.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
          const latestNet = latestIn - latestOut;
          const latestOSV = lt.filter(t => !t.review).reduce((s, t) => s + Math.abs(t.amount), 0);
          const latestOSN = lt.filter(t => !t.review).length;
          return (
            <div className="rounded-xl border-2 border-scanvault-red/20 bg-red-50/30 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Latest Statement Summary</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg border border-green-100 p-3">
                  <p className="text-xs text-gray-500">Money In</p>
                  <p className="text-lg font-bold text-green-700 mt-0.5">+£{latestIn.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg border border-red-100 p-3">
                  <p className="text-xs text-gray-500">Money Out</p>
                  <p className="text-lg font-bold text-red-700 mt-0.5">−£{latestOut.toFixed(2)}</p>
                </div>
                <div className={`bg-white rounded-lg border p-3 ${latestNet >= 0 ? "border-blue-100" : "border-orange-100"}`}>
                  <p className="text-xs text-gray-500">Net Change</p>
                  <p className={`text-lg font-bold mt-0.5 ${latestNet >= 0 ? "text-blue-700" : "text-orange-700"}`}>
                    {latestNet >= 0 ? "+" : "−"}£{Math.abs(latestNet).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-amber-100 p-3">
                  <p className="text-xs text-gray-500">Unreconciled</p>
                  <p className="text-lg font-bold text-amber-700 mt-0.5">£{latestOSV.toFixed(2)}</p>
                  <p className="text-xs text-amber-500">{latestOSN} transaction{latestOSN !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="space-y-3">
          {sessions.map(s => {
            const txns        = s.transactions;
            const resolved    = txns.filter(t => t.review).length;
            const matched     = txns.filter(t => t.matchStatus === "matched").length;
            const unmatched   = txns.filter(t => t.matchStatus === "unmatched").length;
            const pct         = txns.length ? Math.round((resolved / txns.length) * 100) : 0;
            const netChange   = txns.reduce((s, t) => s + t.amount, 0);
            const unreconciled = txns.filter(t => !t.review).reduce((s, t) => s + Math.abs(t.amount), 0);
            return (
              <Card key={s.id}
                className="border border-gray-100 hover:border-red-200 cursor-pointer transition-colors"
                onClick={() => onOpen(s)}>
                <CardContent className="py-4 px-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{s.filename}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />
                          {new Date(s.createdAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                        </span>
                        <span>{txns.length} transactions</span>
                        <span className="text-green-600">{matched} matched</span>
                        {unmatched > 0 && <span className="text-red-500">{unmatched} unmatched</span>}
                      </div>
                      {/* Financial figures */}
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs">
                        <span className={netChange >= 0 ? "text-blue-600 font-medium" : "text-orange-600 font-medium"}>
                          Net: {netChange >= 0 ? "+" : "−"}£{Math.abs(netChange).toFixed(2)}
                        </span>
                        <span className="text-amber-600 font-medium">
                          Unreconciled: £{unreconciled.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-700">{pct}%</p>
                        <p className="text-xs text-gray-400">reviewed</p>
                      </div>
                      <div className="w-12 h-12 shrink-0">
                        <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#16a34a" strokeWidth="3"
                            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

type View = "list" | "import" | "session";

export default function RevolutImportTab() {
  const [view, setView]         = useState<View>("list");
  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState<ReconciliationSession | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bank-reconciliations");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.map((s: ReconciliationSession & { transactions: unknown }) => ({
          ...s,
          transactions: Array.isArray(s.transactions) ? s.transactions : [],
        })));
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  if (view === "import") {
    return <UploadScreen onDone={() => { loadSessions(); setView("list"); }} />;
  }

  if (view === "session" && active) {
    return (
      <SessionDetail
        session={active}
        onBack={() => { setActive(null); loadSessions(); setView("list"); }}
        onDeleted={() => { setActive(null); loadSessions(); setView("list"); }}
      />
    );
  }

  return (
    <SessionsList
      sessions={sessions}
      loading={loading}
      onOpen={s => { setActive(s); setView("session"); }}
      onImport={() => setView("import")}
    />
  );
}
