"use client";

import React from "react";
import { Brain, CheckCircle2, Lock, Sparkles, BookOpen } from "lucide-react";
import { DOPAMINE_MILESTONES } from "@/lib/ranks";

interface DopamineRoadmapProps {
  currentDays: number;
}

export default function DopamineRoadmap({ currentDays }: DopamineRoadmapProps) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-black text-white">خارطة تعافي الدماغ وكيمياء الدوبامين</h2>
        </div>
        <span className="text-xs bg-purple-500/10 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-full font-bold">
          {currentDays} يوم صمود
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        الإباحية تصنع مسارات عصبية مشوهة تفرز دوباميناً ساماً يدمر الإرادة. عندما تتوقف، يقوم الدماغ بـ «عملية جراحية حيوية» لإعادة بناء خلاياه ومستقبلاته:
      </p>

      {/* Timeline Steps */}
      <div className="relative border-r-2 border-slate-800 pr-4 mr-2 flex flex-col gap-6 mt-2">
        {DOPAMINE_MILESTONES.map((m) => {
          const isUnlocked = currentDays >= m.day;

          return (
            <div key={m.day} className="relative flex flex-col gap-1.5">
              {/* Dot on the timeline */}
              <div
                className={`absolute -right-[23px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  isUnlocked
                    ? "bg-emerald-500 border-emerald-400 shadow-md shadow-emerald-500/50"
                    : "bg-slate-900 border-slate-700"
                }`}
              >
                {isUnlocked ? (
                  <CheckCircle2 className="w-3 h-3 text-black stroke-[3]" />
                ) : (
                  <Lock className="w-2.5 h-2.5 text-slate-600" />
                )}
              </div>

              {/* Title & Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-black ${
                    isUnlocked ? "text-emerald-400" : "text-slate-400"
                  }`}
                >
                  {m.title}
                </span>
                {isUnlocked ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    تم الإنجاز ✓
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">
                    متبقي {m.day - currentDays} يوم
                  </span>
                )}
              </div>

              {/* Science Card */}
              <div
                className={`p-3 rounded-2xl border text-xs leading-relaxed transition-all ${
                  isUnlocked
                    ? "bg-slate-900/90 border-slate-700 text-slate-200"
                    : "bg-slate-950/40 border-slate-850 text-slate-500"
                }`}
              >
                <div className="flex items-start gap-1.5 mb-1.5">
                  <Sparkles
                    className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                      isUnlocked ? "text-amber-400" : "text-slate-600"
                    }`}
                  />
                  <span>
                    <b className={isUnlocked ? "text-amber-300" : "text-slate-500"}>
                      أثر ذلك في الدماغ:{" "}
                    </b>
                    {m.science}
                  </span>
                </div>

                <div className="flex items-start gap-1.5 pt-2 border-t border-slate-800/60 text-[11px]">
                  <BookOpen
                    className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                      isUnlocked ? "text-emerald-400" : "text-slate-600"
                    }`}
                  />
                  <span className={isUnlocked ? "text-emerald-200/90 font-serif" : "text-slate-600"}>
                    {m.islamicReward}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
