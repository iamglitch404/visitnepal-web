'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTravelStore } from '@/store/useTravelStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';

const ATTRACTIONS = [
  {
    name: "Everest Base Camp",
    location: "Khumbu, 5,364m",
    desc: "Trek to the roof of the world under the gaze of Mount Everest.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200"
  },
  {
    name: "Phewa Lake",
    location: "Pokhara Valley",
    desc: "A serene mirror reflecting the snow-capped spires of the Annapurna range.",
    image: "https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=1200"
  },
  {
    name: "Boudhanath Stupa",
    location: "Kathmandu Valley",
    desc: "A sacred, meditative mandala of peace and ancient wisdom.",
    image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=1200"
  },
  {
    name: "Chitwan Wilds",
    location: "Chitwan National Park",
    desc: "Sub-tropical forests hosting rare one-horned rhinos and tigers.",
    image: "https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=1200"
  },
  {
    name: "Ama Dablam Peak",
    location: "Sagarmatha Region",
    desc: "One of the most breathtaking alpine silhouettes in the Himalayas.",
    image: "https://images.unsplash.com/photo-1585016495481-91613a3ab1bc?q=80&w=1200"
  }
];

export default function LoadingPage() {
  const router = useRouter();
  const { currentUser, verifyOtp } = useTravelStore();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [attractionIdx, setAttractionIdx] = useState(0);

  // Route security gate: Redirect to signup if no active profile, or dashboard if already authenticated
  useEffect(() => {
    if (!currentUser || !currentUser.loggedIn) {
      router.push('/signup');
    } else if (currentUser.otpVerified) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  // Cycle attractions
  useEffect(() => {
    const interval = setInterval(() => {
      setAttractionIdx(prev => (prev + 1) % ATTRACTIONS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Run progress animations
  useEffect(() => {
    if (!currentUser || !currentUser.loggedIn || currentUser.otpVerified) return;

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            verifyOtp();
            router.push('/dashboard');
          }, 800);
          return 100;
        }
        return prev + 2;
      });
    }, 85);

    return () => clearInterval(progressInterval);
  }, [currentUser, verifyOtp, router]);

  // Premium, unified initial loader guard
  if (!currentUser || !currentUser.loggedIn || currentUser.otpVerified) {
    return (
      <div className="h-screen w-screen bg-[#FAF9F5] flex flex-col items-center justify-center font-sans text-xs text-[#7A6258] gap-4">
        <Compass className="h-8 w-8 animate-spin text-[#C29367]" />
        <span className="font-mono text-[9px] uppercase tracking-widest font-black">Establishing Secure Route...</span>
      </div>
    );
  }

  const currentAttraction = ATTRACTIONS[attractionIdx];

  return (
    <div className="h-screen w-screen bg-[#130E0A] flex items-center justify-center relative font-sans overflow-hidden p-6">
      
      {/* 1. Fullscreen Photographic Background Slideshow (Fills full area) */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img 
            key={attractionIdx}
            src={currentAttraction.image} 
            alt={currentAttraction.name} 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1.01 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        {/* Soft atmospheric overlay for text legibility */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px] pointer-events-none" />
      </div>

      {/* 2. Glassmorphic Centralized Details Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }}
        className="max-w-[440px] w-full bg-[#FAF9F5]/90 backdrop-blur-xl border border-white/25 rounded-[32px] p-7 text-left shadow-2xl flex flex-col gap-6 z-10 relative"
        style={{ boxShadow: '0 30px 70px -10px rgba(0, 0, 0, 0.5)' }}
      >
        {/* Onboarding Pill Header */}
        <div className="flex justify-between items-center pb-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3E3] border border-[#C29367]/20 text-[9px] font-mono font-bold text-[#A67848] uppercase tracking-wider select-none">
            <Sparkles className="h-3 w-3" />
            <span>Onboarding Portal</span>
          </div>
          <Compass className="h-4.5 w-4.5 animate-spin text-[#C29367]" />
        </div>

        {/* Dynamic Text Information Block */}
        <div className="flex flex-col min-h-[96px] justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={attractionIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as any }}
              className="flex flex-col gap-1"
            >
              <span className="text-[9px] font-mono font-bold text-[#C29367] uppercase tracking-widest leading-none">
                {currentAttraction.location}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1208] tracking-tight leading-tight mt-0.5">
                {currentAttraction.name}
              </h2>
              <p className="text-xs text-[#7A6258] leading-relaxed font-medium mt-1">
                {currentAttraction.desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Unified Progress Status Bar */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#3D2D27]/8">
          <div className="flex justify-between items-center text-[9px] font-mono text-[#7A6258] font-bold">
            <span className="uppercase tracking-wider">Establishing account details...</span>
            <span className="font-bold text-[#C29367]">{loadingProgress}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#3D2D27]/5 rounded-full overflow-hidden shrink-0 border border-[#3D2D27]/5">
            <div 
              className="h-full bg-gradient-to-r from-[#C29367] to-[#A67848] transition-all duration-300 ease-out shadow-[0_0_8px_rgba(194,147,103,0.3)]"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>

        {/* Small status footer */}
        <div className="text-center font-mono text-[8px] uppercase tracking-wider text-[#7A6258]/80 font-bold select-none">
          <span>Configuring trail parameters...</span>
        </div>

      </motion.div>
    </div>
  );
}
