'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTravelStore } from '@/store/useTravelStore';
import { Mail, Lock, Eye, EyeOff, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

import AuthLeftPanel from '@/components/features/auth/AuthLeftPanel';
import AuthBackButton from '@/components/features/auth/AuthBackButton';
import AuthRightLayout from '@/components/features/auth/AuthRightLayout';
import AuthPillBadge from '@/components/features/auth/AuthPillBadge';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, currentUser, verifyOtp } = useTravelStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser?.loggedIn && currentUser?.otpVerified) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      const mockName = email.split('@')[0];
      const capitalizedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);
      
      loginUser(`${capitalizedName} Explorer`, 'Traveler', email);
      verifyOtp(); 
      
      setIsSubmitting(false);
      router.push('/dashboard');
    }, 1200);
  };

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
      <AuthBackButton label="Back to Home" onClick={() => router.push('/')} />

      {/* 2. Shared Left Panel */}
      <AuthLeftPanel imageSrc="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200" imageAlt="Everest sunrise" />

      {/* 3. Shared Right Panel Layout */}
      <AuthRightLayout>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex flex-col gap-6 relative z-10"
        >
          {/* Shared Pill Tag */}
          <motion.div variants={itemVariants}>
            <AuthPillBadge label="Expedition Registry" />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl font-black text-[#1A1208] tracking-tight leading-tight">
              Welcome <span className="text-[#C29367]">Back</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6258] leading-relaxed font-medium">
              Sign in to continue your journey and access your custom itineraries, guides, and park permits.
            </p>
          </motion.div>

          {errorMsg && (
            <motion.p variants={itemVariants} className="text-[10px] font-mono text-rose-600 font-bold border border-rose-500/10 bg-rose-500/5 px-3.5 py-2 rounded-xl text-left">
              ⚠️ {errorMsg}
            </motion.p>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-sans text-left">
            
            {/* Email Input */}
            <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
              <label className="text-[9.5px] uppercase font-mono text-[#7A6258] tracking-wider font-black">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C29367] pointer-events-none">
                  <Mail className="h-4 w-4" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-white border border-[#3D2D27]/12 focus:border-[#C29367] rounded-xl pl-11 pr-4 py-3.5 text-xs text-[#3D2D27] font-semibold focus:outline-none transition-all placeholder-[#7A6258]/35 shadow-inner focus:ring-2 focus:ring-[#C29367]/8"
                  required
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants} className="flex flex-col gap-1.5 relative">
              <div className="flex justify-between items-center">
                <label className="text-[9.5px] uppercase font-mono text-[#7A6258] tracking-wider font-black">
                  Password
                </label>
                <button 
                  type="button" 
                  onClick={() => router.push('/signup')}
                  className="text-[10px] text-[#C29367] hover:text-[#3D2D27] font-bold hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C29367] pointer-events-none">
                  <Lock className="h-4 w-4" />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#3D2D27]/12 focus:border-[#C29367] rounded-xl pl-11 pr-10 py-3.5 text-xs text-[#3D2D27] font-semibold focus:outline-none transition-all placeholder-[#7A6258]/35 shadow-inner focus:ring-2 focus:ring-[#C29367]/8"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A6258] hover:text-[#3D2D27] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button 
              variants={itemVariants}
              type="submit"
              disabled={isSubmitting}
              style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
              className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white hover:opacity-95 transition-all shadow-[0_4px_12px_rgba(194,147,103,0.22)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-98 group disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Compass className="h-4 w-4 animate-spin text-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </motion.button>

            {/* Social Divider */}
            <motion.div variants={itemVariants} className="flex items-center">
              <div className="flex-1 border-t border-[#3D2D27]/10" />
              <span className="px-3 text-[10px] uppercase font-mono text-[#7A6258]/60 font-bold">Or continue with</span>
              <div className="flex-1 border-t border-[#3D2D27]/10" />
            </motion.div>

            {/* Google & Apple Buttons */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                className="flex items-center justify-center gap-2 rounded-xl border border-[#3D2D27]/12 bg-white py-2.5 text-xs font-semibold text-[#3D2D27] hover:bg-[#FAF9F5] transition-all cursor-pointer hover:scale-[1.01] active:scale-98"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.53 14.99 1 12 1 7.35 1 3.39 3.67 1.39 7.56l3.85 2.99c.96-2.88 3.66-4.51 6.76-4.51z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.73-4.94 3.73-8.55z"/>
                  <path fill="#FBBC05" d="M5.24 14.79a7.12 7.12 0 0 1 0-4.32L1.39 7.56C.5 9.35 0 11.45 0 13.5c0 2.05.5 4.15 1.39 5.94l3.85-2.99c-.45-.69-.73-1.48-.73-2.15z"/>
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.12.75-2.55 1.2-4.26 1.2-3.1 0-5.8-1.63-6.76-4.51L1.39 16.9C3.39 20.79 7.35 23 12 23z"/>
                </svg>
                <span>Google</span>
              </button>
              
              <button 
                type="button" 
                className="flex items-center justify-center gap-2 rounded-xl border border-[#3D2D27]/12 bg-white py-2.5 text-xs font-semibold text-[#3D2D27] hover:bg-[#FAF9F5] transition-all cursor-pointer hover:scale-[1.01] active:scale-98"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.72-1.16 1.86-1.02 2.98 1.09.08 2.2-.57 2.95-1.41z"/>
                </svg>
                <span>Apple</span>
              </button>
            </motion.div>

            {/* Back to Login page */}
            <motion.div variants={itemVariants} className="text-center border-t border-[#3D2D27]/8 pt-4 text-[11px] text-[#7A6258] font-medium">
              Don't have a travel profile?{' '}
              <button 
                type="button"
                onClick={() => router.push('/signup')}
                className="text-[#C29367] hover:text-[#3D2D27] font-bold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </motion.div>

          </form>

        </motion.div>
        
      </AuthRightLayout>

    </main>
  );
}
