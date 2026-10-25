'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTravelStore } from '@/store/useTravelStore';
import LeftSidebar from '@/components/features/dashboard/LeftSidebar';
import RightSidebar from '@/components/features/dashboard/RightSidebar';
import InfoDetailPanel from '@/components/features/info/InfoDetailPanel';

import {
  NAV_GROUPS,
  INFO_REGISTRY,
  getNormalizedKey,
  getSidebarActiveId
} from './mockData';

export default function InfoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params?.slug as string;
  const normalizedKey = getNormalizedKey(rawSlug);
  const data = INFO_REGISTRY[normalizedKey];

  // Shell UI Layout States
  const [collapsed, setCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [isFullExpanded, setIsFullExpanded] = useState(false);
  const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [rightSidebarTab, setRightSidebarTab] = useState<'telemetry' | 'chat'>('telemetry');
  const [chatViewState, setChatViewState] = useState<'inbox' | 'conversation'>('inbox');
  const [chatInput, setChatInput] = useState('');
  
  // Messenger states
  const [calendarMarks, setCalendarMarks] = useState<Record<string, boolean>>({});
  const [userNote, setUserNote] = useState('');
  const [companyNote, setCompanyNote] = useState('');
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [actionAlert, setActionAlert] = useState<{ message: string; contactName: string; visible: boolean }>({ message: '', contactName: '', visible: false });

  const { 
    currentUser, 
    channels, 
    activeChannelId, 
    setActiveChannelId, 
    sendMessage, 
    sendVoiceMessage, 
    toggleTranslation, 
    setTyping
  } = useTravelStore();

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat window to bottom
  useEffect(() => {
    if (rightSidebarTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channels, rightSidebarTab, activeChannelId]);

  // Auth Portal verification check
  useEffect(() => {
    if (!currentUser || !currentUser.loggedIn || !currentUser.otpVerified) {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (!currentUser || !currentUser.loggedIn || !currentUser.otpVerified) {
    return (
      <div className="h-screen w-screen bg-[#FDFBF7] flex items-center justify-center font-mono text-xs text-[#7A6258] tracking-widest uppercase">
        <span className="h-2 w-2 bg-[#C29367] rounded-full animate-ping mr-2" />
        Redirecting to travel portal...
      </div>
    );
  }

  const toggleReaction = (msgId: string, emoji: string) => {
    setReactions(prev => {
      if (prev[msgId] === emoji) {
        const updated = { ...prev };
        delete updated[msgId];
        return updated;
      }
      return { ...prev, [msgId]: emoji };
    });
  };

  const handleActionAlert = (message: string, contactName: string) => {
    setActionAlert({ message, contactName, visible: true });
    setTimeout(() => {
      setActionAlert(prev => ({ ...prev, visible: false }));
    }, 4000);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    sendMessage(activeChannelId, userMsg, 'user');
    setChatInput('');
    
    // Trigger mock responses
    setTimeout(() => {
      setTyping(activeChannelId, true);
      setTimeout(() => {
        setTyping(activeChannelId, false);
        
        let replyText = "Namaste! Connecting to the central server in Kathmandu. Let me assist you shortly.";
        if (activeChannelId === 'ch-ai') {
          replyText = `AURA AI Assistant: I've processed your query about "${userMsg}". Telemetry updates show clear coordinates over the Khumbu flight paths. Syncing your itinerary details.`;
        } else if (activeChannelId === 'ch-g1') {
          replyText = `Nima Sherpa (Guide): Noted, Alex! I've packed the altitude safety kit. We are scheduled to start our ascent early Friday morning.`;
        } else if (activeChannelId === 'ch-s1') {
          replyText = `Shangri-La Desk: Welcome! We've updated your room oxygen levels. The robotic dinner delivery has been pre-scheduled for 7 PM.`;
        }
        sendMessage(activeChannelId, replyText, activeChannelId === 'ch-ai' ? 'ai' : 'provider');
      }, 1500);
    }, 800);
  };

  const renderSingleChatView = (activeChan: typeof channels[0], showBackButton: boolean) => {
    return (
      <div className="flex flex-col flex-1 min-h-0 px-1 py-1 text-left">
        <div className="flex items-center justify-between border-b border-[var(--waffle)]/15 pb-2.5 mb-2.5 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {showBackButton && (
              <button 
                onClick={() => setChatViewState('inbox')}
                className="h-7 w-7 rounded-full flex items-center justify-center text-[#7A6258] hover:text-[var(--caramel)] hover:bg-[var(--vanilla)] transition-colors cursor-pointer shrink-0"
                title="Back to Inbox"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
              </button>
            )}

            <div className="relative h-8 w-8 rounded-full overflow-hidden border border-[var(--caramel)]/30 shrink-0">
              <img src={activeChan.avatar} alt={activeChan.name} className="h-full w-full object-cover" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[11px] font-bold text-[var(--foreground)] truncate leading-tight">{activeChan.name}</h4>
              <span className="text-[7.5px] font-mono text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                Active Now
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleActionAlert("Starting secure holographic voice call link...", activeChan.name)}
              className="h-7 w-7 rounded-full flex items-center justify-center text-[#7A6258] hover:text-[var(--caramel)] hover:bg-[var(--vanilla)] transition-colors cursor-pointer"
              title="Voice Call"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </button>
            <button
              onClick={() => handleActionAlert("Opening secure satellite video stream...", activeChan.name)}
              className="h-7 w-7 rounded-full flex items-center justify-center text-[#7A6258] hover:text-[var(--caramel)] hover:bg-[var(--vanilla)] transition-colors cursor-pointer"
              title="Video Stream"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </button>
            <button
              onClick={() => setRightSidebarTab('telemetry')}
              className="h-7 w-7 rounded-full flex items-center justify-center text-[#7A6258] hover:text-[var(--caramel)] hover:bg-[var(--vanilla)] transition-colors cursor-pointer"
              title="Details"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 min-h-0 my-1 py-1 scrollbar-none">
          {activeChan.messages.map((msg) => {
            const isMe = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex items-start gap-2 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start flex-row'}`}>
                {!isMe && (
                  <img src={activeChan.avatar} alt={activeChan.name} className="h-6 w-6 rounded-full object-cover border border-[var(--waffle)]/25 mt-0.5 shrink-0" />
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="relative group">
                    <div 
                      style={{
                        background: isMe 
                          ? 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' 
                          : 'rgba(255, 255, 255, 0.95)',
                        color: isMe ? 'white' : '#5C463C',
                        border: isMe ? 'none' : '1px solid rgba(194,147,103,0.15)'
                      }}
                      className={`rounded-2xl px-3 py-2 text-[10px] leading-relaxed shadow-sm relative flex flex-col ${
                        isMe ? 'rounded-tr-xs' : 'rounded-tl-xs'
                      }`}
                    >
                      {msg.isVoice ? (
                        <div className="flex items-center gap-2 py-0.5 select-none">
                          <button className="h-5 w-5 rounded-full bg-[var(--caramel)] text-white flex items-center justify-center cursor-pointer shrink-0 shadow-sm active:scale-95 transition-all">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>
                          </button>
                          <div className="flex items-center gap-0.5 h-4">
                            <span className="h-2 w-[1.5px] bg-[var(--caramel)]/40 rounded animate-pulse" />
                            <span className="h-3.5 w-[1.5px] bg-[var(--caramel)]/70 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
                            <span className="h-2.5 w-[1.5px] bg-[var(--caramel)] rounded animate-pulse" style={{ animationDelay: '200ms' }} />
                            <span className="h-4.5 w-[1.5px] bg-[var(--caramel)] rounded animate-pulse" style={{ animationDelay: '300ms' }} />
                            <span className="h-2.5 w-[1.5px] bg-[var(--caramel)]/80 rounded animate-pulse" style={{ animationDelay: '400ms' }} />
                            <span className="h-1.5 w-[1.5px] bg-[var(--caramel)]/30 rounded animate-pulse" />
                          </div>
                          <span className={`text-[7px] font-mono font-bold shrink-0 ${isMe ? 'text-white/80' : 'text-[#A89286]'}`}>{msg.duration || '0:06'}</span>
                        </div>
                      ) : msg.text === '👍' ? (
                        <span className="text-2xl filter drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.15)] animate-bounce inline-block select-none cursor-pointer">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                        </span>
                      ) : msg.translatedText ? (
                        <div className="flex flex-col gap-1 text-left">
                          <span className="italic text-[8.5px] opacity-80 leading-normal font-medium">"{msg.text}"</span>
                          <span className="font-bold border-t border-[var(--waffle)]/15 pt-1 mt-0.5">{msg.translatedText}</span>
                        </div>
                      ) : (
                        <span>{msg.text}</span>
                      )}
                      
                      <div className="flex items-center justify-between gap-3 mt-1.5 shrink-0 select-none">
                        {!isMe && !msg.translatedText && !msg.isVoice && (
                          <button 
                            onClick={() => toggleTranslation(activeChan.id, msg.id)}
                            className="text-[7.5px] font-mono font-bold text-[var(--caramel)] hover:underline uppercase cursor-pointer leading-none"
                          >
                            Translate
                          </button>
                        )}
                        <span className={`text-[6.5px] font-mono ml-auto leading-none ${isMe ? 'text-white/70' : 'text-[#A89286]'}`}>
                          {msg.timestamp}
                        </span>
                      </div>

                      {reactions[msg.id] && (
                        <span className="absolute -bottom-2 -right-1 bg-white border border-[var(--waffle)]/25 rounded-full px-1.5 py-0.2 text-[8px] shadow-sm select-none">
                          {reactions[msg.id]}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex items-center gap-1 bg-white/95 backdrop-blur shadow-[0_2px_12px_rgba(61,45,39,0.08)] border border-[var(--waffle)]/25 rounded-full px-1.5 py-0.5 scale-90"
                      style={isMe ? { right: 'calc(100% + 6px)' } : { left: 'calc(100% + 6px)' }}
                    >
                      {['❤️', '👍', '😂', '😮', '😢', '🙏'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(msg.id, emoji)}
                          className="hover:scale-125 transition-transform duration-100 cursor-pointer text-[9.5px] p-0.5"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {activeChan.typing && (
            <div className="flex items-end gap-2 max-w-[85%] self-start flex-row animate-pulse">
              <img src={activeChan.avatar} alt={activeChan.name} className="h-6 w-6 rounded-full object-cover border border-[var(--waffle)]/25 mt-0.5 shrink-0" />
              <div className="bg-white/90 border border-[var(--waffle)]/15 rounded-2xl rounded-tl-xs px-2.5 py-1.5 flex items-center gap-1 shadow-sm">
                <span className="h-1.5 w-1.5 bg-[var(--caramel)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 bg-[var(--caramel)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 bg-[var(--caramel)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="shrink-0 flex items-center gap-2 pt-2 border-t border-[var(--waffle)]/15 mt-1">
          <button
            onClick={() => handleActionAlert("Accessing media gallery to attach trip documents...", activeChan.name)}
            className="h-7 w-7 rounded-full flex items-center justify-center text-[#7A6258] hover:text-[var(--caramel)] hover:bg-[var(--vanilla)] transition-colors cursor-pointer shrink-0 border border-[var(--waffle)]/20"
            title="Attach Photo or Document"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </button>

          <button
            onClick={() => sendVoiceMessage(activeChan.id, '0:06')}
            className="h-7 w-7 rounded-full flex items-center justify-center text-[#7A6258] hover:text-[var(--caramel)] hover:bg-[var(--vanilla)] transition-colors cursor-pointer shrink-0 border border-[var(--waffle)]/20"
            title="Send simulated audio note"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </button>

          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Write message..."
            className="flex-1 bg-white border border-[var(--waffle)]/35 rounded-full px-3.5 py-2 text-[10px] text-[var(--foreground)] placeholder-[#A89286]/60 focus:outline-none focus:border-[var(--caramel)]/50 transition-all shadow-inner"
          />

          {chatInput.trim() === '' ? (
            <button
              onClick={() => sendMessage(activeChan.id, '👍', 'user')}
              className="h-7 w-7 rounded-full flex items-center justify-center bg-[var(--vanilla)] hover:bg-[var(--waffle)]/40 text-[#7A6258] hover:text-[var(--caramel)] transition-all cursor-pointer shrink-0 border border-[var(--waffle)]/25 active:scale-90"
              title="Send Thumbs Up"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            </button>
          ) : (
            <button
              onClick={handleSendMessage}
              style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
              className="h-7 w-7 rounded-full flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shrink-0 shadow-sm"
              title="Send Message"
            >
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  const onSidebarActiveChange = (newActiveId: string) => {
    router.push(`/dashboard?section=${newActiveId}`);
  };

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-[#3D2D27]"
        style={{ background: 'linear-gradient(135deg, #FFFEFA 0%, #FAF3E3 100%)' }}>
        <span className="text-5xl animate-bounce">🏔️</span>
        <h1 className="text-xl font-black">Information Hub</h1>
        <p className="text-xs font-mono text-[#A89286]">Data route for "{rawSlug}" not found in current local mock registry.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #C29367, #A67848)' }}
        >
          ← Back to Main Dashboard
        </button>
      </div>
    );
  }

  const sidebarActiveId = getSidebarActiveId(normalizedKey);
  
  const weatherState = {
    region: data.weather?.region || data.region || 'Nepal Territory',
    temp: data.weather?.temp || 'N/A',
    status: data.weather?.status || 'N/A',
    alert: data.weather?.alert || ''
  };

  return (
    <div className="h-screen max-h-screen flex flex-col overflow-hidden text-[#3D2D27]"
      style={{
        background: 'linear-gradient(135deg, #FFFEFA 0%, #FAF3E3 100%)',
        fontFamily: 'var(--font-sans)',
      }}>
      
      {/* Header */}
      <header className="h-14 border-b border-[var(--waffle)]/25 flex items-center justify-between px-6 py-2 select-none relative z-[80] shrink-0 bg-white/70 backdrop-blur-md">
        <div 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer active:scale-98 transition-transform group"
        >
          <div className="h-8 w-8 rounded-xl bg-[var(--vanilla)] border border-[var(--caramel)]/30 flex items-center justify-center shadow-inner relative overflow-hidden">
            <span className="text-base font-black text-[var(--caramel)] transform group-hover:rotate-12 transition-transform duration-300">🏔️</span>
          </div>
          <span className="text-xs font-black tracking-widest uppercase font-mono text-[var(--foreground)]">
            Visit Nepal
          </span>
        </div>

        <div className="flex items-center gap-3 relative">
          {/* Weather Cloud Button */}
          <div className="relative">
            <button
              onClick={() => {
                setRightCollapsed(false);
                setRightSidebarTab(rightSidebarTab === 'telemetry' ? 'chat' : 'telemetry');
              }}
              style={{
                background: rightSidebarTab === 'telemetry' ? 'rgba(14,165,233,0.12)' : 'transparent',
                border: rightSidebarTab === 'telemetry' ? '1px solid rgba(14,165,233,0.3)' : '1px solid transparent'
              }}
              className="p-1.5 rounded-lg text-[var(--caramel)] hover:bg-[var(--vanilla)] transition-all cursor-pointer flex items-center justify-center relative"
              title="Himalayan Weather & Telemetry"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={rightSidebarTab === 'telemetry' ? '#0ea5e9' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
              </svg>
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            </button>
          </div>

          {/* Satellite Live Chat Link */}
          <button
            onClick={() => {
              if (rightSidebarTab === 'chat') {
                setRightSidebarTab('telemetry');
              } else {
                setRightSidebarTab('chat');
                setRightCollapsed(false);
              }
            }}
            style={{
              background: rightSidebarTab === 'chat' ? 'rgba(194,147,103,0.15)' : 'transparent',
              border: rightSidebarTab === 'chat' ? '1px solid rgba(194,147,103,0.3)' : '1px solid transparent'
            }}
            className="p-1.5 rounded-lg text-[var(--caramel)] hover:bg-[var(--vanilla)] transition-all cursor-pointer relative mr-1 flex items-center justify-center"
            title="Satellite Live Chat Link"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="absolute -top-1 -right-1.5 h-3.5 w-3.5 bg-red-500 rounded-full text-[7px] font-mono font-bold text-white flex items-center justify-center shadow-sm">
              3
            </span>
          </button>

          <div className="text-right hidden sm:block">
            <span className="block text-[10px] font-bold font-sans text-[var(--foreground)] leading-none">
              {currentUser ? currentUser.name : 'Guest Traveler'}
            </span>
            <span className="block text-[8px] font-mono uppercase tracking-widest text-[#A89286] mt-0.5">
              {currentUser ? currentUser.role : 'Offline Access'}
            </span>
          </div>
          <button
            onClick={() => setProfileDropdownOpen(open => !open)}
            className="h-8 w-8 rounded-full overflow-hidden border-2 border-[var(--caramel)]/40 hover:border-[var(--caramel)] transition-colors cursor-pointer bg-[var(--vanilla)] shadow-sm flex items-center justify-center relative"
            title="Account Gateway"
          >
            {currentUser ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--caramel)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </button>

          {profileDropdownOpen && (
            <div 
              style={{
                background: 'linear-gradient(135deg, rgba(255,254,250,0.98) 0%, rgba(250,243,227,0.98) 100%)',
                border: '1px solid rgba(194,147,103,0.18)',
                boxShadow: '0 10px 30px rgba(61,45,39,0.08)',
                borderRadius: '16px',
              }}
              className="absolute top-11 right-0 w-56 py-2.5 z-[100] flex flex-col gap-0.5"
            >
              <div className="px-4 py-2 flex flex-col gap-0.5 border-b border-[var(--waffle)]/20 mb-1 text-left">
                <span className="text-[11px] font-bold text-[var(--foreground)]">
                  {currentUser ? currentUser.name : 'Guest Traveler'}
                </span>
                <span className="text-[9px] font-mono text-[#A89286]">
                  {currentUser ? currentUser.email : 'No verified credential'}
                </span>
              </div>
              <button 
                onClick={() => { router.push('/dashboard'); setTimeout(() => useTravelStore.getState().setActiveSection('customize' as any), 80); setProfileDropdownOpen(false); }}
                className="px-4 py-2 text-left text-[11px] hover:bg-[var(--vanilla)] text-[#7A6258] hover:text-[var(--foreground)] transition-colors flex items-center gap-2.5 font-medium cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03348 19.175 5.09913 19.4326 5.02325 19.673L4.62936 20.9196C4.46979 21.4239 4.90804 21.9056 5.42278 21.7777L6.81226 21.4325C7.03923 21.3761 7.28096 21.4332 7.45857 21.5858C8.79624 21.8558 10.3204 22 12 22Z" />
                  <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" />
                  <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor" />
                  <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor" />
                </svg>
                <span>Customize Trip</span>
              </button>
              <button 
                onClick={() => { router.push('/dashboard'); setTimeout(() => useTravelStore.getState().setActiveSection('bookings'), 80); setProfileDropdownOpen(false); }}
                className="px-4 py-2 text-left text-[11px] hover:bg-[var(--vanilla)] text-[#7A6258] hover:text-[var(--foreground)] transition-colors flex items-center justify-between font-medium cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    <path d="M9 5v14" />
                    <path d="M15 5v14" />
                  </svg>
                  <span>Bookings</span>
                </div>
                <span className="bg-[var(--caramel)]/15 text-[var(--caramel)] font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  2
                </span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Body Layout */}
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          navGroups={NAV_GROUPS}
          activeId={sidebarActiveId}
          onActiveChange={onSidebarActiveChange}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />

        <InfoDetailPanel 
          slug={rawSlug} 
          onBack={() => {
            const fromSection = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('from') || 'explore') : 'explore';
            router.push(`/dashboard?section=${fromSection}`);
          }} 
          rightCollapsed={rightCollapsed}
          setRightCollapsed={setRightCollapsed}
        />

        <RightSidebar
          rightCollapsed={rightCollapsed}
          onRightCollapsedChange={setRightCollapsed}
          isFullExpanded={isFullExpanded}
          onIsFullExpandedChange={setIsFullExpanded}
          rightSidebarTab={rightSidebarTab}
          onRightSidebarTabChange={setRightSidebarTab}
          chatViewState={chatViewState}
          onChatViewStateChange={setChatViewState}
          collapsed={collapsed}
          channels={channels}
          activeChannelId={activeChannelId}
          onActiveChannelIdChange={setActiveChannelId}
          expandedChannelId={expandedChannelId}
          onExpandedChannelIdChange={setExpandedChannelId}
          weather={weatherState}
          calendarMarks={calendarMarks}
          onCalendarMarksChange={setCalendarMarks}
          userNote={userNote}
          onUserNoteChange={setUserNote}
          companyNote={companyNote}
          onCompanyNoteChange={setCompanyNote}
          renderSingleChatView={renderSingleChatView}
        />
      </div>

      {/* Floating Action Alert Popup overlay */}
      {actionAlert.visible && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] max-w-sm w-full px-4 animate-in fade-in slide-in-from-top-6 duration-300">
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(255,254,250,0.98) 0%, rgba(250,243,227,0.95) 100%)',
              border: '1.5px solid var(--caramel)',
              boxShadow: '0 10px 30px rgba(194,147,103,0.25)',
              borderRadius: '16px',
            }}
            className="p-4 flex items-center gap-3"
          >
            <div className="h-9 w-9 rounded-full bg-[var(--vanilla)] border border-[var(--caramel)]/40 flex items-center justify-center text-lg animate-pulse">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h5 className="text-[10px] font-mono font-bold text-[var(--caramel)] uppercase tracking-wider">Holographic Secure Link</h5>
              <p className="text-[11px] font-bold text-[var(--foreground)] mt-0.5 leading-tight">{actionAlert.contactName}</p>
              <p className="text-[9.5px] text-[#7A6258] mt-1 font-medium">{actionAlert.message}</p>
            </div>
            <div className="flex flex-col gap-0.5 items-end justify-center shrink-0">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[8px] font-mono text-[#A89286] mt-1">SECURE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
