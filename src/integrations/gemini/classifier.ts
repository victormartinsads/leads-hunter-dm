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

export async function generateIcebreaker(
  leadProfile: {
    instagramHandle: string;
    fullName?: string;
    bio?: string;
    followerCount?: number;
    funnelType?: string;
    samplePostContext?: string;
  },
  config: BusinessConfig = getBusinessConfig()
): Promise<IcebreakerResult> {
  const client = getGeminiClient();
  const modelName = getGeminiModelName(false);

  const promptText = `
${buildSystemPrompt(config)}

=== TAREFA: GERAR PRIMEIRA MENSAGEM (1ª DM NO INSTAGRAM) ===
Você precisa redigir uma primeira mensagem curta, personalizada e humana para iniciar contato com o seguinte perfil:
- @handle: ${leadProfile.instagramHandle}
- Nome/Identificação: ${leadProfile.fullName || 'Não informado'}
- Bio: ${leadProfile.bio || 'Sem bio'}
- Seguidores: ${leadProfile.followerCount || 0}
- Tipo de Funil: ${leadProfile.funnelType === 'affiliate' ? 'Funil B (Potencial Afiliado/Criador)' : 'Funil A (Potencial Cliente/Lojista)'}
- Contexto de posts/conteúdo: ${leadProfile.samplePostContext || 'Perfil ativo no nicho'}

CRITÉRIOS OBRIGATÓRIOS:
1. Máximo de 2 a 3 frases curtas.
2. Elogie ou cite algo real da bio ou nicho do lead.
3. Faça uma pergunta aberta leve sobre a rotina/desafio de atendimento no direct.
4. NUNCA envie links na primeira mensagem.
5. SÓ use informações contidas em VERIFIED_CLAIMS.

Responda em formato JSON válido com as chaves:
{
  "message": "Texto exato da DM a ser enviada",
  "variant": "A_casual_compliment ou B_problem_aware",
  "claimsUsed": ["lista de claims verificadas usadas, se houver"],
  "reasoning": "Por que essa abordagem foi escolhida para este perfil"
}
`;

  if (!client) {
    // Smart simulated response when API key is not configured
    const firstName = leadProfile.fullName ? leadProfile.fullName.split(' ')[0] : leadProfile.instagramHandle.replace('@', '');
    const isAffiliate = leadProfile.funnelType === 'affiliate';
    
    const fallbackMessage = isAffiliate
      ? `Fala ${firstName}! Vi a qualidade dos seus conteúdos sobre vendas aqui no perfil, parabéns pelo engajamento. Você já trabalha com indicação de ferramentas para a sua audiência?`
      : `Olá ${firstName}, tudo bem? Vi seu perfil aqui no Instagram e achei o catálogo muito bacana! Vocês costumam receber muito direct de clientes querendo comprar por aqui?`;

    return {
      message: fallbackMessage,
      variant: 'A_casual_compliment (Simulado Gemini)',
      claimsUsed: [config.VERIFIED_CLAIMS[0] || 'Sistema local seguro'],
      reasoning: 'Gerado via motor de fallback inteligente (Configure GEMINI_API_KEY no .env para chamadas ativas na API do Google)',
      modelUsed: 'gemini-2.5-flash (local fallback)'
    };
  }

  try {
    const model = client.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(promptText);
    const responseText = result.response.text();
    
    // Extract JSON from output
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
        message: parsed.message,
        variant: parsed.variant || 'A_gemini_generated',
        claimsUsed: parsed.claimsUsed || [],
        reasoning: parsed.reasoning || 'Gerado com base no contexto do perfil.',
        modelUsed: modelName
      };
    }
  } catch (error) {
    console.error('Error in Gemini generateIcebreaker:', error);
  }

  return {
    message: `Olá! Vi seu perfil no Instagram e achei seu trabalho excelente. Como vocês costumam gerenciar o atendimento dos directs que chegam por aqui?`,
    variant: 'A_fallback',
    claimsUsed: [],
    reasoning: 'Fallback seguro após tentativa de geração.',
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
        modelUsed: 'gemini-2.5-flash (local fallback)'
      };
    }

    if (isWantsWhats) {
      return {
        intent: 'wants_whatsapp',
        nextAction: 'send_whatsapp_link',
        suggestedReply: `Perfeito! O sistema roda 100% local com IA Gemini e organiza todo o fluxo de direct. Me chama no WhatsApp para eu te enviar uma demonstração prática: ${config.WHATSAPP_LINK}`,
        claimsUsed: [config.VERIFIED_CLAIMS[0] || 'Sistema local seguro', config.VERIFIED_CLAIMS[1] || 'IA Gemini'],
        reasoning: 'Lead solicitou mais detalhes/WhatsApp. Direcionando com link oficial sem promessas não verificadas.',
        modelUsed: 'gemini-2.5-flash (local fallback)'
      };
    }

    return {
      intent: 'interested',
      nextAction: 'reply',
      suggestedReply: `Excelente! Nosso sistema qualifica leads de forma 100% personalizada e conecta direto com a API Oficial. Hoje vocês fazem todo esse trabalho manualmente?`,
      claimsUsed: [config.VERIFIED_CLAIMS[0] || 'Operação local'],
      reasoning: 'Lead demonstrou abertura. Resposta conduzindo para qualificação respeitando claims verificadas.',
      modelUsed: 'gemini-2.5-flash (local fallback)'
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

  // Check unverified claims in local text
  for (const unverified of config.UNVERIFIED_CLAIMS) {
    const keywords = unverified.toLowerCase().split(' ').filter(w => w.length > 4);
    const matchCount = keywords.filter(k => lowerText.includes(k)).length;
    if (matchCount >= 2 || lowerText.includes(unverified.toLowerCase())) {
      violations.push(`Possível alegação não verificada: "${unverified}"`);
    }
  }

  // Check verified claims
  for (const verified of config.VERIFIED_CLAIMS) {
    const keywords = verified.toLowerCase().split(' ').filter(w => w.length > 4);
    const matchCount = keywords.filter(k => lowerText.includes(k)).length;
    if (matchCount >= 2 || lowerText.includes(verified.toLowerCase())) {
      verifiedDetected.push(verified);
    }
  }

  // Check common prohibited patterns
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
