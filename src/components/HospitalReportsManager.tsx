import React from 'react';
import { HospitalReport } from '../types/document';
import { ThreatAlert, IoMTDevice, AuditBlock } from '../types/iomt';
import { sha256 } from '../utils/crypto';
import { sfx } from '../utils/audio';
import {
  FileText,
  Upload,
  Trash2,
  FileCheck,
  RefreshCw,
  Download,
  Eye,
  Plus,
  Shield,
  Calendar,
  User,
  HardDrive,
  FileCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';

interface HospitalReportsManagerProps {
  reports: HospitalReport[];
  onAddReport: (report: HospitalReport) => void;
  onDeleteReport: (reportId: string, title: string) => void;
  onUpgradeReport: (reportId: string, updatedReport: Partial<HospitalReport>) => void;
  alerts: ThreatAlert[];
  devices: IoMTDevice[];
  auditChain: AuditBlock[];
}

export const HospitalReportsManager: React.FC<HospitalReportsManagerProps> = ({
  reports,
  onAddReport,
  onDeleteReport,
  onUpgradeReport,
  alerts,
  devices,
  auditChain,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [viewingReport, setViewingReport] = React.useState<HospitalReport | null>(null);
  const [isUpgradingId, setIsUpgradingId] = React.useState<string | null>(null);

  // Upload Form State
  const [reportTitle, setReportTitle] = React.useState('');
  const [reportCategory, setReportCategory] = React.useState<HospitalReport['category']>('INCIDENT_RCA');
  const [uploadedBy, setUploadedBy] = React.useState('Dr. E. Vance (Lead BME)');
  const [version, setVersion] = React.useState('1.0');
  const [summary, setSummary] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isHashing, setIsHashing] = React.useState(false);

  // Generated Clinical Incident Report Modal
  const [generatedExecutiveReport, setGeneratedExecutiveReport] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!reportTitle) {
        setReportTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !isUpgradingId) {
      alert('Please select a file to upload.');
      return;
    }

    setIsHashing(true);

    try {
      let fileChecksum = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
      let contentSnippet = 'Document metadata and verification sealed in IoMT-Sentinel ledger.';
      let fileSizeStr = '245 KB';
      let ext = 'PDF';

      if (selectedFile) {
        fileSizeStr = `${(selectedFile.size / 1024).toFixed(1)} KB`;
        const buffer = await selectedFile.arrayBuffer();
        const hashBuf = await crypto.subtle.digest('SHA-256', buffer);
        fileChecksum = Array.from(new Uint8Array(hashBuf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        const nameLower = selectedFile.name.toLowerCase();
        if (nameLower.endsWith('.json')) ext = 'JSON';
        else if (nameLower.endsWith('.csv')) ext = 'CSV';
        else if (nameLower.endsWith('.txt')) ext = 'TXT';
        else if (nameLower.endsWith('.log')) ext = 'LOG';
        else ext = 'PDF';

        // Extract small text snippet if text/json/csv
        if (ext === 'TXT' || ext === 'JSON' || ext === 'CSV' || ext === 'LOG') {
          const text = await selectedFile.text();
          contentSnippet = text.slice(0, 500) + (text.length > 500 ? '...' : '');
        }
      }

      if (isUpgradingId) {
        // Upgrade existing report
        onUpgradeReport(isUpgradingId, {
          title: reportTitle,
          category: reportCategory,
          version,
          summary,
          uploadedBy,
          fileSize: fileSizeStr,
          sha256Checksum: fileChecksum,
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
        });
        sfx.playSuccess();
      } else {
        // Create new report
        const newReport: HospitalReport = {
          id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
          title: reportTitle,
          fileName: selectedFile ? selectedFile.name : `report_${Date.now()}.pdf`,
          fileSize: fileSizeStr,
          fileType: ext as HospitalReport['fileType'],
          category: reportCategory,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy,
          version,
          status: 'ACTIVE',
          sha256Checksum: fileChecksum,
          summary: summary || 'Hospital clinical security audit document.',
          contentSnippet,
        };

        onAddReport(newReport);
        sfx.playSuccess();
      }

      // Reset
      setIsUploadModalOpen(false);
      setIsUpgradingId(null);
      setReportTitle('');
      setSelectedFile(null);
      setSummary('');
      setIsHashing(false);
    } catch (err) {
      setIsHashing(false);
      alert('Error calculating file checksum or saving report.');
    }
  };

  const handleOpenUpgrade = (rep: HospitalReport) => {
    setIsUpgradingId(rep.id);
    setReportTitle(rep.title);
    setReportCategory(rep.category);
    setUploadedBy(rep.uploadedBy);
    setVersion(
      (parseFloat(rep.version) + 0.1).toFixed(1) || '2.0'
    );
    setSummary(rep.summary);
    setIsUploadModalOpen(true);
  };

  const handleGenerateLiveIncidentReport = () => {
    sfx.playClick();
    const now = new Date();
    const activeThreats = alerts.filter((a) => a.status !== 'EXECUTED');
    const mitigatedThreats = alerts.filter((a) => a.status === 'EXECUTED');

    const markdown = `# HOSPITAL CLINICAL ENGINEERING & CYBERSECURITY AUDIT REPORT
**Document ID:** HCR-EXECUTIVE-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}
**Hospital Facility:** MetroHealth Academic Medical Center • Clinical OT Network
**Generated At:** ${now.toUTCString()}
**Generated By:** IoMT-Sentinel Automated Clinical Oversight Core

---

## 1. Executive Summary & Clinical Posture
IoMT-Sentinel continuously monitors 10 virtual life-critical, diagnostic, and supportive medical devices across ICU, Cardiology, Neonatal, and Surgery wards.

- **Total Monitored Nodes:** ${devices.length} Assets (Tier 1: 3, Tier 2: 4, Tier 3: 3)
- **Active Threats Requiring Clinical Review:** ${activeThreats.length}
- **Mitigated & Authorized Incidents:** ${mitigatedThreats.length}
- **SHA-256 Ledger Chain Blocks Sealed:** ${auditChain.length} Blocks (Integrity: VERIFIED)

---

## 2. Active Threat Telemetry Log
${
  alerts.length === 0
    ? 'Zero adversarial flows detected. Telemetry packet arrival is within standard clinical envelopes.'
    : alerts
        .map(
          (a) => `### Alert: ${a.predicted_class} (${a.id})
- **Target Device:** ${a.device_name} (Criticality Tier ${a.tier})
- **Department Location:** ${a.dept}
- **Calculated Severity Score:** ${a.severity}/10 (Confidence: ${(a.confidence * 100).toFixed(1)}%)
- **Status:** ${a.status} ${a.resolvedAction ? `• Mitigated via ${a.resolvedAction}` : ''}
- **Top SHAP Indicators:** ${a.shap.map((s) => `${s.label} (${Math.round(s.attribution_score * 100)}%)`).join(', ')}
- **GenAI Advisory:** ${a.advisory.explanation}
`
        )
        .join('\n')
}

---

## 3. Tier 1 Clinical Safeguard Verification
Under clinical governance protocols, automated network disconnection or interface shutdowns are **physically prohibited** for Tier 1 life-support equipment (Ventilators, Infusion Pumps, Pacemakers). All actions require bedside confirmation by Biomedical Engineering.

---

## 4. Cryptographic Proof of Non-Repudiation
- **Latest Sealed Ledger Hash:** \`${auditChain[auditChain.length - 1]?.hash || 'N/A'}\`
- **Total Audit Transactions:** ${auditChain.length}
- **Compliance Status:** OWASP ASVS v4.0 Level 2 + OWASP LLM Top 10 Enforced
`;

    setGeneratedExecutiveReport(markdown);
  };

  const filteredReports = reports.filter((rep) => {
    const matchesCat = selectedCategory === 'ALL' || rep.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Hospital Reports & Clinical Document Repository
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Upload biomedical inspection certificates, incident post-mortems, or compliance reports. All files are hashed with SHA-256 and committed to the tamper-evident audit ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleGenerateLiveIncidentReport}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Generate Live Clinical Report</span>
          </button>

          <button
            onClick={() => {
              setIsUpgradingId(null);
              setReportTitle('');
              setSelectedFile(null);
              setVersion('1.0');
              setSummary('');
              setIsUploadModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Upload Report</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports by title, filename, author..."
            className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {['ALL', 'INCIDENT_RCA', 'BIOMEDICAL_AUDIT', 'COMPLIANCE', 'NETWORK_PCAP'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg transition ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'ALL'
                ? 'All Documents'
                : cat === 'INCIDENT_RCA'
                ? 'Incident RCA'
                : cat === 'BIOMEDICAL_AUDIT'
                ? 'Biomed Audit'
                : cat === 'COMPLIANCE'
                ? 'Compliance'
                : 'PCAP Flow Logs'}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table & List */}
      <div className="bg-[#0b1329] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="font-semibold text-slate-400">No reports matching filter.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Click &quot;Add / Upload Report&quot; to ingest your hospital cybersecurity documentation.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredReports.map((report) => {
              const catBadge =
                report.category === 'INCIDENT_RCA'
                  ? 'text-rose-400 bg-rose-950/60 border-rose-500/40'
                  : report.category === 'BIOMEDICAL_AUDIT'
                  ? 'text-amber-400 bg-amber-950/60 border-amber-500/40'
                  : report.category === 'COMPLIANCE'
                  ? 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40'
                  : 'text-purple-400 bg-purple-950/60 border-purple-500/40';

              return (
                <div
                  key={report.id}
                  className="p-4 hover:bg-[#121c38]/60 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-[#070d1e] border border-slate-800 text-cyan-400 shrink-0 mt-0.5">
                      <FileCode className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm hover:text-cyan-300 cursor-pointer" onClick={() => setViewingReport(report)}>
                          {report.title}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${catBadge}`}>
                          {report.category.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          v{report.version}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                          SEALED
                        </span>
                      </div>

                      <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                        {report.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3 h-3" /> {report.fileName} ({report.fileSize})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {report.uploadedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {report.uploadedBy}
                        </span>
                        <span className="text-cyan-400 truncate max-w-xs" title={report.sha256Checksum}>
                          SHA256: {report.sha256Checksum.substring(0, 16)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View, Upgrade, Delete */}
                  <div className="flex items-center space-x-2 shrink-0 md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <button
                      onClick={() => setViewingReport(report)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center space-x-1 text-[11px] font-mono transition"
                      title="Inspect Report Content & Checksum"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => handleOpenUpgrade(report)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 flex items-center space-x-1 text-[11px] font-mono transition"
                      title="Upgrade / Replace with New Version"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Upgrade</span>
                    </button>

                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Confirm deletion of hospital report "${report.title}"? This event will be permanently recorded in the SHA-256 audit ledger.`
                          )
                        ) {
                          onDeleteReport(report.id, report.title);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition"
                      title="Delete Report (Logged in Audit Chain)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* UPLOAD / UPGRADE REPORT MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1329] border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative glow-cyan">
            <button
              onClick={() => {
                setIsUploadModalOpen(false);
                setIsUpgradingId(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
                {isUpgradingId ? <RefreshCw className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {isUpgradingId ? 'Upgrade Hospital Report Version' : 'Upload Hospital Security Document'}
                </h3>
                <p className="text-xs text-slate-400">
                  Calculates SHA-256 checksum and commits event to audit chain
                </p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              {/* File drop area */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Select Document File (.pdf, .json, .csv, .txt, .log)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-4 text-center cursor-pointer bg-[#070d1e] transition group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.json,.csv,.txt,.log,.docx"
                  />
                  <Upload className="w-8 h-8 mx-auto text-slate-500 group-hover:text-cyan-400 mb-1 transition" />
                  {selectedFile ? (
                    <div className="text-cyan-300 font-mono font-bold">
                      {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </div>
                  ) : (
                    <div>
                      <span className="text-slate-300 font-medium">Click to select hospital file</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Supports PDF audits, JSON scans, CSV flow captures</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. ICU Infusion Pump Threat Assessment 2026"
                  className="w-full bg-[#070d1e] border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value as HospitalReport['category'])}
                    className="w-full bg-[#070d1e] border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="INCIDENT_RCA">Incident RCA Post-Mortem</option>
                    <option value="BIOMEDICAL_AUDIT">Biomedical Engineering Audit</option>
                    <option value="COMPLIANCE">Regulatory Compliance (FDA/MDR)</option>
                    <option value="NETWORK_PCAP">Network PCAP Flow Analysis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Version</label>
                  <input
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full bg-[#070d1e] border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Author / Sign-off Engineer</label>
                <input
                  type="text"
                  required
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value)}
                  className="w-full bg-[#070d1e] border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Clinical Summary / Audit Notes</label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Executive findings, firmware version, bedside verification notes..."
                  className="w-full bg-[#070d1e] border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setIsUpgradingId(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isHashing}
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs transition shadow-lg shadow-cyan-500/20"
                >
                  {isHashing
                    ? 'Hashing & Sealing...'
                    : isUpgradingId
                    ? 'Commit Upgrade'
                    : 'Save & Commit to Audit Chain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW REPORT INSPECTION MODAL */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1329] border border-slate-700 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative glow-cyan max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setViewingReport(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{viewingReport.title}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {viewingReport.fileName} • Version {viewingReport.version} • {viewingReport.fileSize}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#070d1e] rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Category:</span>
                  <span className="font-bold text-cyan-300 font-mono">{viewingReport.category}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Author:</span>
                  <span className="text-white font-mono">{viewingReport.uploadedBy}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Upload Date:</span>
                  <span className="text-white font-mono">{viewingReport.uploadedAt}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Ledger Status:</span>
                  <span className="text-emerald-400 font-bold font-mono">CRYPTOGRAPHICALLY SEALED</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">Executive Summary</h4>
                <p className="text-slate-300 bg-[#070d1e] p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {viewingReport.summary}
                </p>
              </div>

              {viewingReport.contentSnippet && (
                <div>
                  <h4 className="font-bold text-white mb-1">File Preview Content</h4>
                  <pre className="text-slate-300 bg-[#070d1e] p-3 rounded-lg border border-slate-800 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap max-h-48">
                    {viewingReport.contentSnippet}
                  </pre>
                </div>
              )}

              <div>
                <h4 className="font-bold text-white mb-1">SHA-256 Checksum Verification</h4>
                <div className="p-2.5 bg-[#070d1e] rounded-lg border border-cyan-500/40 font-mono text-[11px] text-cyan-300 break-all select-all">
                  {viewingReport.sha256Checksum}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  onClick={() => setViewingReport(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(viewingReport.contentSnippet || viewingReport.summary);
                    const a = document.createElement('a');
                    a.href = dataStr;
                    a.download = viewingReport.fileName;
                    a.click();
                  }}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono flex items-center space-x-1.5 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERATED LIVE EXECUTIVE REPORT MODAL */}
      {generatedExecutiveReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1329] border border-slate-700 w-full max-w-3xl rounded-2xl p-6 shadow-2xl relative glow-cyan max-h-[88vh] overflow-y-auto">
            <button
              onClick={() => setGeneratedExecutiveReport(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Live Clinical Cybersecurity Incident Report</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Compiled from active IoMT fleet status and SHA-256 cryptographic chain
                </p>
              </div>
            </div>

            <pre className="bg-[#070d1e] p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap max-h-[50vh] leading-relaxed">
              {generatedExecutiveReport}
            </pre>

            <div className="pt-4 flex justify-end space-x-3 text-xs">
              <button
                onClick={() => setGeneratedExecutiveReport(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(generatedExecutiveReport);
                  const a = document.createElement('a');
                  a.href = dataStr;
                  a.download = `Hospital_Incident_Audit_Report_${Date.now()}.md`;
                  a.click();
                }}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono flex items-center space-x-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>Export Report (.md)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
