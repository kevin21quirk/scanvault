"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users, Plus, Trash2, X, Pencil, Loader2, Mail, Phone, MapPin, Building2, Home, ChevronDown, ChevronUp, Check,
} from "lucide-react";

interface Client {
  id:          string;
  email:       string;
  name:        string | null;
  role:        string;
  companyName: string | null;
  contactName: string | null;
  phone:       string | null;
  address:     string | null;
  createdAt:   string;
}

interface CareHome {
  id:        string;
  userId:    string;
  name:      string;
  address:   string | null;
  notes:     string | null;
}

const BLANK_CARE_HOME = { name: "", address: "", notes: "" };

const BLANK = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
};

export default function ClientsTab() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);

  const [careHomes, setCareHomes] = useState<Record<string, CareHome[]>>({});
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [careHomeForm, setCareHomeForm] = useState({ ...BLANK_CARE_HOME });
  const [editingCareHomeId, setEditingCareHomeId] = useState<string | null>(null);
  const [savingCareHome, setSavingCareHome] = useState(false);

  const fetch$ = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const all: Client[] = await res.json();
        setClients(all.filter((u) => u.role === "CLIENT"));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch$(); }, [fetch$]);

  const fetchCareHomes = useCallback(async (clientId: string) => {
    const res = await fetch(`/api/care-homes?userId=${clientId}`);
    if (res.ok) {
      const data: CareHome[] = await res.json();
      setCareHomes((p) => ({ ...p, [clientId]: data }));
    }
  }, []);

  const toggleExpand = (clientId: string) => {
    if (expandedClient === clientId) {
      setExpandedClient(null);
      return;
    }
    setExpandedClient(clientId);
    setEditingCareHomeId(null);
    setCareHomeForm({ ...BLANK_CARE_HOME });
    if (!careHomes[clientId]) fetchCareHomes(clientId);
  };

  const setCareHomeField = (k: keyof typeof BLANK_CARE_HOME) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setCareHomeForm((p) => ({ ...p, [k]: e.target.value }));

  const openNewCareHome = () => { setEditingCareHomeId(null); setCareHomeForm({ ...BLANK_CARE_HOME }); };
  const openEditCareHome = (h: CareHome) => {
    setEditingCareHomeId(h.id);
    setCareHomeForm({ name: h.name, address: h.address ?? "", notes: h.notes ?? "" });
  };

  const handleSaveCareHome = async (clientId: string, e: React.FormEvent) => {
    e.preventDefault();
    setSavingCareHome(true);
    try {
      const payload = { ...careHomeForm, userId: clientId };
      const res = await fetch(
        editingCareHomeId ? `/api/care-homes/${editingCareHomeId}` : "/api/care-homes",
        {
          method: editingCareHomeId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        const saved: CareHome = await res.json();
        setCareHomes((p) => ({
          ...p,
          [clientId]: editingCareHomeId
            ? (p[clientId] || []).map((h) => (h.id === editingCareHomeId ? saved : h))
            : [...(p[clientId] || []), saved].sort((a, b) => a.name.localeCompare(b.name)),
        }));
        setEditingCareHomeId(null);
        setCareHomeForm({ ...BLANK_CARE_HOME });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save care home");
      }
    } finally {
      setSavingCareHome(false);
    }
  };

  const handleDeleteCareHome = async (clientId: string, id: string) => {
    if (!confirm("Delete this care home? Any contracts, invoices or risk assessments referencing it will keep their existing text but lose the link.")) return;
    const res = await fetch(`/api/care-homes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCareHomes((p) => ({ ...p, [clientId]: (p[clientId] || []).filter((h) => h.id !== id) }));
    } else {
      const err = await res.json();
      alert(err.error || "Failed to delete care home");
    }
  };

  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const openNew = () => { setEditingId(null); setForm({ ...BLANK }); setShowForm(true); };
  const openEdit = (c: Client) => {
    setEditingId(c.id);
    setForm({
      companyName: c.companyName ?? "",
      contactName: c.contactName ?? "",
      email:       c.email,
      phone:       c.phone ?? "",
      address:     c.address ?? "",
      password:    "",
    });
    setShowForm(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm({ ...BLANK }); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        companyName: form.companyName,
        contactName: form.contactName,
        name:        form.contactName || form.companyName,
        email:       form.email,
        phone:       form.phone,
        address:     form.address,
        role:        "CLIENT",
        ...(form.password ? { password: form.password } : {}),
      };
      const res = await fetch(
        editingId ? `/api/users/${editingId}` : "/api/users",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        const saved = await res.json();
        setClients((p) => editingId ? p.map((c) => (c.id === editingId ? saved : c)) : [saved, ...p]);
        closeForm();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save client");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this client? Their contracts, invoices and risk assessments will be unassigned. This cannot be undone.")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setClients((p) => p.filter((c) => c.id !== id));
    } else {
      const err = await res.json();
      alert(err.error || "Failed to delete client");
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Set up your clients once. Their details will then be selectable from a dropdown when creating contracts, risk assessments and invoices.
        </p>
        <Button onClick={openNew} className="bg-scanvault-red hover:bg-red-700 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Client
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-scanvault-red/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-scanvault-red" /> {editingId ? "Edit Client" : "New Client"}
            </CardTitle>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Client / Company Name *</Label>
                  <Input value={form.companyName} onChange={set("companyName")} required className="mt-1" placeholder="e.g. Abbey Healthcare Group" />
                </div>
                <div>
                  <Label>Primary Contact Name</Label>
                  <Input value={form.contactName} onChange={set("contactName")} className="mt-1" placeholder="e.g. Jane Smith" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={set("email")} required className="mt-1" placeholder="contact@company.com" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={set("phone")} className="mt-1" placeholder="01480 000000" />
                </div>
                <div className="md:col-span-2">
                  <Label>Address</Label>
                  <textarea
                    value={form.address}
                    onChange={set("address")}
                    rows={2}
                    className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-y"
                    placeholder="Billing / head office address"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>{editingId ? "New Login Password (leave blank to keep current)" : "Login Password (optional)"}</Label>
                  <Input type="password" value={form.password} onChange={set("password")} className="mt-1" placeholder={editingId ? "Unchanged" : "Set only if the client needs portal access"} />
                  <p className="text-xs text-gray-400 mt-1">Optional — set a password if this client should be able to log in to the portal.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-scanvault-red hover:bg-red-700 text-white">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving…</> : editingId ? "Save Changes" : "Create Client"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {clients.length === 0 ? (
        <Card className="border border-gray-100">
          <CardContent className="py-16 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No clients yet</p>
            <p className="text-sm mt-1">Click "New Client" to add your first client.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clients.map((c) => (
            <Card key={c.id} className="border border-gray-100">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-scanvault-red flex-shrink-0" />
                      <p className="font-semibold text-gray-900 truncate">{c.companyName || c.name || c.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      {c.contactName ? <span>Contact: {c.contactName}</span> : null}
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>
                      {c.phone ? <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span> : null}
                      {c.address ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.address}</span> : null}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleExpand(c.id)}
                      className="h-7 px-2 text-xs flex items-center gap-1"
                    >
                      <Home className="w-3 h-3" />
                      Care Homes{careHomes[c.id] ? ` (${careHomes[c.id].length})` : ""}
                      {expandedClient === c.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(c)} className="h-7 px-2 text-xs flex items-center gap-1">
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

                {expandedClient === c.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                      <Home className="w-3 h-3" /> Care Homes for {c.companyName || c.name || c.email}
                    </p>
                    {(careHomes[c.id] || []).length === 0 ? (
                      <p className="text-xs text-gray-400 mb-3">No care homes added yet.</p>
                    ) : (
                      <div className="space-y-2 mb-3">
                        {(careHomes[c.id] || []).map((h) => (
                          <div key={h.id} className="flex items-start justify-between gap-3 bg-gray-50 rounded-md px-3 py-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{h.name}</p>
                              {h.address ? <p className="text-xs text-gray-500 truncate">{h.address}</p> : null}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => openEditCareHome(h)}
                                className="h-6 px-2 text-xs border border-gray-200 rounded hover:bg-white flex items-center gap-1"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCareHome(c.id, h.id)}
                                className="h-6 px-2 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={(e) => handleSaveCareHome(c.id, e)} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-start">
                      <Input
                        value={careHomeForm.name}
                        onChange={setCareHomeField("name")}
                        placeholder="Care home name *"
                        required
                        className="h-8 text-sm"
                      />
                      <Input
                        value={careHomeForm.address}
                        onChange={setCareHomeField("address")}
                        placeholder="Care home address"
                        className="h-8 text-sm"
                      />
                      <div className="flex gap-1">
                        <Button type="submit" size="sm" disabled={savingCareHome} className="h-8 bg-scanvault-red hover:bg-red-700 text-white text-xs flex items-center gap-1">
                          {savingCareHome ? <Loader2 className="w-3 h-3 animate-spin" /> : editingCareHomeId ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          {editingCareHomeId ? "Save" : "Add"}
                        </Button>
                        {editingCareHomeId && (
                          <Button type="button" size="sm" variant="outline" onClick={openNewCareHome} className="h-8 text-xs">
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
