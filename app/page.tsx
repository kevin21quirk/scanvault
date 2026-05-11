"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Zap, Database, Lock, CheckCircle, ArrowRight, FileArchive, Star, Sparkles, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import MuxPlayer from "@mux/mux-player-react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col overflow-hidden">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-scanvault-black via-gray-900 to-scanvault-red">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <MuxPlayer
            playbackId="maver7qtAkM1D851kcQFFmj01BcWGYFlrIB8tlSDLHRA"
            autoPlay
            loop
            muted
            playsInline
            streamType="on-demand"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              '--controls': 'none',
              '--media-object-fit': 'cover',
              '--media-object-position': 'center',
            } as any}
            className="w-full h-full"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-scanvault-black/70 via-gray-900/60 to-scanvault-red/50 pointer-events-none"></div>
        </div>
        
        {/* Animated blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-scanvault-red rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div 
          className="container mx-auto px-4 relative z-10"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-white">
              <Sparkles className="h-4 w-4 text-scanvault-red" />
              <span className="text-sm font-medium">Next-Generation Digital Archiving</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-red-200">
                Secure Digital
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-200 via-red-400 to-scanvault-red">
                Archiving
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Transform your paper archives into organized, searchable digital assets with AI-powered solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/services">
                <Button size="lg" className="bg-scanvault-red text-white hover:bg-red-700 px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 group">
                  Explore Services
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" className="bg-transparent border-2 border-white !text-white hover:bg-white hover:!text-scanvault-black px-8 py-6 text-lg rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105">
                  Client Portal
                </Button>
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">10K+</div>
                <div className="text-sm text-gray-400">Documents Digitized</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">99.9%</div>
                <div className="text-sm text-gray-400">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-sm text-gray-400">Secure Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-32 bg-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-scanvault-red to-transparent"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-6">
              <TrendingUp className="h-4 w-4 text-scanvault-red" />
              <span className="text-sm font-medium text-scanvault-red">Industry Leading</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-scanvault-black mb-6">
              Why Choose ScanVault?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-xl">
              We specialize in transforming paper archives into organized, searchable digital workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent hidden md:block"></div>
            
            <div className="group text-center relative">
              <div className="inline-flex w-24 h-24 bg-gradient-to-br from-scanvault-red to-red-600 items-center justify-center mb-6 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Shield className="h-12 w-12 text-white" />
                <div className="absolute inset-0 bg-scanvault-red blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
              <h3 className="text-3xl font-bold text-scanvault-black mb-4 group-hover:text-scanvault-red transition-colors">Secure & Compliant</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Enterprise-grade security with full compliance to data protection regulations and industry standards.
              </p>
            </div>

            <div className="group text-center relative">
              <div className="inline-flex w-24 h-24 bg-gradient-to-br from-scanvault-red to-red-600 items-center justify-center mb-6 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Zap className="h-12 w-12 text-white" />
                <div className="absolute inset-0 bg-scanvault-red blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
              <h3 className="text-3xl font-bold text-scanvault-black mb-4 group-hover:text-scanvault-red transition-colors">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Efficient digitalization processes powered by AI that get your documents online in record time.
              </p>
            </div>

            <div className="group text-center relative">
              <div className="inline-flex w-24 h-24 bg-gradient-to-br from-scanvault-red to-red-600 items-center justify-center mb-6 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Database className="h-12 w-12 text-white" />
                <div className="absolute inset-0 bg-scanvault-red blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
              <h3 className="text-3xl font-bold text-scanvault-black mb-4 group-hover:text-scanvault-red transition-colors">Smart Workflows</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Intelligent categorization and AI-powered workflow systems for seamless access and management.
              </p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-scanvault-red to-transparent"></div>
      </section>

      <section className="relative py-32 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-scanvault-red/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-red-400/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto space-y-32">
            
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-6">
                  <CheckCircle className="h-4 w-4 text-scanvault-red" />
                  <span className="text-sm font-medium text-scanvault-red">HR Solutions</span>
                </div>
                <h3 className="text-4xl font-bold text-scanvault-black mb-6">Human Resources Management</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Digitalize and organize employee files, contracts, and personnel documentation with military-grade security and instant accessibility.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-1 bg-gradient-to-r from-scanvault-red to-transparent"></div>
                  <span className="text-sm text-gray-500">Secure • Compliant • Accessible</span>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-scanvault-red to-red-600 blur-3xl opacity-20"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80" 
                    alt="Human Resources Management"
                    className="w-full h-full object-cover aspect-square group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-scanvault-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-2xl font-bold">HR Management</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-scanvault-red blur-3xl opacity-20"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80" 
                    alt="Administrative Excellence"
                    className="w-full h-full object-cover aspect-square group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-scanvault-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-2xl font-bold">Administrative Excellence</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-6">
                  <CheckCircle className="h-4 w-4 text-scanvault-red" />
                  <span className="text-sm font-medium text-scanvault-red">Admin Solutions</span>
                </div>
                <h3 className="text-4xl font-bold text-scanvault-black mb-6">Administrative Excellence</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Transform policies, procedures, and operational documents into a streamlined digital workflow that enhances efficiency.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-1 bg-gradient-to-r from-scanvault-red to-transparent"></div>
                  <span className="text-sm text-gray-500">Organized • Efficient • Smart</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-6">
                  <CheckCircle className="h-4 w-4 text-scanvault-red" />
                  <span className="text-sm font-medium text-scanvault-red">Client Records</span>
                </div>
                <h3 className="text-4xl font-bold text-scanvault-black mb-6">Client Data Protection</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Secure management of sensitive client information with enterprise-level encryption and compliance standards.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-1 bg-gradient-to-r from-scanvault-red to-transparent"></div>
                  <span className="text-sm text-gray-500">Protected • Private • Professional</span>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-scanvault-red to-red-700 blur-3xl opacity-20"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=80" 
                    alt="Client Data Protection"
                    className="w-full h-full object-cover aspect-square group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-scanvault-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-2xl font-bold">Client Records</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center py-16">
              <h3 className="text-3xl font-bold text-scanvault-black mb-6">Ready to Transform Your Archives?</h3>
              <Link href="/services">
                <Button size="lg" className="bg-gradient-to-r from-scanvault-red to-red-600 hover:from-red-700 hover:to-red-800 text-white px-12 py-6 text-lg rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 hover:scale-105">
                  Explore All Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-scanvault-black via-gray-900 to-scanvault-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-scanvault-red rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
              <Lock className="h-4 w-4 text-scanvault-red" />
              <span className="text-sm font-medium">Trusted by Leading Organizations</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
              Join hundreds of businesses who trust ScanVault with their archiving needs. Experience the future of digital document management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-scanvault-red text-white hover:bg-red-700 px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300">
                  Access Client Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="border-2 border-white bg-white !text-scanvault-black hover:bg-scanvault-black hover:!text-white px-8 py-6 text-lg rounded-full transition-all duration-300">
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
