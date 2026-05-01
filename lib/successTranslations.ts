export type SuccessTranslation = {
  paymentSuccessful: string;
  subscriptionActive: string;
};

const en: SuccessTranslation = {
  paymentSuccessful: 'Payment successful!',
  subscriptionActive: 'Your subscription is now active. Redirecting to dashboard...',
};

const it: SuccessTranslation = {
  paymentSuccessful: 'Pagamento riuscito!',
  subscriptionActive: 'Il tuo abbonamento è ora attivo. Reindirizzamento alla dashboard...',
};

const es: SuccessTranslation = {
  paymentSuccessful: '¡Pago exitoso!',
  subscriptionActive: 'Tu suscripción ya está activa. Redirigiendo al panel...',
};

const fr: SuccessTranslation = {
  paymentSuccessful: 'Paiement réussi !',
  subscriptionActive: 'Votre abonnement est maintenant actif. Redirection vers le tableau de bord...',
};

const de: SuccessTranslation = {
  paymentSuccessful: 'Zahlung erfolgreich!',
  subscriptionActive: 'Dein Abonnement ist jetzt aktiv. Weiterleitung zum Dashboard...',
};

const pt: SuccessTranslation = {
  paymentSuccessful: 'Pagamento bem-sucedido!',
  subscriptionActive: 'Sua assinatura está ativa. Redirecionando para o painel...',
};

const ja: SuccessTranslation = {
  paymentSuccessful: 'お支払いが完了しました！',
  subscriptionActive: 'サブスクリプションが有効になりました。ダッシュボードにリダイレクトしています...',
};

const zh: SuccessTranslation = {
  paymentSuccessful: '支付成功！',
  subscriptionActive: '您的订阅现已激活。正在跳转到仪表板...',
};

const ko: SuccessTranslation = {
  paymentSuccessful: '결제 성공!',
  subscriptionActive: '구독이 활성화되었습니다. 대시보드로 이동 중...',
};

const ru: SuccessTranslation = {
  paymentSuccessful: 'Оплата прошла успешно!',
  subscriptionActive: 'Ваша подписка активна. Перенаправление на панель управления...',
};

const ar: SuccessTranslation = {
  paymentSuccessful: 'تم الدفع بنجاح!',
  subscriptionActive: 'اشتراكك نشط الآن. جارٍ التحويل إلى لوحة التحكم...',
};

const hi: SuccessTranslation = {
  paymentSuccessful: 'भुगतान सफल!',
  subscriptionActive: 'आपकी सदस्यता अब सक्रिय है। डैशबोर्ड पर पुनर्निर्देशित हो रहा है...',
};

const tr: SuccessTranslation = {
  paymentSuccessful: 'Ödeme başarılı!',
  subscriptionActive: 'Aboneliğiniz artık aktif. Panoya yönlendiriliyor...',
};

const nl: SuccessTranslation = {
  paymentSuccessful: 'Betaling geslaagd!',
  subscriptionActive: 'Je abonnement is nu actief. Doorverwijzen naar dashboard...',
};

const pl: SuccessTranslation = {
  paymentSuccessful: 'Płatność zakończona sukcesem!',
  subscriptionActive: 'Twoja subskrypcja jest teraz aktywna. Przekierowanie do pulpitu...',
};

const translations: Record<string, SuccessTranslation> = {
  en, it, es, fr, de, pt, ja, zh, ko, ru, ar, hi, tr, nl, pl,
};

export function getSuccessT(lang: string): SuccessTranslation {
  return translations[lang] ?? translations['en'];
}
