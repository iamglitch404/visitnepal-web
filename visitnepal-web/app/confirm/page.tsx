'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTravelStore } from '@/store/useTravelStore';
import { ArrowRight, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

import AuthLeftPanel from '@/components/features/auth/AuthLeftPanel';
import AuthBackButton from '@/components/features/auth/AuthBackButton';
import AuthRightLayout from '@/components/features/auth/AuthRightLayout';
import AuthPillBadge from '@/components/features/auth/AuthPillBadge';

export default function ConfirmPage() {
  const router = useRouter();
  const { currentUser } = useTravelStore();
  const [currentToken, setCurrentToken] = useState('');
  const [isValidating, setIsValidating] = useState(true);

  // Security Verification & Browser-Change Check
  useEffect(() => {
    // Read parameters from window.location to avoid Suspense constraints
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const storedToken = localStorage.getItem('nepal_verification_token');
    const storedBrowser = localStorage.getItem('nepal_verification_browser');

    // If no profile exists, or URL token is missing, or doesn't match browser session storage:
    if (
      !currentUser || 
      !currentUser.loggedIn || 
      !urlToken || 
      urlToken !== storedToken || 
      storedBrowser !== navigator.userAgent
    ) {
      router.push('/');
    } else {
      setCurrentToken(urlToken);
      setIsValidating(false);
    }
  }, [currentUser, router]);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  return (
    <main className="h-screen w-screen relative overflow-hidden flex flex-col lg:flex-row bg-[#FAF9F5] font-sans">
      
      {/* 1. Shared Back Button */}
      <AuthBackButton label="Back to Register" onClick={() => router.push('/signup')} />

      {/* 2. Shared Left Panel */}
      <AuthLeftPanel imageSrc="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200" imageAlt="Annapurna sunrise" />

      {/* 3. Shared Right Layout Wrapper */}
      <AuthRightLayout>
        {isValidating ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3 w-full">
            <Compass className="h-8 w-8 animate-spin text-[#C29367]" />
            <span className="font-mono text-[9px] uppercase tracking-widest font-black text-[#7A6258]">
              Validating secure session...
            </span>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full flex flex-col gap-6 relative z-10"
          >
            {/* Shared Pill Tag */}
            <motion.div variants={itemVariants}>
              <AuthPillBadge label="Security Verification" />
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <h1 className="text-4xl sm:text-5xl font-black text-[#1A1208] tracking-tight leading-tight">
                Verify your <span className="text-[#C29367]">account</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#7A6258] leading-relaxed font-medium">
                We sent a verification magic link to <strong className="text-[#3D2D27]">{currentUser?.email}</strong>. Click the button below to simulate opening the magic link.
              </p>
            </motion.div>

            {/* Direct magic link action button */}
            <motion.button
              variants={itemVariants}
              onClick={() => router.push(`/set-password?token=${currentToken}`)}
              style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
              className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white hover:opacity-95 transition-all shadow-[0_4px_12px_rgba(194,147,103,0.22)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-98 group"
            >
              <span>Verify & Set Password</span>
              <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
            </motion.button>

            <motion.div variants={itemVariants} className="flex items-center gap-2 text-[#A89286] justify-center font-mono select-none pt-2">
              <span className="h-1.5 w-1.5 bg-[#C29367] rounded-full animate-ping shrink-0" />
              <span className="text-[8.5px] uppercase font-bold text-[#7A6258]">Waiting for activation</span>
            </motion.div>

          </motion.div>
        )}
      </AuthRightLayout>

    </main>
  );
}
