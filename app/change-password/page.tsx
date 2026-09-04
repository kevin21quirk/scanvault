"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Loader2, CheckCircle2, KeyRound } from "lucide-react";

export default function ChangePasswordPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const isForced = !!session?.user?.mustChangePassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      setState("error");
      setMessage("New passwords do not match.");
      return;
    }
    if (form.next.length < 8) {
      setState("error");
      setMessage("New password must be at least 8 characters.");
      return;
    }
    setState("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setMessage(data.error || "Failed to change password.");
        return;
      }
      setState("success");
      setMessage("Password updated successfully.");
      // Force JWT refresh so mustChangePassword is cleared in the session
      await update();
      setTimeout(() => router.push("/portal"), 1200);
    } catch {
      setState("error");
      setMessage("An unexpected error occurred.");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          {isForced ? (
            <>
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <ShieldAlert className="h-5 w-5" />
                <span className="text-sm font-semibold">Action required</span>
              </div>
              <CardTitle className="text-xl">Set your password</CardTitle>
              <CardDescription>
                You must create a new password before accessing your portal. Enter the temporary password you were given, then choose a new one.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-scanvault-red mb-1">
                <KeyRound className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {state === "success" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <p className="text-sm font-medium text-green-700">{message}</p>
              <p className="text-xs text-gray-500">Redirecting to your portal…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current">
                  {isForced ? "Temporary / current password" : "Current password"}
                </Label>
                <Input
                  id="current"
                  type="password"
                  required
                  value={form.current}
                  onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))}
                  autoComplete="current-password"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="next">New password</Label>
                <Input
                  id="next"
                  type="password"
                  required
                  minLength={8}
                  value={form.next}
                  onChange={(e) => setForm((p) => ({ ...p, next: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm">Confirm new password</Label>
                <Input
                  id="confirm"
                  type="password"
                  required
                  minLength={8}
                  value={form.confirm}
                  onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>

              {state === "error" && (
                <p className="text-sm text-red-600">{message}</p>
              )}

              <Button
                type="submit"
                disabled={state === "submitting"}
                className="w-full bg-scanvault-red hover:bg-red-700 text-white"
              >
                {state === "submitting" ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating…</>
                ) : (
                  "Update password"
                )}
              </Button>

              {!isForced && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-500"
                  onClick={() => router.push("/portal")}
                >
                  Cancel
                </Button>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
