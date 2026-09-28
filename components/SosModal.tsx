"use client";

import React, { useState, useEffect } from "react";
import { AlertOctagon, X, Heart, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRescueSuccess: () => void;
}

export default function SosModal({
  isOpen,
  onClose,
  onRescueSuccess,
}: SosModalProps) {
  const [step, setStep] = useState(1);
  const [breathTimer, setBreathTimer] = useState(20);
  const [isBreathingDone, setIsBreathingDone] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setBreathTimer(20);
      setIsBreathingDone(false);
      return;
    }

    // Auto-countdown for breathing step
    const interval = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsBreathingDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVictory = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onRescueSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border-2 border-red-600/50 p-6 shadow-2xl glow-danger text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-900/50 pb-3">
          <div className="flex items-center gap-2 text-rose-500 font-black text-lg">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
            <span>بروتوكول الطوارئ والاستغاثة</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Sensory Disruption & Breathing */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center py-4 gap-4 animate-in fade-in">
            <div className="text-amber-400 text-xs font-bold uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
              المرحلة 1: كسر شعلة الدوبامين الآنية
            </div>

            <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-4 border-dashed border-rose-500/60 animate-spin-slow">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-black text-white">{breathTimer}</span>
                <span className="text-[10px] text-white/80">ثانية تنفس</span>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-200 leading-relaxed max-w-xs">
              توقف تماماً.. أغمض عينيك الآن.. خذ نفساً عميقاً من أنفك لـ 4 ثوانٍ.. واكتمه وازفره ببطء.
            </p>
            <span className="text-xs text-rose-400">
              الشهوة موجة كيميائية قمتها 90 ثانية فقط.. إذا حبست نفسك عنها انكسرت شوكتها!
            </span>

            <button
              onClick={() => setStep(2)}
              className="w-full mt-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>التالي: صدمة التذكير بالله</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}

        {/* STEP 2: Quranic & Divine Awakening */}
        {step === 2 && (
          <div className="flex flex-col items-center text-center py-2 gap-4 animate-in fade-in">
            <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              المرحلة 2: استحضار مراقبة الجبار جل جلاله
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-amber-200 font-serif text-lg leading-loose shadow-inner">
              «أَلَمْ يَعْلَم بِأَنَّ اللَّهَ يَرَى»
              <span className="block text-xs font-sans text-amber-400/80 mt-1">
                سورة العلق - آية 14
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300 text-xs leading-relaxed text-right">
              <p className="mb-2 font-semibold text-rose-400">
                يا عبد الله.. هل ترضى أن يأتيك ملك الموت وأنت على هذه الخطيئة؟!
              </p>
              <p>
                أتجعل الله جل وعلا أهون الناظرين إليك؟ تستحي من طفل صغير يراك ولا تستحي من رب العرش والملكين اللذين يحصيان عليك كل نظرة ولمسة؟!
              </p>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>التالي: أوامر النجاة الصارمة</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}

        {/* STEP 3: Mandatory Tactical Actions */}
        {step === 3 && (
          <div className="flex flex-col gap-3 py-2 animate-in fade-in">
            <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30 text-center">
              المرحلة 3: أوامر الفرسان الفورية
            </div>

            <div className="flex flex-col gap-2.5 text-xs text-slate-200">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center border border-red-500/40">1</span>
                <div>
                  <b className="text-white block text-sm">ارْمِ الهاتف بعيداً الآن</b>
                  ضعه في غرفة أخرى أو على طاولة بعيدة واخرج من خلوتك فوراً.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/40">2</span>
                <div>
                  <b className="text-white block text-sm">الوضوء بالماء البارد</b>
                  الماء يطفئ شعلة الشهوة ونار الغضب والوسواس كما أخبر النبي ﷺ.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center border border-amber-500/40">3</span>
                <div>
                  <b className="text-white block text-sm">صلاة ركعتين خاشعتين</b>
                  اهزم الشيطان في عقر داره: أردت أن تعصي؟ فعاقبه بركعتين طويلتين واستغفار!
                </div>
              </div>
            </div>

            {/* Victory confirmation button */}
            <button
              onClick={handleVictory}
              className="w-full mt-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-950 transition-all text-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>قهرت الشيطان ونجوت بفضل الله 🛡️ (+25 نقطة شرف)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
