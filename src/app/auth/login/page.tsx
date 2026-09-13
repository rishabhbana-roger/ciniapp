"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Film, KeyRound, ShieldCheck, UserCheck, Sparkles, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (eEmail: string, ePass: string) => {
    try {
      setLoading(true);
      setError("");
      const success = await login(eEmail, ePass);
      if (success) {
        router.push("/");
      } else {
        setError("Invalid email address or password");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <div className="relative w-full max-w-md p-8 bg-surface-200 border border-slate-800 rounded-3xl shadow-glow overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cinema-500/20 rounded-full blur-3xl" />

        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cinema-500 text-slate-950 font-bold mb-1 shadow-glow">
            <Film className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-white">
            Welcome Back to CineBook
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to access your digital tickets and seat reservations
          </p>
        </div>

        {error && (
          <div className="p-3.5 mb-6 bg-red-950/60 border border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Profiles */}
        <div className="mb-6">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cinema-400 mb-2.5">
            <Sparkles className="w-3.5 h-3.5" /> 1-Click Quick Demo Profiles
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleLogin("admin@cinebook.com", "AdminPass123!")}
              className="flex flex-col items-start p-3 text-left transition rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-amber-500/30 hover:border-amber-400 group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                <ShieldCheck className="w-4 h-4" /> Admin Profile
              </div>
              <div className="text-[11px] text-slate-300">admin@cinebook.com</div>
              <span className="text-[10px] text-slate-500 group-hover:text-amber-300/80">Management & stats</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleLogin("alex@cinebook.com", "UserPass123!")}
              className="flex flex-col items-start p-3 text-left transition rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-sky-400 group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mb-1">
                <UserCheck className="w-4 h-4" /> Alex (Customer)
              </div>
              <div className="text-[11px] text-slate-300">alex@cinebook.com</div>
              <span className="text-[10px] text-slate-500 group-hover:text-sky-300/80">Seat booking flow</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-500">
            Or sign in with email
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cinema-500 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cinema-500 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cinema-400 to-cinema-500 hover:from-cinema-300 hover:to-cinema-400 rounded-xl shadow-glow transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Do not have an account?{" "}
          <Link href="/auth/register" className="text-cinema-400 font-bold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
