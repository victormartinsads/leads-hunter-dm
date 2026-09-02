import { db } from '@/db';
import { AiCall } from '@/db/schema';

export function calculateGeminiCost(promptTokens: number, candidateTokens: number, model: string = 'gemini-2.5-flash'): number {
  if (model.includes('pro')) {
    return (promptTokens * 0.00000125) + (candidateTokens * 0.000005);
  }
  return (promptTokens * 0.0000001) + (candidateTokens * 0.0000004);
}

export async function checkBudgetExceeded(): Promise<{ exceeded: boolean; currentSpentUsd: number; budgetLimitUsd: number }> {
  const budgetLimitUsd = parseFloat(process.env.GEMINI_MONTHLY_BUDGET_USD || '50.00');
  const stats = db.aiCalls.getStats();
  const currentSpentUsd = stats.totalCostUsd || 0;
  return {
    exceeded: currentSpentUsd >= budgetLimitUsd,
    currentSpentUsd,
    budgetLimitUsd
  };
}

export async function recordAiCall(params: {
  leadId?: string | null;
  model: string;
  promptTokens: number;
  candidateTokens: number;
  purpose: string;
}): Promise<AiCall> {
  const totalTokens = params.promptTokens + params.candidateTokens;
  const estimatedCostUsd = calculateGeminiCost(params.promptTokens, params.candidateTokens, params.model);

  const newCall: AiCall = {
    id: 'aicall_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now(),
    leadId: params.leadId || null,
    model: params.model,
    promptTokens: params.promptTokens,
    candidateTokens: params.candidateTokens,
    totalTokens,
    estimatedCostUsd,
    purpose: params.purpose,
    createdAt: new Date().toISOString(),
  };

  db.aiCalls.insert(newCall);
  return newCall;
}
