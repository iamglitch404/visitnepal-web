'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HostSectionProps {
  activeId: string;
}

export default function HostSection({ activeId }: HostSectionProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [hostName, setHostName] = useState('');
  const [hostType, setHostType] = useState('Guide');
  const [propertyName, setPropertyName] = useState('');
  const [propertyLocation, setPropertyLocation] = useState('');
  const [propertyPrice, setPropertyPrice] = useState('');
  const [attractionName, setAttractionName] = useState('');
  const [attractionRegion, setAttractionRegion] = useState('');
  const [permitOfficerName, setPermitOfficerName] = useState('');
  const [permitOfficerCode, setPermitOfficerCode] = useState('');

  const containerVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.08 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const handleSubmit = (e: React.FormEvent, type: string) => {
    e.preventDefault();
    setSuccessMsg(type);
    setTimeout(() => {
      setSuccessMsg(null);
      // Reset forms
      setHostName('');
      setPropertyName('');
      setPropertyLocation('');
      setPropertyPrice('');
      setAttractionName('');
      setAttractionRegion('');
      setPermitOfficerName('');
      setPermitOfficerCode('');
    }, 2000);
  };

  return (
    <motion.div 
      key={activeId}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full text-left"
    >
      <div className="flex flex-col gap-6 max-w-sm mx-auto py-8">
        
        {/* ── BECOME A HOST ────────────────────────────────────────────── */}
        {activeId === 'becomehost' && (
          <motion.div variants={itemVariants} className="bg-[var(--card-bg)] border border-[var(--waffle)]/35 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A89286] text-center border-b border-[var(--waffle)]/20 pb-2">
              Become a Host / Guide
            </h3>
            <form onSubmit={e => handleSubmit(e, 'Host profile submitted')} className="flex flex-col gap-3 font-mono text-[10px]">
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[#A89286]">Full Name</label>
                <input 
                  type="text" 
                  value={hostName}
                  onChange={e => setHostName(e.target.value)}
                  placeholder="Nima Sherpa" 
                  className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs text-[var(--foreground)]"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[#A89286]">Host Category</label>
                <select 
                  value={hostType}
                  onChange={e => setHostType(e.target.value)}
                  className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs text-[var(--foreground)]"
                >
                  <option value="Guide">Certified Mountaineer Guide</option>
                  <option value="Stay">Hotel / Tea House Owner</option>
                  <option value="Transit">Private Jeep / Heli Transit Provider</option>
                </select>
              </div>
              <button 
                type="submit"
                className="bg-[var(--caramel)] text-white font-bold py-2.5 rounded-xl uppercase tracking-widest mt-2 hover:bg-[#B08156] transition-colors cursor-pointer"
              >
                Register Host Credentials
              </button>
            </form>
          </motion.div>
        )}

        {/* ── LIST YOUR PROPERTY ────────────────────────────────────────── */}
        {activeId === 'listproperty' && (
          <motion.div variants={itemVariants} className="bg-[var(--card-bg)] border border-[var(--waffle)]/35 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A89286] text-center border-b border-[var(--waffle)]/20 pb-2">
              List Your Property
            </h3>
            <form onSubmit={e => handleSubmit(e, 'Property listing requested')} className="flex flex-col gap-3 font-mono text-[10px]">
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[#A89286]">Property Name</label>
                <input 
                  type="text" 
                  value={propertyName}
                  onChange={e => setPropertyName(e.target.value)}
                  placeholder="Annapurna Cyber Lodge" 
                  className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs text-[var(--foreground)]"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[#A89286]">Location / Altitude</label>
                <input 
                  type="text" 
                  value={propertyLocation}
                  onChange={e => setPropertyLocation(e.target.value)}
                  placeholder="Manang Valley (3,519m)" 
                  className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs text-[var(--foreground)]"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[#A89286]">Target Price per Night ($)</label>
                <input 
                  type="number" 
                  value={propertyPrice}
                  onChange={e => setPropertyPrice(e.target.value)}
                  placeholder="120" 
                  className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs text-[var(--foreground)]"
                  required
                />
              </div>
              <button 
                type="submit"
                className="bg-[var(--caramel)] text-white font-bold py-2.5 rounded-xl uppercase tracking-widest mt-2 hover:bg-[#B08156] transition-colors cursor-pointer"
              >
                Submit Property for Audit
              </button>
            </form>
          </motion.div>
        )}

        {/* ── LIST AN ATTRACTION ────────────────────────────────────────── */}
        {activeId === 'listattraction' && (
          <motion.div variants={itemVariants} className="bg-[var(--card-bg)] border border-[var(--waffle)]/35 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A89286] text-center border-b border-[var(--waffle)]/20 pb-2">
              Register Landmark / Trail
            </h3>
            <form onSubmit={e => handleSubmit(e, 'Landmark registered successfully')} className="flex flex-col gap-3 font-mono text-[10px]">
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[#A89286]">Landmark Name</label>
                <input 
                  type="text" 
                  value={attractionName}
                  onChange={e => setAttractionName(e.target.value)}
                  placeholder="Tengboche Monastery" 
                  className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs text-[var(--foreground)]"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[#A89286]">Region</label>
                <input 
                  type="text" 
                  value={attractionRegion}
                  onChange={e => setAttractionRegion(e.target.value)}
                  placeholder="Khumbu Region" 
                  className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs text-[var(--foreground)]"
                  required
                />
              </div>
              <button 
                type="submit"
                className="bg-[var(--caramel)] text-white font-bold py-2.5 rounded-xl uppercase tracking-widest mt-2 hover:bg-[#B08156] transition-colors cursor-pointer"
              >
                Request Landmark Registration
              </button>
            </form>
          </motion.div>
        )}

        {/* ── PERMIT AUTHORITY / REGISTER OFFICER ────────────────────────── */}
        {activeId === 'listpermit' && (
          <motion.div variants={itemVariants} className="bg-[var(--card-bg)] border border-[var(--waffle)]/35 p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A89286] text-center border-b border-[var(--waffle)]/20 pb-2">
              Permit Officer Registration
            </h3>
            <form onSubmit={e => handleSubmit(e, 'Immigration authority logged')} className="flex flex-col gap-3 font-mono text-[10px]">
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[#A89286]">Officer Name</label>
                <input 
                  type="text" 
                  value={permitOfficerName}
                  onChange={e => setPermitOfficerName(e.target.value)}
                  placeholder="Officer K. P. Sharma" 
                  className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs text-[var(--foreground)]"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[#A89286]">Department Verification Key</label>
                <input 
                  type="password" 
                  value={permitOfficerCode}
                  onChange={e => setPermitOfficerCode(e.target.value)}
                  placeholder="••••••••" 
                  className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs text-[var(--foreground)]"
                  required
                />
              </div>
              <button 
                type="submit"
                className="bg-[var(--caramel)] text-white font-bold py-2.5 rounded-xl uppercase tracking-widest mt-2 hover:bg-[#B08156] transition-colors cursor-pointer"
              >
                Login to Immigration Desk
              </button>
            </form>
          </motion.div>
        )}

        {/* Success Modal */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            >
              <div className="bg-[var(--background)] border border-[var(--waffle)]/40 p-5 rounded-3xl text-center shadow-xl">
                <span className="text-2xl mb-1 block">📝</span>
                <h4 className="text-sm font-bold text-[var(--foreground)]">{successMsg}</h4>
                <p className="text-[10px] text-[#7A6258] mt-1">Audit verification queue updated.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
