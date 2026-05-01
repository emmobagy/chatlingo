'use client';

import { useEffect, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useUILanguage } from '@/contexts/UILanguageContext';

const messages: Record<string, { title: string; body: string; dismiss: string }> = {
  en: {
    title: 'Ad blocker detected',
    body: 'We noticed you have an ad blocker active. Please disable it for this site to ensure everything works correctly.',
    dismiss: 'Got it',
  },
  it: {
    title: 'Ad blocker rilevato',
    body: 'Abbiamo notato che hai un ad blocker attivo. Ti consigliamo di disattivarlo per questo sito per garantire il corretto funzionamento.',
    dismiss: 'Ok, capito',
  },
  es: {
    title: 'Ad blocker detectado',
    body: 'Hemos detectado que tienes un ad blocker activo. Te recomendamos desactivarlo para este sitio.',
    dismiss: 'Entendido',
  },
  fr: {
    title: 'Bloqueur de publicités détecté',
    body: 'Nous avons détecté un bloqueur de publicités actif. Désactivez-le pour ce site afin que tout fonctionne correctement.',
    dismiss: 'Compris',
  },
  de: {
    title: 'Werbeblocker erkannt',
    body: 'Wir haben einen aktiven Werbeblocker festgestellt. Bitte deaktiviere ihn für diese Seite.',
    dismiss: 'Verstanden',
  },
  pt: {
    title: 'Bloqueador de anúncios detectado',
    body: 'Detectámos um bloqueador de anúncios ativo. Por favor, desative-o para este site.',
    dismiss: 'Entendi',
  },
  ja: { title: '広告ブロッカーを検出', body: '広告ブロッカーが有効です。このサイトでは無効にしてください。', dismiss: 'わかりました' },
  zh: { title: '检测到广告拦截器', body: '我们检测到您启用了广告拦截器，请为本站禁用以确保正常使用。', dismiss: '好的' },
  ko: { title: '광고 차단기 감지됨', body: '광고 차단기가 활성화되어 있습니다. 이 사이트에서는 비활성화해 주세요.', dismiss: '확인' },
  ru: { title: 'Обнаружен блокировщик рекламы', body: 'Обнаружен активный блокировщик рекламы. Отключите его для этого сайта.', dismiss: 'Понятно' },
  ar: { title: 'تم اكتشاف مانع إعلانات', body: 'لاحظنا أنك تستخدم مانع إعلانات. يُرجى تعطيله لهذا الموقع.', dismiss: 'حسناً' },
  hi: { title: 'एड ब्लॉकर मिला', body: 'हमने पाया कि आपका एड ब्लॉकर चालू है। सही काम के लिए इसे इस साइट पर बंद करें।', dismiss: 'ठीक है' },
  tr: { title: 'Reklam engelleyici algılandı', body: 'Reklam engelleyicinizin açık olduğunu fark ettik. Lütfen bu site için devre dışı bırakın.', dismiss: 'Anladım' },
  nl: { title: 'Adblocker gedetecteerd', body: 'We hebben een actieve adblocker gedetecteerd. Schakel deze uit voor deze site.', dismiss: 'Begrepen' },
  pl: { title: 'Wykryto adblocker', body: 'Wykryliśmy aktywny adblocker. Wyłącz go dla tej strony.', dismiss: 'Rozumiem' },
};

export default function AdBlockerBanner() {
  const [visible, setVisible] = useState(false);
  const { uiLang } = useUILanguage();
  const m = messages[uiLang] ?? messages['en'];

  useEffect(() => {
    if (sessionStorage.getItem('adblock-dismissed')) return;

    // DOM-based detection: inject a bait element with class names ad blockers hide.
    // No network request → no AbortError in the dev overlay.
    const bait = document.createElement('div');
    bait.setAttribute(
      'class',
      'ad-banner ads adsbox ad-placement doubleclick',
    );
    bait.style.cssText =
      'width:1px;height:1px;position:absolute;left:-9999px;top:-9999px;';
    document.body.appendChild(bait);

    // Give the ad blocker a tick to apply its CSS/hide rules
    const timer = setTimeout(() => {
      const style = window.getComputedStyle(bait);
      const blocked =
        bait.offsetHeight === 0 ||
        bait.offsetWidth === 0 ||
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0';
      document.body.removeChild(bait);
      if (blocked) setVisible(true);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (document.body.contains(bait)) document.body.removeChild(bait);
    };
  }, []);

  function dismiss() {
    sessionStorage.setItem('adblock-dismissed', '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 border border-white/10">
        <div className="shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{m.title}</p>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">{m.body}</p>
        </div>
        <button
          onClick={dismiss}
          className="shrink-0 text-gray-400 hover:text-white transition-colors mt-0.5"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
