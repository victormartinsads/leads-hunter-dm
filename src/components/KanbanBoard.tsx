'use client';

import React from 'react';
import Link from 'next/link';
import { Lead } from '@/db/schema';
import { getPipelineStatusLabel, getChannelStateLabel } from '@/lib/utils';
import { MessageSquare, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[];
  onMoveStage: (leadId: string, newStatus: string) => void;
}

const STAGES = [
  { id: 'discovered', label: '1. Descoberto', color: 'border-slate-600' },
  { id: 'contacted', label: '2. Abordado (1ª DM)', color: 'border-amber-600' },
  { id: 'replied', label: '3. Respondeu', color: 'border-blue-600' },
  { id: 'interested', label: '4. Interessado', color: 'border-purple-600' },
  { id: 'whatsapp_handoff', label: '5. No WhatsApp', color: 'border-emerald-500' },
  { id: 'active_customer', label: '6. Cliente Ativo 🚀', color: 'border-green-500' },
];

export default function KanbanBoard({ leads, onMoveStage }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage, sIdx) => {
        const stageLeads = leads.filter(l => {
          if (stage.id === 'whatsapp_handoff') {
            return ['whatsapp_handoff', 'joined_affiliate_group'].includes(l.pipelineStatus);
          }
          if (stage.id === 'active_customer') {
            return ['active_customer', 'active_affiliate', 'generated_customer'].includes(l.pipelineStatus);
          }
          return l.pipelineStatus === stage.id;
        });

        return (
          <div key={stage.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex flex-col min-w-[240px]">
            
            {/* Column Header */}
            <div className={`flex items-center justify-between pb-3 mb-3 border-b-2 ${stage.color}`}>
              <span className="font-bold text-xs text-white uppercase tracking-wider">{stage.label}</span>
              <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full">
                {stageLeads.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px]">
              {stageLeads.length === 0 ? (
                <div className="text-[11px] text-slate-600 text-center py-6 italic">
                  Nenhum lead nesta etapa
                </div>
              ) : (
                stageLeads.map((lead) => {
                  const channelInfo = getChannelStateLabel(lead.channelState);
                  return (
                    <div
                      key={lead.id}
                      className="bg-[#131b2e] border border-slate-800 hover:border-purple-500/50 rounded-xl p-3.5 shadow-md group transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-bold text-xs text-white group-hover:text-purple-400 transition-colors"
                        >
                          {lead.instagramHandle}
                        </Link>
                        <span className="text-[10px] font-bold bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700">
                          {lead.icpScore} pts
                        </span>
                      </div>

                      {lead.fullName && (
                        <div className="text-[11px] text-slate-400 truncate">
                          {lead.fullName}
                        </div>
                      )}

                      <div className="text-[10px] flex items-center justify-between pt-1 border-t border-slate-800 text-slate-500">
                        <span className={`px-1.5 py-0.5 rounded ${channelInfo.color}`}>
                          {channelInfo.label}
                        </span>
                        <Link
                          href={`/leads/${lead.id}`}
                          className="text-slate-400 hover:text-white p-1"
                          title="Abrir Chat"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Move Stage Quick Controls */}
                      <div className="flex justify-between items-center pt-1 text-[10px]">
                        {sIdx > 0 ? (
                          <button
                            onClick={() => onMoveStage(lead.id, STAGES[sIdx - 1].id)}
                            className="text-slate-500 hover:text-slate-300 flex items-center gap-0.5"
                            title="Voltar etapa"
                          >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Voltar</span>
                          </button>
                        ) : <div />}
                        
                        {sIdx < STAGES.length - 1 && (
                          <button
                            onClick={() => onMoveStage(lead.id, STAGES[sIdx + 1].id)}
                            className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-0.5 ml-auto"
                            title="Avançar etapa"
                          >
                            <span>Avançar</span>
                            <ArrowRight className="w-3 h-3" />
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
  );
}
