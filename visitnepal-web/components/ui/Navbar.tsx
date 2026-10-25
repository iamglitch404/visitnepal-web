'use client';

import React, { useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { Sparkles, User, LogOut, MessageSquare, Calendar, Database, ShieldAlert, Clock, Cloud } from 'lucide-react';

interface NavbarProps {
  onOpenAuth: () => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const { activeSection, setActiveSection, currentUser, logoutUser, channels } = useTravelStore();
  const [timeStr, setTimeStr] = useState('');
  const [weatherOpen, setWeatherOpen] = useState(false);

  // Static Himalayan weather data
  const weather = { region: 'Everest Region', temp: '-8°C', status: 'Clear Skies', alert: 'Safe Window' };

  // Clock to simulate futuristic dashboard synchronization
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTimeStr(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' NPT');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalUnread = channels.reduce((acc, ch) => acc + (ch.unread ? 1 : 0), 0);

  return (
    <header className="sticky top-0 z-50 w-full px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl glass-panel px-6 py-3 neon-border-cyan backdrop-blur-md">
        
        {/* Brand Logo & Portal Tag */}
        <div 
          className="flex cursor-pointer items-center gap-3"
          onClick={() => setActiveSection('home')}
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <span className="font-sans text-xl font-black text-white tracking-widest">N</span>
            <div className="absolute inset-0 animate-pulse-glow rounded-xl bg-cyan-400 opacity-20"></div>
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text font-sans text-lg font-bold tracking-wider text-transparent">
              VISIT NEPAL <span className="text-xs font-black text-purple-400 tracking-widest">3.0</span>
            </h1>
            <p className="text-[9px] uppercase tracking-widest text-zinc-400">Futuristic Travel Ecosystem</p>
          </div>
        </div>

        {/* Dynamic Center Info: System Status / Time */}
        <div className="hidden items-center gap-6 md:flex">
          <div className="flex items-center gap-2 rounded-lg bg-zinc-950/80 px-3 py-1 text-xs font-mono text-cyan-400 border border-cyan-950">
            <Clock className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            <span>{timeStr || '13:10:14 NPT'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Himalayan AI Core Live</span>
          </div>
        </div>

        {/* Quick User Actions & Session controls */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveSection('messages')}
            className={`relative p-2 rounded-xl transition-all duration-300 ${
              activeSection === 'messages' 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                : 'text-zinc-300 hover:bg-white/5 hover:text-white'
            }`}
            title="Futuristic Communications"
          >
            <MessageSquare className="h-5 w-5" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white animate-bounce">
                {totalUnread}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('bookings')}
            className={`relative p-2 rounded-xl transition-all duration-300 ${
              activeSection === 'bookings' 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                : 'text-zinc-300 hover:bg-white/5 hover:text-white'
            }`}
            title="Bookings Log"
          >
            <Calendar className="h-5 w-5" />
          </button>

          {/* Weather Button */}
          <div className="relative">
            <button
              onClick={() => setWeatherOpen(o => !o)}
              className={`relative p-2 rounded-xl transition-all duration-300 ${
                weatherOpen
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-zinc-300 hover:bg-white/5 hover:text-sky-300'
              }`}
              title="Himalayan Weather"
            >
              <Cloud className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            </button>

            {/* Weather Popover */}
            {weatherOpen && (
              <div
                className="absolute right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-4 duration-200"
                style={{
                  width: '200px',
                  background: 'linear-gradient(135deg, rgba(14,22,35,0.97) 0%, rgba(7,40,60,0.97) 100%)',
                  border: '1px solid rgba(56,189,248,0.25)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.08)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div className="p-3.5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-widest">Himalayan Telemetry</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                      <Cloud className="h-5 w-5 text-sky-300" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{weather.region}</p>
                      <p className="text-[9px] text-zinc-400 font-mono">{weather.status}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                      <p className="text-[8px] text-zinc-500 uppercase font-mono">Temp</p>
                      <p className="text-sm font-bold text-sky-300 font-mono">{weather.temp}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center border border-white/5">
                      <p className="text-[8px] text-zinc-500 uppercase font-mono">Status</p>
                      <p className="text-[9px] font-bold text-emerald-400 font-mono">{weather.alert}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {currentUser && currentUser.role === 'Admin' && (
            <button
              onClick={() => setActiveSection('database')}
              className={`p-2 rounded-xl transition-all duration-300 ${
                activeSection === 'database'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-300 hover:bg-white/5 hover:text-white'
              }`}
              title="Admin Command Console"
            >
              <Database className="h-5 w-5" />
            </button>
          )}

          {/* User Session Profile Panel */}
          {currentUser ? (
            <div className="flex items-center gap-3 pl-2 border-l border-zinc-800">
              <div className="hidden flex-col items-end text-right sm:flex">
                <span className="text-xs font-semibold text-white">{currentUser.name}</span>
                <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-purple-400 border border-purple-500/20 uppercase">
                  {currentUser.role}
                </span>
              </div>
              <div className="group relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-9 w-9 cursor-pointer rounded-xl border border-cyan-500 object-cover shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-transform hover:scale-105"
                />
                
                {/* Dropdown Menu on hover/click */}
                <div className="absolute right-0 top-full mt-2 w-48 origin-top-right scale-0 rounded-xl glass-panel p-2 shadow-xl transition-all duration-200 group-hover:scale-100 z-50 border border-zinc-800">
                  <div className="px-3 py-2 border-b border-zinc-800 mb-1">
                    <p className="text-[10px] text-zinc-400 truncate">{currentUser.email}</p>
                  </div>
                  
                  <button 
                    onClick={() => setActiveSection('database')}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 hover:text-white"
                  >
                    <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Control Panel</span>
                  </button>

                  <button 
                    onClick={logoutUser}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Disconnect Session</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 px-4 py-2 text-xs font-bold text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all active:scale-95"
            >
              <User className="h-4 w-4" />
              <span>Connect Portal</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
