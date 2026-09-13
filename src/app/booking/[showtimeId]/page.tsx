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

export default function BookingSeatSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const showtimeId = params.showtimeId as string;
  const { user } = useAuth();

  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<ShowtimeSeatDetail[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadSeatMap = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await fetch(`/api/showtimes/${showtimeId}`);
      if (!res.ok) throw new Error("Failed to load showtime seat map");
      const data = await res.json();
      setShowtime(data.showtime);
      setSeats(data.seatMap || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Error loading seat map");
    } finally {
      setLoading(false);
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
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          // Race condition conflict!
          setErrorMessage(
            `⚠️ Race Condition: ${data.error || "A selected seat was just locked by another session. Seat map refreshed."}`
          );
          // Refresh seat map to display updated lock status
          await loadSeatMap();
          setSelectedSeatIds([]);
        } else {
          setErrorMessage(data.error || "Failed to hold seats");
        }
        return;
      }

      // Success: navigate to checkout with the created pending booking
      router.push(`/checkout/${data.data.bookingId}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Network error reserving seats");
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
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-6">
      {/* Back button & Showtime header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <Link
            href={`/movies/${showtime.movieId}`}
            className="p-2 rounded-xl bg-surface-200 hover:bg-surface-100 border border-slate-700 text-slate-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-cinema-500 text-slate-950 rounded">
                {showtime.auditorium?.screenType}
              </span>
              <h1 className="text-xl md:text-2xl font-heading font-extrabold text-white">
                {showtime.movie?.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-cinema-400" />
                {showtime.auditorium?.cinema?.name} ({showtime.auditorium?.name})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-cinema-400" />
                {formatDateTime(showtime.startTime)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={loadSeatMap}
          className="self-start md:self-auto px-3 py-1.5 text-xs font-semibold text-slate-300 bg-surface-200 hover:bg-surface-100 border border-slate-700 rounded-lg transition"
        >
          Refresh Live Seats
        </button>
      </div>

      {/* Error / Conflict Alert */}
      {errorMessage && (
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-2xl flex items-start gap-3 text-red-200 text-xs">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Reservation Notice</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Main Seat Map & Checkout Bar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Seat Map (3 cols) */}
        <div className="lg:col-span-3 bg-surface-200/90 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-xl">
          <SeatMap
            seats={seats}
            selectedSeatIds={selectedSeatIds}
            onToggleSeat={handleToggleSeat}
            screenType={showtime.auditorium?.screenType}
            auditoriumName={showtime.auditorium?.name}
          />
        </div>

        {/* Right: Booking Summary & Hold Trigger (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-6 bg-surface-200 border border-slate-800 rounded-3xl shadow-xl space-y-4 sticky top-24">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-cinema-400" /> Order Summary
            </h3>

            {selectedSeats.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-700/60 rounded-2xl">
                <Armchair className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                Click on available seats on the map to add to your order.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Selected Seats ({selectedSeats.length})
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedSeats.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-800/80"
                    >
                      <span className="font-bold text-white">
                        Row {s.row} Seat {s.number} ({s.seatType})
                      </span>
                      <span className="text-cinema-400 font-semibold">
                        {formatCentsToUSD(s.priceCents)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown (Server-side integer minor units) */}
                <div className="pt-3 border-t border-slate-700/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>{formatCentsToUSD(subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Booking Fee (10%):</span>
                    <span>{formatCentsToUSD(feeCents)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>State Tax (5%):</span>
                    <span>{formatCentsToUSD(taxCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-700">
                    <span>Final Total:</span>
                    <span className="text-cinema-400">{formatCentsToUSD(totalAmountCents)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Atomic Hold Action */}
            <button
              onClick={handleHoldSeats}
              disabled={selectedSeats.length === 0 || holding}
              className="w-full py-3.5 px-4 font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cinema-400 to-cinema-500 hover:from-cinema-300 hover:to-cinema-400 rounded-xl shadow-glow transition disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {holding ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Locking Seats (10m)...
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" /> Reserve Seats (10m Hold)
                </>
              )}
            </button>

            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              Reserving locks your seats in the database for 10 minutes to complete payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
