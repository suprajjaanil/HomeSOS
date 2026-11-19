import React from 'react';
import { Sparkles, Wrench, Zap, Wind, KeyRound, Hammer } from 'lucide-react';
import { PresetScenario } from '../types';

interface DemoScenariosBarProps {
  scenarios: PresetScenario[];
  onSelectScenario: (scenario: PresetScenario) => void;
  isLoading: boolean;
}

const ICONS = {
  plumbing_leak: Wrench,
  electrical_spark: Zap,
  ac_not_cooling: Wind,
  broken_lock: KeyRound,
  carpentry_furniture: Hammer,
};

export const DemoScenariosBar: React.FC<DemoScenariosBarProps> = ({
  scenarios,
  onSelectScenario,
  isLoading,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-800">
              Hackathon Judge Demo Scenarios
            </h3>
            <p className="text-[11px] text-slate-500">
              Click any scenario to test end-to-end AI diagnosis, safety guidance, and technician matching:
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
          5 Seeded Pre-Sets
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {scenarios.map((scenario) => {
          const IconComponent = ICONS[scenario.id as keyof typeof ICONS] || Wrench;
          const isEmergency = scenario.urgency === 'Emergency';

          return (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              disabled={isLoading}
              className={`p-2.5 rounded-xl border text-left transition-all group flex flex-col justify-between ${
                isEmergency
                  ? 'border-coral-200 hover:border-coral-400 hover:bg-coral-50/40 bg-white'
                  : 'border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 bg-white'
              } disabled:opacity-50`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isEmergency
                      ? 'bg-coral-100 text-coral-600 group-hover:scale-105'
                      : 'bg-teal-100 text-teal-700 group-hover:scale-105'
                  } transition-transform`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isEmergency
                      ? 'bg-red-100 text-red-700'
                      : scenario.urgency === 'Urgent'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {scenario.urgency}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-navy-800 line-clamp-1 group-hover:text-teal-600 transition-colors">
                  {scenario.title}
                </h4>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  📍 {scenario.customer_location}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
