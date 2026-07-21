"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload, CheckCircle2, AlertTriangle, XCircle,
  Loader2, CloudUpload, RefreshCcw, ChevronDown, ChevronUp,
} from "lucide-react";

interface MatchCandidate {
  type: "invoice" | "receipt";
  id: string;
  invoiceNumber?: string;
  receiptNumber?: string;
  label: string;
  description: string;
  entityName: string;
  amount: number;
  confidence: number;
}

interface ImportedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  reference: string;
  matchStatus: "matched" | "partial" | "unmatched";
  confidence: number;
  matches: MatchCandidate[];
}

type ReviewState = "confirmed" | "rejected" | "skipped";

// ── Upload screen ──────────────────────────────────────────────────────────

function UploadScreen({
  onResults,
}: {
  onResults: (txns: ImportedTransaction[], filename: string) => void;
}) {
  const [file, setFile]       = useState<File | null>(null);
  const [importing, setImp]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [dragging, setDrag]   = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);

  const pickFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file (.csv)"); return;
    }
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
      onResults(data.transactions, file.name);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setImp(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Import Bank Statement</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload a Revolut CSV export — ScanVault automatically matches transactions against your invoices and receipts.
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
                <p className="text-xs text-gray-300 mt-4">
                  In Revolut Business: Accounts → select account → Download → CSV
                </p>
              </>
            )}
            <input
              ref={inputRef} type="file" accept=".csv" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
            />
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

// ── Results screen ─────────────────────────────────────────────────────────

function ResultsScreen({
  transactions,
  filename,
  onReset,
}: {
  transactions: ImportedTransaction[];
  filename: string;
  onReset: () => void;
}) {
  const [reviewMap, setReviewMap] = useState<Record<string, ReviewState>>({});
  const [expanded,  setExpanded]  = useState<Record<string, boolean>>({});

  const setReview   = (id: string, s: ReviewState) => setReviewMap(m => ({ ...m, [id]: s }));
  const clearReview = (id: string) => setReviewMap(m => { const n = { ...m }; delete n[id]; return n; });
  const toggleExp   = (id: string) => setExpanded(m => ({ ...m, [id]: !m[id] }));

  const matched   = transactions.filter(t => t.matchStatus === "matched").length;
  const partial   = transactions.filter(t => t.matchStatus === "partial").length;
  const unmatched = transactions.filter(t => t.matchStatus === "unmatched").length;
  const reviewed  = Object.keys(reviewMap).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Import Results</h2>
          <p className="text-sm text-gray-500">{filename} · {reviewed}/{transactions.length} reviewed</p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RefreshCcw className="h-4 w-4 mr-2" />Import New File
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",    value: transactions.length, colour: "bg-white border-gray-200",         text: "" },
          { label: "Matched",  value: matched,             colour: "bg-green-50 border-green-100",     text: "text-green-700" },
          { label: "Possible", value: partial,             colour: "bg-yellow-50 border-yellow-100",   text: "text-yellow-700" },
          { label: "No Match", value: unmatched,           colour: "bg-red-50 border-red-100",         text: "text-red-700" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.colour}`}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.text}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Transaction list */}
      <div className="space-y-3">
        {transactions.map(txn => {
          const review = reviewMap[txn.id];
          const isExp  = expanded[txn.id];
          const top    = txn.matches[0];
          const isIn   = txn.amount > 0;

          const borderColour =
            review === "confirmed"           ? "border-l-green-500" :
            review === "rejected"            ? "border-l-gray-300"  :
            txn.matchStatus === "matched"    ? "border-l-green-500" :
            txn.matchStatus === "partial"    ? "border-l-yellow-400":
                                               "border-l-red-400";

          return (
            <Card
              key={txn.id}
              className={`border-l-4 transition-opacity ${borderColour} ${
                review === "rejected" || review === "skipped" ? "opacity-50" : ""
              }`}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  {/* Status icon */}
                  <div className="mt-0.5 shrink-0">
                    {review === "confirmed" || txn.matchStatus === "matched"
                      ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                      : txn.matchStatus === "partial"
                      ? <AlertTriangle  className="h-5 w-5 text-yellow-500" />
                      : <XCircle className="h-5 w-5 text-red-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Amount · description · date */}
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 min-w-0">
                        <span className={`font-bold text-base shrink-0 ${isIn ? "text-green-700" : "text-gray-900"}`}>
                          {isIn ? "+" : "−"}£{Math.abs(txn.amount).toFixed(2)}
                        </span>
                        <span className="font-medium text-gray-900 truncate">{txn.description}</span>
                        {txn.date && <span className="text-xs text-gray-400 shrink-0">{txn.date}</span>}
                      </div>
                      {top && (
                        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          txn.confidence >= 85
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {txn.confidence}% confidence
                        </span>
                      )}
                    </div>

                    {/* Match summary (collapsed) */}
                    {top && !isExp && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="text-gray-400">
                          {txn.matchStatus === "matched" ? "Matched to " : "Possible match: "}
                        </span>
                        <span className="font-medium">{top.description}</span>
                        {top.entityName && <span className="text-gray-400"> · {top.entityName}</span>}
                        {top.label      && <span className="text-gray-400"> · {top.label}</span>}
                      </p>
                    )}
                    {txn.matchStatus === "unmatched" && (
                      <p className="text-sm text-gray-400 mt-1">No matching invoice or receipt found</p>
                    )}

                    {/* Expanded candidates */}
                    {isExp && txn.matches.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {txn.matches.map((m, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3 text-sm border">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium capitalize text-gray-700">{m.type}</span>
                              <span className="font-mono text-xs text-gray-500">{m.invoiceNumber || m.receiptNumber}</span>
                              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${
                                m.confidence >= 85 ? "bg-green-100 text-green-700" :
                                m.confidence >= 50 ? "bg-yellow-100 text-yellow-700" :
                                                     "bg-gray-100 text-gray-600"
                              }`}>{m.confidence}%</span>
                            </div>
                            <p className="text-gray-600 mt-1">{m.description}{m.entityName ? ` · ${m.entityName}` : ""}</p>
                            {m.label && <p className="text-gray-400 text-xs mt-0.5">{m.label}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    {!review ? (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {txn.matchStatus !== "unmatched" && (
                          <>
                            <Button size="sm" variant="outline"
                              className="text-green-700 border-green-300 hover:bg-green-50"
                              onClick={() => setReview(txn.id, "confirmed")}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Confirm Match
                            </Button>
                            <Button size="sm" variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => setReview(txn.id, "rejected")}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                            </Button>
                          </>
                        )}
                        {txn.matchStatus === "unmatched" && (
                          <Button size="sm" variant="outline" className="text-gray-500"
                            onClick={() => setReview(txn.id, "skipped")}>
                            Skip
                          </Button>
                        )}
                        {txn.matches.length > 0 && (
                          <Button size="sm" variant="ghost" className="text-gray-400"
                            onClick={() => toggleExp(txn.id)}>
                            {isExp
                              ? <><ChevronUp   className="h-3.5 w-3.5 mr-1" />Hide</>
                              : <><ChevronDown className="h-3.5 w-3.5 mr-1" />{txn.matches.length === 1 ? "Details" : `${txn.matches.length} candidates`}</>}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`text-sm font-medium ${review === "confirmed" ? "text-green-600" : "text-gray-400"}`}>
                          {review === "confirmed" ? "✓ Confirmed" : review === "rejected" ? "✗ Rejected" : "— Skipped"}
                        </span>
                        <Button size="sm" variant="ghost" className="text-gray-400 text-xs"
                          onClick={() => clearReview(txn.id)}>
                          Undo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export default function RevolutImportTab() {
  const [transactions, setTransactions] = useState<ImportedTransaction[] | null>(null);
  const [filename, setFilename]         = useState("");

  if (!transactions) {
    return (
      <UploadScreen
        onResults={(txns, name) => { setTransactions(txns); setFilename(name); }}
      />
    );
  }

  return (
    <ResultsScreen
      transactions={transactions}
      filename={filename}
      onReset={() => { setTransactions(null); setFilename(""); }}
    />
  );
}
