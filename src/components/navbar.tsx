"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { QuickLoginModal } from "./quick-login-modal";
import {
  Film,
  Compass,
  Ticket,
  ShieldAlert,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: "Movies", href: "/#movies", icon: Film },
    { label: "Cinemas", href: "/cinemas", icon: Compass },
    { label: "My Bookings", href: "/bookings", icon: Ticket },
  ];

  if (user?.role === "ADMIN") {
    navLinks.push({ label: "Admin Console", href: "/admin", icon: ShieldAlert });
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-surface-400/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cinema-500 to-amber-600 shadow-glow text-slate-950 font-black transition group-hover:scale-105">
              <Film className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-heading font-extrabold tracking-tight text-white flex items-center gap-1">
                Cine<span className="text-cinema-400">Book</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 -mt-1">
                Next-Gen Cinema
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition ${
                    isActive
                      ? "text-cinema-400 bg-cinema-500/10 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth / Quick Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-cinema-300 flex items-center justify-center text-slate-950 font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white leading-none">{user.name}</div>
                    <div className="text-[10px] text-cinema-400 font-medium leading-tight">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-1.5 bg-surface-100 border border-slate-700 rounded-xl shadow-xl z-50">
                    <div className="px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
                      Signed in as <span className="text-white font-medium">{user.email}</span>
                    </div>
                    <Link
                      href="/bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      <Ticket className="w-3.5 h-3.5 text-cinema-400" /> My Tickets
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-slate-800 text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-cinema-400 bg-cinema-500/10 border border-cinema-500/30 rounded-lg hover:bg-cinema-500/20 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Demo Login
                </button>
                <Link
                  href="/auth/login"
                  className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cinema-400 to-cinema-500 hover:from-cinema-300 hover:to-cinema-400 rounded-lg shadow-glow transition"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-surface-300 px-4 py-4 space-y-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-cinema-400 hover:bg-slate-800/60 rounded-lg"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              {user ? (
                <div className="flex items-center justify-between py-2">
                  <div className="text-xs text-slate-300">
                    Logged in as <span className="font-bold text-white">{user.name}</span>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="text-xs text-red-400 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginModalOpen(true);
                  }}
                  className="w-full py-2 text-center text-xs font-bold text-slate-950 bg-cinema-400 rounded-lg"
                >
                  Sign In / Demo Login
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <QuickLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
}
