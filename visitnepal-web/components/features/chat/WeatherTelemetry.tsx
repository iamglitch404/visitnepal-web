'use client';

import React from 'react';

export interface WeatherData {
  region: string;
  temp: string;
  status: string;
  alert: string;
}

export interface WeatherTelemetryProps {
  rightCollapsed: boolean;
  weather: WeatherData;
}

export default function WeatherTelemetry({ rightCollapsed, weather }: WeatherTelemetryProps) {
  if (rightCollapsed) {
    return (
      <div className="flex justify-center text-lg py-2" title={weather.region}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)]/75 p-4 rounded-2xl border border-[var(--waffle)]/25 flex flex-col gap-2">
      <span className="text-[9px] font-mono font-bold text-[var(--caramel)] uppercase">Himalayan Telemetry</span>
      <h4 className="text-xs font-bold">{weather.region}</h4>
      
      <div className="grid grid-cols-2 gap-2 mt-1.5 font-mono text-[9px] text-[#7A6258]">
        <div>
          <span className="text-[#A89286] block text-[8px] uppercase">Base Temp</span>
          <span className="font-bold text-sm text-[var(--foreground)]">{weather.temp}</span>
        </div>
        <div>
          <span className="text-[#A89286] block text-[8px] uppercase">Status</span>
          <span className="font-bold text-[10px] text-[var(--foreground)]">{weather.status}</span>
        </div>
      </div>
      <div className="border-t border-[var(--waffle)]/15 pt-2 mt-1">
        <span className="inline-block text-[8px] font-bold font-mono text-[var(--caramel)] uppercase bg-[var(--vanilla)] px-2 py-0.5 rounded border border-[var(--waffle)]/30">
          {weather.alert}
        </span>
      </div>
    </div>
  );
}
