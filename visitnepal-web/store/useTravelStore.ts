import { create } from 'zustand';

export type UserRole = 'Traveler' | 'Hotel Owner' | 'Guide' | 'Host' | 'Butler' | 'Transportation Provider' | 'Permit Officer' | 'Admin' | 'Ambassador';

export interface User {
  name: string;
  role: UserRole;
  avatar: string;
  loggedIn: boolean;
  email: string;
  otpVerified: boolean;
  location?: string;
}

export interface Stay {
  id: string;
  name: string;
  type: 'Luxury' | 'Premium' | 'Classic' | 'Budget' | 'Eco Resort' | 'Boutique Hotel' | 'Mountain Lodge' | 'Homestay';
  location: string;
  price: number;
  rating: number;
  image: string;
  features: string[];
  description: string;
  coords: [number, number]; // [lat, lng] for maps
  availableDates: string[];
  roomPreviews: { name: string; price: number; image: string; info: string }[];
}

export interface Guide {
  id: string;
  name: string;
  type: 'Mountaineering' | 'Trekking' | 'Culture' | 'Wildlife' | 'Spiritual';
  rating: number;
  experience: number;
  pricePerDay: number;
  languages: string[];
  avatar: string;
  status: 'Online' | 'Offline';
  bio: string;
  phone: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'provider' | 'ai';
  senderName: string;
  text: string;
  translatedText?: string;
  timestamp: string;
  isVoice?: boolean;
  duration?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'Online' | 'Offline';
  messages: Message[];
  unread?: boolean;
  typing?: boolean;
}

export interface Permit {
  id: string;
  type: 'Trekking' | 'Mountaineering' | 'National Park' | 'Special Restricted';
  zone: string;
  applicantName: string;
  passportNumber: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  qrCode: string;
  cost: number;
}

export interface Booking {
  id: string;
  type: 'Hotel' | 'Guide' | 'Transportation' | 'Custom Trip' | 'Adventure Package';
  title: string;
  date: string;
  details: string;
  cost: number;
  status: 'Confirmed' | 'Pending' | 'Completed';
  invoiceNo: string;
}

export interface FeedPost {
  id: string;
  userId: string;          // e.g. "012010"
  userName: string;
  userAvatar: string;
  userRole: string;
  location: string;
  image?: string;
  content: string;
  likes: number;
  likedByUser: boolean;
  comments: { id: string; userName: string; text: string; timestamp: string }[];
  timestamp: string;
}

interface TravelStore {
  // Navigation & UI
  activeSection: 'home' | 'explore' | 'hotels' | 'permits' | 'customizer' | 'messages' | 'bookings' | 'database';
  setActiveSection: (section: 'home' | 'explore' | 'hotels' | 'permits' | 'customizer' | 'messages' | 'bookings' | 'database') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Auth
  currentUser: User | null;
  loginUser: (name: string, role: UserRole, email: string) => void;
  logoutUser: () => void;
  verifyOtp: () => void;

  // Stays
  stays: Stay[];
  addStay: (stay: Stay) => void;

  // Guides
  guides: Guide[];

  // Bookings
  bookings: Booking[];
  addBooking: (booking: Booking) => void;

  // Permits
  permits: Permit[];
  addPermit: (permit: Omit<Permit, 'id' | 'status' | 'qrCode'>) => void;
  updatePermitStatus: (id: string, status: 'Approved' | 'Rejected') => void;

  // Custom Trip Selections
  customPreferences: {
    budget: 'budget' | 'premium' | 'luxury';
    duration: number; // days
    interests: string[];
    difficulty: 'easy' | 'moderate' | 'challenging' | 'extreme';
    groupSize: number;
    preferredRegion: string;
    weatherPreference: string;
    transportPreference: 'flight' | 'private_vehicle' | 'helicopter' | 'adventure_jeep';
  };
  setCustomPreference: (key: string, value: any) => void;
  generatedItinerary: any | null;
  setGeneratedItinerary: (itinerary: any) => void;

  // Messaging System
  channels: ChatChannel[];
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  sendMessage: (channelId: string, text: string, sender: 'user' | 'provider' | 'ai') => void;
  sendVoiceMessage: (channelId: string, duration: string) => void;
  toggleTranslation: (channelId: string, messageId: string) => void;
  setTyping: (channelId: string, typing: boolean) => void;

  // Feed
  feedPosts: FeedPost[];
  addFeedPost: (content: string, image?: string, location?: string) => void;
  likeFeedPost: (id: string) => void;
  addFeedComment: (postId: string, text: string) => void;
  deleteFeedPost: (id: string) => void;

  // Admin Analytics & Insights
  revenueData: { month: string; revenue: number; bookingsCount: number }[];
  visitorHeatmap: { name: string; lat: number; lng: number; intensity: number }[];
  aiInsights: string[];
}

// Initial mock data
const initialStays: Stay[] = [
  {
    id: 's1',
    name: 'Shangri-La Cyber-Resort',
    type: 'Luxury',
    location: 'Kathmandu Valley',
    price: 320,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800',
    features: ['Holographic concierge', 'Oxygen-rich pods', 'Rooftop Helipad', 'Geothermal Spa'],
    description: 'An ultra-luxury sanctuary situated at the foothills of Kathmandu, combining ancient Newari architecture with advanced architectural design. Features sensory isolation spas and full AI butler integration.',
    coords: [27.7172, 85.324],
    availableDates: ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04'],
    roomPreviews: [
      { name: 'Nebula Presidential Suite', price: 450, image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800', info: '360° virtual window displaying active Himalayan skies.' },
      { name: 'Zen Glass Sanctuary', price: 320, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800', info: 'Indoor thermal pool and biometric health monitors.' }
    ]
  },
  {
    id: 's2',
    name: 'Everest Quantum Domes',
    type: 'Eco Resort',
    location: 'Gorak Shep (5,164m)',
    price: 680,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800',
    features: ['Pressurized pods', 'Heated floors', 'Himalayan astronomy deck', '3D Printed Meals'],
    description: 'The highest luxury eco-resort in the world. Positioned right below Everest Base Camp, offering climate-controlled glass dome structures with raw panoramic views of Mt. Everest, Lhotse, and Nuptse.',
    coords: [27.9878, 86.925],
    availableDates: ['2026-06-10', '2026-06-11', '2026-06-12'],
    roomPreviews: [
      { name: 'Celestial Glass Dome', price: 680, image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?q=80&w=800', info: 'Polarized anti-glare dome glass with direct sky-tracking star maps.' }
    ]
  },
  {
    id: 's3',
    name: 'Phewa Mirror Sanctuary',
    type: 'Boutique Hotel',
    location: 'Pokhara Lakeside',
    price: 210,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800',
    features: ['Infinity Lakeside Pool', 'Solar Yacht Access', 'Smart Audio Rooms', 'Meditation Gardens'],
    description: 'A striking minimalist boutique stay reflecting the pristine waters of Phewa Lake. Fully automated lighting, zero-gravity bedding, and automated eco-climate controls.',
    coords: [28.2096, 83.9856],
    availableDates: ['2026-05-28', '2026-05-29', '2026-05-30'],
    roomPreviews: [
      { name: 'Lake-mirror Pavilion', price: 210, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800', info: 'Full retractable glass walls floating right above Lake Phewa.' }
    ]
  },
  {
    id: 's4',
    name: 'Annapurna Cyber Lodge',
    type: 'Mountain Lodge',
    location: 'Manang Valley (3,519m)',
    price: 150,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=800',
    features: ['Acclimatization chamber', 'Hot tub over mountains', 'Local microbrewery', 'Smart map planning'],
    description: 'A cozy sanctuary for Annapurna Circuit adventurers. Equips guests with biometric trekking wearables, geothermal heating, and automated satellite communications.',
    coords: [28.6667, 84.0333],
    availableDates: ['2026-05-31', '2026-06-01', '2026-06-02'],
    roomPreviews: [
      { name: 'Sagarmatha View Room', price: 150, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800', info: 'Fitted with adjustable oxygen flow dial and pine-scented humidifiers.' }
    ]
  }
];

const initialGuides: Guide[] = [
  {
    id: 'g1',
    name: 'Nima Sherpa',
    type: 'Mountaineering',
    rating: 5.0,
    experience: 16,
    pricePerDay: 180,
    languages: ['Sherpa', 'Nepali', 'English', 'French', 'Chinese'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300',
    status: 'Online',
    bio: 'Summit climb master. Have guided over 22 successful Everest summits, including K2 winter climbs. Specializes in advanced oxygen-less high altitude safety.',
    phone: '+977-9801234567'
  },
  {
    id: 'g2',
    name: 'Priya Thapa',
    type: 'Wildlife',
    rating: 4.9,
    experience: 8,
    pricePerDay: 90,
    languages: ['Nepali', 'English', 'Spanish'],
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=300',
    status: 'Online',
    bio: 'Avid naturalist, botanical researcher, and wildlife conservationist. Dedicated to showing travelers the majestic snow leopards, Bengal tigers, and red pandas.',
    phone: '+977-9841987654'
  },
  {
    id: 'g3',
    name: 'Lobsang Lama',
    type: 'Spiritual',
    rating: 4.95,
    experience: 12,
    pricePerDay: 120,
    languages: ['Tibetan', 'Nepali', 'English', 'German'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300',
    status: 'Offline',
    bio: 'Born in Mustang. Specializes in Buddhist philosophy, monastery tours, mindfulness retreats, and historical Himalayan salt trails.',
    phone: '+977-9818765432'
  }
];

const initialChannels: ChatChannel[] = [
  {
    id: 'ch-ai',
    name: 'AURA Travel Butler (AI)',
    role: 'Virtual Companion',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300',
    status: 'Online',
    messages: [
      { id: 'm-ai-1', sender: 'ai', senderName: 'AURA', text: 'Namaste! I am AURA, your personalized cognitive AI travel butler for Nepal. I can assist you with real-time weather monitoring, smart routes, altitude acclimatization tracking, and localized translations. Where are we heading next?', timestamp: '12:45 PM' }
    ]
  },
  {
    id: 'ch-g1',
    name: 'Nima Sherpa (Guide)',
    role: 'Everest Expeditions Master',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300',
    status: 'Online',
    messages: [
      { id: 'mg1-1', sender: 'provider', senderName: 'Nima Sherpa', text: 'Tashi Delek! The satellite weather forecast indicates a clear window near EBC starting Friday. Are you fully packed with insulated cyber-gear?', timestamp: '10:14 AM' },
      { id: 'mg1-2', sender: 'user', senderName: 'Alex', text: 'Yes! My heated smart-boots are calibrated, and I have completed my acclimation session in Kathmandu. Let\'s do this!', timestamp: '10:16 AM' }
    ]
  },
  {
    id: 'ch-s1',
    name: 'Shangri-La Concierge',
    role: 'Luxury Hotel Host',
    avatar: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=300',
    status: 'Online',
    messages: [
      { id: 'ms1-1', sender: 'provider', senderName: 'Shangri-La Desk', text: 'Welcome to your premium luxury stay! Your customized oxygen parameters have been pre-loaded to Room 402. Would you like a drone dinner delivery upon arrival?', timestamp: 'Yesterday' }
    ]
  }
];

export const useTravelStore = create<TravelStore>((set) => ({
  // Navigation & UI
  activeSection: 'home',
  setActiveSection: (section) => set({ activeSection: section }),
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Auth
  currentUser: null,
  loginUser: (name, role, email) => set({
    currentUser: {
      name,
      role,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=300',
      loggedIn: true,
      email,
      otpVerified: false // Needs OTP verification
    }
  }),
  logoutUser: () => set({ currentUser: null }),
  verifyOtp: () => set((state) => ({
    currentUser: state.currentUser ? { ...state.currentUser, otpVerified: true } : null
  })),

  // Stays
  stays: initialStays,
  addStay: (stay) => set((state) => ({ stays: [...state.stays, stay] })),

  // Guides
  guides: initialGuides,

  // Bookings
  bookings: [
    {
      id: 'b1',
      type: 'Hotel',
      title: 'Shangri-La Cyber-Resort - Zen Glass Sanctuary',
      date: 'June 01 - June 04, 2026',
      details: 'Guest: Alex Mercer, Oxygen settings: High, Diet: Organic Vegan, Airport drone pick-up included.',
      cost: 960,
      status: 'Confirmed',
      invoiceNo: 'INV-2026-0819'
    },
    {
      id: 'b2',
      type: 'Guide',
      title: 'Nima Sherpa - Everest Expedition Safety Support',
      date: 'June 10 - June 15, 2026',
      details: 'Custom high-altitude logistics, bio-telemetry link enabled.',
      cost: 1080,
      status: 'Pending',
      invoiceNo: 'INV-2026-9021'
    }
  ],
  addBooking: (booking) => set((state) => ({ bookings: [booking, ...state.bookings] })),

  // Permits
  permits: [
    {
      id: 'p1',
      type: 'Mountaineering',
      zone: 'Mt. Everest (Sagarmatha)',
      applicantName: 'Alex Mercer',
      passportNumber: 'NPL-9988221A',
      startDate: '2026-06-08',
      endDate: '2026-06-25',
      status: 'Approved',
      qrCode: 'VERIFIED_EVEREST_EXP_2026_09A',
      cost: 11000
    },
    {
      id: 'p2',
      type: 'National Park',
      zone: 'Annapurna Conservation Area (ACAP)',
      applicantName: 'Alex Mercer',
      passportNumber: 'NPL-9988221A',
      startDate: '2026-05-30',
      endDate: '2026-06-06',
      status: 'Pending',
      qrCode: 'PENDING_VERIFY_ACAP_8819',
      cost: 30
    }
  ],
  addPermit: (permit) => set((state) => {
    const newPermit: Permit = {
      ...permit,
      id: `p-${Date.now()}`,
      status: 'Pending',
      qrCode: `VERIFY_MOCK_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
    return { permits: [...state.permits, newPermit] };
  }),
  updatePermitStatus: (id, status) => set((state) => ({
    permits: state.permits.map(p => p.id === id ? { ...p, status } : p)
  })),

  // Custom Trip Preferences
  customPreferences: {
    budget: 'premium',
    duration: 10,
    interests: ['Trekking', 'Spiritual Retreats', 'Eco Tourism'],
    difficulty: 'moderate',
    groupSize: 2,
    preferredRegion: 'Everest',
    weatherPreference: 'Cool & Sunny',
    transportPreference: 'helicopter'
  },
  setCustomPreference: (key, value) => set((state) => ({
    customPreferences: { ...state.customPreferences, [key]: value }
  })),
  generatedItinerary: null,
  setGeneratedItinerary: (itinerary) => set({ generatedItinerary: itinerary }),

  // Messaging System
  channels: initialChannels,
  activeChannelId: 'ch-ai',
  setActiveChannelId: (id) => set({ activeChannelId: id }),
  sendMessage: (channelId, text, sender) => set((state) => {
    const messageId = `msg-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const senderName = sender === 'user'
      ? (state.currentUser?.name || 'Alex')
      : (sender === 'ai' ? 'AURA' : 'Service Provider');

    const newMsg: Message = {
      id: messageId,
      sender,
      senderName,
      text,
      timestamp
    };

    // Smart English to Nepali translation for mock AI purposes
    if (sender === 'user') {
      const translatedMap: Record<string, string> = {
        'hello': 'नमस्ते (Namaste)',
        'hi': 'नमस्ते (Namaste)',
        'weather': 'मौसम अहिले सफा छ र हिमपातको न्यून सम्भावना छ (The weather is currently clear with low chances of snow).',
        'permit': 'तपाईंको अनुमति पत्र स्वीकृत भइसकेको छ (Your permit has been approved).',
        'namaste': 'नमस्ते! म कसरी मद्दत गर्न सक्छु? (Namaste! How can I assist you?)',
        'everest': 'सगरमाथा क्षेत्रमा तपाईंलाई स्वागत छ! (Welcome to the Mt. Everest region!)'
      };

      const lowercaseText = text.toLowerCase();
      let matchedTranslation = 'नेपालीमा अनुवाद गर्न सकिएन (Translation pending...)';

      for (const [key, value] of Object.entries(translatedMap)) {
        if (lowercaseText.includes(key)) {
          matchedTranslation = value;
          break;
        }
      }

      newMsg.translatedText = matchedTranslation;
    }

    const updatedChannels = state.channels.map(ch => {
      if (ch.id === channelId) {
        return {
          ...ch,
          unread: false,
          messages: [...ch.messages, newMsg]
        };
      }
      return ch;
    });

    return { channels: updatedChannels };
  }),
  sendVoiceMessage: (channelId, duration) => set((state) => {
    const messageId = `msg-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: messageId,
      sender: 'user',
      senderName: state.currentUser?.name || 'Alex',
      text: 'Voice message sent',
      timestamp,
      isVoice: true,
      duration
    };

    const updatedChannels = state.channels.map(ch => {
      if (ch.id === channelId) {
        return {
          ...ch,
          messages: [...ch.messages, newMsg]
        };
      }
      return ch;
    });

    return { channels: updatedChannels };
  }),
  toggleTranslation: (channelId, messageId) => set((state) => {
    // If the message has a translated version, we display it or mock translate it
    return {
      channels: state.channels.map(ch => {
        if (ch.id === channelId) {
          return {
            ...ch,
            messages: ch.messages.map(m => {
              if (m.id === messageId) {
                if (!m.translatedText) {
                  return { ...m, translatedText: 'तपाईंको यात्रा रमाइलो रहोस्! (Have a wonderful journey!)' };
                } else {
                  // Toggle out or just keep it
                  return m;
                }
              }
              return m;
            })
          };
        }
        return ch;
      })
    };
  }),
  setTyping: (channelId, typing) => set((state) => ({
    channels: state.channels.map(ch => ch.id === channelId ? { ...ch, typing } : ch)
  })),

  // Admin Analytics & Insights
  revenueData: [
    { month: 'Jan', revenue: 45000, bookingsCount: 120 },
    { month: 'Feb', revenue: 58000, bookingsCount: 154 },
    { month: 'Mar', revenue: 84000, bookingsCount: 210 },
    { month: 'Apr', revenue: 122000, bookingsCount: 315 },
    { month: 'May', revenue: 168000, bookingsCount: 420 }
  ],
  visitorHeatmap: [
    { name: 'Solukhumbu (Everest)', lat: 27.9878, lng: 86.925, intensity: 0.9 },
    { name: 'Pokhara Lakeside', lat: 28.2096, lng: 83.9856, intensity: 0.8 },
    { name: 'Annapurna Circuit', lat: 28.6667, lng: 84.0333, intensity: 0.75 },
    { name: 'Kathmandu Heritage', lat: 27.7172, lng: 85.324, intensity: 0.85 },
    { name: 'Chitwan Jungle', lat: 27.5333, lng: 84.45, intensity: 0.6 }
  ],
  aiInsights: [
    'Eco-Luxury bookings up by 42% this quarter, driven by the Everest Quantum Domes launch.',
    'Guide demand spikes expected in the Langtang and Manaslu regions due to clear high-altitude climate projections.',
    'Intelligent pathfinding AI recommends boosting helicopter availability for the Kanchenjunga region during early October.',
    'Visitor density mapping reveals high concentration in Gandaki province; recommending promotion of Far-Western religious trails.'
  ],
  feedPosts: [
    {
      id: 'post-1',
      userId: '048291',
      userName: 'Maya Dev',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
      userRole: 'Cultural Explorer',
      location: 'Bhaktapur Durbar Square',
      image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800',
      content: 'Wandering through the ancient corridors of Bhaktapur. The Newari wood carving details are incredibly well-preserved here. A must-visit heritage spot! 🏯✨',
      likes: 42,
      likedByUser: false,
      comments: [
        { id: 'c-1', userName: 'John Doe', text: 'Stunning capture, Maya!', timestamp: '2 hours ago' }
      ],
      timestamp: '3 hours ago'
    },
    {
      id: 'post-2',
      userId: '019374',
      userName: 'Liam Patterson',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
      userRole: 'High-Altitude Trekker',
      location: 'Annapurna Base Camp (4,130m)',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800',
      content: 'Woke up at 5:00 AM to catch the sunrise over Mt. Machapuchare and Annapurna South. Absolutely freezing, but worth every single second! 🏔️❄️',
      likes: 128,
      likedByUser: true,
      comments: [],
      timestamp: '5 hours ago'
    }
  ],
  addFeedPost: (content, image, location) => set((state) => {
    const uid = String(Math.floor(100000 + Math.random() * 899999)); // e.g. "482910"
    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      userId: uid,
      userName: state.currentUser?.name || 'Guest Traveler',
      userAvatar: state.currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150',
      userRole: state.currentUser?.role || 'Explorer',
      location: location || 'Nepal Gateway',
      image,
      content,
      likes: 0,
      likedByUser: false,
      comments: [],
      timestamp: 'Just now'
    };
    return { feedPosts: [newPost, ...state.feedPosts] };
  }),
  likeFeedPost: (id) => set((state) => ({
    feedPosts: state.feedPosts.map(post => {
      if (post.id === id) {
        return {
          ...post,
          likes: post.likedByUser ? post.likes - 1 : post.likes + 1,
          likedByUser: !post.likedByUser
        };
      }
      return post;
    })
  })),
  addFeedComment: (postId, text) => set((state) => ({
    feedPosts: state.feedPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `comment-${Date.now()}`,
              userName: state.currentUser?.name || 'Anonymous Traveler',
              text,
              timestamp: 'Just now'
            }
          ]
        };
      }
      return post;
    })
  })),
  deleteFeedPost: (id) => set((state) => ({
    feedPosts: state.feedPosts.filter(post => post.id !== id)
  }))
}));
