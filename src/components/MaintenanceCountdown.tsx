import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface MaintenanceCountdownProps {
  targetTime: string;
  lang: string;
  onComplete: () => void;
  serverTime?: number;
}

// Helper to parse date consistently with +07:00 (Thai) timezone if no timezone offset is provided
const parseTargetTime = (timeStr: string): Date => {
  if (!timeStr) return new Date();
  if (timeStr.includes("Z") || timeStr.includes("+") || /-\d{2}:\d{2}$/.test(timeStr)) {
    return new Date(timeStr);
  }
  return new Date(timeStr + "+07:00");
};

export const MaintenanceCountdown: React.FC<MaintenanceCountdownProps> = ({
  targetTime,
  lang,
  onComplete,
  serverTime,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
  }>({ hours: 0, minutes: 0, seconds: 0, completed: false });

  useEffect(() => {
    // Calculate the difference between client clock and server clock at the moment settings were loaded
    const serverTimeOffset = serverTime ? (Date.now() - serverTime) : 0;

    const calculateTimeLeft = () => {
      // Adjust client's current timestamp with the offset to get the server-synchronized timestamp
      const synchronizedNow = Date.now() - serverTimeOffset;
      const difference = +parseTargetTime(targetTime) - synchronizedNow;
      
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, completed: true };
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return { hours, minutes, seconds, completed: false };
    };

    // Initial check
    const initial = calculateTimeLeft();
    setTimeLeft(initial);
    if (initial.completed) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.completed) {
        clearInterval(timer);
        onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime, onComplete]);

  if (timeLeft.completed) {
    return null;
  }

  // Format with leading zero
  const formatNum = (num: number) => num.toString().padStart(2, "0");

  const formattedTargetDate = (() => {
    try {
      const d = new Date(targetTime);
      return d.toLocaleString(lang === "th" ? "th-TH" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return targetTime;
    }
  })();

  return (
    <div className="bg-[#1A1310]/85 p-5 rounded-3xl border border-[#D4AF37]/20 max-w-md mx-auto space-y-4 shadow-xl shadow-black/40 text-center select-none animate-fadeIn">
      <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
        <span className="flex items-center gap-1.5 text-amber-500 font-bold">
          <Clock size={13} className="animate-spin-slow" />
          {lang === "th" ? "เปิดให้บริการอัตโนมัติในอีก" : "Auto-Opening in:"}
        </span>
        <span className="text-stone-500 font-mono text-[10px]">({formattedTargetDate})</span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {/* Hours */}
        <div className="bg-[#0F0B09] p-3 rounded-2xl border border-white/5 shadow-inner">
          <div className="text-2xl font-mono font-black text-amber-400 tracking-wider">
            {formatNum(timeLeft.hours)}
          </div>
          <div className="text-[9px] uppercase tracking-wider text-stone-500 mt-1 font-bold">
            {lang === "th" ? "ชั่วโมง" : "Hours"}
          </div>
        </div>

        {/* Minutes */}
        <div className="bg-[#0F0B09] p-3 rounded-2xl border border-white/5 shadow-inner">
          <div className="text-2xl font-mono font-black text-amber-400 tracking-wider">
            {formatNum(timeLeft.minutes)}
          </div>
          <div className="text-[9px] uppercase tracking-wider text-stone-500 mt-1 font-bold">
            {lang === "th" ? "นาที" : "Minutes"}
          </div>
        </div>

        {/* Seconds */}
        <div className="bg-[#0F0B09] p-3 rounded-2xl border border-white/5 shadow-inner">
          <div className="text-2xl font-mono font-black text-amber-500 tracking-wider animate-pulse">
            {formatNum(timeLeft.seconds)}
          </div>
          <div className="text-[9px] uppercase tracking-wider text-stone-500 mt-1 font-bold">
            {lang === "th" ? "วินาที" : "Seconds"}
          </div>
        </div>
      </div>

      {/* Progress Line */}
      <div className="h-1 w-full bg-stone-900 rounded-full overflow-hidden relative">
        <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full animate-pulse w-full" />
      </div>
    </div>
  );
};
