"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Movie, Cinema, Genre } from "@/lib/types";
import { MovieCard } from "@/components/movie-card";
import { TrailerModal } from "@/components/trailer-modal";
import {
  Film,
  Search,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Play,
} from "lucide-react";

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [activeTab, setActiveTab] = useState<"now" | "coming">("now");

  // Trailer Modal State
  const [trailerModal, setTrailerModal] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
  }>({ isOpen: false, url: "", title: "" });

  useEffect(() => {
    async function loadData() {
      try {
        const [moviesRes, cinemasRes] = await Promise.all([
          fetch("/api/movies"),
          fetch("/api/cinemas"),
        ]);

        if (moviesRes.ok) {
          const data = await moviesRes.json();
          setMovies(data.movies || []);
          setGenres(data.genres || []);
        }

        if (cinemasRes.ok) {
          const cData = await cinemasRes.json();
          setCinemas(cData.cinemas || []);
        }
      } catch (err) {
        console.error("Home page load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredMovie = movies.find((m) => m.isFeatured) || movies[0];

  // Client-side filtering
  const filteredMovies = movies.filter((m) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchCast = m.cast.toLowerCase().includes(q);
      const matchDir = m.director.toLowerCase().includes(q);
      if (!matchTitle && !matchCast && !matchDir) return false;
    }

    if (selectedGenre !== "all") {
      const hasGenre = m.genres?.some(
        (g) => g.slug === selectedGenre || g.name.toLowerCase() === selectedGenre.toLowerCase()
      );
      if (!hasGenre) return false;
    }

    if (selectedLanguage !== "all") {
      if (!m.language.toLowerCase().includes(selectedLanguage.toLowerCase())) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Cinematic Hero Billboard */}
      {featuredMovie && (
        <section className="relative w-full h-[580px] md:h-[680px] overflow-hidden bg-slate-950">
          {/* Backdrop Image */}
          <div className="absolute inset-0">
            <img
              src={featuredMovie.backdropUrl}
              alt={featuredMovie.title}
              className="w-full h-full object-cover object-center opacity-40 md:opacity-50 transition-transform duration-1000 scale-105"
            />
            {/* Ambient gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>

          <div className="relative container mx-auto h-full px-4 md:px-8 flex flex-col justify-end pb-16 z-10">
            <div className="max-w-2xl space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-black uppercase tracking-widest bg-cinema-500 text-slate-950 rounded-lg shadow-glow">
                  Spotlight Premiere
                </span>
                <span className="px-2.5 py-1 text-xs font-bold bg-black/60 backdrop-blur-md text-cinema-400 border border-cinema-500/30 rounded-lg">
                  {featuredMovie.rating}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold bg-black/60 backdrop-blur-md text-slate-300 border border-slate-700 rounded-lg">
                  {featuredMovie.durationMins} Mins
                </span>
                <span className="px-2.5 py-1 text-xs font-medium text-sky-400 bg-sky-950/40 border border-sky-800/40 rounded-lg">
                  IMAX 70mm & Dolby Atmos
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight">
                {featuredMovie.title}
              </h1>

              {/* Synopsis */}
              <p className="text-sm md:text-base text-slate-300 line-clamp-3 leading-relaxed">
                {featuredMovie.synopsis}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={`/movies/${featuredMovie.id}`}
                  className="px-6 py-3 text-sm font-bold text-slate-950 bg-gradient-to-r from-cinema-400 to-cinema-500 hover:from-cinema-300 hover:to-cinema-400 rounded-xl shadow-glow transition flex items-center gap-2"
                >
                  <Film className="w-4 h-4" /> Book Tickets Now
                </Link>

                {featuredMovie.trailerUrl && (
                  <button
                    onClick={() =>
                      setTrailerModal({
                        isOpen: true,
                        url: featuredMovie.trailerUrl,
                        title: featuredMovie.title,
                      })
                    }
                    className="px-5 py-3 text-sm font-semibold text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl backdrop-blur-md transition flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current text-cinema-400" /> Watch Trailer
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Interactive Search & Multi-Filter Bar */}
      <section id="movies" className="container mx-auto px-4 md:px-8 -mt-6 z-20">
        <div className="p-4 md:p-6 bg-surface-200/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-xl space-y-4">
          {/* Top Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies by title, director, cast..."
              className="w-full pl-12 pr-4 py-3 text-sm bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cinema-500 text-white placeholder-slate-500"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            {/* Genre Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedGenre("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  selectedGenre === "all"
                    ? "bg-cinema-500 text-slate-950 shadow-sm"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                All Genres
              </button>
              {genres.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGenre(g.slug)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    selectedGenre === g.slug
                      ? "bg-cinema-500 text-slate-950 shadow-sm"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>

            {/* Language Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cinema-500"
              >
                <option value="all">All Languages</option>
                <option value="English">English</option>
                <option value="Japanese">Japanese</option>
                <option value="French">French</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Movie Grid Section */}
      <section className="container mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-white flex items-center gap-2">
              Now Showing in Theatres
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a movie to choose your cinema, showtime, and interactive seats
            </p>
          </div>
          <span className="text-xs font-bold text-cinema-400 bg-cinema-500/10 px-3 py-1 rounded-full border border-cinema-500/20">
            {filteredMovies.length} Movies Available
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-80 bg-surface-200 border border-slate-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-16 bg-surface-200 border border-slate-800 rounded-2xl">
            <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No movies match your filters</h3>
            <p className="text-xs text-slate-400">Try adjusting your search keywords or genre selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onPlayTrailer={(url, title) =>
                  setTrailerModal({ isOpen: true, url, title })
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Flagship Cinemas Multiplex Showcase */}
      <section className="bg-surface-300 border-y border-slate-800 py-16 px-4 md:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-cinema-400">
                Premium Venues
              </span>
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-white mt-1">
                Our Flagship Multiplexes
              </h2>
            </div>
            <Link
              href="/cinemas"
              className="mt-3 md:mt-0 text-xs font-bold text-cinema-400 hover:text-cinema-300 flex items-center gap-1"
            >
              View All Cinemas & Schedules <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cinemas.map((c) => (
              <Link
                key={c.id}
                href={`/cinemas/${c.id}`}
                className="group relative flex flex-col bg-surface-200 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-cinema-500/40 transition duration-300"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-200 via-transparent to-black/30" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold bg-black/70 backdrop-blur-md text-cinema-400 rounded-lg border border-cinema-500/30 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {c.city}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-base font-bold text-white group-hover:text-cinema-400 transition mb-1">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">{c.address}</p>
                  <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex-grow">
                    <span className="font-semibold text-slate-300">Amenities: </span>
                    {c.amenities}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModal.isOpen}
        onClose={() => setTrailerModal({ isOpen: false, url: "", title: "" })}
        trailerUrl={trailerModal.url}
        title={trailerModal.title}
      />
    </div>
  );
}
