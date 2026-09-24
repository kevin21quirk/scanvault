"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Zap, Database, Lock, CheckCircle, ArrowRight, FileArchive, Star, Sparkles, TrendingUp, Cloud, Layers, Trash2, FileCheck, ClipboardCheck, Share2, X, Info, Mail, Phone, Linkedin } from "lucide-react";
import { useState, useEffect } from "react";
import MuxPlayer from "@mux/mux-player-react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{ icon: React.ReactNode; tag: string; title: string; subtitle: string; detail: string } | null>(null);
  const [sidebarTheme, setSidebarTheme] = useState<string>('hero');
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

  useEffect(() => {
    const detectSection = () => {
      const sections = document.querySelectorAll<HTMLElement>('[data-sidebar-theme]');
      let active = 'hero';
      let maxVisible = 0;
      sections.forEach(el => {
        const r = el.getBoundingClientRect();
        const visTop = Math.max(0, r.top);
        const visBottom = Math.min(window.innerHeight, r.bottom);
        const visible = Math.max(0, visBottom - visTop);
        if (visible > maxVisible) { maxVisible = visible; active = el.dataset.sidebarTheme || 'hero'; }
      });
      setSidebarTheme(active);
    };
    window.addEventListener('scroll', detectSection, { passive: true });
    detectSection();
    return () => window.removeEventListener('scroll', detectSection);
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
      <section data-sidebar-theme="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-scanvault-black via-gray-900 to-scanvault-red">
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

      <section data-sidebar-theme="dark" className="relative py-32 overflow-hidden" style={{background: '#07080f'}}>
        {/* Animated dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(220,38,38,0.18) 1px, transparent 1px)',
          backgroundSize: '44px 44px'
        }}></div>
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{width:'700px',height:'300px',background:'radial-gradient(ellipse, rgba(220,38,38,0.12) 0%, transparent 70%)'}}></div>

        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-scanvault-red to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                 style={{background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.22)'}}>
              <TrendingUp className="h-4 w-4 text-scanvault-red" />
              <span className="text-sm font-medium text-scanvault-red">Industry Leading</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Why Choose ScanVault?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-xl">
              We specialize in transforming paper archives into organized, searchable digital workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Horizontal connecting line */}
            <div className="absolute top-[52px] left-[16.66%] right-[16.66%] h-px hidden md:block"
                 style={{background: 'linear-gradient(to right, transparent, rgba(229,62,62,0.25) 20%, rgba(229,62,62,0.25) 80%, transparent)'}}></div>

            {[
              { icon: <Shield className="h-10 w-10 text-white" />, title: 'Secure & Compliant', desc: 'Enterprise-grade security with full compliance to data protection regulations and industry standards.' },
              { icon: <Zap className="h-10 w-10 text-white" />, title: 'Lightning Fast', desc: 'Efficient digitalisation processes powered by AI that get your documents online in record time.' },
              { icon: <Database className="h-10 w-10 text-white" />, title: 'Smart Workflows', desc: 'Intelligent categorisation and AI-powered workflow systems for seamless access and management.' },
            ].map((feature, i) => (
              <div key={i} className="group text-center relative">
                {/* Multi-ring glowing icon */}
                <div className="relative inline-flex w-[104px] h-[104px] items-center justify-center mb-8">
                  {/* Outer pulsing ring */}
                  <div className="absolute w-[104px] h-[104px] rounded-full border border-scanvault-red/20 animate-neon-pulse"></div>
                  {/* Mid ring */}
                  <div className="absolute w-[84px] h-[84px] rounded-full border border-scanvault-red/30 group-hover:border-scanvault-red/60 transition-colors duration-500"></div>
                  {/* Glow halo */}
                  <div className="absolute w-16 h-16 rounded-full bg-scanvault-red blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>
                  {/* Icon circle */}
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-scanvault-red to-red-700 flex items-center justify-center z-10
                                  group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-red-900/40">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-scanvault-red transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-base max-w-xs mx-auto">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-scanvault-red to-transparent"></div>
      </section>

      <section data-sidebar-theme="white" className="relative py-32 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
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

      {/* Glassmorphism Showcase Section */}
      {(() => {
        const glassCards = [
          { icon: <Share2 className="h-7 w-7 text-white" />, tag: "Integration", title: "Scan to SharePoint", subtitle: "Microsoft 365 Ready", detail: "Seamlessly push scanned documents directly into your SharePoint libraries with automated metadata tagging and folder structures." },
          { icon: <Cloud className="h-7 w-7 text-white" />, tag: "Cloud", title: "Scan to Cloud", subtitle: "AWS · Azure · Google", detail: "Upload and organise your digitised archives into any major cloud provider with fully encrypted, secure transfers." },
          { icon: <Database className="h-7 w-7 text-white" />, tag: "Exclusive", title: "ScanVault Platform", subtitle: "Our Proprietary System", detail: "Full-featured document management portal with advanced search, role-based access controls, and a complete audit trail." },
          { icon: <Trash2 className="h-7 w-7 text-white" />, tag: "Compliance", title: "Secure Shredding", subtitle: "GDPR Compliant", detail: "Certified document destruction with a legally binding Certificate of Destruction issued for every single job." },
          { icon: <FileCheck className="h-7 w-7 text-white" />, tag: "Certified", title: "Certificate of Destruction", subtitle: "Official Documentation", detail: "Receive an official COD after every shredding engagement — giving you full legal proof and peace of mind." },
          { icon: <ClipboardCheck className="h-7 w-7 text-white" />, tag: "Pre-Work", title: "Risk Assessment", subtitle: "Agreed Before We Start", detail: "Comprehensive risk assessment forms completed and signed by both parties before any project commences." },
        ];
        return (
          <section data-sidebar-theme="image" className="relative h-[580px] overflow-hidden">
            {/* Warm, well-lit office background — barely darkened so the room is clearly visible */}
            <img
              src="https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=1600&auto=format&fit=crop&q=85"
              alt="Office background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Very light overlay — room stays clearly visible */}
            <div className="absolute inset-0" style={{ background: 'rgba(10,10,20,0.28)' }}></div>

            {/* Heading */}
            <div className="absolute top-10 left-0 right-0 text-center z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/25 mb-3" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
                <Sparkles className="h-4 w-4 text-scanvault-red" />
                <span className="text-sm font-medium text-white/90">Our Capabilities</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                Everything Your Business Needs
              </h2>
            </div>

            {/* Cards strip — centred vertically, no panel background */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 z-10">

              {/* LEVEL 1: Perspective space — vanishing point on left so left = far, right = near */}
              <div style={{ perspective: '1200px', perspectiveOrigin: '25% 50%', overflow: 'hidden' }}>

                {/* LEVEL 2: Tilt the plane — rotateY(+18deg) pushes left side back, brings right side forward */}
                <div style={{ transform: 'rotateY(18deg)', transformStyle: 'preserve-3d' }}>

                  {/* LEVEL 3: Reversed scroll — cards enter from left, exit right */}
                  <div className="animate-scroll-cards-right gap-4 py-10 px-6">
                      {[...glassCards, ...glassCards].map((card, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedCard(card)}
                          className="flex-shrink-0 rounded-2xl overflow-hidden flex cursor-pointer transition-transform duration-200 hover:scale-[1.03] hover:brightness-125"
                          style={{
                            width: '420px',
                            height: '230px',
                            background: 'rgba(255,255,255,0.07)',
                            backdropFilter: 'blur(22px)',
                            WebkitBackdropFilter: 'blur(22px)',
                            border: '1px solid rgba(255,255,255,0.22)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 20px rgba(0,0,0,0.2)',
                          }}
                        >
                          {/* Left icon panel */}
                          <div
                            className="w-20 flex-shrink-0 flex flex-col items-center justify-center gap-3"
                            style={{ borderRight: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}
                          >
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                            >
                              {card.icon}
                            </div>
                            <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.2)' }}></div>
                            <span className="text-scanvault-red text-xs font-black" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.15em' }}>SV</span>
                          </div>

                          {/* Right text panel */}
                          <div className="flex-1 p-5 flex flex-col justify-center">
                            <span className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{card.tag}</span>
                            <h3 className="text-base font-bold text-white mb-0.5 leading-tight">{card.title}</h3>
                            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>{card.subtitle}</p>
                            <div className="w-8 h-px bg-scanvault-red mb-3"></div>
                            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>{card.detail}</p>
                          </div>
                        </div>
                      ))}
                  </div>

                </div>
              </div>
            </div>

            {/* Left edge fade — cards emerge from the left background */}
            <div className="absolute top-0 left-0 h-full w-48 z-20 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(10,10,20,0.92), transparent)' }}></div>
            {/* Right edge fade — cards exit to the right */}
            <div className="absolute top-0 right-0 h-full w-32 z-20 pointer-events-none" style={{ background: 'linear-gradient(to left, rgba(10,10,20,0.7), transparent)' }}></div>
          </section>
        );
      })()}

      {/* Comprehensive Scanning Services — Bento Grid */}
      <section data-sidebar-theme="dark" className="relative py-24 overflow-hidden" style={{background: '#060810'}}>
        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
        {/* Ambient glows */}
        <div className="absolute top-0 left-0 pointer-events-none" style={{width:'500px',height:'500px',background:'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)'}}></div>
        <div className="absolute bottom-0 right-0 pointer-events-none" style={{width:'500px',height:'500px',background:'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)'}}></div>
        {/* Sweep line */}
        <div className="animate-scan-vertical absolute left-0 right-0 h-px z-10 pointer-events-none"
             style={{background:'linear-gradient(to right,transparent 5%,rgba(220,38,38,0.6) 50%,transparent 95%)'}}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                 style={{background:'rgba(220,38,38,0.08)',border:'1px solid rgba(220,38,38,0.22)'}}>
              <Layers className="h-4 w-4 text-scanvault-red" />
              <span className="text-sm font-medium text-scanvault-red">Complete Solutions</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Professional Scanning Services</h2>
            <p className="text-xl text-gray-400">From digitization to secure destruction — end-to-end document management built for your business.</p>
          </div>

          {/* ── BENTO GRID ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">

            {/* ── FEATURED: ScanVault Platform (col-span-2) ── */}
            <div
              className="group relative md:col-span-2 rounded-3xl p-8 overflow-hidden cursor-default transition-all duration-500 hover:-translate-y-1"
              style={{background:'linear-gradient(135deg,rgba(220,38,38,0.18) 0%,rgba(10,10,20,0.9) 60%)',border:'1px solid rgba(220,38,38,0.30)',boxShadow:'0 8px 48px rgba(220,38,38,0.1)'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 12px 64px rgba(220,38,38,0.22)';(e.currentTarget as HTMLElement).style.borderColor='rgba(220,38,38,0.55)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow='0 8px 48px rgba(220,38,38,0.1)';(e.currentTarget as HTMLElement).style.borderColor='rgba(220,38,38,0.30)';}}
            >
              {/* Glow orb inside card */}
              <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{background:'radial-gradient(circle at top right,rgba(220,38,38,0.18),transparent 65%)'}}></div>
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl" style={{background:'linear-gradient(to right,#DC2626,rgba(220,38,38,0.2))'}}></div>
              <div className="relative flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:'rgba(220,38,38,0.2)',border:'1px solid rgba(220,38,38,0.4)'}}>
                    <Database className="h-7 w-7 text-scanvault-red" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{background:'rgba(220,38,38,0.15)',border:'1px solid rgba(220,38,38,0.3)'}}>
                    <Star className="h-3 w-3 text-scanvault-red" />
                    <span className="text-xs font-bold tracking-widest uppercase text-scanvault-red">Exclusive</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">ScanVault Platform</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-lg">Access our proprietary document management platform, custom-built for maximum security, AI-powered searchability, and workflow automation — purpose-built for UK businesses.</p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[['AI Search','Instant full-text retrieval'],['Workflows','Custom approval flows'],['Analytics','Real-time dashboards']].map(([label,sub])=>(
                    <div key={label} className="rounded-xl p-3" style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)'}}>
                      <p className="text-white text-xs font-bold mb-1">{label}</p>
                      <p className="text-gray-500 text-[10px] leading-snug">{sub}</p>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setSelectedService('platform')}
                  className="mt-auto w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white transition-all duration-300 hover:opacity-90"
                  style={{background:'linear-gradient(135deg,#DC2626,#991b1b)'}}>
                  <Info className="h-4 w-4" /> Learn More
                </button>
              </div>
            </div>

            {/* ── Scan to SharePoint ── */}
            <div
              className="group relative rounded-3xl p-6 overflow-hidden cursor-default transition-all duration-500 hover:-translate-y-1"
              style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 4px 24px rgba(0,0,0,0.4)'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(220,38,38,0.4)';(e.currentTarget as HTMLElement).style.boxShadow='0 8px 40px rgba(220,38,38,0.12)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.08)';(e.currentTarget as HTMLElement).style.boxShadow='0 4px 24px rgba(0,0,0,0.4)';}}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" style={{background:'linear-gradient(to right,#DC2626,transparent)'}}></div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{background:'rgba(220,38,38,0.12)',border:'1px solid rgba(220,38,38,0.22)'}}>
                <Share2 className="h-6 w-6 text-scanvault-red" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Scan to SharePoint</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-4">Seamlessly push digitised documents into Microsoft SharePoint with automated metadata and folder structures.</p>
              <ul className="space-y-1.5 mb-5">
                {['Direct SharePoint integration','Automated folder structure','Metadata tagging'].map(b=>(
                  <li key={b} className="flex items-center gap-2 text-xs text-gray-500"><div className="w-1 h-1 rounded-full bg-scanvault-red flex-shrink-0"></div>{b}</li>
                ))}
              </ul>
              <button onClick={()=>setSelectedService('sharepoint')}
                className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 text-scanvault-red transition-all duration-300 hover:bg-scanvault-red hover:text-white"
                style={{background:'rgba(220,38,38,0.06)',border:'1px solid rgba(220,38,38,0.2)'}}>
                <Info className="h-3.5 w-3.5" /> More Info
              </button>
            </div>

            {/* ── Scan to Cloud ── */}
            <div
              className="group relative rounded-3xl p-6 overflow-hidden cursor-default transition-all duration-500 hover:-translate-y-1"
              style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 4px 24px rgba(0,0,0,0.4)'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(59,130,246,0.45)';(e.currentTarget as HTMLElement).style.boxShadow='0 8px 40px rgba(59,130,246,0.12)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.08)';(e.currentTarget as HTMLElement).style.boxShadow='0 4px 24px rgba(0,0,0,0.4)';}}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" style={{background:'linear-gradient(to right,#3b82f6,transparent)'}}></div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{background:'rgba(59,130,246,0.12)',border:'1px solid rgba(59,130,246,0.22)'}}>
                <Cloud className="h-6 w-6" style={{color:'#3b82f6'}} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Scan to Cloud</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-4">Upload to Google Drive, Dropbox, OneDrive and more with encrypted, secure transfers from anywhere.</p>
              <ul className="space-y-1.5 mb-5">
                {['Multi-platform support','Encrypted transfer','Auto sync'].map(b=>(
                  <li key={b} className="flex items-center gap-2 text-xs text-gray-500"><div className="w-1 h-1 rounded-full flex-shrink-0" style={{background:'#3b82f6'}}></div>{b}</li>
                ))}
              </ul>
              <button onClick={()=>setSelectedService('cloud')}
                className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300"
                style={{background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.2)',color:'#3b82f6'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background='#3b82f6';el.style.color='#fff';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(59,130,246,0.06)';el.style.color='#3b82f6';}}>
                <Info className="h-3.5 w-3.5" /> More Info
              </button>
            </div>

            {/* ── Secure Shredding ── */}
            <div
              className="group relative rounded-3xl p-6 overflow-hidden cursor-default transition-all duration-500 hover:-translate-y-1"
              style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 4px 24px rgba(0,0,0,0.4)'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(107,114,128,0.5)';(e.currentTarget as HTMLElement).style.boxShadow='0 8px 40px rgba(107,114,128,0.1)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.08)';(e.currentTarget as HTMLElement).style.boxShadow='0 4px 24px rgba(0,0,0,0.4)';}}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" style={{background:'linear-gradient(to right,#6b7280,transparent)'}}></div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{background:'rgba(107,114,128,0.12)',border:'1px solid rgba(107,114,128,0.22)'}}>
                <Trash2 className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Secure Shredding</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-4">GDPR-compliant document destruction with full chain of custody — on-site or off-site.</p>
              <ul className="space-y-1.5 mb-5">
                {['On-site or off-site','GDPR compliant','Eco recycling'].map(b=>(
                  <li key={b} className="flex items-center gap-2 text-xs text-gray-500"><div className="w-1 h-1 rounded-full bg-gray-500 flex-shrink-0"></div>{b}</li>
                ))}
              </ul>
              <button onClick={()=>setSelectedService('shredding')}
                className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 text-gray-400 transition-all duration-300 hover:bg-gray-600 hover:text-white"
                style={{background:'rgba(107,114,128,0.06)',border:'1px solid rgba(107,114,128,0.2)'}}>
                <Info className="h-3.5 w-3.5" /> More Info
              </button>
            </div>

            {/* ── Bottom row: Certificate + Risk Assessment (wide) ── */}
            <div
              className="group relative rounded-3xl p-6 overflow-hidden cursor-default transition-all duration-500 hover:-translate-y-1"
              style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 4px 24px rgba(0,0,0,0.4)'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(34,197,94,0.4)';(e.currentTarget as HTMLElement).style.boxShadow='0 8px 40px rgba(34,197,94,0.1)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.08)';(e.currentTarget as HTMLElement).style.boxShadow='0 4px 24px rgba(0,0,0,0.4)';}}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" style={{background:'linear-gradient(to right,#22c55e,transparent)'}}></div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.22)'}}>
                <FileCheck className="h-6 w-6" style={{color:'#22c55e'}} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Certificate of Destruction</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-4">Official COD issued after every shredding job — legally binding proof and complete audit trail.</p>
              <ul className="space-y-1.5 mb-5">
                {['Legal proof','Audit trail','Digital delivery'].map(b=>(
                  <li key={b} className="flex items-center gap-2 text-xs text-gray-500"><div className="w-1 h-1 rounded-full flex-shrink-0" style={{background:'#22c55e'}}></div>{b}</li>
                ))}
              </ul>
              <button onClick={()=>setSelectedService('certificate')}
                className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300"
                style={{background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.2)',color:'#22c55e'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background='#22c55e';el.style.color='#fff';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(34,197,94,0.06)';el.style.color='#22c55e';}}>
                <Info className="h-3.5 w-3.5" /> More Info
              </button>
            </div>

            {/* ── Risk Assessment (wide, 2-col) ── */}
            <div
              className="group relative md:col-span-2 rounded-3xl p-6 overflow-hidden cursor-default transition-all duration-500 hover:-translate-y-1"
              style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 4px 24px rgba(0,0,0,0.4)'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(249,115,22,0.4)';(e.currentTarget as HTMLElement).style.boxShadow='0 8px 40px rgba(249,115,22,0.1)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.08)';(e.currentTarget as HTMLElement).style.boxShadow='0 4px 24px rgba(0,0,0,0.4)';}}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700" style={{background:'linear-gradient(to right,#f97316,transparent)'}}></div>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:'rgba(249,115,22,0.12)',border:'1px solid rgba(249,115,22,0.22)'}}>
                  <ClipboardCheck className="h-6 w-6" style={{color:'#f97316'}} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white mb-1">Risk Assessment</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">Comprehensive pre-work risk assessment forms agreed and signed by both parties before any project commences — ensuring complete transparency.</p>
                </div>
                <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
                  {['Risk analysis','Mutual agreement','Signed docs'].map(b=>(
                    <span key={b} className="text-[10px] px-2 py-1 rounded-full" style={{background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.2)',color:'#f97316'}}>{b}</span>
                  ))}
                </div>
                <button onClick={()=>setSelectedService('assessment')}
                  className="flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-300"
                  style={{background:'rgba(249,115,22,0.08)',border:'1px solid rgba(249,115,22,0.25)',color:'#f97316'}}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background='#f97316';el.style.color='#fff';}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background='rgba(249,115,22,0.08)';el.style.color='#f97316';}}>
                  <Info className="h-3.5 w-3.5" /> More Info
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Professional Standards Banner — own section so sidebar theme detection works */}
      <section data-sidebar-theme="dark" className="bg-white pb-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-scanvault-black via-gray-900 to-scanvault-black text-white rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-scanvault-red rounded-full blur-3xl opacity-20"></div>
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <Shield className="h-16 w-16 text-scanvault-red mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-4">Professional Standards & Compliance</h3>
              <p className="text-lg text-gray-300 mb-8">
                Every project begins with a comprehensive risk assessment form, ensuring complete transparency and mutual agreement before work commences. Our processes are fully compliant with GDPR and industry best practices.
              </p>
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {[
                  {
                    icon: <Lock className="h-7 w-7 text-white" />,
                    tag: 'Compliance',
                    title: 'GDPR Compliant',
                    subtitle: 'Full Data Protection Compliance',
                    detail: 'Every project we undertake is fully compliant with GDPR and industry data protection best practices. Your documents and data are handled with the highest levels of security and confidentiality throughout the entire digitisation and archiving process.',
                    displayIcon: <Lock className="h-8 w-8 text-scanvault-red mx-auto mb-3" />,
                  },
                  {
                    icon: <ClipboardCheck className="h-7 w-7 text-white" />,
                    tag: 'Pre-Work',
                    title: 'Risk Assessed',
                    subtitle: 'Pre-Approved by Both Parties',
                    detail: 'Every project begins with a comprehensive risk assessment form, ensuring complete transparency and mutual agreement before work commences. This protects both parties and ensures every process is agreed, documented, and signed off from the very start.',
                    displayIcon: <ClipboardCheck className="h-8 w-8 text-scanvault-red mx-auto mb-3" />,
                  },
                ].map((card, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedCard({ icon: card.icon, tag: card.tag, title: card.title, subtitle: card.subtitle, detail: card.detail })}
                    className="cursor-pointer rounded-xl p-6 transition-all duration-300 hover:scale-[1.04] hover:brightness-125"
                    style={{
                      background: 'rgba(255,255,255,0.10)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.25)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.12)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)';
                    }}
                  >
                    {card.displayIcon}
                    <p className="font-semibold mb-2">{card.title}</p>
                    <p className="text-sm text-gray-400">{card.subtitle}</p>
                    <p className="text-xs text-white/40 mt-3 tracking-wider uppercase">Click to learn more →</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section data-sidebar-theme="dark" className="py-24 bg-gradient-to-br from-scanvault-black via-gray-900 to-scanvault-black text-white relative overflow-hidden">
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
          className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 ${isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'}`}
          onClick={handleCloseModal}
        >
          <div 
            className={`bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative ${isClosing ? 'modal-content-exit' : 'modal-content-enter'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-scanvault-red hover:text-white transition-all duration-300 shadow-lg group"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Hero Image */}
            <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
              <img 
                src={serviceDetails[selectedService].image}
                alt={serviceDetails[selectedService].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 right-4 sm:right-6 md:right-8 text-white">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{serviceDetails[selectedService].title}</h2>
                <p className="text-sm sm:text-base md:text-lg text-white/90 line-clamp-2">{serviceDetails[selectedService].description}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-12">
              {/* Full Description */}
              <div className="mb-6 sm:mb-8">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  {serviceDetails[selectedService].fullDescription}
                </p>
              </div>

              {/* Features */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-scanvault-black mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <div className="w-1 h-6 sm:h-8 bg-scanvault-red rounded-full"></div>
                  Key Features
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  {serviceDetails[selectedService].features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3 bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-red-50 transition-colors">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-scanvault-red flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-scanvault-black mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <div className="w-1 h-6 sm:h-8 bg-scanvault-red rounded-full"></div>
                  Benefits
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {serviceDetails[selectedService].benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border-l-4 border-scanvault-red bg-gradient-to-r from-red-50 to-transparent rounded-r-lg sm:rounded-r-xl">
                      <Star className="h-5 w-5 sm:h-6 sm:w-6 text-scanvault-red flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base text-gray-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-scanvault-black to-gray-900 text-white rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Ready to Get Started?</h3>
                <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
                  Contact us today to learn more about {serviceDetails[selectedService].title} and how it can benefit your organisation.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link href="/quote" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto bg-scanvault-red hover:bg-red-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full">
                      Get Free Quote
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </Link>
                  <Link href="/contact" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-white bg-transparent !text-white hover:bg-white hover:!text-scanvault-black px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Fixed glassmorphism social / contact sidebar — theme adapts per section */}
      {(() => {
        const tr = 'all 0.4s ease';
        type SidebarTheme = { panel: React.CSSProperties; icon: React.CSSProperties; contactIcon: React.CSSProperties; label: React.CSSProperties; text: React.CSSProperties; iconCls: string; contactIconCls: string };
        const themes: Record<string, SidebarTheme> = {
          // Ultra-transparent on dark video hero
          hero: {
            panel: { background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: 'none', transition: tr },
            icon: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', transition: tr },
            contactIcon: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(229,62,62,0.30)', transition: tr },
            label: { color: 'rgba(255,255,255,0.45)', transition: tr },
            text: { color: 'rgba(255,255,255,0.65)', transition: tr },
            iconCls: 'h-5 w-5 text-white', contactIconCls: 'h-6 w-6 text-white',
          },
          // Light translucent glass on white/light sections — background shows through, dark icons/text
          white: {
            panel: { background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', transition: tr },
            icon: { background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.10)', transition: tr },
            contactIcon: { background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(220,38,38,0.40)', transition: tr },
            label: { color: 'rgba(0,0,0,0.45)', transition: tr },
            text: { color: 'rgba(0,0,0,0.60)', transition: tr },
            iconCls: 'h-5 w-5 text-gray-700', contactIconCls: 'h-6 w-6 text-gray-700',
          },
          // Classic light glass on image backgrounds — matches carousel cards
          image: {
            panel: { background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.22)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 20px rgba(0,0,0,0.18)', transition: tr },
            icon: { background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)', transition: tr },
            contactIcon: { background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(229,62,62,0.45)', transition: tr },
            label: { color: 'rgba(255,255,255,0.50)', transition: tr },
            text: { color: 'rgba(255,255,255,0.72)', transition: tr },
            iconCls: 'h-5 w-5 text-white', contactIconCls: 'h-6 w-6 text-white',
          },
          // Light glass on dark sections (CTA/footer) — same recipe as image
          dark: {
            panel: { background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.22)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 20px rgba(0,0,0,0.18)', transition: tr },
            icon: { background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)', transition: tr },
            contactIcon: { background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(229,62,62,0.45)', transition: tr },
            label: { color: 'rgba(255,255,255,0.50)', transition: tr },
            text: { color: 'rgba(255,255,255,0.72)', transition: tr },
            iconCls: 'h-5 w-5 text-white', contactIconCls: 'h-6 w-6 text-white',
          },
        };
        const t = themes[sidebarTheme] ?? themes.hero;
        const { panel: panelStyle, contactIcon: contactIconStyle, label: labelStyle, text: contactTextStyle, contactIconCls } = t;
        const labelClass = 'text-[10px] font-semibold tracking-[0.2em] uppercase text-center mb-3';
        const isCarousel = sidebarTheme === 'image';

        return (
          <div
            className="fixed z-50 hidden sm:flex gap-3 transition-all duration-500"
            style={isCarousel
              ? { bottom: '16px', left: '50%', transform: 'translateX(-50%)', flexDirection: 'row', alignItems: 'flex-end' }
              : { right: '20px', top: '50%', transform: 'translateY(-50%)', flexDirection: 'column', width: '144px' }
            }
          >

            {/* — Email panel — */}
            <a href="mailto:info@scanvault.co.uk" className="block rounded-2xl p-4 transition-all duration-300 hover:scale-[1.04] hover:brightness-110"
              style={panelStyle}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = (panelStyle.boxShadow as string) || 'none'; (e.currentTarget as HTMLElement).style.borderColor = ''; }}
            >
              <p className={labelClass} style={labelStyle}>Email</p>
              {isCarousel ? (
                <div className="flex flex-row items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={contactIconStyle}>
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-[9px] leading-snug break-all" style={contactTextStyle}>info@scanvault.co.uk</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={contactIconStyle}>
                    <Mail className={contactIconCls} />
                  </div>
                  <p className="text-[10px] text-center leading-snug break-all" style={contactTextStyle}>info@scanvault.co.uk</p>
                </div>
              )}
            </a>

            {/* — Phone panel — */}
            <a href="tel:+447359969266" className="block rounded-2xl p-4 transition-all duration-300 hover:scale-[1.04] hover:brightness-110"
              style={panelStyle}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = (panelStyle.boxShadow as string) || 'none'; (e.currentTarget as HTMLElement).style.borderColor = ''; }}
            >
              <p className={labelClass} style={labelStyle}>Phone</p>
              {isCarousel ? (
                <div className="flex flex-row items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={contactIconStyle}>
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-[9px] leading-snug" style={contactTextStyle}>+44 7359 969266</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={contactIconStyle}>
                    <Phone className={contactIconCls} />
                  </div>
                  <p className="text-[10px] text-center leading-snug" style={contactTextStyle}>+44 7359 969266</p>
                </div>
              )}
            </a>

            {/* — LinkedIn panel — */}
            <a href="https://www.linkedin.com/company/scanvault-limited/" target="_blank" rel="noopener noreferrer" className="block rounded-2xl p-4 transition-all duration-300 hover:scale-[1.04] hover:brightness-110"
              style={panelStyle}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.25)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = (panelStyle.boxShadow as string) || 'none'; (e.currentTarget as HTMLElement).style.borderColor = ''; }}
            >
              <p className={labelClass} style={labelStyle}>LinkedIn</p>
              {isCarousel ? (
                <div className="flex flex-row items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={contactIconStyle}>
                    <Linkedin className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-[9px] leading-snug" style={contactTextStyle}>ScanVault Ltd</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={contactIconStyle}>
                    <Linkedin className={contactIconCls} />
                  </div>
                  <p className="text-[10px] text-center leading-snug" style={contactTextStyle}>ScanVault Ltd</p>
                </div>
              )}
            </a>

          </div>
        );
      })()}

      {/* Expanded glass card modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-backdrop-reveal"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', perspective: '1400px' }}
          onClick={() => setSelectedCard(null)}
        >
          {/* Expanded card — cinematic entrance */}
          <div
            className="relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden animate-card-expand"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(255,255,255,0.05), 0 32px 80px rgba(0,0,0,0.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Glowing red top accent line */}
            <div className="h-[2px] w-full" style={{ background: 'linear-gradient(to right, transparent, #e53e3e, transparent)' }} />

            {/* Inner glow overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(229,62,62,0.08) 0%, transparent 60%)' }} />

            {/* Close button */}
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <X className="h-4 w-4 text-white/80" />
            </button>

            {/* Mobile: stacked vertically. sm+: side by side */}
            <div className="flex flex-col sm:flex-row">
              {/* Mobile: horizontal icon bar. sm+: vertical icon column */}
              <div
                className="flex sm:flex-col items-center justify-start sm:justify-center gap-4 sm:gap-5 px-6 py-5 sm:px-0 sm:py-12 sm:w-28 flex-shrink-0 border-b sm:border-b-0 sm:border-r"
                style={{
                  borderColor: 'rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                {/* Glowing icon */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 rounded-2xl blur-xl" style={{ background: 'rgba(229,62,62,0.3)' }} />
                  <div
                    className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    {selectedCard.icon}
                  </div>
                </div>
                {/* Divider — horizontal on mobile, vertical on sm+ */}
                <div className="h-px w-10 sm:h-10 sm:w-px flex-shrink-0" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.15), transparent)' }} />
                <span className="text-scanvault-red text-xs font-black tracking-[0.2em] sm:hidden">SCANVAULT</span>
                <span className="text-scanvault-red text-xs font-black hidden sm:inline-block" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.2em' }}>SCANVAULT</span>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center">
                <span className="text-xs font-semibold tracking-[0.25em] uppercase mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{selectedCard.tag}</span>
                <h2 className="text-xl sm:text-3xl font-bold text-white mb-1 leading-tight">{selectedCard.title}</h2>
                <p className="text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>{selectedCard.subtitle}</p>

                <div className="w-12 h-px mb-4 sm:mb-6" style={{ background: 'linear-gradient(to right, #e53e3e, transparent)' }} />

                <p className="text-sm sm:text-base leading-relaxed mb-6 sm:mb-10" style={{ color: 'rgba(255,255,255,0.75)' }}>{selectedCard.detail}</p>

                <div className="flex flex-wrap gap-3">
                  <Link href="/quote" onClick={() => setSelectedCard(null)}>
                    <Button className="bg-scanvault-red hover:bg-red-700 text-white rounded-full px-5 sm:px-7 py-4 sm:py-5 text-sm font-semibold shadow-lg shadow-red-900/30">
                      Get a Quote <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/contact" onClick={() => setSelectedCard(null)}>
                    <Button
                      variant="outline"
                      className="rounded-full px-5 sm:px-7 py-4 sm:py-5 text-sm font-semibold text-white hover:text-white hover:bg-white/10"
                      style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)' }}
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)' }} />
          </div>
        </div>
      )}
    </div>
  );
}
