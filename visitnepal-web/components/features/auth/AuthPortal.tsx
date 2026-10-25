'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTravelStore, UserRole } from '@/store/useTravelStore';
import { 
  User, 
  Mail, 
  Lock, 
  Compass, 
  ArrowRight, 
  Check, 
  Eye, 
  EyeOff, 
  Inbox, 
  Send, 
  ShieldAlert,
  Info,
  ChevronRight,
  Wifi,
  Globe,
  MapPin,
  Calendar,
  CloudSun
} from 'lucide-react';

interface AuthPortalProps {
  onSuccess: () => void;
}

type Step = 'landing' | 'signup' | 'email-sent' | 'email-client' | 'password-setup' | 'loading-screen';

export default function AuthPortal({ onSuccess }: AuthPortalProps) {
  const { loginUser, verifyOtp } = useTravelStore();

  const [step, setStep] = useState<Step>('landing');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Traveler');
  
  // Password states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Loader log states
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loaderLogs, setLoaderLogs] = useState<string[]>([]);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: 'None', level: 0, color: 'bg-zinc-200' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: 'Weak', level: 1, color: 'bg-rose-450' };
    if (score === 2) return { label: 'Fair', level: 2, color: 'bg-amber-450' };
    if (score === 3) return { label: 'Good', level: 3, color: 'bg-indigo-400' };
    return { label: 'Strong', level: 4, color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  // Handle Signup Submission
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    setStep('email-sent');
  };

  // Run the animated loading logs when transitioning to Dashboard
  useEffect(() => {
    if (step === 'loading-screen') {
      const logs = [
        'Creating your traveler profile...',
        'Syncing with Kathmandu permit registries...',
        'Connecting with local certified guide networks...',
        'Configuring your interactive weather dashboards...',
        'Securing account keys and travel coordinates...',
        'Setup complete! Welcome to Nepal.'
      ];

      let logIndex = 0;
      const logInterval = setInterval(() => {
        if (logIndex < logs.length) {
          setLoaderLogs(prev => [...prev, logs[logIndex]]);
          logIndex++;
        }
      }, 4000 / logs.length);

      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            clearInterval(logInterval);
            setTimeout(() => {
              // Commit auth to store
              loginUser(fullName, role, email);
              verifyOtp();
              onSuccess();
            }, 600);
            return 100;
          }
          return prev + 2;
        });
      }, 70);

      return () => {
        clearInterval(logInterval);
        clearInterval(progressInterval);
      };
    }
  }, [step, fullName, role, email, loginUser, verifyOtp, onSuccess]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordError('');
    setStep('loading-screen');
  };

  // Shared left split layout visual component
  const RenderLeftPanel = () => (
    <div className="hidden md:flex md:w-3/5 lg:w-[55%] relative h-full overflow-hidden select-none bg-[#3D2D27]">
      {/* Mountain background image */}
      <img 
        src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200" 
        alt="Sagarmatha Peak at Sunrise" 
        className="w-full h-full object-cover opacity-80 brightness-[0.8] contrast-[1.05]"
      />
      {/* Color overlay matching warm sand/caramel */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#3D2D27]/80 via-transparent to-transparent" />
      
      {/* Digital interface overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-10 z-10 text-left">
        {/* Top corner metrics */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 bg-[#FCF9F2]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#3D2D27]/10 shadow-xs">
            <Compass className="h-4 w-4 text-[#C29367] animate-spin-slow" />
            <span className="text-[10px] font-mono font-bold text-[#3D2D27] tracking-wider">KHUMBU PATHWAY REF</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-600 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/10 shadow-xs">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>TRAILS ACTIVE</span>
          </div>
        </div>

        {/* Bottom floating telemetry widget */}
        <div className="bg-[#FCF9F2]/95 backdrop-blur-md border border-[#3D2D27]/10 rounded-2xl p-5 max-w-sm flex flex-col gap-3 shadow-lg text-left">
          <div className="flex items-center gap-2">
            <CloudSun className="h-4.5 w-4.5 text-[#C29367]" />
            <span className="text-[9px] font-mono text-[#7A6258] uppercase tracking-widest block font-bold">Live Weather Report</span>
          </div>
          <div>
            <h4 className="text-xs font-black text-[#3D2D27] leading-tight">Everest Base Camp (Station A)</h4>
            <p className="text-[10px] text-[#7A6258] mt-1">Clear sky conditions with moderate northern winds. Acclimatization rating: Optimal.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-1 font-mono text-[9px] border-t border-[#3D2D27]/10 pt-2 text-[#7A6258]">
            <div className="flex items-center justify-between">
              <span>TEMP:</span>
              <span className="text-[#3D2D27] font-black">-6°C</span>
            </div>
            <div className="flex items-center justify-between">
              <span>WIND:</span>
              <span className="text-[#3D2D27] font-black">12 km/h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-[#FDFBF7] text-[#3D2D27] flex overflow-hidden relative font-sans">
      
      <AnimatePresence mode="wait">
        
        {/* STEP 1: LANDING PAGE */}
        {step === 'landing' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex"
          >
            {/* Left Visual split */}
            <RenderLeftPanel />

            {/* Right form panel */}
            <div className="w-full md:w-2/5 lg:w-[45%] h-full flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 bg-[#FDFBF7] overflow-y-auto">
              <div className="flex flex-col gap-6 text-left max-w-md w-full mx-auto py-8">
                {/* Brand monogram */}
                <div className="flex items-center gap-2.5 select-none">
                  <div
                    style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)', boxShadow: '0 2px 8px rgba(194,147,103,0.3)' }}
                    className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-sm text-white"
                  >
                    N
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-[#3D2D27]">
                    Visit Nepal
                  </span>
                </div>

                {/* Welcome message */}
                <div className="flex flex-col gap-3">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.1] text-[#3D2D27]">
                    Experience the Himalayas.<br />
                    <span className="bg-gradient-to-r from-[#C29367] to-[#A67848] bg-clip-text text-transparent">
                      Authentically.
                    </span>
                  </h1>

                  <p className="text-[13px] text-[#7A6258] leading-relaxed font-medium mt-1">
                    Connect directly with certified local guides, secure lodging in handpicked mountain tea houses, and manage your trekking permits in one clean dashboard.
                  </p>
                </div>

                {/* Benefits checklist */}
                <div className="flex flex-col gap-2.5 border-y border-[#3D2D27]/10 py-5 my-2">
                  <div className="flex gap-3 items-center">
                    <div className="h-5 w-5 rounded-full bg-[#FAF3E3] flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-[#C29367]" />
                    </div>
                    <span className="text-xs text-[#5C463C] font-semibold">Certified mountain guides & Sherpas</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="h-5 w-5 rounded-full bg-[#FAF3E3] flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-[#C29367]" />
                    </div>
                    <span className="text-xs text-[#5C463C] font-semibold">Verified eco-lodges & tea houses</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="h-5 w-5 rounded-full bg-[#FAF3E3] flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-[#C29367]" />
                    </div>
                    <span className="text-xs text-[#5C463C] font-semibold">Instant digital permit applications</span>
                  </div>
                </div>

                {/* Button flow triggers */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setStep('signup')}
                    style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
                    className="w-full py-3.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider text-white hover:opacity-95 cursor-pointer shadow-[0_5px_15px_rgba(194,147,103,0.2)] hover:shadow-[0_5px_20px_rgba(194,147,103,0.3)] transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98"
                  >
                    <span>Create Your Travel Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => setStep('signup')}
                    className="w-full py-3 rounded-xl border border-[#3D2D27]/12 text-xs font-mono font-bold text-[#7A6258] hover:text-[#3D2D27] hover:bg-[#FAF3E3]/20 transition-all cursor-pointer text-center"
                  >
                    Register as Guide / Butler
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: SIGN UP */}
        {step === 'signup' && (
          <motion.div 
            key="signup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex"
          >
            {/* Left Visual split */}
            <RenderLeftPanel />

            {/* Right form panel */}
            <div className="w-full md:w-2/5 lg:w-[45%] h-full flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 bg-[#FDFBF7] overflow-y-auto">
              <div className="flex flex-col gap-5 text-left max-w-md w-full mx-auto py-8">
                {/* Back Link */}
                <button 
                  onClick={() => setStep('landing')}
                  className="text-[#7A6258] hover:text-[#3D2D27] font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-colors w-fit"
                >
                  <span>← Go Back</span>
                </button>

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-2xl font-black text-[#3D2D27] tracking-tight">Create Travel Profile</h3>
                  <p className="text-xs text-[#7A6258] leading-relaxed font-medium">
                    Enter your name and email. We will simulate sending a verification link to your inbox.
                  </p>
                </div>

                <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4 font-sans text-xs mt-1">
                  
                  {/* Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-mono text-[#7A6258] tracking-wider flex items-center gap-1 font-bold">
                      <User className="h-3.5 w-3.5 text-[#C29367]" /> Full Name
                    </label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Alex Mercer"
                      className="bg-white border border-[#3D2D27]/12 focus:border-[#C29367] rounded-xl px-3 py-3 text-[#3D2D27] font-semibold focus:outline-none transition-all placeholder-[#7A6258]/40 shadow-xs"
                      required
                    />
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-mono text-[#7A6258] tracking-wider flex items-center gap-1 font-bold">
                      <Mail className="h-3.5 w-3.5 text-[#C29367]" /> Email Address
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="alex.mercer@gmail.com"
                      className="bg-white border border-[#3D2D27]/12 focus:border-[#C29367] rounded-xl px-3 py-3 text-[#3D2D27] font-semibold focus:outline-none transition-all placeholder-[#7A6258]/40 shadow-xs"
                      required
                    />
                  </div>

                  {/* Role Selection Grid */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] uppercase font-mono text-[#7A6258] tracking-wider font-bold">Select Profile Role</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'Traveler', label: 'Traveler', desc: 'Book stays, guides, and track permits' },
                        { id: 'Guide', label: 'Guide', desc: 'Host expeditions and verify tracks' },
                        { id: 'Butler', label: 'Butler', desc: 'Personalized companion & planning assistance' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setRole(item.id as UserRole)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                            role === item.id 
                              ? 'border-[#C29367] bg-[#FAF3E3]/40 shadow-inner' 
                              : 'border-[#3D2D27]/8 bg-white text-[#7A6258] hover:border-[#3D2D27]/15'
                          }`}
                        >
                          <span className={`text-[10px] font-black font-mono uppercase tracking-wide ${role === item.id ? 'text-[#C29367]' : 'text-[#3D2D27]'}`}>
                            {item.label}
                          </span>
                          <span className="text-[8.5px] text-[#7A6258]/80 leading-tight block mt-0.5 font-medium">
                            {item.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Register button */}
                  <button 
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
                    className="w-full mt-3 py-3.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider text-white hover:opacity-95 transition-all shadow-[0_5px_15px_rgba(194,147,103,0.18)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-98"
                  >
                    <span>Request Verification Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="text-center mt-1.5">
                    <span className="text-[8.5px] font-mono text-[#A89286] uppercase font-bold">By signing up you agree to local park safety regulations.</span>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: INTERMEDIARY "EMAIL SENT" VIEW */}
        {step === 'email-sent' && (
          <motion.div 
            key="email-sent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex"
          >
            {/* Left Visual split */}
            <RenderLeftPanel />

            {/* Right form panel */}
            <div className="w-full md:w-2/5 lg:w-[45%] h-full flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 bg-[#FDFBF7] overflow-y-auto">
              <div className="flex flex-col gap-6 text-left max-w-md w-full mx-auto py-8 items-center text-center md:items-start md:text-left">
                <div className="h-14 w-14 bg-[#FAF3E3] border border-[#EBD6BC]/50 rounded-2xl flex items-center justify-center shadow-xs">
                  <Send className="h-6 w-6 text-[#C29367] animate-pulse" />
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-black text-[#3D2D27] tracking-tight">Check Your Inbox</h3>
                  <p className="text-[10px] font-mono text-[#C29367] select-all font-bold tracking-wider">{email}</p>
                  <p className="text-xs text-[#7A6258] leading-relaxed font-medium mt-1">
                    We have sent a secure registration confirmation email to verify your email node. Open the simulated client to continue.
                  </p>
                </div>

                <div className="bg-[#FAF3E3]/40 border border-[#EBD6BC]/30 p-4 rounded-xl text-left w-full flex items-start gap-2.5 font-mono text-[9px] text-[#7A6258]">
                  <Info className="h-4 w-4 text-[#C29367] mt-0.5 shrink-0" />
                  <p className="leading-relaxed font-semibold">
                    To simulate the full registration flow, click below to open your <span className="text-[#3D2D27] font-bold">Mail Inbox Simulator</span> where you can verify your profile and proceed to choose a password.
                  </p>
                </div>

                <button
                  onClick={() => setStep('email-client')}
                  className="w-full py-3.5 rounded-xl border border-[#3D2D27]/12 hover:bg-[#FAF3E3]/35 text-xs font-mono font-black text-[#3D2D27] transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                >
                  <span>Launch Inbox Simulator</span>
                  <ChevronRight className="h-4 w-4 text-[#C29367]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: LOTUS MAIL SIMULATOR (SUPERHUMAN STYLE SIMULATOR) */}
        {step === 'email-client' && (
          <motion.div 
            key="email-client"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex items-center justify-center p-6 md:p-12 lg:p-16 bg-[#FCF9F2]"
          >
            <div className="w-full max-w-5xl bg-[#FAF8F5] border border-[#3D2D27]/8 rounded-3xl overflow-hidden shadow-xl flex flex-col h-[560px]">
              {/* Mail Client Header */}
              <div className="bg-white border-b border-[#3D2D27]/8 px-5 py-3.5 flex items-center justify-between shrink-0 font-mono text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[#7A6258] font-black ml-2 uppercase tracking-widest">AETHERMAIL SUITE</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#A89286] font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SIMULATED INBOX</span>
                </div>
              </div>

              {/* Mail Client Body */}
              <div className="flex flex-1 min-h-0">
                {/* Sidebar Folder list */}
                <div className="w-1/4 bg-[#FAF8F5] border-r border-[#3D2D27]/8 p-4.5 flex flex-col gap-1 shrink-0 text-left font-mono text-[9.5px] uppercase tracking-wide font-bold">
                  <button className="flex items-center justify-between px-3.5 py-2.5 bg-[#FAF3E3] text-[#3D2D27] rounded-xl border border-[#EBD6BC]/40 cursor-pointer w-full text-left">
                    <div className="flex items-center gap-2">
                      <Inbox className="h-4 w-4 text-[#C29367]" />
                      <span>Inbox</span>
                    </div>
                    <span className="bg-[#C29367] text-white text-[8px] font-black h-4 px-1.5 rounded-full flex items-center justify-center">1</span>
                  </button>
                  <button className="flex items-center gap-2 px-3.5 py-2.5 text-[#7A6258] hover:text-[#3D2D27] transition-colors cursor-pointer w-full text-left">
                    <Send className="h-3.5 w-3.5 opacity-70" />
                    <span>Sent Mail</span>
                  </button>
                  <button className="flex items-center gap-2 px-3.5 py-2.5 text-[#7A6258] hover:text-[#3D2D27] transition-colors cursor-pointer w-full text-left">
                    <ShieldAlert className="h-3.5 w-3.5 opacity-70" />
                    <span>Spam Filters</span>
                  </button>
                </div>

                {/* Email Item Selection (Center panel) */}
                <div className="w-1/3 border-r border-[#3D2D27]/8 flex flex-col min-h-0 bg-white text-left shrink-0">
                  <div className="px-4 py-3 border-b border-[#3D2D27]/8 shrink-0 font-mono text-[8px] text-[#A89286] uppercase tracking-widest font-black">
                    Recent Messages
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4 border-b border-[#3D2D27]/5 bg-[#FAF3E3]/15 relative cursor-pointer">
                      {/* Unread indicator dot */}
                      <span className="absolute top-4.5 left-2.5 h-2 w-2 bg-[#C29367] rounded-full" />
                      
                      <div className="flex justify-between items-start pl-2">
                        <span className="text-[10px] font-black text-[#3D2D27] font-mono truncate max-w-[80%]">Visit Nepal Portal</span>
                        <span className="text-[8px] font-mono text-[#A89286]">Just now</span>
                      </div>
                      <h4 className="text-[10px] font-black text-[#C29367] mt-1 pl-2 truncate">
                        Confirm your registration and set up password
                      </h4>
                      <p className="text-[9.5px] text-[#7A6258] line-clamp-2 mt-1 pl-2 font-medium leading-relaxed">
                        Namaste {fullName}! Thank you for signing up to explore the Himalayas. To complete...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email Body Open (Right panel) */}
                <div className="flex-1 flex flex-col min-h-0 bg-[#FAF8F5] text-left">
                  {/* Email Body Header */}
                  <div className="p-5 border-b border-[#3D2D27]/8 shrink-0 flex flex-col gap-1 bg-white">
                    <h3 className="text-xs font-black text-[#3D2D27]">
                      Confirm your registration and set up password
                    </h3>
                    <div className="flex justify-between items-center text-[9px] font-mono text-[#7A6258] mt-1.5">
                      <span>From: portal@visitnepal.gov.np</span>
                      <span>To: {email}</span>
                    </div>
                  </div>

                  {/* Email Content Body */}
                  <div className="flex-1 overflow-y-auto p-6 text-[#5C463C] leading-relaxed font-sans text-xs">
                    <div className="max-w-md mx-auto flex flex-col gap-4">
                      {/* Email Header Seal */}
                      <div className="flex items-center gap-2 border-b border-[#3D2D27]/8 pb-3.5 select-none">
                        <div
                          style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
                          className="h-6 w-6 rounded flex items-center justify-center font-black text-xs text-white"
                        >
                          N
                        </div>
                        <span className="text-[9px] font-mono font-bold tracking-widest text-[#3D2D27] uppercase">Nepal Digital Travel Agency</span>
                      </div>

                      <p className="font-black text-[#3D2D27] text-sm">Namaste {fullName},</p>
                      
                      <p className="text-[11px] leading-relaxed font-medium">
                        Thank you for registering on the Visit Nepal portal. We're excited to support your upcoming Himalayan journey, connecting you to verified guides and secure trekking passes.
                      </p>

                      <p className="text-[11px] leading-relaxed font-medium">
                        To verify your email address, establish your account, and set up your secure password, please click the button below:
                      </p>

                      {/* CTA Button in simulated mail */}
                      <div className="py-4 text-center">
                        <button
                          onClick={() => setStep('password-setup')}
                          style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider text-white hover:opacity-95 cursor-pointer shadow-[0_5px_15px_rgba(194,147,103,0.2)] hover:scale-[1.02] active:scale-98"
                        >
                          <span>Confirm Profile & Choose Password</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="border-t border-[#3D2D27]/8 pt-3.5 text-[8.5px] font-mono text-[#A89286] leading-relaxed">
                        <p>This verification link is simulated for mock setup flow.</p>
                        <p className="mt-0.5">Reference ID: VERIFY-TOKEN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 5: PASSWORD SELECTION */}
        {step === 'password-setup' && (
          <motion.div 
            key="password-setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex"
          >
            {/* Left Visual split */}
            <RenderLeftPanel />

            {/* Right form panel */}
            <div className="w-full md:w-2/5 lg:w-[45%] h-full flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 bg-[#FDFBF7] overflow-y-auto">
              <div className="flex flex-col gap-5 text-left max-w-md w-full mx-auto py-8">
                <div className="flex flex-col gap-1 text-left">
                  <div className="h-9 w-9 bg-[#FAF3E3] border border-[#EBD6BC]/55 rounded-xl flex items-center justify-center">
                    <Lock className="h-4.5 w-4.5 text-[#C29367]" />
                  </div>
                  <h3 className="text-xl font-black text-[#3D2D27] tracking-tight mt-3">Choose a Password</h3>
                  <p className="text-[9.5px] font-mono text-[#7A6258] uppercase mt-0.5">Setting password for {email}</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4 text-xs font-sans mt-1">
                  
                  {/* Choose Password */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[9px] uppercase font-mono text-[#7A6258] tracking-wider font-bold">New Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password (min 8 chars)"
                        className="w-full bg-white border border-[#3D2D27]/12 focus:border-[#C29367] rounded-xl pl-3.5 pr-10 py-3 text-[#3D2D27] font-semibold focus:outline-none transition-all placeholder-[#7A6258]/40 shadow-xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A6258] hover:text-[#3D2D27] cursor-pointer flex items-center"
                      >
                        {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="flex flex-col gap-1.5 bg-[#FAF3E3]/40 border border-[#EBD6BC]/30 p-3.5 rounded-xl text-left">
                    <div className="flex justify-between items-center text-[9px] font-mono font-bold">
                      <span className="text-[#7A6258]">Strength Checker:</span>
                      <span className="font-bold text-[#3D2D27]" style={{ color: strength.level > 0 ? '' : '#7a6258' }}>
                        {strength.label.toUpperCase()}
                      </span>
                    </div>
                    {/* Strength Bar */}
                    <div className="grid grid-cols-4 gap-1.5 h-1 mt-1 shrink-0">
                      {[1, 2, 3, 4].map(idx => (
                        <div 
                          key={idx}
                          className={`h-full rounded-full transition-all duration-300 ${
                            strength.level >= idx ? strength.color : 'bg-[#3D2D27]/8'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[9px] uppercase font-mono text-[#7A6258] tracking-wider font-bold">Confirm Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full bg-white border border-[#3D2D27]/12 focus:border-[#C29367] rounded-xl pl-3.5 pr-10 py-3 text-[#3D2D27] font-semibold focus:outline-none transition-all placeholder-[#7A6258]/40 shadow-xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7A6258] hover:text-[#3D2D27] cursor-pointer flex items-center"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>

                  {passwordError && (
                    <p className="text-[10px] font-mono text-rose-600 font-bold border border-rose-500/10 bg-rose-500/5 px-3.5 py-2.5 rounded-lg text-left">
                      ⚠️ {passwordError}
                    </p>
                  )}

                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex gap-2 items-start text-[10px] text-[#7A6258] leading-relaxed font-semibold text-left select-none">
                      <input type="checkbox" id="agree-check" className="mt-0.5 cursor-pointer accent-[#C29367] scale-102" required />
                      <label htmlFor="agree-check" className="cursor-pointer">I verify this profile and accept local park conservation guidelines.</label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
                    className="w-full mt-3 py-3.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider text-white hover:opacity-95 transition-all shadow-[0_5px_15px_rgba(194,147,103,0.2)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-98"
                  >
                    <span>Complete Onboarding</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 6: LOADER SCREEN */}
        {step === 'loading-screen' && (
          <motion.div 
            key="loading-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex flex-col items-center justify-center bg-[#FCF9F2] p-8 select-none"
          >
            <div className="max-w-md w-full bg-white border border-[#3D2D27]/8 rounded-3xl p-6 lg:p-8 text-left shadow-lg flex flex-col gap-6">
              <div className="flex items-center gap-2.5 select-none">
                <div
                  style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)', boxShadow: '0 2px 8px rgba(194,147,103,0.35)' }}
                  className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-sm text-white"
                >
                  N
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#3D2D27] font-bold">
                  Onboarding Portal
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-2.5 mt-2">
                <div className="flex justify-between items-center text-[9px] font-mono text-[#7A6258] font-bold">
                  <span>ESTABLISHING ACCOUNT DETAILS...</span>
                  <span className="font-bold text-[#C29367]">{loadingProgress}%</span>
                </div>
                <div className="h-2 w-full bg-[#3D2D27]/8 rounded-full overflow-hidden shrink-0 border border-[#3D2D27]/5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C29367] via-[#EBD6BC] to-[#C29367] transition-all duration-700 ease-out shadow-[0_0_8px_rgba(194,147,103,0.4)]"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>

              {/* Simulated Logs */}
              <div className="bg-[#FAF8F5] border border-[#3D2D27]/5 p-4.5 rounded-2xl h-44 overflow-y-auto font-mono text-[9px] text-[#7A6258] flex flex-col gap-2 select-text shadow-inner">
                <AnimatePresence>
                  {loaderLogs.map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={i === loaderLogs.length - 1 ? 'text-[#C29367] font-bold' : ''}
                    >
                      <span className="text-[#A89286] opacity-75">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span> {log}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 text-[#A89286] justify-center pt-1 font-mono">
                <span className="h-2 w-2 bg-[#C29367] rounded-full animate-ping" />
                <span className="text-[8.5px] uppercase font-bold">Configuring trail parameters</span>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
