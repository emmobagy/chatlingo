const DIFFICULTY_LABELS: Record<string, { beginner: string; intermediate: string; advanced: string }> = {
  en: { beginner: 'Beginner',      intermediate: 'Intermediate', advanced: 'Advanced'     },
  it: { beginner: 'Principiante',  intermediate: 'Intermedio',   advanced: 'Avanzato'     },
  es: { beginner: 'Principiante',  intermediate: 'Intermedio',   advanced: 'Avanzado'     },
  fr: { beginner: 'Débutant',      intermediate: 'Intermédiaire',advanced: 'Avancé'       },
  de: { beginner: 'Anfänger',      intermediate: 'Mittelstufe',  advanced: 'Fortgeschrittene' },
  pt: { beginner: 'Iniciante',     intermediate: 'Intermediário',advanced: 'Avançado'     },
  ja: { beginner: '初級',          intermediate: '中級',         advanced: '上級'          },
  zh: { beginner: '初级',          intermediate: '中级',         advanced: '高级'          },
  ko: { beginner: '초급',          intermediate: '중급',         advanced: '고급'          },
  ru: { beginner: 'Начинающий',    intermediate: 'Средний',      advanced: 'Продвинутый'  },
  ar: { beginner: 'مبتدئ',        intermediate: 'متوسط',        advanced: 'متقدم'         },
  hi: { beginner: 'शुरुआती',      intermediate: 'मध्यम',        advanced: 'उन्नत'         },
  tr: { beginner: 'Başlangıç',     intermediate: 'Orta',         advanced: 'İleri'         },
  nl: { beginner: 'Beginner',      intermediate: 'Gemiddeld',    advanced: 'Gevorderd'    },
  pl: { beginner: 'Początkujący',  intermediate: 'Średniozaawansowany', advanced: 'Zaawansowany' },
};

export function getDifficultyLabel(difficulty: string, lang: string): string {
  const labels = DIFFICULTY_LABELS[lang] ?? DIFFICULTY_LABELS.en;
  return labels[difficulty as keyof typeof labels] ?? difficulty;
}
