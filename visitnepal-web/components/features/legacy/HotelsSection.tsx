'use client';

import React, { useState } from 'react';
import { useTravelStore, Stay } from '@/store/useTravelStore';
import { 
  Building, 
  MapPin, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Star, 
  CheckCircle2, 
  X, 
  Compass, 
  Cpu, 
  Info,
  ChevronRight
} from 'lucide-react';

export default function HotelsSection() {
  const { stays, addBooking, currentUser } = useTravelStore();
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Booking Form State inside Modal
  const [checkIn, setCheckIn] = useState('2026-06-01');
  const [checkOut, setCheckOut] = useState('2026-06-04');
  const [selectedRoomIdx, setSelectedRoomIdx] = useState(0);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState('');

  const stayTypes = ['all', 'Luxury', 'Premium', 'Eco Resort', 'Mountain Lodge', 'Boutique Hotel'];

  const filteredStays = activeFilter === 'all' 
    ? stays 
    : stays.filter(s => s.type === activeFilter);

  const calculateDays = (inDate: string, outDate: string) => {
    const start = new Date(inDate);
    const end = new Date(outDate);
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 1;
  };

  const handleBookingSubmit = (e: React.FormEvent, stay: Stay) => {
    e.preventDefault();
    const days = calculateDays(checkIn, checkOut);
    const selectedRoom = stay.roomPreviews[selectedRoomIdx] || stay.roomPreviews[0];
    const totalCost = selectedRoom.price * days;
    const invNo = `INV-STAY-${Math.floor(1000 + Math.random() * 9000)}`;

    addBooking({
      id: `b-stay-${Date.now()}`,
      type: 'Hotel',
      title: `${stay.name} - ${selectedRoom.name}`,
      date: `${checkIn} to ${checkOut} (${days} Nights)`,
      details: `Guest: ${currentUser?.name || 'Alex Mercer'}, Automated acclimatization tracking active. Custom altitude pod calibrating...`,
      cost: totalCost,
      status: 'Confirmed',
      invoiceNo: invNo
    });

    setGeneratedInvoice(invNo);
    setBookingConfirmed(true);
  };

  const closeBookingModal = () => {
    setSelectedStay(null);
    setBookingConfirmed(false);
    setSelectedRoomIdx(0);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Search Header */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-emerald-400" />
          <h2 className="text-xl font-bold tracking-wide text-white">Quantum Lodging & Eco Resorts</h2>
        </div>
        <p className="text-xs text-zinc-400 font-mono">
          AI recommended micro-climate sanctuaries designed for alpine health and supreme comfort.
        </p>

        {/* Categories filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {stayTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                activeFilter === type 
                  ? 'bg-emerald-500 text-black border-transparent shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                  : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {type === 'all' ? 'All Stays' : type}
            </button>
          ))}
        </div>
      </section>

      {/* Grid List */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStays.map((stay) => (
          <div 
            key={stay.id}
            className="glass-panel rounded-2xl overflow-hidden border border-zinc-800 hover:border-emerald-500/30 group transition-all duration-300 flex flex-col justify-between"
          >
            {/* Upper Info */}
            <div className="relative h-56 w-full overflow-hidden">
              <img 
                src={stay.image} 
                alt={stay.name} 
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
              
              {/* Top Row Indicators */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span className="bg-zinc-950/90 text-emerald-400 text-[9px] font-bold font-mono tracking-widest px-2.5 py-1 rounded-md border border-emerald-900 flex items-center gap-1">
                  <Cpu className="h-3 w-3" /> {stay.type}
                </span>
                {stay.price > 300 && (
                  <span className="bg-zinc-950/90 text-cyan-400 text-[9px] font-bold font-mono tracking-widest px-2.5 py-1 rounded-md border border-cyan-900 flex items-center gap-1 animate-pulse">
                    <Sparkles className="h-3 w-3" /> AI SUGGESTED ACCLIMATIZATION
                  </span>
                )}
              </div>

              {/* Price Tag */}
              <div className="absolute bottom-3 right-3 bg-zinc-950/90 rounded-lg px-2.5 py-1 border border-zinc-800 text-xs font-mono font-bold text-white">
                <span className="text-emerald-400 font-black">${stay.price}</span> / night
              </div>
            </div>

            {/* Bottom Content details */}
            <div className="p-5 flex flex-col gap-4 bg-zinc-950/25">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-emerald-400" /> {stay.location}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-0.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {stay.rating}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {stay.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-2">
                  {stay.description}
                </p>
              </div>

              {/* Features badges */}
              <div className="flex flex-wrap gap-1.5">
                {stay.features.slice(0, 3).map((feat, idx) => (
                  <span 
                    key={idx}
                    className="bg-zinc-900 text-zinc-400 text-[9px] font-mono px-2 py-0.5 rounded border border-zinc-800"
                  >
                    {feat}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <button 
                onClick={() => setSelectedStay(stay)}
                className="w-full mt-2 rounded-xl bg-zinc-900 hover:bg-emerald-500 hover:text-black border border-zinc-800 hover:border-transparent py-2.5 text-xs font-bold text-zinc-300 font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Query Availability & 3D Pods</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        ))}
      </section>

      {/* Booking Form Overlay Modal */}
      {selectedStay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl glass-panel-heavy rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Close Button */}
            <button 
              onClick={closeBookingModal}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-zinc-950/80 hover:bg-white/5 border border-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left Column: Visual, 3D Rooms */}
            <div className="md:w-1/2 bg-zinc-950 p-6 flex flex-col gap-4 overflow-y-auto border-r border-zinc-900">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span>3D Room Preview Nodes</span>
              </h4>

              {/* Room Cards Stack with Perspective styling */}
              <div className="perspective-container flex flex-col gap-4 mt-2">
                {selectedStay.roomPreviews.map((room, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedRoomIdx(idx)}
                    className={`room-card-3d cursor-pointer rounded-xl border p-3 flex gap-3 items-center transition-all bg-zinc-900/50 ${
                      selectedRoomIdx === idx 
                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-950/30 to-zinc-900/20' 
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <img 
                      src={room.image} 
                      alt={room.name} 
                      className="h-16 w-20 object-cover rounded-lg border border-zinc-800 shrink-0"
                    />
                    <div className="flex flex-col gap-1 min-w-0">
                      <h5 className="text-xs font-bold text-white truncate">{room.name}</h5>
                      <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-emerald-400" /> {room.price} / night
                      </p>
                      <p className="text-[9px] text-zinc-500 truncate">{room.info}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl flex items-start gap-2.5 mt-2">
                <Info className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                  Stays in our pressurized luxury suites automatically synch biometric altitude markers. In-room oxygen mixtures automatically recalibrate to prevent mountain sickness.
                </p>
              </div>
            </div>

            {/* Right Column: Calendar Console & confirmation */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto bg-zinc-950/60">
              
              {!bookingConfirmed ? (
                <form 
                  onSubmit={(e) => handleBookingSubmit(e, selectedStay)}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{selectedStay.type}</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{selectedStay.name}</h3>
                    <p className="text-[11px] font-mono text-emerald-400 mt-0.5">Pod Altitude Coordinates Synced</p>
                  </div>

                  {/* Date fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-mono text-zinc-400 tracking-wider flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-emerald-400" /> Check In
                      </label>
                      <input 
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] uppercase font-mono text-zinc-400 tracking-wider flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-emerald-400" /> Check Out
                      </label>
                      <input 
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Calculations */}
                  <div className="bg-zinc-950/90 rounded-xl p-4 border border-zinc-900 flex flex-col gap-2 mt-2 font-mono text-xs text-zinc-400">
                    <div className="flex justify-between">
                      <span>Stay Duration:</span>
                      <span className="text-white font-bold">{calculateDays(checkIn, checkOut)} nights</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Selected Suite rate:</span>
                      <span className="text-white font-bold">${selectedStay.roomPreviews[selectedRoomIdx]?.price || selectedStay.price} / night</span>
                    </div>
                    <div className="border-t border-zinc-900 my-2 pt-2 flex justify-between text-sm">
                      <span className="font-bold text-zinc-300">Net Energy Cost:</span>
                      <span className="text-emerald-400 font-black">${(selectedStay.roomPreviews[selectedRoomIdx]?.price || selectedStay.price) * calculateDays(checkIn, checkOut)}</span>
                    </div>
                  </div>

                  {/* Confirm Submit */}
                  <button 
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 py-3 text-xs font-bold text-black font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Transact Pod Booking</span>
                  </button>
                </form>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-4 animate-in fade-in duration-300">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Pod Reservation Complete!</h3>
                    <p className="text-xs text-zinc-400 font-mono mt-1">Holographic key generated. Oxygen telemetry locks confirmed.</p>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 w-full text-left font-mono text-[10px] text-zinc-400 flex flex-col gap-1.5">
                    <p>TRANSACTION: <span className="text-white font-bold">{generatedInvoice}</span></p>
                    <p>STAY: <span className="text-white">{selectedStay.name}</span></p>
                    <p>SUITE: <span className="text-emerald-400">{selectedStay.roomPreviews[selectedRoomIdx]?.name}</span></p>
                    <p>CALENDAR: <span className="text-zinc-200">{checkIn} to {checkOut}</span></p>
                  </div>

                  <button 
                    onClick={closeBookingModal}
                    className="rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-white/5 text-zinc-400 hover:text-white px-4 py-2 text-xs font-bold font-mono transition-colors"
                  >
                    Exit Console
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
