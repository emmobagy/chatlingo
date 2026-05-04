'use client';

import { useState, useEffect } from 'react';
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
  it: { coming: 'COMING SOON', sub1: 'Il futuro dell\'apprendimento è personalizzato.', sub2: 'Tutor AI che ti capiscono. Ti insegnano. Ti elevano.', placeholder: 'Inserisci la tua email', cta: 'AVVISAMI', privacy: 'Rispettiamo la tua privacy. Niente spam.', badge1: 'Apprendimento Personalizzato', badge2: 'Tecnologia AI Adattiva', badge3: 'Sicuro & Affidabile', success: 'Sei nella lista!', successSub: 'Ti avviseremo non appena apriamo.', duplicate: 'Già iscritto!', duplicateSub: 'Questa email è già nella lista.', error: 'Qualcosa è andato storto. Riprova.' },
  es: { coming: 'PRÓXIMAMENTE', sub1: 'El futuro del aprendizaje es personalizado.', sub2: 'Tutores de IA que te entienden. Te enseñan. Te elevan.', placeholder: 'Ingresa tu email', cta: 'NOTIFÍCAME', privacy: 'Respetamos tu privacidad. Sin spam.', badge1: 'Aprendizaje Personalizado', badge2: 'Tecnología IA Adaptiva', badge3: 'Confiable y Seguro', success: '¡Estás en la lista!', successSub: 'Te avisaremos en cuanto abramos.', duplicate: '¡Ya registrado!', duplicateSub: 'Este email ya está en la lista.', error: 'Algo salió mal. Inténtalo de nuevo.' },
  fr: { coming: 'BIENTÔT', sub1: 'L\'avenir de l\'apprentissage est personnalisé.', sub2: 'Des tuteurs IA qui te comprennent. T\'enseignent. T\'élèvent.', placeholder: 'Entre ton adresse email', cta: 'ME NOTIFIER', privacy: 'Nous respectons ta vie privée. Zéro spam.', badge1: 'Apprentissage Personnalisé', badge2: 'Technologie IA Adaptative', badge3: 'Sécurisé & Fiable', success: 'Tu es sur la liste !', successSub: 'On te préviendra dès qu\'on ouvre.', duplicate: 'Déjà inscrit !', duplicateSub: 'Cet email est déjà sur la liste.', error: 'Une erreur est survenue. Réessaie.' },
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

// ── Floating language bubbles ─────────────────────────────────────────────────
const LEFT_LANGS  = [
  { flag: '🇺🇸', label: 'English'    },
  { flag: '🇪🇸', label: 'Spanish'    },
  { flag: '🇫🇷', label: 'French'     },
  { flag: '🇮🇹', label: 'Italian'    },
  { flag: '🇩🇪', label: 'German'     },
];
const RIGHT_LANGS = [
  { flag: '🇧🇷', label: 'Portuguese' },
  { flag: '🇸🇦', label: 'Arabic'     },
  { flag: '🇯🇵', label: 'Japanese'   },
  { flag: '🇰🇷', label: 'Korean'     },
  { flag: '🇨🇳', label: 'Chinese'    },
];

const TUTORS = [
  { src: '/tutors/Tutor-3.png', z: 10,  scale: 0.82 },
  { src: '/tutors/Tutor-1.png', z: 20,  scale: 0.90 },
  { src: '/tutors/Tutor-5.png', z: 30,  scale: 1.00 },
  { src: '/tutors/Tutor-2.png', z: 20,  scale: 0.90 },
  { src: '/tutors/Tutor-4.png', z: 10,  scale: 0.82 },
];

function FloatingBubble({ flag, label, delay, side }: { flag: string; label: string; delay: number; side: 'left' | 'right' }) {
  return (
    <div
      className="flex flex-col items-center gap-1.5 select-none"
      style={{
        animation: `float-${side} ${5 + delay * 0.7}s ease-in-out infinite`,
        animationDelay: `${delay * 0.4}s`,
      }}
    >
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/70 backdrop-blur-md border border-white/80 shadow-lg shadow-purple-200/40 flex items-center justify-center text-3xl md:text-4xl">
        {flag}
      </div>
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
    </div>
  );
}

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
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      {/* Float keyframes injected once */}
      <style>{`
        @keyframes float-left  { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        @keyframes float-right { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)}  }
        @keyframes breathe     { 0%,100%{transform:scaleY(1)}       50%{transform:scaleY(1.012)}     }
      `}</style>

      <div className="relative min-h-screen overflow-hidden bg-[#f0f0ff]" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* ── Video background ── */}
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/coming-soon-banner.mp4"
        />
        {/* very subtle light overlay so text stays readable */}
        <div className="absolute inset-0 bg-white/10" />

        {/* ── Page layout ── */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-between px-4 py-8 md:py-10">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-400/40">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-slate-800 tracking-tight">ChatLingo</span>
          </div>

          {/* Main content */}
          <div className="flex flex-col items-center text-center w-full max-w-5xl gap-0">

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-3"
              style={{ background: 'linear-gradient(135deg, #6c3de8 0%, #8b5cf6 50%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t.coming}
            </h1>
            <p className="text-slate-700 font-semibold text-base md:text-lg mb-1">{t.sub1}</p>
            <p className="text-slate-400 text-sm md:text-base mb-6">{t.sub2}</p>

            {/* Tutors + floating bubbles */}
            <div className="relative flex items-end justify-center w-full">

              {/* Left bubbles */}
              <div className="hidden md:flex flex-col gap-5 mr-6 mb-8 items-end">
                {LEFT_LANGS.map((l, i) => (
                  <FloatingBubble key={l.label} flag={l.flag} label={l.label} delay={i} side="left" />
                ))}
              </div>

              {/* Tutors row */}
              <div className="flex items-end justify-center gap-0 md:gap-1">
                {TUTORS.map((tutor, i) => {
                  const isCenter = i === 2;
                  const height = isCenter ? 320 : i === 1 || i === 3 ? 280 : 240;
                  return (
                    <div
                      key={i}
                      className="relative flex-shrink-0"
                      style={{
                        zIndex: tutor.z,
                        width: height * 0.65,
                        height: height,
                        animation: `breathe ${3.5 + i * 0.3}s ease-in-out infinite`,
                        animationDelay: `${i * 0.5}s`,
                      }}
                    >
                      <Image
                        src={tutor.src}
                        alt="Tutor"
                        fill
                        className="object-cover object-top"
                        style={{ borderRadius: '50% 50% 0 0' }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Right bubbles */}
              <div className="hidden md:flex flex-col gap-5 ml-6 mb-8 items-start">
                {RIGHT_LANGS.map((l, i) => (
                  <FloatingBubble key={l.label} flag={l.flag} label={l.label} delay={i} side="right" />
                ))}
              </div>
            </div>

            {/* Waitlist card */}
            <div className="w-full max-w-lg bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl shadow-purple-200/30 px-6 py-5 -mt-2">

              {status === 'success' ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="font-bold text-slate-800">{t.success}</p>
                  <p className="text-sm text-slate-500">{t.successSub}</p>
                </div>
              ) : status === 'duplicate' ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-11 h-11 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="font-bold text-slate-800">{t.duplicate}</p>
                  <p className="text-sm text-slate-500">{t.duplicateSub}</p>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
                    <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.placeholder}
                        className="flex-1 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors disabled:opacity-60 shadow-md shadow-indigo-300/40 whitespace-nowrap"
                    >
                      {status === 'loading' ? '...' : t.cta}
                    </button>
                  </form>
                  {status === 'error' && <p className="text-red-500 text-xs text-center mb-2">{t.error}</p>}
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t.privacy}</span>
                  </div>
                </>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-5">
              {[
                { icon: <Users className="w-4 h-4 text-slate-500" />,     label: t.badge1 },
                { icon: <Cpu className="w-4 h-4 text-slate-500" />,       label: t.badge2 },
                { icon: <ShieldCheck className="w-4 h-4 text-slate-500" />, label: t.badge3 },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                  {b.icon}
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-slate-400 text-xs">© 2026 ChatLingo. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}
