// Standalone Telegram Bot Polling Runner for Local Testing & Direct Operation
// Run via: node bot-runner.mjs

import https from "https";
import fs from "fs";
import path from "path";

const BOT_TOKEN = "8610539309:AAGr02LwIXFeQsTJ_jBnzmT5pMdoDzCrjv8";
// Telegram WebApp strictly requires HTTPS
const APP_URL = "https://state-nor-clock-requirement.trycloudflare.com";

const KNOWN_USERS_FILE = path.join(process.cwd(), "scripts", "known_chats.json");

function loadKnownUsers() {
  try {
    if (fs.existsSync(KNOWN_USERS_FILE)) {
      const data = fs.readFileSync(KNOWN_USERS_FILE, "utf-8");
      return new Set(JSON.parse(data));
    }
  } catch (e) {
    console.error("Error loading known users:", e.message);
  }
  return new Set();
}

function saveKnownUsers(set) {
  try {
    const dir = path.dirname(KNOWN_USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(KNOWN_USERS_FILE, JSON.stringify([...set]), "utf-8");
  } catch (e) {
    console.error("Error saving known users:", e.message);
  }
}

const knownChatIds = loadKnownUsers();

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
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          if (!parsed.ok) {
            console.error(`❌ خطأ من تيليجرام في ${method}:`, parsed.description);
          }
          resolve(parsed);
        } catch (e) {
          resolve({ ok: false });
        }
      });
    });

    req.on("error", (e) => {
      console.error("❌ Network error:", e.message);
      reject(e);
    });
    req.write(postData);
    req.end();
  });
}

const userStates = new Map();
const userNames = new Map();

// Evening Check-in (10:30 PM) and Dawn Pulse (6:00 AM) Sender
async function sendEveningCheckin(chatId) {
  const checkMsg = `🛡️ *المساءلة الليلية لحراسة العفة (10:30 م):*

أخي الفارس.. أوشك هذا اليوم أن يُطوى، وأنت بحفظ الله في رباط وجهاد! ⚔️

بالله العظيم الذي أقسمت به: **هل ما زلت صامداً ثابتاً اليوم؟**

💡 *تذكير السرير:* ضع شاحن هاتفك خارج غرفة النوم الآن ونم على وضوء وطهارة لئلا تُؤتى من مأمنك!`;

  return await telegramRequest("sendMessage", {
    chat_id: chatId,
    text: checkMsg,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🛡️ صامد وثابت بفضل الله (+10 نقاط) ✨", callback_data: "confirm_sober" },
        ],
        [
          { text: "💔 حدثت كبوة (إقرار الصدق)", callback_data: "trigger_relapse" },
        ],
        [
          { text: "⚔️ فتح تطبيق درع العفة", web_app: { url: APP_URL } },
        ],
      ],
    },
  });
}

async function sendMorningPulse(chatId) {
  const morningMsg = `🌅 *بُشرى الفجر لكتيبة الصادقين:*

«مِّنَ الْمُؤْمِنِينَ رِجَالٌ صَدَقُوا مَا عَاهَدُوا اللَّهَ عَلَيْهِ»

أشرق صباح جديد وأنت طاهر القلب، عفيف النفس، رافع الرأس!
ليلة جديدة في طاعة الله زادتك عزة ورجولة.. استعن بالله في صلواتك وأذكارك وانطلق في يومك بقوة ⚔️✨`;

  return await telegramRequest("sendMessage", {
    chat_id: chatId,
    text: morningMsg,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "⚔️ فتح درع العفة", web_app: { url: APP_URL } },
        ],
      ],
    },
  });
}

function getMainKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: "⚔️ فتح تطبيق درع العفة (Mini App)",
          web_app: { url: APP_URL },
        },
      ],
      [
        { text: "🏆 لوحة الأبطال", callback_data: "view_leaderboard" },
        { text: "📊 عدادي ورتبتي", callback_data: "view_my_streak" },
      ],
      [
        { text: "🆘 زر الطوارئ والاستغاثة", callback_data: "trigger_sos" },
        { text: "💔 حدثت انتكاسة (إقرار الصدق)", callback_data: "trigger_relapse" },
      ],
      [
        { text: "🛡️ تفقد الصمود الدوري (تأكيد الثبات)", callback_data: "periodic_checkup" },
      ],
    ],
  };
}

async function handleUpdate(update) {
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat.id;
    const text = (msg.text || "").trim();
    const fromName = msg.from?.first_name || "يا بطل";

    // Track user for automated check-ins
    if (chatId && !knownChatIds.has(chatId)) {
      knownChatIds.add(chatId);
      saveKnownUsers(knownChatIds);
      console.log(`👤 مستخدم جديد مسجل للتنبيهات الآلية (${chatId})`);
    }

    console.log(`📩 رسالة من ${fromName} (${chatId}): ${text}`);

    // Command to test evening check-in immediately
    if (text.startsWith("/test_checkin")) {
      await sendEveningCheckin(chatId);
      return;
    }

    // Command to test morning victory pulse immediately
    if (text.startsWith("/test_morning")) {
      await sendMorningPulse(chatId);
      return;
    }

    // If awaiting name input
    if (userStates.get(chatId) === "awaiting_name" && !text.startsWith("/")) {
      const chosenName = text.trim().slice(0, 35);
      userNames.set(chatId, chosenName);
      userStates.set(chatId, "awaiting_oath");

      const oathPrompt = `⚔️ *أهلاً بك يا بطلنا «${chosenName}» في مَنظُومَة [رِجَالٌ صَدَقُوا]!*

«مِّنَ الْمُؤْمِنِينَ رِجَالٌ صَدَقُوا مَا عَاهَدُوا اللَّهَ عَلَيْهِ»

يا ${chosenName}.. هذا صرح الأبطال الأطهار، ولا يدخل ميداننا إلا من صدق مع الله ومع نفسه؛ فالله يعلم خائنة الأعين وما تخفي الصدور ولا مكان هنا للخداع.

📜 *اقرأ هذا القَسَم بقلبك ولسانك واضغط على الزر أدناه لإقراره ودخول الميدان:*

«أُقْسِمُ بِاللهِ العَظِيمِ، الَّذِي يَعْلَمُ السِّرَّ وَأَخْفَى، أَنْ أَقُولَ وَأَكْتُبَ الحَقَّ وَالصِّدْقَ، وَأَلَّا أَكْذِبَ فِي أَيَّامِ صُمُودِي، وَأَنْ أُسَجِّلَ انْتِكَاسَتِي فَوْرَ حُدُوثِهَا ابْتِغَاءَ رِضَا اللهِ وَتَطْهِيراً لِنَفْسِي.. وَاللهُ عَلَى مَا أَقُولُ شَهِيدٌ»`;

      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: oathPrompt,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⚔️ أَقْسَمْتُ بِاللهِ العَظِيمِ عَلَى الصِّدْقِ",
                callback_data: "swear_oath",
              },
            ],
          ],
        },
      });
      return;
    }

    // Command /name or /setname
    if (text.startsWith("/name") || text.startsWith("/setname")) {
      const parts = text.split(" ");
      if (parts.length > 1) {
        const newName = parts.slice(1).join(" ").trim().slice(0, 35);
        userNames.set(chatId, newName);
        userStates.delete(chatId);
        await telegramRequest("sendMessage", {
          chat_id: chatId,
          text: `✅ *تم تحديث لقبك بنجاح إلى: [${newName}]* 🛡️`,
          parse_mode: "Markdown",
        });
      } else {
        userStates.set(chatId, "awaiting_name");
        await telegramRequest("sendMessage", {
          chat_id: chatId,
          text: `✍️ *أرسل اسمك أو لقبك الجديد الآن في رسالة:*`,
          parse_mode: "Markdown",
        });
      }
      return;
    }

    // Command /checkup
    if (text.startsWith("/checkup")) {
      const checkMsg = `🛡️ *المساءلة الدورية لكتيبة الصادقين:*

يا أخي الصامد.. مرت أيام وأنت في جهاد النفس! ⚔️
بالله العظيم الذي أقسمت به: **هل ما زلت صامداً ثابتاً على عهدك ولم تنتكس؟**`;

      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: checkMsg,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✓ صامد وثابت بفضل الله 🛡️", callback_data: "confirm_sober" },
              { text: "للأسف حدثت انتكاسة 💔", callback_data: "trigger_relapse" },
            ],
          ],
        },
      });
      return;
    }

    if (text.startsWith("/start")) {
      const existingName = userNames.get(chatId);
      if (!existingName) {
        userStates.set(chatId, "awaiting_name");
        const namePrompt = `⚔️ *مرحباً بك في مَنظُومَة [رِجَالٌ صَدَقُوا] يا ${fromName}!*

«مِّنَ الْمُؤْمِنِينَ رِجَالٌ صَدَقُوا مَا عَاهَدُوا اللَّهَ عَلَيْهِ»

هذا البوت هو حصنك المنيع وسلاحك لتحطيم قيد الإباحية والعادة السرية واستعادة عزة الرجولة.

🏆 *خطوتك الأولى:*
ما هو اللقب أو الاسم الذي تحب أن تظهر به في **لوحة البطولة والشرف** ليتنافس به إخوانك؟
(مثال: *صابر في سبيل الله، سيف الحق، المعتصم، أو اسمك الصريح*)

✍️ *أرسل اسمك الآن في رسالة وسأسجله لك فوراً:*`;

        await telegramRequest("sendMessage", {
          chat_id: chatId,
          text: namePrompt,
          parse_mode: "Markdown",
        });
        return;
      }

      const welcome = `⚔️ *أهلاً بك مجدداً يا بطلنا [${existingName}]!*

«مِّنَ الْمُؤْمِنِينَ رِجَالٌ صَدَقُوا مَا عَاهَدُوا اللَّهَ عَلَيْهِ»

اضغط على الزر أدناه لدخول تطبيق درع العفة أو اختر من القائمة:`;

      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: welcome,
        parse_mode: "Markdown",
        reply_markup: getMainKeyboard(),
      });
    } else if (text.startsWith("/sos")) {
      const sos = `🚨 *بروتوكول الطوارئ والاستغاثة (نجدة الفارس)* 🚨

«أَلَمْ يَعْلَم بِأَنَّ اللَّهَ يَرَى»

1️⃣ *ارْمِ الهاتف بعيداً عنك الآن فوراً!*
2️⃣ *غادر الغرفة أو المكان المغلق فوراً!*
3️⃣ *توضأ بالماء البارد واغسل وجهك ونحرك.*
4️⃣ *صلّ ركعتين خاشعتين لله.*

الشهوة فوران كيميائي مدته 90 ثانية فقط.. إذا حبست نفسك عنها انكسرت شوكتها وهُزم الشيطان!`;
      
      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: sos,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🛡️ نجوت بفضل الله وثبتت", callback_data: "sos_resolved" }],
            [{ text: "⚔️ فتح تطبيق درع العفة", web_app: { url: APP_URL } }],
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
    } else if (text.startsWith("/leaderboard")) {
      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: `🏆 *لوحة البطولة والشرف:*\n1. أبو بكر الصديق (قدوة) — 120 يوم\n2. سيف الله المسلول — 65 يوم\n3. المرابط في سبيل الله — 32 يوم\n\nافتح التطبيق المصغر لمشاهدة منصة التتويج الكاملة!`,
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

    // Acknowledge callback immediately
    await telegramRequest("answerCallbackQuery", {
      callback_query_id: cb.id,
      text: "تم الاستلام بنجاح!",
    });

    if (data === "swear_oath") {
      userStates.delete(chatId);
      const heroName = userNames.get(chatId) || "يا بطل";

      const confirmed = `🏆 *الله أكبر! تم اعتماد قَسَمك وتسجيل لقبك [${heroName}] في كتيبة الصادقين بنجاح.* ⚔️

ميدان البطولة مفتوح الآن أمامك..
اضغط على الزر أدناه لدخول تطبيق درع العفة والانطلاق في سباق الصادقين!`;

      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: confirmed,
        parse_mode: "Markdown",
        reply_markup: getMainKeyboard(),
      });
    } else if (data === "trigger_relapse") {
      const relapseMsg = `💔 *«كُلُّ بَنِي آدَمَ خَطَّاءٌ، وَخَيْرُ الخَطَّائِينَ التَّوَّابُونَ»*

يا بطل.. صدقك بإقرار الكبوة هو أولى خطوات الرجولة الحقة وعزة المؤمن. 
لا تيأس ولا تستسلم للشيطان في الوحل!

1️⃣ *توضأ الآن بالماء البارد واغسل قلبك.*
2️⃣ *صلّ ركعتي توبة خاشعتين لله.*
3️⃣ *افتح التطبيق لتصفير العداد وتجديد العهد بعزيمة أصلب وأقوى!*`;

      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: relapseMsg,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⚔️ فتح التطبيق وتجديد العهد",
                web_app: { url: APP_URL },
              },
            ],
          ],
        },
      });
    } else if (data === "periodic_checkup") {
      const checkMsg = `🛡️ *المساءلة الدورية لكتيبة الصادقين:*

يا أخي الصامد.. مرت أيام وأنت في جهاد النفس! ⚔️
بالله العظيم الذي أقسمت به: **هل ما زلت صامداً ثابتاً على عهدك ولم تنتكس؟**`;

      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: checkMsg,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✓ صامد وثابت بفضل الله 🛡️", callback_data: "confirm_sober" },
              { text: "للأسف حدثت انتكاسة 💔", callback_data: "trigger_relapse" },
            ],
          ],
        },
      });
    } else if (data === "confirm_sober") {
      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: `🏆 *الله أكبر ولله الحمد!*` + "\n\n" +
              `تم توثيق استمرار صمودك وثباتك لليوم بنجاح 🛡️✨\n` +
              `✨ *أُضيفت (+10 نقاط شرف)* إلى رصيدك في لوحة البطولة.\n\n` +
              `«وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا».. استمر يا بطل، فالجنة سلعة الله الغالية!`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "⚔️ فتح درع العفة ولوحة الشرف", web_app: { url: APP_URL } }],
          ],
        },
      });
    } else if (data === "trigger_sos") {
      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: `🚨 *بروتوكول الطوارئ:* «أَلَمْ يَعْلَم بِأَنَّ اللَّهَ يَرَى»..\nارْمِ الهاتف فوراً وتوضأ بماء بارد وصلّ ركعتين!`,
        parse_mode: "Markdown",
      });
    } else if (data === "sos_resolved") {
      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: `🏆 *الله أكبر! ثبتك الله وقهرت الشيطان.. زادك الله عزة ونوراً!*`,
        parse_mode: "Markdown",
      });
    } else if (data === "view_leaderboard") {
      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: `🏆 *لوحة البطولة والشرف:* افتح التطبيق المصغر لمشاهدة المتنافسين والتأكد من صدارتك!`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🏆 فتح لوحة البطولة الكاملة", web_app: { url: APP_URL } }],
          ],
        },
      });
    } else if (data === "view_my_streak") {
      await telegramRequest("sendMessage", {
        chat_id: chatId,
        text: `📊 *عدادك ورتبتك:* افتح درع العفة للاطلاع على الساعات والدقائق ونسبة التعافي!`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "⚔️ فتح درع العفة", web_app: { url: APP_URL } }],
          ],
        },
      });
    }
  }
}

// Scheduled Alerts Ticker (10:30 PM & 6:00 AM)
let lastEveningCheckinDate = "";
let lastMorningPulseDate = "";

function checkScheduledAlerts() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const todayStr = now.toISOString().slice(0, 10);

  // 10:30 PM (22:30) Evening Checkin
  if (hours === 22 && minutes === 30 && lastEveningCheckinDate !== todayStr) {
    lastEveningCheckinDate = todayStr;
    console.log(`⏰ [10:30 PM] إرسال المساءلة الليلية الآلية لجميع الفرسان المسجلين (${knownChatIds.size} مستخدم)...`);
    for (const id of knownChatIds) {
      sendEveningCheckin(id).catch((err) =>
        console.error(`خطأ في إرسال المساءلة إلى ${id}:`, err.message)
      );
    }
  }

  // 06:00 AM (06:00) Morning Pulse
  if (hours === 6 && minutes === 0 && lastMorningPulseDate !== todayStr) {
    lastMorningPulseDate = todayStr;
    console.log(`⏰ [06:00 AM] إرسال نبضة الصباح الآلية لجميع الفرسان المسجلين (${knownChatIds.size} مستخدم)...`);
    for (const id of knownChatIds) {
      sendMorningPulse(id).catch((err) =>
        console.error(`خطأ في إرسال نبضة الصباح إلى ${id}:`, err.message)
      );
    }
  }
}

// Run scheduler check every 30 seconds
setInterval(checkScheduledAlerts, 30000);

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
