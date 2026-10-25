'use client';

import React from 'react';

export interface CoPlannerHubProps {
  calendarMarks: Record<string, boolean>;
  onCalendarMarksChange: (updater: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  userNote: string;
  onUserNoteChange: (note: string) => void;
  companyNote: string;
  onCompanyNoteChange: (note: string) => void;
}

export default function CoPlannerHub({
  calendarMarks,
  onCalendarMarksChange,
  userNote,
  onUserNoteChange,
  companyNote,
  onCompanyNoteChange,
}: CoPlannerHubProps) {
  return (
    <div className="bg-[var(--vanilla)]/60 backdrop-blur-md border border-[var(--waffle)]/25 rounded-3xl p-3 flex flex-col gap-3 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--waffle)]/15 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-md bg-[var(--caramel)]/10 text-[var(--caramel)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono font-bold text-[var(--caramel)] uppercase tracking-wider">Co-Planner Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--vanilla)]/80 px-1.5 py-0.5 rounded-full border border-[var(--waffle)]/10">
          <span className="h-1 w-1 rounded-full bg-[var(--caramel)]" />
          <span className="text-[6px] font-mono text-[#A89286]">You</span>
          <span className="h-1 w-1 rounded-full bg-emerald-500" />
          <span className="text-[6px] font-mono text-[#A89286]">Co</span>
        </div>
      </div>

      {/* Main Layout: Split Columns */}
      <div className="grid grid-cols-[1.15fr_1fr] gap-3">
        {/* Left Column: Minimal Calendar */}
        <div className="flex flex-col gap-1.5 border-r border-[var(--waffle)]/10 pr-2">
          <div className="flex justify-between items-center px-0.5">
            <span className="text-[8px] font-mono font-bold text-[var(--foreground)] uppercase tracking-wide">
              {new Date().toLocaleString('default', { month: 'short' })} {new Date().getFullYear()}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-0.5 bg-[var(--background)]/20 p-1 rounded-xl border border-[var(--waffle)]/8">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="text-center text-[7px] font-mono font-bold text-[#A89286] opacity-75 py-0.5">{d}</div>
            ))}
            {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }, (_, i) => <div key={'e' + i} />).concat(
              Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                const y = new Date().getFullYear(), m = new Date().getMonth(), isToday = day === new Date().getDate();
                const mu = calendarMarks[`u-${y}-${m}-${day}`], mc = calendarMarks[`c-${y}-${m}-${day}`];
                return (
                  <button
                    key={day}
                    onClick={() => onCalendarMarksChange(p => ({ ...p, [`u-${y}-${m}-${day}`]: !p[`u-${y}-${m}-${day}`] }))}
                    onContextMenu={e => { e.preventDefault(); onCalendarMarksChange(p => ({ ...p, [`c-${y}-${m}-${day}`]: !p[`c-${y}-${m}-${day}`] })); }}
                    className="relative flex items-center justify-center rounded text-[7.5px] font-mono aspect-square cursor-pointer transition-all hover:bg-[var(--waffle)]/10"
                    style={{
                      background: mu ? 'rgba(194,147,103,0.2)' : mc ? 'rgba(16,185,129,0.12)' : isToday ? 'rgba(194,147,103,0.08)' : 'transparent',
                      color: isToday ? 'var(--caramel)' : '#7A6258',
                      fontWeight: isToday || mu || mc ? 700 : 400,
                      border: isToday ? '1px solid rgba(194,147,103,0.3)' : '1px solid transparent'
                    }}
                    title="L-click: You | R-click: Co"
                  >
                    {day}
                    {mc && <span className="absolute bottom-0.5 right-0.5 h-1 w-1 rounded-full bg-emerald-500" />}
                    {mu && <span className="absolute top-0.5 right-0.5 h-0.5 w-0.5 rounded-full bg-[var(--caramel)]" />}
                  </button>
                );
              })
            )}
          </div>
          <p className="text-[5.5px] text-[#A89286]/80 font-mono text-center">L-click: You • R-click: Co</p>
        </div>

        {/* Right Column: Stacked Notes */}
        <div className="flex flex-col gap-2 justify-between">
          {/* Traveler Note */}
          <div className="bg-[var(--background)]/40 p-1.5 rounded-xl border border-[var(--waffle)]/15 flex flex-col gap-1 hover:border-[var(--caramel)]/20 transition-all flex-1">
            <div className="flex items-center gap-1">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--caramel)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span className="text-[6.5px] font-mono font-bold text-[var(--caramel)] uppercase">Your Plans</span>
            </div>
            <textarea
              value={userNote}
              onChange={e => onUserNoteChange(e.target.value)}
              placeholder="Type goal..."
              rows={2}
              className="w-full bg-transparent text-[7.5px] font-sans text-[var(--foreground)] placeholder-[#A89286]/60 resize-none focus:outline-none leading-tight border-0 p-0"
            />
          </div>

          {/* Guide Note */}
          <div className="bg-emerald-50/20 p-1.5 rounded-xl border border-emerald-500/10 flex flex-col gap-1 hover:border-emerald-500/20 transition-all flex-1">
            <div className="flex items-center gap-1">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span className="text-[6.5px] font-mono font-bold text-emerald-600 uppercase">Guide Update</span>
            </div>
            <p className="text-[7.5px] font-sans text-[#7A6258] leading-tight flex-1 overflow-y-auto max-h-[36px]">
              {companyNote || 'No updates.'}
            </p>
            <div className="pt-1.5 border-t border-emerald-500/5 mt-auto">
              <button
                onClick={() => onCompanyNoteChange(companyNote === '' ? 'Heli safety clearance approved. Everest Base weather holding at -8°C.' : '')}
                className="text-[6.5px] font-mono text-emerald-600 hover:text-emerald-700 text-left underline underline-offset-1 cursor-pointer transition-colors block"
              >
                {companyNote ? 'Clear Update' : 'Simulate Guide Update →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
