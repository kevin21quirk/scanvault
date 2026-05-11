import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, FileCheck, Scale, ShieldCheck } from "lucide-react";

export default function Compliance() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-scanvault-black to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Compliance Solutions</h1>
            <p className="text-xl text-gray-300 mb-8">
              Ensure regulatory compliance with our comprehensive document management and retention solutions.
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
                <h2 className="text-3xl font-bold text-scanvault-black mb-6">Regulatory Compliance Management</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Navigate complex regulatory requirements with confidence. Our compliance solutions ensure your 
                  document management meets all industry standards including GDPR, HIPAA, SOX, and more.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Automated retention schedules, audit trails, and secure disposal processes keep you compliant 
                  while reducing administrative burden.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-scanvault-black mb-6">Compliance Standards</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">GDPR Compliance</p>
                      <p className="text-sm text-gray-600">Full data protection compliance</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Industry Standards</p>
                      <p className="text-sm text-gray-600">HIPAA, SOX, ISO certifications</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Retention Policies</p>
                      <p className="text-sm text-gray-600">Automated document lifecycle management</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Audit Support</p>
                      <p className="text-sm text-gray-600">Complete audit trails and reporting</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Automated Compliance</h3>
                <p className="text-gray-600">
                  Automated processes ensure continuous compliance.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scale className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Legal Protection</h3>
                <p className="text-gray-600">
                  Protect your organization from regulatory penalties.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Risk Mitigation</h3>
                <p className="text-gray-600">
                  Reduce compliance risks with proven systems.
                </p>
              </div>
            </div>

            <div className="bg-scanvault-red text-white p-12 rounded-lg text-center">
              <h2 className="text-3xl font-bold mb-4">Stay Compliant with Confidence</h2>
              <p className="text-xl mb-8 text-white/90">
                Let us handle your compliance requirements while you focus on your business.
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
