export interface DailyGoalT {
  // Goal picker
  setGoalTitle: string;
  setGoalSubtitle: string;
  minPerDay: (n: number) => string;
  saveGoal: string;

  // Progress bar
  todayProgress: string;
  minutesDone: (done: number, goal: number) => string;
  goalComplete: string;

  // Motivational card (minutes remaining)
  remainingTitle: (mins: number) => string;
  remainingMessages: string[];   // pick one randomly
  continueBtn: string;

  // Completion card
  completedTitle: string;
  completedMessages: string[];   // pick one randomly
  seeYouTomorrow: string;
}

type LangMap = Record<string, DailyGoalT>;

const t: LangMap = {
  en: {
    setGoalTitle: 'Set your daily goal',
    setGoalSubtitle: 'How many minutes can you commit to every day?',
    minPerDay: (n) => `${n} min / day`,
    saveGoal: 'Save',
    todayProgress: "Today's practice",
    minutesDone: (d, g) => `${d} of ${g} min`,
    goalComplete: 'Daily goal reached!',
    remainingTitle: (m) => `${m} minute${m !== 1 ? 's' : ''} left today`,
    remainingMessages: [
      "You've already started, and finishing takes less effort than starting. You're almost there.",
      "Languages are built one small session at a time. These few minutes matter more than you think.",
      "Consistency beats intensity every time. A short session today keeps the habit alive.",
      "You wouldn't stop reading a book two pages before the chapter ends. Same idea here.",
      "Your brain already warmed up today. These last minutes are the easiest ones.",
    ],
    continueBtn: 'Continue practicing',
    completedTitle: "Today's done. Well done.",
    completedMessages: [
      "You showed up and did the work. That's what progress looks like, see you tomorrow.",
      "Another day of practice in the books. Don't worry if it wasn't perfect; perfect isn't the point. See you tomorrow.",
      "Finished! You're building something real here. Rest, and we'll pick up where we left off tomorrow.",
      "Done for today. Every session makes the next one a little easier. Tomorrow we continue.",
      "That's a wrap. Languages don't come from motivation, they come from days like today. See you tomorrow.",
    ],
    seeYouTomorrow: 'See you tomorrow',
  },

  it: {
    setGoalTitle: 'Imposta il tuo obiettivo giornaliero',
    setGoalSubtitle: 'Quanti minuti riesci a dedicare ogni giorno?',
    minPerDay: (n) => `${n} min / giorno`,
    saveGoal: 'Salva',
    todayProgress: 'Pratica di oggi',
    minutesDone: (d, g) => `${d} di ${g} min`,
    goalComplete: 'Obiettivo giornaliero raggiunto!',
    remainingTitle: (m) => `${m} minut${m !== 1 ? 'i' : 'o'} rimasti oggi`,
    remainingMessages: [
      "Hai già iniziato e finire richiede meno sforzo che iniziare. Sei quasi arrivato.",
      "Le lingue si costruiscono un piccolo passo alla volta. Questi minuti contano più di quanto pensi.",
      "La costanza batte l'intensità ogni volta. Una sessione breve oggi mantiene viva l'abitudine.",
      "Non ti fermeresti a leggere un libro due pagine prima della fine del capitolo. Stesso principio.",
      "Il tuo cervello si è già riscaldato oggi. Questi ultimi minuti sono i più facili.",
    ],
    continueBtn: 'Continua a praticare',
    completedTitle: 'Per oggi hai finito. Ottimo lavoro.',
    completedMessages: [
      "Ti sei presentato e hai fatto il tuo. Così si costruisce il progresso, a domani.",
      "Un altro giorno di pratica completato. Non importa se non è stato perfetto; il perfetto non è l'obiettivo. A domani.",
      "Fatto! Stai costruendo qualcosa di reale. Riposati, e domani continuiamo da dove ci siamo fermati.",
      "Finito per oggi. Ogni sessione rende la prossima un po' più facile. Domani si continua.",
      "Ottimo. Le lingue non vengono dalla motivazione, vengono da giorni come questo. A domani.",
    ],
    seeYouTomorrow: 'A domani',
  },

  es: {
    setGoalTitle: 'Establece tu objetivo diario',
    setGoalSubtitle: '¿Cuántos minutos puedes dedicar cada día?',
    minPerDay: (n) => `${n} min / día`,
    saveGoal: 'Guardar',
    todayProgress: 'Práctica de hoy',
    minutesDone: (d, g) => `${d} de ${g} min`,
    goalComplete: '¡Objetivo diario alcanzado!',
    remainingTitle: (m) => `${m} minuto${m !== 1 ? 's' : ''} restante${m !== 1 ? 's' : ''} hoy`,
    remainingMessages: [
      "Ya empezaste, y terminar requiere menos esfuerzo que empezar. Ya casi llegas.",
      "Los idiomas se construyen una pequeña sesión a la vez. Estos minutos importan más de lo que crees.",
      "La constancia supera la intensidad siempre. Una sesión corta hoy mantiene vivo el hábito.",
      "No pararías de leer un libro dos páginas antes del final del capítulo. Mismo principio.",
      "Tu cerebro ya entró en calor hoy. Estos últimos minutos son los más fáciles.",
    ],
    continueBtn: 'Continuar practicando',
    completedTitle: 'Por hoy has terminado. Bien hecho.',
    completedMessages: [
      "Te presentaste e hiciste el trabajo. Así se ve el progreso, hasta mañana.",
      "Otro día de práctica completado. No importa si no fue perfecto; lo perfecto no es el objetivo. Hasta mañana.",
      "¡Listo! Estás construyendo algo real. Descansa y mañana continuamos donde lo dejamos.",
      "Terminado por hoy. Cada sesión hace la siguiente un poco más fácil. Mañana continuamos.",
      "Así se hace. Los idiomas no vienen de la motivación, vienen de días como hoy. Hasta mañana.",
    ],
    seeYouTomorrow: 'Hasta mañana',
  },

  fr: {
    setGoalTitle: 'Fixe ton objectif quotidien',
    setGoalSubtitle: 'Combien de minutes peux-tu consacrer chaque jour ?',
    minPerDay: (n) => `${n} min / jour`,
    saveGoal: 'Enregistrer',
    todayProgress: "Pratique d'aujourd'hui",
    minutesDone: (d, g) => `${d} sur ${g} min`,
    goalComplete: 'Objectif journalier atteint !',
    remainingTitle: (m) => `${m} minute${m !== 1 ? 's' : ''} restante${m !== 1 ? 's' : ''} aujourd'hui`,
    remainingMessages: [
      "Tu as déjà commencé, et finir demande moins d'effort que commencer. Tu y es presque.",
      "Les langues se construisent une petite session à la fois. Ces minutes comptent plus que tu ne le penses.",
      "La constance bat l'intensité à chaque fois. Une courte session aujourd'hui maintient l'habitude vivante.",
      "Tu ne t'arrêterais pas de lire un livre deux pages avant la fin du chapitre. Même principe.",
      "Ton cerveau s'est déjà échauffé aujourd'hui. Ces dernières minutes sont les plus faciles.",
    ],
    continueBtn: 'Continuer à pratiquer',
    completedTitle: "Pour aujourd'hui, c'est fait. Bravo.",
    completedMessages: [
      "Tu t'es montré et tu as fait le travail. C'est ça le progrès, à demain.",
      "Une autre journée de pratique complétée. Peu importe si ce n'était pas parfait ; le parfait n'est pas l'objectif. À demain.",
      "Terminé ! Tu construis quelque chose de réel. Repose-toi, et demain on reprend là où on s'est arrêtés.",
      "Fini pour aujourd'hui. Chaque session rend la suivante un peu plus facile. Demain on continue.",
      "Les langues ne viennent pas de la motivation, elles viennent de journées comme celle-ci. À demain.",
    ],
    seeYouTomorrow: 'À demain',
  },

  de: {
    setGoalTitle: 'Lege dein tägliches Ziel fest',
    setGoalSubtitle: 'Wie viele Minuten kannst du jeden Tag aufbringen?',
    minPerDay: (n) => `${n} Min. / Tag`,
    saveGoal: 'Speichern',
    todayProgress: 'Heutige Übung',
    minutesDone: (d, g) => `${d} von ${g} Min.`,
    goalComplete: 'Tagesziel erreicht!',
    remainingTitle: (m) => `Noch ${m} Minute${m !== 1 ? 'n' : ''} heute`,
    remainingMessages: [
      "Du hast schon angefangen, und aufzuhören erfordert weniger Aufwand als anzufangen. Du bist fast da.",
      "Sprachen werden eine kleine Einheit nach der anderen aufgebaut. Diese Minuten zählen mehr, als du denkst.",
      "Beständigkeit schlägt Intensität jedes Mal. Eine kurze Einheit heute hält die Gewohnheit am Leben.",
      "Du würdest ein Buch nicht zwei Seiten vor dem Kapitelende weglegen. Gleiches Prinzip.",
      "Dein Gehirn hat sich heute schon aufgewärmt. Diese letzten Minuten sind die einfachsten.",
    ],
    continueBtn: 'Weiter üben',
    completedTitle: 'Für heute geschafft. Gut gemacht.',
    completedMessages: [
      "Du warst dabei und hast die Arbeit erledigt. So sieht Fortschritt aus, bis morgen.",
      "Ein weiterer Übungstag abgehakt. Egal ob es perfekt war; perfekt ist nicht das Ziel. Bis morgen.",
      "Fertig! Du baust hier etwas Echtes auf. Ruh dich aus, und morgen machen wir weiter.",
      "Für heute erledigt. Jede Einheit macht die nächste ein bisschen leichter. Morgen geht es weiter.",
      "Sprachen entstehen nicht aus Motivation, sie entstehen aus Tagen wie diesem. Bis morgen.",
    ],
    seeYouTomorrow: 'Bis morgen',
  },

  pt: {
    setGoalTitle: 'Define o teu objetivo diário',
    setGoalSubtitle: 'Quantos minutos consegues dedicar todos os dias?',
    minPerDay: (n) => `${n} min / dia`,
    saveGoal: 'Guardar',
    todayProgress: 'Prática de hoje',
    minutesDone: (d, g) => `${d} de ${g} min`,
    goalComplete: 'Objetivo diário atingido!',
    remainingTitle: (m) => `${m} minuto${m !== 1 ? 's' : ''} restante${m !== 1 ? 's' : ''} hoje`,
    remainingMessages: [
      "Já começaste, e terminar exige menos esforço do que começar. Estás quase lá.",
      "As línguas constroem-se uma pequena sessão de cada vez. Estes minutos importam mais do que pensas.",
      "A consistência supera a intensidade sempre. Uma sessão curta hoje mantém o hábito vivo.",
      "Não paravas de ler um livro duas páginas antes do fim do capítulo. Mesmo princípio.",
      "O teu cérebro já aqueceu hoje. Estes últimos minutos são os mais fáceis.",
    ],
    continueBtn: 'Continuar a praticar',
    completedTitle: 'Por hoje está feito. Muito bem.',
    completedMessages: [
      "Apareceste e fizeste o trabalho. É assim que o progresso se parece, até amanhã.",
      "Mais um dia de prática concluído. Não importa se não foi perfeito; o perfeito não é o objetivo. Até amanhã.",
      "Feito! Estás a construir algo real. Descansa, e amanhã continuamos onde parámos.",
      "Terminado por hoje. Cada sessão torna a próxima um pouco mais fácil. Amanhã continuamos.",
      "As línguas não vêm da motivação, vêm de dias como este. Até amanhã.",
    ],
    seeYouTomorrow: 'Até amanhã',
  },

  ja: {
    setGoalTitle: '毎日の目標を設定する',
    setGoalSubtitle: '毎日何分続けられますか？',
    minPerDay: (n) => `${n}分 / 日`,
    saveGoal: '保存',
    todayProgress: '今日の練習',
    minutesDone: (d, g) => `${d} / ${g}分`,
    goalComplete: '今日の目標達成！',
    remainingTitle: (m) => `残り${m}分`,
    remainingMessages: [
      "もう始めてる。終わらせる方が始めるより簡単です。もう少しで完了！",
      "言語は少しずつ積み重なっていきます。この数分が思っている以上に大切です。",
      "継続は力なり。短いセッションでも習慣を守ることが大切です。",
      "本の残り2ページで読むのをやめないですよね？同じことです。",
      "今日はもう脳が慣れています。残りの数分が一番楽な部分です。",
    ],
    continueBtn: '練習を続ける',
    completedTitle: '今日は完了！よくできました。',
    completedMessages: [
      "やり遂げましたね。それが進歩です。また明日！",
      "また一日の練習が完了しました。完璧でなくていい。それが目標ではありません。また明日！",
      "完了！本物の進歩を積み重ねています。休んで、明日また続けましょう。",
      "今日は終わり。毎回のセッションが次を少し楽にします。明日また！",
      "言語は気分からではなく、今日みたいな日から生まれます。また明日！",
    ],
    seeYouTomorrow: 'また明日',
  },

  zh: {
    setGoalTitle: '设置每日目标',
    setGoalSubtitle: '每天能坚持练习多少分钟？',
    minPerDay: (n) => `${n}分钟 / 天`,
    saveGoal: '保存',
    todayProgress: '今日练习',
    minutesDone: (d, g) => `${d} / ${g} 分钟`,
    goalComplete: '今日目标完成！',
    remainingTitle: (m) => `今天还剩 ${m} 分钟`,
    remainingMessages: [
      "你已经开始了——完成比开始更容易。马上就到了。",
      "语言是一点一点积累起来的。这几分钟比你想象的更重要。",
      "坚持胜过强度。今天短短一练，习惯就不会断。",
      "你不会在章节结束前两页停下来，这里也一样。",
      "你的大脑今天已经热身了。最后这几分钟是最轻松的。",
    ],
    continueBtn: '继续练习',
    completedTitle: '今天完成了！做得好。',
    completedMessages: [
      "你来了，你做到了。这就是进步的样子——明天见。",
      "又完成了一天的练习。不完美没关系，完美不是目标。明天见。",
      "完成！你在积累真正的进步。休息一下，明天我们继续。",
      "今天结束了。每次练习都让下一次更轻松。明天继续。",
      "语言不来自动力，而来自今天这样的日子。明天见。",
    ],
    seeYouTomorrow: '明天见',
  },

  ko: {
    setGoalTitle: '일일 목표 설정',
    setGoalSubtitle: '매일 몇 분씩 연습할 수 있나요?',
    minPerDay: (n) => `${n}분 / 일`,
    saveGoal: '저장',
    todayProgress: '오늘의 연습',
    minutesDone: (d, g) => `${d} / ${g}분`,
    goalComplete: '오늘 목표 달성!',
    remainingTitle: (m) => `오늘 ${m}분 남았어요`,
    remainingMessages: [
      "이미 시작했잖아요. 끝내는 건 시작보다 쉬워요. 거의 다 왔어요.",
      "언어는 조금씩 쌓이는 거예요. 이 몇 분이 생각보다 훨씬 중요해요.",
      "꾸준함이 강도를 이겨요. 오늘 짧은 연습으로 습관을 지켜요.",
      "챕터 끝 두 페이지 앞에서 책을 덮지 않잖아요. 같은 원리예요.",
      "오늘 이미 뇌가 워밍업 됐어요. 마지막 몇 분이 가장 쉬워요.",
    ],
    continueBtn: '계속 연습하기',
    completedTitle: '오늘은 완료! 잘했어요.',
    completedMessages: [
      "해냈어요. 그게 바로 발전이에요, 내일 봐요.",
      "또 하루 연습 완료. 완벽하지 않아도 괜찮아요. 내일 봐요.",
      "완료! 진짜 실력을 쌓고 있어요. 쉬고, 내일 계속해요.",
      "오늘은 끝. 매 연습이 다음을 조금 쉽게 만들어요. 내일 또요.",
      "언어는 의지가 아니라 오늘 같은 날들에서 나와요. 내일 봐요.",
    ],
    seeYouTomorrow: '내일 봐요',
  },

  ru: {
    setGoalTitle: 'Установи ежедневную цель',
    setGoalSubtitle: 'Сколько минут в день ты готов уделять?',
    minPerDay: (n) => `${n} мин / день`,
    saveGoal: 'Сохранить',
    todayProgress: 'Практика сегодня',
    minutesDone: (d, g) => `${d} из ${g} мин`,
    goalComplete: 'Дневная цель достигнута!',
    remainingTitle: (m) => `Осталось ${m} мин сегодня`,
    remainingMessages: [
      "Ты уже начал, и завершить проще, чем начать. Ты почти у цели.",
      "Языки строятся шаг за шагом. Эти минуты важнее, чем кажется.",
      "Постоянство важнее интенсивности. Короткая сессия сегодня держит привычку живой.",
      "Ты не бросишь книгу за две страницы до конца главы. Тот же принцип.",
      "Твой мозг уже разогрелся сегодня. Эти последние минуты, самые лёгкие.",
    ],
    continueBtn: 'Продолжить практику',
    completedTitle: 'На сегодня готово. Молодец.',
    completedMessages: [
      "Ты пришёл и сделал своё. Вот как выглядит прогресс, до завтра.",
      "Ещё один день практики выполнен. Неважно, было ли всё идеально. До завтра.",
      "Готово! Ты строишь что-то настоящее. Отдохни, и завтра продолжим.",
      "На сегодня всё. Каждая сессия делает следующую чуть легче. Завтра продолжим.",
      "Языки берутся не из мотивации, а из таких дней, как сегодня. До завтра.",
    ],
    seeYouTomorrow: 'До завтра',
  },

  ar: {
    setGoalTitle: 'حدد هدفك اليومي',
    setGoalSubtitle: 'كم دقيقة يمكنك تخصيصها كل يوم؟',
    minPerDay: (n) => `${n} دقيقة / يوم`,
    saveGoal: 'حفظ',
    todayProgress: 'ممارسة اليوم',
    minutesDone: (d, g) => `${d} من ${g} دقيقة`,
    goalComplete: 'تم تحقيق هدف اليوم!',
    remainingTitle: (m) => `تبقى ${m} دقيقة اليوم`,
    remainingMessages: [
      "لقد بدأت بالفعل، والإنهاء أسهل من البداية. أنت على وشك الوصول.",
      "اللغات تُبنى جلسة صغيرة تلو الأخرى. هذه الدقائق أهم مما تظن.",
      "الاستمرارية تتفوق على الكثافة دائمًا. جلسة قصيرة اليوم تحافظ على العادة.",
      "لن تتوقف عن قراءة كتاب قبل صفحتين من نهاية الفصل. نفس المبدأ.",
      "عقلك قد استعد اليوم. هذه الدقائق الأخيرة هي الأسهل.",
    ],
    continueBtn: 'تابع الممارسة',
    completedTitle: 'انتهيت لهذا اليوم. عمل رائع.',
    completedMessages: [
      "أتيت وأنجزت المطلوب. هكذا يبدو التقدم، إلى اللقاء غدًا.",
      "يوم آخر من الممارسة مكتمل. لا يهم إن لم يكن مثاليًا. إلى اللقاء غدًا.",
      "تم! أنت تبني شيئًا حقيقيًا. استرح، وغدًا نكمل من حيث توقفنا.",
      "انتهى اليوم. كل جلسة تجعل التالية أسهل قليلًا. غدًا نستمر.",
      "اللغات لا تأتي من الدافعية، بل من أيام كهذا اليوم. إلى اللقاء غدًا.",
    ],
    seeYouTomorrow: 'إلى اللقاء غدًا',
  },

  hi: {
    setGoalTitle: 'अपना दैनिक लक्ष्य निर्धारित करें',
    setGoalSubtitle: 'आप हर दिन कितने मिनट दे सकते हैं?',
    minPerDay: (n) => `${n} मिनट / दिन`,
    saveGoal: 'सेव करें',
    todayProgress: 'आज की प्रैक्टिस',
    minutesDone: (d, g) => `${d} में से ${g} मिनट`,
    goalComplete: 'आज का लक्ष्य पूरा!',
    remainingTitle: (m) => `आज ${m} मिनट बाकी`,
    remainingMessages: [
      "आपने शुरुआत कर ली है और खत्म करना शुरू करने से आसान है। लगभग पहुंच गए।",
      "भाषाएं एक-एक छोटे सत्र से बनती हैं। ये मिनट आपकी सोच से ज़्यादा मायने रखते हैं।",
      "निरंतरता तीव्रता को हमेशा मात देती है। आज की छोटी सत्र आदत जीवित रखती है।",
      "आप किताब के अध्याय से दो पन्ने पहले नहीं छोड़ते। वही बात यहां भी है।",
      "आपका दिमाग आज पहले से तैयार है। ये आखिरी मिनट सबसे आसान हैं।",
    ],
    continueBtn: 'प्रैक्टिस जारी रखें',
    completedTitle: 'आज के लिए हो गया। शाबाश!',
    completedMessages: [
      "आप आए और काम किया। यही प्रगति दिखती है, कल मिलते हैं।",
      "एक और दिन की प्रैक्टिस पूरी। परफेक्ट न हो तो कोई बात नहीं। कल मिलते हैं।",
      "हो गया! आप कुछ असली बना रहे हैं। आराम करें, कल जारी रखेंगे।",
      "आज के लिए खत्म। हर सत्र अगले को थोड़ा आसान बनाता है। कल मिलते हैं।",
      "भाषाएं प्रेरणा से नहीं, आज जैसे दिनों से आती हैं। कल मिलते हैं।",
    ],
    seeYouTomorrow: 'कल मिलते हैं',
  },

  tr: {
    setGoalTitle: 'Günlük hedefini belirle',
    setGoalSubtitle: 'Her gün kaç dakika ayırabilirsin?',
    minPerDay: (n) => `${n} dak / gün`,
    saveGoal: 'Kaydet',
    todayProgress: "Bugünün pratiği",
    minutesDone: (d, g) => `${d} / ${g} dak`,
    goalComplete: 'Günlük hedef tamamlandı!',
    remainingTitle: (m) => `Bugün ${m} dakika kaldı`,
    remainingMessages: [
      "Zaten başladın, bitirmek başlamaktan daha kolay. Neredeyse oradasın.",
      "Diller tek tek küçük seanslarla inşa edilir. Bu dakikalar düşündüğünden çok önemli.",
      "Tutarlılık her zaman yoğunluğu geçer. Bugün kısa bir seans alışkanlığı canlı tutar.",
      "Bir kitabı bölümün sonundan iki sayfa önce bırakmazsın. Aynı mantık.",
      "Beynin bugün zaten ısındı. Bu son dakikalar en kolay olanlar.",
    ],
    continueBtn: 'Pratik yapmaya devam et',
    completedTitle: 'Bugünlük bitti. Aferin!',
    completedMessages: [
      "Geldin ve işi yaptın. İlerleme böyle görünür, yarın görüşürüz.",
      "Bir gün daha pratik tamamlandı. Mükemmel olmasa da sorun değil. Yarın görüşürüz.",
      "Bitti! Gerçek bir şey inşa ediyorsun. Dinlen, yarın kaldığımız yerden devam edelim.",
      "Bugünlük tamam. Her seans bir sonrakini biraz kolaylaştırır. Yarın devam.",
      "Diller motivasyondan değil, bugün gibi günlerden gelir. Yarın görüşürüz.",
    ],
    seeYouTomorrow: 'Yarın görüşürüz',
  },

  nl: {
    setGoalTitle: 'Stel je dagelijkse doel in',
    setGoalSubtitle: 'Hoeveel minuten kun je elke dag besteden?',
    minPerDay: (n) => `${n} min / dag`,
    saveGoal: 'Opslaan',
    todayProgress: 'Oefening van vandaag',
    minutesDone: (d, g) => `${d} van ${g} min`,
    goalComplete: 'Dagelijks doel bereikt!',
    remainingTitle: (m) => `Nog ${m} minuut${m !== 1 ? 'en' : ''} vandaag`,
    remainingMessages: [
      "Je bent al begonnen, afmaken kost minder moeite dan beginnen. Je bent er bijna.",
      "Talen worden opgebouwd sessie voor sessie. Deze minuten tellen meer dan je denkt.",
      "Consistentie wint altijd van intensiteit. Een korte sessie vandaag houdt de gewoonte levend.",
      "Je stopt niet met lezen twee pagina's voor het einde van het hoofdstuk. Zelfde principe.",
      "Je hersenen zijn vandaag al opgewarmd. Deze laatste minuten zijn de makkelijkste.",
    ],
    continueBtn: 'Doorgaan met oefenen',
    completedTitle: 'Voor vandaag klaar. Goed gedaan.',
    completedMessages: [
      "Je was erbij en hebt het gedaan. Zo ziet vooruitgang eruit, tot morgen.",
      "Nog een dag oefening voltooid. Het hoefde niet perfect te zijn. Tot morgen.",
      "Klaar! Je bouwt iets echts op. Rust uit, en morgen gaan we verder.",
      "Voor vandaag gedaan. Elke sessie maakt de volgende een beetje makkelijker. Morgen verder.",
      "Talen komen niet van motivatie, ze komen van dagen als vandaag. Tot morgen.",
    ],
    seeYouTomorrow: 'Tot morgen',
  },

  pl: {
    setGoalTitle: 'Ustaw swój dzienny cel',
    setGoalSubtitle: 'Ile minut możesz poświęcać każdego dnia?',
    minPerDay: (n) => `${n} min / dzień`,
    saveGoal: 'Zapisz',
    todayProgress: 'Dzisiejsza praktyka',
    minutesDone: (d, g) => `${d} z ${g} min`,
    goalComplete: 'Dzienny cel osiągnięty!',
    remainingTitle: (m) => `Jeszcze ${m} minut${m === 1 ? 'a' : ''} dziś`,
    remainingMessages: [
      "Już zacząłeś, a skończenie wymaga mniej wysiłku niż zaczęcie. Prawie jesteś.",
      "Języki buduje się jedną małą sesją na raz. Te minuty mają większe znaczenie niż myślisz.",
      "Regularność zawsze bije intensywność. Krótka sesja dziś utrzymuje nawyk przy życiu.",
      "Nie przestałbyś czytać książki dwie strony przed końcem rozdziału. Ten sam princip.",
      "Twój mózg już się dziś rozgrzał. Te ostatnie minuty są najłatwiejsze.",
    ],
    continueBtn: 'Kontynuuj ćwiczenie',
    completedTitle: 'Na dziś gotowe. Dobra robota.',
    completedMessages: [
      "Przyszedłeś i zrobiłeś swoje. Tak wygląda postęp, do jutra.",
      "Kolejny dzień ćwiczeń ukończony. Nieważne, że nie było idealnie. Do jutra.",
      "Gotowe! Budujesz coś prawdziwego. Odpoczni, a jutro kontynuujemy.",
      "Na dziś skończone. Każda sesja sprawia, że następna jest łatwiejsza. Jutro dalej.",
      "Języki nie biorą się z motywacji, biorą się z takich dni jak ten. Do jutra.",
    ],
    seeYouTomorrow: 'Do jutra',
  },
};

export function getDailyGoalT(lang: string): DailyGoalT {
  return t[lang] ?? t['en'];
}
