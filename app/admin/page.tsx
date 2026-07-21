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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-scanvault-black mb-1 sm:mb-2">
          Admin Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage clients, documents, and system settings
        </p>
      </div>
      <AdminDashboard />
    </div>
  );
}
