export type HomeTranslation = {
  nav_features: string;
  nav_pricing: string;
  nav_login: string;
  nav_cta: string;

  hero_badge: string;
  hero_h1_prefix: string;
  hero_h1_accent: string;
  hero_h1_suffix: string;
  hero_sub: string;
  hero_cta: string;
  hero_nocredit: string;
  hero_learners: string;
  hero_languages: string;
  hero_rating: string;

  features_title: string;
  features_sub: string;
  features: { title: string; desc: string }[];

  pricing_title: string;
  pricing_sub: string;
  pricing_month: string;
  pricing_popular: string;
  pricing_cta: string;
  pricing_starter_features: string[];
  pricing_pro_features: string[];
  pricing_ultra_features: string[];

  cta_title: string;
  cta_sub: string;
  cta_btn: string;

  footer_rights: string;
  footer_privacy: string;
  footer_terms: string;
  footer_support: string;
};

const en: HomeTranslation = {
  nav_features: 'Features',
  nav_pricing: 'Pricing',
  nav_login: 'Log in',
  nav_cta: 'Start free trial',

  hero_badge: 'Speaking-first approach · Real conversations from day 1',
  hero_h1_prefix: 'Learn to',
  hero_h1_accent: 'actually speak',
  hero_h1_suffix: 'a new language',
  hero_sub: 'Practice real conversations with your AI tutor. No more random vocabulary or grammar drills — just natural speaking practice that works.',
  hero_cta: 'Try free conversation',
  hero_nocredit: 'No credit card required',
  hero_learners: 'Learners',
  hero_languages: 'Languages',
  hero_rating: 'Rating',

  features_title: 'The way language learning should be',
  features_sub: 'We built ChatLingo after getting frustrated with apps that never taught us to actually speak.',
  features: [
    { title: 'Voice conversations', desc: 'Speak directly with your tutor using your microphone. Real-time response, just like talking to a native speaker.' },
    { title: 'Gentle corrections', desc: '"Native speakers say..." — your tutor corrects naturally, like a friend, never like an angry teacher.' },
    { title: 'Track your progress', desc: 'Daily streaks, conversation stats, and level tracking to keep you motivated and on track.' },
    { title: 'Transparent pricing', desc: 'One price, everything included. No hidden tiers, no surprise charges, no dark patterns.' },
    { title: 'Real-world scenarios', desc: 'Restaurant, hotel, job interview — not "the purple elephant". Vocabulary that actually matters.' },
    { title: 'AI level assessment', desc: 'Your first free conversation assesses your CEFR level and creates a personalized learning plan.' },
  ],

  pricing_title: 'Simple, honest pricing',
  pricing_sub: 'No tricks. One price = everything included for that tier.',
  pricing_month: '/month',
  pricing_popular: 'MOST POPULAR',
  pricing_cta: 'Get started',
  pricing_starter_features: ['15 conversations/day', 'Gemini AI tutor', 'Basic corrections', 'Progress tracking'],
  pricing_pro_features: ['Unlimited conversations', 'GPT-4 AI tutor', 'Advanced corrections', 'Progress tracking', '10 scenario images/week'],
  pricing_ultra_features: ['Everything in Pro', 'Ultra-realistic voice', 'Video avatar', 'Unlimited images', 'Priority support'],

  cta_title: 'Start speaking today',
  cta_sub: 'One free conversation. No credit card. No tricks.',
  cta_btn: 'Try free now',

  footer_rights: '© 2025 ChatLingo. All rights reserved.',
  footer_privacy: 'Privacy',
  footer_terms: 'Terms',
  footer_support: 'Support',
};

const it: HomeTranslation = {
  nav_features: 'Funzionalità',
  nav_pricing: 'Prezzi',
  nav_login: 'Accedi',
  nav_cta: 'Inizia gratis',

  hero_badge: 'Approccio speaking-first · Conversazioni reali dal giorno 1',
  hero_h1_prefix: 'Impara a',
  hero_h1_accent: 'parlare davvero',
  hero_h1_suffix: 'una nuova lingua',
  hero_sub: 'Pratica conversazioni reali con il tuo tutor AI. Basta con esercizi di vocabolario e grammatica — solo pratica di conversazione naturale che funziona.',
  hero_cta: 'Prova una conversazione gratis',
  hero_nocredit: 'Nessuna carta di credito richiesta',
  hero_learners: 'Studenti',
  hero_languages: 'Lingue',
  hero_rating: 'Valutazione',

  features_title: 'Come dovrebbe essere l\'apprendimento delle lingue',
  features_sub: 'Abbiamo creato ChatLingo dopo esserci frustrati con app che non ci insegnavano mai a parlare davvero.',
  features: [
    { title: 'Conversazioni vocali', desc: 'Parla direttamente con il tuo tutor usando il microfono. Risposta in tempo reale, come parlare con un madrelingua.' },
    { title: 'Correzioni gentili', desc: '"I madrelingua dicono..." — il tuo tutor corregge naturalmente, come un amico, mai come un insegnante arrabbiato.' },
    { title: 'Traccia i tuoi progressi', desc: 'Streak giornalieri, statistiche sulle conversazioni e monitoraggio del livello per mantenerti motivato.' },
    { title: 'Prezzi trasparenti', desc: 'Un prezzo, tutto incluso. Nessun livello nascosto, nessuna sorpresa, nessun trucco.' },
    { title: 'Scenari del mondo reale', desc: 'Ristorante, hotel, colloquio di lavoro — non "l\'elefante viola". Vocabolario che conta davvero.' },
    { title: 'Valutazione del livello AI', desc: 'La tua prima conversazione gratuita valuta il tuo livello CEFR e crea un piano di apprendimento personalizzato.' },
  ],

  pricing_title: 'Prezzi semplici e onesti',
  pricing_sub: 'Nessun trucco. Un prezzo = tutto incluso per quel livello.',
  pricing_month: '/mese',
  pricing_popular: 'PIÙ POPOLARE',
  pricing_cta: 'Inizia ora',
  pricing_starter_features: ['15 conversazioni/giorno', 'Tutor AI Gemini', 'Correzioni di base', 'Tracciamento progressi'],
  pricing_pro_features: ['Conversazioni illimitate', 'Tutor AI GPT-4', 'Correzioni avanzate', 'Tracciamento progressi', '10 immagini scenari/settimana'],
  pricing_ultra_features: ['Tutto di Pro', 'Voce ultra-realistica', 'Avatar video', 'Immagini illimitate', 'Supporto prioritario'],

  cta_title: 'Inizia a parlare oggi',
  cta_sub: 'Una conversazione gratuita. Nessuna carta di credito. Nessun trucco.',
  cta_btn: 'Prova gratis ora',

  footer_rights: '© 2025 ChatLingo. Tutti i diritti riservati.',
  footer_privacy: 'Privacy',
  footer_terms: 'Termini',
  footer_support: 'Supporto',
};

const es: HomeTranslation = {
  nav_features: 'Funciones',
  nav_pricing: 'Precios',
  nav_login: 'Iniciar sesión',
  nav_cta: 'Prueba gratis',

  hero_badge: 'Enfoque en el habla · Conversaciones reales desde el día 1',
  hero_h1_prefix: 'Aprende a',
  hero_h1_accent: 'hablar de verdad',
  hero_h1_suffix: 'un nuevo idioma',
  hero_sub: 'Practica conversaciones reales con tu tutor de IA. Sin más ejercicios de vocabulario o gramática — solo práctica de conversación natural que funciona.',
  hero_cta: 'Prueba una conversación gratis',
  hero_nocredit: 'No se requiere tarjeta de crédito',
  hero_learners: 'Estudiantes',
  hero_languages: 'Idiomas',
  hero_rating: 'Valoración',

  features_title: 'Así debería ser el aprendizaje de idiomas',
  features_sub: 'Creamos ChatLingo tras frustrarnos con apps que nunca nos enseñaron a hablar de verdad.',
  features: [
    { title: 'Conversaciones de voz', desc: 'Habla directamente con tu tutor usando el micrófono. Respuesta en tiempo real, como hablar con un hablante nativo.' },
    { title: 'Correcciones amables', desc: '"Los hablantes nativos dicen..." — tu tutor corrige de forma natural, como un amigo, nunca como un maestro enojado.' },
    { title: 'Sigue tu progreso', desc: 'Rachas diarias, estadísticas de conversaciones y seguimiento de nivel para mantenerte motivado.' },
    { title: 'Precios transparentes', desc: 'Un precio, todo incluido. Sin niveles ocultos, sin cargos sorpresa, sin trucos.' },
    { title: 'Escenarios del mundo real', desc: 'Restaurante, hotel, entrevista de trabajo — no "el elefante morado". Vocabulario que realmente importa.' },
    { title: 'Evaluación de nivel IA', desc: 'Tu primera conversación gratuita evalúa tu nivel MCER y crea un plan de aprendizaje personalizado.' },
  ],

  pricing_title: 'Precios simples y honestos',
  pricing_sub: 'Sin trucos. Un precio = todo incluido para ese nivel.',
  pricing_month: '/mes',
  pricing_popular: 'MÁS POPULAR',
  pricing_cta: 'Empezar',
  pricing_starter_features: ['15 conversaciones/día', 'Tutor IA Gemini', 'Correcciones básicas', 'Seguimiento de progreso'],
  pricing_pro_features: ['Conversaciones ilimitadas', 'Tutor IA GPT-4', 'Correcciones avanzadas', 'Seguimiento de progreso', '10 imágenes de escenarios/semana'],
  pricing_ultra_features: ['Todo en Pro', 'Voz ultra-realista', 'Avatar de video', 'Imágenes ilimitadas', 'Soporte prioritario'],

  cta_title: 'Empieza a hablar hoy',
  cta_sub: 'Una conversación gratis. Sin tarjeta de crédito. Sin trucos.',
  cta_btn: 'Prueba gratis ahora',

  footer_rights: '© 2025 ChatLingo. Todos los derechos reservados.',
  footer_privacy: 'Privacidad',
  footer_terms: 'Términos',
  footer_support: 'Soporte',
};

const fr: HomeTranslation = {
  nav_features: 'Fonctionnalités',
  nav_pricing: 'Tarifs',
  nav_login: 'Connexion',
  nav_cta: 'Essai gratuit',

  hero_badge: 'Approche speaking-first · Vraies conversations dès le jour 1',
  hero_h1_prefix: 'Apprenez à',
  hero_h1_accent: 'vraiment parler',
  hero_h1_suffix: 'une nouvelle langue',
  hero_sub: 'Pratiquez de vraies conversations avec votre tuteur IA. Fini les exercices de vocabulaire et de grammaire — juste une pratique naturelle qui fonctionne.',
  hero_cta: 'Essayez une conversation gratuite',
  hero_nocredit: 'Aucune carte de crédit requise',
  hero_learners: 'Apprenants',
  hero_languages: 'Langues',
  hero_rating: 'Note',

  features_title: 'Voilà comment l\'apprentissage des langues devrait être',
  features_sub: 'Nous avons créé ChatLingo après nous être frustrés avec des applications qui ne nous apprenaient jamais à vraiment parler.',
  features: [
    { title: 'Conversations vocales', desc: 'Parlez directement avec votre tuteur grâce à votre micro. Réponse en temps réel, comme parler à un locuteur natif.' },
    { title: 'Corrections douces', desc: '"Les locuteurs natifs disent..." — votre tuteur corrige naturellement, comme un ami, jamais comme un professeur en colère.' },
    { title: 'Suivez vos progrès', desc: 'Séries quotidiennes, statistiques de conversations et suivi de niveau pour rester motivé.' },
    { title: 'Tarification transparente', desc: 'Un prix, tout inclus. Aucun niveau caché, aucune surprise, aucun piège.' },
    { title: 'Scénarios du monde réel', desc: 'Restaurant, hôtel, entretien d\'embauche — pas "l\'éléphant violet". Vocabulaire qui compte vraiment.' },
    { title: 'Évaluation de niveau IA', desc: 'Votre première conversation gratuite évalue votre niveau CECRL et crée un plan d\'apprentissage personnalisé.' },
  ],

  pricing_title: 'Tarification simple et honnête',
  pricing_sub: 'Pas de piège. Un prix = tout inclus pour ce niveau.',
  pricing_month: '/mois',
  pricing_popular: 'LE PLUS POPULAIRE',
  pricing_cta: 'Commencer',
  pricing_starter_features: ['15 conversations/jour', 'Tuteur IA Gemini', 'Corrections de base', 'Suivi des progrès'],
  pricing_pro_features: ['Conversations illimitées', 'Tuteur IA GPT-4', 'Corrections avancées', 'Suivi des progrès', '10 images de scénarios/semaine'],
  pricing_ultra_features: ['Tout dans Pro', 'Voix ultra-réaliste', 'Avatar vidéo', 'Images illimitées', 'Support prioritaire'],

  cta_title: 'Commencez à parler aujourd\'hui',
  cta_sub: 'Une conversation gratuite. Pas de carte de crédit. Pas de piège.',
  cta_btn: 'Essayez gratuitement',

  footer_rights: '© 2025 ChatLingo. Tous droits réservés.',
  footer_privacy: 'Confidentialité',
  footer_terms: 'Conditions',
  footer_support: 'Support',
};

const de: HomeTranslation = {
  nav_features: 'Funktionen',
  nav_pricing: 'Preise',
  nav_login: 'Anmelden',
  nav_cta: 'Kostenlos starten',

  hero_badge: 'Speaking-first Ansatz · Echte Gespräche ab Tag 1',
  hero_h1_prefix: 'Lerne',
  hero_h1_accent: 'wirklich zu sprechen',
  hero_h1_suffix: 'in einer neuen Sprache',
  hero_sub: 'Übe echte Gespräche mit deinem KI-Tutor. Keine zufälligen Vokabel- oder Grammatikübungen mehr — nur natürliche Sprechpraxis, die funktioniert.',
  hero_cta: 'Kostenloses Gespräch ausprobieren',
  hero_nocredit: 'Keine Kreditkarte erforderlich',
  hero_learners: 'Lernende',
  hero_languages: 'Sprachen',
  hero_rating: 'Bewertung',

  features_title: 'So sollte Sprachenlernen sein',
  features_sub: 'Wir haben ChatLingo entwickelt, nachdem wir von Apps frustriert waren, die uns nie wirklich das Sprechen beibrachten.',
  features: [
    { title: 'Sprachgespräche', desc: 'Sprich direkt mit deinem Tutor über dein Mikrofon. Echtzeit-Antwort, wie ein Gespräch mit einem Muttersprachler.' },
    { title: 'Sanfte Korrekturen', desc: '"Muttersprachler sagen..." — dein Tutor korrigiert natürlich, wie ein Freund, nie wie ein wütender Lehrer.' },
    { title: 'Verfolge deinen Fortschritt', desc: 'Tägliche Serien, Gesprächsstatistiken und Niveau-Tracking, um dich motiviert zu halten.' },
    { title: 'Transparente Preise', desc: 'Ein Preis, alles inklusive. Keine versteckten Stufen, keine Überraschungsgebühren, keine dunklen Muster.' },
    { title: 'Reale Szenarien', desc: 'Restaurant, Hotel, Vorstellungsgespräch — nicht "der lila Elefant". Vokabular, das wirklich wichtig ist.' },
    { title: 'KI-Niveaueinschätzung', desc: 'Dein erstes kostenloses Gespräch bewertet dein GER-Niveau und erstellt einen personalisierten Lernplan.' },
  ],

  pricing_title: 'Einfache, ehrliche Preise',
  pricing_sub: 'Keine Tricks. Ein Preis = alles inklusive für diese Stufe.',
  pricing_month: '/Monat',
  pricing_popular: 'AM BELIEBTESTEN',
  pricing_cta: 'Jetzt starten',
  pricing_starter_features: ['15 Gespräche/Tag', 'Gemini KI-Tutor', 'Grundlegende Korrekturen', 'Fortschrittsverfolgung'],
  pricing_pro_features: ['Unbegrenzte Gespräche', 'GPT-4 KI-Tutor', 'Erweiterte Korrekturen', 'Fortschrittsverfolgung', '10 Szenariobilder/Woche'],
  pricing_ultra_features: ['Alles in Pro', 'Ultra-realistische Stimme', 'Video-Avatar', 'Unbegrenzte Bilder', 'Prioritätssupport'],

  cta_title: 'Fang heute an zu sprechen',
  cta_sub: 'Ein kostenloses Gespräch. Keine Kreditkarte. Keine Tricks.',
  cta_btn: 'Jetzt kostenlos ausprobieren',

  footer_rights: '© 2025 ChatLingo. Alle Rechte vorbehalten.',
  footer_privacy: 'Datenschutz',
  footer_terms: 'Nutzungsbedingungen',
  footer_support: 'Support',
};

const pt: HomeTranslation = {
  nav_features: 'Recursos',
  nav_pricing: 'Preços',
  nav_login: 'Entrar',
  nav_cta: 'Começar grátis',

  hero_badge: 'Abordagem speaking-first · Conversas reais desde o dia 1',
  hero_h1_prefix: 'Aprenda a',
  hero_h1_accent: 'realmente falar',
  hero_h1_suffix: 'um novo idioma',
  hero_sub: 'Pratique conversas reais com seu tutor de IA. Chega de exercícios aleatórios de vocabulário ou gramática — apenas prática de conversação natural que funciona.',
  hero_cta: 'Experimente uma conversa grátis',
  hero_nocredit: 'Não é necessário cartão de crédito',
  hero_learners: 'Alunos',
  hero_languages: 'Idiomas',
  hero_rating: 'Avaliação',

  features_title: 'Como o aprendizado de idiomas deveria ser',
  features_sub: 'Criamos o ChatLingo após ficarmos frustrados com aplicativos que nunca nos ensinaram a realmente falar.',
  features: [
    { title: 'Conversas por voz', desc: 'Fale diretamente com seu tutor usando o microfone. Resposta em tempo real, como falar com um falante nativo.' },
    { title: 'Correções gentis', desc: '"Falantes nativos dizem..." — seu tutor corrige naturalmente, como um amigo, nunca como um professor irritado.' },
    { title: 'Acompanhe seu progresso', desc: 'Sequências diárias, estatísticas de conversas e rastreamento de nível para mantê-lo motivado.' },
    { title: 'Preços transparentes', desc: 'Um preço, tudo incluído. Sem níveis ocultos, sem cobranças surpresa, sem truques.' },
    { title: 'Cenários do mundo real', desc: 'Restaurante, hotel, entrevista de emprego — não "o elefante roxo". Vocabulário que realmente importa.' },
    { title: 'Avaliação de nível por IA', desc: 'Sua primeira conversa gratuita avalia seu nível QECR e cria um plano de aprendizado personalizado.' },
  ],

  pricing_title: 'Preços simples e honestos',
  pricing_sub: 'Sem truques. Um preço = tudo incluído para aquele nível.',
  pricing_month: '/mês',
  pricing_popular: 'MAIS POPULAR',
  pricing_cta: 'Começar',
  pricing_starter_features: ['15 conversas/dia', 'Tutor IA Gemini', 'Correções básicas', 'Rastreamento de progresso'],
  pricing_pro_features: ['Conversas ilimitadas', 'Tutor IA GPT-4', 'Correções avançadas', 'Rastreamento de progresso', '10 imagens de cenários/semana'],
  pricing_ultra_features: ['Tudo no Pro', 'Voz ultra-realista', 'Avatar de vídeo', 'Imagens ilimitadas', 'Suporte prioritário'],

  cta_title: 'Comece a falar hoje',
  cta_sub: 'Uma conversa gratuita. Sem cartão de crédito. Sem truques.',
  cta_btn: 'Experimente grátis agora',

  footer_rights: '© 2025 ChatLingo. Todos os direitos reservados.',
  footer_privacy: 'Privacidade',
  footer_terms: 'Termos',
  footer_support: 'Suporte',
};

const ja: HomeTranslation = {
  nav_features: '機能', nav_pricing: '料金', nav_login: 'ログイン', nav_cta: '無料で始める',
  hero_badge: 'スピーキング重視・初日からリアルな会話',
  hero_h1_prefix: '本当に', hero_h1_accent: '話せる', hero_h1_suffix: '外国語を身につけよう',
  hero_sub: 'AIチューターとリアルな会話を練習しましょう。単語帳や文法ドリルはもういらない。自然な会話練習で確実に上達。',
  hero_cta: '無料会話を試す', hero_nocredit: 'クレジットカード不要',
  hero_learners: '学習者', hero_languages: '言語', hero_rating: '評価',
  features_title: '語学学習はこうあるべき',
  features_sub: '本当に話せるようにならないアプリに不満を感じてChatLingoを作りました。',
  features: [
    { title: '音声会話', desc: 'マイクを使ってチューターと直接話せます。ネイティブと話すようなリアルタイム応答。' },
    { title: '優しい添削', desc: '「ネイティブはこう言います…」自然な形で友達のように添削。怒った先生ではありません。' },
    { title: '進歩を記録', desc: '毎日のストリーク、会話統計、レベル管理でモチベーションを維持。' },
    { title: '透明な料金', desc: '一つの価格、すべて込み。隠れた階層なし、サプライズ料金なし。' },
    { title: '実践シナリオ', desc: 'レストラン、ホテル、面接など実際の場面。本当に必要な語彙を学べます。' },
    { title: 'AIレベル判定', desc: '最初の無料会話でCEFRレベルを測定し、個別学習プランを作成します。' },
  ],
  pricing_title: 'シンプルで正直な料金', pricing_sub: 'トリックなし。一つの価格 = そのプランのすべてが込み。',
  pricing_month: '/月', pricing_popular: '最も人気', pricing_cta: '始める',
  pricing_starter_features: ['15回会話/日', 'Gemini AIチューター', '基本添削', '進捗管理'],
  pricing_pro_features: ['無制限会話', 'GPT-4 AIチューター', '高度な添削', '進捗管理', 'シナリオ画像10枚/週'],
  pricing_ultra_features: ['Proのすべて', '超リアルな音声', 'ビデオアバター', '無制限画像', '優先サポート'],
  cta_title: '今日から話し始めよう', cta_sub: '無料会話一回。クレジットカード不要。', cta_btn: '今すぐ無料で試す',
  footer_rights: '© 2025 ChatLingo. 全著作権所有。', footer_privacy: 'プライバシー', footer_terms: '利用規約', footer_support: 'サポート',
};

const zh: HomeTranslation = {
  nav_features: '功能', nav_pricing: '价格', nav_login: '登录', nav_cta: '免费开始',
  hero_badge: '口语优先 · 第一天就开始真实对话',
  hero_h1_prefix: '学会', hero_h1_accent: '真正开口说', hero_h1_suffix: '一门新语言',
  hero_sub: '与AI导师进行真实对话练习。告别随机单词和语法练习，只需自然对话即可见效。',
  hero_cta: '免费试一次对话', hero_nocredit: '无需信用卡',
  hero_learners: '学习者', hero_languages: '语言', hero_rating: '评分',
  features_title: '语言学习本该如此',
  features_sub: '我们对那些从未真正教会我们开口说话的应用感到沮丧，于是创建了ChatLingo。',
  features: [
    { title: '语音对话', desc: '用麦克风直接与导师交流，实时响应，就像和母语者交谈。' },
    { title: '温和纠正', desc: '「母语者会说…」导师自然地纠正，像朋友一样，而非严厉的老师。' },
    { title: '追踪进度', desc: '每日连续记录、对话统计和级别跟踪，保持学习动力。' },
    { title: '透明定价', desc: '一个价格，全部包含。没有隐藏层级，没有意外收费。' },
    { title: '真实场景', desc: '餐厅、酒店、面试——而非"紫色大象"。真正有用的词汇。' },
    { title: 'AI水平测评', desc: '第一次免费对话评估你的CEFR水平，创建个性化学习计划。' },
  ],
  pricing_title: '简单透明的定价', pricing_sub: '没有套路。一个价格 = 该档次的全部功能。',
  pricing_month: '/月', pricing_popular: '最受欢迎', pricing_cta: '开始',
  pricing_starter_features: ['每天15次对话', 'Gemini AI导师', '基础纠正', '进度追踪'],
  pricing_pro_features: ['无限对话', 'GPT-4 AI导师', '高级纠正', '进度追踪', '每周10张场景图片'],
  pricing_ultra_features: ['Pro的所有功能', '超真实语音', '视频头像', '无限图片', '优先支持'],
  cta_title: '今天就开始说话', cta_sub: '一次免费对话。无需信用卡。没有套路。', cta_btn: '立即免费试用',
  footer_rights: '© 2025 ChatLingo. 版权所有。', footer_privacy: '隐私', footer_terms: '条款', footer_support: '支持',
};

const ko: HomeTranslation = {
  nav_features: '기능', nav_pricing: '요금', nav_login: '로그인', nav_cta: '무료로 시작',
  hero_badge: '말하기 우선 · 첫날부터 실제 대화',
  hero_h1_prefix: '진짜로', hero_h1_accent: '말할 수 있는', hero_h1_suffix: '새 언어를 배우세요',
  hero_sub: 'AI 튜터와 실제 대화를 연습하세요. 단어장과 문법 드릴은 이제 그만 — 자연스러운 대화 연습으로 실력을 키우세요.',
  hero_cta: '무료 대화 체험하기', hero_nocredit: '신용카드 불필요',
  hero_learners: '학습자', hero_languages: '언어', hero_rating: '평점',
  features_title: '언어 학습은 이래야 합니다',
  features_sub: '실제로 말하는 법을 가르쳐주지 않는 앱에 지쳐 ChatLingo를 만들었습니다.',
  features: [
    { title: '음성 대화', desc: '마이크로 튜터와 직접 대화하세요. 원어민과 대화하는 것 같은 실시간 응답.' },
    { title: '친절한 교정', desc: '"원어민은 이렇게 말해요…" — 친구처럼 자연스럽게 교정, 화난 선생님처럼이 아닌.' },
    { title: '진도 추적', desc: '일일 연속 기록, 대화 통계, 레벨 추적으로 동기 부여를 유지하세요.' },
    { title: '투명한 요금', desc: '한 가지 가격, 모든 것 포함. 숨겨진 등급 없음, 갑작스러운 요금 없음.' },
    { title: '실제 상황', desc: '식당, 호텔, 취업 면접 — "보라색 코끼리"가 아닙니다. 실제로 중요한 어휘.' },
    { title: 'AI 레벨 평가', desc: '첫 무료 대화로 CEFR 레벨을 평가하고 맞춤 학습 계획을 만들어줍니다.' },
  ],
  pricing_title: '간단하고 정직한 요금', pricing_sub: '속임수 없음. 한 가격 = 해당 등급의 모든 것 포함.',
  pricing_month: '/월', pricing_popular: '가장 인기', pricing_cta: '시작하기',
  pricing_starter_features: ['하루 15회 대화', 'Gemini AI 튜터', '기본 교정', '진도 추적'],
  pricing_pro_features: ['무제한 대화', 'GPT-4 AI 튜터', '고급 교정', '진도 추적', '주 10개 시나리오 이미지'],
  pricing_ultra_features: ['Pro의 모든 것', '초현실적 음성', '비디오 아바타', '무제한 이미지', '우선 지원'],
  cta_title: '오늘부터 말하기 시작하세요', cta_sub: '무료 대화 한 번. 신용카드 불필요. 속임수 없음.', cta_btn: '지금 무료로 시작',
  footer_rights: '© 2025 ChatLingo. 모든 권리 보유.', footer_privacy: '개인정보', footer_terms: '이용약관', footer_support: '지원',
};

const ru: HomeTranslation = {
  nav_features: 'Функции', nav_pricing: 'Цены', nav_login: 'Войти', nav_cta: 'Начать бесплатно',
  hero_badge: 'Приоритет разговора · Реальные беседы с первого дня',
  hero_h1_prefix: 'Научитесь', hero_h1_accent: 'по-настоящему говорить', hero_h1_suffix: 'на новом языке',
  hero_sub: 'Практикуйте реальные разговоры с вашим ИИ-репетитором. Никаких случайных упражнений — только естественная разговорная практика, которая работает.',
  hero_cta: 'Попробовать бесплатно', hero_nocredit: 'Без кредитной карты',
  hero_learners: 'Учеников', hero_languages: 'Языков', hero_rating: 'Оценка',
  features_title: 'Вот как должно выглядеть изучение языков',
  features_sub: 'Мы создали ChatLingo, разочаровавшись в приложениях, которые так и не научили нас говорить.',
  features: [
    { title: 'Голосовые разговоры', desc: 'Говорите напрямую с репетитором через микрофон. Ответ в реальном времени, как с носителем языка.' },
    { title: 'Мягкие исправления', desc: '«Носители языка говорят...» — репетитор исправляет естественно, как друг, а не как сердитый учитель.' },
    { title: 'Отслеживайте прогресс', desc: 'Ежедневные серии, статистика разговоров и отслеживание уровня для мотивации.' },
    { title: 'Прозрачные цены', desc: 'Одна цена — всё включено. Никаких скрытых уровней, неожиданных платежей.' },
    { title: 'Реальные сценарии', desc: 'Ресторан, отель, собеседование — не "фиолетовый слон". Слова, которые действительно нужны.' },
    { title: 'Оценка уровня ИИ', desc: 'Первый бесплатный разговор оценит ваш уровень CEFR и создаст персональный план.' },
  ],
  pricing_title: 'Простые и честные цены', pricing_sub: 'Никаких уловок. Одна цена = всё включено для этого уровня.',
  pricing_month: '/мес', pricing_popular: 'САМЫЙ ПОПУЛЯРНЫЙ', pricing_cta: 'Начать',
  pricing_starter_features: ['15 разговоров/день', 'ИИ-репетитор Gemini', 'Базовые исправления', 'Отслеживание прогресса'],
  pricing_pro_features: ['Неограниченные разговоры', 'ИИ-репетитор GPT-4', 'Расширенные исправления', 'Отслеживание прогресса', '10 изображений/неделю'],
  pricing_ultra_features: ['Всё из Pro', 'Ультра-реалистичный голос', 'Видео-аватар', 'Неограниченные изображения', 'Приоритетная поддержка'],
  cta_title: 'Начните говорить сегодня', cta_sub: 'Один бесплатный разговор. Без карты. Без уловок.', cta_btn: 'Попробовать бесплатно',
  footer_rights: '© 2025 ChatLingo. Все права защищены.', footer_privacy: 'Конфиденциальность', footer_terms: 'Условия', footer_support: 'Поддержка',
};

const ar: HomeTranslation = {
  nav_features: 'الميزات', nav_pricing: 'الأسعار', nav_login: 'تسجيل الدخول', nav_cta: 'ابدأ مجاناً',
  hero_badge: 'التركيز على الكلام · محادثات حقيقية من اليوم الأول',
  hero_h1_prefix: 'تعلم', hero_h1_accent: 'التحدث فعلاً', hero_h1_suffix: 'بلغة جديدة',
  hero_sub: 'تدرب على محادثات حقيقية مع مدرسك الذكي. لا مزيد من تمارين المفردات والقواعد — فقط ممارسة حوارية طبيعية تُحدث فرقاً.',
  hero_cta: 'جرّب محادثة مجانية', hero_nocredit: 'لا حاجة لبطاقة ائتمان',
  hero_learners: 'متعلم', hero_languages: 'لغات', hero_rating: 'التقييم',
  features_title: 'هكذا يجب أن يكون تعلم اللغات',
  features_sub: 'أنشأنا ChatLingo بعد إحباطنا من التطبيقات التي لم تعلمنا كيف نتحدث فعلاً.',
  features: [
    { title: 'محادثات صوتية', desc: 'تحدث مباشرة مع مدرسك عبر الميكروفون. استجابة فورية كالحديث مع ناطق أصلي.' },
    { title: 'تصحيحات لطيفة', desc: '"الناطقون الأصليون يقولون..." — يصحح مدرسك بشكل طبيعي كصديق، لا كأستاذ غاضب.' },
    { title: 'تتبع تقدمك', desc: 'سلاسل يومية وإحصاءات المحادثات وتتبع المستوى لتبقى متحفزاً.' },
    { title: 'أسعار شفافة', desc: 'سعر واحد يشمل كل شيء. لا مستويات مخفية ولا رسوم مفاجئة.' },
    { title: 'سيناريوهات واقعية', desc: 'مطعم، فندق، مقابلة عمل — ليس "الفيل الأرجواني". مفردات مفيدة فعلاً.' },
    { title: 'تقييم المستوى بالذكاء الاصطناعي', desc: 'محادثتك المجانية الأولى تقيّم مستواك CEFR وتضع خطة تعلم مخصصة.' },
  ],
  pricing_title: 'أسعار بسيطة وصادقة', pricing_sub: 'لا حيل. سعر واحد = كل شيء مشمول لهذا المستوى.',
  pricing_month: '/شهر', pricing_popular: 'الأكثر شعبية', pricing_cta: 'ابدأ الآن',
  pricing_starter_features: ['15 محادثة/يوم', 'مدرس Gemini الذكي', 'تصحيحات أساسية', 'تتبع التقدم'],
  pricing_pro_features: ['محادثات غير محدودة', 'مدرس GPT-4 الذكي', 'تصحيحات متقدمة', 'تتبع التقدم', '10 صور سيناريو/أسبوع'],
  pricing_ultra_features: ['كل ما في Pro', 'صوت فائق الواقعية', 'أفاتار فيديو', 'صور غير محدودة', 'دعم أولوية'],
  cta_title: 'ابدأ الكلام اليوم', cta_sub: 'محادثة مجانية واحدة. بدون بطاقة ائتمان. بدون حيل.', cta_btn: 'جرّب مجاناً الآن',
  footer_rights: '© 2025 ChatLingo. جميع الحقوق محفوظة.', footer_privacy: 'الخصوصية', footer_terms: 'الشروط', footer_support: 'الدعم',
};

const hi: HomeTranslation = {
  nav_features: 'विशेषताएं', nav_pricing: 'कीमत', nav_login: 'लॉग इन', nav_cta: 'मुफ्त शुरू करें',
  hero_badge: 'बोलने पर जोर · पहले दिन से असली बातचीत',
  hero_h1_prefix: 'सही मायनों में', hero_h1_accent: 'बोलना सीखें', hero_h1_suffix: 'एक नई भाषा',
  hero_sub: 'अपने AI ट्यूटर के साथ असली बातचीत का अभ्यास करें। अब और शब्दों और व्याकरण के अभ्यास नहीं — बस स्वाभाविक बातचीत जो काम करती है।',
  hero_cta: 'मुफ्त बातचीत आजमाएं', hero_nocredit: 'क्रेडिट कार्ड की जरूरत नहीं',
  hero_learners: 'छात्र', hero_languages: 'भाषाएं', hero_rating: 'रेटिंग',
  features_title: 'भाषा सीखना ऐसा होना चाहिए',
  features_sub: 'हमने ChatLingo इसलिए बनाया क्योंकि दूसरे ऐप्स हमें सच में बोलना नहीं सिखाते थे।',
  features: [
    { title: 'आवाज़ से बातचीत', desc: 'माइक्रोफोन से सीधे ट्यूटर से बात करें। रियल-टाइम प्रतिक्रिया, जैसे मूल वक्ता से बात करना।' },
    { title: 'नरम सुधार', desc: '"मूल वक्ता ऐसे कहते हैं..." — आपका ट्यूटर दोस्त की तरह सुधारता है, न कि गुस्से वाले शिक्षक की तरह।' },
    { title: 'प्रगति ट्रैक करें', desc: 'दैनिक स्ट्रीक, बातचीत के आँकड़े और स्तर ट्रैकिंग से प्रेरित रहें।' },
    { title: 'पारदर्शी कीमत', desc: 'एक कीमत, सब कुछ शामिल। कोई छुपे स्तर नहीं, कोई आश्चर्यजनक शुल्क नहीं।' },
    { title: 'वास्तविक परिदृश्य', desc: 'रेस्तरां, होटल, नौकरी का साक्षात्कार — न कि "बैंगनी हाथी"। असल में जरूरी शब्दावली।' },
    { title: 'AI स्तर आकलन', desc: 'आपकी पहली मुफ्त बातचीत आपके CEFR स्तर का आकलन करती है और व्यक्तिगत योजना बनाती है।' },
  ],
  pricing_title: 'सरल, ईमानदार कीमत', pricing_sub: 'कोई चाल नहीं। एक कीमत = उस स्तर में सब कुछ शामिल।',
  pricing_month: '/महीना', pricing_popular: 'सबसे लोकप्रिय', pricing_cta: 'शुरू करें',
  pricing_starter_features: ['15 बातचीत/दिन', 'Gemini AI ट्यूटर', 'बुनियादी सुधार', 'प्रगति ट्रैकिंग'],
  pricing_pro_features: ['असीमित बातचीत', 'GPT-4 AI ट्यूटर', 'उन्नत सुधार', 'प्रगति ट्रैकिंग', '10 परिदृश्य छवियाँ/सप्ताह'],
  pricing_ultra_features: ['Pro में सब कुछ', 'अति-यथार्थवादी आवाज़', 'वीडियो अवतार', 'असीमित छवियाँ', 'प्राथमिकता सहायता'],
  cta_title: 'आज से बोलना शुरू करें', cta_sub: 'एक मुफ्त बातचीत। कोई क्रेडिट कार्ड नहीं। कोई चाल नहीं।', cta_btn: 'अभी मुफ्त आजमाएं',
  footer_rights: '© 2025 ChatLingo. सर्वाधिकार सुरक्षित।', footer_privacy: 'गोपनीयता', footer_terms: 'नियम', footer_support: 'सहायता',
};

const tr: HomeTranslation = {
  nav_features: 'Özellikler', nav_pricing: 'Fiyatlar', nav_login: 'Giriş yap', nav_cta: 'Ücretsiz başla',
  hero_badge: 'Konuşma odaklı · 1. günden itibaren gerçek konuşmalar',
  hero_h1_prefix: 'Gerçekten', hero_h1_accent: 'konuşmayı öğren', hero_h1_suffix: 'yeni bir dilde',
  hero_sub: 'AI öğretmeninle gerçek konuşmalar yap. Rastgele kelime ve dilbilgisi egzersizlerine son — sadece işe yarayan doğal konuşma pratiği.',
  hero_cta: 'Ücretsiz konuşmayı dene', hero_nocredit: 'Kredi kartı gerekmez',
  hero_learners: 'Öğrenci', hero_languages: 'Dil', hero_rating: 'Puan',
  features_title: 'Dil öğrenimi böyle olmalı',
  features_sub: "Bizi gerçekten konuşmayı öğretemeyen uygulamalara sinirdikten sonra ChatLingo'yu yarattık.",
  features: [
    { title: 'Sesli konuşmalar', desc: 'Mikrofonunla öğretmeninle doğrudan konuş. Gerçek zamanlı yanıt, anadil konuşanla konuşmak gibi.' },
    { title: 'Nazik düzeltmeler', desc: '"Anadil konuşanlar şöyle der..." — öğretmenin seni bir arkadaş gibi düzeltir, sinirli bir öğretmen gibi değil.' },
    { title: 'İlerleni takip et', desc: 'Günlük seriler, konuşma istatistikleri ve seviye takibi ile motive kal.' },
    { title: 'Şeffaf fiyatlar', desc: 'Tek fiyat, her şey dahil. Gizli kademeler yok, sürpriz ücretler yok.' },
    { title: 'Gerçek hayat senaryoları', desc: 'Restoran, otel, iş mülakatı — "mor fil" değil. Gerçekten işe yarayan kelimeler.' },
    { title: 'AI seviye değerlendirmesi', desc: 'İlk ücretsiz konuşman CEFR seviyeni değerlendirir ve kişisel öğrenme planı oluşturur.' },
  ],
  pricing_title: 'Basit, dürüst fiyatlar', pricing_sub: 'Numara yok. Bir fiyat = o kademe için her şey dahil.',
  pricing_month: '/ay', pricing_popular: 'EN POPÜLER', pricing_cta: 'Başla',
  pricing_starter_features: ['Günde 15 konuşma', 'Gemini AI öğretmen', 'Temel düzeltmeler', 'İlerleme takibi'],
  pricing_pro_features: ['Sınırsız konuşma', 'GPT-4 AI öğretmen', 'Gelişmiş düzeltmeler', 'İlerleme takibi', 'Haftada 10 senaryo görseli'],
  pricing_ultra_features: ["Pro'daki her şey", 'Ultra gerçekçi ses', 'Video avatar', 'Sınırsız görsel', 'Öncelikli destek'],
  cta_title: 'Bugün konuşmaya başla', cta_sub: 'Bir ücretsiz konuşma. Kredi kartı yok. Numara yok.', cta_btn: 'Şimdi ücretsiz dene',
  footer_rights: '© 2025 ChatLingo. Tüm hakları saklıdır.', footer_privacy: 'Gizlilik', footer_terms: 'Şartlar', footer_support: 'Destek',
};

const nl: HomeTranslation = {
  nav_features: 'Functies', nav_pricing: 'Prijzen', nav_login: 'Inloggen', nav_cta: 'Gratis starten',
  hero_badge: 'Spreken staat centraal · Echte gesprekken vanaf dag 1',
  hero_h1_prefix: 'Leer', hero_h1_accent: 'echt te spreken', hero_h1_suffix: 'in een nieuwe taal',
  hero_sub: 'Oefen echte gesprekken met je AI-tutor. Geen willekeurige woordenschat- of grammaticaoefeningen meer — gewoon natuurlijke spreekoefening die werkt.',
  hero_cta: 'Probeer een gratis gesprek', hero_nocredit: 'Geen creditcard nodig',
  hero_learners: 'Leerders', hero_languages: 'Talen', hero_rating: 'Beoordeling',
  features_title: 'Zo hoort taalonderwijs te zijn',
  features_sub: 'We bouwden ChatLingo na frustratie met apps die ons nooit leerden echt te spreken.',
  features: [
    { title: 'Spraakgesprekken', desc: 'Praat direct met je tutor via je microfoon. Realtime reactie, zoals praten met een moedertaalspreker.' },
    { title: 'Vriendelijke correcties', desc: '"Moedertaalsprekers zeggen..." — je tutor corrigeert op een natuurlijke manier, als een vriend, nooit als een boze leraar.' },
    { title: 'Volg je voortgang', desc: 'Dagelijkse reeksen, gespreksstatistieken en niveautracking om gemotiveerd te blijven.' },
    { title: 'Transparante prijzen', desc: 'Één prijs, alles inbegrepen. Geen verborgen niveaus, geen verrassingskosten.' },
    { title: "Echte scenario's", desc: "Restaurant, hotel, sollicitatiegesprek — niet 'de paarse olifant'. Woordenschat die er écht toe doet." },
    { title: 'AI-niveaubeoordeling', desc: 'Je eerste gratis gesprek beoordeelt je CEFR-niveau en maakt een gepersonaliseerd leerplan.' },
  ],
  pricing_title: 'Eenvoudige, eerlijke prijzen', pricing_sub: 'Geen trucjes. Één prijs = alles inbegrepen voor dat niveau.',
  pricing_month: '/maand', pricing_popular: 'MEEST POPULAIR', pricing_cta: 'Aan de slag',
  pricing_starter_features: ['15 gesprekken/dag', 'Gemini AI-tutor', 'Basiscorrecties', 'Voortgangsregistratie'],
  pricing_pro_features: ['Onbeperkte gesprekken', 'GPT-4 AI-tutor', 'Geavanceerde correcties', 'Voortgangsregistratie', '10 scénarioafbeeldingen/week'],
  pricing_ultra_features: ['Alles van Pro', 'Ultrarealistisch geluid', 'Videoavatar', 'Onbeperkte afbeeldingen', 'Prioriteitsondersteuning'],
  cta_title: 'Begin vandaag met spreken', cta_sub: 'Één gratis gesprek. Geen creditcard. Geen trucjes.', cta_btn: 'Probeer nu gratis',
  footer_rights: '© 2025 ChatLingo. Alle rechten voorbehouden.', footer_privacy: 'Privacy', footer_terms: 'Voorwaarden', footer_support: 'Ondersteuning',
};

const pl: HomeTranslation = {
  nav_features: 'Funkcje', nav_pricing: 'Cennik', nav_login: 'Zaloguj się', nav_cta: 'Zacznij za darmo',
  hero_badge: 'Podejście mówienia · Prawdziwe rozmowy od pierwszego dnia',
  hero_h1_prefix: 'Naucz się', hero_h1_accent: 'naprawdę mówić', hero_h1_suffix: 'w nowym języku',
  hero_sub: 'Ćwicz prawdziwe rozmowy z AI-tutorem. Koniec z losowymi ćwiczeniami słownictwa — tylko naturalna praktyka konwersacyjna, która działa.',
  hero_cta: 'Wypróbuj darmową rozmowę', hero_nocredit: 'Bez karty kredytowej',
  hero_learners: 'Uczących się', hero_languages: 'Języków', hero_rating: 'Ocena',
  features_title: 'Tak powinna wyglądać nauka języków',
  features_sub: 'Stworzyliśmy ChatLingo po frustracji aplikacjami, które nigdy nie nauczyły nas naprawdę mówić.',
  features: [
    { title: 'Rozmowy głosowe', desc: 'Rozmawiaj bezpośrednio z tutorem przez mikrofon. Odpowiedź w czasie rzeczywistym, jak z native speakerem.' },
    { title: 'Łagodne korekty', desc: '"Native speakerzy mówią..." — tutor poprawia naturalnie, jak znajomy, nigdy jak zły nauczyciel.' },
    { title: 'Śledź swoje postępy', desc: 'Codzienne serie, statystyki rozmów i śledzenie poziomu, aby być zmotywowanym.' },
    { title: 'Przejrzyste ceny', desc: 'Jedna cena, wszystko w zestawie. Brak ukrytych poziomów, brak niespodzianek.' },
    { title: 'Realne scenariusze', desc: 'Restauracja, hotel, rozmowa kwalifikacyjna — nie "fioletowy słoń". Słownictwo, które naprawdę się przydaje.' },
    { title: 'Ocena poziomu AI', desc: 'Pierwsza darmowa rozmowa ocenia Twój poziom CEFR i tworzy spersonalizowany plan nauki.' },
  ],
  pricing_title: 'Proste, uczciwe ceny', pricing_sub: 'Żadnych sztuczek. Jedna cena = wszystko w zestawie dla danego poziomu.',
  pricing_month: '/miesiąc', pricing_popular: 'NAJPOPULARNIEJSZY', pricing_cta: 'Zaczynamy',
  pricing_starter_features: ['15 rozmów/dzień', 'Korepetytor AI Gemini', 'Podstawowe korekty', 'Śledzenie postępów'],
  pricing_pro_features: ['Nieograniczone rozmowy', 'Korepetytor AI GPT-4', 'Zaawansowane korekty', 'Śledzenie postępów', '10 obrazów scenariuszy/tydzień'],
  pricing_ultra_features: ['Wszystko z Pro', 'Ultrarealny głos', 'Awatar wideo', 'Nieograniczone obrazy', 'Wsparcie priorytetowe'],
  cta_title: 'Zacznij mówić już dziś', cta_sub: 'Jedna darmowa rozmowa. Bez karty kredytowej. Bez sztuczek.', cta_btn: 'Wypróbuj za darmo teraz',
  footer_rights: '© 2025 ChatLingo. Wszelkie prawa zastrzeżone.', footer_privacy: 'Prywatność', footer_terms: 'Warunki', footer_support: 'Wsparcie',
};

export const homeT: Record<string, HomeTranslation> = {
  en, it, es, fr, de, pt, ja, zh, ko, ru, ar, hi, tr, nl, pl,
};

export function getHomeT(lang: string): HomeTranslation {
  return homeT[lang] ?? homeT['en'];
}
