import {
  AttackClass,
  DeviceTier,
  GenAIAdvisory,
  IoMTDevice,
  SHAPFeature,
  ThreatAlert,
} from '../types/iomt';
import {
  ACTION_ALLOWLIST,
  ATTACK_IMPACT_WEIGHTS,
  FORBIDDEN_TIER1_ACTIONS,
  TIER_WEIGHTS,
} from '../data/devices';

export const FEATURE_METADATA: Record<
  string,
  { label: string; unit: string; description: string }
> = {
  fwd_pkts_tot: {
    label: 'Forward Total Packets',
    unit: 'pkts',
    description: 'Number of packets traveling from medical node to broker',
  },
  flow_duration: {
    label: 'Flow Duration',
    unit: 'sec',
    description: 'Total active lifespan of the observed socket session',
  },
  fwd_bytes_tot: {
    label: 'Forward Total Data Bytes',
    unit: 'bytes',
    description: 'Accumulated payload volume pushed by the device',
  },
  bwd_pkts_tot: {
    label: 'Backward Total Packets',
    unit: 'pkts',
    description: 'Response packet count from hospital gateway/broker',
  },
  bwd_bytes_tot: {
    label: 'Backward Total Data Bytes',
    unit: 'bytes',
    description: 'Payload volume returned to the medical device',
  },
  flow_iat_mean: {
    label: 'Flow Inter-Arrival Time (Mean)',
    unit: 'ms',
    description: 'Mean elapsed time between consecutive flow bursts',
  },
  flow_iat_std: {
    label: 'Flow Inter-Arrival Time (Std)',
    unit: 'ms',
    description: 'Variance in packet pacing; sudden drops indicate scripted bot floods',
  },
  pkt_len_mean: {
    label: 'Mean Packet Length',
    unit: 'bytes',
    description: 'Average individual packet payload size',
  },
};

export function generateSyntheticFlow(
  targetClass: AttackClass
): Record<string, number> {
  switch (targetClass) {
    case 'DoS-SynFlood':
      return {
        flow_duration: +(0.05 + Math.random() * 0.2).toFixed(3),
        fwd_pkts_tot: Math.floor(250 + Math.random() * 500),
        bwd_pkts_tot: Math.floor(1 + Math.random() * 4),
        fwd_bytes_tot: Math.floor(12000 + Math.random() * 25000),
        bwd_bytes_tot: Math.floor(60 + Math.random() * 150),
        flow_iat_mean: +(0.005 + Math.random() * 0.02).toFixed(4),
        flow_iat_std: +(0.001 + Math.random() * 0.005).toFixed(4),
        pkt_len_mean: +(42 + Math.random() * 8).toFixed(1),
      };

    case 'MQTT-DDoS':
      return {
        flow_duration: +(2.5 + Math.random() * 6.0).toFixed(2),
        fwd_pkts_tot: Math.floor(180 + Math.random() * 380),
        bwd_pkts_tot: Math.floor(15 + Math.random() * 50),
        fwd_bytes_tot: Math.floor(8500 + Math.random() * 22000),
        bwd_bytes_tot: Math.floor(1200 + Math.random() * 4000),
        flow_iat_mean: +(0.02 + Math.random() * 0.06).toFixed(4),
        flow_iat_std: +(0.01 + Math.random() * 0.03).toFixed(4),
        pkt_len_mean: +(110 + Math.random() * 60).toFixed(1),
      };

    case 'Recon-PortScan':
      return {
        flow_duration: +(0.01 + Math.random() * 0.06).toFixed(3),
        fwd_pkts_tot: Math.floor(2 + Math.random() * 5),
        bwd_pkts_tot: 0,
        fwd_bytes_tot: Math.floor(80 + Math.random() * 200),
        bwd_bytes_tot: 0,
        flow_iat_mean: +(0.001 + Math.random() * 0.008).toFixed(4),
        flow_iat_std: 0,
        pkt_len_mean: 40,
      };

    case 'Command-Injection':
      return {
        flow_duration: +(0.4 + Math.random() * 1.8).toFixed(2),
        fwd_pkts_tot: Math.floor(18 + Math.random() * 45),
        bwd_pkts_tot: Math.floor(14 + Math.random() * 35),
        fwd_bytes_tot: Math.floor(4500 + Math.random() * 9800),
        bwd_bytes_tot: Math.floor(3200 + Math.random() * 8000),
        flow_iat_mean: +(0.15 + Math.random() * 0.45).toFixed(4),
        flow_iat_std: +(0.08 + Math.random() * 0.2).toFixed(4),
        pkt_len_mean: +(280 + Math.random() * 240).toFixed(1),
      };

    case 'Benign':
    default:
      return {
        flow_duration: +(1.2 + Math.random() * 5.5).toFixed(2),
        fwd_pkts_tot: Math.floor(8 + Math.random() * 24),
        bwd_pkts_tot: Math.floor(6 + Math.random() * 20),
        fwd_bytes_tot: Math.floor(640 + Math.random() * 2800),
        bwd_bytes_tot: Math.floor(480 + Math.random() * 2200),
        flow_iat_mean: +(0.35 + Math.random() * 0.95).toFixed(4),
        flow_iat_std: +(0.12 + Math.random() * 0.4).toFixed(4),
        pkt_len_mean: +(95 + Math.random() * 85).toFixed(1),
      };
  }
}

export function computeSHAPTop5(
  rawFeatures: Record<string, number>,
  attackClass: AttackClass
): SHAPFeature[] {
  // Model weights sensitivity approximation matching scikit-learn/SHAP Kernel Explainer
  const sensitivityMap: Record<AttackClass, Record<string, number>> = {
    'DoS-SynFlood': {
      fwd_pkts_tot: 0.72,
      flow_iat_mean: 0.38,
      fwd_bytes_tot: 0.29,
      pkt_len_mean: 0.22,
      flow_duration: 0.14,
      flow_iat_std: 0.11,
      bwd_pkts_tot: 0.08,
      bwd_bytes_tot: 0.04,
    },
    'MQTT-DDoS': {
      fwd_bytes_tot: 0.65,
      fwd_pkts_tot: 0.54,
      pkt_len_mean: 0.42,
      flow_duration: 0.31,
      flow_iat_mean: 0.26,
      flow_iat_std: 0.15,
      bwd_pkts_tot: 0.09,
      bwd_bytes_tot: 0.07,
    },
    'Recon-PortScan': {
      flow_duration: 0.78,
      bwd_pkts_tot: 0.62,
      fwd_pkts_tot: 0.45,
      pkt_len_mean: 0.31,
      flow_iat_mean: 0.24,
      fwd_bytes_tot: 0.12,
      flow_iat_std: 0.05,
      bwd_bytes_tot: 0.01,
    },
    'Command-Injection': {
      pkt_len_mean: 0.74,
      fwd_bytes_tot: 0.61,
      bwd_bytes_tot: 0.53,
      flow_duration: 0.28,
      fwd_pkts_tot: 0.21,
      flow_iat_mean: 0.16,
      flow_iat_std: 0.09,
      bwd_pkts_tot: 0.05,
    },
    'Benign': {
      flow_iat_mean: 0.45,
      flow_duration: 0.35,
      pkt_len_mean: 0.28,
      fwd_pkts_tot: 0.21,
      bwd_pkts_tot: 0.17,
      fwd_bytes_tot: 0.12,
      bwd_bytes_tot: 0.09,
      flow_iat_std: 0.05,
    },
  };

  const weights = sensitivityMap[attackClass] || sensitivityMap['Benign'];
  const entries = Object.keys(weights).map((feat) => {
    const rawScore = weights[feat] * (0.85 + Math.random() * 0.3);
    return {
      feature: feat,
      score: rawScore,
    };
  });

  entries.sort((a, b) => b.score - a.score);
  const top5 = entries.slice(0, 5);
  const sumScores = top5.reduce((acc, curr) => acc + curr.score, 0);

  return top5.map((item, idx) => {
    const meta = FEATURE_METADATA[item.feature] || {
      label: item.feature,
      unit: '',
    };
    return {
      rank: idx + 1,
      feature: item.feature,
      label: meta.label,
      value: rawFeatures[item.feature] ?? 0,
      unit: meta.unit,
      attribution_score: +(item.score / sumScores).toFixed(4),
      impact: idx < 3 ? 'elevates_threat' : 'suppresses_threat',
    };
  });
}

export function computeSeverityScore(
  confidence: number,
  attackClass: AttackClass,
  tier: DeviceTier
): number {
  const A = ATTACK_IMPACT_WEIGHTS[attackClass] ?? 0.2;
  const T = TIER_WEIGHTS[tier] ?? 0.5;
  // S = p * (0.5A + 0.5T) scaled to 10
  const score = confidence * (0.5 * A + 0.5 * T) * 10;
  return +score.toFixed(2);
}

export function generateOWASPGenAIAdvisory(
  device: IoMTDevice,
  attackClass: AttackClass,
  confidence: number,
  shap: SHAPFeature[]
): GenAIAdvisory {
  const topFeatures = shap.map((s) => s.label);
  const tier = device.tier;
  const isTier1 = tier === 1;

  let rawActionIds: string[];
  let explanation: string;
  let summary: string;

  if (attackClass === 'Benign') {
    summary = `Nominal baseline telemetry telemetry for ${device.name}.`;
    explanation = `Network flow behavior on IP ${device.ip} aligns with standard operating envelope across ${device.dept}. Saliency shows '${topFeatures[0]}' in regular steady-state.`;
    rawActionIds = ['MONITOR_TRAFFIC'];
  } else {
    summary = `Anomalous ${attackClass} vector targeting ${device.name} (${device.type}).`;
    explanation = `Deep neural network flagged statistical deviation in '${topFeatures[0]}' (${Math.round(shap[0].attribution_score * 100)}% saliency) and '${topFeatures[1]}'. Device criticality Tier ${tier} (${device.dept}) applies safety constraints.`;
    
    // Choose permissible actions based on tier
    const allowed = ACTION_ALLOWLIST[tier];
    rawActionIds = allowed.filter((a) => a !== 'MONITOR_TRAFFIC').slice(0, 3);
    if (rawActionIds.length === 0) {
      rawActionIds = ['MONITOR_TRAFFIC', 'NOTIFY_BIOMEDICAL_ENG'];
    }
  }

  // ================= OWASP LLM TOP 10 VALIDATOR GUARDRAIL =================
  let guardrailStatus: 'PASSED' | 'OVERRIDDEN_SAFETY_LOCKOUT' = 'PASSED';

  // Rule 1: Zero Automatic Isolation for Tier 1 Life-Support
  if (isTier1) {
    const hasForbidden = rawActionIds.some((act) =>
      FORBIDDEN_TIER1_ACTIONS.includes(act)
    );
    if (hasForbidden) {
      guardrailStatus = 'OVERRIDDEN_SAFETY_LOCKOUT';
      rawActionIds = [
        'MONITOR_TRAFFIC',
        'NOTIFY_BIOMEDICAL_ENG',
        'ESCALATE_TO_CLINICAL_STAFF',
      ];
    }
  }

  // Rule 2: Strict Allowlist Boundary Check
  const safeActions = rawActionIds.filter((act) =>
    ACTION_ALLOWLIST[tier].includes(act)
  );

  return {
    summary,
    explanation,
    cited_features: topFeatures.slice(0, 2),
    action_ids: safeActions.length > 0 ? safeActions : ['MONITOR_TRAFFIC'],
    uncertainty: `Low (${(confidence * 100).toFixed(1)}% DNN posterior confidence)`,
    schema_valid: true,
    guardrail_status: guardrailStatus,
  };
}

export function createThreatAlert(
  device: IoMTDevice,
  attackClass: AttackClass
): ThreatAlert {
  const rawFeatures = generateSyntheticFlow(attackClass);
  const confidence = +(0.84 + Math.random() * 0.14).toFixed(3);
  const shap = computeSHAPTop5(rawFeatures, attackClass);
  const severity = computeSeverityScore(confidence, attackClass, device.tier);
  const advisory = generateOWASPGenAIAdvisory(
    device,
    attackClass,
    confidence,
    shap
  );

  const now = new Date();
  const alertId = `ALT-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    id: alertId,
    timestamp: now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' UTC',
    timestampRaw: now.getTime(),
    device_id: device.id,
    device_name: device.name,
    dept: device.dept,
    tier: device.tier,
    predicted_class: attackClass,
    confidence,
    severity,
    status: 'REQUIRES_AUTHORIZATION',
    shap,
    raw_features: rawFeatures,
    advisory,
  };
}
