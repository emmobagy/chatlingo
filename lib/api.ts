import { httpsCallable } from 'firebase/functions';
import { functions, auth } from './firebase';

// Ensure user is authenticated before calling any Cloud Function
function requireAuth() {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be logged in to perform this action.');
  return user;
}

// ============================================
// CHAT (calls Cloud Function — API key never
// exposed to the browser)
// ============================================
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory: ChatMessage[];
  isAssessment?: boolean;
}

export interface ChatResponse {
  message: string;
  corrections: string[];
  tokensUsed: number;
  assessmentResult?: {
    level: string;
    strengths: string[];
    improvements: string[];
  };
}

export async function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  requireAuth();
  const fn = httpsCallable<ChatRequest, ChatResponse>(functions, 'chatWithAI');
  const result = await fn(req);
  return result.data;
}

// ============================================
// STRIPE — Create checkout session
// ============================================
export interface CreateCheckoutRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutResponse {
  sessionUrl: string;
}

export async function createCheckoutSession(req: CreateCheckoutRequest): Promise<string> {
  requireAuth();
  const fn = httpsCallable<CreateCheckoutRequest, CreateCheckoutResponse>(
    functions,
    'createCheckoutSession'
  );
  const result = await fn(req);
  return result.data.sessionUrl;
}

// ============================================
// SUBSCRIPTION — Portal link
// ============================================
export async function createPortalSession(): Promise<string> {
  requireAuth();
  const fn = httpsCallable<{ returnUrl: string }, { url: string }>(
    functions,
    'createPortalSession'
  );
  const result = await fn({ returnUrl: `${window.location.origin}/dashboard` });
  return result.data.url;
}

// ============================================
// USER DATA — Export & Delete (GDPR)
// ============================================
export async function exportUserData(): Promise<string> {
  requireAuth();
  const fn = httpsCallable<void, { downloadUrl: string }>(functions, 'exportUserData');
  const result = await fn();
  return result.data.downloadUrl;
}

export async function deleteAccount(): Promise<void> {
  requireAuth();
  const fn = httpsCallable(functions, 'deleteAccount');
  await fn();
}
