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
      badgeColor: 'bg-zinc-800 text-zinc-300',
      tag: 'Hashtags / Bio'
    },
    {
      label: '1ª DM (Chrome Real)',
      count: contactedCount,
      percent: totalLeads > 0 ? `${((contactedCount / totalLeads) * 100).toFixed(0)}%` : '0%',
      icon: ChromeIcon,
      badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
      tag: 'Playwright CDP'
    },
    {
      label: 'Respostas (API Meta)',
      count: repliedCount,
      percent: contactedCount > 0 ? `${((repliedCount / contactedCount) * 100).toFixed(0)}%` : '0%',
      icon: MessageSquare,
      badgeColor: 'bg-zinc-800 text-zinc-300',
      tag: 'OpenAI gpt-4o-mini'
    },
    {
      label: 'WhatsApp / Grupo',
      count: whatsappCount,
      percent: repliedCount > 0 ? `${((whatsappCount / repliedCount) * 100).toFixed(0)}%` : '0%',
      icon: PhoneCall,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      tag: 'Link Direto'
    },
    {
      label: 'Clientes Ativos',
      count: activeCustomerCount,
      percent: whatsappCount > 0 ? `${((activeCustomerCount / whatsappCount) * 100).toFixed(0)}%` : '0%',
      icon: CheckCircle2,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      tag: 'Receita Gerada'
    }
  ];

  return (
    <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Fluxo de Conversão do Funil</h2>
          <p className="text-xs text-zinc-400">Jornada autônoma do lead desde a descoberta até o fechamento</p>
        </div>
        <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg font-bold">
          Trava de Canal Ativa
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={index} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-amber-400">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${step.badgeColor}`}>
                  {step.percent}
                </span>
              </div>
              <div>
                <div className="text-2xl font-black text-white">{step.count}</div>
                <div className="text-xs font-bold text-zinc-200 mt-1">{step.label}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{step.tag}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
