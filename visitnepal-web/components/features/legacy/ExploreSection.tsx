'use client';

import React, { useState } from 'react';
import NepalMap from '@/components/ui/NepalMap';
import { useRouter } from 'next/navigation';
import { 
  Compass, 
  MapPin, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  CompassIcon, 
  Heart,
  Mountain,
  Sunset,
  Camera,
  Activity,
  Trees,
  Gem
} from 'lucide-react';
import { useTravelStore } from '@/store/useTravelStore';

export default function ExploreSection() {
  const router = useRouter();
  const { setActiveSection, setCustomPreference } = useTravelStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Categories', icon: Compass },
    { id: 'trekking', label: 'Trekking & Alpine', icon: Mountain },
    { id: 'spiritual', label: 'Spiritual Retreats', icon: Sunset },
    { id: 'wildlife', label: 'Wildlife Safari', icon: Trees },
    { id: 'photography', label: 'Photography', icon: Camera },
    { id: 'adventure', label: 'Extreme Sports', icon: Activity },
  ];

  const attractions = [
    {
      id: 'at1',
      name: 'Boudhanath Stupa',
      category: 'spiritual',
      location: 'Kathmandu Valley',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=500',
      elevation: '1,400m',
      difficulty: 'Easy Access',
      rating: 4.95,
      description: 'One of the largest spherical stupas in the world. Features giant wisdom eyes, spinning prayer wheels, and heavy spiritual energy.'
    },
    {
      id: 'at2',
      name: 'Muktinath Temple',
      category: 'spiritual',
      location: 'Mustang Region',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=500',
      elevation: '3,710m',
      difficulty: 'Moderate Climb',
      rating: 4.9,
      description: 'Sacred place of salvation for Buddhists and Hindus. Famous for its 108 stone water spouts and eternal natural gas flames.'
    },
    {
      id: 'at3',
      name: 'Annapurna Base Camp',
      category: 'trekking',
      location: 'Gandaki Province',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=500',
      elevation: '4,130m',
      difficulty: 'Challenging',
      rating: 4.88,
      description: 'A spectacular natural amphitheater flanked by the Annapurna South, Machapuchare (Fishtail), and Annapurna I peaks.'
    },
    {
      id: 'at4',
      name: 'Chitwan River Safari',
      category: 'wildlife',
      location: 'Chitwan Plains',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=500',
      elevation: '150m',
      difficulty: 'Easy Access',
      rating: 4.8,
      description: 'Canoe rides down the Rapti river. Spot prehistoric gharial crocodiles and rare single-horned Asiatic rhinos in their native marshes.'
    },
    {
      id: 'at5',
      name: 'Upper Mustang Caves',
      category: 'photography',
      location: 'Mustang Restricted Area',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=500',
      elevation: '3,840m',
      difficulty: 'Challenging',
      rating: 4.97,
      description: 'Ancient sky caves carved into vertical sandstone cliffs. Houses 600-year-old murals, ancient manuscripts, and historical chambers.'
    },
    {
      id: 'at6',
      name: 'Pokhara Paragliding Arena',
      category: 'adventure',
      location: 'Sarangkot Pokhara',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=500',
      elevation: '1,600m',
      difficulty: 'Moderate Thrill',
      rating: 4.75,
      description: 'Fly alongside Himalayan eagles. Offers a raw bird\'s eye view of the tranquil Phewa Lake and the giant Machapuchare peak.'
    }
  ];

  const filteredAttractions = activeCategory === 'all' 
    ? attractions 
    : attractions.filter(at => at.category === activeCategory);

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Immersive Map Integration */}
      <section>
        <NepalMap />
      </section>

      {/* Tourism Categories Ribbon */}
      <section className="flex flex-col gap-4">
        <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
          <Gem className="h-5 w-5 text-purple-400" />
          <span>Select Travel Dimension</span>
        </h3>
        
        {/* Horizontal scroll on mobile */}
        <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-2 font-mono scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected 
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-black border-transparent shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-[1.02]' 
                    : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular Attractions Grid */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold tracking-wide text-white">Popular Heritage & Trekking Clusters</h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">Showing {filteredAttractions.length} Landmarks</span>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttractions.map((item) => (
            <div 
              key={item.id}
              onClick={() => {
                const slug = item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                router.push('/info/' + slug);
              }}
              className="glass-panel rounded-2xl overflow-hidden border border-zinc-850 hover:border-cyan-500/40 group transition-all duration-500 flex flex-col h-[380px] cursor-pointer active:scale-[0.99]"
            >
              {/* Image Frame */}
              <div className="relative h-44 w-full overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="bg-zinc-950/90 text-cyan-400 text-[8px] font-bold font-mono uppercase tracking-widest px-2.5 py-1 rounded-md border border-cyan-900">
                    {item.elevation}
                  </span>
                  <span className="bg-zinc-950/90 text-purple-400 text-[8px] font-bold font-mono uppercase tracking-widest px-2.5 py-1 rounded-md border border-purple-900">
                    {item.difficulty}
                  </span>
                </div>

                {/* Favorite button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Optional: Toggle favorite state in the future
                  }}
                  className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-zinc-950/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-500 flex items-center justify-center border border-zinc-900 transition-colors cursor-pointer"
                >
                  <Heart className="h-4 w-4" />
                </button>
              </div>

              {/* Data Space */}
              <div className="p-5 flex flex-col flex-1 justify-between bg-zinc-950/20">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">{item.location}</span>
                    <span className="text-[10px] font-mono font-bold text-amber-400">★ {item.rating}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Explore/Planner shortcut */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomPreference('preferredRegion', item.location.split(' ')[0]);
                    setActiveSection('customizer');
                  }}
                  className="w-full mt-4 rounded-xl bg-zinc-900 hover:bg-cyan-500 group-hover:hover:bg-cyan-400 hover:text-black border border-zinc-800 hover:border-transparent py-2 text-xs font-bold text-zinc-300 font-mono transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CompassIcon className="h-3.5 w-3.5" />
                  <span>Configure Trip With This Attraction</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
