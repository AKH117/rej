import fs from "fs";
import path from "path";

// Load .env.local if present
try {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {
  // ignore
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
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
