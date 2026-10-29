import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { ThreatAlert } from '../../types/iomt';

interface ThreatDistributionChartProps {
  alerts: ThreatAlert[];
}

const COLORS: Record<string, string> = {
  'DoS-SynFlood': '#f43f5e', // Rose
  'MQTT-DDoS': '#f59e0b',    // Amber
  'Recon-PortScan': '#06b6d4',// Cyan
  'Command-Injection': '#a855f7', // Purple
  'Benign': '#10b981',       // Emerald
};

export const ThreatDistributionChart: React.FC<ThreatDistributionChartProps> = ({
  alerts,
}) => {
  const data = React.useMemo(() => {
    const counts: Record<string, number> = {
      'DoS-SynFlood': 0,
      'MQTT-DDoS': 0,
      'Recon-PortScan': 0,
      'Command-Injection': 0,
    };

    alerts.forEach((a) => {
      if (counts[a.predicted_class] !== undefined) {
        counts[a.predicted_class]++;
      }
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value: value === 0 ? 1 : value, // Keep visual slice if empty
        actualCount: value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [alerts]);

  return (
    <div className="bg-[#0b1329] border border-slate-800/90 rounded-xl p-4 shadow-xl flex flex-col justify-between">
      <div className="flex items-center space-x-2 mb-2">
        <div className="p-1 rounded bg-amber-500/10 text-amber-400">
          <PieIcon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Attack Family Breakdown
          </h3>
          <p className="text-[11px] text-slate-400">
            Observed classification distribution
          </p>
        </div>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={56}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[entry.name] || '#64748b'}
                  stroke="#0b1329"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const entry = payload[0].payload;
                  return (
                    <div className="bg-[#070d1e] border border-slate-700 p-2 rounded-lg text-xs font-mono shadow-xl">
                      <div className="font-bold text-white">{entry.name}</div>
                      <div className="text-cyan-300">
                        {entry.actualCount} Incident(s) Recorded
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 truncate">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[d.name] }}
              />
              <span className="truncate">{d.name}</span>
            </span>
            <span className="font-bold text-white ml-1">{d.actualCount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
