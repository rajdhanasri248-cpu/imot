import React from 'react';
import { IoMTDevice, ThreatAlert } from '../types/iomt';
import { MedicalWaveformChart } from './charts/MedicalWaveformChart';
import {
  ShieldAlert,
  Brain,
  Sliders,
  CheckCircle2,
  AlertOctagon,
  Lock,
  ChevronRight,
  Info,
  Server,
  Zap,
  Activity,
  FileText,
  Crosshair,
  HelpCircle,
  Stethoscope,
} from 'lucide-react';

interface SidePreviewDrawerProps {
  device: IoMTDevice | null;
  alert: ThreatAlert | null;
  onOpenApproval: (alertId: string, actionId: string) => void;
  isSimpleMode?: boolean;
}

export const SidePreviewDrawer: React.FC<SidePreviewDrawerProps> = ({
  device,
  alert,
  onOpenApproval,
  isSimpleMode = false,
}) => {
  const [showRawFeatures, setShowRawFeatures] = React.useState(false);
  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);

  if (!device) {
    return (
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs h-[calc(100vh-6rem)] flex flex-col items-center justify-center">
        <Server className="w-12 h-12 mb-3 text-slate-700" />
        <h3 className="font-bold text-slate-400 text-sm mb-1">No IoMT Node Selected</h3>
        <p className="text-slate-600 max-w-xs">
          Select any medical asset or security alert on the left to inspect real-time SHAP attributions, live clinical waveforms, and GenAI advisory.
        </p>
      </div>
    );
  }

  const isTier1 = device.tier === 1;
  const isResolved = alert?.status === 'EXECUTED';

  const tierBadge =
    device.tier === 1
      ? 'text-rose-400 bg-rose-950/60 border-rose-500/50'
      : device.tier === 2
      ? 'text-amber-400 bg-amber-950/60 border-amber-500/50'
      : 'text-cyan-400 bg-cyan-950/60 border-cyan-500/50';

  return (
    <div className="bg-[#0b1329] border border-slate-800/90 rounded-xl p-4 lg:p-5 shadow-2xl space-y-4 overflow-y-auto max-h-[calc(100vh-6.5rem)]">
      {/* Drawer Header: Clinical Asset & Severity Index */}
      <div className="border-b border-slate-800/80 pb-3.5 flex justify-between items-start gap-2">
        <div className="min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span
              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${tierBadge}`}
            >
              TIER {device.tier} • {isTier1 ? 'LIFE-CRITICAL' : device.tier === 2 ? 'DIAGNOSTIC' : 'SUPPORTIVE'}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              {device.id}
            </span>
          </div>

          <h2 className="text-base font-bold text-white truncate">
            {device.name}
          </h2>
          <p className="text-xs text-slate-400 truncate">
            {device.dept}
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] font-mono text-slate-500">
            <span>IP: <b className="text-slate-300">{device.ip}</b></span>
            <span>MAC: <b className="text-slate-300">{device.mac}</b></span>
            <span>PROTO: <b className="text-slate-300">{device.protocol}</b></span>
          </div>
        </div>

        {alert ? (
          <div className="text-right shrink-0">
            <div
              className={`text-2xl font-mono font-black ${
                alert.severity >= 7.5
                  ? 'text-rose-400'
                  : alert.severity >= 4.5
                  ? 'text-amber-400'
                  : 'text-cyan-400'
              }`}
            >
              {alert.severity}
              <span className="text-xs text-slate-500 font-normal"> /10</span>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block">
              Severity Score S
            </span>
            <div className="flex items-center justify-end gap-1">
              <span className="text-[9px] font-mono text-slate-500">
                S = p×(0.5A+0.5T)
              </span>
              <button
                onClick={() =>
                  setActiveTooltip(
                    activeTooltip === 'severity'
                      ? null
                      : 'severity'
                  )
                }
                className="text-slate-500 hover:text-cyan-400"
              >
                <HelpCircle className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-right shrink-0">
            <span className="inline-flex items-center text-[10px] font-mono px-2 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              NORMAL
            </span>
          </div>
        )}
      </div>

      {/* Helpful Severity Tooltip popup */}
      {activeTooltip === 'severity' && (
        <div className="p-3 bg-[#070d1e] border border-cyan-500/40 rounded-lg text-xs text-slate-300 space-y-1 animate-in fade-in duration-150">
          <div className="font-bold text-cyan-300">How is Severity Calculated?</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Formula: <code className="text-cyan-200">S = Confidence × (0.5 × Attack_Impact + 0.5 × Device_Tier) × 10</code>.
            Tier 1 life-support assets have maximum weight (1.0), meaning attacks on them score highest priority.
          </p>
        </div>
      )}

      {/* Live Medical Waveform Graph */}
      <MedicalWaveformChart device={device} alert={alert} />

      {/* When Threat is Present */}
      {alert ? (
        <>
          {/* Active Attack Classification Card */}
          <div className="bg-[#121c38]/70 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-mono uppercase font-bold text-rose-300 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                DNN Attack Signature: {alert.predicted_class}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                Confidence: {(alert.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {isSimpleMode
                ? `The cyber defense neural network detected abnormal activity typical of ${alert.predicted_class}. This device requires clinical team review.`
                : 'Identified by PyTorch Multi-Layer Perceptron trained on normalized CICIoMT2024 flow records.'}
            </p>
          </div>

          {/* Top-5 SHAP Feature Attribution Visualization */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                SHAP Top-5 Feature Saliency
              </h4>
              <div className="flex items-center space-x-1">
                <span className="text-[9px] font-mono text-slate-400">
                  LOCAL EXPLAINABILITY
                </span>
                <button
                  onClick={() =>
                    setActiveTooltip(activeTooltip === 'shap' ? null : 'shap')
                  }
                  className="text-slate-500 hover:text-cyan-400"
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              </div>
            </div>

            {activeTooltip === 'shap' && (
              <div className="p-2.5 bg-[#070d1e] border border-cyan-500/40 rounded-lg text-xs text-slate-300 space-y-1">
                <div className="font-bold text-cyan-300">What is SHAP Saliency?</div>
                <p className="text-[11px] text-slate-400">
                  SHAP explains the AI model: each bar shows how much that specific flow measurement pushed the AI to classify this as an attack rather than normal medical traffic.
                </p>
              </div>
            )}

            <div className="space-y-2 bg-[#091024] p-3 rounded-xl border border-slate-800/80">
              {alert.shap.map((s) => {
                const pct = Math.round(s.attribution_score * 100);
                return (
                  <div key={s.feature} className="text-xs">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="font-mono text-slate-200">
                        {s.label} ({s.value} {s.unit})
                      </span>
                      <span className="font-mono font-bold text-cyan-400">
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GenAI Incident Advisory (OWASP Top 10 Guardrailed) */}
          <div className="bg-[#0c152c] border border-cyan-500/30 rounded-xl p-3.5 space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span>GenAI Clinical Incident Advisory</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                OWASP SCHEMA VALID
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {alert.advisory.explanation}
            </p>

            <div className="p-2.5 rounded-lg bg-[#070d1e] border border-slate-800 text-[11px] text-slate-400">
              <b className="text-slate-200">Summary: </b>
              {alert.advisory.summary}
            </div>

            <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
              <span>Grounding: Cites SHAP top features only</span>
              <span>Uncertainty: {alert.advisory.uncertainty}</span>
            </div>
          </div>

          {/* Tier-1 Safety Lockout Warning */}
          {isTier1 && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/50 text-rose-200 flex items-start space-x-2.5 text-xs">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <b className="font-bold text-rose-300 uppercase block tracking-wider text-[11px]">
                  Safety Lockout: Tier-1 Life-Critical Protection
                </b>
                <p className="text-[11px] text-rose-200/90 mt-0.5 leading-relaxed">
                  Automated network blocking, packet drops, or VLAN isolation are strictly prohibited to protect patient life. Any action requires dual human verification and biomedical escalation.
                </p>
              </div>
            </div>
          )}

          {/* Human-in-the-Loop Action Approval Triggers */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Human-in-the-Loop Authorization
              </h4>
              <span className="text-[9px] font-mono text-amber-400">
                {isResolved ? 'MITIGATION SIGNED' : 'REQUIRES BME OVERRIDE'}
              </span>
            </div>

            {isResolved ? (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Action <b className="font-mono">{alert.resolvedAction}</b> authorized and committed to SHA-256 chain.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {alert.advisory.action_ids.map((actionId) => (
                  <button
                    key={actionId}
                    onClick={() => onOpenApproval(alert.id, actionId)}
                    className="w-full px-3 py-2.5 rounded-lg bg-[#142247] hover:bg-[#1a2d5e] border border-cyan-500/40 hover:border-cyan-400 text-white font-mono text-xs font-semibold flex items-center justify-between transition shadow-md group"
                  >
                    <span className="flex items-center gap-1.5 text-cyan-200 group-hover:text-cyan-100">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      Execute: {actionId}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 transition" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Raw Telemetry Inspector Toggle */}
          <div className="pt-1">
            <button
              onClick={() => setShowRawFeatures(!showRawFeatures)}
              className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <FileText className="w-3 h-3" />
              <span>{showRawFeatures ? 'Hide' : 'Inspect'} Raw Flow Record (CICIoMT2024 Format)</span>
            </button>

            {showRawFeatures && (
              <div className="mt-2 p-2.5 rounded-lg bg-[#070d1e] border border-slate-800 text-[10px] font-mono text-slate-300 space-y-1">
                {Object.entries(alert.raw_features).map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-slate-800/40 py-0.5">
                    <span className="text-slate-400">{k}</span>
                    <span className="text-cyan-300 font-bold">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Device is running nominally with no active threats */
        <div className="p-6 text-center text-slate-500 text-xs bg-[#091024]/50 rounded-xl border border-slate-800/80">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
          <h4 className="font-bold text-white text-sm mb-1">
            Operating Envelope Stable
          </h4>
          <p className="text-slate-400 max-w-xs mx-auto">
            Zero anomalous flow vectors observed for {device.name}. Telemetry packet pacing is consistent with baseline.
          </p>
        </div>
      )}
    </div>
  );
};
