import { NextRequest, NextResponse } from "next/server";
import {
  sendTelegramMessage,
  answerCallbackQuery,
  getBotMainKeyboard,
} from "@/lib/telegram";
import {
  getOrCreateProfile,
  getLeaderboard,
  recordDailyCheckin,
} from "@/lib/supabase";
import { getRankByDays } from "@/lib/ranks";

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // 1. Handle incoming text message
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = (msg.text || "").trim();
      const from = msg.from;

      if (!from) return NextResponse.json({ ok: true });

      // Get or create profile
      const profile = await getOrCreateProfile({
        id: from.id,
        first_name: from.first_name,
        username: from.username,
      });

      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://rejal-sadako.vercel.app";

      // Command /start
      if (text.startsWith("/start")) {
        const welcomeText = `
⚔️ *مرحباً بك في مَنظُومَة [رِجَالٌ صَدَقُوا] يا بطل!*

«مِّنَ الْمُؤْمِنِينَ رِجَالٌ صَدَقُوا مَا عَاهَدُوا اللَّهَ عَلَيْهِ»

هذا البوت هو حصنك المنيع وسلاحك لتحطيم قيد الإباحية والعادة السرية، واستعادة عزة الرجولة ونور الإيمان وصفاء العقل.

🛡️ *رتبتك الحالية:* ${profile?.rank_title || "تائب مقبل"}
🔥 *صمودك المستمر:* ${profile?.current_streak_days || 0} يوم
✨ *نقاط الشرف:* ${profile?.total_points || 100} نقطة

اضغط على الزر أدناه لفتح التطبيق المصغر والمنافسة في لوحة البطولة:
        `;

        await sendTelegramMessage(chatId, welcomeText, getBotMainKeyboard(appUrl));
        return NextResponse.json({ ok: true });
      }

      // Command /sos
      if (text.startsWith("/sos")) {
        const sosText = `
🚨 *بروتوكول الطوارئ والاستغاثة (نجدة الفارس)* 🚨

«أَلَمْ يَعْلَم بِأَنَّ اللَّهَ يَرَى»

1️⃣ *ارْمِ الهاتف بعيداً عنك الآن!*
2️⃣ *غادر الغرفة أو المكان المغلق فوراً!*
3️⃣ *توضأ بالماء البارد واغسل وجهك ونحرك.*
4️⃣ *استفتح صلاة ركعتين خاشعتين لله.*

الشهوة فوران كيميائي مدته 90 ثانية فقط.. إذا حبست نفسك عنها انكسرت شوكتها وهُزم الشيطان!
        `;

        await sendTelegramMessage(chatId, sosText, {
          inline_keyboard: [
            [
              {
                text: "🛡️ نجوت بفضل الله وثبتت",
                callback_data: "sos_resolved",
              },
            ],
            [
              {
                text: "⚔️ فتح التطبيق المصغر",
                web_app: { url: appUrl },
              },
            ],
          ],
        });
        return NextResponse.json({ ok: true });
      }

      // Command /streak
      if (text.startsWith("/streak")) {
        const rank = getRankByDays(profile?.current_streak_days || 0);
        const streakText = `
📊 *تقرير صمودك الحالي يا بطل:*

• اللقب: *${profile?.display_name || from.first_name}*
• أيام الصمود: *${profile?.current_streak_days || 0} يوم*
• الرتبة الإيمانية: *${rank.badge} ${rank.title}*
• أطول صمود سابق: *${profile?.longest_streak_days || 0} يوم*
• نقاط الشرف: *${profile?.total_points || 100} نقطة*

${rank.description}
        `;

        await sendTelegramMessage(chatId, streakText, getBotMainKeyboard(appUrl));
        return NextResponse.json({ ok: true });
      }

      // Command /leaderboard
      if (text.startsWith("/leaderboard")) {
        const lb = await getLeaderboard(10);
        let lbText = `🏆 *لوحة البطولة والشرف (أفضل الصامدين):*\n\n`;

        lb.forEach((p, i) => {
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `• ${i + 1}`;
          lbText += `${medal} *${p.display_name}* — ${p.current_streak_days} يوم (${p.rank_title})\n`;
        });

        lbText += `\nافتح التطبيق المصغر لمشاهدة المنصة الكاملة!`;

        await sendTelegramMessage(chatId, lbText, getBotMainKeyboard(appUrl));
        return NextResponse.json({ ok: true });
      }

      // Command /checkin
      if (text.startsWith("/checkin")) {
        const checkinRes = await recordDailyCheckin(from.id, "sober");
        await sendTelegramMessage(chatId, `🛡️ *${checkinRes.message}*`, getBotMainKeyboard(appUrl));
        return NextResponse.json({ ok: true });
      }

      // Fallback response
      await sendTelegramMessage(
        chatId,
        `يا بطل، أرسل /start أو اضغط الزر أدناه لدخول المنظومة:`,
        getBotMainKeyboard(appUrl)
      );
      return NextResponse.json({ ok: true });
    }

    // 2. Handle Inline Button Callbacks
    if (update.callback_query) {
      const cb = update.callback_query;
      const data = cb.data;
      const from = cb.from;
      const chatId = cb.message?.chat?.id || from.id;

      if (data === "checkin_today") {
        const res = await recordDailyCheckin(from.id, "sober");
        await answerCallbackQuery(cb.id, res.message);
        await sendTelegramMessage(chatId, `🛡️ *${res.message}*`);
      } else if (data === "trigger_sos") {
        await answerCallbackQuery(cb.id, "تم تفعيل بروتوكول الطوارئ!");
        const sosText = `
🚨 *بروتوكول الطوارئ الفوري:*
«أَلَمْ يَعْلَم بِأَنَّ اللَّهَ يَرَى»
ارْمِ الهاتف فوراً وتوضأ بماء بارد وصلّ ركعتين!
        `;
        await sendTelegramMessage(chatId, sosText);
      } else if (data === "sos_resolved") {
        await answerCallbackQuery(cb.id, "الله أكبر! ثبتك الله وزادك رفعة وعفة");
        await sendTelegramMessage(
          chatId,
          `🏆 *الله أكبر! تم قهر الشيطان وإحباط كيده.. بارك الله في عفتك ورجولتك!*`
        );
      } else if (data === "view_leaderboard") {
        await answerCallbackQuery(cb.id, "جارٍ جلب لوحة الشرف");
        const lb = await getLeaderboard(5);
        let text = `🏆 *أعلى 5 أبطال في لوحة الشرف:*\n\n`;
        lb.forEach((p, i) => {
          text += `${i + 1}. *${p.display_name}*: ${p.current_streak_days} يوم (${p.rank_title})\n`;
        });
        await sendTelegramMessage(chatId, text);
      } else if (data === "view_my_streak") {
        const profile = await getOrCreateProfile({ id: from.id });
        await answerCallbackQuery(cb.id, `صمودك: ${profile?.current_streak_days || 0} يوم`);
        await sendTelegramMessage(
          chatId,
          `📊 صمودك الحالي: *${profile?.current_streak_days || 0} يوم* (${profile?.rank_title || "تائب"})`
        );
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
