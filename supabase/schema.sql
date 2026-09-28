-- ========================================================
-- مَنظُومَة [رِجَالٌ صَدَقُوا] - درع العفة وسباق الصادقين
-- Database Schema for Supabase PostgreSQL
-- ========================================================

-- 1. Profiles Table (بيانات الفرسان والمتنافسين)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    telegram_username TEXT,
    first_name TEXT,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    streak_start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_streak_days INT NOT NULL DEFAULT 0,
    longest_streak_days INT NOT NULL DEFAULT 0,
    last_relapse_at TIMESTAMPTZ,
    last_checkin_at TIMESTAMPTZ,
    total_points INT NOT NULL DEFAULT 100,
    rank_title TEXT NOT NULL DEFAULT 'تائب مقبل',
    bio_motto TEXT DEFAULT 'عاهدت الله ألا أعود.. رجال صدقوا',
    is_public_leaderboard BOOLEAN NOT NULL DEFAULT true,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for leaderboard sorting
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON public.profiles(current_streak_days DESC, longest_streak_days DESC, total_points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_telegram ON public.profiles(telegram_id);

-- 2. Daily Check-ins (سجل الثبات والاطمئنان اليومي)
CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'sober', -- 'sober' (ثابت بفضل الله) | 'struggling' (أواجه جهاداً)
    reflection TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_daily_checkin UNIQUE(user_id, checkin_date)
);

-- 3. Relapses Log (سجل الانتكاسات وتحليل أسباب السقوط للنهوض فوراً)
CREATE TABLE IF NOT EXISTS public.relapses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    relapsed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    previous_streak_days INT NOT NULL DEFAULT 0,
    trigger_cause TEXT NOT NULL DEFAULT 'غير محدد', -- 'الهاتف في السرير', 'الفراغ والملل', 'العزلة والوحدة', 'إطلاق البصر', 'الحزن والضغط'
    note TEXT,
    repentance_pledge BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SOS Emergency Events (سجل زر الاستغاثة لإحصاء اللحظات الحرجة)
CREATE TABLE IF NOT EXISTS public.sos_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    was_resolved BOOLEAN DEFAULT true,
    feedback_notes TEXT
);

-- 5. Daily Quran & Sunnah Motivational Wisdoms (زاد الفرسان اليومي)
CREATE TABLE IF NOT EXISTS public.daily_wisdoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    source TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'purity',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initial Seeds for Wisdoms
INSERT INTO public.daily_wisdoms (quote, source, category) VALUES
('أَلَمْ يَعْلَم بِأَنَّ اللَّهَ يَرَى', 'سورة العلق - آية 14', 'purity'),
('وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا ۚ وَإِنَّ اللَّهَ لَمَعَ الْمُحْسِنِينَ', 'سورة العنكبوت - آية 69', 'patience'),
('المُؤْمِنُ القَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللهِ مِنَ المُؤْمِنِ الضَّعِيفِ، وَفِي كُلٍّ خَيْرٌ', 'صحيح مسلم', 'manhood'),
('مَا تَرَكَ عَبْدٌ شَيْئًا لِلَّهِ إِلَّا عَوَّضَهُ اللَّهُ بِهِ مَا هُوَ خَيْرٌ مِنْهُ', 'مسند الإمام أحمد', 'purity'),
('إِنَّ الَّذِينَ اتَّقَوْا إِذَا مَسَّهُمْ طَائِفٌ مِّنَ الشَّيْطَانِ تَذَكَّرُوا فَإِذَا هُم مُّبْصِرُونَ', 'سورة الأعراف - آية 201', 'purity'),
('مِّنَ الْمُؤْمِنِينَ رِجَالٌ صَدَقُوا مَا عَاهَدُوا اللَّهَ عَلَيْهِ', 'سورة الأحزاب - آية 23', 'manhood'),
('احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ', 'سنن الترمذي - حسن صحيح', 'patience'),
('وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ', 'سورة الطلاق - آية 2-3', 'hope')
ON CONFLICT DO NOTHING;

-- 6. Helper Function: Recalculate User Rank & Streak
CREATE OR REPLACE FUNCTION public.recalculate_streak(user_telegram_id BIGINT)
RETURNS TABLE(days INT, rank_name TEXT) AS $$
DECLARE
    start_time TIMESTAMPTZ;
    diff_days INT;
    new_rank TEXT;
BEGIN
    SELECT streak_start_date INTO start_time 
    FROM public.profiles 
    WHERE telegram_id = user_telegram_id;

    IF start_time IS NULL THEN
        RETURN QUERY SELECT 0, 'تائب مقبل'::TEXT;
        RETURN;
    END IF;

    diff_days := EXTRACT(DAY FROM (NOW() - start_time))::INT;
    IF diff_days < 0 THEN diff_days := 0; END IF;

    IF diff_days < 4 THEN
        new_rank := 'تائب مقبل';
    ELSIF diff_days < 8 THEN
        new_rank := 'صابر مجاهد';
    ELSIF diff_days < 22 THEN
        new_rank := 'مرابط ثابت';
    ELSIF diff_days < 46 THEN
        new_rank := 'قاهر الشهوة';
    ELSIF diff_days < 91 THEN
        new_rank := 'فارس العفة';
    ELSE
        new_rank := 'صِدِّيق';
    END IF;

    UPDATE public.profiles
    SET current_streak_days = diff_days,
        longest_streak_days = GREATEST(longest_streak_days, diff_days),
        rank_title = new_rank,
        updated_at = NOW()
    WHERE telegram_id = user_telegram_id;

    RETURN QUERY SELECT diff_days, new_rank;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relapses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_wisdoms ENABLE ROW LEVEL SECURITY;

-- Allow public read of leaderboard profiles
CREATE POLICY "Public profiles can be viewed by all" ON public.profiles
    FOR SELECT USING (true);

-- Allow service role full access
CREATE POLICY "Service role full access on profiles" ON public.profiles
    FOR ALL USING (true);

CREATE POLICY "Public read on wisdoms" ON public.daily_wisdoms
    FOR SELECT USING (true);

CREATE POLICY "Service role full access on checkins" ON public.checkins
    FOR ALL USING (true);

CREATE POLICY "Service role full access on relapses" ON public.relapses
    FOR ALL USING (true);

CREATE POLICY "Service role full access on sos_logs" ON public.sos_logs
    FOR ALL USING (true);
