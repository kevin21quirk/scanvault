import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Scale, Gavel, FileText } from "lucide-react";

export default function Legal() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-scanvault-black to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Legal Document Solutions</h1>
            <p className="text-xl text-gray-300 mb-8">
              Secure document management for law firms, legal departments, and court systems.
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
                <h2 className="text-3xl font-bold text-scanvault-black mb-6">Legal Document Management</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Specialized solutions for the legal industry. We handle case files, contracts, court documents, 
                  and legal correspondence with the highest security and confidentiality standards.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our systems provide powerful search capabilities, version control, and audit trails essential 
                  for legal practice management.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-scanvault-black mb-6">Legal Documents</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Case Files</p>
                      <p className="text-sm text-gray-600">Complete case management and organisation</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Contracts & Agreements</p>
                      <p className="text-sm text-gray-600">Secure storage and version control</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Court Documents</p>
                      <p className="text-sm text-gray-600">Filings, pleadings, and court records</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Discovery Materials</p>
                      <p className="text-sm text-gray-600">E-discovery and document review support</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scale className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Attorney-Client Privilege</h3>
                <p className="text-gray-600">
                  Maintain confidentiality with secure access controls.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gavel className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Court Ready</h3>
                <p className="text-gray-600">
                  Documents formatted and organized for court submission.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">E-Discovery Support</h3>
                <p className="text-gray-600">
                  Advanced search and document review capabilities.
                </p>
              </div>
            </div>

            <div className="bg-scanvault-red text-white p-12 rounded-lg text-center">
              <h2 className="text-3xl font-bold mb-4">Streamline Your Legal Practice</h2>
              <p className="text-xl mb-8 text-white/90">
                Professional document management built for legal professionals.
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
