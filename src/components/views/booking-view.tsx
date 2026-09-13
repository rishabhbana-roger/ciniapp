"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { ShowtimeSeatDetail, Showtime } from "@/lib/types";
import { SeatMap } from "@/components/seat-map";
import { formatDateTime, formatCentsToUSD } from "@/lib/utils";
import {
  Film,
  Sparkles,
  ChevronLeft,
  Armchair,
  Ticket,
  AlertCircle,
  Clock,
  MapPin,
  Lock,
} from "lucide-react";
import { getMockSeatMap, saveHold, saveBooking } from "@/lib/client-mock-store";

export function BookingSeatSelectionView() {
  const params = useParams();
  const router = useRouter();
  const showtimeId = (params?.showtimeId as string) || "st-dune-part-two";
  const { user } = useAuth();

  const mockData = getMockSeatMap(showtimeId);
  const [showtime, setShowtime] = useState<Showtime | null>(mockData.showtime);
  const [seats, setSeats] = useState<ShowtimeSeatDetail[]>(mockData.seatMap);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [holding, setHolding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadSeatMap = async () => {
    try {
      const res = await fetch(`/api/showtimes/${showtimeId}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.showtime) setShowtime(data.showtime);
        if (data.seatMap) setSeats(data.seatMap);
      } else {
        const fallback = getMockSeatMap(showtimeId);
        setShowtime(fallback.showtime);
        setSeats(fallback.seatMap);
      }
    } catch {
      const fallback = getMockSeatMap(showtimeId);
      setShowtime(fallback.showtime);
      setSeats(fallback.seatMap);
    }
  };

  useEffect(() => {
    loadSeatMap();
  }, [showtimeId]);

  const handleToggleSeat = (seat: ShowtimeSeatDetail) => {
    setErrorMessage("");
    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= 8) {
        setErrorMessage("You can select up to 8 seats per booking");
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat.id]);
    }
  };

  // Selected seats objects
  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));
  const subtotalCents = selectedSeats.reduce((sum, s) => sum + s.priceCents, 0);
  const feeCents = Math.round(subtotalCents * 0.1);
  const taxCents = Math.round(subtotalCents * 0.05);
  const totalAmountCents = subtotalCents + feeCents + taxCents;

  const handleHoldSeats = async () => {
    if (selectedSeatIds.length === 0) {
      setErrorMessage("Please select at least one seat to proceed");
      return;
    }

    if (!user) {
      setErrorMessage("Please sign in or select a demo profile to reserve seats");
      return;
    }

    try {
      setHolding(true);
      setErrorMessage("");

      const res = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId,
          seatIds: selectedSeatIds,
        }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        router.push(`/checkout/${data.data.bookingId}`);
        return;
      }

      // Client-side fallback for static export / offline GitHub Pages
      const mockBookingId = `bk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      
      saveHold(mockBookingId, showtimeId, selectedSeatIds, expiresAt);
      saveBooking({
        id: mockBookingId,
        userId: user.id,
        showtimeId: showtimeId,
        bookingRef: `CNB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: "PENDING",
        totalAmountCents: totalAmountCents,
        expiresAt: expiresAt,
        createdAt: new Date().toISOString(),
        showtime: showtime,
        items: selectedSeats.map((s) => ({
          id: s.id,
          seatId: s.id,
          seat: { row: s.row, number: s.number, seatType: s.seatType },
          priceCents: s.priceCents,
        })),
      });

      router.push(`/checkout/${mockBookingId}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Error reserving seats");
    } finally {
      setHolding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-cinema-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading interactive cinema seat map & live holds...</p>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Showtime Not Found</h2>
        <Link href="/" className="text-xs font-bold text-cinema-400">
          Return to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Showtime Info Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <Link
            href={showtime.movieId ? `/movies/${showtime.movieId}` : "/"}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-cinema-400 mb-1 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Movie Details
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-white">
              {showtime.movie?.title || "Movie Screening"}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-cinema-500/20 text-cinema-400 border border-cinema-500/30">
              {showtime.auditorium?.screenType || "Standard Screen"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> {formatDateTime(showtime.startTime)}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />{" "}
              {showtime.auditorium?.cinema?.name || "CineBook Theatre"} • {showtime.auditorium?.name}
            </span>
          </div>
        </div>

        {/* Live Hold Guarantee Badge */}
        <div className="flex items-center gap-3 bg-surface-200 border border-slate-800 p-3 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-cinema-500/10 border border-cinema-500/30 flex items-center justify-center text-cinema-400">
            <Lock className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-[11px] font-bold text-cinema-400 uppercase tracking-wider block">
              10-Minute Lock Engine
            </span>
            <p className="text-[11px] text-slate-400">Instant atomic hold upon selection</p>
          </div>
        </div>
      </div>

      {/* Error / Conflict Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Seat Map Left, Booking Summary Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Seat Map Visual Component */}
        <div className="lg:col-span-8 bg-surface-200 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          <SeatMap
            seats={seats}
            selectedSeatIds={selectedSeatIds}
            onToggleSeat={handleToggleSeat}
          />
        </div>

        {/* Right: Booking Summary & Hold Checkout Trigger */}
        <div className="lg:col-span-4 bg-surface-200 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl sticky top-24">
          <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
            <Ticket className="w-4 h-4 text-cinema-400" /> Booking Summary
          </h3>

          {/* Selected Seats List */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Selected Seats ({selectedSeats.length})
            </span>

            {selectedSeats.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface-100 border border-slate-800/80 text-center">
                <Armchair className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                <p className="text-xs text-slate-400">Click on available auditorium seats to reserve.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {selectedSeats.map((seat) => (
                  <div
                    key={seat.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-100 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-cinema-500/20 text-cinema-400 font-bold flex items-center justify-center text-[10px]">
                        {seat.row}{seat.number}
                      </span>
                      <span className="font-semibold text-slate-200">
                        {seat.seatType} Seat
                      </span>
                    </div>
                    <span className="font-bold text-white">{formatCentsToUSD(seat.priceCents)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          {selectedSeats.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tickets Subtotal</span>
                <span className="font-semibold text-slate-200">{formatCentsToUSD(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Convenience Fee (10%)</span>
                <span className="font-semibold text-slate-200">{formatCentsToUSD(feeCents)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Taxes (5%)</span>
                <span className="font-semibold text-slate-200">{formatCentsToUSD(taxCents)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Amount</span>
                <span className="text-cinema-400">{formatCentsToUSD(totalAmountCents)}</span>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleHoldSeats}
            disabled={selectedSeats.length === 0 || holding}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-cinema-400 via-amber-400 to-cinema-500 hover:from-cinema-300 hover:to-cinema-400 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-glow flex items-center justify-center gap-2"
          >
            {holding ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Reserving Seats & Starting 10m Lock...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" /> Hold Seats & Proceed ({formatCentsToUSD(totalAmountCents)})
              </>
            )}
          </button>

          {!user && (
            <p className="text-[11px] text-center text-slate-500">
              * You can sign in using quick 1-click demo profiles before reserving.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
