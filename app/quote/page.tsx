"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";

export default function Quote() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Quote request:", formData);
    alert("Thank you! We'll contact you within 24 hours.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-scanvault-black mb-4">
              Get Your Free Quote
            </h1>
            <p className="text-xl text-gray-600">
              Fill out the form below and we'll contact you within 24 hours (Mon–Fri 6am–6pm)
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-scanvault-black mb-6">Request Information</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="service">Service Required *</Label>
                    <select
                      id="service"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      required
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scanvault-red"
                    >
                      <option value="">Select a service...</option>
                      <option value="document-scanning">Document Scanning</option>
                      <option value="document-archiving">Document Archiving</option>
                      <option value="hr-records">HR Records Management</option>
                      <option value="financial-docs">Financial Documents</option>
                      <option value="client-records">Client Records</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message">Additional Information</Label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scanvault-red"
                      placeholder="Tell us about your requirements..."
                    />
                  </div>

                  <Button type="submit" className="w-full bg-scanvault-red hover:bg-red-700 text-white py-6 text-lg font-semibold">
                    Request Free Quote
                  </Button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-scanvault-red text-white p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">Why Choose ScanVault?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Fast Response</p>
                      <p className="text-sm text-white/90">We respond to all quotes within 24 hours</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Competitive Pricing</p>
                      <p className="text-sm text-white/90">Best value for professional document services</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Secure & Compliant</p>
                      <p className="text-sm text-white/90">Enterprise-grade security and full compliance</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold">Expert Team</p>
                      <p className="text-sm text-white/90">Experienced professionals handling your documents</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-scanvault-black mb-4">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  Our team is ready to answer any questions you may have about our services.
                </p>
                <div className="space-y-3 text-sm">
                  <p><strong>Phone:</strong> +44 7359 969266</p>
                  <p><strong>Email:</strong> info@scanvault.co.uk</p>
                  <p><strong>Hours:</strong> Mon-Fri, 9am-5pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
