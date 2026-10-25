'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, MapPin, Thermometer, Mountain, CloudSun, Users, Compass as CompassIcon } from 'lucide-react';

interface MapNode {
  id: string;
  name: string;
  coords: { x: number; y: number }; // Percentage coordinates inside the 800x450 SVG viewbox
  elevation: string;
  temp: string;
  weather: string;
  popularFor: string;
  guidesCount: number;
}

const MAP_NODES: MapNode[] = [
  {
    id: 'n-ktm',
    name: 'Kathmandu Gateway',
    coords: { x: 55, y: 70 },
    elevation: '1,400m',
    temp: '24°C',
    weather: 'Clear Sky',
    popularFor: 'Heritage & Culture',
    guidesCount: 420
  },
  {
    id: 'n-pok',
    name: 'Pokhara Lakeside',
    coords: { x: 40, y: 60 },
    elevation: '822m',
    temp: '26°C',
    weather: 'Sunny',
    popularFor: 'Adventure & Lakes',
    guidesCount: 310
  },
  {
    id: 'n-ebc',
    name: 'Everest Base Camp',
    coords: { x: 75, y: 55 },
    elevation: '5,364m',
    temp: '-6°C',
    weather: 'Windy',
    popularFor: 'Alpine Trekking',
    guidesCount: 180
  },
  {
    id: 'n-mus',
    name: 'Mustang Kingdom',
    coords: { x: 33, y: 40 },
    elevation: '3,840m',
    temp: '12°C',
    weather: 'Clear',
    popularFor: 'Mystic Caves & Deserts',
    guidesCount: 45
  },
  {
    id: 'n-chi',
    name: 'Chitwan Wildlands',
    coords: { x: 48, y: 82 },
    elevation: '150m',
    temp: '32°C',
    weather: 'Humid',
    popularFor: 'Jungle Safaris',
    guidesCount: 88
  }
];

export default function AuthMapDrawing() {
  const [activeNode, setActiveNode] = useState<MapNode | null>(MAP_NODES[0]);
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto-rotate selected nodes when the user is idle to keep the visual dynamic
  useEffect(() => {
    if (!autoRotate || hoveredNode) return;

    const interval = setInterval(() => {
      setActiveNode((current) => {
        if (!current) return MAP_NODES[0];
        const idx = MAP_NODES.findIndex((n) => n.id === current.id);
        const nextIdx = (idx + 1) % MAP_NODES.length;
        return MAP_NODES[nextIdx];
      });
    }, 5500);

    return () => clearInterval(interval);
  }, [autoRotate, hoveredNode]);

  const handleNodeClick = (node: MapNode) => {
    setAutoRotate(false); // Stop auto rotation on click
    setActiveNode(node);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 lg:p-10 relative overflow-hidden select-none">
      
      {/* Dynamic Background Grids and Technical Sweeps */}
      <div className="absolute inset-0 bg-[radial-gradient(#C29367_1.2px,transparent_1.2px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#130E0A] via-transparent to-black/30 pointer-events-none" />
      
      {/* Animated Satellite Scan Line */}
      <motion.div 
        initial={{ y: '-100%' }}
        animate={{ y: '200%' }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C29367]/40 to-transparent pointer-events-none"
      />

      {/* Top Telemetry Header */}
      <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-white/50 tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-[#C29367] rounded-full animate-ping" />
          <span>SATELLITE TRAIL GRID v4.2</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Compass className="h-3 w-3 animate-spin-slow text-[#C29367]" />
          <span>BEARING: 27.7172° N</span>
        </div>
      </div>

      {/* Map Drawing Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center my-6 min-h-[220px]">
        <svg 
          viewBox="0 0 800 450" 
          className="w-full max-w-2xl h-auto object-contain relative drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)]"
        >
          {/* Detailed Nepal Border Path Drawing */}
          <motion.path 
            d="M 50 150 Q 80 120, 150 100 T 320 80 T 480 90 T 600 130 T 750 150 Q 780 200, 770 260 T 730 350 T 650 380 T 480 390 T 300 370 T 150 320 T 40 220 Z" 
            fill="rgba(194, 147, 103, 0.04)" 
            stroke="rgba(194, 147, 103, 0.35)" 
            strokeWidth="2.5" 
            strokeDasharray="4,4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
          />

          <motion.path 
            d="M 50 150 Q 80 120, 150 100 T 320 80 T 480 90 T 600 130 T 750 150 Q 780 200, 770 260 T 730 350 T 650 380 T 480 390 T 300 370 T 150 320 T 40 220 Z" 
            fill="none" 
            stroke="rgba(194, 147, 103, 0.15)" 
            strokeWidth="6" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: 'easeInOut', delay: 0.2 }}
          />

          {/* Animated Trail Routing Connections */}
          <g stroke="rgba(235, 214, 188, 0.25)" strokeWidth="1.5" strokeDasharray="3,6" fill="none">
            {/* Pokhara to Mustang */}
            <path d="M 320 270 Q 290 220, 264 180" />
            {/* Pokhara to Kathmandu */}
            <path d="M 320 270 L 440 315" />
            {/* Kathmandu to Everest */}
            <path d="M 440 315 Q 520 290, 600 247" />
            {/* Kathmandu to Chitwan */}
            <path d="M 440 315 L 384 369" />
          </g>

          {/* Glowing Map Hub Pin Groups */}
          {MAP_NODES.map((node) => {
            const svgX = (node.coords.x / 100) * 800;
            const svgY = (node.coords.y / 100) * 450;
            const isActive = activeNode?.id === node.id;
            const isHovered = hoveredNode?.id === node.id;

            return (
              <g 
                key={node.id}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer group"
              >
                {/* Outer pulsing beacon */}
                <circle 
                  cx={svgX} 
                  cy={svgY} 
                  r={isActive ? 16 : isHovered ? 12 : 7} 
                  fill="none" 
                  stroke={isActive ? '#C29367' : 'rgba(235, 214, 188, 0.6)'} 
                  strokeWidth="2" 
                  className={isActive || isHovered ? 'animate-ping opacity-60' : 'opacity-30'} 
                />

                {/* Outer solid marker ring */}
                <circle 
                  cx={svgX} 
                  cy={svgY} 
                  r={isActive ? 7 : 5} 
                  fill={isActive ? 'transparent' : 'rgba(19, 14, 10, 0.8)'}
                  stroke={isActive ? '#C29367' : '#EBD6BC'}
                  strokeWidth={isActive ? 2 : 1.5}
                  className="transition-all duration-300"
                />

                {/* Core dot */}
                <circle 
                  cx={svgX} 
                  cy={svgY} 
                  r={isActive ? 3 : 2} 
                  fill={isActive ? '#C29367' : '#FFFFFF'} 
                />

                {/* Map label overlay */}
                <text 
                  x={svgX} 
                  y={svgY + 22} 
                  textAnchor="middle" 
                  fill={isActive ? '#C29367' : '#EBD6BC'} 
                  fontSize="10" 
                  className="font-mono font-bold tracking-wider pointer-events-none select-none opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                >
                  {node.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Panel: Details of active coordinate hub */}
      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {activeNode && (
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
              className="rounded-2xl p-4 w-full flex flex-col gap-3.5 text-left border shadow-lg"
            >
              <div className="flex items-start justify-between border-b border-white/10 pb-2">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#C29367]" />
                    <span>{activeNode.name}</span>
                  </h4>
                  <span className="text-[9px] font-mono text-[#EBD6BC]/60 tracking-wider block mt-0.5">
                    POPULAR FOR: {activeNode.popularFor.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#C29367] bg-white/5 border border-[#C29367]/20 px-2 py-0.5 rounded-md">
                  <span className="h-1.5 w-1.5 bg-[#C29367] rounded-full animate-pulse" />
                  <span>ONLINE NETWORK</span>
                </div>
              </div>

              {/* Grid with coordinates telemetry details */}
              <div className="grid grid-cols-3 gap-2.5 font-mono text-[9px] text-white/70">
                <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex flex-col gap-0.5">
                  <span className="text-white/40 text-[7.5px] uppercase">Altitude</span>
                  <span className="font-bold text-[#EBD6BC] flex items-center gap-1">
                    <Mountain className="h-3 w-3 text-[#C29367]" />
                    {activeNode.elevation}
                  </span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex flex-col gap-0.5">
                  <span className="text-white/40 text-[7.5px] uppercase">Telemetry Temp</span>
                  <span className="font-bold text-[#EBD6BC] flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-[#C29367]" />
                    {activeNode.temp}
                  </span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-lg p-2 flex flex-col gap-0.5">
                  <span className="text-white/40 text-[7.5px] uppercase">Guide Nodes</span>
                  <span className="font-bold text-[#EBD6BC] flex items-center gap-1">
                    <Users className="h-3 w-3 text-[#C29367]" />
                    {activeNode.guidesCount} active
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
