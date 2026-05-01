export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface PracticeDay {
  day: number;
  topic: string;           // slug for URL param
  title: string;           // English display title
  description: string;     // English description
  difficulty: Difficulty;
  timeEstimate: string;
  week: 1 | 2 | 3 | 4;
  emoji: string;
  systemPromptContext: string; // injected into buildPrompt
}

export const PRACTICE_DAYS: PracticeDay[] = [
  // ── Week 1: Survival ──────────────────────────────────────────────────────
  {
    day: 1, week: 1, topic: 'introducing-yourself',
    title: 'Introducing Yourself',
    description: 'Say your name, where you\'re from, and what you do.',
    difficulty: 'beginner', timeEstimate: '5 min', emoji: '👋',
    systemPromptContext: 'The user is practicing introducing themselves. Start by asking their name, where they are from, and what they do. Keep it warm and simple.',
  },
  {
    day: 2, week: 1, topic: 'greetings-small-talk',
    title: 'Greetings & Small Talk',
    description: 'Practice everyday greetings and light conversation.',
    difficulty: 'beginner', timeEstimate: '5 min', emoji: '😊',
    systemPromptContext: 'The user is practicing greetings and small talk. Cover: hello/goodbye, how are you, talking about the weather or weekend. Keep it casual and natural.',
  },
  {
    day: 3, week: 1, topic: 'ordering-at-a-cafe',
    title: 'Ordering at a Café',
    description: 'Order drinks and food at a coffee shop.',
    difficulty: 'beginner', timeEstimate: '8 min', emoji: '☕',
    systemPromptContext: 'You are a friendly café staff member. The user is a customer ordering drinks and food. Cover: asking what they want, sizes, taking payment, saying goodbye.',
  },
  {
    day: 4, week: 1, topic: 'asking-for-directions',
    title: 'Asking for Directions',
    description: 'Ask and understand directions in the city.',
    difficulty: 'beginner', timeEstimate: '8 min', emoji: '🗺️',
    systemPromptContext: 'You are a local. The user is a tourist asking for directions to a landmark, restaurant, or hotel. Use simple directional language: turn left, straight ahead, next to, opposite.',
  },
  {
    day: 5, week: 1, topic: 'at-the-airport',
    title: 'At the Airport',
    description: 'Check in, go through security, find your gate.',
    difficulty: 'beginner', timeEstimate: '10 min', emoji: '✈️',
    systemPromptContext: 'You are an airline check-in agent. The user is checking in for a flight. Cover: passport, seat preference, luggage, boarding pass, gate information.',
  },
  {
    day: 6, week: 1, topic: 'checking-into-a-hotel',
    title: 'Checking into a Hotel',
    description: 'Arrive at your hotel and get your room.',
    difficulty: 'beginner', timeEstimate: '10 min', emoji: '🏨',
    systemPromptContext: 'You are a hotel receptionist. The user is checking in. Cover: reservation confirmation, room type, amenities, checkout time, key card.',
  },
  {
    day: 7, week: 1, topic: 'shopping-at-a-market',
    title: 'Shopping at a Market',
    description: 'Buy food and items at a local market.',
    difficulty: 'beginner', timeEstimate: '8 min', emoji: '🛍️',
    systemPromptContext: 'You are a market vendor selling fresh produce or local goods. The user is shopping. Cover: asking about products, prices, quantities, paying.',
  },

  // ── Week 2: Daily Life ────────────────────────────────────────────────────
  {
    day: 8, week: 2, topic: 'taking-a-taxi',
    title: 'Taking a Taxi / Transport',
    description: 'Get around the city using taxis or public transport.',
    difficulty: 'beginner', timeEstimate: '8 min', emoji: '🚕',
    systemPromptContext: 'You are a taxi driver. The user needs a ride to a destination. Cover: destination, estimated time, fare, payment method.',
  },
  {
    day: 9, week: 2, topic: 'at-the-pharmacy',
    title: 'At the Pharmacy',
    description: 'Describe symptoms and buy medicine.',
    difficulty: 'beginner', timeEstimate: '10 min', emoji: '💊',
    systemPromptContext: 'You are a pharmacist. The user has a minor health issue (headache, cold, allergy). Help them describe symptoms and recommend the right medicine.',
  },
  {
    day: 10, week: 2, topic: 'making-plans-with-friends',
    title: 'Making Plans with Friends',
    description: 'Suggest activities and arrange to meet up.',
    difficulty: 'intermediate', timeEstimate: '10 min', emoji: '🤝',
    systemPromptContext: 'You are a friend. The user wants to make plans for the weekend. Discuss options: cinema, dinner, sports, a trip. Negotiate time and place.',
  },
  {
    day: 11, week: 2, topic: 'at-the-doctor',
    title: 'At the Doctor',
    description: 'Describe how you feel and understand medical advice.',
    difficulty: 'intermediate', timeEstimate: '12 min', emoji: '🩺',
    systemPromptContext: 'You are a doctor. The user is a patient describing symptoms. Ask follow-up questions, give a diagnosis, and explain treatment clearly.',
  },
  {
    day: 12, week: 2, topic: 'calling-customer-service',
    title: 'Calling Customer Service',
    description: 'Report a problem and get help over the phone.',
    difficulty: 'intermediate', timeEstimate: '12 min', emoji: '📞',
    systemPromptContext: 'You are a customer service agent. The user has a problem (delivery, billing, broken product). Guide them through verifying their account, explaining the issue, and resolving it.',
  },
  {
    day: 13, week: 2, topic: 'booking-a-restaurant',
    title: 'Booking a Restaurant',
    description: 'Reserve a table and handle special requests.',
    difficulty: 'intermediate', timeEstimate: '10 min', emoji: '🍽️',
    systemPromptContext: 'You are a restaurant host. The user wants to make a reservation. Cover: date, time, number of guests, dietary requirements, special occasions.',
  },
  {
    day: 14, week: 2, topic: 'small-talk-with-colleagues',
    title: 'Small Talk with Colleagues',
    description: 'Chat naturally with coworkers before a meeting.',
    difficulty: 'intermediate', timeEstimate: '10 min', emoji: '💬',
    systemPromptContext: 'You are a friendly colleague. It\'s before a meeting or by the coffee machine. Chat naturally: weekend, hobbies, recent news, work-life balance. Keep it light.',
  },

  // ── Week 3: Social & Professional ────────────────────────────────────────
  {
    day: 15, week: 3, topic: 'university-enrollment',
    title: 'University Enrollment',
    description: 'Handle admin tasks at a university office.',
    difficulty: 'intermediate', timeEstimate: '12 min', emoji: '🎓',
    systemPromptContext: 'You are a university administrator. The user is a new international student enrolling. Cover: course selection, ID, campus facilities, student services.',
  },
  {
    day: 16, week: 3, topic: 'group-project-discussion',
    title: 'Group Project Discussion',
    description: 'Collaborate, share ideas, and assign tasks.',
    difficulty: 'intermediate', timeEstimate: '15 min', emoji: '👥',
    systemPromptContext: 'You are a fellow student or colleague in a group project. The user needs to share ideas, agree on tasks, and set deadlines. Practice expressing opinions and negotiating.',
  },
  {
    day: 17, week: 3, topic: 'renting-an-apartment',
    title: 'Renting an Apartment',
    description: 'Talk to a landlord and understand a rental agreement.',
    difficulty: 'intermediate', timeEstimate: '15 min', emoji: '🏠',
    systemPromptContext: 'You are a landlord showing an apartment. Cover: rent, deposit, utilities, rules, contract terms, move-in date. The user may ask questions and negotiate.',
  },
  {
    day: 18, week: 3, topic: 'opening-a-bank-account',
    title: 'Opening a Bank Account',
    description: 'Handle banking formalities and understand your options.',
    difficulty: 'intermediate', timeEstimate: '12 min', emoji: '🏦',
    systemPromptContext: 'You are a bank advisor. The user wants to open an account. Cover: account types, required documents, fees, online banking, debit card.',
  },
  {
    day: 19, week: 3, topic: 'job-interview-entry',
    title: 'Job Interview (Entry Level)',
    description: 'Present yourself confidently in a first job interview.',
    difficulty: 'intermediate', timeEstimate: '15 min', emoji: '💼',
    systemPromptContext: 'You are an HR interviewer for an entry-level position. Ask: tell me about yourself, strengths/weaknesses, why this company, previous experience. Be encouraging.',
  },
  {
    day: 20, week: 3, topic: 'networking-at-an-event',
    title: 'Networking at an Event',
    description: 'Meet new people and talk about your work naturally.',
    difficulty: 'intermediate', timeEstimate: '12 min', emoji: '🤝',
    systemPromptContext: 'You are a professional at a networking event. The user is meeting you for the first time. Discuss: what you do, your company, shared interests, exchanging contacts.',
  },
  {
    day: 21, week: 3, topic: 'booking-a-tour',
    title: 'Booking a Tour / Activity',
    description: 'Arrange a guided tour or local experience.',
    difficulty: 'intermediate', timeEstimate: '10 min', emoji: '🗺️',
    systemPromptContext: 'You are a tour operator. The user wants to book a tour or activity. Cover: available options, dates, group size, price, what\'s included, meeting point.',
  },

  // ── Week 4: Complex Scenarios ──────────────────────────────────────────────
  {
    day: 22, week: 4, topic: 'complaining-about-a-service',
    title: 'Complaining About a Service',
    description: 'Express dissatisfaction and get a resolution.',
    difficulty: 'advanced', timeEstimate: '15 min', emoji: '😤',
    systemPromptContext: 'You are a customer service manager. The user has a legitimate complaint (bad food, late delivery, wrong order). Practice staying polite but firm, and negotiating a resolution.',
  },
  {
    day: 23, week: 4, topic: 'flight-delay',
    title: 'Dealing with a Flight Delay',
    description: 'Handle an unexpected delay and find alternatives.',
    difficulty: 'advanced', timeEstimate: '15 min', emoji: '⏰',
    systemPromptContext: 'You are an airline agent at the gate. The user\'s flight has been delayed 4 hours. They need compensation info, rebooking options, or a hotel voucher. Practice assertive but polite communication.',
  },
  {
    day: 24, week: 4, topic: 'business-meeting',
    title: 'Business Meeting',
    description: 'Present ideas and participate in a professional meeting.',
    difficulty: 'advanced', timeEstimate: '20 min', emoji: '📊',
    systemPromptContext: 'You are a business colleague in a meeting. The user needs to present a proposal, answer questions, and discuss next steps. Use formal business language and practice structuring arguments.',
  },
  {
    day: 25, week: 4, topic: 'job-interview-professional',
    title: 'Job Interview (Professional)',
    description: 'Ace a senior-level job interview with confidence.',
    difficulty: 'advanced', timeEstimate: '20 min', emoji: '🏆',
    systemPromptContext: 'You are a senior interviewer for a professional role. Ask behavioral questions (STAR method), technical fit, leadership examples, salary expectations. Challenge the user to elaborate.',
  },
  {
    day: 26, week: 4, topic: 'negotiating-a-salary',
    title: 'Negotiating a Salary',
    description: 'Discuss compensation confidently and reach an agreement.',
    difficulty: 'advanced', timeEstimate: '20 min', emoji: '💰',
    systemPromptContext: 'You are an HR director making a job offer. The user wants to negotiate salary and benefits. Practice: stating expectations, justifying value, counter-offering, reaching agreement.',
  },
  {
    day: 27, week: 4, topic: 'lost-luggage',
    title: 'Reporting Lost Luggage',
    description: 'File a report at the airport and follow up.',
    difficulty: 'advanced', timeEstimate: '15 min', emoji: '🧳',
    systemPromptContext: 'You are an airline baggage agent. The user\'s luggage did not arrive. File a lost luggage report: flight details, bag description, contact info, compensation policy.',
  },
  {
    day: 28, week: 4, topic: 'medical-emergency-abroad',
    title: 'Medical Emergency Abroad',
    description: 'Communicate clearly in a medical emergency.',
    difficulty: 'advanced', timeEstimate: '15 min', emoji: '🚑',
    systemPromptContext: 'You are an emergency doctor or nurse. The user or someone with them has had an accident or medical issue abroad. Practice: describing symptoms clearly, insurance info, understanding instructions under pressure.',
  },
  {
    day: 29, week: 4, topic: 'negotiating-price',
    title: 'Negotiating Price at a Market',
    description: 'Haggle naturally and reach a fair deal.',
    difficulty: 'advanced', timeEstimate: '15 min', emoji: '🛒',
    systemPromptContext: 'You are a market vendor. The user wants to negotiate the price of an item. Practice: making an offer, counter-offering, using persuasion, closing the deal or walking away.',
  },
  {
    day: 30, week: 4, topic: 'graduation-free-conversation',
    title: '🎓 Free Conversation (Graduation Day)',
    description: 'Show everything you\'ve learned in a free-flowing conversation.',
    difficulty: 'advanced', timeEstimate: '20 min', emoji: '🎉',
    systemPromptContext: 'This is the user\'s 30th day — their graduation! Have a natural, free-flowing conversation on any topic they choose. Celebrate their progress. Reflect on what they\'ve learned. Make it memorable and encouraging.',
  },
];

export const WEEK_TITLES: Record<number, string> = {
  1: 'Week 1: Survival',
  2: 'Week 2: Daily Life',
  3: 'Week 3: Social and Professional',
  4: 'Week 4: Complex Scenarios',
};

export function getDayByTopic(topic: string): PracticeDay | undefined {
  return PRACTICE_DAYS.find((d) => d.topic === topic);
}

export function getDayByNumber(day: number): PracticeDay | undefined {
  return PRACTICE_DAYS.find((d) => d.day === day);
}
