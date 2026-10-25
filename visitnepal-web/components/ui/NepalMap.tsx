'use client';

import React, { useState } from 'react';
import { MapPin, CloudSun, Compass, ShieldAlert, Thermometer, Users, Mountain, AlertCircle } from 'lucide-react';

interface MapHub {
  id: string;
  name: string;
  coords: { x: number; y: number }; // Percentage coordinate inside the SVG box
  elevation: number;
  temp: number;
  weather: 'Clear' | 'Snowing' | 'Rainy' | 'Windy';
  guidesCount: number;
  restricted: boolean;
  permitCost: number;
  description: string;
}

export default function NepalMap() {
  const [activeHub, setActiveHub] = useState<MapHub | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<'trek' | 'weather' | 'permit'>('trek');

  const hubs: MapHub[] = [
    {
      id: 'h-ktm',
      name: 'Kathmandu Valley',
      coords: { x: 55, y: 70 },
      elevation: 1400,
      temp: 24,
      weather: 'Clear',
      guidesCount: 420,
      restricted: false,
      permitCost: 0,
      description: 'Historical hub featuring seven UNESCO World Heritage sites, hyper-connected ancient Newari palaces, and AI-enabled urban transport systems.'
    },
    {
      id: 'h-pok',
      name: 'Pokhara Lakeside',
      coords: { x: 40, y: 60 },
      elevation: 822,
      temp: 26,
      weather: 'Clear',
      guidesCount: 310,
      restricted: false,
      permitCost: 0,
      description: 'The adventure sport capital. High-definition paramotor tracks, solar-powered Phewa yacht nodes, and micro-climatic healing resorts facing the Annapurnas.'
    },
    {
      id: 'h-ebc',
      name: 'Everest Base Camp',
      coords: { x: 75, y: 55 },
      elevation: 5364,
      temp: -6,
      weather: 'Windy',
      guidesCount: 180,
      restricted: true,
      permitCost: 11000,
      description: 'The ultimate high-altitude proving ground. Pressurized pod zones, telemetry-monitored glacial trails, and deep-space observation domes.'
    },
    {
      id: 'h-mus',
      name: 'Mustang Kingdom',
      coords: { x: 33, y: 40 },
      elevation: 3840,
      temp: 12,
      weather: 'Clear',
      guidesCount: 45,
      restricted: true,
      permitCost: 500,
      description: 'Forbidden pre-medieval kingdom of Lo. High desert walls, cave-monasteries with quantum sensors, and restricted wind-sculpted solar trails.'
    },
    {
      id: 'h-chi',
      name: 'Chitwan Wildlands',
      coords: { x: 48, y: 82 },
      elevation: 150,
      temp: 32,
      weather: 'Rainy',
      guidesCount: 88,
      restricted: false,
      permitCost: 30,
      description: 'Subtropical jungle habitats. Home to the single-horned Asian rhinoceros, Royal Bengal Tigers, and automated acoustic anti-poaching micro-drones.'
    }
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-zinc-800 relative flex flex-col gap-6 overflow-hidden">
      
      {/* Map Control Board */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-cyan-400 animate-spin-slow" />
            <span>Interactive Nepal Telemetry Map</span>
          </h3>
          <p className="text-[10px] font-mono text-zinc-500">Live Satellite Grid Layers - Select Coordinate Node</p>
        </div>

        {/* Toggles */}
        <div className="flex items-center bg-zinc-950/80 rounded-xl p-1 border border-zinc-900 gap-1 text-[11px] font-mono">
          <button 
            onClick={() => setActiveOverlay('trek')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeOverlay === 'trek' ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Trek Routes
          </button>
          <button 
            onClick={() => setActiveOverlay('weather')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeOverlay === 'weather' ? 'bg-purple-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Weather Overlay
          </button>
          <button 
            onClick={() => setActiveOverlay('permit')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeOverlay === 'permit' ? 'bg-rose-500 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Permit Zones
          </button>
        </div>
      </div>

      {/* Grid containing map & sidebar details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Map Panel */}
        <div className="lg:col-span-2 relative bg-zinc-950/90 rounded-xl overflow-hidden neon-border-cyan h-[280px] md:h-[400px] flex items-center justify-center p-2">
          
          {/* Cyber grid overlays */}
          <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
          <div className="absolute inset-0 cyber-grid-fine opacity-20 pointer-events-none" />

          {/* SVG Vector Outline Map of Nepal */}
          <svg 
            viewBox="0 0 800 450" 
            className="w-full h-full object-contain relative select-none"
          >
            {/* Outline path representation of Nepal boundary */}
            <path 
              d="M 50 150 Q 80 120, 150 100 T 320 80 T 480 90 T 600 130 T 750 150 Q 780 200, 770 260 T 730 350 T 650 380 T 480 390 T 300 370 T 150 320 T 40 220 Z" 
              fill="none" 
              stroke="rgba(255,255,255,0.06)" 
              strokeWidth="3" 
            />
            <path 
              d="M 50 150 Q 80 120, 150 100 T 320 80 T 480 90 T 600 130 T 750 150 Q 780 200, 770 260 T 730 350 T 650 380 T 480 390 T 300 370 T 150 320 T 40 220 Z" 
              fill="rgba(10, 10, 20, 0.45)" 
              stroke="rgba(6, 182, 212, 0.4)" 
              strokeWidth="2" 
              className="transition-all duration-500"
            />

            {/* Restricted zones (permit overlay) overlay circles */}
            {activeOverlay === 'permit' && (
              <>
                {/* Mustang Zone */}
                <circle cx="264" cy="180" r="45" fill="rgba(244,63,94,0.15)" stroke="rgba(244,63,94,0.6)" strokeWidth="1" strokeDasharray="3,3" />
                <text x="230" y="160" fill="#f43f5e" fontSize="10" className="font-mono font-black uppercase">Restricted Area</text>
                
                {/* Everest Zone */}
                <circle cx="600" cy="247" r="40" fill="rgba(244,63,94,0.15)" stroke="rgba(244,63,94,0.6)" strokeWidth="1" strokeDasharray="3,3" />
              </>
            )}

            {/* Vector Trek Routes linking hubs */}
            {activeOverlay === 'trek' && (
              <g stroke="rgba(168,85,247,0.5)" strokeWidth="1.5" strokeDasharray="5,5" fill="none" className="animate-pulse">
                {/* Pokhara to Mustang */}
                <path d="M 320 270 Q 290 220, 264 180" />
                {/* Pokhara to Kathmandu */}
                <path d="M 320 270 L 440 315" />
                {/* Kathmandu to Everest */}
                <path d="M 440 315 Q 520 290, 600 247" />
                {/* Kathmandu to Chitwan */}
                <path d="M 440 315 L 384 369" />
              </g>
            )}

            {/* Dynamic Map Pins */}
            {hubs.map((hub) => {
              const svgX = (hub.coords.x / 100) * 800;
              const svgY = (hub.coords.y / 100) * 450;
              const isSelected = activeHub?.id === hub.id;

              return (
                <g 
                  key={hub.id}
                  onClick={() => setActiveHub(hub)}
                  className="cursor-pointer group"
                >
                  {/* Ping Ring */}
                  <circle 
                    cx={svgX} 
                    cy={svgY} 
                    r={isSelected ? 16 : 8} 
                    fill="none" 
                    stroke={isSelected ? '#06b6d4' : '#a855f7'} 
                    strokeWidth="2" 
                    className="animate-ping opacity-60" 
                  />

                  {/* Core Indicator */}
                  <circle 
                    cx={svgX} 
                    cy={svgY} 
                    r={isSelected ? 6 : 4} 
                    fill={isSelected ? '#06b6d4' : '#ffffff'} 
                    className="group-hover:fill-cyan-400 transition-colors" 
                  />

                  {/* Weather Icon Overlay */}
                  {activeOverlay === 'weather' && (
                    <foreignObject x={svgX - 10} y={svgY - 26} width="20" height="20">
                      <span className="text-xs">
                        {hub.weather === 'Clear' && '☀️'}
                        {hub.weather === 'Windy' && '💨'}
                        {hub.weather === 'Rainy' && '🌧️'}
                        {hub.weather === 'Snowing' && '❄️'}
                      </span>
                    </foreignObject>
                  )}

                  {/* Hub Label */}
                  <text 
                    x={svgX} 
                    y={svgY + 20} 
                    textAnchor="middle" 
                    fill={isSelected ? '#06b6d4' : '#a1a1aa'} 
                    fontSize="9" 
                    className="font-mono font-bold tracking-wider pointer-events-none"
                  >
                    {hub.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Status Indicators */}
          <div className="absolute bottom-3 left-3 bg-zinc-950/90 rounded-lg p-2 border border-zinc-900 text-[8px] font-mono text-zinc-500">
            <p>GRID: 27.7172° N, 85.3240° E</p>
            <p className="text-cyan-400">RESOLVING ENHANCED GRID v3.2</p>
          </div>
        </div>

        {/* Sidebar Data Panel */}
        <div className="flex flex-col gap-4">
          {activeHub ? (
            <div className="glass-panel p-5 rounded-xl border border-cyan-500/20 relative flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h4 className="text-base font-bold text-white leading-tight">{activeHub.name}</h4>
                  <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-cyan-400" /> COORDINATE POINT ACTIVE
                  </span>
                </div>
                {activeHub.restricted && (
                  <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[8px] font-bold text-rose-400 border border-rose-500/20">
                    <ShieldAlert className="h-2.5 w-2.5" /> RESTRICTED
                  </span>
                )}
              </div>

              {/* Bio Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-zinc-950/80 rounded-lg p-2.5 border border-zinc-900 flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-purple-400" />
                  <div>
                    <p className="text-[8px] text-zinc-500 uppercase">Altitude</p>
                    <p className="font-bold text-zinc-200">{activeHub.elevation.toLocaleString()}m</p>
                  </div>
                </div>

                <div className="bg-zinc-950/80 rounded-lg p-2.5 border border-zinc-900 flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-cyan-400" />
                  <div>
                    <p className="text-[8px] text-zinc-500 uppercase">Ambient</p>
                    <p className="font-bold text-zinc-200">{activeHub.temp}°C</p>
                  </div>
                </div>

                <div className="bg-zinc-950/80 rounded-lg p-2.5 border border-zinc-900 flex items-center gap-2">
                  <CloudSun className="h-4 w-4 text-amber-400" />
                  <div>
                    <p className="text-[8px] text-zinc-500 uppercase">Weather</p>
                    <p className="font-bold text-zinc-200">{activeHub.weather}</p>
                  </div>
                </div>

                <div className="bg-zinc-950/80 rounded-lg p-2.5 border border-zinc-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-400" />
                  <div>
                    <p className="text-[8px] text-zinc-500 uppercase">Guides</p>
                    <p className="font-bold text-zinc-200">{activeHub.guidesCount} Online</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {activeHub.description}
              </p>

              {/* Action Node */}
              {activeHub.restricted ? (
                <div className="bg-rose-950/20 rounded-xl p-3 border border-rose-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                    <div>
                      <h5 className="text-[11px] font-bold text-rose-300">Restricted Zone Permit Needed</h5>
                      <p className="text-[9px] text-rose-400 leading-relaxed mt-0.5 font-mono">
                        Requires legal bio-permit approval prior to departure. Approvals cost roughly ${activeHub.permitCost} USD.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-950/20 rounded-xl p-3 border border-emerald-500/20">
                  <p className="text-[10px] font-mono text-emerald-400 leading-relaxed">
                    ✓ Open tourist area. Standard tourist visa covers travel. Safe for self-exploration and trekking.
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full min-h-[180px] rounded-xl border border-zinc-800/80 border-dashed flex flex-col items-center justify-center text-center p-6 bg-zinc-950/20">
              <Compass className="h-8 w-8 text-zinc-600 animate-spin-slow mb-3" />
              <p className="text-xs font-mono text-zinc-500">
                Select any glowing coordinate point on the map to query telemetry data, climate reads, and permit structures.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
