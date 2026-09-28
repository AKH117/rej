"use client";

import React, { useState } from "react";
import { Shield, Sparkles, UserCheck, Flame, ArrowRight, CheckSquare, Square } from "lucide-react";
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
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(
    initialName && !initialName.startsWith("فارس #") && !initialName.startsWith("admin_")
      ? initialName
      : ""
  );
  const [oathSworn, setOathSworn] = useState(false);

  if (!isOpen) return null;

  const handleNextToOath = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep(2);
  };

  const handleFinalSubmit = () => {
    if (!oathSworn) return;
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });
    onSaveName(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-500/50 p-6 shadow-2xl glow-gold text-slate-100 flex flex-col gap-4">
        
        {/* STEP 1: CHOOSE HERO NICKNAME */}
        {step === 1 && (
          <div className="flex flex-col gap-4 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-1.5 border-b border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl mb-1 shadow-inner">
                ⚔️
              </div>
              <h2 className="text-base font-black text-amber-300">
                الخطوة 1: اختر لقبك في كتيبة الصادقين
              </h2>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                هذا هو الاسم أو اللقب الذي ستظهر به في <b>لوحة البطولة والشرف 🏆</b> ليتنافس به الصالحون وتتحفز به همم إخوانك!
              </p>
            </div>

            {/* Quick Pick Presets */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-2">
                ألقاب الفرسان (اضغط للاختيار السريع):
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
            <form onSubmit={handleNextToOath} className="flex flex-col gap-3 mt-1">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  أو اكتب اسمك / لقبك كما تحب:
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

              {/* Next Button */}
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full mt-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black py-3 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-amber-950 transition-all text-xs"
              >
                <span>المتابعة إلى ميثاق وقَسَم الصدق</span>
                <ArrowRight className="w-4 h-4 rotate-180 text-black" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: THE SACRED OATH (الحلف واليمين بالله على الصدق) */}
        {step === 2 && (
          <div className="flex flex-col gap-3.5 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-1 border-b border-amber-500/30 pb-3">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/30">
                ميثاق الفرسان وقَسَم الصدق
              </span>
              <h2 className="text-sm font-black text-white mt-1">
                يا «{name}».. أنت الآن بين يدي الله
              </h2>
              <p className="text-[11px] text-slate-300 leading-relaxed max-w-xs">
                هذا صرح <b>«رِجَالٌ صَدَقُوا»</b>، لا مكان فيه لكذب أو خداع، فالله ناظر إليك ويعلم خائنة الأعين وما تخفي الصدور.
              </p>
            </div>

            {/* The Solemn Oath Text Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-amber-500/40 text-amber-200 text-xs font-serif leading-loose text-center shadow-inner relative">
              <span className="block text-[10px] text-amber-400/80 font-sans uppercase font-bold mb-1">
                نص اليمين بالله العظيم:
              </span>
              «أُقْسِمُ بِاللهِ العَظِيمِ، الَّذِي يَعْلَمُ السِّرَّ وَأَخْفَى، أَنْ أَقُولَ وَأَكْتُبَ الحَقَّ وَالصِّدْقَ، وَأَلَّا أَكْذِبَ فِي أَيَّامِ صُمُودِي، وَأَنْ أُسَجِّلَ انْتِكَاسَتِي فَوْرَ حُدُوثِهَا ابْتِغَاءَ مَرْضَاةِ اللهِ وَعِفَّةِ نَفْسِي.. وَاللهُ عَلَى مَا أَقُولُ شَهِيدٌ»
            </div>

            {/* Mandatory Confirmation Check */}
            <div
              onClick={() => setOathSworn(!oathSworn)}
              className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer select-none transition-all ${
                oathSworn
                  ? "bg-amber-500/20 border-amber-400 text-amber-100"
                  : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="mt-0.5">
                {oathSworn ? (
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <span className="text-[11px] leading-relaxed font-semibold">
                أشهد الله وملائكته أنني حلفت بهذا القَسَم العظيم في قلبي ولساني وسأصدق مع ربي وإخواني.
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs"
              >
                تعديل الاسم
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!oathSworn}
                className="flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-950 transition-all text-xs"
              >
                <UserCheck className="w-4 h-4 text-emerald-300" />
                <span>أَقْسَمْتُ بِاللهِ.. دُخُولُ المَيْدَانِ ⚔️</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
