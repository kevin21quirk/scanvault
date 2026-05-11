"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, FileText, Receipt, FolderOpen, Plus, Upload, Trash2, Edit } from "lucide-react";

export default function Admin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showUserModal, setShowUserModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/portal");
    }
  }, [status, session, router]);

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

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-scanvault-black mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage clients, documents, and system settings
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Active client accounts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Total invoices issued</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receipts</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Payment receipts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
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
                <div className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">kevin@scanvault.co.uk</p>
                    <p className="text-sm text-gray-600">Admin • Kevin Quirk</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">kevin.s.quirk@gmail.com</p>
                    <p className="text-sm text-gray-600">Client • Kevin Quirk</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
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
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <select id="role" className="w-full px-3 py-2 border rounded-md">
                      <option value="CLIENT">Client</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowUserModal(false)}>Cancel</Button>
                    <Button className="bg-scanvault-red hover:bg-red-700">Create User</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Invoice Management</h2>
            <Button onClick={() => setShowInvoiceModal(true)} className="bg-scanvault-red hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No invoices yet</p>
                <p className="text-sm">Click "Create Invoice" to get started</p>
              </div>
            </CardContent>
          </Card>

          {showInvoiceModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Create New Invoice</CardTitle>
                  <CardDescription>Generate an invoice for a client</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client">Client</Label>
                      <select id="client" className="w-full px-3 py-2 border rounded-md">
                        <option>Select client...</option>
                        <option>kevin.s.quirk@gmail.com</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input id="invoiceNumber" placeholder="INV-001" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input id="dueDate" type="date" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea id="description" className="w-full px-3 py-2 border rounded-md" rows={3} placeholder="Service description..."></textarea>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (£)</Label>
                    <Input id="amount" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>Cancel</Button>
                    <Button className="bg-scanvault-red hover:bg-red-700">Create Invoice</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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
              <div className="text-center py-12 text-gray-500">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No receipts yet</p>
                <p className="text-sm">Click "Create Receipt" to get started</p>
              </div>
            </CardContent>
          </Card>

          {showReceiptModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl">
                <CardHeader>
                  <CardTitle>Create New Receipt</CardTitle>
                  <CardDescription>Generate a payment receipt</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="receiptClient">Client</Label>
                      <select id="receiptClient" className="w-full px-3 py-2 border rounded-md">
                        <option>Select client...</option>
                        <option>kevin.s.quirk@gmail.com</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="receiptNumber">Receipt Number</Label>
                      <Input id="receiptNumber" placeholder="REC-001" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paymentDate">Payment Date</Label>
                      <Input id="paymentDate" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <select id="paymentMethod" className="w-full px-3 py-2 border rounded-md">
                        <option>Bank Transfer</option>
                        <option>Credit Card</option>
                        <option>Cash</option>
                        <option>Cheque</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="receiptDescription">Description</Label>
                    <textarea id="receiptDescription" className="w-full px-3 py-2 border rounded-md" rows={2} placeholder="Payment for..."></textarea>
                  </div>
                  <div>
                    <Label htmlFor="receiptAmount">Amount (£)</Label>
                    <Input id="receiptAmount" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowReceiptModal(false)}>Cancel</Button>
                    <Button className="bg-scanvault-red hover:bg-red-700">Create Receipt</Button>
                  </div>
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
              <div className="text-center py-12 text-gray-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No documents yet</p>
                <p className="text-sm">Click "Upload Document" to get started</p>
              </div>
            </CardContent>
          </Card>

          {showDocumentModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl">
                <CardHeader>
                  <CardTitle>Upload Document</CardTitle>
                  <CardDescription>Upload a document for a client</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="docClient">Client</Label>
                    <select id="docClient" className="w-full px-3 py-2 border rounded-md">
                      <option>Select client...</option>
                      <option>kevin.s.quirk@gmail.com</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="docTitle">Document Title</Label>
                    <Input id="docTitle" placeholder="Document name" />
                  </div>
                  <div>
                    <Label htmlFor="docType">Document Type</Label>
                    <select id="docType" className="w-full px-3 py-2 border rounded-md">
                      <option>Invoice</option>
                      <option>Receipt</option>
                      <option>Contract</option>
                      <option>Report</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="docFile">File</Label>
                    <Input id="docFile" type="file" accept=".pdf,.doc,.docx,.jpg,.png" />
                  </div>
                  <div>
                    <Label htmlFor="docNotes">Notes (Optional)</Label>
                    <textarea id="docNotes" className="w-full px-3 py-2 border rounded-md" rows={2} placeholder="Additional notes..."></textarea>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowDocumentModal(false)}>Cancel</Button>
                    <Button className="bg-scanvault-red hover:bg-red-700">Upload Document</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
