'use client';

import React, { useState } from 'react';
import { useTravelStore, Permit } from '@/store/useTravelStore';
import { 
  FileText, 
  User, 
  Compass, 
  Calendar, 
  QrCode, 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  Search, 
  CheckCircle2, 
  DollarSign,
  AlertCircle
} from 'lucide-react';

export default function PermitSystem() {
  const { permits, addPermit, updatePermitStatus, currentUser } = useTravelStore();
  
  // Application Form State
  const [applicantName, setApplicantName] = useState(currentUser?.name || 'Alex Mercer');
  const [passportNumber, setPassportNumber] = useState('NPL-9988221A');
  const [permitType, setPermitType] = useState<'Trekking' | 'Mountaineering' | 'National Park'>('Trekking');
  const [zone, setZone] = useState('Annapurna Conservation Area (ACAP)');
  const [startDate, setStartDate] = useState('2026-06-05');
  const [endDate, setEndDate] = useState('2026-06-20');
  
  // UI states
  const [isApplying, setIsApplying] = useState(false);
  const [applyProgress, setApplyProgress] = useState(0);
  const [applyStepText, setApplyStepText] = useState('');
  const [showQrCode, setShowQrCode] = useState<string | null>(null);

  const zonesMap: Record<string, string[]> = {
    Trekking: ['Annapurna Conservation Area (ACAP)', 'Manaslu Restricted Circuit', 'Langtang Preservation Region', 'Kanchenjunga Sanctuary'],
    Mountaineering: ['Mt. Everest Peak (Sagarmatha)', 'Ama Dablam Vertical Peak', 'Lhotse High Peak', 'Mera Peak Trekking climb'],
    'National Park': ['Chitwan Rhino Reserve', 'Bardiya Tiger Habitat', 'Sagarmatha Wildlife Sanctuary']
  };

  const costMap: Record<string, number> = {
    'Annapurna Conservation Area (ACAP)': 30,
    'Manaslu Restricted Circuit': 150,
    'Langtang Preservation Region': 30,
    'Kanchenjunga Sanctuary': 120,
    'Mt. Everest Peak (Sagarmatha)': 11000,
    'Ama Dablam Vertical Peak': 2500,
    'Lhotse High Peak': 5000,
    'Mera Peak Trekking climb': 350,
    'Chitwan Rhino Reserve': 25,
    'Bardiya Tiger Habitat': 25,
    'Sagarmatha Wildlife Sanctuary': 30
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    setApplyProgress(10);
    setApplyStepText('Establishing secure uplink to Kathmandu HQ...');

    // Multi-step loading bar for extreme immersive futuristic aesthetics
    const timers = [
      { progress: 30, text: 'Calibrating passport telemetry with local immigration databases...', delay: 1000 },
      { progress: 60, text: 'Hashing biometric variables into Nepal Government blockchain blocks...', delay: 2200 },
      { progress: 85, text: 'Requesting automated permit registration coordinates...', delay: 3500 },
      { progress: 100, text: 'Permit secured successfully! Activating holographic QR key...', delay: 4800 }
    ];

    timers.forEach((t) => {
      setTimeout(() => {
        setApplyProgress(t.progress);
        setApplyStepText(t.text);
        
        if (t.progress === 100) {
          setTimeout(() => {
            const cost = costMap[zone] || 50;
            addPermit({
              type: permitType as any,
              zone,
              applicantName,
              passportNumber,
              startDate,
              endDate,
              cost
            });
            setIsApplying(false);
            setApplyProgress(0);
          }, 1000);
        }
      }, t.delay);
    });
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Header Info */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-400" />
          <h2 className="text-xl font-bold tracking-wide text-white">Blockchain Permit Command Center</h2>
        </div>
        <p className="text-xs text-zinc-400 font-mono">
          Register, track, and authorize alpine mountaineering and regional sanctuary permits instantly on the secure ledger.
        </p>
      </section>

      {/* Grid: Apply and active listings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Apply Card */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-2xl border border-zinc-800 relative overflow-hidden flex flex-col gap-4">
          
          <div className="border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Cpu className="h-4 w-4 text-amber-400" />
              <span>Initiate Permit Request</span>
            </h3>
          </div>

          {!isApplying ? (
            <form onSubmit={handleApply} className="flex flex-col gap-3 font-sans text-xs">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider flex items-center gap-1">
                  <User className="h-3 w-3 text-amber-400" /> Passport Full Name
                </label>
                <input 
                  type="text" 
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider flex items-center gap-1">
                  <FileText className="h-3 w-3 text-amber-400" /> Passport Identifier
                </label>
                <input 
                  type="text" 
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider flex items-center gap-1">
                  <Compass className="h-3 w-3 text-amber-400" /> Category Dimension
                </label>
                <select 
                  value={permitType}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setPermitType(newType);
                    setZone(zonesMap[newType][0]);
                  }}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Trekking">Trekking Permit</option>
                  <option value="Mountaineering">Mountaineering Expedition</option>
                  <option value="National Park">National Park Access</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider flex items-center gap-1">
                  <Compass className="h-3 w-3 text-amber-400" /> Zone Target
                </label>
                <select 
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  {zonesMap[permitType].map((z, idx) => (
                    <option key={idx} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-amber-400" /> Entry Date
                  </label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-amber-400" /> Exit Date
                  </label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Price details */}
              <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-900 flex justify-between items-center font-mono text-xs mt-1">
                <span className="text-zinc-500">Government Levy:</span>
                <span className="text-amber-400 font-black">${costMap[zone] || 30} USD</span>
              </div>

              <button 
                type="submit"
                className="w-full mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 py-3 text-xs font-bold text-black font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Submit Digital Application</span>
              </button>

            </form>
          ) : (
            <div className="h-[340px] flex flex-col justify-center items-center text-center p-4 gap-4">
              <div className="relative h-16 w-16 flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/50">
                <QrCode className="h-8 w-8 text-amber-400 animate-pulse" />
                <div className="absolute inset-0 animate-spin-slow border-t-2 border-amber-500 rounded-xl"></div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Transmitting Registry Block</h4>
                <p className="text-[10px] text-zinc-500 font-mono mt-1 leading-relaxed">
                  {applyStepText}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-2 overflow-hidden mt-2 relative">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${applyProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold">{applyProgress}%</span>
            </div>
          )}

        </div>

        {/* Right Column: Tracking list */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          
          <div className="glass-panel p-5 rounded-2xl border border-zinc-800 relative overflow-hidden flex flex-col gap-4">
            
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Search className="h-4 w-4 text-cyan-400" />
                <span>Active Registry Logs</span>
              </h3>
              <span className="text-[9px] font-mono text-zinc-500">Node Sync Complete</span>
            </div>

            {/* Permits Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-zinc-850 text-zinc-500 text-[10px] uppercase tracking-wider">
                    <th className="py-2.5 px-2">Type</th>
                    <th className="py-2.5 px-2">Region/Zone</th>
                    <th className="py-2.5 px-2">Calendar</th>
                    <th className="py-2.5 px-2">Status</th>
                    <th className="py-2.5 px-2 text-right">Pass Key</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {permits.map((permit) => (
                    <tr 
                      key={permit.id}
                      className="hover:bg-white/2 transition-all duration-150"
                    >
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          permit.type === 'Mountaineering' 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : permit.type === 'Trekking'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {permit.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold text-zinc-200">
                        {permit.zone.length > 25 ? `${permit.zone.slice(0, 22)}...` : permit.zone}
                      </td>
                      <td className="py-3 px-2 text-zinc-400 text-[11px]">
                        {permit.startDate} → {permit.endDate}
                      </td>
                      <td className="py-3 px-2">
                        {permit.status === 'Approved' ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                            <ShieldCheck className="h-3.5 w-3.5" /> APPROVED
                          </span>
                        ) : permit.status === 'Pending' ? (
                          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold animate-pulse">
                            <AlertCircle className="h-3.5 w-3.5 animate-spin" /> PENDING
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-rose-400 font-bold">
                            <ShieldAlert className="h-3.5 w-3.5" /> REJECTED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button 
                          onClick={() => setShowQrCode(permit.qrCode)}
                          className="px-2 py-1 bg-zinc-900 border border-zinc-800 hover:border-cyan-500 hover:text-cyan-400 text-zinc-400 font-bold rounded text-[10px] flex items-center justify-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <QrCode className="h-3 w-3" />
                          <span>Pass Key</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Holographic Pass Key Display widget below */}
          {showQrCode && (
            <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-zinc-950 via-zinc-900/60 to-zinc-950 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top-4 duration-300">
              
              {/* QR Block Box */}
              <div className="h-28 w-28 bg-white p-2 rounded-xl border border-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
                {/* Simulated digital matrix QR */}
                <div className="h-full w-full border border-black p-1 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="h-6 w-6 border-4 border-black bg-white" />
                    <div className="h-6 w-6 border-4 border-black bg-white" />
                  </div>
                  <div className="flex justify-center flex-1 py-1 px-3">
                    <span className="text-[7px] font-black text-black text-center break-all select-all font-mono leading-none tracking-tighter">
                      {showQrCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="h-6 w-6 border-4 border-black bg-white" />
                    <div className="h-4 w-4 bg-black" />
                  </div>
                </div>
              </div>

              {/* QR Metadata */}
              <div className="flex-1 flex flex-col gap-2 text-xs font-mono">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                    <span>Holographic Blockchain Visa Verification</span>
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Scanned on-site by Sagarmatha Permit Officers.</p>
                </div>
                <div className="bg-zinc-950/80 rounded-lg p-2.5 border border-zinc-900 flex flex-col gap-1 text-[10px] text-zinc-400">
                  <p>BLOCKHASH: <span className="text-white font-bold select-all">{showQrCode}</span></p>
                  <p>ENCRYPTION: <span className="text-cyan-400">SHA-256 / SHA3_256 SECURE NODE</span></p>
                  <p>STATUS: <span className="text-emerald-400 font-bold">LEGALLY VERIFIED FOR ENTRANCE</span></p>
                </div>
                <button 
                  onClick={() => setShowQrCode(null)}
                  className="text-zinc-500 hover:text-zinc-300 hover:underline text-[10px] self-start"
                >
                  Close Key Panel
                </button>
              </div>

            </div>
          )}

          {/* Visa guidance grid below */}
          <div className="glass-panel p-5 rounded-2xl border border-zinc-800 flex flex-col gap-3 font-sans">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Tourism Visa & Acclimatization Guidance
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-zinc-400">
              <p>
                ✓ **On-Arrival Visas**: Standard visas are available on-arrival at Tribhuvan International Airport (TIA) for 15, 30, or 90 days. We recommend pre-registering bio-details online to bypass queue hubs.
              </p>
              <p>
                ⚠️ **Restricted Loops**: Trekking inside Upper Mustang, Manaslu Loop, or Kanchenjunga requires certified local guides and official registered permits issued through standard agencies.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
