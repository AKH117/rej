"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Trophy,
  Brain,
  Info,
  User,
  ExternalLink,
  Flame,
  CheckCircle2,
  Sparkles,
  Edit3,
  X,
  Swords,
} from "lucide-react";
import StreakCounter from "@/components/StreakCounter";
import SosModal from "@/components/SosModal";
import RelapseModal from "@/components/RelapseModal";
import Leaderboard from "@/components/Leaderboard";
import DopamineRoadmap from "@/components/DopamineRoadmap";
import HeroOnboardingModal from "@/components/HeroOnboardingModal";
import TournamentsAndBrotherhood from "@/components/TournamentsAndBrotherhood";
import { UserProfile, getOrCreateProfile, getLeaderboard, registerRelapse, updateDisplayName, supabaseAdmin } from "@/lib/supabase";
import { getRankByDays } from "@/lib/ranks";

// Declare Telegram WebApp on window
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        disableVerticalSwipes?: () => void;
        enableVerticalSwipes?: () => void;
        isVerticalSwipesEnabled?: boolean;
        enableClosingConfirmation?: () => void;
        disableClosingConfirmation?: () => void;
        isClosingConfirmationEnabled?: boolean;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        requestFullscreen?: () => void;
        isVersionAtLeast?: (version: string) => boolean;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
        };
      };
    };
  }
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "tournaments" | "leaderboard" | "roadmap" | "about">("dashboard");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [leaderboardProfiles, setLeaderboardProfiles] = useState<UserProfile[]>([]);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isRelapseOpen, setIsRelapseOpen] = useState(false);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Telegram Mini App Configuration & Swipe-to-close Prevention
  useEffect(() => {
    const configureTelegram = () => {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        try {
          tg.ready();
          tg.expand();

          // Disable vertical swipes to prevent pull-down-to-close / swipe-to-minimize
          if (typeof tg.disableVerticalSwipes === "function") {
            tg.disableVerticalSwipes();
          }

          // Enable closing confirmation to prevent accidental exit
          if (typeof tg.enableClosingConfirmation === "function") {
            tg.enableClosingConfirmation();
          }

          // Match Telegram app theme colors with brand background
          if (typeof tg.setHeaderColor === "function") {
            tg.setHeaderColor("#070a10");
          }
          if (typeof tg.setBackgroundColor === "function") {
            tg.setBackgroundColor("#070a10");
          }
        } catch (e) {
          console.warn("Telegram WebApp initialization warning:", e);
        }
      }
    };

    configureTelegram();
    const timer = setTimeout(configureTelegram, 300);

    // Prevent iOS rubber-band overscroll pull-down that triggers Telegram sheet dismiss
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const currentY = e.touches[0].clientY;
      const isSwipingDown = currentY > touchStartY;

      // When pulling down at the top of the page
      if (isSwipingDown && window.scrollY <= 0) {
        let target = e.target as HTMLElement | null;
        let isInsideScrolledElement = false;
        while (target && target !== document.body && target !== document.documentElement) {
          if (target.scrollTop > 0) {
            isInsideScrolledElement = true;
            break;
          }
          target = target.parentElement;
        }

        // Only prevent default if we are at the very top of all scrollable parents
        if (!isInsideScrolledElement && e.cancelable) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // Dedicated Close Mini App handler
  const handleCloseApp = () => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    } else if (typeof window !== "undefined") {
      window.close();
    }
  };

  // Initialize Telegram or fallback guest user
  useEffect(() => {
    async function initUser() {
      try {
        let telegramUser = {
          id: 8925138241, // Default to admin ID from user
          first_name: "قائد الفرسان",
          username: "admin_fursan",
        };

        if (typeof window !== "undefined" && window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();
          tg.expand();

          if (typeof tg.disableVerticalSwipes === "function") {
            tg.disableVerticalSwipes();
          }
          if (typeof tg.enableClosingConfirmation === "function") {
            tg.enableClosingConfirmation();
          }

          if (tg.initDataUnsafe?.user) {
            telegramUser = {
              id: tg.initDataUnsafe.user.id,
              first_name: tg.initDataUnsafe.user.first_name || "فارس",
              username: tg.initDataUnsafe.user.username || "",
            };
          }
        }

        // Fetch or create profile in Supabase
        const profile = await getOrCreateProfile(telegramUser);
        if (profile) {
          setUserProfile(profile);
          setNewName(profile.display_name);

          const hasSavedName = typeof window !== "undefined" && localStorage.getItem(`rejal_name_chosen_${profile.telegram_id}`);
          const isGeneric = !profile.display_name || profile.display_name.startsWith("فارس #") || profile.display_name.startsWith("@") || profile.display_name.startsWith("admin_");
          if (!hasSavedName && isGeneric) {
            setIsOnboardingOpen(true);
          }
        } else {
          // Local fallback demo state if DB tables not yet migrated
          setUserProfile({
            id: "demo-user",
            telegram_id: telegramUser.id,
            telegram_username: telegramUser.username,
            first_name: telegramUser.first_name,
            display_name: telegramUser.first_name || "فارس العفة",
            streak_start_date: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
            current_streak_days: 3,
            longest_streak_days: 7,
            total_points: 130,
            rank_title: "تائب مقبل",
            bio_motto: "عاهدت الله ألا أعود.. رجال صدقوا",
            is_public_leaderboard: true,
            is_admin: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          const hasSavedName = typeof window !== "undefined" && localStorage.getItem("rejal_name_chosen_demo");
          if (!hasSavedName) {
            setIsOnboardingOpen(true);
          }
        }

        // Fetch Leaderboard
        const lb = await getLeaderboard(50);
        if (lb.length > 0) {
          setLeaderboardProfiles(lb);
        } else {
          // Mock seed leaderboard if fresh database
          setLeaderboardProfiles([
            {
              id: "hero-1",
              telegram_id: 101,
              display_name: "أبو بكر الصديق (قدوة)",
              streak_start_date: new Date(Date.now() - 120 * 86400000).toISOString(),
              current_streak_days: 120,
              longest_streak_days: 120,
              total_points: 950,
              rank_title: "صِدِّيق",
              is_public_leaderboard: true,
              is_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: "hero-2",
              telegram_id: 102,
              display_name: "سيف الله المسلول",
              streak_start_date: new Date(Date.now() - 65 * 86400000).toISOString(),
              current_streak_days: 65,
              longest_streak_days: 65,
              total_points: 540,
              rank_title: "فارس العفة",
              is_public_leaderboard: true,
              is_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: "hero-3",
              telegram_id: 103,
              display_name: "المرابط في سبيل الله",
              streak_start_date: new Date(Date.now() - 32 * 86400000).toISOString(),
              current_streak_days: 32,
              longest_streak_days: 32,
              total_points: 310,
              rank_title: "قاهر الشهوة",
              is_public_leaderboard: true,
              is_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    }

    initUser();
  }, []);

  // Handle Relapse Confirm
  const handleRelapseConfirm = async (trigger: string, note: string) => {
    if (!userProfile) return;
    const nowIso = new Date().toISOString();
    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            streak_start_date: nowIso,
            current_streak_days: 0,
            rank_title: "تائب مقبل",
          }
        : null
    );

    await registerRelapse(userProfile.telegram_id, trigger, note);
  };

  // Handle SOS Rescue Success
  const handleRescueSuccess = async () => {
    if (!userProfile) return;
    const updatedPoints = (userProfile.total_points || 0) + 25;
    setUserProfile((prev) =>
      prev ? { ...prev, total_points: updatedPoints } : null
    );

    try {
      await supabaseAdmin
        .from("profiles")
        .update({ total_points: updatedPoints })
        .eq("telegram_id", userProfile.telegram_id);

      await supabaseAdmin.from("sos_logs").insert({
        user_id: userProfile.id,
        telegram_id: userProfile.telegram_id,
        was_resolved: true,
        feedback_notes: "نجح البطل في قهر الشهوة وصرف نفسه",
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Update Nickname
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !newName.trim()) return;
    setUserProfile((prev) => (prev ? { ...prev, display_name: newName } : null));
    setIsEditNameOpen(false);

    try {
      await supabaseAdmin
        .from("profiles")
        .update({ display_name: newName })
        .eq("telegram_id", userProfile.telegram_id);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Save Onboarding Nickname
  const handleSaveOnboardingName = async (chosenName: string) => {
    if (!userProfile) return;
    setUserProfile((prev) => (prev ? { ...prev, display_name: chosenName } : null));
    setNewName(chosenName);
    setIsOnboardingOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(`rejal_name_chosen_${userProfile.telegram_id}`, "true");
      localStorage.setItem("rejal_name_chosen_demo", "true");
    }
    await updateDisplayName(userProfile.telegram_id, chosenName);
  };

  if (!mounted || loading) {
    return (
      <div
        suppressHydrationWarning
        className="flex-1 flex flex-col items-center justify-center gap-3 py-24"
      >
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-300">
          «مِّنَ الْمُؤْمِنِينَ رِجَالٌ صَدَقُوا».. جارٍ التحضير
        </span>
      </div>
    );
  }

  const currentRank = getRankByDays(userProfile?.current_streak_days || 0);

  return (
    <div className="flex-1 flex flex-col pb-20">
      {/* Top Header */}
      <header className="flex items-center justify-between py-3 mb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-900/30 text-slate-950 font-black">
            ⚔️
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>رِجَالٌ صَدَقُوا</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                درع العفة
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">
              «مَا عَاهَدُوا اللَّهَ عَلَيْهِ»
            </p>
          </div>
        </div>

        {/* User Actions & Close Button */}
        <div className="flex items-center gap-2">
          {/* User Nickname & Rank */}
          <div
            onClick={() => setIsEditNameOpen(true)}
            className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-2xl cursor-pointer transition-all active:scale-95"
            title="تعديل الاسم واللقب"
          >
            <div className="text-right">
              <span className="block text-xs font-bold text-slate-200 truncate max-w-[80px]">
                {userProfile?.display_name}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                {currentRank.badge} {currentRank.title}
              </span>
            </div>
            <Edit3 className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
          </div>

          {/* Explicit Close Button for Telegram Mini App */}
          <button
            onClick={handleCloseApp}
            className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 flex items-center justify-center transition-all active:scale-95 shadow-sm"
            title="إغلاق التطبيق"
            aria-label="إغلاق التطبيق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Tab Content */}
      <div className="flex-1">
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-4 animate-in fade-in">
            {/* The Main Counter */}
            <StreakCounter
              startDate={userProfile?.streak_start_date || new Date().toISOString()}
              points={userProfile?.total_points || 100}
              onOpenRelapseModal={() => setIsRelapseOpen(true)}
              onOpenSosModal={() => setIsSosOpen(true)}
            />

            {/* The Covenant of Truth & Bot Automatic Checkup Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>ميثاق الصدق والمساءلة الدورية</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                  قَسَم الفرسان
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-serif">
                «أُقْسِمُ بِاللهِ العَظِيمِ أَنْ أَقُولَ وَأَكْتُبَ الحَقَّ وَالصِّدْقَ، وَأَلَّا أَكْذِبَ فِي أَيَّامِ صُمُودِي، وَأَنْ أُسَجِّلَ انْتِكَاسَتِي فَوْرَ حُدُوثِهَا».
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 leading-normal flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">⚡ تنبيه:</span>
                <span>
                  يقوم بوت التليجرام بإرسال رسائل دورية للاطمئنان عليك. إذا حدثت انتكاسة لا قدر الله، الصدق شيمة الرجال؛ اضغط فوراً على زر <b>(حدثت انتكاسة)</b> بالأعلى لتجديد العهد ومسح الذنب.
                </span>
              </div>
            </div>

            {/* Quick Link to Bot & Channel */}
            <a
              href="https://t.me/rejal313bot"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs text-slate-300 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🤖</span>
                <span>تفعيل تنبيهات بوت التليجرام اليومية</span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500" />
            </a>
          </div>
        )}

        {activeTab === "tournaments" && (
          <TournamentsAndBrotherhood
            currentStreakDays={userProfile?.current_streak_days || 0}
            totalPoints={userProfile?.total_points || 100}
            displayName={userProfile?.display_name || "فارس العفة"}
          />
        )}

        {activeTab === "leaderboard" && (
          <Leaderboard
            profiles={leaderboardProfiles}
            currentTelegramId={userProfile?.telegram_id}
          />
        )}

        {activeTab === "roadmap" && (
          <DopamineRoadmap
            currentDays={userProfile?.current_streak_days || 0}
          />
        )}

        {activeTab === "about" && (
          <div className="flex flex-col gap-4 animate-in fade-in text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl gradient-card border border-amber-500/20">
              <h2 className="text-sm font-black text-amber-300 mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>رؤية المنظومة: صناعة أمة ترضي ربها</span>
              </h2>
              <p className="mb-2">
                سُرقت طاقة الأمة وشبابها لعقود عبر «الدوبامين المسموم» والتفاهة والفجور في مواقع التواصل والإباحية المحرمة. 
              </p>
              <p>
                مشروع <b>«رِجَالٌ صَدَقُوا»</b> جاء ليعيد البوصلة: نستبدل الدوبامين الخبيث بنور الإيمان، وعزة الرجولة، والتنافس الشريف في الصمود والعفة والصلوات في جماعة، لنكون ممن قال الله فيهم:
              </p>
              <div className="mt-3 p-3 rounded-xl bg-slate-950 text-amber-200 font-serif text-center text-sm border border-amber-500/30">
                «مِّنَ الْمُؤْمِنِينَ رِجَالٌ صَدَقُوا مَا عَاهَدُوا اللَّهَ عَلَيْهِ ۖ فَمِنْهُم مَّن قَضَىٰ نَحْبَهُ وَمِنْهُم مَّن يَنتَظِرُ ۖ وَمَا بَدَّلُوا تَبْدِيلًا»
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="font-bold text-white mb-2">رتب الفرسان ومراحل الصمود:</h3>
              <ul className="flex flex-col gap-1.5 text-slate-400">
                <li>• <b>تائب مقبل:</b> من 1 إلى 3 أيام (كسر الصدمة الأولى).</li>
                <li>• <b>صابر مجاهد:</b> من 4 إلى 7 أيام (أسبوع من النور وارتفاع الطاقة).</li>
                <li>• <b>مرابط ثابت:</b> من 8 إلى 21 يوماً (كسر العادة النفسية).</li>
                <li>• <b>قاهر الشهوة:</b> من 22 إلى 45 يوماً (استعادة توازن الدوبامين).</li>
                <li>• <b>فارس العفة:</b> من 46 إلى 90 يوماً (زوال ضباب الدماغ بالكامل).</li>
                <li>• <b>صِدِّيق:</b> 91 يوماً فما فوق (ثبات الأبطال والعفة كعفة يوسف).</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto sm:max-w-lg md:max-w-xl bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 py-2 px-2 flex justify-around items-center z-40">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === "dashboard"
              ? "text-emerald-400 font-bold"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px]">درع العفة</span>
        </button>

        <button
          onClick={() => setActiveTab("tournaments")}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === "tournaments"
              ? "text-amber-400 font-bold"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Swords className="w-5 h-5" />
          <span className="text-[10px]">المؤاخاة والسباق</span>
        </button>

        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === "leaderboard"
              ? "text-amber-400 font-bold"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px]">الأبطال</span>
        </button>

        <button
          onClick={() => setActiveTab("roadmap")}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === "roadmap"
              ? "text-purple-400 font-bold"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Brain className="w-5 h-5" />
          <span className="text-[10px]">المسار</span>
        </button>

        <button
          onClick={() => setActiveTab("about")}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === "about"
              ? "text-cyan-400 font-bold"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Info className="w-5 h-5" />
          <span className="text-[10px]">الرؤية</span>
        </button>
      </nav>

      {/* SOS Modal */}
      <SosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        onRescueSuccess={handleRescueSuccess}
      />

      {/* Relapse Modal */}
      <RelapseModal
        isOpen={isRelapseOpen}
        onClose={() => setIsRelapseOpen(false)}
        onConfirmRelapse={handleRelapseConfirm}
      />

      {/* Nickname Edit Modal */}
      {isEditNameOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-100">
              تعديل الاسم أو اللقب (للوحة البطولة):
            </h3>
            <p className="text-[11px] text-slate-400">
              يمكنك اختيار اسم مستعار أو لقب بطولي لحفظ سترك وحيائك أمام المتنافسين.
            </p>
            <form onSubmit={handleUpdateName} className="flex flex-col gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="مثال: صابر في سبيل الله"
                className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                maxLength={30}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-black font-bold py-2 rounded-xl text-xs"
                >
                  حفظ اللقب
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditNameOpen(false)}
                  className="px-3 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hero Onboarding Modal for First Time Name Selection */}
      <HeroOnboardingModal
        isOpen={isOnboardingOpen}
        initialName={userProfile?.display_name || ""}
        onSaveName={handleSaveOnboardingName}
      />
    </div>
  );
}
