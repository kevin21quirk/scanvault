"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FileText, Receipt, Landmark, Download, Loader2,
  CheckCircle2, Clock, XCircle, AlertCircle, LogOut,
  TrendingUp, TrendingDown, RefreshCw, WifiOff,
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

interface RevolutAccount {
  id: string; name: string; balance: number; currency: string; state: string;
}

interface RevolutTransaction {
  id: string; type: string; state: string; created_at: string;
  completed_at: string | null; description: string | null;
  reference: string | null;
  legs: { amount: number; currency: string; description: string | null }[];
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

  const [invoices,     setInvoices]     = useState<Invoice[]>([]);
  const [receipts,     setReceipts]     = useState<ReceiptItem[]>([]);
  const [revolut,      setRevolut]      = useState<{ connected: boolean; accounts?: RevolutAccount[]; transactions?: RevolutTransaction[] } | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [revoluting,   setRevoluting]   = useState(false);
  const [dateFrom,     setDateFrom]     = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); });
  const [dateTo,       setDateTo]       = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ACCOUNTANT") { router.push("/login"); return; }
    Promise.all([
      fetch("/api/invoices").then(r => r.ok ? r.json() : []),
      fetch("/api/receipts").then(r => r.ok ? r.json() : []),
    ]).then(([inv, rec]) => { setInvoices(inv); setReceipts(rec); }).finally(() => setLoading(false));
  }, [session, status, router]);

  const fetchRevolut = useCallback(async () => {
    setRevoluting(true);
    try {
      const res = await fetch(`/api/revolut?from=${dateFrom}T00:00:00Z&to=${dateTo}T23:59:59Z`);
      const data = await res.json();
      setRevolut(data);
    } catch { setRevolut({ connected: false }); }
    finally { setRevoluting(false); }
  }, [dateFrom, dateTo]);

  useEffect(() => { if (session?.user?.role === "ACCOUNTANT") fetchRevolut(); }, [fetchRevolut, session]);

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>;
  }

  // ── Summaries ───────────────────────────────────────────────
  const totalInvoiced    = invoices.reduce((s, i) => s + i.total, 0);
  const totalReceipts    = receipts.reduce((s, r) => s + r.amount, 0);
  const totalOutstanding = Math.max(0, totalInvoiced - totalReceipts);

  const revolBalance   = revolut?.accounts?.reduce((s, a) => s + (a.currency === "GBP" ? a.balance : 0), 0) ?? null;
  const revolTx        = revolut?.transactions ?? [];
  const revolIn        = revolTx.filter(t => (t.legs[0]?.amount ?? 0) > 0).reduce((s, t) => s + (t.legs[0]?.amount ?? 0), 0);
  const revolOut       = revolTx.filter(t => (t.legs[0]?.amount ?? 0) < 0).reduce((s, t) => s + Math.abs(t.legs[0]?.amount ?? 0), 0);

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
            <TabsTrigger value="bank"><Landmark className="h-4 w-4 mr-2" />Bank Account</TabsTrigger>
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

          {/* ── BANK ACCOUNT ── */}
          <TabsContent value="bank" className="space-y-4">
            {/* Date range + refresh */}
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                <input type="date" value={dateTo}   onChange={e => setDateTo(e.target.value)}   className="border rounded-md px-3 py-2 text-sm" />
              </div>
              <Button onClick={fetchRevolut} disabled={revoluting} className="bg-red-600 hover:bg-red-700">
                {revoluting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh
              </Button>
            </div>

            {!revolut ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>
            ) : !revolut.connected ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="py-16 text-center space-y-3">
                  <WifiOff className="h-12 w-12 text-gray-300 mx-auto" />
                  <h3 className="text-lg font-semibold text-gray-700">Revolut not connected</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Add <code className="bg-gray-100 px-1 rounded text-xs">REVOLUT_API_KEY</code> to your Vercel environment variables to enable live bank data.
                  </p>
                  <div className="text-xs text-gray-400 mt-4 space-y-1">
                    <p>1. Go to <strong>Revolut Business → Settings → Developers → API</strong></p>
                    <p>2. Generate an API key</p>
                    <p>3. Add <code className="bg-gray-100 px-1 rounded">REVOLUT_API_KEY</code> in Vercel → Settings → Environment Variables</p>
                    <p>4. Redeploy</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Account balances */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {revolut.accounts?.map(a => (
                    <Card key={a.id}>
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{a.name}</p>
                        <p className="text-2xl font-bold mt-1">{a.currency} {(a.balance / 100).toFixed(2)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${a.state === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{a.state}</span>
                      </CardContent>
                    </Card>
                  ))}
                  {revolBalance !== null && (
                    <Card className="bg-gray-900 text-white">
                      <CardContent className="p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Total GBP Balance</p>
                        <p className="text-2xl font-bold mt-1">£{(revolBalance / 100).toFixed(2)}</p>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className="flex items-center gap-1 text-green-400"><TrendingUp className="h-3 w-3" />In: £{(revolIn / 100).toFixed(2)}</span>
                          <span className="flex items-center gap-1 text-red-400"><TrendingDown className="h-3 w-3" />Out: £{(revolOut / 100).toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Transactions table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Transactions</CardTitle>
                    <CardDescription>{revolTx.length} transactions from {dateFrom} to {dateTo}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600">Description</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600">Reference</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
                            <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {revolTx.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-12 text-gray-400">No transactions in this period</td></tr>
                          ) : revolTx.map(tx => {
                            const leg    = tx.legs[0];
                            const amount = leg?.amount ?? 0;
                            const ccy    = leg?.currency ?? "GBP";
                            const desc   = leg?.description || tx.description || tx.type;
                            const date   = tx.completed_at || tx.created_at;
                            return (
                              <tr key={tx.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-600">{new Date(date).toLocaleDateString("en-GB")}</td>
                                <td className="px-4 py-3 text-gray-800 max-w-xs truncate">{desc}</td>
                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{tx.reference ?? "—"}</td>
                                <td className="px-4 py-3 text-gray-500 capitalize">{tx.type.toLowerCase().replace("_", " ")}</td>
                                <td className={`px-4 py-3 text-right font-semibold ${amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                                  {amount >= 0 ? "+" : ""}{ccy} {(amount / 100).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${tx.state === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                    {tx.state}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
