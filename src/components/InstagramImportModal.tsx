'use client';

import React, { useState, useEffect } from 'react';
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
  const [chromeOnline, setChromeOnline] = useState<boolean | null>(null);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const checkChrome = async () => {
    try {
      const res = await fetch('/api/system/chrome');
      const data = await res.json();
      setChromeOnline(data.online);
    } catch {
      setChromeOnline(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkChrome();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLaunchChrome = async () => {
    setLaunchingChrome(true);
    try {
      const res = await fetch('/api/system/chrome', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setChromeOnline(true);
        setResultMessage({ type: 'success', text: 'Chrome dedicado iniciado na porta 9222! Agora você pode capturar a hashtag ao vivo.' });
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
      try {
        data = await res.json();
      } catch (err) {
        data = { error: `Servidor retornou erro (Código ${res.status})` };
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

        {/* Chrome Status Banner */}
        <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs">
          <div className="flex items-center space-x-2">
            <ChromeIcon className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-300 font-medium">Status do Chrome:</span>
            {chromeOnline === true ? (
              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                Online (Porta 9222)
              </span>
            ) : (
              <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                Offline
              </span>
            )}
          </div>

          {chromeOnline !== true && (
            <button
              type="button"
              onClick={handleLaunchChrome}
              disabled={launchingChrome}
              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-lg text-[11px] font-extrabold cursor-pointer transition-all"
            >
              {launchingChrome ? 'Abrindo...' : '1-Clique: Abrir'}
            </button>
          )}
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
