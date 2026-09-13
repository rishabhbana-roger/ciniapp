"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BookingWithDetails } from "@/lib/types";
import { formatDateTime, formatCentsToUSD } from "@/lib/utils";
import { CountdownTimer } from "@/components/countdown-timer";
import confetti from "canvas-confetti";
import {
  CreditCard,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronLeft,
  Lock,
  Film,
  MapPin,
  Ticket,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { getStoredBookings, saveBooking, MOCK_MOVIES } from "@/lib/client-mock-store";

export function CheckoutView() {
  const params = useParams();
  const router = useRouter();
  const bookingId = (params?.bookingId as string) || "mock-booking";

  const [booking, setBooking] = useState<any>(null);
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
      const res = await fetch(`/api/bookings/${bookingId}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setBooking(data.booking);
        if (data.booking.status === "CONFIRMED") {
          router.push(`/ticket/${bookingId}`);
        }
        return;
      }

      // Check stored bookings in localStorage
      const localBookings = getStoredBookings();
      const found = localBookings.find((b) => b.id === bookingId);
      if (found) {
        setBooking(found);
        if (found.status === "CONFIRMED") {
          router.push(`/ticket/${bookingId}`);
        }
      } else {
        // Fallback demo booking
        const fallback: any = {
          id: bookingId,
          bookingRef: "CNB-DEMO99",
          status: "PENDING",
          totalAmountCents: 3680,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          showtime: MOCK_MOVIES[0].showtimes![0],
          items: [
            { id: "1", seat: { row: "D", number: 5, seatType: "PREMIUM" }, priceCents: 1800 },
            { id: "2", seat: { row: "D", number: 6, seatType: "PREMIUM" }, priceCents: 1800 },
          ],
        };
        setBooking(fallback);
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
      }).catch(() => null);

      if (res && res.ok) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#fbbf24", "#38bdf8", "#ffffff"],
        });
        setTimeout(() => {
          router.push(`/ticket/${bookingId}`);
        }, 1200);
        return;
      }

      // Static export / offline client-side confirmation
      if (booking) {
        const ticketCode = `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const bookingAny = booking as any;
        const itemsList = bookingAny.items || bookingAny.seats || [];
        const updatedBooking = {
          ...booking,
          status: "CONFIRMED",
          ticket: {
            id: `tkt-1`,
            ticketCode: ticketCode,
            qrCodeData: JSON.stringify({
              ticket: ticketCode,
              bookingRef: booking.bookingReference || (booking as any).bookingRef,
              movie: (booking as any).movieTitle || (booking as any).showtime?.movie?.title,
            }),
            status: "ACTIVE",
          },
          tickets: itemsList.map((item: any, idx: number) => ({
            id: `tkt-${idx}`,
            ticketCode: `${ticketCode}-${idx + 1}`,
            qrData: JSON.stringify({
              ticket: `${ticketCode}-${idx + 1}`,
              bookingRef: booking.bookingReference || (booking as any).bookingRef,
              movie: (booking as any).movieTitle || (booking as any).showtime?.movie?.title,
              seat: item.seatLabel || `${item.seat?.row}${item.seat?.number}`,
            }),
            status: "ACTIVE",
          })),
        };
        saveBooking(updatedBooking);
      }

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#fbbf24", "#38bdf8", "#ffffff"],
      });

      setTimeout(() => {
        router.push(`/ticket/${bookingId}`);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Payment processing error");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-cinema-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Securing checkout session & verifying seat hold lock...</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-white mb-2">Reservation Expired or Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">{error}</p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-gradient-to-r from-cinema-400 to-cinema-500 text-slate-950 font-bold rounded-xl text-xs shadow-glow inline-block"
        >
          Browse Movies & Select New Seats
        </Link>
      </div>
    );
  }

  const bAny = booking as any;
  const showtime = bAny?.showtime;
  const items: any[] = bAny?.items || bAny?.seats || [];
  const subtotalCents = items.reduce((sum: number, item: any) => sum + (item.priceCents || 0), 0);
  const feeCents = Math.round(subtotalCents * 0.1);
  const taxCents = Math.round(subtotalCents * 0.05);

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-8 max-w-5xl">
      <Link
        href={showtime?.id || bAny?.showtimeId ? `/booking/${showtime?.id || bAny?.showtimeId}` : "/"}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-surface-200 hover:bg-surface-100 rounded-lg border border-slate-700 transition"
      >
        <ChevronLeft className="w-4 h-4" /> Change Seat Selection
      </Link>

      {/* Countdown Warning Header */}
      {booking?.expiresAt && !expired && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-cinema-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cinema-400">
                Seat Hold Reservation Locked
              </h3>
              <p className="text-xs text-slate-300">
                Complete payment before timer expires to guarantee these exact seats.
              </p>
            </div>
          </div>

          <CountdownTimer expiresAt={booking.expiresAt} onExpire={() => setExpired(true)} />
        </div>
      )}

      {expired && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-bold block">10-Minute Hold Expired:</span>
            <span>Your seats have been released back to general availability. Please select seats again.</span>
          </div>
        </div>
      )}

      {/* Main Grid: Payment Form Left, Booking Receipt Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Payment Form & Test Card Gateway */}
        <div className="lg:col-span-7 bg-surface-200 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cinema-400" /> Payment Details
            </h2>
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Encrypted
            </span>
          </div>

          {/* Test Card Quick Selector Banner */}
          <div className="p-4 rounded-2xl bg-surface-100 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-cinema-400 uppercase tracking-wider block">
              💳 Test Gateway Enabled
            </span>
            <p className="text-xs text-slate-400">
              Pre-filled with test credentials. Click <span className="text-white font-semibold">Pay & Confirm Tickets</span> to simulate instant settlement.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cardholder Name</label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-slate-700 text-white text-xs focus:outline-none focus:border-cinema-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-100 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cinema-500 transition"
                />
                <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expiration (MM/YY)</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                  placeholder="MM/YY"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cinema-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Security Code (CVC)</label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  required
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cinema-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={paying || expired}
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cinema-400 via-amber-400 to-cinema-500 hover:from-cinema-300 hover:to-cinema-400 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-glow flex items-center justify-center gap-2 mt-6"
            >
              {paying ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Authorizing Payment & Issuing Dynamic QR Tickets...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Pay & Confirm Tickets ({formatCentsToUSD(booking?.totalAmountCents || 0)})
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Booking Order Receipt */}
        <div className="lg:col-span-5 bg-surface-200 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] font-bold text-cinema-400 uppercase tracking-widest block">
              Booking Ref: {bAny?.bookingRef || bAny?.bookingReference}
            </span>
            <h3 className="text-xl font-heading font-extrabold text-white mt-1">
              {showtime?.movie?.title || bAny?.movieTitle || "Movie"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />{" "}
              {showtime?.auditorium?.cinema?.name || bAny?.cinemaName || "Cinema"} • {showtime?.auditorium?.name || bAny?.auditoriumName || "Auditorium"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> {showtime?.startTime ? formatDateTime(showtime.startTime) : bAny?.showtimeStart ? formatDateTime(bAny.showtimeStart) : "Upcoming"}
            </p>
          </div>

          {/* Reserved Seats List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Reserved Seats ({items.length})
            </span>
            <div className="space-y-2">
              {items.map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-100 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-cinema-500/20 text-cinema-400 font-bold flex items-center justify-center text-[10px]">
                      {item.seat ? `${item.seat.row}${item.seat.number}` : item.seatLabel || `#${idx + 1}`}
                    </span>
                    <span className="font-semibold text-slate-200">{item.seat?.seatType || "Standard"} Seat</span>
                  </div>
                  <span className="font-bold text-white">{formatCentsToUSD(item.priceCents || 0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-200">{formatCentsToUSD(subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Convenience Fee (10%)</span>
              <span className="font-semibold text-slate-200">{formatCentsToUSD(feeCents)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Taxes (5%)</span>
              <span className="font-semibold text-slate-200">{formatCentsToUSD(taxCents)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
              <span>Total Payable</span>
              <span className="text-cinema-400">{formatCentsToUSD(booking?.totalAmountCents || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
