"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, FileText, Receipt, FolderOpen, Plus, Upload, Trash2, Loader2, Download, TrendingUp, ShieldCheck, Award, LayoutDashboard, Building2, AlertCircle, CreditCard, Landmark, ClipboardList } from "lucide-react";
import LeadsTab from "@/components/leads-tab";
import ContractsTab from "@/components/contracts-tab";
import QuotationsTab from "@/components/quotations-tab";
import RiskAssessmentsTab from "@/components/risk-assessments-tab";
import ClientsTab from "@/components/clients-tab";
import CompletionCertificatesTab from "@/components/completion-certificates-tab";
import RevolutImportTab from "./revolut-import";
import SystemUsersTab from "@/components/system-users-tab";
import ExpenseReceiptsTab from "@/components/expense-receipts-tab";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  companyName: string | null;
}

interface InvoiceLineItem { description: string; quantity: number; rate: number; }

interface Invoice {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  description: string;
  items: InvoiceLineItem[] | null;
  depositPercent: number | null;
  issueDate: string;
  dueDate: string;
  status: string;
  notes: string | null;
  careHomeId: string | null;
  careHomeName: string | null;
  careHomeAddress: string | null;
  billTo: string;
  showCompanyAddress: boolean;
  vatOnBalanceOnly: boolean;
  depositPaid: boolean;
  additionalItems: InvoiceLineItem[] | null;
  user: { id: string; email: string; name: string | null };
}

interface CareHomeOption { id: string; name: string; address: string | null; }

interface ReceiptType {
  id: string;
  receiptNumber: string;
  amount: number;
  description: string;
  paymentMethod: string;
  date: string;
  user: { email: string; name: string | null };
}

interface Document {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileUrl: string;
  uploadedAt: string;
  user: { email: string; name: string | null };
}

interface SvDocument {
  id: string;
  title: string;
  description: string | null;
  category: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({ userId: "", invoiceNumber: "", vatRate: "20", depositPercent: "50", vatOnBalanceOnly: false, description: "", issueDate: "", dueDate: "", notes: "", careHomeId: "", careHomeName: "", careHomeAddress: "", billTo: "CLIENT", showCompanyAddress: true });
  const [invoiceItems, setInvoiceItems] = useState<{ description: string; quantity: string; rate: string }[]>([{ description: "", quantity: "1", rate: "" }]);
  const [additionalInvoiceItems, setAdditionalInvoiceItems] = useState<{ description: string; quantity: string; rate: string }[]>([]);
  const [invoiceCareHomeOptions, setInvoiceCareHomeOptions] = useState<CareHomeOption[]>([]);
  const [markingDeposit, setMarkingDeposit] = useState<string | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  const handleSelectInvoiceClient = (clientId: string) => {
    setInvoiceForm((prev) => ({ ...prev, userId: clientId, careHomeId: "", careHomeName: "", careHomeAddress: "" }));
    setInvoiceCareHomeOptions([]);
    if (!clientId) return;
    fetch(`/api/care-homes?userId=${clientId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: CareHomeOption[]) => setInvoiceCareHomeOptions(data))
      .catch(() => {});
  };

  const handleSelectInvoiceCareHome = (careHomeId: string) => {
    if (!careHomeId) {
      setInvoiceForm((prev) => ({ ...prev, careHomeId: "" }));
      return;
    }
    const h = invoiceCareHomeOptions.find((o) => o.id === careHomeId);
    if (!h) return;
    setInvoiceForm((prev) => ({ ...prev, careHomeId: h.id, careHomeName: h.name, careHomeAddress: h.address || prev.careHomeAddress }));
  };
  const [receiptForm, setReceiptForm] = useState({ userId: "", receiptNumber: "", amount: "", description: "", paymentMethod: "Bank Transfer", date: "" });
  const [documentForm, setDocumentForm] = useState({ userId: "", title: "", description: "", category: "OTHER", fileUrl: "" });

  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<string | null>(null);
  const [deletingReceipt, setDeletingReceipt] = useState<string | null>(null);
  const [svDocuments, setSvDocuments] = useState<SvDocument[]>([]);
  const [showSvDocumentModal, setShowSvDocumentModal] = useState(false);
  const [svDocumentForm, setSvDocumentForm] = useState({ title: "", description: "", category: "GENERAL", fileUrl: "" });
  const [deletingSvDocument, setDeletingSvDocument] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchNextInvoiceNumber = async () => {
    try {
      const res = await fetch("/api/invoices/next-number");
      if (res.ok) {
        const data = await res.json();
        setInvoiceForm(prev => ({ ...prev, invoiceNumber: data.invoiceNumber }));
      }
    } catch (error) {
      console.error("Error fetching next invoice number:", error);
    }
  };

  const handleOpenInvoiceModal = () => {
    setEditingInvoiceId(null);
    setInvoiceForm({ userId: "", invoiceNumber: "", vatRate: "20", depositPercent: "50", vatOnBalanceOnly: false, description: "", issueDate: "", dueDate: "", notes: "", careHomeId: "", careHomeName: "", careHomeAddress: "", billTo: "CLIENT", showCompanyAddress: true });
    setInvoiceItems([{ description: "", quantity: "1", rate: "" }]);
    setAdditionalInvoiceItems([]);
    setInvoiceCareHomeOptions([]);
    setShowInvoiceModal(true);
    fetchNextInvoiceNumber();
  };

  const handleMarkDepositPaid = async (invoiceId: string) => {
    if (!confirm("Mark the deposit for this invoice as paid? A receipt will be created automatically.")) return;
    setMarkingDeposit(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/mark-deposit-paid`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setInvoices((prev) => prev.map((inv) => inv.id === invoiceId ? { ...inv, depositPaid: true } : inv));
        setReceipts((prev) => [data.receipt, ...prev]);
        alert(`Deposit receipt ${data.receipt.receiptNumber} created successfully.`);
      } else {
        alert(data.error || "Failed to mark deposit as paid");
      }
    } catch {
      alert("Failed to mark deposit as paid");
    } finally {
      setMarkingDeposit(null);
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoiceId(invoice.id);
    setInvoiceForm({
      userId: invoice.user.id,
      invoiceNumber: invoice.invoiceNumber,
      vatRate: String(invoice.vatRate),
      depositPercent: invoice.depositPercent != null ? String(invoice.depositPercent) : "50",
      vatOnBalanceOnly: invoice.vatOnBalanceOnly === true,
      description: "",
      issueDate: invoice.issueDate.slice(0, 10),
      dueDate: invoice.dueDate.slice(0, 10),
      notes: invoice.notes || "",
      careHomeId: invoice.careHomeId || "",
      careHomeName: invoice.careHomeName || "",
      careHomeAddress: invoice.careHomeAddress || "",
      billTo: invoice.billTo || "CLIENT",
      showCompanyAddress: invoice.showCompanyAddress !== false,
    });
    setInvoiceItems(
      invoice.items && invoice.items.length
        ? invoice.items.map((it) => ({ description: it.description, quantity: String(it.quantity), rate: String(it.rate) }))
        : [{ description: "", quantity: "1", rate: "" }]
    );
    setAdditionalInvoiceItems(
      (invoice as any).additionalItems && (invoice as any).additionalItems.length
        ? (invoice as any).additionalItems.map((it: any) => ({ description: it.description, quantity: String(it.quantity), rate: String(it.rate) }))
        : []
    );
    setInvoiceCareHomeOptions([]);
    fetch(`/api/care-homes?userId=${invoice.user.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: CareHomeOption[]) => setInvoiceCareHomeOptions(data))
      .catch(() => {});
    setShowInvoiceModal(true);
  };

  const fetchData = async () => {
    try {
      const [usersRes, invoicesRes, receiptsRes, documentsRes, svDocsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/invoices"),
        fetch("/api/receipts"),
        fetch("/api/documents"),
        fetch("/api/scanvault-documents"),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (invoicesRes.ok) setInvoices(await invoicesRes.json());
      if (receiptsRes.ok) setReceipts(await receiptsRes.json());
      if (documentsRes.ok) setDocuments(await documentsRes.json());
      if (svDocsRes.ok) setSvDocuments(await svDocsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(
        editingInvoiceId ? `/api/invoices/${editingInvoiceId}` : "/api/invoices",
        {
          method: editingInvoiceId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...invoiceForm, items: invoiceItems, additionalItems: additionalInvoiceItems }),
        }
      );

      const wasEditing = !!editingInvoiceId;
      if (res.ok) {
        const savedInvoice = await res.json();
        setInvoices(
          wasEditing
            ? invoices.map((inv) => (inv.id === editingInvoiceId ? savedInvoice : inv))
            : [savedInvoice, ...invoices]
        );
        setShowInvoiceModal(false);
        setEditingInvoiceId(null);
        setInvoiceForm({ userId: "", invoiceNumber: "", vatRate: "20", depositPercent: "50", vatOnBalanceOnly: false, description: "", issueDate: "", dueDate: "", notes: "", careHomeId: "", careHomeName: "", careHomeAddress: "", billTo: "CLIENT", showCompanyAddress: true });
        setInvoiceItems([{ description: "", quantity: "1", rate: "" }]);
        setAdditionalInvoiceItems([]);
        setInvoiceCareHomeOptions([]);
        alert(wasEditing ? "Invoice updated successfully!" : "Invoice created successfully!");
      } else {
        const error = await res.json();
        alert(error.error || `Failed to ${wasEditing ? "update" : "create"} invoice`);
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert(`Failed to ${!!editingInvoiceId ? "update" : "create"} invoice`);
    } finally {
      setSubmitting(false);
    }
  };

  const addInvoiceItem = () => setInvoiceItems((p) => [...p, { description: "", quantity: "1", rate: "" }]);
  const removeInvoiceItem = (idx: number) => setInvoiceItems((p) => p.filter((_, i) => i !== idx));
  const updateInvoiceItem = (idx: number, key: "description" | "quantity" | "rate", value: string) =>
    setInvoiceItems((p) => p.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));

  const addAdditionalItem = () => setAdditionalInvoiceItems((p) => [...p, { description: "", quantity: "1", rate: "" }]);
  const removeAdditionalItem = (idx: number) => setAdditionalInvoiceItems((p) => p.filter((_, i) => i !== idx));
  const updateAdditionalItem = (idx: number, key: "description" | "quantity" | "rate", value: string) =>
    setAdditionalInvoiceItems((p) => p.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    setUpdatingStatus(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Update invoice in state
        setInvoices(invoices.map(inv => 
          inv.id === invoiceId ? data.invoice : inv
        ));

        // If receipt was generated, add it to receipts list
        if (data.receipt) {
          setReceipts([data.receipt, ...receipts]);
        }

        alert(data.message);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    setDeletingInvoice(id);
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInvoices(invoices.filter(inv => inv.id !== id));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice");
    } finally {
      setDeletingInvoice(null);
    }
  };

  const handleUploadSvDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/scanvault-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...svDocumentForm, fileSize: 0, mimeType: "application/pdf" }),
      });
      if (res.ok) {
        const newDoc = await res.json();
        setSvDocuments((prev) => [newDoc, ...prev]);
        setShowSvDocumentModal(false);
        setSvDocumentForm({ title: "", description: "", category: "GENERAL", fileUrl: "" });
        alert("Document uploaded successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to upload document");
      }
    } catch {
      alert("Failed to upload document");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSvDocument = async (id: string) => {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    setDeletingSvDocument(id);
    try {
      const res = await fetch(`/api/scanvault-documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSvDocuments((prev) => prev.filter((d) => d.id !== id));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete document");
      }
    } catch {
      alert("Failed to delete document");
    } finally {
      setDeletingSvDocument(null);
    }
  };

  const handleDeleteReceipt = async (id: string) => {
    if (!confirm("Delete this receipt? This cannot be undone.")) return;
    setDeletingReceipt(id);
    try {
      const res = await fetch(`/api/receipts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReceipts(receipts.filter(r => r.id !== id));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete receipt");
      }
    } catch (error) {
      console.error("Error deleting receipt:", error);
      alert("Failed to delete receipt");
    } finally {
      setDeletingReceipt(null);
    }
  };

  const handleCreateReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receiptForm),
      });

      if (res.ok) {
        const newReceipt = await res.json();
        setReceipts([newReceipt, ...receipts]);
        setShowReceiptModal(false);
        setReceiptForm({ userId: "", receiptNumber: "", amount: "", description: "", paymentMethod: "Bank Transfer", date: "" });
        alert("Receipt created successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create receipt");
      }
    } catch (error) {
      console.error("Error creating receipt:", error);
      alert("Failed to create receipt");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // For now, we'll use a placeholder URL. In production, you'd upload to cloud storage
      const documentData = {
        ...documentForm,
        fileUrl: documentForm.fileUrl || "https://example.com/document.pdf",
        fileSize: 1024,
        mimeType: "application/pdf",
      };

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documentData),
      });

      if (res.ok) {
        const newDocument = await res.json();
        setDocuments([newDocument, ...documents]);
        setShowDocumentModal(false);
        setDocumentForm({ userId: "", title: "", description: "", category: "OTHER", fileUrl: "" });
        alert("Document uploaded successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to upload document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-scanvault-red" />
      </div>
    );
  }

  const clientUsers = users.filter(u => u.role === "CLIENT");

  // Live invoice totals (for the create-invoice modal preview)
  const invOrigSubtotal = invoiceItems.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.rate) || 0), 0);
  const invAddlSubtotal = additionalInvoiceItems.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.rate) || 0), 0);
  const invSubtotal = invOrigSubtotal + invAddlSubtotal;
  const invVatRate = parseFloat(invoiceForm.vatRate) || 0;
  const invDepositPct = parseFloat(invoiceForm.depositPercent) || 0;
  const invVatBase = invoiceForm.vatOnBalanceOnly
    ? (invOrigSubtotal * (1 - invDepositPct / 100)) + invAddlSubtotal
    : invSubtotal;
  const invVat = invVatBase * invVatRate / 100;
  const invTotal = invSubtotal + invVat;
  const invDeposit = invoiceForm.vatOnBalanceOnly
    ? invOrigSubtotal * (invDepositPct / 100)
    : invTotal * (invDepositPct / 100);
  const invBalance = invTotal - invDeposit;

  // Deposit amount per invoice (matches invoice PDF)
  const getDeposit = (invoice: Invoice): number => {
    const pct = invoice.depositPercent ?? 50;
    const addl = (invoice.additionalItems || []) as InvoiceLineItem[];
    const addlSubtotal = addl.reduce((sum, it) => sum + (it.quantity || 0) * (it.rate || 0), 0);
    const originalSubtotal = addlSubtotal > 0 ? invoice.subtotal - addlSubtotal : invoice.subtotal;
    return invoice.vatOnBalanceOnly
      ? originalSubtotal * (pct / 100)
      : invoice.total * (pct / 100);
  };

  // Revenue totals — paid invoices + paid deposits on unpaid invoices
  const paidInvoices = invoices.filter(i => i.status === "PAID");
  const pendingInvoices = invoices.filter(i => i.status !== "PAID" && i.status !== "CANCELLED");
  const totalReceived = paidInvoices.reduce((a, i) => a + i.total, 0) + pendingInvoices.filter(i => i.depositPaid).reduce((a, i) => a + getDeposit(i), 0);
  const totalOutstanding = pendingInvoices.reduce((a, i) => a + i.total, 0) - pendingInvoices.filter(i => i.depositPaid).reduce((a, i) => a + getDeposit(i), 0);
  const totalInvoiced = invoices.reduce((a, i) => a + i.total, 0);

  // Calculate overdue invoices
  const overdueInvoices = invoices.filter(invoice => {
    if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') return false;
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <div className="flex gap-6 items-start">
          {/* ── Sidebar navigation ── */}
          <aside className="w-56 shrink-0 rounded-2xl bg-slate-900 p-3">
            <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-0.5">

              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] px-2 pt-3 pb-1">Main</span>
              <TabsTrigger value="overview" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <LayoutDashboard className="h-4 w-4 shrink-0" /> Overview
              </TabsTrigger>

              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] px-2 pt-3 pb-1">People</span>
              <TabsTrigger value="clients" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <Building2 className="h-4 w-4 shrink-0" /> Clients
              </TabsTrigger>
              <TabsTrigger value="system-users" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <Users className="h-4 w-4 shrink-0" /> Users
              </TabsTrigger>

              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] px-2 pt-3 pb-1">Finance</span>
              <TabsTrigger value="invoices" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <FileText className="h-4 w-4 shrink-0" /> Invoices
              </TabsTrigger>
              <TabsTrigger value="overdue" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <AlertCircle className="h-4 w-4 shrink-0" /> <span className="flex-1 text-left">Overdue</span>
                {overdueInvoices.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shrink-0 font-bold">
                    {overdueInvoices.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="receipts" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <Receipt className="h-4 w-4 shrink-0" /> Receipts
              </TabsTrigger>
              <TabsTrigger value="expense-receipts" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <CreditCard className="h-4 w-4 shrink-0" /> Expenses
              </TabsTrigger>
              <TabsTrigger value="bank-import" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <Landmark className="h-4 w-4 shrink-0" /> Bank Import
              </TabsTrigger>

              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] px-2 pt-3 pb-1">Documents</span>
              <TabsTrigger value="documents" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <FolderOpen className="h-4 w-4 shrink-0" /> Client Docs
              </TabsTrigger>
              <TabsTrigger value="scanvault-docs" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <FolderOpen className="h-4 w-4 shrink-0" /> ScanVault Docs
              </TabsTrigger>

              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] px-2 pt-3 pb-1">Sales</span>
              <TabsTrigger value="leads" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <TrendingUp className="h-4 w-4 shrink-0" /> Leads &amp; Quotes
              </TabsTrigger>
              <TabsTrigger value="quotations" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <ClipboardList className="h-4 w-4 shrink-0" /> Quotations
              </TabsTrigger>
              <TabsTrigger value="contracts" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <FileText className="h-4 w-4 shrink-0" /> Contracts
              </TabsTrigger>

              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] px-2 pt-3 pb-1">Compliance</span>
              <TabsTrigger value="risk-assessments" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <ShieldCheck className="h-4 w-4 shrink-0" /> Risk Assessments
              </TabsTrigger>
              <TabsTrigger value="completion-certificates" className="w-full justify-start gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors data-[state=active]:bg-scanvault-red data-[state=active]:text-white data-[state=active]:shadow-none">
                <Award className="h-4 w-4 shrink-0" /> Completion Certs
              </TabsTrigger>

            </TabsList>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

        <TabsContent value="overview" className="space-y-5">

          {/* KPI stat cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-2xl bg-blue-50 border border-blue-100 p-2.5">
                    <Building2 className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">Clients</span>
                </div>
                <p className="text-4xl font-black text-gray-900 tracking-tight">{clientUsers.length}</p>
                <p className="text-sm font-medium text-gray-400 mt-1.5">Registered clients</p>
                <p className="text-xs text-gray-300 mt-0.5">{users.length} total system users</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-2xl bg-amber-50 border border-amber-100 p-2.5">
                    <FileText className="h-5 w-5 text-amber-500" />
                  </div>
                  {overdueInvoices.length > 0 ? (
                    <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">{overdueInvoices.length} overdue</span>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">All clear</span>
                  )}
                </div>
                <p className="text-4xl font-black text-gray-900 tracking-tight">{invoices.length}</p>
                <p className="text-sm font-medium text-gray-400 mt-1.5">Total invoices</p>
                <p className="text-xs text-gray-300 mt-0.5">{invoices.filter(i => i.status === "PAID").length} paid to date</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-2.5">
                    <Receipt className="h-5 w-5 text-emerald-500" />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Issued</span>
                </div>
                <p className="text-4xl font-black text-gray-900 tracking-tight">{receipts.length}</p>
                <p className="text-sm font-medium text-gray-400 mt-1.5">Payment receipts</p>
                <p className="text-xs text-gray-300 mt-0.5">Issued to clients</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-2xl bg-violet-50 border border-violet-100 p-2.5">
                    <FolderOpen className="h-5 w-5 text-violet-500" />
                  </div>
                  <span className="text-[11px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">Archived</span>
                </div>
                <p className="text-4xl font-black text-gray-900 tracking-tight">{documents.length}</p>
                <p className="text-sm font-medium text-gray-400 mt-1.5">Client documents</p>
                <p className="text-xs text-gray-300 mt-0.5">Secure archive</p>
              </CardContent>
            </Card>

          </div>

          {/* Revenue summary */}
          <div className="grid sm:grid-cols-3 gap-4">

            <Card className="sm:col-span-2 border border-gray-100 shadow-sm bg-white">
              <CardContent className="p-6">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-5">Revenue Overview</p>
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                  <div className="pr-6">
                    <p className="text-2xl font-black text-gray-900 tracking-tight">
                      £{totalReceived.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs font-semibold text-emerald-500 mt-1.5 flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" /> Total Received
                    </p>
                  </div>
                  <div className="px-6">
                    <p className="text-2xl font-black text-gray-900 tracking-tight">
                      £{totalOutstanding.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs font-semibold text-amber-500 mt-1.5 flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" /> Outstanding
                    </p>
                  </div>
                  <div className="pl-6">
                    <p className="text-2xl font-black text-gray-900 tracking-tight">
                      £{totalInvoiced.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs font-semibold text-gray-400 mt-1.5 flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-300" /> Total Invoiced
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-slate-900 text-white">
              <CardContent className="p-6 flex flex-col h-full">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-3">Overdue Balance</p>
                <p className="text-3xl font-black text-white tracking-tight mt-1">
                  £{overdueInvoices.reduce((a, i) => a + i.total, 0).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  {overdueInvoices.length === 0 ? "No overdue invoices — great work!" : `${overdueInvoices.length} invoice${overdueInvoices.length > 1 ? "s" : ""} past due date`}
                </p>
                <div className="mt-auto pt-4 border-t border-slate-800">
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest">Requires attention</p>
                </div>
              </CardContent>
            </Card>

          </div>

        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-scanvault-red" />
            <h2 className="text-2xl font-bold">Clients</h2>
          </div>
          <ClientsTab />
        </TabsContent>

        <TabsContent value="system-users" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-scanvault-red" />
            <h2 className="text-xl sm:text-2xl font-bold">System Users</h2>
          </div>
          <SystemUsersTab />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold">Invoice Management</h2>
            <Button onClick={handleOpenInvoiceModal} className="bg-scanvault-red hover:bg-red-700 shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              {invoices.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No invoices yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4 space-y-3">
                      {/* Top row: info left, total+status right */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-600 truncate">{invoice.user.email}{invoice.careHomeName ? ` · ${invoice.careHomeName}` : ""}</p>
                          <p className="text-sm text-gray-600">{invoice.description}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Subtotal: £{invoice.subtotal.toFixed(2)}</p>
                            {invoice.vatRate > 0 && (
                              <p>VAT ({invoice.vatRate}%): £{invoice.vatAmount.toFixed(2)}</p>
                            )}
                            {invoice.depositPercent && invoice.depositPercent > 0 && (
                              <p className="mt-1">
                                Deposit ({invoice.depositPercent}%): £{(invoice.total * invoice.depositPercent / 100).toFixed(2)}
                                {invoice.depositPaid
                                  ? <span className="ml-2 inline-flex items-center gap-1 text-green-700 font-medium">✓ Paid</span>
                                  : <span className="ml-2 text-yellow-600">Unpaid</span>
                                }
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-lg">£{invoice.total.toFixed(2)}</p>
                          <div className="mt-1">
                            <select
                              value={invoice.status}
                              onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                              disabled={updatingStatus === invoice.id}
                              className={`text-sm px-2 py-1 border rounded w-full ${
                                invoice.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-300' :
                                invoice.status === 'DEPOSIT_PAID' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                invoice.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                                'bg-red-50 text-red-700 border-red-300'
                              }`}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="DEPOSIT_PAID">Pending - Dep Paid</option>
                              <option value="PAID">Paid</option>
                              <option value="OVERDUE">Overdue</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      {/* Bottom row: action buttons — wrap on mobile */}
                      <div className="flex flex-wrap gap-2">
                        {invoice.depositPercent && invoice.depositPercent > 0 && !invoice.depositPaid && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => handleMarkDepositPaid(invoice.id)}
                            disabled={markingDeposit === invoice.id}
                          >
                            {markingDeposit === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deposit Paid"}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleEditInvoice(invoice)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/api/invoices/${invoice.id}/download`, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          disabled={deletingInvoice === invoice.id}
                        >
                          {deletingInvoice === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {showInvoiceModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl max-h-[92vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>{editingInvoiceId ? "Edit Invoice" : "Create New Invoice"}</CardTitle>
                    <CardDescription>{editingInvoiceId ? "Update the invoice details" : "Generate an invoice for a client"}</CardDescription>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowInvoiceModal(false); setEditingInvoiceId(null); }}
                    className="text-gray-400 hover:text-gray-700 ml-4 mt-1"
                  >
                    <span className="sr-only">Close</span>
                    ✕
                  </button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateInvoice} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client">Client *</Label>
                        <select id="client" required className="w-full px-3 py-2 border rounded-md" value={invoiceForm.userId} onChange={(e) => handleSelectInvoiceClient(e.target.value)}>
                          <option value="">Select client...</option>
                          {clientUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.companyName || user.name || user.email}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="invoiceNumber">Invoice Number (Auto-generated)</Label>
                        <Input id="invoiceNumber" required value={invoiceForm.invoiceNumber} readOnly className="bg-gray-50" placeholder="Loading..." />
                      </div>
                    </div>

                    {invoiceCareHomeOptions.length > 0 && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="careHome">Care Home / Site <span className="text-gray-400 font-normal">(select which site this invoice is for)</span></Label>
                          <select id="careHome" className="w-full px-3 py-2 border rounded-md" value={invoiceForm.careHomeId} onChange={(e) => handleSelectInvoiceCareHome(e.target.value)}>
                            <option value="">— Not site-specific —</option>
                            {invoiceCareHomeOptions.map((h) => (
                              <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                          </select>
                        </div>

                        {invoiceForm.careHomeId && (
                          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Bill To</Label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="billTo"
                                  value="CLIENT"
                                  checked={invoiceForm.billTo === "CLIENT"}
                                  onChange={() => setInvoiceForm((p) => ({ ...p, billTo: "CLIENT" }))}
                                  className="accent-red-600"
                                />
                                <span className="text-sm">
                                  <span className="font-medium">Client</span>
                                  <span className="text-gray-500 ml-1">({clientUsers.find(u => u.id === invoiceForm.userId)?.companyName || clientUsers.find(u => u.id === invoiceForm.userId)?.name || "main account"})</span>
                                </span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="billTo"
                                  value="CARE_HOME"
                                  checked={invoiceForm.billTo === "CARE_HOME"}
                                  onChange={() => setInvoiceForm((p) => ({ ...p, billTo: "CARE_HOME" }))}
                                  className="accent-red-600"
                                />
                                <span className="text-sm">
                                  <span className="font-medium">Care Home</span>
                                  <span className="text-gray-500 ml-1">({invoiceCareHomeOptions.find(h => h.id === invoiceForm.careHomeId)?.name || "selected site"})</span>
                                </span>
                              </label>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Controls whose name and address appears in the "BILL TO" section of the PDF.</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Issue Date *</Label>
                        <Input id="date" type="date" required value={invoiceForm.issueDate} onChange={(e) => setInvoiceForm({...invoiceForm, issueDate: e.target.value})} />
                      </div>
                      <div>
                        <Label htmlFor="dueDate">Due Date *</Label>
                        <Input id="dueDate" type="date" required value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})} />
                      </div>
                    </div>

                    {/* Line items */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Line Items *</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addInvoiceItem} className="h-7 text-xs">
                          <Plus className="h-3 w-3 mr-1" /> Add item
                        </Button>
                      </div>
                      <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-gray-500 px-1 mb-1">
                        <span className="col-span-6">Description</span>
                        <span className="col-span-2 text-center">Qty</span>
                        <span className="col-span-2 text-right">Unit Price (£)</span>
                        <span className="col-span-2 text-right">Amount</span>
                      </div>
                      <div className="space-y-2">
                        {invoiceItems.map((it, idx) => {
                          const amt = (parseFloat(it.quantity) || 0) * (parseFloat(it.rate) || 0);
                          return (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                              <Input className="col-span-6" placeholder="e.g. Scanning & archiving of 83 archive boxes" value={it.description} onChange={(e) => updateInvoiceItem(idx, "description", e.target.value)} />
                              <Input className="col-span-2 text-center" type="number" min="0" step="1" value={it.quantity} onChange={(e) => updateInvoiceItem(idx, "quantity", e.target.value)} />
                              <Input className="col-span-2 text-right" type="number" min="0" step="0.01" placeholder="0.00" value={it.rate} onChange={(e) => updateInvoiceItem(idx, "rate", e.target.value)} />
                              <div className="col-span-2 flex items-center justify-end gap-2">
                                <span className="text-sm tabular-nums">£{amt.toFixed(2)}</span>
                                {invoiceItems.length > 1 && (
                                  <button type="button" onClick={() => removeInvoiceItem(idx)} className="text-gray-400 hover:text-red-600">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Additional Works */}
                    <div className="rounded-md border-2 border-dashed border-amber-300 bg-amber-50/40 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <Label className="text-amber-800 font-semibold">Additional Works</Label>
                          <p className="text-xs text-amber-600 mt-0.5">Extra items not in the original quote — shown as a separate section on the invoice.</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addAdditionalItem} className="h-7 text-xs border-amber-400 text-amber-800 hover:bg-amber-100">
                          <Plus className="h-3 w-3 mr-1" /> Add item
                        </Button>
                      </div>
                      {additionalInvoiceItems.length === 0 ? (
                        <p className="text-xs text-amber-500 italic text-center py-2">No additional items — click "Add item" to add extra works.</p>
                      ) : (
                        <>
                          <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-gray-500 px-1 mb-1">
                            <span className="col-span-6">Description</span>
                            <span className="col-span-2 text-center">Qty</span>
                            <span className="col-span-2 text-right">Unit Price (£)</span>
                            <span className="col-span-2 text-right">Amount</span>
                          </div>
                          <div className="space-y-2">
                            {additionalInvoiceItems.map((it, idx) => {
                              const amt = (parseFloat(it.quantity) || 0) * (parseFloat(it.rate) || 0);
                              return (
                                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                  <Input className="col-span-6" placeholder="e.g. Additional 12 archive boxes discovered on site" value={it.description} onChange={(e) => updateAdditionalItem(idx, "description", e.target.value)} />
                                  <Input className="col-span-2 text-center" type="number" min="0" step="1" value={it.quantity} onChange={(e) => updateAdditionalItem(idx, "quantity", e.target.value)} />
                                  <Input className="col-span-2 text-right" type="number" min="0" step="0.01" placeholder="0.00" value={it.rate} onChange={(e) => updateAdditionalItem(idx, "rate", e.target.value)} />
                                  <div className="col-span-2 flex items-center justify-end gap-2">
                                    <span className="text-sm tabular-nums">£{amt.toFixed(2)}</span>
                                    <button type="button" onClick={() => removeAdditionalItem(idx)} className="text-gray-400 hover:text-red-600">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vatRate">VAT Rate (%)</Label>
                        <Input id="vatRate" type="number" step="0.01" value={invoiceForm.vatRate} onChange={(e) => setInvoiceForm({...invoiceForm, vatRate: e.target.value})} placeholder="0" />
                        <p className="text-xs text-gray-500 mt-1">Standard UK rate 20%. Set to 0 to exclude VAT.</p>
                      </div>
                      <div>
                        <Label htmlFor="depositPercent">Deposit Payable Upfront (%) *</Label>
                        <Input id="depositPercent" type="number" step="1" min="0" max="100" required value={invoiceForm.depositPercent} onChange={(e) => setInvoiceForm({...invoiceForm, depositPercent: e.target.value})} placeholder="50" />
                      </div>
                    </div>

                    {/* Totals preview */}
                    <div className="rounded-md border bg-gray-50 p-3 text-sm space-y-1">
                      {invAddlSubtotal > 0 ? (
                        <>
                          <div className="flex justify-between text-gray-500"><span>Original works</span><span className="tabular-nums">£{invOrigSubtotal.toFixed(2)}</span></div>
                          <div className="flex justify-between text-amber-700"><span>Additional works</span><span className="tabular-nums">£{invAddlSubtotal.toFixed(2)}</span></div>
                          <div className="flex justify-between font-medium border-t border-gray-200 pt-1"><span className="text-gray-600">Subtotal</span><span className="tabular-nums">£{invSubtotal.toFixed(2)}</span></div>
                        </>
                      ) : (
                        <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="tabular-nums">£{invSubtotal.toFixed(2)}</span></div>
                      )}
                      {invVatRate > 0 && (
                        <div className="flex justify-between"><span className="text-gray-600">
                          {invoiceForm.vatOnBalanceOnly
                            ? `VAT (${invoiceForm.vatRate}% on balance of £${((invOrigSubtotal * (1 - invDepositPct/100)) + invAddlSubtotal).toFixed(2)})`
                            : `VAT (${invoiceForm.vatRate}%)`}
                        </span><span className="tabular-nums">£{invVat.toFixed(2)}</span></div>
                      )}
                      <div className="flex justify-between font-semibold border-t pt-1"><span>Total Due</span><span className="tabular-nums">£{invTotal.toFixed(2)}</span></div>
                      <div className="flex justify-between text-scanvault-red">
                        <span>{invoiceForm.vatOnBalanceOnly ? `Deposit (${invoiceForm.depositPercent || 0}%) — already paid (no VAT)` : `Deposit due upfront (${invoiceForm.depositPercent || 0}%)`}</span>
                        <span className="tabular-nums">£{invDeposit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600"><span>{invoiceForm.vatOnBalanceOnly ? "Balance + VAT (net 30 days after completion)" : "Balance (net 30 days after completion)"}</span><span className="tabular-nums">£{invBalance.toFixed(2)}</span></div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <textarea id="notes" className="w-full px-3 py-2 border rounded-md" rows={2} value={invoiceForm.notes} onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})} placeholder="Bank/payment details, PO number, or other notes shown on the invoice..."></textarea>
                    </div>
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={invoiceForm.showCompanyAddress}
                          onChange={(e) => setInvoiceForm((p) => ({ ...p, showCompanyAddress: e.target.checked }))}
                          className="h-4 w-4 accent-red-600"
                        />
                        <span className="text-sm">
                          <span className="font-medium">Include registered company address</span>
                          <span className="block text-xs text-gray-400">77 Church Street, Burton Latimer, Kettering, England, NN15 5LU</span>
                        </span>
                      </label>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={invoiceForm.vatOnBalanceOnly}
                          onChange={(e) => setInvoiceForm((p) => ({ ...p, vatOnBalanceOnly: e.target.checked }))}
                          className="h-4 w-4 mt-0.5 accent-red-600"
                        />
                        <span className="text-sm">
                          <span className="font-medium">Apply VAT to remaining balance only</span>
                          <span className="block text-xs text-gray-400">Use when the deposit was already paid before VAT registration. VAT will be charged on the unpaid balance only, not the full invoice amount.</span>
                        </span>
                      </label>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowInvoiceModal(false)}>Cancel</Button>
                      <Button type="submit" className="bg-scanvault-red hover:bg-red-700" disabled={submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingInvoiceId ? "Update Invoice" : "Create Invoice"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-red-600">Overdue Invoices</h2>
              <p className="text-sm text-gray-600 mt-1">Invoices past their due date that require attention</p>
            </div>
            {overdueInvoices.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                <p className="text-red-700 font-semibold">{overdueInvoices.length} Overdue Invoice{overdueInvoices.length !== 1 ? 's' : ''}</p>
              </div>
            )}
          </div>
          <Card>
            <CardContent className="pt-6">
              {overdueInvoices.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-semibold text-green-600">No overdue invoices!</p>
                  <p className="text-sm mt-2">All invoices are up to date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {overdueInvoices.map((invoice) => {
                    const dueDate = new Date(invoice.dueDate);
                    const today = new Date();
                    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={invoice.id} className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">{invoice.invoiceNumber}</p>
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{invoice.user.email}{invoice.careHomeName ? ` · ${invoice.careHomeName}` : ""}</p>
                            <p className="text-sm text-gray-600">{invoice.description}</p>
                            <div className="mt-2 text-xs text-gray-600">
                              <p>Due Date: <span className="font-semibold text-red-600">{new Date(invoice.dueDate).toLocaleDateString('en-GB')}</span></p>
                              <p className="mt-1">Subtotal: £{invoice.subtotal.toFixed(2)}</p>
                              {invoice.vatRate > 0 && (
                                <p>VAT ({invoice.vatRate}%): £{invoice.vatAmount.toFixed(2)}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <div>
                              <p className="font-bold text-xl text-red-700">£{invoice.total.toFixed(2)}</p>
                              <div className="mt-1">
                                <select
                                  value={invoice.status}
                                  onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                                  disabled={updatingStatus === invoice.id}
                                  className="text-sm px-2 py-1 border rounded bg-red-100 text-red-700 border-red-300"
                                >
                                  <option value="PENDING">Pending</option>
                                  <option value="DEPOSIT_PAID">Pending - Dep Paid</option>
                                  <option value="PAID">Paid</option>
                                  <option value="OVERDUE">Overdue</option>
                                  <option value="CANCELLED">Cancelled</option>
                                </select>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-700 hover:bg-red-100"
                              onClick={() => window.open(`/api/invoices/${invoice.id}/download`, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
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
        </TabsContent>

        <TabsContent value="receipts" className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold">Receipt Management</h2>
            <Button onClick={() => setShowReceiptModal(true)} className="bg-scanvault-red hover:bg-red-700 shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Create Receipt
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              {receipts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No receipts yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receipts.map((receipt) => (
                    <div key={receipt.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{receipt.receiptNumber}</p>
                          <p className="text-sm text-gray-600 truncate">{receipt.user.email}</p>
                          <p className="text-sm text-gray-600">{receipt.description}</p>
                          <p className="text-sm text-gray-600">{receipt.paymentMethod}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-lg">£{receipt.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">{new Date(receipt.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/api/receipts/${receipt.id}/download`, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => handleDeleteReceipt(receipt.id)}
                          disabled={deletingReceipt === receipt.id}
                        >
                          {deletingReceipt === receipt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {showReceiptModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl max-h-[92vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Create New Receipt</CardTitle>
                  <CardDescription>Generate a payment receipt</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateReceipt} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="receiptClient">Client *</Label>
                        <select id="receiptClient" required className="w-full px-3 py-2 border rounded-md" value={receiptForm.userId} onChange={(e) => setReceiptForm({...receiptForm, userId: e.target.value})}>
                          <option value="">Select client...</option>
                          {clientUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.email}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="receiptNumber">Receipt Number *</Label>
                        <Input id="receiptNumber" required value={receiptForm.receiptNumber} onChange={(e) => setReceiptForm({...receiptForm, receiptNumber: e.target.value})} placeholder="REC-001" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paymentDate">Payment Date *</Label>
                        <Input id="paymentDate" type="date" required value={receiptForm.date} onChange={(e) => setReceiptForm({...receiptForm, date: e.target.value})} />
                      </div>
                      <div>
                        <Label htmlFor="paymentMethod">Payment Method *</Label>
                        <select id="paymentMethod" className="w-full px-3 py-2 border rounded-md" value={receiptForm.paymentMethod} onChange={(e) => setReceiptForm({...receiptForm, paymentMethod: e.target.value})}>
                          <option>Bank Transfer</option>
                          <option>Credit Card</option>
                          <option>Cash</option>
                          <option>Cheque</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="receiptDescription">Description *</Label>
                      <textarea id="receiptDescription" required className="w-full px-3 py-2 border rounded-md" rows={2} value={receiptForm.description} onChange={(e) => setReceiptForm({...receiptForm, description: e.target.value})} placeholder="Payment for..."></textarea>
                    </div>
                    <div>
                      <Label htmlFor="receiptAmount">Amount (£) *</Label>
                      <Input id="receiptAmount" type="number" step="0.01" required value={receiptForm.amount} onChange={(e) => setReceiptForm({...receiptForm, amount: e.target.value})} placeholder="0.00" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowReceiptModal(false)}>Cancel</Button>
                      <Button type="submit" className="bg-scanvault-red hover:bg-red-700" disabled={submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Receipt"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold">Document Management</h2>
            <Button onClick={() => setShowDocumentModal(true)} className="bg-scanvault-red hover:bg-red-700 shrink-0">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              {documents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No documents yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{doc.title}</p>
                          <p className="text-sm text-gray-600 truncate">{doc.user.email}</p>
                          <p className="text-sm text-gray-600">{doc.category}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm text-gray-600">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {showDocumentModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl max-h-[92vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Upload Document</CardTitle>
                  <CardDescription>Upload a document for a client</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUploadDocument} className="space-y-4">
                    <div>
                      <Label htmlFor="docClient">Client *</Label>
                      <select id="docClient" required className="w-full px-3 py-2 border rounded-md" value={documentForm.userId} onChange={(e) => setDocumentForm({...documentForm, userId: e.target.value})}>
                        <option value="">Select client...</option>
                        {clientUsers.map(user => (
                          <option key={user.id} value={user.id}>{user.email}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="docTitle">Document Title *</Label>
                      <Input id="docTitle" required value={documentForm.title} onChange={(e) => setDocumentForm({...documentForm, title: e.target.value})} placeholder="Document name" />
                    </div>
                    <div>
                      <Label htmlFor="docType">Document Type *</Label>
                      <select id="docType" className="w-full px-3 py-2 border rounded-md" value={documentForm.category} onChange={(e) => setDocumentForm({...documentForm, category: e.target.value})}>
                        <option value="HR">HR</option>
                        <option value="ADMIN">Admin</option>
                        <option value="CLIENT_RECORDS">Client Records</option>
                        <option value="ACCOUNTS">Accounts</option>
                        <option value="ARCHIVE">Archive</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="docFile">File URL (temporary) *</Label>
                      <Input id="docFile" required value={documentForm.fileUrl} onChange={(e) => setDocumentForm({...documentForm, fileUrl: e.target.value})} placeholder="https://example.com/file.pdf" />
                      <p className="text-xs text-gray-500 mt-1">Note: File upload functionality will be added later</p>
                    </div>
                    <div>
                      <Label htmlFor="docNotes">Notes (Optional)</Label>
                      <textarea id="docNotes" className="w-full px-3 py-2 border rounded-md" rows={2} value={documentForm.description} onChange={(e) => setDocumentForm({...documentForm, description: e.target.value})} placeholder="Additional notes..."></textarea>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowDocumentModal(false)}>Cancel</Button>
                      <Button type="submit" className="bg-scanvault-red hover:bg-red-700" disabled={submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload Document"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="scanvault-docs" className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">ScanVault Documents</h2>
              <p className="text-sm text-gray-500 mt-1">Internal company documents — visible to Admins and Accountant only.</p>
            </div>
            <Button onClick={() => setShowSvDocumentModal(true)} className="bg-scanvault-red hover:bg-red-700 shrink-0">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              {svDocuments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No ScanVault documents yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {svDocuments.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{doc.title}</p>
                          {doc.description && <p className="text-sm text-gray-600 mt-0.5">{doc.description}</p>}
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{doc.category}</span>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-2">
                          <p className="text-sm text-gray-500">{new Date(doc.uploadedAt).toLocaleDateString("en-GB")}</p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => window.open(doc.fileUrl, "_blank")}>
                              <Download className="h-3.5 w-3.5 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50 border-red-200"
                              onClick={() => handleDeleteSvDocument(doc.id)}
                              disabled={deletingSvDocument === doc.id}
                            >
                              {deletingSvDocument === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {showSvDocumentModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-lg max-h-[92vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle>Upload ScanVault Document</CardTitle>
                    <CardDescription>Upload an internal company document</CardDescription>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSvDocumentModal(false)}
                    className="text-gray-400 hover:text-gray-700 ml-4 mt-1"
                  >✕</button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUploadSvDocument} className="space-y-4">
                    <div>
                      <Label htmlFor="svDocTitle">Document Title *</Label>
                      <Input id="svDocTitle" required value={svDocumentForm.title} onChange={(e) => setSvDocumentForm({ ...svDocumentForm, title: e.target.value })} placeholder="e.g. VAT Registration Certificate" />
                    </div>
                    <div>
                      <Label htmlFor="svDocCategory">Category</Label>
                      <select id="svDocCategory" className="w-full px-3 py-2 border rounded-md" value={svDocumentForm.category} onChange={(e) => setSvDocumentForm({ ...svDocumentForm, category: e.target.value })}>
                        <option value="GENERAL">General</option>
                        <option value="ACCOUNTS">Accounts</option>
                        <option value="HR">HR</option>
                        <option value="LEGAL">Legal</option>
                        <option value="COMPLIANCE">Compliance</option>
                        <option value="INSURANCE">Insurance</option>
                        <option value="TAX">Tax</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="svDocUrl">File URL *</Label>
                      <Input id="svDocUrl" required value={svDocumentForm.fileUrl} onChange={(e) => setSvDocumentForm({ ...svDocumentForm, fileUrl: e.target.value })} placeholder="https://..." />
                    </div>
                    <div>
                      <Label htmlFor="svDocNotes">Notes (Optional)</Label>
                      <textarea id="svDocNotes" className="w-full px-3 py-2 border rounded-md" rows={2} value={svDocumentForm.description} onChange={(e) => setSvDocumentForm({ ...svDocumentForm, description: e.target.value })} placeholder="Additional notes..." />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowSvDocumentModal(false)}>Cancel</Button>
                      <Button type="submit" className="bg-scanvault-red hover:bg-red-700" disabled={submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload Document"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="quotations" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-scanvault-red" />
            <h2 className="text-2xl font-bold">Client Quotations</h2>
          </div>
          <QuotationsTab />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-scanvault-red" />
            <h2 className="text-2xl font-bold">Client Contracts</h2>
          </div>
          <ContractsTab />
        </TabsContent>

        <TabsContent value="risk-assessments" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-scanvault-red" />
            <h2 className="text-2xl font-bold">Care Home Risk Assessments</h2>
          </div>
          <RiskAssessmentsTab />
        </TabsContent>

        <TabsContent value="completion-certificates" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-scanvault-red" />
            <h2 className="text-2xl font-bold">Completion Certificates</h2>
          </div>
          <CompletionCertificatesTab />
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-scanvault-red" />
            <h2 className="text-2xl font-bold">Leads &amp; Free Quotes</h2>
          </div>
          <LeadsTab />
        </TabsContent>

        <TabsContent value="expense-receipts" className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold">Expense Receipts</h2>
          </div>
          <ExpenseReceiptsTab />
        </TabsContent>

        <TabsContent value="bank-import" className="space-y-4">
          <RevolutImportTab />
        </TabsContent>

          </div>{/* end content area */}
        </div>{/* end flex wrapper */}
      </Tabs>
    </div>
  );
}
