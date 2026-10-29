import React from 'react';
import { AuditBlock, VerificationResult } from '../types/iomt';
import {
  Lock,
  ShieldCheck,
  AlertTriangle,
  Download,
  Fingerprint,
  RefreshCw,
  Hash,
} from 'lucide-react';

interface AuditLedgerViewProps {
  chain: AuditBlock[];
  verification: VerificationResult;
  onVerify: () => void;
}

export const AuditLedgerView: React.FC<AuditLedgerViewProps> = ({
  chain,
  verification,
  onVerify,
}) => {
  const [copiedHash, setCopiedHash] = React.useState<string | null>(null);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(chain, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `iomt_sentinel_audit_chain_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Ledger Overview Card */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              SHA-256 Tamper-Evident Cryptographic Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Mathematical non-repudiation. Every threat detection, GenAI guardrail validation, and human containment authorization is linked by recursive SHA-256 hash chaining: <code className="text-cyan-300 font-mono">hash = SHA256(prev_hash + entry)</code>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onVerify}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verify Full Ledger</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Chain</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
          verification.valid
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500 text-rose-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          {verification.valid ? (
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
          )}
          <div>
            <div className="font-bold uppercase tracking-wider text-sm font-mono">
              {verification.valid
                ? `INTEGRITY VERIFIED: All ${verification.total_blocks} Blocks Untampered`
                : `CRYPTOGRAPHIC DISCONTINUITY AT BLOCK #${verification.corrupt_index}`}
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 font-mono">
              Latest Sealed Hash: {verification.last_hash}
            </p>
          </div>
        </div>
      </div>

      {/* Chain Blocks List */}
      <div className="space-y-3 font-mono text-xs">
        {chain.map((block) => (
          <div
            key={block.index}
            className="bg-[#0b1329] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition shadow-lg group"
          >
            <div className="flex flex-wrap justify-between items-center text-slate-400 mb-2 gap-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                  BLOCK #{block.index}
                </span>
                <span className="font-bold text-white text-[13px]">
                  {block.action}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                {block.timestamp}
              </span>
            </div>

            <div className="text-slate-300 text-[11px] mb-3 font-sans bg-[#070d1e] p-2.5 rounded-lg border border-slate-800/80">
              {block.details}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-400 border-t border-slate-800/60 pt-2.5">
              <div className="truncate">
                <span className="text-slate-500">ACTOR: </span>
                <span className="text-slate-300">{block.actor}</span>
              </div>
              <div className="truncate">
                <span className="text-slate-500">TARGET: </span>
                <span className="text-cyan-400">{block.device_id}</span>
              </div>
              <div className="truncate cursor-pointer" onClick={() => handleCopy(block.prev_hash)}>
                <span className="text-slate-500">PREV HASH: </span>
                <span className="text-slate-400 hover:text-white transition">
                  {block.prev_hash}
                </span>
              </div>
              <div className="truncate cursor-pointer" onClick={() => handleCopy(block.hash)}>
                <span className="text-slate-500">BLOCK HASH: </span>
                <span className="text-cyan-300 font-bold hover:text-cyan-200 transition">
                  {block.hash}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
