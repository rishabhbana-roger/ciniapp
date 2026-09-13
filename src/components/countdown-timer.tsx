"use client";

import React, { useEffect, useState } from "react";
import { Timer, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: string; // ISO UTC
  onExpire?: () => void;
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeftMs(0);
        if (onExpire) onExpire();
        return 0;
      }
      setTimeLeftMs(diff);
      return diff;
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const totalSeconds = Math.max(0, Math.floor(timeLeftMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const isUrgent = totalSeconds < 120; // < 2 mins
  const isWarning = totalSeconds < 300; // < 5 mins

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
        isUrgent
          ? "bg-red-950/60 border-red-500 text-red-400 animate-pulse shadow-glow"
          : isWarning
          ? "bg-amber-950/40 border-amber-500/80 text-amber-400"
          : "bg-surface-200 border-slate-700 text-cinema-400"
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-4 h-4 text-red-400" />
      ) : (
        <Timer className="w-4 h-4 text-cinema-400" />
      )}
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-wider text-slate-400 leading-none">
          Hold Expiration
        </span>
        <span className="text-sm font-extrabold tracking-widest">{formattedTime}</span>
      </div>
    </div>
  );
}
