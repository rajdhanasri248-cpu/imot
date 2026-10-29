import { AuditBlock, VerificationResult } from '../types/iomt';

export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function computeBlockCanonical(
  prevHash: string,
  index: number,
  timestamp: string,
  action: string,
  actor: string,
  deviceId: string,
  details: string
): string {
  return `${prevHash}|${index}|${timestamp}|${action}|${actor}|${deviceId}|${details}`;
}

export async function createAuditBlock(
  prevBlock: AuditBlock | null,
  action: string,
  actor: string,
  deviceId: string,
  details: string
): Promise<AuditBlock> {
  const index = prevBlock ? prevBlock.index + 1 : 0;
  const prevHash = prevBlock ? prevBlock.hash : '0'.repeat(64);
  const timestamp = new Date().toISOString();

  const canonical = computeBlockCanonical(
    prevHash,
    index,
    timestamp,
    action,
    actor,
    deviceId,
    details
  );
  const hash = await sha256(canonical);

  return {
    index,
    timestamp,
    action,
    actor,
    device_id: deviceId,
    details,
    prev_hash: prevHash,
    hash,
  };
}

export async function verifyAuditChainIntegrity(
  chain: AuditBlock[]
): Promise<VerificationResult> {
  if (chain.length === 0) {
    return { valid: true, total_blocks: 0, last_hash: '0'.repeat(64) };
  }

  // Genesis block check
  const genesis = chain[0];
  const genesisExpected = await sha256(
    computeBlockCanonical(
      '0'.repeat(64),
      0,
      genesis.timestamp,
      genesis.action,
      genesis.actor,
      genesis.device_id,
      genesis.details
    )
  );

  if (genesis.prev_hash !== '0'.repeat(64) || genesis.hash !== genesisExpected) {
    return {
      valid: false,
      total_blocks: chain.length,
      corrupt_index: 0,
      reason: 'Genesis block payload altered or previous pointer corrupt',
      last_hash: chain[chain.length - 1].hash,
    };
  }

  // Chain link check
  for (let i = 1; i < chain.length; i++) {
    const curr = chain[i];
    const prev = chain[i - 1];

    if (curr.prev_hash !== prev.hash) {
      return {
        valid: false,
        total_blocks: chain.length,
        corrupt_index: i,
        reason: `Broken cryptographic link between Block #${prev.index} and Block #${curr.index}`,
        last_hash: chain[chain.length - 1].hash,
      };
    }

    const recomputed = await sha256(
      computeBlockCanonical(
        curr.prev_hash,
        curr.index,
        curr.timestamp,
        curr.action,
        curr.actor,
        curr.device_id,
        curr.details
      )
    );

    if (recomputed !== curr.hash) {
      return {
        valid: false,
        total_blocks: chain.length,
        corrupt_index: i,
        reason: `Block #${curr.index} payload modified after sealing (hash mismatch)`,
        last_hash: chain[chain.length - 1].hash,
      };
    }
  }

  return {
    valid: true,
    total_blocks: chain.length,
    last_hash: chain[chain.length - 1].hash,
  };
}
