"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Phone, ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-scanvault-black text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="font-semibold text-xs sm:text-sm">+44 7359 969266</span>
              </div>
              <span className="text-gray-400 hidden md:inline">Total Information Management</span>
            </div>
            <Link href="/quote">
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-scanvault-black font-bold text-xs sm:text-sm px-2 sm:px-4">
                FREE Quick Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center">
              <span className="text-xl sm:text-2xl font-bold text-scanvault-black">
                Scan<span className="text-scanvault-red">Vault</span>
              </span>
            </Link>

            {/* Hamburger Menu Button - Mobile Only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-scanvault-black hover:text-scanvault-red transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium text-scanvault-black hover:text-scanvault-red transition-colors">
                Home
              </Link>

              {/* Services Mega Menu */}
              <div 
                className="relative group"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <button className="flex items-center gap-1 text-sm font-medium text-scanvault-black hover:text-scanvault-red transition-colors py-6">
                  Services
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {servicesOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[700px]">
                    <div className="bg-white border border-gray-200 shadow-2xl rounded-lg p-8">
                      <div className="grid grid-cols-3 gap-8">
                        <div>
                          <h3 className="font-bold text-scanvault-black mb-4 text-base">Document Services</h3>
                          <ul className="space-y-3">
                            <li><Link href="/services/document-scanning" className="text-sm text-gray-600 hover:text-scanvault-red block py-1">Document Scanning</Link></li>
                            <li><Link href="/services/document-archiving" className="text-sm text-gray-600 hover:text-scanvault-red block py-1">Document Archiving</Link></li>
                            <li><Link href="/services/digital-conversion" className="text-sm text-gray-600 hover:text-scanvault-red block py-1">Digital Conversion</Link></li>
                            <li><Link href="/services/data-capture" className="text-sm text-gray-600 hover:text-scanvault-red block py-1">Data Capture</Link></li>
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-bold text-scanvault-black mb-4 text-base">Specialised Solutions</h3>
                          <ul className="space-y-3">
                            <li><Link href="/services/hr-records" className="text-sm text-gray-600 hover:text-scanvault-red block py-1">HR Records Management</Link></li>
                            <li><Link href="/services/financial-documents" className="text-sm text-gray-600 hover:text-scanvault-red block py-1">Financial Documents</Link></li>
                            <li><Link href="/services/client-records" className="text-sm text-gray-600 hover:text-scanvault-red block py-1">Client Records</Link></li>
                            <li><Link href="/services/compliance" className="text-sm text-gray-600 hover:text-scanvault-red block py-1">Compliance Solutions</Link></li>
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-bold text-scanvault-black mb-4 text-base">Industries</h3>
                          <ul className="space-y-3">
                            <li><Link href="/services/healthcare" className="text-sm text-gray-600 hover:text-scanvault-red block py-1">Healthcare</Link></li>
                            <li><Link href="/services/legal" className="text-sm text-gray-600 hover:text-scanvault-red block py-1">Legal</Link></li>
                            <li><Link href="/services/finance" className="text-sm text-gray-600 hover:text-scanvault-red block py-1">Finance</Link></li>
                            <li><Link href="/services/government" className="text-sm text-gray-600 hover:text-scanvault-red block py-1">Government</Link></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/about" className="text-sm font-medium text-scanvault-black hover:text-scanvault-red transition-colors">
                About Us
              </Link>
              
              <Link href="/services" className="text-sm font-medium text-scanvault-black hover:text-scanvault-red transition-colors">
                Resources
              </Link>

              <Link href="/contact" className="text-sm font-medium text-scanvault-black hover:text-scanvault-red transition-colors">
                Contact Us
              </Link>

              {session ? (
                <>
                  <Link href="/portal" className="text-sm font-medium text-scanvault-black hover:text-scanvault-red transition-colors">
                    Portal
                  </Link>
                  {session.user.role === "ADMIN" && (
                    <Link href="/admin" className="text-sm font-medium text-scanvault-black hover:text-scanvault-red transition-colors">
                      Admin
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="border-scanvault-red text-scanvault-red hover:bg-scanvault-red hover:text-white"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="bg-scanvault-red hover:bg-red-700 text-white font-semibold">
                    Client Login
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/" 
                  className="text-base font-medium text-scanvault-black hover:text-scanvault-red transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>

                {/* Mobile Services Accordion */}
                <div>
                  <button
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    className="w-full flex items-center justify-between text-base font-medium text-scanvault-black hover:text-scanvault-red transition-colors px-2 py-2"
                  >
                    Services
                    <ChevronDown className={`h-4 w-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {mobileServicesOpen && (
                    <div className="mt-2 ml-4 space-y-3 pb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-scanvault-black mb-2">Document Services</h4>
                        <div className="space-y-2">
                          <Link href="/services/document-scanning" className="block text-sm text-gray-600 hover:text-scanvault-red py-1" onClick={() => setMobileMenuOpen(false)}>Document Scanning</Link>
                          <Link href="/services/document-archiving" className="block text-sm text-gray-600 hover:text-scanvault-red py-1" onClick={() => setMobileMenuOpen(false)}>Document Archiving</Link>
                          <Link href="/services/digital-conversion" className="block text-sm text-gray-600 hover:text-scanvault-red py-1" onClick={() => setMobileMenuOpen(false)}>Digital Conversion</Link>
                          <Link href="/services/data-capture" className="block text-sm text-gray-600 hover:text-scanvault-red py-1" onClick={() => setMobileMenuOpen(false)}>Data Capture</Link>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-scanvault-black mb-2">Specialised Solutions</h4>
                        <div className="space-y-2">
                          <Link href="/services/hr-records" className="block text-sm text-gray-600 hover:text-scanvault-red py-1" onClick={() => setMobileMenuOpen(false)}>HR Records Management</Link>
                          <Link href="/services/financial-documents" className="block text-sm text-gray-600 hover:text-scanvault-red py-1" onClick={() => setMobileMenuOpen(false)}>Financial Documents</Link>
                          <Link href="/services/client-records" className="block text-sm text-gray-600 hover:text-scanvault-red py-1" onClick={() => setMobileMenuOpen(false)}>Client Records</Link>
                          <Link href="/services/compliance" className="block text-sm text-gray-600 hover:text-scanvault-red py-1" onClick={() => setMobileMenuOpen(false)}>Compliance Solutions</Link>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-scanvault-black mb-2">Industries</h4>
                        <div className="space-y-2">
                          <Link href="/services/healthcare" className="block text-sm text-gray-600 hover:text-scanvault-red py-1" onClick={() => setMobileMenuOpen(false)}>Healthcare</Link>
                          <Link href="/services/legal" className="block text-sm text-gray-600 hover:text-scanvault-red py-1" onClick={() => setMobileMenuOpen(false)}>Legal</Link>
                          <Link href="/services/finance" className="block text-sm text-gray-600 hover:text-scanvault-red py-1" onClick={() => setMobileMenuOpen(false)}>Finance</Link>
                          <Link href="/services/government" className="block text-sm text-gray-600 hover:text-scanvault-red py-1" onClick={() => setMobileMenuOpen(false)}>Government</Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Link 
                  href="/about" 
                  className="text-base font-medium text-scanvault-black hover:text-scanvault-red transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>

                <Link 
                  href="/services" 
                  className="text-base font-medium text-scanvault-black hover:text-scanvault-red transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Resources
                </Link>

                <Link 
                  href="/contact" 
                  className="text-base font-medium text-scanvault-black hover:text-scanvault-red transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact Us
                </Link>

                {session ? (
                  <>
                    <Link 
                      href="/portal" 
                      className="text-base font-medium text-scanvault-black hover:text-scanvault-red transition-colors px-2 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Portal
                    </Link>
                    {session.user.role === "ADMIN" && (
                      <Link 
                        href="/admin" 
                        className="text-base font-medium text-scanvault-black hover:text-scanvault-red transition-colors px-2 py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="border-scanvault-red text-scanvault-red hover:bg-scanvault-red hover:text-white mx-2"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link href="/login" className="mx-2" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full bg-scanvault-red hover:bg-red-700 text-white font-semibold">
                      Client Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
