import React, { useState } from 'react';
import { 
  Star, MapPin, Clock, ShieldCheck, Phone, 
  ArrowRight, Navigation, Sparkles, Filter 
} from 'lucide-react';
import { MatchedProfessional, AIAnalyzeResponse } from '../types';

interface MatchingSectionProps {
  professionals: MatchedProfessional[];
  analysis: AIAnalyzeResponse;
  onRequestProfessional: (prof: MatchedProfessional) => void;
  isSubmitting: boolean;
  onBack: () => void;
}

export const MatchingSection: React.FC<MatchingSectionProps> = ({
  professionals,
  analysis,
  onRequestProfessional,
  isSubmitting,
  onBack,
}) => {
  const [sortBy, setSortBy] = useState<'recommended' | 'fastest' | 'rating'>('recommended');

  const sorted = [...professionals].sort((a, b) => {
    if (sortBy === 'fastest') return a.estimated_arrival_mins - b.estimated_arrival_mins;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.match_score - a.match_score;
  });

  return (
    <div className="space-y-6 mb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
            <h2 className="text-lg sm:text-xl font-extrabold text-navy-900">
              {professionals.length} Verified {analysis.category} Technicians Near {analysis.customer_location}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by proximity, arrival speed, category experience, and active availability
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSortBy('recommended')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              sortBy === 'recommended' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Recommended
          </button>
          <button
            type="button"
            onClick={() => setSortBy('fastest')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              sortBy === 'fastest' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Fastest ETA ⚡
          </button>
          <button
            type="button"
            onClick={() => setSortBy('rating')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              sortBy === 'rating' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Top Rated ★
          </button>
        </div>
      </div>

      {/* Demo Data & Transparency Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px] uppercase">
            Prototype Demo Notice
          </span>
          <span className="text-slate-600">
            Professional profiles, ratings, and arrival times are realistic seeded demo data for Bengaluru localities. The radar visualizer demonstrates spatial dispatch logic without live mobile GPS telematics.
          </span>
        </div>
      </div>

      {/* Grid: Technician Cards & Bengaluru Locality Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Matched Technician Cards */}
        <div className="lg:col-span-2 space-y-4">
          {sorted.map((prof, index) => {
            const isTopMatch = index === 0 && sortBy === 'recommended';
            const isFastest = prof.estimated_arrival_mins <= 15;

            return (
              <div
                key={prof.id}
                className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-lg ${
                  isTopMatch
                    ? 'border-teal-400 ring-2 ring-teal-400/20 shadow-md'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Top Badge Row */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {prof.rank_reason}
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Available Now
                  </div>
                </div>

                {/* Main Profile Info */}
                <div className="flex items-start gap-4">
                  <img
                    src={prof.avatar_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'}
                    alt={prof.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-navy-900 truncate">
                        {prof.name}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {prof.profile_desc}
                    </p>

                    {/* Stats pills */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{prof.rating}</span>
                        <span className="text-slate-400 font-normal">({prof.completed_jobs} jobs)</span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-600 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-coral-500" />
                        <span>{prof.locality} ({prof.distance_km} km)</span>
                      </div>

                      <div className={`flex items-center gap-1 font-bold ${
                        isFastest ? 'text-coral-600' : 'text-slate-700'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>~{prof.estimated_arrival_mins} mins ETA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5 max-w-md">
                    {prof.skills.slice(0, 4).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs font-bold text-navy-900">
                    Price: {prof.price_range}
                  </div>
                </div>

                {/* Dispatch Button */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400">
                    Languages: {prof.languages}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRequestProfessional(prof)}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-navy-800 hover:bg-navy-900 transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    <span>Request This Technician</span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Interactive Bengaluru Dispatch Locality Map / Radar */}
        <div className="space-y-4">
          <div className="bg-[#14233B] text-white rounded-2xl p-5 shadow-lg border border-navy-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                  Bengaluru Dispatch Radar
                </h3>
              </div>
              <span className="text-[10px] text-slate-300 bg-navy-700 px-2 py-0.5 rounded-full font-mono">
                Live Proximity
              </span>
            </div>

            {/* Visual Radar Container */}
            <div className="relative w-full h-64 bg-navy-900/90 rounded-xl border border-navy-700 flex items-center justify-center overflow-hidden">
              
              {/* Concentric distance rings */}
              <div className="absolute w-16 h-16 rounded-full border border-teal-500/20" />
              <div className="absolute w-32 h-32 rounded-full border border-teal-500/20" />
              <div className="absolute w-48 h-48 rounded-full border border-teal-500/15" />
              <div className="absolute w-60 h-60 rounded-full border border-teal-500/10" />

              {/* Crosshair grid lines */}
              <div className="absolute w-full h-[1px] bg-teal-500/10" />
              <div className="absolute h-full w-[1px] bg-teal-500/10" />

              {/* Center Customer Pin */}
              <div className="relative z-10 flex flex-col items-center">
                <span className="w-4 h-4 rounded-full bg-coral-500 border-2 border-white animate-ping absolute" />
                <span className="w-4 h-4 rounded-full bg-coral-500 border-2 border-white shadow-lg relative z-10" />
                <span className="text-[10px] font-bold text-white bg-navy-900/90 px-1.5 py-0.5 rounded border border-coral-500/40 mt-1 shadow">
                  YOU ({analysis.customer_location})
                </span>
              </div>

              {/* Nearby Professional Mock Coordinates Pins */}
              {sorted.slice(0, 4).map((p, idx) => {
                // Circular offsets for visualization
                const angle = (idx * 90 + 30) * (Math.PI / 180);
                const distanceFactor = Math.min(85, p.distance_km * 25 + 30);
                const x = Math.cos(angle) * distanceFactor;
                const y = Math.sin(angle) * distanceFactor;

                return (
                  <div
                    key={p.id}
                    className="absolute z-10 flex flex-col items-center cursor-pointer group"
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-teal-400 border border-white shadow-md group-hover:scale-125 transition-transform" />
                    <span className="text-[8px] font-bold text-teal-300 bg-navy-950/90 px-1 py-0.2 rounded border border-teal-500/30 whitespace-nowrap mt-0.5">
                      {p.name.split(' ')[0]} ({p.distance_km}km)
                    </span>
                  </div>
                );
              })}

            </div>

            <div className="mt-3 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center justify-between">
                <span>📍 Center Locality:</span>
                <strong className="text-white">{analysis.customer_location}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>⚡ Average Arrival Window:</span>
                <strong className="text-teal-300">12 - 25 mins</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>🛡️ HomeSOS Guarantee:</span>
                <span className="text-emerald-400 font-semibold">Verified Background Check</span>
              </div>
            </div>
          </div>

          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ← Back to AI Diagnosis
          </button>

        </div>

      </div>

    </div>
  );
};
