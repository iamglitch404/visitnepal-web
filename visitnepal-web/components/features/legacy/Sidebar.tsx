'use client';

import React from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { 
  Home, 
  Compass, 
  Hotel, 
  FileText, 
  Cpu, 
  MessageSquare, 
  CalendarRange, 
  Database,
  CompassIcon,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const { activeSection, setActiveSection, currentUser } = useTravelStore();

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, color: 'text-cyan-400' },
    { id: 'explore', label: 'Explore Nepal', icon: Compass, color: 'text-purple-400' },
    { id: 'hotels', label: 'Hotels & Stays', icon: Hotel, color: 'text-emerald-400' },
    { id: 'permits', label: 'Permit Command', icon: FileText, color: 'text-amber-400' },
    { id: 'customizer', label: 'AI Trip Planner', icon: Cpu, color: 'text-rose-400' },
    { id: 'messages', label: 'Chat Terminal', icon: MessageSquare, color: 'text-cyan-400' },
    { id: 'bookings', label: 'My Bookings', icon: CalendarRange, color: 'text-purple-400' },
  ];

  // Admin access added
  if (currentUser?.role === 'Admin') {
    menuItems.push({ id: 'database', label: 'Admin Panel', icon: Database, color: 'text-amber-400' });
  }

  return (
    <aside className="fixed bottom-0 left-0 z-40 w-full p-4 lg:sticky lg:top-28 lg:h-[calc(100vh-140px)] lg:w-64 lg:p-0">
      <div className="flex h-full w-full flex-row justify-around rounded-2xl glass-panel p-2 neon-border-purple backdrop-blur-md lg:flex-col lg:justify-start lg:gap-2 lg:p-4">
        
        {/* Sidebar Header for Large Screens */}
        <div className="hidden items-center gap-2 border-b border-zinc-800 pb-4 mb-4 lg:flex">
          <div className="rounded-lg bg-purple-500/10 p-1.5 border border-purple-500/20">
            <CompassIcon className="h-4 w-4 text-purple-400 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-widest text-zinc-300 uppercase">Nav Systems</h3>
            <p className="text-[9px] text-zinc-500 font-mono">NEPAL_PORTAL_v3.21</p>
          </div>
        </div>

        {/* Dynamic Buttons */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`group flex items-center justify-center gap-3 rounded-xl py-2.5 px-3 transition-all duration-300 lg:justify-start lg:w-full ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-950/45 to-cyan-950/20 text-white border-l-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? item.color : 'text-zinc-400'}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="hidden text-xs font-semibold tracking-wider font-mono lg:block">
                {item.label}
              </span>
              
              {/* Active right glow indicator for desktop only */}
              {isActive && (
                <div className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] lg:block animate-pulse"></div>
              )}
            </button>
          );
        })}

        {/* System Diagnostics footer for desktop only */}
        <div className="mt-auto hidden border-t border-zinc-800 pt-4 lg:block">
          <div className="rounded-xl bg-zinc-950/60 p-3 border border-zinc-900">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono text-zinc-400">Node Secure</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1">
              <div className="bg-emerald-400 h-1 rounded-full w-[94%]" />
            </div>
            <p className="text-[8px] text-zinc-500 font-mono mt-1 text-right">Biometric feed ok</p>
          </div>
        </div>

      </div>
    </aside>
  );
}
