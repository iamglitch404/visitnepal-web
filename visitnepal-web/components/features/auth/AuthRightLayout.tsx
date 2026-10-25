import React from 'react';
import NepalBackgroundMap from '@/components/features/chat/NepalBackgroundMap';

interface AuthRightLayoutProps {
  children: React.ReactNode;
}

export default function AuthRightLayout({ children }: AuthRightLayoutProps) {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#FAF9F5] relative z-10">
      {/* Mobile Background Map (drawn inside behind form) */}
      <div className="absolute inset-0 z-0 lg:hidden block overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200"
          className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-luminosity pointer-events-none select-none"
          alt=""
        />
        <div className="absolute inset-0 bg-[#FAF9F5]/90 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none scale-105">
          <NepalBackgroundMap isSidebar={false} />
        </div>
      </div>

      {/* Center Wrapper preventing height cutoffs */}
      <div className="min-h-full w-full flex items-center justify-center px-6 sm:px-16 lg:px-20 py-12 lg:py-16">
        <div className="max-w-[540px] w-full flex flex-col gap-6 relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
