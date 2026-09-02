'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Brain, 
  MessageSquare, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  RefreshCw,
  ArrowRight,
  Flame
} from 'lucide-react';

export default function SimulatorPage() {
  const [handle, setHandle] = useState('@loja.exemplo');
  const [fullName, setFullName] = useState('Mariana Modas');
  const [bio, setBio] = useState('Vestidos e tendências femininas | Enviamos para todo Brasil | Pedidos via Direct e WhatsApp 👗');
  const [followers, setFollowers] = useState('18500');
  const [funnelType, setFunnelType] = useState('customer');
  const [samplePostContext, setSamplePostContext] = useState('Reels recente com alta visualização mostrando bastidores do provador');

  const [loadingIcebreaker, setLoadingIcebreaker] = useState(false);
  const [icebreakerResult, setIcebreakerResult] = useState<any>(null);

  const [leadReplyText, setLeadReplyText] = useState('Olá! Achei interessante, como funciona o sistema de vocês?');
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
          samplePostContext
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
            funnelType
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
          <Sparkles className="w-7 h-7 text-purple-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">Simulador de Abordagem Gemini</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Teste em tempo real como o Google Gemini analisa perfis públicos, gera a primeira DM e reage a diferentes respostas dos leads respeitando 100% as suas claims verificadas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Step 1: Profile Inputs & Icebreaker Generator */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              Simular Perfil do Lead
            </h2>
            <span className="text-[11px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
              Gemini 3.6 Flash
            </span>
          </div>

          <form onSubmit={handleGenerateIcebreaker} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">@ do Instagram</label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Nome / Loja</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Seguidores</label>
                <input
                  type="number"
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-400 mb-1">Funil</label>
                <select
                  value={funnelType}
                  onChange={(e) => setFunnelType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="customer">Funil A (Clientes/Lojistas)</option>
                  <option value="affiliate">Funil B (Afiliados/Criadores)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">Bio do Instagram</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-400 mb-1">Contexto de Conteúdo / Post recente</label>
              <input
                type="text"
                value={samplePostContext}
                onChange={(e) => setSamplePostContext(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loadingIcebreaker}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/20"
            >
              {loadingIcebreaker ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Consultando Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar 1ª DM com Google Gemini</span>
                </>
              )}
            </button>
          </form>

          {/* Icebreaker Output */}
          {icebreakerResult && (
            <div className="p-4 bg-purple-950/40 border border-purple-800/60 rounded-xl space-y-2 text-xs animate-in fade-in">
              <div className="flex items-center justify-between font-bold text-purple-300">
                <span>1ª DM Gerada (Navegador Real):</span>
                <span className="text-[10px] text-slate-400 font-mono">{icebreakerResult.modelUsed}</span>
              </div>
              <p className="bg-slate-900/90 p-3 rounded-lg border border-purple-800 text-slate-100 leading-relaxed text-sm">
                "{icebreakerResult.message}"
              </p>
              <div className="text-[11px] text-slate-400 pt-1">
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
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Simular Resposta do Lead
            </h2>
            <span className="text-[11px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
              API Oficial Meta
            </span>
          </div>

          <form onSubmit={handleTestDecision} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">
                Mensagem que o Lead Respondeu no Direct:
              </label>
              <textarea
                rows={3}
                required
                value={leadReplyText}
                onChange={(e) => setLeadReplyText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400">
              <span>Sugestões de teste:</span>
              <button
                type="button"
                onClick={() => setLeadReplyText('Tenho interesse! Me manda o link do WhatsApp para conversarmos.')}
                className="text-emerald-400 hover:underline"
              >
                [Pede WhatsApp]
              </button>
              <button
                type="button"
                onClick={() => setLeadReplyText('Quanto custa a mensalidade?')}
                className="text-blue-400 hover:underline"
              >
                [Pergunta Preço]
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
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20"
            >
              {loadingDecision ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Classificando Intenção...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Classificar e Decidir Próxima Ação</span>
                </>
              )}
            </button>
          </form>

          {/* Decision Output */}
          {decisionResult && (
            <div className="p-4 bg-blue-950/40 border border-blue-800/60 rounded-xl space-y-3 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-blue-300">Intenção:</span>
                  <span className="px-2 py-0.5 bg-blue-900 text-blue-200 rounded font-mono font-bold">
                    {decisionResult.intent}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-purple-300">Ação:</span>
                  <span className="px-2 py-0.5 bg-purple-900 text-purple-200 rounded font-mono font-bold">
                    {decisionResult.nextAction}
                  </span>
                </div>
              </div>

              {decisionResult.suggestedReply && (
                <div>
                  <span className="block font-semibold text-slate-400 mb-1">Resposta Gerada pela IA:</span>
                  <p className="bg-slate-900/90 p-3 rounded-lg border border-blue-800 text-slate-100 leading-relaxed text-sm">
                    "{decisionResult.suggestedReply}"
                  </p>
                </div>
              )}

              <div className="text-[11px] text-slate-400">
                <strong>Justificativa da IA:</strong> {decisionResult.reasoning}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
