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
  ChevronRight
} from 'lucide-react';
import { ChromeIcon, InstagramIcon } from '@/components/Icons';
import { Lead } from '@/db/schema';
import { getPipelineStatusLabel, formatDateBR } from '@/lib/utils';

export default function GuidedReviewPage() {
  const router = useRouter();
  const [pendingLeads, setPendingLeads] = useState<Lead[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Message review state
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [reasoning, setReasoning] = useState<string>('');
  const [claimsUsed, setClaimsUsed] = useState<string[]>([]);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Sending state
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string; screenshotPath?: string } | null>(null);

  const fetchPendingLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads?status=discovered');
      if (res.ok) {
        const json = await res.json();
        const list = json.leads || [];
        setPendingLeads(list);
        if (list.length > 0) {
          generateMessageForLead(list[0]);
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

  const currentLead = pendingLeads[currentIndex];

  const generateMessageForLead = async (lead: Lead) => {
    setGeneratingAi(true);
    setSendResult(null);
    setIsEditing(false);
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
          funnelType: lead.funnelType
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

  const handleNextLead = () => {
    if (currentIndex < pendingLeads.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      generateMessageForLead(pendingLeads[nextIdx]);
    }
  };

  const handlePrevLead = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      generateMessageForLead(pendingLeads[prevIdx]);
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
        // Remove current lead from pending queue and advance
        setTimeout(() => {
          setPendingLeads(prev => prev.filter(l => l.id !== currentLead.id));
          if (currentIndex >= pendingLeads.length - 1) {
            setCurrentIndex(Math.max(0, pendingLeads.length - 2));
          }
          if (pendingLeads.length > 1) {
            generateMessageForLead(pendingLeads[currentIndex < pendingLeads.length - 1 ? currentIndex : 0]);
          }
        }, 3000);
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
      // Remove from list
      const updated = pendingLeads.filter(l => l.id !== currentLead.id);
      setPendingLeads(updated);
      if (updated.length > 0) {
        const nextIdx = Math.min(currentIndex, updated.length - 1);
        setCurrentIndex(nextIdx);
        generateMessageForLead(updated[nextIdx]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 space-x-3 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
        <span className="text-sm font-semibold">Carregando Fila de Aprovação 1 a 1...</span>
      </div>
    );
  }

  if (pendingLeads.length === 0) {
    return (
      <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-12 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Nenhum Lead Pendente de Aprovação!</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Todos os perfis em *Descobertos* já foram revisados, abordados ou movidos de etapa.
        </p>
        <div className="pt-2 flex justify-center space-x-3">
          <Link
            href="/leads"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Ver CRM de Leads
          </Link>
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
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Central de Aprovação Guiada (Modo A)</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Revise o perfil do lead, aprove ou edite o pitch do Gemini e envie com 1 clique no Chrome Real.
          </p>
        </div>

        {/* Counter */}
        <div className="flex items-center space-x-3 bg-[#131b2e] border border-slate-800 px-4 py-2 rounded-xl text-xs">
          <span className="text-slate-400 font-medium">Fila de Revisão:</span>
          <span className="font-extrabold text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
            {currentIndex + 1} de {pendingLeads.length}
          </span>
        </div>
      </div>

      {sendResult && (
        <div className={`p-4 rounded-2xl text-xs flex items-center justify-between border animate-in fade-in ${
          sendResult.success
            ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
            : 'bg-amber-950/90 border-amber-700 text-amber-200'
        }`}>
          <div className="flex items-center space-x-2">
            {sendResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
            <span className="font-semibold">{sendResult.message}</span>
          </div>
          {sendResult.success && <span className="text-[10px] bg-emerald-900 px-2 py-1 rounded">Avançando para o próximo lead...</span>}
        </div>
      )}

      {/* Main Review Card */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Profile Info Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-500 flex items-center justify-center font-black text-white text-lg shadow-lg">
              {currentLead.instagramHandle.replace('@', '').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white">{currentLead.instagramHandle}</h2>
                <a
                  href={`https://instagram.com/${currentLead.instagramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white"
                  title="Abrir perfil no Instagram"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {currentLead.fullName || 'Nome não capturado'} • {currentLead.followerCount?.toLocaleString()} seguidores
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-center">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">ICP Score</span>
              <span className="text-base font-black text-emerald-400">{currentLead.icpScore} / 100</span>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
              currentLead.funnelType === 'affiliate' 
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' 
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            }`}>
              {currentLead.funnelType === 'affiliate' ? 'Funil B (Afiliados)' : 'Funil A (Clientes)'}
            </span>
          </div>
        </div>

        {/* Bio & Signals */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bio Pública Capturada:</span>
          <p className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs text-slate-200 leading-relaxed font-sans">
            {currentLead.bio || 'Sem bio disponível'}
          </p>
        </div>

        {/* AI Pitch Generator & Editor Box */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Pitch Personalizado Gerado pelo Gemini (1ª DM):
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => generateMessageForLead(currentLead)}
                disabled={generatingAi}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                title="Regerar nova sugestão"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generatingAi ? 'animate-spin' : ''}`} />
                <span>{generatingAi ? 'Gerando...' : 'Regerar IA'}</span>
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-slate-400 hover:text-white font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Concluir Edição' : 'Editar Texto'}</span>
              </button>
            </div>
          </div>

          {/* Editable Text Area or Display */}
          {isEditing ? (
            <textarea
              rows={4}
              value={generatedMessage}
              onChange={(e) => setGeneratedMessage(e.target.value)}
              className="w-full bg-slate-950 border border-purple-500/80 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none leading-relaxed"
            />
          ) : (
            <div className="bg-purple-950/30 border border-purple-800/60 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-medium text-purple-100 leading-relaxed">
                "{generatedMessage}"
              </p>

              {reasoning && (
                <div className="text-[11px] text-slate-400 pt-2 border-t border-purple-900/50">
                  <strong className="text-purple-300">Raciocínio da IA:</strong> {reasoning}
                </div>
              )}

              {claimsUsed.length > 0 && (
                <div className="flex flex-wrap gap-1.5 text-[10px] text-emerald-300 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>VERIFIED_CLAIMS aplicadas: {claimsUsed.join(' • ')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Navigation Controls */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handlePrevLead}
              disabled={currentIndex === 0}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1 border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
            <button
              onClick={handleNextLead}
              disabled={currentIndex >= pendingLeads.length - 1}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1 border border-slate-700"
            >
              <span>Pular Lead</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRejectLead}
              className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-semibold flex items-center space-x-1 border border-rose-800"
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
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-purple-600/20 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Enviando pelo Chrome...</span>
                </>
              ) : (
                <>
                  <ChromeIcon className="w-4 h-4" />
                  <span>Aprovar & Enviar DM no Chrome Real</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
