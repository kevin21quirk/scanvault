"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText, Plus, Download, Trash2, UserCheck, X, Building2, Pencil,
  Clock, CheckCircle2, Send, PenLine, XCircle, Loader2, Sparkles,
} from "lucide-react";

type QuotationStatus = "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED" | "EXPIRED";

interface QuotationUser { id: string; name: string | null; email: string; }
interface QuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  amount: number;
}
interface Quotation {
  id:              string;
  quoteNumber:     string;
  title:           string;
  clientName:      string;
  clientAddress:   string | null;
  clientContact:   string | null;
  clientEmail:     string | null;
  careHomeName:    string | null;
  careHomeAddress: string | null;
  careHomeId:      string | null;
  status:          QuotationStatus;
  scopeOfWorks:    string | null;
  requirements:    string | null;
  projectDuration: string | null;
  items:           QuotationItem[] | null;
  subtotal:        number;
  discountTotal:   number;
  total:           number;
  depositPercent:  number | null;
  issueDate:       string;
  validUntil:      string | null;
  notes:           string | null;
  createdAt:       string;
  user:            QuotationUser | null;
}

interface UserOption {
  id: string;
  name: string | null;
  email: string;
  role?: string;
  companyName?: string | null;
  contactName?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface CareHomeOption { id: string; name: string; address: string | null; }

const STATUS_META: Record<QuotationStatus, { label: string; color: string; Icon: React.ElementType }> = {
  DRAFT:     { label: "Draft",     color: "bg-gray-100 text-gray-600",    Icon: PenLine },
  SENT:      { label: "Sent",      color: "bg-blue-50 text-blue-700",     Icon: Send },
  ACCEPTED:  { label: "Accepted",  color: "bg-green-50 text-green-700",   Icon: CheckCircle2 },
  DECLINED:  { label: "Declined",  color: "bg-red-50 text-red-700",       Icon: XCircle },
  EXPIRED:   { label: "Expired",   color: "bg-gray-100 text-gray-500",    Icon: Clock },
};

const DEFAULT_REQUIREMENTS = "Access to an on-site laptop or secure network point to enable internal uploads in line with GDPR and data protection requirements.\nSigned declaration and risk assessment to be completed on the first day of contract commencement.\nSuitable access to archive storage areas throughout the duration of the works.";

const BLANK = {
  quoteNumber: "",
  title: "Quotation for Archiving & Digitisation Services",
  clientName: "",
  clientAddress: "",
  clientContact: "",
  clientEmail: "",
  careHomeName: "",
  careHomeAddress: "",
  careHomeId: "",
  scopeOfWorks: "",
  requirements: DEFAULT_REQUIREMENTS,
  projectDuration: "",
  depositPercent: "30",
  validUntil: "",
  notes: "",
  userId: "",
  status: "DRAFT" as QuotationStatus,
};

const BLANK_QUANTITIES = {
  archiveHolders: "",
  archiveFiles: "",
  additionalBoxes: "",
  damagedBoxes: "",
  drawers: "",
};

function buildScopeText(homeName: string, q: typeof BLANK_QUANTITIES): string {
  const lines: string[] = [];
  lines.push(`Scope of Archiving & Digitisation Works${homeName ? ` – ${homeName}` : ""}`);
  lines.push("");
  lines.push("The scope of works includes the scanning, digitisation, organisation, and indexing of approximately:");
  if (q.archiveHolders)   lines.push(`- ${q.archiveHolders} archive holders.`);
  if (q.archiveFiles)     lines.push(`- ${q.archiveFiles} completed archive files.`);
  if (q.additionalBoxes)  lines.push(`- ${q.additionalBoxes} archive boxes identified during the works.`);
  if (q.damagedBoxes)     lines.push(`- ${q.damagedBoxes} damaged/broken archive boxes recovered and reorganised, requiring additional sorting, handling, reconstruction, and document preservation prior to scanning.`);
  if (q.drawers)          lines.push(`- ${q.drawers} full drawers of archived paperwork requiring manual sorting, categorisation, de-stapling, scanning, and digital indexing.`);
  lines.push("- Secure uploading of all scanned documentation to your chosen cloud-based platform.");
  lines.push("- Structured digital organisation and labelling aligned with document content, departments, and archive categories.");
  lines.push("- Creation of a clear indexing and numbering system within the cloud platform to ensure simple retrieval, compliance, and future operational accessibility.");
  lines.push("- Preparation, consolidation, and organisation of physical archive materials following digitisation.");
  lines.push("");
  lines.push("All works will be completed by qualified IT & Archiving Engineers, who will remain identifiable on site at all times with official company identification and lanyards for security and compliance purposes.");
  return lines.join("\n");
}

const BLANK_ITEM = { description: "", quantity: "1", unitPrice: "", discountPercent: "0" };

export default function QuotationsTab() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [users,     setUsers]     = useState<UserOption[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form,      setForm]      = useState({ ...BLANK });
  const [items,     setItems]     = useState<typeof BLANK_ITEM[]>([{ ...BLANK_ITEM }]);
  const [quantities, setQuantities] = useState({ ...BLANK_QUANTITIES });
  const [saving,    setSaving]    = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [assigning,   setAssigning]   = useState<string | null>(null);
  const [assignUser,  setAssignUser]  = useState<Record<string, string>>({});
  const [careHomeOptions, setCareHomeOptions] = useState<CareHomeOption[]>([]);

  const fetch$ = useCallback(async () => {
    try {
      const [qr, ur] = await Promise.all([fetch("/api/quotations"), fetch("/api/users")]);
      if (qr.ok) setQuotations(await qr.json());
      if (ur.ok) setUsers(await ur.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch$(); }, [fetch$]);

  const fetchNextQuoteNumber = async () => {
    try {
      const res = await fetch("/api/quotations/next-number");
      if (res.ok) {
        const data = await res.json();
        setForm((p) => ({ ...p, quoteNumber: data.quoteNumber }));
      }
    } catch (err) {
      console.error("Error fetching next quote number:", err);
    }
  };

  const quotationToForm = (q: Quotation): typeof BLANK => ({
    quoteNumber:     q.quoteNumber,
    title:           q.title,
    clientName:      q.clientName,
    clientAddress:   q.clientAddress   ?? "",
    clientContact:   q.clientContact   ?? "",
    clientEmail:     q.clientEmail     ?? "",
    careHomeName:    q.careHomeName    ?? "",
    careHomeAddress: q.careHomeAddress ?? "",
    careHomeId:      q.careHomeId      ?? "",
    scopeOfWorks:    q.scopeOfWorks    ?? "",
    requirements:    q.requirements    ?? DEFAULT_REQUIREMENTS,
    projectDuration: q.projectDuration ?? "",
    depositPercent:  q.depositPercent != null ? String(q.depositPercent) : "30",
    validUntil:      q.validUntil ? q.validUntil.slice(0, 10) : "",
    notes:           q.notes           ?? "",
    userId:          q.user?.id        ?? "",
    status:          q.status,
  });

  const clientOptions = users.filter((u) => u.role === "CLIENT" || u.role === undefined);

  const handleSelectClient = (clientId: string) => {
    if (!clientId) {
      setForm((p) => ({ ...p, userId: "", careHomeId: "" }));
      setCareHomeOptions([]);
      return;
    }
    const c = users.find((u) => u.id === clientId);
    if (!c) return;
    setForm((p) => ({
      ...p,
      userId:        c.id,
      clientName:    c.companyName || c.name || p.clientName,
      clientEmail:   c.email || p.clientEmail,
      clientContact: c.contactName || c.name || p.clientContact,
      clientAddress: c.address || p.clientAddress,
      careHomeId:    "",
    }));
    setCareHomeOptions([]);
    fetch(`/api/care-homes?userId=${clientId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: CareHomeOption[]) => setCareHomeOptions(data))
      .catch(() => {});
  };

  const handleSelectCareHome = (careHomeId: string) => {
    if (!careHomeId) {
      setForm((p) => ({ ...p, careHomeId: "" }));
      return;
    }
    const h = careHomeOptions.find((o) => o.id === careHomeId);
    if (!h) return;
    setForm((p) => ({
      ...p,
      careHomeId: h.id,
      careHomeName: h.name,
      careHomeAddress: h.address || p.careHomeAddress,
    }));
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ ...BLANK });
    setItems([{ ...BLANK_ITEM }]);
    setQuantities({ ...BLANK_QUANTITIES });
    setCareHomeOptions([]);
    setShowForm(true);
    fetchNextQuoteNumber();
  };

  const handleEdit = (q: Quotation) => {
    setEditingId(q.id);
    setForm(quotationToForm(q));
    setItems(
      q.items && q.items.length
        ? q.items.map((it) => ({
            description: it.description,
            quantity: String(it.quantity),
            unitPrice: String(it.unitPrice),
            discountPercent: String(it.discountPercent),
          }))
        : [{ ...BLANK_ITEM }]
    );
    setQuantities({ ...BLANK_QUANTITIES });
    setCareHomeOptions([]);
    if (q.user?.id) {
      fetch(`/api/care-homes?userId=${q.user.id}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data: CareHomeOption[]) => setCareHomeOptions(data))
        .catch(() => {});
    }
    setShowForm(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...BLANK });
    setItems([{ ...BLANK_ITEM }]);
    setQuantities({ ...BLANK_QUANTITIES });
  };

  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const setQuantity = (k: keyof typeof BLANK_QUANTITIES) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setQuantities((p) => ({ ...p, [k]: e.target.value }));

  const handleGenerateScope = () => {
    const generated = buildScopeText(form.careHomeName, quantities);
    setForm((p) => ({ ...p, scopeOfWorks: p.scopeOfWorks ? `${p.scopeOfWorks}\n\n${generated}` : generated }));
  };

  const addItem = () => setItems((p) => [...p, { ...BLANK_ITEM }]);
  const removeItem = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: keyof typeof BLANK_ITEM, value: string) =>
    setItems((p) => p.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));

  const subtotal = items.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0), 0);
  const discountTotal = items.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0) * ((parseFloat(it.discountPercent) || 0) / 100), 0);
  const total = subtotal - discountTotal;
  const depositAmount = total * (parseFloat(form.depositPercent) || 0) / 100;
  const balanceAmount = total - depositAmount;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/quotations/${editingId}` : "/api/quotations",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, items }),
        }
      );
      if (res.ok) {
        const saved = await res.json();
        setQuotations((p) => editingId ? p.map((q) => (q.id === editingId ? saved : q)) : [saved, ...p]);
        closeForm();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save quotation");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quotation? This cannot be undone.")) return;
    await fetch(`/api/quotations/${id}`, { method: "DELETE" });
    setQuotations((p) => p.filter((q) => q.id !== id));
  };

  const handleStatusChange = async (id: string, status: QuotationStatus) => {
    const res = await fetch(`/api/quotations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setQuotations((p) => p.map((q) => (q.id === id ? updated : q)));
    }
  };

  const handleAssign = async (id: string) => {
    setAssigning(id);
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: assignUser[id] || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        setQuotations((p) => p.map((q) => (q.id === id ? updated : q)));
      }
    } finally {
      setAssigning(null);
    }
  };

  const handleDownload = async (id: string) => {
    setDownloading(id);
    try {
      const res = await fetch(`/api/quotations/${id}/download`);
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = res.headers.get("Content-Disposition")?.split('filename="')[1]?.replace('"', "") ?? "quotation.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not generate PDF — please try again.");
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-scanvault-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Total", value: quotations.length },
            { label: "Draft", value: quotations.filter((q) => q.status === "DRAFT").length },
            { label: "Sent", value: quotations.filter((q) => q.status === "SENT").length },
            { label: "Accepted", value: quotations.filter((q) => q.status === "ACCEPTED").length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm text-center">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
        <Button onClick={openNew} className="bg-scanvault-red hover:bg-red-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Quotation
        </Button>
      </div>

      {/* Quotation Form */}
      {showForm && (
        <Card className="border-2 border-scanvault-red/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-scanvault-red" /> {editingId ? "Edit Quotation" : "New Quotation"}
            </CardTitle>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Client & Care Home */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">Client &amp; Care Home Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Select Existing Client <span className="text-gray-400 font-normal">(autofills their details below)</span></Label>
                    <select
                      value={form.userId}
                      onChange={(e) => handleSelectClient(e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
                    >
                      <option value="">— Enter details manually —</option>
                      {clientOptions.map((u) => (
                        <option key={u.id} value={u.id}>{u.companyName || u.name || u.email}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Quote Number *</Label>
                    <Input value={form.quoteNumber} onChange={set("quoteNumber")} required className="mt-1 bg-gray-50" readOnly placeholder="Loading..." />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <select value={form.status} onChange={set("status")} className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white">
                      {(Object.keys(STATUS_META) as QuotationStatus[]).map((s) => (
                        <option key={s} value={s}>{STATUS_META[s].label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Quotation Title *</Label>
                    <Input value={form.title} onChange={set("title")} required className="mt-1" />
                  </div>
                  <div>
                    <Label>Client / Billing Company *</Label>
                    <Input value={form.clientName} onChange={set("clientName")} required className="mt-1" placeholder="e.g. Abbey Healthcare Group" />
                  </div>
                  <div>
                    <Label>Client Email</Label>
                    <Input type="email" value={form.clientEmail} onChange={set("clientEmail")} className="mt-1" />
                  </div>
                  <div>
                    <Label>Client Contact Name</Label>
                    <Input value={form.clientContact} onChange={set("clientContact")} className="mt-1" />
                  </div>
                  <div>
                    <Label>Client Address</Label>
                    <Input value={form.clientAddress} onChange={set("clientAddress")} className="mt-1" />
                  </div>
                  {careHomeOptions.length > 0 && (
                    <div className="md:col-span-2">
                      <Label>Select Saved Care Home <span className="text-gray-400 font-normal">(autofills below, or enter manually)</span></Label>
                      <select
                        value={form.careHomeId}
                        onChange={(e) => handleSelectCareHome(e.target.value)}
                        className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
                      >
                        <option value="">— Enter details manually —</option>
                        {careHomeOptions.map((h) => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <Label>Care Home Name</Label>
                    <Input value={form.careHomeName} onChange={set("careHomeName")} className="mt-1" placeholder="e.g. Elmcroft Care Home" />
                  </div>
                  <div>
                    <Label>Care Home Address</Label>
                    <Input value={form.careHomeAddress} onChange={set("careHomeAddress")} className="mt-1" placeholder="Full site address" />
                  </div>
                </div>
              </div>

              {/* Quick-fill quantities */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">Quick-Fill Scope Quantities <span className="text-gray-400 font-normal">(optional — generates a scope of works paragraph below)</span></h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <Label className="text-xs">Archive Holders</Label>
                    <Input type="number" min="0" value={quantities.archiveHolders} onChange={setQuantity("archiveHolders")} className="mt-1" placeholder="e.g. 15" />
                  </div>
                  <div>
                    <Label className="text-xs">Completed Archive Files</Label>
                    <Input type="number" min="0" value={quantities.archiveFiles} onChange={setQuantity("archiveFiles")} className="mt-1" placeholder="e.g. 43" />
                  </div>
                  <div>
                    <Label className="text-xs">Additional Archive Boxes</Label>
                    <Input type="number" min="0" value={quantities.additionalBoxes} onChange={setQuantity("additionalBoxes")} className="mt-1" placeholder="e.g. 83" />
                  </div>
                  <div>
                    <Label className="text-xs">Damaged/Broken Boxes</Label>
                    <Input type="number" min="0" value={quantities.damagedBoxes} onChange={setQuantity("damagedBoxes")} className="mt-1" placeholder="e.g. 23" />
                  </div>
                  <div>
                    <Label className="text-xs">Full Drawers of Paperwork</Label>
                    <Input type="number" min="0" value={quantities.drawers} onChange={setQuantity("drawers")} className="mt-1" placeholder="e.g. 6" />
                  </div>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={handleGenerateScope} className="mt-3 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Insert into Scope of Works
                </Button>
              </div>

              {/* Scope of Works */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">Scope of Works</h3>
                <div>
                  <Label>Detailed Scope of Works</Label>
                  <textarea
                    value={form.scopeOfWorks}
                    onChange={set("scopeOfWorks")}
                    rows={10}
                    className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-y"
                    placeholder="Full description of the archiving, scanning, digitisation and indexing work to be carried out..."
                  />
                </div>
                <div className="mt-3">
                  <Label>Estimated Project Duration</Label>
                  <Input value={form.projectDuration} onChange={set("projectDuration")} className="mt-1" placeholder="e.g. Approximately 2 weeks, subject to site access" />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between border-b border-gray-200 pb-1 mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Description / Quantity / Unit Price / Discount / Amount</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Add item
                  </Button>
                </div>
                <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-gray-500 px-1 mb-1">
                  <span className="col-span-5">Description</span>
                  <span className="col-span-2 text-center">Quantity</span>
                  <span className="col-span-2 text-right">Unit Price (£)</span>
                  <span className="col-span-1 text-right">Disc. %</span>
                  <span className="col-span-2 text-right">Amount (£)</span>
                </div>
                <div className="space-y-2">
                  {items.map((it, idx) => {
                    const amt = (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0) * (1 - (parseFloat(it.discountPercent) || 0) / 100);
                    return (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <textarea
                          className="col-span-5 border border-gray-200 rounded-md px-2 py-1.5 text-sm resize-y"
                          rows={1}
                          placeholder="e.g. Scanning, digitisation and indexing of archived documentation"
                          value={it.description}
                          onChange={(e) => updateItem(idx, "description", e.target.value)}
                        />
                        <Input className="col-span-2 text-center" type="number" min="0" step="1" value={it.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
                        <Input className="col-span-2 text-right" type="number" min="0" step="0.01" placeholder="0.00" value={it.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} />
                        <Input className="col-span-1 text-right" type="number" min="0" max="100" step="0.01" value={it.discountPercent} onChange={(e) => updateItem(idx, "discountPercent", e.target.value)} />
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <span className="text-sm tabular-nums">£{amt.toFixed(2)}</span>
                          {items.length > 1 && (
                            <button type="button" onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals preview */}
              <div className="rounded-md border bg-gray-50 p-3 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="tabular-nums">£{subtotal.toFixed(2)}</span></div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-gray-600"><span>Discount</span><span className="tabular-nums">-£{discountTotal.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between font-semibold border-t pt-1"><span>Total (GBP)</span><span className="tabular-nums">£{total.toFixed(2)}</span></div>
                <div className="flex justify-between text-scanvault-red"><span>Deposit ({form.depositPercent || 0}%)</span><span className="tabular-nums">£{depositAmount.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Balance on completion</span><span className="tabular-nums">£{balanceAmount.toFixed(2)}</span></div>
              </div>

              {/* Pricing & Terms */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">Deposit &amp; Validity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Deposit (%)</Label>
                    <Input type="number" step="1" min="0" max="100" value={form.depositPercent} onChange={set("depositPercent")} className="mt-1" />
                  </div>
                  <div>
                    <Label>Valid Until</Label>
                    <Input type="date" value={form.validUntil} onChange={set("validUntil")} className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">Requirements</h3>
                <div>
                  <Label>Site Requirements</Label>
                  <p className="text-xs text-gray-400 mb-1">What the client must provide (one per line)</p>
                  <textarea
                    value={form.requirements}
                    onChange={set("requirements")}
                    rows={4}
                    className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-y"
                  />
                </div>
              </div>

              {/* Assignment & Notes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">Assignment &amp; Notes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Assign to Client Login</Label>
                    <select
                      value={form.userId}
                      onChange={set("userId")}
                      className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">— None —</option>
                      {users.filter((u) => u.id).map((u) => (
                        <option key={u.id} value={u.id}>{u.name || u.email} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Internal Notes</Label>
                    <textarea
                      value={form.notes}
                      onChange={set("notes")}
                      rows={2}
                      className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-y"
                      placeholder="Internal notes (not shown on PDF unless specified)"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-scanvault-red hover:bg-red-700 text-white">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving…</> : editingId ? "Save Changes" : "Create Quotation"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Quotation list */}
      {quotations.length === 0 ? (
        <Card className="border border-gray-100">
          <CardContent className="py-16 text-center text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No quotations yet</p>
            <p className="text-sm mt-1">Click "New Quotation" to create the first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {quotations.map((q) => {
            const meta = STATUS_META[q.status];
            const Icon = meta.Icon;
            return (
              <Card key={q.id} className="border border-gray-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>
                          <Icon className="w-3 h-3" /> {meta.label}
                        </span>
                        <span className="font-semibold text-gray-900 truncate">{q.quoteNumber}</span>
                        <span className="text-gray-400 truncate">· {q.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">{q.clientName}</span>
                        {q.careHomeName && <span className="text-gray-400"> · <Building2 className="w-3 h-3 inline" /> {q.careHomeName}</span>}
                        {q.clientEmail && <span className="text-gray-400"> · {q.clientEmail}</span>}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> £{q.total.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</span>
                        {q.validUntil && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Valid until {new Date(q.validUntil).toLocaleDateString("en-GB")}</span>}
                        {q.user && <span className="flex items-center gap-1 text-emerald-600"><UserCheck className="w-3 h-3" /> {q.user.name || q.user.email}</span>}
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Created {new Date(q.createdAt).toLocaleDateString("en-GB")}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleDownload(q.id)}
                        disabled={downloading === q.id}
                        className="h-7 px-3 text-xs bg-scanvault-red hover:bg-red-700 text-white flex items-center gap-1"
                      >
                        {downloading === q.id
                          ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                          : <><Download className="w-3 h-3" /> Download PDF</>}
                      </Button>

                      <select
                        value={q.status}
                        onChange={(e) => handleStatusChange(q.id, e.target.value as QuotationStatus)}
                        className="h-7 px-2 text-xs border border-gray-200 rounded-md bg-white"
                      >
                        {(Object.keys(STATUS_META) as QuotationStatus[]).map((s) => (
                          <option key={s} value={s}>{STATUS_META[s].label}</option>
                        ))}
                      </select>

                      <div className="flex gap-1">
                        <select
                          value={assignUser[q.id] ?? q.user?.id ?? ""}
                          onChange={(e) => setAssignUser((p) => ({ ...p, [q.id]: e.target.value }))}
                          className="h-7 px-2 text-xs border border-gray-200 rounded-md bg-white max-w-[140px]"
                        >
                          <option value="">Assign client…</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.name || u.email}</option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssign(q.id)}
                          disabled={assigning === q.id}
                          className="h-7 px-2 text-xs"
                        >
                          {assigning === q.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                        </Button>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(q)}
                          className="h-7 px-2 text-xs flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(q.id)}
                          className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
