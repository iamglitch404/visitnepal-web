'use client';

import React from 'react';
import { Users } from 'lucide-react';

export interface CommentType {
  id: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface CommentProps {
  comment: CommentType;
  theme?: 'light' | 'dark';
  onCommenterClick?: (userName: string) => void;
}

export default function Comment({ comment, theme = 'dark', onCommenterClick }: CommentProps) {
  if (theme === 'light') {
    return (
      <div className="flex items-start gap-2 mt-2 text-left">
        <div 
          onClick={() => onCommenterClick?.(comment.userName)}
          className="h-5 w-5 rounded-full overflow-hidden bg-[#F5ECD7] border shrink-0 flex items-center justify-center text-[8px] cursor-pointer hover:scale-95 transition-transform" 
          style={{ borderColor: 'rgba(194,147,103,0.2)' }}
        >
          👤
        </div>
        <div className="flex-1 rounded-xl px-3 py-1.5" style={{ background: 'rgba(194,147,103,0.06)', border: '1px solid rgba(194,147,103,0.12)' }}>
          <span 
            onClick={() => onCommenterClick?.(comment.userName)}
            className="text-[10px] font-bold text-[#3D2D27] cursor-pointer hover:text-[var(--caramel)] hover:underline transition-colors block text-left"
          >
            {comment.userName}
          </span>
          <p className="text-[10px] text-[#7A6258] mt-0.5 leading-relaxed text-left">{comment.text}</p>
        </div>
        <span className="text-[7px] font-mono text-[#A89286] self-end mb-1 shrink-0">
          {comment.timestamp || 'Just now'}
        </span>
      </div>
    );
  }

  // Dark Theme (Cyberpunk)
  return (
    <div className="flex items-start gap-2 text-left">
      <div className="h-5 w-5 rounded-full bg-zinc-800 border border-zinc-700 flex-shrink-0 flex items-center justify-center">
        <Users className="h-2.5 w-2.5 text-zinc-500" />
      </div>
      <div className="bg-zinc-900/60 rounded-xl px-3 py-1.5 flex-1 text-left">
        <span 
          onClick={() => onCommenterClick?.(comment.userName)}
          className="text-[10px] font-bold text-zinc-300 cursor-pointer hover:text-cyan-400 hover:underline transition-colors"
        >
          {comment.userName}{' '}
        </span>
        <span className="text-[10px] text-zinc-500">{comment.text}</span>
      </div>
      <span className="text-[8px] font-mono text-zinc-700 self-end pb-1 flex-shrink-0">
        {comment.timestamp}
      </span>
    </div>
  );
}
