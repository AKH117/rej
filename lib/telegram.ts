const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

/**
 * Send Markdown formatted message via Telegram Bot
 */
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  replyMarkup?: any
) {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        reply_markup: replyMarkup,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("sendTelegramMessage error:", err);
    return null;
  }
}

/**
 * Answer Telegram Callback Query (for inline button clicks)
 */
export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  try {
    const res = await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: false,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("answerCallbackQuery error:", err);
    return null;
  }
}

/**
 * Build Keyboard without manual checkin - focusing on Mini App, Leaderboard, SOS, and Honest Relapse
 */
export function getBotMainKeyboard(webAppUrl?: string) {
  const defaultUrl = webAppUrl || process.env.NEXT_PUBLIC_APP_URL || "https://state-nor-clock-requirement.trycloudflare.com";
  
  return {
    inline_keyboard: [
      [
        {
          text: "⚔️ فتح تطبيق درع العفة (Mini App)",
          web_app: { url: defaultUrl },
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
