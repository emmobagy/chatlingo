export type PracticeTranslation = {
  title: string;
  subtitle: string;
  dayOf: (current: number, total: number) => string;
  completed: string;
  today: string;
  locked: string;
  startToday: string;
  redo: string;
  week: (n: number) => string;
  week1: string;
  week2: string;
  week3: string;
  week4: string;
  fluencyPhase: string;
  accentPhase: string;
  completedAll: string;
  backToDashboard: string;
  min: string;
};

const en: PracticeTranslation = {
  title: 'Your 30-Day Journey',
  subtitle: 'One conversation a day. Fluent in 30 days.',
  dayOf: (c, t) => `Day ${c} of ${t}`,
  completed: 'Completed',
  today: "Today's session",
  locked: 'Locked',
  startToday: "Start today's session",
  redo: 'Practice again',
  week: (n) => `Week ${n}`,
  week1: 'Survival',
  week2: 'Daily Life',
  week3: 'Social & Professional',
  week4: 'Complex Scenarios',
  fluencyPhase: 'Fluency Phase',
  accentPhase: 'Accent & Pronunciation Phase',
  completedAll: '🎉 You completed the 30-day journey! Keep practicing to perfect your accent.',
  backToDashboard: 'Back to Dashboard',
  min: 'min',
};

const it: PracticeTranslation = {
  title: 'Il tuo percorso di 30 giorni',
  subtitle: 'Una conversazione al giorno. Fluente in 30 giorni.',
  dayOf: (c, t) => `Giorno ${c} di ${t}`,
  completed: 'Completato',
  today: 'Sessione di oggi',
  locked: 'Bloccato',
  startToday: 'Inizia la sessione di oggi',
  redo: 'Pratica di nuovo',
  week: (n) => `Settimana ${n}`,
  week1: 'Sopravvivenza',
  week2: 'Vita quotidiana',
  week3: 'Sociale & Professionale',
  week4: 'Scenari complessi',
  fluencyPhase: 'Fase Fluidità',
  accentPhase: 'Fase Accento & Pronuncia',
  completedAll: '🎉 Hai completato il percorso di 30 giorni! Continua a praticare per perfezionare il tuo accento.',
  backToDashboard: 'Torna alla Dashboard',
  min: 'min',
};

const es: PracticeTranslation = {
  title: 'Tu viaje de 30 días',
  subtitle: 'Una conversación al día. Fluido en 30 días.',
  dayOf: (c, t) => `Día ${c} de ${t}`,
  completed: 'Completado',
  today: 'Sesión de hoy',
  locked: 'Bloqueado',
  startToday: 'Empezar la sesión de hoy',
  redo: 'Practicar de nuevo',
  week: (n) => `Semana ${n}`,
  week1: 'Supervivencia',
  week2: 'Vida diaria',
  week3: 'Social y profesional',
  week4: 'Escenarios complejos',
  fluencyPhase: 'Fase de fluidez',
  accentPhase: 'Fase de acento y pronunciación',
  completedAll: '🎉 ¡Completaste el viaje de 30 días! Sigue practicando para perfeccionar tu acento.',
  backToDashboard: 'Volver al panel',
  min: 'min',
};

const fr: PracticeTranslation = {
  title: 'Ton parcours de 30 jours',
  subtitle: 'Une conversation par jour. Fluide en 30 jours.',
  dayOf: (c, t) => `Jour ${c} sur ${t}`,
  completed: 'Terminé',
  today: "Séance d'aujourd'hui",
  locked: 'Verrouillé',
  startToday: "Commencer la séance d'aujourd'hui",
  redo: 'Pratiquer à nouveau',
  week: (n) => `Semaine ${n}`,
  week1: 'Survie',
  week2: 'Vie quotidienne',
  week3: 'Social et professionnel',
  week4: 'Scénarios complexes',
  fluencyPhase: 'Phase de fluidité',
  accentPhase: 'Phase accent et prononciation',
  completedAll: '🎉 Tu as terminé le parcours de 30 jours ! Continue à pratiquer pour perfectionner ton accent.',
  backToDashboard: 'Retour au tableau de bord',
  min: 'min',
};

const de: PracticeTranslation = {
  title: 'Deine 30-Tage-Reise',
  subtitle: 'Ein Gespräch pro Tag. Fließend in 30 Tagen.',
  dayOf: (c, t) => `Tag ${c} von ${t}`,
  completed: 'Abgeschlossen',
  today: 'Heutige Sitzung',
  locked: 'Gesperrt',
  startToday: 'Heutige Sitzung starten',
  redo: 'Nochmals üben',
  week: (n) => `Woche ${n}`,
  week1: 'Überleben',
  week2: 'Alltag',
  week3: 'Sozial & Professionell',
  week4: 'Komplexe Szenarien',
  fluencyPhase: 'Flüssigkeitsphase',
  accentPhase: 'Akzent & Aussprache Phase',
  completedAll: '🎉 Du hast die 30-Tage-Reise abgeschlossen! Übe weiter, um deinen Akzent zu perfektionieren.',
  backToDashboard: 'Zurück zum Dashboard',
  min: 'Min',
};

const pt: PracticeTranslation = {
  title: 'A tua jornada de 30 dias',
  subtitle: 'Uma conversa por dia. Fluente em 30 dias.',
  dayOf: (c, t) => `Dia ${c} de ${t}`,
  completed: 'Concluído',
  today: 'Sessão de hoje',
  locked: 'Bloqueado',
  startToday: 'Iniciar sessão de hoje',
  redo: 'Praticar novamente',
  week: (n) => `Semana ${n}`,
  week1: 'Sobrevivência',
  week2: 'Vida diária',
  week3: 'Social e profissional',
  week4: 'Cenários complexos',
  fluencyPhase: 'Fase de fluência',
  accentPhase: 'Fase de sotaque e pronúncia',
  completedAll: '🎉 Concluíste a jornada de 30 dias! Continua a praticar para aperfeiçoar o teu sotaque.',
  backToDashboard: 'Voltar ao painel',
  min: 'min',
};

const ja: PracticeTranslation = {
  title: '30日間の旅',
  subtitle: '1日1会話。30日で流暢に。',
  dayOf: (c, t) => `${t}日中${c}日目`,
  completed: '完了',
  today: '今日のセッション',
  locked: 'ロック中',
  startToday: '今日のセッションを開始',
  redo: 'もう一度練習',
  week: (n) => `第${n}週`,
  week1: '生存',
  week2: '日常生活',
  week3: 'ソーシャル＆プロフェッショナル',
  week4: '複雑なシナリオ',
  fluencyPhase: '流暢さフェーズ',
  accentPhase: 'アクセント・発音フェーズ',
  completedAll: '🎉 30日間の旅を完了しました！アクセントを完璧にするために練習を続けましょう。',
  backToDashboard: 'ダッシュボードに戻る',
  min: '分',
};

const zh: PracticeTranslation = {
  title: '30天学习之旅',
  subtitle: '每天一次对话，30天流利说话。',
  dayOf: (c, t) => `第${c}天，共${t}天`,
  completed: '已完成',
  today: '今日课程',
  locked: '未解锁',
  startToday: '开始今日课程',
  redo: '再次练习',
  week: (n) => `第${n}周`,
  week1: '生存基础',
  week2: '日常生活',
  week3: '社交与职业',
  week4: '复杂场景',
  fluencyPhase: '流利度阶段',
  accentPhase: '口音与发音阶段',
  completedAll: '🎉 您已完成30天学习之旅！继续练习以完善您的口音。',
  backToDashboard: '返回仪表盘',
  min: '分钟',
};

const ko: PracticeTranslation = {
  title: '30일 여정',
  subtitle: '하루 한 번 대화. 30일 만에 유창하게.',
  dayOf: (c, t) => `${t}일 중 ${c}일째`,
  completed: '완료',
  today: '오늘의 세션',
  locked: '잠금',
  startToday: '오늘 세션 시작',
  redo: '다시 연습',
  week: (n) => `${n}주차`,
  week1: '생존',
  week2: '일상생활',
  week3: '사회 & 직업',
  week4: '복잡한 시나리오',
  fluencyPhase: '유창성 단계',
  accentPhase: '억양 & 발음 단계',
  completedAll: '🎉 30일 여정을 완료했습니다! 억양을 완벽하게 하기 위해 계속 연습하세요.',
  backToDashboard: '대시보드로 돌아가기',
  min: '분',
};

const ru: PracticeTranslation = {
  title: 'Ваше 30-дневное путешествие',
  subtitle: 'Один разговор в день. Свободное владение за 30 дней.',
  dayOf: (c, t) => `День ${c} из ${t}`,
  completed: 'Завершено',
  today: 'Сегодняшняя сессия',
  locked: 'Заблокировано',
  startToday: 'Начать сегодняшнюю сессию',
  redo: 'Практиковать снова',
  week: (n) => `Неделя ${n}`,
  week1: 'Выживание',
  week2: 'Повседневная жизнь',
  week3: 'Социальное и профессиональное',
  week4: 'Сложные сценарии',
  fluencyPhase: 'Фаза беглости',
  accentPhase: 'Фаза акцента и произношения',
  completedAll: '🎉 Вы завершили 30-дневное путешествие! Продолжайте практиковаться, чтобы усовершенствовать акцент.',
  backToDashboard: 'Вернуться на панель управления',
  min: 'мин',
};

const ar: PracticeTranslation = {
  title: 'رحلتك لـ 30 يومًا',
  subtitle: 'محادثة واحدة يوميًا. طليق خلال 30 يومًا.',
  dayOf: (c, t) => `اليوم ${c} من ${t}`,
  completed: 'مكتمل',
  today: 'جلسة اليوم',
  locked: 'مقفل',
  startToday: 'ابدأ جلسة اليوم',
  redo: 'تدرب مرة أخرى',
  week: (n) => `الأسبوع ${n}`,
  week1: 'البقاء',
  week2: 'الحياة اليومية',
  week3: 'الاجتماعي والمهني',
  week4: 'سيناريوهات معقدة',
  fluencyPhase: 'مرحلة الطلاقة',
  accentPhase: 'مرحلة اللهجة والنطق',
  completedAll: '🎉 أتممت رحلة 30 يومًا! واصل التدريب لإتقان لهجتك.',
  backToDashboard: 'العودة إلى لوحة التحكم',
  min: 'دقيقة',
};

const hi: PracticeTranslation = {
  title: 'आपका 30 दिन का सफर',
  subtitle: 'रोज़ एक बातचीत। 30 दिनों में धाराप्रवाह।',
  dayOf: (c, t) => `${t} में से दिन ${c}`,
  completed: 'पूरा हुआ',
  today: 'आज का सत्र',
  locked: 'बंद',
  startToday: 'आज का सत्र शुरू करें',
  redo: 'फिर से अभ्यास करें',
  week: (n) => `सप्ताह ${n}`,
  week1: 'जीवन रक्षा',
  week2: 'दैनिक जीवन',
  week3: 'सामाजिक और पेशेवर',
  week4: 'जटिल परिदृश्य',
  fluencyPhase: 'प्रवाह चरण',
  accentPhase: 'उच्चारण और ध्वनि चरण',
  completedAll: '🎉 आपने 30 दिन का सफर पूरा किया! उच्चारण सुधारने के लिए अभ्यास जारी रखें।',
  backToDashboard: 'डैशबोर्ड पर वापस जाएं',
  min: 'मिनट',
};

const tr: PracticeTranslation = {
  title: '30 Günlük Yolculuğun',
  subtitle: 'Günde bir konuşma. 30 günde akıcı.',
  dayOf: (c, t) => `${t} günün ${c}. günü`,
  completed: 'Tamamlandı',
  today: 'Bugünkü oturum',
  locked: 'Kilitli',
  startToday: 'Bugünkü oturumu başlat',
  redo: 'Tekrar pratik yap',
  week: (n) => `${n}. Hafta`,
  week1: 'Hayatta kalma',
  week2: 'Günlük hayat',
  week3: 'Sosyal ve profesyonel',
  week4: 'Karmaşık senaryolar',
  fluencyPhase: 'Akıcılık aşaması',
  accentPhase: 'Aksан ve telaffuz aşaması',
  completedAll: '🎉 30 günlük yolculuğu tamamladın! Aksanını mükemmelleştirmek için pratik yapmaya devam et.',
  backToDashboard: 'Panele geri dön',
  min: 'dk',
};

const nl: PracticeTranslation = {
  title: 'Jouw 30-daagse reis',
  subtitle: 'Eén gesprek per dag. Vloeiend in 30 dagen.',
  dayOf: (c, t) => `Dag ${c} van ${t}`,
  completed: 'Voltooid',
  today: 'Sessie van vandaag',
  locked: 'Vergrendeld',
  startToday: 'Start sessie van vandaag',
  redo: 'Opnieuw oefenen',
  week: (n) => `Week ${n}`,
  week1: 'Overleven',
  week2: 'Dagelijks leven',
  week3: 'Sociaal & professioneel',
  week4: 'Complexe scenario\'s',
  fluencyPhase: 'Vloeiendheid fase',
  accentPhase: 'Accent & uitspraaкfase',
  completedAll: '🎉 Je hebt de 30-daagse reis voltooid! Blijf oefenen om je accent te perfectioneren.',
  backToDashboard: 'Terug naar dashboard',
  min: 'min',
};

const pl: PracticeTranslation = {
  title: 'Twoja 30-dniowa podróż',
  subtitle: 'Jedna rozmowa dziennie. Płynnie w 30 dni.',
  dayOf: (c, t) => `Dzień ${c} z ${t}`,
  completed: 'Ukończono',
  today: 'Dzisiejsza sesja',
  locked: 'Zablokowane',
  startToday: 'Rozpocznij dzisiejszą sesję',
  redo: 'Ćwicz ponownie',
  week: (n) => `Tydzień ${n}`,
  week1: 'Przetrwanie',
  week2: 'Życie codzienne',
  week3: 'Społeczne i zawodowe',
  week4: 'Złożone scenariusze',
  fluencyPhase: 'Faza płynności',
  accentPhase: 'Faza akcentu i wymowy',
  completedAll: '🎉 Ukończyłeś 30-dniową podróż! Kontynuuj ćwiczenia, aby doskonalić swój akcent.',
  backToDashboard: 'Powrót do panelu',
  min: 'min',
};

const translations: Record<string, PracticeTranslation> = {
  en, it, es, fr, de, pt, ja, zh, ko, ru, ar, hi, tr, nl, pl,
};

export function getPracticeT(lang: string): PracticeTranslation {
  return translations[lang] ?? translations['en'];
}
