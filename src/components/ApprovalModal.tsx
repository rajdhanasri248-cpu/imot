import React from 'react';
import { ThreatAlert, IoMTDevice } from '../types/iomt';
import { FORBIDDEN_TIER1_ACTIONS } from '../data/devices';
import {
  ShieldAlert,
  AlertOctagon,
  Check,
  X,
  FileSignature,
  Lock,
} from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: ThreatAlert | null;
  device: IoMTDevice | null;
  actionId: string;
  onConfirm: (
    alertId: string,
    actionId: string,
    analystName: string,
    notes: string
  ) => Promise<void>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  alert,
  device,
  actionId,
  onConfirm,
}) => {
  const [analystName, setAnalystName] = React.useState(
    'Dr. E. Vance, Lead Clinical Biomedical Eng'
  );
  const [notes, setNotes] = React.useState(
    'Bedside verification complete. Patient vital telemetry verified stable. Proceeding with safe advisory mitigation.'
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  if (!isOpen || !alert || !device) return null;

  const isTier1 = device.tier === 1;
  const isForbiddenForTier1 =
    isTier1 && FORBIDDEN_TIER1_ACTIONS.includes(actionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Strict Clinical Guardrail Check
    if (isForbiddenForTier1) {
      setErrorMessage(
        'CRITICAL SAFETY LOCKOUT: Automated or manual isolation of Tier 1 Life-Support systems is strictly forbidden by clinical hospital protocol.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(alert.id, actionId, analystName, notes);
      setIsSubmitting(false);
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : 'Unknown execution failure');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0b1329] border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative glow-cyan animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <FileSignature className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Human-in-the-Loop Clinical Authorization
            </h3>
            <p className="text-xs text-slate-400">
              Cryptographically signed containment protocol
            </p>
          </div>
        </div>

        {/* Target Asset Summary */}
        <div className="bg-[#091024] border border-slate-800 rounded-xl p-3.5 mb-4 text-xs space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>Target IoMT Node:</span>
            <span className="font-mono font-bold text-white">{device.name}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Criticality Classification:</span>
            <span
              className={`font-mono font-bold ${
                isTier1
                  ? 'text-rose-400'
                  : device.tier === 2
                  ? 'text-amber-400'
                  : 'text-cyan-400'
              }`}
            >
              Tier {device.tier} ({device.dept})
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Proposed Mitigation Action:</span>
            <span className="font-mono font-bold text-cyan-300">
              {actionId}
            </span>
          </div>
        </div>

        {/* Tier-1 Safety Lockout Warning */}
        {isForbiddenForTier1 && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500 text-rose-200 text-xs flex items-start space-x-2.5">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <b className="font-bold text-rose-300 block">
                SAFETY LOCKOUT VIOLATION
              </b>
              Action <code className="font-mono">{actionId}</code> disrupts network telemetry for a Tier-1 life-critical medical node. This action cannot be executed.
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/80 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Authorizing Biomedical Engineer / SOC Lead
            </label>
            <input
              type="text"
              required
              value={analystName}
              onChange={(e) => setAnalystName(e.target.value)}
              className="w-full bg-[#070d1e] border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Clinical Override Justification & Bedside Notes
            </label>
            <textarea
              required
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#070d1e] border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isForbiddenForTier1}
              className={`px-5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shadow-lg ${
                isForbiddenForTier1
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? 'Computing Hash & Signing...'
                  : 'Authorize & Seal in SHA-256 Ledger'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
