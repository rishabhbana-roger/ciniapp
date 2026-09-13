import React from "react";
import Link from "next/link";
import { Film, ShieldCheck, Zap, Database, Server } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-surface-300 text-slate-400 py-12 px-4 md:px-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cinema-500 text-slate-950 font-bold">
              <Film className="w-4 h-4" />
            </div>
            <span className="text-lg font-heading font-extrabold text-white">
              Cine<span className="text-cinema-400">Book</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            Production-grade serverless cinema ticket booking engine powered by Neon PostgreSQL, Drizzle ORM, and Next.js App Router.
          </p>
          <div className="flex items-center gap-2 pt-2 text-[11px] text-cinema-400 font-mono">
            <Zap className="w-3.5 h-3.5 text-cinema-400" /> Atomic 10-Min Seat Hold Locks
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Quick Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/" className="hover:text-cinema-400 transition">Now Showing Movies</Link></li>
            <li><Link href="/cinemas" className="hover:text-cinema-400 transition">Cinemas & Auditoriums</Link></li>
            <li><Link href="/bookings" className="hover:text-cinema-400 transition">My Tickets & Passes</Link></li>
            <li><Link href="/admin" className="hover:text-cinema-400 transition">Admin Console</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Auditorium Formats</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> IMAX Grand Laser 70mm</li>
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Dolby Cinema Atmos 128-ch</li>
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ScreenX 270° Panoramic</li>
            <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> VIP Ultra Recliner Suites</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Engine & Deployment</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-400" /> Neon Serverless PostgreSQL
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Server className="w-3.5 h-3.5 text-emerald-400" /> Vercel Edge & Functions
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Idempotent Payment Webhooks
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-8 pt-6 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500">
        <div>© {new Date().getFullYear()} CineBook Inc. Built with Next.js, Neon PostgreSQL & Drizzle.</div>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <span>UTC Timestamps</span>
          <span>•</span>
          <span>Integer Minor Units (Cents)</span>
          <span>•</span>
          <span>Vercel Cron Protected</span>
        </div>
      </div>
    </footer>
  );
}
