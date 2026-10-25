'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTravelStore } from '@/store/useTravelStore';
import Post from '@/components/features/post/PostCard';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Compass, 
  Activity, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Bot,
  Send,
  X,
  Languages,
  Heart,
  MessageCircle,
  Upload,
  Image as ImageIcon,
  Users
} from 'lucide-react';

export default function HomeSection() {
  const { setActiveSection, setCustomPreference, sendMessage, channels, feedPosts, addFeedPost, likeFeedPost, addFeedComment, currentUser } = useTravelStore();
  const [stats, setStats] = useState({ travelers: 12481, permits: 342, guides: 1049, safety: 99.7 });
  const [searchDest, setSearchDest] = useState('');
  const [searchDuration, setSearchDuration] = useState('10');
  const [searchRegion, setSearchRegion] = useState('Everest');
  
  // AI Floating Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');

  // Feed composer state
  const [postContent, setPostContent] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const router = useRouter();

  // Auto-increment stats for live feel
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        travelers: prev.travelers + Math.floor(Math.random() * 3),
        permits: prev.permits + (Math.random() > 0.7 ? 1 : 0),
        guides: prev.guides,
        safety: 99.8 - Math.random() * 0.1
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomPreference('preferredRegion', searchRegion);
    setCustomPreference('duration', parseInt(searchDuration) || 10);
    setActiveSection('customizer');
  };

  const handleSendAiChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Send user message
    sendMessage('ch-ai', chatInput, 'user');
    const userMsg = chatInput;
    setChatInput('');

    // Simulate AI thinking and reply
    setTimeout(() => {
      let reply = "I've processed your query. Let me look at our active satellite coordinates for Nepal...";
      const query = userMsg.toLowerCase();
      
      if (query.includes('weather') || query.includes('rain') || query.includes('snow')) {
        reply = "My telemetry monitors reveal clear skies over Gandaki and Everest, perfect for mountaineering this week. Some high altitude snow is projected for Manang.";
      } else if (query.includes('permit') || query.includes('apply')) {
        reply = "You can apply for high-altitude trekking or Sagarmatha permits instantly in our Permit Command. It generates a verified blockchain QR code.";
      } else if (query.includes('hotel') || query.includes('stay') || query.includes('shangri')) {
        reply = "I recommend the Shangri-La Cyber-Resort in Kathmandu or our luxury Everest Quantum Domes for pressurized orbital domes.";
      } else if (query.includes('trek') || query.includes('route') || query.includes('difficulty')) {
        reply = "For moderate treks, the Annapurna Sanctuary is ideal. For extreme thrills, I suggest the Everest High Passes or Mustang Restricted Lands.";
      } else if (query.includes('namaste') || query.includes('hello')) {
        reply = "Namaste! I am AURA. I can organize your custom flight paths, coordinate sherpa telemetry, or translate languages. Try typing 'weather' or 'permit'!";
      }

      sendMessage('ch-ai', reply, 'ai');
    }, 1500);
  };

  const trendingDestinations = [
    {
      name: 'Mustang Kingdom',
      region: 'Far-North West',
      stat: 'Forbidden Cyber-Trek',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600',
      difficulty: 'High Altitude'
    },
    {
      name: 'Everest Quantum Domes',
      region: 'Khumbu Valley',
      stat: 'Luxury Eco-Dome',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600',
      difficulty: 'Extreme Adventure'
    },
    {
      name: 'Phewa Lakeside Mirror',
      region: 'Pokhara Valley',
      stat: 'Spiritual Biotech Stay',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600',
      difficulty: 'Relaxation'
    }
  ];

  return (
    <div className="relative flex flex-col gap-12 pb-16">
      
      {/* Background Meteor Shower */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute h-[1px] w-[1px] bg-white animate-meteor left-1/4 top-1/4"></div>
        <div className="absolute h-[1px] w-[1px] bg-white animate-meteor left-1/2 top-10"></div>
        <div className="absolute h-[1px] w-[1px] bg-cyan-400 animate-meteor left-3/4 top-1/3"></div>
      </div>

      {/* Cinematic Hero Landing Header */}
      <section className="relative flex flex-col items-center justify-center text-center py-8 lg:py-16">
        
        {/* Glowing badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-1.5 text-xs font-bold text-cyan-400 border border-cyan-500/30 mb-6 animate-pulse">
          <Sparkles className="h-4 w-4 animate-spin-slow text-cyan-400" />
          <span>SATELLITE SYNC: ACTIVE</span>
        </div>

        <h1 className="relative max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl font-sans text-white">
          Explore Nepal Like <br />
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 bg-clip-text text-transparent neon-glow-text-cyan">
            Never Before
          </span>
        </h1>
        
        <p className="mt-6 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base font-mono">
          Integrate AI pathfinders, direct high-altitude satellite link, and luxury glass stays. Experience a premium next-gen ecosystem of adrenaline, culture, and ancient spiritual retreats.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => setActiveSection('customizer')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95"
          >
            <Cpu className="h-4 w-4 text-cyan-200" />
            <span>Launch AI Trip Engine</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <button 
            onClick={() => setActiveSection('explore')}
            className="flex items-center gap-2 rounded-xl bg-white/5 border border-zinc-800 hover:bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition-all active:scale-95"
          >
            <Compass className="h-4 w-4 text-purple-400" />
            <span>Interactive Map Explore</span>
          </button>
        </div>
      </section>

      {/* Floating High-Tech Search Dock */}
      <section className="mx-auto w-full max-w-4xl px-4">
        <form 
          onSubmit={handleSearchSubmit}
          className="rounded-2xl glass-panel p-4 md:p-6 neon-border-cyan grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-2xl"
        >
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Destination Region
            </label>
            <select 
              value={searchRegion}
              onChange={(e) => setSearchRegion(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="Everest">Khumbu (Everest)</option>
              <option value="Annapurna">Annapurna Valley</option>
              <option value="Mustang">Mustang Forbidden</option>
              <option value="Chitwan">Chitwan Safari</option>
              <option value="Lumbini">Lumbini Spiritual</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-mono tracking-widest text-purple-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Duration (Days)
            </label>
            <input 
              type="number"
              value={searchDuration}
              onChange={(e) => setSearchDuration(e.target.value)}
              placeholder="e.g. 10"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-mono tracking-widest text-amber-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Altitude Preference
            </label>
            <select 
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="high">High Altitude (3000m+)</option>
              <option value="low">Sub-Tropical & Lowlands</option>
              <option value="all">Dynamic Altitude Gradient</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs py-2.5 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)] h-[38px]"
          >
            <Search className="h-4 w-4" />
            <span>Search Systems</span>
          </button>
        </form>
      </section>

      {/* Cybernetic Telemetry Live Stats Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 max-w-7xl mx-auto w-full">
        
        <div className="glass-panel p-4 rounded-xl neon-border-purple text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-10 w-10 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10"></div>
          <p className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">Live Active Travelers</p>
          <h3 className="text-2xl font-black text-white font-mono mt-1 neon-glow-text-purple">
            {stats.travelers.toLocaleString()}
          </h3>
          <p className="text-[8px] text-emerald-400 flex items-center justify-center gap-1 mt-1 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            SYNCED UP
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl neon-border-cyan text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-10 w-10 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10"></div>
          <p className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">Blockchain Permits Issued</p>
          <h3 className="text-2xl font-black text-white font-mono mt-1 neon-glow-text-cyan">
            {stats.permits.toLocaleString()}
          </h3>
          <p className="text-[8px] text-cyan-400 flex items-center justify-center gap-1 mt-1 font-mono">
            SECURED BLOCKCHAIN
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl neon-border-emerald text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-10 w-10 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10"></div>
          <p className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">Active Guides Telemetry</p>
          <h3 className="text-2xl font-black text-white font-mono mt-1 neon-glow-text-emerald">
            {stats.guides}
          </h3>
          <p className="text-[8px] text-emerald-400 flex items-center justify-center gap-1 mt-1 font-mono">
            SATELLITE SYNCED
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl neon-border-amber text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-10 w-10 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10"></div>
          <p className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">Safety Index Rating</p>
          <h3 className="text-2xl font-black text-white font-mono mt-1 text-amber-400">
            {stats.safety.toFixed(2)}%
          </h3>
          <p className="text-[8px] text-amber-400 flex items-center justify-center gap-1 mt-1 font-mono">
            ZERO ACCIDENTS RECORD
          </p>
        </div>

      </section>

      {/* Trending Adventures Section */}
      <section className="max-w-7xl mx-auto w-full px-4 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl font-bold tracking-wider text-white">Trending High-Tech Adventures</h2>
          </div>
          <button 
            onClick={() => setActiveSection('explore')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Adventures Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingDestinations.map((dest, idx) => (
            <div 
              key={idx}
              onClick={() => {
                const slug = dest.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                router.push('/info/' + slug);
              }}
              className="glass-panel rounded-2xl overflow-hidden border border-zinc-800/80 group hover:border-cyan-500/50 transition-all duration-500 relative flex flex-col h-80 cursor-pointer active:scale-[0.99]"
            >
              {/* Image box with overlay gradient */}
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={dest.image}
                  alt={dest.name}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
                
                {/* Float badges */}
                <span className="absolute top-3 left-3 bg-zinc-950/90 text-cyan-400 text-[9px] font-bold font-mono tracking-widest px-2.5 py-1 rounded-full border border-cyan-900">
                  {dest.difficulty}
                </span>
              </div>

              {/* Text Area */}
              <div className="p-5 flex flex-col flex-1 justify-between bg-zinc-950/50">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase text-left block">{dest.region}</span>
                  <h3 className="text-base font-bold text-white mt-1 group-hover:text-cyan-400 transition-colors text-left block">
                    {dest.name}
                  </h3>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-900 pt-3 mt-3">
                  <span className="text-xs font-mono text-purple-400">{dest.stat}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomPreference('preferredRegion', dest.name);
                      setActiveSection('customizer');
                    }}
                    className="h-7 w-7 rounded-lg bg-zinc-900 group-hover:bg-cyan-500 group-hover:text-black text-zinc-400 flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Community Feed ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-4 flex flex-col gap-6">
        {/* Section header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-bold tracking-wider text-white">Community Feed</h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{feedPosts.length} posts from travellers</span>
        </div>

        {/* Post Composer */}
        <div className="glass-panel rounded-2xl p-5 neon-border-cyan flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {currentUser?.avatar
                ? <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
                : <Upload className="h-4 w-4 text-cyan-400" />}
            </div>
            <textarea
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              placeholder="Share your Nepal experience — a trek, a temple, a sunrise…"
              rows={3}
              className="flex-1 bg-zinc-900/70 border border-zinc-800 focus:border-cyan-500/60 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none font-sans leading-5 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 pl-12">
            <div className="flex items-center gap-2 flex-1 bg-zinc-900/70 border border-zinc-800 rounded-xl px-3 py-2">
              <MapPin className="h-3 w-3 text-purple-400 flex-shrink-0" />
              <input
                value={postLocation}
                onChange={e => setPostLocation(e.target.value)}
                placeholder="Add location (e.g. Everest Base Camp)"
                className="flex-1 bg-transparent text-xs text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                if (!postContent.trim()) return;
                addFeedPost(postContent, undefined, postLocation || undefined);
                setPostContent('');
                setPostLocation('');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-bold text-xs transition-all active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Post</span>
            </button>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="flex flex-col gap-5">
          {feedPosts.map(post => (
            <Post
              key={post.id}
              post={post}
              theme="dark"
              onUserClick={(userId) => router.push(`/user/${userId}`)}
              onCommenterClick={(userName) => {
                const foundPost = feedPosts.find(p => p.userName.toLowerCase() === userName.toLowerCase());
                const slug = foundPost ? foundPost.userId : userName.toLowerCase().replace(/\s+/g, '_');
                router.push(`/user/${slug}`);
              }}
              onLike={likeFeedPost}
              onCommentAdd={addFeedComment}
            />
          ))}
        </div>
      </section>

      {/* Floating AI Chat Assistant Widget */}
      <div className="fixed bottom-24 right-6 z-50">
        
        {/* Floating Trigger Button */}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] border border-cyan-300/30 transition-transform active:scale-95 cursor-pointer hover:rotate-12 duration-300"
            title="Launch cognitive assistant"
          >
            <Bot className="h-6 w-6 animate-pulse" />
          </button>
        )}

        {/* AI Assistant Chat Frame */}
        {chatOpen && (
          <div className="w-[340px] md:w-[380px] h-[450px] glass-panel-heavy rounded-2xl neon-border-cyan shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="h-8 w-8 rounded-xl bg-cyan-500/20 border border-cyan-500 flex items-center justify-center">
                    <Bot className="h-4.5 w-4.5 text-cyan-400" />
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-black animate-ping"></span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AURA AI Assistant</h4>
                  <p className="text-[9px] text-cyan-400 font-mono flex items-center gap-1">
                    <Languages className="h-3 w-3" /> Cognitive Translation Active
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-zinc-400 hover:text-white p-1 hover:bg-white/5 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-sans text-xs">
              
              {/* Retrieve messages from AI channel */}
              {channels.find(ch => ch.id === 'ch-ai')?.messages.map((msg) => {
                const isAi = msg.sender === 'ai';
                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${isAi ? 'self-start' : 'self-end items-end'}`}
                  >
                    <div className={`p-3 rounded-xl ${
                      isAi 
                        ? 'bg-zinc-900 text-zinc-200 border border-zinc-800/80 rounded-tl-none' 
                        : 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-black font-semibold rounded-tr-none'
                    }`}>
                      <p>{msg.text}</p>
                      
                      {msg.translatedText && (
                        <div className="mt-2 pt-1 border-t border-cyan-800/20 text-[10px] text-cyan-900 font-mono italic">
                          {msg.translatedText}
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-zinc-500 font-mono mt-1">{msg.timestamp}</span>
                  </div>
                );
              })}

            </div>

            {/* Form Input */}
            <form 
              onSubmit={handleSendAiChat}
              className="p-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center gap-2"
            >
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about weather, hotels, or permits..."
                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
              <button 
                type="submit"
                className="h-8 w-8 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl flex items-center justify-center transition-all cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
