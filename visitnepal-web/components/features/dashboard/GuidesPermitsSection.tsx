'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTravelStore, Permit, Guide } from '@/store/useTravelStore';

interface GuidesPermitsSectionProps {
  activeId: string;
}

export default function GuidesPermitsSection({ activeId }: GuidesPermitsSectionProps) {
  const { guides, permits, addPermit, addBooking } = useTravelStore();
  
  // Form states
  const [applicantName, setApplicantName] = useState('Alex Mercer');
  const [passportNumber, setPassportNumber] = useState('NPL-9988221A');
  const [permitType, setPermitType] = useState<'Trekking' | 'Mountaineering' | 'National Park'>('Trekking');
  const [zone, setZone] = useState('Annapurna Conservation Area (ACAP)');
  const [startDate, setStartDate] = useState('2026-06-05');
  const [endDate, setEndDate] = useState('2026-06-15');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0); // 0: None, 1: Hashing, 2: Verification, 3: Completed
  const [hiredGuide, setHiredGuide] = useState<Guide | null>(null);

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

  const handleApplyPermit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStep(1);

    // Simulated progress steps
    setTimeout(() => {
      setSubmitStep(2);
      setTimeout(() => {
        setSubmitStep(3);
        const costMap = { Trekking: 30, Mountaineering: 11000, 'National Park': 20 };
        addPermit({
          type: permitType,
          zone,
          applicantName,
          passportNumber,
          startDate,
          endDate,
          cost: costMap[permitType] || 30
        });
        setTimeout(() => {
          setIsSubmitting(false);
          setSubmitStep(0);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handleHireGuide = (guide: Guide) => {
    const invNo = `INV-GUIDE-${Math.floor(1000 + Math.random() * 9000)}`;
    addBooking({
      id: `b-guide-${Date.now()}`,
      type: 'Guide',
      title: `${guide.name} - Himalayan Guide Services`,
      date: `${startDate} - ${endDate}`,
      details: `Languages: ${guide.languages.join(', ')}. Full navigation support activated.`,
      cost: guide.pricePerDay * 10, // 10 days
      status: 'Pending',
      invoiceNo: invNo
    });

    setHiredGuide(guide);
    setTimeout(() => {
      setHiredGuide(null);
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
      {/* ── GUIDES VIEW ────────────────────────────────────────────────── */}
      {activeId === 'guides' && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
          <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--caramel)] uppercase">
              Cert. Sherpas & Naturalists
            </span>
            <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)]">Sherpas & Mountain Guides</h2>
            <p className="text-xs text-[#7A6258]">Hire native Himalayan navigators certified for high altitude routes, wildlife tracking, and translation support.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map(guide => (
              <div 
                key={guide.id}
                className="bg-[var(--card-bg)] border border-[var(--waffle)]/35 rounded-2xl p-5 flex flex-col justify-between hover:border-[var(--caramel)]/50 transition-all duration-300 shadow-[0_4px_12px_rgba(61,45,39,0.01)]"
              >
                <div className="flex gap-4">
                  <img src={guide.avatar} alt={guide.name} className="w-16 h-16 object-cover rounded-xl border border-[var(--waffle)]/30 shrink-0" />
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-[var(--foreground)]">{guide.name}</h3>
                      <span className="text-[9px] font-mono font-bold text-[var(--caramel)] uppercase">
                        ★ {guide.rating} ({guide.experience} yrs)
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">{guide.type} Master</span>
                    <p className="text-xs text-[#7A6258] leading-relaxed line-clamp-2 mt-1.5">{guide.bio}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-5 border-t border-[var(--waffle)]/15 pt-3">
                  <div className="text-xs font-mono">
                    <span className="text-[#A89286] block text-[9px] uppercase">Service Rate</span>
                    <span className="font-bold text-[var(--foreground)]">${guide.pricePerDay}/day</span>
                  </div>
                  <button 
                    onClick={() => handleHireGuide(guide)}
                    className="bg-[var(--caramel)] text-white text-[10px] font-mono font-bold px-3.5 py-2 rounded-lg hover:bg-[#B08156] transition-colors cursor-pointer"
                  >
                    Hire Guide
                  </button>
                </div>
              </div>
            ))}
          </motion.div>

          {hiredGuide && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
              <div className="bg-[var(--background)] border border-[var(--waffle)]/40 p-6 rounded-3xl shadow-xl max-w-sm text-center">
                <span className="text-2xl mb-1 block">🧗</span>
                <h4 className="text-sm font-bold text-[var(--foreground)]">Guide Application Recieved</h4>
                <p className="text-xs text-[#7A6258] mt-1.5 leading-relaxed">
                  You have successfully booked {hiredGuide.name}. Verification invoice logged in Account.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PERMITS VIEW ───────────────────────────────────────────────── */}
      {activeId === 'permits' && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
          <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--caramel)] uppercase">
              Gov Registry Access
            </span>
            <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)]">Permits & Approvals</h2>
            <p className="text-xs text-[#7A6258]">Apply for standard conservation area permits and special mountaineering clearances online.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Form */}
            <motion.div 
              variants={itemVariants}
              className="bg-[var(--card-bg)] border border-[var(--waffle)]/35 p-5 rounded-2xl flex flex-col gap-4 shadow-sm"
            >
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A89286] border-b border-[var(--waffle)]/20 pb-2">
                New Permit Request
              </h3>

              <form onSubmit={handleApplyPermit} className="flex flex-col gap-3 font-mono text-[10px] text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase text-[#A89286]">Applicant Name</label>
                  <input 
                    type="text" 
                    value={applicantName} 
                    onChange={e => setApplicantName(e.target.value)}
                    className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs focus:outline-none focus:border-[var(--caramel)] text-[var(--foreground)]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase text-[#A89286]">Passport Identification</label>
                  <input 
                    type="text" 
                    value={passportNumber} 
                    onChange={e => setPassportNumber(e.target.value)}
                    className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs focus:outline-none focus:border-[var(--caramel)] text-[var(--foreground)]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-[#A89286]">Permit Class</label>
                    <select 
                      value={permitType} 
                      onChange={e => setPermitType(e.target.value as any)}
                      className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs focus:outline-none text-[var(--foreground)]"
                    >
                      <option value="Trekking">Trekking Loop</option>
                      <option value="Mountaineering">Mountaineering Peak</option>
                      <option value="National Park">National Park</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-[#A89286]">Target Zone</label>
                    <input 
                      type="text" 
                      value={zone} 
                      onChange={e => setZone(e.target.value)}
                      className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs focus:outline-none focus:border-[var(--caramel)] text-[var(--foreground)]"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-[#A89286]">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)}
                      className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs focus:outline-none text-[var(--foreground)] font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-[#A89286]">End Date</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)}
                      className="bg-[var(--vanilla)] border border-[var(--waffle)]/40 p-2.5 rounded-lg text-xs focus:outline-none text-[var(--foreground)] font-mono"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[var(--caramel)] hover:bg-[#B08156] text-white py-2.5 rounded-xl font-bold uppercase tracking-widest mt-2 cursor-pointer transition-colors text-[10px]"
                >
                  {isSubmitting ? 'Requesting...' : 'Request Permit Clearances'}
                </button>
              </form>
            </motion.div>

            {/* List */}
            <motion.div variants={itemVariants} className="flex flex-col gap-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A89286] border-b border-[var(--waffle)]/20 pb-2">
                Active Permits Ledger
              </h3>

              <div className="flex flex-col gap-3">
                {permits.map(permit => (
                  <div key={permit.id} className="bg-[var(--vanilla)]/40 border border-[var(--waffle)]/35 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[8px] font-mono font-bold text-white bg-[var(--caramel)] px-1.5 py-0.5 rounded uppercase">
                        {permit.type}
                      </span>
                      <h4 className="text-xs font-bold mt-1 text-[var(--foreground)]">{permit.zone}</h4>
                      <p className="text-[10px] text-[#7A6258] mt-0.5 font-mono">Passport: {permit.passportNumber}</p>
                    </div>
                    <div className="text-right flex flex-col gap-1 font-mono text-xs">
                      <span className={`font-bold ${permit.status === 'Approved' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {permit.status}
                      </span>
                      <span className="text-[9px] text-[#A89286]">${permit.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Hashing steps portal overlay */}
          <AnimatePresence>
            {isSubmitting && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[var(--background)] border border-[var(--waffle)]/40 p-6 rounded-3xl shadow-xl max-w-sm text-center w-full"
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="h-6 w-6 rounded-full border-2 border-t-transparent border-[var(--caramel)] animate-spin" />
                    <h4 className="text-xs font-mono font-bold text-[var(--foreground)] uppercase mt-2">
                      {submitStep === 1 && '1/3 Generating Crypto Hash...'}
                      {submitStep === 2 && '2/3 Querying Immigration Gateway...'}
                      {submitStep === 3 && '3/3 Permit Registered Success!'}
                    </h4>
                    <p className="text-[10px] text-[#7A6258]">Connecting with Government Registry server nodes...</p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
