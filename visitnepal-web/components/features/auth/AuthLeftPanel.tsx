import React from 'react';
import NepalBackgroundMap from '@/components/features/chat/NepalBackgroundMap';

interface AuthLeftPanelProps {
  imageSrc?: string;
  imageAlt?: string;
}

export default function AuthLeftPanel({
  imageSrc = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200",
  imageAlt = "Nepal landscape"
}: AuthLeftPanelProps) {
  return (
    <div className="hidden lg:flex lg:w-[48%] h-full bg-[#130E0A] flex-shrink-0 flex-col justify-between overflow-hidden relative z-10 p-10 select-none">
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity pointer-events-none"
      />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      
      {/* Placeholder layout spacer */}
      <div className="relative z-20 h-8 w-2" />

      {/* Centered Nepal Map Vector */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-8 pointer-events-none scale-105">
        <NepalBackgroundMap isSidebar={true} />
      </div>

      {/* Bottom coordinates display */}
      <div className="relative z-20 font-mono text-[9px] text-white/40 flex justify-between">
        <span>LAT: 27.7172° N</span>
        <span>LONG: 85.3240° E</span>
      </div>
    </div>
  );
}
