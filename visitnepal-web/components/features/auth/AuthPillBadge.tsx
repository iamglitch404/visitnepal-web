import React from 'react';
import { Sparkles } from 'lucide-react';

interface AuthPillBadgeProps {
  label: string;
}

export default function AuthPillBadge({ label }: AuthPillBadgeProps) {
  return (
    <div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3E3] border border-[#C29367]/20 text-[9px] font-mono font-bold text-[#A67848] uppercase tracking-wider select-none">
        <Sparkles className="h-3 w-3" />
        <span>{label}</span>
      </div>
    </div>
  );
}
