export interface EntryService {
  id: string;
  name: string;
  category: 'website' | 'chatbot' | 'crm_simple' | 'crm_whitelabel' | 'n8n' | 'paid_traffic';
  priceLabel: string;
  oneLineHook: string;
  matchRules: string;
  isEnabled: boolean;
}

export const DEFAULT_ENTRY_SERVICES: EntryService[] = [
  {
    id: 'chatbot',
    name: 'Chatbot de Atendimento Comercial 24/7',
    category: 'chatbot',
    priceLabel: 'Sob Medida / Mensalidade',
    oneLineHook: 'Elimine a perda de clientes fora do horário comercial com um agente de IA no WhatsApp que qualifica e agende 24h.',
    matchRules: 'Clínicas, estéticas, consultórios, estúdios e empresas com alto volume de mensagens no Direct/WhatsApp.',
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
    matchRules: 'Empresas com processos operacionais repetitivos e dados espalhados.',
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

export function recommendEntryService(lead: {
  bio?: string | null;
  fullName?: string | null;
  instagramHandle: string;
}): EntryService {
  const text = `${lead.bio || ''} ${lead.fullName || ''} ${lead.instagramHandle}`.toLowerCase();

  // 1. Check for Website absence or request
  const hasWebsiteSignal = /(http|https|\.com|\.br|linktr\.ee|beacons|site)/i.test(text);
  if (!hasWebsiteSignal) {
    return DEFAULT_ENTRY_SERVICES.find(s => s.id === 'website') || DEFAULT_ENTRY_SERVICES[0];
  }

  // 2. Clinics, Dentists, Aesthetics -> Chatbot 24/7
  if (/(clinica|clínica|dra|dr|odontologia|odonto|estetica|estética|resina|facetas|harmonizacao|consultorio|consultório|medica)/i.test(text)) {
    return DEFAULT_ENTRY_SERVICES.find(s => s.id === 'chatbot') || DEFAULT_ENTRY_SERVICES[0];
  }

  // 3. Agencies & B2B Consultants -> N8N or CRM Whitelabel
  if (/(agencia|agência|consultoria|marketing|midia|mídia|b2b)/i.test(text)) {
    return DEFAULT_ENTRY_SERVICES.find(s => s.id === 'n8n') || DEFAULT_ENTRY_SERVICES[3];
  }

  // 4. Stores, Services, Commerce -> Paid Traffic (R$ 1.300/mês)
  if (/(loja|store|boutique|vendas|atendimento|produtos|entrega)/i.test(text)) {
    return DEFAULT_ENTRY_SERVICES.find(s => s.id === 'paid_traffic') || DEFAULT_ENTRY_SERVICES[5];
  }

  // Default Entry Offer fallback: Chatbot 24/7 or Paid Traffic
  return DEFAULT_ENTRY_SERVICES.find(s => s.id === 'paid_traffic') || DEFAULT_ENTRY_SERVICES[0];
}
