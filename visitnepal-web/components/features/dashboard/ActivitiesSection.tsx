'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface ActivitiesSectionProps {
  activeId: string;
  onNavigate?: (id: string) => void;
}

const ACTIVITIES_LIST = [
  {
    id: 'trekking',
    title: 'Himalayan Trekking Loops',
    difficulty: 'Moderate to Challenging',
    duration: '7 - 21 Days',
    season: 'Autumn & Spring',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600',
    description: 'Walk pristine circuits like Annapurna, Manaslu, or Langtang trails, resting in traditional mountain homestays.'
  },
  {
    id: 'mountaineering',
    title: 'Peak Climbing Expeditions',
    difficulty: 'Extreme (Technical)',
    duration: '30 - 60 Days',
    season: 'April - May',
    image: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=600',
    description: 'Ascend peaks like Everest, Ama Dablam, Lhotse, or Mera Peak with certified local Sherpa teams.'
  },
  {
    id: 'wildlife',
    title: 'Subtropical Jungle Safari',
    difficulty: 'Easy',
    duration: '2 - 4 Days',
    season: 'October - April',
    image: 'https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=600',
    description: 'Canoe safari down the Rapti River to spot endangered Bengal tigers, one-horned rhinos, and python nests.'
  },
  {
    id: 'cultural',
    title: 'Ancient Newari Heritage Walk',
    difficulty: 'Easy',
    duration: '1 - 3 Days',
    season: 'Year-round',
    image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=600',
    description: 'Inspect pagoda roofs, courtyards of durbar squares, and join local Tibetan meditation sessions.'
  },
  {
    id: 'ecotourism',
    title: 'Organic Tea House Retreats',
    difficulty: 'Easy',
    duration: '3 - 7 Days',
    season: 'Year-round',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600',
    description: 'Volunteer at organic cardamom gardens, learn local handloom weaving, and eat fresh farm-to-table meals.'
  },
  {
    id: 'adventure',
    title: 'High-Altitude Paragliding',
    difficulty: 'Moderate',
    duration: '1 Day',
    season: 'September - May',
    image: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=600',
    description: 'Launch from Sarangkot peak, Pokhara and glide above the deep clouds alongside eagles with Annapurna behind you.'
  }
];

export default function ActivitiesSection({ activeId, onNavigate }: ActivitiesSectionProps) {
  const router = useRouter();
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

  const activeActivity = ACTIVITIES_LIST.find(a => a.id === activeId) || ACTIVITIES_LIST[0];

  return (
    <motion.div 
      key={activeId}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full text-left"
    >
      {/* ── MAIN ACTIVITIES DIRECTORY (ALL) ──────────────────────────────── */}
      {activeId === 'activities' && (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
          <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--caramel)] uppercase">
              Expedition Catalog
            </span>
            <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)]">Active Modalities</h2>
            <p className="text-xs text-[#7A6258]">From technical mountain ascents to meditative jungle loops, choose your style of travel.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ACTIVITIES_LIST.map(act => (
              <div 
                key={act.id}
                onClick={() => onNavigate ? onNavigate(act.id) : router.push('/info/' + act.id)}
                className="bg-[var(--card-bg)] border border-[var(--waffle)]/35 rounded-2xl overflow-hidden hover:border-[var(--caramel)]/50 transition-all duration-200 shadow-[0_4px_12px_rgba(61,45,39,0.01)] cursor-pointer active:scale-[0.99] group"
              >
                <img src={act.image} alt={act.title} className="w-full h-36 object-cover border-b border-[var(--waffle)]/20" />
                <div className="p-5 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold text-[var(--caramel)]">
                    <span>{act.difficulty}</span>
                    <span>{act.duration}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--caramel)] transition-colors mt-0.5">{act.title}</h3>
                  <p className="text-[11px] text-[#7A6258] leading-relaxed">{act.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* ── SPECIFIC DETAILED ACTIVITY ───────────────────────────────────── */}
      {activeId !== 'activities' && (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
          <motion.div variants={itemVariants} className="flex flex-col gap-3">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--caramel)] uppercase">
              {activeActivity.difficulty} • {activeActivity.duration}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)] tracking-tight">
              {activeActivity.title}
            </h2>
            <p className="text-sm text-[#7A6258] leading-relaxed max-w-xl">
              {activeActivity.description}
            </p>
          </motion.div>

          {/* Grid Layout detail sheets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <motion.img 
              variants={itemVariants} 
              src={activeActivity.image} 
              alt={activeActivity.title} 
              className="w-full h-64 object-cover rounded-2xl border border-[var(--waffle)]/40 shadow-sm"
            />
            
            <motion.div variants={itemVariants} className="flex flex-col gap-5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#A89286] border-b border-[var(--waffle)]/30 pb-2">
                Logistics & Core Calibration
              </h3>

              <div className="flex flex-col gap-3 font-mono text-[11px] text-[#7A6258]">
                <div className="flex justify-between py-1 border-b border-[var(--waffle)]/15">
                  <span className="font-bold text-[var(--foreground)]">Optimal Season:</span>
                  <span>{activeActivity.season}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--waffle)]/15">
                  <span className="font-bold text-[var(--foreground)]">Guide Requirement:</span>
                  <span>Highly Recommended (Cert. Sherpa)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[var(--waffle)]/15">
                  <span className="font-bold text-[var(--foreground)]">Permits Needed:</span>
                  <span>Gov Registry Clearances</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-bold text-[var(--foreground)]">Gear Level:</span>
                  <span>Tailored Equipment Set</span>
                </div>
              </div>

              <div className="bg-[var(--vanilla)] p-4 rounded-xl border border-[var(--waffle)]/35 flex flex-col gap-2">
                <span className="text-[9px] font-mono font-bold text-[var(--caramel)] uppercase">Traveler safety reminder</span>
                <p className="text-[11px] text-[#7A6258] leading-relaxed font-sans">
                  High-altitude circuits require careful acclimatization. Ensure you hydrate well, rest in our classic tea houses, and follow instructions from your local guide.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
