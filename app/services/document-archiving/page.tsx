import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Archive, Clock, Database } from "lucide-react";

export default function DocumentArchiving() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-scanvault-black to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Document Archiving Services</h1>
            <p className="text-xl text-gray-300 mb-8">
              Secure, organized, and compliant document archiving solutions for businesses of all sizes.
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
                <h2 className="text-3xl font-bold text-scanvault-black mb-6">Professional Document Archiving</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our document archiving services provide secure, long-term storage solutions for your important business records. 
                  We ensure compliance with industry regulations while making your archived documents easily accessible when needed.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  From physical storage to digital archiving, we offer comprehensive solutions that protect your documents 
                  and streamline your information management processes.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-scanvault-black mb-6">Key Features</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Secure Storage</p>
                      <p className="text-sm text-gray-600">Climate-controlled facilities with 24/7 monitoring</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Compliance Ready</p>
                      <p className="text-sm text-gray-600">Meet all regulatory requirements</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Easy Retrieval</p>
                      <p className="text-sm text-gray-600">Quick access to archived documents</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Retention Management</p>
                      <p className="text-sm text-gray-600">Automated retention schedules</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Archive className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Organized Storage</h3>
                <p className="text-gray-600">
                  Systematic organisation for easy document retrieval and management.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Long-Term Preservation</h3>
                <p className="text-gray-600">
                  Protect your documents for years with proper archiving techniques.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Digital Integration</h3>
                <p className="text-gray-600">
                  Seamlessly integrate with your existing document management systems.
                </p>
              </div>
            </div>

            <div className="bg-scanvault-red text-white p-12 rounded-lg text-center">
              <h2 className="text-3xl font-bold mb-4">Secure Your Documents Today</h2>
              <p className="text-xl mb-8 text-white/90">
                Get a free consultation for your document archiving needs.
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
