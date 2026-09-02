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
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Abordados</span>
          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white">{metrics.contactedCount}</span>
          <span className="text-xs text-slate-400">de {metrics.totalLeads} no funil</span>
        </div>
        <div className="mt-2 flex items-center text-xs text-emerald-400 font-medium">
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          <span>Cadência ativa: 30 DMs/dia</span>
        </div>
      </div>

      {/* Card 2: Taxa de Resposta */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Taxa de Resposta</span>
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white">{metrics.responseRate}%</span>
          <span className="text-xs text-slate-400">({metrics.repliedCount} responderam)</span>
        </div>
        <div className="mt-2 flex items-center text-xs text-blue-400 font-medium">
          <CheckCircle className="w-3.5 h-3.5 mr-1" />
          <span>Handoff para API Meta automático</span>
        </div>
      </div>

      {/* Card 3: Encaminhados WhatsApp */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">No WhatsApp / Grupo</span>
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white">{metrics.whatsappCount}</span>
          <span className="text-xs text-slate-400">({metrics.whatsappRate}% de conv.)</span>
        </div>
        <div className="mt-2 flex items-center text-xs text-emerald-400 font-medium">
          <CheckCircle className="w-3.5 h-3.5 mr-1" />
          <span>{metrics.activeCustomerCount} clientes ativos gerados</span>
        </div>
      </div>

      {/* Card 4: Custo Gemini AI */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Consumo Google Gemini</span>
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white">{formatUSD(metrics.ai.totalCostUsd)}</span>
          <span className="text-xs text-slate-400">(~R$ {metrics.ai.totalCostBrl})</span>
        </div>
        
        {/* Budget Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Orçamento: {metrics.ai.budgetUsedPercent}% de ${metrics.ai.budgetLimitUsd}</span>
            <span>{metrics.ai.totalTokens.toLocaleString()} tokens</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                parseFloat(metrics.ai.budgetUsedPercent) > 80 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.max(3, Math.min(100, parseFloat(metrics.ai.budgetUsedPercent)))}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
