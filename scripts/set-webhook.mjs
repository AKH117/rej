// Helper script to register Telegram Webhook to your Vercel deployment URL
// Usage: node scripts/set-webhook.mjs https://your-app.vercel.app

const BOT_TOKEN = "8610539309:AAGr02LwIXFeQsTJ_jBnzmT5pMdoDzCrjv8";
const vercelUrl = process.argv[2];

if (!vercelUrl) {
  console.error("❌ يرجى تمرير رابط موقعك على فيرسيل، مثال:");
  console.error("node scripts/set-webhook.mjs https://rejal-sadako.vercel.app");
  process.exit(1);
}

const cleanUrl = vercelUrl.replace(/\/$/, "");
const webhookUrl = `${cleanUrl}/api/telegram/webhook`;

console.log(`📡 جارٍ ربط بوت التليجرام بالرابط: ${webhookUrl} ...`);

async function setWebhook() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
    });

    const data = await res.json();
    if (data.ok) {
      console.log("✅ تم ربط البوت بـ Vercel Webhook بنجاح تام!");
      console.log("تفاصيل الاستجابة:", data.description);
    } else {
      console.error("❌ فشل الربط:", data);
    }
  } catch (err) {
    console.error("❌ خطأ:", err.message);
  }
}

setWebhook();
