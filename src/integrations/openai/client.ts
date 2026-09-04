import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY || '';
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

export function getOpenAIModelName(isFast: boolean = false): string {
  if (isFast) {
    return process.env.OPENAI_MODEL_FAST || 'gpt-4o-mini';
  }
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}
