import React from 'react';
import { Search, Brain, MessageSquare, PhoneCall, CheckCircle2 } from 'lucide-react';
import { ChromeIcon } from './Icons';

interface FunnelProps {
  totalLeads: number;
  contactedCount: number;
  repliedCount: number;
  whatsappCount: number;
  activeCustomerCount: number;
}

export default function FunnelProgress({
  totalLeads,
  contactedCount,
  repliedCount,
  whatsappCount,
  activeCustomerCount,
}: FunnelProps) {
  const steps = [
    {
      label: 'Descoberta ICP',
      count: totalLeads,
      percent: '100%',
      icon: Search,
      color: 'from-purple-500 to-indigo-600',
      tag: 'Hashtags / Bio'
    },
    {
      label: '1ª DM (Chrome Real)',
      count: contactedCount,
      percent: totalLeads > 0 ? `${((contactedCount / totalLeads) * 100).toFixed(0)}%` : '0%',
      icon: ChromeIcon,
      color: 'from-amber-500 to-orange-600',
      tag: 'Playwright CDP'
    },
    {
      label: 'Respostas (API Meta)',
      count: repliedCount,
      percent: contactedCount > 0 ? `${((repliedCount / contactedCount) * 100).toFixed(0)}%` : '0%',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-600',
      tag: 'Gemini 2.5 Flash'
    },
    {
      label: 'WhatsApp / Grupo',
      count: whatsappCount,
      percent: repliedCount > 0 ? `${((whatsappCount / repliedCount) * 100).toFixed(0)}%` : '0%',
      icon: PhoneCall,
      color: 'from-emerald-500 to-teal-600',
      tag: 'Link Direto'
    },
    {
      label: 'Clientes Ativos',
      count: activeCustomerCount,
      percent: whatsappCount > 0 ? `${((activeCustomerCount / whatsappCount) * 100).toFixed(0)}%` : '0%',
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-600',
      tag: 'Receita Gerada'
    }
  ];

  return (
    <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Fluxo de Conversão em Tempo Real</h2>
          <p className="text-xs text-slate-400">Jornada autônoma do lead desde a descoberta até o fechamento</p>
        </div>
        <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full font-medium">
          Handoff de Canal Ativo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                  {step.percent}
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-white">{step.count}</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">{step.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{step.tag}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
