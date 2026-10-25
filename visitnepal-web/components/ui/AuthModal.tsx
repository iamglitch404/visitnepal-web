'use client';

import React, { useState } from 'react';
import { useTravelStore, UserRole } from '@/store/useTravelStore';
import { 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  X, 
  KeyRound, 
  ShieldCheck, 
  Cpu, 
  Smartphone,
  Globe
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginUser, currentUser, verifyOtp } = useTravelStore();
  
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('Traveler');
  
  const [showOtp, setShowOtp] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) return;

    loginUser(fullName, role, email);
    setShowOtp(true);
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length < 4) return;

    setOtpLoading(true);
    setTimeout(() => {
      verifyOtp();
      setOtpLoading(false);
      setShowOtp(false);
      onClose();
    }, 1500);
  };

  const rolesList: UserRole[] = ['Traveler', 'Hotel Owner', 'Guide', 'Permit Officer', 'Admin'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-panel-heavy rounded-2xl border border-cyan-500/20 p-6 shadow-2xl relative flex flex-col gap-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-950/80 hover:bg-white/5 border border-zinc-900 text-zinc-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-1.5">
          <div className="h-10 w-10 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Cpu className="h-5 w-5 text-white animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-white mt-1 uppercase tracking-widest font-mono">
            {showOtp ? 'Security Overrides Check' : 'Synch Travel Passport'}
          </h3>
          <p className="text-[10px] text-zinc-550 font-mono">
            {showOtp ? 'Biometric OTP confirmation needed' : 'Holographic authentication grid'}
          </p>
        </div>

        {/* Regular Login Form */}
        {!showOtp ? (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 font-sans text-xs">
            
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase font-mono text-zinc-450 tracking-wider flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-cyan-400" /> Full Name
              </label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-medium"
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase font-mono text-zinc-450 tracking-wider flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-cyan-400" /> Secure Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.mercer@cyber-travel.org"
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            {/* Role Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase font-mono text-zinc-450 tracking-wider">Select Access Role</label>
              <div className="flex flex-wrap gap-1.5">
                {rolesList.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      role === r 
                        ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-[0_0_8px_rgba(6,182,212,0.15)]' 
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Glowing Submit */}
            <button 
              type="submit"
              className="w-full mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 py-3 text-xs font-bold text-black font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Request System OTP</span>
            </button>

            {/* Simulated social login */}
            <div className="flex flex-col gap-2.5 border-t border-zinc-900 pt-4 mt-2">
              <span className="text-[9px] font-mono text-zinc-650 text-center uppercase">Or bypass with biometric auth</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-bold">
                <button 
                  type="button" 
                  onClick={() => {
                    loginUser('Dr. Jane Sherpa', 'Admin', 'jane.sherpa@nepal.gov');
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 py-2 hover:bg-white/3 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <Globe className="h-3.5 w-3.5 text-purple-400" />
                  <span>Admin Bypass</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    loginUser('Alex Mercer', 'Traveler', 'alex.mercer@cyber.org');
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 py-2 hover:bg-white/3 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Traveler Bypass</span>
                </button>
              </div>
            </div>

          </form>
        ) : (
          /* OTP Screen */
          <form onSubmit={handleVerifyOtpSubmit} className="flex flex-col gap-4 font-mono text-xs items-center">
            
            <div className="text-center p-2 rounded-xl bg-zinc-950 border border-zinc-900 w-full mb-2">
              <p className="text-[10px] text-zinc-550">We have simulated sending a secure passcode to</p>
              <p className="text-xs text-white font-bold mt-1 select-all">{currentUser?.email}</p>
              <p className="text-[9px] text-cyan-400 mt-1">Hint: Type <span className="text-white font-black">1234</span> to unlock</p>
            </div>

            {otpLoading ? (
              <div className="h-20 flex flex-col items-center justify-center gap-3">
                <Smartphone className="h-7 w-7 text-cyan-400 animate-bounce" />
                <span className="text-[10px] text-cyan-400 animate-pulse">Synchronizing secure blocks...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase text-zinc-500 tracking-wider flex items-center gap-1 self-start">
                    <KeyRound className="h-3.5 w-3.5 text-cyan-400" /> Enter 4-Digit Passcode
                  </label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g,''))}
                    placeholder="e.g. 1234"
                    className="bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 text-center text-lg text-white font-black tracking-widest focus:outline-none focus:border-cyan-500 w-full"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 py-3 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Authenticate Override</span>
                </button>
              </div>
            )}

            <button 
              type="button" 
              onClick={() => setShowOtp(false)}
              className="text-zinc-500 hover:text-zinc-300 text-[10px] hover:underline mt-2"
            >
              Go Back
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
