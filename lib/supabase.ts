import { createClient } from "@supabase/supabase-js";
import { getRankByDays } from "./ranks";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://enlabmxseafcjbhfigqj.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Browser client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server superadmin client (bypasses RLS for bot and server actions)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey
);

export interface UserProfile {
  id: string;
  telegram_id: number;
  telegram_username?: string | null;
  first_name?: string | null;
  display_name: string;
  avatar_url?: string | null;
  streak_start_date: string;
  current_streak_days: number;
  longest_streak_days: number;
  last_relapse_at?: string | null;
  last_checkin_at?: string | null;
  total_points: number;
  rank_title: string;
  bio_motto?: string | null;
  is_public_leaderboard: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch or create profile by Telegram ID
 */
export async function getOrCreateProfile(telegramUser: {
  id: number;
  first_name?: string;
  username?: string;
  photo_url?: string;
}): Promise<UserProfile | null> {
  try {
    // 1. Check if user already exists
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("telegram_id", telegramUser.id)
      .single();

    if (existing && !fetchErr) {
      // Recalculate streak in real-time
      const startDate = new Date(existing.streak_start_date);
      const now = new Date();
      const diffTime = Math.max(0, now.getTime() - startDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const rank = getRankByDays(diffDays);

      if (diffDays !== existing.current_streak_days || rank.title !== existing.rank_title) {
        const longest = Math.max(existing.longest_streak_days, diffDays);
        const { data: updated } = await supabaseAdmin
          .from("profiles")
          .update({
            current_streak_days: diffDays,
            longest_streak_days: longest,
            rank_title: rank.title,
            updated_at: now.toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();
        return updated || existing;
      }

      return existing;
    }

    // 2. Create new profile
    const nowIso = new Date().toISOString();
    const defaultName = telegramUser.username
      ? `@${telegramUser.username}`
      : telegramUser.first_name || `فارس #${telegramUser.id.toString().slice(-4)}`;

    const newProfile = {
      telegram_id: telegramUser.id,
      telegram_username: telegramUser.username || null,
      first_name: telegramUser.first_name || null,
      display_name: defaultName,
      avatar_url: telegramUser.photo_url || null,
      streak_start_date: nowIso,
      current_streak_days: 0,
      longest_streak_days: 0,
      total_points: 100,
      rank_title: "تائب مقبل",
      bio_motto: "عاهدت الله ألا أعود.. رجال صدقوا ⚔️",
      is_public_leaderboard: true,
      is_admin: telegramUser.id === 8925138241,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const { data: created, error: insertErr } = await supabaseAdmin
      .from("profiles")
      .insert(newProfile)
      .select()
      .single();

    if (insertErr) {
      console.error("Error creating profile in Supabase:", insertErr);
      return null;
    }

    return created;
  } catch (err) {
    console.error("getOrCreateProfile error:", err);
    return null;
  }
}

/**
 * Fetch Leaderboard
 */
export async function getLeaderboard(limit = 50): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("is_public_leaderboard", true)
      .order("current_streak_days", { ascending: false })
      .order("longest_streak_days", { ascending: false })
      .order("total_points", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Leaderboard fetch error:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("getLeaderboard error:", err);
    return [];
  }
}

/**
 * Handle Relapse
 */
export async function registerRelapse(
  telegramId: number,
  triggerCause: string,
  note = ""
) {
  try {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("telegram_id", telegramId)
      .single();

    if (!profile) return false;

    const now = new Date();
    // 1. Log the relapse
    await supabaseAdmin.from("relapses").insert({
      user_id: profile.id,
      telegram_id: telegramId,
      relapsed_at: now.toISOString(),
      previous_streak_days: profile.current_streak_days,
      trigger_cause: triggerCause,
      note: note,
      repentance_pledge: true,
    });

    // 2. Reset streak start date to now
    await supabaseAdmin
      .from("profiles")
      .update({
        streak_start_date: now.toISOString(),
        current_streak_days: 0,
        rank_title: "تائب مقبل",
        last_relapse_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", profile.id);

    return true;
  } catch (err) {
    console.error("registerRelapse error:", err);
    return false;
  }
}

/**
 * Record Daily Check-in
 */
export async function recordDailyCheckin(
  telegramId: number,
  status: "sober" | "struggling" = "sober",
  reflection = ""
) {
  try {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("telegram_id", telegramId)
      .single();

    if (!profile) return { success: false, message: "لم يتم العثور على الحساب" };

    const today = new Date().toISOString().split("T")[0];

    // Check if already checked in today
    const { data: existingCheckin } = await supabaseAdmin
      .from("checkins")
      .select("id")
      .eq("user_id", profile.id)
      .eq("checkin_date", today)
      .single();

    if (existingCheckin) {
      return { success: true, alreadyDone: true, message: "تم تسجيل ثباتك لليوم مسبقاً يا بطل!" };
    }

    // Insert checkin
    await supabaseAdmin.from("checkins").insert({
      user_id: profile.id,
      telegram_id: telegramId,
      checkin_date: today,
      status: status,
      reflection: reflection,
    });

    // Add +15 honor points to profile
    await supabaseAdmin
      .from("profiles")
      .update({
        total_points: (profile.total_points || 0) + 15,
        last_checkin_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    return {
      success: true,
      alreadyDone: false,
      message: "بارك الله فيك وثبتك! تم تسجيل ثباتك وإضافة 15 نقطة مجاهد 🛡️",
    };
  } catch (err) {
    console.error("recordDailyCheckin error:", err);
    return { success: false, message: "حدث خطأ أثناء التسجيل" };
  }
}

/**
 * Update user display name / nickname
 */
export async function updateDisplayName(
  telegramId: number,
  displayName: string
): Promise<UserProfile | null> {
  try {
    const cleanName = displayName.trim();
    if (!cleanName) return null;

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        display_name: cleanName,
        updated_at: new Date().toISOString(),
      })
      .eq("telegram_id", telegramId)
      .select()
      .single();

    if (error) {
      console.error("updateDisplayName error:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("updateDisplayName error:", err);
    return null;
  }
}

