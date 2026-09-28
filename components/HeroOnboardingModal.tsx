"use client";

import React, { useState } from "react";
import { Shield, Sparkles, UserCheck, Flame } from "lucide-react";
import confetti from "canvas-confetti";

interface HeroOnboardingModalProps {
  isOpen: boolean;
  initialName: string;
  onSaveName: (chosenName: string) => void;
}

const PRESET_NICKNAMES = [
  "صابر في سبيل الله",
  "سيف الحق",
  "المرابط الثابت",
  "قاهر هواه",
  "المعتصم بالله",
  "فارس العفة",
  "طالب رضوان الله",
  "مجاهد النفس",
];

export default function HeroOnboardingModal({
  isOpen,
  initialName,
  onSaveName,
}: HeroOnboardingModalProps) {
  const [name, setName] = useState(
    initialName && !initialName.startsWith("فارس #") && !initialName.startsWith("admin_")
      ? initialName
      : ""
  );
  const [pledge, setPledge] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pledge) return;
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    onSaveName(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-500/40 p-6 shadow-2xl glow-gold text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1.5 border-b border-slate-800 pb-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl mb-1 shadow-inner">
            ⚔️
          </div>
          <h2 className="text-base font-black text-amber-300">
            اختر لقبك في كتيبة الصادقين
          </h2>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            هذا هو الاسم أو اللقب الذي ستظهر به في <b>لوحة البطولة والشرف 🏆</b> ليتنافس به الصالحون وتتحفز به همم إخوانك!
          </p>
        </div>

        {/* Quick Pick Presets */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-2">
            أو اختر لقباً سريعاً من ألقاب الفرسان:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_NICKNAMES.map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setName(preset)}
                className={`text-[11px] py-1 px-2.5 rounded-xl border transition-all ${
                  name === preset
                    ? "bg-amber-500/20 border-amber-400 text-amber-200 font-bold scale-105"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-1">
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              اكتب اسمك أو لقبك هنا:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: صابر في سبيل الله / أسامة.."
              className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              maxLength={30}
              required
            />
          </div>

          {/* Pledge Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={pledge}
              onChange={(e) => setPledge(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-[11px] text-slate-300 font-semibold leading-relaxed">
              «أعاهد الله أن أصمد وأطهر نفسي وأنافس إخواني في العفة والخير ولا أبدل تبديلاً».
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim() || !pledge}
            className="w-full mt-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-950 transition-all text-xs"
          >
            <UserCheck className="w-4 h-4 text-black" />
            <span>اعتماد اللقب ودخول سباق البطولة ⚔️</span>
          </button>
        </form>
      </div>
    </div>
  );
}
