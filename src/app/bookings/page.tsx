"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { BookingWithDetails } from "@/lib/types";
import { formatDateTime, formatCentsToUSD } from "@/lib/utils";
import {
  Ticket,
  Film,
  Calendar,
  MapPin,
  Clock,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Armchair,
} from "lucide-react";

export default function BookingsHistoryPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelModal, setConfirmCancelModal] = useState<BookingWithDetails | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bookings/user");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Load bookings error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellingId(bookingId);
      setActionMessage("");

      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to cancel booking");
      }

      setActionMessage(`Booking ${result.bookingReference} cancelled. Refund of ${formatCentsToUSD(result.refundAmountCents)} processed.`);
      setConfirmCancelModal(null);
      await loadBookings();
    } catch (err: any) {
      alert(err.message || "Cancellation failed");
    } finally {
      setCancellingId(null);
    }
  };

  if (!user && !loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <Ticket className="w-12 h-12 text-cinema-400 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-white mb-2">Sign In to View Bookings</h2>
        <p className="text-xs text-slate-400 mb-6">
          Access your digital admission passes, QR codes, and booking history.
        </p>
        <Link
          href="/auth/login"
          className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cinema-400 to-cinema-500 rounded-xl shadow-glow"
        >
          Sign In / Demo Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cinema-400">
            Account Management
          </span>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-white mt-1">
            My Tickets & Booking History
          </h1>
        </div>

        <Link
          href="/"
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-cinema-400 hover:bg-cinema-300 rounded-xl shadow-glow transition self-start md:self-auto flex items-center gap-1.5"
        >
          <Film className="w-3.5 h-3.5" /> Book New Movie
        </Link>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-700 rounded-2xl flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-surface-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-20 text-center bg-surface-200 border border-slate-800 rounded-3xl max-w-lg mx-auto">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Bookings Found</h3>
          <p className="text-xs text-slate-400 mb-6">
            You have not booked any movie experiences yet. Browse what is currently playing!
          </p>
          <Link
            href="/"
            className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-cinema-400 rounded-xl shadow-glow"
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const isConfirmed = b.status === "CONFIRMED";
            const isCancelled = b.status === "CANCELLED" || b.status === "REFUNDED";

            return (
              <div
                key={b.id}
                className="p-5 md:p-6 bg-surface-200 border border-slate-800 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition"
              >
                {/* Left details */}
                <div className="flex items-start gap-4">
                  {b.moviePoster && (
                    <img
                      src={b.moviePoster}
                      alt={b.movieTitle}
                      className="w-16 h-24 object-cover rounded-xl border border-slate-700 hidden sm:block"
                    />
                  )}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-cinema-400">
                        {b.bookingReference}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${
                          isConfirmed
                            ? "bg-emerald-950/60 border-emerald-500 text-emerald-400"
                            : isCancelled
                            ? "bg-red-950/60 border-red-500 text-red-400"
                            : "bg-amber-950/60 border-amber-500 text-amber-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white leading-snug">
                      {b.movieTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-cinema-400" />
                        {b.cinemaName} ({b.auditoriumName} • {b.screenType})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-cinema-400" />
                        {formatDateTime(b.showtimeStart)}
                      </span>
                    </div>

                    {/* Seats Tags */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">Seats:</span>
                      <div className="flex flex-wrap gap-1">
                        {b.seats.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] font-bold bg-slate-900 border border-slate-700 text-cinema-300 rounded"
                          >
                            {s.seatLabel}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Actions & Amount */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400">Total Amount:</span>
                    <div className="text-base font-extrabold text-white">
                      {formatCentsToUSD(b.totalAmountCents)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConfirmed && (
                      <>
                        <Link
                          href={`/ticket/${b.id}`}
                          className="px-4 py-2 text-xs font-bold text-slate-950 bg-cinema-400 hover:bg-cinema-300 rounded-xl shadow-glow transition flex items-center gap-1.5"
                        >
                          <Ticket className="w-3.5 h-3.5" /> View QR Pass
                        </Link>
                        <button
                          onClick={() => setConfirmCancelModal(b)}
                          className="px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 border border-red-900/60 rounded-xl transition"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {b.status === "PENDING" && (
                      <Link
                        href={`/checkout/${b.id}`}
                        className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 rounded-xl shadow-glow"
                      >
                        Complete Payment
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {confirmCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 bg-surface-200 border border-slate-700 rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 rounded-xl bg-red-950/60 border border-red-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cancel Booking & Refund</h3>
                <p className="text-xs text-slate-400">
                  Ref: {confirmCancelModal.bookingReference}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel your reservation for{" "}
              <span className="font-bold text-white">{confirmCancelModal.movieTitle}</span>?
              Your reserved seats will immediately be released to other customers, and a full refund of{" "}
              <span className="font-bold text-cinema-400">
                {formatCentsToUSD(confirmCancelModal.totalAmountCents)}
              </span>{" "}
              will be credited to your payment method.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmCancelModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancellingId === confirmCancelModal.id}
                onClick={() => handleCancelBooking(confirmCancelModal.id)}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {cancellingId === confirmCancelModal.id ? (
                  "Processing Refund..."
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" /> Confirm Cancellation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
