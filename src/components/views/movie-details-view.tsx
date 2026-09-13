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
import { MOCK_MOVIES } from "@/lib/client-mock-store";

export function MovieDetailsView() {
  const params = useParams();
  const router = useRouter();
  const movieId = (params?.id as string) || "dune-part-two";

  const fallbackMovie = MOCK_MOVIES.find((m) => m.id === movieId || m.slug === movieId) || MOCK_MOVIES[0];
  const [movie, setMovie] = useState<Movie | null>(fallbackMovie);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(
    fallbackMovie.showtimes?.[0]?.startTime.split("T")[0] || new Date().toISOString().split("T")[0]
  );
  const [trailerOpen, setTrailerOpen] = useState(false);

  useEffect(() => {
    async function loadMovie() {
      try {
        const res = await fetch(`/api/movies/${movieId}`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data.movie) {
            setMovie(data.movie);
            if (data.movie.showtimes && data.movie.showtimes.length > 0) {
              setSelectedDate(data.movie.showtimes[0].startTime.split("T")[0]);
            }
          }
        }
      } catch (err: any) {
        console.warn("Using fallback movie:", err);
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
        <h2 className="text-xl font-bold text-white mb-2">Movie Experience Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">{error}</p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-cinema-400 text-slate-950 font-bold rounded-xl text-xs"
        >
          Return to Cinema Schedule
        </Link>
      </div>
    );
  }

  // Filter showtimes by selected date
  const availableShowtimes = (movie.showtimes || []).filter((s) => {
    return s.startTime.startsWith(selectedDate);
  });

  // Unique dates from showtimes
  const uniqueDates = Array.from(
    new Set((movie.showtimes || []).map((s) => s.startTime.split("T")[0]))
  );

  return (
    <div>
      {/* Cinematic Hero Backdrop */}
      <div className="relative w-full h-[450px] md:h-[550px] overflow-hidden bg-slate-950">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover opacity-30 filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 container mx-auto px-4 md:px-8 flex flex-col justify-end pb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 w-fit mb-6 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Movies
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {/* Poster Card */}
            <div className="relative w-44 md:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 shrink-0 hidden sm:block">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            {/* Movie Info */}
            <div className="space-y-4 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-cinema-500/20 text-cinema-400 border border-cinema-500/30 rounded-md">
                  {movie.rating}
                </span>
                <span className="text-xs text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {movie.durationMins} Mins
                </span>
                <span className="text-xs text-slate-300">• {movie.language}</span>
                <span className="text-xs text-slate-300">• Released {formatDateOnly(movie.releaseDate)}</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
                {movie.title}
              </h1>

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {movie.genres?.map((g) => (
                  <span
                    key={g.id}
                    className="px-3 py-1 text-xs font-medium bg-slate-800/80 backdrop-blur-md text-slate-200 border border-slate-700 rounded-full"
                  >
                    {g.name}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2">
                {movie.trailerUrl && (
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-600 transition shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-white text-white" /> Watch Trailer
                  </button>
                )}
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: movie.title, url: window.location.href });
                    }
                  }}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="Share Movie"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Showtimes & Cast */}
      <div className="container mx-auto px-4 md:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left 2 Cols: Showtime Selection */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-cinema-400" /> Select Date & Experience
              </h2>

              {/* Date Selector Tabs */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {uniqueDates.length > 0 ? (
                  uniqueDates.map((dateStr) => {
                    const isSelected = selectedDate === dateStr;
                    const dateObj = new Date(dateStr + "T00:00:00");
                    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
                    const monthDay = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`flex flex-col items-center justify-center min-w-[90px] py-3 px-4 rounded-2xl border transition-all ${
                          isSelected
                            ? "bg-cinema-400 text-slate-950 font-bold border-cinema-400 shadow-glow"
                            : "bg-surface-200 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <span className="text-xs uppercase tracking-wider">{dayName}</span>
                        <span className="text-sm font-bold mt-0.5">{monthDay}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-sm text-slate-400 py-4">No scheduled showtimes found for this date.</div>
                )}
              </div>
            </div>

            {/* Experience & Showtimes Grid */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Available Screenings
              </h3>

              {availableShowtimes.length === 0 ? (
                <div className="p-8 rounded-2xl bg-surface-200 border border-slate-800 text-center">
                  <p className="text-sm text-slate-400">No screenings available for the selected date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableShowtimes.map((showtime) => {
                    const aud = showtime.auditorium;
                    const cinema = aud?.cinema;
                    const screenBadge =
                      aud?.screenType === "IMAX"
                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                        : aud?.screenType === "DOLBY"
                        ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        : "bg-cinema-500/20 text-cinema-400 border-cinema-500/30";

                    return (
                      <div
                        key={showtime.id}
                        className="p-5 rounded-2xl bg-surface-200 border border-slate-800 hover:border-cinema-500/40 transition flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border rounded-md ${screenBadge}`}>
                              {aud?.screenType || "Standard"}
                            </span>
                            <span className="text-xs font-bold text-emerald-400">
                              From {formatCentsToUSD(showtime.basePriceCents)}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white">{aud?.name}</h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" /> {cinema?.name || "CineBook Multiplex"}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-500 block">Showtime</span>
                            <span className="text-base font-extrabold text-cinema-400">
                              {formatTimeOnly(showtime.startTime)}
                            </span>
                          </div>

                          <Link
                            href={`/booking/${showtime.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cinema-400 to-cinema-500 hover:from-cinema-300 hover:to-cinema-400 rounded-xl transition shadow-glow"
                          >
                            <Armchair className="w-3.5 h-3.5" /> Select Seats
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Col: Synopsis, Cast, Director */}
          <div className="space-y-8">
            <div className="p-6 rounded-3xl bg-surface-200 border border-slate-800 space-y-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-cinema-400 mb-2">
                  Storyline
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">{movie.synopsis}</p>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Director</span>
                  <span className="font-semibold text-white">{movie.director}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Starring Cast</span>
                  <span className="font-semibold text-white">{movie.cast}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Video Modal */}
      {movie.trailerUrl && (
        <TrailerModal
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          trailerUrl={movie.trailerUrl}
          movieTitle={movie.title}
        />
      )}
    </div>
  );
}
