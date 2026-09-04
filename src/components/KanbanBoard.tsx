'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lead } from '@/db/schema';
import { getPipelineStatusLabel, getChannelStateLabel } from '@/lib/utils';
import { MessageSquare, ExternalLink, ArrowRight, ArrowLeft, Users, Zap, ShieldCheck } from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[];
  onMoveStage: (leadId: string, newStatus: string) => void;
}

const CUSTOMER_STAGES = [
  { id: 'discovered', label: '1. Descoberto', color: 'border-zinc-700' },
  { id: 'qualified', label: '2. Qualificado', color: 'border-blue-500' },
  { id: 'contacted', label: '3. Abordado (1ª DM)', color: 'border-amber-500' },
  { id: 'replied', label: '4. Respondeu', color: 'border-purple-500' },
  { id: 'interested', label: '5. Interessado', color: 'border-emerald-500' },
  { id: 'whatsapp_handoff', label: '6. No WhatsApp', color: 'border-green-500' },
  { id: 'registered', label: '7. Cadastrado', color: 'border-indigo-500' },
  { id: 'active_customer', label: '8. Cliente Ativo 🚀', color: 'border-emerald-400 font-bold' },
  { id: 'closed', label: '9. Encerrado', color: 'border-rose-800' },
];

const AFFILIATE_STAGES = [
  { id: 'discovered', label: '1. Descoberto', color: 'border-zinc-700' },
  { id: 'qualified', label: '2. Qualificado', color: 'border-blue-500' },
  { id: 'contacted', label: '3. Abordado (1ª DM)', color: 'border-amber-500' },
  { id: 'replied', label: '4. Respondeu', color: 'border-purple-500' },
  { id: 'interested', label: '5. Interessado', color: 'border-emerald-500' },
  { id: 'joined_affiliate_group', label: '6. Entrou no Grupo', color: 'border-amber-400' },
  { id: 'active_affiliate', label: '7. Afiliado Ativo', color: 'border-indigo-500' },
  { id: 'generated_customer', label: '8. Gerou Cliente 🚀', color: 'border-emerald-400 font-bold' },
  { id: 'closed', label: '9. Encerrado', color: 'border-rose-800' },
];

export default function KanbanBoard({ leads, onMoveStage }: KanbanBoardProps) {
  const [activeTab, setActiveTab] = useState<'customer' | 'affiliate'>('customer');

  const currentStages = activeTab === 'customer' ? CUSTOMER_STAGES : AFFILIATE_STAGES;
  const filteredLeads = leads.filter(l => (l.funnelType || 'customer') === activeTab);

  return (
    <div className="space-y-4">
      
      {/* Funnel Switcher Header */}
      <div className="bg-[#121215] border border-zinc-800 rounded-xl p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'customer'
                ? 'bg-amber-400 text-zinc-950 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Funil A — Clientes (Clínicas Odonto/Médica/Estética)</span>
            <span className="ml-1 bg-black/30 px-2 py-0.5 rounded-full text-[10px]">
              {leads.filter(l => (l.funnelType || 'customer') === 'customer').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('affiliate')}
            className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'affiliate'
                ? 'bg-amber-400 text-zinc-950 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Funil B — Afiliados & Criadores</span>
            <span className="ml-1 bg-black/30 px-2 py-0.5 rounded-full text-[10px]">
              {leads.filter(l => l.funnelType === 'affiliate').length}
            </span>
          </button>
        </div>

        <span className="text-xs text-zinc-400 hidden lg:inline font-mono">
          {currentStages.length} Etapas Estruturadas
        </span>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-3 overflow-x-auto pb-4">
        {currentStages.map((stage, sIdx) => {
          const stageLeads = filteredLeads.filter(l => l.pipelineStatus === stage.id);

          return (
            <div key={stage.id} className="bg-[#121215] border border-zinc-800 rounded-2xl p-2.5 flex flex-col min-w-[210px]">
              
              {/* Column Header */}
              <div className={`flex items-center justify-between pb-2 mb-2 border-b-2 ${stage.color}`}>
                <span className="font-extrabold text-[11px] text-white uppercase tracking-wider truncate" title={stage.label}>
                  {stage.label}
                </span>
                <span className="text-[10px] bg-zinc-950 text-amber-400 border border-zinc-800 font-mono font-bold px-1.5 py-0.5 rounded-full">
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[650px]">
                {stageLeads.length === 0 ? (
                  <div className="text-[10px] text-zinc-600 text-center py-6 italic">
                    Vazio
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const channelInfo = getChannelStateLabel(lead.channelState);
                    return (
                      <div
                        key={lead.id}
                        className="bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 rounded-xl p-2.5 shadow-md group transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="font-bold text-xs text-white group-hover:text-amber-400 transition-colors truncate max-w-[130px]"
                            title={lead.instagramHandle}
                          >
                            {lead.instagramHandle}
                          </Link>
                          <span className="text-[9px] font-bold bg-zinc-900 text-amber-400 px-1 py-0.5 rounded border border-zinc-800">
                            {lead.icpScore}pts
                          </span>
                        </div>

                        {lead.fullName && (
                          <div className="text-[10px] text-zinc-400 truncate">
                            {lead.fullName}
                          </div>
                        )}

                        <div className="text-[9px] flex items-center justify-between pt-1 border-t border-zinc-800/80 text-zinc-500">
                          <span className={`px-1.5 py-0.5 rounded ${channelInfo.color}`}>
                            {channelInfo.label}
                          </span>
                          <Link
                            href={`/leads/${lead.id}`}
                            className="text-zinc-400 hover:text-white p-0.5"
                            title="Abrir Histórico"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </Link>
                        </div>

                        {/* Move Stage Controls */}
                        <div className="flex justify-between items-center pt-1 text-[9px]">
                          {sIdx > 0 ? (
                            <button
                              onClick={() => onMoveStage(lead.id, currentStages[sIdx - 1].id)}
                              className="text-zinc-500 hover:text-zinc-300 flex items-center gap-0.5 cursor-pointer"
                              title="Recuar etapa"
                            >
                              <ArrowLeft className="w-2.5 h-2.5" />
                              <span>Voltar</span>
                            </button>
                          ) : <div />}
                          
                          {sIdx < currentStages.length - 1 && (
                            <button
                              onClick={() => onMoveStage(lead.id, currentStages[sIdx + 1].id)}
                              className="text-amber-400 hover:text-amber-300 font-extrabold flex items-center gap-0.5 ml-auto cursor-pointer"
                              title="Avançar etapa"
                            >
                              <span>Avançar</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
