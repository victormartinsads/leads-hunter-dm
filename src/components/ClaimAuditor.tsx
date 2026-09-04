'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

export default function ClaimAuditor() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/claims/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sampleCompliant = "Oi! Vi seu trabalho excelente no perfil. Nosso sistema opera com agente de IA da Mart Digital para qualificar leads no direct e agendar no WhatsApp. Me chama no Whats para eu te mandar uma demonstração!";
  const sampleNonCompliant = "Temos uma taxa de resposta de 95% e garantia de 100 clientes novos no primeiro mês sem nenhum risco para você!";

  return (
    <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Auditor & Testador de Claims em Tempo Real</h3>
            <p className="text-[11px] text-zinc-400">Teste qualquer texto de abordagem contra a base de VERIFIED vs UNVERIFIED CLAIMS</p>
          </div>
        </div>
        <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2.5 py-1 rounded-lg border border-zinc-800 font-mono">
          Guardrail de IA Ativo
        </span>
      </div>

      <form onSubmit={handleAudit} className="space-y-3">
        <textarea
          rows={3}
          required
          placeholder="Cole aqui a mensagem ou pitch que a IA pretende enviar ao lead..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-[11px] text-zinc-400">
            <span>Exemplos rápidos:</span>
            <button
              type="button"
              onClick={() => setText(sampleCompliant)}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              [Mensagem Conforme]
            </button>
            <button
              type="button"
              onClick={() => setText(sampleNonCompliant)}
              className="text-rose-400 hover:underline cursor-pointer"
            >
              [Mensagem Proibida]
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold px-5 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-sm flex items-center space-x-1.5"
          >
            {loading ? <span>Auditando...</span> : (
              <>
                <ShieldCheck className="w-4 h-4 text-zinc-950" />
                <span>Auditar Conformidade</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Audit Result */}
      {result && (
        <div className={`mt-4 p-4 rounded-xl border ${
          result.isCompliant 
            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200' 
            : 'bg-rose-950/20 border-rose-800/40 text-rose-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {result.isCompliant ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertOctagon className="w-4 h-4 text-rose-400" />
              )}
              <span className="font-bold text-xs uppercase tracking-wider">
                {result.isCompliant ? '100% CONFORME (Aprovado)' : 'VIOLAÇÃO DETECTADA (Bloqueado)'}
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-zinc-800">
              Score: {result.score}/100
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed mb-3">{result.feedback}</p>

          {result.violations && result.violations.length > 0 && (
            <div className="space-y-1 mt-2 pt-2 border-t border-rose-900/40 text-xs">
              <span className="font-semibold text-rose-300">Violações identificadas:</span>
              {result.violations.map((v: string, i: number) => (
                <div key={i} className="text-rose-200 flex items-center space-x-1.5">
                  <span className="text-rose-400">•</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          )}

          {result.verifiedClaimsDetected && result.verifiedClaimsDetected.length > 0 && (
            <div className="space-y-1 mt-2 pt-2 border-t border-emerald-900/40 text-xs">
              <span className="font-semibold text-emerald-300">Claims verificadas citadas:</span>
              {result.verifiedClaimsDetected.map((vc: string, i: number) => (
                <div key={i} className="text-emerald-200 flex items-center space-x-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>{vc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
