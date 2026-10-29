import React from 'react';
import { ThreatAlert } from '../types/iomt';
import { FEATURE_METADATA } from '../utils/simulation';
import { FeatureRadarChart } from './charts/FeatureRadarChart';
import { Sliders, Cpu, Activity, BarChart2, Layers, HelpCircle } from 'lucide-react';

interface ForensicsLabViewProps {
  alerts: ThreatAlert[];
  selectedAlert: ThreatAlert | null;
  onSelectAlert: (id: string) => void;
}

export const ForensicsLabView: React.FC<ForensicsLabViewProps> = ({
  alerts,
  selectedAlert,
  onSelectAlert,
}) => {
  const current = selectedAlert || alerts[0] || null;

  if (!current) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs bg-[#0b1329] border border-slate-800 rounded-xl">
        No alert telemetry currently recorded.
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Overview Banner */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Deep SHAP Feature Attribution & Forensic Lab
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Grounded local model explainability. Isolates which mathematical flow coefficients pushed the neural network across classification thresholds for <span className="text-cyan-300 font-bold">{current.device_name}</span>.
          </p>
        </div>

        {/* Alert selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-mono">Examining Alert:</span>
          <select
            value={current.id}
            onChange={(e) => onSelectAlert(e.target.value)}
            className="bg-[#070d1e] border border-slate-700 text-cyan-300 text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none"
          >
            {alerts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} • {a.predicted_class} ({a.device_name.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Multi-Dimensional Signature Radar Chart */}
      <FeatureRadarChart alert={current} />

      {/* Main Grid: SHAP Top 5 vs Raw Feature Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SHAP Saliency Breakdown */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              Ranked SHAP Saliency Vectors (Top 5)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              {current.predicted_class}
            </span>
          </div>

          <div className="space-y-3">
            {current.shap.map((s) => {
              const pct = Math.round(s.attribution_score * 100);
              return (
                <div
                  key={s.feature}
                  className="bg-[#070d1e] p-3 rounded-lg border border-slate-800/80 text-xs"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className="font-bold text-slate-200">
                        {s.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 ml-2">
                        ({s.feature})
                      </span>
                    </div>
                    <span className="font-mono font-bold text-cyan-400">
                      {pct}% Saliency
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>
                      Observed: <b className="text-white">{s.value} {s.unit}</b>
                    </span>
                    <span className="text-rose-400 font-semibold">
                      {s.impact === 'elevates_threat' ? '▲ Elevates Attack Probability' : '▼ Baseline Suppressor'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Complete Feature Space (CICIoMT2024 Telemetry) */}
        <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Complete CICIoMT2024 Flow Metric Space
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              8 Standard Features
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {Object.entries(current.raw_features).map(([feat, val]) => {
              const meta = FEATURE_METADATA[feat] || {
                label: feat,
                unit: '',
                description: '',
              };
              return (
                <div
                  key={feat}
                  className="p-2.5 rounded-lg bg-[#070d1e] border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-200">{feat}</div>
                    <div className="text-[10px] text-slate-500 font-sans">
                      {meta.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-300 font-bold text-sm">
                      {val} <span className="text-[10px] text-slate-500 font-normal">{meta.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
