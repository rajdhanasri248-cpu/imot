export interface HospitalReport {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileType: 'PDF' | 'JSON' | 'CSV' | 'TXT' | 'LOG';
  category: 'INCIDENT_RCA' | 'BIOMEDICAL_AUDIT' | 'COMPLIANCE' | 'NETWORK_PCAP';
  uploadedAt: string;
  uploadedBy: string;
  version: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'SUPERSEDED';
  sha256Checksum: string;
  summary: string;
  relatedDeviceId?: string;
  contentSnippet?: string;
}
