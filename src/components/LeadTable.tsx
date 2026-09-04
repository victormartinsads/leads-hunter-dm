'use client';

import React from 'react';
import Link from 'next/link';
import { Lead } from '@/db/schema';
import { getPipelineStatusLabel, getChannelStateLabel, formatDateBR } from '@/lib/utils';
import { 
  ExternalLink, 
  MessageSquare, 
  Clock,
  Trash2
} from 'lucide-react';
import { InstagramIcon } from './Icons';

interface LeadTableProps {
  leads: Lead[];
  onRefresh?: () => void;
  onDeleteLead?: (id: string) => void;
}

export default function LeadTable({ leads, onRefresh, onDeleteLead }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400">
        <InstagramIcon className="w-10 h-10 text-amber-400/40 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">Nenhum lead no banco de dados</h3>
        <p className="text-xs text-zinc-400 mt-1">Use o botão "Puxar Perfis do Instagram (20 em 20)" acima para carregar novos perfis para aprovação.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121215] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4">Perfil / Lead</th>
              <th className="px-4 py-4">Funil</th>
              <th className="px-4 py-4">Score ICP</th>
              <th className="px-4 py-4">Etapa do Funil</th>
              <th className="px-4 py-4">Estado do Canal</th>
              <th className="px-4 py-4">Último Contato</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {leads.map((lead) => {
              const statusInfo = getPipelineStatusLabel(lead.pipelineStatus);
              const channelInfo = getChannelStateLabel(lead.channelState);
              let tags: string[] = [];
              if (lead.tags) {
                try { tags = JSON.parse(lead.tags); } catch { tags = []; }
              }

              return (
                <tr key={lead.id} className="hover:bg-zinc-900/60 transition-colors">
                  
                  {/* Lead Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-500/30 flex items-center justify-center font-bold text-xs text-amber-400 uppercase">
                        {lead.instagramHandle.replace('@', '').substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <Link 
                            href={`/leads/${lead.id}`}
                            className="font-bold text-white hover:text-amber-400 transition-colors"
                          >
                            {lead.instagramHandle}
                          </Link>
                          <a
                            href={`https://instagram.com/${lead.instagramHandle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-zinc-300"
                            title="Abrir no Instagram"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-medium">
                          {lead.fullName || 'Nome não capturado'} • {lead.followerCount?.toLocaleString()} seg.
                        </div>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tags.slice(0, 2).map((t: string, i: number) => (
                              <span key={i} className="text-[10px] bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Funnel Type */}
                  <td className="px-4 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                      lead.funnelType === 'affiliate' 
                        ? 'bg-amber-400/10 text-amber-300 border-amber-500/30' 
                        : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                    }`}>
                      {lead.funnelType === 'affiliate' ? 'Afiliado (B)' : 'Cliente (A)'}
                    </span>
                  </td>

                  {/* ICP Score */}
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center font-extrabold text-xs text-amber-400 border border-zinc-800">
                        {lead.icpScore}
                      </div>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold">
                        {lead.priority}
                      </span>
                    </div>
                  </td>

                  {/* Pipeline Status */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </td>

                  {/* Channel State */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded ${channelInfo.color}`}>
                      {channelInfo.label}
                    </span>
                  </td>

                  {/* Last Contact */}
                  <td className="px-4 py-4 text-[11px] text-zinc-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{formatDateBR(lead.lastContactAt)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-800 transition-colors"
                        title="Ver Histórico & Chat"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </Link>
                      {onDeleteLead && (
                        <button
                          onClick={() => onDeleteLead(lead.id)}
                          className="p-1.5 bg-rose-950/30 hover:bg-rose-900/60 text-rose-400 rounded-lg border border-rose-800/40 transition-colors cursor-pointer"
                          title="Excluir Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
