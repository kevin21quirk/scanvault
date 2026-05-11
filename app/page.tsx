"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Zap, Database, Lock, CheckCircle, ArrowRight, FileArchive, Star, Sparkles, TrendingUp, Cloud, Layers, Trash2, FileCheck, ClipboardCheck, Share2, X, Info } from "lucide-react";
import { useState, useEffect } from "react";
import MuxPlayer from "@mux/mux-player-react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
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

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedService(null);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const serviceDetails: Record<string, any> = {
    sharepoint: {
      title: "Scan to SharePoint",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&auto=format&fit=crop&q=80",
      description: "Seamlessly integrate your digitised documents directly into Microsoft SharePoint for instant collaboration and accessibility across your organisation.",
      fullDescription: "Our Scan to SharePoint service provides a complete solution for organisations using Microsoft 365. We handle the entire process from document collection to SharePoint integration, ensuring your files are properly organised, tagged, and accessible to the right people.",
      features: [
        "Direct integration with SharePoint Online and on-premises",
        "Automated folder structure creation based on your taxonomy",
        "Metadata tagging and custom properties",
        "Version control and document history",
        "Permission management and access control",
        "Bulk upload capabilities for large document sets",
        "OCR text recognition for searchability",
        "Integration with Microsoft Teams and OneDrive"
      ],
      benefits: [
        "Instant access from anywhere with internet connection",
        "Seamless collaboration across teams",
        "Reduced physical storage costs",
        "Enhanced security with Microsoft's enterprise-grade protection",
        "Automatic backup and disaster recovery"
      ]
    },
    cloud: {
      title: "Scan to Cloud",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
      description: "Upload your documents to popular cloud platforms including Google Drive, Dropbox, OneDrive, and more for flexible access anywhere.",
      fullDescription: "Choose your preferred cloud storage platform and we'll handle the rest. Our multi-platform support ensures your documents are accessible wherever you work, with enterprise-grade security and encryption throughout the process.",
      features: [
        "Support for Google Drive, Dropbox, OneDrive, Box, and more",
        "End-to-end encryption during transfer",
        "Automatic folder synchronisation",
        "Custom naming conventions and organisation",
        "Scheduled uploads and batch processing",
        "Duplicate detection and management",
        "Cloud storage optimisation",
        "Mobile access compatibility"
      ],
      benefits: [
        "Platform flexibility - use your preferred cloud service",
        "Access documents from any device",
        "Scalable storage that grows with your needs",
        "Reduced IT infrastructure costs",
        "Automatic updates and synchronisation"
      ]
    },
    platform: {
      title: "ScanVault Platform",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
      description: "Access our proprietary document management platform, custom-built for maximum security, searchability, and workflow automation.",
      fullDescription: "Experience the power of our exclusive, purpose-built document management platform. Designed specifically for organisations with complex archiving needs, the ScanVault Platform combines AI-powered search, advanced security, and intelligent workflow automation.",
      features: [
        "AI-powered full-text search with natural language processing",
        "Custom workflow automation and approval processes",
        "Advanced analytics and reporting dashboard",
        "Role-based access control with granular permissions",
        "Audit trails and compliance reporting",
        "Automated document classification and tagging",
        "Integration APIs for third-party systems",
        "Mobile apps for iOS and Android",
        "Customisable retention policies",
        "E-signature integration"
      ],
      benefits: [
        "Purpose-built for document archiving excellence",
        "Unmatched search capabilities find documents instantly",
        "Complete audit trail for compliance",
        "Scalable architecture for growing organisations",
        "Dedicated UK-based support team"
      ]
    },
    shredding: {
      title: "Secure Shredding",
      image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=1200&auto=format&fit=crop&q=80",
      description: "Professional document destruction services with full chain of custody and Certificate of Destruction (COD). We handle the shredding so you can focus on your business.",
      fullDescription: "After digitisation, proper disposal of physical documents is crucial for security and compliance. Our secure shredding service provides complete peace of mind with GDPR-compliant destruction, comprehensive documentation, and a legally binding Certificate of Destruction (COD) for every job.",
      features: [
        "Certificate of Destruction (COD) provided for every shredding job",
        "On-site and off-site shredding options",
        "Cross-cut and micro-cut shredding methods",
        "Secure collection in locked containers",
        "Full chain of custody documentation",
        "GDPR and data protection compliance",
        "Scheduled regular collections available",
        "Confidential waste destruction",
        "Hard drive and media destruction",
        "Eco-friendly recycling of shredded materials"
      ],
      benefits: [
        "Legal proof of destruction with official COD certificate",
        "Complete data security and privacy protection",
        "Legal compliance with data protection regulations",
        "Environmental responsibility through recycling",
        "Free up valuable office space",
        "Reduce risk of data breaches"
      ]
    },
    certificate: {
      title: "Certificate of Destruction",
      image: "https://images.unsplash.com/photo-1554224311-beee415c201f?w=1200&auto=format&fit=crop&q=80",
      description: "Receive official documentation certifying the secure destruction of your sensitive documents, ensuring compliance and peace of mind.",
      fullDescription: "Every shredding service includes a comprehensive Certificate of Destruction, providing legal proof that your documents have been securely destroyed in compliance with UK data protection laws.",
      features: [
        "Legally binding destruction certificates",
        "Detailed inventory of destroyed materials",
        "Date, time, and location of destruction",
        "Destruction method documentation",
        "Witness signatures and verification",
        "Digital certificate delivery via email",
        "Secure certificate storage and retrieval",
        "Batch certificates for regular collections",
        "Audit-ready documentation"
      ],
      benefits: [
        "Legal proof of compliance with GDPR",
        "Protection against data breach liability",
        "Audit trail for regulatory inspections",
        "Peace of mind for stakeholders",
        "Professional documentation for records"
      ]
    },
    assessment: {
      title: "Risk Assessment",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80",
      description: "Comprehensive pre-work risk assessment forms provided and agreed upon by both parties before any project commences.",
      fullDescription: "Transparency and safety are paramount. Before any work begins, we conduct a thorough risk assessment covering all aspects of the project, from document handling to data security, ensuring complete alignment between ScanVault and your organisation.",
      features: [
        "Comprehensive site and security assessment",
        "Data protection impact assessment (DPIA)",
        "Physical security evaluation",
        "Access control and permissions review",
        "Document handling procedures documentation",
        "Emergency and contingency planning",
        "Staff vetting and background checks",
        "Insurance and liability coverage review",
        "Mutual agreement and sign-off process"
      ],
      benefits: [
        "Complete transparency before work begins",
        "Identify and mitigate potential risks",
        "Ensure compliance with regulations",
        "Build trust through documented processes",
        "Protect both parties legally"
      ]
    }
  };

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
                Efficient digitalisation processes powered by AI that get your documents online in record time.
              </p>
            </div>

            <div className="group text-center relative">
              <div className="inline-flex w-24 h-24 bg-gradient-to-br from-scanvault-red to-red-600 items-center justify-center mb-6 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Database className="h-12 w-12 text-white" />
                <div className="absolute inset-0 bg-scanvault-red blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
              <h3 className="text-3xl font-bold text-scanvault-black mb-4 group-hover:text-scanvault-red transition-colors">Smart Workflows</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Intelligent categorisation and AI-powered workflow systems for seamless access and management.
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
          </div>
        </div>
      </section>

      {/* Comprehensive Scanning Services Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-50 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-6">
              <Layers className="h-4 w-4 text-scanvault-red" />
              <span className="text-sm font-medium text-scanvault-red">Complete Solutions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-scanvault-black mb-6">
              Professional Scanning Services
            </h2>
            <p className="text-xl text-gray-600">
              From digitization to secure destruction, we provide end-to-end document management solutions tailored to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Scan to SharePoint */}
            <div className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-scanvault-red hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-scanvault-red to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-scanvault-black mb-4">Scan to SharePoint</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Seamlessly integrate your digitised documents directly into Microsoft SharePoint for instant collaboration and accessibility across your organisation.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-scanvault-red flex-shrink-0 mt-0.5" />
                  <span>Direct SharePoint integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-scanvault-red flex-shrink-0 mt-0.5" />
                  <span>Automated folder structure</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-scanvault-red flex-shrink-0 mt-0.5" />
                  <span>Metadata tagging included</span>
                </li>
              </ul>
              <button
                onClick={() => setSelectedService('sharepoint')}
                className="mt-6 w-full bg-scanvault-red hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-lg"
              >
                <Info className="h-5 w-5" />
                More Info
              </button>
            </div>

            {/* Scan to Cloud */}
            <div className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-scanvault-red hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cloud className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-scanvault-black mb-4">Scan to Cloud</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Upload your documents to popular cloud platforms including Google Drive, Dropbox, OneDrive, and more for flexible access anywhere.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>Multi-platform support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>Secure encrypted transfer</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>Automatic synchronization</span>
                </li>
              </ul>
              <button
                onClick={() => setSelectedService('cloud')}
                className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-lg"
              >
                <Info className="h-5 w-5" />
                More Info
              </button>
            </div>

            {/* Bespoke Platform */}
            <div className="group bg-gradient-to-br from-scanvault-red to-red-600 text-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Database className="h-8 w-8 text-white" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full mb-3">
                  <Star className="h-3 w-3" />
                  <span className="text-xs font-semibold">EXCLUSIVE</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">ScanVault Platform</h3>
                <p className="leading-relaxed mb-4 text-white/90">
                  Access our proprietary document management platform, custom-built for maximum security, searchability, and workflow automation.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>AI-powered search</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>Custom workflows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>Advanced analytics</span>
                  </li>
                </ul>
                <button
                  onClick={() => setSelectedService('platform')}
                  className="mt-6 w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Info className="h-5 w-5" />
                  More Info
                </button>
              </div>
            </div>

            {/* Secure Shredding */}
            <div className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-scanvault-red hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trash2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-scanvault-black mb-4">Secure Shredding</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Professional document destruction services with full chain of custody. We handle the shredding so you can focus on your business.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                  <span>On-site or off-site shredding</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                  <span>GDPR compliant</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-700 flex-shrink-0 mt-0.5" />
                  <span>Eco-friendly recycling</span>
                </li>
              </ul>
              <button
                onClick={() => setSelectedService('shredding')}
                className="mt-6 w-full bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-lg"
              >
                <Info className="h-5 w-5" />
                More Info
              </button>
            </div>

            {/* Certificate of Destruction */}
            <div className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-scanvault-red hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-scanvault-black mb-4">Certificate of Destruction</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Receive official documentation certifying the secure destruction of your sensitive documents, ensuring compliance and peace of mind.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Legal proof of destruction</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Audit trail documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Digital certificate delivery</span>
                </li>
              </ul>
              <button
                onClick={() => setSelectedService('certificate')}
                className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-lg"
              >
                <Info className="h-5 w-5" />
                More Info
              </button>
            </div>

            {/* Risk Assessment */}
            <div className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-scanvault-red hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-scanvault-black mb-4">Risk Assessment</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Comprehensive pre-work risk assessment forms provided and agreed upon by both parties before any project commences.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Detailed risk analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Mutual agreement required</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>Signed documentation</span>
                </li>
              </ul>
              <button
                onClick={() => setSelectedService('assessment')}
                className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-lg"
              >
                <Info className="h-5 w-5" />
                More Info
              </button>
            </div>
          </div>

          {/* Professional Standards Banner */}
          <div className="mt-20 bg-gradient-to-r from-scanvault-black via-gray-900 to-scanvault-black text-white rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-scanvault-red rounded-full blur-3xl opacity-20"></div>
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <Shield className="h-16 w-16 text-scanvault-red mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-4">Professional Standards & Compliance</h3>
              <p className="text-lg text-gray-300 mb-8">
                Every project begins with a comprehensive risk assessment form, ensuring complete transparency and mutual agreement before work commences. Our processes are fully compliant with GDPR and industry best practices.
              </p>
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <Lock className="h-8 w-8 text-scanvault-red mx-auto mb-3" />
                  <p className="font-semibold mb-2">GDPR Compliant</p>
                  <p className="text-sm text-gray-400">Full data protection compliance</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <ClipboardCheck className="h-8 w-8 text-scanvault-red mx-auto mb-3" />
                  <p className="font-semibold mb-2">Risk Assessed</p>
                  <p className="text-sm text-gray-400">Pre-approved by both parties</p>
                </div>
              </div>
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
              <span className="text-sm font-medium">Trusted by Leading Organisations</span>
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

      {/* Service Details Modal */}
      {selectedService && serviceDetails[selectedService] && (
        <div 
          className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'}`}
          onClick={handleCloseModal}
        >
          <div 
            className={`bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative ${isClosing ? 'modal-content-exit' : 'modal-content-enter'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-scanvault-red hover:text-white transition-all duration-300 shadow-lg group"
            >
              <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Hero Image */}
            <div className="relative h-80 overflow-hidden rounded-t-3xl">
              <img 
                src={serviceDetails[selectedService].image}
                alt={serviceDetails[selectedService].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h2 className="text-4xl font-bold mb-2">{serviceDetails[selectedService].title}</h2>
                <p className="text-lg text-white/90">{serviceDetails[selectedService].description}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12">
              {/* Full Description */}
              <div className="mb-8">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {serviceDetails[selectedService].fullDescription}
                </p>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-scanvault-black mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-scanvault-red rounded-full"></div>
                  Key Features
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {serviceDetails[selectedService].features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl hover:bg-red-50 transition-colors">
                      <CheckCircle className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-scanvault-black mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-scanvault-red rounded-full"></div>
                  Benefits
                </h3>
                <div className="space-y-3">
                  {serviceDetails[selectedService].benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-4 border-l-4 border-scanvault-red bg-gradient-to-r from-red-50 to-transparent rounded-r-xl">
                      <Star className="h-6 w-6 text-scanvault-red flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-scanvault-black to-gray-900 text-white rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="text-gray-300 mb-6">
                  Contact us today to learn more about {serviceDetails[selectedService].title} and how it can benefit your organisation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/quote">
                    <Button size="lg" className="bg-scanvault-red hover:bg-red-700 text-white px-8 py-6 text-lg rounded-full">
                      Get Free Quote
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg" className="border-2 border-white bg-transparent !text-white hover:bg-white hover:!text-scanvault-black px-8 py-6 text-lg rounded-full">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
