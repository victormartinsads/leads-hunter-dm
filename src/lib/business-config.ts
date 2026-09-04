import fs from 'fs';
import path from 'path';
import { EntryService, DEFAULT_ENTRY_SERVICES } from './entry-services';

export interface BusinessConfig {
  OWNER_NAME: string;
  OWNER_ROLE: string;
  COMPANY_NAME: string;
  COMPANY_WEBSITE: string;
  INSTAGRAM_HANDLE: string;
  WHATSAPP_LINK: string;
  AFFILIATE_GROUP_LINK: string;
  ONE_LINE_PITCH: string;
  HOW_IT_WORKS: string;
  REVENUE_MODEL: string;
  MARKET_JARGON: string;
  VERIFIED_CLAIMS: string[];
  UNVERIFIED_CLAIMS: string[];
  ICP_SEGMENTS: string[];
  ICP_KEYWORDS: string[];
  AFFILIATE_TOPICS: string[];
  GEOGRAPHY: string;
  MAX_DMS_PER_DAY: number;
  MIN_SECONDS_BETWEEN_DMS: number;
  MAX_SECONDS_BETWEEN_DMS: number;
  OPERATING_HOURS: string;
  OPERATING_TIMEZONE: string;
  SYSTEM_PAUSED: boolean;
  MIN_FOLLOWERS?: number;
  MAX_FOLLOWERS?: number;
  MIN_ICP_SCORE?: number;
  REQUIRE_BUSINESS_ACCOUNT?: boolean;
  EXCLUDE_VERIFIED_ACCOUNTS?: boolean;
  EXCLUDE_KEYWORDS?: string[];
  SERVICES_PORTFOLIO?: EntryService[];
}

const configPath = path.join(process.cwd(), 'config', 'business.json');
const exampleConfigPath = path.join(process.cwd(), 'config', 'business.example.json');

export function getBusinessConfig(): BusinessConfig {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    } else if (fs.existsSync(exampleConfigPath)) {
      const data = fs.readFileSync(exampleConfigPath, 'utf8');
      const parsed = JSON.parse(data);
      fs.writeFileSync(configPath, JSON.stringify(parsed, null, 2), 'utf8');
      return parsed;
    }
  } catch (error) {
    console.error('Error reading business.json:', error);
  }

  // Fallback defaults for Mart Digital
  return {
    OWNER_NAME: "Victor de Barros Martisn",
    OWNER_ROLE: "Especialista em Automações e IA",
    COMPANY_NAME: "Mart Digital",
    COMPANY_WEBSITE: "Não tem",
    INSTAGRAM_HANDLE: "@victormartins.io",
    WHATSAPP_LINK: "https://wa.me/55.21+971748472",
    AFFILIATE_GROUP_LINK: "não tenho",
    ONE_LINE_PITCH: "Eu implemento sistemas de atendimento e vendas com IA (WhatsApp + CRM) que fazem pequenas empresas venderem mais sem precisar contratar mais gente.",
    HOW_IT_WORKS: "Diagnóstico rápido do atendimento e funil atual da empresa | Implementação do sistema (CRM + agente de IA no WhatsApp + automações conectadas) | Empresa paga a implementação uma vez e uma mensalidade baixa de manutenção e suporte",
    REVENUE_MODEL: "Cobro um valor fechado pela implementação do sistema + uma mensalidade recorrente baixa pela manutenção, suporte e ajustes contínuos.",
    MARKET_JARGON: "Ticket médio = quanto cada cliente gasta em média por pedido/visita — métrica que todo dono de restaurante/estabelecimento de alimentação acompanha de perto",
    VERIFIED_CLAIMS: [
      "Anos de experiência com tráfego pago (Meta Ads e Google Ads) e tecnologia aplicada a negócios",
      "O sistema de CRM + agente de IA no WhatsApp já está pronto e disponível pra implementação agora",
      "Quem desenvolve o sistema é o próprio time técnico, não é revenda de ferramenta de terceiro",
      "Modelo de implementação + manutenção mensal, sem contrato longo obrigatório"
    ],
    UNVERIFIED_CLAIMS: [
      "Qualquer percentual de aumento de vendas (\"aumenta X% suas vendas\")",
      "Número de empresas/clientes atendidos",
      "Cases ou depoimentos específicos de clientes",
      "Prazo garantido de retorno do investimento",
      "Comparação direta com concorrentes (\"melhor que X\")",
      "Qualquer menção a ser \"líder\" ou \"mais usado\" no nicho"
    ],
    ICP_SEGMENTS: ["Clinica odontologica", "Clinica Médica", "Clinica de estética"],
    ICP_KEYWORDS: [
      "clínica odontológica",
      "consultório odontológico",
      "odontologia estética",
      "dentista",
      "clínica médica",
      "centro médico",
      "policlínica",
      "consultório particular",
      "clínica de estética avançada",
      "centro estético",
      "estética facial e corporal",
      "harmonização facial"
    ],
    AFFILIATE_TOPICS: ["automação de vendas", "tecnologia para clínicas"],
    GEOGRAPHY: "TODO BRASIL",
    MAX_DMS_PER_DAY: 30,
    MIN_SECONDS_BETWEEN_DMS: 90,
    MAX_SECONDS_BETWEEN_DMS: 240,
    OPERATING_HOURS: "09:00-20:00",
    OPERATING_TIMEZONE: "America/Sao_Paulo",
    SYSTEM_PAUSED: false,
    MIN_FOLLOWERS: 500,
    MAX_FOLLOWERS: 300000,
    MIN_ICP_SCORE: 60,
    REQUIRE_BUSINESS_ACCOUNT: true,
    EXCLUDE_VERIFIED_ACCOUNTS: false,
    EXCLUDE_KEYWORDS: ["apostas", "cassino", "tigrinho", "politica", "memes", "futebol"],
    SERVICES_PORTFOLIO: DEFAULT_ENTRY_SERVICES
  };
}

export function saveBusinessConfig(newConfig: Partial<BusinessConfig>): BusinessConfig {
  const current = getBusinessConfig();
  const updated: BusinessConfig = { ...current, ...newConfig };
  
  const dir = path.dirname(configPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(configPath, JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}
