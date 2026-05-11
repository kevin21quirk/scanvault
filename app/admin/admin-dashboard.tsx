"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, FileText, Receipt, FolderOpen, Plus, Upload, Trash2, Edit, Loader2, Download } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  companyName: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  description: string;
  issueDate: string;
  dueDate: string;
  status: string;
  notes: string | null;
  user: { email: string; name: string | null };
}

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

  const [showUserModal, setShowUserModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "CLIENT", companyName: "" });
  const [invoiceForm, setInvoiceForm] = useState({ userId: "", invoiceNumber: "", subtotal: "", vatRate: "20", description: "", issueDate: "", dueDate: "", notes: "" });
  const [receiptForm, setReceiptForm] = useState({ userId: "", receiptNumber: "", amount: "", description: "", paymentMethod: "Bank Transfer", date: "" });
  const [documentForm, setDocumentForm] = useState({ userId: "", title: "", description: "", category: "OTHER", fileUrl: "" });

  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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
    setShowInvoiceModal(true);
    fetchNextInvoiceNumber();
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });

      if (res.ok) {
        const newUser = await res.json();
        setUsers([newUser, ...users]);
        setShowUserModal(false);
        setUserForm({ name: "", email: "", password: "", role: "CLIENT", companyName: "" });
        alert("User created successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceForm),
      });

      if (res.ok) {
        const newInvoice = await res.json();
        setInvoices([newInvoice, ...invoices]);
        setShowInvoiceModal(false);
        setInvoiceForm({ userId: "", invoiceNumber: "", subtotal: "", vatRate: "20", description: "", issueDate: "", dueDate: "", notes: "" });
        alert("Invoice created successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

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

  // Calculate overdue invoices
  const overdueInvoices = invoices.filter(invoice => {
    if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') return false;
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  // Auto-update overdue invoices status
  useEffect(() => {
    overdueInvoices.forEach(invoice => {
      if (invoice.status !== 'OVERDUE') {
        handleStatusChange(invoice.id, 'OVERDUE');
      }
    });
  }, [invoices]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
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
          <TabsTrigger value="documents">Documents</TabsTrigger>
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

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Management</h2>
            <Button onClick={() => setShowUserModal(true)} className="bg-scanvault-red hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{user.email}</p>
                      <p className="text-sm text-gray-600">{user.role} • {user.name || "No name"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {showUserModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Create New User</CardTitle>
                  <CardDescription>Add a new client or admin user</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} placeholder="John Doe" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" required value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} placeholder="john@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="password">Password *</Label>
                      <Input id="password" type="password" required value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="role">Role *</Label>
                      <select id="role" className="w-full px-3 py-2 border rounded-md" value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})}>
                        <option value="CLIENT">Client</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" value={userForm.companyName} onChange={(e) => setUserForm({...userForm, companyName: e.target.value})} placeholder="Company Ltd" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowUserModal(false)}>Cancel</Button>
                      <Button type="submit" className="bg-scanvault-red hover:bg-red-700" disabled={submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create User"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Invoice Management</h2>
            <Button onClick={handleOpenInvoiceModal} className="bg-scanvault-red hover:bg-red-700">
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
                    <div key={invoice.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-600">{invoice.user.email}</p>
                          <p className="text-sm text-gray-600">{invoice.description}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Subtotal: £{invoice.subtotal.toFixed(2)}</p>
                            <p>VAT ({invoice.vatRate}%): £{invoice.vatAmount.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <div>
                            <p className="font-bold text-lg">£{invoice.total.toFixed(2)}</p>
                            <div className="mt-1">
                              <select
                                value={invoice.status}
                                onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                                disabled={updatingStatus === invoice.id}
                                className={`text-sm px-2 py-1 border rounded ${
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/api/invoices/${invoice.id}/download`, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {showInvoiceModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Create New Invoice</CardTitle>
                  <CardDescription>Generate an invoice for a client</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateInvoice} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client">Client *</Label>
                        <select id="client" required className="w-full px-3 py-2 border rounded-md" value={invoiceForm.userId} onChange={(e) => setInvoiceForm({...invoiceForm, userId: e.target.value})}>
                          <option value="">Select client...</option>
                          {clientUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.email}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="invoiceNumber">Invoice Number (Auto-generated)</Label>
                        <Input id="invoiceNumber" required value={invoiceForm.invoiceNumber} readOnly className="bg-gray-50" placeholder="Loading..." />
                      </div>
                    </div>
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
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <textarea id="description" required className="w-full px-3 py-2 border rounded-md" rows={3} value={invoiceForm.description} onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})} placeholder="Service description..."></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="subtotal">Subtotal (£) *</Label>
                        <Input id="subtotal" type="number" step="0.01" required value={invoiceForm.subtotal} onChange={(e) => setInvoiceForm({...invoiceForm, subtotal: e.target.value})} placeholder="0.00" />
                      </div>
                      <div>
                        <Label htmlFor="vatRate">VAT Rate (%) *</Label>
                        <Input id="vatRate" type="number" step="0.01" required value={invoiceForm.vatRate} onChange={(e) => setInvoiceForm({...invoiceForm, vatRate: e.target.value})} placeholder="20" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <textarea id="notes" className="w-full px-3 py-2 border rounded-md" rows={2} value={invoiceForm.notes} onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})} placeholder="Additional notes..."></textarea>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowInvoiceModal(false)}>Cancel</Button>
                      <Button type="submit" className="bg-scanvault-red hover:bg-red-700" disabled={submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Invoice"}
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
                            <p className="text-sm text-gray-700 mt-1">{invoice.user.email}</p>
                            <p className="text-sm text-gray-600">{invoice.description}</p>
                            <div className="mt-2 text-xs text-gray-600">
                              <p>Due Date: <span className="font-semibold text-red-600">{new Date(invoice.dueDate).toLocaleDateString('en-GB')}</span></p>
                              <p className="mt-1">Subtotal: £{invoice.subtotal.toFixed(2)}</p>
                              <p>VAT ({invoice.vatRate}%): £{invoice.vatAmount.toFixed(2)}</p>
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
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Receipt Management</h2>
            <Button onClick={() => setShowReceiptModal(true)} className="bg-scanvault-red hover:bg-red-700">
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
                    <div key={receipt.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{receipt.receiptNumber}</p>
                          <p className="text-sm text-gray-600">{receipt.user.email}</p>
                          <p className="text-sm text-gray-600">{receipt.description}</p>
                          <p className="text-sm text-gray-600">{receipt.paymentMethod}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">£{receipt.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">{new Date(receipt.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {showReceiptModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl">
                <CardHeader>
                  <CardTitle>Create New Receipt</CardTitle>
                  <CardDescription>Generate a payment receipt</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateReceipt} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-2 gap-4">
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
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Document Management</h2>
            <Button onClick={() => setShowDocumentModal(true)} className="bg-scanvault-red hover:bg-red-700">
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
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{doc.title}</p>
                          <p className="text-sm text-gray-600">{doc.user.email}</p>
                          <p className="text-sm text-gray-600">{doc.category}</p>
                        </div>
                        <div className="text-right">
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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl">
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
      </Tabs>
    </div>
  );
}
