import type { EvidenceId, StoryEventId, StoryEvent } from './types'

/**
 * ============================================================
 * CINEMATIC HORROR EVENTS
 * ============================================================
 * Seven scripted beats. They are rare on purpose: one small
 * environmental wrongness, then escalation, then silence.
 */

export const STORY_EVENTS: StoryEvent[] = [
  {
    id: 'event-1-light',
    afterQuestion: 3,
    scene: 'mirror-room',
    title: 'تغيّر في الإضاءة',
    lines: [
      '…',
      'انخفضت شدة الإضاءة في الغرفة بنسبة ٦٪.',
      'لم يطلب أحد منك أن تلاحظ ذلك.',
    ],
    duration: 4200,
    tone: 'cold',
    sound: 'flicker',
  },
  {
    id: 'event-2-camera',
    afterQuestion: 6,
    scene: 'surveillance',
    title: 'كاميرا المراقبة',
    lines: ['تم تنشيط نظام التسجيل.', 'أنت الآن داخل الإطار.', 'الضوء الأحمر يعني أن أحدًا يشاهد.'],
    duration: 5200,
    tone: 'danger',
    sound: 'static',
  },
  {
    id: 'event-3-shadow',
    afterQuestion: 8,
    scene: 'surveillance',
    title: 'حركة خلف الزجاج',
    lines: ['ظهر شيء خلف الزجاج المصنفر.', 'ابتعد قبل أن ترفع عينيك.', 'لن تجده الآن.'],
    duration: 5600,
    tone: 'danger',
    sound: 'footsteps',
  },
  {
    id: 'event-4-motion',
    afterQuestion: 9,
    scene: 'corridor',
    title: 'رصد حركة',
    lines: ['تم رصد حركة غير معروفة.', 'غير معروفة.', 'غير معروفة.'],
    duration: 4800,
    tone: 'cold',
    sound: 'glitch',
  },
  {
    id: 'event-5-witness',
    afterQuestion: 12,
    scene: 'door',
    title: 'شاهد إضافي',
    lines: ['تم اكتشاف شاهد إضافي.', 'عدد الشهود في الجلسة: ٢.', 'أنت أحدهم.'],
    duration: 6000,
    tone: 'danger',
    sound: 'impact',
  },
  {
    id: 'event-6-blackout',
    afterQuestion: 14,
    scene: 'door',
    title: 'انقطاع',
    lines: ['…', '…', 'لم يعد هناك صوت.'],
    duration: 6500,
    tone: 'blackout',
  },
]

/** Fires after the last question, opening the revelation sequence. */
export const FINAL_EVENT: StoryEvent = {
  id: 'event-7-revelation',
  afterQuestion: 15,
  scene: 'archive',
  title: 'بداية الانكشاف',
  lines: ['تم إغلاق جلسة الاستجواب.', 'تحويل السجل إلى الأرشيف.', 'الملف مفتوح.'],
  duration: 5000,
  tone: 'cold',
  sound: 'door-metal',
}

export const ALL_EVENTS: StoryEvent[] = [...STORY_EVENTS, FINAL_EVENT]

export const eventAfter = (questionId: number): StoryEvent | undefined =>
  ALL_EVENTS.find((e) => e.afterQuestion === questionId)

export const eventById = (id: StoryEventId): StoryEvent | undefined =>
  ALL_EVENTS.find((e) => e.id === id)

/** Optional manual evidence drops tied to events (keeps the archive alive). */
export const EVENT_EVIDENCE: Partial<Record<StoryEventId, EvidenceId>> = {
  'event-2-camera': 'camera-frame',
  'event-5-witness': 'missing-report',
}
