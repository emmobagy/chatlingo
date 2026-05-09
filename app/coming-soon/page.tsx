'use client';

import { useState, useEffect } from 'react';
import { Mail, ShieldCheck, Cpu, Users, Globe } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUILanguage, UI_LANGUAGES } from '@/contexts/UILanguageContext';

// ── Translations ──────────────────────────────────────────────────────────────
const T: Record<string, {
  typewriter: string; sub1: string; sub2: string;
  placeholder: string; cta: string; privacy: string;
  badge1: string; badge2: string; badge3: string;
  success: string; successSub: string;
  duplicate: string; duplicateSub: string; error: string;
  joined: string; copyright: string;
}> = {
  en: { typewriter: "We're coming soon", sub1: 'The future of learning is personalized.', sub2: 'AI tutors that understand you. Teach you. Elevate you.', placeholder: 'Enter your email address', cta: 'NOTIFY ME', privacy: 'We respect your privacy. No spam, ever.', badge1: 'Personalized Learning', badge2: 'Adaptive AI Technology', badge3: 'Trusted & Secure', success: "You're on the list!", successSub: "We'll notify you as soon as we open.", duplicate: 'Already signed up!', duplicateSub: 'Your email is already on the waitlist.', error: 'Something went wrong. Try again.', joined: 'people already joined', copyright: '© 2026 ChatLingo. All rights reserved.' },
  it: { typewriter: 'Stiamo arrivando', sub1: "Il futuro dell'apprendimento è personalizzato.", sub2: 'Tutor AI che ti capiscono. Ti insegnano. Ti elevano.', placeholder: 'Inserisci la tua email', cta: 'AVVISAMI', privacy: 'Rispettiamo la tua privacy. Niente spam.', badge1: 'Apprendimento Personalizzato', badge2: 'Tecnologia AI Adattiva', badge3: 'Sicuro & Affidabile', success: 'Sei nella lista!', successSub: 'Ti avviseremo non appena apriamo.', duplicate: 'Già iscritto!', duplicateSub: 'Questa email è già nella lista.', error: 'Qualcosa è andato storto. Riprova.', joined: 'persone già iscritte', copyright: '© 2026 ChatLingo. Tutti i diritti riservati.' },
  es: { typewriter: 'Llegamos pronto', sub1: 'El futuro del aprendizaje es personalizado.', sub2: 'Tutores de IA que te entienden. Te enseñan. Te elevan.', placeholder: 'Ingresa tu email', cta: 'NOTIFÍCAME', privacy: 'Respetamos tu privacidad. Sin spam.', badge1: 'Aprendizaje Personalizado', badge2: 'Tecnología IA Adaptiva', badge3: 'Confiable y Seguro', success: '¡Estás en la lista!', successSub: 'Te avisaremos en cuanto abramos.', duplicate: '¡Ya registrado!', duplicateSub: 'Este email ya está en la lista.', error: 'Algo salió mal. Inténtalo de nuevo.', joined: 'personas ya unidas', copyright: '© 2026 ChatLingo. Todos los derechos reservados.' },
  fr: { typewriter: 'Nous arrivons bientôt', sub1: "L'avenir de l'apprentissage est personnalisé.", sub2: "Des tuteurs IA qui te comprennent. T'enseignent. T'élèvent.", placeholder: 'Entre ton adresse email', cta: 'ME NOTIFIER', privacy: 'Nous respectons ta vie privée. Zéro spam.', badge1: 'Apprentissage Personnalisé', badge2: 'Technologie IA Adaptative', badge3: 'Sécurisé & Fiable', success: 'Tu es sur la liste !', successSub: "On te préviendra dès qu'on ouvre.", duplicate: 'Déjà inscrit !', duplicateSub: 'Cet email est déjà sur la liste.', error: 'Une erreur est survenue. Réessaie.', joined: 'personnes déjà inscrites', copyright: '© 2026 ChatLingo. Tous droits réservés.' },
  de: { typewriter: 'Wir kommen bald', sub1: 'Die Zukunft des Lernens ist personalisiert.', sub2: 'KI-Tutoren, die dich verstehen. Dich lehren. Dich voranbringen.', placeholder: 'Deine E-Mail-Adresse', cta: 'BENACHRICHTIGE MICH', privacy: 'Wir respektieren deine Privatsphäre. Kein Spam.', badge1: 'Personalisiertes Lernen', badge2: 'Adaptive KI-Technologie', badge3: 'Vertrauenswürdig & Sicher', success: 'Du bist auf der Liste!', successSub: 'Wir benachrichtigen dich bei der Eröffnung.', duplicate: 'Bereits angemeldet!', duplicateSub: 'Diese E-Mail ist bereits auf der Liste.', error: 'Etwas ist schiefgelaufen. Versuch es nochmal.', joined: 'Personen bereits dabei', copyright: '© 2026 ChatLingo. Alle Rechte vorbehalten.' },
  pt: { typewriter: 'Estamos chegando', sub1: 'O futuro do aprendizado é personalizado.', sub2: 'Tutores de IA que te entendem. Te ensinam. Te elevam.', placeholder: 'Digite seu email', cta: 'ME AVISE', privacy: 'Respeitamos sua privacidade. Sem spam.', badge1: 'Aprendizado Personalizado', badge2: 'Tecnologia IA Adaptativa', badge3: 'Confiável e Seguro', success: 'Você está na lista!', successSub: 'Avisaremos assim que abrirmos.', duplicate: 'Já cadastrado!', duplicateSub: 'Este email já está na lista.', error: 'Algo deu errado. Tente novamente.', joined: 'pessoas já inscritas', copyright: '© 2026 ChatLingo. Todos os direitos reservados.' },
  ja: { typewriter: '近日公開', sub1: '学びの未来はパーソナライズされている。', sub2: 'あなたを理解し、教え、高めるAIチューター。', placeholder: 'メールアドレスを入力', cta: '通知を受け取る', privacy: 'プライバシーを尊重します。スパムなし。', badge1: 'パーソナライズ学習', badge2: '適応型AI技術', badge3: '安全・安心', success: 'リストに登録されました！', successSub: 'オープン時にお知らせします。', duplicate: '既に登録済みです！', duplicateSub: 'このメールは既にリストにあります。', error: 'エラーが発生しました。再試行してください。', joined: '人がすでに参加中', copyright: '© 2026 ChatLingo. すべての権利を保有しています。' },
  zh: { typewriter: '即将上线', sub1: '学习的未来是个性化的。', sub2: '理解你、教导你、提升你的AI导师。', placeholder: '输入您的邮箱地址', cta: '通知我', privacy: '我们尊重您的隐私，绝不发送垃圾邮件。', badge1: '个性化学习', badge2: '自适应AI技术', badge3: '安全可信', success: '您已加入名单！', successSub: '开放时我们会立即通知您。', duplicate: '已经注册！', duplicateSub: '此邮箱已在名单中。', error: '出了点问题，请重试。', joined: '人已加入', copyright: '© 2026 ChatLingo. 版权所有。' },
  ko: { typewriter: '곧 출시됩니다', sub1: '학습의 미래는 개인화입니다.', sub2: '당신을 이해하고, 가르치고, 성장시키는 AI 튜터.', placeholder: '이메일 주소 입력', cta: '알림 받기', privacy: '개인정보를 존중합니다. 스팸 없음.', badge1: '개인화 학습', badge2: '적응형 AI 기술', badge3: '신뢰 & 보안', success: '명단에 등록되었습니다!', successSub: '오픈하면 바로 알려드리겠습니다.', duplicate: '이미 등록되었습니다!', duplicateSub: '이 이메일은 이미 명단에 있습니다.', error: '문제가 발생했습니다. 다시 시도해주세요.', joined: '명이 이미 참여', copyright: '© 2026 ChatLingo. 모든 권리 보유.' },
  ru: { typewriter: 'Скоро откроемся', sub1: 'Будущее обучения — персонализация.', sub2: 'ИИ-репетиторы, которые понимают, учат и развивают тебя.', placeholder: 'Введи свой email', cta: 'УВЕДОМИТЬ', privacy: 'Мы уважаем твою конфиденциальность. Никакого спама.', badge1: 'Персонализированное обучение', badge2: 'Адаптивные технологии ИИ', badge3: 'Надёжно и безопасно', success: 'Ты в списке!', successSub: 'Уведомим, как только откроемся.', duplicate: 'Уже зарегистрирован!', duplicateSub: 'Этот email уже в списке.', error: 'Что-то пошло не так. Попробуй снова.', joined: 'человек уже присоединились', copyright: '© 2026 ChatLingo. Все права защищены.' },
  ar: { typewriter: 'قريباً جداً', sub1: 'مستقبل التعلم هو التخصيص.', sub2: 'مدرسون بالذكاء الاصطناعي يفهمونك ويعلمونك ويرفعونك.', placeholder: 'أدخل بريدك الإلكتروني', cta: 'أخبرني', privacy: 'نحترم خصوصيتك. لا بريد مزعج أبداً.', badge1: 'تعلم شخصي', badge2: 'تقنية ذكاء اصطناعي تكيفية', badge3: 'موثوق وآمن', success: 'أنت في القائمة!', successSub: 'سنخبرك فور الافتتاح.', duplicate: 'مسجل بالفعل!', duplicateSub: 'هذا البريد موجود بالفعل في القائمة.', error: 'حدث خطأ ما. حاول مرة أخرى.', joined: 'شخصاً انضم بالفعل', copyright: '© 2026 ChatLingo. جميع الحقوق محفوظة.' },
  hi: { typewriter: 'जल्द आ रहा है', sub1: 'सीखने का भविष्य व्यक्तिगत है।', sub2: 'AI ट्यूटर जो आपको समझते, सिखाते और आगे बढ़ाते हैं।', placeholder: 'अपना ईमेल दर्ज करें', cta: 'सूचित करें', privacy: 'हम आपकी गोपनीयता का सम्मान करते हैं। कोई स्पैम नहीं।', badge1: 'व्यक्तिगत शिक्षा', badge2: 'अनुकूली AI तकनीक', badge3: 'विश्वसनीय और सुरक्षित', success: 'आप सूची में हैं!', successSub: 'खुलने पर हम आपको सूचित करेंगे।', duplicate: 'पहले से पंजीकृत!', duplicateSub: 'यह ईमेल पहले से सूची में है।', error: 'कुछ गलत हुआ। फिर कोशिश करें।', joined: 'लोग पहले से जुड़े हैं', copyright: '© 2026 ChatLingo. सर्वाधिकार सुरक्षित।' },
  tr: { typewriter: 'Yakında geliyor', sub1: 'Öğrenmenin geleceği kişiselleştirilmiş.', sub2: 'Seni anlayan, öğreten ve yükselten AI öğretmenler.', placeholder: 'E-posta adresinizi girin', cta: 'BİLDİR', privacy: 'Gizliliğinize saygı duyuyoruz. Spam yok.', badge1: 'Kişiselleştirilmiş Öğrenme', badge2: 'Uyarlanabilir AI Teknolojisi', badge3: 'Güvenilir ve Güvenli', success: 'Listedesin!', successSub: 'Açıldığımızda seni bilgilendireceğiz.', duplicate: 'Zaten kayıtlısın!', duplicateSub: 'Bu e-posta zaten listede.', error: 'Bir şeyler yanlış gitti. Tekrar dene.', joined: 'kişi zaten katıldı', copyright: '© 2026 ChatLingo. Tüm hakları saklıdır.' },
  nl: { typewriter: 'Binnenkort beschikbaar', sub1: 'De toekomst van leren is gepersonaliseerd.', sub2: 'AI-tutors die jou begrijpen. Leren. Verheffen.', placeholder: 'Voer je e-mailadres in', cta: 'MELD MIJ AAN', privacy: 'We respecteren je privacy. Geen spam.', badge1: 'Gepersonaliseerd Leren', badge2: 'Adaptieve AI-technologie', badge3: 'Vertrouwd & Veilig', success: 'Je staat op de lijst!', successSub: 'We laten je weten zodra we openen.', duplicate: 'Al aangemeld!', duplicateSub: 'Dit e-mailadres staat al op de lijst.', error: 'Er ging iets mis. Probeer het opnieuw.', joined: 'mensen al aangemeld', copyright: '© 2026 ChatLingo. Alle rechten voorbehouden.' },
  pl: { typewriter: 'Już wkrótce', sub1: 'Przyszłość nauki jest spersonalizowana.', sub2: 'Tutorzy AI, którzy cię rozumieją. Uczą. Rozwijają.', placeholder: 'Wpisz swój adres email', cta: 'POWIADOM MNIE', privacy: 'Szanujemy Twoją prywatność. Żadnego spamu.', badge1: 'Spersonalizowana Nauka', badge2: 'Adaptacyjna Technologia AI', badge3: 'Zaufany i Bezpieczny', success: 'Jesteś na liście!', successSub: 'Powiadomimy cię, gdy się otworzymy.', duplicate: 'Już zapisany!', duplicateSub: 'Ten email jest już na liście.', error: 'Coś poszło nie tak. Spróbuj ponownie.', joined: 'osób już dołączyło', copyright: '© 2026 ChatLingo. Wszystkie prawa zastrzeżone.' },
};

// ── Typewriter animation component ────────────────────────────────────────────
function TypewriterHero() {
  const LANGUAGES = [
    { flag: '🇮🇹', code: 'it' },
    { flag: '🇺🇸', code: 'en' },
    { flag: '🇩🇪', code: 'de' },
    { flag: '🇫🇷', code: 'fr' },
    { flag: '🇪🇸', code: 'es' },
    { flag: '🇯🇵', code: 'ja' },
    { flag: '🇰🇷', code: 'ko' },
    { flag: '🇧🇷', code: 'pt' },
    { flag: '🇨🇳', code: 'zh' },
    { flag: '🇷🇺', code: 'ru' },
    { flag: '🇸🇦', code: 'ar' },
    { flag: '🇮🇳', code: 'hi' },
    { flag: '🇹🇷', code: 'tr' },
    { flag: '🇳🇱', code: 'nl' },
    { flag: '🇵🇱', code: 'pl' },
  ];

  const [displayText, setDisplayText] = useState('');
  const [currentLangIdx, setCurrentLangIdx] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [currentFlag, setCurrentFlag] = useState(LANGUAGES[0].flag);

  const fullText = T[LANGUAGES[currentLangIdx].code].typewriter;

  useEffect(() => {
    const typingDelay = 50;
    const deletingDelay = 30;
    const pauseDuration = 2800;

    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (displayText.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length + 1));
        }, typingDelay);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, pauseDuration);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(fullText.slice(0, displayText.length - 1));
        }, deletingDelay);
      } else {
        setCurrentLangIdx((prev) => (prev + 1) % LANGUAGES.length);
        setCurrentFlag(LANGUAGES[(currentLangIdx + 1) % LANGUAGES.length].flag);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, fullText, currentLangIdx]);

  useEffect(() => {
    setCurrentFlag(LANGUAGES[currentLangIdx].flag);
  }, [currentLangIdx]);

  return (
    <div className="flex items-center justify-center">
      <span
        className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight inline-flex items-center"
        style={{
          background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 35%, #7c3aed 65%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 4px 20px rgba(124, 58, 237, 0.25))',
        }}
      >
        {displayText}
        <span
          className="inline-block w-0.5 h-[1em] bg-indigo-600 ml-1 animate-pulse"
          style={{
            animationDuration: '0.6s',
            verticalAlign: 'text-bottom',
          }}
        />
        <span className="text-2xl md:text-3xl lg:text-4xl ml-0.5">{currentFlag}</span>
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ComingSoonPage() {
  const { uiLang, setUILang, flag, mounted } = useUILanguage();
  const t = T[mounted ? uiLang : 'en'] ?? T['en'];
  const isRTL = uiLang === 'ar';

  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    getCountFromServer(collection(db, 'waitlist'))
      .then(snap => setWaitlistCount(snap.data().count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status === 'success') setWaitlistCount(c => (c ?? 0) + 1);
  }, [status]);

  useEffect(() => {
    if (!langOpen) return;
    function close(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-lang-switcher]')) setLangOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [langOpen]);

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

  return (
    <>
      <style>{`
        .mesh-bg { display: none !important; }
        .no-scrollbar::-webkit-scrollbar { display:none; }
        .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      <div
        className="overflow-hidden"
        style={{ position: 'fixed', inset: 0 }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* ── Video background (full-bleed, contains tutors + animations) ── */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        >
          <source src="/banners/coming-soon-tutors.mp4" type="video/mp4" />
        </video>

        {/* Soft tint to keep text/UI legible over the video */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 60%, rgba(244,240,255,0.55) 100%)',
          }}
        />

        {/* ── Foreground content ── */}
        <div className="relative z-10 h-full w-full flex flex-col px-4">

          {/* Top bar: logo + language switcher */}
          <div className="flex items-center justify-between w-full max-w-6xl mx-auto pt-4 md:pt-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-slate-800 tracking-tight">ChatLingo</span>
            </div>

            <div className="relative" data-lang-switcher>
              <button
                onClick={() => setLangOpen(o => !o)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white/80 backdrop-blur-md border border-white/90 rounded-xl px-3 py-1.5 hover:bg-white transition-all shadow-sm"
              >
                <span>{flag}</span>
                <Globe className="w-3.5 h-3.5" />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="max-h-64 overflow-y-auto py-1">
                    {UI_LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => { setUILang(l.code); setLangOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-indigo-50 transition-colors ${uiLang === l.code ? 'text-indigo-700 font-semibold bg-indigo-50/60' : 'text-slate-700'}`}
                      >
                        <span>{l.flag}</span>
                        <span>{l.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hero content - positioned at top */}
          <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center justify-center gap-3 md:gap-3.5 px-2 pt-8 md:pt-12 pb-12 md:pb-16">
            <TypewriterHero />
            <p className="text-slate-800 font-semibold text-xs md:text-sm lg:text-base leading-snug">{t.sub1}</p>
            <p className="text-slate-500 text-[11px] md:text-xs lg:text-sm leading-snug">{t.sub2}</p>
          </div>

          {/* Flexible spacer - takes remaining space */}
          <div className="flex-1" />
        </div>

        {/* Form card - fixed position at bottom, always visible */}
        <div className="fixed bottom-0 left-0 right-0 z-10 pb-4 md:pb-6 px-4">
          <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white/70 backdrop-blur-2xl border border-white/85 rounded-2xl shadow-2xl shadow-purple-300/30 px-4 md:px-5 py-3 md:py-4">
              {status === 'success' ? (
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">{t.success}</p>
                  <p className="text-xs text-slate-500 text-center">{t.successSub}</p>
                </div>
              ) : status === 'duplicate' ? (
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">{t.duplicate}</p>
                  <p className="text-xs text-slate-500 text-center">{t.duplicateSub}</p>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 md:px-4">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.placeholder}
                        className="flex-1 py-2.5 md:py-3 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent min-w-0"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full sm:w-auto text-white font-bold text-sm px-6 py-2.5 md:py-3 rounded-xl transition-all disabled:opacity-60 whitespace-nowrap active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                        boxShadow: '0 8px 22px rgba(139,92,246,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
                      }}
                    >
                      {status === 'loading' ? '...' : t.cta}
                    </button>
                  </form>
                  {status === 'error' && <p className="text-red-500 text-xs text-center mt-2">{t.error}</p>}
                  <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs mt-2">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                    <span>{t.privacy}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Social proof + Features (below form, still centered) */}
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-3">
            {/* Social proof */}
            {waitlistCount !== null && waitlistCount > 0 && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600">
                <div className="flex -space-x-1.5">
                  {['👩','👨','🧑'].map((emoji, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center text-[9px]">
                      {emoji}
                    </div>
                  ))}
                </div>
                <span className="font-semibold text-indigo-700">{waitlistCount.toLocaleString()}</span>
                <span>{t.joined}</span>
              </div>
            )}

            {/* Features */}
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 mt-2 px-2">
              {[
                { icon: <Users className="w-3.5 h-3.5 text-indigo-500" />,       label: t.badge1 },
                { icon: <Cpu className="w-3.5 h-3.5 text-indigo-500" />,         label: t.badge2 },
                { icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />, label: t.badge3 },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-1.5 text-slate-700 text-[11px] md:text-xs font-medium">
                  {b.icon}<span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer section (bottom) */}
        <div className="relative z-10 pb-4 md:pb-6 px-4 text-center">
          <p className="text-slate-500/80 text-[10px]">{t.copyright}</p>
        </div>
      </div>
    </div>
    </>
  );
}
