export type SimulatorTranslation = {
  title: string;
  subtitle: string;
  youBadge: string;
  goalAll: string;
  goalTraveler: string;
  goalStudent: string;
  goalProfessional: string;
  goalParent: string;
};

const translations: Record<string, SimulatorTranslation> = {
  en: { title: 'Choose a scenario', subtitle: 'The tutor plays a character. You have the conversation.', youBadge: 'You', goalAll: 'All', goalTraveler: 'Traveler', goalStudent: 'Student', goalProfessional: 'Professional', goalParent: 'Parent' },
  it: { title: 'Scegli uno scenario', subtitle: 'Il tutor assume il ruolo del personaggio. Tu fai la conversazione.', youBadge: 'Tu', goalAll: 'Tutti', goalTraveler: 'Viaggiatore', goalStudent: 'Studente', goalProfessional: 'Professionista', goalParent: 'Genitore' },
  es: { title: 'Elige un escenario', subtitle: 'El tutor juega un personaje. Tú tienes la conversación.', youBadge: 'Tú', goalAll: 'Todos', goalTraveler: 'Viajero', goalStudent: 'Estudiante', goalProfessional: 'Profesional', goalParent: 'Padre' },
  fr: { title: 'Choisissez un scénario', subtitle: 'Le tuteur joue un personnage. Vous avez la conversation.', youBadge: 'Vous', goalAll: 'Tous', goalTraveler: 'Voyageur', goalStudent: 'Étudiant', goalProfessional: 'Professionnel', goalParent: 'Parent' },
  de: { title: 'Szenario wählen', subtitle: 'Der Tutor spielt eine Rolle. Du führst das Gespräch.', youBadge: 'Du', goalAll: 'Alle', goalTraveler: 'Reisender', goalStudent: 'Student', goalProfessional: 'Berufstätig', goalParent: 'Elternteil' },
  pt: { title: 'Escolha um cenário', subtitle: 'O tutor assume o papel da personagem. Você tem a conversa.', youBadge: 'Você', goalAll: 'Todos', goalTraveler: 'Viajante', goalStudent: 'Estudante', goalProfessional: 'Profissional', goalParent: 'Pai/Mãe' },
  ja: { title: 'シナリオを選ぶ', subtitle: 'チューターがキャラクターを演じます。あなたが会話をします。', youBadge: 'あなた', goalAll: 'すべて', goalTraveler: '旅行者', goalStudent: '学生', goalProfessional: '社会人', goalParent: '保護者' },
  zh: { title: '选择场景', subtitle: '导师扮演角色，你来进行对话。', youBadge: '你', goalAll: '全部', goalTraveler: '旅行者', goalStudent: '学生', goalProfessional: '职场人士', goalParent: '家长' },
  ko: { title: '시나리오 선택', subtitle: '튜터가 캐릭터를 연기합니다. 당신이 대화를 이끌어갑니다.', youBadge: '나', goalAll: '전체', goalTraveler: '여행자', goalStudent: '학생', goalProfessional: '직장인', goalParent: '부모' },
  ru: { title: 'Выберите сценарий', subtitle: 'Репетитор играет персонажа. Вы ведёте разговор.', youBadge: 'Вы', goalAll: 'Все', goalTraveler: 'Путешественник', goalStudent: 'Студент', goalProfessional: 'Профессионал', goalParent: 'Родитель' },
  ar: { title: 'اختر سيناريو', subtitle: 'يلعب المدرب دور الشخصية. أنت تجري المحادثة.', youBadge: 'أنت', goalAll: 'الكل', goalTraveler: 'مسافر', goalStudent: 'طالب', goalProfessional: 'محترف', goalParent: 'والد' },
  hi: { title: 'एक परिदृश्य चुनें', subtitle: 'ट्यूटर एक किरदार निभाता है। आप बातचीत करते हैं।', youBadge: 'आप', goalAll: 'सभी', goalTraveler: 'यात्री', goalStudent: 'छात्र', goalProfessional: 'पेशेवर', goalParent: 'अभिभावक' },
  tr: { title: 'Senaryo seç', subtitle: 'Öğretmen bir karakter oynar. Konuşmayı siz yaparsınız.', youBadge: 'Sen', goalAll: 'Tümü', goalTraveler: 'Gezgin', goalStudent: 'Öğrenci', goalProfessional: 'Profesyonel', goalParent: 'Ebeveyn' },
  nl: { title: 'Kies een scenario', subtitle: 'De tutor speelt een personage. Jij voert het gesprek.', youBadge: 'Jij', goalAll: 'Alle', goalTraveler: 'Reiziger', goalStudent: 'Student', goalProfessional: 'Professional', goalParent: 'Ouder' },
  pl: { title: 'Wybierz scenariusz', subtitle: 'Korepetytor gra postać. Ty prowadzisz rozmowę.', youBadge: 'Ty', goalAll: 'Wszystkie', goalTraveler: 'Podróżnik', goalStudent: 'Student', goalProfessional: 'Profesjonalista', goalParent: 'Rodzic' },
};

export function getSimulatorT(lang: string): SimulatorTranslation {
  return translations[lang] ?? translations.en;
}
