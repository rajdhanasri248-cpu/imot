import React from 'react';
import { ThreatAlert } from '../types/iomt';
import {
  Flame,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface ThreatRadarProps {
  alerts: ThreatAlert[];
  selectedAlertId: string | null;
  onSelectAlert: (id: string) => void;
  filterTier: number | 'ALL';
  setFilterTier: (tier: number | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const ThreatRadar: React.FC<ThreatRadarProps> = ({
  alerts,
  selectedAlertId,
  onSelectAlert,
  filterTier,
  setFilterTier,
  searchQuery,
  setSearchQuery,
}) => {
  const filteredAlerts = alerts.filter((alert) => {
    const matchesTier =
      filterTier === 'ALL' || alert.tier === filterTier;
    const matchesSearch =
      searchQuery.trim() === '' ||
      alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.device_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.predicted_class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.dept.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <div className="bg-[#0b1329] border border-slate-800/90 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Header & Filter Controls */}
      <div className="p-3.5 border-b border-slate-800/90 bg-[#0d162e]/70 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            Live Threat Radar Feed
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {filteredAlerts.length} Active
          </span>
        </div>

        {/* Tier Filters */}
        <div className="flex items-center space-x-1.5 text-[11px] font-mono">
          <button
            onClick={() => setFilterTier('ALL')}
            className={`px-2 py-0.5 rounded transition ${
              filterTier === 'ALL'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilterTier(1)}
            className={`px-2 py-0.5 rounded transition ${
              filterTier === 1
                ? 'bg-rose-900/60 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            T1 (Life)
          </button>
          <button
            onClick={() => setFilterTier(2)}
            className={`px-2 py-0.5 rounded transition ${
              filterTier === 2
                ? 'bg-amber-900/60 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            T2
          </button>
          <button
            onClick={() => setFilterTier(3)}
            className={`px-2 py-0.5 rounded transition ${
              filterTier === 3
                ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-cyan-400'
            }`}
          >
            T3
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="px-3.5 py-2 border-b border-slate-800/60 bg-[#091024]/40 flex items-center space-x-2">
        <Search className="w-3.5 h-3.5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by alert ID, device, or attack family..."
          className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Alerts Stream List */}
      <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[520px]">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
            <p className="font-medium text-slate-400">Zero active threat anomalies matching filter.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Simulated background flows are running within statistical tolerance.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isSelected = alert.id === selectedAlertId;
            const isResolved = alert.status === 'EXECUTED';

            const sevColor =
              alert.severity >= 7.5
                ? 'text-rose-400 border-rose-500/60 bg-rose-950/40'
                : alert.severity >= 4.5
                ? 'text-amber-400 border-amber-500/60 bg-amber-950/40'
                : 'text-cyan-400 border-cyan-500/60 bg-cyan-950/40';

            const tierBadge =
              alert.tier === 1
                ? 'text-rose-400 bg-rose-950/60 border-rose-500/40'
                : alert.tier === 2
                ? 'text-amber-400 bg-amber-950/60 border-amber-500/40'
                : 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';

            return (
              <div
                key={alert.id}
                onClick={() => onSelectAlert(alert.id)}
                className={`p-3.5 hover:bg-[#121c38]/80 cursor-pointer transition flex items-center justify-between text-xs group ${
                  isSelected
                    ? 'bg-[#142142] border-l-4 border-cyan-400 pl-2.5'
                    : ''
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  {/* Severity badge */}
                  <div
                    className={`w-11 h-11 rounded-lg border flex flex-col items-center justify-center font-mono font-bold shrink-0 ${sevColor}`}
                  >
                    <span className="text-[12px] leading-none">{alert.severity}</span>
                    <span className="text-[8px] opacity-75 font-normal">SEV</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white group-hover:text-cyan-300 transition truncate">
                        {alert.predicted_class}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        ({alert.id})
                      </span>
                      {isResolved && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 shrink-0">
                          MITIGATED
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-300 truncate">
                      {alert.device_name}
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500 mt-0.5">
                      <span className={`px-1 rounded border text-[9px] ${tierBadge}`}>
                        Tier {alert.tier}
                      </span>
                      <span className="truncate">{alert.dept}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end">
                  <div className="text-[11px] font-mono font-bold text-emerald-400">
                    {Math.round(alert.confidence * 100)}% Conf
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {alert.timestamp}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition mt-1" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
