'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  Settings, 
  Play, 
  Pause, 
  Globe, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  ExternalLink,
  Power
} from 'lucide-react';
import { ChromeIcon } from './Icons';

export default function Navbar() {
  const pathname = usePathname();
  const [isPaused, setIsPaused] = useState(false);
  const [chromeStatus, setChromeStatus] = useState<'online' | 'offline_simulated'>('offline_simulated');
  const [geminiStatus, setGeminiStatus] = useState<boolean>(true);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [launchingChrome, setLaunchingChrome] = useState(false);
  const [chromeMsg, setChromeMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setIsPaused(data.system?.paused ?? false);
        setChromeStatus(data.system?.chromeStatus || 'offline_simulated');
        setGeminiStatus(data.system?.geminiConfigured ?? false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePause = async () => {
    setLoadingToggle(true);
    try {
      const res = await fetch('/api/worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_pause' })
      });
      if (res.ok) {
        const data = await res.json();
        setIsPaused(data.paused);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleLaunchChrome = async () => {
    setLaunchingChrome(true);
    setChromeMsg(null);
    try {
      const res = await fetch('/api/system/chrome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'launch' })
      });
      const data = await res.json();
      setChromeMsg(data.message);
      fetchStatus();
      setTimeout(() => setChromeMsg(null), 6000);
    } catch (e: any) {
      setChromeMsg('Erro ao abrir Chrome: ' + e.message);
    } finally {
      setLaunchingChrome(false);
    }
  };

  const navLinks = [
    { href: '/', label: 'Visão Geral', icon: LayoutDashboard },
    { href: '/leads/review', label: 'Modo A (Aprovação 1 a 1)', icon: Sparkles },
    { href: '/leads', label: 'Leads Abordados', icon: Users },
    { href: '/claims', label: 'Claims & Regras', icon: ShieldCheck },
    { href: '/simulator', label: 'Simulador Gemini', icon: Sparkles },
    { href: '/settings', label: 'Configurações & ICP', icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                  <Flame className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <div className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
                    Buscando 1 Milhão
                  </div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-purple-400">
                    Agente Comercial • Google Gemini
                  </div>
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Status Badges & Quick Action Buttons */}
            <div className="flex items-center space-x-2.5">
              
              {/* Gemini Badge */}
              <div className={`hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                geminiStatus 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                <Cpu className="w-3.5 h-3.5" />
                <span>Gemini 3.6 Flash</span>
              </div>

              {/* Chrome Launch / Status Button */}
              {chromeStatus === 'online' ? (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5" />
                  <ChromeIcon className="w-3.5 h-3.5" />
                  <span>Chrome Conectado</span>
                </div>
              ) : (
                <button
                  onClick={handleLaunchChrome}
                  disabled={launchingChrome}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors shadow-sm"
                  title="Clique para abrir a janela do Chrome dedicado no seu computador"
                >
                  <ChromeIcon className="w-3.5 h-3.5" />
                  <span>{launchingChrome ? 'Abrindo...' : 'Abrir Chrome (1-Clique)'}</span>
                </button>
              )}

              {/* General System Pause Switch */}
              <button
                onClick={togglePause}
                disabled={loadingToggle}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                  isPaused
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    : 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-rose-600/20'
                }`}
                title={isPaused ? 'Clique para retomar a operação' : 'Clique para pausar imediatamente todas as abordagens'}
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Retomar</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pausar</span>
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Chrome notification popup */}
      {chromeMsg && (
        <div className="bg-amber-950 border-b border-amber-700 text-amber-200 px-4 py-2 text-xs text-center font-medium animate-in fade-in">
          {chromeMsg}
        </div>
      )}
    </>
  );
}
