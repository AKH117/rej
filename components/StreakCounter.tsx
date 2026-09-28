"use client";

import React, { useEffect, useState } from "react";
import { Shield, Flame, Award, AlertTriangle, Sparkles } from "lucide-react";
import { getRankByDays, RANKS } from "@/lib/ranks";

interface StreakCounterProps {
  startDate: string;
  onOpenRelapseModal: () => void;
  onOpenSosModal: () => void;
  points: number;
}

export default function StreakCounter({
  startDate,
  onOpenRelapseModal,
  onOpenSosModal,
  points,
}: StreakCounterProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDate).getTime();
      const now = new Date().getTime();
      const difference = Math.max(0, now - start);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  const currentRank = getRankByDays(timeLeft.days);
  const nextRank = RANKS.find((r) => r.minDays > timeLeft.days) || currentRank;
  
  const daysInCurrentLevel = timeLeft.days - currentRank.minDays;
  const levelTotalDays = Math.max(1, nextRank.minDays - currentRank.minDays);
  const progressPercent = Math.min(
    100,
    Math.round((daysInCurrentLevel / levelTotalDays) * 100)
  );

  return (
    <div className="flex flex-col gap-4" suppressHydrationWarning>
      {/* Main Hero Card: Purity Shield */}
      <div className="relative overflow-hidden rounded-3xl gradient-card p-6 border border-emerald-900/40 glow-emerald">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar: Rank Badge and Honor Points */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400">
            <span className="text-base">{currentRank.badge}</span>
            <span>رتبة: {currentRank.title}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{points} نقطة شرف</span>
          </div>
        </div>

        {/* Central Display: Days of Pure Manhood */}
        <div className="flex flex-col items-center justify-center my-3 text-center">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>مدة الصمود والطهارة المستمرة</span>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black tracking-tight text-white font-cairo drop-shadow-md">
              {timeLeft.days}
            </span>
            <span className="text-xl font-bold text-emerald-400">يوم</span>
          </div>

          {/* Sub-counters: Hours, Minutes, Seconds */}
          <div className="grid grid-cols-3 gap-2 mt-4 w-full max-w-xs">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl py-2 px-1 text-center">
              <span className="block text-lg font-bold text-slate-200">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">ساعة</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl py-2 px-1 text-center">
              <span className="block text-lg font-bold text-slate-200">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">دقيقة</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl py-2 px-1 text-center">
              <span className="block text-lg font-bold text-emerald-400 font-mono">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">ثانية</span>
            </div>
          </div>
        </div>

        {/* Progress towards Next Rank */}
        {nextRank.title !== currentRank.title && (
          <div className="mt-5 pt-4 border-t border-slate-800/70">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span>الرتبة القادمة: <b className="text-amber-300">{nextRank.badge} {nextRank.title}</b></span>
              <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-amber-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              متبقي <b className="text-slate-200">{Math.max(1, nextRank.minDays - timeLeft.days)}</b> أيام للارتقاء إلى رتبة «{nextRank.title}»
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons: Giant SOS + Relapse Protocol */}
      <div className="grid grid-cols-2 gap-3">
        {/* SOS Emergency Button */}
        <button
          onClick={onOpenSosModal}
          className="col-span-2 relative overflow-hidden group bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 text-white font-bold py-4 px-5 rounded-2xl flex items-center justify-center gap-3 pulse-sos shadow-lg shadow-red-900/40 active:scale-[0.98] transition-all"
        >
          <AlertTriangle className="w-6 h-6 animate-bounce text-amber-300" />
          <span className="text-base tracking-wide font-black">
            زر الاستغاثة والطوارئ (SOS)
          </span>
          <span className="text-xs bg-red-900/60 px-2 py-0.5 rounded-md font-normal border border-red-400/30">
            عند هجوم الشهوة
          </span>
        </button>

        {/* Relapse / Reset Pledge */}
        <button
          onClick={onOpenRelapseModal}
          className="col-span-2 bg-gradient-to-r from-slate-900 to-rose-950/40 hover:from-slate-850 hover:to-rose-900/50 border border-rose-900/50 hover:border-rose-700/70 text-slate-200 hover:text-white text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99]"
        >
          <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="font-bold">
            حدثت انتكاسة؟ (كبوة فارس ولا استسلام - إقرار الصدق والنهوض فوراً)
          </span>
        </button>
      </div>
    </div>
  );
}
