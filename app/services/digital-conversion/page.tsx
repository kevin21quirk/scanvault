import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, RefreshCw, FileDigit, Layers } from "lucide-react";

export default function DigitalConversion() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-scanvault-black to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Digital Conversion Services</h1>
            <p className="text-xl text-gray-300 mb-8">
              Convert all your legacy formats into modern, accessible digital files with our expert conversion services.
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
                <h2 className="text-3xl font-bold text-scanvault-black mb-6">Complete Digital Conversion</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Transform outdated formats into modern digital files. We handle microfiche, microfilm, blueprints, 
                  large-format documents, and legacy electronic formats with precision and care.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our digital conversion services ensure your valuable information remains accessible and usable 
                  for years to come, regardless of changing technology standards.
                </p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-2xl font-bold text-scanvault-black mb-6">What We Convert</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Microfiche & Microfilm</p>
                      <p className="text-sm text-gray-600">High-quality digital conversion</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Large Format Documents</p>
                      <p className="text-sm text-gray-600">Blueprints, maps, and technical drawings</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Legacy Electronic Files</p>
                      <p className="text-sm text-gray-600">Old database and document formats</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Audio & Video Media</p>
                      <p className="text-sm text-gray-600">Cassettes, VHS, and other formats</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Format Migration</h3>
                <p className="text-gray-600">
                  Seamlessly migrate from obsolete formats to modern standards.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileDigit className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Quality Assurance</h3>
                <p className="text-gray-600">
                  Rigorous quality checks ensure perfect conversion results.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-scanvault-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Layers className="h-8 w-8 text-scanvault-red" />
                </div>
                <h3 className="text-xl font-bold text-scanvault-black mb-3">Batch Processing</h3>
                <p className="text-gray-600">
                  Efficient handling of large-scale conversion projects.
                </p>
              </div>
            </div>

            <div className="bg-scanvault-red text-white p-12 rounded-lg text-center">
              <h2 className="text-3xl font-bold mb-4">Modernise Your Archives</h2>
              <p className="text-xl mb-8 text-white/90">
                Contact us for a free assessment of your digital conversion needs.
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
