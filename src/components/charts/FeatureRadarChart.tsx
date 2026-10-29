import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ThreatAlert } from '../../types/iomt';
import { Radar as RadarIcon } from 'lucide-react';

interface FeatureRadarChartProps {
  alert: ThreatAlert;
}

export const FeatureRadarChart: React.FC<FeatureRadarChartProps> = ({ alert }) => {
  const radarData = React.useMemo(() => {
    const raw = alert.raw_features;
    // Normalize into 0-100 relative scales for clean radar plotting
    return [
      {
        subject: 'Packet Vol',
        Attack: Math.min(100, Math.round(((raw.fwd_pkts_tot || 10) / 400) * 100)),
        Baseline: 20,
      },
      {
        subject: 'Byte Density',
        Attack: Math.min(100, Math.round(((raw.fwd_bytes_tot || 1000) / 25000) * 100)),
        Baseline: 15,
      },
      {
        subject: 'Pkt Length',
        Attack: Math.min(100, Math.round(((raw.pkt_len_mean || 40) / 300) * 100)),
        Baseline: 30,
      },
      {
        subject: 'Flow Duration',
        Attack: Math.min(100, Math.round(((raw.flow_duration || 1) / 5) * 100)),
        Baseline: 45,
      },
      {
        subject: 'IAT Tightness',
        // Inverted: faster bursts = higher attack score
        Attack: Math.min(100, Math.round((1 / (raw.flow_iat_mean + 0.001)) * 3)),
        Baseline: 10,
      },
      {
        subject: 'Asymmetry',
        Attack: Math.min(100, Math.round(((raw.bwd_pkts_tot || 1) / (raw.fwd_pkts_tot + 1)) * 100)),
        Baseline: 50,
      },
    ];
  }, [alert]);

  return (
    <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <RadarIcon className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-xs uppercase tracking-wider">
            Multi-Dimensional Flow Signature Radar
          </h3>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> {alert.predicted_class}
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal Baseline
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis
              dataKey="subject"
              stroke="#94a3b8"
              fontSize={10}
              fontFamily="JetBrains Mono"
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="#475569"
              fontSize={9}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#070d1e] border border-slate-700 p-2 rounded-lg text-xs font-mono shadow-xl">
                      <div className="font-bold text-white mb-1">
                        {payload[0].payload.subject}
                      </div>
                      <div className="text-rose-400 font-bold">
                        Observed Vector: {payload[0].value}%
                      </div>
                      <div className="text-emerald-400">
                        Baseline Expectation: {payload[1]?.value}%
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name="Attack Flow"
              dataKey="Attack"
              stroke="#f43f5e"
              fill="#f43f5e"
              fillOpacity={0.45}
            />
            <Radar
              name="Normal Baseline"
              dataKey="Baseline"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-slate-400 text-center font-mono">
        Red polygon area deviation indicates abnormal telemetric divergence from healthy hospital envelope.
      </p>
    </div>
  );
};
