"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, FileText, Receipt, FolderOpen, Plus, Upload, Trash2, Loader2, Download, TrendingUp, ShieldCheck, Award } from "lucide-react";
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
  depositPaid: boolean;
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

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({ userId: "", invoiceNumber: "", vatRate: "20", depositPercent: "50", description: "", issueDate: "", dueDate: "", notes: "", careHomeId: "", careHomeName: "", careHomeAddress: "", billTo: "CLIENT", showCompanyAddress: true });
  const [invoiceItems, setInvoiceItems] = useState<{ description: string; quantity: string; rate: string }[]>([{ description: "", quantity: "1", rate: "" }]);
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
    setInvoiceForm({ userId: "", invoiceNumber: "", vatRate: "20", depositPercent: "50", description: "", issueDate: "", dueDate: "", notes: "", careHomeId: "", careHomeName: "", careHomeAddress: "", billTo: "CLIENT", showCompanyAddress: true });
    setInvoiceItems([{ description: "", quantity: "1", rate: "" }]);
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
    setInvoiceCareHomeOptions([]);
    fetch(`/api/care-homes?userId=${invoice.user.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: CareHomeOption[]) => setInvoiceCareHomeOptions(data))
      .catch(() => {});
    setShowInvoiceModal(true);
  };

  const fetchData = async () => {
    try {
      const [usersRes, invoicesRes, receiptsRes, documentsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/invoices"),
        fetch("/api/receipts"),
        fetch("/api/documents"),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (invoicesRes.ok) setInvoices(await invoicesRes.json());
      if (receiptsRes.ok) setReceipts(await receiptsRes.json());
      if (documentsRes.ok) setDocuments(await documentsRes.json());
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
          body: JSON.stringify({ ...invoiceForm, items: invoiceItems }),
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
        setInvoiceForm({ userId: "", invoiceNumber: "", vatRate: "20", depositPercent: "50", description: "", issueDate: "", dueDate: "", notes: "", careHomeId: "", careHomeName: "", careHomeAddress: "", billTo: "CLIENT", showCompanyAddress: true });
        setInvoiceItems([{ description: "", quantity: "1", rate: "" }]);
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
  const invSubtotal = invoiceItems.reduce((sum, it) => sum + (parseFloat(it.quantity) || 0) * (parseFloat(it.rate) || 0), 0);
  const invVat = invSubtotal * (parseFloat(invoiceForm.vatRate) || 0) / 100;
  const invTotal = invSubtotal + invVat;
  const invDeposit = invTotal * (parseFloat(invoiceForm.depositPercent) || 0) / 100;
  const invBalance = invTotal - invDeposit;

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
        <TabsList className="w-full flex-wrap md:flex-nowrap overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="system-users">Users</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="overdue" className="relative">
            Overdue
            {overdueInvoices.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {overdueInvoices.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="expense-receipts">Expense Receipts</TabsTrigger>
          <TabsTrigger value="bank-import">Bank Import</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="leads" className="relative">
            Leads &amp; Quotes
          </TabsTrigger>
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="risk-assessments">Risk Assessments</TabsTrigger>
          <TabsTrigger value="completion-certificates">Completion Certs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">{clientUsers.length} clients</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invoices.length}</div>
                <p className="text-xs text-muted-foreground">
                  {overdueInvoices.length > 0 ? (
                    <span className="text-red-600 font-semibold">{overdueInvoices.length} overdue</span>
                  ) : (
                    "All up to date"
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receipts</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{receipts.length}</div>
                <p className="text-xs text-muted-foreground">Payment receipts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents.length}</div>
                <p className="text-xs text-muted-foreground">Archived documents</p>
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
                                invoice.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                                'bg-red-50 text-red-700 border-red-300'
                              }`}
                            >
                              <option value="PENDING">Pending</option>
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
                      <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="tabular-nums">£{invSubtotal.toFixed(2)}</span></div>
                      {(parseFloat(invoiceForm.vatRate) || 0) > 0 && (
                        <div className="flex justify-between"><span className="text-gray-600">VAT ({invoiceForm.vatRate}%)</span><span className="tabular-nums">£{invVat.toFixed(2)}</span></div>
                      )}
                      <div className="flex justify-between font-semibold border-t pt-1"><span>Total Due</span><span className="tabular-nums">£{invTotal.toFixed(2)}</span></div>
                      <div className="flex justify-between text-scanvault-red"><span>Deposit due upfront ({invoiceForm.depositPercent || 0}%)</span><span className="tabular-nums">£{invDeposit.toFixed(2)}</span></div>
                      <div className="flex justify-between text-gray-600"><span>Balance (net 30 days after completion)</span><span className="tabular-nums">£{invBalance.toFixed(2)}</span></div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <textarea id="notes" className="w-full px-3 py-2 border rounded-md" rows={2} value={invoiceForm.notes} onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})} placeholder="Bank/payment details, PO number, or other notes shown on the invoice..."></textarea>
                    </div>
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
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
      </Tabs>
    </div>
  );
}
