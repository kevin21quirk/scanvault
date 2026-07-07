"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText, Plus, Download, Trash2, UserCheck, X, Building2, Pencil,
  Clock, CheckCircle2, Send, PenLine, XCircle, Loader2, ShieldCheck,
} from "lucide-react";

type ContractStatus = "DRAFT" | "SENT" | "SIGNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

interface ContractUser { id: string; name: string | null; email: string; }
interface Contract {
  id:              string;
  title:           string;
  clientName:      string;
  clientAddress:   string | null;
  clientContact:   string | null;
  clientEmail:     string | null;
  careHomeName:    string | null;
  careHomeAddress: string | null;
  careHomeId:      string | null;
  status:          ContractStatus;
  pricePerBox:     number;
  estimatedBoxes:  number | null;
  totalCost:       number | null;
  projectDuration: string | null;
  depositPercent:  number | null;
  scopeOfWorks:    string | null;
  requirements:    string | null;
  paymentTerms:    string | null;
  startDate:       string | null;
  notes:           string | null;
  createdAt:       string;
  user:            ContractUser | null;
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

const STATUS_META: Record<ContractStatus, { label: string; color: string; Icon: React.ElementType }> = {
  DRAFT:     { label: "Draft",     color: "bg-gray-100 text-gray-600",    Icon: PenLine },
  SENT:      { label: "Sent",      color: "bg-blue-50 text-blue-700",     Icon: Send },
  SIGNED:    { label: "Signed",    color: "bg-purple-50 text-purple-700", Icon: CheckCircle2 },
  ACTIVE:    { label: "Active",    color: "bg-emerald-50 text-emerald-700", Icon: CheckCircle2 },
  COMPLETED: { label: "Completed", color: "bg-green-50 text-green-700",   Icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", color: "bg-red-50 text-red-700",       Icon: XCircle },
};

interface CareHomeOption { id: string; name: string; address: string | null; }

const BLANK = {
  title: "Document Scanning and Archiving Services Agreement",
  clientName: "",
  clientAddress: "",
  clientContact: "",
  clientEmail: "",
  careHomeName: "",
  careHomeAddress: "",
  careHomeId: "",
  pricePerBox: "140",
  estimatedBoxes: "",
  totalCost: "",
  projectDuration: "",
  depositPercent: "30",
  scopeOfWorks: "",
  requirements: "Access to an on-site laptop or secure network point to enable internal uploads in line with GDPR and data protection requirements.\nSigned declaration and risk assessment to be completed on the first day of contract commencement.\nSuitable access to archive storage areas throughout the duration of the works.",
  paymentTerms: "",
  startDate: "",
  notes: "",
  userId: "",
};

export default function ContractsTab() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [users,     setUsers]     = useState<UserOption[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form,      setForm]      = useState({ ...BLANK });
  const [saving,    setSaving]    = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadingRA, setDownloadingRA] = useState<string | null>(null);
  const [assigning,   setAssigning]   = useState<string | null>(null);
  const [assignUser,  setAssignUser]  = useState<Record<string, string>>({});
  const [careHomeOptions, setCareHomeOptions] = useState<CareHomeOption[]>([]);

  const fetch$ = useCallback(async () => {
    try {
      const [cr, ur] = await Promise.all([fetch("/api/contracts"), fetch("/api/users")]);
      if (cr.ok) setContracts(await cr.json());
      if (ur.ok) setUsers(await ur.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch$(); }, [fetch$]);

  const contractToForm = (c: Contract): typeof BLANK => ({
    title:           c.title,
    clientName:      c.clientName,
    clientAddress:   c.clientAddress   ?? "",
    clientContact:   c.clientContact   ?? "",
    clientEmail:     c.clientEmail     ?? "",
    careHomeName:    c.careHomeName    ?? "",
    careHomeAddress: c.careHomeAddress ?? "",
    careHomeId:      c.careHomeId      ?? "",
    pricePerBox:     c.pricePerBox != null ? String(c.pricePerBox) : "140",
    estimatedBoxes:  c.estimatedBoxes != null ? String(c.estimatedBoxes) : "",
    totalCost:       c.totalCost != null ? String(c.totalCost) : "",
    projectDuration: c.projectDuration ?? "",
    depositPercent:  c.depositPercent != null ? String(c.depositPercent) : "30",
    scopeOfWorks:    c.scopeOfWorks    ?? "",
    requirements:    c.requirements    ?? "",
    paymentTerms:    c.paymentTerms    ?? "",
    startDate:       c.startDate ? c.startDate.slice(0, 10) : "",
    notes:           c.notes           ?? "",
    userId:          c.user?.id        ?? "",
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
    setShowForm(true);
  };

  const handleEdit = (c: Contract) => {
    setEditingId(c.id);
    setForm(contractToForm(c));
    setShowForm(true);
    setCareHomeOptions([]);
    if (c.user?.id) {
      fetch(`/api/care-homes?userId=${c.user.id}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data: CareHomeOption[]) => setCareHomeOptions(data))
        .catch(() => {});
    }
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...BLANK });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/contracts/${editingId}` : "/api/contracts",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (res.ok) {
        const saved = await res.json();
        setContracts((p) =>
          editingId ? p.map((c) => (c.id === editingId ? saved : c)) : [saved, ...p]
        );
        closeForm();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this contract? This cannot be undone.")) return;
    await fetch(`/api/contracts/${id}`, { method: "DELETE" });
    setContracts((p) => p.filter((c) => c.id !== id));
  };

  const handleStatusChange = async (id: string, status: ContractStatus) => {
    const res = await fetch(`/api/contracts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setContracts((p) => p.map((c) => (c.id === id ? updated : c)));
    }
  };

  const handleAssign = async (id: string) => {
    setAssigning(id);
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: assignUser[id] || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        setContracts((p) => p.map((c) => (c.id === id ? updated : c)));
      }
    } finally {
      setAssigning(null);
    }
  };

  const downloadPdf = async (path: string, fallbackName: string) => {
    const res = await fetch(path);
    if (!res.ok) throw new Error("PDF generation failed");
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = res.headers.get("Content-Disposition")?.split('filename="')[1]?.replace('"', "") ?? fallbackName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadRA = async (id: string) => {
    setDownloadingRA(id);
    try {
      await downloadPdf(`/api/contracts/${id}/risk-assessment`, "risk-assessment.pdf");
    } catch (err) {
      alert("Could not generate risk assessment — please try again.");
      console.error(err);
    } finally {
      setDownloadingRA(null);
    }
  };

  const handleDownload = async (id: string) => {
    setDownloading(id);
    try {
      await downloadPdf(`/api/contracts/${id}/pdf`, "contract.pdf");
    } catch (err) {
      alert("Could not generate PDF — please try again.");
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

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
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Total", value: contracts.length },
              { label: "Draft", value: contracts.filter((c) => c.status === "DRAFT").length },
              { label: "Signed / Active", value: contracts.filter((c) => c.status === "SIGNED" || c.status === "ACTIVE").length },
              { label: "Completed", value: contracts.filter((c) => c.status === "COMPLETED").length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm text-center">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={openNew} className="bg-scanvault-red hover:bg-red-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Contract
        </Button>
      </div>

      {/* Contract Form (create + edit) */}
      {showForm && (
        <Card className="border-2 border-scanvault-red/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-scanvault-red" /> {editingId ? "Edit Contract" : "New Contract"}
            </CardTitle>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-6">
              {/* Section: Client & Care Home */}
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
                  <div className="md:col-span-2">
                    <Label>Agreement Title *</Label>
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
                    <Label>Care Home Name *</Label>
                    <Input value={form.careHomeName} onChange={set("careHomeName")} className="mt-1" placeholder="e.g. Elmcroft Care Home" />
                  </div>
                  <div>
                    <Label>Care Home Address</Label>
                    <Input value={form.careHomeAddress} onChange={set("careHomeAddress")} className="mt-1" placeholder="Full site address" />
                  </div>
                </div>
              </div>

              {/* Section: Scope of Works */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">Scope of Works</h3>
                <div>
                  <Label>Detailed Scope of Works</Label>
                  <p className="text-xs text-gray-400 mb-1">Describe all archiving, scanning, digitisation, and indexing work to be carried out at this care home. Include quantities of archive boxes, drawers, files, etc.</p>
                  <textarea
                    value={form.scopeOfWorks}
                    onChange={set("scopeOfWorks")}
                    rows={8}
                    className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-y"
                    placeholder="e.g. Scanning, digitisation, organisation and indexing of approximately:\n- 15 archive holders\n- 43 completed archive files\n- 83 additional archive boxes\n- Secure uploading to cloud-based platform\n- Structured digital organisation and labelling\n- Creation of indexing and numbering system"
                  />
                </div>
              </div>

              {/* Section: Pricing & Duration */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">Pricing &amp; Project Duration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Total Project Cost (£)</Label>
                    <Input type="number" step="0.01" value={form.totalCost} onChange={set("totalCost")} className="mt-1" placeholder="e.g. 9840.00" />
                  </div>
                  <div>
                    <Label>Price Per Box (£)</Label>
                    <Input type="number" step="0.01" value={form.pricePerBox} onChange={set("pricePerBox")} className="mt-1" />
                  </div>
                  <div>
                    <Label>Estimated Boxes</Label>
                    <Input type="number" value={form.estimatedBoxes} onChange={set("estimatedBoxes")} className="mt-1" />
                  </div>
                  <div>
                    <Label>Project Duration</Label>
                    <Input value={form.projectDuration} onChange={set("projectDuration")} className="mt-1" placeholder="e.g. Approximately 2 weeks" />
                  </div>
                  <div>
                    <Label>Deposit (%)</Label>
                    <Input type="number" step="1" value={form.depositPercent} onChange={set("depositPercent")} className="mt-1" />
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <Input type="date" value={form.startDate} onChange={set("startDate")} className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Section: Requirements & Payment Terms */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">Requirements &amp; Payment Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <Label>Payment Terms (optional override)</Label>
                    <p className="text-xs text-gray-400 mb-1">Leave blank for standard deposit + balance terms</p>
                    <textarea
                      value={form.paymentTerms}
                      onChange={set("paymentTerms")}
                      rows={4}
                      className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-y"
                      placeholder="Custom payment terms if different from standard..."
                    />
                  </div>
                </div>
              </div>

              {/* Section: Assignment & Notes */}
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
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving…</> : editingId ? "Save Changes" : "Create Contract"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Contract list */}
      {contracts.length === 0 ? (
        <Card className="border border-gray-100">
          <CardContent className="py-16 text-center text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No contracts yet</p>
            <p className="text-sm mt-1">Click "New Contract" to create the first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => {
            const meta = STATUS_META[c.status];
            const Icon = meta.Icon;
            const cost = c.totalCost
              ? `£${c.totalCost.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`
              : c.estimatedBoxes
                ? `${c.estimatedBoxes} boxes · est. £${(c.estimatedBoxes * c.pricePerBox).toLocaleString("en-GB")}`
                : `£${c.pricePerBox}/box`;
            return (
              <Card key={c.id} className="border border-gray-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>
                          <Icon className="w-3 h-3" /> {meta.label}
                        </span>
                        <span className="font-semibold text-gray-900 truncate">{c.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">{c.clientName}</span>
                        {c.careHomeName && <span className="text-gray-400"> · <Building2 className="w-3 h-3 inline" /> {c.careHomeName}</span>}
                        {c.clientContact && <span className="text-gray-400"> · {c.clientContact}</span>}
                        {c.clientEmail   && <span className="text-gray-400"> · {c.clientEmail}</span>}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {cost}</span>
                        {c.projectDuration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.projectDuration}</span>}
                        {c.startDate && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Start: {new Date(c.startDate).toLocaleDateString("en-GB")}</span>}
                        {c.user && <span className="flex items-center gap-1 text-emerald-600"><UserCheck className="w-3 h-3" /> {c.user.name || c.user.email}</span>}
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Created {new Date(c.createdAt).toLocaleDateString("en-GB")}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end flex-shrink-0">
                      {/* Download */}
                      <Button
                        size="sm"
                        onClick={() => handleDownload(c.id)}
                        disabled={downloading === c.id}
                        className="h-7 px-3 text-xs bg-scanvault-red hover:bg-red-700 text-white flex items-center gap-1"
                      >
                        {downloading === c.id
                          ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                          : <><Download className="w-3 h-3" /> Download PDF</>}
                      </Button>

                      {/* Risk Assessment */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadRA(c.id)}
                        disabled={downloadingRA === c.id}
                        className="h-7 px-3 text-xs flex items-center gap-1"
                      >
                        {downloadingRA === c.id
                          ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                          : <><ShieldCheck className="w-3 h-3" /> Risk Assessment</>}
                      </Button>

                      {/* Status */}
                      <select
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value as ContractStatus)}
                        className="h-7 px-2 text-xs border border-gray-200 rounded-md bg-white"
                      >
                        {(Object.keys(STATUS_META) as ContractStatus[]).map((s) => (
                          <option key={s} value={s}>{STATUS_META[s].label}</option>
                        ))}
                      </select>

                      {/* Assign */}
                      <div className="flex gap-1">
                        <select
                          value={assignUser[c.id] ?? c.user?.id ?? ""}
                          onChange={(e) => setAssignUser((p) => ({ ...p, [c.id]: e.target.value }))}
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
                          onClick={() => handleAssign(c.id)}
                          disabled={assigning === c.id}
                          className="h-7 px-2 text-xs"
                        >
                          {assigning === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                        </Button>
                      </div>

                      {/* Edit + Delete */}
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(c)}
                          className="h-7 px-2 text-xs flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(c.id)}
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
