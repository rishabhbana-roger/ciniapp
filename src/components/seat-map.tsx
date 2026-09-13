"use client";

import React from "react";
import { ShowtimeSeatDetail, SeatType } from "@/lib/types";
import { formatCentsToUSD } from "@/lib/utils";
import { Armchair, Sparkles, Lock, Check } from "lucide-react";

interface SeatMapProps {
  seats: ShowtimeSeatDetail[];
  selectedSeatIds: string[];
  onToggleSeat: (seat: ShowtimeSeatDetail) => void;
  screenType?: string;
  auditoriumName?: string;
}

export function SeatMap({
  seats,
  selectedSeatIds,
  onToggleSeat,
  screenType = "STANDARD",
  auditoriumName = "Main Hall",
}: SeatMapProps) {
  // Group seats by row
  const rowsMap = new Map<string, ShowtimeSeatDetail[]>();
  for (const seat of seats) {
    if (!rowsMap.has(seat.row)) {
      rowsMap.set(seat.row, []);
    }
    rowsMap.get(seat.row)!.push(seat);
  }

  // Sort rows alphabetically
  const sortedRows = Array.from(rowsMap.keys()).sort();

  const getSeatColor = (seat: ShowtimeSeatDetail, isSelected: boolean) => {
    if (isSelected) {
      return "bg-cinema-400 text-slate-950 ring-2 ring-cinema-300 ring-offset-2 ring-offset-slate-950 shadow-glow scale-105";
    }

    if (seat.status === "BOOKED") {
      return "bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed opacity-40";
    }

    if (seat.status === "HELD") {
      return "bg-amber-950/40 text-amber-500 border border-dashed border-amber-600/60 cursor-not-allowed animate-pulse";
    }

    // Available variants based on seat type
    switch (seat.seatType) {
      case "VIP":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/40 hover:bg-amber-500/25 hover:border-amber-400";
      case "PREMIUM":
        return "bg-sky-500/10 text-sky-400 border border-sky-500/40 hover:bg-sky-500/25 hover:border-sky-400";
      case "ACCESSIBLE":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/40 hover:bg-purple-500/25 hover:border-purple-400";
      default:
        return "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:border-slate-500";
    }
  };

  return (
    <div className="flex flex-col items-center w-full py-6">
      {/* Screen Curved Projection */}
      <div className="w-full max-w-2xl px-8 mb-10 text-center">
        <div className="cinema-screen-container relative mb-3">
          <div className="cinema-curved-screen h-12 flex items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" /> {screenType} SCREEN
            </span>
          </div>
        </div>
        <p className="text-[11px] uppercase tracking-widest text-slate-500">
          All eyes facing front towards the {auditoriumName} screen
        </p>
      </div>

      {/* Seat Grid with Row Labels */}
      <div className="w-full overflow-x-auto pb-6 px-4 flex justify-center">
        <div className="min-w-fit flex flex-col gap-2.5">
          {sortedRows.map((rowLetter) => {
            const rowSeats = rowsMap.get(rowLetter)!.sort((a, b) => a.number - b.number);

            return (
              <div key={rowLetter} className="flex items-center gap-3">
                {/* Left Row Label */}
                <span className="w-5 text-center text-xs font-bold text-slate-400">
                  {rowLetter}
                </span>

                {/* Seat Buttons in Row */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {rowSeats.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const isAvailable = seat.status === "AVAILABLE";
                    const isHeld = seat.status === "HELD";
                    const isBooked = seat.status === "BOOKED";

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={!isAvailable && !isSelected}
                        onClick={() => onToggleSeat(seat)}
                        title={`Row ${seat.row} Seat ${seat.number} (${seat.seatType}) - ${formatCentsToUSD(
                          seat.priceCents
                        )} [${seat.status}]`}
                        className={`relative group flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-bold transition-all duration-200 ${getSeatColor(
                          seat,
                          isSelected
                        )}`}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : isHeld ? (
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <span>{seat.number}</span>
                        )}

                        {/* Hover Price Tag Tooltip */}
                        {isAvailable && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded shadow-lg border border-slate-700 whitespace-nowrap z-20 pointer-events-none">
                            {formatCentsToUSD(seat.priceCents)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right Row Label */}
                <span className="w-5 text-center text-xs font-bold text-slate-400">
                  {rowLetter}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seat Map Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 px-4 py-3 bg-surface-200/80 border border-slate-800 rounded-2xl text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-300 font-bold">
            1
          </div>
          <span className="text-slate-300">Standard</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center text-[10px] font-bold">
            1
          </div>
          <span className="text-slate-300">Premium Recliner</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-[10px] font-bold">
            1
          </div>
          <span className="text-slate-300">VIP Lounger</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center text-[10px] font-bold">
            1
          </div>
          <span className="text-slate-300">Accessible</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-cinema-400 text-slate-950 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="text-slate-300 font-bold text-cinema-400">Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-950/40 border border-dashed border-amber-600/60 flex items-center justify-center">
            <Lock className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-slate-400">Held (10m)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-slate-800/40 border border-slate-800 opacity-40"></div>
          <span className="text-slate-500">Booked</span>
        </div>
      </div>
    </div>
  );
}
