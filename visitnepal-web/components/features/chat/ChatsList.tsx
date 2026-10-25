'use client';

import React from 'react';

import { ChatChannel } from '@/store/useTravelStore';

export type Channel = ChatChannel;

export interface ChatsListProps {
  channels: ChatChannel[];
  onActiveChannelIdChange: (id: string) => void;
  onChatViewStateChange: (state: 'inbox' | 'conversation') => void;
}

export default function ChatsList({
  channels,
  onActiveChannelIdChange,
  onChatViewStateChange,
}: ChatsListProps) {
  return (
    <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 min-h-0 my-1 py-1 scrollbar-none">
      <div className="flex flex-col gap-1.5">
        {channels.map((chan) => {
          const lastMsg = chan.messages[chan.messages.length - 1];
          const isAi = chan.id === 'ch-ai';
          const isMeLast = lastMsg?.sender === 'user';
          
          return (
            <button
              key={chan.id}
              onClick={() => {
                onActiveChannelIdChange(chan.id);
                onChatViewStateChange('conversation');
              }}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[var(--vanilla)]/50 active:bg-[var(--vanilla)]/70 transition-all duration-150 text-left cursor-pointer group"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img src={chan.avatar} alt={chan.name} className="h-9 w-9 rounded-full object-cover" />
                <span 
                  className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white ${
                    isAi ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500'
                  }`} 
                />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <h4 className="text-[11px] font-bold text-[var(--foreground)] truncate leading-none group-hover:text-[var(--caramel)] transition-colors">
                    {chan.name}
                  </h4>
                  <span className="text-[8.5px] font-mono text-[#A89286] shrink-0">
                    {lastMsg ? lastMsg.timestamp : '12:45 PM'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1 mt-1.5">
                  <p className="text-[9.5px] text-[#7A6258] truncate leading-tight flex-1 font-medium font-sans">
                    {lastMsg ? (
                      <>
                        {isMeLast && (
                          <span className="text-sky-600 font-bold font-mono mr-0.5 select-none">✓✓</span>
                        )}
                        {isMeLast && <span className="font-semibold text-[#8B7365]">You: </span>}
                        {lastMsg.isVoice ? (
                          <span className="italic flex items-center gap-0.5 text-[8.5px] text-[var(--caramel)] font-semibold">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> Voice memo ({lastMsg.duration || '0:06'})
                          </span>
                        ) : lastMsg.text === '👍' ? (
                          <span>👍 Thumbs up</span>
                        ) : (
                          <span>{lastMsg.text}</span>
                        )}
                      </>
                    ) : (
                      <span className="italic opacity-60">No messages yet</span>
                    )}
                  </p>

                  {/* Unread dot indicator */}
                  {chan.unread ? (
                    <span className="h-2 w-2 rounded-full bg-[var(--caramel)] shrink-0 animate-pulse shadow-[0_0_6px_var(--caramel)]" />
                  ) : (
                    !isMeLast && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 opacity-40" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
