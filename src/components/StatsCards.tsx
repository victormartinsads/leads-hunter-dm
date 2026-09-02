import React from 'react';
import { 
  Users, 
  MessageSquare, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { formatUSD, formatBRL } from '@/lib/utils';

interface StatsProps {
  metrics: {
    totalLeads: number;
    contactedCount: number;
    repliedCount: number;
    whatsappCount: number;
    activeCustomerCount: number;
    responseRate: string;
    whatsappRate: string;
    ai: {
      totalCalls: number;
      totalTokens: number;
      totalCostUsd: number;
      totalCostBrl: string;
      costPerLeadUsd: string;
      costPerCustomerUsd: string;
      budgetLimitUsd: number;
      budgetUsedPercent: string;
    };
  };
}

export default function StatsCards({ metrics }: StatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Card 1: Leads Abordados */}
      <div className="bg-[#121215] border border-zinc-800 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Abordados</span>
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
            <Users className="w-4 h-4 text-amber-400" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black text-white tracking-tight">{metrics.contactedCount}</span>
          <span className="text-xs text-zinc-500">de {metrics.totalLeads} no funil</span>
        </div>
        <div className="mt-2 flex items-center text-xs text-amber-400 font-semibold">
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          <span>Cadência: 30 DMs/dia</span>
        </div>
      </div>

      {/* Card 2: Taxa de Resposta */}
      <div className="bg-[#121215] border border-zinc-800 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Taxa de Resposta</span>
          <div className="p-2 bg-zinc-900 rounded-lg text-zinc-300 border border-zinc-700">
            <MessageSquare className="w-4 h-4 text-zinc-300" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black text-white tracking-tight">{metrics.responseRate}%</span>
          <span className="text-xs text-zinc-500">({metrics.repliedCount} responderam)</span>
        </div>
        <div className="mt-2 flex items-center text-xs text-zinc-400 font-semibold">
          <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" />
          <span>Handoff automático via API Meta</span>
        </div>
      </div>

      {/* Card 3: Encaminhados WhatsApp */}
      <div className="bg-[#121215] border border-zinc-800 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">No WhatsApp / Grupo</span>
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black text-white tracking-tight">{metrics.whatsappCount}</span>
          <span className="text-xs text-zinc-500">({metrics.whatsappRate}% conv.)</span>
        </div>
        <div className="mt-2 flex items-center text-xs text-emerald-400 font-semibold">
          <CheckCircle className="w-3.5 h-3.5 mr-1" />
          <span>{metrics.activeCustomerCount} clientes ativos gerados</span>
        </div>
      </div>

      {/* Card 4: Custo Gemini AI */}
      <div className="bg-[#121215] border border-zinc-800 rounded-xl p-5 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Consumo Gemini AI</span>
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-black text-white tracking-tight">{formatUSD(metrics.ai.totalCostUsd)}</span>
          <span className="text-xs text-zinc-500">(~R$ {metrics.ai.totalCostBrl})</span>
        </div>
        
        {/* Budget Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-zinc-400 mb-1 font-mono">
            <span>Limite: ${metrics.ai.budgetLimitUsd}</span>
            <span>{metrics.ai.totalTokens.toLocaleString()} tokens</span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800">
            <div 
              className={`h-full rounded-full ${
                parseFloat(metrics.ai.budgetUsedPercent) > 80 ? 'bg-rose-500' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.max(3, Math.min(100, parseFloat(metrics.ai.budgetUsedPercent)))}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
