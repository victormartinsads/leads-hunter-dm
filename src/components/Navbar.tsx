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
  Cpu, 
  Flame
} from 'lucide-react';
import { ChromeIcon } from './Icons';

export default function Navbar() {
  const pathname = usePathname();
  const [isPaused, setIsPaused] = useState(false);
  const [chromeStatus, setChromeStatus] = useState<'online' | 'offline_simulated'>('offline_simulated');
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
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePause = async () => {
    setLoadingToggle(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ SYSTEM_PAUSED: !isPaused })
      });
      if (res.ok) {
        setIsPaused(!isPaused);
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
    { href: '/simulator', label: 'Simulador IA', icon: Sparkles },
    { href: '/settings', label: 'Configurações & ICP', icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#09090b]/98 backdrop-blur border-b border-zinc-800/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3 shrink-0">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-all">
                  <Flame className="w-5 h-5 fill-amber-400/20 text-amber-400" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-black text-sm tracking-tight text-white group-hover:text-amber-300 transition-colors leading-none">
                    Mart Digital
                  </span>
                  <span className="text-[10px] font-bold tracking-widest text-amber-400/90 uppercase font-mono mt-1 leading-none">
                    AGENTE COMERCIAL AUTÔNOMO
                  </span>
                </div>
              </Link>
            </div>

            {/* Clean Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 overflow-x-auto py-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-amber-400/10 text-amber-400 border border-amber-500/30 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Status Badges & Action Toolbar */}
            <div className="flex items-center space-x-2 shrink-0">
              
              {/* OpenAI Model Badge */}
              <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                <span>OpenAI gpt-4o-mini</span>
              </div>

              {/* Chrome Launch / Status Button */}
              {chromeStatus === 'online' ? (
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <ChromeIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Chrome Conectado</span>
                </div>
              ) : (
                <button
                  onClick={handleLaunchChrome}
                  disabled={launchingChrome}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 transition-all cursor-pointer shadow-sm"
                  title="Clique para abrir a janela do Chrome dedicado no seu computador"
                >
                  <ChromeIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{launchingChrome ? 'Abrindo...' : 'Abrir Chrome (1-Clique)'}</span>
                </button>
              )}

              {/* General System Pause Switch */}
              <button
                onClick={togglePause}
                disabled={loadingToggle}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  isPaused
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
                }`}
                title={isPaused ? 'Clique para retomar a operação' : 'Clique para pausar imediatamente todas as abordagens'}
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current text-rose-400" />
                    <span>Retomar</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current text-amber-400" />
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
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-300 px-4 py-2 text-xs text-center font-medium animate-in fade-in">
          {chromeMsg}
        </div>
      )}
    </>
  );
}
