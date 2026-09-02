'use client';

import React, { useState } from 'react';
import { X, Plus, Sparkles, CheckCircle } from 'lucide-react';
import { InstagramIcon } from './Icons';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded: () => void;
}

export default function NewLeadModal({ isOpen, onClose, onLeadAdded }: NewLeadModalProps) {
  const [handle, setHandle] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [followerCount, setFollowerCount] = useState('5000');
  const [funnelType, setFunnelType] = useState('customer');
  const [icpScore, setIcpScore] = useState('85');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instagramHandle: handle.trim(),
          fullName: fullName.trim() || undefined,
          bio: bio.trim() || undefined,
          followerCount: Number(followerCount) || 0,
          funnelType,
          icpScore: Number(icpScore) || 75,
          notes: notes.trim() || undefined,
          tags: funnelType === 'affiliate' ? ['Criador', 'Afiliado'] : ['Lojista', 'E-commerce']
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Erro ao cadastrar lead.');
        return;
      }

      onLeadAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#131b2e] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <InstagramIcon className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Adicionar Novo Perfil / Lead</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              @ do Instagram *
            </label>
            <input
              type="text"
              required
              placeholder="@nomedaloja"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Nome da Loja / Decisor
              </label>
              <input
                type="text"
                placeholder="Ex: Bella Moda"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Funil de Destino
              </label>
              <select
                value={funnelType}
                onChange={(e) => setFunnelType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-purple-500"
              >
                <option value="customer">Funil A (Clientes/Lojistas)</option>
                <option value="affiliate">Funil B (Afiliados/Criadores)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Bio / Descrição do Perfil
            </label>
            <textarea
              rows={2}
              placeholder="Cole a bio do perfil para contextualizar a IA..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Seguidores Estimados
              </label>
              <input
                type="number"
                value={followerCount}
                onChange={(e) => setFollowerCount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Score ICP Inicial (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={icpScore}
                onChange={(e) => setIcpScore(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Observações / Notas Internas
            </label>
            <input
              type="text"
              placeholder="Ex: Encontrado via hashtag #modafeminina"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2 rounded-xl text-xs transition-colors shadow-lg shadow-purple-600/20 flex items-center space-x-1.5"
            >
              {loading ? <span>Cadastrando...</span> : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar e Enfileirar 1ª DM</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
