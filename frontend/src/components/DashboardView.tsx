import React, { useState } from 'react';
import { 
  User, CheckCircle, Clock, ShieldAlert, Wrench, 
  IndianRupee, ChevronRight, FileText, ArrowRight, Eye, Calendar
} from 'lucide-react';
import { ServiceRequest, HistoryStats } from '../types';

interface DashboardViewProps {
  stats: HistoryStats | null;
  history: ServiceRequest[];
  onSelectRequest: (req: ServiceRequest) => void;
  onNewRequest: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  history,
  onSelectRequest,
  onNewRequest,
}) => {
  const [selectedModalRequest, setSelectedModalRequest] = useState<ServiceRequest | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-8 mb-16">
      
      {/* Customer Profile & Quick Action Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center text-navy-900 font-extrabold text-2xl shadow-md">
            PS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900">
                Priya Sharma
              </h1>
              <span className="text-[11px] font-bold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
                HomeSOS Priority Resident
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              📍 Primary Residence: <strong>BTM Layout 2nd Stage, Bengaluru</strong> • +91 98765 43210
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewRequest}
          className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold text-navy-900 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-300 hover:to-teal-400 transition-all shadow-md flex items-center gap-2"
        >
          <Wrench className="w-4 h-4" />
          <span>New Voice SOS Request</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Requests
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-navy-900">
              {stats.total_requests}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Lifetime Logged</span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Completed
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {stats.completed_requests}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Resolved & Verified</span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Active / Tracking
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-coral-500">
              {stats.active_requests}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">In Progress</span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Saved Technicians
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-navy-800">
              {stats.saved_technicians}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Assigned Pros</span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm col-span-2 lg:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total Spent
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-600">
              ₹{stats.total_spent.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Transparent Settled</span>
          </div>

        </div>
      )}

      {/* Service Memory & Past History Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-navy-900">
              Service Memory & History
            </h2>
            <p className="text-xs text-slate-500">
              Permanent record of household repairs, symptoms, parts, and costs
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {history.length} Records
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No service requests found. Tap "New Voice SOS Request" to record your first problem!
            </div>
          ) : (
            history.map((req) => {
              const isComp = req.status === 'COMPLETED';
              const isEmg = req.urgency === 'Emergency';

              return (
                <div
                  key={req.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-600">
                        #{req.id}
                      </span>
                      <span className="text-xs font-extrabold text-navy-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        {req.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isEmg ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {req.urgency}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isComp ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-navy-900 line-clamp-1">
                      {req.problem_description}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>📍 {req.customer_location}</span>
                      {req.assigned_professional && (
                        <span>👨‍🔧 {req.assigned_professional.name}</span>
                      )}
                      <span>
                        Est: ₹{req.price_estimate_min} - ₹{req.price_estimate_max}
                      </span>
                      {req.final_amount && (
                        <span className="font-bold text-emerald-600">
                          Final: ₹{req.final_amount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedModalRequest(req)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectRequest(req)}
                      className="px-3.5 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>Track / Open</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedModalRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  #{selectedModalRequest.id}
                </span>
                <h3 className="text-lg font-bold text-navy-900">
                  {selectedModalRequest.category} Service Record
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedModalRequest(null)}
                className="text-slate-400 hover:text-navy-900 font-bold text-xl px-2"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase block">Problem:</span>
                <p className="font-semibold text-navy-900 mt-0.5">
                  "{selectedModalRequest.problem_description}"
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase block">Technician Brief:</span>
                <p className="font-mono bg-slate-50 p-2.5 rounded-xl border text-slate-700 mt-0.5">
                  {selectedModalRequest.technician_briefing}
                </p>
              </div>

              {selectedModalRequest.assigned_professional && (
                <div className="bg-slate-50 p-3 rounded-xl border flex items-center gap-3">
                  <img
                    src={selectedModalRequest.assigned_professional.avatar_url || ''}
                    alt=""
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-navy-900">
                      {selectedModalRequest.assigned_professional.name}
                    </h4>
                    <p className="text-slate-500">
                      {selectedModalRequest.assigned_professional.locality} • ★ {selectedModalRequest.assigned_professional.rating}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border">
                  <span className="text-slate-400 block">Indicative Estimate:</span>
                  <strong className="text-navy-900 font-bold">
                    ₹{selectedModalRequest.price_estimate_min} - ₹{selectedModalRequest.price_estimate_max}
                  </strong>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 block">Final Bill Settled:</span>
                  <strong className="text-emerald-800 font-bold">
                    ₹{selectedModalRequest.final_amount || 'Pending'}
                  </strong>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase block mb-1">Timeline Events:</span>
                <div className="space-y-1.5">
                  {selectedModalRequest.timeline.map((e, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="font-mono text-slate-400 shrink-0">{e.time}</span>
                      <span className="text-navy-900 font-medium">{e.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedModalRequest(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-navy-900 font-bold rounded-xl text-xs transition-colors"
            >
              Close Record
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
