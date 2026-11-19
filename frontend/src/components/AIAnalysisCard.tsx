import React, { useState } from 'react';
import { 
  Sparkles, AlertOctagon, AlertTriangle, Info, MapPin, 
  Clock, ShieldAlert, CheckCircle, Edit2, ArrowRight, 
  HelpCircle, Copy, Check 
} from 'lucide-react';
import { AIAnalyzeResponse } from '../types';

interface AIAnalysisCardProps {
  analysis: AIAnalyzeResponse;
  onConfirm: (updatedAnalysis: AIAnalyzeResponse) => void;
  onCancel: () => void;
  isLoadingMatches: boolean;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  analysis,
  onConfirm,
  onCancel,
  isLoadingMatches,
}) => {
  const [data, setData] = useState<AIAnalyzeResponse>(analysis);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [clarificationAnswer, setClarificationAnswer] = useState('');
  const [clarificationSubmitted, setClarificationSubmitted] = useState(false);

  const isEmergency = data.urgency === 'Emergency';
  const isUrgent = data.urgency === 'Urgent';

  const handleCopyBriefing = () => {
    navigator.clipboard.writeText(data.technician_briefing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClarificationSubmit = () => {
    if (!clarificationAnswer.trim()) return;
    setData((prev) => ({
      ...prev,
      problem_description: `${prev.problem_description} [Clarification: ${clarificationAnswer.trim()}]`,
      technician_briefing: `${prev.technician_briefing} Additional info: ${clarificationAnswer.trim()}`,
      clarification_question: null,
    }));
    setClarificationSubmitted(true);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden mb-10 transition-all">
      
      {/* Header Banner */}
      <div className={`px-6 py-4 flex flex-wrap items-center justify-between gap-3 ${
        isEmergency
          ? 'bg-gradient-to-r from-red-600 to-coral-600 text-white'
          : isUrgent
          ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white'
          : 'bg-gradient-to-r from-navy-800 to-navy-700 text-white'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
              <span>AI Problem Diagnosis & Dispatch Brief</span>
              {data.is_demo_fallback && (
                <span className="text-[10px] bg-black/25 text-white px-2 py-0.5 rounded-full font-medium">
                  Rule-Engine Verified
                </span>
              )}
            </h2>
            <p className="text-xs text-white/80">
              Voice acoustics and semantics structured in real-time
            </p>
          </div>
        </div>

        {/* Urgency Badge */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow ${
            isEmergency
              ? 'bg-white text-red-700 animate-pulse'
              : isUrgent
              ? 'bg-white text-amber-700'
              : 'bg-white text-navy-900'
          }`}>
            {isEmergency ? (
              <AlertOctagon className="w-3.5 h-3.5 fill-current" />
            ) : isUrgent ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <Info className="w-3.5 h-3.5" />
            )}
            <span>{data.urgency} Priority</span>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEditing ? 'Done' : 'Edit'}</span>
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">

        {/* Safety Concern Alert Box (Crucial for electrical sparks / floods) */}
        {data.safety_concerns && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-red-900 mb-1">
                  Immediate Inhabitant Safety Guidance
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-red-800 mb-1">
                  {data.safety_concerns}
                </p>
                {data.immediate_guidance && (
                  <p className="text-xs text-red-700 bg-red-100/70 p-2.5 rounded-xl font-medium mt-2">
                    {data.immediate_guidance}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Key Extracted Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Category */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Identified Service
            </span>
            {isEditing ? (
              <select
                value={data.category}
                onChange={(e) => setData({ ...data, category: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-sm font-bold text-navy-900"
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="AC Repair">AC Repair</option>
                <option value="Locksmith">Locksmith</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Appliance Repair">Appliance Repair</option>
                <option value="Painting">Painting</option>
                <option value="Cleaning">Cleaning</option>
                <option value="General Maintenance">General Maintenance</option>
              </select>
            ) : (
              <div className="text-base font-extrabold text-navy-900 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                {data.category}
              </div>
            )}
            <span className="text-[10px] text-slate-400 mt-1 block">
              Confidence: {Math.round(data.ai_confidence * 100)}%
            </span>
          </div>

          {/* Location */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Customer Locality
            </span>
            {isEditing ? (
              <input
                type="text"
                value={data.customer_location}
                onChange={(e) => setData({ ...data, customer_location: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-sm font-bold text-navy-900"
              />
            ) : (
              <div className="text-base font-extrabold text-navy-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-coral-500" />
                {data.customer_location}
              </div>
            )}
            <span className="text-[10px] text-slate-400 mt-1 block">
              Bengaluru Urban District
            </span>
          </div>

          {/* Time & Price Estimate */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Response SLA & Estimate
            </span>
            <div className="flex items-center gap-1 text-sm font-extrabold text-teal-700">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>{data.preferred_time}</span>
            </div>
            <div className="text-xs font-bold text-navy-900 mt-1">
              Est: {data.indicative_price_range} <span className="text-[10px] text-slate-400 font-normal">(Indicative)</span>
            </div>
          </div>

        </div>

        {/* Problem Description & Symptoms */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-navy-800 mb-2">
            Spoken Problem Description
          </h4>
          {isEditing ? (
            <textarea
              value={data.problem_description}
              onChange={(e) => setData({ ...data, problem_description: e.target.value })}
              rows={2}
              className="w-full bg-white border border-slate-300 rounded-xl p-2 text-sm text-navy-900"
            />
          ) : (
            <p className="text-sm text-slate-700 font-medium">
              "{data.problem_description}"
            </p>
          )}

          {/* Symptoms Chips */}
          {data.symptoms.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-semibold mr-1">Symptoms:</span>
              {data.symptoms.map((symptom, idx) => (
                <span
                  key={idx}
                  className="bg-white border border-slate-300 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium"
                >
                  ✓ {symptom}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Clarification Follow-up Question if any detail was missing */}
        {data.clarification_question && !clarificationSubmitted && (
          <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">
                  AI Clarification Needed Before Dispatch
                </h4>
                <p className="text-sm font-semibold text-amber-950 mb-3">
                  {data.clarification_question}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clarificationAnswer}
                    onChange={(e) => setClarificationAnswer(e.target.value)}
                    placeholder="Type quick clarification or confirm..."
                    className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-navy-900 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleClarificationSubmit}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                  >
                    Answer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Technician Briefing Box */}
        <div className="bg-navy-900 text-white rounded-2xl p-5 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300">
                Synthesized Technician Briefing
              </h4>
            </div>
            <button
              type="button"
              onClick={handleCopyBriefing}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed bg-navy-800/80 p-3 rounded-xl border border-navy-700">
            {data.technician_briefing}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">
            ℹ️ This concise operational summary will be transmitted directly to the assigned professional upon request dispatch.
          </p>
        </div>

        {/* Bottom CTA Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoadingMatches}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ← Discard & Re-record
          </button>

          <button
            type="button"
            onClick={() => onConfirm(data)}
            disabled={isLoadingMatches}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-extrabold text-navy-900 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoadingMatches ? (
              <span>Matching Nearby Verified Technicians...</span>
            ) : (
              <>
                <span>Confirm & Find Nearby Help</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
