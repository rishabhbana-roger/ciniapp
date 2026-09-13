"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookingWithDetails } from "@/lib/types";
import { DigitalTicket } from "@/components/digital-ticket";
import { Sparkles, CheckCircle2, Ticket, ChevronRight, Film, RotateCcw } from "lucide-react";
import { getStoredBookings, MOCK_MOVIES } from "@/lib/client-mock-store";

export function TicketConfirmationView() {
  const params = useParams();
  const bookingId = (params?.bookingId as string) || "demo-ticket";

  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTicket() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          setBooking(data.booking);
          return;
        }

        // LocalStorage fallback
        const stored = getStoredBookings().find((b) => b.id === bookingId);
        if (stored) {
          setBooking(stored);
        } else {
          // Mock preview ticket
          const sampleMovie = MOCK_MOVIES[0];
          setBooking({
            id: bookingId,
            userId: "mock-user",
            showtimeId: sampleMovie.showtimes![0].id,
            bookingRef: "CNB-8X92KP",
            status: "CONFIRMED",
            totalAmountCents: 3680,
            createdAt: new Date().toISOString(),
            showtime: sampleMovie.showtimes![0],
            items: [
              { id: "1", seat: { row: "E", number: 7, seatType: "VIP" }, priceCents: 2200 },
              { id: "2", seat: { row: "E", number: 8, seatType: "VIP" }, priceCents: 2200 },
            ],
            tickets: [
              {
                id: "tkt-1",
                ticketCode: "TKT-8X92KP-1",
                qrData: JSON.stringify({ ticket: "TKT-8X92KP-1", movie: sampleMovie.title, seat: "E7" }),
                status: "ACTIVE",
              },
            ],
          } as any);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load ticket");
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-cinema-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-400">Rendering digital admission pass & barcode...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Ticket Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">{error}</p>
        <Link href="/" className="px-4 py-2 text-xs font-bold text-slate-950 bg-cinema-400 rounded-lg">
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 max-w-2xl space-y-8">
      {/* Confirmation Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-2 shadow-glow">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 block">
          Booking Confirmed & Seats Reserved
        </span>
        <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-white">
          Here is Your Digital Cinema Pass
        </h1>
        <p className="text-xs text-slate-400">
          Save this pass or show this QR barcode at the theatre entrance usher.
        </p>
      </div>

      {/* Render Digital Pass Ticket */}
      <DigitalTicket booking={booking} />

      {/* Action Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/bookings"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-surface-200 hover:bg-surface-100 text-slate-200 border border-slate-700 transition"
        >
          <Ticket className="w-4 h-4 text-cinema-400" /> View All My Bookings
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cinema-400 to-cinema-500 hover:from-cinema-300 hover:to-cinema-400 text-slate-950 shadow-glow transition"
        >
          <Film className="w-4 h-4" /> Book Another Experience
        </Link>
      </div>
    </div>
  );
}
