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
  // ICP Qualification Criteria
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

  // Fallback defaults
  return {
    OWNER_NAME: "Matheus Gomes",
    OWNER_ROLE: "Fundador",
    COMPANY_NAME: "Buscando 1 Milhão",
    COMPANY_WEBSITE: "https://buscandomilhao.com.br",
    INSTAGRAM_HANDLE: "@soumatheusgomes",
    WHATSAPP_LINK: "https://wa.me/5511999999999",
    AFFILIATE_GROUP_LINK: "https://chat.whatsapp.com/ExemploGrupoAfiliados",
    ONE_LINE_PITCH: "Automação comercial autônoma no Instagram para gerar vendas e parceiros qualificados sem queimar a conta.",
    HOW_IT_WORKS: "1. Identifica perfis qualificados do ICP | 2. Inicia conversa natural pelo seu Chrome real | 3. Conduz até o fechamento no WhatsApp via API Oficial e IA Gemini",
    REVENUE_MODEL: "Assinatura mensal de software + comissão por resultado gerado",
    MARKET_JARGON: "SDR = Representante de Vendas | ICP = Perfil de Cliente Ideal",
    VERIFIED_CLAIMS: [
      "Sistema opera 100% local no seu computador sem enviar suas senhas a terceiros.",
      "Utiliza inteligência artificial Google Gemini para geração de mensagens personalizadas.",
      "A primeira mensagem sai pelo navegador real (Chrome) com intervalo humano programado.",
      "Respostas subsequentes são gerenciadas via API Oficial da Meta.",
      "Possui trava de canal que impede envios duplicados entre navegador e API."
    ],
    UNVERIFIED_CLAIMS: [
      "Garantia de 100 clientes novos no primeiro mês.",
      "Taxa de resposta de 95% em qualquer nicho de mercado."
    ],
    ICP_SEGMENTS: ["E-commerce", "Infoprodutores", "Clínicas"],
    ICP_KEYWORDS: ["loja virtual", "marketing", "estética"],
    AFFILIATE_TOPICS: ["vendas", "afiliados"],
    GEOGRAPHY: "Brasil",
    MAX_DMS_PER_DAY: 30,
    MIN_SECONDS_BETWEEN_DMS: 90,
    MAX_SECONDS_BETWEEN_DMS: 240,
    OPERATING_HOURS: "09:00-20:00",
    OPERATING_TIMEZONE: "America/Sao_Paulo",
    SYSTEM_PAUSED: false,
    MIN_FOLLOWERS: 1000,
    MAX_FOLLOWERS: 200000,
    MIN_ICP_SCORE: 70,
    REQUIRE_BUSINESS_ACCOUNT: true,
    EXCLUDE_VERIFIED_ACCOUNTS: true,
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
