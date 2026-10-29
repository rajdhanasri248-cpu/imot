import React from 'react';
import { IoMTDevice, ThreatAlert } from '../../types/iomt';
import { HeartPulse, Wind, Droplets, Activity, AlertTriangle } from 'lucide-react';

interface MedicalWaveformChartProps {
  device: IoMTDevice;
  alert: ThreatAlert | null;
}

export const MedicalWaveformChart: React.FC<MedicalWaveformChartProps> = ({
  device,
  alert,
}) => {
  const [points, setPoints] = React.useState<number[]>([]);
  const isAttacked = !!alert && alert.status !== 'EXECUTED';

  // Determine wave type
  const waveType =
    device.type.includes('ECG') || device.name.includes('ECG') || device.name.includes('Pacemaker')
      ? 'ECG'
      : device.name.includes('Ventilator')
      ? 'VENTILATOR'
      : device.name.includes('Infusion')
      ? 'INFUSION'
      : 'TELEMETRY';

  // Generate continuous synthetic waveform data
  React.useEffect(() => {
    let phase = 0;
    const interval = setInterval(() => {
      phase += 0.2;
      setPoints((prev) => {
        let val = 50;
        if (waveType === 'ECG') {
          // Standard P-Q-R-S-T ECG cycle
          const mod = phase % (Math.PI * 2);
          if (mod > 1.2 && mod < 1.4) val = 60; // P wave
          else if (mod >= 1.4 && mod < 1.5) val = 45; // Q
          else if (mod >= 1.5 && mod < 1.7) val = 95; // R peak
          else if (mod >= 1.7 && mod < 1.8) val = 30; // S dip
          else if (mod >= 2.0 && mod < 2.4) val = 65; // T wave
          else val = 50; // Isoelectric baseline
        } else if (waveType === 'VENTILATOR') {
          // Sine breath inhalation and exhalation
          val = 50 + Math.sin(phase * 0.8) * 35;
        } else if (waveType === 'INFUSION') {
          // Steady micro-infusion rate with slight pump stroke
          val = 50 + Math.sin(phase * 2) * 8;
        } else {
          // Standard network telemetry heartbeat
          val = 50 + Math.sin(phase) * 15;
        }

        // Add cyber attack packet jitter / noise if under attack
        if (isAttacked) {
          const jitter = (Math.random() - 0.5) * 28;
          val += jitter;
        }

        const next = [...prev, val];
        if (next.length > 50) next.shift();
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [waveType, isAttacked]);

  // Convert points to SVG path
  const svgWidth = 340;
  const svgHeight = 70;
  const pathD = points
    .map((p, idx) => {
      const x = (idx / (points.length - 1 || 1)) * svgWidth;
      const y = svgHeight - (p / 100) * svgHeight;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const waveColor = isAttacked ? '#f43f5e' : '#06b6d4';

  return (
    <div className="bg-[#091024] border border-slate-800 rounded-xl p-3.5 space-y-2">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center space-x-1.5 font-bold text-white">
          {waveType === 'ECG' ? (
            <HeartPulse className="w-4 h-4 text-rose-400" />
          ) : waveType === 'VENTILATOR' ? (
            <Wind className="w-4 h-4 text-cyan-400" />
          ) : waveType === 'INFUSION' ? (
            <Droplets className="w-4 h-4 text-amber-400" />
          ) : (
            <Activity className="w-4 h-4 text-emerald-400" />
          )}
          <span>
            {waveType === 'ECG'
              ? 'Bedside Lead-II ECG Waveform'
              : waveType === 'VENTILATOR'
              ? 'Airway Pressure Curve (cmH2O)'
              : waveType === 'INFUSION'
              ? 'Volumetric Pump Flow (mL/h)'
              : 'Operational Telemetry Sync'}
          </span>
        </div>

        <span
          className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
            isAttacked
              ? 'bg-rose-950/60 text-rose-300 border-rose-500/40 animate-pulse'
              : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
          }`}
        >
          {isAttacked ? 'SIGNAL JITTER (ATTACK)' : 'PHYSIOLOGICAL SYNC OK'}
        </span>
      </div>

      {/* Live Waveform Canvas */}
      <div className="h-16 w-full bg-[#050914] rounded-lg border border-slate-800/80 overflow-hidden relative flex items-center justify-center">
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #0ea5e9 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
          <path
            d={pathD}
            fill="none"
            stroke={waveColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {isAttacked && (
          <div className="absolute bottom-1 right-2 text-[9px] font-mono text-rose-400 font-bold bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-500/40">
            NETWORK JITTER INDUCED
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
        <span>Vitals: {device.baselineVitals || 'Nominal Range'}</span>
        <span>Sensor Polling: 100ms</span>
      </div>
    </div>
  );
};
