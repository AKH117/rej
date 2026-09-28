export interface RankInfo {
  title: string;
  minDays: number;
  maxDays: number;
  badge: string;
  color: string;
  description: string;
}

export const RANKS: RankInfo[] = [
  {
    title: "تائب مقبل",
    minDays: 0,
    maxDays: 3,
    badge: "🌱",
    color: "from-zinc-500 to-zinc-700",
    description: "البداية المباركة.. كسر الشوكة الأولى وتجديد العهد مع الله.",
  },
  {
    title: "صابر مجاهد",
    minDays: 4,
    maxDays: 7,
    badge: "⚔️",
    color: "from-amber-600 to-amber-800",
    description: "مرحلة انسحاب السموم وبدء استرداد الإرادة المسلوبة.",
  },
  {
    title: "مرابط ثابت",
    minDays: 8,
    maxDays: 21,
    badge: "🛡️",
    color: "from-emerald-600 to-teal-800",
    description: "كسر العادة السلوكية القديمة وبدء تشكيل مسارات عصبية جديدة.",
  },
  {
    title: "قاهر الشهوة",
    minDays: 22,
    maxDays: 45,
    badge: "🦅",
    color: "from-blue-600 to-indigo-800",
    description: "استعادة حساسية الدوبامين الطبيعي وصفاء البصيرة.",
  },
  {
    title: "فارس العفة",
    minDays: 46,
    maxDays: 90,
    badge: "👑",
    color: "from-purple-600 to-violet-800",
    description: "زوال ضباب الدماغ بالكامل، وعودة هيبة الرجولة والحياء.",
  },
  {
    title: "صِدِّيق",
    minDays: 91,
    maxDays: 99999,
    badge: "🌟",
    color: "from-yellow-400 to-amber-600",
    description: "ثبات الأبطال.. «مِّنَ الْمُؤْمِنِينَ رِجَالٌ صَدَقُوا مَا عَاهَدُوا اللَّهَ عَلَيْهِ».",
  },
];

export function getRankByDays(days: number): RankInfo {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (days >= RANKS[i].minDays) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

export interface DopamineMilestone {
  day: number;
  title: string;
  science: string;
  islamicReward: string;
}

export const DOPAMINE_MILESTONES: DopamineMilestone[] = [
  {
    day: 1,
    title: "يوم 1: كسر الحلقة الشيطانية",
    science: "يبدأ الدماغ في التعجب من انقطاع الجرعة السريعة ويبدأ في استشعار الهدوء.",
    islamicReward: "فرحة الله بتوبتك أعظم من فرحة رجل وجد راحلته في أرض مهلكة.",
  },
  {
    day: 3,
    title: "يوم 3: قمة المقاومة",
    science: "هبوط مستوى الدوبامين الزائف؛ الجسم يطلب الجرعة، وصمودك هنا يبني أقوى العضلات الإرادية.",
    islamicReward: "«وَالصَّابِرِينَ فِي الْبَأْسَاءِ وَالضَّرَّاءِ وَحِينَ الْبَأْسِ».",
  },
  {
    day: 7,
    title: "يوم 7: قفزة الطاقة الذكورية",
    science: "ارتفاع ملحوظ في هرمون التستوستيرون، وبدء تحسن النوم ونضارة الوجه والنشاط البدني.",
    islamicReward: "«المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف».",
  },
  {
    day: 14,
    title: "يوم 14: تراجع الضباب الذهني",
    science: "انخفاض رغبة العزلة، وتحسن التركيز والذاكرة، وبدء استعادة النظرة الفطرية السليمة.",
    islamicReward: "تذوق حلاوة ركعتين في جوف الليل دون ثقل الشهوة الخبيثة.",
  },
  {
    day: 30,
    title: "يوم 30: إعادة تشكيل المستقبلات",
    science: "تستعيد مستقبلات الدوبامين (D2 receptors) توازنها الطبيعي؛ تعود المتعة للأشياء البسيطة.",
    islamicReward: "مرور شهر كامل في طهارة ونور.. صيام الجوارح عن الرذيلة.",
  },
  {
    day: 60,
    title: "يوم 60: الهيبة والسكينة",
    science: "استقرار المشاعر العاطفية، زوال التوتر الاجتماعي والخجل المرضي، وثقة رجولية عالية.",
    islamicReward: "«سِيمَاهُمْ فِي وُجُوهِهِم مِّنْ أَثَرِ السُّجُودِ».",
  },
  {
    day: 90,
    title: "يوم 90: إعادة الضبط الشاملة (Full Rewire)",
    science: "موت المسارات العصبية القديمة للإدمان وتشكيل هوية جديدة بالكامل لرجل حر طاهر.",
    islamicReward: "جزاء عظيم كعفة يوسف عليه السلام: «إِنَّهُ مَن يَتَّقِ وَيَصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ».",
  },
];
