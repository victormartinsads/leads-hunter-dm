'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Sparkles, 
  Send, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink, 
  UserX, 
  Edit3, 
  Eye, 
  AlertTriangle,
  Flame,
  Check,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Layers,
  Award,
  Target
} from 'lucide-react';
import { ChromeIcon, InstagramIcon } from '@/components/Icons';
import { Lead } from '@/db/schema';
import { getPipelineStatusLabel, formatDateBR } from '@/lib/utils';
import { evaluateLeadQualification } from '@/lib/qualification';
import { recommendEntryService, DEFAULT_ENTRY_SERVICES, EntryService } from '@/lib/entry-services';

export default function GuidedReviewPage() {
  const router = useRouter();
  const [allPendingLeads, setAllPendingLeads] = useState<Lead[]>([]);
  const [batchSize, setBatchSize] = useState<number>(20);
  const [currentBatchIndex, setCurrentBatchIndex] = useState<number>(0);
  const [leadInBatchIndex, setLeadInBatchIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [businessConfig, setBusinessConfig] = useState<any>({});
  
  // Selected Entry Service per lead
  const [selectedServiceMap, setSelectedServiceMap] = useState<Record<string, string>>({});

  // Follower edit state
  const [editingFollowers, setEditingFollowers] = useState(false);
  const [newFollowerCount, setNewFollowerCount] = useState<number>(0);

  // Message review state
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [reasoning, setReasoning] = useState<string>('');
  const [claimsUsed, setClaimsUsed] = useState<string[]>([]);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);

  // Sending state
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string; screenshotPath?: string } | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(d => { if (d.config) setBusinessConfig(d.config); })
      .catch(() => {});
  }, []);

  const fetchPendingLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads?status=discovered');
      if (res.ok) {
        const json = await res.json();
        const list: Lead[] = json.leads || [];
        setAllPendingLeads(list);
        setLeadInBatchIndex(0);
        setCurrentBatchIndex(0);
        if (list.length > 0) {
          generateMessageForLead(list[0]);
          setNewFollowerCount(list[0].followerCount || 0);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLeads();
  }, []);

  // Calculate current batch of 20 leads
  const batchStart = currentBatchIndex * batchSize;
  const currentBatchLeads = allPendingLeads.slice(batchStart, batchStart + batchSize);
  const currentLead = currentBatchLeads[leadInBatchIndex];

  const generateMessageForLead = async (lead: Lead, customService?: string) => {
    if (!lead) return;
    setGeneratingAi(true);
    setSendResult(null);
    setIsEditingText(false);
    setEditingFollowers(false);
    setNewFollowerCount(lead.followerCount || 0);

    const activeService = customService || selectedServiceMap[lead.id] || recommendEntryService(lead).name;

    try {
      const res = await fetch('/api/ai/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'icebreaker',
          instagramHandle: lead.instagramHandle,
          fullName: lead.fullName,
          bio: lead.bio,
          followerCount: lead.followerCount,
          funnelType: lead.funnelType,
          targetService: activeService
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result) {
          setGeneratedMessage(json.result.message || '');
          setReasoning(json.result.reasoning || '');
          setClaimsUsed(json.result.claimsUsed || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleUpdateFollowers = async () => {
    if (!currentLead) return;
    try {
      const res = await fetch(`/api/leads/${currentLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerCount: newFollowerCount })
      });
      if (res.ok) {
        const updatedLead = { ...currentLead, followerCount: newFollowerCount };
        setAllPendingLeads(prev => prev.map(l => l.id === currentLead.id ? updatedLead : l));
        setEditingFollowers(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextLead = () => {
    if (leadInBatchIndex < currentBatchLeads.length - 1) {
      const nextIdx = leadInBatchIndex + 1;
      setLeadInBatchIndex(nextIdx);
      generateMessageForLead(currentBatchLeads[nextIdx]);
    }
  };

  const handlePrevLead = () => {
    if (leadInBatchIndex > 0) {
      const prevIdx = leadInBatchIndex - 1;
      setLeadInBatchIndex(prevIdx);
      generateMessageForLead(currentBatchLeads[prevIdx]);
    }
  };

  const handleApproveAndSend = async (dryRun: boolean = false) => {
    if (!currentLead || !generatedMessage.trim()) return;
    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_direct_dm',
          leadId: currentLead.id,
          messageText: generatedMessage.trim(),
          dryRun
        })
      });
      const data = await res.json();
      setSendResult({
        success: data.success,
        message: data.message || (data.success ? 'DM enviada no Chrome!' : 'Falha no envio.'),
        screenshotPath: data.browserResult?.screenshotPath
      });

      if (data.success) {
        // Advance in batch after short delay
        setTimeout(() => {
          const remainingAll = allPendingLeads.filter(l => l.id !== currentLead.id);
          setAllPendingLeads(remainingAll);

          const remainingInBatch = currentBatchLeads.filter(l => l.id !== currentLead.id);
          if (remainingInBatch.length > 0) {
            const nextIdx = Math.min(leadInBatchIndex, remainingInBatch.length - 1);
            setLeadInBatchIndex(nextIdx);
            generateMessageForLead(remainingInBatch[nextIdx]);
          }
        }, 2500);
      }
    } catch (e: any) {
      setSendResult({ success: false, message: e.message });
    } finally {
      setSending(false);
    }
  };

  const handleRejectLead = async () => {
    if (!currentLead) return;
    try {
      await fetch(`/api/leads/${currentLead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pipelineStatus: 'closed',
          channelState: 'do_not_contact'
        })
      });
      const remainingAll = allPendingLeads.filter(l => l.id !== currentLead.id);
      setAllPendingLeads(remainingAll);

      const remainingInBatch = currentBatchLeads.filter(l => l.id !== currentLead.id);
      if (remainingInBatch.length > 0) {
        const nextIdx = Math.min(leadInBatchIndex, remainingInBatch.length - 1);
        setLeadInBatchIndex(nextIdx);
        generateMessageForLead(remainingInBatch[nextIdx]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 space-x-3 text-zinc-400">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
        <span className="text-xs font-semibold">Carregando Fila de Aprovação em Lotes...</span>
      </div>
    );
  }

  if (allPendingLeads.length === 0) {
    return (
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-amber-400" />
        </div>
        <h2 className="text-lg font-bold text-white">Nenhum Lead Pendente de Aprovação!</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Todos os perfis em *Descobertos* já foram revisados, abordados ou movidos de etapa.
        </p>
        <div className="pt-2 flex justify-center space-x-3">
          <Link
            href="/leads"
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl text-xs font-extrabold transition-all"
          >
            Ver CRM de Leads
          </Link>
        </div>
      </div>
    );
  }

  // Check if current batch is finished
  const totalBatches = Math.ceil(allPendingLeads.length / batchSize);
  const isBatchFinished = currentBatchLeads.length === 0;

  if (isBatchFinished && allPendingLeads.length > 0) {
    return (
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <Award className="w-7 h-7 text-amber-400" />
        </div>
        <h2 className="text-xl font-black text-white">🎉 Lote de {batchSize} Leads Concluído!</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Você concluiu a revisão do Lote {currentBatchIndex + 1}. Restam {allPendingLeads.length} leads pendentes na fila geral.
        </p>
        <div className="pt-2 flex justify-center space-x-3">
          <button
            onClick={() => {
              const nextBatch = Math.min(currentBatchIndex + 1, totalBatches - 1);
              setCurrentBatchIndex(nextBatch);
              setLeadInBatchIndex(0);
              const newBatchLeads = allPendingLeads.slice(nextBatch * batchSize, (nextBatch + 1) * batchSize);
              if (newBatchLeads.length > 0) generateMessageForLead(newBatchLeads[0]);
            }}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            🚀 Iniciar Próximo Lote de {batchSize} Leads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Aprovação Guiada em Lotes (20 em 20)</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Revise os perfis em lotes gerenciáveis de 20 leads por sessão antes do disparo real no Chrome.
          </p>
        </div>

        {/* Batch Counter Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#121215] border border-zinc-800 px-3.5 py-1.5 rounded-xl text-xs">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-zinc-400 font-medium">Lote {currentBatchIndex + 1} de {totalBatches}:</span>
            <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-500/30">
              Lead {leadInBatchIndex + 1} de {currentBatchLeads.length}
            </span>
          </div>

          <select
            value={batchSize}
            onChange={(e) => {
              const sz = Number(e.target.value);
              setBatchSize(sz);
              setLeadInBatchIndex(0);
              setCurrentBatchIndex(0);
            }}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 px-2.5 py-1.5 rounded-xl font-mono focus:outline-none"
          >
            <option value={20}>Lotes de 20</option>
            <option value={50}>Lotes de 50</option>
            <option value={100}>Lotes de 100</option>
          </select>
        </div>
      </div>

      {sendResult && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border animate-in fade-in ${
          sendResult.success
            ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
            : 'bg-amber-950/80 border-amber-700 text-amber-200'
        }`}>
          <div className="flex items-center space-x-2">
            {sendResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            <span className="font-semibold">{sendResult.message}</span>
          </div>
          {sendResult.success && <span className="text-[10px] bg-emerald-900/60 px-2 py-1 rounded font-mono">Avançando pro próximo lead...</span>}
        </div>
      )}

      {/* Main Review Card */}
      {currentLead && (
        <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Profile Info Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-base">
                {currentLead.instagramHandle.replace('@', '').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-extrabold text-white">{currentLead.instagramHandle}</h2>
                  <a
                    href={`https://instagram.com/${currentLead.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-white"
                    title="Abrir perfil real no Instagram para checar dados"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                {/* Follower Count with Inline Editor */}
                <div className="flex items-center space-x-2 text-xs text-zinc-400 font-medium mt-0.5">
                  <span>{currentLead.fullName || 'Nome não capturado'} •</span>
                  
                  {editingFollowers ? (
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={newFollowerCount}
                        onChange={(e) => setNewFollowerCount(Number(e.target.value))}
                        className="w-20 bg-zinc-950 border border-amber-500 rounded px-2 py-0.5 text-xs text-white"
                      />
                      <button
                        onClick={handleUpdateFollowers}
                        className="px-2 py-0.5 bg-amber-400 text-zinc-950 rounded text-[10px] font-bold"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <span className="flex items-center space-x-1.5">
                      <strong className="text-zinc-200">{currentLead.followerCount?.toLocaleString()} seguidores</strong>
                      <button
                        onClick={() => setEditingFollowers(true)}
                        className="text-zinc-500 hover:text-amber-400 p-0.5"
                        title="Corrigir número real de seguidores"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>

              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-center">
                <span className="text-[10px] text-zinc-500 block uppercase font-bold">ICP Score</span>
                <span className="text-sm font-black text-amber-400">{currentLead.icpScore} / 100</span>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                currentLead.funnelType === 'affiliate' 
                  ? 'bg-amber-400/10 text-amber-300 border-amber-500/30' 
                  : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
              }`}>
                {currentLead.funnelType === 'affiliate' ? 'Funil B (Afiliados)' : 'Funil A (Clientes)'}
              </span>
            </div>
          </div>

          {/* Diagnostic Entry Offer Service Card */}
          {(() => {
            const recommended = recommendEntryService(currentLead);
            const activeService = selectedServiceMap[currentLead.id] || recommended.name;
            const matchedObj = DEFAULT_ENTRY_SERVICES.find(s => s.name === activeService) || recommended;

            return (
              <div className="bg-gradient-to-r from-amber-950/20 via-[#18181b] to-[#18181b] border border-amber-500/30 rounded-xl p-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Serviço de Entrada Recomendado:</span>
                  </div>

                  <select
                    value={activeService}
                    onChange={(e) => {
                      const newService = e.target.value;
                      setSelectedServiceMap(prev => ({ ...prev, [currentLead.id]: newService }));
                      generateMessageForLead(currentLead, newService);
                    }}
                    className="bg-zinc-950 border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {DEFAULT_ENTRY_SERVICES.map(srv => (
                      <option key={srv.id} value={srv.name} className="bg-zinc-950 text-white">
                        {srv.name} ({srv.priceLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  💡 <strong className="text-amber-300">Diagnóstico da Oferta:</strong> {matchedObj.oneLineHook}
                </p>
              </div>
            );
          })()}

          {/* Bio & Signals */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Bio Pública Capturada:</span>
            <p className="bg-[#18181b] border border-zinc-800 p-4 rounded-xl text-xs text-zinc-200 leading-relaxed font-sans">
              {currentLead.bio || 'Sem bio disponível'}
            </p>
          </div>

          {/* Live Qualification Audit Card */}
          {(() => {
            const qual = evaluateLeadQualification({
              followerCount: currentLead.followerCount,
              bio: currentLead.bio,
              fullName: currentLead.fullName,
              instagramHandle: currentLead.instagramHandle,
              icpScore: currentLead.icpScore
            }, businessConfig);

            return (
              <div className={`p-4 rounded-xl border ${
                qual.isQualified
                  ? 'bg-emerald-950/20 border-emerald-800/40'
                  : 'bg-amber-950/20 border-amber-800/40'
              }`}>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800/60">
                  <div className="flex items-center space-x-2">
                    <Sliders className={`w-4 h-4 ${qual.isQualified ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Auditoria de Qualificação do ICP:
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${
                    qual.isQualified
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {qual.summary}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {qual.checks.map((chk, i) => (
                    <div key={i} className="flex items-start space-x-1.5 text-zinc-300 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/60">
                      <span className={chk.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {chk.passed ? '✓' : '✕'}
                      </span>
                      <div>
                        <span className="font-semibold text-zinc-200 block">{chk.rule}</span>
                        <span className="text-zinc-400 text-[10px]">{chk.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* AI Pitch Generator & Editor Box */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Pitch Personalizado Gerado pelo Gemini (1ª DM):
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => generateMessageForLead(currentLead)}
                  disabled={generatingAi}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  title="Regerar nova sugestão"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generatingAi ? 'animate-spin' : ''}`} />
                  <span>{generatingAi ? 'Gerando...' : 'Regerar IA'}</span>
                </button>
                <button
                  onClick={() => setIsEditingText(!isEditingText)}
                  className="text-xs text-zinc-400 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingText ? 'Concluir Edição' : 'Editar Texto'}</span>
                </button>
              </div>
            </div>

            {/* Editable Text Area or Display */}
            {isEditingText ? (
              <textarea
                rows={4}
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                className="w-full bg-zinc-950 border border-amber-500/60 rounded-xl p-4 text-xs text-white placeholder-zinc-500 focus:outline-none leading-relaxed"
              />
            ) : (
              <div className="bg-[#18181b] border border-amber-500/30 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-zinc-100 leading-relaxed">
                  "{generatedMessage}"
                </p>

                {reasoning && (
                  <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                    <strong className="text-amber-400">Raciocínio da IA:</strong> {reasoning}
                  </div>
                )}

                {claimsUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 text-[10px] text-emerald-400 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>VERIFIED_CLAIMS aplicadas: {claimsUsed.join(' • ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons Toolbar */}
          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Navigation Controls */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={handlePrevLead}
                disabled={leadInBatchIndex === 0}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 rounded-xl text-xs font-semibold flex items-center space-x-1 border border-zinc-800 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <button
                onClick={handleNextLead}
                disabled={leadInBatchIndex >= currentBatchLeads.length - 1}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 rounded-xl text-xs font-semibold flex items-center space-x-1 border border-zinc-800 cursor-pointer"
              >
                <span>Pular Lead</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRejectLead}
                className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-semibold flex items-center space-x-1 border border-rose-800/60 cursor-pointer"
                title="Marcar como Não Contatar"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Rejeitar</span>
              </button>
            </div>

            {/* Primary Action Button: Approve & Send on Real Chrome */}
            <div className="w-full sm:w-auto flex items-center space-x-2">
              <button
                onClick={() => handleApproveAndSend(false)}
                disabled={sending || !generatedMessage.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer transform active:scale-95"
              >
                {sending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Enviando pelo Chrome...</span>
                  </>
                ) : (
                  <>
                    <ChromeIcon className="w-4 h-4 text-zinc-950" />
                    <span>Aprovar e Enviar DM no Chrome Real</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
