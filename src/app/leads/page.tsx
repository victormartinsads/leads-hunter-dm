'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LeadTable from '@/components/LeadTable';
import KanbanBoard from '@/components/KanbanBoard';
import NewLeadModal from '@/components/NewLeadModal';
import InstagramImportModal from '@/components/InstagramImportModal';
import { Lead } from '@/db/schema';
import { 
  Users, 
  Table as TableIcon, 
  Kanban, 
  Plus, 
  Search, 
  RefreshCw,
  Sparkles,
  Download,
  Trash2
} from 'lucide-react';
import { InstagramIcon } from '@/components/Icons';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [funnelFilter, setFunnelFilter] = useState<'all' | 'customer' | 'affiliate'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let url = '/api/leads?';
      if (funnelFilter !== 'all') url += `funnel=${funnelFilter}&`;
      if (searchQuery.trim()) url += `q=${encodeURIComponent(searchQuery.trim())}&`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setLeads(json.leads || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [funnelFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleClearAllLeads = async () => {
    if (!window.confirm('Tem certeza que deseja limpar TODOS os leads do sistema? Esta ação apagará a lista atual.')) {
      return;
    }
    try {
      const res = await fetch('/api/leads', { method: 'DELETE' });
      if (res.ok) {
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSingleLead = async (id: string) => {
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveStage = async (leadId: string, newStatus: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, pipelineStatus: newStatus } : l));
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStatus: newStatus })
      });
    } catch (e) {
      console.error(e);
      fetchLeads();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Leads & Perfis Abordados</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Gestão do CRM com separação por funil (Clientes vs Afiliados) e controle de canal.
          </p>
        </div>

        {/* Action Bar Header Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleClearAllLeads}
            className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Limpar todos os leads cadastrados"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Limpar Todos os Leads</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <InstagramIcon className="w-4 h-4 text-zinc-950" />
            <span>🔍 Puxar Perfis do Instagram (20 em 20)</span>
          </button>

          <Link
            href="/leads/review"
            className="bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fila de Aprovação (Modo A)</span>
          </Link>
        </div>
      </div>

      {/* Filter & View Mode Controls Bar */}
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Buscar por @handle, nome ou tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
        </form>

        {/* Funnel Selector */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">Funil:</span>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-1 flex space-x-1">
            <button
              onClick={() => setFunnelFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                funnelFilter === 'all' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todos ({leads.length})
            </button>
            <button
              onClick={() => setFunnelFilter('customer')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                funnelFilter === 'customer' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Clientes (A)
            </button>
            <button
              onClick={() => setFunnelFilter('affiliate')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                funnelFilter === 'affiliate' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Afiliados (B)
            </button>
          </div>
        </div>

        {/* View Mode Toggle (Table / Kanban) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-1 flex space-x-1">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Visualização em Tabela"
          >
            <TableIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Tabela</span>
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              viewMode === 'kanban' ? 'bg-amber-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Visualização em Kanban"
          >
            <Kanban className="w-4 h-4" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
        </div>

      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 space-x-2 text-zinc-400">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
          <span className="text-xs font-semibold">Carregando CRM...</span>
        </div>
      ) : viewMode === 'table' ? (
        <LeadTable leads={leads} onRefresh={fetchLeads} onDeleteLead={handleDeleteSingleLead} />
      ) : (
        <KanbanBoard leads={leads} onMoveStage={handleMoveStage} />
      )}

      {/* Modals */}
      <NewLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeadAdded={fetchLeads}
      />

      <InstagramImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImported={fetchLeads}
      />

    </div>
  );
}
