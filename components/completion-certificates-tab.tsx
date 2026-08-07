"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Award, Plus, Download, Trash2, Pencil, Loader2, Building2, X, CheckCircle2, PenLine,
} from "lucide-react";

type CertStatus = "DRAFT" | "ISSUED";

interface WorkItem { description: string; quantity: string; unit: string; }

interface CertUser { id: string; name: string | null; email: string; }
interface Certificate {
  id:                string;
  certificateNumber: string;
  clientName:        string;
  clientAddress:     string | null;
  clientContact:     string | null;
  clientEmail:       string | null;
  careHomeName:      string | null;
  careHomeAddress:   string | null;
  careHomeId:        string | null;
  worksDescription:  string | null;
  workItems:         { description: string; quantity: number; unit: string }[] | null;
  completionDate:    string;
  issuedDate:        string | null;
  assessorName:      string | null;
  notes:             string | null;
  status:            CertStatus;
  createdAt:         string;
  user:              CertUser | null;
}

interface UserOption {
  id: string; name: string | null; email: string; role?: string;
  companyName?: string | null; contactName?: string | null;
  phone?: string | null; address?: string | null;
}
interface CareHomeOption { id: string; name: string; address: string | null; }

const BLANK_FORM = {
  certificateNumber: "",
  clientName:        "",
  clientAddress:     "",
  clientContact:     "",
  clientEmail:       "",
  careHomeName:      "",
  careHomeAddress:   "",
  careHomeId:        "",
  worksDescription:  "",
  completionDate:    "",
  issuedDate:        "",
  assessorName:      "Kevin Quirk",
  notes:             "",
  userId:            "",
  status:            "DRAFT" as CertStatus,
};

const BLANK_ITEM: WorkItem = { description: "", quantity: "1", unit: "" };

const WORK_ITEM_PRESETS = [
  { description: "Archive boxes scanned & digitised", unit: "boxes" },
  { description: "Archive files scanned & digitised", unit: "files" },
  { description: "Loose document drawers processed", unit: "drawers" },
  { description: "Documents uploaded to SharePoint location", unit: "GB" },
  { description: "Damaged/broken boxes recovered & reorganised", unit: "boxes" },
  { description: "Physical archive materials consolidated & labelled", unit: "items" },
];

const STATUS_META: Record<CertStatus, { label: string; color: string }> = {
  DRAFT:  { label: "Draft",  color: "bg-gray-100 text-gray-600" },
  ISSUED: { label: "Issued", color: "bg-green-100 text-green-700" },
};

export default function CompletionCertificatesTab() {
  const [certs,           setCerts]           = useState<Certificate[]>([]);
  const [users,           setUsers]           = useState<UserOption[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [showForm,        setShowForm]        = useState(false);
  const [editingId,       setEditingId]       = useState<string | null>(null);
  const [form,            setForm]            = useState({ ...BLANK_FORM });
  const [workItems,       setWorkItems]       = useState<WorkItem[]>([{ ...BLANK_ITEM }]);
  const [saving,          setSaving]          = useState(false);
  const [downloading,     setDownloading]     = useState<string | null>(null);
  const [deleting,        setDeleting]        = useState<string | null>(null);
  const [careHomeOptions, setCareHomeOptions] = useState<CareHomeOption[]>([]);

  const fetchAll = useCallback(async () => {
    try {
      const [cr, ur] = await Promise.all([
        fetch("/api/completion-certificates"),
        fetch("/api/users"),
      ]);
      if (cr.ok) setCerts(await cr.json());
      if (ur.ok) setUsers(await ur.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchNextNumber = async () => {
    try {
      const res = await fetch("/api/completion-certificates/next-number");
      if (res.ok) {
        const data = await res.json();
        setForm((p) => ({ ...p, certificateNumber: data.certificateNumber }));
      }
    } catch (err) {
      console.error("Error fetching next certificate number:", err);
    }
  };

  const clientUsers = users.filter((u) => u.role === "CLIENT" || u.role === undefined);

  const handleSelectClient = (clientId: string) => {
    if (!clientId) {
      setForm((p) => ({ ...p, userId: "", careHomeId: "", careHomeName: "", careHomeAddress: "" }));
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
      careHomeId:      h.id,
      careHomeName:    h.name,
      careHomeAddress: h.address || p.careHomeAddress,
    }));
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ ...BLANK_FORM });
    setWorkItems([{ ...BLANK_ITEM }]);
    setCareHomeOptions([]);
    setShowForm(true);
    fetchNextNumber();
  };

  const openEdit = (cert: Certificate) => {
    setEditingId(cert.id);
    setForm({
      certificateNumber: cert.certificateNumber,
      clientName:        cert.clientName,
      clientAddress:     cert.clientAddress   ?? "",
      clientContact:     cert.clientContact   ?? "",
      clientEmail:       cert.clientEmail     ?? "",
      careHomeName:      cert.careHomeName    ?? "",
      careHomeAddress:   cert.careHomeAddress ?? "",
      careHomeId:        cert.careHomeId      ?? "",
      worksDescription:  cert.worksDescription ?? "",
      completionDate:    cert.completionDate.slice(0, 10),
      issuedDate:        cert.issuedDate?.slice(0, 10) ?? "",
      assessorName:      cert.assessorName    ?? "Kevin Quirk",
      notes:             cert.notes           ?? "",
      userId:            cert.user?.id        ?? "",
      status:            cert.status,
    });
    setWorkItems(
      cert.workItems && cert.workItems.length
        ? cert.workItems.map((i) => ({ description: i.description, quantity: String(i.quantity), unit: i.unit }))
        : [{ ...BLANK_ITEM }]
    );
    setCareHomeOptions([]);
    if (cert.user?.id) {
      fetch(`/api/care-homes?userId=${cert.user.id}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data: CareHomeOption[]) => setCareHomeOptions(data))
        .catch(() => {});
    }
    setShowForm(true);
  };

  const addItem = () => setWorkItems((p) => [...p, { ...BLANK_ITEM }]);
  const removeItem = (i: number) => setWorkItems((p) => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: keyof WorkItem, val: string) =>
    setWorkItems((p) => p.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  const applyPreset = (preset: typeof WORK_ITEM_PRESETS[0]) =>
    setWorkItems((p) => [...p.filter((i) => i.description || i.quantity !== "1"), { description: preset.description, quantity: "1", unit: preset.unit }]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url    = editingId ? `/api/completion-certificates/${editingId}` : "/api/completion-certificates";
      const method = editingId ? "PATCH" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, workItems }),
      });
      if (res.ok) {
        const saved = await res.json();
        setCerts((p) =>
          editingId
            ? p.map((c) => (c.id === editingId ? saved : c))
            : [saved, ...p]
        );
        setShowForm(false);
        setEditingId(null);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save certificate");
      }
    } catch {
      alert("Failed to save certificate");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this completion certificate? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/completion-certificates/${id}`, { method: "DELETE" });
      if (res.ok) setCerts((p) => p.filter((c) => c.id !== id));
      else alert("Failed to delete certificate");
    } finally {
      setDeleting(null);
    }
  };

  const downloadPdf = async (cert: Certificate) => {
    setDownloading(cert.id);
    try {
      const res = await fetch(`/api/completion-certificates/${cert.id}/pdf`);
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = res.headers.get("Content-Disposition")?.split('filename="')[1]?.replace('"', "") ?? `Certificate-${cert.certificateNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Could not download PDF — please try again.");
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-scanvault-red" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Issue completion certificates confirming works carried out at each care home site.</p>
        <Button onClick={openNew} className="bg-scanvault-red hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          New Certificate
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {certs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No completion certificates yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {certs.map((cert) => {
                const meta = STATUS_META[cert.status];
                return (
                  <div key={cert.id} className="border rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{cert.certificateNumber}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.color}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-0.5">{cert.clientName}</p>
                        {cert.careHomeName && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3 w-3" /> {cert.careHomeName}
                            {cert.careHomeAddress && <span className="text-gray-400">· {cert.careHomeAddress}</span>}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Completion date: {new Date(cert.completionDate).toLocaleDateString("en-GB")}
                          {cert.assessorName && <span className="ml-3">· {cert.assessorName}</span>}
                        </p>
                        {cert.workItems && cert.workItems.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {cert.workItems.map((wi, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                {wi.quantity} {wi.unit} — {wi.description}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end shrink-0">
                        <Button size="sm" variant="outline" onClick={() => openEdit(cert)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadPdf(cert)}
                          disabled={downloading === cert.id}
                        >
                          {downloading === cert.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            : <Download className="h-3.5 w-3.5 mr-1" />}
                          Download PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => handleDelete(cert.id)}
                          disabled={deleting === cert.id}
                        >
                          {deleting === cert.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingId ? "Edit Certificate" : "New Completion Certificate"}</CardTitle>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5">

                {/* Client + Certificate Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Client *</Label>
                    <select
                      required
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={form.userId}
                      onChange={(e) => handleSelectClient(e.target.value)}
                    >
                      <option value="">Select client…</option>
                      {clientUsers.map((u) => (
                        <option key={u.id} value={u.id}>{u.companyName || u.name || u.email}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Certificate Number</Label>
                    <Input value={form.certificateNumber} readOnly className="bg-gray-50" placeholder="Loading…" />
                  </div>
                </div>

                {/* Care Home / Site */}
                <div className="rounded-md border border-gray-200 p-4 space-y-3 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Care Home / Site Details</p>

                  {/* Dropdown — only shown when the client has registered care homes */}
                  {careHomeOptions.length > 0 && (
                    <div>
                      <Label>Select Care Home</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                        value={form.careHomeId}
                        onChange={(e) => handleSelectCareHome(e.target.value)}
                      >
                        <option value="">— Select a care home / site —</option>
                        {careHomeOptions.map((h) => (
                          <option key={h.id} value={h.id}>{h.name}{h.address ? ` — ${h.address}` : ""}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Selecting a care home populates the name and address below.</p>
                    </div>
                  )}

                  {/* Name + Address — always visible, pre-filled by dropdown or typed manually */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Care Home Name {careHomeOptions.length === 0 ? "" : <span className="text-gray-400 font-normal">(auto-filled)</span>}</Label>
                      <Input
                        value={form.careHomeName}
                        onChange={(e) => setForm((p) => ({ ...p, careHomeName: e.target.value }))}
                        placeholder="e.g. Sunrise Care Home"
                      />
                    </div>
                    <div>
                      <Label>Care Home Address {careHomeOptions.length === 0 ? "" : <span className="text-gray-400 font-normal">(auto-filled)</span>}</Label>
                      <Input
                        value={form.careHomeAddress}
                        onChange={(e) => setForm((p) => ({ ...p, careHomeAddress: e.target.value }))}
                        placeholder="Full site address"
                      />
                    </div>
                  </div>
                </div>

                {/* Client details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Client Name *</Label>
                    <Input
                      required
                      value={form.clientName}
                      onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Client Email</Label>
                    <Input
                      type="email"
                      value={form.clientEmail}
                      onChange={(e) => setForm((p) => ({ ...p, clientEmail: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Client Contact</Label>
                    <Input
                      value={form.clientContact}
                      onChange={(e) => setForm((p) => ({ ...p, clientContact: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Client Main Address <span className="text-gray-400 font-normal text-xs">(head office / registered address)</span></Label>
                    <Input
                      value={form.clientAddress}
                      onChange={(e) => setForm((p) => ({ ...p, clientAddress: e.target.value }))}
                      placeholder="e.g. Abbey Healthcare Group head office"
                    />
                  </div>
                </div>

                {/* Dates & Assessor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Date of Completion *</Label>
                    <Input
                      type="date"
                      required
                      value={form.completionDate}
                      onChange={(e) => setForm((p) => ({ ...p, completionDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Issued Date</Label>
                    <Input
                      type="date"
                      value={form.issuedDate}
                      onChange={(e) => setForm((p) => ({ ...p, issuedDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Assessor / Supervisor</Label>
                    <Input
                      value={form.assessorName}
                      onChange={(e) => setForm((p) => ({ ...p, assessorName: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Work Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Works Carried Out *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Add row
                    </Button>
                  </div>

                  {/* Quick-add presets */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {WORK_ITEM_PRESETS.map((p) => (
                      <button
                        key={p.description}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className="text-xs bg-gray-100 hover:bg-scanvault-red hover:text-white text-gray-600 px-2 py-1 rounded transition-colors"
                      >
                        + {p.description}
                      </button>
                    ))}
                  </div>

                  <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-gray-500 px-1 mb-1">
                    <span className="col-span-6">Description</span>
                    <span className="col-span-2 text-center">Amount / Size</span>
                    <span className="col-span-3">Unit</span>
                    <span className="col-span-1" />
                  </div>
                  <div className="space-y-3">
                    {workItems.map((item, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center rounded-md border bg-white p-2 sm:border-0 sm:bg-transparent sm:p-0">
                        <Input
                          className="sm:col-span-6"
                          placeholder="e.g. Archive boxes scanned & digitised"
                          value={item.description}
                          onChange={(e) => updateItem(i, "description", e.target.value)}
                        />
                        <Input
                          className="sm:col-span-2 text-center"
                          type="text"
                          value={item.quantity}
                          onChange={(e) => updateItem(i, "quantity", e.target.value)}
                          placeholder="e.g. 83 or 6.5GB"
                        />
                        <Input
                          className="sm:col-span-3"
                          placeholder="boxes / files / GB…"
                          value={item.unit}
                          onChange={(e) => updateItem(i, "unit", e.target.value)}
                        />
                        <div className="sm:col-span-1 flex justify-end">
                          {workItems.length > 1 && (
                            <button type="button" onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-600">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional overview */}
                <div>
                  <Label>Additional Works Description (optional)</Label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    rows={2}
                    value={form.worksDescription}
                    onChange={(e) => setForm((p) => ({ ...p, worksDescription: e.target.value }))}
                    placeholder="Any additional detail to appear on the certificate…"
                  />
                </div>

                {/* Status + Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      value={form.status}
                      onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as CertStatus }))}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="ISSUED">Issued</option>
                    </select>
                  </div>
                  <div>
                    <Label>Notes (optional)</Label>
                    <Input
                      value={form.notes}
                      onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Internal notes…"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button type="submit" className="bg-scanvault-red hover:bg-red-700" disabled={saving}>
                    {saving
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : editingId
                        ? <><CheckCircle2 className="h-4 w-4 mr-1" /> Update Certificate</>
                        : <><Award className="h-4 w-4 mr-1" /> Issue Certificate</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
