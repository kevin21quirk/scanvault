import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Target, BarChart, Workflow } from "lucide-react";

export default function DataCapture() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-scanvault-black to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Data Capture Services</h1>
            <p className="text-xl text-gray-300 mb-8">
              Extract, validate, and structure data from your documents with intelligent data capture technology.
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
                <h2 className="text-3xl font-bold text-scanvault-black mb-6">Intelligent Data Capture</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our advanced data capture services use AI and machine learning to automatically extract key information 
                  from your documents. Transform unstructured data into actionable business intelligence.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  From invoices and forms to contracts and receipts, we capture the data you need with exceptional 
                  accuracy and speed, integrating seamlessly with your existing systems.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-scanvault-black mb-6">Capabilities</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Automated Extraction</p>
                      <p className="text-sm text-gray-600">AI-powered data extraction from any document type</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Data Validation</p>
                      <p className="text-sm text-gray-600">Ensure accuracy with automated validation rules</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">System Integration</p>
                      <p className="text-sm text-gray-600">Direct integration with your business systems</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Custom Fields</p>
                      <p className="text-sm text-gray-600">Capture any data points specific to your needs</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">High Accuracy</h3>
                <p className="text-gray-600">
                  99.9% accuracy rate with intelligent verification processes.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Analytics Ready</h3>
                <p className="text-gray-600">
                  Structured data perfect for business intelligence and reporting.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Workflow className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Workflow Automation</h3>
                <p className="text-gray-600">
                  Automate document-based processes and reduce manual data entry.
                </p>
              </div>
            </div>

            <div className="bg-scanvault-red text-white p-12 rounded-lg text-center">
              <h2 className="text-3xl font-bold mb-4">Unlock Your Data's Potential</h2>
              <p className="text-xl mb-8 text-white/90">
                Discover how intelligent data capture can transform your business.
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
