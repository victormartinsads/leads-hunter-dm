'use client';

import React, { useState } from 'react';
import { X, Search, Sparkles, Download, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { InstagramIcon, ChromeIcon } from './Icons';

interface InstagramImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function InstagramImportModal({ isOpen, onClose, onImported }: InstagramImportModalProps) {
  const [mode, setMode] = useState<'hashtag' | 'handles'>('hashtag');
  const [hashtag, setHashtag] = useState('#facetasemresina');
  const [handles, setHandles] = useState('');
  const [quantity, setQuantity] = useState(20);
  const [funnelType, setFunnelType] = useState<'customer' | 'affiliate'>('customer');
  const [loading, setLoading] = useState(false);
  const [launchingChrome, setLaunchingChrome] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleLaunchChrome = async () => {
    setLaunchingChrome(true);
    try {
      const res = await fetch('/api/system/chrome', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResultMessage({ type: 'success', text: 'Chrome dedicado iniciado na porta 9222! Agora clique em "Capturar Lote de 20 Perfis Agora".' });
      } else {
        setResultMessage({ type: 'error', text: data.message || 'Não foi possível abrir o Chrome.' });
      }
    } catch (e: any) {
      setResultMessage({ type: 'error', text: 'Erro ao conectar ao Chrome.' });
    } finally {
      setLaunchingChrome(false);
    }
  };

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

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const rawText = await res.text();
        throw new Error(`Servidor retornou erro HTML: ${res.status}`);
      }

      if (res.ok && data.success) {
        setResultMessage({ type: 'success', text: data.message });
        setTimeout(() => {
          onImported();
          onClose();
          setResultMessage(null);
        }, 1800);
      } else {
        setResultMessage({ type: 'error', text: data.error || 'Erro ao capturar perfis reais.' });
      }
    } catch (err: any) {
      setResultMessage({ type: 'error', text: err.message || 'Erro de comunicação com o servidor.' });
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
              <p className="text-xs text-zinc-400">Puxe de 20 em 20 leads reais para o Modo A</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert Box */}
        {resultMessage && (
          <div className={`p-3.5 rounded-xl text-xs flex flex-col space-y-2 border ${
            resultMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300'
              : 'bg-amber-950/40 border-amber-700/60 text-amber-200'
          }`}>
            <div className="flex items-start space-x-2">
              {resultMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{resultMessage.text}</span>
            </div>

            {/* Quick Action Button if Chrome CDP is offline */}
            {resultMessage.type === 'error' && resultMessage.text.includes('Chrome') && (
              <div className="pt-1 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleLaunchChrome}
                  disabled={launchingChrome}
                  className="px-3 py-1.5 bg-amber-400 text-zinc-950 rounded-lg font-extrabold text-[11px] flex items-center space-x-1 cursor-pointer"
                >
                  <ChromeIcon className="w-3.5 h-3.5 text-zinc-950" />
                  <span>{launchingChrome ? 'Iniciando Chrome...' : '1-Clique: Abrir Chrome Dedicado'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('handles'); setResultMessage(null); }}
                  className="px-2.5 py-1.5 bg-zinc-900 text-zinc-300 rounded-lg text-[11px] font-semibold border border-zinc-700 cursor-pointer"
                >
                  Usar Lista de Perfis
                </button>
              </div>
            )}
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
                # Hashtag / Nicho (Ao Vivo)
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
                @ Lista de Handles Reais
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
                placeholder="Ex: #facetasemresina, #estetica, #odonto"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-[10px] text-zinc-500 block">Requer o Chrome dedicado aberto logado no Instagram.</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Cole os @handles reais (um por linha):</label>
              <textarea
                rows={4}
                required
                placeholder={"@dr.carloseduardo\n@studio.glowestetica\n@loja.bellamoda"}
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
