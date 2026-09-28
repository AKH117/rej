// Standalone Telegram Bot Polling Runner for Local Testing & Direct Operation
// Run via: node bot-runner.mjs

import https from "https";

const BOT_TOKEN = "8610539309:AAGr02LwIXFeQsTJ_jBnzmT5pMdoDzCrjv8";
const APP_URL = "http://localhost:3000";

let offset = 0;

console.log("⚔️ بوت [رِجَالٌ صَدَقُوا] يعمل الآن وجاهز لاستقبال الرسائل...");

function telegramRequest(method, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: "api.telegram.org",
      port: 443,
      path: `/bot${BOT_TOKEN}/${method}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ ok: false });
        }
      });
    });

    req.on("error", (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function handleUpdate(update) {
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat.id;
    const text = (msg.text || "").trim();
    const fromName = msg.from?.first_name || "يا بطل";

    console.log(`📩 رسالة من ${fromName} (${chatId}): ${text}`);

    if (text.startsWith("/start")) {
      const welcome = `
⚔️ *أهلاً بك في مَنظُومَة [رِجَالٌ صَدَقُوا] يا ${fromName}!*

«مِّنَ الْمُؤْمِنِينَ رِجَالٌ صَدَقُوا مَا عَاهَدُوا اللَّهَ عَلَيْهِ»

هذا البوت وسيلتك لتحطيم قيد الإباحية والعادة الخبيثة واستعادة نقاء القلب وقوة الرجولة.

🌟 *الأوامر المتاحة:*
• /sos — زر الطوارئ والاستغاثة عند هجوم الشهوة
• /streak — معرفة أيام صمودك ورتبتك الإيمانية
• /leaderboard — مشاهدة لوحة البطولة وأوائل الصامدين
• /checkin — توثيق ثباتك اليومي وكسب نقاط الشرف
      `;

      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: welcome,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⚔️ فتح تطبيق رجال صدقوا (Mini App)",
                web_app: { url: APP_URL },
              },
            ],
            [
              { text: "🛡️ تسجيل الثبات اليومي", callback_data: "checkin_today" },
              { text: "🏆 لوحة الأبطال", callback_data: "view_leaderboard" },
            ],
            [
              { text: "🆘 زر الطوارئ والاستغاثة", callback_data: "trigger_sos" },
              { text: "📊 عدادي ورتبتي", callback_data: "view_my_streak" },
            ],
          ],
        },
      });
    } else if (text.startsWith("/sos")) {
      const sos = `
🚨 *بروتوكول الطوارئ والاستغاثة (نجدة الفارس)* 🚨

«أَلَمْ يَعْلَم بِأَنَّ اللَّهَ يَرَى»

1️⃣ *ارْمِ الهاتف بعيداً عنك الآن فوراً!*
2️⃣ *غادر الغرفة أو المكان المغلق فوراً!*
3️⃣ *توضأ بالماء البارد واغسل وجهك ونحرك.*
4️⃣ *صلّ ركعتين خاشعتين لله.*

الشهوة فوران كيميائي مدته 90 ثانية فقط.. إذا حبست نفسك عنها انكسرت شوكتها وهُزم الشيطان!
      `;
      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: sos,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🛡️ نجوت بفضل الله وثبتت", callback_data: "sos_resolved" }],
          ],
        },
      });
    } else if (text.startsWith("/streak")) {
      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: `📊 *عداد الصمود:* افتح التطبيق المصغر لمعرفة تفاصيل صمودك ورتبتك بدقة وسرعة!`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "⚔️ فتح درع العفة", web_app: { url: APP_URL } }],
          ],
        },
      });
    } else if (text.startsWith("/checkin")) {
      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: `🛡️ *بارك الله فيك وثبتك! تم تسجيل ثباتك لليوم بنجاح يا بطل.*`,
        parse_mode: "Markdown",
      });
    } else if (text.startsWith("/leaderboard")) {
      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: `🏆 *لوحة البطولة والشرف:*\n1. أبو بكر الصديق (قدوة) — 120 يوم\n2. سيف الله المسلول — 65 يوم\n3. المرابط في سبيل الله — 32 يوم\n\nافتح التطبيق المصغر لمشاهدة باقي الأبطال!`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🏆 فتح لوحة البطولة الكاملة", web_app: { url: APP_URL } }],
          ],
        },
      });
    }
  } else if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message?.chat?.id;
    const data = cb.data;

    await telegramRequest("answerCallbackQuery", {
      callback_query_id: cb.id,
      text: "تم الاستلام بنجاح!",
    });

    if (data === "trigger_sos") {
      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: `🚨 *بروتوكول الطوارئ:* «أَلَمْ يَعْلَم بِأَنَّ اللَّهَ يَرَى».. ارْمِ الهاتف وتوضأ فوراً!`,
        parse_mode: "Markdown",
      });
    } else if (data === "sos_resolved") {
      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: `🏆 *الله أكبر! ثبتك الله وقهرت الشيطان.. زادك الله عزة ونوراً!*`,
        parse_mode: "Markdown",
      });
    } else if (data === "checkin_today") {
      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: `🛡️ *تم توثيق ثباتك اليوم بفضل الله وإضافة 15 نقطة شرف!*`,
        parse_mode: "Markdown",
      });
    }
  }
}

async function poll() {
  try {
    const res = await telegramRequest("getUpdates", {
      offset: offset,
      timeout: 25,
    });

    if (res.ok && res.result && res.result.length > 0) {
      for (const update of res.result) {
        offset = update.update_id + 1;
        await handleUpdate(update);
      }
    }
  } catch (err) {
    console.error("Polling error:", err.message);
  }
  setTimeout(poll, 1000);
}

// Start polling
poll();
