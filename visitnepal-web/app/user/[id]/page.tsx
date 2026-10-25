'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTravelStore } from '@/store/useTravelStore';
import { motion, AnimatePresence } from 'framer-motion';
import Post from '@/components/features/post/PostCard';
import { 
  MapPin, 
  ArrowLeft, 
  Share2, 
  Check, 
  Camera, 
  Compass, 
  Activity, 
  UserPlus, 
  UserCheck, 
  ClipboardList
} from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { feedPosts, likeFeedPost, addFeedComment } = useTravelStore();

  const [activeTab, setActiveTab] = useState<'posts' | 'trips' | 'gallery' | 'gear'>('posts');
  const [copied, setCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Find the user whose userId matches the route param or name slug
  const userPost = feedPosts.find(p => 
    p.userId === id || 
    p.userName.toLowerCase().replace(/\s+/g, '_') === id.toLowerCase() ||
    p.userName.toLowerCase().replace(/\s+/g, '') === id.toLowerCase()
  );

  const userPosts = feedPosts.filter(p => p.userName === userPost?.userName);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCommenterClick = (userName: string) => {
    const foundPost = feedPosts.find(p => p.userName.toLowerCase() === userName.toLowerCase());
    const slug = foundPost ? foundPost.userId : userName.toLowerCase().replace(/\s+/g, '_');
    router.push(`/user/${slug}`);
  };

  if (!userPost) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'linear-gradient(135deg, #FFFEFA 0%, #FAF3E3 100%)' }}>
        <span className="text-5xl">🏔️</span>
        <h1 className="text-xl font-bold text-[#3D2D27]">Explorer not found</h1>
        <p className="text-xs font-mono text-[#A89286]">User ID: {id}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer hover:opacity-95 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #C29367, #A67848)' }}
        >
          ← Back to Main Feed
        </button>
      </div>
    );
  }

  const details = getProfileDetails(userPost.userName, userPost.userRole);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFFEFA 0%, #FAF3E3 100%)' }}>
      
      {/* ── Top Navbar ── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-3.5"
        style={{ background: 'rgba(255,254,250,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(194,147,103,0.12)' }}
      >
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[11px] font-mono font-bold text-[var(--caramel)] hover:opacity-75 transition-opacity cursor-pointer group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Feed</span>
        </button>
        <span className="text-[10px] font-mono font-black tracking-widest uppercase text-[#A89286]">
          @{userPost.userName.toLowerCase().replace(/\s+/, '_')}
        </span>
        <span className="text-[9px] font-mono text-[#A89286]">ID · {userPost.userId}</span>
      </nav>

      {/* ── Main Content Container ── */}
      <div className="max-w-2xl mx-auto px-4 pb-24">

        {/* ── Cover Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className="relative w-full h-36 overflow-hidden rounded-b-3xl"
          style={{ boxShadow: '0 2px 20px rgba(61,45,39,0.08)' }}
        >
          <img src={details.banner} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(255,254,250,0.6))' }} />
        </motion.div>

        {/* ── Unified Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative z-10 mx-0 -mt-5"
        >
          <div
            className="bg-white rounded-2xl px-5 pt-5 pb-4"
            style={{
              border: '1px solid rgba(194,147,103,0.14)',
              boxShadow: '0 4px 24px rgba(61,45,39,0.06)',
            }}
          >
            {/* Row 1: Avatar + Identity + Follow Button */}
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="relative shrink-0 -mt-10">
                <div
                  className="h-20 w-20 rounded-full overflow-hidden border-4 shadow-md p-0.5"
                  style={{ borderColor: '#FFFEFA', background: 'linear-gradient(45deg, #C29367, #A67848)' }}
                >
                  <div className="h-full w-full rounded-full overflow-hidden bg-[#F5ECD7]">
                    <img src={userPost.userAvatar} alt={userPost.userName} className="h-full w-full object-cover" />
                  </div>
                </div>
                <span
                  className="absolute bottom-1 right-1 h-5 w-5 rounded-full flex items-center justify-center border text-[8px] font-black text-white shadow-sm"
                  style={{ background: 'linear-gradient(135deg,#C29367,#A67848)', borderColor: '#FFFEFA' }}
                  title="Verified Explorer"
                >✓</span>
              </div>

              {/* Name / Role / Location */}
              <div className="flex-1 min-w-0 pb-0.5">
                <h1 className="text-lg font-black text-[#3D2D27] tracking-tight leading-none">
                  {userPost.userName}
                </h1>
                <span className="text-[8.5px] font-mono font-bold uppercase tracking-widest text-[var(--caramel)] mt-0.5 block">
                  {userPost.userRole}
                </span>
                {userPost.location && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-2.5 w-2.5 text-[var(--caramel)] shrink-0" />
                    <span className="text-[8.5px] font-mono text-[#A89286]">{userPost.location}</span>
                  </div>
                )}
              </div>

              {/* Follow Button */}
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-white cursor-pointer transition-all active:scale-95 shadow-sm"
                style={{
                  background: isFollowing
                    ? 'linear-gradient(135deg, #7A6258 0%, #5C463C 100%)'
                    : 'linear-gradient(135deg, #C29367 0%, #A67848 100%)',
                }}
              >
                {isFollowing ? (
                  <><UserCheck className="h-3.5 w-3.5" /><span>Following</span></>
                ) : (
                  <><UserPlus className="h-3.5 w-3.5" /><span>Follow</span></>
                )}
              </button>
            </div>

            {/* Row 2: Stats */}
            <div
              className="grid grid-cols-3 mt-4 text-center font-mono divide-x divide-[#C29367]/10"
              style={{ borderTop: '1px solid rgba(194,147,103,0.1)', borderBottom: '1px solid rgba(194,147,103,0.1)' }}
            >
              {[
                { label: 'Posts', value: String(userPosts.length) },
                { label: 'Followers', value: details.followers },
                { label: 'Following', value: details.following },
              ].map(s => (
                <div key={s.label} className="py-3 px-2" style={{ borderColor: 'rgba(194,147,103,0.12)' }}>
                  <span className="block text-[13px] font-black text-[#3D2D27]">{s.value}</span>
                  <span className="text-[8px] uppercase tracking-widest text-[#A89286]">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Row 3: Bio */}
            <p className="mt-3 text-[11px] text-[#7A6258] leading-relaxed">
              {details.bio}
            </p>
          </div>
        </motion.div>

        {/* ── Elegant Tab Buttons ── */}
        <div className="mt-8 mb-6 flex p-1 rounded-xl font-mono"
          style={{ background: 'rgba(194,147,103,0.05)', border: '1px solid rgba(194,147,103,0.12)' }}>
          {[
            { id: 'posts', label: 'Chronicles', icon: ClipboardList },
            { id: 'trips', label: 'Past Trips', icon: Compass },
            { id: 'gallery', label: 'Gallery', icon: Camera },
            { id: 'gear', label: 'Gear & Bio', icon: Activity },
          ].map(tab => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-[var(--caramel)] shadow-xs scale-102 font-black' 
                    : 'text-[#8C766C] hover:text-[#5C463C]'
                }`}
              >
                <IconComponent className="h-3 w-3 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              {userPosts.length === 0 ? (
                <div
                  className="text-center py-16 rounded-2xl text-xs font-mono text-[#A89286]"
                  style={{ border: '1px dashed rgba(194,147,103,0.25)' }}
                >
                  No expedition logs yet.
                </div>
              ) : (
                userPosts.map((post) => (
                  <Post
                    key={post.id}
                    post={post}
                    theme="light"
                    onUserClick={(userId) => router.push(`/user/${userId}`)}
                    onCommenterClick={handleCommenterClick}
                    onLike={likeFeedPost}
                    onCommentAdd={addFeedComment}
                  />
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'trips' && (
            <motion.div
              key="trips"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-5 text-left"
            >
              {details.pastTrips.map((trip, idx) => (
                <div 
                  key={idx}
                  className="bg-white/80 border border-[var(--waffle)]/25 rounded-2xl p-4.5 flex flex-col md:flex-row gap-4 hover:border-[var(--caramel)]/30 transition-colors shadow-sm"
                >
                  <img src={trip.image} alt={trip.title} className="w-full md:w-36 h-24 object-cover rounded-xl border border-[var(--waffle)]/20 shrink-0" />
                  <div className="flex-1 flex flex-col justify-center gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono font-bold text-white bg-[var(--caramel)] px-2 py-0.5 rounded uppercase tracking-wider">
                        {trip.date}
                      </span>
                      <span className="text-[9px] font-mono text-[#A89286]">{trip.elevation} • {trip.region}</span>
                    </div>
                    <h3 className="text-sm font-black text-[#3D2D27] mt-1">{trip.title}</h3>
                    <p className="text-[11px] text-[#7A6258] leading-relaxed">{trip.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              {details.gallery.map((imgUrl, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-[#C29367]/15 bg-[#FAF6EE] shadow-xs cursor-pointer group"
                >
                  <img src={imgUrl} alt={`Gallery capture ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-[10px] font-mono tracking-widest font-black uppercase">Vibe · 100%</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'gear' && (
            <motion.div
              key="gear"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6 text-left"
            >
              {/* Bio Details */}
              <div className="bg-white/80 border border-[#C29367]/15 rounded-2xl p-5 shadow-xs">
                <h3 className="text-xs font-mono font-bold uppercase text-[var(--caramel)] tracking-wider mb-2.5">Traveler Bio & Vision</h3>
                <p className="text-[11px] text-[#7A6258] leading-relaxed">
                  Dedicated Himalayan pathfinder. Believes in soft ecological footprints, supporting local sherpa economies, and preserving the deep historical artifacts and oral histories of the high valleys. Currently mapping remote tea houses and tracking microclimate shifts above 3,500m.
                </p>
              </div>

              {/* Gear Checklist */}
              <div className="bg-white/80 border border-[#C29367]/15 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
                <h3 className="text-xs font-mono font-bold uppercase text-[var(--caramel)] tracking-wider mb-1">Calibrated Gear Pack</h3>
                {details.gear.map((g, idx) => (
                  <div key={idx} className="flex gap-3 items-start border-b border-[#FAF6EE] pb-2.5 last:border-0 last:pb-0">
                    <div className="h-6 w-6 rounded-lg bg-[var(--vanilla)] border border-[#C29367]/20 flex items-center justify-center text-[11px] font-bold text-[var(--caramel)] mt-0.5 font-mono shrink-0">
                      0{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-[#3D2D27]">{g.name}</h4>
                      <p className="text-[10px] text-[#A89286] mt-0.5 leading-normal">{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function getProfileDetails(username: string, role: string) {
  if (username === 'Maya Dev') return {
    bio: 'Cultural researcher & Himalayan ethnographer. Documenting Newari architecture & monastic traditions in the valleys. 🏯✨',
    followers: '4.8k', following: '342',
    banner: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=900',
    pastTrips: [
      {
        title: 'Bhaktapur Heritage Walk',
        date: 'April 2026',
        elevation: '1,400m',
        region: 'Kathmandu Valley',
        description: 'Studying the intricate details of Nyatapola Temple and woodcarving architecture.',
        image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=600',
      },
      {
        title: 'Lumbini Sacred Garden Trek',
        date: 'January 2026',
        elevation: '150m',
        region: 'Rupandehi',
        description: 'Analyzing Ashokan Pillar inscriptions and early monastic layout.',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600',
      },
      {
        title: 'Phoksundo Lake Expedition',
        date: 'October 2025',
        elevation: '3,611m',
        region: 'Dolpo',
        description: 'Documenting the unique Tibetan Bon culture and turquoise alpine waters.',
        image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600',
      }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=600',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600',
      'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=600',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600',
      'https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=600'
    ],
    gear: [
      { name: 'Leica SL2-S Camera', desc: 'Fitted with weather-proof primes for rugged heritage shoots.' },
      { name: 'Hand-woven Monastic Notebook', desc: 'For rapid ethnographical field notes & architectural sketches.' },
      { name: 'Smart Altitude Biosensor', desc: 'Tracks heart rate variance during high-altitude walkabouts.' }
    ]
  };
  if (username === 'Liam Patterson') return {
    bio: "High-altitude climber & alpine photographer. Driven to capture the raw power of Nepal's 8,000ers. 🏔️❄️",
    followers: '12.4k', following: '512',
    banner: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=900',
    pastTrips: [
      {
        title: 'Everest Base Camp High-Camp',
        date: 'May 2026',
        elevation: '5,364m',
        region: 'Khumbu Valley',
        description: 'Successfully reached Base Camp under clear skies and completed photography series.',
        image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600',
      },
      {
        title: 'Thorong La Pass Crossing',
        date: 'March 2026',
        elevation: '5,416m',
        region: 'Annapurna Valley',
        description: 'Trekking through active snowstorms. Documented frozen water falls and tea houses.',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600',
      },
      {
        title: 'Mera Peak Summit Attempt',
        date: 'November 2025',
        elevation: '6,476m',
        region: 'Hinku Valley',
        description: 'Alpine mountaineering in sub-zero temperatures. Captured panoramic summit view of 5 peaks.',
        image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600',
      }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600',
      'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?q=80&w=600'
    ],
    gear: [
      { name: 'Quantum Pressurized Shell', desc: 'Heated Gore-Tex layer calibrated to -30 degrees Celsius.' },
      { name: 'La Sportiva Mountaineering Boots', desc: 'High traction double-insulated smart boots with steel spikes.' },
      { name: 'O2 Concentrator Pack', desc: 'Provides supplemental oxygen flow at altitudes above 5,000m.' }
    ]
  };
  return {
    bio: `Himalayan wanderer & registered ${role.toLowerCase()}. Documenting trail logs, local tea-houses, and hidden lakes. 🗺️🎒`,
    followers: '840', following: '190',
    banner: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=900',
    pastTrips: [
      {
        title: 'Phewa Lake Kayak Tour',
        date: 'May 2026',
        elevation: '822m',
        region: 'Pokhara Kaski',
        description: 'Relaxed paddle around the Tal Barahi Temple with mirror reflections of Machapuchare.',
        image: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=600',
      },
      {
        title: 'Chitwan Jungle Safari',
        date: 'February 2026',
        elevation: '150m',
        region: 'Chitwan',
        description: 'Jungle exploration, spotted two one-horned rhinos near the Rapti river banks.',
        image: 'https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=600',
      }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600',
      'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=600',
      'https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=600',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600'
    ],
    gear: [
      { name: 'Osprey 50L Backpack', desc: 'Sturdy, light-weight back support pack for multiday treks.' },
      { name: 'Leki Carbon Trekking Poles', desc: 'Antishock carbon poles for safety over rock slides.' }
    ]
  };
}
