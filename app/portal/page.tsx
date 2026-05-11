"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Receipt, FolderOpen, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function Portal() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

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
          Access your invoices, receipts, and archived documents
        </p>
      </div>

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invoices">
            <FileText className="h-4 w-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="receipts">
            <Receipt className="h-4 w-4 mr-2" />
            Receipts
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FolderOpen className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>

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
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">{invoice.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(invoice.amount)}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            invoice.status === "PAID"
                              ? "bg-green-100 text-green-700"
                              : invoice.status === "OVERDUE"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                          <button className="text-sm text-scanvault-red hover:underline mt-1 flex items-center">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                    <div
                      key={doc.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
