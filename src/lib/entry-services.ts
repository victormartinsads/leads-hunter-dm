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
    oneLineHook: 'Elimine a perda de clientes fora do horário comercial com um agente de IA no WhatsApp que qualifica e agende 24h.',
    matchRules: 'Clínicas, estéticas, consultórios, odontologia e empresas com alto volume de mensagens no Direct/WhatsApp.',
    isEnabled: true
  },
  {
    id: 'website',
    name: 'Website de Alta Conversão com Agente de IA',
    category: 'website',
    priceLabel: 'Projeto Sob Medida',
    oneLineHook: 'Criamos o site institucional moderno da sua empresa já com atendente virtual integrado para capturar leads 24h.',
    matchRules: 'Empresas e profissionais sem link de site na bio ou com páginas desatualizadas.',
    isEnabled: true
  },
  {
    id: 'crm_simple',
    name: 'CRM Simples no seu Próprio Servidor',
    category: 'crm_simple',
    priceLabel: 'Instalação Única',
    oneLineHook: 'Centralize seus leads e histórico de vendas em um CRM próprio e privado sem pagar mensalidades por usuário.',
    matchRules: 'Empresas de serviços que ainda organizam vendas em planilhas ou conversas soltas.',
    isEnabled: true
  },
  {
    id: 'crm_whitelabel',
    name: 'CRM White Label Personalizado',
    category: 'crm_whitelabel',
    priceLabel: 'Licença Recorrente',
    oneLineHook: 'Tenha seu próprio CRM comercial com a marca da sua agência para usar no time ou revender a clientes.',
    matchRules: 'Agências, consultorias B2B e empresas que vendem soluções corporativas.',
    isEnabled: true
  },
  {
    id: 'n8n',
    name: 'Automações de Processos com N8N',
    category: 'n8n',
    priceLabel: 'Fluxo por Demanda',
    oneLineHook: 'Conecte seu WhatsApp, formulários, CRM e sistemas sem trabalho manual via fluxos automáticos no N8N.',
    matchRules: 'Agências de marketing, mídia, consultorias e empresas com processos repetitivos.',
    isEnabled: true
  },
  {
    id: 'paid_traffic',
    name: 'Gestão de Tráfego Pago (Meta & Google Ads)',
    category: 'paid_traffic',
    priceLabel: 'R$ 1.300,00 / mês',
    oneLineHook: 'Colocamos sua empresa na frente dos clientes certos diariamente no Instagram, Facebook e Google Ads.',
    matchRules: 'Negócios locais, clínicas, lojas e profissionais que precisam aumentar o volume diário de novos clientes.',
    isEnabled: true
  }
];

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
      reason: `Perfil de Agência/Mídia/Consultoria B2B (${handle}). Necessidade crítica de integrar formulários, CRM e qualificação de clientes via automações N8N.`
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
