import { NextResponse } from 'next/server';

const mockStays = [
  {
    id: 'stay-001',
    name: 'Sagarmatha View Lodge & Spa',
    type: 'Mountain Lodge',
    location: 'Namche Bazaar, Everest Region',
    price: 180,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=600',
    features: ['Panoramic Everest view', 'Heated rooms', 'Traditional spa', 'Sherpa dining room'],
    description: 'Perched on the hills of Namche Bazaar, this premium lodge offers travelers panoramic views of Everest and modern amenities including heated oxygen-enriched suites.',
    coords: [27.806, 86.714],
    availableDates: ['2026-10-12', '2026-10-13', '2026-10-14'],
    roomPreviews: [
      { name: 'Everest View King', price: 240, image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=400', info: 'Breathtaking sunrise views.' },
      { name: 'Standard Twin Suite', price: 180, image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=400', info: 'Spacious and heated rooms.' }
    ]
  },
  {
    id: 'stay-002',
    name: 'The Yeti Comfort Sanctuary',
    type: 'Luxury',
    location: 'Lukla Valley Gateway',
    price: 320,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600',
    features: ['Helipad service', 'Oxygen infusion', 'Private butler', 'Gourmet organic menu'],
    description: 'A sanctuary located at the start of the Everest Trail in Lukla, featuring high-altitude luxury accommodations and specialized health concierge services.',
    coords: [27.687, 86.731],
    availableDates: ['2026-10-11', '2026-10-12'],
    roomPreviews: [
      { name: 'Imperial Sanctuary Suite', price: 450, image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=400', info: 'Private lounge & oxygen system.' }
    ]
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    let filteredStays = [...mockStays];

    if (location) {
      filteredStays = filteredStays.filter(stay => 
        stay.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (minPrice) {
      filteredStays = filteredStays.filter(stay => stay.price >= Number(minPrice));
    }

    if (maxPrice) {
      filteredStays = filteredStays.filter(stay => stay.price <= Number(maxPrice));
    }

    return NextResponse.json({
      success: true,
      count: filteredStays.length,
      data: filteredStays,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error',
    }, { status: 500 });
  }
}
