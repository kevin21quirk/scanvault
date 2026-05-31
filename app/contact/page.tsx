"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[380px] flex items-center text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=85"
          alt="Contact ScanVault"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-scanvault-black/75 via-scanvault-black/60 to-scanvault-black/80" />
        <div className="container mx-auto px-4 relative z-10 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get in touch with our team. We&apos;re here to help with all your document management needs.
          </p>
        </div>
      </section>

      <div className="bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-scanvault-black mb-6">Send us a Message</h2>
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
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scanvault-red"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full bg-scanvault-red hover:bg-red-700 text-white py-6 text-lg font-semibold disabled:opacity-60"
                  >
                    {status === "sending" ? "Sending…" : "Send Message"}
                  </Button>

                  {status === "success" && (
                    <p className="text-green-600 font-medium text-center">
                      ✓ Message sent! We&apos;ll get back to you soon.
                    </p>
                  )}
                  {status === "error" && (
                    <p className="text-red-600 font-medium text-center">
                      Something went wrong — please try again or email us directly.
                    </p>
                  )}
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold text-scanvault-black mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-scanvault-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-scanvault-red" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-scanvault-black mb-1">Phone</h4>
                      <p className="text-gray-600">+44 7359 969266</p>
                      <p className="text-sm text-gray-500">Mon-Fri, 9am-5pm</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-scanvault-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-scanvault-red" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-scanvault-black mb-1">Email</h4>
                      <p className="text-gray-600">info@scanvault.co.uk</p>
                      <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                    </div>
                  </div>

                </div>
              </div>

              <div className="bg-scanvault-red text-white p-8 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="mb-6">
                  Request a free quote and discover how ScanVault can transform your document management.
                </p>
                <a href="/quote">
                  <Button className="w-full bg-white text-scanvault-red hover:bg-gray-100 py-6 text-lg font-semibold">
                    Get Free Quote
                  </Button>
                </a>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
