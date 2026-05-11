import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, FileText, Zap, Shield } from "lucide-react";

export default function DocumentScanning() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-scanvault-black to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Document Scanning Services</h1>
            <p className="text-xl text-gray-300 mb-8">
              Transform your paper documents into searchable, secure digital files with our professional scanning services.
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

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="text-3xl font-bold text-scanvault-black mb-6">Professional Document Scanning</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our state-of-the-art document scanning services convert your physical documents into high-quality digital files. 
                  We handle everything from single-page documents to large-scale archiving projects with precision and care.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Using advanced OCR (Optical Character Recognition) technology, we ensure your scanned documents are fully 
                  searchable and easily accessible, saving you time and improving efficiency.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-scanvault-black mb-6">Key Features</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">High-Resolution Scanning</p>
                      <p className="text-sm text-gray-600">Up to 600 DPI for crystal-clear images</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">OCR Technology</p>
                      <p className="text-sm text-gray-600">Full-text searchability for all documents</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Multiple Formats</p>
                      <p className="text-sm text-gray-600">PDF, TIFF, JPEG, and more</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Secure Processing</p>
                      <p className="text-sm text-gray-600">Confidential handling of sensitive documents</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Save Space</h3>
                <p className="text-gray-600">
                  Eliminate bulky filing cabinets and free up valuable office space for your business.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Instant Access</h3>
                <p className="text-gray-600">
                  Find any document in seconds with powerful search capabilities and organized filing.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Enhanced Security</h3>
                <p className="text-gray-600">
                  Protect sensitive information with encrypted digital storage and access controls.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-scanvault-red text-white p-12 rounded-lg text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Go Digital?</h2>
              <p className="text-xl mb-8 text-white/90">
                Get a free quote for your document scanning project today.
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
