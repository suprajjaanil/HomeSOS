import React from 'react';
import { ShieldAlert, Radio, Clock, User, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTab: 'report' | 'tracking' | 'dashboard';
  setCurrentTab: (tab: 'report' | 'tracking' | 'dashboard') => void;
  selectedLocality: string;
  setSelectedLocality: (loc: string) => void;
  activeRequestId: string | null;
  aiEngineStatus: string;
}

const LOCALITIES = [
  'BTM Layout',
  'Jayanagar',
  'JP Nagar',
  'Banashankari',
  'Koramangala',
  'Indiranagar',
  'HSR Layout',
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  selectedLocality,
  setSelectedLocality,
  activeRequestId,
  aiEngineStatus,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#14233B] text-white shadow-md border-b border-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Tagline */}
          <div 
            onClick={() => setCurrentTab('report')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Radio className="w-6 h-6 text-[#14233B] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
                  Home<span className="text-teal-400">SOS</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-coral-500 text-white rounded-full">
                  ECHO Track
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block">
                Speak your problem. Get the right help.
              </p>
            </div>
          </div>

          {/* Bengaluru Locality Selector */}
          <div className="hidden md:flex items-center gap-2 bg-navy-700/80 px-3 py-1.5 rounded-lg border border-navy-600 text-xs">
            <span className="text-teal-400 font-medium">📍 Bengaluru:</span>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {LOCALITIES.map((loc) => (
                <option key={loc} value={loc} className="bg-navy-900 text-white">
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentTab('report')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'report'
                  ? 'bg-teal-500 text-navy-900 shadow-md'
                  : 'text-slate-200 hover:text-white hover:bg-navy-700'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Voice SOS</span>
            </button>

            {activeRequestId && (
              <button
                onClick={() => setCurrentTab('tracking')}
                className={`relative px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'tracking'
                    ? 'bg-coral-500 text-white shadow-md'
                    : 'text-coral-400 hover:bg-navy-700'
                }`}
              >
                <Clock className="w-4 h-4 animate-spin" />
                <span>Live Tracker</span>
                <span className="w-2 h-2 rounded-full bg-white animate-ping absolute -top-0.5 -right-0.5" />
              </button>
            )}

            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                currentTab === 'dashboard'
                  ? 'bg-teal-500 text-navy-900 shadow-md'
                  : 'text-slate-200 hover:text-white hover:bg-navy-700'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">My Activity</span>
            </button>

            {/* AI Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-navy-900/90 border border-teal-500/30 text-teal-300">
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>{aiEngineStatus}</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
