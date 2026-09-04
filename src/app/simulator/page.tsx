'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  ShieldCheck, 
  RefreshCw
} from 'lucide-react';

export default function SimulatorPage() {
  const [handle, setHandle] = useState('@clinicamedica.orizon');
  const [fullName, setFullName] = useState('Clínica Médica Orizon');
  const [bio, setBio] = useState('Centro médico integrado | Cardiologia e Dermatologia | Agendamentos via Direct & WhatsApp 🩺');
  const [followers, setFollowers] = useState('28900');
  const [funnelType, setFunnelType] = useState('customer');
  const [targetService, setTargetService] = useState('Chatbot de Atendimento Comercial 24/7');
  const [samplePostContext, setSamplePostContext] = useState('Post recente sobre check-up médico anual');

  const [loadingIcebreaker, setLoadingIcebreaker] = useState(false);
  const [icebreakerResult, setIcebreakerResult] = useState<any>(null);

  const [leadReplyText, setLeadReplyText] = useState('Olá! Gostaria de saber mais sobre como funciona o sistema de vocês.');
  const [loadingDecision, setLoadingDecision] = useState(false);
  const [decisionResult, setDecisionResult] = useState<any>(null);

  const handleGenerateIcebreaker = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingIcebreaker(true);
    setIcebreakerResult(null);
    setDecisionResult(null);

    try {
      const res = await fetch('/api/ai/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'icebreaker',
          instagramHandle: handle,
          fullName,
          bio,
          followerCount: Number(followers),
          funnelType,
          samplePostContext,
          targetService
        })
      });
      const data = await res.json();
      if (data.success) {
        setIcebreakerResult(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingIcebreaker(false);
    }
  };

  const handleTestDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadReplyText.trim()) return;

    setLoadingDecision(true);
    setDecisionResult(null);

    try {
      const history = icebreakerResult ? [
        { sender: 'agent', content: icebreakerResult.message }
      ] : [];

      const res = await fetch('/api/ai/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply_decision',
          leadProfile: {
            instagramHandle: handle,
            fullName,
            funnelType,
            targetService
          },
          lastLeadMessage: leadReplyText,
          history
        })
      });
      const data = await res.json();
      if (data.success) {
        setDecisionResult(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDecision(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-7 h-7 text-amber-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">Simulador de IA Mart Digital (OpenAI)</h1>
        </div>
        <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
          Teste em tempo real como o motor OpenAI analisa perfis públicos, gera a 1ª DM de abertura e reage às respostas dos leads na Etapa 2 respeitando 100% as suas claims verificadas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Step 1: Profile Inputs & Icebreaker Generator */}
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-zinc-950 text-xs flex items-center justify-center font-bold">1</span>
              Simular Perfil do Lead
            </h2>
            <span className="text-[11px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
              OpenAI gpt-4o-mini
            </span>
          </div>

          <form onSubmit={handleGenerateIcebreaker} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">@ do Instagram</label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Nome / Perfil</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Seguidores</label>
                <input
                  type="number"
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-zinc-400 mb-1">Funil</label>
                <select
                  value={funnelType}
                  onChange={(e) => setFunnelType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="customer">Funil A (Clientes/Clínicas)</option>
                  <option value="affiliate">Funil B (Afiliados/Criadores)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-400 mb-1">Bio do Instagram</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-400 mb-1">Serviço Alvo Selecionado</label>
              <input
                type="text"
                value={targetService}
                onChange={(e) => setTargetService(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loadingIcebreaker}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-colors cursor-pointer"
            >
              {loadingIcebreaker ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Consultando OpenAI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  <span>Gerar 1ª DM (Quebra-Gelo)</span>
                </>
              )}
            </button>
          </form>

          {/* Icebreaker Output */}
          {icebreakerResult && (
            <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-2 text-xs animate-in fade-in">
              <div className="flex items-center justify-between font-bold text-amber-300">
                <span>1ª DM Gerada (Navegador Real):</span>
                <span className="text-[10px] text-zinc-400 font-mono">{icebreakerResult.modelUsed}</span>
              </div>
              <p className="bg-zinc-950 p-3 rounded-lg border border-amber-800/40 text-zinc-100 leading-relaxed text-sm">
                "{icebreakerResult.message}"
              </p>
              <div className="text-[11px] text-zinc-400 pt-1">
                <strong>Raciocínio:</strong> {icebreakerResult.reasoning}
              </div>
              {icebreakerResult.claimsUsed?.length > 0 && (
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Claims verificadas: {icebreakerResult.claimsUsed.join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Response & Intent Decision Tester */}
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-950 text-xs flex items-center justify-center font-bold">2</span>
              Simular Resposta do Lead (Etapa 2)
            </h2>
            <span className="text-[11px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
              API Oficial Meta
            </span>
          </div>

          <form onSubmit={handleTestDecision} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-zinc-400 mb-1">
                Mensagem que o Lead Respondeu no Direct:
              </label>
              <textarea
                rows={3}
                required
                value={leadReplyText}
                onChange={(e) => setLeadReplyText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 text-[10px] text-zinc-400">
              <span>Sugestões de teste:</span>
              <button
                type="button"
                onClick={() => setLeadReplyText('Pode sim, qual dúvida você tem?')}
                className="text-emerald-400 hover:underline"
              >
                [Respondeu "Pode sim"]
              </button>
              <button
                type="button"
                onClick={() => setLeadReplyText('Tenho interesse! Me manda o link do WhatsApp para conversarmos.')}
                className="text-amber-400 hover:underline"
              >
                [Pede WhatsApp]
              </button>
              <button
                type="button"
                onClick={() => setLeadReplyText('Não tenho interesse, favor não mandar mais mensagem.')}
                className="text-rose-400 hover:underline"
              >
                [Opt-out / Pare]
              </button>
            </div>

            <button
              type="submit"
              disabled={loadingDecision}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-colors cursor-pointer"
            >
              {loadingDecision ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Classificando...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 text-zinc-950" />
                  <span>Gerar Resposta da Etapa 2 (OpenAI)</span>
                </>
              )}
            </button>
          </form>

          {/* Decision Output */}
          {decisionResult && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-3 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-emerald-300">Intenção:</span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded font-mono font-bold border border-emerald-800">
                    {decisionResult.intent}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-amber-300">Ação:</span>
                  <span className="px-2 py-0.5 bg-amber-950 text-amber-300 rounded font-mono font-bold border border-amber-800">
                    {decisionResult.nextAction}
                  </span>
                </div>
              </div>

              {decisionResult.suggestedReply && (
                <div>
                  <span className="block font-semibold text-zinc-400 mb-1">Resposta Gerada para a Etapa 2 (Sem preços / Sem @handle):</span>
                  <p className="bg-zinc-950 p-3 rounded-lg border border-emerald-800/40 text-zinc-100 leading-relaxed text-sm">
                    "{decisionResult.suggestedReply}"
                  </p>
                </div>
              )}

              <div className="text-[11px] text-zinc-400">
                <strong>Justificativa da IA:</strong> {decisionResult.reasoning}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
