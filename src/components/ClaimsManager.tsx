'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  ArrowRight, 
  Trash2, 
  CheckCircle, 
  Info,
  Lock,
  Unlock,
  Sparkles
} from 'lucide-react';

interface ClaimsManagerProps {
  initialVerified: string[];
  initialUnverified: string[];
}

export default function ClaimsManager({ initialVerified, initialUnverified }: ClaimsManagerProps) {
  const [verified, setVerified] = useState<string[]>(initialVerified);
  const [unverified, setUnverified] = useState<string[]>(initialUnverified);
  const [newClaimText, setNewClaimText] = useState('');
  const [newClaimType, setNewClaimType] = useState<'verified' | 'unverified'>('unverified');
  const [promoteIndex, setPromoteIndex] = useState<number | null>(null);
  const [proofNote, setProofNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          text: newClaimText.trim(),
          type: newClaimType
        })
      });
      if (res.ok) {
        const data = await res.json();
        setVerified(data.verifiedClaims);
        setUnverified(data.unverifiedClaims);
        setNewClaimText('');
        showNotification('Nova afirmação adicionada com sucesso!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (index: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'promote',
          index,
          proofNote: proofNote.trim() || undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        setVerified(data.verifiedClaims);
        setUnverified(data.unverifiedClaims);
        setPromoteIndex(null);
        setProofNote('');
        showNotification('Afirmação comprovada e promovida para VERIFIED_CLAIMS!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index: number, type: 'verified' | 'unverified') => {
    if (!confirm('Deseja realmente remover esta alegação?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          index,
          type
        })
      });
      if (res.ok) {
        const data = await res.json();
        setVerified(data.verifiedClaims);
        setUnverified(data.unverifiedClaims);
        showNotification('Alegação removida.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Alert banner about strict rules */}
      <div className="bg-purple-950/40 border border-purple-800/60 rounded-2xl p-5 text-purple-200">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <strong className="text-white">A Regra das Duas Colunas:</strong> O agente de IA Google Gemini opera sob supervisão estrita. Ele <span className="underline font-bold text-emerald-300">só tem autorização</span> para falar aos leads o que estiver em <strong>VERIFIED_CLAIMS</strong>. Quaisquer ideias ou promessas em <strong>UNVERIFIED_CLAIMS</strong> são bloqueadas por prompt engineering e filtros de conformidade até que você anexe uma prova e as promova.
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-700 text-emerald-200 px-4 py-3 rounded-xl flex items-center space-x-2 text-sm">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Two columns: Verified vs Unverified */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column 1: VERIFIED_CLAIMS */}
        <div className="bg-[#131b2e] border border-emerald-900/60 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    VERIFIED_CLAIMS
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                      Liberado para IA
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Só o que você consegue provar hoje. É a única coisa que o Gemini pode afirmar.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
                {verified.length} ativas
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {verified.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-4 text-center">
                  Nenhuma claim verificada cadastrada. A IA não fará promessas aos leads.
                </div>
              ) : (
                verified.map((claim, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-emerald-900/40 rounded-xl p-3.5 flex items-start justify-between group hover:border-emerald-700/60 transition-colors">
                    <div className="flex items-start space-x-2.5 text-xs text-slate-200 leading-relaxed pr-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{claim}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(idx, 'verified')}
                      className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 2: UNVERIFIED_CLAIMS */}
        <div className="bg-[#131b2e] border border-amber-900/60 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                    UNVERIFIED_CLAIMS
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-full">
                      Bloqueado para IA
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">O que você quer dizer mas ainda não comprovou. Fica bloqueado até virar prova.</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-800">
                {unverified.length} bloqueadas
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {unverified.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-4 text-center">
                  Nenhuma claim bloqueada pendente.
                </div>
              ) : (
                unverified.map((claim, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-amber-900/40 rounded-xl p-3.5 space-y-2 group hover:border-amber-700/60 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2.5 text-xs text-slate-300 leading-relaxed pr-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{claim}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(idx, 'unverified')}
                        className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Promotion Form */}
                    {promoteIndex === idx ? (
                      <div className="mt-2 pt-2 border-t border-slate-800 space-y-2">
                        <input
                          type="text"
                          placeholder="Link ou evidência da prova (ex: Site oficial / Artigo)"
                          value={proofNote}
                          onChange={(e) => setProofNote(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setPromoteIndex(null)}
                            className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handlePromote(idx)}
                            disabled={loading}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>Confirmar e Liberar para IA</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setPromoteIndex(idx); setProofNote(''); }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center space-x-1 pt-1"
                      >
                        <span>Comprovar e Ativar na IA</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Add New Claim Form */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Plus className="w-4 h-4 text-purple-400" />
          Cadastrar Nova Afirmação / Claim
        </h3>
        <form onSubmit={handleAddClaim} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="Ex: Integração nativa com a API Oficial do Instagram Graph..."
              value={newClaimText}
              onChange={(e) => setNewClaimText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <select
              value={newClaimType}
              onChange={(e) => setNewClaimType(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="unverified">UNVERIFIED (Bloqueado p/ IA)</option>
              <option value="verified">VERIFIED (Liberado p/ IA)</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-purple-600/20"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
