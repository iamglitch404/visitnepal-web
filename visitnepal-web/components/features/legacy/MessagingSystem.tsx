'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTravelStore, Message } from '@/store/useTravelStore';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  Languages, 
  Sparkles, 
  Bot, 
  MapPin, 
  Volume2, 
  UserCheck, 
  AlertCircle,
  Clock,
  Compass,
  Cpu,
  X,
  Radio,
  Cloud,
  FileCheck,
  Helicopter,
  Wind,
  Plane,
  Thermometer,
  UtensilsCrossed
} from 'lucide-react';

export default function MessagingSystem() {
  const { 
    channels, 
    activeChannelId, 
    setActiveChannelId, 
    sendMessage, 
    sendVoiceMessage, 
    toggleTranslation,
    setTyping,
    currentUser,
    guides
  } = useTravelStore();

  const [textInput, setTextInput] = useState('');
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const recordInterval = useRef<any>(null);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const activeChannel = channels.find(ch => ch.id === activeChannelId) || channels[0];

  // Scroll to bottom on message updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannel?.messages, activeChannel?.typing]);

  // Handle typing indicator simulation
  useEffect(() => {
    if (activeChannelId === 'ch-ai' || activeChannelId === 'ch-g1') {
      // Periodic guide check ins
    }
  }, [activeChannelId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    sendMessage(activeChannel.id, textInput, 'user');
    const msgText = textInput;
    setTextInput('');

    // Trigger service provider simulation reply
    setTyping(activeChannel.id, true);
    
    setTimeout(() => {
      setTyping(activeChannel.id, false);
      let replyText = 'Understood! I am checking the coordination logs right now.';
      
      if (activeChannel.id === 'ch-ai') {
        const query = msgText.toLowerCase();
        if (query.includes('weather')) {
          replyText = 'Satellite monitoring displays clear skies near Everest region. Perfect for departure!';
        } else if (query.includes('permit')) {
          replyText = 'Permit verified on the blockchain. Stand by for local check-ins.';
        } else {
          replyText = 'Tashi Delek! How can I coordinate your Nepal stays, guides, or helicopter plans?';
        }
        sendMessage(activeChannel.id, replyText, 'ai');
      } else if (activeChannel.id === 'ch-g1') {
        replyText = 'Got it. I\'ve pre-locked your oxygen canisters and satellite communicator links. Meet you in Pokhara Lakeside!';
        sendMessage(activeChannel.id, replyText, 'provider');
      } else {
        replyText = 'Shangri-La Desk confirms! Your Zen Suite is calibrated. Dinner will be delivered via drone.';
        sendMessage(activeChannel.id, replyText, 'provider');
      }
    }, 2000);
  };

  // Simulating Voice Recording
  const startRecording = () => {
    setIsRecording(true);
    setRecordSecs(0);
    recordInterval.current = setInterval(() => {
      setRecordSecs(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    clearInterval(recordInterval.current);
    setIsRecording(false);
    
    const minutes = Math.floor(recordSecs / 60);
    const secs = recordSecs % 60;
    const durationStr = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    
    sendVoiceMessage(activeChannel.id, durationStr);
    setRecordSecs(0);
  };

  const handleSuggestionClick = (phrase: string) => {
    setTextInput(phrase);
  };

  // Chat Suggestion Chips based on Channel
  type SuggestionChip = { label: string; icon: React.ReactNode };
  const suggestions: SuggestionChip[] = activeChannel.id === 'ch-ai'
    ? [
        { label: 'Everest Weather', icon: <Cloud className="h-3 w-3" /> },
        { label: 'Permit Status', icon: <FileCheck className="h-3 w-3" /> },
        { label: 'Heli Charter', icon: <Helicopter className="h-3 w-3" /> }
      ]
    : activeChannel.id === 'ch-g1'
    ? [
        { label: 'Oxygen pod limits', icon: <Wind className="h-3 w-3" /> },
        { label: 'Pokhara airstrip', icon: <Plane className="h-3 w-3" /> },
        { label: 'Trek gear check', icon: <Compass className="h-3 w-3" /> }
      ]
    : [
        { label: 'Drone dinner order', icon: <UtensilsCrossed className="h-3 w-3" /> },
        { label: 'Room temp 20°C', icon: <Thermometer className="h-3 w-3" /> },
        { label: 'Airport shuttle', icon: <Plane className="h-3 w-3" /> }
      ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      
      {/* Header Info */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-cyan-400" />
          <h2 className="text-xl font-bold tracking-wide text-white">Quantum Chat & Translators</h2>
        </div>
        <p className="text-xs text-zinc-400 font-mono">
          Direct cognitive communication channel to local guides, boutique hotel hosts, and custom AURA AI butler terminals.
        </p>
      </section>

      {/* Nearby providers round float cards */}
      <section className="flex flex-col gap-2.5">
        <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-cyan-400" /> Nearby service nodes (within 5km)
        </h4>
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
          {guides.map((guide) => (
            <div 
              key={guide.id}
              onClick={() => {
                // If a channel already exists or we jump to guide
                setActiveChannelId('ch-g1');
              }}
              className="flex items-center gap-2.5 rounded-2xl glass-panel p-2 hover:border-cyan-500/40 cursor-pointer transition-all pr-4 select-none shrink-0"
            >
              <div className="relative">
                <img 
                  src={guide.avatar} 
                  alt={guide.name} 
                  className="h-8 w-8 rounded-full border border-purple-500 object-cover" 
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-zinc-950 animate-ping"></span>
              </div>
              <div className="text-xs">
                <h5 className="font-bold text-white leading-none">{guide.name}</h5>
                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">{guide.type} Guide</span>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2.5 rounded-2xl glass-panel p-2 border border-dashed border-zinc-800 pr-4 select-none shrink-0 text-zinc-500 text-xs">
            <Compass className="h-4.5 w-4.5 text-zinc-600 animate-spin-slow" />
            <span>Scanning helicopter pilots...</span>
          </div>
        </div>
      </section>

      {/* Messaging Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 rounded-2xl glass-panel border border-zinc-800 overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '520px' }}>
        
        {/* Left Side Channels list */}
        <div className="lg:col-span-1 border-r border-zinc-850 flex flex-col bg-zinc-950/65">
          <div className="p-4 border-b border-zinc-850 bg-zinc-950/80 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
            Nodes Synchronized ({channels.length})
          </div>

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
            {channels.map((ch) => {
              const isActive = activeChannelId === ch.id;
              const lastMsg = ch.messages[ch.messages.length - 1];

              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`flex gap-3 items-center rounded-xl p-3 w-full text-left transition-all border ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-950/40 to-zinc-900/10 border-cyan-500/30' 
                      : 'border-transparent hover:bg-white/3'
                  }`}
                >
                  {/* Photo with online indicator */}
                  <div className="relative shrink-0">
                    <img src={ch.avatar} alt={ch.name} className="h-9 w-9 rounded-xl object-cover border border-zinc-800" />
                    {ch.status === 'Online' && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-zinc-950" />
                    )}
                  </div>

                  {/* Text details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-xs font-bold text-white truncate">{ch.name}</h4>
                      {lastMsg && <span className="text-[8px] text-zinc-500 font-mono">{lastMsg.timestamp}</span>}
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5">{ch.role}</p>
                    {lastMsg && (
                      <p className="text-[10px] text-zinc-500 font-mono truncate mt-1">
                        {ch.typing ? (
                          <span className="text-cyan-400 font-black animate-pulse">Typing telemetry response...</span>
                        ) : lastMsg.text}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Message pane */}
        <div className="lg:col-span-2 flex flex-col h-full bg-zinc-950/20">
          
          {/* Active node details */}
          <div className="bg-zinc-950/80 p-4 border-b border-zinc-850 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={activeChannel.avatar} alt={activeChannel.name} className="h-9 w-9 rounded-xl object-cover border border-zinc-800" />
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {activeChannel.id === 'ch-ai' ? <Bot className="h-3.5 w-3.5 text-cyan-400" /> : <UserCheck className="h-3.5 w-3.5 text-purple-400" />}
                  <span>{activeChannel.name}</span>
                </h3>
                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">{activeChannel.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${activeChannel.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-650'}`} />
              <span className="text-[9px] font-mono text-zinc-500 uppercase">{activeChannel.status}</span>
            </div>
          </div>

          {/* Stream of bubbles */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            
            {activeChannel.messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isAi = msg.sender === 'ai';

              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col max-w-[75%] ${isUser ? 'self-end items-end' : 'self-start'}`}
                >
                  <div className={`p-3 rounded-2xl relative group ${
                    isUser 
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-black font-semibold rounded-tr-none shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                      : isAi
                      ? 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none'
                      : 'bg-zinc-900 text-zinc-200 border border-zinc-850 rounded-tl-none'
                  }`}>
                    {/* Voice Memo template */}
                    {msg.isVoice ? (
                      <div className="flex items-center gap-2.5">
                        <Volume2 className="h-4.5 w-4.5 text-cyan-700" />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-mono text-cyan-900 uppercase">Voice Memo</span>
                          <span className="text-xs font-mono">{msg.duration} Recording</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed font-sans">{msg.text}</p>
                    )}

                    {/* Translation Box overlay */}
                    {msg.translatedText && (
                      <div className="mt-2.5 pt-1.5 border-t border-cyan-800/10 text-[10px] font-mono italic text-cyan-900 select-all">
                        Translation: {msg.translatedText}
                      </div>
                    )}

                    {/* Translation Trigger for non-voice messages */}
                    {!msg.isVoice && (
                      <button 
                        onClick={() => toggleTranslation(activeChannel.id, msg.id)}
                        className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-mono text-zinc-500 hover:text-cyan-400 flex items-center gap-0.5"
                        title="Translate under bubble"
                      >
                        <Languages className="h-2.5 w-2.5" /> Translate
                      </button>
                    )}
                  </div>
                  <span className="text-[8px] text-zinc-500 font-mono mt-1">{msg.senderName} • {msg.timestamp}</span>
                </div>
              );
            })}

            {/* Simulated typing dot animation */}
            {activeChannel.typing && (
              <div className="self-start flex flex-col max-w-[70%]">
                <div className="bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-2xl rounded-tl-none p-3 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick chips below */}
          <div className="px-4 py-2 flex flex-wrap gap-1.5 border-t border-zinc-900 bg-zinc-950/20">
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(chip.label)}
                className="text-[9px] font-mono bg-zinc-900 border border-zinc-850 hover:border-cyan-500/40 text-zinc-400 hover:text-cyan-300 px-2.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5"
              >
                {chip.icon}
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form 
            onSubmit={handleSend}
            className="p-3.5 border-t border-zinc-850 bg-zinc-950/80 flex items-center gap-2"
          >
            {/* Record buttons */}
            {isRecording ? (
              <button 
                type="button"
                onClick={stopRecording}
                className="h-9 w-9 bg-rose-500 hover:bg-rose-400 text-white rounded-xl flex items-center justify-center transition-all animate-pulse cursor-pointer shrink-0"
                title="Stop recording"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            ) : (
              <button 
                type="button"
                onClick={startRecording}
                className="h-9 w-9 bg-zinc-900 border border-zinc-800 hover:border-cyan-500 hover:text-cyan-400 text-zinc-400 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
                title="Record voice memo"
              >
                <Mic className="h-4.5 w-4.5" />
              </button>
            )}

            {/* Input message text field */}
            {isRecording ? (
              <div className="flex-1 bg-zinc-900 border border-rose-500/50 rounded-xl px-3 py-2 flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse shrink-0" />
                <span className="text-xs text-rose-300 font-mono">Recording voice... ({recordSecs}s)</span>
                <span className="ml-auto flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="w-0.5 rounded-full bg-rose-400 animate-bounce"
                      style={{ height: `${8 + (i % 3) * 4}px`, animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                </span>
              </div>
            ) : (
              <input 
                type="text" 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Query Himalayan systems..."
                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            )}

            <button 
              type="submit"
              className="h-9 w-9 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-lg"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
