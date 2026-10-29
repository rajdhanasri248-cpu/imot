import React from 'react';
import { IoMTDevice } from '../types/iomt';
import { Activity, ShieldCheck, AlertCircle, Cpu, Wifi } from 'lucide-react';

interface FleetMatrixProps {
  devices: IoMTDevice[];
  selectedDeviceId: string;
  onSelectDevice: (id: string) => void;
  activeAlertsCountByDevice: Record<string, number>;
}

export const FleetMatrix: React.FC<FleetMatrixProps> = ({
  devices,
  selectedDeviceId,
  onSelectDevice,
  activeAlertsCountByDevice,
}) => {
  return (
    <div className="bg-[#0b1329] border border-slate-800/90 rounded-xl p-4 shadow-xl">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Clinical Fleet Matrix (10 Virtual Nodes)
          </h2>
        </div>
        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Tier 1 (Life-Critical)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Tier 2 (Diagnostic)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500" /> Tier 3 (Supportive)
          </span>
        </div>
      </div>

      {/* Grid of 10 nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {devices.map((device) => {
          const isSelected = device.id === selectedDeviceId;
          const alertsCount = activeAlertsCountByDevice[device.id] || 0;

          const tierBorder =
            device.tier === 1
              ? isSelected
                ? 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-950/20'
                : 'border-rose-500/40 hover:border-rose-400 bg-[#0d162e]/90'
              : device.tier === 2
              ? isSelected
                ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-950/20'
                : 'border-amber-500/40 hover:border-amber-400 bg-[#0d162e]/90'
              : isSelected
              ? 'border-cyan-500 ring-2 ring-cyan-500/30 bg-cyan-950/20'
              : 'border-cyan-500/40 hover:border-cyan-400 bg-[#0d162e]/90';

          const tierBadge =
            device.tier === 1
              ? 'text-rose-400 bg-rose-950/60 border-rose-500/40'
              : device.tier === 2
              ? 'text-amber-400 bg-amber-950/60 border-amber-500/40'
              : 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';

          return (
            <div
              key={device.id}
              onClick={() => onSelectDevice(device.id)}
              className={`cursor-pointer rounded-lg p-2.5 border transition-all text-left relative overflow-hidden group ${tierBorder}`}
            >
              {alertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              )}

              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${tierBadge}`}
                >
                  T{device.tier} • {device.id}
                </span>
                <span className="text-[9px] font-mono text-slate-500">
                  {device.protocol}
                </span>
              </div>

              <div className="font-semibold text-xs text-white truncate group-hover:text-cyan-300 transition">
                {device.name}
              </div>

              <div className="text-[10px] text-slate-400 truncate mb-1">
                {device.type}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[9px] font-mono text-slate-400">
                <span className="truncate">{device.ip}</span>
                {alertsCount > 0 ? (
                  <span className="text-rose-400 font-bold flex items-center gap-0.5">
                    <AlertCircle className="w-2.5 h-2.5" /> {alertsCount}
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> OK
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
