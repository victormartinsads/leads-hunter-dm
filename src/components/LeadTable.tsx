'use client';

import React from 'react';
import Link from 'next/link';
import { Lead } from '@/db/schema';
import { getPipelineStatusLabel, getChannelStateLabel, formatDateBR } from '@/lib/utils';
import { 
  ExternalLink, 
  MessageSquare, 
  Clock
} from 'lucide-react';
import { InstagramIcon } from './Icons';

interface LeadTableProps {
  leads: Lead[];
  onRefresh?: () => void;
}

export default function LeadTable({ leads, onRefresh }: LeadTableProps) {
  if (leads.length === 0) {
    return (
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <InstagramIcon className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
        <h3 className="text-base font-semibold text-white">Nenhum lead encontrado</h3>
        <p className="text-xs text-slate-400 mt-1">Ajuste os filtros de busca ou cadastre novos perfis para iniciar a prospecção.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#131b2e] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
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
          <tbody className="divide-y divide-slate-800/60">
            {leads.map((lead) => {
              const statusInfo = getPipelineStatusLabel(lead.pipelineStatus);
              const channelInfo = getChannelStateLabel(lead.channelState);
              const tags = lead.tags ? JSON.parse(lead.tags) : [];

              return (
                <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  {/* Lead Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white uppercase shadow-md">
                        {lead.instagramHandle.replace('@', '').substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <Link 
                            href={`/leads/${lead.id}`}
                            className="font-bold text-white hover:text-purple-400 transition-colors"
                          >
                            {lead.instagramHandle}
                          </Link>
                          <a
                            href={`https://instagram.com/${lead.instagramHandle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-slate-300"
                            title="Abrir no Instagram"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {lead.fullName || 'Nome não capturado'} • {lead.followerCount?.toLocaleString()} seg.
                        </div>
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tags.slice(0, 2).map((t: string, i: number) => (
                              <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
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
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      lead.funnelType === 'affiliate' 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}>
                      {lead.funnelType === 'affiliate' ? 'Afiliado (B)' : 'Cliente (A)'}
                    </span>
                  </td>

                  {/* ICP Score */}
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-extrabold text-xs text-emerald-400 border border-slate-700">
                        {lead.icpScore}
                      </div>
                      <span className="text-[11px] text-slate-500 uppercase font-bold">
                        {lead.priority}
                      </span>
                    </div>
                  </td>

                  {/* Pipeline Status */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </td>

                  {/* Channel State */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${channelInfo.color}`}>
                      {channelInfo.label}
                    </span>
                  </td>

                  {/* Last Contact */}
                  <td className="px-4 py-4 text-xs text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatDateBR(lead.lastContactAt)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                        title="Ver Histórico & Chat"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/leads/${lead.id}`}
                        className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 text-xs font-semibold rounded-lg border border-purple-500/30 transition-colors"
                      >
                        Detalhes
                      </Link>
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
