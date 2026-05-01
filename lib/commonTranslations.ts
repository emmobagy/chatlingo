export type CommonTranslation = {
  startNow: string;
  back: string;
  seeAll: string;
  today: string;
  week: string;
  minutes: string;
  days: string;
  completed: string;
  loading: string;
  // Greetings by hour
  morning: string;
  afternoon: string;
  evening: string;
  // Nav
  nav_dashboard: string;
  nav_conversation: string;
  nav_practice: string;
  nav_profile: string;
  nav_settings: string;
  nav_admin: string;
  nav_history: string;
  nav_logout: string;
  nav_theme: string;
  // TopBar
  searchPlaceholder: string;
  themeLight: string;
  themeDark: string;
  // Difficulty
  beginner: string;
  intermediate: string;
  advanced: string;
};

const translations: Record<string, CommonTranslation> = {
  en: {
    startNow: 'Start now', back: 'Back', seeAll: 'See all',
    today: 'Today', week: 'Week', minutes: 'minutes', days: 'days', completed: 'Completed', loading: 'Loading',
    morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening',
    nav_dashboard: 'Dashboard', nav_conversation: 'Conversation', nav_practice: 'Practice',
    nav_profile: 'Profile', nav_settings: 'Settings', nav_admin: 'Admin', nav_history: 'History', nav_logout: 'Log out', nav_theme: 'Theme',
    searchPlaceholder: 'Search a word…', themeLight: 'Light theme', themeDark: 'Dark theme',
    beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced',
  },
  it: {
    startNow: 'Inizia ora', back: 'Indietro', seeAll: 'Vedi tutti',
    today: 'Oggi', week: 'Settimana', minutes: 'minuti', days: 'giorni', completed: 'Completato', loading: 'Caricamento',
    morning: 'Buongiorno', afternoon: 'Buon pomeriggio', evening: 'Buonasera',
    nav_dashboard: 'Dashboard', nav_conversation: 'Conversazione', nav_practice: 'Pratica',
    nav_profile: 'Profilo', nav_settings: 'Impostazioni', nav_admin: 'Admin', nav_history: 'Cronologia', nav_logout: 'Esci', nav_theme: 'Tema',
    searchPlaceholder: 'Cerca una parola…', themeLight: 'Tema chiaro', themeDark: 'Tema scuro',
    beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzato',
  },
  es: {
    startNow: 'Empezar', back: 'Atrás', seeAll: 'Ver todos',
    today: 'Hoy', week: 'Semana', minutes: 'minutos', days: 'días', completed: 'Completado', loading: 'Cargando',
    morning: 'Buenos días', afternoon: 'Buenas tardes', evening: 'Buenas noches',
    nav_dashboard: 'Inicio', nav_conversation: 'Conversación', nav_practice: 'Práctica',
    nav_profile: 'Perfil', nav_settings: 'Ajustes', nav_admin: 'Admin', nav_history: 'Historial', nav_logout: 'Salir', nav_theme: 'Tema',
    searchPlaceholder: 'Buscar una palabra…', themeLight: 'Tema claro', themeDark: 'Tema oscuro',
    beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado',
  },
  fr: {
    startNow: 'Commencer', back: 'Retour', seeAll: 'Voir tout',
    today: 'Aujourd\'hui', week: 'Semaine', minutes: 'minutes', days: 'jours', completed: 'Terminé', loading: 'Chargement',
    morning: 'Bonjour', afternoon: 'Bon après-midi', evening: 'Bonsoir',
    nav_dashboard: 'Tableau de bord', nav_conversation: 'Conversation', nav_practice: 'Pratique',
    nav_profile: 'Profil', nav_settings: 'Paramètres', nav_admin: 'Admin', nav_history: 'Historique', nav_logout: 'Déconnexion', nav_theme: 'Thème',
    searchPlaceholder: 'Chercher un mot…', themeLight: 'Thème clair', themeDark: 'Thème sombre',
    beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé',
  },
  de: {
    startNow: 'Jetzt starten', back: 'Zurück', seeAll: 'Alle anzeigen',
    today: 'Heute', week: 'Woche', minutes: 'Minuten', days: 'Tage', completed: 'Abgeschlossen', loading: 'Laden',
    morning: 'Guten Morgen', afternoon: 'Guten Tag', evening: 'Guten Abend',
    nav_dashboard: 'Dashboard', nav_conversation: 'Gespräch', nav_practice: 'Übung',
    nav_profile: 'Profil', nav_settings: 'Einstellungen', nav_admin: 'Admin', nav_history: 'Verlauf', nav_logout: 'Abmelden', nav_theme: 'Thema',
    searchPlaceholder: 'Wort suchen…', themeLight: 'Helles Design', themeDark: 'Dunkles Design',
    beginner: 'Anfänger', intermediate: 'Mittelstufe', advanced: 'Fortgeschritten',
  },
  pt: {
    startNow: 'Começar', back: 'Voltar', seeAll: 'Ver todos',
    today: 'Hoje', week: 'Semana', minutes: 'minutos', days: 'dias', completed: 'Concluído', loading: 'Carregando',
    morning: 'Bom dia', afternoon: 'Boa tarde', evening: 'Boa noite',
    nav_dashboard: 'Painel', nav_conversation: 'Conversa', nav_practice: 'Prática',
    nav_profile: 'Perfil', nav_settings: 'Configurações', nav_admin: 'Admin', nav_history: 'Histórico', nav_logout: 'Sair', nav_theme: 'Tema',
    searchPlaceholder: 'Pesquisar palavra…', themeLight: 'Tema claro', themeDark: 'Tema escuro',
    beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado',
  },
  ja: {
    startNow: '今すぐ始める', back: '戻る', seeAll: 'すべて見る',
    today: '今日', week: '今週', minutes: '分', days: '日', completed: '完了', loading: '読み込み中',
    morning: 'おはようございます', afternoon: 'こんにちは', evening: 'こんばんは',
    nav_dashboard: 'ダッシュボード', nav_conversation: '会話', nav_practice: '練習',
    nav_profile: 'プロフィール', nav_settings: '設定', nav_admin: '管理', nav_history: '履歴', nav_logout: 'ログアウト', nav_theme: 'テーマ',
    searchPlaceholder: '単語を検索…', themeLight: 'ライトテーマ', themeDark: 'ダークテーマ',
    beginner: '初級', intermediate: '中級', advanced: '上級',
  },
  zh: {
    startNow: '立即开始', back: '返回', seeAll: '查看全部',
    today: '今天', week: '本周', minutes: '分钟', days: '天', completed: '已完成', loading: '加载中',
    morning: '早上好', afternoon: '下午好', evening: '晚上好',
    nav_dashboard: '仪表板', nav_conversation: '对话', nav_practice: '练习',
    nav_profile: '个人资料', nav_settings: '设置', nav_admin: '管理', nav_history: '历史', nav_logout: '退出', nav_theme: '主题',
    searchPlaceholder: '搜索单词…', themeLight: '浅色主题', themeDark: '深色主题',
    beginner: '初级', intermediate: '中级', advanced: '高级',
  },
  ko: {
    startNow: '지금 시작', back: '뒤로', seeAll: '모두 보기',
    today: '오늘', week: '이번 주', minutes: '분', days: '일', completed: '완료', loading: '로딩 중',
    morning: '좋은 아침', afternoon: '안녕하세요', evening: '좋은 저녁',
    nav_dashboard: '대시보드', nav_conversation: '대화', nav_practice: '연습',
    nav_profile: '프로필', nav_settings: '설정', nav_admin: '관리', nav_history: '기록', nav_logout: '로그아웃', nav_theme: '테마',
    searchPlaceholder: '단어 검색…', themeLight: '라이트 테마', themeDark: '다크 테마',
    beginner: '초급', intermediate: '중급', advanced: '고급',
  },
  ru: {
    startNow: 'Начать', back: 'Назад', seeAll: 'Смотреть все',
    today: 'Сегодня', week: 'Неделя', minutes: 'минут', days: 'дней', completed: 'Завершено', loading: 'Загрузка',
    morning: 'Доброе утро', afternoon: 'Добрый день', evening: 'Добрый вечер',
    nav_dashboard: 'Главная', nav_conversation: 'Разговор', nav_practice: 'Практика',
    nav_profile: 'Профиль', nav_settings: 'Настройки', nav_admin: 'Админ', nav_history: 'История', nav_logout: 'Выйти', nav_theme: 'Тема',
    searchPlaceholder: 'Найти слово…', themeLight: 'Светлая тема', themeDark: 'Тёмная тема',
    beginner: 'Начинающий', intermediate: 'Средний', advanced: 'Продвинутый',
  },
  ar: {
    startNow: 'ابدأ الآن', back: 'رجوع', seeAll: 'عرض الكل',
    today: 'اليوم', week: 'الأسبوع', minutes: 'دقائق', days: 'أيام', completed: 'مكتمل', loading: 'جارٍ التحميل',
    morning: 'صباح الخير', afternoon: 'مساء الخير', evening: 'مساء النور',
    nav_dashboard: 'لوحة التحكم', nav_conversation: 'محادثة', nav_practice: 'تدريب',
    nav_profile: 'الملف الشخصي', nav_settings: 'الإعدادات', nav_admin: 'إدارة', nav_history: 'السجل', nav_logout: 'تسجيل الخروج', nav_theme: 'المظهر',
    searchPlaceholder: 'ابحث عن كلمة…', themeLight: 'المظهر الفاتح', themeDark: 'المظهر الداكن',
    beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم',
  },
  hi: {
    startNow: 'अभी शुरू करें', back: 'वापस', seeAll: 'सभी देखें',
    today: 'आज', week: 'सप्ताह', minutes: 'मिनट', days: 'दिन', completed: 'पूर्ण', loading: 'लोड हो रहा है',
    morning: 'सुप्रभात', afternoon: 'नमस्ते', evening: 'शुभ संध्या',
    nav_dashboard: 'डैशबोर्ड', nav_conversation: 'बातचीत', nav_practice: 'अभ्यास',
    nav_profile: 'प्रोफ़ाइल', nav_settings: 'सेटिंग्स', nav_admin: 'एडमिन', nav_history: 'इतिहास', nav_logout: 'लॉग आउट', nav_theme: 'थीम',
    searchPlaceholder: 'शब्द खोजें…', themeLight: 'लाइट थीम', themeDark: 'डार्क थीम',
    beginner: 'शुरुआती', intermediate: 'मध्यम', advanced: 'उन्नत',
  },
  tr: {
    startNow: 'Şimdi başla', back: 'Geri', seeAll: 'Tümünü gör',
    today: 'Bugün', week: 'Hafta', minutes: 'dakika', days: 'gün', completed: 'Tamamlandı', loading: 'Yükleniyor',
    morning: 'Günaydın', afternoon: 'İyi günler', evening: 'İyi akşamlar',
    nav_dashboard: 'Panel', nav_conversation: 'Konuşma', nav_practice: 'Pratik',
    nav_profile: 'Profil', nav_settings: 'Ayarlar', nav_admin: 'Yönetici', nav_history: 'Geçmiş', nav_logout: 'Çıkış', nav_theme: 'Tema',
    searchPlaceholder: 'Kelime ara…', themeLight: 'Açık tema', themeDark: 'Koyu tema',
    beginner: 'Başlangıç', intermediate: 'Orta', advanced: 'İleri',
  },
  nl: {
    startNow: 'Nu starten', back: 'Terug', seeAll: 'Alles zien',
    today: 'Vandaag', week: 'Week', minutes: 'minuten', days: 'dagen', completed: 'Voltooid', loading: 'Laden',
    morning: 'Goedemorgen', afternoon: 'Goedemiddag', evening: 'Goedenavond',
    nav_dashboard: 'Dashboard', nav_conversation: 'Gesprek', nav_practice: 'Oefening',
    nav_profile: 'Profiel', nav_settings: 'Instellingen', nav_admin: 'Beheer', nav_history: 'Geschiedenis', nav_logout: 'Uitloggen', nav_theme: 'Thema',
    searchPlaceholder: 'Woord zoeken…', themeLight: 'Licht thema', themeDark: 'Donker thema',
    beginner: 'Beginner', intermediate: 'Gemiddeld', advanced: 'Gevorderd',
  },
  pl: {
    startNow: 'Zacznij teraz', back: 'Wstecz', seeAll: 'Zobacz wszystkie',
    today: 'Dziś', week: 'Tydzień', minutes: 'minut', days: 'dni', completed: 'Ukończono', loading: 'Ładowanie',
    morning: 'Dzień dobry', afternoon: 'Dzień dobry', evening: 'Dobry wieczór',
    nav_dashboard: 'Panel', nav_conversation: 'Rozmowa', nav_practice: 'Ćwiczenia',
    nav_profile: 'Profil', nav_settings: 'Ustawienia', nav_admin: 'Admin', nav_history: 'Historia', nav_logout: 'Wyloguj', nav_theme: 'Motyw',
    searchPlaceholder: 'Szukaj słowa…', themeLight: 'Jasny motyw', themeDark: 'Ciemny motyw',
    beginner: 'Początkujący', intermediate: 'Średniozaawansowany', advanced: 'Zaawansowany',
  },
};

export function getCommonT(lang: string): CommonTranslation {
  return translations[lang] ?? translations.en;
}
