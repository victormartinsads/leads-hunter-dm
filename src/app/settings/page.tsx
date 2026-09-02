'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  Key, 
  Building, 
  PhoneCall, 
  Clock, 
  Sparkles,
  ExternalLink,
  Target,
  Users,
  MapPin,
  Tag,
  Trash2,
  Plus,
  ShieldAlert,
  Filter,
  Sliders
} from 'lucide-react';
import { BusinessConfig } from '@/lib/business-config';

export default function SettingsPage() {
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // ICP input states
  const [newSegment, setNewSegment] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newAffiliateTopic, setNewAffiliateTopic] = useState('');
  const [newExcludeKeyword, setNewExcludeKeyword] = useState('');

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.config) setConfig(data.config);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    setSavedMsg(false);

    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSegment.trim() || !config) return;
    setConfig({
      ...config,
      ICP_SEGMENTS: [...(config.ICP_SEGMENTS || []), newSegment.trim()]
    });
    setNewSegment('');
  };

  const handleRemoveSegment = (index: number) => {
    if (!config) return;
    const updated = [...config.ICP_SEGMENTS];
    updated.splice(index, 1);
    setConfig({ ...config, ICP_SEGMENTS: updated });
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || !config) return;
    setConfig({
      ...config,
      ICP_KEYWORDS: [...(config.ICP_KEYWORDS || []), newKeyword.trim()]
    });
    setNewKeyword('');
  };

  const handleRemoveKeyword = (index: number) => {
    if (!config) return;
    const updated = [...config.ICP_KEYWORDS];
    updated.splice(index, 1);
    setConfig({ ...config, ICP_KEYWORDS: updated });
  };

  const handleAddAffiliateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAffiliateTopic.trim() || !config) return;
    setConfig({
      ...config,
      AFFILIATE_TOPICS: [...(config.AFFILIATE_TOPICS || []), newAffiliateTopic.trim()]
    });
    setNewAffiliateTopic('');
  };

  const handleRemoveAffiliateTopic = (index: number) => {
    if (!config) return;
    const updated = [...config.AFFILIATE_TOPICS];
    updated.splice(index, 1);
    setConfig({ ...config, AFFILIATE_TOPICS: updated });
  };

  const handleAddExcludeKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExcludeKeyword.trim() || !config) return;
    setConfig({
      ...config,
      EXCLUDE_KEYWORDS: [...(config.EXCLUDE_KEYWORDS || []), newExcludeKeyword.trim().toLowerCase()]
    });
    setNewExcludeKeyword('');
  };

  const handleRemoveExcludeKeyword = (index: number) => {
    if (!config) return;
    const updated = [...(config.EXCLUDE_KEYWORDS || [])];
    updated.splice(index, 1);
    setConfig({ ...config, EXCLUDE_KEYWORDS: updated });
  };

  if (loading || !config) {
    return (
      <div className="text-center py-24 text-slate-400 text-xs">
        Carregando configurações do sistema...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <Settings className="w-7 h-7 text-purple-400" />
          <h1 className="text-2xl font-black text-white tracking-tight">Configurações do Negócio & ICP</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Defina quem é seu cliente ideal (ICP), critérios de qualificação, palavras-chave e limites operacionais.
        </p>
      </div>

      {savedMsg && (
        <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configurações salvas com sucesso em config/business.json!</span>
        </div>
      )}

      {/* ICP Qualification Thresholds (NEW CARD FOR LEAD FILTERING) */}
      <div className="bg-[#131b2e] border border-emerald-900/50 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Sarrafo de Qualificação & Critérios do ICP</h2>
            <p className="text-xs text-slate-400">Defina os parâmetros mínimos exigidos para que um lead seja considerado qualificado</p>
          </div>
        </div>

        {/* 1. Followers & ICP Score Thresholds */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Mínimo de Seguidores</label>
            <input
              type="number"
              value={config.MIN_FOLLOWERS ?? 1000}
              onChange={(e) => setConfig({ ...config, MIN_FOLLOWERS: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Ex: Ignora perfis com menos de 1.000 seguidores</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Máximo de Seguidores</label>
            <input
              type="number"
              value={config.MAX_FOLLOWERS ?? 200000}
              onChange={(e) => setConfig({ ...config, MAX_FOLLOWERS: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Ex: Evita grandes celebridades (máx 200k)</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Score Mínimo do Gemini (0-100)</label>
            <input
              type="number"
              value={config.MIN_ICP_SCORE ?? 70}
              onChange={(e) => setConfig({ ...config, MIN_ICP_SCORE: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Ex: Só aborda se nota for &gt;= 70</span>
          </div>
        </div>

        {/* 2. Toggles for Verified & Business */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Excluir Perfil Verificado (Selo Azul)</span>
              <span className="text-[11px] text-slate-400 block">Evita gastar DMs com contas verificadas inacessíveis</span>
            </div>
            <input
              type="checkbox"
              checked={!!config.EXCLUDE_VERIFIED_ACCOUNTS}
              onChange={(e) => setConfig({ ...config, EXCLUDE_VERIFIED_ACCOUNTS: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Exigir Conta Comercial / Business</span>
              <span className="text-[11px] text-slate-400 block">Só aborda perfis identificados como empresa ou criador</span>
            </div>
            <input
              type="checkbox"
              checked={!!config.REQUIRE_BUSINESS_ACCOUNT}
              onChange={(e) => setConfig({ ...config, REQUIRE_BUSINESS_ACCOUNT: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 3. Forbidden / Prohibited Keywords */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Palavras-chave Desqualificadoras (Filtro Anti-Spam / Nichos Proibidos):</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {(config.EXCLUDE_KEYWORDS || []).map((kw, idx) => (
              <span key={idx} className="bg-rose-950/60 border border-rose-800 text-rose-200 text-xs px-3 py-1.5 rounded-xl flex items-center space-x-2">
                <span>🚫 {kw}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveExcludeKeyword(idx)}
                  className="text-rose-400 hover:text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: apostas, cassino, tigrinho, futebol, memes..."
              value={newExcludeKeyword}
              onChange={(e) => setNewExcludeKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddExcludeKeyword(e); }}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleAddExcludeKeyword}
              className="px-3 py-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 rounded-xl text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Bloquear Palavra</span>
            </button>
          </div>
        </div>
      </div>

      {/* ICP Configuration Section (Target Audience & Keywords) */}
      <div className="bg-[#131b2e] border border-purple-900/50 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Segmentos & Palavras-chave do ICP</h2>
            <p className="text-xs text-slate-400">Termos positivos e nichos que orientam a busca e classificação da IA</p>
          </div>
        </div>

        {/* 1. ICP Segments */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Segmentos-Alvo (Funil A — Clientes):
          </label>
          <div className="flex flex-wrap gap-2">
            {(config.ICP_SEGMENTS || []).map((seg, idx) => (
              <span key={idx} className="bg-purple-950/60 border border-purple-800 text-purple-200 text-xs px-3 py-1.5 rounded-xl flex items-center space-x-2">
                <span>{seg}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSegment(idx)}
                  className="text-purple-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Clínicas médicas e odontológicas..."
              value={newSegment}
              onChange={(e) => setNewSegment(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddSegment(e); }}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleAddSegment}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Segmento</span>
            </button>
          </div>
        </div>

        {/* 2. ICP Keywords */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Palavras-chave de Busca & Bio:
          </label>
          <div className="flex flex-wrap gap-2">
            {(config.ICP_KEYWORDS || []).map((kw, idx) => (
              <span key={idx} className="bg-blue-950/60 border border-blue-800 text-blue-200 text-xs px-3 py-1.5 rounded-xl flex items-center space-x-2">
                <span>#{kw}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(idx)}
                  className="text-blue-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: consultoria, estética, ecommerce, vendas..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddKeyword(e); }}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Palavra</span>
            </button>
          </div>
        </div>

        {/* 3. Geography & Affiliate Topics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Região Geográfica:
            </label>
            <div className="relative">
              <input
                type="text"
                value={config.GEOGRAPHY}
                onChange={(e) => setConfig({ ...config, GEOGRAPHY: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Temas de Afiliados / Criadores (Funil B):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Adicionar tema..."
                value={newAffiliateTopic}
                onChange={(e) => setNewAffiliateTopic(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddAffiliateTopic(e); }}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleAddAffiliateTopic}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Affiliate Topics Tags */}
        <div className="flex flex-wrap gap-2">
          {(config.AFFILIATE_TOPICS || []).map((top, idx) => (
            <span key={idx} className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] px-2.5 py-1 rounded-lg flex items-center space-x-1.5">
              <span>{top}</span>
              <button
                type="button"
                onClick={() => handleRemoveAffiliateTopic(idx)}
                className="text-slate-500 hover:text-rose-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Business Identity Card */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Building className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Identidade da Empresa & Fundador</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Nome do Fundador / SDR</label>
              <input
                type="text"
                value={config.OWNER_NAME}
                onChange={(e) => setConfig({ ...config, OWNER_NAME: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Cargo do Fundador</label>
              <input
                type="text"
                value={config.OWNER_ROLE}
                onChange={(e) => setConfig({ ...config, OWNER_ROLE: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Nome da Empresa</label>
              <input
                type="text"
                value={config.COMPANY_NAME}
                onChange={(e) => setConfig({ ...config, COMPANY_NAME: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Site Oficial</label>
              <input
                type="text"
                value={config.COMPANY_WEBSITE}
                onChange={(e) => setConfig({ ...config, COMPANY_WEBSITE: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="text-xs space-y-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Pitch de Uma Linha</label>
              <input
                type="text"
                value={config.ONE_LINE_PITCH}
                onChange={(e) => setConfig({ ...config, ONE_LINE_PITCH: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Como Funciona</label>
              <input
                type="text"
                value={config.HOW_IT_WORKS}
                onChange={(e) => setConfig({ ...config, HOW_IT_WORKS: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Links & WhatsApp Card */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Links de Handoff & Conversão</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Link do WhatsApp (Funil Clientes)</label>
              <input
                type="text"
                value={config.WHATSAPP_LINK}
                onChange={(e) => setConfig({ ...config, WHATSAPP_LINK: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Link do Grupo de Afiliados (Funil Afiliados)</label>
              <input
                type="text"
                value={config.AFFILIATE_GROUP_LINK}
                onChange={(e) => setConfig({ ...config, AFFILIATE_GROUP_LINK: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Operational Limits Card */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Limites Operacionais & Segurança da Conta</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Máx DMs por dia</label>
              <input
                type="number"
                value={config.MAX_DMS_PER_DAY}
                onChange={(e) => setConfig({ ...config, MAX_DMS_PER_DAY: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Intervalo Mínimo (seg)</label>
              <input
                type="number"
                value={config.MIN_SECONDS_BETWEEN_DMS}
                onChange={(e) => setConfig({ ...config, MIN_SECONDS_BETWEEN_DMS: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-400 mb-1">Janela de Horário</label>
              <input
                type="text"
                value={config.OPERATING_HOURS}
                onChange={(e) => setConfig({ ...config, OPERATING_HOURS: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center space-x-2 shadow-xl shadow-purple-600/20"
          >
            {saving ? (
              <span>Salvando...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Todas as Configurações</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
