"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cinema } from "@/lib/types";
import { MapPin, Phone, Sparkles, ChevronRight, Layers, Film } from "lucide-react";

import { MOCK_CINEMAS } from "@/lib/client-mock-store";

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>(MOCK_CINEMAS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCinemas() {
      try {
        const res = await fetch("/api/cinemas").catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data.cinemas && data.cinemas.length > 0) {
            setCinemas(data.cinemas);
          }
        }
      } catch (err) {
        console.warn("Using mock cinemas:", err);
      }
    }
    loadCinemas();
  }, []);

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="max-w-2xl mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-cinema-400">
          Locations & Experiences
        </span>
        <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-white mt-1">
          CineBook Multiplex Theatres
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Equipped with IMAX Laser 70mm, Dolby Atmos sound, 4DX motion seats, and VIP recliner suites.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 bg-surface-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cinemas.map((cinema) => (
            <div
              key={cinema.id}
              className="flex flex-col bg-surface-200 border border-slate-800 rounded-3xl overflow-hidden shadow-xl hover:border-cinema-500/40 transition group"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={cinema.imageUrl}
                  alt={cinema.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold bg-black/70 backdrop-blur-md text-cinema-400 rounded-lg border border-cinema-500/30 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {cinema.city}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cinema-400 transition">
                    {cinema.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{cinema.address}</p>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Auditoriums & Screens
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cinema.auditoriums?.map((aud) => (
                      <span
                        key={aud.id}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-slate-800 border border-slate-700 text-cinema-300 rounded"
                      >
                        {aud.name} ({aud.screenType})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Amenities: </span>
                    {cinema.amenities}
                  </div>
                </div>

                <Link
                  href={`/cinemas/${cinema.id}`}
                  className="w-full py-2.5 px-4 text-xs font-bold text-center text-slate-950 bg-gradient-to-r from-cinema-400 to-cinema-500 hover:from-cinema-300 hover:to-cinema-400 rounded-xl shadow-glow transition flex items-center justify-center gap-2"
                >
                  <Film className="w-3.5 h-3.5" /> View Showtimes & Screens
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
