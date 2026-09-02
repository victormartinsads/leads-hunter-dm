'use client';

import React, { useState } from 'react';
import { X, Search, Sparkles, Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import { InstagramIcon } from './Icons';

interface InstagramImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function InstagramImportModal({ isOpen, onClose, onImported }: InstagramImportModalProps) {
  const [mode, setMode] = useState<'hashtag' | 'handles'>('hashtag');
  const [hashtag, setHashtag] = useState('#estetica');
  const [handles, setHandles] = useState('');
  const [quantity, setQuantity] = useState(20);
  const [funnelType, setFunnelType] = useState<'customer' | 'affiliate'>('customer');
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultMessage(null);

    try {
      const res = await fetch('/api/leads/import-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          hashtag,
          handles,
          quantity,
          funnelType
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResultMessage(data.message);
        setTimeout(() => {
          onImported();
          onClose();
          setResultMessage(null);
        }, 1500);
      } else {
        setResultMessage(data.error || 'Erro ao capturar perfis.');
      }
    } catch (err: any) {
      setResultMessage(err.message || 'Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-500/20">
              <InstagramIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Capturar Perfis do Instagram</h3>
              <p className="text-xs text-zinc-400">Puxe de 20 em 20 leads qualificados para o Modo A</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {resultMessage && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resultMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 block">Método de Captura:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('hashtag')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                  mode === 'hashtag'
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 font-extrabold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                # Hashtag / Nicho
              </button>
              <button
                type="button"
                onClick={() => setMode('handles')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                  mode === 'handles'
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 font-extrabold'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                @ Lista de Handles
              </button>
            </div>
          </div>

          {/* Mode Input */}
          {mode === 'hashtag' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Hashtag ou Nicho Alvo:</label>
              <input
                type="text"
                required
                placeholder="Ex: #estetica, #odontologia, #modafeminina"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Cole os @handles (um por linha):</label>
              <textarea
                rows={4}
                required
                placeholder={"@loja.bellamoda\n@dr.carloseduardo\n@agencia_vortice"}
                value={handles}
                onChange={(e) => setHandles(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          )}

          {/* Quantity Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Tamanho do Lote:</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
              >
                <option value={20}>20 Perfis (Padrão)</option>
                <option value={50}>50 Perfis</option>
                <option value={100}>100 Perfis</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Funil de Destino:</label>
              <select
                value={funnelType}
                onChange={(e) => setFunnelType(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
              >
                <option value="customer">Clientes (Funil A)</option>
                <option value="affiliate">Afiliados (Funil B)</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Capturando {quantity} Perfis no Instagram...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-zinc-950" />
                  <span>🚀 Capturar Lote de {quantity} Perfis Agora</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
