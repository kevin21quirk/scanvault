import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Eye, Award, Users } from "lucide-react";

export default function About() {
  return (
    <div className="flex flex-col">
      <section className="bg-scanvault-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About ScanVault</h1>
            <p className="text-xl text-gray-300">
              Leading the way in professional document digitalisation and archiving solutions since our inception.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-scanvault-black mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              ScanVault was founded with a simple mission: to help organisations transform their paper archives into efficient, 
              accessible digital workflows. We understand that historic information is valuable, and managing it shouldn't be complicated.
            </p>
            <p className="text-gray-600 mb-4">
              Today, we serve businesses across various sectors, providing comprehensive solutions for HR records, administrative 
              documentation, client files, resident records, and financial accounts. Our expertise lies not just in digitalisation, 
              but in creating organized, workflow-oriented systems that make information retrieval effortless.
            </p>
            <p className="text-gray-600">
              With state-of-the-art technology and a commitment to security and compliance, we've become the trusted partner 
              for organisations looking to modernise their archiving processes.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-scanvault-black mb-4">Our Values</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <Target className="h-12 w-12 text-scanvault-red mx-auto mb-4" />
                <CardTitle>Precision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Every document is handled with meticulous attention to detail and accuracy.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Eye className="h-12 w-12 text-scanvault-red mx-auto mb-4" />
                <CardTitle>Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Clear communication and honest processes throughout our partnership.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Award className="h-12 w-12 text-scanvault-red mx-auto mb-4" />
                <CardTitle>Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Committed to delivering the highest quality in every project we undertake.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-scanvault-red mx-auto mb-4" />
                <CardTitle>Partnership</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Building long-term relationships based on trust and mutual success.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-scanvault-red text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Archives?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join the many organisations that trust ScanVault with their most important documents.
            </p>
            <a href="mailto:info@scanvault.com" className="inline-block bg-white text-scanvault-red px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
              Contact Us Today
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
