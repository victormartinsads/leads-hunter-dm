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

export function buildDynamicServiceDM(leadProfile: {
  instagramHandle: string;
  fullName?: string;
  bio?: string;
  targetService?: string;
}): { message: string; reasoning: string } {
  const rawName = leadProfile.fullName && leadProfile.fullName.trim() ? leadProfile.fullName.split(' ')[0] : '';
  const nameStr = rawName ? rawName : leadProfile.instagramHandle.replace('@', '');
  const handleName = leadProfile.instagramHandle;
  const service = (leadProfile.targetService || '').toLowerCase();

  if (service.includes('chatbot') || service.includes('atendimento')) {
    return {
      message: `Olá ${nameStr}, tudo bem? Excelente trabalho no perfil ${handleName}. Vocês costumam receber muitas mensagens de clientes no Direct fora do horário comercial?`,
      reasoning: `Focado no serviço de Chatbot 24/7 para tratar perda de mensagens no Direct.`
    };
  }

  if (service.includes('website') || service.includes('site')) {
    return {
      message: `Olá ${nameStr}, tudo bem? Acompanhando as postagens do perfil ${handleName}! Vocês já têm um site de alta conversão com atendente de IA integrado para capturar leads?`,
      reasoning: `Focado na oferta de Website Institucional com Agente de IA.`
    };
  }

  if (service.includes('tráfego') || service.includes('trafego') || service.includes('ads')) {
    return {
      message: `Fala ${nameStr}! Parabéns pela presença do perfil ${handleName}. Vocês já rodam campanhas de tráfego pago no Meta e Google Ads para atração diária de clientes?`,
      reasoning: `Focado na oferta de Gestão de Tráfego Pago (R$ 1.300,00/mês).`
    };
  }

  if (service.includes('n8n') || service.includes('automaç')) {
    return {
      message: `Olá ${nameStr}! Muito bacana a rotina do perfil ${handleName}. Hoje vocês usam automações no N8N para integrar formulários e WhatsApp ao sistema de vocês?`,
      reasoning: `Focado no serviço de Automação de Processos com N8N.`
    };
  }

  if (service.includes('white label') || service.includes('whitelabel')) {
    return {
      message: `Fala ${nameStr}! Parabéns pela estrutura da ${handleName}. Vocês já utilizam uma plataforma própria de CRM comercial com a sua marca?`,
      reasoning: `Focado no serviço de CRM White Label.`
    };
  }

  if (service.includes('crm')) {
    return {
      message: `Olá ${nameStr}! Como o time da ${handleName} costuma organizar o histórico e o acompanhamento dos leads que chegam pelo Instagram?`,
      reasoning: `Focado na oferta de CRM Simples em Servidor Próprio.`
    };
  }

  return {
    message: `Olá ${nameStr}, tudo bem? Vi o trabalho do perfil ${handleName} no Instagram e achei excelente! Como vocês gerenciam as dúvidas de clientes que chegam por aqui?`,
    reasoning: `Abordagem comercial consultiva focada no atendimento do nicho.`
  };
}

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
  const client = getGeminiClient();
  const modelName = getGeminiModelName(false);
  const dynamicFallback = buildDynamicServiceDM(leadProfile);

  const targetServiceText = leadProfile.targetService
    ? `\n- SERVIÇO DE ENTRADA ALVO DA ABORDAGEM: "${leadProfile.targetService}". Sua primeira frase deve focar EXCLUSIVAMENTE em fazer um gancho ou pergunta sobre este serviço de entrada!`
    : '';

  const promptText = `
${buildSystemPrompt(config)}

=== TAREFA: GERAR PRIMEIRA MENSAGEM (1ª DM NO INSTAGRAM) ===
Você precisa redigir uma primeira mensagem curta, personalizada e humana para iniciar contato com o seguinte perfil:
- @handle: ${leadProfile.instagramHandle}
- Nome/Identificação: ${leadProfile.fullName || 'Não informado'}
- Bio: ${leadProfile.bio || 'Sem bio'}
- Seguidores: ${leadProfile.followerCount || 0}
- Tipo de Funil: ${leadProfile.funnelType === 'affiliate' ? 'Funil B (Potencial Afiliado/Criador)' : 'Funil A (Potencial Cliente/Lojista)'}
- Contexto de posts/conteúdo: ${leadProfile.samplePostContext || 'Perfil ativo no nicho'}${targetServiceText}

CRITÉRIOS OBRIGATÓRIOS:
1. Máximo de 2 a 3 frases curtas.
2. Elogie ou cite algo real da bio ou nicho do lead.
3. Faça uma pergunta aberta leve focada na dor do SERVIÇO DE ENTRADA ALVO.
4. NUNCA envie links na primeira mensagem.
5. SÓ use informações contidas em VERIFIED_CLAIMS.

Responda em formato JSON válido com as chaves:
{
  "message": "Texto exato da DM a ser enviada",
  "variant": "A_service_focused",
  "claimsUsed": ["lista de claims verificadas usadas, se houver"],
  "reasoning": "Por que essa abordagem foi escolhida para este perfil e serviço"
}
`;

  if (!client) {
    return {
      message: dynamicFallback.message,
      variant: 'A_dynamic_service_focused',
      claimsUsed: [config.VERIFIED_CLAIMS[0] || 'Sistema seguro'],
      reasoning: `${dynamicFallback.reasoning} (Modo Simulado Dinâmico)`,
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
        promptTokens: 450,
        candidateTokens: 80,
        purpose: 'icebreaker'
      });

      return {
        message: parsed.message || dynamicFallback.message,
        variant: parsed.variant || 'A_gemini_generated',
        claimsUsed: parsed.claimsUsed || [],
        reasoning: parsed.reasoning || dynamicFallback.reasoning,
        modelUsed: modelName
      };
    }
  } catch (error: any) {
    console.error('Error in Gemini generateIcebreaker:', error.message);
  }

  return {
    message: dynamicFallback.message,
    variant: 'A_dynamic_fallback',
    claimsUsed: [],
    reasoning: dynamicFallback.reasoning,
    modelUsed: modelName
  };
}

export async function interpretResponseAndDecideNextAction(
  lead: {
    instagramHandle: string;
    fullName?: string;
    funnelType?: string;
    notes?: string;
  },
  lastLeadMessage: string,
  history: Array<{ sender: string; content: string }>,
  config: BusinessConfig = getBusinessConfig()
): Promise<DecisionResult> {
  const client = getGeminiClient();
  const modelName = getGeminiModelName(false);

  const formattedHistory = history.map(h => `${h.sender === 'lead' ? 'Lead' : 'Agente'}: "${h.content}"`).join('\n');

  const promptText = `
${buildSystemPrompt(config)}

=== TAREFA: INTERPRETAR RESPOSTA E DECIDIR PRÓXIMA AÇÃO ===
Lead: ${lead.instagramHandle} (${lead.fullName || 'Sem nome'})
Funil: ${lead.funnelType || 'customer'}

Histórico da conversa:
${formattedHistory}

Última mensagem enviada pelo lead:
"${lastLeadMessage}"

Categorias de Intenção possíveis:
- interested: Tem interesse em saber mais
- asked_info: Pediu informações sobre como funciona
- asked_pricing: Perguntou preço ou valores
- wants_whatsapp: Pediu WhatsApp ou concordou em falar por lá
- not_the_owner: Disse que não é o dono/decisor
- will_forward: Disse que vai repassar pro responsável
- objection: Fez uma objeção (sem tempo, caro, já tem outro)
- not_interested: Disse que não tem interesse
- opt_out: Pediu expressamente para não mandar mais mensagem ("pare", "não quero", "sai fora")
- ambiguous: Resposta monossilábica ou confusa
- needs_human: Situação complexa que exige operador

Ações possíveis:
- reply: Responder e esclarecer dúvidas
- ask_question: Fazer pergunta de qualificação
- send_whatsapp_link: Enviar link do WhatsApp (${config.WHATSAPP_LINK})
- send_affiliate_group: Enviar link do grupo de afiliados (${config.AFFILIATE_GROUP_LINK})
- schedule_followup: Agendar follow-up para mais tarde
- close_conversation: Encerrar educadamente
- mark_do_not_contact: Marcar lista de não-contato
- escalate_to_human: Alertar operador

Responda em formato JSON válido:
{
  "intent": "uma das categorias acima",
  "nextAction": "uma das ações acima",
  "suggestedReply": "Texto da resposta a ser enviada ao lead (SE for reply, ask_question, send_whatsapp_link ou close_conversation)",
  "claimsUsed": ["claims verificadas usadas na resposta"],
  "reasoning": "Explicação técnica da decisão tomada"
}
`;

  if (!client) {
    const isWantsWhats = lastLeadMessage.toLowerCase().includes('whats') || lastLeadMessage.toLowerCase().includes('link') || lastLeadMessage.toLowerCase().includes('como funciona');
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

    if (isWantsWhats) {
      return {
        intent: 'wants_whatsapp',
        nextAction: 'send_whatsapp_link',
        suggestedReply: `Perfeito! O sistema roda 100% local com IA Gemini e organiza todo o fluxo de direct. Me chama no WhatsApp para eu te enviar uma demonstração prática: ${config.WHATSAPP_LINK}`,
        claimsUsed: [config.VERIFIED_CLAIMS[0] || 'Sistema local seguro', config.VERIFIED_CLAIMS[1] || 'IA Gemini'],
        reasoning: 'Lead solicitou mais detalhes/WhatsApp. Direcionando com link oficial sem promessas não verificadas.',
        modelUsed: 'gemini-1.5-flash (local)'
      };
    }

    return {
      intent: 'interested',
      nextAction: 'reply',
      suggestedReply: `Excelente! Nosso sistema qualifica leads de forma 100% personalizada e conecta direto com a API Oficial. Hoje vocês fazem todo esse trabalho manualmente?`,
      claimsUsed: [config.VERIFIED_CLAIMS[0] || 'Operação local'],
      reasoning: 'Lead demonstrou abertura. Resposta conduzindo para qualificação respeitando claims verificadas.',
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
        suggestedReply: parsed.suggestedReply,
        claimsUsed: parsed.claimsUsed || [],
        reasoning: parsed.reasoning || 'Decisão baseada na análise de contexto do Gemini.',
        modelUsed: modelName
      };
    }
  } catch (error) {
    console.error('Error in Gemini interpretResponse:', error);
  }

  return {
    intent: 'ambiguous',
    nextAction: 'escalate_to_human',
    suggestedReply: undefined,
    claimsUsed: [],
    reasoning: 'Não foi possível classificar automaticamente com certeza.',
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
