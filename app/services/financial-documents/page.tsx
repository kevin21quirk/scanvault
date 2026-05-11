import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, DollarSign, Calculator, TrendingUp } from "lucide-react";

export default function FinancialDocuments() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-scanvault-black to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Financial Document Management</h1>
            <p className="text-xl text-gray-300 mb-8">
              Secure digitalisation and management of invoices, receipts, and all financial records.
            </p>
            <Link href="/quote">
              <Button size="lg" className="bg-scanvault-red hover:bg-red-700 text-white px-8 py-6 text-lg">
                Get Free Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="text-3xl font-bold text-scanvault-black mb-6">Financial Records Digitalisation</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Transform your financial document management with our specialized services. We handle invoices, receipts, 
                  bank statements, tax records, and all accounting documentation with the highest security standards.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our solutions integrate seamlessly with accounting software, ensuring accurate data capture and 
                  compliance with financial regulations.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-scanvault-black mb-6">Document Types</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Invoices & Receipts</p>
                      <p className="text-sm text-gray-600">Automated processing and data extraction</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Bank Statements</p>
                      <p className="text-sm text-gray-600">Secure digitalisation and archiving</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Tax Documents</p>
                      <p className="text-sm text-gray-600">Compliant storage for required periods</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Financial Reports</p>
                      <p className="text-sm text-gray-600">Organized storage and easy retrieval</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Cost Savings</h3>
                <p className="text-gray-600">
                  Reduce storage costs and improve financial efficiency.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Accounting Integration</h3>
                <p className="text-gray-600">
                  Direct integration with popular accounting platforms.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Audit Support</h3>
                <p className="text-gray-600">
                  Quick access to documents for audits and reviews.
                </p>
              </div>
            </div>

            <div className="bg-scanvault-red text-white p-12 rounded-lg text-center">
              <h2 className="text-3xl font-bold mb-4">Modernize Your Financial Records</h2>
              <p className="text-xl mb-8 text-white/90">
                Get started with secure financial document management today.
              </p>
              <Link href="/quote">
                <Button size="lg" className="bg-white text-scanvault-red hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                  Request Free Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
