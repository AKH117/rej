"use client";

import React, { useState } from "react";
import { Trophy, Medal, Crown, Flame, Shield, Search } from "lucide-react";
import { UserProfile } from "@/lib/supabase";
import { getRankByDays } from "@/lib/ranks";

interface LeaderboardProps {
  profiles: UserProfile[];
  currentTelegramId?: number;
}

export default function Leaderboard({
  profiles,
  currentTelegramId,
}: LeaderboardProps) {
  const [tab, setTab] = useState<"current" | "longest">("current");
  const [search, setSearch] = useState("");

  const isConfirmedRecently = (lastCheckin?: string | null) => {
    if (!lastCheckin) return false;
    const diffHours = (Date.now() - new Date(lastCheckin).getTime()) / (1000 * 60 * 60);
    return diffHours <= 96; // 4 days window
  };

  const sortedProfiles = [...profiles].sort((a, b) => {
    const aConfirmed = isConfirmedRecently(a.last_checkin_at) ? 1 : 0;
    const bConfirmed = isConfirmedRecently(b.last_checkin_at) ? 1 : 0;

    // Prioritize actively confirmed profiles to prevent ghost accounts at top
    if (aConfirmed !== bConfirmed) {
      return bConfirmed - aConfirmed;
    }

    if (tab === "current") {
      return (
        b.current_streak_days - a.current_streak_days ||
        b.longest_streak_days - a.longest_streak_days ||
        b.total_points - a.total_points
      );
    }
    return (
      b.longest_streak_days - a.longest_streak_days ||
      b.current_streak_days - a.current_streak_days ||
      b.total_points - a.total_points
    );
  });

  const filtered = sortedProfiles.filter((p) =>
    (p.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const topThree = filtered.slice(0, 3);
  const remaining = filtered.slice(3);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in">
      {/* Title & Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-black text-white">لوحة البطولة والشرف</h2>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setTab("current")}
            className={`px-3 py-1 rounded-lg transition-all ${
              tab === "current"
                ? "bg-emerald-600 text-white font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            الصمود الحالي
          </button>
          <button
            onClick={() => setTab("longest")}
            className={`px-3 py-1 rounded-lg transition-all ${
              tab === "longest"
                ? "bg-amber-600 text-white font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            الأطول تاريخياً
          </button>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-2 items-end pt-6 pb-2">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-slate-400 bg-slate-800 flex items-center justify-center relative shadow-lg">
                <span className="text-lg">🥈</span>
                <span className="absolute -bottom-2 bg-slate-700 text-[10px] font-bold px-1.5 rounded-full text-slate-200">
                  #2
                </span>
              </div>
              <span className="text-xs font-bold text-slate-200 mt-3 truncate max-w-[85px] text-center">
                {topThree[1].display_name}
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {tab === "current" ? topThree[1].current_streak_days : topThree[1].longest_streak_days} يوم
              </span>
              <div className="w-full bg-slate-800/80 rounded-t-xl h-16 mt-2 border-t border-slate-700 flex items-center justify-center">
                <span className="text-[10px] text-slate-400">{getRankByDays(topThree[1].current_streak_days).title}</span>
              </div>
            </div>
          )}

          {/* 1st Place (Champion) */}
          {topThree[0] && (
            <div className="flex flex-col items-center">
              <Crown className="w-6 h-6 text-amber-400 animate-bounce mb-1" />
              <div className="w-16 h-16 rounded-full border-2 border-amber-400 bg-amber-500/10 flex items-center justify-center relative shadow-xl glow-gold">
                <span className="text-2xl">👑</span>
                <span className="absolute -bottom-2 bg-amber-500 text-black text-[11px] font-black px-2 rounded-full">
                  #1
                </span>
              </div>
              <span className="text-sm font-black text-amber-200 mt-3 truncate max-w-[100px] text-center">
                {topThree[0].display_name}
              </span>
              <span className="text-sm font-mono text-amber-400 font-black">
                {tab === "current" ? topThree[0].current_streak_days : topThree[0].longest_streak_days} يوم
              </span>
              <div className="w-full bg-gradient-to-t from-amber-950/60 to-amber-900/40 rounded-t-xl h-24 mt-2 border-t-2 border-amber-500/50 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-amber-300">
                  {getRankByDays(topThree[0].current_streak_days).title}
                </span>
                <span className="text-[10px] text-amber-400/70">{topThree[0].total_points} نقطة</span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-amber-700 bg-slate-800 flex items-center justify-center relative shadow-lg">
                <span className="text-lg">🥉</span>
                <span className="absolute -bottom-2 bg-amber-800 text-[10px] font-bold px-1.5 rounded-full text-amber-200">
                  #3
                </span>
              </div>
              <span className="text-xs font-bold text-slate-200 mt-3 truncate max-w-[85px] text-center">
                {topThree[2].display_name}
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {tab === "current" ? topThree[2].current_streak_days : topThree[2].longest_streak_days} يوم
              </span>
              <div className="w-full bg-slate-800/60 rounded-t-xl h-12 mt-2 border-t border-slate-700 flex items-center justify-center">
                <span className="text-[10px] text-slate-400">{getRankByDays(topThree[2].current_streak_days).title}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Integrity & Anti-Ghost Banner */}
      <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
        <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span><b>ميثاق النزاهة:</b> يتم تأكيد الصمود دورياً عبر البوت لضمان خلو الصدارة من الحسابات الخاملة أو المنقطعة.</span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن اسم بطل أو لقب.."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* Rankings List */}
      <div className="flex flex-col gap-2">
        {filtered.map((profile, idx) => {
          const isCurrentUser = profile.telegram_id === currentTelegramId;
          const rank = getRankByDays(profile.current_streak_days);
          const displayDays =
            tab === "current"
              ? profile.current_streak_days
              : profile.longest_streak_days;

          return (
            <div
              key={profile.id}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                isCurrentUser
                  ? "bg-emerald-950/40 border-emerald-500/60 glow-emerald"
                  : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 text-center font-bold text-xs ${
                    idx === 0
                      ? "text-amber-400 font-black text-sm"
                      : idx === 1
                      ? "text-slate-300 font-bold"
                      : idx === 2
                      ? "text-amber-600 font-bold"
                      : "text-slate-500"
                  }`}
                >
                  {idx + 1}
                </span>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-100">
                      {profile.display_name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                        أنت
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{rank.badge} {rank.title}</span>
                    <span>•</span>
                    {isConfirmedRecently(profile.last_checkin_at) ? (
                      <span className="text-emerald-400 font-bold">✓ مؤكد الصمود</span>
                    ) : (
                      <span className="text-amber-400/90 font-medium">⚠️ بانتظار التأكيد</span>
                    )}
                    <span>•</span>
                    <span className="text-amber-400/80">{profile.total_points} نقطة</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono text-sm bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-xl">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{displayDays}</span>
                <span className="text-[10px] font-sans text-slate-400">يوم</span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs">
            لا يوجد متنافسون بهذا الاسم بعد.
          </div>
        )}
      </div>
    </div>
  );
}
