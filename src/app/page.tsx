'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatsCards from '@/components/StatsCards';
import FunnelProgress from '@/components/FunnelProgress';
import { 
  Users, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Play, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  ExternalLink,
  Flame,
  AlertCircle
} from 'lucide-react';
import { formatDateBR, getPipelineStatusLabel } from '@/lib/utils';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningWorker, setRunningWorker] = useState(false);
  const [workerResult, setWorkerResult] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRunWorkerCycle = async () => {
    setRunningWorker(true);
    setWorkerResult(null);
    try {
      const res = await fetch('/api/worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_cycle' })
      });
      const json = await res.json();
      if (json.message) {
        setWorkerResult(json.message);
        fetchDashboard();
      }
    } catch (e: any) {
      setWorkerResult('Erro ao executar ciclo: ' + e.message);
    } finally {
      setRunningWorker(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-32 space-x-3 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
        <span className="text-sm font-semibold">Carregando painel em tempo real...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-[#131b2e] via-[#1a233d] to-[#121c2e] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Motor Google Gemini Ativo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Painel de Operações Comerciais
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Sistema autônomo em execução local. Prospecção pelo Chrome real, respostas pela API Oficial e IA restrita a afirmações verificadas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunWorkerCycle}
              disabled={runningWorker || data.system?.paused}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-lg ${
                data.system?.paused
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/20'
              }`}
            >
              {runningWorker ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gerando abordagem via Gemini...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Disparar Próxima DM Agora</span>
                </>
              )}
            </button>

            <Link
              href="/simulator"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs transition-colors border border-slate-700 flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Simulador</span>
            </Link>
          </div>
        </div>

        {workerResult && (
          <div className="mt-4 p-3 bg-purple-950/80 border border-purple-700/80 rounded-xl text-xs text-purple-200 flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{workerResult}</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <StatsCards metrics={data.metrics} />

      {/* Funnel Progress */}
      <FunnelProgress
        totalLeads={data.metrics.totalLeads}
        contactedCount={data.metrics.contactedCount}
        repliedCount={data.metrics.repliedCount}
        whatsappCount={data.metrics.whatsappCount}
        activeCustomerCount={data.metrics.activeCustomerCount}
      />

      {/* Two Column Layout: Recent Conversations & Claims Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Messages Feed (2 cols) */}
        <div className="lg:col-span-2 bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <h2 className="text-base font-bold text-white">Últimas Mensagens & Interações</h2>
            </div>
            <Link
              href="/leads"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
            >
              <span>Ver todos os leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentMessages.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">
                Nenhuma mensagem enviada ainda.
              </div>
            ) : (
              data.recentMessages.map((msg: any) => {
                const isAgent = msg.sender === 'agent';
                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl border text-xs leading-relaxed ${
                      isAgent
                        ? 'bg-slate-900/90 border-purple-900/40 text-slate-200'
                        : 'bg-blue-950/30 border-blue-800/40 text-blue-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 font-semibold">
                      <span className={isAgent ? 'text-purple-400' : 'text-blue-400'}>
                        {isAgent ? '🤖 Agente IA (Gemini)' : '👤 Lead'} • Canal: {msg.channel}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatDateBR(msg.sentAt)}
                      </span>
                    </div>
                    <p className="text-slate-300">{msg.content}</p>
                    {msg.variant && (
                      <span className="inline-block mt-2 text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        Variante: {msg.variant}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Rules & System Card (1 col) */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Regras de Claims & Segurança</h2>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl space-y-1">
              <div className="flex items-center justify-between font-bold text-emerald-300">
                <span>VERIFIED_CLAIMS</span>
                <span>{data.system?.verifiedClaimsCount} Ativas</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Únicas afirmações autorizadas para envio aos leads.
              </p>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-300">
                <span>UNVERIFIED_CLAIMS</span>
                <span>{data.system?.unverifiedClaimsCount} Bloqueadas</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ficam bloqueadas pela IA até que você comprove.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/claims"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 border border-slate-700 transition-colors"
            >
              <span>Gerenciar Afirmações & Auditor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex justify-between">
              <span>Limite de DMs:</span>
              <span className="text-white font-semibold">{data.system?.maxDmsPerDay} / dia</span>
            </div>
            <div className="flex justify-between">
              <span>Janela de Operação:</span>
              <span className="text-white font-semibold">{data.system?.operatingHours}</span>
            </div>
            <div className="flex justify-between">
              <span>Modelo Selecionado:</span>
              <span className="text-purple-400 font-mono font-semibold">{data.system?.modelName}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
