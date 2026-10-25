'use client';

import React from 'react';

interface OpenStreetMapProps {
  lat: number;
  lng: number;
  title: string;
  focusName?: string;
}

export default function OpenStreetMap({ lat, lng, title, focusName }: OpenStreetMapProps) {
  return (
    <div className="flex flex-col gap-3.5 border-t border-[var(--waffle)]/15 pt-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--waffle)]/12 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin-slow">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-xs font-mono font-black uppercase text-[var(--caramel)] tracking-wider">
              {title}
            </h3>
            {focusName && (
              <p className="text-[10px] text-[#A89286] font-mono leading-none mt-1">
                Target Focus: <span className="text-[#3D2D27] font-bold">{focusName}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono font-bold text-[#A89286] bg-[var(--vanilla)] border border-[var(--waffle)]/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>GPS: {lat.toFixed(4)}°N, {lng.toFixed(4)}°E</span>
          </span>
        </div>
      </div>

      {/* Map View Frame */}
      <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-[var(--waffle)]/25 bg-[#FAF6EE] shadow-inner group">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015}%2C${lat - 0.01}%2C${lng + 0.015}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
          className="w-full h-full grayscale-[10%] opacity-90 group-hover:opacity-100 transition-opacity duration-300"
          key={`${lat}-${lng}`}
        />
        
        {/* Custom Overlay Controls */}
        <div className="absolute bottom-3.5 right-3.5 flex gap-2 z-10">
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white/90 backdrop-blur-md border border-[var(--waffle)]/35 text-[9px] font-mono font-bold text-[#3D2D27] rounded-lg hover:bg-white hover:text-[var(--caramel)] transition-all shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <span>View Larger Map</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
