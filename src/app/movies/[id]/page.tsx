"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Movie, Showtime } from "@/lib/types";
import { formatTimeOnly, formatDateOnly, formatCentsToUSD } from "@/lib/utils";
import { TrailerModal } from "@/components/trailer-modal";
import {
  Film,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
  Play,
  Armchair,
  ChevronLeft,
  Share2,
} from "lucide-react";

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [trailerOpen, setTrailerOpen] = useState(false);

  useEffect(() => {
    async function loadMovie() {
      try {
        const res = await fetch(`/api/movies/${movieId}`);
        if (!res.ok) throw new Error("Movie not found");
        const data = await res.json();
        setMovie(data.movie);

        // Extract available unique dates from showtimes
        if (data.movie.showtimes && data.movie.showtimes.length > 0) {
          const firstDate = data.movie.showtimes[0].startTime.split("T")[0];
          setSelectedDate(firstDate);
        } else {
          setSelectedDate(new Date().toISOString().split("T")[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load movie details");
      } finally {
        setLoading(false);
      }
    }
    loadMovie();
  }, [movieId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-cinema-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading movie experiences & showtimes...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Movie Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">{error || "Could not retrieve the specified movie."}</p>
        <Link
          href="/"
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-cinema-400 rounded-lg"
        >
          Back to Movies
        </Link>
      </div>
    );
  }

  // Get unique dates for showtimes
  const dateOptions: string[] = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dateOptions.push(d.toISOString().split("T")[0]);
  }

  // Filter showtimes for selected date
  const dateShowtimes = (movie.showtimes || []).filter((s) =>
    s.startTime.startsWith(selectedDate)
  );

  // Group showtimes by Cinema
  const cinemaGroups = new Map<string, { cinemaName: string; city: string; showtimes: Showtime[] }>();
  for (const st of dateShowtimes) {
    const cinemaName = st.auditorium?.cinema?.name || "CineBook Multiplex";
    const city = st.auditorium?.cinema?.city || "Flagship Location";
    if (!cinemaGroups.has(cinemaName)) {
      cinemaGroups.set(cinemaName, { cinemaName, city, showtimes: [] });
    }
    cinemaGroups.get(cinemaName)!.showtimes.push(st);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Backdrop Hero Banner */}
      <section className="relative w-full h-[400px] md:h-[480px] bg-slate-950 overflow-hidden">
        <img
          src={movie.backdropUrl}
          alt={movie.title}
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute top-6 left-4 md:left-8 z-20">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-surface-200/80 hover:bg-surface-100 backdrop-blur-md rounded-lg border border-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Movies
          </Link>
        </div>
      </section>

      {/* 2. Movie Overview Header Card */}
      <section className="container mx-auto px-4 md:px-8 -mt-44 md:-mt-52 z-20 mb-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Poster */}
          <div className="w-56 md:w-64 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 group">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col flex-grow space-y-4 pt-2 md:pt-12">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-cinema-500 text-slate-950 rounded-md">
                {movie.rating}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-800 text-slate-300 rounded-md flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cinema-400" /> {movie.durationMins} Mins
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium text-slate-400 bg-slate-900 rounded-md">
                {movie.language}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white leading-tight">
              {movie.title}
            </h1>

            <div className="flex flex-wrap gap-1.5">
              {movie.genres?.map((g) => (
                <span
                  key={g.id || g.name}
                  className="px-2.5 py-1 text-xs font-semibold text-cinema-300 bg-cinema-500/10 border border-cinema-500/20 rounded-lg"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {movie.synopsis}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div>
                <span className="font-bold text-slate-300">Director: </span>
                {movie.director}
              </div>
              <div>
                <span className="font-bold text-slate-300">Starring: </span>
                {movie.cast}
              </div>
            </div>

            {movie.trailerUrl && (
              <div className="pt-2">
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition shadow-md"
                >
                  <Play className="w-4 h-4 fill-current text-cinema-400" /> Watch Official Trailer
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Showtime Date Selector & Schedules */}
      <section className="container mx-auto px-4 md:px-8 pb-20">
        <div className="p-6 bg-surface-200 border border-slate-800 rounded-3xl shadow-xl space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cinema-400">
              Select Experience
            </span>
            <h2 className="text-xl md:text-2xl font-heading font-extrabold text-white mt-1">
              Showtimes & Screen Formats
            </h2>
          </div>

          {/* Date Selection Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
            {dateOptions.map((dateStr) => {
              const isSelected = selectedDate === dateStr;
              const dateObj = new Date(dateStr + "T00:00:00Z");
              const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
              const monthDay = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex flex-col items-center min-w-[90px] py-2.5 px-3 rounded-xl border transition ${
                    isSelected
                      ? "bg-cinema-500 text-slate-950 border-cinema-400 shadow-glow font-bold"
                      : "bg-surface-300 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wider">{dayName}</span>
                  <span className="text-sm font-extrabold">{monthDay}</span>
                </button>
              );
            })}
          </div>

          {/* Showtime Listings by Cinema */}
          {cinemaGroups.size === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No showtimes scheduled for this date. Please select another date.
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(cinemaGroups.values()).map((group, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-surface-300/80 border border-slate-700/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-cinema-400" />
                      <h3 className="text-base font-bold text-white">{group.cinemaName}</h3>
                    </div>
                    <p className="text-xs text-slate-400">{group.city}</p>
                  </div>

                  {/* Showtime Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    {group.showtimes.map((st) => {
                      const screenType = st.auditorium?.screenType || "STANDARD";
                      const screenBadgeColor =
                        screenType === "IMAX"
                          ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
                          : screenType === "DOLBY"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                          : "bg-slate-800 text-slate-400 border-slate-700";

                      return (
                        <Link
                          key={st.id}
                          href={`/booking/${st.id}`}
                          className="group relative flex flex-col items-center px-4 py-2.5 bg-slate-900 border border-slate-700 hover:border-cinema-400 rounded-xl transition duration-200 hover:shadow-glow"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-cinema-400">
                            {st.auditorium?.name}
                          </span>
                          <span className="text-sm font-extrabold text-white">
                            {formatTimeOnly(st.startTime)}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className={`px-1.5 py-0.2 text-[9px] font-bold rounded border ${screenBadgeColor}`}
                            >
                              {screenType}
                            </span>
                            <span className="text-[10px] font-semibold text-cinema-400">
                              {formatCentsToUSD(st.basePriceCents)}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trailer Modal */}
      {movie.trailerUrl && (
        <TrailerModal
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          trailerUrl={movie.trailerUrl}
          title={movie.title}
        />
      )}
    </div>
  );
}
