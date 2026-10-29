import { AuditEvent } from '../types';

// Standard pure JS SHA-256 implementation for 100% deterministic portability across Node.js & Browser
function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: { [key: number]: boolean } = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  hash = hash.slice(0, 8);

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return ''; // non-ascii check
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words.push((asciiBitLength / maxWord) | 0);
  words.push(asciiBitLength | 0);

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] =
        i < 16
          ? w[i]
          : ((w[i - 16] + s0 + w[i - 7] + s1) | 0);

      const s1_maj = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const t2 = (s1_maj + maj) | 0;
      const s1_ch = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const t1 = (hash[7] + s1_ch + ch + k[i] + w[i]) | 0;

      hash = [(t1 + t2) | 0].concat(hash);
      hash[4] = (hash[4] + t1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        const b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }
  return result;
}

export function computeSha256(input: string): string {
  return sha256(input);
}

// Canonical HMAC-SHA256 simulation for privacy-preserving pseudonymous tokens
const DEMO_HMAC_PEPPER = 'AICTE_APAAR_SECURE_SALT_2026_PRODUCTION_MOCK_PEPPER';

export function generateMatchingToken(apaarId: string): string {
  const canonical = `PEPPER:${DEMO_HMAC_PEPPER}|APAAR:${apaarId.trim().toUpperCase()}`;
  const rawHash = computeSha256(canonical);
  return `HMAC-${rawHash.substring(0, 16).toUpperCase()}`;
}

export function maskApaarId(apaarId: string): string {
  if (!apaarId || apaarId.length < 8) return 'APAAR-****-XXXX';
  const parts = apaarId.split('-');
  if (parts.length === 3) {
    return `${parts[0]}-****-${parts[2]}`;
  }
  return `${apaarId.substring(0, 4)}****${apaarId.substring(apaarId.length - 4)}`;
}

// Canonical event serialization for deterministic audit hashing
export function canonicalizeAuditEvent(event: {
  sequenceNumber: number;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entityType: string;
  entityId: string;
  institutionId?: string;
  details: string;
  previousHash: string;
}): string {
  return JSON.stringify({
    seq: event.sequenceNumber,
    ts: event.timestamp,
    act: event.actor,
    rol: event.role,
    cmd: event.action,
    entType: event.entityType,
    entId: event.entityId,
    inst: event.institutionId || '',
    dtl: event.details,
    prev: event.previousHash,
  });
}

export function computeEventHash(
  eventData: {
    sequenceNumber: number;
    timestamp: string;
    actor: string;
    role: string;
    action: string;
    entityType: string;
    entityId: string;
    institutionId?: string;
    details: string;
    previousHash: string;
  }
): string {
  const canonical = canonicalizeAuditEvent(eventData);
  return computeSha256(canonical);
}

export interface ChainVerificationResult {
  isValid: boolean;
  totalEvents: number;
  genesisHash: string;
  latestHash: string;
  brokenIndex?: number;
  brokenEventId?: string;
  expectedHash?: string;
  actualHash?: string;
  diagnostic: string;
}

export function verifyAuditChain(chain: AuditEvent[]): ChainVerificationResult {
  if (!chain || chain.length === 0) {
    return {
      isValid: true,
      totalEvents: 0,
      genesisHash: '0000000000000000000000000000000000000000000000000000000000000000',
      latestHash: '0000000000000000000000000000000000000000000000000000000000000000',
      diagnostic: 'Audit chain is empty.',
    };
  }

  for (let i = 0; i < chain.length; i++) {
    const current = chain[i];

    // Check link with previous
    if (i === 0) {
      if (current.previousHash !== 'GENESIS_00000000000000000000000000000000') {
        return {
          isValid: false,
          totalEvents: chain.length,
          genesisHash: current.eventHash,
          latestHash: chain[chain.length - 1].eventHash,
          brokenIndex: 0,
          brokenEventId: current.id,
          expectedHash: 'GENESIS_00000000000000000000000000000000',
          actualHash: current.previousHash,
          diagnostic: `Genesis block previousHash corrupt at event #${current.sequenceNumber} (${current.id})`,
        };
      }
    } else {
      const prev = chain[i - 1];
      if (current.previousHash !== prev.eventHash) {
        return {
          isValid: false,
          totalEvents: chain.length,
          genesisHash: chain[0].eventHash,
          latestHash: chain[chain.length - 1].eventHash,
          brokenIndex: i,
          brokenEventId: current.id,
          expectedHash: prev.eventHash,
          actualHash: current.previousHash,
          diagnostic: `Chain pointer broken at index ${i}: event #${current.sequenceNumber} points to ${current.previousHash.substring(0, 12)}..., but prior event hash was ${prev.eventHash.substring(0, 12)}...`,
        };
      }
    }

    // Recompute current event's hash
    const recalculated = computeEventHash({
      sequenceNumber: current.sequenceNumber,
      timestamp: current.timestamp,
      actor: current.actor,
      role: current.role,
      action: current.action,
      entityType: current.entityType,
      entityId: current.entityId,
      institutionId: current.institutionId,
      details: current.details,
      previousHash: current.previousHash,
    });

    if (recalculated !== current.eventHash) {
      return {
        isValid: false,
        totalEvents: chain.length,
        genesisHash: chain[0].eventHash,
        latestHash: chain[chain.length - 1].eventHash,
        brokenIndex: i,
        brokenEventId: current.id,
        expectedHash: recalculated,
        actualHash: current.eventHash,
        diagnostic: `Data payload tampered at event #${current.sequenceNumber} (${current.id}). Stored hash: ${current.eventHash.substring(0, 12)}... but recalculated canonical hash: ${recalculated.substring(0, 12)}...`,
      };
    }
  }

  return {
    isValid: true,
    totalEvents: chain.length,
    genesisHash: chain[0].eventHash,
    latestHash: chain[chain.length - 1].eventHash,
    diagnostic: `All ${chain.length} audit entries cryptographically verified against SHA-256 forward-linked chain.`,
  };
}

// Simulation of tampering in disposable cloned chain
export function simulateTampering(
  chain: AuditEvent[],
  targetIndex = 1
): {
  originalChain: AuditEvent[];
  tamperedChain: AuditEvent[];
  verificationResult: ChainVerificationResult;
  tamperedEvent: AuditEvent;
} {
  const clonedChain: AuditEvent[] = JSON.parse(JSON.stringify(chain));
  const safeIndex = Math.min(Math.max(0, targetIndex), clonedChain.length - 1);
  const target = clonedChain[safeIndex];

  // Silently modify payload without updating cryptographic hash
  target.details = `${target.details} [MODIFIED: Unauthorized backdated override by rogue actor]`;

  const verification = verifyAuditChain(clonedChain);

  return {
    originalChain: chain,
    tamperedChain: clonedChain,
    verificationResult: verification,
    tamperedEvent: target,
  };
}

// Sign credential with digital signature simulation
export function signAcademicCredential(payload: object): {
  signature: string;
  signatureAlgorithm: 'SHA256withRSA-DEMO' | 'HMAC-SHA256';
} {
  const canonical = JSON.stringify(payload);
  const hash = computeSha256(canonical);
  const mockSignature = `AICTE-SIG-${hash.substring(0, 24).toUpperCase()}-VERIFIED-DEMO`;
  return {
    signature: mockSignature,
    signatureAlgorithm: 'SHA256withRSA-DEMO',
  };
}

// Verify digital signature of a credential
export function verifyCredentialSignature(
  payload: object,
  providedSignature: string
): boolean {
  const expected = signAcademicCredential(payload);
  return expected.signature === providedSignature;
}
