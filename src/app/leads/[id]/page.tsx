'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ExternalLink, 
  MessageSquare, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  PhoneCall, 
  UserX, 
  CheckCircle2, 
  Clock, 
  Trash2,
  Lock,
  Play,
  AlertTriangle
} from 'lucide-react';
import { ChromeIcon, InstagramIcon } from '@/components/Icons';
import { Lead, Message } from '@/db/schema';
import { getPipelineStatusLabel, getChannelStateLabel, formatDateBR } from '@/lib/utils';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMsgContent, setNewMsgContent] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Test Real DM state
  const [testingRealDm, setTestingRealDm] = useState(false);
  const [realDmFeedback, setRealDmFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const fetchLeadData = async () => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      if (res.ok) {
        const json = await res.json();
        setLead(json.lead);
        setMessages(json.messages || []);
        setNotes(json.lead?.notes || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const handleSendMessage = async (contentToSend: string, sender: 'agent' | 'lead' | 'operator' = 'operator') => {
    if (!contentToSend.trim()) return;

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newMessage: {
            content: contentToSend.trim(),
            sender,
            channel: lead?.channelState.includes('api') ? 'meta_api' : 'browser'
          }
        })
      });
      if (res.ok) {
        setNewMsgContent('');
        setAiSuggestion(null);
        fetchLeadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestRealDmOnChrome = async (dryRun: boolean = false) => {
    if (!lead) return;
    setTestingRealDm(true);
    setRealDmFeedback(null);

    try {
      const res = await fetch('/api/worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_direct_dm',
          leadId: lead.id,
          messageText: newMsgContent.trim() || undefined,
          dryRun
        })
      });
      const data = await res.json();
      setRealDmFeedback({
        success: data.success,
        message: data.message || (data.success ? 'DM enviada no Chrome!' : 'Falha no envio.')
      });
      fetchLeadData();
    } catch (e: any) {
      setRealDmFeedback({ success: false, message: e.message });
    } finally {
      setTestingRealDm(false);
    }
  };

  const handleGenerateAiResponse = async () => {
    if (!lead) return;
    setGeneratingAi(true);
    try {
      const lastMsg = messages.length > 0 ? messages[messages.length - 1].content : 'Olá!';
      const res = await fetch('/api/ai/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply_decision',
          leadProfile: {
            instagramHandle: lead.instagramHandle,
            fullName: lead.fullName,
            funnelType: lead.funnelType
          },
          lastLeadMessage: lastMsg,
          history: messages.map(m => ({ sender: m.sender, content: m.content }))
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result?.suggestedReply) {
          setAiSuggestion(json.result.suggestedReply);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStatus: newStatus })
      });
      fetchLeadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkDoNotContact = async () => {
    if (!confirm('Deseja marcar este lead como NÃO CONTATAR (do_not_contact)? Todas as automações serão suspensas para ele.')) return;
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pipelineStatus: 'closed',
          channelState: 'do_not_contact'
        })
      });
      fetchLeadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      fetchLeadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Deseja excluir permanentemente este lead e suas mensagens?')) return;
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      router.push('/leads');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !lead) {
    return (
      <div className="text-center py-24 text-slate-400 text-xs">
        Carregando detalhes do lead...
      </div>
    );
  }

  const statusInfo = getPipelineStatusLabel(lead.pipelineStatus);
  const channelInfo = getChannelStateLabel(lead.channelState);

  return (
    <div className="space-y-6">
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/leads"
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista de Leads</span>
        </Link>

        <div className="flex items-center space-x-2">
          {/* Button to Test Real DM in Chrome */}
          <button
            onClick={() => handleTestRealDmOnChrome(false)}
            disabled={testingRealDm}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-lg shadow-orange-600/20"
            title="Abre o Chrome real conectado via CDP e envia a DM agora"
          >
            <ChromeIcon className="w-3.5 h-3.5" />
            <span>{testingRealDm ? 'Conectando ao Chrome...' : 'Testar Envio Real no Chrome'}</span>
          </button>

          <button
            onClick={handleMarkDoNotContact}
            className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold rounded-lg flex items-center space-x-1"
            title="Adicionar à lista de Do Not Contact"
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Do Not Contact</span>
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 rounded-lg"
            title="Excluir Lead"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {realDmFeedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 border animate-in fade-in ${
          realDmFeedback.success
            ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
            : 'bg-amber-950/80 border-amber-700 text-amber-200'
        }`}>
          {realDmFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          <span>{realDmFeedback.message}</span>
        </div>
      )}

      {/* Main Grid: Chat History (Left) + Lead Info & Notes (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chat History & Message Flow (2 cols) */}
        <div className="lg:col-span-2 bg-[#131b2e] border border-slate-800 rounded-2xl flex flex-col h-[720px] shadow-xl overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                {lead.instagramHandle.replace('@', '').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-extrabold text-white text-sm">{lead.instagramHandle}</h2>
                  <a
                    href={`https://instagram.com/${lead.instagramHandle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="text-[11px] text-slate-400">
                  Canal Atual: <span className={`px-1.5 py-0.2 rounded font-medium ${channelInfo.color}`}>{channelInfo.label}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0d1322]">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs italic">
                Nenhuma mensagem registrada com este lead ainda.
              </div>
            ) : (
              messages.map((msg) => {
                const isAgent = msg.sender === 'agent' || msg.sender === 'operator';
                const claims = msg.claimsUsed ? JSON.parse(msg.claimsUsed) : [];

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mb-1 px-1">
                      <span>{msg.sender === 'agent' ? '🤖 Agente (Gemini)' : msg.sender === 'operator' ? '👤 Operador Manual' : '👤 Lead'}</span>
                      <span>•</span>
                      <span>{msg.channel === 'browser' ? 'Chrome Real (1ª DM)' : 'API Meta'}</span>
                      <span>•</span>
                      <span>{formatDateBR(msg.sentAt)}</span>
                    </div>

                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                        isAgent
                          ? 'bg-purple-900/60 border border-purple-700/60 text-purple-100 rounded-br-none'
                          : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.content}</p>

                      {claims.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-purple-800/40 text-[10px] text-emerald-300 flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3 shrink-0" />
                          <span>Claims verificadas: {claims.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* AI Suggestion Box */}
          {aiSuggestion && (
            <div className="p-3 bg-purple-950/90 border-t border-purple-800 text-xs text-purple-200 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between font-bold text-purple-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Sugestão Gerada pelo Google Gemini:
                </span>
                <button
                  onClick={() => setAiSuggestion(null)}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Descartar
                </button>
              </div>
              <p className="bg-slate-900/80 p-2.5 rounded-xl border border-purple-800/50 text-slate-200">
                {aiSuggestion}
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setNewMsgContent(aiSuggestion)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
                >
                  Copiar p/ Editor
                </button>
                <button
                  onClick={() => handleSendMessage(aiSuggestion, 'agent')}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs"
                >
                  Enviar Agora como IA
                </button>
              </div>
            </div>
          )}

          {/* Chat Footer Input */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/90 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <button
                type="button"
                onClick={handleGenerateAiResponse}
                disabled={generatingAi}
                className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{generatingAi ? 'Consultando Gemini...' : 'Gerar Resposta com IA (Gemini)'}</span>
              </button>
              <span className="text-[10px] text-slate-500">Trava de Canal Ativa</span>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Escreva uma mensagem manual para o lead..."
                value={newMsgContent}
                onChange={(e) => setNewMsgContent(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(newMsgContent, 'operator'); }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => handleSendMessage(newMsgContent, 'operator')}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </div>
          </div>

        </div>

        {/* Lead Profile, Signals & Notes (1 col) */}
        <div className="space-y-4">
          
          {/* Profile Card */}
          <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sinais do Perfil</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Nome / Identificação:</span>
                <span className="font-semibold text-white">{lead.fullName || 'Não informado'}</span>
              </div>
              
              <div>
                <span className="text-slate-500 block">Bio pública:</span>
                <p className="text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 mt-0.5 leading-relaxed">
                  {lead.bio || 'Sem bio'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Seguidores</span>
                  <span className="font-extrabold text-sm text-white">{lead.followerCount?.toLocaleString()}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">ICP Score</span>
                  <span className="font-extrabold text-sm text-emerald-400">{lead.icpScore} / 100</span>
                </div>
              </div>
            </div>

            {/* Pipeline Stage Quick Switch */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Alterar Etapa do Funil:
              </label>
              <select
                value={lead.pipelineStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="discovered">1. Descoberto</option>
                <option value="qualified">2. Qualificado</option>
                <option value="contacted">3. Abordado (1ª DM)</option>
                <option value="replied">4. Respondeu</option>
                <option value="interested">5. Interessado</option>
                <option value="whatsapp_handoff">6. No WhatsApp / Grupo</option>
                <option value="active_customer">7. Cliente Ativo 🚀</option>
                <option value="closed">8. Encerrado</option>
              </select>
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Anotações Internas</h3>
              {savingNotes && <span className="text-[10px] text-purple-400">Salvando...</span>}
            </div>
            <textarea
              rows={4}
              placeholder="Adicione notas sobre este lead..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleSaveNotes}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700"
            >
              Salvar Anotações
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
