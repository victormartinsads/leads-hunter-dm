'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatsCards from '@/components/StatsCards';
import FunnelProgress from '@/components/FunnelProgress';
import KanbanBoard from '@/components/KanbanBoard';
import { 
  Users, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Play, 
  MessageSquare, 
  CheckCircle2, 
  PauseCircle,
  Cpu, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { formatDateBR } from '@/lib/utils';

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

  const handleTogglePause = async () => {
    try {
      const isPaused = data?.system?.paused;
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ SYSTEM_PAUSED: !isPaused })
      });
      if (res.ok) {
        fetchDashboard();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveStage = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStatus: newStatus })
      });
      fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-32 space-x-3 text-zinc-400">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
        <span className="text-xs font-semibold">Carregando painel em tempo real...</span>
      </div>
    );
  }

  const costPerLead = data.metrics.totalLeads > 0 
    ? (data.aiStats.totalCostUsd / data.metrics.totalLeads).toFixed(4)
    : '0.0000';

  const costPerCustomer = data.metrics.activeCustomerCount > 0
    ? (data.aiStats.totalCostUsd / data.metrics.activeCustomerCount).toFixed(3)
    : '0.000';

  return (
    <div className="space-y-8">
      
      {/* Top Hero Banner */}
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-amber-400/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Motor OpenAI Ativo ({data.system?.modelName || 'gpt-4o-mini'})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Mart Digital — Prospecção Autônoma
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Prospecção no Instagram para Clínicas Odontológicas, Médicas e de Estética (Funil A) e Criadores (Funil B). Etapa 1 pelo Chrome CDP + Etapa 2 pela API Oficial Meta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTogglePause}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center space-x-2 transition-all cursor-pointer border ${
                data.system?.paused
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
              }`}
            >
              <PauseCircle className="w-4 h-4" />
              <span>{data.system?.paused ? 'SISTEMA PAUSADO (Clique para Retomar)' : 'Pausar Sistema de Emergência'}</span>
            </button>

            <button
              onClick={handleRunWorkerCycle}
              disabled={runningWorker || data.system?.paused}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-md ${
                data.system?.paused
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 transform active:scale-95'
              }`}
            >
              {runningWorker ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Processando Jobs...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-zinc-950" />
                  <span>Disparar Próxima DM Agora</span>
                </>
              )}
            </button>
          </div>
        </div>

        {workerResult && (
          <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-200 flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{workerResult}</span>
          </div>
        )}
      </div>

      {/* AI Cost Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121215] border border-zinc-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Custo Total de IA (OpenAI)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-white">${data.aiStats.totalCostUsd.toFixed(4)} USD</p>
          <p className="text-[10px] text-zinc-500 font-mono">Teto mensal: ${data.system?.budgetLimitUsd || 50.00} USD</p>
        </div>

        <div className="bg-[#121215] border border-zinc-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Custo de IA por Lead</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-400">${costPerLead} USD</p>
          <p className="text-[10px] text-zinc-500 font-mono">Total Leads: {data.metrics.totalLeads}</p>
        </div>

        <div className="bg-[#121215] border border-zinc-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Custo por Cliente Ativo</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400">${costPerCustomer} USD</p>
          <p className="text-[10px] text-zinc-500 font-mono">Clientes Ativos: {data.metrics.activeCustomerCount}</p>
        </div>
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

      {/* Interactive 9-Stage Kanban Board */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">Quadro Kanban do CRM</h2>
          <span className="text-xs text-zinc-400">Clique para mudar de etapa ou alternar entre os Funis A e B</span>
        </div>
        <KanbanBoard leads={data.allLeads || []} onMoveStage={handleMoveStage} />
      </div>

      {/* Two Column Layout: Recent Conversations & Claims Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Messages Feed (2 cols) */}
        <div className="lg:col-span-2 bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Últimas Mensagens & Interações</h2>
            </div>
            <Link
              href="/leads"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
            >
              <span>Ver todos os leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentMessages.length === 0 ? (
              <div className="text-xs text-zinc-500 py-6 text-center">
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
                        ? 'bg-zinc-900/80 border-amber-500/20 text-zinc-200'
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 font-semibold">
                      <span className={isAgent ? 'text-amber-400' : 'text-blue-400'}>
                        {isAgent ? '🤖 IA Mart Digital (OpenAI)' : '👤 Lead'} • Canal: {msg.channel}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {formatDateBR(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-zinc-300">{msg.content}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Rules & System Card (1 col) */}
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-zinc-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Regras de Claims & Segurança</h2>
          </div>

          <div className="space-y-3 text-xs text-zinc-300">
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-1">
              <div className="flex items-center justify-between font-bold text-emerald-400">
                <span>VERIFIED_CLAIMS</span>
                <span>{data.system?.verifiedClaimsCount} Ativas</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Únicas afirmações autorizadas para envio aos leads.
              </p>
            </div>

            <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-300">
                <span>UNVERIFIED_CLAIMS</span>
                <span>{data.system?.unverifiedClaimsCount} Bloqueadas</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Ficam bloqueadas pela IA até que você comprove.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/claims"
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 border border-zinc-800 transition-colors"
            >
              <span>Gerenciar Afirmações & Auditor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="pt-4 border-t border-zinc-800 text-[11px] text-zinc-400 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span>Limite de DMs:</span>
              <span className="text-zinc-200 font-semibold">{data.system?.maxDmsPerDay} / dia</span>
            </div>
            <div className="flex justify-between">
              <span>Janela de Operação:</span>
              <span className="text-zinc-200 font-semibold">{data.system?.operatingHours}</span>
            </div>
            <div className="flex justify-between">
              <span>Modelo Selecionado:</span>
              <span className="text-amber-400 font-bold">{data.system?.modelName}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
