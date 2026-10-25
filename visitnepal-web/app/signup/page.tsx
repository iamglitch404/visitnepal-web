'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTravelStore, UserRole } from '@/store/useTravelStore';
import { User, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import AuthLeftPanel from '@/components/features/auth/AuthLeftPanel';
import AuthBackButton from '@/components/features/auth/AuthBackButton';
import AuthRightLayout from '@/components/features/auth/AuthRightLayout';
import AuthPillBadge from '@/components/features/auth/AuthPillBadge';

export default function SignupPage() {
  const router = useRouter();
  const { loginUser, currentUser } = useTravelStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Traveler');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser?.loggedIn && currentUser?.otpVerified) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Please enter your name and email address.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('You must accept the park regulations.');
      return;
    }

    // Generate a temporary crypto-like verification token
    const chars = '0123456789abcdef';
    let token = '0x';
    for (let i = 0; i < 40; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    localStorage.setItem('nepal_verification_token', token);
    localStorage.setItem('nepal_verification_browser', navigator.userAgent);

    loginUser(fullName, role, email);
    router.push(`/confirm?token=${token}`);
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
      <AuthLeftPanel imageSrc="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200" imageAlt="Everest Sunrise" />

      {/* 3. Shared Right Layout */}
      <AuthRightLayout>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex flex-col gap-6 relative z-10"
        >
          {/* Shared Pill Badge */}
          <motion.div variants={itemVariants}>
            <AuthPillBadge label="Expedition Registry" />
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <h1 className="text-4xl sm:text-5xl font-black text-[#1A1208] tracking-tight leading-tight">
              Join <span className="text-[#C29367]">Us</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6258] leading-relaxed font-medium">
              Create an account to start planning your adventure, book stays, and discover the beauty of Nepal.
            </p>
          </motion.div>

          {errorMsg && (
            <motion.p variants={itemVariants} className="text-[10px] font-mono text-rose-600 font-bold border border-rose-500/10 bg-rose-500/5 px-3.5 py-2 rounded-xl text-left">
              ⚠️ {errorMsg}
            </motion.p>
          )}

          {/* Form using space-y-4 */}
          <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs font-sans text-left">
            
            {/* Full Name */}
            <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
              <label className="text-[9.5px] uppercase font-mono text-[#7A6258] tracking-wider font-black">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C29367] pointer-events-none">
                  <User className="h-4 w-4" />
                </div>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-white border border-[#3D2D27]/12 focus:border-[#C29367] rounded-xl pl-11 pr-4 py-3.5 text-xs text-[#3D2D27] font-semibold focus:outline-none transition-all placeholder-[#7A6258]/35 shadow-inner focus:ring-2 focus:ring-[#C29367]/8"
                  required
                />
              </div>
            </motion.div>

            {/* Email Address */}
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

            {/* Access Role Selection Grid */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
              <label className="text-[9.5px] uppercase font-mono text-[#7A6258] tracking-wider font-black">Select Access Role</label>
              <div className="grid grid-cols-3 gap-2 text-left">
                {[
                  { id: 'Traveler', label: 'Traveler', desc: 'Book stays & permits' },
                  { id: 'Guide', label: 'Guide', desc: 'Verify mountain routes' },
                  { id: 'Butler', label: 'Butler', desc: 'Personalized AI companion & planning' }
                ].map((item) => {
                  const isActive = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id as UserRole)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 relative group hover:scale-[1.01] active:scale-98 ${
                        isActive 
                          ? 'border-[#C29367] bg-[#FAF3E3]/40 shadow-inner' 
                          : 'border-[#3D2D27]/8 bg-white text-[#7A6258] hover:border-[#3D2D27]/15'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className={`text-[9.5px] font-black font-mono uppercase tracking-wide ${isActive ? 'text-[#C29367]' : 'text-[#3D2D27]'}`}>
                          {item.label}
                        </span>
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#C29367] shadow-[0_0_8px_#C29367]" />
                        )}
                      </div>
                      <span className="text-[8px] text-[#7A6258]/80 leading-tight block mt-0.5 font-medium">
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Terms check */}
            <motion.label variants={itemVariants} className="flex items-start gap-2.5 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-[#3D2D27]/15 accent-[#C29367] focus:ring-0 cursor-pointer"
                required
              />
              <span className="text-[10px] text-[#7A6258] leading-tight font-medium">
                I accept the park conservation guidelines, mountain safety codes, and registry terms.
              </span>
            </motion.label>

            {/* Submit Button */}
            <motion.button 
              variants={itemVariants}
              type="submit"
              style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
              className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white hover:opacity-95 transition-all shadow-[0_4px_12px_rgba(194,147,103,0.22)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-98 group"
            >
              <span>Create Account</span>
              <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
            </motion.button>

            {/* Link to Login */}
            <motion.div variants={itemVariants} className="text-center border-t border-[#3D2D27]/8 pt-4 text-[11px] text-[#7A6258] font-medium">
              Already have a travel profile?{' '}
              <button 
                type="button"
                onClick={() => router.push('/login')}
                className="text-[#C29367] hover:text-[#3D2D27] font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </motion.div>

          </form>

        </motion.div>

      </AuthRightLayout>

    </main>
  );
}
