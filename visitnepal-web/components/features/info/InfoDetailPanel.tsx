'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTravelStore } from '@/store/useTravelStore';
import { 
  ArrowLeft, 
  MapPin, 
  Compass, 
  Activity, 
  Calendar, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  CloudSun,
  Flame,
  Bot,
  Send,
  MessageCircle,
  Clock,
  Layers,
  ShieldCheck,
  Luggage,
  TrendingUp,
  Heart,
  Plus,
  Minus,
  PlusCircle,
  Trash2,
  Mountain
} from 'lucide-react';

import OpenStreetMap from './OpenStreetMap';

import {
  INFO_REGISTRY,
  DEFAULT_ITINERARIES,
  DETOURS_DATABASE,
  getNormalizedKey,
  getGeneralItinerary,
  InfoItem,
  ItineraryStop
} from '@/app/info/[slug]/mockData';

const ExternalLink = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const COORDINATES_LOOKUP: Record<string, { lat: number; lng: number }> = {
  'mount-everest-base-camp': { lat: 27.9861, lng: 86.9226 },
  'everest-quantum-domes': { lat: 27.9818, lng: 86.8142 },
  'phewa-lake-pokhara': { lat: 28.2120, lng: 83.9536 },
  'phewa-lakeside-mirror': { lat: 28.2096, lng: 83.9587 },
  'boudhanath-stupa': { lat: 27.7215, lng: 85.3620 },
  'chitwan-wildlife-sanctuary': { lat: 27.5341, lng: 84.4503 },
  'lo-manthang-upper-mustang': { lat: 29.1833, lng: 83.9500 },
  'mustang-kingdom': { lat: 29.1824, lng: 83.9490 },
  'muktinath-temple': { lat: 28.8169, lng: 83.8717 },
  'annapurna-base-camp': { lat: 28.5300, lng: 83.8780 },
  'chitwan-river-safari': { lat: 27.5815, lng: 84.4842 },
  'upper-mustang-caves': { lat: 29.1950, lng: 83.9520 },
  'pokhara-paragliding-arena': { lat: 28.2439, lng: 83.9486 },
  'trekking': { lat: 28.5300, lng: 83.8780 },
  'mountaineering': { lat: 27.9861, lng: 86.9226 },
  'wildlife': { lat: 27.5341, lng: 84.4503 },
  'cultural': { lat: 27.7215, lng: 85.3620 },
  'ecotourism': { lat: 27.9112, lng: 84.8872 },
  'adventure': { lat: 28.2439, lng: 83.9486 }
};

const STOP_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Kathmandu': { lat: 27.7172, lng: 85.3240 },
  'Kathmandu Gateway': { lat: 27.7172, lng: 85.3240 },
  'Lukla': { lat: 27.6878, lng: 86.7314 },
  'Phakding': { lat: 27.7408, lng: 86.7114 },
  'Namche Bazaar': { lat: 27.8069, lng: 86.7140 },
  'Tengboche': { lat: 27.8360, lng: 86.7640 },
  'Dingboche': { lat: 27.8912, lng: 86.8322 },
  'Lobuche': { lat: 27.9481, lng: 86.8118 },
  'Gorak Shep': { lat: 27.9809, lng: 86.8288 },
  'Everest Base Camp': { lat: 27.9861, lng: 86.9226 },
  'Pokhara': { lat: 28.2096, lng: 83.9856 },
  'Phewa Lake': { lat: 28.2120, lng: 83.9536 },
  'Sarangkot': { lat: 28.2439, lng: 83.9486 },
  'Jomsom': { lat: 28.7845, lng: 83.7433 },
  'Kagbeni': { lat: 28.8359, lng: 83.7842 },
  'Charang': { lat: 29.0911, lng: 83.8967 },
  'Lo Manthang': { lat: 29.1833, lng: 83.9500 },
  'Tikhedhunga': { lat: 28.3512, lng: 83.7291 },
  'Ghorepani': { lat: 28.4011, lng: 83.7012 },
  'Poon Hill': { lat: 28.3999, lng: 83.6999 },
  'Chhomrong': { lat: 28.4191, lng: 83.7918 },
  'Machapuchare Base Camp': { lat: 28.5300, lng: 83.8780 },
  'Annapurna Base Camp': { lat: 28.5300, lng: 83.8780 }
};

interface InfoDetailPanelProps {
  slug: string;
  onBack?: () => void;
  rightCollapsed?: boolean;
  setRightCollapsed?: (collapsed: boolean) => void;
}

export default function InfoDetailPanel({ 
  slug, 
  onBack, 
  rightCollapsed = false, 
  setRightCollapsed 
}: InfoDetailPanelProps) {
  const router = useRouter();
  const normalizedKey = getNormalizedKey(slug);
  const data = INFO_REGISTRY[normalizedKey];

  // Customizer states
  const [isLuxury, setIsLuxury] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryStop[]>([]);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [customStopName, setCustomStopName] = useState('');
  const [customStopElevation, setCustomStopElevation] = useState('5,000m');
  const [selectedDetourIndex, setSelectedDetourIndex] = useState<number | string>('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Floating Messenger states
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [actionAlert, setActionAlert] = useState<{ message: string; contactName: string; visible: boolean }>({ message: '', contactName: '', visible: false });

  const { 
    currentUser, 
    channels, 
    activeChannelId, 
    setActiveChannelId, 
    sendMessage, 
    setTyping,
    addBooking,
    setActiveSection
  } = useTravelStore();

  const floatingChatEndRef = useRef<HTMLDivElement>(null);

  // Set default itinerary when page mounts or normalizedKey changes
  useEffect(() => {
    if (normalizedKey && DEFAULT_ITINERARIES[normalizedKey]) {
      setItinerary(JSON.parse(JSON.stringify(DEFAULT_ITINERARIES[normalizedKey])));
    } else if (data) {
      setItinerary(getGeneralItinerary(data.title, data.duration || '3 Days'));
    }
    setActiveStopIndex(0);
  }, [normalizedKey, data]);

  // Return empty container if no data is found to prevent crashing
  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center font-mono text-xs text-[#7A6258]">
        <Compass className="h-8 w-8 text-[var(--caramel)] animate-spin mb-3" />
        Loading Spotlight Registry...
      </div>
    );
  }

  const calculatedDuration = itinerary.reduce((sum, stop) => sum + stop.days, 0);
  const calculatedPrice = calculatedDuration * (isLuxury ? 580 : 110);

  // Active itinerary stop
  const activeStop = itinerary[activeStopIndex];
  
  // Calculate coordinates for OpenStreetMap view
  const baseCoords = COORDINATES_LOOKUP[normalizedKey] || { lat: 27.7172, lng: 85.3240 };
  const targetLat = activeStop ? (STOP_COORDINATES[activeStop.name]?.lat || baseCoords.lat) : baseCoords.lat;
  const targetLng = activeStop ? (STOP_COORDINATES[activeStop.name]?.lng || baseCoords.lng) : baseCoords.lng;

  const handleUpdateStopDays = (index: number, delta: number) => {
    const updated = [...itinerary];
    const newDays = Math.max(1, updated[index].days + delta);
    updated[index] = { ...updated[index], days: newDays };
    setItinerary(updated);
  };

  const handleAddDetour = () => {
    if (selectedDetourIndex === '') return;
    const detoursList = DETOURS_DATABASE[normalizedKey] || DETOURS_DATABASE['mount-everest-base-camp'] || [];
    const detour = detoursList[Number(selectedDetourIndex)];
    if (!detour) return;

    const updated = [...itinerary];
    updated.splice(activeStopIndex + 1, 0, {
      name: detour.name,
      elevation: detour.elevation,
      days: detour.days,
      description: detour.description,
      luxuryDescription: detour.luxuryDescription,
      image: detour.image,
      isCustom: true
    });
    setItinerary(updated);
    setSelectedDetourIndex('');
    setActiveStopIndex(activeStopIndex + 1);
  };

  const handleAddCustomStop = () => {
    if (!customStopName.trim()) return;
    const updated = [...itinerary];
    updated.splice(activeStopIndex + 1, 0, {
      name: customStopName,
      elevation: customStopElevation || '5,000m',
      days: 1,
      description: `A custom customized stop along the route. Explore local surroundings at your own pace.`,
      luxuryDescription: `A premium custom stop with AURA AI satellite pathfinding support and custom accommodations.`,
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600',
      isCustom: true
    });
    setItinerary(updated);
    setCustomStopName('');
    setActiveStopIndex(activeStopIndex + 1);
  };

  const handleRemoveStop = (index: number) => {
    if (itinerary.length <= 3) return;
    const updated = itinerary.filter((_, idx) => idx !== index);
    setItinerary(updated);
    setActiveStopIndex(Math.max(0, index - 1));
  };

  let currentDayOffset = 1;
  const stopDayRanges = itinerary.map((stop) => {
    const start = currentDayOffset;
    const end = currentDayOffset + stop.days - 1;
    currentDayOffset = end + 1;
    return start === end ? `Day ${start}` : `Days ${start} - ${end}`;
  });

  const handleActionAlert = (message: string, contactName: string) => {
    setActionAlert({ message, contactName, visible: true });
    setTimeout(() => {
      setActionAlert(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    sendMessage(activeChannelId, userMsg, 'user');
    setChatInput('');
    
    setTimeout(() => {
      setTyping(activeChannelId, true);
      setTimeout(() => {
        setTyping(activeChannelId, false);
        
        let replyText = "Namaste! Connecting to the central server in Kathmandu. Let me assist you shortly.";
        if (activeChannelId === 'ch-ai') {
          replyText = `AURA AI Assistant: I've processed your query about "${userMsg}" in relation to the ${data?.title || 'destination'}. Synergizing telemetry logs.`;
        } else if (activeChannelId === 'ch-g1') {
          replyText = `Nima Sherpa (Guide): Noted, Alex! I've packed the altitude safety kit. We are scheduled to start our ascent early Friday morning.`;
        } else if (activeChannelId === 'ch-s1') {
          replyText = `Shangri-La Desk: Welcome! We've updated your room oxygen levels. The robotic dinner delivery has been pre-scheduled for 7 PM.`;
        }
        sendMessage(activeChannelId, replyText, activeChannelId === 'ch-ai' ? 'ai' : 'provider');
      }, 1500);
    }, 800);
  };

  // Auto-scroll floating chat window to bottom
  useEffect(() => {
    if (floatingChatOpen) {
      floatingChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channels, floatingChatOpen, activeChannelId]);

  return (
    <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
      
      {/* Breadcrumb Info Bar */}
      <div className="flex items-center justify-between px-6 py-3 select-none relative z-10 border-b border-[var(--waffle)]/15 shadow-[0_2px_12px_rgba(61,45,39,0.03)] bg-[#FFFEFA]/75 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#A89286]">
          <span className="uppercase tracking-wider font-bold">Discover</span>
          <span className="text-[#C29367] opacity-60">/</span>
          <span className="text-[var(--caramel)] font-bold">{data.category} Spotlight</span>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--vanilla)]/75 border border-[var(--caramel)]/25 text-[10px] font-mono font-bold text-[var(--caramel)] hover:bg-[var(--caramel)] hover:text-white transition-all duration-300 cursor-pointer active:scale-95 shadow-sm"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Return</span>
          </button>
        )}
      </div>

      {/* Main Scroll Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 min-h-0 relative z-10 text-left">
        <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-16">
          
          {/* Cover Image Spotlight Frame */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full h-64 md:h-80 overflow-hidden rounded-3xl border border-[var(--waffle)]/35 shadow-lg shrink-0"
          >
            <img src={data.image} alt={data.title} className="w-full h-full object-cover animate-fade-in" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3D2D27]/90 via-black/15 to-transparent flex flex-col justify-end p-6 md:p-8">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#FFFEFA]/85 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-[var(--caramel)]" />
                {data.region ? `${data.region} Territory` : 'Nepal Landscape'}
              </span>
              <h1 className="text-2xl md:text-3.5xl font-black text-white mt-1 text-shadow-sm leading-tight tracking-tight">
                {data.title}
              </h1>
              <p className="text-xs md:text-sm text-white/90 font-medium font-sans mt-2 max-w-2xl leading-relaxed">
                {data.subtitle}
              </p>
            </div>
          </motion.div>

          {/* Flat Horizontal Telemetry Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-4 md:gap-y-0 py-4 border-y border-[var(--waffle)]/15">
            {/* Altitude */}
            <div className="flex items-center gap-2.5 px-3 md:border-r border-[var(--waffle)]/12">
              <Mountain className="h-4.5 w-4.5 text-amber-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-[7.5px] font-mono uppercase tracking-widest text-[#A89286] block leading-none">Altitude Peak</span>
                <span className="text-xs font-black text-[#3D2D27] mt-1.5 block leading-none truncate">{data.elevation || '5,364 m'}</span>
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-2.5 px-3 md:border-r border-[var(--waffle)]/12">
              <Activity className="h-4.5 w-4.5 text-rose-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-[7.5px] font-mono uppercase tracking-widest text-[#A89286] block leading-none">Difficulty</span>
                <span className="text-xs font-black text-[#3D2D27] mt-1.5 block leading-none truncate">
                  {isLuxury ? 'VIP Assisted' : (data.difficulty || 'Challenging')}
                </span>
              </div>
            </div>

            {/* Peak Temp */}
            <div className="flex items-center gap-2.5 px-3 md:border-r border-[var(--waffle)]/12">
              <CloudSun className="h-4.5 w-4.5 text-sky-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-[7.5px] font-mono uppercase tracking-widest text-[#A89286] block leading-none">Peak Temp</span>
                <span className="text-xs font-black text-[#3D2D27] mt-1.5 block leading-none truncate">{data.weather?.temp || '-6°C'}</span>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2.5 px-3 md:border-r border-[var(--waffle)]/12">
              <Clock className="h-4.5 w-4.5 text-[var(--caramel)] shrink-0" />
              <div className="min-w-0">
                <span className="text-[7.5px] font-mono uppercase tracking-widest text-[#A89286] block leading-none">Est Duration</span>
                <span className="text-xs font-black text-[#3D2D27] mt-1.5 block leading-none font-mono">{calculatedDuration} Days</span>
              </div>
            </div>

            {/* Accommodations */}
            <div className="flex items-center gap-2.5 px-3">
              <Compass className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-[7.5px] font-mono uppercase tracking-widest text-[#A89286] block leading-none">Accommodations</span>
                <span className="text-xs font-black text-[#3D2D27] mt-1.5 block leading-none truncate">
                  {isLuxury ? 'Quantum Domes' : 'Tea Houses'}
                </span>
              </div>
            </div>
          </div>

          {/* Experience Tier Selector & Narrative - Flat */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--waffle)]/12 pb-2">
              <div className="flex flex-col text-left">
                <span className="text-[8px] font-mono uppercase tracking-widest text-[var(--caramel)] font-bold">Select Expedition Tier</span>
                <h2 className="text-sm font-black text-[#3D2D27] tracking-tight mt-0.5">Expedition Experience Style</h2>
              </div>
              
              {/* Sliding Switch */}
              <div className="relative flex items-center bg-[#FAF6EE] p-0.5 rounded-xl border border-[var(--waffle)]/35 select-none w-56 h-8 self-start sm:self-auto shrink-0">
                <div 
                  className="absolute top-0.5 bottom-0.5 rounded-lg transition-all duration-300 shadow-xs"
                  style={{
                    left: isLuxury ? '50%' : '2px',
                    right: isLuxury ? '2px' : '50%',
                    background: 'var(--caramel)'
                  }}
                />
                <button 
                  onClick={() => setIsLuxury(false)}
                  className={`flex-1 text-center text-[10px] font-black font-mono transition-colors duration-250 z-10 cursor-pointer ${!isLuxury ? 'text-white' : 'text-[#7A6258] hover:text-[#3D2D27]'}`}
                >
                  Classic Trek
                </button>
                <button 
                  onClick={() => setIsLuxury(true)}
                  className={`flex-1 text-center text-[10px] font-black font-mono transition-colors duration-250 z-10 cursor-pointer ${isLuxury ? 'text-white' : 'text-[#7A6258] hover:text-[#3D2D27]'}`}
                >
                  Luxury
                </button>
              </div>
            </div>

            {/* Editorial Narrative */}
            <div className="flex flex-col gap-3 text-left font-sans text-xs md:text-sm leading-relaxed text-[#5C463C]">
              <p className="text-xs md:text-sm font-semibold italic text-[var(--caramel)] leading-relaxed border-l-3 border-[var(--caramel)]/50 pl-3 py-0.5">
                {isLuxury 
                  ? "Step into the ultimate realm of high-altitude adventure. A curated, oxygen-pressurized sky expedition designed for safety, comfort, and breathtaking access."
                  : data.description
                }
              </p>
              <p className="text-xs md:text-sm">
                {isLuxury 
                  ? "The luxury route utilizes private heli-charters, custom hyperbaric dome accommodations, and advanced telemetry to ensure a seamless acclimation curve. Guided by master Sherpa pathfinders, you will experience the majesty of Sagarmatha without the severe physical toll of standard ascents."
                  : data.details
                }
              </p>
              {isLuxury && (
                <div className="text-[10px] text-[#7A6258] font-medium bg-[#FAF6EE] px-3 py-2 rounded-lg border border-[var(--waffle)]/20 mt-1 inline-flex items-center gap-1.5">
                  <span>🔒 Inclusive perks: Private heli airport shuttling, customized bio-oxygen flow, and exclusive access to remote ancient archives.</span>
                </div>
              )}
            </div>
          </div>

          {/* Route Pathfinder & Itinerary Customizer - Flat */}
          <div className="flex flex-col gap-4 border-t border-[var(--waffle)]/15 pt-6 text-left">
            <div className="flex flex-col text-left">
              <span className="text-[8px] font-mono uppercase tracking-widest text-[var(--caramel)] font-bold">Interactive Pathfinder</span>
              <h2 className="text-sm font-black text-[#3D2D27] tracking-tight mt-0.5">Route Customizer & Day Extender</h2>
              <p className="text-[11px] text-[#7A6258] mt-0.5">
                Select stops along the route. Extend stays at key altitudes to optimize acclimatization, or insert scenic detours.
              </p>
            </div>

            {/* Flat Sparkline Telemetry */}
            <div className="flex flex-col gap-2 py-2 border-b border-[var(--waffle)]/12">
              <div className="flex items-center justify-between">
                <span className="text-[7.5px] font-mono uppercase tracking-widest text-[#A89286] font-bold">Live Flight Profile Telemetry</span>
                <span className="text-[8px] font-mono text-[#A89286] bg-[var(--vanilla)] border border-[var(--waffle)]/20 px-2 py-0.5 rounded">
                  Max Alt: {Math.max(...itinerary.map(s => {
                    const val = parseInt(s.elevation.replace(/[^0-9]/g, ''), 10);
                    return isNaN(val) ? 0 : val;
                  }))}m
                </span>
              </div>
              
              <div className="h-16 w-full relative bg-[#FAF6EE]/40 border border-[var(--waffle)]/12 rounded-xl overflow-hidden px-4 py-2 flex items-end">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="elevation-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--caramel)" stopOpacity="0.20" />
                      <stop offset="100%" stopColor="var(--caramel)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const elevations = itinerary.map(s => {
                      const val = parseInt(s.elevation.replace(/[^0-9]/g, ''), 10);
                      return isNaN(val) ? 1400 : val;
                    });
                    const maxElev = Math.max(...elevations, 5500);
                    const minElev = Math.min(...elevations, 800) - 200;
                    const range = maxElev - minElev;
                    
                    const points = elevations.map((el, i) => {
                      const x = (i / (elevations.length - 1)) * 100;
                      const y = 100 - ((el - minElev) / (range || 1)) * 80 - 10;
                      return { x, y, name: itinerary[i].name, alt: el };
                    });
                    
                    const dPath = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x}% ${pt.y}%`).join(' ');
                    const dArea = `${dPath} L 100% 100% L 0% 100% Z`;
                    
                    return (
                      <>
                        <path d={dArea} fill="url(#elevation-gradient)" className="transition-all duration-300" />
                        <path d={dPath} fill="none" stroke="var(--caramel)" strokeWidth="2" className="transition-all duration-300" />
                        {points.map((pt, idx) => {
                          const isActive = idx === activeStopIndex;
                          return (
                            <g key={idx} className="cursor-pointer" onClick={() => setActiveStopIndex(idx)}>
                              <circle 
                                cx={`${pt.x}%`} 
                                cy={`${pt.y}%`} 
                                r={isActive ? 5.5 : 3.5} 
                                fill={isActive ? '#3D2D27' : 'var(--caramel)'}
                                stroke={isActive ? 'var(--caramel)' : 'white'}
                                strokeWidth={isActive ? 1.5 : 1}
                                className="transition-all duration-300"
                              />
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>
              <div className="flex justify-between px-1 text-[7px] font-mono text-[#A89286] font-bold">
                <span className="truncate max-w-[60px]">{itinerary[0]?.name}</span>
                <span className="text-center truncate max-w-[100px]">{itinerary[Math.floor(itinerary.length / 2)]?.name}</span>
                <span className="text-right truncate max-w-[60px]">{itinerary[itinerary.length - 1]?.name}</span>
              </div>
            </div>

            {/* Customizer Split Grid Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start mt-2">
              
              {/* Left Column (Timeline nodes list) */}
              <div className="lg:col-span-2 flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                <div className="flex items-center justify-between border-b border-[var(--waffle)]/12 pb-1.5 sticky top-0 bg-[#FFFEFA] z-10">
                  <span className="text-[8.5px] font-mono uppercase text-[#8C766C] font-bold">Expedition Stations</span>
                  <span className="text-[8px] font-mono bg-[var(--vanilla)] border border-[var(--waffle)]/20 px-2 py-0.5 rounded text-[var(--caramel)] font-bold">
                    {itinerary.length} Stations
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {itinerary.map((stop, index) => {
                    const isActive = index === activeStopIndex;
                    const isCustom = stop.isCustom;
                    const dayRange = stopDayRanges[index];
                    
                    return (
                      <div 
                        key={index}
                        onClick={() => setActiveStopIndex(index)}
                        className={`group flex items-center justify-between p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isActive 
                            ? 'bg-[#FAF6EE] border-[var(--caramel)] shadow-xs' 
                            : 'bg-white border-[var(--waffle)]/20 hover:border-[var(--caramel)]/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Day index badge */}
                          <div className={`h-7 w-7 rounded-lg flex flex-col items-center justify-center shrink-0 text-center font-mono transition-colors ${
                            isActive 
                              ? 'bg-[var(--caramel)] text-white font-bold' 
                              : 'bg-[var(--vanilla)] text-[#7A6258]'
                          }`}>
                            <span className="text-[5.5px] uppercase tracking-wider block leading-none font-sans">Day</span>
                            <span className="text-[10px] font-black leading-none mt-0.5">{stop.days}</span>
                          </div>

                          <div className="flex flex-col text-left min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[7.5px] font-mono font-bold text-[#A89286]">{dayRange}</span>
                              {isCustom && (
                                <span className="text-[5px] font-mono bg-emerald-50 text-emerald-600 px-1 py-0.2 rounded border border-emerald-200 font-bold uppercase">Detour</span>
                              )}
                            </div>
                            <h4 className={`text-xs font-bold truncate max-w-[120px] ${isActive ? 'text-[var(--caramel)] font-black' : 'text-[#3D2D27]'}`}>
                              {stop.name}
                            </h4>
                          </div>
                        </div>

                        {/* Action controls */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => handleUpdateStopDays(index, -1)}
                            disabled={stop.days <= 1}
                            className="h-5 w-5 rounded bg-white hover:bg-[#FAF6EE] text-[#3D2D27] flex items-center justify-center font-bold text-[9px] border border-[var(--waffle)]/20 cursor-pointer disabled:opacity-40"
                          >
                            <Minus className="h-2 w-2" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStopDays(index, 1)}
                            className="h-5 w-5 rounded bg-white hover:bg-[#FAF6EE] text-[#3D2D27] flex items-center justify-center font-bold text-[9px] border border-[var(--waffle)]/20 cursor-pointer"
                          >
                            <Plus className="h-2 w-2" />
                          </button>
                          {itinerary.length > 3 && (
                            <button 
                              onClick={() => handleRemoveStop(index)}
                              className="h-5 w-5 rounded bg-white hover:bg-rose-50 text-rose-500 flex items-center justify-center border border-[var(--waffle)]/20 cursor-pointer group-hover:opacity-100 opacity-80"
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column (Timeline edit form & details) */}
              <div className="lg:col-span-3 flex flex-col gap-3.5 border-l border-[var(--waffle)]/12 lg:pl-5 text-left min-h-[380px]">
                {activeStop ? (
                  <div className="flex flex-col gap-3.5 animate-fade-in" key={activeStopIndex}>
                    <div className="border-b border-[var(--waffle)]/12 pb-2">
                      <span className="text-[7.5px] font-mono text-[#A89286] uppercase tracking-wider block">Selected Station Detail</span>
                      <h3 className="text-sm font-black text-[#3D2D27] mt-0.5">{activeStop.name}</h3>
                      <p className="text-[10px] text-[#7A6258] font-mono mt-0.5">
                        Elevation: <span className="font-bold">{activeStop.elevation}</span> • <span className="font-bold">{activeStop.days} Day{activeStop.days > 1 ? 's' : ''} stay</span>
                      </p>
                    </div>

                    <div className="text-xs text-[#5C463C] leading-relaxed">
                      <span className="text-[8px] font-mono text-[#A89286] uppercase tracking-wider block mb-1">Station Description</span>
                      <p className="font-medium text-[#7A6258]">
                        {isLuxury ? (activeStop.luxuryDescription || activeStop.description) : activeStop.description}
                      </p>
                    </div>

                    {/* Accommodation Selector indicator */}
                    <div className="flex items-center gap-2.5 border-t border-b border-[var(--waffle)]/10 py-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm shrink-0">
                        🏨
                      </div>
                      <div className="text-left">
                        <span className="text-[7.5px] font-mono text-[#A89286] uppercase tracking-wider block leading-none">Accommodation Tier</span>
                        <span className="text-xs font-bold text-[#3D2D27] mt-1 block leading-none">
                          {isLuxury ? 'Everest Quantum Pressurized Dome' : 'Classic Mountain Tea House'}
                        </span>
                      </div>
                    </div>

                    {/* Scenic Detour loops picker */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[8px] font-mono text-[#A89286] uppercase tracking-wider block">Insert Scenic Detour Loop</span>
                      <p className="text-[9.5px] text-[#A89286] leading-none mb-1">
                        Insert a preset high-altitude circuit or viewpoint path.
                      </p>
                      
                      <div className="flex gap-2">
                        <select
                          value={selectedDetourIndex}
                          onChange={(e) => setSelectedDetourIndex(e.target.value)}
                          className="flex-1 bg-white border border-[var(--waffle)]/35 rounded-xl px-2.5 py-1.5 text-xs text-[#3D2D27] focus:outline-none focus:border-[var(--caramel)] transition-all cursor-pointer"
                        >
                          <option value="">Choose detour loop...</option>
                          {(DETOURS_DATABASE[normalizedKey] || DETOURS_DATABASE['mount-everest-base-camp'] || []).map((detour, idx) => (
                            <option key={idx} value={idx}>{detour.name} (+{detour.days}d)</option>
                          ))}
                        </select>
                        <button
                          onClick={handleAddDetour}
                          disabled={selectedDetourIndex === ''}
                          className="px-3 py-1.5 bg-[var(--caramel)] hover:bg-[var(--caramel)]/90 text-white rounded-xl text-xs font-bold font-mono transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1"
                        >
                          <span>Insert Stop</span>
                        </button>
                      </div>
                    </div>

                    {/* Custom waypoint insertion */}
                    <div className="flex flex-col gap-1.5 border-t border-[var(--waffle)]/10 pt-3">
                      <span className="text-[8px] font-mono text-[#A89286] uppercase tracking-wider block">Insert Custom Location Node</span>
                      <p className="text-[9.5px] text-[#A89286] leading-none mb-1">
                        Add any custom waypoint coordinate to your itinerary.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                          type="text" 
                          placeholder="Station Name (e.g. Ama Dablam Viewpoint)" 
                          value={customStopName}
                          onChange={(e) => setCustomStopName(e.target.value)}
                          className="flex-1 bg-white border border-[var(--waffle)]/35 rounded-xl px-3 py-1.5 text-xs text-[#3D2D27] focus:outline-none focus:border-[var(--caramel)] transition-all"
                        />
                        <input 
                          type="text" 
                          placeholder="5,000m" 
                          value={customStopElevation}
                          onChange={(e) => setCustomStopElevation(e.target.value)}
                          className="w-full sm:w-20 bg-white border border-[var(--waffle)]/35 rounded-xl px-3 py-1.5 text-xs text-[#3D2D27] focus:outline-none focus:border-[var(--caramel)] transition-all"
                        />
                        <button
                          onClick={handleAddCustomStop}
                          disabled={!customStopName.trim()}
                          className="px-3 py-1.5 bg-[#5C463C] hover:bg-[#47362E] text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 whitespace-nowrap"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Node</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-5 text-[#A89286] font-mono text-xs">
                    No Station Selected
                  </div>
                )}
              </div>

            </div>

            {/* Flat Booking summary bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-[var(--waffle)]/12 pt-4 mt-2">
              <div className="flex flex-col text-left">
                <h3 className="text-xs font-black text-[#3D2D27] tracking-tight">Expedition Route Summary</h3>
                <p className="text-[11px] text-[#7A6258] mt-0.5 leading-normal max-w-xl">
                  Your custom itinerary loops <strong className="text-[var(--caramel)]">{itinerary.length} stops</strong> over <strong className="text-[var(--caramel)]">{calculatedDuration} Days</strong> in the {isLuxury ? 'VIP Luxury Expedition' : 'Classic Expedition'} tier.
                </p>
              </div>
              
              <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-[var(--waffle)]/10 pt-2.5 md:pt-0">
                <div className="text-right">
                  <span className="text-[8px] font-mono text-[#A89286] uppercase block tracking-wider leading-none">Est Total Cost</span>
                  <span className="text-base font-black text-[var(--caramel)] font-mono mt-1 block leading-none">${calculatedPrice.toLocaleString()}</span>
                </div>
                
                <button
                  onClick={() => {
                    const invNo = `INV-EXP-${Math.floor(1000 + Math.random() * 9000)}`;
                    addBooking({
                      id: `b-exp-${Date.now()}`,
                      type: 'Custom Trip',
                      title: `Customized ${calculatedDuration}-Day ${isLuxury ? 'Luxury' : 'Classic'} Expedition - ${data.title}`,
                      date: `June 10 - June ${10 + calculatedDuration}, 2026`,
                      details: `Stops: ${itinerary.map(s => `${s.name} (${s.days}d)`).join(' ➔ ')}. Accommodations: ${isLuxury ? 'Quantum Domes' : 'Tea Houses'}.`,
                      cost: calculatedPrice,
                      status: 'Confirmed',
                      invoiceNo: invNo
                    });
                    
                    setBookingSuccess(true);
                    setTimeout(() => {
                      setBookingSuccess(false);
                      if (onBack) {
                        onBack();
                        setTimeout(() => {
                          setActiveSection('bookings');
                        }, 80);
                      } else {
                        router.push('/dashboard');
                        setTimeout(() => {
                          setActiveSection('bookings');
                        }, 80);
                      }
                    }, 2000);
                  }}
                  className="px-4 py-2.5 bg-[var(--caramel)] hover:bg-[var(--caramel)]/90 text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Book Expedition</span>
                </button>
              </div>
            </div>
          </div>

          {/* OpenStreetMap Component */}
          <OpenStreetMap
            lat={targetLat}
            lng={targetLng}
            title="Interactive Destination Map"
            focusName={activeStop?.name || data.title}
          />

          {/* Highlights & Gear Grid - Flat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start border-t border-[var(--waffle)]/15 pt-6 text-left">
            {/* Highlights */}
            <div className="flex flex-col gap-3 text-left">
              <h3 className="text-xs font-mono font-black uppercase text-[var(--caramel)] tracking-wider border-b border-[var(--waffle)]/12 pb-2.5 flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                <span>Key Highlights & Vistas</span>
              </h3>
              <div className="flex flex-col gap-3">
                {data.highlights.map((h, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs text-[#7A6258] leading-relaxed font-sans font-medium">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gear */}
            <div className="flex flex-col gap-3 text-left">
              <h3 className="text-xs font-mono font-black uppercase text-[var(--caramel)] tracking-wider border-b border-[var(--waffle)]/12 pb-2.5 flex items-center gap-1.5">
                <Luggage className="h-4 w-4" />
                <span>Required Expedition Gear</span>
              </h3>
              <div className="flex flex-col gap-2.5">
                {data.gear.map((g, idx) => (
                  <div key={idx} className="flex gap-3 items-start border-b border-[#FAF6EE] pb-2 last:border-0 last:pb-0">
                    <div className="text-xs font-mono font-black text-[var(--caramel)] opacity-70 shrink-0 bg-[var(--vanilla)] h-6 w-6 rounded-md flex items-center justify-center border border-[var(--waffle)]/15">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-[#3D2D27] leading-tight">{g.name}</h4>
                      <p className="text-[10px] text-[#7A6258] leading-relaxed mt-0.5">{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Naturalist Safety Tips - Flat */}
          <div className="border-t border-[var(--waffle)]/15 pt-6 text-left flex flex-col gap-3.5">
            <h3 className="text-xs font-mono font-black uppercase text-[var(--caramel)] tracking-wider border-b border-[var(--waffle)]/12 pb-2 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Naturalist Safety & Etiquette Advice</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.tips.map((t, idx) => (
                <div key={idx} className="flex gap-2.5 items-start p-3 bg-[#FAF6EE]/50 border border-[var(--waffle)]/15 rounded-2xl">
                  <span className="text-xs font-mono font-black text-[var(--caramel)]">{idx + 1}.</span>
                  <p className="text-xs text-[#7A6258] leading-relaxed font-sans font-medium">{t}</p>
                </div>
              ))}
            </div>
          </div>    

        </div>
      </main>

      {/* Booking Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFEFA] border border-[var(--caramel)] rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="h-14 w-14 rounded-full bg-[var(--vanilla)] border border-[var(--caramel)] flex items-center justify-center text-3xl animate-bounce">
              🏔️
            </div>
            <div>
              <h4 className="text-sm font-black text-[#3D2D27]">Expedition Synced!</h4>
              <p className="text-[11px] text-[#7A6258] mt-1 font-medium leading-relaxed">Your customized route has been allocated and added to your Bookings ledger. Redirecting to bookings...</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Alert Popup overlay */}
      {actionAlert.visible && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-full px-4 animate-in fade-in slide-in-from-top-6 duration-300">
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(255,254,250,0.98) 0%, rgba(250,243,227,0.95) 100%)',
              border: '1.5px solid var(--caramel)',
              boxShadow: '0 10px 30px rgba(194,147,103,0.25)',
              borderRadius: '16px',
            }}
            className="p-4 flex items-center gap-3"
          >
            <div className="h-9 w-9 rounded-full bg-[var(--vanilla)] border border-[var(--caramel)]/40 flex items-center justify-center text-lg animate-pulse">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h5 className="text-[10px] font-mono font-bold text-[var(--caramel)] uppercase tracking-wider">Holographic Secure Link</h5>
              <p className="text-[11px] font-bold text-[var(--foreground)] mt-0.5 leading-tight">{actionAlert.contactName}</p>
              <p className="text-[9.5px] text-[#7A6258] mt-1 font-medium">{actionAlert.message}</p>
            </div>
            <div className="flex flex-col gap-0.5 items-end justify-center shrink-0">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[8px] font-mono text-[#A89286] mt-1">SECURE</span>
            </div>
          </div>
        </div>
      )}

      {/* Global Floating Messenger Toggle */}
      <div className={`fixed bottom-6 right-6 z-[100] font-sans flex flex-col items-end ${!rightCollapsed ? 'xl:hidden' : ''}`}>
        {floatingChatOpen ? (
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(255,254,250,0.98) 0%, rgba(250,243,227,0.98) 100%)',
              border: '1px solid rgba(194,147,103,0.22)',
              boxShadow: '0 12px 40px rgba(61,45,39,0.12)',
              borderRadius: '24px',
            }}
            className="w-[330px] sm:w-[350px] h-[480px] flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-8 duration-300 select-none text-left"
          >
            {(() => {
              const activeChan = channels.find(c => c.id === activeChannelId) || channels[0];
              return (
                <>
                  <div className="bg-gradient-to-r from-[var(--vanilla)] to-[#FAF3E3] p-3.5 border-b border-[var(--waffle)]/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative h-8.5 w-8.5 rounded-full overflow-hidden border border-[var(--caramel)]/30">
                        <img src={activeChan.avatar} alt={activeChan.name} className="h-full w-full object-cover" />
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold text-[var(--foreground)] truncate leading-none">{activeChan.name}</h4>
                        <span className="text-[7.5px] font-mono text-[#A89286] uppercase tracking-wider block mt-0.5">{activeChan.role}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleActionAlert("Starting holographic voice call link...", activeChan.name)}
                        className="h-6.5 w-6.5 rounded-full bg-white/70 hover:bg-white border border-[var(--waffle)]/20 text-[#7A6258] hover:text-[var(--caramel)] flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => setFloatingChatOpen(false)}
                        className="h-6.5 w-6.5 rounded-full bg-white/70 hover:bg-white border border-[var(--waffle)]/20 text-[#7A6258] hover:text-rose-500 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 border-b border-[var(--waffle)]/15 flex gap-2 overflow-x-auto select-none bg-[var(--background)]/30 scrollbar-none shrink-0">
                    {channels.map((ch) => {
                      const isActive = activeChannelId === ch.id;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => setActiveChannelId(ch.id)}
                          style={{
                            background: isActive ? 'var(--caramel)' : 'var(--vanilla)',
                            color: isActive ? 'white' : '#7A6258',
                            border: isActive ? '1px solid var(--caramel)' : '1px solid rgba(194,147,103,0.15)'
                          }}
                          className="px-2.5 py-0.5 rounded-full text-[8.5px] font-bold transition-all shrink-0 cursor-pointer hover:opacity-95 animate-none"
                        >
                          {ch.id === 'ch-ai' ? 'AURA' : ch.id === 'ch-g1' ? 'Nima' : 'Host'}
                        </button>
                      );
                    })}
                  </div>

                  {/* Floating messages list */}
                  <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 bg-white/40 scrollbar-none">
                    {activeChan.messages.map((msg) => {
                      const isMe = msg.sender === 'user';
                      return (
                        <div key={msg.id} className={`flex items-start gap-1.5 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start flex-row'}`}>
                          {!isMe && (
                            <img src={activeChan.avatar} alt={activeChan.name} className="h-5 w-5 rounded-full object-cover border border-[var(--waffle)]/25 mt-0.5 shrink-0" />
                          )}
                          <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="relative group">
                              <div 
                                style={{
                                  background: isMe 
                                    ? 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' 
                                    : 'rgba(255, 255, 255, 0.95)',
                                  color: isMe ? 'white' : '#5C463C',
                                  border: isMe ? 'none' : '1px solid rgba(194,147,103,0.15)'
                                }}
                                className={`rounded-2xl px-2.5 py-1.5 text-[9.5px] leading-relaxed shadow-sm relative flex flex-col ${
                                  isMe ? 'rounded-tr-xs' : 'rounded-tl-xs'
                                }`}
                              >
                                {msg.isVoice ? (
                                  <div className="flex items-center gap-1.5 py-0.5 px-0.5 select-none">
                                    <button className="h-4.5 w-4.5 rounded-full bg-[var(--caramel)] text-white flex items-center justify-center cursor-pointer shrink-0">
                                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>
                                    </button>
                                    <div className="flex items-center gap-0.5 h-3.5">
                                      <span className="h-1.5 w-[1.2px] bg-[var(--caramel)]/40 rounded animate-pulse" />
                                      <span className="h-3 w-[1.2px] bg-[var(--caramel)]/70 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
                                      <span className="h-2 w-[1.2px] bg-[var(--caramel)] rounded animate-pulse" style={{ animationDelay: '200ms' }} />
                                      <span className="h-3.5 w-[1.2px] bg-[var(--caramel)] rounded animate-pulse" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className={`text-[6.5px] font-mono font-bold shrink-0 ${isMe ? 'text-white/80' : 'text-[#A89286]'}`}>{msg.duration || '0:06'}</span>
                                  </div>
                                ) : (
                                  <span>{msg.text}</span>
                                )}
                                
                                <div className="flex items-center justify-between gap-3 mt-1.5 shrink-0 select-none">
                                  <span className={`text-[6.5px] font-mono ml-auto leading-none ${isMe ? 'text-white/70' : 'text-[#A89286]'}`}>
                                    {msg.timestamp}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={floatingChatEndRef} />
                  </div>

                  {/* Input bar */}
                  <div className="p-3 border-t border-[var(--waffle)]/15 bg-[var(--background)]/90 flex items-center gap-1.5 shrink-0">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                      placeholder="Write message..."
                      className="flex-1 bg-white border border-[var(--waffle)]/35 rounded-full px-2.5 py-1 text-[9.5px] text-[var(--foreground)] placeholder-[#A89286]/60 focus:outline-none focus:border-[var(--caramel)]/50 transition-all shadow-inner"
                    />
                    <button
                      onClick={handleSendMessage}
                      style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
                      className="h-6.5 w-6.5 rounded-full flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shrink-0 shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        ) : null}

        {/* Floating open trigger */}
        <button
          onClick={() => {
            setFloatingChatOpen(!floatingChatOpen);
            if (setRightCollapsed) {
              setRightCollapsed(false);
            }
          }}
          style={{
            background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)',
            boxShadow: '0 4px 18px rgba(194,147,103,0.4)',
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full text-white transition-all active:scale-90 cursor-pointer relative hover:scale-105 duration-200 border border-white/20 animate-bounce"
        >
          {floatingChatOpen ? '✕' : '💬'}
        </button>
      </div>

    </div>
  );
}
