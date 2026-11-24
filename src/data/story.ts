/**
 * ============================================================
 * STORY COPY — every line of narrative text in the experience
 * ============================================================
 * Kept in one place so tone stays consistent: cold, bureaucratic,
 * and quietly wrong. Nothing here describes the visitor's real life.
 */

export const BRAND = {
  arabic: 'الشاهد الأخير',
  latin: 'THE LAST WITNESS',
  facility: 'منشأة التحقيق ٤',
  facilityCode: 'منشأة التحقيق ٤ — جناح الاستجواب',
  caseNumber: 'قضية ١٩٧٣',
}

export const LANDING = {
  eyebrow: 'تسجيل داخلي // جلسة غير مصرّح بها',
  headline: 'لقد انتظرناك طويلًا',
  subtitle: 'هناك أسئلة لا يجب أن تعرف إجابتها.',
  cta: 'ابدأ التجربة',
  ctaResume: 'متابعة الجلسة',
  note: 'تجربة سردية تفاعلية — الأحداث خيالية بالكامل.',
  footer: 'منشأة التحقيق ٤ // الجناح المغلق // ٢٣:٤٠',
  badges: ['جلسة سرّية', 'الصوت موصى به', 'مدة ٥–٨ دقائق'],
}

export const WARNING = {
  title: 'قبل أن تبدأ…',
  body: 'تحتوي هذه التجربة على أصوات مفاجئة ومشاهد بصرية مزعجة وأحداث نفسية غير متوقعة.',
  body2: 'كل ما ستسمعه وتراه هنا خيالي. لا يتم الوصول إلى الكاميرا أو الميكروفون أو الموقع أو ملفات جهازك، ولن يُطلب منك أي بيانات حقيقية.',
  accept: 'أوافق، تابع',
  back: 'العودة',
  settingsTitle: 'تفضيلات التجربة',
  reducedMotion: 'تقليل الحركة',
  reducedMotionHint: 'يلغي الاهتزاز والحركة السريعة والتأثيرات المتكررة.',
  reducedFlash: 'تقليل الوميض',
  reducedFlashHint: 'يلغي وميض الشاشة ومشاهد التشويش العنيفة.',
  reducedSound: 'خفض الصوت القوي',
  reducedSoundHint: 'يخفض الأصوات المفاجئة ويجعل النبرة أكثر ثباتًا.',
  sound: 'الصوت',
  soundOn: 'مفعّل',
  soundOff: 'مكتوم',
  duration: 'المدة المتوقعة: ٥–٨ دقائق',
}

export const REGISTRATION = {
  title: 'تسجيل بيانات الشاهد',
  intro:
    'قبل بدء الجلسة، يجب أن يُنشأ ملف. أي كلمة تختارها ستُستخدم داخل القصة فقط. لن يُطلب منك اسمك الحقيقي.',
  aliasLabel: 'اسم مستعار (اختياري)',
  aliasPlaceholder: 'اكتب أي كلمة تريدها…',
  aliasHint: 'اتركه فارغًا ليُسجَّل الملف باسم «الشاهد».',
  caseLabel: 'رقم القضية',
  caseHint: 'تم توليده تلقائيًا بواسطة النظام.',
  submit: 'تأكيد الهوية',
  accepted: 'تم إنشاء ملفك بنجاح…',
  connected: (n: string) => `الشاهد رقم ${n}: متصل`,
  aliasNote: 'الاسم المستعار للاستخدام القصصي فقط.',
  system: ['تم الاتصال بقاعدة أرشيف الجناح المغلق.', 'المستشعرات: نشطة.', 'عدد الكراسي في الغرفة: ٢.'],
  start: 'بدء الجلسة',
  back: 'العودة',
}

export const TEST = {
  stageLabel: 'المرحلة',
  questionLabel: 'السؤال',
  of: 'من',
  exit: 'إنهاء الجلسة',
  exitConfirmTitle: 'هل تريد إنهاء الجلسة؟',
  exitConfirmBody: 'سيتم حفظ تقدمك، ويمكنك المتابعة من السؤال نفسه في أي وقت.',
  exitConfirmStay: 'متابعة الجلسة',
  exitConfirmLeave: 'إنهاء والعودة للبداية',
  pause: 'إيقاف مؤقت',
  resume: 'استئناف',
  answerAria: (n: number) => `الجواب رقم ${n}`,
  transcript: 'سجل الإجابات',
  showTranscript: 'عرض السجل',
  hideTranscript: 'إخفاء السجل',
  keyboardHint: 'استخدم الأسهم أو الأرقام ١ ٢ ٣ للاختيار، وزر الإدخال للتأكيد.',
  noAnswer: 'لم تُسجّل إجابة بعد.',
}

export const EVIDENCE_UI = {
  title: 'أرشيف الأدلة',
  subtitle: 'كل ما جمعته من الغرفة — وكل ما لم تُرد معرفته.',
  open: 'فتح الأرشيف',
  close: 'إغلاق',
  discovered: 'مكتشف',
  locked: 'غير مكتشف',
  lockedHint: 'لم تصل إليه بعد.',
  counter: (n: string, total: string) => `${n} من ${total}`,
  secretBadge: 'سرّي',
  requiredBadge: 'مطلوب للحقيقة المحظورة',
  emptyTitle: 'الأرشيف فارغ',
  emptyBody: 'أكمل الجلسة لتبدأ في جمع ما تبقّى من القضية.',
  back: 'عودة إلى القاعة',
  detailLabel: 'تفاصيل الدليل',
  stamp: 'ختم الأرشيف',
}

export const CONFRONTATION = {
  title: 'المواجهة',
  subtitle: 'لم يتبقَّ سؤال واحد.',
  prompt: 'الغرفة الآن بين يديك. ماذا تفعل؟',
  choices: [
    {
      id: 'open-file',
      title: 'افتح الملف الذي يحمل اسمك',
      body: 'تستطيع أن تقرأ ما كُتب عنك قبل أن تصل.',
    },
    {
      id: 'open-door',
      title: 'افتح الباب واخرج',
      body: 'الباب لم يكن مقفلًا. ربما هذا هو الفخ.',
    },
    {
      id: 'look-mirror',
      title: 'انظر في الزجاج',
      body: 'ثم انظر إلى الشخص الذي يقف بجانبك في الانعكاس.',
    },
  ] as const,
  continue: 'أكمل الانكشاف',
}

export const REVELATION = {
  intro: ['الأسئلة التي أجبت عليها ليست أسئلتك.', 'تم جمعها من جلسة أخرى.', 'هذه هي الجلسة.'],
  loadingLines: ['جارٍ فك تشفير السجل…', 'جارٍ مطابقة الأجوبة مع الملف السابق…', 'تم العثور على تطابق واحد.'],
  title: 'ما حدث في تلك الليلة',
  beats: [
    'في ١٤ آذار، دخل الشاهد رقم ٠٠٠ غرفة التحقيق في الساعة ٢٣:٤٠ وأُغلق الباب من الداخل.',
    'الكاميرا سجّلت أربعين دقيقة من الصمت، ثم صوتًا واحدًا يقول: «اسألوا الشاهد الجديد».',
    'في الصباح كان الكرسي فارغًا، والملف مفتوحًا، والزجاج مغطى بالبخار من الجهة الأخرى.',
    'التقارير تكتب أن الجلسة انتهت. لكن الغرفة ظلت تستقبل الشهود كل عام، بالأسئلة نفسها، بالصمت نفسه.',
    'كل جواب كان مفقودًا من السجل، حتى جاء من أكمل الإجابات.',
  ],
  /** Last, personalised beat — driven by the confrontation decision. */
  personalBeat: {
    'open-file':
      'أنت فتحت الملف. لا أحد فتحه قبلك. لهذا السبب، في آخر سطر من الجلسة، كُتب اسمك أنت — لا اسم الشاهد السابق.',
    'open-door':
      'أنت اخترت الباب. عند العتبة، سمعت خلفك خطوتين بدل خطوة واحدة. لم يُسجل التقرير من الذي تبعك.',
    'look-mirror':
      'أنت نظرت في الزجاج. في الانعكاس كان هناك شخصان، وأنت تعرف الآن أن أحدًا منهما لم يكن انعكاسًا.',
  } as Record<string, string>,
  readyLabel: 'عرض تقريرك النهائي',
  evidenceNote: (n: string, total: string) => `تم جمع ${n} من ${total} من أدلة القضية.`,
}

export const ENDING_UI = {
  reportTitle: 'تقرير الشاهد',
  closing: 'نهاية التجربة',
  replay: 'إعادة التجربة',
  archive: 'فتح الأرشيف',
  clear: 'مسح التقدم المحفوظ',
  clearConfirm: 'سيتم مسح كل ما حفظه هذا الجهاز. هل تريد المتابعة؟',
  cleared: 'تم مسح التقدم.',
  caseLabel: 'رقم القضية',
  aliasLabel: 'الاسم المستعار',
  witnessLabel: 'الشاهد',
  scoreLabel: 'مؤشرات السلوك',
  evidenceLabel: 'الأدلة المكتشفة',
  answersLabel: 'الإجابات المسجّلة',
  durationLabel: 'مدة الجلسة',
  endingLabel: 'النهاية',
  pathLabel: 'المسار',
  decisionLabel: 'القرار الأخير',
  decisions: {
    'open-file': 'فتح الملف الشخصي',
    'open-door': 'فتح الباب والخروج',
    'look-mirror': 'النظر في الزجاج',
  } as Record<string, string>,
  disclaimer:
    'هذه التجربة عمل سردي خيالي. جميع الشخصيات والأحداث والأدلة والأسماء وهمية، ولا ترتبط بأي شخص أو مؤسسة حقيقية.',
  reportFooter: 'منشأة التحقيق ٤ — نسخة الشاهد',
  shareHint: 'أوصلتَ إلى نهاية من أربع. النهايات الأخرى موجودة، لكنها تحتاج شخصًا آخر.',
  endingsFoundLabel: 'نهايات مكتشفة على هذا الجهاز',
}

export const ENDING_ACCENTS: Record<'warm' | 'cold' | 'danger' | 'void', string> = {
  warm: '#b9a48a',
  cold: '#607A91',
  danger: '#A31320',
  void: '#6d6f76',
}

/** Fictional case-report flavour lines, picked deterministically per witness. */
export const REPORT_NOTES: Record<'curiosity' | 'caution' | 'confrontation', string[]> = {
  curiosity: [
    'أظهر الشاهد رغبة غير معتادة في رؤية ما لا يُعرض.',
    'فتح الشاهد أبوابًا لم يُطلب منه فتحها.',
    'سأل الشاهد أسئلة لم تكن في النموذج.',
  ],
  caution: [
    'فضّل الشاهد البقاء قريبًا من المخرج.',
    'تجنّب الشاهد الاقتراب من الزجاج.',
    'طلب الشاهد دليلًا في كل مرة طُلب منه تصديق شيء.',
  ],
  confrontation: [
    'لم يخفض الشاهد بصره في أي لحظة.',
    'أنكر الشاهد أشياء سُجّلت أمامه.',
    'طلب الشاهد أن يُفتح له ما أُغلق.',
  ],
}
