export type DeviceTier = 1 | 2 | 3;

export interface IoMTDevice {
  id: string;
  name: string;
  type: string;
  tier: DeviceTier;
  ip: string;
  mac: string;
  dept: string;
  status: 'ONLINE' | 'SUSPICIOUS' | 'UNDER_ATTACK' | 'MONITORED';
  baselineVitals?: string;
  protocol: 'MQTT' | 'CoAP' | 'DICOM' | 'HL7' | 'Modbus';
}

export type AttackClass =
  | 'Benign'
  | 'DoS-SynFlood'
  | 'MQTT-DDoS'
  | 'Recon-PortScan'
  | 'Command-Injection';

export interface SHAPFeature {
  rank: number;
  feature: string;
  label: string;
  value: number;
  unit: string;
  attribution_score: number; // 0 to 1
  impact: 'elevates_threat' | 'suppresses_threat';
}

export interface GenAIAdvisory {
  summary: string;
  explanation: string;
  cited_features: string[];
  action_ids: string[];
  uncertainty: string;
  schema_valid: boolean;
  guardrail_status: 'PASSED' | 'OVERRIDDEN_SAFETY_LOCKOUT';
}

export interface ThreatAlert {
  id: string;
  timestamp: string;
  timestampRaw: number;
  device_id: string;
  device_name: string;
  dept: string;
  tier: DeviceTier;
  predicted_class: AttackClass;
  confidence: number; // 0 to 1
  severity: number; // 0 to 10
  status: 'REQUIRES_AUTHORIZATION' | 'EXECUTED' | 'DISMISSED';
  resolvedAction?: string;
  shap: SHAPFeature[];
  raw_features: Record<string, number>;
  advisory: GenAIAdvisory;
}

export interface AuditBlock {
  index: number;
  timestamp: string;
  action: string;
  actor: string;
  device_id: string;
  details: string;
  prev_hash: string;
  hash: string;
}

export interface VerificationResult {
  valid: boolean;
  total_blocks: number;
  corrupt_index?: number;
  reason?: string;
  last_hash: string;
}
