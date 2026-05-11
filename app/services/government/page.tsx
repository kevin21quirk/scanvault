import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Building2, ShieldCheck, FileKey } from "lucide-react";

export default function Government() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-scanvault-black to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Government Document Solutions</h1>
            <p className="text-xl text-gray-300 mb-8">
              Secure, compliant document management for government agencies and public sector organisations.
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
                <h2 className="text-3xl font-bold text-scanvault-black mb-6">Government Document Management</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Specialised solutions for government agencies and public sector organisations. We understand the 
                  unique requirements of public records management, FOIA compliance, and government security standards.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our systems meet all government compliance requirements while improving public access to information 
                  and streamlining administrative processes.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-scanvault-black mb-6">Government Records</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Public Records</p>
                      <p className="text-sm text-gray-600">FOIA-compliant document management</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Administrative Files</p>
                      <p className="text-sm text-gray-600">Internal government documentation</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Classified Documents</p>
                      <p className="text-sm text-gray-600">Secure handling of sensitive information</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Historical Archives</p>
                      <p className="text-sm text-gray-600">Long-term preservation of government records</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Public Sector Expertise</h3>
                <p className="text-gray-600">
                  Specialized knowledge of government requirements.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Security Clearance</h3>
                <p className="text-gray-600">
                  Cleared personnel for handling sensitive documents.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileKey className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">FOIA Compliance</h3>
                <p className="text-gray-600">
                  Streamlined processes for public information requests.
                </p>
              </div>
            </div>

            <div className="bg-scanvault-red text-white p-12 rounded-lg text-center">
              <h2 className="text-3xl font-bold mb-4">Modernize Government Records</h2>
              <p className="text-xl mb-8 text-white/90">
                Secure, compliant document management for the public sector.
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
