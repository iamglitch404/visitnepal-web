'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTravelStore } from '@/store/useTravelStore';
import { useRouter } from 'next/navigation';
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

interface DiscoverSectionProps {
  activeId: string;
  onNavigate?: (id: string) => void;
}

const DESTINATIONS = [
  {
    id: 'everest',
    name: 'Mount Everest Base Camp',
    elevation: '5,364 m',
    region: 'Khumbu',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop',
    description: 'Walk in the footsteps of legends to the base of the world\'s highest peak.',
    details: 'The trek to Everest Base Camp is a grand pilgrimage through Sherpa country, high suspended bridges, and ancient Buddhist monasteries.'
  },
  {
    id: 'pokhara',
    name: 'Phewa Lake, Pokhara',
    elevation: '822 m',
    region: 'Kaski',
    image: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=600&auto=format&fit=crop',
    description: 'A tranquil lakeside resort town with raw mountain reflections.',
    details: 'Relax in standard lakeside tea houses or paddle under the clear gaze of Machapuchare (Fishtail Peak) and the Annapurna range.'
  },
  {
    id: 'kathmandu',
    name: 'Boudhanath Stupa',
    elevation: '1,400 m',
    region: 'Kathmandu',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop',
    description: 'One of the largest spherical stupas in the world.',
    details: 'A beacon of ancient spirituality decorated with thousands of prayer flags waving in the gentle breeze, surrounded by peaceful monasteries.'
  },
  {
    id: 'chitwan',
    name: 'Chitwan Wildlife Sanctuary',
    elevation: '150 m',
    region: 'Chitwan',
    image: 'https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=600&auto=format&fit=crop',
    description: 'Deep subtropical jungles where rare rhinos roam free.',
    details: 'Experience guided canoe safaris and dense jungle exploration looking for tigers, leopards, and crocodiles.'
  },
  {
    id: 'mustang',
    name: 'Lo Manthang, Upper Mustang',
    elevation: '3,840 m',
    region: 'Mustang',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600&auto=format&fit=crop',
    description: 'A walled city in the high-altitude trans-Himalayan desert.',
    details: 'Explore ancient red cliffs, sky caves, and the preserved fortress palace of the former Kingdom of Lo.'
  }
];

export default function DiscoverSection({ activeId, onNavigate }: DiscoverSectionProps) {
  const { feedPosts, addFeedPost, likeFeedPost, addFeedComment, currentUser } = useTravelStore();
  const router = useRouter();

  const [postContent, setPostContent] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [selectedImage, setSelectedImage] = useState('https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [imageSelectorOpen, setImageSelectorOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<any | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'posts' | 'trips' | 'gallery' | 'gear'>('posts');
  const [copied, setCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveProfileTab('posts');
    setIsFollowing(false);
  }, [selectedProfileUser]);

  useEffect(() => {
    if (currentUser?.location) {
      setPostLocation(currentUser.location);
    }
  }, [currentUser]);

  useEffect(() => {
    setSelectedProfileUser(null);
  }, [activeId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
    }
  };

  const handleCommenterClick = (userName: string) => {
    const foundPost = feedPosts.find(p => p.userName.toLowerCase() === userName.toLowerCase());
    if (foundPost) {
      setSelectedProfileUser({
        userId: foundPost.userId,
        name: foundPost.userName,
        avatar: foundPost.userAvatar,
        role: foundPost.userRole,
        location: foundPost.location
      });
    } else {
      const slug = userName.toLowerCase().replace(/\s+/g, '_');
      setSelectedProfileUser({
        userId: slug,
        name: userName,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
        role: 'Explorer',
        location: 'Nepal'
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const MOCK_PHOTOS = [
    { name: 'Everest Peaks', url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800' },
    { name: 'Phewa Lakeside', url: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=800' },
    { name: 'Chitwan Jungle Tiger', url: 'https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=800' },
    { name: 'Ancient Bhaktapur', url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800' },
    { name: 'Kathmandu Gateway', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800' },
  ];

  const containerVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.08 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <>
      <motion.div
        key={activeId}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full text-left"
      >
        {/* ── HOME VIEW ────────────────────────────────────────────────── */}
        {activeId === 'home' && (
          selectedProfileUser ? (
            <div className="animate-in fade-in duration-300">
              {/* Cover Banner — breaks out of parent p-6/md:p-10 on top + sides */}
              <div
                className="relative h-44 overflow-hidden"
                style={{
                  marginTop: '-1.5rem',
                  marginLeft: '-1.5rem',
                  marginRight: '-1.5rem',
                  width: 'calc(100% + 3rem)',
                }}
              >
                {/* md override via a pseudo-style trick using a style tag approach isn't possible, 
                    so we use the closest Tailwind responsive inline workaround */}
                <img src={getDiscoverProfileDetails(selectedProfileUser.name, selectedProfileUser.role).banner} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 35%, rgba(255,254,250,0.9))' }} />

                {/* Back Button — top left inside banner */}
                <button
                  onClick={() => setSelectedProfileUser(null)}
                  className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[var(--waffle)]/25 text-[9px] font-mono font-bold text-[#7A6258] hover:text-[var(--caramel)] hover:bg-white transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back
                </button>

                {/* Share Button — top right inside banner */}
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const profileLink = `${window.location.origin}/user/${selectedProfileUser.userId || '048291'}`;
                      navigator.clipboard.writeText(profileLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }
                  }}
                  className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[var(--waffle)]/25 text-[9px] font-mono font-bold text-[#7A6258] hover:text-[var(--caramel)] hover:bg-white transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
                >
                  <Share2 className="h-3 w-3" />
                  <span>{copied ? 'Copied! ✨' : 'Share'}</span>
                </button>
              </div>

              {/* ── Profile Info Card (overlaps banner) ── */}
              <div
                className="relative z-10 mx-4 -mt-10 rounded-2xl"
                style={{ background: 'rgba(255,254,250,0.96)', border: '1px solid rgba(194,147,103,0.14)', boxShadow: '0 4px 24px rgba(61,45,39,0.07)' }}
              >
                {/* Top row: Avatar + Name/Role/Location + Follow */}
                <div className="flex items-end gap-4 px-5 pt-4 pb-3">
                  {/* Avatar */}
                  <div className="relative shrink-0 -mt-10">
                    <div
                      className="h-20 w-20 rounded-full overflow-hidden border-4 shadow-md p-0.5"
                      style={{ borderColor: '#FFFEFA', background: 'linear-gradient(45deg, #C29367, #A67848)' }}
                    >
                      <div className="h-full w-full rounded-full overflow-hidden bg-[#F5ECD7]">
                        <img src={selectedProfileUser.avatar} alt={selectedProfileUser.name} className="h-full w-full object-cover" />
                      </div>
                    </div>
                    <span
                      className="absolute bottom-1 right-1 h-5 w-5 rounded-full flex items-center justify-center border text-[8px] font-black text-white"
                      style={{ background: 'linear-gradient(135deg,#C29367,#A67848)', borderColor: '#FFFEFA' }}
                      title="Verified Explorer"
                    >✓</span>
                  </div>

                  {/* Name + Role + Location */}
                  <div className="flex-1 min-w-0 pb-0.5">
                    <h1 className="text-lg font-black text-[#3D2D27] tracking-tight leading-none">{selectedProfileUser.name}</h1>
                    <span className="text-[8.5px] font-mono font-bold uppercase tracking-widest text-[var(--caramel)] mt-0.5 block">{selectedProfileUser.role}</span>
                    {selectedProfileUser.location && (
                      <span className="text-[8.5px] font-mono text-[#A89286] flex items-center gap-1 mt-1">
                        <MapPin className="h-2.5 w-2.5 text-[var(--caramel)]" />
                        {selectedProfileUser.location}
                      </span>
                    )}
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className="shrink-0 text-[9px] font-mono font-bold uppercase tracking-wider px-4 py-2 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 text-white"
                    style={{ background: isFollowing ? 'linear-gradient(135deg, #7A6258, #5C463C)' : 'linear-gradient(135deg, #C29367, #A67848)' }}
                  >
                    {isFollowing ? <UserCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>

                {/* Divider */}
                <div className="mx-5" style={{ height: '1px', background: 'rgba(194,147,103,0.12)' }} />

                {/* Stats row */}
                <div className="flex items-center gap-0 px-5 py-2.5">
                  {[
                    { label: 'Posts', value: String(feedPosts.filter(p => p.userName === selectedProfileUser.name).length) },
                    { label: 'Followers', value: getDiscoverProfileDetails(selectedProfileUser.name, selectedProfileUser.role).followers },
                    { label: 'Following', value: getDiscoverProfileDetails(selectedProfileUser.name, selectedProfileUser.role).following },
                  ].map((s, i) => (
                    <div key={s.label} className={`flex-1 text-center font-mono ${i < 2 ? 'border-r border-[var(--waffle)]/20' : ''}`}>
                      <span className="block text-sm font-black text-[#3D2D27]">{s.value}</span>
                      <span className="block text-[7.5px] uppercase tracking-widest text-[#A89286]">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="mx-5" style={{ height: '1px', background: 'rgba(194,147,103,0.12)' }} />

                {/* Bio */}
                <p className="px-5 py-3 text-[11px] text-[#7A6258] leading-relaxed">
                  {getDiscoverProfileDetails(selectedProfileUser.name, selectedProfileUser.role).bio}
                </p>
              </div>

              {/* Elegant Tab Buttons */}
              <div className="mt-4 mb-3 flex p-1 rounded-xl font-mono"
                style={{ background: 'rgba(194,147,103,0.05)', border: '1px solid rgba(194,147,103,0.12)' }}>
                {[
                  { id: 'posts', label: 'Chronicles', icon: ClipboardList },
                  { id: 'trips', label: 'Past Trips', icon: Compass },
                  { id: 'gallery', label: 'Gallery', icon: Camera },
                  { id: 'gear', label: 'Gear & Bio', icon: Activity },
                ].map(tab => {
                  const IconComponent = tab.icon;
                  const isActive = activeProfileTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveProfileTab(tab.id as any)}
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

              {/* TAB CONTENT */}
              <AnimatePresence mode="wait">
                {activeProfileTab === 'posts' && (
                  <motion.div
                    key="posts"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-6"
                  >
                    {feedPosts.filter(p => p.userName === selectedProfileUser.name).length === 0 ? (
                      <div className="text-center py-12 bg-[var(--vanilla)]/20 border border-[var(--waffle)]/35 rounded-2xl">
                        <p className="text-xs font-mono text-[#A89286]">No chronicles published yet by this traveler.</p>
                      </div>
                    ) : (
                      feedPosts
                        .filter((post) => post.userName === selectedProfileUser.name)
                        .map((post) => (
                          <div 
                            key={post.id}
                            style={{
                              background: 'rgba(255, 254, 250, 0.75)',
                              border: '1px solid rgba(194,147,103,0.14)',
                              boxShadow: '0 4px 16px rgba(61,45,39,0.015)',
                            }}
                            className="rounded-2xl overflow-hidden hover:border-[var(--caramel)]/25 transition-all duration-300 flex flex-col text-left"
                          >
                            {/* Post Header */}
                            <div className="flex items-center justify-between p-4.5 pb-2">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full overflow-hidden border border-[var(--waffle)]/40 bg-[var(--vanilla)]">
                                  <img src={post.userAvatar} alt={post.userName} className="h-full w-full object-cover" />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-[var(--foreground)]">{post.userName}</h4>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[8px] font-mono text-[var(--caramel)] font-bold uppercase tracking-wider">{post.userRole}</span>
                                    {post.location && (
                                      <>
                                        <span className="text-[#A89286] text-[8px]">•</span>
                                        <span className="text-[8px] font-mono text-[#7A6258] flex items-center gap-0.5">
                                          <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z" /><circle cx="12" cy="10" r="3" /></svg>
                                          {post.location}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[8px] font-mono text-[#A89286]">{post.timestamp}</span>
                            </div>

                            {/* Post Content */}
                            <p className="px-4.5 py-2 text-[11px] text-[#7A6258] leading-relaxed text-left">
                              {post.content}
                            </p>

                            {/* Post Image */}
                            {post.image && (
                              <div className="w-full overflow-hidden border-y border-[var(--waffle)]/15 max-h-72">
                                <img src={post.image} alt="Chronicle scene" className="w-full object-cover max-h-72" />
                              </div>
                            )}

                            {/* Post Interactive Actions */}
                            <div className="flex items-center gap-4 px-4.5 py-3 border-t border-[var(--waffle)]/10 mt-1">
                              <button
                                onClick={() => likeFeedPost(post.id)}
                                className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors cursor-pointer ${post.likedByUser ? 'text-pink-500' : 'text-[#7A6258] hover:text-pink-500'}`}
                              >
                                <svg viewBox="0 0 24 24" width="13" height="13" fill={post.likedByUser ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                                <span className="font-mono">{post.likes}</span>
                              </button>

                              <button
                                onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                                className="flex items-center gap-1.5 text-[10px] font-medium text-[#7A6258] hover:text-[var(--caramel)] transition-colors cursor-pointer"
                              >
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                <span className="font-mono">{post.comments.length}</span>
                              </button>
                            </div>

                            {/* Comment Stream */}
                            {post.comments.length > 0 && (
                              <div className="px-4.5 pb-3 pt-1 border-t border-[var(--waffle)]/5 flex flex-col gap-2">
                                {post.comments.map((comment) => (
                                  <div key={comment.id} className="flex items-start gap-2 text-left">
                                    <div 
                                      onClick={() => handleCommenterClick(comment.userName)}
                                      className="h-5 w-5 rounded-full overflow-hidden border border-[var(--waffle)]/30 bg-[var(--vanilla)]/50 shrink-0 flex items-center justify-center text-[7px] text-[var(--caramel)] font-bold cursor-pointer hover:scale-95 transition-transform"
                                    >
                                      👤
                                    </div>
                                    <div className="flex-1 bg-[var(--vanilla)]/35 rounded-xl px-3 py-1.5 border border-[var(--waffle)]/15">
                                      <span 
                                        onClick={() => handleCommenterClick(comment.userName)}
                                        className="text-[10px] font-bold text-[var(--foreground)] cursor-pointer hover:text-[var(--caramel)] hover:underline transition-colors block"
                                      >
                                        {comment.userName}
                                      </span>
                                      <p className="text-[10px] text-[#7A6258] mt-0.5 leading-relaxed">{comment.text}</p>
                                    </div>
                                    <span className="text-[7px] font-mono text-[#A89286] self-end mb-1 shrink-0">{comment.timestamp}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Interactive Comment Input */}
                            {activeCommentPostId === post.id && (
                              <div className="px-4.5 pb-4.5 pt-2 border-t border-[var(--waffle)]/10 flex gap-2">
                                <input
                                  value={commentInputs[post.id] || ''}
                                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && commentInputs[post.id]?.trim()) {
                                      addFeedComment(post.id, commentInputs[post.id]);
                                      setCommentInputs(prev => ({ ...prev, [post.id]: '' }));
                                    }
                                  }}
                                  placeholder="Write a comment... (Press Enter)"
                                  className="flex-1 bg-white border border-[var(--waffle)]/35 focus:border-[var(--caramel)]/45 rounded-xl px-3.5 py-2 text-[10px] text-[var(--foreground)] placeholder-[#A89286]/60 focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    if (commentInputs[post.id]?.trim()) {
                                      addFeedComment(post.id, commentInputs[post.id]);
                                      setCommentInputs(prev => ({ ...prev, [post.id]: '' }));
                                    }
                                  }}
                                  style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
                                  className="h-7 w-7 rounded-xl flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all"
                                >
                                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                    )}
                  </motion.div>
                )}

                {activeProfileTab === 'trips' && (
                  <motion.div
                    key="trips"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-5 text-left"
                  >
                    {getDiscoverProfileDetails(selectedProfileUser.name, selectedProfileUser.role).pastTrips.map((trip: any, idx: number) => (
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

                {activeProfileTab === 'gallery' && (
                  <motion.div
                    key="gallery"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                  >
                    {getDiscoverProfileDetails(selectedProfileUser.name, selectedProfileUser.role).gallery.map((imgUrl: string, idx: number) => (
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

                {activeProfileTab === 'gear' && (
                  <motion.div
                    key="gear"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-6 text-left"
                  >
                    <div className="bg-white/80 border border-[#C29367]/15 rounded-2xl p-5 shadow-xs">
                      <h3 className="text-xs font-mono font-bold uppercase text-[var(--caramel)] tracking-wider mb-2.5">Traveler Bio & Vision</h3>
                      <p className="text-[11px] text-[#7A6258] leading-relaxed">
                        Dedicated Himalayan pathfinder. Believes in soft ecological footprints, supporting local sherpa economies, and preserving the deep historical artifacts and oral histories of the high valleys. Currently mapping remote tea houses and tracking microclimate shifts above 3,500m.
                      </p>
                    </div>

                    <div className="bg-white/80 border border-[#C29367]/15 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
                      <h3 className="text-xs font-mono font-bold uppercase text-[var(--caramel)] tracking-wider mb-1">Calibrated Gear Pack</h3>
                      {getDiscoverProfileDetails(selectedProfileUser.name, selectedProfileUser.role).gear.map((g: any, idx: number) => (
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
          ) : (
            <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
              <motion.div variants={itemVariants} className="flex flex-col gap-3">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--caramel)] uppercase">
                  Welcome to Nepal
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-[var(--foreground)] tracking-tight leading-tight">
                  An Oasis of <br />
                  Natural & Spiritual Wonder.
                </h1>
                <p className="text-sm text-[#7A6258] max-w-xl leading-relaxed">
                  Discover a land where giant snow peaks meet sub-tropical forests, and centuries of preserved culture blend into a soft, welcoming sanctuary.
                </p>
              </motion.div>

              {/* Featured Hero Card / Selected Profile Display */}
              <motion.div
                variants={itemVariants}
                className="relative rounded-2xl overflow-hidden border border-[var(--waffle)]/40 aspect-video md:aspect-[21/9] shadow-sm bg-[var(--vanilla)]"
              >
                <img
                  src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop"
                  alt="Himalayan Peak"
                  className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3D2D27]/90 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8">
                  <span className="text-[9px] font-mono font-bold uppercase text-[var(--waffle)] tracking-widest">Featured Expedition</span>
                  <h2 className="text-xl md:text-2xl font-bold text-white mt-1">Sagarmatha Everest National Park</h2>
                  <p className="text-xs text-white/80 mt-1.5 max-w-lg leading-relaxed">
                    Embark on an adventure of a lifetime through giant mountains, glacier bridges, and Sherpa villages.
                  </p>
                </div>
              </motion.div>

              {/* Quick Info Grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--vanilla)]/35 p-5 rounded-2xl border border-[var(--waffle)]/30 flex flex-col gap-2 text-left">
                  <span className="text-[10px] font-mono font-bold text-[var(--caramel)] uppercase">01 / Altitudes</span>
                  <h3 className="text-sm font-bold">8,848m Peak</h3>
                  <p className="text-xs text-[#7A6258] leading-relaxed">Mount Everest rules the skyline along with seven other 8,000m+ giants.</p>
                </div>
                <div className="bg-[var(--vanilla)]/35 p-5 rounded-2xl border border-[var(--waffle)]/30 flex flex-col gap-2 text-left">
                  <span className="text-[10px] font-mono font-bold text-[var(--caramel)] uppercase">02 / Biodiversity</span>
                  <h3 className="text-sm font-bold">Subtropical to Arctic</h3>
                  <p className="text-xs text-[#7A6258] leading-relaxed">Explore habitats ranging from wild tiger sanctuaries to thin, freezing glaciers.</p>
                </div>
                <div className="bg-[var(--vanilla)]/35 p-5 rounded-2xl border border-[var(--waffle)]/30 flex flex-col gap-2 text-left">
                  <span className="text-[10px] font-mono font-bold text-[var(--caramel)] uppercase">03 / Sanctuary</span>
                  <h3 className="text-sm font-bold">Zen & Hospitality</h3>
                  <p className="text-xs text-[#7A6258] leading-relaxed">Rest in premium eco-resorts and authentic homestays rooted in ancient warmth.</p>
                </div>
              </motion.div>

              {/* ── COMMUNITY TRAVEL DIARIES ── */}
              <motion.div variants={itemVariants} className="flex flex-col gap-6 mt-4">
                <div className="flex flex-col gap-1 border-b border-[var(--waffle)]/20 pb-3 text-left">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--caramel)] uppercase">
                    Traveler Diaries
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">Community Chronicles</h2>
                  <p className="text-xs text-[#7A6258]">Share your journeys and check out live updates from fellow adventurers in Nepal.</p>
                </div>

                {/* Premium Post Composer */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,254,250,0.8) 0%, rgba(250,243,227,0.5) 100%)',
                    border: '1px solid rgba(194,147,103,0.18)',
                    boxShadow: '0 4px 20px rgba(61,45,39,0.02)',
                  }}
                  className="rounded-2xl p-5 flex flex-col gap-4.5"
                >
                  {/* Text Input Area */}
                  <div className="flex gap-3">
                    <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-[var(--caramel)]/20 flex-shrink-0 bg-[var(--vanilla)] flex items-center justify-center">
                      {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-[var(--caramel)]">👤</span>
                      )}
                    </div>
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share your Nepal chronicle... what mountains did you gaze at today?"
                      rows={3}
                      className="flex-1 bg-white/70 border border-[var(--waffle)]/35 focus:border-[var(--caramel)]/45 focus:bg-white rounded-xl px-4 py-3 text-[11px] text-[var(--foreground)] placeholder-[#A89286]/60 focus:outline-none resize-none font-sans leading-relaxed transition-all shadow-2xs"
                    />
                  </div>

                  {/* Photo selector section */}
                  <div className="flex flex-col gap-2.5">
                    {imageSelectorOpen && (
                      <div className="grid grid-cols-4 gap-2.5 p-3.5 bg-[var(--vanilla)]/40 rounded-xl border border-[var(--waffle)]/25 animate-in fade-in duration-200">
                        {MOCK_PHOTOS.map((photo) => (
                          <div
                            key={photo.name}
                            onClick={() => {
                              setSelectedImage(photo.url);
                              setImageSelectorOpen(false);
                            }}
                            className={`relative rounded-lg overflow-hidden aspect-video cursor-pointer border-2 transition-all ${selectedImage === photo.url ? 'border-[var(--caramel)] scale-98 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}
                          >
                            <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-black/25 flex items-end justify-center p-1">
                              <span className="text-[7px] text-white font-mono truncate">{photo.name}</span>
                            </div>
                          </div>
                        ))}
                        <div
                          onClick={() => {
                            setSelectedImage('');
                            setImageSelectorOpen(false);
                          }}
                          style={{ border: '1px dashed rgba(194,147,103,0.4)' }}
                          className="rounded-lg aspect-video cursor-pointer hover:bg-[var(--vanilla)]/50 flex flex-col items-center justify-center text-[8px] font-mono text-[#A89286]"
                        >
                          No Photo
                        </div>
                        {/* Custom upload button */}
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-video rounded-lg border-2 border-dashed border-[var(--waffle)]/40 hover:border-[var(--caramel)]/40 flex flex-col items-center justify-center gap-1 text-[8px] font-mono text-[#A89286] hover:text-[var(--foreground)] cursor-pointer transition-all"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          <span>Upload</span>
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          accept="image/*" 
                          className="hidden" 
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Toolbar */}
                  <div className="flex items-center justify-between border-t border-[var(--waffle)]/12 pt-3">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setImageSelectorOpen(!imageSelectorOpen)}
                        style={{ background: 'rgba(194,147,103,0.06)', border: '1px solid rgba(194,147,103,0.18)' }}
                        className="flex items-center gap-1.5 text-[9px] font-semibold text-[var(--caramel)] hover:text-white px-3 py-1.5 rounded-lg hover:bg-[var(--caramel)] active:scale-95 transition-all cursor-pointer"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <span>Photo</span>
                      </button>

                      <div className="relative flex items-center">
                        <span className="absolute left-2.5 text-[#A89286] pointer-events-none opacity-80">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
                        </span>
                        <input
                          type="text"
                          value={postLocation}
                          onChange={(e) => setPostLocation(e.target.value)}
                          placeholder="Add location..."
                          className="bg-[var(--vanilla)] border border-[var(--waffle)]/25 rounded-lg pl-6 pr-2.5 py-1.5 text-[9px] text-[var(--foreground)] placeholder-[#A89286]/55 focus:outline-none focus:border-[var(--caramel)]/40 transition-all font-sans"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (postContent.trim()) {
                          addFeedPost(postContent, postLocation, selectedImage);
                          setPostContent('');
                        }
                      }}
                      style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)', boxShadow: '0 4px 10px rgba(194,147,103,0.18)' }}
                      className="text-white text-[10px] font-bold px-4.5 py-1.5 rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                    >
                      Publish Chronicle
                    </button>
                  </div>
                </div>

                {/* Diaries feed list */}
                <motion.div 
                  variants={itemVariants}
                  className="flex flex-col gap-6"
                >
                  {feedPosts
                    .filter((post) => !selectedProfileUser || post.userName === selectedProfileUser.name)
                    .map((post) => (
                      <div 
                        key={post.id}
                        style={{
                          background: 'rgba(255, 254, 250, 0.75)',
                          border: '1px solid rgba(194,147,103,0.14)',
                          boxShadow: '0 4px 16px rgba(61,45,39,0.015)',
                        }}
                        className="rounded-2xl overflow-hidden hover:border-[var(--caramel)]/25 transition-all duration-300 flex flex-col"
                      >
                        {/* Post User Header */}
                        <div className="flex items-center justify-between p-4.5 pb-2 text-left">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => {
                                setSelectedProfileUser({
                                  userId: post.userId,
                                  name: post.userName,
                                  avatar: post.userAvatar,
                                  role: post.userRole,
                                  location: post.location
                                });
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="h-9 w-9 rounded-full overflow-hidden border border-[var(--waffle)]/40 bg-[var(--vanilla)] cursor-pointer hover:scale-95 transition-transform"
                            >
                              <img src={post.userAvatar} alt={post.userName} className="h-full w-full object-cover" />
                            </div>
                            <div>
                              <h4
                                onClick={() => {
                                  setSelectedProfileUser({
                                    userId: post.userId,
                                    name: post.userName,
                                    avatar: post.userAvatar,
                                    role: post.userRole,
                                    location: post.location
                                  });
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-xs font-bold text-[var(--foreground)] cursor-pointer hover:text-[var(--caramel)] transition-colors"
                              >
                                {post.userName}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[8px] font-mono text-[var(--caramel)] font-bold uppercase tracking-wider">{post.userRole}</span>
                                {post.location && (
                                  <>
                                    <span className="text-[#A89286] text-[8px]">•</span>
                                    <span className="text-[8px] font-mono text-[#7A6258] flex items-center gap-0.5">
                                      <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z" /><circle cx="12" cy="10" r="3" /></svg>
                                      {post.location}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-[8px] font-mono text-[#A89286]">{post.timestamp}</span>
                        </div>

                        {/* Post Content */}
                        <p className="px-4.5 py-2 text-[11px] text-[#7A6258] leading-relaxed text-left">
                          {post.content}
                        </p>

                        {/* Post Image Showcase */}
                        {post.image && (
                          <div className="w-full overflow-hidden border-y border-[var(--waffle)]/15 max-h-72">
                            <img src={post.image} alt="Chronicle scene" className="w-full object-cover max-h-72" />
                          </div>
                        )}

                        {/* Post Interactive Actions */}
                        <div className="flex items-center gap-4 px-4.5 py-3 border-t border-[var(--waffle)]/10 mt-1">
                          {/* Like Action */}
                          <button
                            onClick={() => likeFeedPost(post.id)}
                            className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors cursor-pointer ${post.likedByUser ? 'text-pink-500' : 'text-[#7A6258] hover:text-pink-500'}`}
                          >
                            <svg viewBox="0 0 24 24" width="13" height="13" fill={post.likedByUser ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                            <span className="font-mono">{post.likes}</span>
                          </button>

                          {/* Comment Toggle Action */}
                          <button
                            onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                            className="flex items-center gap-1.5 text-[10px] font-medium text-[#7A6258] hover:text-[var(--caramel)] transition-colors cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            <span className="font-mono">{post.comments.length}</span>
                          </button>
                        </div>

                        {/* Comment Stream */}
                        {post.comments.length > 0 && (
                          <div className="px-4.5 pb-3 pt-1 border-t border-[var(--waffle)]/5 flex flex-col gap-2">
                            {post.comments.map((comment) => (
                              <div key={comment.id} className="flex items-start gap-2 text-left">
                                <div 
                                  onClick={() => handleCommenterClick(comment.userName)}
                                  className="h-5 w-5 rounded-full overflow-hidden border border-[var(--waffle)]/30 bg-[var(--vanilla)]/50 shrink-0 flex items-center justify-center text-[7px] text-[var(--caramel)] font-bold cursor-pointer hover:scale-95 transition-transform"
                                >
                                  👤
                                </div>
                                <div className="flex-1 bg-[var(--vanilla)]/35 rounded-xl px-3 py-1.5 border border-[var(--waffle)]/15">
                                  <span 
                                    onClick={() => handleCommenterClick(comment.userName)}
                                    className="text-[10px] font-bold text-[var(--foreground)] cursor-pointer hover:text-[var(--caramel)] hover:underline transition-colors block"
                                  >
                                    {comment.userName}
                                  </span>
                                  <p className="text-[10px] text-[#7A6258] mt-0.5 leading-relaxed">{comment.text}</p>
                                </div>
                                <span className="text-[7px] font-mono text-[#A89286] self-end mb-1 shrink-0">{comment.timestamp}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Interactive Comment Input */}
                        {activeCommentPostId === post.id && (
                          <div className="px-4.5 pb-4.5 pt-2 border-t border-[var(--waffle)]/10 flex gap-2">
                            <input
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && commentInputs[post.id]?.trim()) {
                                  addFeedComment(post.id, commentInputs[post.id]);
                                  setCommentInputs(prev => ({ ...prev, [post.id]: '' }));
                                }
                              }}
                              placeholder="Write a comment... (Press Enter)"
                              className="flex-1 bg-white border border-[var(--waffle)]/35 focus:border-[var(--caramel)]/45 rounded-xl px-3.5 py-2 text-[10px] text-[var(--foreground)] placeholder-[#A89286]/60 focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                if (commentInputs[post.id]?.trim()) {
                                  addFeedComment(post.id, commentInputs[post.id]);
                                  setCommentInputs(prev => ({ ...prev, [post.id]: '' }));
                                }
                              }}
                              style={{ background: 'linear-gradient(135deg, #C29367 0%, #A67848 100%)' }}
                              className="h-7 w-7 rounded-xl flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all"
                            >
                              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                            </button>
                          </div>
                        )}

                      </div>
                    ))}
                </motion.div>
              </motion.div>
            </div>
          )
        )}

        {/* ── EXPLORE VIEW ──────────────────────────────────────────────── */}
        {activeId === 'explore' && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
            <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--caramel)] uppercase">
                Explore Destinations
              </span>
              <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)]">Discover Curated Havens</h2>
              <p className="text-xs text-[#7A6258]">Select from our handpicked destinations to see local altitude grids and travel stories.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DESTINATIONS.map(d => (
                <div
                  key={d.id}
                  onClick={() => onNavigate ? onNavigate(d.id) : router.push('/info/' + d.id)}
                  className="group bg-[var(--card-bg)] border border-[var(--waffle)]/30 rounded-2xl overflow-hidden hover:border-[var(--caramel)]/50 transition-all duration-305 shadow-[0_4px_12px_rgba(61,45,39,0.015)] cursor-pointer active:scale-[0.99]"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img src={d.image} alt={d.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-white/95 text-[9px] font-mono font-bold text-[var(--foreground)] px-2 py-0.5 rounded border border-[var(--waffle)] shadow-sm">
                      {d.elevation}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col gap-2">
                    <span className="text-[9px] font-mono font-bold uppercase text-[var(--caramel)]">{d.region} Region</span>
                    <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--caramel)] transition-colors">{d.name}</h3>
                    <p className="text-xs text-[#7A6258] leading-relaxed">{d.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}

        {/* ── POPULAR VIEW ──────────────────────────────────────────────── */}
        {activeId === 'popular' && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
            <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--caramel)] uppercase">
                Trending Travels
              </span>
              <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)]">Popular Journeys</h2>
              <p className="text-xs text-[#7A6258]">Most loved paths by worldwide travelers seeking adventure, peace, and culture.</p>
            </motion.div>

            {/* Simple list cards */}
            <div className="flex flex-col gap-4">
              {DESTINATIONS.slice(0, 3).map((d, index) => (
                <motion.div
                  variants={itemVariants}
                  key={d.id}
                  onClick={() => onNavigate ? onNavigate(d.id) : router.push('/info/' + d.id)}
                  className="bg-[var(--vanilla)]/20 border border-[var(--waffle)]/30 rounded-2xl p-4.5 flex flex-col md:flex-row gap-5 items-center hover:bg-[var(--vanilla)]/50 hover:border-[var(--caramel)]/40 transition-all duration-200 cursor-pointer active:scale-[0.995] group"
                >
                  <img src={d.image} alt={d.name} className="w-full md:w-36 h-24 object-cover rounded-xl border border-[var(--waffle)]/40 shrink-0" />
                  <div className="flex-1 flex flex-col gap-1 text-left w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-white bg-[var(--caramel)] px-2 py-0.5 rounded">
                        #{index + 1} Trending
                      </span>
                      <span className="text-[9px] font-mono text-[#A89286]">{d.elevation}</span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--caramel)] transition-colors mt-1">{d.name}</h3>
                    <p className="text-xs text-[#7A6258] leading-relaxed">{d.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── ATTRACTIONS VIEW ──────────────────────────────────────────── */}
        {activeId === 'attractions' && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
            <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--caramel)] uppercase">
                Sightseeing Matrix
              </span>
              <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)]">Iconic Landmarks</h2>
              <p className="text-xs text-[#7A6258]">The spiritual monuments, ancient valleys, and high glaciers defining our geography.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DESTINATIONS.map(d => (
                <div
                  key={d.id}
                  onClick={() => onNavigate ? onNavigate(d.id) : router.push('/info/' + d.id)}
                  className="bg-[var(--card-bg)] border border-[var(--waffle)]/30 rounded-2xl p-4 flex flex-col gap-3.5 hover:border-[var(--caramel)]/40 transition-all duration-200 cursor-pointer active:scale-[0.99] group"
                >
                  <img src={d.image} alt={d.name} className="w-full h-32 object-cover rounded-xl border border-[var(--waffle)]/20" />
                  <div className="flex flex-col gap-1 text-xs text-left">
                    <h3 className="font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--caramel)] transition-colors">{d.name}</h3>
                    <p className="text-[#A89286] font-mono text-[9px]">{d.region} • {d.elevation}</p>
                    <p className="text-[#7A6258] leading-relaxed mt-1 text-[11px]">{d.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}

        {/* ── TOP 5 DESTINATIONS VIEW ─────────────────────────────────────── */}
        {activeId === 'top5' && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
            <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[var(--caramel)] uppercase">
                Curated Gold Tier
              </span>
              <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)]">Top 5 Destinations</h2>
              <p className="text-xs text-[#7A6258]">The supreme selection representing Trekking, Spiritual peace, Wildlife, Heritage, and desert camps.</p>
            </motion.div>

            <div className="flex flex-col gap-6">
              {DESTINATIONS.map((d, idx) => (
                <motion.div
                  variants={itemVariants}
                  key={d.id}
                  onClick={() => onNavigate ? onNavigate(d.id) : router.push('/info/' + d.id)}
                  className="bg-[var(--vanilla)]/20 border border-[var(--waffle)]/30 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:border-[var(--caramel)]/30 transition-all duration-200 cursor-pointer active:scale-[0.995] group"
                >
                  <div className="w-full md:w-56 h-36 relative shrink-0">
                    <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 h-7 w-7 rounded-full bg-[var(--caramel)] text-white flex items-center justify-center font-black text-xs font-mono shadow-sm">
                      0{idx + 1}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col justify-center gap-2 text-left">
                    <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-[var(--caramel)] transition-colors">{d.name}</h3>
                    <p className="text-xs text-[#7A6258] leading-relaxed">{d.details}</p>
                    <p className="text-[9px] font-mono text-[var(--caramel)] uppercase font-bold">{d.region} Region • {d.elevation}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>


    </>
  );
}

const getDiscoverProfileDetails = (username: string, role: string) => {
  if (username === 'Maya Dev') {
    return {
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
  }
  if (username === 'Liam Patterson') {
    return {
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
  }
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
};
