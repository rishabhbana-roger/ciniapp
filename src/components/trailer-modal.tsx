"use client";

import React from "react";
import { X } from "lucide-react";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
  title: string;
}

export function TrailerModal({ isOpen, onClose, trailerUrl, title }: TrailerModalProps) {
  if (!isOpen) return null;

  // Convert youtube watch URL to embed URL
  let embedUrl = trailerUrl;
  if (trailerUrl.includes("watch?v=")) {
    const videoId = trailerUrl.split("watch?v=")[1]?.split("&")[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  } else if (trailerUrl.includes("youtu.be/")) {
    const videoId = trailerUrl.split("youtu.be/")[1]?.split("?")[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-surface-300 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 bg-surface-200 border-b border-slate-700">
          <h3 className="text-sm font-bold text-white truncate">{title} - Official Trailer</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={embedUrl}
            title={`${title} Trailer`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
