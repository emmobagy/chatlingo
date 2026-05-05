'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Mail, ShieldCheck, Cpu, Users } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUILanguage } from '@/contexts/UILanguageContext';

// ── Translations ──────────────────────────────────────────────────────────────
const T: Record<string, {
  coming: string; sub1: string; sub2: string;
  placeholder: string; cta: string; privacy: string;
  badge1: string; badge2: string; badge3: string;
  success: string; successSub: string;
  duplicate: string; duplicateSub: string; error: string;
}> = {
  en: { coming: 'COMING SOON', sub1: 'The future of learning is personalized.', sub2: 'AI tutors that understand you. Teach you. Elevate you.', placeholder: 'Enter your email address', cta: 'NOTIFY ME', privacy: 'We respect your privacy. No spam, ever.', badge1: 'Personalized Learning', badge2: 'Adaptive AI Technology', badge3: 'Trusted & Secure', success: "You're on the list!", successSub: "We'll notify you as soon as we open.", duplicate: 'Already signed up!', duplicateSub: 'Your email is already on the waitlist.', error: 'Something went wrong. Try again.' },
  it: { coming: 'COMING SOON', sub1: "Il futuro dell'apprendimento è personalizzato.", sub2: 'Tutor AI che ti capiscono. Ti insegnano. Ti elevano.', placeholder: 'Inserisci la tua email', cta: 'AVVISAMI', privacy: 'Rispettiamo la tua privacy. Niente spam.', badge1: 'Apprendimento Personalizzato', badge2: 'Tecnologia AI Adattiva', badge3: 'Sicuro & Affidabile', success: 'Sei nella lista!', successSub: 'Ti avviseremo non appena apriamo.', duplicate: 'Già iscritto!', duplicateSub: 'Questa email è già nella lista.', error: 'Qualcosa è andato storto. Riprova.' },
  es: { coming: 'PRÓXIMAMENTE', sub1: 'El futuro del aprendizaje es personalizado.', sub2: 'Tutores de IA que te entienden. Te enseñan. Te elevan.', placeholder: 'Ingresa tu email', cta: 'NOTIFÍCAME', privacy: 'Respetamos tu privacidad. Sin spam.', badge1: 'Aprendizaje Personalizado', badge2: 'Tecnología IA Adaptiva', badge3: 'Confiable y Seguro', success: '¡Estás en la lista!', successSub: 'Te avisaremos en cuanto abramos.', duplicate: '¡Ya registrado!', duplicateSub: 'Este email ya está en la lista.', error: 'Algo salió mal. Inténtalo de nuevo.' },
  fr: { coming: 'BIENTÔT', sub1: "L'avenir de l'apprentissage est personnalisé.", sub2: "Des tuteurs IA qui te comprennent. T'enseignent. T'élèvent.", placeholder: 'Entre ton adresse email', cta: 'ME NOTIFIER', privacy: 'Nous respectons ta vie privée. Zéro spam.', badge1: 'Apprentissage Personnalisé', badge2: 'Technologie IA Adaptative', badge3: 'Sécurisé & Fiable', success: 'Tu es sur la liste !', successSub: "On te préviendra dès qu'on ouvre.", duplicate: 'Déjà inscrit !', duplicateSub: 'Cet email est déjà sur la liste.', error: 'Une erreur est survenue. Réessaie.' },
  de: { coming: 'DEMNÄCHST', sub1: 'Die Zukunft des Lernens ist personalisiert.', sub2: 'KI-Tutoren, die dich verstehen. Dich lehren. Dich voranbringen.', placeholder: 'Deine E-Mail-Adresse', cta: 'BENACHRICHTIGE MICH', privacy: 'Wir respektieren deine Privatsphäre. Kein Spam.', badge1: 'Personalisiertes Lernen', badge2: 'Adaptive KI-Technologie', badge3: 'Vertrauenswürdig & Sicher', success: 'Du bist auf der Liste!', successSub: 'Wir benachrichtigen dich bei der Eröffnung.', duplicate: 'Bereits angemeldet!', duplicateSub: 'Diese E-Mail ist bereits auf der Liste.', error: 'Etwas ist schiefgelaufen. Versuch es nochmal.' },
  pt: { coming: 'EM BREVE', sub1: 'O futuro do aprendizado é personalizado.', sub2: 'Tutores de IA que te entendem. Te ensinam. Te elevam.', placeholder: 'Digite seu email', cta: 'ME AVISE', privacy: 'Respeitamos sua privacidade. Sem spam.', badge1: 'Aprendizado Personalizado', badge2: 'Tecnologia IA Adaptativa', badge3: 'Confiável e Seguro', success: 'Você está na lista!', successSub: 'Avisaremos assim que abrirmos.', duplicate: 'Já cadastrado!', duplicateSub: 'Este email já está na lista.', error: 'Algo deu errado. Tente novamente.' },
  ja: { coming: 'もうすぐ公開', sub1: '学びの未来はパーソナライズされている。', sub2: 'あなたを理解し、教え、高めるAIチューター。', placeholder: 'メールアドレスを入力', cta: '通知を受け取る', privacy: 'プライバシーを尊重します。スパムなし。', badge1: 'パーソナライズ学習', badge2: '適応型AI技術', badge3: '安全・安心', success: 'リストに登録されました！', successSub: 'オープン時にお知らせします。', duplicate: '既に登録済みです！', duplicateSub: 'このメールは既にリストにあります。', error: 'エラーが発生しました。再試行してください。' },
  zh: { coming: '即将推出', sub1: '学习的未来是个性化的。', sub2: '理解你、教导你、提升你的AI导师。', placeholder: '输入您的邮箱地址', cta: '通知我', privacy: '我们尊重您的隐私，绝不发送垃圾邮件。', badge1: '个性化学习', badge2: '自适应AI技术', badge3: '安全可信', success: '您已加入名单！', successSub: '开放时我们会立即通知您。', duplicate: '已经注册！', duplicateSub: '此邮箱已在名单中。', error: '出了点问题，请重试。' },
  ko: { coming: '곧 출시', sub1: '학습의 미래는 개인화입니다.', sub2: '당신을 이해하고, 가르치고, 성장시키는 AI 튜터.', placeholder: '이메일 주소 입력', cta: '알림 받기', privacy: '개인정보를 존중합니다. 스팸 없음.', badge1: '개인화 학습', badge2: '적응형 AI 기술', badge3: '신뢰 & 보안', success: '명단에 등록되었습니다!', successSub: '오픈하면 바로 알려드리겠습니다.', duplicate: '이미 등록되었습니다!', duplicateSub: '이 이메일은 이미 명단에 있습니다.', error: '문제가 발생했습니다. 다시 시도해주세요.' },
  ru: { coming: 'СКОРО', sub1: 'Будущее обучения — персонализация.', sub2: 'ИИ-репетиторы, которые понимают, учат и развивают тебя.', placeholder: 'Введи свой email', cta: 'УВЕДОМИТЬ', privacy: 'Мы уважаем твою конфиденциальность. Никакого спама.', badge1: 'Персонализированное обучение', badge2: 'Адаптивные технологии ИИ', badge3: 'Надёжно и безопасно', success: 'Ты в списке!', successSub: 'Уведомим, как только откроемся.', duplicate: 'Уже зарегистрирован!', duplicateSub: 'Этот email уже в списке.', error: 'Что-то пошло не так. Попробуй снова.' },
  ar: { coming: 'قريباً', sub1: 'مستقبل التعلم هو التخصيص.', sub2: 'مدرسون بالذكاء الاصطناعي يفهمونك ويعلمونك ويرفعونك.', placeholder: 'أدخل بريدك الإلكتروني', cta: 'أخبرني', privacy: 'نحترم خصوصيتك. لا بريد مزعج أبداً.', badge1: 'تعلم شخصي', badge2: 'تقنية ذكاء اصطناعي تكيفية', badge3: 'موثوق وآمن', success: 'أنت في القائمة!', successSub: 'سنخبرك فور الافتتاح.', duplicate: 'مسجل بالفعل!', duplicateSub: 'هذا البريد موجود بالفعل في القائمة.', error: 'حدث خطأ ما. حاول مرة أخرى.' },
  hi: { coming: 'जल्द आ रहा है', sub1: 'सीखने का भविष्य व्यक्तिगत है।', sub2: 'AI ट्यूटर जो आपको समझते, सिखाते और आगे बढ़ाते हैं।', placeholder: 'अपना ईमेल दर्ज करें', cta: 'सूचित करें', privacy: 'हम आपकी गोपनीयता का सम्मान करते हैं। कोई स्पैम नहीं।', badge1: 'व्यक्तिगत शिक्षा', badge2: 'अनुकूली AI तकनीक', badge3: 'विश्वसनीय और सुरक्षित', success: 'आप सूची में हैं!', successSub: 'खुलने पर हम आपको सूचित करेंगे।', duplicate: 'पहले से पंजीकृत!', duplicateSub: 'यह ईमेल पहले से सूची में है।', error: 'कुछ गलत हुआ। फिर कोशिश करें।' },
  tr: { coming: 'YAKINDA', sub1: 'Öğrenmenin geleceği kişiselleştirilmiş.', sub2: 'Seni anlayan, öğreten ve yükselten AI öğretmenler.', placeholder: 'E-posta adresinizi girin', cta: 'BİLDİR', privacy: 'Gizliliğinize saygı duyuyoruz. Spam yok.', badge1: 'Kişiselleştirilmiş Öğrenme', badge2: 'Uyarlanabilir AI Teknolojisi', badge3: 'Güvenilir ve Güvenli', success: 'Listedesin!', successSub: 'Açıldığımızda seni bilgilendireceğiz.', duplicate: 'Zaten kayıtlısın!', duplicateSub: 'Bu e-posta zaten listede.', error: 'Bir şeyler yanlış gitti. Tekrar dene.' },
  nl: { coming: 'BINNENKORT', sub1: 'De toekomst van leren is gepersonaliseerd.', sub2: 'AI-tutors die jou begrijpen. Leren. Verheffen.', placeholder: 'Voer je e-mailadres in', cta: 'MELD MIJ AAN', privacy: 'We respecteren je privacy. Geen spam.', badge1: 'Gepersonaliseerd Leren', badge2: 'Adaptieve AI-technologie', badge3: 'Vertrouwd & Veilig', success: 'Je staat op de lijst!', successSub: 'We laten je weten zodra we openen.', duplicate: 'Al aangemeld!', duplicateSub: 'Dit e-mailadres staat al op de lijst.', error: 'Er ging iets mis. Probeer het opnieuw.' },
  pl: { coming: 'WKRÓTCE', sub1: 'Przyszłość nauki jest spersonalizowana.', sub2: 'Tutorzy AI, którzy cię rozumieją. Uczą. Rozwijają.', placeholder: 'Wpisz swój adres email', cta: 'POWIADOM MNIE', privacy: 'Szanujemy Twoją prywatność. Żadnego spamu.', badge1: 'Spersonalizowana Nauka', badge2: 'Adaptacyjna Technologia AI', badge3: 'Zaufany i Bezpieczny', success: 'Jesteś na liście!', successSub: 'Powiadomimy cię, gdy się otworzymy.', duplicate: 'Już zapisany!', duplicateSub: 'Ten email jest już na liście.', error: 'Coś poszło nie tak. Spróbuj ponownie.' },
};

// ── Bubbles data ──────────────────────────────────────────────────────────────
const LEFT_BUBBLES  = [
  { flag: '🇺🇸', label: 'English',  size: 72 },
  { flag: '🇪🇸', label: 'Spanish',  size: 62 },
  { flag: '🇫🇷', label: 'French',   size: 62 },
  { flag: '🇮🇹', label: 'Italian',  size: 58 },
  { flag: '🇩🇪', label: 'German',   size: 58 },
];
const RIGHT_BUBBLES = [
  { flag: '🇧🇷', label: 'Portuguese', size: 72 },
  { flag: '🇸🇦', label: 'Arabic',     size: 62 },
  { flag: '🇯🇵', label: 'Japanese',   size: 58 },
  { flag: '🇰🇷', label: 'Korean',     size: 58 },
  { flag: '🇨🇳', label: 'Chinese',    size: 62 },
];

// Small decorative bubbles (no flag)
const DECO_BUBBLES = [
  { x: '12%', y: '28%', size: 14, color: 'rgba(167,139,250,0.5)' },
  { x: '22%', y: '55%', size: 10, color: 'rgba(196,181,253,0.4)' },
  { x: '8%',  y: '70%', size: 18, color: 'rgba(129,140,248,0.35)' },
  { x: '78%', y: '32%', size: 12, color: 'rgba(167,139,250,0.4)' },
  { x: '88%', y: '58%', size: 16, color: 'rgba(196,181,253,0.45)' },
  { x: '82%', y: '72%', size: 10, color: 'rgba(129,140,248,0.3)' },
];

// ── Seeded random ─────────────────────────────────────────────────────────────
function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ── Glass bubble component ────────────────────────────────────────────────────
function GlassBubble({ flag, label, size, index, side }: {
  flag: string; label: string; size: number; index: number; side: 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const seed = index * 13 + (side === 'left' ? 0 : 77);

    // Very slow, gentle organic drift
    const dur    = 14000 + sr(seed + 0) * 10000;  // 14–24s
    const rangeX = 10 + sr(seed + 1) * 18;         // 10–28px
    const rangeY = 8  + sr(seed + 2) * 16;         // 8–24px
    const phX    = sr(seed + 3) * Math.PI * 2;
    const phY    = sr(seed + 4) * Math.PI * 2;

    let start: number | null = null;
    let raf: number;
    function tick(ts: number) {
      if (!start) start = ts;
      const t = (ts - start) / dur;
      const tx = Math.sin(t * Math.PI * 2 + phX) * rangeX;
      const ty = Math.sin(t * Math.PI * 2 * 0.73 + phY) * rangeY;
      el!.style.transform = `translate(${tx}px,${ty}px)`;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, side]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1.5 will-change-transform">
      {/* Glass sphere */}
      <div
        className="relative flex items-center justify-center rounded-full select-none"
        style={{
          width: size, height: size,
          background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(237,233,254,0.7) 50%, rgba(221,214,254,0.5) 100%)',
          boxShadow: '0 4px 24px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(167,139,250,0.2)',
          border: '1px solid rgba(255,255,255,0.8)',
        }}
      >
        {/* Inner shine */}
        <div className="absolute top-[10%] left-[15%] w-[35%] h-[25%] rounded-full bg-white/60 blur-[2px]" />
        <span style={{ fontSize: size * 0.58 }}>{flag}</span>
      </div>
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
    </div>
  );
}

// ── Blinking tutor ────────────────────────────────────────────────────────────
function TutorImage({ src, height, delay }: { src: string; height: number; delay: number }) {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    // Random blink every 3–6 seconds
    function scheduleBlink() {
      const next = 3000 + Math.random() * 3000 + delay * 400;
      return setTimeout(() => {
        setBlinking(true);
        setTimeout(() => { setBlinking(false); scheduleBlink(); }, 130);
      }, next);
    }
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, [delay]);

  const width = Math.round(height * 0.67);

  return (
    <div
      className="relative flex-shrink-0"
      style={{
        width, height,
        // Fade bottom with CSS mask
        WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
      }}
    >
      <Image src={src} alt="AI Tutor" fill className="object-contain object-bottom" priority />
      {/* Blink overlay — covers eye area */}
      {blinking && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: '16%', left: '20%', right: '20%', height: '7%',
            background: 'rgba(220,200,180,0.85)',
            borderRadius: '50%',
            filter: 'blur(2px)',
          }}
        />
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ComingSoonPage() {
  const { uiLang, mounted } = useUILanguage();
  const t = T[mounted ? uiLang : 'en'] ?? T['en'];
  const isRTL = uiLang === 'ar';

  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const q = query(collection(db, 'waitlist'), where('email', '==', email.toLowerCase().trim()));
      const snap = await getDocs(q);
      if (!snap.empty) { setStatus('duplicate'); return; }
      await addDoc(collection(db, 'waitlist'), {
        email: email.toLowerCase().trim(),
        createdAt: serverTimestamp(),
        source: 'coming-soon',
      });
      setStatus('success');
    } catch { setStatus('error'); }
  }

  // Tutor heights using clamp so they scale with viewport height
  const TUTORS = [
    { src: '/tutors/tutor-new-1.png', h: 'clamp(130px, 21vh, 240px)' },
    { src: '/tutors/tutor-new-2.png', h: 'clamp(150px, 24vh, 270px)' },
    { src: '/tutors/tutor-new-3.png', h: 'clamp(170px, 28vh, 310px)' },
    { src: '/tutors/tutor-new-4.png', h: 'clamp(150px, 24vh, 270px)' },
    { src: '/tutors/tutor-new-5.png', h: 'clamp(130px, 21vh, 240px)' },
  ];

  return (
    <>
      <style>{`
        .mesh-bg { display: none !important; }
        @keyframes aurora1 {
          0%,100% { transform: translate(0,0) scale(1); opacity:0.6; }
          50%      { transform: translate(30px,20px) scale(1.1); opacity:0.75; }
        }
        @keyframes aurora2 {
          0%,100% { transform: translate(0,0) scale(1); opacity:0.55; }
          50%      { transform: translate(-20px,30px) scale(1.15); opacity:0.7; }
        }
        @keyframes aurora3 {
          0%,100% { transform: translate(0,0) scale(1); opacity:0.35; }
          50%      { transform: translate(20px,-25px) scale(1.08); opacity:0.55; }
        }
        .no-scrollbar::-webkit-scrollbar { display:none; }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      {/* position:fixed takes this out of html/body flow — they have nothing to scroll */}
      <div
        className="overflow-hidden"
        style={{ position: 'fixed', inset: 0 }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* ── Background ── */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 0%, #faf9ff 0%, #f0ebff 35%, #e4ddfa 70%, #d8cef5 100%)',
        }} />

        {/* Aurora blobs */}
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full blur-[80px]"
          style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.6) 0%, rgba(249,115,22,0.2) 100%)', animation: 'aurora1 9s ease-in-out infinite' }} />
        <div className="absolute -bottom-10 -right-10 w-80 h-80 rounded-full blur-[90px]"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.55) 0%, rgba(99,102,241,0.2) 100%)', animation: 'aurora2 11s ease-in-out infinite' }} />
        <div className="absolute top-10 right-[15%] w-48 h-48 rounded-full blur-[70px]"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 100%)', animation: 'aurora3 13s ease-in-out infinite' }} />

        {/* Decorative small bubbles */}
        {DECO_BUBBLES.map((b, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none hidden md:block"
            style={{ left: b.x, top: b.y, width: b.size, height: b.size, background: b.color,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.6)' }} />
        ))}

        {/* ── Content ── */}
        <div className="relative z-10 h-full w-full flex flex-col items-center px-4">

          {/* Logo */}
          <div className="flex items-center gap-2 pt-4 md:pt-6 mb-3 md:mb-4">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-400/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">ChatLingo</span>
          </div>

          {/* Headline */}
          <h1 className="font-black tracking-tight leading-none text-center mb-1.5 px-4"
            style={{
              fontSize: 'clamp(2rem, 7vw, 4.8rem)',
              background: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 45%, #8b5cf6 75%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
            {t.coming}
          </h1>
          <p className="text-slate-700 font-semibold text-sm md:text-lg text-center mb-0.5 max-w-md">{t.sub1}</p>
          <p className="text-slate-400 text-xs md:text-sm text-center max-w-sm md:max-w-md mb-2 md:mb-3">{t.sub2}</p>

          {/* Mobile bubbles */}
          <div className="flex md:hidden gap-3 overflow-x-auto pb-1 mb-2 px-2 w-full no-scrollbar justify-start">
            {[...LEFT_BUBBLES, ...RIGHT_BUBBLES].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-2xl"
                  style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95), rgba(237,233,254,0.7))', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 2px 8px rgba(139,92,246,0.15)' }}>
                  {b.flag}
                </div>
                <span className="text-[9px] font-medium text-slate-500">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Desktop: tutors + side bubbles */}
          <div className="hidden md:flex items-end justify-center w-full max-w-5xl relative flex-1">

            {/* Left bubbles */}
            <div className="flex flex-col gap-4 mr-4 mb-6 items-end justify-center flex-1">
              {LEFT_BUBBLES.map((b, i) => (
                <GlassBubble key={b.label} flag={b.flag} label={b.label} size={b.size} index={i} side="left" />
              ))}
            </div>

            {/* Tutors */}
            <div className="flex items-end justify-center gap-1">
              {TUTORS.map((tutor, i) => {
                const maxH = parseInt(tutor.h.match(/(\d+)px\)$/)?.[1] ?? '240');
                return <TutorImage key={i} src={tutor.src} height={maxH} delay={i} />;
              })}
            </div>

            {/* Right bubbles */}
            <div className="flex flex-col gap-4 ml-4 mb-6 items-start justify-center flex-1">
              {RIGHT_BUBBLES.map((b, i) => (
                <GlassBubble key={b.label} flag={b.flag} label={b.label} size={b.size} index={i + 5} side="right" />
              ))}
            </div>
          </div>

          {/* Mobile tutors */}
          <div className="flex md:hidden items-end justify-center gap-0 w-full flex-1">
            {TUTORS.map((tutor, i) => {
              const maxH = parseInt(tutor.h.match(/(\d+)px\)$/)?.[1] ?? '185');
              const mobileH = Math.round(maxH * 0.6);
              return <TutorImage key={i} src={tutor.src} height={mobileH} delay={i} />;
            })}
          </div>

          {/* Waitlist card — overlaps tutors */}
          <div className="w-full max-w-md bg-white/65 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl shadow-purple-100/50 px-4 md:px-6 py-3 md:py-4 mx-4 -mt-12 md:-mt-16 z-10">
            {status === 'success' ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="font-bold text-slate-800">{t.success}</p>
                <p className="text-sm text-slate-500 text-center">{t.successSub}</p>
              </div>
            ) : status === 'duplicate' ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-11 h-11 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="font-bold text-slate-800">{t.duplicate}</p>
                <p className="text-sm text-slate-500 text-center">{t.duplicateSub}</p>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-2">
                  <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 md:px-4">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.placeholder}
                      className="flex-1 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent min-w-0" />
                  </div>
                  <button type="submit" disabled={status === 'loading'}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all disabled:opacity-60 shadow-md shadow-indigo-300/40 whitespace-nowrap">
                    {status === 'loading' ? '...' : t.cta}
                  </button>
                </form>
                {status === 'error' && <p className="text-red-500 text-xs text-center mb-1">{t.error}</p>}
                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.privacy}</span>
                </div>
              </>
            )}
          </div>

          {/* Badges + footer */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-2 md:mt-3 px-4">
            {[
              { icon: <Users className="w-3 h-3 text-slate-400" />,       label: t.badge1 },
              { icon: <Cpu className="w-3 h-3 text-slate-400" />,         label: t.badge2 },
              { icon: <ShieldCheck className="w-3 h-3 text-slate-400" />, label: t.badge3 },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-1 text-slate-500 text-[10px] md:text-xs font-medium">
                {b.icon}<span>{b.label}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-400/50 text-[10px] mt-1.5 pb-3">© 2026 ChatLingo. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}
