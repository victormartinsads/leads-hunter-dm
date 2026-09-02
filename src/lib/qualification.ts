export interface LeadQualificationResult {
  isQualified: boolean;
  score: number;
  checks: {
    rule: string;
    passed: boolean;
    detail: string;
  }[];
  summary: string;
}

export interface QualificationRules {
  MIN_FOLLOWERS?: number;
  MAX_FOLLOWERS?: number;
  MIN_ICP_SCORE?: number;
  REQUIRE_BUSINESS_ACCOUNT?: boolean;
  EXCLUDE_VERIFIED_ACCOUNTS?: boolean;
  EXCLUDE_KEYWORDS?: string[];
}

export const BUSINESS_KEYWORDS = [
  'clinica', 'clínica', 'studio', 'estudio', 'dra', 'dra.', 'dr', 'dr.', 
  'loja', 'boutique', 'agencia', 'agência', 'estetica', 'estética', 
  'odontologia', 'odonto', 'store', 'oficial', 'espaco', 'espaço', 
  'centro', 'consultorio', 'consultório', 'salao', 'salão', 'beauty', 
  'academy', 'shop', 'servicos', 'serviços', 'atendimento', 'whatsapp', 
  'vendas', 'cursos', 'pacientes', 'agende', 'resina', 'facetas', 
  'harmonizacao', 'harmonização', 'medica', 'médica', 'advogado', 
  'arquitetura', 'engenharia', 'assessoria', 'digital', 'midia', 'mídia', 
  'marketing', 'b2b', 'ecommerce', 'e-commerce', 'cnpj', 'orcamento', 'orçamento'
];

export function isBusinessProfile(lead: {
  instagramHandle: string;
  fullName?: string | null;
  bio?: string | null;
  isBusinessAccount?: boolean | null;
}): boolean {
  if (lead.isBusinessAccount === true) return true;

  const combinedText = `${lead.instagramHandle} ${lead.fullName || ''} ${lead.bio || ''}`.toLowerCase();
  
  // Check commercial keywords
  const hasBusinessKeyword = BUSINESS_KEYWORDS.some(kw => combinedText.includes(kw));
  if (hasBusinessKeyword) return true;

  // Check contact signals in bio (e.g. WhatsApp, phone numbers, email, website links)
  const hasContactSignal = /(wa\.me|api\.whatsapp|whatsapp|linktr\.ee|beacons\.page|contato|agendamentos|vendas|orcamento)/i.test(combinedText);
  if (hasContactSignal) return true;

  return false;
}

export function evaluateLeadQualification(
  lead: {
    followerCount?: number | null;
    bio?: string | null;
    fullName?: string | null;
    instagramHandle: string;
    isVerified?: boolean | null;
    isBusinessAccount?: boolean | null;
    icpScore?: number | null;
  },
  config: QualificationRules = {}
): LeadQualificationResult {
  const checks: LeadQualificationResult['checks'] = [];
  const minFollowers = config.MIN_FOLLOWERS ?? 1000;
  const maxFollowers = config.MAX_FOLLOWERS ?? 200000;
  const minIcpScore = config.MIN_ICP_SCORE ?? 70;
  const excludeVerified = config.EXCLUDE_VERIFIED_ACCOUNTS ?? true;
  const requireBusiness = config.REQUIRE_BUSINESS_ACCOUNT ?? true; // Default TRUE to filter out personal accounts
  const excludeKeywords = config.EXCLUDE_KEYWORDS || ["apostas", "cassino", "tigrinho", "politica", "memes", "futebol"];

  let totalWeight = 0;
  let passedWeight = 0;

  // 1. Business Profile Check (Rejeita Perfis Pessoais)
  const isBusiness = isBusinessProfile({
    instagramHandle: lead.instagramHandle,
    fullName: lead.fullName,
    bio: lead.bio,
    isBusinessAccount: lead.isBusinessAccount
  });

  if (requireBusiness) {
    checks.push({
      rule: 'Filtro de Perfil Empresarial / Comercial',
      passed: isBusiness,
      detail: isBusiness
        ? 'Perfil comercial/empresarial identificado (Bio, handle ou dados de empresa)'
        : 'Perfil pessoal (Desqualificado: Não contém termos comerciais ou bio de empresa)'
    });
    totalWeight += 30;
    if (isBusiness) passedWeight += 30;
  }

  // 2. Follower Count Check
  const followerCount = lead.followerCount || 0;
  const followerPassed = followerCount >= minFollowers && followerCount <= maxFollowers;
  checks.push({
    rule: 'Contagem de Seguidores',
    passed: followerPassed,
    detail: followerPassed
      ? `${followerCount.toLocaleString()} seguidores (Dentro da faixa ${minFollowers.toLocaleString()} - ${maxFollowers.toLocaleString()})`
      : `${followerCount.toLocaleString()} seguidores (Fora da faixa ${minFollowers.toLocaleString()} - ${maxFollowers.toLocaleString()})`
  });
  totalWeight += 25;
  if (followerPassed) passedWeight += 25;

  // 3. Prohibited Keywords Check
  const combinedText = `${lead.bio || ''} ${lead.fullName || ''} ${lead.instagramHandle}`.toLowerCase();
  const matchedProhibited = excludeKeywords.filter(kw => kw.trim() && combinedText.includes(kw.toLowerCase().trim()));
  const keywordsPassed = matchedProhibited.length === 0;
  checks.push({
    rule: 'Filtro Anti-Spam / Nichos Proibidos',
    passed: keywordsPassed,
    detail: keywordsPassed
      ? 'Nenhuma palavra desqualificadora encontrada'
      : `Contém palavra(s) bloqueada(s): ${matchedProhibited.map(k => `"${k}"`).join(', ')}`
  });
  totalWeight += 25;
  if (keywordsPassed) passedWeight += 25;

  // 4. Minimum ICP Score Check
  const icpScore = lead.icpScore ?? 75;
  const scorePassed = icpScore >= minIcpScore;
  checks.push({
    rule: 'Score Mínimo de ICP',
    passed: scorePassed,
    detail: scorePassed
      ? `Pontuação ${icpScore}/100 (Aprovado no mínimo de ${minIcpScore})`
      : `Pontuação ${icpScore}/100 (Abaixo da nota de corte ${minIcpScore})`
  });
  totalWeight += 10;
  if (scorePassed) passedWeight += 10;

  // 5. Verified Account Filter
  if (excludeVerified) {
    const verifiedPassed = !lead.isVerified;
    checks.push({
      rule: 'Filtro de Contas Verificadas (Selo Azul)',
      passed: verifiedPassed,
      detail: verifiedPassed
        ? 'Perfil sem selo azul (Acessível)'
        : 'Perfil com selo azul (Bloqueado pela regra de exclusão)'
    });
    totalWeight += 10;
    if (verifiedPassed) passedWeight += 10;
  }

  const isQualified = checks.every(c => c.passed);
  const calculatedScore = Math.round((passedWeight / totalWeight) * 100);

  const summary = isQualified
    ? `✅ Perfil Comercial Qualificado (${checks.length} de ${checks.length} critérios aprovados)`
    : `❌ Perfil Desqualificado (${checks.filter(c => !c.passed).length} de ${checks.length} critérios violados)`;

  return {
    isQualified,
    score: calculatedScore,
    checks,
    summary
  };
}
