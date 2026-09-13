"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Cinema, Showtime } from "@/lib/types";
import { formatTimeOnly, formatDateTime, formatCentsToUSD } from "@/lib/utils";
import { MapPin, Phone, Sparkles, ChevronLeft, Film, Clock } from "lucide-react";

export default function CinemaDetailPage() {
  const params = useParams();
  const cinemaId = params.id as string;

  const [cinema, setCinema] = useState<(Cinema & { showtimes?: Showtime[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCinema() {
      try {
        const res = await fetch(`/api/cinemas/${cinemaId}`);
        if (res.ok) {
          const data = await res.json();
          setCinema(data.cinema);
        }
      } catch (err) {
        console.error("Load cinema detail error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCinema();
  }, [cinemaId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-cinema-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading cinema schedule...</p>
      </div>
    );
  }

  if (!cinema) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Cinema Not Found</h2>
        <Link href="/cinemas" className="text-xs font-bold text-cinema-400">
          Back to Cinemas
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-8">
      <Link
        href="/cinemas"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-surface-200 hover:bg-surface-100 rounded-lg border border-slate-700 transition"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Cinemas
      </Link>

      {/* Cinema Banner Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8 md:p-12">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-cinema-500/20 text-cinema-400 border border-cinema-500/30 rounded-lg">
            <MapPin className="w-3.5 h-3.5" /> {cinema.city}
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white">
            {cinema.name}
          </h1>
          <p className="text-sm text-slate-300">{cinema.address}</p>
          <div className="text-xs text-slate-400 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 inline-block">
            <span className="font-semibold text-cinema-400">Amenities: </span>
            {cinema.amenities}
          </div>
        </div>
      </div>

      {/* Auditoriums & Screen Schedules */}
      <div className="p-6 bg-surface-200 border border-slate-800 rounded-3xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cinema-400">
            Now Playing
          </span>
          <h2 className="text-xl font-heading font-extrabold text-white mt-1">
            Available Showtimes at this Cinema
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cinema.showtimes?.map((st) => (
            <div
              key={st.id}
              className="p-4 bg-surface-300 border border-slate-700/80 rounded-2xl flex items-center justify-between gap-4 hover:border-cinema-500/40 transition"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-cinema-400">
                  {st.auditorium?.name} ({st.auditorium?.screenType})
                </span>
                <h4 className="text-sm font-bold text-white line-clamp-1">
                  {st.movie?.title}
                </h4>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-cinema-400" />
                  {formatDateTime(st.startTime)}
                </div>
              </div>

              <Link
                href={`/booking/${st.id}`}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-cinema-400 hover:bg-cinema-300 rounded-xl shadow-glow transition whitespace-nowrap"
              >
                Select Seats
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
