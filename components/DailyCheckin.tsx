"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, Flame, Quote, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface DailyCheckinProps {
  onCheckin: () => Promise<{ success: boolean; message: string; alreadyDone?: boolean }>;
  hasCheckedInToday: boolean;
}

const DAILY_WISDOMS = [
  {
    quote: "أَلَمْ يَعْلَم بِأَنَّ اللَّهَ يَرَى",
    source: "سورة العلق - آية 14",
  },
  {
    quote: "المُؤْمِنُ القَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللهِ مِنَ المُؤْمِنِ الضَّعِيفِ",
    source: "صحيح مسلم",
  },
  {
    quote: "مَا تَرَكَ عَبْدٌ شَيْئًا لِلَّهِ إِلَّا عَوَّضَهُ اللَّهُ بِهِ مَا هُوَ خَيْرٌ مِنْهُ",
    source: "مسند الإمام أحمد",
  },
  {
    quote: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا ۚ وَإِنَّ اللَّهَ لَمَعَ الْمُحْسِنِينَ",
    source: "سورة العنكبوت - آية 69",
  },
];

export default function DailyCheckin({
  onCheckin,
  hasCheckedInToday,
}: DailyCheckinProps) {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(hasCheckedInToday);
  const [feedback, setFeedback] = useState("");
  const [dayIndex, setDayIndex] = useState(0);

  useEffect(() => {
    setDayIndex(new Date().getDate() % DAILY_WISDOMS.length);
  }, []);

  const wisdom = DAILY_WISDOMS[dayIndex];

  const handleCheckinClick = async () => {
    if (checked || loading) return;
    setLoading(true);
    try {
      const res = await onCheckin();
      if (res.success) {
        setChecked(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
      setFeedback(res.message);
    } catch (err) {
      setFeedback("تعذر تسجيل الثبات، حاول ثانية.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Daily Quranic / Sunnah Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 relative overflow-hidden">
        <Quote className="w-8 h-8 text-emerald-500/10 absolute -bottom-2 -left-2 rotate-180" />
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>زاد الفارس اليومي</span>
        </div>
        <p className="text-sm font-serif text-slate-100 font-semibold leading-relaxed">
          «{wisdom.quote}»
        </p>
        <span className="block text-[11px] text-slate-400 font-sans mt-1">
          {wisdom.source}
        </span>
      </div>

      {/* Checkin Action Card */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-200">
            {checked ? "تم توثيق ثباتك اليوم بفضل الله" : "المساءلة اليومية (سجل صمودك)"}
          </span>
          <span className="text-[11px] text-slate-400">
            {checked ? "زادك الله ثباتاً ونوراً في قلبك 🛡️" : "اضغط لتوثيق صمود اليوم وكسب 15+ نقطة شرف"}
          </span>
        </div>

        <button
          onClick={handleCheckinClick}
          disabled={checked || loading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            checked
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950 active:scale-95"
          }`}
        >
          {checked ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>صامد ✓</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? "جارٍ الحفظ..." : "ثابت اليوم 🛡️"}</span>
            </>
          )}
        </button>
      </div>

      {feedback && (
        <div className="text-center text-xs text-emerald-400 font-medium animate-in fade-in">
          {feedback}
        </div>
      )}
    </div>
  );
}
