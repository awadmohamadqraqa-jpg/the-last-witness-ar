import type { Question, Stage } from './types'

/**
 * STAGES — the five movements of the interview.
 * Each stage owns a backdrop and a terminal label.
 */
export const STAGES: Stage[] = [
  {
    id: 'calm',
    title: 'الهدوء',
    subtitle: 'المرحلة الأولى — تثبيت الحالة',
    scene: 'mirror-room',
    code: 'المرحلة ٠١ / الهدوء',
  },
  {
    id: 'doubt',
    title: 'الشك',
    subtitle: 'المرحلة الثانية — اختبار الذاكرة',
    scene: 'mirror-room',
    code: 'المرحلة ٠٢ / الشك',
  },
  {
    id: 'surveillance',
    title: 'المراقبة',
    subtitle: 'المرحلة الثالثة — رصد الاستجابات',
    scene: 'surveillance',
    code: 'المرحلة ٠٣ / المراقبة',
  },
  {
    id: 'confrontation',
    title: 'المواجهة',
    subtitle: 'المرحلة الرابعة — ضغط القرار',
    scene: 'door',
    code: 'المرحلة ٠٤ / المواجهة',
  },
  {
    id: 'revelation',
    title: 'الانكشاف',
    subtitle: 'المرحلة الخامسة — الملف الشخصي',
    scene: 'archive',
    code: 'المرحلة ٠٥ / الانكشاف',
  },
]

export const MAX_SCORE = 15

/** The fifteen interview questions, in order. */
export const QUESTIONS: Question[] = [
  // ------------------------------------------------------------ STAGE 1
  {
    id: 1,
    stage: 'calm',
    prompt: 'عندما تكون وحدك في مكان هادئ، ما شعورك؟',
    answers: [
      { id: 'a', label: 'أشعر بالراحة.' },
      { id: 'b', label: 'أشعر بالتوتر.' },
      { id: 'c', label: 'أفضل وجود شخص معي.' },
    ],
  },
  {
    id: 2,
    stage: 'calm',
    prompt: 'هل تثق بذاكرتك دائمًا؟',
    answers: [
      { id: 'a', label: 'نعم.' },
      { id: 'b', label: 'ليس دائمًا.' },
      { id: 'c', label: 'أحيانًا أشك فيما أتذكره.' },
    ],
  },
  {
    id: 3,
    stage: 'calm',
    prompt: 'إذا سمعت صوتًا غريبًا في منزلك، ماذا تفعل؟',
    answers: [
      { id: 'a', label: 'أذهب للتحقق.' },
      { id: 'b', label: 'أتجاهله.' },
      { id: 'c', label: 'أبحث عن مخرج.' },
    ],
  },
  // ------------------------------------------------------------ STAGE 2
  {
    id: 4,
    stage: 'doubt',
    prompt: 'هل سبق أن شعرت بأنك تعرف شخصًا لم تقابله من قبل؟',
    answers: [
      { id: 'a', label: 'نعم.' },
      { id: 'b', label: 'لا.' },
      { id: 'c', label: 'لا أتذكر.' },
    ],
  },
  {
    id: 5,
    stage: 'doubt',
    prompt: 'إذا وجدت صورة لك في مكان لم تزره، ماذا ستفعل؟',
    answers: [
      { id: 'a', label: 'أبحث عن تفسير.' },
      { id: 'b', label: 'أشعر بالخوف.' },
      { id: 'c', label: 'أتخلص من الصورة.' },
    ],
  },
  {
    id: 6,
    stage: 'doubt',
    prompt: 'هل تستطيع البقاء في غرفة مظلمة تمامًا؟',
    answers: [
      { id: 'a', label: 'نعم.' },
      { id: 'b', label: 'ربما.' },
      { id: 'c', label: 'لا.' },
    ],
  },
  // ------------------------------------------------------------ STAGE 3
  {
    id: 7,
    stage: 'surveillance',
    prompt: 'هل تشعر أن هناك شيئًا لم تخبرنا به؟',
    answers: [
      { id: 'a', label: 'لا.' },
      { id: 'b', label: 'ربما.' },
      { id: 'c', label: 'نعم.' },
    ],
  },
  {
    id: 8,
    stage: 'surveillance',
    prompt: 'ماذا ستفعل إذا سمعت صوتك يتحدث من خلف الباب؟',
    answers: [
      { id: 'a', label: 'أفتح الباب.' },
      { id: 'b', label: 'أبتعد.' },
      { id: 'c', label: 'أحاول معرفة مصدر الصوت.' },
    ],
  },
  {
    id: 9,
    stage: 'surveillance',
    prompt: 'هل رأيت شيئًا غريبًا في هذه الغرفة؟',
    answers: [
      { id: 'a', label: 'نعم.' },
      { id: 'b', label: 'لا.' },
      { id: 'c', label: 'لا أريد الإجابة.' },
    ],
  },
  // ------------------------------------------------------------ STAGE 4
  {
    id: 10,
    stage: 'confrontation',
    prompt: 'أمامك باب مفتوح، وخلفه صوت يناديك. هل تدخل؟',
    answers: [
      { id: 'a', label: 'أدخل.' },
      { id: 'b', label: 'أبتعد.' },
      { id: 'c', label: 'أراقب أولًا.' },
    ],
  },
  {
    id: 11,
    stage: 'confrontation',
    prompt: 'إذا أخبرك شخص أنك قابلته أمس، وأنت لا تتذكره، ماذا تفعل؟',
    answers: [
      { id: 'a', label: 'أصدقه.' },
      { id: 'b', label: 'أطلب دليلًا.' },
      { id: 'c', label: 'أنكر معرفته.' },
    ],
  },
  {
    id: 12,
    stage: 'confrontation',
    prompt: 'هل تريد معرفة ما حدث للشاهد السابق؟',
    answers: [
      { id: 'a', label: 'نعم.' },
      { id: 'b', label: 'لا.' },
      { id: 'c', label: 'أريد الخروج.' },
    ],
  },
  // ------------------------------------------------------------ STAGE 5
  {
    id: 13,
    stage: 'revelation',
    prompt: 'أمامك ملف يحمل اسمك. هل تفتحه؟',
    answers: [
      { id: 'a', label: 'نعم.' },
      { id: 'b', label: 'لا.' },
      { id: 'c', label: 'أتردد.' },
    ],
  },
  {
    id: 14,
    stage: 'revelation',
    prompt: 'هناك شخص يقول إنه يعرف الحقيقة كاملة. هل تصدقه؟',
    answers: [
      { id: 'a', label: 'نعم.' },
      { id: 'b', label: 'لا.' },
      { id: 'c', label: 'أطلب منه إثباتًا.' },
    ],
  },
  {
    id: 15,
    stage: 'revelation',
    prompt: 'إذا كانت الحقيقة ستغير كل ما تعرفه، هل تريد اكتشافها؟',
    answers: [
      { id: 'a', label: 'اكشف الحقيقة.' },
      { id: 'b', label: 'أريد المغادرة.' },
      { id: 'c', label: 'أريد معرفة ما حدث للشاهد السابق.' },
    ],
  },
]

export const questionById = (id: number): Question => QUESTIONS[id - 1]
export const stageOfQuestion = (id: number): Stage =>
  STAGES.find((s) => s.id === questionById(id).stage) ?? STAGES[0]
