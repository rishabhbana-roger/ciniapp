"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Cinema, Showtime } from "@/lib/types";
import { formatTimeOnly, formatDateTime, formatCentsToUSD } from "@/lib/utils";
import { MapPin, Phone, Sparkles, ChevronLeft, Film, Clock } from "lucide-react";
import { MOCK_CINEMAS, MOCK_MOVIES } from "@/lib/client-mock-store";

export function CinemaDetailsView() {
  const params = useParams();
  const cinemaId = (params?.id as string) || "cinema-1";

  const fallbackCinema = MOCK_CINEMAS.find((c) => c.id === cinemaId) || MOCK_CINEMAS[0];
  const allMockShowtimes = MOCK_MOVIES.flatMap((m) =>
    (m.showtimes || []).filter((s) => s.auditorium?.cinema?.id === fallbackCinema.id || s.auditoriumId.includes(fallbackCinema.id))
  );

  const [cinema, setCinema] = useState<(Cinema & { showtimes?: Showtime[] }) | null>({
    ...fallbackCinema,
    showtimes: allMockShowtimes.length > 0 ? allMockShowtimes : MOCK_MOVIES[0].showtimes,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCinema() {
      try {
        const res = await fetch(`/api/cinemas/${cinemaId}`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data.cinema) setCinema(data.cinema);
        }
      } catch (err) {
        console.warn("Using fallback cinema:", err);
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

      {/* Cinema Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-surface-200 shadow-2xl">
        <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-900">
          <img src={cinema.imageUrl} alt={cinema.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-cinema-400 uppercase tracking-widest">
                {cinema.city} Premier Multiplex
              </span>
              <h1 className="text-2xl md:text-4xl font-heading font-extrabold text-white mt-1">
                {cinema.name}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cinema-400" /> {cinema.address}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-cinema-400" /> {cinema.phone}
            </span>
          </div>

          <div className="pt-2">
            <span className="text-xs text-slate-400 block mb-1">Featured Amenities:</span>
            <p className="text-xs font-medium text-slate-200 bg-surface-100 p-3 rounded-xl border border-slate-800">
              {cinema.amenities}
            </p>
          </div>
        </div>
      </div>

      {/* Auditoriums & Screens */}
      <div className="space-y-6">
        <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
          <Film className="w-5 h-5 text-cinema-400" /> Auditoriums & Laser Screens
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cinema.auditoriums?.map((aud) => (
            <div
              key={aud.id}
              className="p-5 rounded-2xl bg-surface-200 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-cinema-500/20 text-cinema-400 border border-cinema-500/30">
                  {aud.screenType}
                </span>
                <span className="text-xs text-slate-400">{aud.totalSeats} Total Seats</span>
              </div>
              <h3 className="text-base font-bold text-white">{aud.name}</h3>
              <p className="text-xs text-slate-400">
                Auditorium Layout: {aud.totalRows} Rows × {aud.totalCols} Seats per row.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
