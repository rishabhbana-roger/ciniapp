"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookingWithDetails } from "@/lib/types";
import { DigitalTicket } from "@/components/digital-ticket";
import { Sparkles, CheckCircle2, Ticket, ChevronRight, Film, RotateCcw } from "lucide-react";

export default function TicketConfirmationPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTicket() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) throw new Error("Could not retrieve ticket details");
        const data = await res.json();
        setBooking(data.booking);
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
        <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-white">
          Booking Confirmed!
        </h1>
        <p className="text-xs text-slate-400">
          Your seats are locked and your digital QR pass has been issued. Show this QR code at the cinema entrance.
        </p>
      </div>

      {/* Digital Ticket Pass */}
      <DigitalTicket booking={booking} />

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link
          href="/bookings"
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-200 bg-surface-200 hover:bg-surface-100 border border-slate-700 rounded-xl transition flex items-center justify-center gap-2"
        >
          <Ticket className="w-4 h-4 text-cinema-400" /> View All My Bookings
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cinema-400 to-cinema-500 hover:from-cinema-300 hover:to-cinema-400 rounded-xl shadow-glow transition flex items-center justify-center gap-2"
        >
          <Film className="w-4 h-4" /> Book Another Movie
        </Link>
      </div>
    </div>
  );
}
