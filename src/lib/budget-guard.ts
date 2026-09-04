import { db } from '@/db';
import { AiCall } from '@/db/schema';

export function calculateOpenAICost(promptTokens: number, candidateTokens: number, model: string = 'gpt-4o-mini'): number {
  if (model.includes('gpt-4o') && !model.includes('mini')) {
    return (promptTokens * 0.0000025) + (candidateTokens * 0.000010);
  }
  // gpt-4o-mini pricing ($0.15/1M input, $0.60/1M output)
  return (promptTokens * 0.00000015) + (candidateTokens * 0.00000060);
}

export async function checkBudgetExceeded(): Promise<{ exceeded: boolean; currentSpentUsd: number; budgetLimitUsd: number }> {
  const budgetLimitUsd = parseFloat(process.env.OPENAI_MONTHLY_BUDGET_USD || process.env.GEMINI_MONTHLY_BUDGET_USD || '50.00');
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
  const estimatedCostUsd = calculateOpenAICost(params.promptTokens, params.candidateTokens, params.model);

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
