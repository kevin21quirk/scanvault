"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Pencil, Trash2, Loader2, ShieldCheck, UserCog, User } from "lucide-react";

interface SystemUser {
  id:          string;
  email:       string;
  name:        string | null;
  role:        string;
  companyName: string | null;
  createdAt:   string;
}

const ROLES = ["ADMIN", "ACCOUNTANT"] as const;

const ROLE_META: Record<string, { label: string; colour: string; Icon: React.ElementType }> = {
  ADMIN:      { label: "Admin",      colour: "bg-red-100 text-red-700 border-red-200",    Icon: ShieldCheck },
  ACCOUNTANT: { label: "Accountant", colour: "bg-blue-100 text-blue-700 border-blue-200", Icon: UserCog },
};

const BLANK = { name: "", email: "", role: "ACCOUNTANT" as string, password: "" };

export default function SystemUsersTab() {
  const [users,   setUsers]   = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const all: SystemUser[] = await res.json();
        setUsers(all.filter(u => u.role !== "CLIENT"));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k: keyof typeof BLANK) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const openNew = () => {
    setEditingId(null);
    setForm({ ...BLANK });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (u: SystemUser) => {
    setEditingId(u.id);
    setForm({ name: u.name ?? "", email: u.email, role: u.role, password: "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm({ ...BLANK }); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name:  form.name,
        email: form.email,
        role:  form.role,
      };
      if (form.password) payload.password = form.password;
      if (!editingId)    payload.role = form.role;

      const res = await fetch(
        editingId ? `/api/users/${editingId}` : "/api/users",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        const saved: SystemUser = await res.json();
        setUsers(p =>
          editingId
            ? p.map(u => (u.id === editingId ? saved : u))
            : [saved, ...p],
        );
        closeForm();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save user");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: SystemUser) => {
    if (!confirm(`Delete ${u.name || u.email} (${u.role})? This cannot be undone.`)) return;
    setDeletingId(u.id);
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(p => p.filter(x => x.id !== u.id));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete user");
      }
    } finally {
      setDeletingId(null);
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-500">
          Admin and staff accounts — these users have elevated access and do not appear in the Clients list.
        </p>
        <Button onClick={openNew} className="bg-scanvault-red hover:bg-red-700 text-white flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> New User
        </Button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <Card className="border-2 border-scanvault-red/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCog className="w-4 h-4 text-scanvault-red" />
              {editingId ? "Edit User" : "New User"}
            </CardTitle>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={form.name}
                    onChange={set("name")}
                    className="mt-1"
                    placeholder="e.g. Scott Hughes"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    required
                    className="mt-1"
                    placeholder="scott@example.com"
                  />
                </div>
                <div>
                  <Label>Role *</Label>
                  <select
                    value={form.role}
                    onChange={set("role")}
                    className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                    required
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{ROLE_META[r]?.label ?? r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>{editingId ? "New Password (leave blank to keep current)" : "Password *"}</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    className="mt-1"
                    required={!editingId}
                    minLength={8}
                    placeholder={editingId ? "Unchanged" : "Minimum 8 characters"}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-scanvault-red hover:bg-red-700 text-white">
                  {saving
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Saving…</>
                    : editingId ? "Save Changes" : "Create User"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* User list */}
      {users.length === 0 ? (
        <Card className="border border-gray-100">
          <CardContent className="py-16 text-center text-gray-400">
            <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No system users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map(u => {
            const meta = ROLE_META[u.role] ?? { label: u.role, colour: "bg-gray-100 text-gray-600 border-gray-200", Icon: User };
            const Icon = meta.Icon;
            return (
              <Card key={u.id} className="border border-gray-100">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`rounded-full p-2 shrink-0 ${meta.colour.split(" ").slice(0, 1).join(" ")} bg-opacity-30`}>
                        <Icon className={`w-4 h-4 ${meta.colour.split(" ").slice(1, 2).join(" ")}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 truncate">{u.name || u.email}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${meta.colour}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{u.email}</p>
                        {u.createdAt && (
                          <p className="text-xs text-gray-400">
                            Added {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(u)}
                        className="h-7 px-2 text-xs flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(u)}
                        disabled={deletingId === u.id}
                        className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 border-red-200"
                      >
                        {deletingId === u.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Trash2 className="w-3 h-3" />}
                      </Button>
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
