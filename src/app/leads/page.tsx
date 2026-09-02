'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LeadTable from '@/components/LeadTable';
import KanbanBoard from '@/components/KanbanBoard';
import NewLeadModal from '@/components/NewLeadModal';
import { Lead } from '@/db/schema';
import { 
  Users, 
  Table as TableIcon, 
  Kanban, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [funnelFilter, setFunnelFilter] = useState<'all' | 'customer' | 'affiliate'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleMoveStage = async (leadId: string, newStatus: string) => {
    // Optimistic UI update
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
            <Users className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Leads & Perfis Abordados</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestão completa do CRM com separação por funil (Clientes vs Afiliados) e controle de canal.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/leads/review"
            className="bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Fila de Aprovação (Modo A)</span>
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Filter & View Mode Controls Bar */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Buscar por @handle, nome ou tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </form>

        {/* Funnel Selector */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Funil:</span>
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-1 flex space-x-1">
            <button
              onClick={() => setFunnelFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                funnelFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({leads.length})
            </button>
            <button
              onClick={() => setFunnelFilter('customer')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                funnelFilter === 'customer' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Clientes (A)
            </button>
            <button
              onClick={() => setFunnelFilter('affiliate')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                funnelFilter === 'affiliate' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Afiliados (B)
            </button>
          </div>
        </div>

        {/* View Mode Toggle (Table / Kanban) */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-1 flex space-x-1">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Visualização em Tabela"
          >
            <TableIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Tabela</span>
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              viewMode === 'kanban' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
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
        <div className="flex items-center justify-center py-24 space-x-2 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
          <span className="text-xs font-semibold">Atualizando lista de leads...</span>
        </div>
      ) : viewMode === 'table' ? (
        <LeadTable leads={leads} onRefresh={fetchLeads} />
      ) : (
        <KanbanBoard leads={leads} onMoveStage={handleMoveStage} />
      )}

      {/* Modal */}
      <NewLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeadAdded={fetchLeads}
      />

    </div>
  );
}
