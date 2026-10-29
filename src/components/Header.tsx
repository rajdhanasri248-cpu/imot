import React from 'react';
import {
  ShieldAlert,
  Radio,
  Lock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Zap,
  Activity,
  FileCheck2,
  Sliders,
  AlertTriangle,
  Stethoscope,
  Terminal,
  FileText,
} from 'lucide-react';
import { AttackClass } from '../types/iomt';

interface HeaderProps {
  activeTab: 'cockpit' | 'forensics' | 'audit' | 'compliance' | 'reports';
  setActiveTab: (tab: 'cockpit' | 'forensics' | 'audit' | 'compliance' | 'reports') => void;
  isStreaming: boolean;
  setIsStreaming: (val: boolean) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  onInjectAttack: (attack: AttackClass) => void;
  onVerifyAudit: () => void;
  chainValid: boolean;
  threatCount: number;
  reportCount: number;
  isSimpleMode: boolean;
  setIsSimpleMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isStreaming,
  setIsStreaming,
  isMuted,
  setIsMuted,
  onInjectAttack,
  onVerifyAudit,
  chainValid,
  threatCount,
  reportCount,
  isSimpleMode,
  setIsSimpleMode,
}) => {
  const [utcTime, setUtcTime] = React.useState('');
  const [showInjectMenu, setShowInjectMenu] = React.useState(false);

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(
        now.toISOString().split('T')[1].substring(0, 8) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-800/80 bg-[#070d1e]/90 backdrop-blur sticky top-0 z-40 px-4 lg:px-6 py-2.5 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Project Identity */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-500/10">
            <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#070d1e]" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-base tracking-wide text-white flex items-center gap-1.5">
                IoMT-SENTINEL
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  v2.4-POC
                </span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono">
                Student Prototype
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              Clinical IoT Cyber Defense Center • DNN Threat Ingest • Advisory GenAI Guardrails
            </p>
          </div>
        </div>

        {/* Global Controls & Status Telemetry */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
          {/* User-Friendly Mode Switcher */}
          <button
            onClick={() => setIsSimpleMode(!isSimpleMode)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition ${
              isSimpleMode
                ? 'bg-purple-950/50 border-purple-500/50 text-purple-200 hover:bg-purple-900/50'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Toggle between Clinical Staff plain-English mode and Cyber-SOC Engineer mode"
          >
            {isSimpleMode ? (
              <>
                <Stethoscope className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Clinical Staff View</span>
                <span className="sm:hidden">Clinical</span>
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Cyber SOC Mode</span>
                <span className="sm:hidden">SOC</span>
              </>
            )}
          </button>

          {/* Stream Telemetry Status */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition ${
              isStreaming
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/40'
            }`}
            title="Toggle simulated MQTT/CoAP telemetry loop"
          >
            {isStreaming ? (
              <>
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span className="hidden sm:inline">MQTT STREAM: LIVE</span>
                <span className="sm:hidden">LIVE</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>PAUSED</span>
              </>
            )}
          </button>

          {/* Audit Chain Verification Badge */}
          <button
            onClick={onVerifyAudit}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-[11px] transition ${
              chainValid
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/40'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/40'
            }`}
            title="Click to run recursive SHA-256 integrity verification"
          >
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">AUDIT CHAIN:</span>
            <span>{chainValid ? 'VERIFIED' : 'TAMPERED'}</span>
          </button>

          {/* Inject Adversarial Scenario Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowInjectMenu(!showInjectMenu)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/50 text-rose-300 font-mono text-[11px] transition shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>SIMULATE ATTACK</span>
            </button>

            {showInjectMenu && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0c152b] border border-slate-700 shadow-2xl p-2 z-50 text-xs space-y-1"
                onClick={() => setShowInjectMenu(false)}
              >
                <div className="px-2 py-1 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
                  Select Attack Vector to Test
                </div>
                <button
                  onClick={() => onInjectAttack('DoS-SynFlood')}
                  className="w-full text-left px-2.5 py-2 rounded hover:bg-rose-500/20 text-rose-200 flex justify-between items-center transition"
                >
                  <div>
                    <div className="font-semibold">DoS-SynFlood</div>
                    <div className="text-[10px] text-slate-400">Floods Alaris Infusion Pump</div>
                  </div>
                  <span className="text-[9px] mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300">T1</span>
                </button>
                <button
                  onClick={() => onInjectAttack('MQTT-DDoS')}
                  className="w-full text-left px-2.5 py-2 rounded hover:bg-amber-500/20 text-amber-200 flex justify-between items-center transition"
                >
                  <div>
                    <div className="font-semibold">MQTT-DDoS</div>
                    <div className="text-[10px] text-slate-400">Saturates Hospital IoT Gateway</div>
                  </div>
                  <span className="text-[9px] mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">T3</span>
                </button>
                <button
                  onClick={() => onInjectAttack('Recon-PortScan')}
                  className="w-full text-left px-2.5 py-2 rounded hover:bg-cyan-500/20 text-cyan-200 flex justify-between items-center transition"
                >
                  <div>
                    <div className="font-semibold">Recon-PortScan</div>
                    <div className="text-[10px] text-slate-400">Probes Philips Monitor Ports</div>
                  </div>
                  <span className="text-[9px] mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300">T2</span>
                </button>
                <button
                  onClick={() => onInjectAttack('Command-Injection')}
                  className="w-full text-left px-2.5 py-2 rounded hover:bg-purple-500/20 text-purple-200 flex justify-between items-center transition"
                >
                  <div>
                    <div className="font-semibold">Command-Injection</div>
                    <div className="text-[10px] text-slate-400">Exploit attempt on Dräger Ventilator</div>
                  </div>
                  <span className="text-[9px] mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300">T1</span>
                </button>
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition"
            title={isMuted ? 'Unmute alerts' : 'Mute alerts'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* UTC Clock & Lockout indicator */}
          <div className="hidden lg:block text-right border-l border-slate-800 pl-3 font-mono">
            <div className="text-slate-200 font-bold text-xs">{utcTime}</div>
            <div className="text-[9px] text-amber-400 flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              TIER-1 LOCKOUT: ENGAGED
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center space-x-1 sm:space-x-4 mt-2.5 pt-2 border-t border-slate-800/60 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('cockpit')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition ${
            activeTab === 'cockpit'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Operations Cockpit</span>
          {threatCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/30 text-rose-300 font-mono font-bold">
              {threatCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('forensics')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition ${
            activeTab === 'forensics'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>SHAP Forensic Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition ${
            activeTab === 'reports'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hospital Reports & Audits</span>
          {reportCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/30 text-cyan-300 font-mono font-bold">
              {reportCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition ${
            activeTab === 'audit'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>SHA-256 Audit Chain</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition ${
            activeTab === 'compliance'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>OWASP & Benchmark Metrics</span>
        </button>
      </div>
    </header>
  );
};
