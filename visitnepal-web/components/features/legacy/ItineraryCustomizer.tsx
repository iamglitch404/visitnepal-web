'use client';

import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { 
  Cpu, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  Users, 
  Compass, 
  Activity, 
  MapPin, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function ItineraryCustomizer() {
  const { 
    customPreferences, 
    setCustomPreference, 
    generatedItinerary, 
    setGeneratedItinerary,
    stays,
    guides,
    addBooking,
    setActiveSection
  } = useTravelStore();

  const [synthesizing, setSynthesizing] = useState(false);
  const [synthProgress, setSynthProgress] = useState(0);

  const interestsList = ['Trekking', 'Spiritual Retreats', 'Eco Tourism', 'Culture Heritage', 'Wildlife Safari', 'Adventure Sports', 'Photography'];

  const handleSynthesize = () => {
    setSynthesizing(true);
    setSynthProgress(10);

    const interval = setInterval(() => {
      setSynthProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Generate a gorgeous customized itinerary based on user input
          const region = customPreferences.preferredRegion;
          const days = customPreferences.duration;
          
          // Select hotel & guide based on inputs
          const matchedHotel = stays.find(s => s.location.includes(region)) || stays[0];
          const matchedGuide = guides.find(g => g.type === 'Mountaineering') || guides[0];
          
          const hotelCost = matchedHotel.price * days;
          const guideCost = matchedGuide.pricePerDay * days;
          const transportCost = customPreferences.transportPreference === 'helicopter' ? 1200 : 300;
          const permitCost = region === 'Everest' ? 11000 : 30;
          const totalCost = hotelCost + guideCost + transportCost + permitCost;

          // Build daily plan
          const daysArray = [];
          for (let i = 1; i <= days; i++) {
            let activity = 'Acclimatization, briefing & sensory wellness pod calibration.';
            let altitude = '1,400m';
            if (i === 1) {
              activity = 'Arrival via premium airport drone shuttle, check-in to luxury suite & initial biometrics scan.';
            } else if (i === days) {
              activity = 'Closing Himalayan ritual ceremony, high-speed charter flight back to Kathmandu & departure.';
            } else if (i > 1 && i < days - 2) {
              if (region === 'Everest') {
                activity = `Alpine trek to Namche Bazaar. Core biometric altitude adjustment: ${3440 + i * 200}m. Guides calibrate oxygen ratios.`;
                altitude = `${3440 + i * 200}m`;
              } else if (region === 'Mustang') {
                activity = `Jeep exploration to forbidden sky-caves of Lo. Altitude: 3,800m. Exploration of solar monastery grids.`;
                altitude = '3,800m';
              } else {
                activity = `Exploration of local scenic valleys, organic lunch at high camp, and altitude meditation sessions.`;
                altitude = '2,400m';
              }
            } else if (i >= days - 2) {
              activity = `Peak exploration. Majestic views of mountain ranges. High energy dining under the glass domes.`;
              altitude = '4,500m';
            }
            daysArray.push({ day: i, activity, altitude });
          }

          setGeneratedItinerary({
            region,
            duration: days,
            totalCost,
            breakdown: {
              hotel: hotelCost,
              guide: guideCost,
              transport: transportCost,
              permits: permitCost
            },
            hotel: matchedHotel,
            guide: matchedGuide,
            schedule: daysArray,
            transport: customPreferences.transportPreference
          });
          
          setSynthesizing(false);
          return 100;
        }
        return prev + 15;
      });
    }, 400);
  };

  const handleBookItinerary = () => {
    if (!generatedItinerary) return;
    const invNo = `INV-ITIN-${Math.floor(1000 + Math.random() * 9000)}`;

    addBooking({
      id: `b-itin-${Date.now()}`,
      type: 'Custom Trip',
      title: `AI Personalized ${generatedItinerary.duration}-Day Package to ${generatedItinerary.region}`,
      date: `June 05 - June ${5 + generatedItinerary.duration}, 2026`,
      details: `Includes Stays at ${generatedItinerary.hotel.name}, Guided by ${generatedItinerary.guide.name}. Fully synchronized route telemetry.`,
      cost: generatedItinerary.totalCost,
      status: 'Confirmed',
      invoiceNo: invNo
    });

    // Take user to bookings
    setActiveSection('bookings');
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Header Info */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-rose-400" />
          <h2 className="text-xl font-bold tracking-wide text-white">AI Cognitive Itinerary Synthesizer</h2>
        </div>
        <p className="text-xs text-zinc-400 font-mono">
          Input your adventure metrics. Our multi-variable neural net maps active climates, guide grids, and luxury stays.
        </p>
      </section>

      {/* Main Wizard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Options panel */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-2xl border border-zinc-800 flex flex-col gap-4">
          <div className="border-b border-zinc-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Calibrate neural preferences</h3>
          </div>

          <div className="flex flex-col gap-3 font-mono text-xs">
            
            {/* Preferred Region */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                <MapPin className="h-3 w-3 text-rose-400" /> Target Region
              </label>
              <select 
                value={customPreferences.preferredRegion}
                onChange={(e) => setCustomPreference('preferredRegion', e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Everest">Khumbu Everest Region</option>
                <option value="Annapurna">Annapurna Circuit Valley</option>
                <option value="Mustang">Mustang Restricted Area</option>
                <option value="Chitwan">Chitwan Plains</option>
              </select>
            </div>

            {/* Budget */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-rose-400" /> Investment Bracket
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold text-center">
                {['budget', 'premium', 'luxury'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setCustomPreference('budget', lvl)}
                    className={`py-1.5 rounded border capitalize cursor-pointer ${
                      customPreferences.budget === lvl 
                        ? 'border-rose-500 bg-rose-500/10 text-white' 
                        : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[9px] uppercase text-zinc-500 tracking-wider">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-rose-400" /> Stay Duration
                </span>
                <span className="text-white font-bold">{customPreferences.duration} Days</span>
              </div>
              <input 
                type="range" 
                min="3" 
                max="21" 
                value={customPreferences.duration}
                onChange={(e) => setCustomPreference('duration', parseInt(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Difficulty */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                <Activity className="h-3 w-3 text-rose-400" /> Physical Exertion
              </label>
              <select
                value={customPreferences.difficulty}
                onChange={(e) => setCustomPreference('difficulty', e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-rose-500"
              >
                <option value="easy">Easy (Cultural heritage walk)</option>
                <option value="moderate">Moderate (Valleys & High Passes)</option>
                <option value="challenging">Challenging (ACAP & EBC trails)</option>
                <option value="extreme">Extreme (Alpine ice climbs)</option>
              </select>
            </div>

            {/* Transport Preference */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                <Compass className="h-3 w-3 text-rose-400" /> Transit Systems
              </label>
              <select
                value={customPreferences.transportPreference}
                onChange={(e) => setCustomPreference('transportPreference', e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-rose-500"
              >
                <option value="helicopter">Himalayan Heli-Charter (Premium)</option>
                <option value="flight">High-Speed Turboprop flight</option>
                <option value="private_vehicle">Private 4x4 Cyber-Jeep</option>
              </select>
            </div>

            {/* Interests checklist */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase text-zinc-500 tracking-wider">Interests & Modalities</label>
              <div className="flex flex-wrap gap-1">
                {interestsList.map((interest, idx) => {
                  const isSelected = customPreferences.interests.includes(interest);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        const updated = isSelected 
                          ? customPreferences.interests.filter(i => i !== interest)
                          : [...customPreferences.interests, interest];
                        setCustomPreference('interests', updated);
                      }}
                      className={`text-[9px] px-2 py-1 rounded-md border cursor-pointer ${
                        isSelected 
                          ? 'border-rose-500 bg-rose-500/10 text-white' 
                          : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Synthesize Action */}
            <button 
              onClick={handleSynthesize}
              disabled={synthesizing}
              className="w-full mt-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 py-3 text-xs font-bold text-white font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 animate-pulse text-rose-200" />
              <span>{synthesizing ? 'Synthesizing...' : 'Synthesize Itinerary'}</span>
            </button>

          </div>

        </div>

        {/* Right Output panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {synthesizing && (
            <div className="glass-panel p-8 rounded-2xl border border-rose-500/30 flex flex-col items-center justify-center text-center gap-4 animate-in zoom-in-95 duration-200 min-h-[300px]">
              <div className="h-14 w-14 rounded-full border border-rose-500/50 flex items-center justify-center bg-rose-500/5 relative">
                <Cpu className="h-6 w-6 text-rose-400 animate-spin" />
                <div className="absolute inset-0 border-t-2 border-rose-400 rounded-full animate-ping opacity-35"></div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-mono">Running Neural Pathfinder Systems</h4>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">Acclimatizing coordinates, allocating guides, and lockouts...</p>
              </div>
              <div className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-300" style={{ width: `${synthProgress}%` }} />
              </div>
              <span className="text-xs font-mono text-rose-400 font-bold">{synthProgress}% Complete</span>
            </div>
          )}

          {!synthesizing && generatedItinerary ? (
            <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 flex flex-col gap-6 animate-in fade-in duration-300">
              
              {/* Header Info summary */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-850 pb-4">
                <div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">COGNITIVE SUMMARY GENERATED</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {generatedItinerary.duration}-Day Immersive Adventure to {generatedItinerary.region}
                  </h3>
                </div>
                
                {/* Cost sticker */}
                <div className="bg-zinc-950 rounded-xl p-2.5 border border-zinc-900 text-right">
                  <p className="text-[8px] text-zinc-500 font-mono uppercase">Estimated Total Cost</p>
                  <p className="text-base font-black text-rose-400 font-mono">${generatedItinerary.totalCost.toLocaleString()}</p>
                </div>
              </div>

              {/* Grid: hotel, guide, transit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex gap-3 items-center">
                  <img src={generatedItinerary.hotel.image} alt={generatedItinerary.hotel.name} className="h-12 w-16 object-cover rounded-lg border border-zinc-800 shrink-0" />
                  <div className="min-w-0 text-xs">
                    <p className="text-[8px] text-zinc-500 font-mono uppercase">Suite Lodging</p>
                    <h4 className="font-bold text-zinc-200 truncate">{generatedItinerary.hotel.name}</h4>
                    <p className="text-[9px] text-emerald-400 font-mono">${generatedItinerary.hotel.price}/night</p>
                  </div>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex gap-3 items-center">
                  <img src={generatedItinerary.guide.avatar} alt={generatedItinerary.guide.name} className="h-12 w-12 object-cover rounded-full border border-zinc-800 shrink-0" />
                  <div className="min-w-0 text-xs">
                    <p className="text-[8px] text-zinc-500 font-mono uppercase">Allocated Guide</p>
                    <h4 className="font-bold text-zinc-200 truncate">{generatedItinerary.guide.name}</h4>
                    <p className="text-[9px] text-purple-400 font-mono">${generatedItinerary.guide.pricePerDay}/day - Rated ★{generatedItinerary.guide.rating}</p>
                  </div>
                </div>

              </div>

              {/* Price Breakdown */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex flex-col gap-3 font-mono text-[11px] text-zinc-400">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Invoice Cost Matrix</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="bg-zinc-900 p-2 rounded border border-zinc-850">
                    <span className="text-zinc-500 text-[9px] block">LODGING</span>
                    <span className="text-zinc-200 font-bold">${generatedItinerary.breakdown.hotel}</span>
                  </div>
                  <div className="bg-zinc-900 p-2 rounded border border-zinc-850">
                    <span className="text-zinc-500 text-[9px] block">GUIDING FEE</span>
                    <span className="text-zinc-200 font-bold">${generatedItinerary.breakdown.guide}</span>
                  </div>
                  <div className="bg-zinc-900 p-2 rounded border border-zinc-850">
                    <span className="text-zinc-500 text-[9px] block">TRANSIT FLIGHTS</span>
                    <span className="text-zinc-200 font-bold">${generatedItinerary.breakdown.transport}</span>
                  </div>
                  <div className="bg-zinc-900 p-2 rounded border border-zinc-850">
                    <span className="text-zinc-500 text-[9px] block">GOV LEVIES</span>
                    <span className="text-zinc-200 font-bold">${generatedItinerary.breakdown.permits}</span>
                  </div>
                </div>
              </div>

              {/* Schedule timeline */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-rose-400" />
                  <span>Interactive Daily Matrix</span>
                </h4>
                
                <div className="flex flex-col gap-3 pl-2 border-l border-zinc-800 font-sans">
                  {generatedItinerary.schedule.map((item: any) => (
                    <div 
                      key={item.day}
                      className="relative pl-6 flex flex-col gap-1 text-xs"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-[-13px] top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 border border-zinc-950 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-rose-400">DAY {item.day}</span>
                        <span className="text-[9px] font-mono bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-850">
                          {item.altitude}
                        </span>
                      </div>
                      
                      <p className="text-zinc-300 leading-relaxed">{item.activity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Book entire custom Package button */}
              <button 
                onClick={handleBookItinerary}
                className="w-full mt-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 py-3.5 text-xs font-bold text-white font-mono tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(244,63,94,0.4)]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm & Lock Combined AI Package Bookings</span>
              </button>

            </div>
          ) : (
            // Empty State
            <div className="h-full min-h-[400px] rounded-2xl border border-zinc-800/80 border-dashed flex flex-col items-center justify-center text-center p-8 bg-zinc-950/20">
              <Cpu className="h-10 w-10 text-zinc-700 animate-pulse mb-3" />
              <h4 className="text-sm font-bold text-white font-mono">No Active Synthesizer Runs</h4>
              <p className="text-xs text-zinc-550 max-w-xs mt-1 leading-relaxed">
                Adjust the left telemetry controls and trigger "Synthesize Itinerary" to generate customized schedules, real-time pricing matrices, and localized alpine coordinates.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
