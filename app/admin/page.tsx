"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminDashboard from "./admin-dashboard";

export default function Admin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role === "ACCOUNTANT") {
      router.push("/accountant");
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/portal");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scanvault-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-1 bg-scanvault-red rounded-full" />
              <span className="text-[11px] font-bold text-scanvault-red uppercase tracking-[0.15em]">Admin Console</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-gray-400 mt-1.5 text-sm">Full system management &amp; reporting</p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-0.5 mt-1">
            <p className="text-sm font-semibold text-gray-700">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{new Date().getFullYear()} &middot; ScanVault</p>
          </div>
        </div>
        <AdminDashboard />
      </div>
    </div>
  );
}
