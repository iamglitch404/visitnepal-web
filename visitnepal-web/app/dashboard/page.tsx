'use client';

import React, { useState, useEffect, useRef } from 'react';
import DiscoverSection from '@/components/features/dashboard/DiscoverSection';
import ActivitiesSection from '@/components/features/dashboard/ActivitiesSection';
import LeftSidebar from '@/components/features/dashboard/LeftSidebar';
import RightSidebar from '@/components/features/dashboard/RightSidebar';
import InfoDetailPanel from '@/components/features/info/InfoDetailPanel';
import StaysSection from '@/components/features/dashboard/StaysSection';
import GuidesPermitsSection from '@/components/features/dashboard/GuidesPermitsSection';
import AccountSection from '@/components/features/dashboard/AccountSection';
import HostSection from '@/components/features/dashboard/HostSection';
import { useTravelStore } from '@/store/useTravelStore';
import { useRouter } from 'next/navigation';

// ─── Icon primitives (inline SVG to avoid import issues) ──────────────────────
const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// ─── Type Definitions ─────────────────────────────────────────────────────────
type NavItem = { label: string; icon: string; id: string; badge?: string };
type NavGroup = { title: string; items: NavItem[] };

// ─── Sidebar Data ─────────────────────────────────────────────────────────────
const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Discover',
    items: [
      { id: 'home',        label: 'Home',            icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
      { id: 'customize',   label: 'Customize Trip',  icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
      { id: 'explore',     label: 'Explore',         icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z' },
      { id: 'popular',     label: 'Popular',         icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
      { id: 'attractions', label: 'Attractions',     icon: 'M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z' },
      { id: 'top5',        label: 'Top 5 Destinations', icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
    ],
  },
  {
    title: 'Activities & Travel',
    items: [
      { id: 'activities',     label: 'Activities',          icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
      { id: 'trekking',       label: 'Trekking',            icon: 'M3 17l4-8 4 4 4-6 4 10' },
      { id: 'mountaineering', label: 'Mountaineering',      icon: 'M8 3l4 8 5-5 5 13H2L8 3z' },
      { id: 'wildlife',       label: 'Wildlife',            icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
      { id: 'cultural',       label: 'Cultural & Religious',  icon: 'M12 22V12M12 12C12 12 7 9 7 4a5 5 0 0110 0c0 5-5 8-5 8z' },
      { id: 'ecotourism',     label: 'Eco Tourism',         icon: 'M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z' },
      { id: 'adventure',      label: 'Adventure',           icon: 'M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z' },
    ],
  },
  {
    title: 'Stays & Transport',
    items: [
      { id: 'hotels',        label: 'Hotels',          icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
      { id: 'transportation', label: 'Transportation', icon: 'M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2h-3' },
    ],
  },
  {
    title: 'Guides & Permits',
    items: [
      { id: 'guides',  label: 'Guides',  icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' },
      { id: 'permits', label: 'Permits', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' },
    ],
  },
  {
    title: 'Host & List',
    items: [
      { id: 'becomehost',     label: 'Become a Host',        icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
      { id: 'listproperty',   label: 'List Your Property',   icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
      { id: 'listattraction', label: 'List an Attraction',   icon: 'M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z' },
      { id: 'listpermit',     label: 'Permit Authority',     icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' },
    ],
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [active, setActive] = useState(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('section') || sp.get('from') || 'home';
    }
    return 'home';
  });
  const [previousActive, setPreviousActive] = useState('explore');

  useEffect(() => {
    const handlePopState = () => {
      const sp = new URLSearchParams(window.location.search);
      const section = sp.get('section') || 'home';
      setActive(section);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleActiveChange = (newActiveId: string) => {
    if (['everest', 'pokhara', 'kathmandu', 'chitwan', 'mustang'].includes(newActiveId)) {
      setPreviousActive(active);
      window.history.pushState(null, '', `/info/${newActiveId}?from=${active}`);
    } else {
      window.history.pushState(null, '', `/dashboard?section=${newActiveId}`);
    }
    setActive(newActiveId);
  };
  const [collapsed, setCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [isFullExpanded, setIsFullExpanded] = useState(false);
  const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const [rightSidebarTab, setRightSidebarTab] = useState<'telemetry' | 'chat'>('telemetry');
  const [chatViewState, setChatViewState] = useState<'inbox' | 'conversation'>('inbox');
  const [chatInput, setChatInput] = useState('');
  
  // Messenger premium extra states
  const [floatingChatOpen, setFloatingChatOpen] = useState(false);
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
  const floatingChatEndRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll chat window to bottom
  useEffect(() => {
    if (rightSidebarTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channels, rightSidebarTab, activeChannelId]);

  // Auto-scroll floating chat window to bottom
  useEffect(() => {
    if (floatingChatOpen) {
      floatingChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channels, floatingChatOpen, activeChannelId]);

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

  const getActiveItemDetails = () => {
    for (const group of NAV_GROUPS) {
      const found = group.items.find(item => item.id === active);
      if (found) {
        return { groupTitle: group.title, itemLabel: found.label };
      }
    }
    return { groupTitle: 'Discover', itemLabel: 'Home' };
  };

  const activeDetails = getActiveItemDetails();

  // Dynamic weather mappings based on active section
  const getWeatherInfo = () => {
    if (['trekking', 'mountaineering', 'top5'].includes(active)) {
      return { region: 'Khumbu Peak Station', temp: '-6°C', status: 'Windy, Clear', alert: 'Altitude Warning: 5k m+' };
    }
    if (['adventure', 'explore'].includes(active)) {
      return { region: 'Pokhara Valley', temp: '24°C', status: 'Light Rain', alert: 'Paragliding Active' };
    }
    if (['wildlife'].includes(active)) {
      return { region: 'Chitwan Jungles', temp: '31°C', status: 'Humid, Sunny', alert: 'Tiger Spotting Active' };
    }
    return { region: 'Kathmandu Gateway', temp: '22°C', status: 'Sunny', alert: 'Safe Altitude (1,400m)' };
  };

  const weather = getWeatherInfo();

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

  // Group resolver helper to know which Section view component to render
  const renderActiveSection = () => {
    if (['home', 'explore', 'popular', 'attractions', 'top5'].includes(active)) {
      return <DiscoverSection activeId={active} onNavigate={handleActiveChange} />;
    }
    if (['activities', 'trekking', 'mountaineering', 'wildlife', 'cultural', 'ecotourism', 'adventure'].includes(active)) {
      return <ActivitiesSection activeId={active} onNavigate={handleActiveChange} />;
    }
    if (['hotels', 'transportation'].includes(active)) {
      return <StaysSection activeId={active} />;
    }
    if (['guides', 'permits'].includes(active)) {
      return <GuidesPermitsSection activeId={active} />;
    }
    if (['login', 'bookings', 'pasttrips', 'messages', 'customize'].includes(active)) {
      return <AccountSection activeId={active} />;
    }
    if (['becomehost', 'listproperty', 'listattraction', 'listpermit'].includes(active)) {
      return <HostSection activeId={active} />;
    }
    return <DiscoverSection activeId="home" />;
  };

  const renderSingleChatView = (activeChan: typeof channels[0], showBackButton: boolean) => {
    return (
      <div className="flex flex-col flex-1 min-h-0 px-1 py-1">
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
                        <div className="flex flex-col gap-1">
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

        <div className="flex gap-1 overflow-x-auto pb-1.5 pt-1.5 select-none scrollbar-none border-t border-[var(--waffle)]/10 shrink-0">
          {(activeChan.id === 'ch-ai'
            ? [
                { label: 'Everest Weather', icon: <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> },
                { label: 'Permit Status', icon: <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg> },
                { label: 'Buddhist Monasteries', icon: <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
              ]
            : activeChan.id === 'ch-g1'
            ? [
                { label: 'Oxygen Calibrate', icon: <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg> },
                { label: 'Meet at Pokhara', icon: <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="3 20 12 4 21 20 3 20"/></svg> },
                { label: 'Gear Checklist', icon: <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> }
              ]
            : [
                { label: 'Drone Dinner', icon: <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="10"/><circle cx="12" cy="12" r="2"/><path d="M12 14v5M9 19h6"/></svg> },
                { label: 'Room Temp 20°C', icon: <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg> },
                { label: 'Airport Transport', icon: <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> }
              ]
          ).map((chip) => (
            <button
              key={chip.label}
              onClick={() => setChatInput(chip.label)}
              className="text-[8.5px] font-mono bg-[var(--vanilla)] border border-[var(--waffle)]/25 hover:border-[var(--caramel)]/40 text-[#7A6258] hover:text-[var(--foreground)] px-2.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              {chip.icon}
              {chip.label}
            </button>
          ))}
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

  const activeChannelObj = channels.find(c => c.id === activeChannelId) || channels[0];

  return (
    <div className="h-screen flex flex-col overflow-hidden relative" style={{ background: 'var(--background)', color: 'var(--foreground)', fontFamily: 'var(--font-sans)' }}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header
        style={{
          background: 'rgba(252, 249, 242, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(194,147,103,0.12)',
          boxShadow: '0 2px 20px rgba(61,45,39,0.06)',
        }}
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-3.5"
      >
        <div className="flex items-center gap-2.5 select-none">
          <div
            style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)', boxShadow: '0 2px 8px rgba(194,147,103,0.35)' }}
            className="h-7 w-7 rounded-lg flex items-center justify-center font-black text-sm text-white"
          >
            N
          </div>
          <span className="text-xs font-black tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)', color: 'var(--foreground)' }}>
            Visit Nepal
          </span>
        </div>

        {/* Global Profile Gateway */}
        <div className="flex items-center gap-3 relative">
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
              title="Himalayan Weather"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={rightSidebarTab === 'telemetry' ? '#0ea5e9' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
              </svg>
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-sky-400 animate-ping" />
            </button>
          </div>

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
            title="Chat"
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
                onClick={() => { setActive('customize'); setProfileDropdownOpen(false); }}
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
                onClick={() => { setActive('bookings'); setProfileDropdownOpen(false); }}
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
              <button 
                onClick={() => { setActive('pasttrips'); setProfileDropdownOpen(false); }}
                className="px-4 py-2 text-left text-[11px] hover:bg-[var(--vanilla)] text-[#7A6258] hover:text-[var(--foreground)] transition-colors flex items-center gap-2.5 font-medium cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>Past Trips</span>
              </button>
              <div className="border-t border-[var(--waffle)]/20 my-1" />

              <button 
                onClick={() => {
                  useTravelStore.getState().logoutUser();
                  router.push('/login');
                  setProfileDropdownOpen(false);
                }}
                className="px-4 py-2 text-left text-[11px] hover:bg-[var(--vanilla)] text-[var(--caramel)] font-bold transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── BODY (Sidebar + Content) ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
        <LeftSidebar
          navGroups={NAV_GROUPS}
          activeId={['everest', 'pokhara', 'kathmandu', 'chitwan', 'mustang'].includes(active) ? previousActive : active}
          onActiveChange={handleActiveChange}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />

        {/* ── MAIN CONTENT CANVAS ───────────────────────────────────────── */}
        {['everest', 'pokhara', 'kathmandu', 'chitwan', 'mustang'].includes(active) ? (
          <InfoDetailPanel 
            slug={active} 
            onBack={() => handleActiveChange(previousActive)} 
            rightCollapsed={rightCollapsed} 
            setRightCollapsed={setRightCollapsed} 
          />
        ) : (
          <div className="flex-1 flex flex-col min-w-0 relative">
            <div 
              style={{
                background: 'rgba(255,252,246,0.0)',
                borderBottom: 'none',
                boxShadow: '0 4px 24px rgba(61,45,39,0.05)',
              }}
              className="flex items-center justify-between px-6 py-3.5 select-none relative z-10"
            >
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#A89286]">
                <span className="uppercase tracking-wider font-bold">{activeDetails.groupTitle}</span>
                <span className="text-[#C29367] opacity-60">/</span>
                <span className="text-[var(--caramel)] font-bold">{activeDetails.itemLabel}</span>
              </div>

              <div className="flex items-center max-w-xs w-full relative">
                <span className="absolute left-3.5 text-[#A89286] flex items-center justify-center pointer-events-none">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input 
                  type="text" 
                  placeholder="Search landmarks, guides, stays..."
                  className="w-full bg-[var(--background)]/85 border border-[var(--waffle)]/35 text-[11px] rounded-full pl-9 pr-4 py-2 text-[var(--foreground)] focus:outline-none focus:border-[var(--caramel)]/50 font-sans tracking-wide transition-all shadow-inner placeholder-[#A89286]/70"
                />
              </div>
            </div>

            <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-10 md:p-10 min-h-0 relative z-10">
              {renderActiveSection()}
            </main>
          </div>
        )}

        {/* ── RIGHT SIDEBAR ─────────────────────────────────────────────── */}
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
          weather={weather}
          calendarMarks={calendarMarks}
          onCalendarMarksChange={setCalendarMarks}
          userNote={userNote}
          onUserNoteChange={setUserNote}
          companyNote={companyNote}
          onCompanyNoteChange={setCompanyNote}
          renderSingleChatView={renderSingleChatView}
        />

      </div>

      {/* ── ACTION CALL / VIDEO STREAM OVERLAY NOTIFICATION ───────────────── */}
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

      {/* ── GLOBAL FLOATING MESSENGER CHAT BOX ──────────────────────────── */}
      <div className={`fixed inset-x-0 bottom-0 sm:bottom-6 sm:right-6 sm:left-auto z-[100] font-sans flex flex-col items-end ${!rightCollapsed ? 'xl:hidden' : ''}`}>
        {floatingChatOpen ? (
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(255,254,250,0.98) 0%, rgba(250,243,227,0.98) 100%)',
              border: '1px solid rgba(194,147,103,0.22)',
              boxShadow: '0 12px 40px rgba(61,45,39,0.12)',
            }}
            className="w-full sm:w-[350px] h-[85vh] sm:h-[480px] rounded-t-[28px] sm:rounded-[24px] flex flex-col overflow-hidden sm:mb-3 animate-in slide-in-from-bottom duration-300 select-none text-left"
          >
            {(() => {
              const activeChan = channels.find(c => c.id === activeChannelId) || channels[0];
              return (
                <>
                  <div className="bg-gradient-to-r from-[var(--vanilla)] to-[#FAF3E3] p-3.5 border-b border-[var(--waffle)]/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative h-8.5 w-8.5 rounded-full overflow-hidden border border-[var(--caramel)]/30 shrink-0">
                        <img src={activeChan.avatar} alt={activeChan.name} className="h-full w-full object-cover" />
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold text-[var(--foreground)] truncate leading-none">{activeChan.name}</h4>
                        <span className="text-[7.5px] font-mono text-[#A89286] uppercase tracking-wider block mt-0.5">{activeChan.role}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleActionAlert("Starting holographic voice call link...", activeChan.name)}
                        className="h-6.5 w-6.5 rounded-full bg-white/70 hover:bg-white border border-[var(--waffle)]/20 text-[#7A6258] hover:text-[var(--caramel)] flex items-center justify-center cursor-pointer transition-colors"
                        title="Voice Call"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      </button>

                      <button
                        onClick={() => handleActionAlert("Opening secure satellite video stream...", activeChan.name)}
                        className="h-6.5 w-6.5 rounded-full bg-white/70 hover:bg-white border border-[var(--waffle)]/20 text-[#7A6258] hover:text-[var(--caramel)] flex items-center justify-center cursor-pointer transition-colors"
                        title="Video Stream"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 7l-7 5 7 5V7z" />
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                      </button>

                      <button
                        onClick={() => setFloatingChatOpen(false)}
                        className="h-6.5 w-6.5 rounded-full bg-white/70 hover:bg-white border border-[var(--waffle)]/20 text-[#7A6258] hover:text-rose-500 flex items-center justify-center cursor-pointer transition-colors"
                        title="Minimize"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="px-3 py-1.5 border-b border-[var(--waffle)]/15 flex gap-2 overflow-x-auto select-none bg-[var(--background)]/30 scrollbar-none shrink-0">
                    {channels.map((ch) => {
                      const isActive = activeChannelId === ch.id;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => setActiveChannelId(ch.id)}
                          style={{
                            background: isActive ? 'var(--caramel)' : 'var(--vanilla)',
                            color: isActive ? 'white' : '#7A6258',
                            border: isActive ? '1px solid var(--caramel)' : '1px solid rgba(194,147,103,0.15)'
                          }}
                          className="px-2.5 py-0.5 rounded-full text-[8.5px] font-bold transition-all shrink-0 cursor-pointer hover:opacity-95"
                        >
                          {ch.id === 'ch-ai' ? 'AURA' : ch.id === 'ch-g1' ? 'Nima' : 'Host'}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 bg-white/40 scrollbar-none">
                    {activeChan.messages.map((msg) => {
                      const isMe = msg.sender === 'user';
                      return (
                        <div key={msg.id} className={`flex items-start gap-1.5 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start flex-row'}`}>
                          {!isMe && (
                            <img src={activeChan.avatar} alt={activeChan.name} className="h-5 w-5 rounded-full object-cover border border-[var(--waffle)]/25 mt-0.5 shrink-0" />
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
                                className={`rounded-2xl px-2.5 py-1.5 text-[9.5px] leading-relaxed shadow-sm relative flex flex-col ${
                                  isMe ? 'rounded-tr-xs' : 'rounded-tl-xs'
                                }`}
                              >
                                {msg.isVoice ? (
                                  <div className="flex items-center gap-1.5 py-0.5 px-0.5 select-none">
                                    <button className="h-4.5 w-4.5 rounded-full bg-[var(--caramel)] text-white flex items-center justify-center cursor-pointer shrink-0">
                                      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5,3 19,12 5,21"/></svg>
                                    </button>
                                    <div className="flex items-center gap-0.5 h-3.5">
                                      <span className="h-1.5 w-[1.2px] bg-[var(--caramel)]/40 rounded animate-pulse" />
                                      <span className="h-3 w-[1.2px] bg-[var(--caramel)]/70 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
                                      <span className="h-2 w-[1.2px] bg-[var(--caramel)] rounded animate-pulse" style={{ animationDelay: '200ms' }} />
                                      <span className="h-3.5 w-[1.2px] bg-[var(--caramel)] rounded animate-pulse" style={{ animationDelay: '300ms' }} />
                                      <span className="h-1.5 w-[1.2px] bg-[var(--caramel)]/30 rounded animate-pulse" />
                                    </div>
                                    <span className={`text-[6.5px] font-mono font-bold shrink-0 ${isMe ? 'text-white/80' : 'text-[#A89286]'}`}>{msg.duration || '0:06'}</span>
                                  </div>
                                ) : msg.text === '👍' ? (
                                  <span className="text-xl filter drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.15)] animate-bounce inline-block select-none cursor-pointer">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                                  </span>
                                ) : msg.translatedText ? (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="italic text-[8px] opacity-80 leading-normal">"{msg.text}"</span>
                                    <span className="font-semibold border-t border-[var(--waffle)]/15 pt-0.5 mt-0.5">{msg.translatedText}</span>
                                  </div>
                                ) : (
                                  <span>{msg.text}</span>
                                )}
                                
                                <div className="flex items-center justify-between gap-2.5 mt-1 shrink-0 select-none">
                                  {!isMe && !msg.translatedText && !msg.isVoice && (
                                    <button 
                                      onClick={() => toggleTranslation(activeChan.id, msg.id)}
                                      className="text-[6.5px] font-mono font-bold text-[var(--caramel)] hover:underline uppercase cursor-pointer leading-none"
                                    >
                                      Translate
                                    </button>
                                  )}
                                  <span className={`text-[6px] font-mono ml-auto leading-none ${isMe ? 'text-white/70' : 'text-[#A89286]'}`}>
                                    {msg.timestamp}
                                  </span>
                                </div>

                                {reactions[msg.id] && (
                                  <span className="absolute -bottom-1.5 -right-1 bg-white border border-[var(--waffle)]/25 rounded-full px-1.5 py-0.2 text-[7.5px] shadow-sm select-none">
                                    {reactions[msg.id]}
                                  </span>
                                )}
                              </div>

                              <div className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10 flex items-center gap-0.5 bg-white shadow-[0_2px_10px_rgba(61,45,39,0.08)] border border-[var(--waffle)]/20 rounded-full px-1.5 py-0.5 scale-90"
                                style={isMe ? { right: 'calc(100% + 5px)' } : { left: 'calc(100% + 5px)' }}
                              >
                                {['❤️', '👍', '😂', '😮', '😢', '🙏'].map(emoji => (
                                  <button
                                    key={emoji}
                                    onClick={() => toggleReaction(msg.id, emoji)}
                                    className="hover:scale-125 transition-transform duration-100 cursor-pointer text-[9px] p-0.5"
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
                      <div className="flex items-end gap-1.5 max-w-[85%] self-start flex-row">
                        <img src={activeChan.avatar} alt={activeChan.name} className="h-5 w-5 rounded-full object-cover border border-[var(--waffle)]/25 mt-0.5 shrink-0" />
                        <div className="bg-white/90 border border-[var(--waffle)]/15 rounded-2xl rounded-tl-xs px-2 py-1 flex items-center gap-1 shadow-sm">
                          <span className="h-1 w-1 bg-[var(--caramel)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1 w-1 bg-[var(--caramel)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1 w-1 bg-[var(--caramel)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={floatingChatEndRef} />
                  </div>

                  <div className="px-3.5 py-1.5 flex gap-1 overflow-x-auto select-none bg-[var(--background)]/10 scrollbar-none border-t border-[var(--waffle)]/10 shrink-0">
                    {(activeChan.id === 'ch-ai' 
                      ? ['Everest Weather', 'Permit Status', 'Buddhist Monasteries'] 
                      : activeChan.id === 'ch-g1'
                      ? ['Oxygen Calibrate', 'Meet at Pokhara', 'Gear Checklist']
                      : ['Drone Dinner', 'Room Temp 20°C', 'Airport Transport']
                    ).map((phrase) => (
                      <button
                        key={phrase}
                        onClick={() => setChatInput(phrase)}
                        className="text-[8px] font-mono bg-[var(--vanilla)] border border-[var(--waffle)]/25 hover:border-[var(--caramel)]/40 text-[#7A6258] hover:text-[var(--foreground)] px-2 py-0.5 rounded-full transition-all cursor-pointer whitespace-nowrap"
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 border-t border-[var(--waffle)]/15 bg-[var(--background)]/90 flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleActionAlert("Accessing media gallery to attach trip documents...", activeChan.name)}
                      className="h-6.5 w-6.5 rounded-full flex items-center justify-center text-[#7A6258] hover:text-[var(--caramel)] hover:bg-[var(--vanilla)] transition-colors cursor-pointer shrink-0 border border-[var(--waffle)]/20"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </button>
                    <button
                      onClick={() => sendVoiceMessage(activeChan.id, '0:06')}
                      className="h-6.5 w-6.5 rounded-full flex items-center justify-center text-[#7A6258] hover:text-[var(--caramel)] hover:bg-[var(--vanilla)] transition-colors cursor-pointer shrink-0 border border-[var(--waffle)]/20"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                    </button>

                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                      placeholder="Write message..."
                      className="flex-1 bg-white border border-[var(--waffle)]/35 rounded-full px-2.5 py-1 text-[9.5px] text-[var(--foreground)] placeholder-[#A89286]/60 focus:outline-none focus:border-[var(--caramel)]/50 transition-all shadow-inner"
                    />

                    {chatInput.trim() === '' ? (
                      <button
                        onClick={() => sendMessage(activeChannelId, '👍', 'user')}
                        className="h-6.5 w-6.5 rounded-full flex items-center justify-center bg-[var(--vanilla)] hover:bg-[var(--waffle)]/40 text-[#7A6258] hover:text-[var(--caramel)] transition-all cursor-pointer shrink-0 border border-[var(--waffle)]/25 active:scale-90"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                      </button>
                    ) : (
                      <button
                        onClick={handleSendMessage}
                        style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
                        className="h-6.5 w-6.5 rounded-full flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all shrink-0 shadow-sm"
                      >
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        ) : null}

        <button
          onClick={() => {
            setFloatingChatOpen(!floatingChatOpen);
            setRightCollapsed(false);
          }}
          style={{
            background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)',
            boxShadow: '0 4px 18px rgba(194,147,103,0.4)',
          }}
          className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full text-white transition-all active:scale-90 cursor-pointer relative hover:scale-105 duration-200 border border-white/20 animate-bounce"
          title="Messenger"
        >
          {floatingChatOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <div className="relative flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="absolute -top-2.5 -right-2.5 h-4.5 w-4.5 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center border-2 border-white shadow-sm font-mono">
                3
              </span>
            </div>
          )}
        </button>
      </div>

      {/* ── MOBILE STICKY BOTTOM NAVIGATION ─────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FCF9F2]/90 backdrop-blur-lg border-t border-[#3D2D27]/8 px-4 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(61,45,39,0.08)]">
        <button 
          onClick={() => handleActiveChange('home')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            active === 'home' ? 'text-[var(--caramel)] bg-[var(--vanilla)]/50' : 'text-[#7A6258]'
          }`}
        >
          <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" size={18} />
          <span className="text-[9px] font-mono font-bold tracking-wide">Home</span>
        </button>
        <button 
          onClick={() => handleActiveChange('explore')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            active === 'explore' ? 'text-[var(--caramel)] bg-[var(--vanilla)]/50' : 'text-[#7A6258]'
          }`}
        >
          <Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" size={18} />
          <span className="text-[9px] font-mono font-bold tracking-wide">Explore</span>
        </button>
        <button 
          onClick={() => {
            setActiveChannelId('ch-ai');
            setFloatingChatOpen(o => !o);
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
            floatingChatOpen ? 'text-[var(--caramel)] bg-[var(--vanilla)]/50' : 'text-[#7A6258]'
          }`}
        >
          <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" size={18} />
          <span className="absolute top-1.5 right-4 h-1.5 w-1.5 rounded-full bg-red-500" />
          <span className="text-[9px] font-mono font-bold tracking-wide">Aura AI</span>
        </button>
        <button 
          onClick={() => handleActiveChange('hotels')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            active === 'hotels' ? 'text-[var(--caramel)] bg-[var(--vanilla)]/50' : 'text-[#7A6258]'
          }`}
        >
          <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" size={18} />
          <span className="text-[9px] font-mono font-bold tracking-wide">Stays</span>
        </button>
        <button 
          onClick={() => handleActiveChange('customize')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            active === 'customize' ? 'text-[var(--caramel)] bg-[var(--vanilla)]/50' : 'text-[#7A6258]'
          }`}
        >
          <Icon d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" size={18} />
          <span className="text-[9px] font-mono font-bold tracking-wide">Planner</span>
        </button>
      </div>

    </div>
  );
}
