'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageCircle, Send, Check, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUILanguage } from '@/contexts/UILanguageContext';

const T: Record<string, {
  headline: string;
  sub: string;
  placeholder: string;
  cta: string;
  success: string;
  successSub: string;
  duplicate: string;
  duplicateSub: string;
  error: string;
  legal: string;
}> = {
  en: {
    headline: "We're launching soon.",
    sub: "AI tutors that speak with you, correct you, and help you truly master a new language. Be the first to know.",
    placeholder: "your@email.com",
    cta: "Join the waitlist",
    success: "You're on the list!",
    successSub: "We'll notify you as soon as we open.",
    duplicate: "Already signed up!",
    duplicateSub: "Your email is already on the waitlist.",
    error: "Something went wrong. Try again.",
    legal: "No spam. One email when we're ready.",
  },
  it: {
    headline: "Stiamo arrivando.",
    sub: "Tutor AI che parlano con te, ti correggono e ti aiutano a padroneggiare davvero una nuova lingua. Sii il primo a saperlo.",
    placeholder: "la-tua@email.com",
    cta: "Unisciti alla lista d'attesa",
    success: "Sei nella lista!",
    successSub: "Ti avviseremo non appena apriamo.",
    duplicate: "Sei già iscritto!",
    duplicateSub: "Questa email è già nella lista d'attesa.",
    error: "Qualcosa è andato storto. Riprova.",
    legal: "Niente spam. Solo un'email quando siamo pronti.",
  },
  es: {
    headline: "Llegamos pronto.",
    sub: "Tutores de IA que hablan contigo, te corrigen y te ayudan a dominar realmente un nuevo idioma. Sé el primero en saberlo.",
    placeholder: "tu@email.com",
    cta: "Únete a la lista de espera",
    success: "¡Estás en la lista!",
    successSub: "Te avisaremos en cuanto abramos.",
    duplicate: "¡Ya estás registrado!",
    duplicateSub: "Este email ya está en la lista de espera.",
    error: "Algo salió mal. Inténtalo de nuevo.",
    legal: "Sin spam. Solo un email cuando estemos listos.",
  },
  fr: {
    headline: "On arrive bientôt.",
    sub: "Des tuteurs IA qui parlent avec toi, te corrigent et t'aident à maîtriser vraiment une nouvelle langue. Sois le premier informé.",
    placeholder: "ton@email.com",
    cta: "Rejoindre la liste d'attente",
    success: "Tu es sur la liste !",
    successSub: "On te préviendra dès qu'on ouvre.",
    duplicate: "Déjà inscrit !",
    duplicateSub: "Cet email est déjà sur la liste.",
    error: "Quelque chose s'est mal passé. Réessaie.",
    legal: "Pas de spam. Un seul email quand on est prêt.",
  },
  de: {
    headline: "Wir kommen bald.",
    sub: "KI-Tutoren, die mit dir sprechen, dich korrigieren und dir helfen, eine neue Sprache wirklich zu meistern. Sei der Erste, der es erfährt.",
    placeholder: "deine@email.com",
    cta: "Warteliste beitreten",
    success: "Du bist auf der Liste!",
    successSub: "Wir benachrichtigen dich, sobald wir öffnen.",
    duplicate: "Bereits angemeldet!",
    duplicateSub: "Diese E-Mail ist bereits auf der Warteliste.",
    error: "Etwas ist schiefgelaufen. Versuch es nochmal.",
    legal: "Kein Spam. Nur eine E-Mail wenn wir bereit sind.",
  },
  pt: {
    headline: "Chegamos em breve.",
    sub: "Tutores de IA que falam com você, te corrigem e te ajudam a dominar de verdade um novo idioma. Seja o primeiro a saber.",
    placeholder: "seu@email.com",
    cta: "Entrar na lista de espera",
    success: "Você está na lista!",
    successSub: "Avisaremos assim que abrirmos.",
    duplicate: "Já inscrito!",
    duplicateSub: "Este email já está na lista de espera.",
    error: "Algo deu errado. Tente novamente.",
    legal: "Sem spam. Só um email quando estivermos prontos.",
  },
  ja: {
    headline: "もうすぐリリース。",
    sub: "あなたと話し、修正し、新しい言語を本当に習得できるようサポートするAIチューター。最初に知らせを受け取ろう。",
    placeholder: "your@email.com",
    cta: "ウェイティングリストに参加",
    success: "リストに登録されました！",
    successSub: "オープン時にお知らせします。",
    duplicate: "既に登録済みです！",
    duplicateSub: "このメールアドレスは既にリストにあります。",
    error: "エラーが発生しました。もう一度お試しください。",
    legal: "スパムなし。準備ができたら一度だけメールします。",
  },
  zh: {
    headline: "即将上线。",
    sub: "与你对话、纠正你、帮你真正掌握一门新语言的AI家教。抢先获得通知。",
    placeholder: "your@email.com",
    cta: "加入候补名单",
    success: "您已加入名单！",
    successSub: "我们开放时会立即通知您。",
    duplicate: "已经注册！",
    duplicateSub: "此邮箱已在候补名单中。",
    error: "出了点问题，请重试。",
    legal: "无垃圾邮件。准备好后发送一封邮件。",
  },
  ko: {
    headline: "곧 출시됩니다.",
    sub: "함께 대화하고, 교정해주고, 새로운 언어를 진짜로 마스터할 수 있도록 도와주는 AI 튜터. 가장 먼저 알아보세요.",
    placeholder: "your@email.com",
    cta: "대기자 명단 참여",
    success: "명단에 등록되었습니다!",
    successSub: "오픈하면 바로 알려드리겠습니다.",
    duplicate: "이미 등록되었습니다!",
    duplicateSub: "이 이메일은 이미 대기자 명단에 있습니다.",
    error: "문제가 발생했습니다. 다시 시도해주세요.",
    legal: "스팸 없음. 준비되면 이메일 한 통만 드립니다.",
  },
  ru: {
    headline: "Скоро открываемся.",
    sub: "ИИ-репетиторы, которые разговаривают с тобой, исправляют тебя и помогают по-настоящему освоить новый язык. Узнай первым.",
    placeholder: "your@email.com",
    cta: "Войти в список ожидания",
    success: "Ты в списке!",
    successSub: "Уведомим, как только откроемся.",
    duplicate: "Уже зарегистрирован!",
    duplicateSub: "Этот email уже в списке ожидания.",
    error: "Что-то пошло не так. Попробуй снова.",
    legal: "Никакого спама. Одно письмо, когда будем готовы.",
  },
  ar: {
    headline: "نطلق قريباً.",
    sub: "مدرسون بالذكاء الاصطناعي يتحدثون معك ويصححون أخطاءك ويساعدونك على إتقان لغة جديدة حقاً. كن أول من يعلم.",
    placeholder: "بريدك@email.com",
    cta: "انضم إلى قائمة الانتظار",
    success: "أنت في القائمة!",
    successSub: "سنخبرك فور الافتتاح.",
    duplicate: "مسجل بالفعل!",
    duplicateSub: "هذا البريد موجود بالفعل في القائمة.",
    error: "حدث خطأ ما. حاول مرة أخرى.",
    legal: "لا بريد مزعج. رسالة واحدة فقط عند الاستعداد.",
  },
  hi: {
    headline: "जल्द आ रहे हैं।",
    sub: "AI ट्यूटर जो आपसे बात करते हैं, सुधार करते हैं और एक नई भाषा सच में सीखने में मदद करते हैं। सबसे पहले जानें।",
    placeholder: "your@email.com",
    cta: "प्रतीक्षा सूची में शामिल हों",
    success: "आप सूची में हैं!",
    successSub: "खुलने पर हम आपको सूचित करेंगे।",
    duplicate: "पहले से पंजीकृत!",
    duplicateSub: "यह ईमेल पहले से सूची में है।",
    error: "कुछ गलत हुआ। फिर कोशिश करें।",
    legal: "कोई स्पैम नहीं। तैयार होने पर एक ईमेल।",
  },
  tr: {
    headline: "Yakında geliyoruz.",
    sub: "Seninle konuşan, seni düzelten ve yeni bir dili gerçekten öğrenmene yardımcı olan AI öğretmenler. İlk sen öğren.",
    placeholder: "senin@email.com",
    cta: "Bekleme listesine katıl",
    success: "Listedesin!",
    successSub: "Açıldığımızda seni bilgilendireceğiz.",
    duplicate: "Zaten kayıtlısın!",
    duplicateSub: "Bu e-posta zaten bekleme listesinde.",
    error: "Bir şeyler yanlış gitti. Tekrar dene.",
    legal: "Spam yok. Hazır olduğumuzda tek bir e-posta.",
  },
  nl: {
    headline: "We komen eraan.",
    sub: "AI-tutors die met je praten, je corrigeren en je helpen een nieuwe taal echt te beheersen. Wees de eerste die het weet.",
    placeholder: "jouw@email.com",
    cta: "Aanmelden voor de wachtlijst",
    success: "Je staat op de lijst!",
    successSub: "We laten je weten zodra we openen.",
    duplicate: "Al aangemeld!",
    duplicateSub: "Dit e-mailadres staat al op de wachtlijst.",
    error: "Er ging iets mis. Probeer het opnieuw.",
    legal: "Geen spam. Één e-mail als we klaar zijn.",
  },
  pl: {
    headline: "Już wkrótce.",
    sub: "Tutorzy AI, którzy rozmawiają z tobą, poprawiają cię i pomagają naprawdę opanować nowy język. Dowiedz się jako pierwszy.",
    placeholder: "twoj@email.com",
    cta: "Dołącz do listy oczekujących",
    success: "Jesteś na liście!",
    successSub: "Powiadomimy cię, gdy się otworzymy.",
    duplicate: "Już zapisany!",
    duplicateSub: "Ten email jest już na liście oczekujących.",
    error: "Coś poszło nie tak. Spróbuj ponownie.",
    legal: "Żadnego spamu. Jeden email gdy będziemy gotowi.",
  },
};

const TUTORS = [
  { id: 't1', src: '/tutors/Tutor-2.png', name: 'Sofia' },
  { id: 't2', src: '/tutors/Tutor-4.png', name: 'Amara' },
  { id: 't5', src: '/tutors/Tutor-1.png', name: 'James' },
  { id: 't3', src: '/tutors/Tutor-6.png', name: 'Yuki' },
  { id: 't6', src: '/tutors/Tutor-3.png', name: 'Marcus' },
];

function TutorCard({ src, name, delay }: { src: string; name: string; delay: number }) {
  const [waving, setWaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        setWaving(true);
        setTimeout(() => setWaving(false), 1200);
      }, 4000 + delay * 500);
      return () => clearInterval(iv);
    }, delay * 600);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white/40 shadow-xl transition-transform duration-300 ${waving ? 'scale-110' : 'scale-100'}`}>
        <Image src={src} alt={name} fill className="object-cover object-top" />
      </div>
      <div className={`absolute -top-1 -right-1 text-base transition-all duration-300 ${waving ? 'opacity-100 rotate-12' : 'opacity-0 rotate-0'}`}>👋</div>
      <span className="text-[11px] font-medium text-white/60">{name}</span>
    </div>
  );
}

export default function ComingSoonPage() {
  const { uiLang, mounted } = useUILanguage();
  const t = T[mounted ? uiLang : 'en'] ?? T['en'];

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const q = query(collection(db, 'waitlist'), where('email', '==', email.toLowerCase().trim()));
      const existing = await getDocs(q);
      if (!existing.empty) { setStatus('duplicate'); return; }
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

  const isRTL = uiLang === 'ar';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f]" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Video background */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-90"
        src="/coming-soon-banner.mp4"
      />

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-between px-4 py-10">

        {/* Top — Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">ChatLingo</span>
        </div>

        {/* Center — Main content */}
        <div className="flex flex-col items-center text-center max-w-xl w-full gap-8">

          {/* Tutors */}
          <div className="flex items-end gap-5 md:gap-7">
            {TUTORS.map((tutor, i) => (
              <div key={tutor.id} className="relative" style={{ transform: `translateY(${i % 2 === 0 ? '0px' : '-6px'})` }}>
                <TutorCard src={tutor.src} name={tutor.name} delay={i} />
              </div>
            ))}
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
              {t.headline}
            </h1>
            <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-md mx-auto">
              {t.sub}
            </p>
          </div>

          {/* Waitlist form */}
          <div className="w-full max-w-sm">
            {status === 'success' ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-12 h-12 bg-green-500/20 border border-green-400/30 rounded-full flex items-center justify-center mb-1">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-white font-semibold text-lg">{t.success}</p>
                <p className="text-white/50 text-sm">{t.successSub}</p>
              </div>
            ) : status === 'duplicate' ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-400/30 rounded-full flex items-center justify-center mb-1">
                  <Check className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-white font-semibold text-lg">{t.duplicate}</p>
                <p className="text-white/50 text-sm">{t.duplicateSub}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.placeholder}
                    className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all backdrop-blur-sm"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 flex items-center gap-2 shrink-0 shadow-lg shadow-indigo-500/30"
                  >
                    {status === 'loading'
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </button>
                </div>
                {status === 'error' && <p className="text-red-400 text-xs text-center">{t.error}</p>}
                <p className="text-white/30 text-xs text-center">{t.legal}</p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom — copyright */}
        <p className="text-white/20 text-xs">© 2026 ChatLingo. All rights reserved.</p>
      </div>
    </div>
  );
}
