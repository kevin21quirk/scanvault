"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText, Receipt, FolderOpen, Download, ClipboardList, ShieldCheck,
  Loader2, Building2, Clock, Award, KeyRound, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Invoice {
  id: string; invoiceNumber: string; description: string; dueDate: string;
  total: number; status: string; careHomeName: string | null;
}
interface Quotation {
  id: string; quoteNumber: string; title: string; total: number; status: string;
  careHomeName: string | null; validUntil: string | null; createdAt: string;
}
interface Contract {
  id: string; title: string; status: string; totalCost: number | null;
  careHomeName: string | null; createdAt: string;
}
interface RiskAssessment {
  id: string; careHomeName: string; assessorName: string | null;
  workStartDate: string | null; createdAt: string;
}
interface CompletionCert {
  id: string; certificateNumber: string; clientName: string;
  careHomeName: string | null; completionDate: string; status: string;
  workItems: { description: string; quantity: number; unit: string }[] | null;
}
interface ReceiptItem {
  id: string; receiptNumber: string; description: string; date: string;
  amount: number; fileUrl: string | null;
}
interface DocumentItem {
  id: string; title: string; description: string | null; category: string;
  fileUrl: string; uploadedAt: string;
}

const invoiceStatusStyle = (s: string) =>
  s === "PAID" ? "bg-green-100 text-green-700" :
  s === "OVERDUE" ? "bg-red-100 text-red-700" :
  s === "CANCELLED" ? "bg-gray-100 text-gray-600" :
  "bg-yellow-100 text-yellow-700";

const quoteStatusStyle = (s: string) =>
  s === "ACCEPTED" ? "bg-green-100 text-green-700" :
  s === "DECLINED" ? "bg-red-100 text-red-700" :
  s === "SENT" ? "bg-blue-100 text-blue-700" :
  s === "EXPIRED" ? "bg-gray-100 text-gray-500" :
  "bg-gray-100 text-gray-600";

const contractStatusStyle = (s: string) =>
  s === "SIGNED" || s === "ACTIVE" ? "bg-emerald-100 text-emerald-700" :
  s === "COMPLETED" ? "bg-green-100 text-green-700" :
  s === "CANCELLED" ? "bg-red-100 text-red-700" :
  s === "SENT" ? "bg-blue-100 text-blue-700" :
  "bg-gray-100 text-gray-600";

export default function Portal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [completionCerts, setCompletionCerts] = useState<CompletionCert[]>([]);
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchAll = useCallback(async () => {
    try {
      const [invRes, quoRes, conRes, raRes, recRes, docRes, ccRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/quotations"),
        fetch("/api/contracts"),
        fetch("/api/risk-assessments"),
        fetch("/api/receipts"),
        fetch("/api/documents"),
        fetch("/api/completion-certificates"),
      ]);
      if (invRes.ok) setInvoices(await invRes.json());
      if (quoRes.ok) setQuotations(await quoRes.json());
      if (conRes.ok) setContracts(await conRes.json());
      if (raRes.ok) setRiskAssessments(await raRes.json());
      if (recRes.ok) setReceipts(await recRes.json());
      if (docRes.ok) setDocuments(await docRes.json());
      if (ccRes.ok) setCompletionCerts(await ccRes.json());
    } catch (err) {
      console.error("Error fetching portal data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchAll();
  }, [session, fetchAll]);

  const downloadPdf = async (key: string, path: string, fallbackName: string) => {
    setDownloading(key);
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = res.headers.get("Content-Disposition")?.split('filename="')[1]?.replace('"', "") ?? fallbackName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not download PDF — please try again.");
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scanvault-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-scanvault-black mb-2">
          Welcome back, {session.user?.name || session.user?.email}
        </h1>
        <p className="text-gray-600">
          Access your quotations, contracts, invoices, receipts, and archived documents
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-scanvault-red" />
        </div>
      ) : (
      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="w-full flex-wrap md:flex-nowrap overflow-x-auto">
          <TabsTrigger value="quotations">
            <ClipboardList className="h-4 w-4 mr-2" />
            Quotations
          </TabsTrigger>
          <TabsTrigger value="contracts">
            <FileText className="h-4 w-4 mr-2" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="h-4 w-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="risk-assessments">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Risk Assessments
          </TabsTrigger>
          <TabsTrigger value="completion-certificates">
            <Award className="h-4 w-4 mr-2" />
            Certificates
          </TabsTrigger>
          <TabsTrigger value="receipts">
            <Receipt className="h-4 w-4 mr-2" />
            Receipts
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FolderOpen className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="account">
            <KeyRound className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* Quotations */}
        <TabsContent value="quotations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Quotations</CardTitle>
              <CardDescription>Review and download quotations sent to you</CardDescription>
            </CardHeader>
            <CardContent>
              {quotations.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No quotations found</p>
                  <p className="text-sm text-gray-500 mt-2">Quotations will appear here once they are prepared for you</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quotations.map((q) => (
                    <div key={q.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 flex-wrap gap-3">
                      <div>
                        <p className="font-semibold">{q.quoteNumber} <span className="text-gray-400 font-normal">· {q.title}</span></p>
                        {q.careHomeName && <p className="text-sm text-gray-600 flex items-center gap-1"><Building2 className="h-3 w-3" /> {q.careHomeName}</p>}
                        {q.validUntil && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> Valid until {formatDate(q.validUntil)}</p>}
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-bold text-lg">{formatCurrency(q.total)}</p>
                          <span className={`text-xs px-2 py-1 rounded ${quoteStatusStyle(q.status)}`}>{q.status}</span>
                        </div>
                        <button
                          onClick={() => downloadPdf(q.id, `/api/quotations/${q.id}/download`, `Quotation-${q.quoteNumber}.pdf`)}
                          disabled={downloading === q.id}
                          className="text-sm text-scanvault-red hover:underline flex items-center gap-1 disabled:opacity-50"
                        >
                          {downloading === q.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts */}
        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Contracts</CardTitle>
              <CardDescription>Review and download your service agreements</CardDescription>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No contracts found</p>
                  <p className="text-sm text-gray-500 mt-2">Contracts will appear here once they are issued to you</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contracts.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 flex-wrap gap-3">
                      <div>
                        <p className="font-semibold">{c.title}</p>
                        {c.careHomeName && <p className="text-sm text-gray-600 flex items-center gap-1"><Building2 className="h-3 w-3" /> {c.careHomeName}</p>}
                        <p className="text-xs text-gray-500 mt-1">Created {formatDate(c.createdAt)}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          {c.totalCost != null && <p className="font-bold text-lg">{formatCurrency(c.totalCost)}</p>}
                          <span className={`text-xs px-2 py-1 rounded ${contractStatusStyle(c.status)}`}>{c.status}</span>
                        </div>
                        <button
                          onClick={() => downloadPdf(c.id, `/api/contracts/${c.id}/pdf`, "contract.pdf")}
                          disabled={downloading === c.id}
                          className="text-sm text-scanvault-red hover:underline flex items-center gap-1 disabled:opacity-50"
                        >
                          {downloading === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Invoices</CardTitle>
              <CardDescription>
                View and download your invoice history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No invoices found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your invoices will appear here once they are issued
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 flex-wrap gap-3"
                    >
                      <div>
                        <p className="font-semibold">{invoice.invoiceNumber}</p>
                        {invoice.careHomeName && <p className="text-sm text-gray-600 flex items-center gap-1"><Building2 className="h-3 w-3" /> {invoice.careHomeName}</p>}
                        <p className="text-sm text-gray-600">{invoice.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-bold text-lg">{formatCurrency(invoice.total)}</p>
                          <span className={`text-xs px-2 py-1 rounded ${invoiceStatusStyle(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                        <button
                          onClick={() => downloadPdf(invoice.id, `/api/invoices/${invoice.id}/download`, `Invoice-${invoice.invoiceNumber}.pdf`)}
                          disabled={downloading === invoice.id}
                          className="text-sm text-scanvault-red hover:underline flex items-center gap-1 disabled:opacity-50"
                        >
                          {downloading === invoice.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessments */}
        <TabsContent value="risk-assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Risk Assessments</CardTitle>
              <CardDescription>Site risk assessments prepared for your works</CardDescription>
            </CardHeader>
            <CardContent>
              {riskAssessments.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No risk assessments found</p>
                  <p className="text-sm text-gray-500 mt-2">Risk assessments will appear here once prepared for your site</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {riskAssessments.map((ra) => (
                    <div key={ra.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 flex-wrap gap-3">
                      <div>
                        <p className="font-semibold flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {ra.careHomeName}</p>
                        {ra.assessorName && <p className="text-sm text-gray-600">Assessor: {ra.assessorName}</p>}
                        {ra.workStartDate && <p className="text-xs text-gray-500 mt-1">Work start: {formatDate(ra.workStartDate)}</p>}
                      </div>
                      <button
                        onClick={() => downloadPdf(ra.id, `/api/risk-assessments/${ra.id}/pdf`, "risk-assessment.pdf")}
                        disabled={downloading === ra.id}
                        className="text-sm text-scanvault-red hover:underline flex items-center gap-1 disabled:opacity-50"
                      >
                        {downloading === ra.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completion Certificates */}
        <TabsContent value="completion-certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Completion Certificates</CardTitle>
              <CardDescription>Certificates confirming works carried out at your sites</CardDescription>
            </CardHeader>
            <CardContent>
              {completionCerts.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No completion certificates found</p>
                  <p className="text-sm text-gray-500 mt-2">Certificates will appear here once works have been completed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completionCerts.filter((c) => c.status === "ISSUED").map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 flex-wrap gap-3">
                      <div>
                        <p className="font-semibold">{cert.certificateNumber}</p>
                        {cert.careHomeName && (
                          <p className="text-sm text-gray-600 flex items-center gap-1"><Building2 className="h-3 w-3" /> {cert.careHomeName}</p>
                        )}
                        {cert.workItems && cert.workItems.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {cert.workItems.map((wi, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {wi.quantity} {wi.unit}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Completed: {formatDate(cert.completionDate)}</p>
                      </div>
                      <button
                        onClick={() => downloadPdf(cert.id, `/api/completion-certificates/${cert.id}/pdf`, `Certificate-${cert.certificateNumber}.pdf`)}
                        disabled={downloading === cert.id}
                        className="text-sm text-scanvault-red hover:underline flex items-center gap-1 disabled:opacity-50"
                      >
                        {downloading === cert.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />} Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipts */}
        <TabsContent value="receipts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Receipts</CardTitle>
              <CardDescription>
                Access your payment receipts and confirmations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {receipts.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No receipts found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your payment receipts will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receipts.map((receipt) => (
                    <div
                      key={receipt.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold">{receipt.receiptNumber}</p>
                        <p className="text-sm text-gray-600">{receipt.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(receipt.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(receipt.amount)}</p>
                        {receipt.fileUrl && (
                          <a href={receipt.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-scanvault-red hover:underline mt-1 flex items-center justify-end">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Documents</CardTitle>
              <CardDescription>
                Browse and download your archived documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No documents found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Your digitalized documents will appear here
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer block"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{doc.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded">{doc.category}</span>
                            <span>{formatDate(doc.uploadedAt)}</span>
                          </div>
                        </div>
                        <Download className="h-5 w-5 text-scanvault-red" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Account / Change Password */}
        <TabsContent value="account">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-scanvault-red" />
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
      )}
    </div>
  );
}

function ChangePasswordForm() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      setStatus("error");
      setMessage("New passwords do not match");
      return;
    }
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("Password changed successfully");
        setForm({ current: "", next: "", confirm: "" });
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to change password");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

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

      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{message}</p>
      )}
      {status === "success" && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />{message}
        </p>
      )}

      <Button
        type="submit"
        className="w-full bg-scanvault-red hover:bg-red-700"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Password"}
      </Button>
    </form>
  );
}
