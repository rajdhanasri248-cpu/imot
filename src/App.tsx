import React from 'react';
import {
  AttackClass,
  AuditBlock,
  IoMTDevice,
  ThreatAlert,
  VerificationResult,
} from './types/iomt';
import { HospitalReport } from './types/document';
import { INITIAL_DEVICES, FORBIDDEN_TIER1_ACTIONS } from './data/devices';
import { createThreatAlert } from './utils/simulation';
import {
  createAuditBlock,
  verifyAuditChainIntegrity,
} from './utils/crypto';
import { sfx } from './utils/audio';

import { Header } from './components/Header';
import { FleetMatrix } from './components/FleetMatrix';
import { ThreatRadar } from './components/ThreatRadar';
import { SidePreviewDrawer } from './components/SidePreviewDrawer';
import { ApprovalModal } from './components/ApprovalModal';
import { AuditLedgerView } from './components/AuditLedgerView';
import { ForensicsLabView } from './components/ForensicsLabView';
import { OwaspComplianceView } from './components/OwaspComplianceView';
import { HospitalReportsManager } from './components/HospitalReportsManager';
import { TrafficFlowChart, TrafficPoint } from './components/charts/TrafficFlowChart';
import { ThreatDistributionChart } from './components/charts/ThreatDistributionChart';
import { Stethoscope } from 'lucide-react';

const INITIAL_HOSPITAL_REPORTS: HospitalReport[] = [
  {
    id: 'REP-1001',
    title: 'ICU Alaris Smart Infusion Pump SYN Flood Root Cause Analysis',
    fileName: 'Alaris_Pump_DoS_Incident_RCA_2026.pdf',
    fileSize: '412.5 KB',
    fileType: 'PDF',
    category: 'INCIDENT_RCA',
    uploadedAt: '2026-10-24',
    uploadedBy: 'Dr. E. Vance (Lead Biomedical Eng)',
    version: '1.2',
    status: 'ACTIVE',
    sha256Checksum: '9f83c12a45b881329a1b80c3298aef726a8492025170d192c738591024ab7120',
    summary: 'Clinical root cause analysis on Alaris Infusion Pump network port saturation. Confirmed bedside vitals were preserved via mechanical fail-safe. Biomedical engineering firmware patch 4.2 applied.',
    contentSnippet: 'INCIDENT REPORT SUMMARY: On 2026-10-24 14:30 UTC, anomalous SYN traffic surged on device 10.240.12.10. Patient IV flow rate of Norepinephrine (2.5 mL/h) was unaffected due to local pump hardware buffering. Tier 1 safety lockout prevented unilateral isolation.',
  },
  {
    id: 'REP-1002',
    title: 'Annual Clinical Engineering Cybersecurity Audit & Device Risk Matrix',
    fileName: 'Biomedical_Cyber_Inspection_Q4_2026.pdf',
    fileSize: '1.8 MB',
    fileType: 'PDF',
    category: 'BIOMEDICAL_AUDIT',
    uploadedAt: '2026-10-15',
    uploadedBy: 'S. Chen (Clinical OT Security Officer)',
    version: '2.0',
    status: 'ACTIVE',
    sha256Checksum: '4a37b81920c81524317a920381925b7401928374651928374650192837465192',
    summary: 'Comprehensive audit across 10 hospital IoMT assets. Physical device labels, MAC whitelist validation, and zero-day Isolation Forest calibration performed.',
    contentSnippet: 'BIOMEDICAL AUDIT: All 10 virtual devices audited against hospital OT baseline. Tier 1 ventilators and pacemakers verified compliant with fail-safe isolation lockouts.',
  },
  {
    id: 'REP-1003',
    title: 'FDA Section 524B Medical Device Cybersecurity Conformity Report',
    fileName: 'FDA_524B_Cybersecurity_Compliance.json',
    fileSize: '68.2 KB',
    fileType: 'JSON',
    category: 'COMPLIANCE',
    uploadedAt: '2026-09-30',
    uploadedBy: 'Compliance & Regulatory Affairs',
    version: '1.0',
    status: 'ACTIVE',
    sha256Checksum: '8c91823746192837465019283746519283746501928374651928374650192837',
    summary: 'Software Bill of Materials (SBOM) and vulnerability disclosure compliance validation under FDA medical device cybersecurity requirements.',
    contentSnippet: '{"complianceStandard": "FDA-524B", "certifiedAssets": 10, "vulnerabilityDisclosure": "Active", "sbomPresent": true, "hardcodedCredentials": false, "patientSafetyLock": "Enforced"}',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = React.useState<
    'cockpit' | 'forensics' | 'audit' | 'compliance' | 'reports'
  >('cockpit');

  const [devices, setDevices] = React.useState<IoMTDevice[]>(INITIAL_DEVICES);
  const [alerts, setAlerts] = React.useState<ThreatAlert[]>([]);
  const [reports, setReports] = React.useState<HospitalReport[]>(INITIAL_HOSPITAL_REPORTS);

  const [selectedDeviceId, setSelectedDeviceId] = React.useState<string>('DEV-001');
  const [selectedAlertId, setSelectedAlertId] = React.useState<string | null>(null);

  const [filterTier, setFilterTier] = React.useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const [isStreaming, setIsStreaming] = React.useState<boolean>(true);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);
  const [isSimpleMode, setIsSimpleMode] = React.useState<boolean>(false);

  // Streaming Traffic points for live AreaChart
  const [trafficHistory, setTrafficHistory] = React.useState<TrafficPoint[]>(() => {
    const initial: TrafficPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const d = new Date(now - i * 3000);
      initial.push({
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        packetsPerSec: Math.floor(40 + Math.random() * 25),
        throughputKb: Math.floor(180 + Math.random() * 80),
        anomalyLevel: i === 4 ? 120 : 0,
        isSpike: i === 4,
      });
    }
    return initial;
  });

  // Cryptographic Ledger state
  const [auditChain, setAuditChain] = React.useState<AuditBlock[]>([]);
  const [verification, setVerification] = React.useState<VerificationResult>({
    valid: true,
    total_blocks: 0,
    last_hash: '0'.repeat(64),
  });

  // Approval Modal state
  const [isApprovalOpen, setIsApprovalOpen] = React.useState<boolean>(false);
  const [pendingApproval, setPendingApproval] = React.useState<{
    alertId: string;
    actionId: string;
  } | null>(null);

  React.useEffect(() => {
    sfx.muted = isMuted;
  }, [isMuted]);

  // Initialize Genesis block and starting alerts on mount
  React.useEffect(() => {
    async function initSystem() {
      // 1. Create Genesis Block
      const genesis = await createAuditBlock(
        null,
        'CHAIN_INITIALIZATION',
        'SYSTEM_KERNEL',
        'SYS-ROOT',
        'IoMT-Sentinel Cryptographic Audit Chain Initialized with SHA-256 non-repudiation.'
      );

      // 2. Initial Alert on Tier 1 Infusion Pump
      const dev1 = INITIAL_DEVICES[0];
      const alert1 = createThreatAlert(dev1, 'DoS-SynFlood');
      alert1.id = 'ALT-892104';

      const block1 = await createAuditBlock(
        genesis,
        'THREAT_DETECTED',
        'DNN_INFERENCE_ENGINE',
        dev1.id,
        `Threat ${alert1.id}: DoS-SynFlood targeting ${dev1.name} (Tier 1). S=${alert1.severity}. Advisory guardrails engaged.`
      );

      // 3. Initial Alert on Gateway
      const dev10 = INITIAL_DEVICES[9];
      const alert2 = createThreatAlert(dev10, 'MQTT-DDoS');
      alert2.id = 'ALT-892091';

      const block2 = await createAuditBlock(
        block1,
        'THREAT_DETECTED',
        'DNN_INFERENCE_ENGINE',
        dev10.id,
        `Threat ${alert2.id}: MQTT-DDoS flood targeting ${dev10.name} (Tier 3). S=${alert2.severity}.`
      );

      const chain = [genesis, block1, block2];
      setAuditChain(chain);
      setAlerts([alert1, alert2]);
      setSelectedAlertId(alert1.id);
      setSelectedDeviceId(dev1.id);

      const ver = await verifyAuditChainIntegrity(chain);
      setVerification(ver);
    }

    initSystem();
  }, []);

  // Continuous Telemetry Flow ticker for live AreaChart
  React.useEffect(() => {
    if (!isStreaming) return;
    const ticker = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      setTrafficHistory((prev) => {
        const isSpike = Math.random() < 0.15;
        const pkts = isSpike
          ? Math.floor(180 + Math.random() * 200)
          : Math.floor(45 + Math.random() * 30);
        const anomaly = isSpike ? Math.floor(pkts * 0.7) : 0;

        const nextPoint: TrafficPoint = {
          time: timeStr,
          packetsPerSec: pkts,
          throughputKb: Math.floor(pkts * 3.8),
          anomalyLevel: anomaly,
          isSpike,
        };

        return [...prev.slice(1), nextPoint];
      });
    }, 2500);

    return () => clearInterval(ticker);
  }, [isStreaming]);

  // Streaming Threat Ingest
  React.useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(async () => {
      const isAdversarial = Math.random() < 0.35;
      if (!isAdversarial) return;

      const randomDev = devices[Math.floor(Math.random() * devices.length)];
      const attackPool: AttackClass[] = [
        'DoS-SynFlood',
        'MQTT-DDoS',
        'Recon-PortScan',
        'Command-Injection',
      ];
      const randomAttack = attackPool[Math.floor(Math.random() * attackPool.length)];

      const newAlert = createThreatAlert(randomDev, randomAttack);
      sfx.playAlert();

      setAuditChain((prevChain) => {
        const lastBlock = prevChain[prevChain.length - 1];
        createAuditBlock(
          lastBlock,
          'THREAT_INGESTED',
          'DNN_INFERENCE_ENGINE',
          randomDev.id,
          `Alert ${newAlert.id}: ${newAlert.predicted_class} on ${randomDev.name} (Tier ${randomDev.tier}). Severity=${newAlert.severity}.`
        ).then(async (newBlock) => {
          const updated = [...prevChain, newBlock];
          setAuditChain(updated);
          const ver = await verifyAuditChainIntegrity(updated);
          setVerification(ver);
        });
        return prevChain;
      });

      setAlerts((prev) => [newAlert, ...prev.slice(0, 35)]);
    }, 6000);

    return () => clearInterval(interval);
  }, [isStreaming, devices]);

  // Inject attack on-demand
  const handleInjectAttack = async (attackClass: AttackClass) => {
    sfx.playAlert();
    let targetDevice: IoMTDevice;
    if (attackClass === 'DoS-SynFlood' || attackClass === 'Command-Injection') {
      targetDevice = devices.find((d) => d.tier === 1) || devices[0];
    } else if (attackClass === 'Recon-PortScan') {
      targetDevice = devices.find((d) => d.tier === 2) || devices[3];
    } else {
      targetDevice = devices.find((d) => d.tier === 3) || devices[9];
    }

    const newAlert = createThreatAlert(targetDevice, attackClass);

    const lastBlock = auditChain[auditChain.length - 1];
    const newBlock = await createAuditBlock(
      lastBlock,
      'MANUAL_ATTACK_INJECTED',
      'SIMULATION_OPERATOR',
      targetDevice.id,
      `Adversarial scenario injected: ${attackClass} targeting ${targetDevice.name} (${targetDevice.id}). S=${newAlert.severity}.`
    );

    const updatedChain = [...auditChain, newBlock];
    setAuditChain(updatedChain);
    const ver = await verifyAuditChainIntegrity(updatedChain);
    setVerification(ver);

    setAlerts((prev) => [newAlert, ...prev]);
    setSelectedAlertId(newAlert.id);
    setSelectedDeviceId(targetDevice.id);
  };

  // Human Authorization Execution
  const handleConfirmApproval = async (
    alertId: string,
    actionId: string,
    analystName: string,
    notes: string
  ) => {
    const targetAlert = alerts.find((a) => a.id === alertId);
    if (!targetAlert) throw new Error('Target alert could not be found');

    const targetDevice = devices.find((d) => d.id === targetAlert.device_id);
    if (!targetDevice) throw new Error('Target device not located');

    // Hard Guardrail Protection: Tier 1
    if (
      targetDevice.tier === 1 &&
      FORBIDDEN_TIER1_ACTIONS.includes(actionId)
    ) {
      const lastBlock = auditChain[auditChain.length - 1];
      const rejectBlock = await createAuditBlock(
        lastBlock,
        'LOCKOUT_INTERVENTION',
        analystName,
        targetDevice.id,
        `SECURITY GUARDRAIL INTERCEPT: Containment '${actionId}' physically prevented for Tier-1 node ${targetDevice.name}.`
      );
      const updated = [...auditChain, rejectBlock];
      setAuditChain(updated);
      throw new Error(
        'CLINICAL SAFETY REJECTION: Automated isolation on Tier-1 medical equipment is barred by hardware policy.'
      );
    }

    const lastBlock = auditChain[auditChain.length - 1];
    const authBlock = await createAuditBlock(
      lastBlock,
      `ACTION_EXECUTED_${actionId}`,
      analystName,
      targetDevice.id,
      `Human-authorized mitigation '${actionId}' executed for Alert ${alertId}. Clinical notes: "${notes}"`
    );

    const updatedChain = [...auditChain, authBlock];
    setAuditChain(updatedChain);
    const ver = await verifyAuditChainIntegrity(updatedChain);
    setVerification(ver);

    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'EXECUTED',
              resolvedAction: actionId,
            }
          : a
      )
    );

    sfx.playSuccess();
  };

  // ================= DOCUMENT MANAGEMENT HANDLERS =================
  const handleAddReport = async (newReport: HospitalReport) => {
    setReports((prev) => [newReport, ...prev]);

    // Commit to SHA-256 Cryptographic Audit Chain
    const lastBlock = auditChain[auditChain.length - 1];
    const docBlock = await createAuditBlock(
      lastBlock,
      'DOCUMENT_INGESTED',
      newReport.uploadedBy,
      newReport.id,
      `Hospital Report '${newReport.title}' (v${newReport.version}) registered. SHA-256 Checksum: ${newReport.sha256Checksum}`
    );

    const updated = [...auditChain, docBlock];
    setAuditChain(updated);
    const ver = await verifyAuditChainIntegrity(updated);
    setVerification(ver);
  };

  const handleDeleteReport = async (reportId: string, title: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    sfx.playClick();

    // Commit deletion to SHA-256 Cryptographic Audit Chain
    const lastBlock = auditChain[auditChain.length - 1];
    const deleteBlock = await createAuditBlock(
      lastBlock,
      'DOCUMENT_PURGED',
      'BIOMEDICAL_ADMIN',
      reportId,
      `Hospital Report '${title}' (${reportId}) removed from active repository. Deletion recorded in audit trail.`
    );

    const updated = [...auditChain, deleteBlock];
    setAuditChain(updated);
    const ver = await verifyAuditChainIntegrity(updated);
    setVerification(ver);
  };

  const handleUpgradeReport = async (
    reportId: string,
    updatedData: Partial<HospitalReport>
  ) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, ...updatedData } : r))
    );

    // Commit upgrade to SHA-256 Cryptographic Audit Chain
    const lastBlock = auditChain[auditChain.length - 1];
    const upgradeBlock = await createAuditBlock(
      lastBlock,
      'DOCUMENT_UPGRADED',
      updatedData.uploadedBy || 'BIOMEDICAL_ADMIN',
      reportId,
      `Report ${reportId} upgraded to v${updatedData.version || '2.0'}. New SHA-256: ${updatedData.sha256Checksum}`
    );

    const updated = [...auditChain, upgradeBlock];
    setAuditChain(updated);
    const ver = await verifyAuditChainIntegrity(updated);
    setVerification(ver);
  };

  const handleVerifyAudit = async () => {
    sfx.playClick();
    const ver = await verifyAuditChainIntegrity(auditChain);
    setVerification(ver);
  };

  const currentDevice =
    devices.find((d) => d.id === selectedDeviceId) || devices[0];
  const currentAlert =
    alerts.find((a) => a.id === selectedAlertId) ||
    alerts.find((a) => a.device_id === selectedDeviceId) ||
    null;

  const activeAlertsCountByDevice = React.useMemo(() => {
    const counts: Record<string, number> = {};
    alerts.forEach((a) => {
      if (a.status !== 'EXECUTED') {
        counts[a.device_id] = (counts[a.device_id] || 0) + 1;
      }
    });
    return counts;
  }, [alerts]);

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top SOC Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onInjectAttack={handleInjectAttack}
        onVerifyAudit={handleVerifyAudit}
        chainValid={verification.valid}
        threatCount={alerts.filter((a) => a.status !== 'EXECUTED').length}
        reportCount={reports.length}
        isSimpleMode={isSimpleMode}
        setIsSimpleMode={setIsSimpleMode}
      />

      {/* User-Friendly Mode Banner */}
      {isSimpleMode && (
        <div className="bg-purple-950/40 border-b border-purple-500/40 px-4 py-2 text-xs text-purple-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-purple-400" />
            <span>
              <strong>Clinical Staff Mode:</strong> Jargon is translated into plain-English medical safety instructions. Tier-1 life-critical devices are highlighted in red.
            </span>
          </div>
          <button
            onClick={() => setIsSimpleMode(false)}
            className="text-[11px] font-mono text-purple-300 hover:text-white underline"
          >
            Switch back to Cyber SOC Mode
          </button>
        </div>
      )}

      {/* Main Dynamic Viewport */}
      <main className="flex-1 p-3.5 lg:p-5 max-w-[1780px] w-full mx-auto space-y-5">
        {activeTab === 'cockpit' && (
          <>
            {/* Top Real-Time Charts Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <TrafficFlowChart data={trafficHistory} isStreaming={isStreaming} />
              </div>
              <div className="lg:col-span-1">
                <ThreatDistributionChart alerts={alerts} />
              </div>
            </div>

            {/* Main Dual-Pane Cockpit: Left Fleet & Threat Radar + Right Sticky Side Preview */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN: Fleet Matrix & Live Threat Radar Feed (7 Cols) */}
              <div className="xl:col-span-7 space-y-5">
                <FleetMatrix
                  devices={devices}
                  selectedDeviceId={selectedDeviceId}
                  onSelectDevice={(id) => {
                    sfx.playClick();
                    setSelectedDeviceId(id);
                    const relatedAlert = alerts.find((a) => a.device_id === id);
                    if (relatedAlert) setSelectedAlertId(relatedAlert.id);
                  }}
                  activeAlertsCountByDevice={activeAlertsCountByDevice}
                />

                <ThreatRadar
                  alerts={alerts}
                  selectedAlertId={selectedAlertId}
                  onSelectAlert={(id) => {
                    sfx.playClick();
                    setSelectedAlertId(id);
                    const al = alerts.find((a) => a.id === id);
                    if (al) setSelectedDeviceId(al.device_id);
                  }}
                  filterTier={filterTier}
                  setFilterTier={setFilterTier}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>

              {/* RIGHT COLUMN: Persistent Sticky Side-Preview Drawer (5 Cols) */}
              <div className="xl:col-span-5 sticky top-24">
                <SidePreviewDrawer
                  device={currentDevice}
                  alert={currentAlert}
                  onOpenApproval={(alertId, actionId) => {
                    sfx.playClick();
                    setPendingApproval({ alertId, actionId });
                    setIsApprovalOpen(true);
                  }}
                  isSimpleMode={isSimpleMode}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <HospitalReportsManager
            reports={reports}
            onAddReport={handleAddReport}
            onDeleteReport={handleDeleteReport}
            onUpgradeReport={handleUpgradeReport}
            alerts={alerts}
            devices={devices}
            auditChain={auditChain}
          />
        )}

        {activeTab === 'forensics' && (
          <ForensicsLabView
            alerts={alerts}
            selectedAlert={currentAlert}
            onSelectAlert={(id) => {
              sfx.playClick();
              setSelectedAlertId(id);
              const al = alerts.find((a) => a.id === id);
              if (al) setSelectedDeviceId(al.device_id);
            }}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLedgerView
            chain={auditChain}
            verification={verification}
            onVerify={handleVerifyAudit}
          />
        )}

        {activeTab === 'compliance' && <OwaspComplianceView />}
      </main>

      {/* Human Authorization Modal */}
      {isApprovalOpen && pendingApproval && (
        <ApprovalModal
          isOpen={isApprovalOpen}
          onClose={() => {
            setIsApprovalOpen(false);
            setPendingApproval(null);
          }}
          alert={alerts.find((a) => a.id === pendingApproval.alertId) || null}
          device={
            devices.find(
              (d) =>
                d.id ===
                alerts.find((a) => a.id === pendingApproval.alertId)?.device_id
            ) || null
          }
          actionId={pendingApproval.actionId}
          onConfirm={handleConfirmApproval}
        />
      )}
    </div>
  );
}
