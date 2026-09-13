"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { X, ShieldCheck, UserCheck, KeyRound, Sparkles } from "lucide-react";

interface QuickLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickLoginModal({ isOpen, onClose }: QuickLoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleQuickLogin = async (e: string, p: string) => {
    setLoading(true);
    setError("");
    const success = await login(e, p);
    setLoading(false);
    if (success) {
      onClose();
    } else {
      setError("Login failed. Please check credentials.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleQuickLogin(email, password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 bg-surface-200 border border-slate-700/80 rounded-2xl shadow-glow overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cinema-500/20 rounded-full blur-3xl" />

        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cinema-500/10 text-cinema-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sign In to CineBook</h3>
              <p className="text-xs text-slate-400">Select a demo role or use your credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs font-medium text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg">
            {error}
          </div>
        )}

        {/* 1-Click Quick Demo Switchers */}
        <div className="mb-5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cinema-400 mb-2.5">
            <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Profiles
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("admin@cinebook.com", "AdminPass123!")}
              className="flex flex-col items-start p-3 text-left transition rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-amber-500/30 hover:border-amber-400 group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                <ShieldCheck className="w-4 h-4" /> Admin Profile
              </div>
              <div className="text-[11px] text-slate-300">admin@cinebook.com</div>
              <span className="text-[10px] text-slate-500 group-hover:text-amber-300/80">Full access</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("alex@cinebook.com", "UserPass123!")}
              className="flex flex-col items-start p-3 text-left transition rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-sky-400 group"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 mb-1">
                <UserCheck className="w-4 h-4" /> Alex (User)
              </div>
              <div className="text-[11px] text-slate-300">alex@cinebook.com</div>
              <span className="text-[10px] text-slate-500 group-hover:text-sky-300/80">Seat bookings</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-700/60"></div>
          <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-500">Or sign in manually</span>
          <div className="flex-grow border-t border-slate-700/60"></div>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block mb-1 text-xs text-slate-300 font-medium">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-cinema-500 text-white"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs text-slate-300 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-cinema-500 text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 font-semibold text-sm text-slate-950 bg-gradient-to-r from-cinema-400 to-cinema-500 hover:from-cinema-300 hover:to-cinema-400 rounded-lg shadow-glow transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
