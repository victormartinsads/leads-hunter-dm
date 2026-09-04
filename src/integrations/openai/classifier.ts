import { getOpenAIClient, getOpenAIModelName } from './client';
import { buildSystemPrompt } from './prompts';
import { BusinessConfig, getBusinessConfig } from '@/lib/business-config';
import { recordAiCall, checkBudgetExceeded } from '@/lib/budget-guard';
import { buildStep2PitchDM } from '@/lib/entry-services';

export interface IcebreakerResult {
  message: string;
  variant: string;
  claimsUsed: string[];
  reasoning: string;
  modelUsed: string;
}

export interface DecisionResult {
  intent: 'interested' | 'asked_info' | 'asked_pricing' | 'wants_whatsapp' | 'not_the_owner' | 'will_forward' | 'objection' | 'not_interested' | 'opt_out' | 'ambiguous' | 'needs_human';
  nextAction: 'reply' | 'ask_question' | 'send_whatsapp_link' | 'send_affiliate_group' | 'schedule_followup' | 'close_conversation' | 'mark_do_not_contact' | 'escalate_to_human';
  suggestedReply?: string;
  claimsUsed: string[];
  reasoning: string;
  modelUsed: string;
}

export interface ClaimAuditResult {
  isCompliant: boolean;
  score: number; // 0 to 100
  violations: string[];
  verifiedClaimsDetected: string[];
  feedback: string;
}

/**
 * 1st DM Generator: Pure curiosity opener
 * "Opa, tudo bom? Posso tirar uma dúvida rápida com vocês?"
 */
export async function generateIcebreaker(
  leadProfile: {
    instagramHandle: string;
    fullName?: string;
    bio?: string;
    followerCount?: number;
    funnelType?: string;
    samplePostContext?: string;
    targetService?: string;
  },
  config: BusinessConfig = getBusinessConfig()
): Promise<IcebreakerResult> {
  const budgetCheck = await checkBudgetExceeded();
  if (budgetCheck.exceeded) {
    return {
      message: `Opa, tudo bom? Posso tirar uma dúvida rápida com vocês?`,
      variant: '1st_DM_Budget_Paused',
      claimsUsed: [],
      reasoning: `Orçamento mensal de IA atingido ($${budgetCheck.currentSpentUsd.toFixed(2)} / $${budgetCheck.budgetLimitUsd.toFixed(2)} USD). Sistema operando com fallback estático seguro.`,
      modelUsed: 'local_fallback'
    };
  }

  const step2 = buildStep2PitchDM(leadProfile.targetService);
  const firstDmText = `Opa, tudo bom? Posso tirar uma dúvida rápida com vocês?`;

  return {
    message: firstDmText,
    variant: '1st_DM_Curiosity_Opener',
    claimsUsed: [config.VERIFIED_CLAIMS[0] || 'Experiência em tecnologia e automações'],
    reasoning: `1ª DM de Abertura (Estratégia de 2 Etapas Mart Digital): Mensagem curta e humana sem fricção para gerar resposta imediata. A 2ª DM enviará a oferta: "${step2.pitch.substring(0, 60)}..."`,
    modelUsed: getOpenAIModelName(false)
  };
}

export async function interpretResponseAndDecideNextAction(
  lead: {
    instagramHandle: string;
    fullName?: string;
    funnelType?: string;
    notes?: string;
    targetService?: string;
  },
  lastLeadMessage: string,
  history: Array<{ sender: string; content: string }>,
  config: BusinessConfig = getBusinessConfig()
): Promise<DecisionResult> {
  const client = getOpenAIClient();
  const modelName = getOpenAIModelName(false);
  const step2 = buildStep2PitchDM(lead.targetService);
  const lowerMsg = lastLeadMessage.toLowerCase().trim();

  // Check opt-out requests immediately
  const isOptOut = /(pare|não quero|nao quero|sai fora|remova|cancela|não tenho interesse|nao tenho interesse)/i.test(lowerMsg);
  if (isOptOut) {
    return {
      intent: 'opt_out',
      nextAction: 'mark_do_not_contact',
      suggestedReply: 'Entendido perfeitamente! Não enviaremos mais mensagens por aqui. Sucesso nos seus negócios!',
      claimsUsed: [],
      reasoning: 'Lead solicitou encerramento de contato. Perfil adicionado à lista permanente de do_not_contact.',
      modelUsed: 'rule_engine'
    };
  }

  // Check budget limits
  const budgetCheck = await checkBudgetExceeded();
  if (!client || budgetCheck.exceeded) {
    const isWantsWhats = /(whats|whatsapp|link|número|numero|telefone|contato)/i.test(lowerMsg);
    if (isWantsWhats) {
      return {
        intent: 'wants_whatsapp',
        nextAction: 'send_whatsapp_link',
        suggestedReply: `Excelente! Me chama direto no WhatsApp oficial da Mart Digital para conversarmos melhor: ${config.WHATSAPP_LINK}`,
        claimsUsed: [config.VERIFIED_CLAIMS[0] || 'Experiência em automações'],
        reasoning: 'Lead solicitou contato no WhatsApp. Encaminhado com link oficial sem promessas não verificadas.',
        modelUsed: 'local_fallback'
      };
    }

    return {
      intent: 'interested',
      nextAction: 'reply',
      suggestedReply: step2.pitch,
      claimsUsed: [config.VERIFIED_CLAIMS[0] || 'Experiência em automações'],
      reasoning: `${step2.reasoning} (Abordagem da Etapa 2 sem menção a preços ou tecnês)`,
      modelUsed: 'local_fallback'
    };
  }

  try {
    const formattedHistory = history.map(h => `${h.sender === 'lead' ? 'Lead' : 'Agente'}: "${h.content}"`).join('\n');

    const promptText = `
${buildSystemPrompt(config)}

=== TAREFA: INTERPRETAR RESPOSTA E DECIDIR PRÓXIMA AÇÃO (ETAPA 2) ===
Lead: ${lead.instagramHandle}
Funil: ${lead.funnelType || 'customer'}
Serviço Alvo: ${lead.targetService || 'Chatbot 24/7 / Tráfego Pago'}

Histórico da conversa:
${formattedHistory}

Última mensagem enviada pelo lead:
"${lastLeadMessage}"

O lead respondeu à nossa 1ª DM de abertura.

REGRAS DA RESPOSTA (ETAPA 2):
1. NUNCA mencione o nome do @handle.
2. Trate a empresa de forma natural ("vocês", "seu negócio").
3. NUNCA mencione preços ou valores em dinheiro.
4. Apresente a dor e a oferta do serviço escolhido:
"${step2.pitch}"

Responda exclusivamente em formato JSON válido:
{
  "intent": "interested",
  "nextAction": "reply",
  "suggestedReply": "${step2.pitch.replace(/"/g, '\\"')}",
  "claimsUsed": ["claims verificadas aplicadas"],
  "reasoning": "${step2.reasoning}"
}
`;

    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: 'Você é um assistente de prospecção comercial B2B rigoroso que responde em JSON.' },
        { role: 'user', content: promptText }
      ],
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseText);

    await recordAiCall({
      leadId: null,
      model: modelName,
      promptTokens: completion.usage?.prompt_tokens || 500,
      candidateTokens: completion.usage?.completion_tokens || 100,
      purpose: 'classification'
    });

    return {
      intent: parsed.intent || 'interested',
      nextAction: parsed.nextAction || 'reply',
      suggestedReply: parsed.suggestedReply || step2.pitch,
      claimsUsed: parsed.claimsUsed || [],
      reasoning: parsed.reasoning || step2.reasoning,
      modelUsed: modelName
    };
  } catch (error: any) {
    console.error('Error in OpenAI interpretResponse:', error?.message || error);
  }

  return {
    intent: 'interested',
    nextAction: 'reply',
    suggestedReply: step2.pitch,
    claimsUsed: [],
    reasoning: step2.reasoning,
    modelUsed: modelName
  };
}

export async function auditClaimCompliance(
  textToAudit: string,
  config: BusinessConfig = getBusinessConfig()
): Promise<ClaimAuditResult> {
  const violations: string[] = [];
  const verifiedDetected: string[] = [];
  const lowerText = textToAudit.toLowerCase();

  for (const unverified of config.UNVERIFIED_CLAIMS) {
    const keywords = unverified.toLowerCase().split(' ').filter(w => w.length > 4);
    const matchCount = keywords.filter(k => lowerText.includes(k)).length;
    if (matchCount >= 2 || lowerText.includes(unverified.toLowerCase())) {
      violations.push(`Possível alegação não verificada: "${unverified}"`);
    }
  }

  for (const verified of config.VERIFIED_CLAIMS) {
    const keywords = verified.toLowerCase().split(' ').filter(w => w.length > 4);
    const matchCount = keywords.filter(k => lowerText.includes(k)).length;
    if (matchCount >= 2 || lowerText.includes(verified.toLowerCase())) {
      verifiedDetected.push(verified);
    }
  }

  if (lowerText.includes('garantido') || lowerText.includes('100% de certeza') || lowerText.includes('fique rico') || lowerText.includes('sem risco')) {
    violations.push('Uso de termos de garantia absoluta ou promessas irreais não autorizadas.');
  }

  const isCompliant = violations.length === 0;
  const score = isCompliant ? 100 : Math.max(20, 100 - violations.length * 40);

  return {
    isCompliant,
    score,
    violations,
    verifiedClaimsDetected: verifiedDetected,
    feedback: isCompliant
      ? 'Mensagem 100% em conformidade com as VERIFIED_CLAIMS da Mart Digital. Nenhuma alegação falsa detectada.'
      : `ATENÇÃO: Foram identificadas ${violations.length} potenciais violações de claims não comprovadas.`
  };
}
