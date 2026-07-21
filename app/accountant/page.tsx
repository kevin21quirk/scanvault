"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText, Receipt, Download, Loader2,
  CheckCircle2, Clock, XCircle, AlertCircle, LogOut, KeyRound,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Invoice {
  id: string; invoiceNumber: string; description: string;
  issueDate: string; dueDate: string; total: number; status: string;
  user: { email: string; name: string | null };
  careHomeName: string | null;
}

interface ReceiptItem {
  id: string; receiptNumber: string; description: string;
  date: string; amount: number; paymentMethod: string;
  user: { email: string; name: string | null };
}


const statusIcon = (s: string) => {
  if (s === "PAID")      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (s === "OVERDUE")   return <AlertCircle  className="h-4 w-4 text-red-600" />;
  if (s === "CANCELLED") return <XCircle      className="h-4 w-4 text-gray-400" />;
  return <Clock className="h-4 w-4 text-yellow-500" />;
};

const statusBadge = (s: string) =>
  s === "PAID"      ? "bg-green-100 text-green-700 border-green-200" :
  s === "OVERDUE"   ? "bg-red-100 text-red-700 border-red-200" :
  s === "CANCELLED" ? "bg-gray-100 text-gray-500 border-gray-200" :
                      "bg-yellow-100 text-yellow-700 border-yellow-200";

function StatCard({ label, value, sub, colour }: { label: string; value: string; sub?: string; colour: string }) {
  return (
    <div className={`rounded-xl border p-4 ${colour}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function AccountantDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ACCOUNTANT") { router.push("/login"); return; }
    Promise.all([
      fetch("/api/invoices").then(r => r.ok ? r.json() : []),
      fetch("/api/receipts").then(r => r.ok ? r.json() : []),
    ]).then(([inv, rec]) => { setInvoices(inv); setReceipts(rec); }).finally(() => setLoading(false));
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>;
  }

  // ── Summaries ───────────────────────────────────────────────
  const totalInvoiced    = invoices.reduce((s, i) => s + i.total, 0);
  const totalReceipts    = receipts.reduce((s, r) => s + r.amount, 0);
  const totalOutstanding = Math.max(0, totalInvoiced - totalReceipts);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Scan<span className="text-red-600">Vault</span> — Accounts
          </h1>
          <p className="text-sm text-gray-500">Welcome back, {session?.user?.name || session?.user?.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4 mr-2" />Log out
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Invoiced"  value={formatCurrency(totalInvoiced)}    colour="bg-white border-gray-200" />
          <StatCard label="Total Received"   value={formatCurrency(totalReceipts)}    sub={`${receipts.length} receipt${receipts.length !== 1 ? "s" : ""}`} colour="bg-green-50 border-green-100" />
          <StatCard label="Outstanding"      value={formatCurrency(totalOutstanding)} sub="invoiced minus received" colour="bg-yellow-50 border-yellow-100" />
          <StatCard label="Paid Invoices"    value={String(invoices.filter(i => i.status === "PAID").length)} sub={`of ${invoices.length} total`} colour="bg-blue-50 border-blue-100" />
        </div>

        <Tabs defaultValue="invoices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="invoices"><FileText className="h-4 w-4 mr-2" />Invoices ({invoices.length})</TabsTrigger>
            <TabsTrigger value="receipts"><Receipt  className="h-4 w-4 mr-2" />Receipts ({receipts.length})</TabsTrigger>
            <TabsTrigger value="account"><KeyRound className="h-4 w-4 mr-2" />Account</TabsTrigger>
          </TabsList>

          {/* ── INVOICES ── */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>All Invoices</CardTitle>
                <CardDescription>Full invoice history across all clients</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {invoices.length === 0 ? (
                  <div className="text-center py-16 text-gray-400"><FileText className="h-10 w-10 mx-auto mb-2" /><p>No invoices found</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Invoice #</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Client</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Description</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Issue Date</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Due Date</th>
                          <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {invoices.map(inv => (
                          <tr key={inv.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono font-semibold text-red-600">{inv.invoiceNumber}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{inv.user.name || inv.user.email}</p>
                              {inv.careHomeName && <p className="text-xs text-gray-500">{inv.careHomeName}</p>}
                            </td>
                            <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{inv.description}</td>
                            <td className="px-4 py-3 text-gray-600">{formatDate(inv.issueDate)}</td>
                            <td className="px-4 py-3 text-gray-600">{formatDate(inv.dueDate)}</td>
                            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(inv.total)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusBadge(inv.status)}`}>
                                {statusIcon(inv.status)}{inv.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <a href={`/api/invoices/${inv.id}/download`} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline"><Download className="h-3 w-3 mr-1" />PDF</Button>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── RECEIPTS ── */}
          <TabsContent value="receipts">
            <Card>
              <CardHeader>
                <CardTitle>All Receipts</CardTitle>
                <CardDescription>Receipts uploaded by ScanVault admin</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {receipts.length === 0 ? (
                  <div className="text-center py-16 text-gray-400"><Receipt className="h-10 w-10 mx-auto mb-2" /><p>No receipts found</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Receipt #</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Client</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Description</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Method</th>
                          <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {receipts.map(r => (
                          <tr key={r.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono font-semibold text-red-600">{r.receiptNumber}</td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{r.user.name || r.user.email}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{r.description}</td>
                            <td className="px-4 py-3 text-gray-600">{formatDate(r.date)}</td>
                            <td className="px-4 py-3 text-gray-600">{r.paymentMethod}</td>
                            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(r.amount)}</td>
                            <td className="px-4 py-3">
                              <a href={`/api/receipts/${r.id}/download`} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="outline"><Download className="h-3 w-3 mr-1" />PDF</Button>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ACCOUNT ── */}
          <TabsContent value="account">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-red-600" />
                  Change Password
                </CardTitle>
                <CardDescription>Enter your current password, then choose a new one</CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

function ChangePasswordForm() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.next !== form.confirm) {
      setPwStatus("error");
      setMessage("New passwords do not match");
      return;
    }
    setPwStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwStatus("success");
        setMessage("Password changed successfully");
        setForm({ current: "", next: "", confirm: "" });
      } else {
        setPwStatus("error");
        setMessage(data.error || "Failed to change password");
      }
    } catch {
      setPwStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="current">Current Password</Label>
        <Input
          id="current"
          type="password"
          required
          value={form.current}
          onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))}
          autoComplete="current-password"
        />
      </div>
      <div>
        <Label htmlFor="next">New Password</Label>
        <Input
          id="next"
          type="password"
          required
          minLength={8}
          value={form.next}
          onChange={(e) => setForm((p) => ({ ...p, next: e.target.value }))}
          autoComplete="new-password"
        />
        <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>
      </div>
      <div>
        <Label htmlFor="confirm">Confirm New Password</Label>
        <Input
          id="confirm"
          type="password"
          required
          value={form.confirm}
          onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
          autoComplete="new-password"
        />
      </div>
      {message && (
        <p className={`text-sm ${pwStatus === "success" ? "text-green-600" : "text-red-600"}`}>{message}</p>
      )}
      <Button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700"
        disabled={pwStatus === "submitting"}
      >
        {pwStatus === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Password"}
      </Button>
    </form>
  );
}
