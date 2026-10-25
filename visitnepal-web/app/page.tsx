'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTravelStore } from '@/store/useTravelStore';
import {
  Compass, ArrowRight, Map, ShieldCheck, Hotel, Users, Sun,
  ArrowUpRight, Mountain, Trees, Milestone, Sliders, Check, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DESTINATIONS_LIST = [
  { name: 'Everest Base Camp (Khumbu)', altitude: 5364, theme: 'trek', duration: 14, region: 'Solukhumbu' },
  { name: 'Ama Dablam Summit', altitude: 6812, theme: 'climb', duration: 21, region: 'Solukhumbu' },
  { name: 'Annapurna Conservation Area', altitude: 4130, theme: 'trek', duration: 12, region: 'Kaski' },
  { name: 'Pokhara Adventure Valley', altitude: 822, theme: 'culture', duration: 5, region: 'Kaski' },
  { name: 'Chitwan National Park Safari', altitude: 150, theme: 'safari', duration: 6, region: 'Chitwan' },
  { name: 'Lumbini Sacred Garden', altitude: 150, theme: 'culture', duration: 5, region: 'Rupandehi' },
  { name: 'Langtang Valley Trail', altitude: 3870, theme: 'trek', duration: 9, region: 'Rasuwa' },
  { name: 'Manaslu Circuit Trek', altitude: 5106, theme: 'trek', duration: 15, region: 'Gorkha' }
];

export default function LandingPage() {
  const router = useRouter();
  const { currentUser } = useTravelStore();

  // Dynamic Planner States
  const [selectedDest, setSelectedDest] = useState<any>(DESTINATIONS_LIST[2]); // Annapurna default
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [extraDays, setExtraDays] = useState(0);
  const [supportTier, setSupportTier] = useState<'permits' | 'standard' | 'luxury'>('standard');

  const handleEnterApp = () => {
    if (currentUser?.loggedIn && currentUser?.otpVerified) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const handleSignup = () => {
    if (currentUser?.loggedIn && currentUser?.otpVerified) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };

  const handleDashboard = () => {
    router.push('/dashboard');
  };

  // Helper variables derived from selected destination & extra days
  const totalDuration = (selectedDest?.duration || 10) + extraDays;
  const targetAltitude = selectedDest?.altitude || 1000;
  const activeActivity = selectedDest?.theme || 'trek';

  // Dynamic Trip Customizer Calculators
  const calculateEstimate = () => {
    let baseRate = 80; // USD per day base
    if (activeActivity === 'climb') baseRate = 220;
    if (activeActivity === 'safari') baseRate = 110;
    if (activeActivity === 'culture') baseRate = 95;

    let tierMultiplier = 1;
    if (supportTier === 'permits') tierMultiplier = 0.35;
    if (supportTier === 'luxury') tierMultiplier = 1.95;

    // High altitude premiums
    const altitudePremium = targetAltitude > 5000 ? 350 : targetAltitude > 3000 ? 120 : 0;

    return Math.round((baseRate * totalDuration * tierMultiplier) + altitudePremium);
  };

  const getRequiredPermits = () => {
    if (activeActivity === 'climb') {
      return ["Government Climbing Royalty", "Sagarmatha Park Entry", "TIMS Registration Card"];
    }
    if (activeActivity === 'trek') {
      return targetAltitude > 4000
        ? ["Sagarmatha Conservation Area Permit (SCA)", "Local Route Card", "TIMS Registration Card"]
        : ["Annapurna Conservation Area Permit (ACA)", "TIMS Card"];
    }
    if (activeActivity === 'safari') {
      return ["Chitwan Park Access Permit", "Community Forest License", "Jungle Guide Clearance"];
    }
    return ["Kathmandu Heritage Pass", "Lumbini Sacred Garden Card"];
  };

  const getSafetyGuideline = () => {
    if (targetAltitude > 5000) {
      return {
        level: "Extreme Altitude Precautions",
        color: "text-rose-600 bg-rose-50 border-rose-200/50",
        message: "Mandatory acclimation days and 1:1 certified Sherpa guide coverage required."
      };
    }
    if (targetAltitude > 3000) {
      return {
        level: "Moderate High Altitude Guidelines",
        color: "text-[#A67848] bg-[#FAF3E3] border-[#C29367]/20",
        message: "Acclimatization recommended. Standard hydration and trail mapping maps issued."
      };
    }
    return {
      level: "Safe Low Altitude Trails",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200/50",
      message: "No specific altitude restrictions. Highly recommended for families."
    };
  };

  const getPackageTier = () => {
    if (supportTier === 'luxury') return 'Luxury';
    if (supportTier === 'standard') return 'Premium';
    return 'Standard';
  };

  const getDurationAdvice = () => {
    if (supportTier === 'luxury' && totalDuration < 14) {
      return {
        type: 'warning',
        text: '👑 Luxury Expedition: We recommend extending your trip duration (e.g. to at least 14 days) to ensure proper altitude acclimatization and helicopter support access.'
      };
    }
    if (supportTier === 'standard' && totalDuration < 10) {
      return {
        type: 'info',
        text: '⭐ Premium Tier: We recommend extending your trip duration (e.g. to at least 10 days) to fully cover all valley trail coordinates safely.'
      };
    }
    return null;
  };

  // Stagger animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#FDFBF7] text-[#3D2D27] font-sans selection:bg-[#C29367] selection:text-white flex flex-col relative overflow-x-hidden"
    >

      {/* ─── STICKY HEADER ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/85 backdrop-blur-md border-b border-[#3D2D27]/8 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shadow-xs select-none">
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)', boxShadow: '0 2px 8px rgba(194,147,103,0.35)' }}
            className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-sm text-white cursor-pointer"
          >
            N
          </motion.div>
          <span className="text-xs font-mono tracking-widest uppercase font-bold text-[#3D2D27]">
            Visit Nepal
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono uppercase tracking-wider font-bold text-[#7A6258]">
          <a href="#highlights" className="hover:text-[#C29367] transition-colors relative group">
            <span>Highlights</span>
            <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-[#C29367] transition-all group-hover:w-full" />
          </a>
          <a href="#packages" className="hover:text-[#C29367] transition-colors relative group">
            <span>Expedition Themes</span>
            <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-[#C29367] transition-all group-hover:w-full" />
          </a>
          <a href="#customizer" className="hover:text-[#C29367] transition-colors relative group">
            <span>Trip Customizer</span>
            <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-[#C29367] transition-all group-hover:w-full" />
          </a>
          <a href="#destinations" className="hover:text-[#C29367] transition-colors relative group">
            <span>Trails</span>
            <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-[#C29367] transition-all group-hover:w-full" />
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleEnterApp}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-mono font-bold border border-[#3D2D27]/12 text-[#7A6258] hover:text-[#3D2D27] hover:bg-[#FAF3E3]/40 transition-all cursor-pointer hover:scale-[1.01] active:scale-98"
          >
            {currentUser?.loggedIn && currentUser?.otpVerified ? 'My Account' : 'Sign In'}
          </button>

          <button
            onClick={handleSignup}
            style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider text-white hover:opacity-95 transition-all shadow-[0_4px_12px_rgba(194,147,103,0.22)] cursor-pointer hover:scale-[1.01] active:scale-98"
          >
            Create Profile
          </button>
        </div>
      </header>

      {/* ─── HERO BANNER ─────────────────────────────────────────────────── */}
      <section className="relative h-[82vh] w-full bg-[#3D2D27] overflow-hidden flex items-center select-none">
        <motion.img
          initial={{ scale: 1.08, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600"
          alt="Annapurna Range at Sunrise"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.75]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-black/30" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center gap-6 text-white py-16"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 bg-[#FCF9F2]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg text-[#3D2D27] scale-95"
          >
            <Compass className="h-4 w-4 text-[#C29367] animate-spin-slow" />
            <span className="text-[9.5px] font-mono font-black tracking-widest uppercase">THE HIMALAYAN EXPEDITION PORTAL</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] max-w-4xl text-[#FAF8F5]"
          >
            Discover the Majesty of the<br />
            <span className="bg-[#C29367] bg-clip-text text-transparent bg-gradient-to-r from-[#EBD6BC] to-[#C29367]">
              Himalayan Peaks.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base text-[#FAF8F5]/85 max-w-2xl leading-relaxed font-medium"
          >
            Acquire national park permits online, connect directly with certified local guides, and manage stays in high-altitude tea houses within our interactive digital console.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3.5 mt-4 w-full sm:w-auto"
          >
            <button
              onClick={handleDashboard}
              style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
              className="px-8 py-4 rounded-xl text-xs font-mono font-black uppercase tracking-wider text-white hover:opacity-95 shadow-xl hover:shadow-[0_5px_22px_rgba(194,147,103,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-98"
            >
              <span>Explore Interactive Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <a
              href="#customizer"
              className="px-8 py-4 rounded-xl text-xs font-mono font-bold bg-white/10 backdrop-blur-md border border-white/25 text-[#FAF8F5] hover:bg-white/15 hover:scale-[1.01] active:scale-98 transition-all text-center"
            >
              Customize Your Trip
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── HIGHLIGHTS SECTION ───────────────────────────────────────────── */}
      <section id="highlights" className="py-20 px-6 max-w-7xl mx-auto w-full text-center scroll-mt-10">
        <div className="flex flex-col items-center gap-2.5 mb-14">
          <span className="text-[10px] font-mono font-black text-[#C29367] uppercase tracking-widest bg-[#FAF3E3] px-3.5 py-1.5 rounded-full">
            Key Features
          </span>
          <h2 className="text-3xl font-black text-[#3D2D27] tracking-tight mt-1">
            Redefining Travel in Nepal
          </h2>
          <p className="text-xs text-[#7A6258] max-w-md font-medium leading-relaxed">
            Everything you need for a secure, culturally rich, and breathtaking expedition across Nepal's conserved regions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            {
              icon: <Map className="h-5 w-5" />,
              title: 'Interactive Route Mapping',
              desc: 'Customize itineraries with live waypoint telemetry, elevation checks, and localized detour options.'
            },
            {
              icon: <Users className="h-5 w-5" />,
              title: 'Certified Guides & Sherpas',
              desc: 'Communicate directly via satellite messengers with licensed local experts before and during your trek.'
            },
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              title: 'Digital Permit Management',
              desc: 'Submit and track TIMS cards and Sagarmatha/Annapurna entry permits online through official links.'
            },
            {
              icon: <Hotel className="h-5 w-5" />,
              title: 'Heritage Lodges & Stays',
              desc: 'Book verified authentic lodges, eco-lodges, and valley stays, filtering by elevation and heating facilities.'
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
              whileHover={{ y: -4, borderColor: 'rgba(194,147,103,0.45)' }}
              className="bg-white border border-[#3D2D27]/8 rounded-3xl p-6.5 transition-all flex flex-col gap-4 shadow-sm group cursor-pointer"
            >
              <div className="h-10 w-10 bg-[#FAF3E3] rounded-2xl flex items-center justify-center text-[#C29367] shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-black text-[#3D2D27] flex items-center gap-1">
                  <span>{item.title}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#C29367] opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-[11.5px] text-[#7A6258] leading-relaxed mt-1.5 font-medium">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── NEW: EXPEDITION & TRAVEL PACKAGES ────────────────────────────── */}
      <section id="packages" className="py-20 px-6 max-w-7xl mx-auto w-full text-center border-t border-[#3D2D27]/8 scroll-mt-10">
        <div className="flex flex-col items-center gap-2.5 mb-14">
          <span className="text-[10px] font-mono font-black text-[#C29367] uppercase tracking-widest bg-[#FAF3E3] px-3.5 py-1.5 rounded-full">
            Expedition Themes
          </span>
          <h2 className="text-3xl font-black text-[#3D2D27] tracking-tight mt-1">
            Choose Your Travel Package
          </h2>
          <p className="text-xs text-[#7A6258] max-w-md font-medium leading-relaxed">
            Select a verified Himalayan trip theme tailored to your goals. Each package includes dedicated local safety assets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            {
              icon: <Mountain className="h-5 w-5 text-[#C29367]" />,
              image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400",
              title: "Mountaineering Peaks",
              desc: "Summit climbs including Ama Dablam, Island Peak, and Mt. Everest. Guided by certified IFMGA/local Sherpas.",
              tags: ["1:1 Sherpa Guide", "O2 Support", "Satellite Comm"],
              price: "From $3,400"
            },
            {
              icon: <Milestone className="h-5 w-5 text-[#C29367]" />,
              image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=400",
              title: "Trekking & Wilderness",
              desc: "Classical high-altitude valley routes like Annapurna Circuit, Langtang, and Manaslu Wilderness treks.",
              tags: ["Teahouse Permits", "Porters Included", "Acclimation Focus"],
              price: "From $1,200"
            },
            {
              icon: <Trees className="h-5 w-5 text-[#C29367]" />,
              image: "https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=400",
              title: "Wildlife & Jungle Safaris",
              desc: "Deep exploration of sub-tropical reserves in Chitwan and Bardia. Track Tigers and one-horned rhinos.",
              tags: ["Canoe Trips", "Eco Jungle Lodges", "Expert Naturalists"],
              price: "From $850"
            },
            {
              icon: <Compass className="h-5 w-5 text-[#C29367]" />,
              image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=400",
              title: "Cultural & Religious Shrines",
              desc: "Immersive paths exploring ancient heritage shrines in Kathmandu Valley and Buddhist birthplace Lumbini.",
              tags: ["Local Artisan Tours", "UNESCO Guides", "Heritage Homestays"],
              price: "From $750"
            }
          ].map((pkg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
              whileHover={{ y: -6, borderColor: 'rgba(194,147,103,0.4)' }}
              className="bg-white border border-[#3D2D27]/8 rounded-[28px] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="h-40 w-full relative overflow-hidden bg-[#3D2D27]">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-[#FAF8F5]/95 backdrop-blur-md border border-[#3D2D27]/6 p-2 rounded-xl flex items-center justify-center shadow-md">
                  {pkg.icon}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white font-mono text-[9px] font-black uppercase">
                  {pkg.price}
                </div>
              </div>

              <div className="p-5.5 flex flex-col flex-1 gap-3.5 justify-between">
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-black text-[#3D2D27]">{pkg.title}</h3>
                  <p className="text-[11px] text-[#7A6258] leading-relaxed font-medium">{pkg.desc}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {pkg.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded-full bg-[#FAF3E3] border border-[#C29367]/15 text-[8.5px] font-mono font-bold text-[#A67848] uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={handleSignup}
                  className="text-[10px] font-mono font-black text-[#C29367] hover:text-[#3D2D27] transition-colors flex items-center gap-1.5 pt-2 border-t border-[#3D2D27]/6 group/btn mt-1 cursor-pointer"
                >
                  <span>Select Expedition Theme</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── NEW: INTERACTIVE TRIP CUSTOMIZER ────────────────────────────── */}
      <section id="customizer" className="py-20 bg-[#FAF8F5] border-t border-b border-[#3D2D27]/8 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row gap-12 items-start">

          {/* Left Panel: Digital Expedition Manifesto Card (Live Receipt) */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-6 flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-2 mb-2">
              <span className="text-[10px] font-mono font-black text-[#C29367] uppercase tracking-widest bg-[#FAF3E3] px-3.5 py-1.5 rounded-full w-fit">
                Trip Customizer
              </span>
              <h2 className="text-3xl font-black text-[#3D2D27] tracking-tight leading-tight mt-1">
                Customize & Build Your Himalayan Itinerary
              </h2>
              <p className="text-xs text-[#7A6258] leading-relaxed font-medium mt-1">
                Select your destinations, altitude coordinates, and custom days. Our registry auto-calculates legal permits and safety parameters matching your specs.
              </p>
            </div>

            {/* Premium receipt container */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1D1612 0%, #120C09 100%)',
                border: '1px solid rgba(194,147,103,0.3)'
              }}
              className="rounded-3xl p-6 text-white shadow-2xl flex flex-col gap-5 relative overflow-hidden"
            >
              {/* Top receipt header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <span className="text-[8px] font-mono font-black text-[#C29367] uppercase tracking-wider block">Manifesto Draft</span>
                  <span className="text-xs font-mono font-black uppercase text-[#FAF3E3]">EXPEDITION REGISTRY</span>
                </div>
                <div className="px-2.5 py-1 rounded bg-[#C29367]/10 border border-[#C29367]/30 text-[#C29367] font-mono text-[9px] font-black uppercase">
                  {getPackageTier()} Package
                </div>
              </div>

              {/* Destination & Altitude Info */}
              <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                <span className="text-[8px] font-mono text-[#A89286] uppercase tracking-wider">Target Coordinates:</span>
                <span className="text-sm font-black text-[#FAF3E3]">{selectedDest?.name || 'Custom Himalayan Route'}</span>
                <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-white/70">
                  <span>Target Altitude:</span>
                  <span className="text-[#C29367] font-bold">{targetAltitude}m</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-white/70">
                  <span>Region Context:</span>
                  <span>{selectedDest?.region || 'Nepal'}</span>
                </div>
              </div>

              {/* Duration details */}
              <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
                <span className="text-[8px] font-mono text-[#A89286] uppercase tracking-wider">Itinerary Duration:</span>
                <div className="flex justify-between items-center text-xs font-mono text-[#FAF3E3]">
                  <span>Base Duration:</span>
                  <span>{selectedDest?.duration || 10} Days</span>
                </div>
                {extraDays > 0 && (
                  <div className="flex justify-between items-center text-xs font-mono text-emerald-400">
                    <span>Accclimatization Ext:</span>
                    <span>+{extraDays} Days</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs font-bold font-mono text-[#C29367] pt-1.5 border-t border-white/5">
                  <span>Total Duration:</span>
                  <span>{totalDuration} Days</span>
                </div>
              </div>

              {/* Legal permits requirements */}
              <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
                <span className="text-[8px] font-mono text-[#A89286] uppercase tracking-wider">Required Permits ({getRequiredPermits().length}):</span>
                <div className="flex flex-col gap-1.5">
                  {getRequiredPermits().map((p, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2 text-[10.5px] text-white/80 font-medium">
                      <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculated price */}
              <div className="flex justify-between items-baseline pt-2">
                <span className="text-[9px] font-mono text-[#A89286] uppercase tracking-wider">Calculated Estimate:</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#FAF3E3]">${calculateEstimate()}</span>
                  <span className="text-[7.5px] font-mono text-[#C29367] block tracking-wide">USD EST. TOTAL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Interactive Builder Console */}
          <div className="flex-1 w-full">
            <div
              style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #FAF9F6 100%)',
                border: '1px solid rgba(61,45,39,0.12)',
                boxShadow: '0 20px 50px rgba(61,45,39,0.06)'
              }}
              className="p-6 sm:p-8 rounded-[32px] text-left flex flex-col gap-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#3D2D27]/8">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4.5 w-4.5 text-[#C29367]" />
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-[#3D2D27]">Console Configurator</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#A89286] uppercase">Draft Specs</span>
              </div>

              {/* Step 1: Destination Autocomplete Search */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-[9.5px] uppercase font-mono text-[#7A6258] tracking-wider font-black flex justify-between items-center">
                  <span>1. Destination Search</span>
                  {selectedDest && (
                    <span className="text-[8.5px] font-bold text-emerald-600 font-sans flex items-center gap-0.5 animate-pulse">
                      📍 {selectedDest.name} Selected
                    </span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C29367] pointer-events-none">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 250)}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    placeholder="Search where you want to go... (e.g. Everest, Pokhara)"
                    className="w-full bg-white border border-[#3D2D27]/12 focus:border-[#C29367] rounded-xl pl-11 pr-4 py-3 text-xs text-[#3D2D27] font-semibold focus:outline-none transition-all placeholder-[#7A6258]/35 shadow-inner focus:ring-2 focus:ring-[#C29367]/8"
                  />
                </div>

                {/* Autocomplete Dropdown list */}
                {showDropdown && searchQuery && (
                  <div className="absolute top-[100%] left-0 right-0 z-30 mt-1 bg-white border border-[#3D2D27]/12 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-[#3D2D27]/5">
                    {(() => {
                      const matches = DESTINATIONS_LIST.filter(dest =>
                        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        dest.region.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                      return matches.length > 0 ? (
                        matches.map((dest, dIdx) => (
                          <button
                            key={dIdx}
                            type="button"
                            onMouseDown={() => {
                              setSelectedDest(dest);
                              setSearchQuery(dest.name);
                              setExtraDays(0);
                              setShowDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 hover:bg-[#FAF3E3]/40 text-left flex justify-between items-center transition-all cursor-pointer border-0"
                          >
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-[#3D2D27]">{dest.name}</span>
                              <span className="text-[8px] font-mono text-[#A89286] font-bold uppercase">{dest.region} • {dest.theme.toUpperCase()}</span>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-[#C29367]">{dest.altitude}m</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-[10px] text-[#7A6258] font-medium font-sans">
                          No matches found. Select a quick package below!
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Popular Quick Suggestions list */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {DESTINATIONS_LIST.map((dest, idx) => {
                    const isCurrent = selectedDest?.name === dest.name;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedDest(dest);
                          setSearchQuery(dest.name);
                          setExtraDays(0);
                        }}
                        className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer border \${
                          isCurrent 
                            ? 'bg-[#C29367] text-white border-[#C29367]' 
                            : 'bg-white text-[#7A6258] border-[#3D2D27]/8 hover:border-[#3D2D27]/15'
                        }`}
                      >
                        + {dest.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Lock Target Altitude from Database */}
              <div className="flex flex-col gap-2">
                <label className="text-[9.5px] uppercase font-mono text-[#7A6258] tracking-wider font-black">2. Target Altitude (Database Locked)</label>
                <div className="bg-white border border-[#3D2D27]/8 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mountain className="h-5 w-5 text-[#C29367] shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-[#3D2D27]">{targetAltitude} Meters</span>
                      <span className="text-[8px] text-[#7A6258]/80 block leading-none mt-0.5">Preconfigured Summit elevation inside regional databases.</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8px] font-mono font-bold uppercase tracking-wider border border-emerald-100/50">
                    LOCKED DATA
                  </span>
                </div>
              </div>

              {/* Step 3: Trip Duration Extension */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                  <label className="text-[9.5px] uppercase font-mono text-[#7A6258] tracking-wider font-black">3. Extension Options (Extra Days)</label>
                  <span className="text-[10.5px] font-bold text-[#C29367] font-mono">
                    {selectedDest?.duration || 10} Days Base + {extraDays} Extended
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { label: 'Standard', value: 0 },
                    { label: '+1 Day', value: 1 },
                    { label: '+2 Days', value: 2 },
                    { label: '+3 Days', value: 3 },
                    { label: '+4 Days', value: 4 }
                  ].map((opt) => {
                    const isActive = extraDays === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setExtraDays(opt.value)}
                        className={`py-2.5 rounded-xl border text-center font-mono text-[10px] font-bold transition-all cursor-pointer \${
                          isActive 
                            ? 'border-[#C29367] bg-[#FAF3E3] text-[#A67848]' 
                            : 'border-[#3D2D27]/8 bg-white text-[#7A6258] hover:border-[#3D2D27]/15'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <span className="text-[8.5px] text-[#A89286] font-medium leading-relaxed">
                  * Travelers can extend their itinerary by 1, 2, 3, or 4 days to customize acclimatization plans and add auxiliary local side treks.
                </span>
              </div>

              {/* Step 4: Support Tier selection */}
              <div className="flex flex-col gap-2">
                <label className="text-[9.5px] uppercase font-mono text-[#7A6258] tracking-wider font-black">4. Select Support Level</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'permits', label: 'Permits Only', desc: 'Independent walking' },
                    { id: 'standard', label: 'Standard Support', desc: 'Guide + Permits' },
                    { id: 'luxury', label: 'Full Expedition', desc: 'Guide, Porters & Heli' }
                  ].map((tier) => {
                    const isActive = supportTier === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSupportTier(tier.id as any)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all cursor-pointer \${
                          isActive 
                            ? 'border-[#C29367] bg-[#FAF3E3]/40' 
                            : 'border-[#3D2D27]/8 bg-white hover:border-[#3D2D27]/15'
                        }`}
                      >
                        <span className={`text-[9.5px] font-black font-mono uppercase tracking-wide \${isActive ? 'text-[#C29367]' : 'text-[#3D2D27]'}`}>
                          {tier.label}
                        </span>
                        <span className="text-[7.5px] text-[#7A6258]/80 leading-none">
                          {tier.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Safety Guideline Alert Block */}
              <div className={`p-3 rounded-xl border text-[10.5px] leading-relaxed font-semibold transition-all \${getSafetyGuideline().color}`}>
                <div className="font-mono text-[9px] font-black uppercase tracking-wider mb-0.5">
                  🛡️ {getSafetyGuideline().level}
                </div>
                <span>{getSafetyGuideline().message}</span>
              </div>

              {/* Dynamic Duration Advice (Luxury/Premium extensions) */}
              {getDurationAdvice() && (
                <div className={`p-3 rounded-xl border text-[10.5px] leading-relaxed font-semibold transition-all \${
                  getDurationAdvice()?.type === 'warning'
                    ? 'text-amber-800 bg-amber-50 border-amber-200/50'
                    : 'text-[#1e3a8a] bg-blue-50 border-blue-200/50'
                }`}>
                  <div className="font-mono text-[9px] font-black uppercase tracking-wider mb-0.5">
                    💡 Package Extension Suggestion
                  </div>
                  <span>{getDurationAdvice()?.text}</span>
                </div>
              )}

              {/* CTA Apply custom trip to signup */}
              <button
                onClick={() => {
                  // Save specs in state and push to signup
                  localStorage.setItem('nepal_custom_trip', JSON.stringify({
                    destination: selectedDest?.name || 'Custom Himalayan Route',
                    theme: activeActivity,
                    duration: totalDuration,
                    altitude: targetAltitude,
                    support: supportTier,
                    tier: getPackageTier(),
                    cost: calculateEstimate()
                  }));
                  router.push('/signup');
                }}
                style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
                className="w-full py-3.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider text-white hover:opacity-95 transition-all shadow-[0_4px_12px_rgba(194,147,103,0.22)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-98"
              >
                <span>Lock Custom Specs & Register Profile</span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          </div>

        </div>
      </section>
      {/* ─── FEATURED DESTINATIONS ───────────────────────────────────────── */}
      <section id="destinations" className="py-20 bg-[#FAF8F5] border-y border-[#3D2D27]/6 scroll-mt-10 select-none">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="flex flex-col gap-2.5 text-left">
              <span className="text-[10px] font-mono font-black text-[#C29367] uppercase tracking-widest bg-[#FAF3E3] px-3.5 py-1.5 rounded-full w-fit">
                Explore Destinations
              </span>
              <h2 className="text-3xl font-black text-[#3D2D27] tracking-tight mt-1">
                Featured Himalayan Trails
              </h2>
            </div>
            <p className="text-xs text-[#7A6258] max-w-sm mt-3 md:mt-0 leading-relaxed font-medium text-left">
              From the extreme height of Mount Everest Base Camp to the subtropical lake views of Pokhara, select your next trail coordinates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Khumbu region / Mount Everest',
                desc: 'Trek the legendary pathway of Namche Bazaar and Tengboche, reaching the base camp of the world\'s highest peak.',
                image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600',
                elevation: '5,364m Base'
              },
              {
                title: 'Annapurna Conservation Area',
                desc: 'A gorgeous trek featuring deep rhododendron forests, hot springs, and high-altitude lakes surrounded by giant snow caps.',
                image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600',
                elevation: '4,130m Base'
              },
              {
                title: 'Pokhara Adventure Valley',
                desc: 'The gateway to paragliding, tranquility, and boating on Phewa Lake, backdropped by the Machhapuchhre fish-tail peak.',
                image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600',
                elevation: '822m altitude'
              }
            ].map((dest, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="bg-white border border-[#3D2D27]/8 rounded-3xl overflow-hidden hover:shadow-md transition-all flex flex-col text-left group"
              >
                <div className="h-48 relative overflow-hidden bg-[#3D2D27]">
                  <img
                    src={dest.image}
                    alt={dest.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4.5 right-4.5 bg-[#FAF8F5]/95 backdrop-blur-md border border-[#3D2D27]/8 px-2.5 py-1 rounded-lg font-mono text-[9px] text-[#3D2D27] font-black uppercase">
                    {dest.elevation}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1 gap-2.5 justify-between">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-sm font-black text-[#3D2D27]">{dest.title}</h3>
                    <p className="text-[11.5px] text-[#7A6258] leading-relaxed font-medium">{dest.desc}</p>
                  </div>
                  <button
                    onClick={handleDashboard}
                    className="text-[10px] font-mono font-bold text-[#C29367] hover:text-[#3D2D27] transition-colors flex items-center gap-1.5 mt-2.5 self-start cursor-pointer group/btn"
                  >
                    <span>Request Entry Permit</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SAFETY NETWORK ──────────────────────────────────────────────── */}
      <section id="about" className="py-20 px-6 max-w-7xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-tr from-[#3D2D27] to-[#5C463C] rounded-[32px] p-8 md:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8 select-none text-left relative overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-lg flex flex-col gap-3.5">
            <div className="flex items-center gap-2 text-[#C29367] font-mono text-[9px] tracking-widest font-black uppercase">
              <Sun className="h-4.5 w-4.5 animate-spin-slow" />
              <span>Real-Time Expedition Telemetry</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#FAF8F5] leading-tight">
              Safety First, Always.
            </h2>
            <p className="text-[12px] text-[#EBD6BC]/80 leading-relaxed font-medium">
              We sync coordinates directly with satellite trail telemetry so guides, hosts, and park safety desks are permanently connected to you in real-time. Start planning your trail safely.
            </p>
          </div>

          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <button
              onClick={handleSignup}
              style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
              className="w-full md:w-auto px-8 py-4 rounded-xl text-xs font-mono font-black uppercase tracking-wider text-white hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-98"
            >
              <span>Build Travel Profile</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-[#3D2D27]/8 py-10 px-6 bg-[#FAF8F5] select-none text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-[10px] text-[#A89286] font-bold uppercase tracking-wider">
          <span>© {new Date().getFullYear()} Nepal Digital Tourism & Expedition Registry.</span>
          <div className="flex gap-4 font-bold">
            <a href="#highlights" className="hover:text-[#3D2D27] transition-colors">Safety Code</a>
            <span>•</span>
            <a href="#destinations" className="hover:text-[#3D2D27] transition-colors">Trekking Guidelines</a>
          </div>
        </div>
      </footer>

    </motion.div>
  );
}
