export type PaywallTranslation = {
  sessionOver: string;
  completedAssessment: (tutorName: string) => string;
  seePlans: string;
  backToDashboard: string;
};

const en: PaywallTranslation = {
  sessionOver: 'Your free session is over',
  completedAssessment: (t) => `You've completed your free assessment with ${t}. Upgrade to keep practicing.`,
  seePlans: 'See plans',
  backToDashboard: 'Back to Dashboard',
};

const it: PaywallTranslation = {
  sessionOver: 'La tua sessione gratuita è terminata',
  completedAssessment: (t) => `Hai completato la valutazione gratuita con ${t}. Abbonati per continuare.`,
  seePlans: 'Vedi i piani',
  backToDashboard: 'Torna alla Dashboard',
};

const es: PaywallTranslation = {
  sessionOver: 'Tu sesión gratuita ha terminado',
  completedAssessment: (t) => `Has completado tu evaluación gratuita con ${t}. Actualiza para seguir practicando.`,
  seePlans: 'Ver planes',
  backToDashboard: 'Volver al Dashboard',
};

const fr: PaywallTranslation = {
  sessionOver: 'Votre session gratuite est terminée',
  completedAssessment: (t) => `Vous avez terminé votre évaluation gratuite avec ${t}. Passez à la version supérieure pour continuer.`,
  seePlans: 'Voir les plans',
  backToDashboard: 'Retour au tableau de bord',
};

const de: PaywallTranslation = {
  sessionOver: 'Deine kostenlose Sitzung ist beendet',
  completedAssessment: (t) => `Du hast deine kostenlose Bewertung mit ${t} abgeschlossen. Upgrade, um weiter zu üben.`,
  seePlans: 'Pläne ansehen',
  backToDashboard: 'Zurück zum Dashboard',
};

const pt: PaywallTranslation = {
  sessionOver: 'Sua sessão gratuita acabou',
  completedAssessment: (t) => `Você completou sua avaliação gratuita com ${t}. Faça upgrade para continuar praticando.`,
  seePlans: 'Ver planos',
  backToDashboard: 'Voltar ao Dashboard',
};

const ja: PaywallTranslation = {
  sessionOver: '無料セッションが終了しました',
  completedAssessment: (t) => `${t}との無料評価が完了しました。練習を続けるにはアップグレードしてください。`,
  seePlans: 'プランを見る',
  backToDashboard: 'ダッシュボードに戻る',
};

const zh: PaywallTranslation = {
  sessionOver: '您的免费课程已结束',
  completedAssessment: (t) => `您已完成与${t}的免费评估。升级以继续练习。`,
  seePlans: '查看计划',
  backToDashboard: '返回仪表板',
};

const ko: PaywallTranslation = {
  sessionOver: '무료 세션이 종료되었습니다',
  completedAssessment: (t) => `${t}와의 무료 평가를 완료했습니다. 계속 연습하려면 업그레이드하세요.`,
  seePlans: '플랜 보기',
  backToDashboard: '대시보드로 돌아가기',
};

const ru: PaywallTranslation = {
  sessionOver: 'Ваш бесплатный сеанс завершён',
  completedAssessment: (t) => `Вы завершили бесплатную оценку с ${t}. Обновитесь, чтобы продолжить практику.`,
  seePlans: 'Смотреть планы',
  backToDashboard: 'Назад к панели',
};

const ar: PaywallTranslation = {
  sessionOver: 'انتهت جلستك المجانية',
  completedAssessment: (t) => `لقد أكملت تقييمك المجاني مع ${t}. قم بالترقية لمواصلة التدريب.`,
  seePlans: 'عرض الخطط',
  backToDashboard: 'العودة إلى لوحة التحكم',
};

const hi: PaywallTranslation = {
  sessionOver: 'आपका मुफ्त सत्र समाप्त हो गया',
  completedAssessment: (t) => `आपने ${t} के साथ अपना मुफ्त मूल्यांकन पूरा कर लिया। अभ्यास जारी रखने के लिए अपग्रेड करें।`,
  seePlans: 'प्लान देखें',
  backToDashboard: 'डैशबोर्ड पर वापस जाएं',
};

const tr: PaywallTranslation = {
  sessionOver: 'Ücretsiz oturumunuz sona erdi',
  completedAssessment: (t) => `${t} ile ücretsiz değerlendirmenizi tamamladınız. Pratik yapmaya devam etmek için yükseltin.`,
  seePlans: 'Planları gör',
  backToDashboard: 'Panoya dön',
};

const nl: PaywallTranslation = {
  sessionOver: 'Je gratis sessie is voorbij',
  completedAssessment: (t) => `Je hebt je gratis beoordeling met ${t} voltooid. Upgrade om te blijven oefenen.`,
  seePlans: 'Plannen bekijken',
  backToDashboard: 'Terug naar dashboard',
};

const pl: PaywallTranslation = {
  sessionOver: 'Twoja bezpłatna sesja dobiegła końca',
  completedAssessment: (t) => `Ukończyłeś bezpłatną ocenę z ${t}. Ulepsz konto, aby kontynuować ćwiczenia.`,
  seePlans: 'Zobacz plany',
  backToDashboard: 'Wróć do pulpitu',
};

const translations: Record<string, PaywallTranslation> = {
  en, it, es, fr, de, pt, ja, zh, ko, ru, ar, hi, tr, nl, pl,
};

export function getPaywallT(lang: string): PaywallTranslation {
  return translations[lang] ?? translations['en'];
}
