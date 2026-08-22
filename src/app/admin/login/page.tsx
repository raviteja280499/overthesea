"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, Sparkles, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid administrator credentials");
      }

      router.push("/admin");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="glass-ocean p-8 sm:p-10 rounded-[36px] border border-sky-500/30 shadow-2xl backdrop-blur-2xl flex flex-col gap-6">
          
          <div className="text-center flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-cyan-500/20 border border-sky-400/30 flex items-center justify-center text-cyan-300 shadow-lg">
              <ShieldCheck className="h-9 w-9 text-cyan-400" />
            </div>

            <Badge className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[11px] px-3.5 py-1 font-bold rounded-full uppercase tracking-wider">
              Management Portal
            </Badge>

            <h1 className="text-2xl sm:text-3xl font-serif font-black text-white">
              Admin Login
            </h1>
            <p className="text-xs text-slate-400">
              Access Over The Sea lead management hub and Supabase inquiries database.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  required
                  type="text"
                  placeholder="admin@overthesea.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/90 border-sky-900/80 text-white rounded-2xl h-12 pl-10 text-sm focus:border-sky-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900/90 border-sky-900/80 text-white rounded-2xl h-12 pl-10 pr-10 text-sm focus:border-sky-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-extrabold rounded-full h-12 text-sm shadow-xl shadow-sky-500/25 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In to Dashboard <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-sky-950/80 text-center flex flex-col gap-2">
            <span className="text-[11px] text-slate-400">
              Demo Credentials: <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">admin@overthesea.in</code> / <code className="text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded">admin@overthesea2026</code>
            </span>
            <Link
              href="/"
              className="text-xs text-sky-400 hover:underline inline-flex items-center justify-center mt-1"
            >
              ← Return to Main Website
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
