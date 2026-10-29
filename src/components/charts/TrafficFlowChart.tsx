import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Activity, Radio } from 'lucide-react';

export interface TrafficPoint {
  time: string;
  packetsPerSec: number;
  throughputKb: number;
  anomalyLevel: number;
  isSpike: boolean;
}

interface TrafficFlowChartProps {
  data: TrafficPoint[];
  isStreaming: boolean;
}

export const TrafficFlowChart: React.FC<TrafficFlowChartProps> = ({
  data,
  isStreaming,
}) => {
  return (
    <div className="bg-[#0b1329] border border-slate-800/90 rounded-xl p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              Live Network Flow Telemetry (CICIoMT2024 Replay)
              {isStreaming && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono normal-case">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Streaming Real-Time
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Aggregated packet rate & throughput with neural network anomaly spikes
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> Packet Rate (pkts/s)
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Anomaly Surge
          </span>
        </div>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="packetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              fontFamily="JetBrains Mono"
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              fontFamily="JetBrains Mono"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#070d1e] border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
                      <div className="text-slate-400 mb-1">{label}</div>
                      <div className="text-cyan-300 font-bold">
                        Packets: {payload[0]?.value} pkts/s
                      </div>
                      {payload[1] && Number(payload[1].value) > 0 && (
                        <div className="text-rose-400 font-bold">
                          Threat Ingest Surge: {payload[1].value}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="packetsPerSec"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#packetGradient)"
            />
            <Area
              type="monotone"
              dataKey="anomalyLevel"
              stroke="#f43f5e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#anomalyGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
