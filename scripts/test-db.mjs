// Test Supabase connectivity and tables
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://enlabmxseafcjbhfigqj.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubGFibXhzZWFmY2piaGZpZ3FqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDYyOTEwNywiZXhwIjoyMTA2MjA1MTA3fQ.I0NQ3J__G8zj10jsl3_1qWQxBvDYgdK1ZuMQXibTOWk";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  console.log("🔍 فحص الاتصال بقاعدة بيانات Supabase...");
  const { data, error } = await supabase.from("profiles").select("count").limit(1);

  if (error) {
    if (error.code === "42P01") {
      console.log("⚠️ جدول profiles لم يتم إنشاؤه بعد.");
      console.log("👉 يرجى نسخ محتوى ملف supabase/schema.sql ولصقه في SQL Editor في لوحة تحكم Supabase وتشغيله.");
    } else {
      console.error("❌ خطأ غير متوقع:", error);
    }
  } else {
    console.log("✅ قاعدة البيانات وجدول profiles متصلان ويعملان 100%!");
  }
}

check();
