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
  const envModel = isFast ? process.env.GEMINI_MODEL_FAST : process.env.GEMINI_MODEL;
  if (envModel && !envModel.includes('3.6')) {
    return envModel;
  }
  return 'gemini-1.5-flash';
}
