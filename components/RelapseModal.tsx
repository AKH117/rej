"use client";

import React, { useState } from "react";
import { RefreshCw, X, ShieldAlert, Check, Lightbulb, Target, BookOpen, ShieldCheck } from "lucide-react";

interface RelapseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRelapse: (trigger: string, note: string) => void;
}

interface TriggerAdvice {
  title: string;
  danger: string;
  actionPlan: string[];
  motto: string;
}

const TRIGGER_ADVICE_MAP: Record<string, TriggerAdvice> = {
  "الفراغ والملل القاتل": {
    title: "خطة سحق الفراغ واستعادة الدوبامين الطبيعي",
    danger: "الدماغ يكره الفراغ؛ حين لا يجد عملاً نافعاً يبحث عن أرخص دوبامين كيميائي. النفس إن لم تشغلها بالحق شغلتك بالباطل.",
    actionPlan: [
      "قم فوراً بكتابة 3 مهام محددة لليوم، وابدأ في الأولى حالاً.",
      "ممنوع الجلوس بلا عمل: مارس تمارين رياضية سريعة أو اخرج للمشي في الهواء الطلق.",
      "املأ وقت فراغك الثابت بورد قرآني، قراءة كتاب نافع، أو تعلم مهارة تكسبك مالاً.",
    ],
    motto: "«نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالفَرَاغُ».",
  },
  "الهاتف في السرير قبل النوم": {
    title: "بروتوكول تحصين غرفة النوم وقاعدة الصفر إلكترونيات",
    danger: "في آخر الليل تنخفض طاقة الجسم وتنهار الإرادة مع الظلام والوحدة، فيصبح الهاتف فخاً محكماً يسهل اصطيادك فيه.",
    actionPlan: [
      "قانون صارم: شاحن الهاتف يوضع خارج غرفة النوم نهائياً بدءاً من هذه الليلة.",
      "لا تدخل السرير إلا وأنت في قمة النعاس ومستعد للنوم فوراً.",
      "اقرأ سورة الملك وأذكار النوم من مصحف أو كتاب ورقي، ونم على طهارة.",
    ],
    motto: "«احفظ ليلك يحفظك نهارك.. معركة الفراش تُحسم بترك الهاتف في الصالة».",
  },
  "إطلاق البصر في وسائل التواصل (تيك توك، إنستغرام..)": {
    title: "بروتوكول تطهير المنافذ وحجب السهام المسمومة",
    danger: "النظرة سهم مسموم من سهام إبليس؛ خوارزميات السوشيال ميديا مصممة عمداً لإثارة غرائزك حتى تنهار مقاومتك.",
    actionPlan: [
      "احذف تطبيقات التصفح العشوائي (تيك توك/إنستغرام) فوراً لمدة 7 أيام على الأقل.",
      "فعّل خاصية تقييد المحتوى الحساس وفلترة المنشورات في حساباتك.",
      "عوّد عينك على غض البصر الفوري: أول ما يظهر مشهد مريب، أغلق التطبيق فوراً.",
    ],
    motto: "«قُل لِّلْمُؤْمِنِينَ يَغُضُّوا مِنْ أَبْصَارِهِمْ وَيَحْفَظُوا فُرُوجَهُمْ ۚ ذَٰلِكَ أَزْكَىٰ لَهُمْ».",
  },
  "العزلة والجلوس وحيداً في الغرفة المغلقة": {
    title: "بروتوكول كسر العزلة وفتح الأبواب",
    danger: "الشيطان ذئب الإنسان؛ يأكل من الغنم القاصية. حين تغلق الباب على نفسك، تظن أنك حر ومخفي عن العيون، فيسهل اصطيادك.",
    actionPlan: [
      "ممنوع إغلاق باب الغرفة بالمفتاح إطلاقاً بعد اليوم. اجعل بابك دائماً مفتوحاً.",
      "انقل دراستك أو استخدامك للحاسوب إلى الصالة أو مكان تواجد العائلة.",
      "إذا هاجمتك الرغبة، غادر المكان فوراً وانزل للشارع أو تحدث مع أحد أفراد أسرتك.",
    ],
    motto: "«عليك بالجماعة، فإنما يأكل الذئب من الغنم القاصية.. لا تختلِ بنفسك وأنت ضعيف».",
  },
  "الهروب من الحزن وضغوط الحياة": {
    title: "بروتوكول تفريغ الألم واللجوء للركن الشديد",
    danger: "الإباحية ليست رغبة جنسية هنا، بل مخدر نفسي للهروب من قلق أو حزن عميق.. ولكنها تضاعف الهم بعد دقائق بمشاعر العار والذنب.",
    actionPlan: [
      "اعلم أن النشوة المؤقتة تعقبها نوبة اكتئاب ومقت للنفس؛ أنت تعالج الجرح بالسم.",
      "توضأ فوراً واسكب حزنك وهمومك في سجود طويل، فالله هو كاشف الضر لا الشهوة.",
      "اكتب المشاكل التي تضغطك على ورقة، وقسّمها لخطوات عملية صغيرة لمواجهتها بشجاعة.",
    ],
    motto: "«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ».. الرجولة مواجهة الصعاب لا الهروب في خيال زائف.",
  },
  "التهاون في صلاة الجماعة": {
    title: "إصلاح خط الدفاع الأول وحصن المؤمن الحصين",
    danger: "الصلاة هي المغذي الروحي الوحيد لإرادتك؛ إذا تهاونت فيها انقطع المدد الإلهي وهبطت مناعتك الإيمانية أمام أول هجمة شهوة.",
    actionPlan: [
      "اضبط منبهك قبل الأذان بـ 10 دقائق، وتوجه للمسجد فور سماع «حي على الصلاة».",
      "الزم الصف الأول وتكبيرة الإحرام، واجعل صلاتك خاشعة تنهى عن الفحشاء والمنكر.",
      "صلّ ركعتي توبة الآن فوراً واطلب من الله أن يثبت قلبك ويعفو عن تقصيرك.",
    ],
    motto: "«إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ».. لا يمكن لبناء العفة أن يثبت وسقفه منخور.",
  },
};

const COMMON_TRIGGERS = Object.keys(TRIGGER_ADVICE_MAP);

export default function RelapseModal({
  isOpen,
  onClose,
  onConfirmRelapse,
}: RelapseModalProps) {
  const [selectedTrigger, setSelectedTrigger] = useState(COMMON_TRIGGERS[0]);
  const [note, setNote] = useState("");
  const [pledgeChecked, setPledgeChecked] = useState(false);

  if (!isOpen) return null;

  const currentAdvice = TRIGGER_ADVICE_MAP[selectedTrigger];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeChecked) return;
    onConfirmRelapse(selectedTrigger, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-black text-lg">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            <span>كبوة فارس ولا استسلام</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Motivational Hadith */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed text-center">
          <p className="font-semibold mb-1">
            «كُلُّ بَنِي آدَمَ خَطَّاءٌ، وَخَيْرُ الخَطَّائِينَ التَّوَّابُونَ»
          </p>
          <span className="text-slate-400 text-[11px]">
            السقوط ليس نهاية المطاف، الاستسلام في الوحل هو الهزيمة الحقيقية. قم وتوضأ واغسل قلبك.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Triggers selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              ما هو الفخ الذي أوقعك؟ (اختر السبب لنعطيك خطة غلق الثغرة):
            </label>
            <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {COMMON_TRIGGERS.map((trigger) => (
                <button
                  type="button"
                  key={trigger}
                  onClick={() => setSelectedTrigger(trigger)}
                  className={`text-right text-xs py-2 px-3 rounded-xl border transition-all ${
                    selectedTrigger === trigger
                      ? "bg-amber-500/20 border-amber-500 text-amber-200 font-bold shadow-sm"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {trigger}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Tailored Advice Protocol based on trigger */}
          {currentAdvice && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 border border-amber-500/30 text-xs flex flex-col gap-2.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-amber-300 font-black text-xs border-b border-slate-800/80 pb-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span>{currentAdvice.title}</span>
              </div>

              {/* Diagnosis */}
              <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">🔍 تشخيص الفخ (لماذا سقطت؟):</span>
                <span>{currentAdvice.danger}</span>
              </div>

              {/* Action Plan */}
              <div>
                <span className="text-emerald-400 font-bold text-[11px] block mb-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>خطة غلق الثغرة لئلا تقع في نفس الحفرة:</span>
                </span>
                <ul className="flex flex-col gap-1.5 text-[11px] text-slate-200 pr-2">
                  {currentAdvice.actionPlan.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Motto / Verse */}
              <div className="pt-2 border-t border-slate-800/60 text-[10px] text-amber-200/90 font-serif text-center italic">
                {currentAdvice.motto}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              خاطرة أو درس تعلمته من هذا السقوط:
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اكتب درساً لنفسك كي تقرأه إذا وسوس لك الشيطان مرة أخرى.."
              rows={2}
              className="w-full text-xs p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Mandatory Pledge */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/90 border border-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={pledgeChecked}
              onChange={(e) => setPledgeChecked(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-xs text-slate-300 font-semibold leading-relaxed">
              أشهد الله أنني تبت إليه توبة نصوحاً، وعزمت على تطبيق خطة غلق الثغرة، وسأقوم الآن للوضوء وصلاة ركعتي التوبة.
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={!pledgeChecked}
            className="w-full mt-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تصفير العداد وتجديد العهد مع الله</span>
          </button>
        </form>
      </div>
    </div>
  );
}
