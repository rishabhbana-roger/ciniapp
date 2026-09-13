import React from "react";
import Link from "next/link";
import { Movie } from "@/lib/types";
import { Clock, Star, Play, Ticket } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  onPlayTrailer?: (trailerUrl: string, title: string) => void;
}

export function MovieCard({ movie, onPlayTrailer }: MovieCardProps) {
  return (
    <div className="group relative flex flex-col bg-surface-200 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:border-cinema-500/40 hover:shadow-glow">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-200 via-transparent to-black/40 opacity-80 group-hover:opacity-60 transition" />

        {/* Rating & Format Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2 py-0.5 text-[11px] font-bold bg-black/70 backdrop-blur-md text-cinema-400 border border-cinema-500/30 rounded-md">
            {movie.rating}
          </span>
          {movie.isFeatured && (
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-cinema-500 text-slate-950 rounded-md shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Trailer Play Trigger */}
        {movie.trailerUrl && onPlayTrailer && (
          <button
            onClick={() => onPlayTrailer(movie.trailerUrl, movie.title)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-cinema-500 hover:text-slate-950 transition shadow-lg opacity-0 group-hover:opacity-100"
            title="Watch Trailer"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </button>
        )}

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] text-slate-300">
          <Clock className="w-3 h-3 text-cinema-400" />
          <span>{movie.durationMins}m</span>
        </div>
      </div>

      {/* Content Details */}
      <div className="flex flex-col flex-grow p-4">
        {/* Genres */}
        <div className="flex flex-wrap gap-1 mb-2">
          {movie.genres?.slice(0, 2).map((g) => (
            <span
              key={g.id || g.name}
              className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded"
            >
              {g.name}
            </span>
          ))}
          <span className="text-[10px] text-slate-500 font-medium px-1 py-0.5">
            {movie.language}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white font-heading group-hover:text-cinema-400 transition line-clamp-1 mb-1">
          {movie.title}
        </h3>

        {/* Synopsis */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-grow">
          {movie.synopsis}
        </p>

        {/* Action Button */}
        <Link
          href={`/movies/${movie.id}`}
          className="w-full py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cinema-400 to-cinema-500 hover:from-cinema-300 hover:to-cinema-400 rounded-xl shadow-glow transition group/btn"
        >
          <Ticket className="w-3.5 h-3.5 transition group-hover/btn:rotate-12" />
          Book Tickets
        </Link>
      </div>
    </div>
  );
}
