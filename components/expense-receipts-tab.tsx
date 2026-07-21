"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus, X, Trash2, Loader2, Receipt, Paperclip, Eye, Download,
} from "lucide-react";

const CATEGORIES: Record<string, string> = {
  OFFICE_SUPPLIES:      "Office Supplies",
  EQUIPMENT:            "Equipment",
  TRAVEL:               "Travel",
  UTILITIES:            "Utilities",
  PROFESSIONAL_SERVICES:"Professional Services",
  MARKETING:            "Marketing",
  SOFTWARE:             "Software",
  WAGES:                "Wages",
  OTHER:                "Other",
};

interface ExpenseReceiptRecord {
  id:            string;
  expenseNumber: string;
  vendor:        string;
  amount:        number;
  date:          string;
  category:      string;
  description:   string | null;
  notes:         string | null;
  fileUrl:       string | null;
  fileName:      string | null;
  mimeType:      string | null;
  createdAt:     string;
}

const BLANK = {
  vendor: "", amount: "", date: "", category: "OTHER",
  description: "", notes: "",
};

export default function ExpenseReceiptsTab() {
  const [expenses, setExpenses]   = useState<ExpenseReceiptRecord[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ ...BLANK });
  const [file, setFile]           = useState<File | null>(null);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeleting] = useState<string | null>(null);
  const [previewId, setPreview]   = useState<string | null>(null);
  const fileRef                   = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/expense-receipts");
      if (res.ok) setExpenses(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof typeof BLANK) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const openForm = () => { setForm({ ...BLANK }); setFile(null); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setForm({ ...BLANK }); setFile(null); };

  const toBase64 = (f: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload  = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(f);
    });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let fileUrl: string | null   = null;
      let fileName: string | null  = null;
      let mimeType: string | null  = null;

      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert("File must be under 5 MB"); setSaving(false); return;
        }
        fileUrl  = await toBase64(file);
        fileName = file.name;
        mimeType = file.type;
      }

      const res = await fetch("/api/expense-receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, fileUrl, fileName, mimeType }),
      });

      if (res.ok) {
        const saved = await res.json();
        setExpenses(p => [saved, ...p]);
        closeForm();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save");
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense receipt? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/expense-receipts/${id}`, { method: "DELETE" });
      if (res.ok) setExpenses(p => p.filter(e => e.id !== id));
      else { const err = await res.json(); alert(err.error || "Failed to delete"); }
    } finally { setDeleting(null); }
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-scanvault-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">
            Upload and track receipts for payments made by the company. These are used during bank reconciliation.
          </p>
          {expenses.length > 0 && (
            <p className="text-sm font-semibold text-gray-700 mt-1">
              {expenses.length} receipt{expenses.length !== 1 ? "s" : ""} · Total: £{total.toFixed(2)}
            </p>
          )}
        </div>
        <Button onClick={openForm} className="bg-scanvault-red hover:bg-red-700 text-white flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Upload Receipt
        </Button>
      </div>

      {/* Upload form */}
      {showForm && (
        <Card className="border-2 border-scanvault-red/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-scanvault-red" /> New Expense Receipt
            </CardTitle>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Vendor / Supplier *</Label>
                  <Input value={form.vendor} onChange={set("vendor")} required className="mt-1" placeholder="e.g. Ryman, Amazon" />
                </div>
                <div>
                  <Label>Amount (£) *</Label>
                  <Input type="number" step="0.01" min="0" value={form.amount} onChange={set("amount")} required className="mt-1" placeholder="0.00" />
                </div>
                <div>
                  <Label>Date *</Label>
                  <Input type="date" value={form.date} onChange={set("date")} required className="mt-1" />
                </div>
                <div>
                  <Label>Category</Label>
                  <select value={form.category} onChange={set("category")} className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm">
                    {Object.entries(CATEGORIES).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={set("description")} className="mt-1" placeholder="What was purchased" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Attach Receipt File (image or PDF, max 5 MB)</Label>
                  <div
                    className="mt-1 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-red-300 hover:bg-gray-50 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    {file ? (
                      <p className="text-sm font-medium text-gray-700">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
                    ) : (
                      <p className="text-sm text-gray-400"><Paperclip className="w-4 h-4 inline mr-1" />Click to attach a file</p>
                    )}
                    <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden"
                      onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label>Notes</Label>
                  <textarea value={form.notes} onChange={set("notes")} rows={2}
                    className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-y"
                    placeholder="Any additional notes" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-scanvault-red hover:bg-red-700 text-white">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Saving…</> : "Save Receipt"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* File preview modal */}
      {previewId && (() => {
        const exp = expenses.find(e => e.id === previewId);
        if (!exp?.fileUrl) return null;
        return (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setPreview(null)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto p-4"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-gray-800">{exp.fileName || "File"}</p>
                <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {exp.mimeType?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={exp.fileUrl} alt={exp.fileName || "receipt"} className="w-full rounded" />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">PDF file — cannot preview inline</p>
                  <a href={exp.fileUrl} download={exp.fileName}
                    className="inline-flex items-center gap-2 bg-scanvault-red text-white px-4 py-2 rounded-lg">
                    <Download className="w-4 h-4" /> Download PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Receipts list */}
      {expenses.length === 0 ? (
        <Card className="border border-gray-100">
          <CardContent className="py-16 text-center text-gray-400">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No expense receipts yet</p>
            <p className="text-sm mt-1">Upload receipts for company purchases and outgoing payments.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {expenses.map(exp => (
            <Card key={exp.id} className="border border-gray-100">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="bg-orange-50 rounded-lg p-2 shrink-0">
                      <Receipt className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="font-mono text-xs text-gray-400">{exp.expenseNumber}</span>
                        <span className="font-semibold text-gray-900">{exp.vendor}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {CATEGORIES[exp.category] ?? exp.category}
                        </span>
                      </div>
                      {exp.description && <p className="text-sm text-gray-500 truncate">{exp.description}</p>}
                      <p className="text-xs text-gray-400">{new Date(exp.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-gray-900">£{exp.amount.toFixed(2)}</span>
                    {exp.fileUrl && (
                      <Button size="sm" variant="outline" onClick={() => setPreview(exp.id)}
                        className="h-7 px-2 text-xs flex items-center gap-1">
                        <Eye className="w-3 h-3" /> View
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleDelete(exp.id)}
                      disabled={deletingId === exp.id}
                      className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 border-red-200">
                      {deletingId === exp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
