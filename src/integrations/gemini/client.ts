import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(apiKey);
  }

  return geminiClient;
}

export function getGeminiModelName(isFast: boolean = false): string {
  if (isFast) {
    return process.env.GEMINI_MODEL_FAST || 'gemini-3.6-flash';
  }
  return process.env.GEMINI_MODEL || 'gemini-3.6-flash';
}
