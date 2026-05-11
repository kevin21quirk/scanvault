import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Building, DollarSign, Archive, Workflow } from "lucide-react";

export default function Services() {
  return (
    <div className="flex flex-col">
      <section className="bg-scanvault-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-xl text-gray-300">
              Comprehensive digitalization and archiving solutions tailored to your organization's needs.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="border-l-4 border-l-scanvault-red">
              <CardHeader>
                <Users className="h-12 w-12 text-scanvault-red mb-4" />
                <CardTitle className="text-2xl">HR Records Management</CardTitle>
                <CardDescription>Complete digitalization of human resources documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Employee personnel files</li>
                  <li>• Employment contracts and agreements</li>
                  <li>• Performance reviews and evaluations</li>
                  <li>• Training records and certifications</li>
                  <li>• Payroll documentation</li>
                  <li>• Compliance and regulatory records</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-scanvault-red">
              <CardHeader>
                <Building className="h-12 w-12 text-scanvault-red mb-4" />
                <CardTitle className="text-2xl">Administrative Solutions</CardTitle>
                <CardDescription>Streamline your administrative documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Company policies and procedures</li>
                  <li>• Meeting minutes and agendas</li>
                  <li>• Correspondence and communications</li>
                  <li>• Operational manuals</li>
                  <li>• Contracts and agreements</li>
                  <li>• Regulatory compliance documents</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-scanvault-red">
              <CardHeader>
                <FileText className="h-12 w-12 text-scanvault-red mb-4" />
                <CardTitle className="text-2xl">Client & Resident Records</CardTitle>
                <CardDescription>Secure management of sensitive client information</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Client files and case records</li>
                  <li>• Resident documentation</li>
                  <li>• Service agreements and contracts</li>
                  <li>• Medical and care records</li>
                  <li>• Communication logs</li>
                  <li>• Assessment and evaluation forms</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-scanvault-red">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-scanvault-red mb-4" />
                <CardTitle className="text-2xl">Accounts & Financial</CardTitle>
                <CardDescription>Organized financial document management</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Invoices and billing records</li>
                  <li>• Receipts and expense documentation</li>
                  <li>• Financial statements</li>
                  <li>• Tax records and returns</li>
                  <li>• Purchase orders</li>
                  <li>• Audit trails and reports</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-scanvault-red">
              <CardHeader>
                <Archive className="h-12 w-12 text-scanvault-red mb-4" />
                <CardTitle className="text-2xl">Archive Digitalization</CardTitle>
                <CardDescription>Transform paper archives into digital assets</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• High-quality document scanning</li>
                  <li>• OCR (Optical Character Recognition)</li>
                  <li>• Metadata tagging and indexing</li>
                  <li>• Quality assurance and verification</li>
                  <li>• Secure storage and backup</li>
                  <li>• Original document handling options</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-scanvault-red">
              <CardHeader>
                <Workflow className="h-12 w-12 text-scanvault-red mb-4" />
                <CardTitle className="text-2xl">Workflow Orchestration</CardTitle>
                <CardDescription>Intelligent organization and retrieval systems</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Custom categorization systems</li>
                  <li>• Advanced search capabilities</li>
                  <li>• Access control and permissions</li>
                  <li>• Integration with existing systems</li>
                  <li>• Automated workflow processes</li>
                  <li>• Training and ongoing support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-scanvault-black mb-6">Our Process</h2>
            <div className="grid md:grid-cols-4 gap-8 mt-12">
              <div>
                <div className="bg-scanvault-red text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold text-scanvault-black mb-2">Consultation</h3>
                <p className="text-gray-600 text-sm">
                  We assess your needs and design a tailored solution.
                </p>
              </div>
              <div>
                <div className="bg-scanvault-red text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold text-scanvault-black mb-2">Digitalization</h3>
                <p className="text-gray-600 text-sm">
                  Secure scanning and processing of your documents.
                </p>
              </div>
              <div>
                <div className="bg-scanvault-red text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold text-scanvault-black mb-2">Organization</h3>
                <p className="text-gray-600 text-sm">
                  Intelligent categorization and workflow setup.
                </p>
              </div>
              <div>
                <div className="bg-scanvault-red text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="font-semibold text-scanvault-black mb-2">Delivery</h3>
                <p className="text-gray-600 text-sm">
                  Access your digital archive through our secure portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
