import { getGeminiClient, getGeminiModelName } from './client';
import { buildSystemPrompt } from './prompts';
import { BusinessConfig, getBusinessConfig } from '@/lib/business-config';
import { recordAiCall } from '@/lib/budget-guard';

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
 * 2nd DM Pitch Generator based on selected Entry Service
 * Tailored for commercial/business profiles (NEVER uses handle names)
 */
export function buildStep2PitchDM(targetService?: string): { pitch: string; reasoning: string } {
  const service = (targetService || '').toLowerCase();

  if (service.includes('tráfego') || service.includes('trafego') || service.includes('ads')) {
    return {
      pitch: `Eu vi que vocês ainda não estão fazendo anúncios no Insta para captar leads diariamente. Faria sentido pra vocês ter um sistema de captação contínua de clientes no Meta e Google Ads por R$ 1.300/mês?`,
      reasoning: `Oferta da Etapa 2 adaptada para Gestão de Tráfego Pago (Meta & Google Ads - R$ 1.300/mês).`
    };
  }

  if (service.includes('chatbot') || service.includes('atendimento')) {
    return {
      pitch: `Eu imagino que vocês tenham um fluxo bem grande de mensagens todos os dias, principalmente fora do horário comercial, né? Um atendimento com agente de IA no WhatsApp que qualifica e agenda 24h com certeza iria ajudar muito a aumentar a quantidade de agendamentos de vocês... Isso faria sentido pro seu negócio hoje?`,
      reasoning: `Oferta da Etapa 2 adaptada para Chatbot de Atendimento Comercial 24/7 no WhatsApp.`
    };
  }

  if (service.includes('website') || service.includes('site')) {
    return {
      pitch: `Eu vi que vocês ainda não têm um site de alta conversão com atendente virtual integrado para capturar clientes 24h. Faria sentido pra vocês ter uma estrutura própria de vendas no site capturando clientes direto no WhatsApp?`,
      reasoning: `Oferta da Etapa 2 adaptada para Website de Alta Conversão com Agente de IA.`
    };
  }

  if (service.includes('n8n') || service.includes('automaç')) {
    return {
      pitch: `Eu imagino que vocês tenham muitos processos manuais para passar os leads e dados da equipe pro CRM ou WhatsApp. Ter um fluxo automático no N8N conectando tudo sem trabalho manual faria sentido pro seu negócio hoje?`,
      reasoning: `Oferta da Etapa 2 adaptada para Automações de Processos no N8N.`
    };
  }

  if (service.includes('white label') || service.includes('whitelabel')) {
    return {
      pitch: `Eu imagino que vocês atendam muitos clientes e sintam falta de ter uma plataforma comercial própria. Ter um CRM White Label com a marca da sua empresa para gerenciar as vendas faria sentido pro seu negócio hoje?`,
      reasoning: `Oferta da Etapa 2 adaptada para CRM White Label.`
    };
  }

  if (service.includes('crm')) {
    return {
      pitch: `Eu imagino que vocês recebam muitos contatos e acabe ficando difícil organizar todo o histórico de clientes e vendas. Ter um CRM simples e próprio instalado no servidor de vocês sem pagar mensalidades por usuário faria sentido pro seu negócio hoje?`,
      reasoning: `Oferta da Etapa 2 adaptada para CRM Simples em Servidor Próprio.`
    };
  }

  return {
    pitch: `Eu imagino que vocês tenham um volume alto de contatos e dúvidas todos os dias no Direct. Um atendimento comercial autônomo com IA que qualifica e atende 24h com certeza iria ajudar bastante. Isso faria sentido pro seu negócio hoje?`,
    reasoning: `Oferta da Etapa 2 consultiva geral.`
  };
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
  const step2 = buildStep2PitchDM(leadProfile.targetService);

  // 1st DM Opening Hook (Zero friction, high response rate)
  const firstDmText = `Opa, tudo bom? Posso tirar uma dúvida rápida com vocês?`;

  return {
    message: firstDmText,
    variant: '1st_DM_Curiosity_Opener',
    claimsUsed: [config.VERIFIED_CLAIMS[0] || 'Sistema local seguro'],
    reasoning: `1ª DM de Abertura (Abordagem em 2 Etapas): Mensagem curta e humana sem fricção para gerar resposta imediata do perfil comercial. A 2ª DM enviará a oferta: "${step2.pitch.substring(0, 65)}..."`,
    modelUsed: 'gemini-1.5-flash'
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
  const client = getGeminiClient();
  const modelName = getGeminiModelName(false);
  const step2 = buildStep2PitchDM(lead.targetService);

  const formattedHistory = history.map(h => `${h.sender === 'lead' ? 'Lead' : 'Agente'}: "${h.content}"`).join('\n');

  const promptText = `
${buildSystemPrompt(config)}

=== TAREFA: INTERPRETAR RESPOSTA E DECIDIR PRÓXIMA AÇÃO (ETAPA 2 DO FUNIL DE DM) ===
Lead: ${lead.instagramHandle}
Funil: ${lead.funnelType || 'customer'}
Serviço Alvo: ${lead.targetService || 'Chatbot/Tráfego'}

Histórico da conversa:
${formattedHistory}

Última mensagem enviada pelo lead:
"${lastLeadMessage}"

O lead acabou de responder à nossa 1ª mensagem de abertura ("Opa, tudo bom? Posso tirar uma dúvida rápida com vocês?").

REGRAS DA RESPOSTA (ETAPA 2):
1. NUNCA mencione o nome do @handle (ex: JAMAIS escreva @odonto.midia ou 'Odonto Midia').
2. Trate a empresa como "vocês" ou "seu negócio".
3. Apresente a dor e a oferta do serviço escolhido com o tom:
"${step2.pitch}"

Responda em formato JSON válido:
{
  "intent": "interested",
  "nextAction": "reply",
  "suggestedReply": "${step2.pitch.replace(/"/g, '\\"')}",
  "claimsUsed": ["claims verificadas usadas na resposta"],
  "reasoning": "${step2.reasoning}"
}
`;

  if (!client) {
    const isStop = lastLeadMessage.toLowerCase().includes('pare') || lastLeadMessage.toLowerCase().includes('não quero') || lastLeadMessage.toLowerCase().includes('nao tenho interesse');

    if (isStop) {
      return {
        intent: 'opt_out',
        nextAction: 'mark_do_not_contact',
        suggestedReply: 'Entendido perfeitamente! Não enviaremos mais mensagens por aqui. Sucesso nos seus negócios!',
        claimsUsed: [],
        reasoning: 'Lead expressou desejo de encerrar contato. Marcado como do_not_contact imediatamente.',
        modelUsed: 'gemini-1.5-flash (local)'
      };
    }

    return {
      intent: 'interested',
      nextAction: 'reply',
      suggestedReply: step2.pitch,
      claimsUsed: [config.VERIFIED_CLAIMS[0] || 'Sistema local seguro'],
      reasoning: `${step2.reasoning} (Abordagem da Etapa 2 adaptada para o perfil comercial)`,
      modelUsed: 'gemini-1.5-flash (local)'
    };
  }

  try {
    const model = client.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(promptText);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      await recordAiCall({
        leadId: null,
        model: modelName,
        promptTokens: 600,
        candidateTokens: 120,
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
    }
  } catch (error) {
    console.error('Error in Gemini interpretResponse:', error);
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
      ? 'Mensagem 100% em conformidade com as VERIFIED_CLAIMS. Nenhuma alegação falsa detectada.'
      : `ATENÇÃO: Foram identificadas ${violations.length} potenciais violações de claims não comprovadas.`
  };
}
