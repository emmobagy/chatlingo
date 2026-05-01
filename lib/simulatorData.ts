import type { Difficulty } from './practiceData';
import type { UserGoal } from '@/types';

export interface SimulatorScenario {
  id: string;
  goal: UserGoal | 'all';
  title: string;
  description: string;
  emoji: string;
  image?: string;
  difficulty: Difficulty;
  timeEstimate: string;
  objectives: string[];
  systemPromptContext: string;
}

export const SIMULATOR_SCENARIOS: SimulatorScenario[] = [

  // ── Traveler ──────────────────────────────────────────────────────────────
  {
    id: 'customs-border',
    goal: 'traveler',
    title: 'Customs & Border Control',
    description: 'Answer questions from a border officer clearly and confidently.',
    emoji: '🛂',
    image: '/scenarios/customs-border.png',
    difficulty: 'beginner',
    timeEstimate: '8 min',
    objectives: ['State your purpose of visit', 'Answer questions about your stay', 'Handle unexpected follow-up questions'],
    systemPromptContext: 'You are a strict but professional border control officer. The user is a traveler arriving in an English-speaking country. Ask standard entry questions: purpose of visit, duration, accommodation, amount of cash, anything to declare. If answers seem vague, ask follow-up questions. Stay in character throughout.',
  },
  {
    id: 'emergency-abroad',
    goal: 'traveler',
    title: 'Emergency Abroad',
    description: 'Report an emergency and communicate clearly under pressure.',
    emoji: '🚨',
    image: '/scenarios/emergency-abroad.png',
    difficulty: 'intermediate',
    timeEstimate: '12 min',
    objectives: ['Describe what happened', 'Give your location', 'Request specific help', 'Stay calm and clear'],
    systemPromptContext: 'You are an emergency dispatcher. The user is a traveler in distress — they may have lost their passport, had an accident, or been robbed. Ask them to describe the situation clearly, get their location, and guide them through next steps. Stay calm and professional.',
  },
  {
    id: 'local-guide',
    goal: 'traveler',
    title: 'Chat with a Local',
    description: 'Have a natural conversation with a local about tips, culture and recommendations.',
    emoji: '🗣️',
    image: '/scenarios/local-guide.png',
    difficulty: 'intermediate',
    timeEstimate: '10 min',
    objectives: ['Ask for local tips', 'Understand cultural references', 'Keep conversation flowing naturally'],
    systemPromptContext: 'You are a friendly local in an English-speaking city. The user is a tourist who wants to chat and get authentic tips. Talk about local food, hidden gems, cultural customs, and your own experiences. Use natural, informal speech. Ask about where they\'re from too.',
  },
  {
    id: 'travel-complaint',
    goal: 'traveler',
    title: 'Complaining to a Hotel',
    description: 'Address a hotel problem and get it resolved politely but firmly.',
    emoji: '🏨',
    image: '/scenarios/travel-complaint.png',
    difficulty: 'advanced',
    timeEstimate: '12 min',
    objectives: ['Describe the problem clearly', 'Stay assertive but polite', 'Negotiate a solution or compensation'],
    systemPromptContext: 'You are a hotel front desk manager. The user has a legitimate complaint — noisy room, broken AC, wrong booking, or missing reservation. Be professional but initially resistant to giving compensation. Only escalate help if the user is persistent and polite. Offer upgrades or refunds as a last resort.',
  },

  // ── Student ───────────────────────────────────────────────────────────────
  {
    id: 'office-hours',
    goal: 'student',
    title: 'Professor Office Hours',
    description: 'Ask your professor for help, feedback, or an extension.',
    emoji: '📚',
    image: '/scenarios/office-hours.png',
    difficulty: 'intermediate',
    timeEstimate: '10 min',
    objectives: ['Explain your academic difficulty', 'Ask for help professionally', 'Negotiate deadlines if needed'],
    systemPromptContext: 'You are a university professor in office hours. The student (user) is coming to ask about their grade, request an extension, or get help understanding course material. Be approachable but academic — ask them to explain what they\'ve tried, push them to think rather than just giving answers.',
  },
  {
    id: 'study-group',
    goal: 'student',
    title: 'Study Group Session',
    description: 'Discuss ideas, debate topics, and explain concepts with peers.',
    emoji: '👥',
    image: '/scenarios/study-group.png',
    difficulty: 'intermediate',
    timeEstimate: '15 min',
    objectives: ['Explain your point of view', 'Ask clarifying questions', 'Disagree respectfully'],
    systemPromptContext: 'You are a fellow student in a study group. The user is discussing a topic — history, science, literature, or current events. Have a genuine back-and-forth: share your opinions, challenge their ideas, ask "why do you think that?". Keep it friendly but intellectually stimulating.',
  },
  {
    id: 'class-presentation',
    goal: 'student',
    title: 'Class Presentation Q&A',
    description: 'Answer tough questions from your classmates after a presentation.',
    emoji: '🎤',
    image: '/scenarios/class-presentation.png',
    difficulty: 'advanced',
    timeEstimate: '15 min',
    objectives: ['Handle unexpected questions', 'Clarify your arguments', 'Stay confident under pressure'],
    systemPromptContext: 'You are a classmate asking questions after the user has just finished a presentation on any topic they choose. Ask at least 3 probing questions: challenge their methodology, ask for evidence, or request clarification on complex points. Be curious, not hostile.',
  },
  {
    id: 'flatmate-conflict',
    goal: 'student',
    title: 'Resolving a Flatmate Conflict',
    description: 'Handle a realistic disagreement with a flatmate diplomatically.',
    emoji: '🏠',
    image: '/scenarios/flatmate-conflict.png',
    difficulty: 'intermediate',
    timeEstimate: '12 min',
    objectives: ['Express frustration calmly', 'Listen and acknowledge the other side', 'Reach a compromise'],
    systemPromptContext: 'You are a flatmate who has a complaint — dirty kitchen, loud music late at night, unpaid bills. Bring it up in a realistic, slightly passive-aggressive way at first. The user must de-escalate and find a compromise. Make it feel like a real conversation, not a formal debate.',
  },

  // ── Professional ─────────────────────────────────────────────────────────
  {
    id: 'client-call',
    goal: 'professional',
    title: 'Client Discovery Call',
    description: 'Understand a new client\'s needs and pitch your solution.',
    emoji: '📞',
    image: '/scenarios/client-call.png',
    difficulty: 'intermediate',
    timeEstimate: '15 min',
    objectives: ['Ask open discovery questions', 'Present your value clearly', 'Handle objections'],
    systemPromptContext: 'You are a potential client on a discovery call. You have a business problem (the user can define it or you can suggest one). Be realistic: ask about pricing, timeline, team size, competitors. Show interest but also some resistance. The user must ask good questions and build rapport.',
  },
  {
    id: 'performance-review',
    goal: 'professional',
    title: 'Annual Performance Review',
    description: 'Discuss your achievements, areas for growth, and career goals.',
    emoji: '📊',
    image: '/scenarios/performance-review.png',
    difficulty: 'advanced',
    timeEstimate: '15 min',
    objectives: ['Articulate your achievements', 'Respond to constructive feedback', 'Advocate for a raise or promotion'],
    systemPromptContext: 'You are a manager conducting an annual review. Ask the employee (user) to walk through their achievements, areas of improvement, and career goals. Give mixed feedback — some praise, some constructive critique. If the user asks for a raise, probe: what is it based on? What would make them even more valuable?',
  },
  {
    id: 'difficult-colleague',
    goal: 'professional',
    title: 'Dealing with a Difficult Colleague',
    description: 'Address a workplace tension or conflict professionally.',
    emoji: '🤝',
    image: '/scenarios/difficult-colleague.png',
    difficulty: 'advanced',
    timeEstimate: '12 min',
    objectives: ['Raise the issue without blame', 'Listen actively', 'Find a professional resolution'],
    systemPromptContext: 'You are a colleague who the user needs to address a conflict with — maybe you took credit for their work, or there\'s a communication breakdown. Start slightly defensive. The user must use professional, non-confrontational language to resolve the tension. Soften over time if approached well.',
  },
  {
    id: 'pitch-to-investor',
    goal: 'professional',
    title: 'Startup Pitch to Investor',
    description: 'Present your business idea and handle tough investor questions.',
    emoji: '💡',
    image: '/scenarios/pitch-to-investor.png',
    difficulty: 'advanced',
    timeEstimate: '20 min',
    objectives: ['Pitch clearly and concisely', 'Handle financial and market questions', 'Show passion and conviction'],
    systemPromptContext: 'You are a skeptical but fair angel investor. The user is pitching their startup. Ask about: the problem they solve, market size, competition, business model, traction, team, and ask for the funding amount and its use. Challenge weak points but reward strong answers with follow-up interest.',
  },

  // ── Parent ────────────────────────────────────────────────────────────────
  {
    id: 'parent-teacher',
    goal: 'parent',
    title: 'Parent-Teacher Meeting',
    description: 'Discuss your child\'s progress with their teacher.',
    emoji: '🏫',
    image: '/scenarios/parent-teacher.png',
    difficulty: 'intermediate',
    timeEstimate: '12 min',
    objectives: ['Understand your child\'s situation', 'Ask the right questions', 'Agree on action steps'],
    systemPromptContext: 'You are a primary or secondary school teacher in a parent meeting. Share feedback on the child\'s academic performance and social behaviour — some positive, some areas of concern. Ask parents what they see at home. Be professional and warm, and together develop an action plan.',
  },
  {
    id: 'kids-activity',
    goal: 'parent',
    title: 'Registering for Kids\' Activities',
    description: 'Enquire about, and sign your child up for a local activity.',
    emoji: '⚽',
    image: '/scenarios/kids-activity.png',
    difficulty: 'beginner',
    timeEstimate: '8 min',
    objectives: ['Ask about schedule and fees', 'Describe your child\'s age and level', 'Handle logistics'],
    systemPromptContext: 'You are the coordinator of a children\'s activity club (football, swimming, art, etc.). The parent (user) is calling to register their child. Ask about the child\'s age, current level, and availability. Cover fees, equipment needed, trial sessions, and cancellation policy.',
  },
  {
    id: 'neighbor-chat',
    goal: 'parent',
    title: 'Chatting with a Neighbor',
    description: 'Have a relaxed, natural conversation with a neighbor about daily life.',
    emoji: '🏡',
    image: '/scenarios/neighbor-chat.png',
    difficulty: 'beginner',
    timeEstimate: '8 min',
    objectives: ['Make small talk naturally', 'Talk about family and local area', 'Build rapport'],
    systemPromptContext: 'You are a friendly neighbor. The user (a parent) has run into you outside. Chat about the neighborhood, kids, local school, weekend plans, or the weather. Keep it natural and warm — include some light humor and local references. Make them feel comfortable speaking informally.',
  },

  // ── All goals ─────────────────────────────────────────────────────────────
  {
    id: 'free-chat',
    goal: 'all',
    title: 'Free Conversation',
    description: 'No script, no scenario. Just talk about anything you want.',
    emoji: '💬',
    difficulty: 'beginner',
    timeEstimate: 'Open',
    objectives: ['Practice fluency', 'Explore any topic', 'Feel comfortable speaking freely'],
    systemPromptContext: 'Have a warm, open-ended conversation about any topic the user chooses. Be engaging and curious. Ask follow-up questions. Share opinions. This is free-form practice — the goal is for the user to feel at ease speaking naturally.',
  },
  {
    id: 'debate',
    goal: 'all',
    title: 'Friendly Debate',
    description: 'Defend a position and practice persuasive language.',
    emoji: '⚖️',
    image: '/scenarios/debate.png',
    difficulty: 'advanced',
    timeEstimate: '15 min',
    objectives: ['Structure an argument', 'Use linking words', 'Counter opposing views politely'],
    systemPromptContext: 'You are a debate partner. Pick a lighthearted but interesting topic (remote work vs office, social media effects, technology in schools, etc.) and take the opposite side from the user. Be reasonable but persistent — use evidence and logic. Help the user practice phrases like "I\'d argue that...", "While I see your point...", "The evidence suggests...".',
  },
];

export function getScenarioById(id: string): SimulatorScenario | undefined {
  return SIMULATOR_SCENARIOS.find((s) => s.id === id);
}

export function getScenariosByGoal(goal: UserGoal): SimulatorScenario[] {
  return SIMULATOR_SCENARIOS.filter((s) => s.goal === goal || s.goal === 'all');
}
