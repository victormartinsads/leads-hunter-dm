import React from 'react';
import { getBusinessConfig } from '@/lib/business-config';
import ClaimsManager from '@/components/ClaimsManager';
import ClaimAuditor from '@/components/ClaimAuditor';
import { ShieldCheck, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ClaimsPage() {
  const config = getBusinessConfig();

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">Gestão de Claims & Regras de Ouro</h1>
        </div>
        <p className="text-xs text-zinc-400 mt-1 max-w-3xl leading-relaxed">
          Controle rigoroso sobre o que o Google Gemini tem permissão de afirmar. Elimine alucinações comerciais garantindo que a IA só fale fatos 100% comprovados.
        </p>
      </div>

      {/* Main Claims Manager (Verified vs Unverified) */}
      <ClaimsManager
        initialVerified={config.VERIFIED_CLAIMS || []}
        initialUnverified={config.UNVERIFIED_CLAIMS || []}
      />

      {/* Live Claim Auditor */}
      <ClaimAuditor />

    </div>
  );
}
