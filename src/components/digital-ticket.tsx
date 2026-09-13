"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { BookingWithDetails } from "@/lib/types";
import { formatDateTime, formatCentsToUSD } from "@/lib/utils";
import { Film, Sparkles, MapPin, Calendar, Armchair, Printer, CheckCircle, AlertOctagon } from "lucide-react";

interface DigitalTicketProps {
  booking: BookingWithDetails;
}

export function DigitalTicket({ booking }: DigitalTicketProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const rawQr = booking.ticket?.qrCodeData || JSON.stringify({
      bookingRef: booking.bookingReference,
      ticketCode: booking.ticket?.ticketCode,
      movie: booking.movieTitle,
      time: booking.showtimeStart,
      seats: booking.seats.map((s) => s.seatLabel),
    });

    QRCode.toDataURL(rawQr, {
      width: 240,
      margin: 1,
      color: {
        dark: "#0b0f19",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code Error:", err));
  }, [booking]);

  const handlePrint = () => {
    window.print();
  };

  const isConfirmed = booking.status === "CONFIRMED";
  const isCancelled = booking.status === "CANCELLED" || booking.status === "REFUNDED";

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Ticket Pass Card */}
      <div className="relative w-full bg-surface-200 border border-slate-700/80 rounded-3xl overflow-hidden shadow-glow print:shadow-none print:border-black">
        {/* Top Header Glow */}
        <div className="relative p-6 bg-gradient-to-r from-amber-600/30 via-cinema-500/20 to-surface-100 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cinema-500 text-slate-950 font-bold">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-cinema-400">
                CineBook Admission Pass
              </span>
            </div>
            <span
              className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${
                isConfirmed
                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-400"
                  : isCancelled
                  ? "bg-red-950/60 border-red-500 text-red-400"
                  : "bg-amber-950/60 border-amber-500 text-amber-400"
              }`}
            >
              {booking.status}
            </span>
          </div>

          <h2 className="text-xl font-heading font-extrabold text-white leading-snug mb-1">
            {booking.movieTitle}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-cinema-400">{booking.screenType} EXPERIENCE</span>
            <span>•</span>
            <span>{booking.auditoriumName}</span>
          </div>
        </div>

        {/* Middle Details Grid */}
        <div className="p-6 grid grid-cols-2 gap-4 border-b border-dashed border-slate-700">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400 mb-1">
              <MapPin className="w-3.5 h-3.5 text-cinema-400" /> Cinema Location
            </div>
            <div className="text-xs font-bold text-white leading-tight">{booking.cinemaName}</div>
            <div className="text-[11px] text-slate-400">{booking.cinemaCity}</div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-cinema-400" /> Showtime
            </div>
            <div className="text-xs font-bold text-white leading-tight">
              {formatDateTime(booking.showtimeStart)}
            </div>
            <div className="text-[11px] text-slate-400">Standard UTC Scheduled</div>
          </div>

          <div className="col-span-2 pt-2">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
              <Armchair className="w-3.5 h-3.5 text-cinema-400" /> Reserved Seats ({booking.seats.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {booking.seats.map((seat, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs font-bold bg-slate-800 border border-cinema-500/30 text-cinema-300 rounded-lg"
                >
                  {seat.seatLabel}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Perforated Notches (Left & Right) */}
        <div className="relative flex items-center justify-between py-2">
          <div className="ticket-notch-left -top-3"></div>
          <div className="ticket-notch-right -top-3"></div>
        </div>

        {/* QR Code and Reference Footer */}
        <div className="p-6 bg-surface-300/90 flex flex-col items-center text-center">
          {/* QR Code Image */}
          <div className="p-3 bg-white rounded-2xl shadow-md mb-3">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Ticket QR Code"
                className="w-40 h-40 object-contain mx-auto"
              />
            ) : (
              <div className="w-40 h-40 bg-slate-200 animate-pulse rounded-xl" />
            )}
          </div>

          <div className="text-xs font-mono font-bold text-white tracking-widest mb-0.5">
            {booking.ticket?.ticketCode || "TKT-PENDING"}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mb-4">
            Booking Ref: <span className="text-cinema-400 font-bold">{booking.bookingReference}</span>
          </div>

          <div className="w-full pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span>Total Paid (USD):</span>
            <span className="font-extrabold text-white text-sm">
              {formatCentsToUSD(booking.totalAmountCents)}
            </span>
          </div>
        </div>
      </div>

      {/* Print / Action Buttons */}
      <div className="flex items-center gap-3 mt-6 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-200 bg-surface-100 hover:bg-surface-50 border border-slate-700 rounded-xl transition"
        >
          <Printer className="w-4 h-4 text-cinema-400" /> Print Ticket Pass
        </button>
      </div>
    </div>
  );
}
