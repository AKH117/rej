"use client";

import React, { useState } from "react";
import {
  Trophy,
  Swords,
  Users,
  MessageSquare,
  Shield,
  Send,
  AlertCircle,
  Sparkles,
  Flame,
  CheckCircle2,
  RefreshCw,
  HeartHandshake,
  Lock,
  ExternalLink,
} from "lucide-react";

interface TournamentsAndBrotherhoodProps {
  currentStreakDays: number;
  totalPoints: number;
  displayName: string;
}

interface ChatMessage {
  id: string;
  sender: "me" | "peer";
  text: string;
  time: string;
  isAlert?: boolean;
}

export default function TournamentsAndBrotherhood({
  currentStreakDays,
  totalPoints,
  displayName,
}: TournamentsAndBrotherhoodProps) {
  const [activeSubTab, setActiveSubTab] = useState<"tournaments" | "brotherhood">("brotherhood");

  // Determine peer based on streak days for maximum empathy
  const getPeerProfile = () => {
    if (currentStreakDays <= 3) {
      return {
        id: "peer-tier-1",
        alias: "فارس الصبر #204",
        streakDays: Math.max(1, currentStreakDays),
        rank: "تائب مقبل",
        status: "متصل الآن (في الخندق)",
        initialMessages: [
          {
            id: "m1",
            sender: "peer" as const,
            text: "السلام عليكم يا بطل.. أنا في اليوم الثاني ولسه الدوبامين بينادي، بس عاهدت الله إني ما أرجع.",
            time: "منذ 10 دقائق",
          },
          {
            id: "m2",
            sender: "peer" as const,
            text: "كيف ثباتك اليوم؟ طمني عنك عشان نشجع بعض ⚔️",
            time: "منذ 3 دقائق",
          },
        ],
      };
    } else if (currentStreakDays <= 7) {
      return {
        id: "peer-tier-2",
        alias: "سيف العفة #312",
        streakDays: currentStreakDays,
        rank: "صابر مجاهد",
        status: "متصل الآن (في الخندق)",
        initialMessages: [
          {
            id: "m1",
            sender: "peer" as const,
            text: "حياك الله يا أخي! ما شاء الله عدينا الأيام الأولى الصعبة، طاقتك بدأت ترجع ولا لسه؟",
            time: "منذ ربع ساعة",
          },
          {
            id: "m2",
            sender: "peer" as const,
            text: "أنا ملتزم بصلوات المسجد اليوم، خليك ثابت ومتخليش التلفون يدخل السرير الليلة 🛡️",
            time: "منذ 5 دقائق",
          },
        ],
      };
    } else if (currentStreakDays <= 21) {
      return {
        id: "peer-tier-3",
        alias: "المرابط الثابت #118",
        streakDays: currentStreakDays,
        rank: "مرابط ثابت",
        status: "متصل الآن (في الخندق)",
        initialMessages: [
          {
            id: "m1",
            sender: "peer" as const,
            text: "أهلاً برفيقي البطل! دخلنا مرحلة هدوء العاصفة.. كسرنا حاجز الأسبوعين بفضل الله.",
            time: "منذ ساعة",
          },
          {
            id: "m2",
            sender: "peer" as const,
            text: "انتبه من الفراغ في عطلة الأسبوع، أنا محضر جدول قراءة ورياضة، ماذا عنك؟ ⚔️",
            time: "منذ 12 دقيقة",
          },
        ],
      };
    } else {
      return {
        id: "peer-tier-4",
        alias: "قاهر الشهوة #502",
        streakDays: currentStreakDays,
        rank: "قاهر الشهوة",
        status: "متصل الآن (في الخندق)",
        initialMessages: [
          {
            id: "m1",
            sender: "peer" as const,
            text: "السلام عليكم يا قائد! فخر لي أن أكون رفيقك، العفة نعمة لا يدركها إلا من تذوق حلاوة النصر.",
            time: "منذ ساعتين",
          },
          {
            id: "m2",
            sender: "peer" as const,
            text: "مستمرون حتى نلقى الله وهو راضٍ عنا.. دعواتك الصالحة في صلاة الفجر 🤲",
            time: "منذ 20 دقيقة",
          },
        ],
      };
    }
  };

  const [peer, setPeer] = useState(getPeerProfile);
  const [messages, setMessages] = useState<ChatMessage[]>(peer.initialMessages);
  const [inputText, setInputText] = useState("");
  const [peerIndex, setPeerIndex] = useState(1);

  // Switch Peer
  const handleSwitchPeer = () => {
    const nextIdx = peerIndex + 1;
    setPeerIndex(nextIdx);
    const newPeer = {
      ...getPeerProfile(),
      alias: `فارس الصمود #${Math.floor(100 + Math.random() * 800)}`,
      initialMessages: [
        {
          id: `new-${Date.now()}`,
          sender: "peer" as const,
          text: "مرحباً يا أخي في الله! تم ربطنا معاً لمساندة بعضنا في هذا الخندق المبارك. كيف صمودك الآن؟ ⚔️",
          time: "الآن",
        },
      ],
    };
    setPeer(newPeer);
    setMessages(newPeer.initialMessages);
  };

  // Send Message
  const handleSendMessage = (textToSend?: string, isAlert = false) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "me",
      text: text.trim(),
      time: "الآن",
      isAlert,
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText("");

    // Simulate supportive reply from peer after 2.5 seconds
    setTimeout(() => {
      let replyText = "حيّاك الله يا أخي وثبت قدمك! معك في الخندق ولن نترك الشيطان ينتصر علينا أبداً ⚔️";
      if (isAlert) {
        replyText = "🚨 لا تستسلم!! ارْمِ الهاتف من يدك فوراً واخرج من الغرفة! أنا أدعو لك الآن في سجودي، قم توضأ بماء بارد!";
      } else if (text.includes("دعيت") || text.includes("دعاء")) {
        replyText = "جزاك الله خيراً يا حبيب، ولك بالمثل وزيادة.. الله يثبتنا جميعاً على الصراط المستقيم 🤲";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          sender: "peer",
          text: replyText,
          time: "الآن",
          isAlert: isAlert,
        },
      ]);
    }, 2000);
  };

  // Tournament progress percentage for 40-days sprint
  const fortyDaysProgress = Math.min(100, Math.round((currentStreakDays / 40) * 100));

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
      {/* Sub Tabs Selector */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveSubTab("brotherhood")}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === "brotherhood"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-emerald-300" />
          <span>الشات الأخوي الخفي</span>
        </button>

        <button
          onClick={() => setActiveSubTab("tournaments")}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === "tournaments"
              ? "bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 shadow-md shadow-amber-950"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>بطولات العفة والسباقات</span>
        </button>
      </div>

      {/* TAB 1: ANONYMOUS BROTHERHOOD & SECRET CHAT */}
      {activeSubTab === "brotherhood" && (
        <div className="flex flex-col gap-3">
          {/* Peer Info Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-lg shadow-inner">
                🤝
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">{peer.alias}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {peer.streakDays} أيام صمود
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-300">{peer.status}</span>
                  <span>• رتبة {peer.rank}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSwitchPeer}
              className="text-[11px] flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl border border-slate-700 transition-all active:scale-95"
              title="البحث عن رفيق صمود آخر"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>تبديل</span>
            </button>
          </div>

          {/* Pact of Pure Brotherhood Notice */}
          <div className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2 text-[10px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <b>ميثاق الخندق:</b> شات خفي ومشفر بالكامل للمؤاخاة والتثبيت بالحق والدعاء، وممنوع تبادل الحسابات الشخصية.
            </span>
          </div>

          {/* Quick Action Ammunition Buttons (Instant Shout / Support) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => handleSendMessage("🚨 إخواني.. أتعرض لوسوسة وهجوم شهوة الآن، ادعُ لي بالثبات!", true)}
              className="shrink-0 bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-[10px] font-bold py-1.5 px-2.5 rounded-xl flex items-center gap-1 active:scale-95 transition-all"
            >
              <span className="animate-pulse">🚨</span>
              <span>أتعرض لهجوم شهوة!</span>
            </button>

            <button
              onClick={() => handleSendMessage("اثبت يا بطل! الشيطان أوهن من بيت العنكبوت.. توضأ واخرج من الغرفة فوراً ⚔️")}
              className="shrink-0 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[10px] py-1.5 px-2.5 rounded-xl active:scale-95 transition-all"
            >
              ⚔️ اثبت ولا تستسلم!
            </button>

            <button
              onClick={() => handleSendMessage("دعوت لك في سجودي قبل قليل بالثبات والنور 🤲")}
              className="shrink-0 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[10px] py-1.5 px-2.5 rounded-xl active:scale-95 transition-all"
            >
              🤲 دعوت لك في سجودي
            </button>

            <button
              onClick={() => handleSendMessage("الحمد لله أكملت ورداً قرآنياً واستعدت طاقتي وسكينتي 📖")}
              className="shrink-0 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-[10px] py-1.5 px-2.5 rounded-xl active:scale-95 transition-all"
            >
              📖 أكملت ورداً للتو
            </button>
          </div>

          {/* Live Secret Chat Messages Box */}
          <div className="h-64 sm:h-72 overflow-y-auto p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col gap-2.5 shadow-inner">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] text-xs rounded-2xl p-3 leading-relaxed transition-all ${
                  msg.sender === "me"
                    ? "self-end bg-gradient-to-l from-emerald-600 to-teal-700 text-white rounded-bl-sm shadow-md"
                    : msg.isAlert
                    ? "self-start bg-red-950/80 border border-red-500/50 text-red-200 rounded-br-sm"
                    : "self-start bg-slate-900 border border-slate-800 text-slate-200 rounded-br-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1 opacity-80 text-[10px]">
                  <span className="font-bold">
                    {msg.sender === "me" ? "أنت (فارس العفة)" : peer.alias}
                  </span>
                  <span className="text-[9px] font-mono">{msg.time}</span>
                </div>
                <p className="font-cairo">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Message Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب كلمة تثبيت وتشجيع لرفيقك في الخندق.."
              className="flex-1 text-xs py-2.5 px-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all active:scale-95 shadow-md shadow-emerald-950"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: TOURNAMENTS & SEASONS */}
      {activeSubTab === "tournaments" && (
        <div className="flex flex-col gap-4">
          {/* Main Tournament: 40-Day Sprint (غزوة الأربعين) */}
          <div className="relative overflow-hidden rounded-3xl gradient-card p-5 border border-amber-500/30 glow-gold">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg">
                  🏆
                </div>
                <div>
                  <h3 className="text-xs font-black text-amber-300">
                    بطولة الأربعين يوماً (غزوة كسر العادة)
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    الموسم الأول • 1,420 فارساً في الميدان
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                بطولة نشطة ⚔️
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              الهدف: بلوغ 40 يوماً متتالية من الطهارة دون انتكاسة واحدة، لاستعادة مستقبلات الدوبامين بالكامل وهدم المسار العصبي للإدمان.
            </p>

            {/* Progress */}
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">إنجازك في البطولة:</span>
                <span className="font-bold font-mono text-amber-400">
                  {currentStreakDays} من 40 يوماً ({fortyDaysProgress}%)
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${fortyDaysProgress}%` }}
                />
              </div>
            </div>

            {/* Reward */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>جائزة الفاتح:</span>
              </span>
              <span className="font-bold text-amber-300">
                وسام الفاتح الدائم 🏅 + 500 نقطة شرف
              </span>
            </div>
          </div>

          {/* Tournament 2: Weekend Fortress (درع الويك إند) */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-black text-white">تحدي درع عطلة الأسبوع (الجمعة والسبت)</h4>
                  <span className="text-[10px] text-slate-400">تحصين خلوات الفراغ القاتلة</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                يتجدد أسبوعياً
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              أشد أوقات الزلل هي ليالي الخميس والجمعة. كل فارس يجتاز عطلة الأسبوع بصمود يُمنح مكافأة مضاعفة (+30 نقطة شرف).
            </p>
          </div>

          {/* Tournament 3: Battalions Clan War (صراع الكتائب) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="text-xs font-black text-white">معركة الكتائب الإيمانية</h4>
                  <span className="text-[10px] text-slate-400">تنافس جماعي أسبوعي بين فرسان الأمة</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/30 flex flex-col gap-1">
                <div className="flex justify-between items-center text-emerald-400 font-bold">
                  <span>كتيبة الصِّدِّيق</span>
                  <span>🏆 89%</span>
                </div>
                <span className="text-[10px] text-slate-400">نسبة الصمود الجماعي هذا الأسبوع</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/30 flex flex-col gap-1">
                <div className="flex justify-between items-center text-amber-400 font-bold">
                  <span>كتيبة الفَارُوق</span>
                  <span>⚔️ 85%</span>
                </div>
                <span className="text-[10px] text-slate-400">نسبة الصمود الجماعي هذا الأسبوع</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center italic">
              «وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ».. صمودك اليوم يرفع راية كتيبتك أمام إخوانك!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
