"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck, Plus, Download, Trash2, X, Building2, Pencil, Loader2, Calendar,
} from "lucide-react";

interface RAUser { id: string; name: string | null; email: string; }
interface RiskAssessment {
  id:              string;
  careHomeName:    string;
  careHomeAddress: string | null;
  clientName:      string;
  clientAddress:   string | null;
  assessorName:    string | null;
  workStartDate:   string | null;
  notes:           string | null;
  createdAt:       string;
  user:            RAUser | null;
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

const BLANK = {
  careHomeName: "",
  careHomeAddress: "",
  clientName: "",
  clientAddress: "",
  assessorName: "Kevin Quirk",
  workStartDate: "",
  notes: "",
  userId: "",
};

export default function RiskAssessmentsTab() {
  const [items,   setItems]   = useState<RiskAssessment[]>([]);
  const [users,   setUsers]   = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetch$ = useCallback(async () => {
    try {
      const [rr, ur] = await Promise.all([fetch("/api/risk-assessments"), fetch("/api/users")]);
      if (rr.ok) setItems(await rr.json());
      if (ur.ok) setUsers(await ur.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch$(); }, [fetch$]);

  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const toForm = (r: RiskAssessment): typeof BLANK => ({
    careHomeName:    r.careHomeName,
    careHomeAddress: r.careHomeAddress ?? "",
    clientName:      r.clientName,
    clientAddress:   r.clientAddress ?? "",
    assessorName:    r.assessorName ?? "Kevin Quirk",
    workStartDate:   r.workStartDate ? r.workStartDate.slice(0, 10) : "",
    notes:           r.notes ?? "",
    userId:          r.user?.id ?? "",
  });

  const clientOptions = users.filter((u) => u.role === "CLIENT" || u.role === undefined);

  const handleSelectClient = (clientId: string) => {
    if (!clientId) {
      setForm((p) => ({ ...p, userId: "" }));
      return;
    }
    const c = users.find((u) => u.id === clientId);
    if (!c) return;
    setForm((p) => ({
      ...p,
      userId:        c.id,
      clientName:    c.companyName || c.name || p.clientName,
      clientAddress: c.address || p.clientAddress,
    }));
  };

  const openNew = () => { setEditingId(null); setForm({ ...BLANK }); setShowForm(true); };
  const openEdit = (r: RiskAssessment) => {
    setEditingId(r.id);
    setForm(toForm(r));
    setShowForm(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm({ ...BLANK }); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/risk-assessments/${editingId}` : "/api/risk-assessments",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (res.ok) {
        const saved = await res.json();
        setItems((p) => editingId ? p.map((r) => (r.id === editingId ? saved : r)) : [saved, ...p]);
        closeForm();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save risk assessment");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this risk assessment? This cannot be undone.")) return;
    await fetch(`/api/risk-assessments/${id}`, { method: "DELETE" });
    setItems((p) => p.filter((r) => r.id !== id));
  };

  const handleDownload = async (id: string) => {
    setDownloading(id);
    try {
      const res = await fetch(`/api/risk-assessments/${id}/pdf`);
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = res.headers.get("Content-Disposition")?.split('filename="')[1]?.replace('"', "") ?? "risk-assessment.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not generate risk assessment — please try again.");
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Create a site-specific care-home risk assessment for each care home you work in. No contract required.
        </p>
        <Button onClick={openNew} className="bg-scanvault-red hover:bg-red-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Risk Assessment
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-2 border-scanvault-red/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-scanvault-red" /> {editingId ? "Edit Risk Assessment" : "New Risk Assessment"}
            </CardTitle>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              {/* Care home + client */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">Care Home &amp; Client Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Select Existing Client <span className="text-gray-400 font-normal">(autofills client details below)</span></Label>
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
                    <Label>Care Home / Site Name *</Label>
                    <Input value={form.careHomeName} onChange={set("careHomeName")} required className="mt-1" placeholder="e.g. Cromwell House Care Home" />
                  </div>
                  <div>
                    <Label>Care Home Site Address</Label>
                    <Input value={form.careHomeAddress} onChange={set("careHomeAddress")} className="mt-1" placeholder="Full site address" />
                  </div>
                  <div>
                    <Label>Client / Operator *</Label>
                    <Input value={form.clientName} onChange={set("clientName")} required className="mt-1" placeholder="e.g. Abbey Healthcare Group" />
                  </div>
                  <div>
                    <Label>Client Address</Label>
                    <Input value={form.clientAddress} onChange={set("clientAddress")} className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Assessment details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 mb-3">Assessment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Assessor Name</Label>
                    <Input value={form.assessorName} onChange={set("assessorName")} className="mt-1" />
                  </div>
                  <div>
                    <Label>Work Start Date</Label>
                    <Input type="date" value={form.workStartDate} onChange={set("workStartDate")} className="mt-1" />
                  </div>
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
                </div>
                <div className="mt-4">
                  <Label>Internal Notes</Label>
                  <textarea
                    value={form.notes}
                    onChange={set("notes")}
                    rows={2}
                    className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-y"
                    placeholder="Optional internal notes (not shown on the PDF)"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-scanvault-red hover:bg-red-700 text-white">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving…</> : editingId ? "Save Changes" : "Create Risk Assessment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {items.length === 0 ? (
        <Card className="border border-gray-100">
          <CardContent className="py-16 text-center text-gray-400">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No risk assessments yet</p>
            <p className="text-sm mt-1">Click "New Risk Assessment" to create the first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <Card key={r.id} className="border border-gray-100">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-scanvault-red flex-shrink-0" />
                      <p className="font-semibold text-gray-900 truncate">{r.careHomeName}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{r.clientName}</p>
                    {r.careHomeAddress ? <p className="text-xs text-gray-500 mt-0.5">{r.careHomeAddress}</p> : null}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <span>Assessor: {r.assessorName || "Kevin Quirk"}</span>
                      {r.workStartDate ? (
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(r.workStartDate).toLocaleDateString("en-GB")}</span>
                      ) : null}
                      <span>Created: {new Date(r.createdAt).toLocaleDateString("en-GB")}</span>
                      {r.user ? <span>Client login: {r.user.name || r.user.email}</span> : null}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleDownload(r.id)}
                      disabled={downloading === r.id}
                      className="h-7 px-3 text-xs bg-scanvault-red hover:bg-red-700 text-white flex items-center gap-1"
                    >
                      {downloading === r.id
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                        : <><Download className="w-3 h-3" /> Download PDF</>}
                    </Button>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(r)} className="h-7 px-2 text-xs flex items-center gap-1">
                        <Pencil className="w-3 h-3" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(r.id)}
                        className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
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
