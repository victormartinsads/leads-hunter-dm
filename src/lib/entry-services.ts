export interface EntryService {
  id: string;
  name: string;
  category: 'website' | 'chatbot' | 'crm_simple' | 'crm_whitelabel' | 'n8n' | 'paid_traffic';
  priceLabel: string;
  oneLineHook: string;
  matchRules: string;
  isEnabled: boolean;
}

export interface ServiceRecommendationResult {
  service: EntryService;
  reason: string;
}

export const DEFAULT_ENTRY_SERVICES: EntryService[] = [
  {
    id: 'chatbot',
    name: 'Chatbot de Atendimento Comercial 24/7',
    category: 'chatbot',
    priceLabel: 'Sob Medida / Mensalidade',
    oneLineHook: 'Atendimento e agendamento automático no WhatsApp 24 horas por dia para não perder vendas fora do horário comercial.',
    matchRules: 'Clínicas, estéticas, consultórios, odontologia e empresas com alto volume de mensagens no Direct/WhatsApp.',
    isEnabled: true
  },
  {
    id: 'website',
    name: 'Website de Alta Conversão com Agente de IA',
    category: 'website',
    priceLabel: 'Projeto Sob Medida',
    oneLineHook: 'Página oficial da empresa na internet projetada para apresentar seus serviços e trazer clientes direto pro WhatsApp.',
    matchRules: 'Empresas e profissionais sem link de site na bio ou com páginas desatualizadas.',
    isEnabled: true
  },
  {
    id: 'crm_simple',
    name: 'CRM Simples no seu Próprio Servidor',
    category: 'crm_simple',
    priceLabel: 'Instalação Única',
    oneLineHook: 'Painel simples e próprio para organizar contatos, orçamentos e vendas da equipe sem mensalidade por usuário.',
    matchRules: 'Empresas de serviços que ainda organizam vendas em planilhas ou conversas soltas.',
    isEnabled: true
  },
  {
    id: 'crm_whitelabel',
    name: 'CRM White Label Personalizado',
    category: 'crm_whitelabel',
    priceLabel: 'Licença Recorrente',
    oneLineHook: 'Sistema comercial completo com a marca da sua própria empresa para organizar o time ou usar com clientes.',
    matchRules: 'Agências, consultorias B2B e empresas que vendem soluções corporativas.',
    isEnabled: true
  },
  {
    id: 'n8n',
    name: 'Automações de Processos com N8N',
    category: 'n8n',
    priceLabel: 'Fluxo por Demanda',
    oneLineHook: 'Integrações automáticas que conectam formulários, atendimento e vendas sem ninguém precisar digitar nada manual.',
    matchRules: 'Agências de marketing, mídia, consultorias e empresas com processos repetitivos.',
    isEnabled: true
  },
  {
    id: 'paid_traffic',
    name: 'Gestão de Tráfego Pago (Meta & Google Ads)',
    category: 'paid_traffic',
    priceLabel: 'R$ 1.300,00 / mês',
    oneLineHook: 'Anúncios contínuos que colocam sua empresa na frente de novos clientes todos os dias no Instagram e Google.',
    matchRules: 'Negócios locais, clínicas, lojas e profissionais que precisam aumentar o volume diário de novos clientes.',
    isEnabled: true
  }
];

/**
 * 2nd DM Pitch Generator based on selected Entry Service
 * 100% Human, Natural, Business-Language (NO Technical Jargon / Tecnês)
 */
export function buildStep2PitchDM(targetService?: string): { pitch: string; reasoning: string } {
  const service = (targetService || '').toLowerCase();

  if (service.includes('tráfego') || service.includes('trafego') || service.includes('ads')) {
    return {
      pitch: `Eu vi que vocês ainda não colocam anúncios aqui no Insta pra atrair novos clientes todo santo dia. Faria sentido pra vocês ter um sistema trazendo pessoas interessadas na sua empresa diariamente?`,
      reasoning: `Pitch humano focado no benefício direto de atração diária de novos clientes.`
    };
  }

  if (service.includes('chatbot') || service.includes('atendimento')) {
    return {
      pitch: `Eu imagino que vocês tenham um fluxo bem grande de mensagens todos os dias, principalmente fora do horário comercial, né? Um atendimento no WhatsApp que qualifica e agenda 24h com certeza iria ajudar muito a aumentar a quantidade de agendamentos de vocês... Isso faria sentido pro seu negócio hoje?`,
      reasoning: `Pitch humano focado na dor de perder vendas/agendamentos fora do horário de atendimento.`
    };
  }

  if (service.includes('website') || service.includes('site')) {
    return {
      pitch: `Eu vi que vocês ainda não têm uma página oficial da empresa na internet pra apresentar os serviços e fechar vendas direto. Faria sentido ter um site moderno trazendo contatos novos direto pro WhatsApp de vocês?`,
      reasoning: `Pitch humano focado no benefício de ter uma página comercial gerando contatos no WhatsApp.`
    };
  }

  if (service.includes('n8n') || service.includes('automaç')) {
    return {
      pitch: `Eu imagino que vocês percam um bom tempo organizando os contatos da equipe e anotando quem comprou ou não. Ter uma integração automática que passa tudo do atendimento pras vendas, sem ninguém precisar digitar nada manual, ajudaria vocês?`,
      reasoning: `Pitch humano focado no benefício de eliminar retrabalho e digitação manual da equipe.`
    };
  }

  if (service.includes('white label') || service.includes('whitelabel')) {
    return {
      pitch: `Eu imagino que vocês atendam muitos clientes e faria total diferença ter um sistema de vendas com a própria marca da sua empresa pra organizar a equipe. Isso faria sentido pra vocês hoje?`,
      reasoning: `Pitch humano focado na valorização da marca própria e organização da equipe comercial.`
    };
  }

  if (service.includes('crm')) {
    return {
      pitch: `Eu imagino que a rotina seja bem corrida e às vezes acabe ficando difícil acompanhar quais clientes responderam ou precisam de retorno, né? Faria sentido ter um painel simples da empresa pra organizar todas as conversas e vendas sem pagar mensalidades?`,
      reasoning: `Pitch humano focado em não perder o histórico nem o retorno de clientes interessados.`
    };
  }

  return {
    pitch: `Eu imagino que vocês recebam um volume bom de mensagens todos os dias por aqui. Um atendimento automático que responde dúvidas e organiza os agendamentos da empresa 24 horas ajudaria a aumentar as vendas de vocês hoje?`,
    reasoning: `Pitch humano comercial consultivo e direto para o empresário.`
  };
}

export function recommendEntryService(lead: {
  bio?: string | null;
  fullName?: string | null;
  instagramHandle: string;
}): ServiceRecommendationResult {
  const text = `${lead.bio || ''} ${lead.fullName || ''} ${lead.instagramHandle}`.toLowerCase();
  const handle = lead.instagramHandle;

  if (/(clinica|clínica|dra|dr|odontologia|odonto|estetica|estética|resina|facetas|harmonizacao|consultorio|consultório|medica|médica|sorriso|dentista)/i.test(text)) {
    const srv = DEFAULT_ENTRY_SERVICES.find(s => s.id === 'chatbot') || DEFAULT_ENTRY_SERVICES[0];
    return {
      service: srv,
      reason: `Nicho de Odontologia/Saúde/Estética identificado no perfil (${handle}). Clínicas perdem até 40% dos agendamentos no Direct fora do horário comercial.`
    };
  }

  if (/(agencia|agência|midia|mídia|marketing|consultoria|b2b|assessoria|digital)/i.test(text)) {
    const srv = DEFAULT_ENTRY_SERVICES.find(s => s.id === 'n8n') || DEFAULT_ENTRY_SERVICES[4];
    return {
      service: srv,
      reason: `Perfil de Agência/Mídia/Consultoria B2B (${handle}). Necessidade crítica de integrar formulários, CRM e qualificação de clientes via automações.`
    };
  }

  if (/(loja|store|boutique|vendas|produtos|entrega|fashion|moda|calcados|calçados|joias)/i.test(text)) {
    const srv = DEFAULT_ENTRY_SERVICES.find(s => s.id === 'paid_traffic') || DEFAULT_ENTRY_SERVICES[5];
    return {
      service: srv,
      reason: `Perfil Comercial/E-commerce/Vendas (${handle}). Recomendada atração de novos compradores diariamente via Tráfego Pago Meta & Google Ads (R$ 1.300,00/mês).`
    };
  }

  const hasWebsiteSignal = /(http|https|\.com|\.br|linktr\.ee|beacons)/i.test(text);
  if (!hasWebsiteSignal) {
    const srv = DEFAULT_ENTRY_SERVICES.find(s => s.id === 'website') || DEFAULT_ENTRY_SERVICES[1];
    return {
      service: srv,
      reason: `Sem link de site oficial ou landing page na bio do perfil (${handle}). Oportunidade de criar Website de Alta Conversão já com atendente virtual de IA.`
    };
  }

  const srv = DEFAULT_ENTRY_SERVICES.find(s => s.id === 'chatbot') || DEFAULT_ENTRY_SERVICES[0];
  return {
    service: srv,
    reason: `Perfil comercial ativo no Instagram (${handle}). Recomendado Chatbot de Triagem e Qualificação 24h para automatizar dúvidas de clientes.`
  };
}
