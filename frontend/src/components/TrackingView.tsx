import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock, Phone, AlertCircle, ShieldAlert, 
  MapPin, Wrench, XCircle, Play, Sparkles, Receipt, ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ServiceRequest } from '../types';

interface TrackingViewProps {
  request: ServiceRequest;
  onSimulateStep: () => void;
  onCancelRequest: () => void;
  onNewRequest: () => void;
  isSimulating: boolean;
}

const STAGES = [
  { key: 'REQUESTED', label: 'Request Sent', desc: 'Dispatched to HomeSOS AI' },
  { key: 'SEARCHING', label: 'Searching Pros', desc: 'Pinging nearest verified technicians' },
  { key: 'ACCEPTED', label: 'Pro Accepted', desc: 'Technician confirmed dispatch' },
  { key: 'ON_THE_WAY', label: 'On The Way', desc: 'En route in Bengaluru traffic' },
  { key: 'ARRIVED', label: 'Arrived', desc: 'Technician at customer location' },
  { key: 'IN_PROGRESS', label: 'Work In Progress', desc: 'Repairing & parts fitting' },
  { key: 'COMPLETED', label: 'Completed', desc: 'Quality verified & bill settled' },
];

export const TrackingView: React.FC<TrackingViewProps> = ({
  request,
  onSimulateStep,
  onCancelRequest,
  onNewRequest,
  isSimulating,
}) => {
  const [showCallModal, setShowCallModal] = useState(false);

  const currentIdx = STAGES.findIndex((s) => s.key === request.status);
  const isCancelled = request.status === 'CANCELLED';
  const isCompleted = request.status === 'COMPLETED';

  // Trigger celebration confetti when job completes
  useEffect(() => {
    if (isCompleted) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#14B8A6', '#FF8A65', '#14233B']
        });
      } catch (err) {
        console.log("Confetti note:", err);
      }
    }
  }, [isCompleted]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-16">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                #{request.id}
              </span>
              <span className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-full ${
                request.urgency === 'Emergency'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {request.urgency}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 mt-2">
              {request.category} Service Dispatch
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <strong>{request.customer_name}</strong> • 📍 {request.customer_location}
            </p>
          </div>

          {/* Current Status Pill */}
          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
              isCancelled
                ? 'bg-red-100 text-red-700'
                : isCompleted
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-teal-100 text-teal-800'
            }`}>
              {!isCancelled && !isCompleted && (
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              )}
              {request.status.replace(/_/g, ' ')}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              Estimated: ₹{request.price_estimate_min} - ₹{request.price_estimate_max}
            </p>
          </div>
        </div>

        {/* Visual Workflow Timeline */}
        <div className="py-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Live Service Progress Timeline
          </h3>

          <div className="relative">
            {/* Background track line */}
            <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 hidden sm:block" />
            
            {/* Active progress fill */}
            <div 
              className="absolute top-4 left-0 h-1 bg-teal-500 transition-all duration-700 hidden sm:block"
              style={{
                width: isCancelled ? '0%' : `${(Math.max(0, currentIdx) / (STAGES.length - 1)) * 100}%`
              }}
            />

            {/* Stages Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 relative z-10">
              {STAGES.map((stage, idx) => {
                const isPassed = !isCancelled && currentIdx >= idx;
                const isCurrent = !isCancelled && currentIdx === idx;

                return (
                  <div key={stage.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                        isCurrent
                          ? 'bg-coral-500 text-white ring-4 ring-coral-200 scale-110'
                          : isPassed
                          ? 'bg-teal-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    
                    <span className={`text-[11px] font-bold mt-2 ${
                      isCurrent ? 'text-coral-600' : isPassed ? 'text-navy-900' : 'text-slate-400'
                    }`}>
                      {stage.label}
                    </span>
                    <span className="text-[9px] text-slate-400 hidden sm:block line-clamp-1">
                      {stage.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hackathon Judge Interactive Simulator Controls Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-navy-800">
                Hackathon Simulation Accelerator
              </h4>
              <p className="text-[11px] text-slate-500">
                Simulate professional acceptance, arrival, and completion without waiting:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isCompleted && !isCancelled && (
              <button
                type="button"
                onClick={onSimulateStep}
                disabled={isSimulating}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold text-navy-900 bg-teal-400 hover:bg-teal-300 transition-all flex items-center justify-center gap-1.5 shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Advance Next Stage</span>
              </button>
            )}

            {!isCompleted && !isCancelled && (
              <button
                type="button"
                onClick={onCancelRequest}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
              >
                Cancel Request
              </button>
            )}

            {(isCompleted || isCancelled) && (
              <button
                type="button"
                onClick={onNewRequest}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-navy-800 hover:bg-navy-900 transition-all flex items-center justify-center gap-1.5 shadow"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Start Another Voice Request</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Assigned Technician Profile Hero Card */}
      {request.assigned_professional && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assigned Verified Specialist
            </h3>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              ID: {request.assigned_professional.id}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={request.assigned_professional.avatar_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'}
                alt={request.assigned_professional.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-100 shadow"
              />

              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-navy-900">
                  {request.assigned_professional.name}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {request.assigned_professional.profile_desc}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                  <span className="text-amber-500 font-bold">
                    ★ {request.assigned_professional.rating} ({request.assigned_professional.completed_jobs}+ jobs)
                  </span>
                  <span className="text-slate-500 font-medium">
                    📍 {request.assigned_professional.locality}
                  </span>
                  <span className="text-teal-700 font-bold">
                    ETA: ~{request.assigned_professional.response_time_min} mins
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated Call / Contact Button */}
            <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowCallModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Technician</span>
              </button>
              <span className="text-[10px] text-slate-400">
                Direct phone: {request.assigned_professional.phone}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Completion Receipt Card if completed */}
      {isCompleted && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-700 shrink-0">
              <Receipt className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Service Fulfilled & Settled
              </span>
              <h3 className="text-xl font-extrabold text-navy-900 mt-0.5">
                Final Amount Paid: ₹{request.final_amount || 550}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Technician completed inspection, hardware fitting, and pressure/insulation test. Thank you for choosing HomeSOS!
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="bg-white border border-emerald-300 text-emerald-800 px-3 py-1 rounded-lg font-semibold">
                  ✓ 30-Day Service Guarantee
                </span>
                <span className="bg-white border border-emerald-300 text-emerald-800 px-3 py-1 rounded-lg font-semibold">
                  ✓ Digital Invoice Stored in History
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operational Details & Event Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Problem & Technician Brief */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Dispatched Briefing & Symptoms
          </h3>
          <p className="text-xs text-slate-700 font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
            {request.technician_briefing}
          </p>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Verified Symptoms:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {request.symptoms.map((s, idx) => (
                <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Event Audit Log */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Real-Time Audit Trail
          </h3>
          <div className="space-y-3">
            {request.timeline.map((event, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                <span className="font-mono text-slate-400 shrink-0 text-[11px] mt-0.5">
                  {event.time}
                </span>
                <span className="text-navy-900 font-medium">
                  {event.event}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Simulated Phone Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Phone className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy-900">
                Calling {request.assigned_professional?.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {request.assigned_professional?.phone}
              </p>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
              "Namaskara! I received your voice briefing via HomeSOS. I have the replacement valve kit and am navigating near your BTM cross now."
            </p>
            <button
              type="button"
              onClick={() => setShowCallModal(false)}
              className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-navy-900 font-bold rounded-xl text-xs transition-colors"
            >
              End Call
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
