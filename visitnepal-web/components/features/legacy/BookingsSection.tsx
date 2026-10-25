'use client';

import React, { useState } from 'react';
import { useTravelStore, Booking } from '@/store/useTravelStore';
import { 
  CalendarRange, 
  DollarSign, 
  FileText, 
  MapPin, 
  QrCode, 
  Printer, 
  X, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight 
} from 'lucide-react';

export default function BookingsSection() {
  const { bookings } = useTravelStore();
  const [activeInvoice, setActiveInvoice] = useState<Booking | null>(null);

  const totalSpent = bookings.reduce((acc, b) => acc + (b.status === 'Confirmed' ? b.cost : 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Header Info */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-purple-400" />
          <h2 className="text-xl font-bold tracking-wide text-white">Acquired Bookings & Boarding Logs</h2>
        </div>
        <p className="text-xs text-zinc-400 font-mono">
          Resolve active boarding invoice passes, track high-altitude logistics, and verify quantum vouchers.
        </p>
      </section>

      {/* Quick Spend Stats */}
      <section className="bg-zinc-950/80 rounded-2xl p-5 border border-zinc-800 flex justify-between items-center max-w-lg">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-widest">Aggregate Investment</span>
          <h3 className="text-2xl font-black text-white font-mono">${totalSpent.toLocaleString()}</h3>
          <p className="text-[9px] text-emerald-400 font-mono">✓ Vouchers activated and secured on blockchain ledger</p>
        </div>
        <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
          <DollarSign className="h-5 w-5" />
        </div>
      </section>

      {/* Bookings List Grid */}
      <section className="flex flex-col gap-4">
        {bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <div 
                key={booking.id}
                className="glass-panel p-5 rounded-2xl border border-zinc-800 hover:border-purple-500/30 group transition-all duration-300 flex flex-col justify-between h-[230px]"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase border ${
                      booking.type === 'Hotel' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : booking.type === 'Guide'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {booking.type}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">{booking.invoiceNo}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-3 group-hover:text-purple-400 transition-colors">
                    {booking.title}
                  </h3>
                  
                  <p className="text-[11px] font-mono text-zinc-400 mt-2 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-550 shrink-0" />
                    <span>{booking.date}</span>
                  </p>

                  <p className="text-xs text-zinc-450 leading-relaxed mt-2.5 font-sans line-clamp-2">
                    {booking.details}
                  </p>
                </div>

                {/* Footer specs & Invoice trigger */}
                <div className="flex items-center justify-between border-t border-zinc-900 pt-3 mt-3">
                  <div className="text-xs font-mono font-bold text-white">
                    <span className="text-purple-400 font-black">${booking.cost}</span>
                  </div>
                  
                  <button 
                    onClick={() => setActiveInvoice(booking)}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-purple-500 border border-zinc-850 hover:border-transparent hover:text-black text-zinc-400 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer font-mono shadow-md"
                  >
                    <span>View Pass Invoice</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="h-56 rounded-2xl border border-zinc-800/80 border-dashed flex flex-col items-center justify-center text-center p-8 bg-zinc-950/20">
            <CalendarRange className="h-8 w-8 text-zinc-700 animate-pulse mb-3" />
            <p className="text-xs font-mono text-zinc-550">
              No active reservations inside system buffer. Launch stay queries or customize AI itineraries to build tickets.
            </p>
          </div>
        )}
      </section>

      {/* Invoice Modal Overlay */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl glass-panel-heavy rounded-2xl border border-purple-500/30 p-6 shadow-2xl relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button 
              onClick={() => setActiveInvoice(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-950/80 hover:bg-white/5 border border-zinc-900 text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Futuristic Boarding Pass visual header */}
            <div className="bg-gradient-to-r from-purple-950/30 via-zinc-900/60 to-purple-950/30 border border-purple-500/20 rounded-xl p-4 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 h-16 w-16 bg-purple-500/5 rounded-full blur-xl animate-pulse"></div>
              <div>
                <span className="text-[8px] font-mono text-purple-400 font-bold uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED LOGISTICS PASS
                </span>
                <h3 className="text-base font-bold text-white mt-1 leading-none">VISIT NEPAL BOARDING INVOICE</h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">ISSUED DATE: 2026-05-27</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[8px] text-zinc-500 uppercase">Registry Ticket</span>
                <p className="text-xs font-bold text-white">{activeInvoice.invoiceNo}</p>
              </div>
            </div>

            {/* Bill Details */}
            <div className="flex flex-col gap-4 font-mono text-xs">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-zinc-550 uppercase tracking-wider">Acquired Package</span>
                <h4 className="text-sm font-bold text-zinc-200 font-sans">{activeInvoice.title}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900">
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest block mb-0.5">Date Period</span>
                  <span className="text-zinc-200 font-bold">{activeInvoice.date}</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900">
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest block mb-0.5">Payment Ledger</span>
                  <span className="text-emerald-400 font-bold">✓ SETTLED (STRIPE)</span>
                </div>
              </div>

              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 flex flex-col gap-2">
                <span className="text-[8px] text-zinc-500 uppercase tracking-widest">Metadata specifications</span>
                <p className="text-zinc-300 font-sans leading-relaxed text-[11px]">
                  {activeInvoice.details}
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-zinc-900 pt-3 flex flex-col gap-2">
                <div className="flex justify-between text-zinc-400 text-[11px]">
                  <span>Subtotal:</span>
                  <span>${activeInvoice.cost - 30} USD</span>
                </div>
                <div className="flex justify-between text-zinc-400 text-[11px]">
                  <span>Alpine Rescue Levy:</span>
                  <span>$30 USD</span>
                </div>
                <div className="flex justify-between text-white text-sm font-bold mt-1.5 pt-2 border-t border-dashed border-zinc-900">
                  <span>Grand Total Net:</span>
                  <span className="text-purple-400 font-black">${activeInvoice.cost} USD</span>
                </div>
              </div>
            </div>

            {/* Print and QR Actions */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-t border-zinc-900 pt-4">
              
              {/* Mini QR stamp */}
              <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-550">
                <div className="h-14 w-14 bg-white p-1 rounded border border-purple-500 shrink-0 flex items-center justify-center">
                  <QrCode className="h-full w-full text-black" />
                </div>
                <div>
                  <p className="text-zinc-300 font-bold">QR SECURED PASS</p>
                  <p className="text-[8px]">Scan upon boarding helicopter or checking into suite pod.</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500 text-zinc-400 hover:text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </button>
                
                <button 
                  onClick={() => setActiveInvoice(null)}
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold font-mono transition-colors cursor-pointer"
                >
                  Confirm Vouchers
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
