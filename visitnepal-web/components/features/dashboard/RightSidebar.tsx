'use client';

import React from 'react';
import NepalBackgroundMap from '@/components/features/chat/NepalBackgroundMap';
import WeatherTelemetry from '@/components/features/chat/WeatherTelemetry';
import CoPlannerHub from '@/components/features/chat/CoPlannerHub';
import ChatsList, { Channel } from '@/components/features/chat/ChatsList';

export type { Channel };

export interface RightSidebarProps {
  rightCollapsed: boolean;
  onRightCollapsedChange: (val: boolean) => void;
  isFullExpanded: boolean;
  onIsFullExpandedChange: (val: boolean) => void;
  rightSidebarTab: 'telemetry' | 'chat';
  onRightSidebarTabChange: (val: 'telemetry' | 'chat') => void;
  chatViewState: 'inbox' | 'conversation';
  onChatViewStateChange: (val: 'inbox' | 'conversation') => void;
  collapsed: boolean; // Left sidebar collapsed state
  channels: Channel[];
  activeChannelId: string;
  onActiveChannelIdChange: (id: string) => void;
  expandedChannelId: string | null;
  onExpandedChannelIdChange: (id: string | null) => void;
  weather: {
    region: string;
    temp: string;
    status: string;
    alert: string;
  };
  calendarMarks: Record<string, boolean>;
  onCalendarMarksChange: (updater: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  userNote: string;
  onUserNoteChange: (note: string) => void;
  companyNote: string;
  onCompanyNoteChange: (note: string) => void;
  renderSingleChatView: (chan: Channel, showBackButton: boolean) => React.ReactNode;
}

export default function RightSidebar({
  rightCollapsed,
  onRightCollapsedChange,
  isFullExpanded,
  onIsFullExpandedChange,
  rightSidebarTab,
  onRightSidebarTabChange,
  chatViewState,
  onChatViewStateChange,
  collapsed,
  channels,
  activeChannelId,
  onActiveChannelIdChange,
  expandedChannelId,
  onExpandedChannelIdChange,
  weather,
  calendarMarks,
  onCalendarMarksChange,
  userNote,
  onUserNoteChange,
  companyNote,
  onCompanyNoteChange,
  renderSingleChatView,
}: RightSidebarProps) {
  const activeChannelObj = channels.find(c => c.id === activeChannelId) || channels[0];

  return (
    <aside
      style={{
        background: 'rgba(252, 249, 242, 0.72)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderLeft: '1px solid rgba(194,147,103,0.1)',
        boxShadow: 'none',
        width: rightCollapsed 
          ? '56px' 
          : (isFullExpanded 
            ? `calc(100vw - ${collapsed ? '56px' : '232px'})` 
            : '360px'),
        transition: 'width 0.35s cubic-bezier(.4,0,.2,1)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
      className="hidden xl:flex flex-col flex-shrink-0 h-full select-none animate-in slide-in-from-right duration-500 relative z-30"
    >
      {/* Collapse Toggle (Only when collapsed) */}
      {rightCollapsed && (
        <div className="flex flex-col items-center gap-1 py-3 border-b border-[var(--waffle)]/15">
          <button
            onClick={() => { onRightCollapsedChange(false); onIsFullExpandedChange(false); }}
            className="p-1.5 rounded-lg text-[var(--caramel)] hover:bg-[var(--vanilla)] transition-all cursor-pointer flex items-center justify-center"
            title="Expand Sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </div>
      )}

      {/* Sidebar Content */}
      <div className="flex flex-col flex-1 min-h-0 text-left">
        {rightSidebarTab === 'chat' ? (
          /* ── CHAT SECTION ───────────────────────────────────────────── */
          !rightCollapsed ? (
            <div className="flex flex-col flex-1 min-h-0 p-3.5 relative">
              {/* Telemetry Switcher & Section Title */}
              <div 
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 20,
                  background: 'rgba(252, 249, 242, 0.94)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  margin: '-14px -14px 12px -14px',
                  padding: '14px 14px 10px 14px',
                }}
                className="flex items-center justify-between border-b border-[var(--waffle)]/20 shadow-xs"
              >
                <span className="text-[10.5px] font-mono font-bold text-[var(--caramel)] uppercase tracking-wider">
                  {chatViewState === 'inbox' ? 'Chats Inbox' : 'Conversation'}
                </span>
                
                {/* Integrated Expand + Collapse Pill */}
                <div className="flex items-center gap-0.5 bg-[var(--vanilla)]/70 p-0.5 rounded-lg border border-[var(--waffle)]/20 shadow-sm shrink-0">
                  {/* 4-corner maximize icon — expands sidebar full width */}
                  <button
                    onClick={() => {
                      const next = !isFullExpanded;
                      onRightCollapsedChange(false);
                      onIsFullExpandedChange(next);
                      if (next) onExpandedChannelIdChange(null); // reset so placeholder shows
                    }}
                    className={`p-1 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                      (!rightCollapsed && isFullExpanded)
                        ? 'bg-[var(--caramel)] text-white shadow-sm' 
                        : 'text-[#A89286] hover:text-[var(--foreground)]'
                    }`}
                    style={{ width: '20px', height: '20px' }}
                    title={isFullExpanded ? 'Restore Sidebar' : 'Expand Sidebar Full Width'}
                  >
                    {isFullExpanded ? (
                      /* Compress / restore icon when already full */
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
                        <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
                      </svg>
                    ) : (
                      /* 4-corner outward expand icon */
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                        <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                      </svg>
                    )}
                  </button>
                  {/* Right collapse arrow */}
                  <button
                    onClick={() => {
                      if (isFullExpanded) {
                        onIsFullExpandedChange(false);
                      } else {
                        onRightCollapsedChange(true);
                      }
                    }}
                    className={`p-1 rounded-md transition-all cursor-pointer flex items-center justify-center ${
                      rightCollapsed 
                        ? 'bg-[var(--caramel)] text-white shadow-sm font-bold' 
                        : 'text-[#A89286] hover:text-[var(--foreground)]'
                    }`}
                    style={{ width: '20px', height: '20px' }}
                    title="Collapse Sidebar"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>

              {isFullExpanded ? (
                /* ── EXPANDED SPLIT: WhatsApp-style ──────────────────── */
                <div className="flex flex-1 min-h-0 gap-0 overflow-hidden">

                  {/* LEFT PANEL — chat list */}
                  <div
                    style={{ width: '270px', borderRight: '1px solid rgba(194,147,103,0.08)' }}
                    className="flex-shrink-0 flex flex-col overflow-hidden"
                  >
                    {/* Search */}
                    <div className="p-2 border-b border-[var(--waffle)]/10">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--caramel)" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </span>
                        <input type="text" placeholder="Search conversations..." className="w-full bg-[var(--vanilla)]/70 border border-[var(--waffle)]/20 rounded-xl pl-6 pr-3 py-1.5 text-[9px] text-[var(--foreground)] placeholder-[#A89286]/55 focus:outline-none focus:border-[var(--caramel)]/40 transition-all" />
                      </div>
                    </div>
                    {/* Channel List */}
                    <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 p-1.5 scrollbar-none">
                      {channels.map((chan) => {
                        const lastMsg = chan.messages[chan.messages.length - 1];
                        const isAi = chan.id === 'ch-ai';
                        const isMeLast = lastMsg?.sender === 'user';
                        return (
                          <button
                            key={chan.id}
                            onClick={() => onExpandedChannelIdChange(chan.id)}
                            className={`w-full flex items-center gap-2.5 px-2 py-2.5 rounded-lg transition-all duration-150 text-left cursor-pointer group ${
                              expandedChannelId === chan.id
                                ? 'bg-[var(--caramel)]/8'
                                : 'hover:bg-[var(--vanilla)]/50'
                            }`}
                          >
                            <div className="relative shrink-0">
                              <img src={chan.avatar} alt={chan.name} className="h-8 w-8 rounded-full object-cover" />
                              <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white ${isAi ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className={`text-[10.5px] font-semibold truncate leading-none ${expandedChannelId === chan.id ? 'text-[var(--caramel)]' : 'text-[var(--foreground)]'}`}>{chan.name}</h4>
                                <span className="text-[7px] font-mono text-[#A89286] shrink-0">{lastMsg ? lastMsg.timestamp : '—'}</span>
                              </div>
                              <p className="text-[8.5px] text-[#A89286] truncate mt-0.5 leading-tight">
                                {lastMsg ? (isMeLast ? `You: ${lastMsg.isVoice ? '🎙 Voice' : lastMsg.text}` : lastMsg.text) : <span className="italic opacity-40">No messages</span>}
                              </p>
                            </div>
                            {chan.unread && <span className="h-1.5 w-1.5 rounded-full bg-[var(--caramel)] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT PANEL — conversation or placeholder */}
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {expandedChannelId ? renderSingleChatView(channels.find(c => c.id === expandedChannelId) || channels[0], false) : (
                      /* Beautiful "Visit Nepal" branded welcome placeholder */
                      <div className="flex flex-col items-center justify-center flex-1 gap-6 px-8 text-center animate-in fade-in duration-500">
                        {/* Premium Glow Mountain Logo */}
                        <div 
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(194,147,103,0.12) 0%, rgba(245,234,210,0.4) 100%)', 
                            border: '1px solid rgba(194,147,103,0.25)',
                            boxShadow: '0 8px 32px rgba(194,147,103,0.08)'
                          }} 
                          className="h-20 w-20 rounded-3xl flex items-center justify-center shadow-sm relative overflow-hidden"
                        >
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--caramel)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="filter drop-shadow-sm">
                            <path d="M8 3L4 11h8L8 3z" />
                            <path d="M16 8l-5 9h10L16 8z" />
                            <path d="M12 12l-3 6h6l-3-6z" />
                            <path d="M2 20h20" strokeWidth="2" />
                          </svg>
                        </div>
                        
                        <div className="flex flex-col gap-2.5 max-w-[280px]">
                          <h3 className="text-[12.5px] font-mono font-bold tracking-widest text-[var(--caramel)] uppercase">VISIT NEPAL</h3>
                          <p className="text-[9.5px] text-[#A89286] font-mono leading-relaxed">
                            Welcome to your luxury travel dashboard. Select a conversation from the left to coordinate your Himalayan itinerary with local Sherpa guides, AURA AI, or premium concierge services.
                          </p>
                        </div>

                        {/* Quick Action Pills */}
                        <div className="flex flex-wrap gap-1.5 justify-center mt-2 max-w-[320px]">
                          {channels.map(chan => (
                            <button 
                              key={chan.id} 
                              onClick={() => onExpandedChannelIdChange(chan.id)} 
                              className="flex items-center gap-1.5 bg-[var(--vanilla)] border border-[var(--waffle)]/25 hover:border-[var(--caramel)]/50 text-[8.5px] font-mono text-[#7A6258] hover:text-[var(--foreground)] px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs hover:scale-103"
                            >
                              <img src={chan.avatar} alt={chan.name} className="h-4 w-4 rounded-full object-cover border border-white" />
                              <span>{chan.name.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : chatViewState === 'inbox' ? (
                /* ── WHATSAPP-STYLE INBOX LIST ─────────────────────────── */
                <ChatsList
                  channels={channels}
                  onActiveChannelIdChange={onActiveChannelIdChange}
                  onChatViewStateChange={onChatViewStateChange}
                />
              ) : (
                renderSingleChatView(activeChannelObj, true)
              )}
            </div>
          ) : (
            /* Collapsed Chat View */
            <div className="flex flex-col gap-5 py-4 items-center">
              {channels.map((chan) => (
                <div 
                  key={chan.id}
                  onClick={() => { onRightCollapsedChange(false); onActiveChannelIdChange(chan.id); }}
                  className="h-9.5 w-9.5 rounded-full overflow-hidden border-2 border-[var(--caramel)]/30 cursor-pointer hover:border-[var(--caramel)] hover:scale-105 transition-all flex items-center justify-center bg-[var(--vanilla)] relative"
                  title={chan.name}
                >
                  <img src={chan.avatar} alt={chan.name} className="h-full w-full object-cover" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white animate-pulse" />
                </div>
              ))}
            </div>
          )
        ) : (
          /* ── TELEMETRY / STATUS VIEW ────────────────────────────────── */
          <div className="flex flex-col gap-6 p-4">
            {/* 1. Dynamic Weather Telemetry */}
            <WeatherTelemetry
              rightCollapsed={rightCollapsed}
              weather={weather}
            />

            {/* 2. Nepal Map */}
            {!rightCollapsed && (
              <div className="flex flex-col gap-1.5 px-1 overflow-hidden">
                <span className="text-[9px] font-mono font-bold text-[var(--caramel)] uppercase tracking-wider">Nepal Territory Map</span>
                <div className="h-[200px] w-full flex items-center justify-center relative select-none">
                  <NepalBackgroundMap isSidebar={true} />
                </div>
              </div>
            )}

            {/* ── 3. CO-PLANNER HUB ─────────────────────────────── */}
            {!rightCollapsed && (
              <CoPlannerHub
                calendarMarks={calendarMarks}
                onCalendarMarksChange={onCalendarMarksChange}
                userNote={userNote}
                onUserNoteChange={onUserNoteChange}
                companyNote={companyNote}
                onCompanyNoteChange={onCompanyNoteChange}
              />
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
