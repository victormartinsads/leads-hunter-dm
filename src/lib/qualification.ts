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
  const requireBusiness = config.REQUIRE_BUSINESS_ACCOUNT ?? false;
  const excludeKeywords = config.EXCLUDE_KEYWORDS || ["apostas", "cassino", "tigrinho", "politica", "memes", "futebol"];

  let totalWeight = 0;
  let passedWeight = 0;

  // 1. Follower Count Check
  const followerCount = lead.followerCount || 0;
  const followerPassed = followerCount >= minFollowers && followerCount <= maxFollowers;
  checks.push({
    rule: 'Contagem de Seguidores',
    passed: followerPassed,
    detail: followerPassed
      ? `${followerCount.toLocaleString()} seguidores (Dentro do intervalo ${minFollowers.toLocaleString()} - ${maxFollowers.toLocaleString()})`
      : `${followerCount.toLocaleString()} seguidores (Fora da faixa de ${minFollowers.toLocaleString()} a ${maxFollowers.toLocaleString()})`
  });
  totalWeight += 30;
  if (followerPassed) passedWeight += 30;

  // 2. Prohibited Keywords Check
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

  // 3. Minimum ICP Score Check
  const icpScore = lead.icpScore ?? 75;
  const scorePassed = icpScore >= minIcpScore;
  checks.push({
    rule: 'Score Mínimo de ICP',
    passed: scorePassed,
    detail: scorePassed
      ? `Pontuação ${icpScore}/100 (Aprovado no mínimo de ${minIcpScore})`
      : `Pontuação ${icpScore}/100 (Abaixo da nota de corte ${minIcpScore})`
  });
  totalWeight += 25;
  if (scorePassed) passedWeight += 25;

  // 4. Verified Account Filter
  if (excludeVerified) {
    const verifiedPassed = !lead.isVerified;
    checks.push({
      rule: 'Filtro de Contas Verificadas (Selo Azul)',
      passed: verifiedPassed,
      detail: verifiedPassed
        ? 'Perfil normal sem selo azul (Acessível)'
        : 'Perfil com selo azul (Bloqueado pela regra de exclusão)'
    });
    totalWeight += 10;
    if (verifiedPassed) passedWeight += 10;
  }

  // 5. Business Account Requirement
  if (requireBusiness) {
    const businessPassed = !!lead.isBusinessAccount;
    checks.push({
      rule: 'Exigência de Conta Business',
      passed: businessPassed,
      detail: businessPassed
        ? 'Conta comercial identificada'
        : 'Conta pessoal (Reprovado pela exigência de conta Business)'
    });
    totalWeight += 10;
    if (businessPassed) passedWeight += 10;
  }

  const isQualified = checks.every(c => c.passed);
  const calculatedScore = Math.round((passedWeight / totalWeight) * 100);

  const summary = isQualified
    ? `✅ Lead 100% Qualificado (${checks.length} de ${checks.length} critérios aprovados)`
    : `❌ Lead Desqualificado (${checks.filter(c => !c.passed).length} de ${checks.length} critérios violados)`;

  return {
    isQualified,
    score: calculatedScore,
    checks,
    summary
  };
}
