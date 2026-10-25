'use client';

import React, { useState } from 'react';
import { useTravelStore, Permit } from '@/store/useTravelStore';
import { 
  Database, 
  TrendingUp, 
  Users, 
  Building, 
  FileText, 
  Check, 
  X, 
  Cpu, 
  BarChart4, 
  Map, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Compass
} from 'lucide-react';

export default function AdminDashboard() {
  const { 
    revenueData, 
    visitorHeatmap, 
    aiInsights, 
    permits, 
    updatePermitStatus, 
    stays,
    guides
  } = useTravelStore();

  const [activeTab, setActiveTab] = useState<'analytics' | 'permits' | 'properties' | 'insights'>('analytics');
  const [insightSearch, setInsightSearch] = useState('');

  // Calculate totals
  const totalRevenue = revenueData.reduce((acc, d) => acc + d.revenue, 0);
  const totalBookings = revenueData.reduce((acc, d) => acc + d.bookingsCount, 0);
  const pendingPermitsCount = permits.filter(p => p.status === 'Pending').length;

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Header Info */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-amber-400" />
          <h2 className="text-xl font-bold tracking-wide text-white">Central Operations & Database</h2>
        </div>
        <p className="text-xs text-zinc-400 font-mono">
          Interactive admin metrics. Authorize high-altitude visas, track lodging yields, and query cognitive heatmaps.
        </p>
      </section>

      {/* Cyber Quick Stat Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Gross Ecosystem Revenue</span>
            <h3 className="text-xl font-black text-white font-mono mt-1 text-emerald-400">${totalRevenue.toLocaleString()}</h3>
            <span className="text-[8px] text-emerald-500 font-mono mt-1">▲ 14.5% monthly gain</span>
          </div>
          <TrendingUp className="h-8 w-8 text-emerald-500/10 shrink-0" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Total Booking Yields</span>
            <h3 className="text-xl font-black text-white font-mono mt-1 text-purple-400">{totalBookings} Completed</h3>
            <span className="text-[8px] text-purple-400 font-mono mt-1">✓ satellite feeds green</span>
          </div>
          <Users className="h-8 w-8 text-purple-500/10 shrink-0" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Pending Visas & Permits</span>
            <h3 className="text-xl font-black text-white font-mono mt-1 text-amber-400">{pendingPermitsCount} PENDING</h3>
            <span className="text-[8px] text-amber-400 font-mono mt-1">⚡ Action Required</span>
          </div>
          <FileText className="h-8 w-8 text-amber-500/10 shrink-0" />
        </div>

        <div className="glass-panel p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Acclimatization safety index</span>
            <h3 className="text-xl font-black text-white font-mono mt-1 text-cyan-400">99.8% Perfect</h3>
            <span className="text-[8px] text-cyan-400 font-mono mt-1">★ Zero incident log</span>
          </div>
          <ShieldCheck className="h-8 w-8 text-cyan-500/10 shrink-0" />
        </div>

      </section>

      {/* Admin Tab Switchers */}
      <section className="flex border-b border-zinc-800 text-xs font-mono">
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-4 font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'analytics' ? 'border-cyan-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Yield Analytics
        </button>
        <button 
          onClick={() => setActiveTab('permits')}
          className={`pb-3 px-4 font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'permits' ? 'border-amber-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Visa Approvals ({pendingPermitsCount})
        </button>
        <button 
          onClick={() => setActiveTab('properties')}
          className={`pb-3 px-4 font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'properties' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Lodging Registry ({stays.length})
        </button>
        <button 
          onClick={() => setActiveTab('insights')}
          className={`pb-3 px-4 font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'insights' ? 'border-rose-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Cognitive AI Insights
        </button>
      </section>

      {/* Dynamic Tab Contents */}
      <div className="w-full">
        
        {/* Yield Analytics */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Custom SVG Revenue Line Chart */}
            <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-zinc-800 flex flex-col gap-4">
              <div>
                <h4 className="text-xs font-bold text-white font-mono uppercase">Ecosystem revenue yield matrix</h4>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Automated yield maps across fiscal year</p>
              </div>

              {/* SVG Chart area */}
              <div className="h-56 w-full flex items-center justify-center p-2 bg-zinc-950/80 border border-zinc-900 rounded-lg relative">
                <svg className="w-full h-full" viewBox="0 0 500 200">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.03)" />
                  <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.03)" />
                  <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(255,255,255,0.03)" />
                  <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(255,255,255,0.08)" />

                  {/* Monthly points line */}
                  {/* Jan: 45k (170-45 = 125) -> (70, 125) */}
                  {/* Feb: 58k -> (150, 105) */}
                  {/* Mar: 84k -> (230, 80) */}
                  {/* Apr: 122k -> (310, 50) */}
                  {/* May: 168k -> (390, 25) */}
                  <path 
                    d="M 70 140 Q 150 120, 230 90 T 310 60 T 390 30" 
                    fill="none" 
                    stroke="url(#chartGrad)" 
                    strokeWidth="3.5" 
                  />

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>

                  {/* Labels */}
                  <text x="70" y="185" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle" className="font-mono">Jan</text>
                  <text x="150" y="185" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle" className="font-mono">Feb</text>
                  <text x="230" y="185" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle" className="font-mono">Mar</text>
                  <text x="310" y="185" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle" className="font-mono">Apr</text>
                  <text x="390" y="185" fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle" className="font-mono">May</text>

                  {/* Y Axis indicators */}
                  <text x="30" y="173" fill="rgba(255,255,255,0.2)" fontSize="8" textAnchor="end" className="font-mono">$0</text>
                  <text x="30" y="123" fill="rgba(255,255,255,0.2)" fontSize="8" textAnchor="end" className="font-mono">$50k</text>
                  <text x="30" y="73" fill="rgba(255,255,255,0.2)" fontSize="8" textAnchor="end" className="font-mono">$100k</text>
                  <text x="30" y="23" fill="rgba(255,255,255,0.2)" fontSize="8" textAnchor="end" className="font-mono">$150k</text>
                </svg>

                <div className="absolute top-3 right-3 bg-zinc-950 p-2 rounded border border-zinc-900 text-[8px] font-mono text-zinc-550 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-pulse" />
                  <span>Gross margins resolved in real-time</span>
                </div>
              </div>
            </div>

            {/* Density map widgets */}
            <div className="lg:col-span-1 glass-panel p-5 rounded-xl border border-zinc-800 flex flex-col gap-4">
              <div>
                <h4 className="text-xs font-bold text-white font-mono uppercase">Himalayan Density Heatmap</h4>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Live regional traveler concentrations</p>
              </div>

              <div className="flex flex-col gap-2.5 font-mono text-xs max-h-56 overflow-y-auto">
                {visitorHeatmap.map((place, idx) => (
                  <div 
                    key={idx}
                    className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-900 flex flex-col gap-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-200">{place.name}</span>
                      <span className={`text-[10px] font-black ${place.intensity > 0.8 ? 'text-rose-400' : 'text-cyan-400'}`}>
                        {(place.intensity * 100).toFixed(0)}% Cap
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-zinc-900 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${place.intensity > 0.8 ? 'bg-rose-500' : 'bg-cyan-500'}`} 
                        style={{ width: `${place.intensity * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Visa Approvals */}
        {activeTab === 'permits' && (
          <div className="glass-panel p-5 rounded-xl border border-zinc-800 flex flex-col gap-4">
            <div className="border-b border-zinc-850 pb-2 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white font-mono uppercase">Visa & Permit Approval Console</h4>
                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Requires physical Permit Officer biometric overrides</p>
              </div>
              <span className="text-[9px] font-mono text-amber-400 font-bold">{pendingPermitsCount} Decisions Awaiting</span>
            </div>

            {/* List and approve controls */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-zinc-850 text-zinc-500 text-[10px] uppercase">
                    <th className="py-2.5 px-2">Applicant</th>
                    <th className="py-2.5 px-2">Visa Type</th>
                    <th className="py-2.5 px-2">Target Zone</th>
                    <th className="py-2.5 px-2">Calendar</th>
                    <th className="py-2.5 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {permits.map((permit) => (
                    <tr key={permit.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-3 px-2 font-bold text-zinc-200">
                        {permit.applicantName}
                      </td>
                      <td className="py-3 px-2">
                        <span className="bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-[10px] text-zinc-400">
                          {permit.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-zinc-400">
                        {permit.zone}
                      </td>
                      <td className="py-3 px-2 text-zinc-400">
                        {permit.startDate} to {permit.endDate}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {permit.status === 'Pending' ? (
                          <div className="flex gap-1.5 justify-end">
                            <button 
                              onClick={() => updatePermitStatus(permit.id, 'Approved')}
                              className="h-7 w-7 rounded bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black flex items-center justify-center border border-emerald-500/20 cursor-pointer"
                              title="Approve Visa & HASH keys"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => updatePermitStatus(permit.id, 'Rejected')}
                              className="h-7 w-7 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-black flex items-center justify-center border border-rose-500/20 cursor-pointer"
                              title="Reject Visa request"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className={`text-[10px] font-bold ${permit.status === 'Approved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {permit.status.toUpperCase()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lodging Registry */}
        {activeTab === 'properties' && (
          <div className="glass-panel p-5 rounded-xl border border-zinc-800 flex flex-col gap-4">
            <div>
              <h4 className="text-xs font-bold text-white font-mono uppercase">Stays & Property Yield Registry</h4>
              <p className="text-[9px] text-zinc-500 font-mono mt-0.5 font-sans">Lodging coordinates in active tourist directories</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {stays.map((stay) => (
                <div 
                  key={stay.id}
                  className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex justify-between items-center"
                >
                  <div className="min-w-0">
                    <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase">
                      {stay.type}
                    </span>
                    <h4 className="font-bold text-zinc-200 mt-1 truncate">{stay.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{stay.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-black text-sm">${stay.price}</p>
                    <p className="text-[8px] text-zinc-500">★ {stay.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cognitive AI Insights */}
        {activeTab === 'insights' && (
          <div className="glass-panel p-5 rounded-xl border border-zinc-800 flex flex-col gap-4">
            <div>
              <h4 className="text-xs font-bold text-white font-mono uppercase">AI Cognitive Analysis Feed</h4>
              <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Direct telemetry reads from Himalayan AI Core</p>
            </div>

            <div className="flex flex-col gap-3">
              {aiInsights.map((insight, idx) => (
                <div 
                  key={idx}
                  className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-900 flex items-start gap-3"
                >
                  <Cpu className="h-5 w-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <h5 className="text-xs font-bold text-rose-300 font-mono">Insight Block 0{idx + 1}</h5>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-1 font-sans">
                      {insight}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
