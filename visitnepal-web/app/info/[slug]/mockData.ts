// Mock Data and helper functions for InfoDetailPage

// ─── Type Definitions ─────────────────────────────────────────────────────────
export type NavItem = { label: string; icon: string; id: string; badge?: string };
export type NavGroup = { title: string; items: NavItem[] };

// ─── Sidebar Data ─────────────────────────────────────────────────────────────
export const NAV_GROUPS: NavGroup[] = [
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
  }
];

// ─── HIGH-FIDELITY LOCAL DATABASE REGISTRY ───────────────────────────────────
export interface InfoItem {
  title: string;
  category: 'Destination' | 'Attraction' | 'Activity';
  subtitle: string;
  image: string;
  elevation?: string;
  region?: string;
  difficulty?: string;
  duration?: string;
  season?: string;
  rating: number;
  description: string;
  details: string;
  highlights: string[];
  tips: string[];
  gear: { name: string; desc: string }[];
  weather: { region: string; temp: string; status: string; alert: string };
  aiPrompt: string;
  lat?: number;
  lng?: number;
}

export const INFO_REGISTRY: Record<string, InfoItem> = {
  'mount-everest-base-camp': {
    title: 'Mount Everest Base Camp',
    category: 'Destination',
    subtitle: 'The Ultimate Alpine Pilgrimage',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200',
    elevation: '5,364 m',
    region: 'Khumbu Valley',
    difficulty: 'Challenging',
    duration: '12 - 14 Days',
    season: 'Autumn (Oct-Nov) & Spring (Mar-May)',
    rating: 4.98,
    description: 'Walk in the footsteps of legends to the base of the world\'s highest peak. A grand tour through Sherpa country, high suspended bridges, and ancient Buddhist monasteries.',
    details: 'The trek to Everest Base Camp is more than just a hike; it is a spiritual journey. As you ascend through Sagarmatha National Park, you are enveloped by giant snow peaks like Lhotse, Nuptse, and Ama Dablam. You will stay in classic mountain tea houses, observe spinning prayer wheels, and experience first-hand the warm, hospitable culture of the Sherpa people. Kalapatthar offers a spectacular golden sunrise view of the apex.',
    highlights: [
      'Breathtaking sunrise panorama from Kala Patthar (5,545m)',
      'Exploring Namche Bazaar, the historic Sherpa capital',
      'Visiting the sacred Tengboche Monastery with panoramic mountain views',
      'Standing at the foot of the active Khumbu Icefall'
    ],
    tips: [
      'Acclimatize properly: spend extra rest days in Namche and Dingboche.',
      'Drink at least 4-5 liters of water daily to stave off high altitude sickness.',
      'Hire a licensed guide or local Sherpa pathfinder for cultural immersion and safety.'
    ],
    gear: [
      { name: '4-Season Sleeping Bag', desc: 'Rated down to -20°C for cold tea-house nights.' },
      { name: 'Gore-Tex Shell Jacket', desc: 'Windproof and waterproof layer for high mountain storms.' },
      { name: 'Sturdy Waterproof Hiking Boots', desc: 'High traction ankle-supported leather boots, well broken-in.' }
    ],
    weather: { region: 'Khumbu Peak Station', temp: '-6°C', status: 'Windy, Clear', alert: 'Altitude Warning: 5k m+' },
    aiPrompt: "Namaste! I am AURA, synced to the Khumbu High-Altitude Telemetry. Ask me about acclimating, sherpa pathfinders, or the best viewpoints on the Everest trail!"
  },
  'everest-quantum-domes': {
    title: 'Everest Quantum Domes',
    category: 'Destination',
    subtitle: 'Pressurized High-Altitude Eco-Resort',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200',
    elevation: '5,150 m',
    region: 'Khumbu Valley',
    difficulty: 'Extreme Adventure',
    duration: '3 - 7 Days',
    season: 'Autumn (Oct-Nov) & Spring (Mar-May)',
    rating: 4.99,
    description: 'Pressurized quantum domes offering high-altitude luxury with real-time oxygen calibration, orbital domes, and satellite pathfinders.',
    details: 'The Everest Quantum Domes are a miracle of modern sustainable engineering. Situated high above the clouds in the Khumbu region, these luxury pressurized domes provide a cozy, oxygen-enriched refuge for mountaineers and premium travelers. Every dome features dynamic panoramic glazing and private climate-controlled sanitation systems.',
    highlights: [
      'Gazing at Mount Everest from your heated, oxygen-pressurized bed',
      'Acclimatizing seamlessly with smart biometric regulatory metrics',
      'Dining at the extreme edge of the world with farm-to-table cuisine',
      'Private satellite pathfinders to lead customizable glacier loops'
    ],
    tips: [
      'Book pressurized domes at least 6 months in advance due to high demand.',
      'Sync your smart clothing biometric monitors to the center regulator desk.',
      'Take advantage of the on-site orbital path projections for safe weather loops.'
    ],
    gear: [
      { name: 'Biometric Smart Shell', desc: 'Sensory jacket sending real-time oxygen metrics to AURA.' },
      { name: 'Pressurized Sleeping Pod', desc: 'Ensures optimal deep sleep oxygenation levels.' },
      { name: 'High-Altitude Sunglasses', desc: 'Protects from severe glacier snow blindness.' }
    ],
    weather: { region: 'Everest Station Delta', temp: '-8°C', status: 'Windy, Clear', alert: 'Domes Pressure Normal' },
    aiPrompt: "Namaste! I am AURA. I can answer your questions about dome air pressure, automated oxygen calibration, or guide booking details!"
  },
  'phewa-lake-pokhara': {
    title: 'Phewa Lake, Pokhara',
    category: 'Destination',
    subtitle: 'Tranquil Waters & Himalayan Mirrors',
    image: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=1200',
    elevation: '822 m',
    region: 'Kaski District',
    difficulty: 'Easy Access',
    duration: '1 - 3 Days',
    season: 'Year-round (Best Oct-Apr)',
    rating: 4.88,
    description: 'A tranquil lakeside resort town with raw mountain reflections. Relax in standard lakeside tea houses or paddle under the clear gaze of Machapuchare.',
    details: 'Phewa Lake is the centerpiece of Pokhara’s natural charm. The pristine water acts as a mirror for the Annapurna range, especially during early mornings and golden sunsets. In the center of the lake stands the two-storied Tal Barahi Temple, a serene Hindu sanctuary reachable only by traditional wooden boats.',
    highlights: [
      'Boating in colorful traditional wooden canoes (doongas)',
      'Sunset reflections of Machapuchare (Fishtail Peak)',
      'Visiting the tranquil Tal Barahi Temple in the middle of the lake',
      'Paragliding from nearby Sarangkot landing close to the lake shores'
    ],
    tips: [
      'Rent a boat early in the morning for the calmest, clearest mirror reflections.',
      'Always wear a certified life jacket while out on the water.',
      'Take the quiet northern lakeside path for an escape from the tourist bustle.'
    ],
    gear: [
      { name: 'Polarized Sunglasses', desc: 'Protects eyes from heavy water glare and reflective sunlight.' },
      { name: 'Light Windbreaker', desc: 'Comfortable layer for cool lakeside evening breezes.' },
      { name: 'Waterproof Daypack', desc: 'Compact pack to carry camera and layers during boat trips.' }
    ],
    weather: { region: 'Pokhara Valley', temp: '24°C', status: 'Sunny', alert: 'Optimal Lake Boating Parameters' },
    aiPrompt: "Namaste! I am AURA. I can guide you through the lakeside café scenes, boat rental details, or coordinate a paragliding adventure from Sarangkot!"
  },
  'phewa-lakeside-mirror': {
    title: 'Phewa Lakeside Mirror',
    category: 'Destination',
    subtitle: 'Spiritual Biotech Stay & Reflections',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200',
    elevation: '822 m',
    region: 'Pokhara Valley',
    difficulty: 'Relaxation',
    duration: '2 - 4 Days',
    season: 'Year-round (Best Oct-Apr)',
    rating: 4.89,
    description: 'High-tech lakeside health retreat integrating biometric sensory rooms, crystal clear floatation pods, and raw mountain views.',
    details: 'The Lakeside Mirror health stay in Pokhara combines ancient Himalayan wellness philosophies with next-generation biotech. Floating platforms sit gently over Phewa Lake, reflecting the gorgeous Annapurna peaks and Machapuchare.',
    highlights: [
      'Waking up to organic herbal tonics calibrated to your blood stats',
      'Meditative floatation pods filled with mineral-rich hot spring waters',
      'Spectacular lakeside sunrise yoga facing Machapuchare peak',
      'Organic garden tours with herbal medicine practitioners'
    ],
    tips: [
      'Participate in the late afternoon Tibetan bell meditation sessions.',
      'Keep your sensory parameters calibrated for active room climate control.',
      'Take the quiet northern forest trail to explore nearby local stupas.'
    ],
    gear: [
      { name: 'Sensory Meditation Band', desc: 'Monitors pulse and focus parameters during visual guides.' },
      { name: 'Quick-Dry Bamboo Robe', desc: 'Organic robe perfect for floatation pods and spas.' },
      { name: 'Thermal Mug', desc: 'Keeps mountain-harvested ginger and cardamom tea hot.' }
    ],
    weather: { region: 'Pokhara Lakeside', temp: '25°C', status: 'Clear, Calmer Waters', alert: 'Biotech System Calibration Active' },
    aiPrompt: "Namaste! I am AURA. Let me help you schedule a herbal massage, explain floatation pod settings, or coordinate boat trips!"
  },
  'boudhanath-stupa': {
    title: 'Boudhanath Stupa',
    category: 'Attraction',
    subtitle: 'Epicenter of Wisdom & Spiritual Harmony',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200',
    elevation: '1,400 m',
    region: 'Kathmandu Valley',
    difficulty: 'Easy Access',
    duration: 'Half Day',
    season: 'Year-round',
    rating: 4.95,
    description: 'One of the largest spherical stupas in the world. Features giant wisdom eyes, spinning prayer wheels, and heavy spiritual energy.',
    details: 'Boudhanath Stupa dominates the skyline of Kathmandu. It is a beacon of Tibetan Buddhism, decorated with thousands of colorful prayer flags that flutter in the wind, carrying mantras to the heavens. The stupa is built on an ancient trade route from Tibet, and for centuries, merchants and pilgrims have offered prayers here for safe journeys.',
    highlights: [
      'Circumambulating the dome (Kora) clockwise alongside local pilgrims',
      'Listening to the meditative chanting of "Om Mani Padme Hum" at dusk',
      'Viewing the colorful rooftop monasteries overlooking the main plaza',
      'Sipping traditional butter tea on a rooftop terrace overlooking the Stupa'
    ],
    tips: [
      'Always walk around the stupa in a clockwise direction.',
      'Visit during the late afternoon to see hundreds of butter lamps being lit.',
      'Respect local worshipers and ask before taking portraits of monks.'
    ],
    gear: [
      { name: 'Slip-on Shoes', desc: 'Convenient for entering the numerous surrounding monasteries.' },
      { name: 'Modest Clothing', desc: 'Cover shoulders and knees out of respect for the sacred temple grounds.' },
      { name: 'Camera with Zoom Lens', desc: 'Perfect for capturing detailed architectural shots and prayer flags.' }
    ],
    weather: { region: 'Kathmandu Valley', temp: '22°C', status: 'Sunny', alert: 'Sacred Plaza Open to Pilgrimage' },
    aiPrompt: "Namaste! I am AURA. Ask me about the 108 stupa niches, the ancient trade history, or the best monastery rooftops to observe the ritual chants."
  },
  'chitwan-wildlife-sanctuary': {
    title: 'Chitwan Wildlife Sanctuary',
    category: 'Destination',
    subtitle: 'Heart of the Subtropical Jungles',
    image: 'https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=1200',
    elevation: '150 m',
    region: 'Chitwan Plains',
    difficulty: 'Easy Access',
    duration: '2 - 3 Days',
    season: 'October - April (Dry Season)',
    rating: 4.8,
    description: 'Deep subtropical jungles where rare rhinos roam free. Experience guided canoe safaris and dense jungle exploration looking for tigers, leopards, and crocodiles.',
    details: 'Chitwan (meaning "Heart of the Jungle") is one of the premier wildlife viewing destinations in Asia. It is home to the endangered one-horned Asiatic rhinoceros, royal Bengal tigers, leopards, wild elephants, and over 500 species of birds. The Rapti River bounds the park, offering peaceful dugout canoe rides where gharial crocodiles sun themselves.',
    highlights: [
      'Spotting the prehistoric single-horned rhinoceros in its wild habitat',
      'Gliding silently down the Rapti River in a traditional dugout canoe',
      'Guided walking jungle safaris with expert naturalist rangers',
      'Experiencing Tharu cultural dance performances in the buffer zone'
    ],
    tips: [
      'Wear neutral, earth-toned clothing (greens and browns) to blend into the jungle.',
      'Always listen to your naturalist guide, especially during walking safaris.',
      'Bring plenty of mosquito repellent and sun protection.'
    ],
    gear: [
      { name: 'Binoculars', desc: 'Essential for spotting birds and elusive mammals in the thick canopy.' },
      { name: 'Insect Repellent Spray', desc: 'High strength DEET spray to guard against jungle insects.' },
      { name: 'Quick-Dry Clothing', desc: 'Lightweight, breathable clothes for high jungle humidity.' }
    ],
    weather: { region: 'Chitwan Jungles', temp: '31°C', status: 'Humid, Sunny', alert: 'Tiger Spotting Probability: Moderate-High' },
    aiPrompt: "Namaste! I am AURA, synced to the Terai Wildlife Watch. Ask me about rhino sightings, canoe booking rates, or how to arrange a safe jungle walk!"
  },
  'lo-manthang-upper-mustang': {
    title: 'Lo Manthang, Upper Mustang',
    category: 'Destination',
    subtitle: 'The Forbidden Kingdom of Sandstone Cliffs',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200',
    elevation: '3,840 m',
    region: 'Mustang Region',
    difficulty: 'Moderate-Challenging',
    duration: '10 - 12 Days',
    season: 'May - November (Rain-shadow region)',
    rating: 4.97,
    description: 'A walled city in the high-altitude trans-Himalayan desert. Explore ancient red cliffs, sky caves, and the preserved fortress palace of the former Kingdom of Lo.',
    details: 'Upper Mustang is a pocket of traditional Tibetan culture untouched by the modern world. Hidden behind the rain-shadow of the Annapurnas, its landscape is a dramatic desert of stark clay cliffs, cave temples, and whitewashed villages. The walled capital of Lo Manthang houses medieval palaces, ancient monasteries, and murals dating back to the 14th century.',
    highlights: [
      'Entering the medieval four-storied walled city of Lo Manthang',
      'Exploring the mysterious sky caves carved high into vertical cliffs',
      'Attending the energetic Tiji Festival (springtime Buddhist ritual)',
      'Marveling at the vast trans-Himalayan desert vistas'
    ],
    tips: [
      'Upper Mustang requires a restricted area permit ($500 for 10 days). Plan ahead.',
      'Pack warm gear even in summer; high-altitude winds can be extremely chilly.',
      'Carry cash; ATM access is highly limited past Jomsom.'
    ],
    gear: [
      { name: 'Windproof Buff / Balaclava', desc: 'Protects face from severe sand-laden dust storms.' },
      { name: 'High-SPF Sunscreen', desc: 'Crucial at high altitudes under the intense mountain sun.' },
      { name: 'Durable Trekking Poles', desc: 'Saves joints on steep, loose sandstone descents.' }
    ],
    weather: { region: 'Mustang Region', temp: '12°C', status: 'Windy, Bright Sun', alert: 'Restricted Area Entry Permit Check Required' },
    aiPrompt: "Namaste! I am AURA. I can answer your questions about Mustang restricted area permits, sky caves history, or the ancient palace archives."
  },
  'mustang-kingdom': {
    title: 'Mustang Kingdom',
    category: 'Destination',
    subtitle: 'Ancient trans-Himalayan desert loops',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200',
    elevation: '3,840 m',
    region: 'Mustang Region',
    difficulty: 'High Altitude',
    duration: '10 - 12 Days',
    season: 'May - November',
    rating: 4.98,
    description: 'Explore the high sandstone cliffs and sky caves of the ancient walled city of Lo Manthang.',
    details: 'The forbidden Mustang Kingdom is a sacred, high-altitude desert preserve hidden in the rain shadow of Annapurna. Its dramatic canyons, ancient whitewashed stone fortress walls, and Sky Caves containing medieval murals provide a stunning step back in time.',
    highlights: [
      'Wandering the narrow cobblestone pathways of Lo Manthang fortress',
      'Exploring Sky Caves carved deep into vertical sandstone canyon walls',
      'Acquiring restricted permits with digital blockchain check-in',
      'Marveling at the wild, sand-blown trans-Himalayan valleys'
    ],
    tips: [
      'Secure high-altitude permits ($500 for 10 days) prior to travel.',
      'Carry a wind mask to shield your face from strong afternoon dust loops.',
      'Plan travel in summer/autumn; monsoon clouds do not pass this rain-shadow zone.'
    ],
    gear: [
      { name: 'Windproof Balaclava', desc: 'Protects face from dust and strong sandy mountain winds.' },
      { name: 'Durable Trekking Poles', desc: 'Reduces knee strain on loose sandstone descents.' },
      { name: 'UV Protection Sunscreen', desc: 'High strength sun defense under the bright high-altitude sun.' }
    ],
    weather: { region: 'Upper Mustang Hub', temp: '11°C', status: 'Windy, Clear Skies', alert: 'Blockchain Permitted Zone Only' },
    aiPrompt: "Namaste! I am AURA. Ask me about the sandstone cliff routes, royal palace entry tickets, or ancient sky cave manuscripts!"
  },
  'muktinath-temple': {
    title: 'Muktinath Temple',
    category: 'Attraction',
    subtitle: 'Sacred Valley of Salvation',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200',
    elevation: '3,710 m',
    region: 'Mustang District',
    difficulty: 'Moderate Climb',
    duration: '1 - 2 Days',
    season: 'Year-round',
    rating: 4.95,
    description: 'Sacred place of salvation for Buddhists and Hindus. Famous for its 108 stone water spouts and eternal natural gas flames.',
    details: 'Nestled at the base of the Thorong La mountain pass, Muktinath (called Chumig Gyatsa by Buddhists) is a sacred pilgrimage site. Hindus believe bathing in its waters grants liberation (Moksha) from the cycle of rebirth. The temple complex features 108 bronze water spouts representing sacred rivers and a shrine holding a continuously burning natural gas flame emerging from a rock over water.',
    highlights: [
      'Viewing the 108 sacred bull-headed stone water spouts',
      'Observing the eternal flame inside the Jwala Mai Temple',
      'Witnessing the harmonious co-existence of Hindu and Buddhist shrines',
      'Crossing or viewing the iconic Thorong La pass trail nearby'
    ],
    tips: [
      'If you plan to bathe in the cold spouts, pack extra dry clothing immediately.',
      'Take your time to climb; the rapid ascent from Pokhara can trigger altitude symptoms.',
      'Hire a local jeep from Jomsom for a scenic and faster transport option.'
    ],
    gear: [
      { name: 'Warm Fleece Layer', desc: 'Insulating midlayer for the sub-zero mountain temperatures.' },
      { name: 'Quick-Dry Towel', desc: 'Perfect for drying off if participating in sacred bathing rituals.' },
      { name: 'Durable Hiking Shoes', desc: 'Provides stable grip on the stone steps leading to the temple.' }
    ],
    weather: { region: 'Mustang Valleys', temp: '8°C', status: 'Cold, Sunny', alert: 'Thorong La Pass Meteorological Status: Closed at Night' },
    aiPrompt: "Namaste! I am AURA. Ask me about the geological origin of the eternal flame, local homestays in Ranipauwa, or route details via the Annapurna Circuit!"
  },
  'annapurna-base-camp': {
    title: 'Annapurna Base Camp',
    category: 'Attraction',
    subtitle: 'A Spectacular Mountain Amphitheater',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200',
    elevation: '4,130 m',
    region: 'Gandaki Province',
    difficulty: 'Challenging',
    duration: '7 - 10 Days',
    season: 'Autumn & Spring',
    rating: 4.88,
    description: 'A spectacular natural amphitheater flanked by the Annapurna South, Machapuchare (Fishtail), and Annapurna I peaks.',
    details: 'Annapurna Base Camp (ABC) offers one of the most stunning 360-degree mountain panoramas in the world. Flanked by Annapurna South, Annapurna I, Hiunchuli, and the sacred Machapuchare (Fishtail), the camp feels like sitting inside a giant stadium of ice. The trek climbs through terraced farms, lush rhododendron forests, and deep bamboo valleys before breaking out into the dry alpine sanctuary.',
    highlights: [
      'Standing in the 360-degree sanctuary of snow-capped 8,000m giants',
      'Hiking through beautiful mossy rhododendron and bamboo forests',
      'Relaxing in the soothing natural hot springs at Jhinu Danda',
      'Watching the golden first-light hit the south face of Annapurna I'
    ],
    tips: [
      'The trail contains thousands of stone steps; walk slowly and protect your knees.',
      'Rhododendron blooms are at their peak between March and April.',
      'Keep track of weather; high altitude corridors are prone to rapid afternoon fog.'
    ],
    gear: [
      { name: 'Knee Braces / Supports', desc: 'Extremely helpful for descending the thousands of steep stone stairs.' },
      { name: 'Thermal Base Layers', desc: 'Wicks sweat while keeping you warm during morning climbs.' },
      { name: 'Microfiber Towel', desc: 'Fast-drying towel for tea-houses and natural hot springs.' }
    ],
    weather: { region: 'Annapurna Station', temp: '-2°C', status: 'Clear morning, Afternoon Fog', alert: 'Avalanche Risk Assessment: Low' },
    aiPrompt: "Namaste! I am AURA. Ask me about the Jhinu Danda hot springs, the peak season rhododendron blooms, or the exact walking duration from Machapuchare Base Camp!"
  },
  'chitwan-river-safari': {
    title: 'Chitwan River Safari',
    category: 'Attraction',
    subtitle: 'Gliding Past Prehistoric Marshlands',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200',
    elevation: '150 m',
    region: 'Chitwan Plains',
    difficulty: 'Easy Access',
    duration: 'Half Day',
    season: 'October - April',
    rating: 4.8,
    description: 'Canoe rides down the Rapti river. Spot prehistoric gharial crocodiles and rare single-horned Asiatic rhinos in their native marshes.',
    details: 'A river safari down the Rapti River offers a tranquil and intimate way to experience Chitwan\'s wildlife. Floating silently in a traditional dugout canoe hand-carved from a single tree trunk, you can glide past the marshes. This is the optimal way to spot birdlife, marsh mugger crocodiles, and the rare fish-eating Gharial crocodile resting on the sandy shores.',
    highlights: [
      'Floating silently in a traditional hand-carved wooden dugout canoe',
      'Close-up views of Gharials and Mugger crocodiles basking on banks',
      'Superb bird watching: Kingfishers, Egrets, and migrating birds',
      'Scenic misty morning river landscapes ideal for photography'
    ],
    tips: [
      'Book a morning safari when mist still clings to the water for the best photos.',
      'Remain completely still and quiet in the canoe to avoid scaring wildlife.',
      'Keep your hands inside the boat at all times!'
    ],
    gear: [
      { name: 'Telephoto Lens Camera', desc: 'Allows safe, high-quality closeups of river bank wildlife.' },
      { name: 'Wide Brimmed Sun Hat', desc: 'Provides shielding during long exposed river trips under the sun.' },
      { name: 'Water-Resistant Drybag', desc: 'Protects expensive cameras and phones from water splashes.' }
    ],
    weather: { region: 'Chitwan Rapti Station', temp: '32°C', status: 'Sunny, Warm', alert: 'River Flow Velocity: Standard Safe Parameters' },
    aiPrompt: "Namaste! I am AURA. Ask me about the differences between Gharial and Mugger crocodiles, or how to combine your canoe ride with a forest safari!"
  },
  'upper-mustang-caves': {
    title: 'Upper Mustang Caves',
    category: 'Attraction',
    subtitle: 'Mysterious Chambers of an Ancient Empire',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200',
    elevation: '3,840 m',
    region: 'Mustang Restricted Area',
    difficulty: 'Challenging',
    duration: '1 Day',
    season: 'May - November',
    rating: 4.97,
    description: 'Ancient sky caves carved into vertical sandstone cliffs. Houses 600-year-old murals, ancient manuscripts, and historical chambers.',
    details: 'Upper Mustang is home to one of the world\'s greatest archaeological mysteries: the "Sky Caves". Over 10,000 artificial caves have been carved into the towering, wind-eroded sandstone cliffs of the region. Some are single-room dwellings, while others are complex multi-story complexes. Inside, researchers have found 600-year-old murals, ancient manuscripts, and burial chambers.',
    highlights: [
      'Inspecting vertical cliff-carved caves dating back 2,000+ years',
      'Viewing ancient Buddhist murals and manuscripts hidden in caves',
      'Exploring the complex tunnels and chambers inside Luri Gumba',
      'Marveling at the vast sandstone canyon carvings'
    ],
    tips: [
      'Some caves are hard to reach and require high-scramble trail ascents.',
      'Respect the spiritual significance; do not touch ancient paintings or remove artifacts.',
      'Hire an expert local guide who knows which caves are safe and legal to enter.'
    ],
    gear: [
      { name: 'LED Headlamp', desc: 'Provides illumination inside the deep, pitch-black cliff chambers.' },
      { name: 'Sturdy Scrambling Shoes', desc: 'Shoes with maximum grip for loose, gravelly sandstone trails.' },
      { name: 'Dust Mask', desc: 'Helps breathe inside the ancient, dry, dusty cave passages.' }
    ],
    weather: { region: 'Mustang Canyons', temp: '14°C', status: 'Windy, Dry Dust', alert: 'Restricted Heritage Entry Rules Apply' },
    aiPrompt: "Namaste! I am AURA. Ask me about the theories surrounding who dug the sky caves, what treasures were discovered inside, or how to visit Luri Gumba!"
  },
  'pokhara-paragliding-arena': {
    title: 'Pokhara Paragliding Arena',
    category: 'Attraction',
    subtitle: 'Fly Alongside Himalayan Eagles',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200',
    elevation: '1,600 m',
    region: 'Sarangkot Pokhara',
    difficulty: 'Moderate Thrill',
    duration: '1 Day',
    season: 'September - May',
    rating: 4.75,
    description: 'Fly alongside Himalayan eagles. Offers a raw bird\'s eye view of the tranquil Phewa Lake and the giant Machapuchare peak.',
    details: 'Sarangkot in Pokhara is widely regarded as one of the top five paragliding locations in the world. Launching from the scenic cliff of Sarangkot (1,600m), you float suspended in thermal air currents alongside eagles and hawks. Below you, the tranquil turquoise Phewa Lake reflects the giant, pristine white peak of Machapuchare (Fishtail Peak).',
    highlights: [
      'Tandem paragliding with internationally certified pilots',
      'Floating at 2,000m altitude with birds of prey flying alongside',
      'Stunning bird\'s-eye view of Pokhara Valley and Phewa Lake',
      'Unobstructed mountain photography of the Annapurna range'
    ],
    tips: [
      'Paragliding is strictly weather-dependent; book slots for early morning when thermals are stable.',
      'Wear sturdy sneakers; you will need to run a short distance off the launch ramp.',
      'Go-Pro video recording is usually offered; make sure to ask your pilot in advance!'
    ],
    gear: [
      { name: 'Sturdy Running Sneakers', desc: 'Essential for running during the take-off and landing phases.' },
      { name: 'Windproof Lightweight Jacket', desc: 'Keeps you warm while flying high in the cold thermal currents.' },
      { name: 'Secure Neck Strap for Camera', desc: 'Prevents losing cameras or phones during flight maneuvers.' }
    ],
    weather: { region: 'Sarangkot Launch Site', temp: '21°C', status: 'Perfect Thermals, Clear Air', alert: 'Flight Operations Status: ACTIVE & SAFE' },
    aiPrompt: "Namaste! I am AURA. Ask me about booking tandem flights, the paragliding landing zones near lake shores, or flight safety protocols!"
  },
  'trekking': {
    title: 'Himalayan Trekking Loops',
    category: 'Activity',
    subtitle: 'Walking in the Shadow of Giants',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200',
    difficulty: 'Moderate to Challenging',
    duration: '7 - 21 Days',
    season: 'Autumn & Spring',
    rating: 4.96,
    description: 'Walk pristine circuits like Annapurna, Manaslu, or Langtang trails, resting in traditional mountain homestays.',
    details: 'Trekking is the signature activity in Nepal. With trails that wind through deep alpine valleys, lush rhododendron forests, and sub-zero mountain passes, it offers unmatched scenic immersion. Trekking loops are serviced by family-run tea houses, providing warmth, hot meals, and a place to rest after a long day of hiking.',
    highlights: [
      'Completing the Annapurna Circuit or Langtang Valley Loop',
      'Experiencing authentic Himalayan hospitality in rustic tea houses',
      'Crossing high-altitude passes like Thorong La (5,416m) or Larkya La',
      'Supporting local communities and sherpa trail guides'
    ],
    tips: [
      'Train beforehand with cardio and leg strength exercises.',
      'Get a TIMS card and required national park permits.',
      'Never skip acclimatization days; altitude sickness can affect anyone.'
    ],
    gear: [
      { name: 'Trekking Poles', desc: 'Reduces impact on knees and ankles during long stone climbs.' },
      { name: 'Packable Down Jacket', desc: 'Provides warm insulation when temperatures drop below freezing.' },
      { name: 'Water Purification Tablets', desc: 'Ensures safe, clean drinking water throughout the remote trails.' }
    ],
    weather: { region: 'National Trails', temp: '-4°C', status: 'Clear morning, Afternoon Snow', alert: 'Trail Systems: Open & Safe' },
    aiPrompt: "Namaste! I am AURA. I can map out classic trekking loops, estimate your daily walking duration, or help calibrate your cold-weather gear list!"
  },
  'mountaineering': {
    title: 'Peak Climbing Expeditions',
    category: 'Activity',
    subtitle: 'Scale the Highest Peaks on Earth',
    image: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=1200',
    elevation: '8,848 m',
    region: 'Himalayan Range',
    difficulty: 'Extreme (Technical)',
    duration: '30 - 60 Days',
    season: 'April - May (Pre-Monsoon Windows)',
    rating: 4.99,
    description: 'Ascend peaks like Everest, Ama Dablam, Lhotse, or Mera Peak with certified local Sherpa teams.',
    details: 'Nepal is the holy grail of mountaineering, containing eight of the world\'s fourteen peaks that soar above 8,000 meters. Scaling these giants requires extreme physical conditioning, technical ice climbing skills, and meticulous planning. Climbing is done in teams backed by experienced local Sherpa guides, who fix lines, establish high camps, and manage safety systems.',
    highlights: [
      'Scaling legendary peaks like Mount Everest or the aesthetic Ama Dablam',
      'Learning technical ice axe, crampon, and rope systems',
      'Living in high-altitude glacier camps for several weeks',
      'Standing at the absolute top of the world looking down at clouds'
    ],
    tips: [
      'Join acclimatization rotations up the mountain to build red blood cells.',
      'Familiarize yourself with oxygen regulator systems and harness safety.',
      'Mountaineering is highly dangerous; always listen to the lead Sherpa Sirdar.'
    ],
    gear: [
      { name: 'Crampons and Ice Axe', desc: 'Allows stable movement and self-arrest on steep blue glacier ice.' },
      { name: 'Insulated Double Boots', desc: 'Thermal outer and inner boots preventing high-altitude frostbite.' },
      { name: 'Climbing Harness & Ascender', desc: 'Used for securing onto fixed lines along vertical ice faces.' }
    ],
    weather: { region: '8,000m Peak Telemetry', temp: '-18°C', status: 'Heavy Wind, Jetstream Active', alert: 'Extreme Weather Protocols In Force' },
    aiPrompt: "Namaste! I am AURA, synced to the Mountaineering Logistics Desk. Ask me about climbing permit fees, weather windows, or the best peak training schedules!"
  },
  'wildlife': {
    title: 'Subtropical Jungle Safari',
    category: 'Activity',
    subtitle: 'Track Rhinos & Tigers in the Wilderness',
    image: 'https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=1200',
    difficulty: 'Easy',
    duration: '2 - 4 Days',
    season: 'October - April',
    rating: 4.82,
    description: 'Canoe safari down the Rapti River to spot endangered Bengal tigers, one-horned rhinos, and python nests.',
    details: 'While Nepal is famous for its mountains, its southern lowlands (the Terai) host lush subtropical jungles teaming with wildlife. A jungle safari allows travelers to track endangered single-horned rhinos, royal Bengal tigers, gharial crocodiles, wild elephants, and countless exotic birds. Safari travel includes customized open jeeps or quiet, guided walking tours.',
    highlights: [
      'Riding in open-top 4x4 jeeps deep into rhino territory',
      'Spotting rare birdlife and nesting crocodiles from riverboats',
      'Jungle walking tours with experienced wilderness rangers',
      'Visiting elephant and vulture breeding conservation centers'
    ],
    tips: [
      'Book safaris for early morning or late afternoon when predators are active.',
      'Do not wear bright colors; choose khaki, olive green, or brown clothing.',
      'Always follow the ranger\'s safety cues if encountering an animal on foot.'
    ],
    gear: [
      { name: 'Neutral Earth-Tone Hat', desc: 'Protects from the intense subtropical sun without alerting wildlife.' },
      { name: 'Mosquito Protection Spray', desc: 'High strength repellent to ward off jungle bugs.' },
      { name: 'Camera with Telephoto Zoom', desc: 'Crucial for capturing shots of animals from a safe distance.' }
    ],
    weather: { region: 'Terai Lowlands', temp: '30°C', status: 'Sunny, Tropical', alert: 'Subtropical Forest Dryness Index: Standard' },
    aiPrompt: "Namaste! I am AURA. I can outline the differences between national parks, provide safari checklists, or help track recent tiger sighting reports!"
  },
  'cultural': {
    title: 'Ancient Newari Heritage Walk',
    category: 'Activity',
    subtitle: 'A Walk Through Medieval Temples & courtyards',
    image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1200',
    difficulty: 'Easy',
    duration: '1 - 3 Days',
    season: 'Year-round',
    rating: 4.94,
    description: 'Inspect pagoda roofs, courtyards of durbar squares, and join local Tibetan meditation sessions.',
    details: 'Nepal is a melting pot of ancient religions and architectures. In Kathmandu Valley, the cities of Kathmandu, Lalitpur (Patan), and Bhaktapur boast medieval Durbar Squares filled with multi-roofed pagodas, gilded shrines, and stone sculptures. Walking these historic alleys brings you past woodcarvers, pottery squares, and peaceful Buddhist stupas.',
    highlights: [
      'Exploring the exquisite royal courtyards of Patan and Bhaktapur',
      'Viewing traditional woodcarving and bronze-casting craftsmen at work',
      'Joining early morning Buddhist meditation or Hindu temple pujas',
      'Savoring authentic Newari cuisines like Samay Baji and Yomari'
    ],
    tips: [
      'Purchase Durbar Square valley entry passes at the tourism kiosks.',
      'Dress respectfully when entering any religious shrines or monastery structures.',
      'Take a local heritage guide to understand the deep mythological histories.'
    ],
    gear: [
      { name: 'Comfortable Walking Shoes', desc: 'Essential for walking hours on brick and stone-paved alleys.' },
      { name: 'Modest Lightweight Scarf', desc: 'Handy to cover up when visiting active religious temples.' },
      { name: 'Heritage Field Journal', desc: 'Perfect to sketch ancient pagoda details or log historical anecdotes.' }
    ],
    weather: { region: 'Durbar Squares', temp: '22°C', status: 'Clear Skies', alert: 'Durbar Museums Operating at Standard Timings' },
    aiPrompt: "Namaste! I am AURA. Let me help you plan a walk around Bhaktapur, explain Newari pagoda history, or suggest authentic traditional dishes to try!"
  },
  'ecotourism': {
    title: 'Organic Tea House Retreats',
    category: 'Activity',
    subtitle: 'Sustainable Farm-to-Table Living',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200',
    difficulty: 'Easy',
    duration: '3 - 7 Days',
    season: 'Year-round (Best Oct-May)',
    rating: 4.9,
    description: 'Volunteer at organic cardamom gardens, learn local handloom weaving, and eat fresh farm-to-table meals.',
    details: 'Ecotourism in Nepal allows travelers to live in harmony with local communities and ecosystems. Located in beautiful hills and villages like Ilam, Bandipur, and Sirubari, organic tea houses offer homestays. You can volunteer in organic coffee, tea, and cardamom gardens, learn traditional weaving, and enjoy fresh, organic home-cooked meals.',
    highlights: [
      'Living in a community homestay in the misty hills of Ilam',
      'Volunteering on organic ginger and cardamom farms',
      'Enjoying fresh, zero-carbon farm-to-table traditional meals',
      'Observing the traditional handloom weaving of Dhaka fabrics'
    ],
    tips: [
      'Homestays are simple; adjust your expectations to rustic and basic amenities.',
      'Participate in village activities; it is a great way to bond with hosts.',
      'Always ask hosts before using energy or washing clothes to preserve resources.'
    ],
    gear: [
      { name: 'Biodegradable Soap / Shampoo', desc: 'Protects the delicate local village soil and water streams.' },
      { name: 'Light Layer Pack', desc: 'Homestay rooms in hills can get breezy and cool at night.' },
      { name: 'Reusable Metal Water Flask', desc: 'Helps keep you hydrated without using single-use plastic bottles.' }
    ],
    weather: { region: 'Eco-Hills Hub', temp: '19°C', status: 'Pleasant Breeze', alert: 'Homestay Cooperatives Fully Operational' },
    aiPrompt: "Namaste! I am AURA. I can recommend award-winning eco-villages, explain volunteer garden tasks, or outline local homestay etiquette!"
  },
  'adventure': {
    title: 'High-Altitude Paragliding',
    category: 'Activity',
    subtitle: 'Adrenaline Vistas Above the Clouds',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200',
    difficulty: 'Moderate',
    duration: '1 Day',
    season: 'September - May',
    rating: 4.89,
    description: 'Launch from Sarangkot peak, Pokhara and glide above the deep clouds alongside eagles with Annapurna behind you.',
    details: 'For thrill-seekers, Nepal is a playground of extreme adventure. Launching from the 1,600m Sarangkot ridge in Pokhara, tandem paragliders can soar into thermal updrafts alongside eagles, enjoying panoramic Annapurna views. Other adventures include white-water rafting down the roaring Bhote Koshi, bungee jumping off steel canyon bridges, and mountain biking.',
    highlights: [
      'Soaring above Pokhara Valley on tandem paragliding flights',
      'Bungee jumping off high-canyon suspension bridges',
      'White-water rafting down turbulent glacier rivers',
      'Stunning mountain biking across alpine passes and ridges'
    ],
    tips: [
      'Ensure adventure companies are registered and pilots hold active certifications.',
      'Go-Pro cameras are usually attached to paragliders; secure your files immediately.',
      'Check meteorological safety ratings before any white-water rafting tour.'
    ],
    gear: [
      { name: 'Light Wind-Stopper Shell', desc: 'Crucial for high altitude paragliding gusts.' },
      { name: 'Action Camera (Go-Pro)', desc: 'Securely mounted camera with wrist straps to capture flights.' },
      { name: 'High-Traction Sport Trainers', desc: 'Running shoes suitable for Bungee, Biking, and Paragliding takeoffs.' }
    ],
    weather: { region: 'Pokhara Sarangkot', temp: '23°C', status: 'Optimal Wind Vectors', alert: 'High-Adrenaline Sports Safety Index: 99.8%' },
    aiPrompt: "Namaste! I am AURA, synced to the Pokhara Adventure Registry. Ask me about tandem flight tickets, bungee heights, or extreme rafting canyons!"
  }
};

// ─── HELPER TO NORMALIZE USER SLUGS ──────────────────────────────────────────
export const getNormalizedKey = (slug: string): string => {
  const s = slug.toLowerCase().replace(/_/g, '-');
  if (s.includes('everest-base') || s.includes('everest')) return 'mount-everest-base-camp';
  if (s.includes('everest-quantum-domes')) return 'everest-quantum-domes';
  if (s.includes('phewa-lake') || s.includes('phewa-lake-pokhara')) return 'phewa-lake-pokhara';
  if (s.includes('phewa-lakeside-mirror')) return 'phewa-lakeside-mirror';
  if (s.includes('boudhanath') || s.includes('boudha')) return 'boudhanath-stupa';
  if (s.includes('chitwan-wildlife') || s.includes('chitwan-wildlife-sanctuary')) return 'chitwan-wildlife-sanctuary';
  if (s.includes('mustang-kingdom') || s.includes('mustang') || s.includes('manthang') || s.includes('lo-manthang')) return 'lo-manthang-upper-mustang';
  if (s.includes('mustang-kingdom-Forbidden')) return 'mustang-kingdom';
  if (s.includes('muktinath')) return 'muktinath-temple';
  if (s.includes('annapurna') || s.includes('annapurna-base-camp')) return 'annapurna-base-camp';
  if (s.includes('safari') || s.includes('river') || s.includes('chitwan-river-safari')) return 'chitwan-river-safari';
  if (s.includes('caves') || s.includes('upper-mustang-caves')) return 'upper-mustang-caves';
  if (s.includes('paragliding') || s.includes('pokhara-paragliding-arena')) return 'pokhara-paragliding-arena';
  if (s.includes('trekking') || s.includes('trek')) return 'trekking';
  if (s.includes('mountaineering') || s.includes('mountain')) return 'mountaineering';
  if (s.includes('wildlife')) return 'wildlife';
  if (s.includes('cultural') || s.includes('culture')) return 'cultural';
  if (s.includes('ecotourism') || s.includes('eco')) return 'ecotourism';
  if (s.includes('adventure')) return 'adventure';
  return s;
};

// Map normalized spotlight key to left sidebar active key
export const getSidebarActiveId = (key: string): string => {
  if (['mount-everest-base-camp', 'everest-quantum-domes', 'annapurna-base-camp'].includes(key)) return 'trekking';
  if (['phewa-lake-pokhara', 'phewa-lakeside-mirror'].includes(key)) return 'explore';
  if (['boudhanath-stupa', 'upper-mustang-caves'].includes(key)) return 'cultural';
  if (['chitwan-wildlife-sanctuary', 'chitwan-river-safari'].includes(key)) return 'wildlife';
  if (['lo-manthang-upper-mustang', 'mustang-kingdom'].includes(key)) return 'trekking';
  if (['muktinath-temple'].includes(key)) return 'cultural';
  if (['pokhara-paragliding-arena'].includes(key)) return 'adventure';
  return key;
};

// ─── CUSTOM ITINERARY TYPES & MOCK DATABASES ────────────────────────────────
export interface ItineraryStop {
  name: string;
  elevation: string;
  days: number;
  description: string;
  luxuryDescription?: string;
  image: string;
  isCustom?: boolean;
}

export const DEFAULT_ITINERARIES: Record<string, ItineraryStop[]> = {
  'mount-everest-base-camp': [
    { name: 'Kathmandu', elevation: '1,400m', days: 1, description: 'Arrival in the capital. Welcome briefing, gear inspection, and cultural dinner.', luxuryDescription: 'Arrival via premium airport drone shuttle, check-in to Shangri-La Cyber-Resort presidential suite & initial biometrics scan.', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600' },
    { name: 'Lukla', elevation: '2,860m', days: 1, description: 'Fly to the dramatic Lukla airport. Meet pathfinders and begin a short trek to Phakding.', luxuryDescription: 'Private helicopter charter landing directly at Lukla. VIP welcome and express luggage routing to trail lodge.', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600' },
    { name: 'Phakding', elevation: '2,610m', days: 1, description: 'Trek along the Dudh Koshi river through pine forests and crossing suspension bridges.', luxuryDescription: 'Stay at high-end organic river-side eco-villas with thermal heating and private wellness spa.', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600' },
    { name: 'Namche Bazaar', elevation: '3,440m', days: 2, description: 'The historic capital of Sherpa country. Two days here for vital high-altitude acclimatization.', luxuryDescription: 'Enjoy pressurized altitude suites with customized oxygen flow, biometric wellness checks, and local organic dining.', image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=600' },
    { name: 'Tengboche', elevation: '3,867m', days: 1, description: 'Trek through rhododendron forests to the famous Tengboche Monastery for spiritual chanting and sunrise views.', luxuryDescription: 'Private audience with the Head Lama, private meditation suite, and luxury tent setup with full electric heating.', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600' },
    { name: 'Dingboche', elevation: '4,410m', days: 2, description: 'A scenic village bounded by dry-stone walls. Second acclimatization phase to prepare for 5k+ meters.', luxuryDescription: 'Rest in hyperbaric chambers, drink fresh nutrient-infused teas, and review live satellite weather maps with guide.', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600' },
    { name: 'Lobuche', elevation: '4,940m', days: 1, description: 'Trek along the lateral moraine of the Khumbu Glacier. Giant peaks like Nuptse and Pumori loom overhead.', luxuryDescription: 'Biometric telemetry sync with AURA AI. Stay in premium heated dome pods with panoramic glacier views.', image: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=600' },
    { name: 'Gorak Shep', elevation: '5,164m', days: 1, description: 'The final settlement before EBC. Walk to Kala Patthar for a golden sunset view of Everest.', luxuryDescription: 'Check-in to the premium pressurized Everest Quantum Domes. Enjoy gourmet dinner under star-tracking skylights.', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600' },
    { name: 'Everest Base Camp', elevation: '5,364m', days: 1, description: 'Stand at the foot of the active Khumbu Icefall. Take photos under the prayer flags, then return to Gorakshep.', luxuryDescription: 'Private helicopter pickup from Base Camp directly back to Kathmandu, bypassing the long descent walk.', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600' }
  ],
  'lo-manthang-upper-mustang': [
    { name: 'Kathmandu', elevation: '1,400m', days: 1, description: 'Arrival, permit verification, and city sightseeing.', luxuryDescription: 'Drone transport to Shangri-La suite, private guide brief.', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600' },
    { name: 'Pokhara', elevation: '822m', days: 1, description: 'Drive or fly to Pokhara. Relax by Phewa Lake.', luxuryDescription: 'Luxury heli transfer to Pokhara Lakeside Mirror stay. Floating meditation session.', image: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=600' },
    { name: 'Jomsom', elevation: '2,720m', days: 1, description: 'Scenic flight through the deepest gorge between Annapurna and Dhaulagiri.', luxuryDescription: 'Private heli-shuttle directly to Jomsom premium lodge.', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600' },
    { name: 'Kagbeni', elevation: '2,800m', days: 1, description: 'Trek along the windy Kali Gandaki riverbed. Gateway to Upper Mustang.', luxuryDescription: 'Cyber-Jeep transfer. Stay in a renovated luxury heritage fort lodge.', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600' },
    { name: 'Charang', elevation: '3,560m', days: 1, description: 'Explore ancient red cliffs, monasteries, and white-washed houses.', luxuryDescription: 'Private tour of the historic palace archives and luxury dome dining.', image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=600' },
    { name: 'Lo Manthang', elevation: '3,840m', days: 2, description: 'Explore the walled capital. Visit medieval palaces, monasteries, and nearby sky caves.', luxuryDescription: 'Stay in a high-tech premium palace suite. Helicopter exploration of distant sandstone canyons.', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600' }
  ],
  'annapurna-base-camp': [
    { name: 'Kathmandu', elevation: '1,400m', days: 1, description: 'Arrival, trek briefing, and overnight stay.', luxuryDescription: 'VIP airport meet and luxury stay at Shangri-La Cyber-Resort.', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600' },
    { name: 'Pokhara', elevation: '822m', days: 1, description: 'Fly to Pokhara, enjoy lakeside cafe scene.', luxuryDescription: 'Private flight and check-in to Phewa Mirror boutique suite.', image: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=600' },
    { name: 'Tikhedhunga', elevation: '1,540m', days: 1, description: 'Start trek from Nayapul. Climb stone steps to Tikhedhunga.', luxuryDescription: 'Private jeep transfer to trailhead. Stay at premium mountain lodge.', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600' },
    { name: 'Ghorepani', elevation: '2,860m', days: 1, description: 'Hike through rhododendron forests to Ghorepani village.', luxuryDescription: 'Stay at heated luxury lodge. Enjoy panoramic views from heated terrace.', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600' },
    { name: 'Poon Hill', elevation: '3,210m', days: 1, description: 'Sunrise view of Dhaulagiri and Annapurna ranges, trek to Tadapani.', luxuryDescription: 'VIP champagne sunrise toast on Poon Hill, trek with private chef support.', image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=600' },
    { name: 'Chhomrong', elevation: '2,170m', days: 1, description: 'Descend and climb stone stairs. Beautiful village facing Annapurna South.', luxuryDescription: 'Rest in premium resort. Acclimatization massage.', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600' },
    { name: 'Machapuchare Base Camp', elevation: '3,700m', days: 1, description: 'Hike along Modi Khola river gorge to MBC. Breathtaking Fishtail views.', luxuryDescription: 'Oxygen chamber support. Stay in heated panoramic dome rooms.', image: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=600' },
    { name: 'Annapurna Base Camp', elevation: '4,130m', days: 1, description: 'Early morning hike to ABC sanctuary. 360-degree views of snow giants, return to Pokhara by Heli/Trek.', luxuryDescription: 'Awake to sunrise in ABC. Direct private helicopter flight back to Kathmandu.', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600' }
  ]
};

export const DETOURS_DATABASE: Record<string, { name: string; elevation: string; days: number; description: string; luxuryDescription: string; image: string }[]> = {
  'mount-everest-base-camp': [
    { name: 'Gokyo Lakes Detour', elevation: '4,790m', days: 3, description: 'Cross Cho La pass to view the sacred turquoise lakes and Gokyo Ri peak.', luxuryDescription: 'Private heli flight to Gokyo lakes, luxury lakefront glamping, and guided glacier ridge walk.', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600' },
    { name: 'Ama Dablam Base Camp excursion', elevation: '4,600m', days: 2, description: 'A side-hike to the foot of one of the world\'s most beautiful peaks, staying in high summer pastures.', luxuryDescription: 'Private charter flight to Amadablam camp, gourmet dining with views of the sheer ice flutes.', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600' },
    { name: 'Kala Patthar Sunrise Climb', elevation: '5,545m', days: 1, description: 'Pre-dawn climb to the highest viewpoint for an unobstructed golden sunrise over Everest.', luxuryDescription: 'Heated biometric outerwear, hot coffee thermos service, and private photographer guide.', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600' },
    { name: 'Island Peak Technical Summit', elevation: '6,189m', days: 3, description: 'Brief alpine summit experience with crampons and fixed lines, suitable for beginner mountaineers.', luxuryDescription: 'Dedicated Sherpa sirdar team, pre-fixed ropes, high-altitude oxygen support, and champagne summit photo.', image: 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?q=80&w=600' }
  ],
  'lo-manthang-upper-mustang': [
    { name: 'Luri Gumba Cliff Temple', elevation: '3,950m', days: 1, description: 'A hidden cave monastery decorated with ancient Buddhist murals and relics.', luxuryDescription: 'Exclusive private monk guide, private jeep access, and champagne lunch at the canyon base.', image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=600' },
    { name: 'Dhakmar Red Cliffs Excursion', elevation: '3,820m', days: 1, description: 'Hike among the red clay pillars, home to local legends and high desert winds.', luxuryDescription: 'Private horseback excursion with a local guide, luxury picnic basket.', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600' },
    { name: 'Ghemi Village Walk', elevation: '3,520m', days: 1, description: 'A walk alongside one of the longest Mani walls in the Mustang region.', luxuryDescription: 'Stay at premium heritage boutique village inn, private local cooking class.', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600' }
  ],
  'annapurna-base-camp': [
    { name: 'Tilicho Lake Expedition', elevation: '4,919m', days: 3, description: 'Trek to one of the highest lakes in the world, surrounded by steep ice cliffs.', luxuryDescription: 'Private helicopter transit option, heated lakeside dome stay, extreme thermal gear.', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600' },
    { name: 'Jhinu Natural Hot Springs', elevation: '1,780m', days: 1, description: 'Soak in the natural geothermal springs alongside the Modi Khola river.', luxuryDescription: 'Private poolside massage, premium organic robe, and private hot pool booking.', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600' },
    { name: 'Ghandruk Heritage Village Stay', elevation: '1,940m', days: 1, description: 'Explore a traditional Gurung village, famous for stone houses and local museum.', luxuryDescription: 'Exclusive stay in Gurung luxury boutique estate, custom cultural dance presentation.', image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=600' }
  ]
};

export const getGeneralItinerary = (title: string, durationStr: string): ItineraryStop[] => {
  return [
    { name: 'Kathmandu Gateway', elevation: '1,400m', days: 1, description: `Arrival and welcome briefing for your ${title} experience.`, luxuryDescription: `VIP drone airport pick-up and check-in to Shangri-La Cyber-Resort.`, image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600' },
    { name: 'Core Experience Site', elevation: 'Local', days: 2, description: `Immersive exploration of ${title} highlights.`, luxuryDescription: `Private guided VIP access with luxury transport and custom experiences.`, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600' },
    { name: 'Relaxation & Farewell', elevation: '1,400m', days: 1, description: 'Wrap up souvenirs and departures.', luxuryDescription: 'Champagne farewell and direct airport private heli shuttle.', image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600' }
  ];
};

