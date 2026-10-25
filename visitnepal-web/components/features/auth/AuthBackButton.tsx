import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface AuthBackButtonProps {
  label: string;
  onClick: () => void;
}

export default function AuthBackButton({ label, onClick }: AuthBackButtonProps) {
  return (
    <div className="absolute top-6 left-6 z-30">
      <button 
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 lg:bg-white/5 hover:bg-black/10 lg:hover:bg-white/10 backdrop-blur-md border border-[#3D2D27]/12 lg:border-white/12 text-xs font-mono font-bold text-[#7A6258] lg:text-white/80 hover:text-[#3D2D27] lg:hover:text-white transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 text-[#C29367]" />
        <span>{label}</span>
      </button>
    </div>
  );
}
