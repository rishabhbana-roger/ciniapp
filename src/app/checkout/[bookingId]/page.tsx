"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { BookingWithDetails } from "@/lib/types";
import { CountdownTimer } from "@/components/countdown-timer";
import { formatDateTime, formatCentsToUSD } from "@/lib/utils";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Sparkles,
  Ticket,
  ChevronLeft,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);

  // Test card form state
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardHolder, setCardHolder] = useState("Alex Rivers");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");

  const loadBooking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (!res.ok) throw new Error("Booking reservation not found");
      const data = await res.json();
      setBooking(data.booking);

      if (data.booking.status === "CONFIRMED") {
        router.push(`/ticket/${bookingId}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load checkout details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expired) {
      setError("This seat hold has expired. Please select seats again.");
      return;
    }

    try {
      setPaying(true);
      setError("");

      // Generate a unique idempotency key for this payment attempt
      const idempotencyKey = `idemp_${bookingId}_${Date.now()}`;

      const res = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          idempotencyKey,
          paymentMethod: {
            cardNumber,
            expMonth: expiry.split("/")[0] || "12",
            expYear: expiry.split("/")[1] || "28",
            cvc,
            name: cardHolder,
          },
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Payment failed");
      }

      // Celebrate success!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#fbbf24", "#f59e0b", "#38bdf8", "#ffffff"],
      });

      // Redirect to digital ticket
      setTimeout(() => {
        router.push(`/ticket/${bookingId}`);
      }, 800);
    } catch (err: any) {
      setError(err.message || "Payment processing encountered an error");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-cinema-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Loading order checkout & verified hold lock...</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Checkout Error</h2>
        <p className="text-sm text-slate-400 mb-6">{error}</p>
        <Link href="/" className="px-4 py-2 text-xs font-bold text-slate-950 bg-cinema-400 rounded-lg">
          Back to Movies
        </Link>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 max-w-4xl space-y-8">
      {/* Header with Hold Countdown Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-cinema-400">
            Booking Ref: {booking.bookingReference}
          </span>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-white mt-1">
            Complete Secure Checkout
          </h1>
        </div>

        {booking.status === "PENDING" && (
          <CountdownTimer
            expiresAt={booking.expiresAt}
            onExpire={() => {
              setExpired(true);
              setError("Your 10-minute seat hold has expired. The seats have been released.");
            }}
          />
        )}
      </div>

      {expired && (
        <div className="p-4 bg-red-950/80 border border-red-700 rounded-2xl flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span>Seat hold expired. Please reselect your showtime seats.</span>
          </div>
          <Link
            href={`/booking/${booking.showtimeId}`}
            className="px-3 py-1.5 font-bold text-slate-950 bg-red-400 rounded-lg hover:bg-red-300 transition"
          >
            Reselect Seats
          </Link>
        </div>
      )}

      {error && !expired && (
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-2xl flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left: Order Breakdown (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-6 bg-surface-200 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-cinema-400" /> Order Details
            </h3>

            <div className="space-y-1 pb-3 border-b border-slate-700/80">
              <h4 className="text-base font-extrabold text-white">{booking.movieTitle}</h4>
              <div className="text-xs text-slate-400">
                {booking.cinemaName} • {booking.auditoriumName}
              </div>
              <div className="text-xs text-cinema-400 font-semibold">
                {formatDateTime(booking.showtimeStart)}
              </div>
            </div>

            {/* Reserved Seats List */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Reserved Seats</div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {booking.seats.map((seat, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs py-1 px-2.5 bg-slate-900 rounded-lg"
                  >
                    <span className="text-white font-medium">{seat.seatLabel}</span>
                    <span className="text-slate-300 font-bold">
                      {formatCentsToUSD(seat.priceCents)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="pt-4 border-t border-slate-700/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tickets Subtotal:</span>
                <span>
                  {formatCentsToUSD(
                    booking.totalAmountCents - booking.feeCents - booking.taxCents
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Convenience Fee (10%):</span>
                <span>{formatCentsToUSD(booking.feeCents)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cinema State Tax (5%):</span>
                <span>{formatCentsToUSD(booking.taxCents)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-700">
                <span>Grand Total:</span>
                <span className="text-cinema-400">
                  {formatCentsToUSD(booking.totalAmountCents)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Test Payment Form (3 cols) */}
        <div className="md:col-span-3">
          <div className="p-6 md:p-8 bg-surface-200 border border-slate-800 rounded-3xl shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cinema-500/10 text-cinema-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Payment Method</h3>
                  <p className="text-xs text-slate-400">Test Mode Gateway Active (Zero Charge)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 rounded-md">
                Test Mode
              </span>
            </div>

            {/* Quick Test Card Presets */}
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cinema-400" /> Test Card Presets
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCardNumber("4242 4242 4242 4242");
                    setExpiry("12/28");
                    setCvc("123");
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
                >
                  Visa Success (4242)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCardNumber("5555 5555 5555 4444");
                    setExpiry("08/29");
                    setCvc("999");
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
                >
                  Mastercard (5555)
                </button>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  required
                  placeholder="e.g. Alex Rivers"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cinema-500 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    placeholder="4242 4242 4242 4242"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm font-mono bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cinema-500 text-white"
                  />
                  <CreditCard className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Expiration (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                    placeholder="12/28"
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cinema-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Security CVC
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    required
                    placeholder="123"
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-cinema-500 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={paying || expired}
                className="w-full py-4 mt-2 font-bold text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cinema-400 to-cinema-500 hover:from-cinema-300 hover:to-cinema-400 rounded-xl shadow-glow transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {paying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Authorizing & Generating Tickets...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Pay {formatCentsToUSD(booking.totalAmountCents)} & Confirm
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-bit SSL encrypted • Idempotent payment processing</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
