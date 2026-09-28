"use client";

import React, { useState } from "react";
import { RefreshCw, X, ShieldAlert, Check } from "lucide-react";

interface RelapseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRelapse: (trigger: string, note: string) => void;
}

const COMMON_TRIGGERS = [
  "الهاتف في السرير قبل النوم",
  "إطلاق البصر في وسائل التواصل (تيك توك، إنستغرام..)",
  "الفراغ والملل القاتل",
  "العزلة والجلوس وحيداً في الغرفة المغلقة",
  "الهروب من الحزن وضغوط الحياة",
  "التهاون في صلاة الجماعة",
];

export default function RelapseModal({
  isOpen,
  onClose,
  onConfirmRelapse,
}: RelapseModalProps) {
  const [selectedTrigger, setSelectedTrigger] = useState(COMMON_TRIGGERS[0]);
  const [note, setNote] = useState("");
  const [pledgeChecked, setPledgeChecked] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeChecked) return;
    onConfirmRelapse(selectedTrigger, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-black text-lg">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            <span>كبوة فارس ولا استسلام</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Motivational Hadith */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed text-center">
          <p className="font-semibold mb-1">
            «كُلُّ بَنِي آدَمَ خَطَّاءٌ، وَخَيْرُ الخَطَّائِينَ التَّوَّابُونَ»
          </p>
          <span className="text-slate-400 text-[11px]">
            السقوط ليس نهاية المطاف، الاستسلام في الوحل هو الهزيمة الحقيقية. قم وتوضأ واغسل قلبك.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              ما هو الفخ الذي أوقعك؟ (حلل سبب السقوط لتغلقه للأبد):
            </label>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {COMMON_TRIGGERS.map((trigger) => (
                <button
                  type="button"
                  key={trigger}
                  onClick={() => setSelectedTrigger(trigger)}
                  className={`text-right text-xs py-2 px-3 rounded-xl border transition-all ${
                    selectedTrigger === trigger
                      ? "bg-amber-500/20 border-amber-500 text-amber-200 font-bold"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {trigger}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              خاطرة أو درس تعلمته من هذا السقوط:
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اكتب درساً لنفسك كي تقرأه إذا وسوس لك الشيطان مرة أخرى.."
              rows={2}
              className="w-full text-xs p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Mandatory Pledge */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/90 border border-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={pledgeChecked}
              onChange={(e) => setPledgeChecked(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-xs text-slate-300 font-semibold leading-relaxed">
              أشهد الله أنني تبت إليه توبة نصوحاً، وسأقوم الآن للوضوء وصلاة ركعتي التوبة، ولن أستسلم للشيطان.
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={!pledgeChecked}
            className="w-full mt-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تصفير العداد وتجديد العهد مع الله</span>
          </button>
        </form>
      </div>
    </div>
  );
}
