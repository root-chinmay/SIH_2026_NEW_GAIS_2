import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { verifyAuditChain, simulateTampering, verifyCredentialSignature } from './src/services/cryptoEngine';
import { store } from './src/services/store';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'APAAR Integrity Mesh',
    environment: 'SIH Prototype (Synthetic Demonstration)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Cryptographic Audit Chain Verification API
app.post('/api/audit/verify', (req: Request, res: Response) => {
  try {
    const { chain } = req.body;
    if (!Array.isArray(chain)) {
      return res.status(400).json({ error: 'Chain must be an array of AuditEvents' });
    }
    const result = verifyAuditChain(chain);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Audit verification failed' });
  }
});

// Audit Tamper Simulation Sandbox API
app.post('/api/audit/tamper-demo', (req: Request, res: Response) => {
  try {
    const { chain, targetIndex = 1 } = req.body;
    if (!Array.isArray(chain) || chain.length === 0) {
      return res.status(400).json({ error: 'Valid chain array required' });
    }
    const result = simulateTampering(chain, Number(targetIndex));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Tamper simulation failed' });
  }
});

// Public Academic Credential Verification API
app.post('/api/credentials/verify', (req: Request, res: Response) => {
  try {
    const { payload, signature, credentialNumber } = req.body;
    if (!payload || !signature) {
      return res.status(400).json({ error: 'Missing claims payload or digital signature' });
    }

    const isSigValid = verifyCredentialSignature(payload, signature);

    res.json({
      verified: isSigValid,
      credentialNumber: credentialNumber || 'AICTE-CRED-DEMO',
      signatureAlgorithm: 'SHA256withRSA-DEMO',
      claims: {
        issuingInstitution: payload.iss || 'Authorized Institution',
        studentIdentifier: payload.sub || 'APAAR-DEMO-XXXX',
        programme: payload.prog || 'Approved Degree',
        status: payload.status || 'Active',
      },
      externalApaarAdapterStatus: 'MOCK / NOT CONNECTED (Demonstration Mode)',
      notice: 'Synthetic SIH Prototype Credential. Not an official government record.',
      verificationTimestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Verification failed' });
  }
});

// Tenant-Isolated Institutions Endpoint
app.get('/api/institutions', (req: Request, res: Response) => {
  const userRole = (req.headers['x-user-role'] as string) || 'AICTE_ADMIN';
  const userInst = (req.headers['x-institution-id'] as string) || 'INST-DEL-01';

  const state = store.getState();
  if (userRole === 'AICTE_ADMIN' || userRole === 'AICTE_AUDITOR') {
    return res.json(state.institutions);
  }

  // Institutional user gets only their scoped tenant
  const scoped = state.institutions.filter((i) => i.id === userInst);
  res.json(scoped);
});

// Tenant-Isolated Students Query Endpoint
app.get('/api/students', (req: Request, res: Response) => {
  const userRole = (req.headers['x-user-role'] as string) || 'AICTE_ADMIN';
  const userInst = (req.headers['x-institution-id'] as string) || 'INST-DEL-01';
  const requestedInst = (req.query.institutionId as string) || undefined;

  const state = store.getState();

  // Strict Tenant Isolation Guard
  if (
    userRole !== 'AICTE_ADMIN' &&
    userRole !== 'AICTE_AUDITOR' &&
    requestedInst &&
    requestedInst !== userInst
  ) {
    return res.status(403).json({
      error: 'Tenant Isolation Violation: Institutional roles cannot access cross-institution records.',
      targetInstitution: requestedInst,
      authorizedInstitution: userInst,
    });
  }

  const effectiveInst =
    userRole === 'AICTE_ADMIN' || userRole === 'AICTE_AUDITOR'
      ? requestedInst
      : userInst;

  const results = effectiveInst
    ? state.students.filter((s) => s.institutionId === effectiveInst)
    : state.students;

  res.json({
    count: results.length,
    students: results,
  });
});

// Pre-Admission Gate Evaluation Endpoint
app.post('/api/gate/check', (req: Request, res: Response) => {
  try {
    const decision = store.evaluateAdmissionGate(req.body);
    res.json(decision);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Gate evaluation failed' });
  }
});

// Batch Signatory Approval Endpoint
app.post('/api/batches/approve', (req: Request, res: Response) => {
  try {
    const { batchId, signatoryName, signatoryDesignation } = req.body;
    if (!batchId || !signatoryName) {
      return res.status(400).json({ error: 'batchId and signatoryName required' });
    }
    const comment = signatoryDesignation ? `${signatoryName} (${signatoryDesignation})` : signatoryName;
    const approved = store.approveBatch(batchId, comment);
    if (!approved) {
      return res.status(404).json({ error: 'Batch not found or already finalized' });
    }
    res.json({ success: true, batch: approved });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Batch approval failed' });
  }
});

// Batch Signatory Rejection Endpoint
app.post('/api/batches/reject', (req: Request, res: Response) => {
  try {
    const { batchId, reason } = req.body;
    if (!batchId || !reason) {
      return res.status(400).json({ error: 'batchId and reason required' });
    }
    const rejected = store.rejectBatch(batchId, reason);
    if (!rejected) {
      return res.status(404).json({ error: 'Batch not found or already finalized' });
    }
    res.json({ success: true, batch: rejected });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Batch rejection failed' });
  }
});

// Server-Side Gemini AI Data Copilot with Deterministic Rule-Based Fallback
app.post('/api/copilot', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  const { query, userRole, institutionContext } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query prompt required' });
  }

  // Security check: Redact any accidental raw sensitive patterns
  const sanitizedQuery = String(query).replace(/\b\d{12}\b/g, 'APAAR-XXXX-XXXX');

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are the AICTE APAAR Integrity Mesh Regulatory Copilot.
User Role: ${userRole || 'AICTE_ADMIN'}
Institutional Scope: ${institutionContext || 'All AICTE Institutions'}
User Query: "${sanitizedQuery}"

Instructions:
1. Explain findings based on AICTE Approval Process Handbook (APH 2026-27).
2. Clearly distinguish evidence from speculation.
3. State that all data in this demonstration is synthetic.
4. Do not invent official government decrees or make autonomous regulatory rulings.
Provide a clear, professional, concise response with bullet points and recommended actions.`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API request timed out')), 3500)
      );

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const response = await Promise.race([geminiPromise, timeoutPromise]);

      return res.json({
        answer: response.text || 'Unable to generate copilot response.',
        mode: 'GEMINI_3.8_FLASH',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.warn('Gemini API call bypassed (falling back to regulatory engine):', err.message);
    }
  }

  // Deterministic rule-based copilot response when Gemini API key is unset or in mock mode
  let answer = '';
  const qLower = sanitizedQuery.toLowerCase().trim();

  if (qLower === 'hi' || qLower === 'hello' || qLower === 'hey' || qLower.startsWith('hi ') || qLower.startsWith('hello ')) {
    answer = `Hello! I am your **AICTE Regulatory Copilot**. I provide real-time regulatory guidance and data reconciliation intelligence.

Here are topics you can ask me about:
- **Intake Breaches**: "Explain the intake capacity breach at DTU CSE"
- **Dual Enrolment**: "Explain cross-institution duplicate for Sameer Singhania"
- **Quotas**: "What are the rules for supernumerary NRI and TFW quotas?"
- **Rules Time Machine**: "What are the changes between APH 2025 and 2026?"
- **Audit Verification**: "How does the SHA-256 forward-linked audit chain protect student records?"

Select a preset question above or enter your inquiry below.`;
  } else if (qLower.includes('intake') || qLower.includes('capacity') || qLower.includes('exceeded') || qLower.includes('dtu') || qLower.includes('breach')) {
    answer = `**AICTE Regulatory Finding — Intake Capacity Analysis**:
- **Statutory Rule**: Clause 2.4 of the Approval Process Handbook (APH 2026-27) mandates strict compliance with sanctioned intake limits.
- **Identified Violation**: Delhi Technological University (DTU) has reported 21 regular admissions against a sanctioned capacity of 20 in B.Tech CSE (PROG-DEL-CSE).
- **Intake Utilization**: **105.0%** (1 student in statutory excess).
- **Available Remedy**: Verify candidate documentation to determine if the 21st admission qualifies under unallocated supernumerary quotas (such as EWS, TFW, or NRI) where sanctioned limits are not yet breached.
- **Recommended Action**: Institutional Data Operator must submit a Category Correction Request with attested quota certificates.`;
  } else if (qLower.includes('duplicate') || qLower.includes('dual') || qLower.includes('transfer') || qLower.includes('sameer') || qLower.includes('singhania')) {
    answer = `**Academic Identity & Transfer Reconciliation**:
- **Cross-Institution Overlap Detected**: Identifier \`APAAR-DEMO-0099\` (Sameer Singhania) holds concurrent active admissions at DTU (Delhi) and MIT Pune (Maharashtra).
- **Temporal Analysis**: No formal withdrawal timestamp or Transfer Certificate (TC) has been registered by either institution, violating AICTE concurrent enrollment guidelines.
- **Legitimate Transfer Distinctions**: For student \`APAAR-DEMO-0098\` (Pooja Raghavan), withdrawal was finalized at BCE Bangalore prior to reporting at MIT Pune; this constitutes a valid sequential transfer.
- **Recommended Action**: AICTE regulatory administrator should request verification statements from both registrars and issue a DigiLocker re-attestation challenge.`;
  } else if (qLower.includes('nri') || qLower.includes('tfw') || qLower.includes('quota') || qLower.includes('supernumerary') || qLower.includes('ews')) {
    answer = `**AICTE Approval Process Handbook (APH 2026-27) Quota Framework**:
- **Tuition Fee Waiver (TFW)**: Up to **5% supernumerary seats** over and above sanctioned intake for meritorious candidates from economically backward families (parental income < ₹8 Lakhs/year).
- **NRI / PIO / Foreign Nationals**: Up to **15% supernumerary seats** subject to AICTE prior approval and requisite infrastructure adequacy (1/3rd earmarked for Gulf/CWG wards).
- **Economically Weaker Section (EWS)**: **10% supernumerary seats** allocated under statutory constitutional norms.
- **Key Principle**: Supernumerary seats do NOT breach sanctioned regular intake provided valid verified category documentation is maintained.`;
  } else if (qLower.includes('rule') || qLower.includes('version') || qLower.includes('aph') || qLower.includes('time machine')) {
    answer = `**Regulatory Rules Engine & Versioning Context**:
- Currently Active Rulebook: **APH 2026-27 Version 2.1**.
- The platform supports a **Regulatory Time Machine** enabling auditors to replay historical admissions under earlier rule versions (e.g., APH 2025 v1.0 vs APH 2026 v2.1) to evaluate the impact on institutional compliance.
- Note: All rules in this SIH prototype are illustrative demonstration models.`;
  } else {
    answer = `**APAAR Integrity Mesh Regulatory Summary**:
- **System Overview**: 4 synthetic AICTE-approved institutions registered with 100+ synthetic student profiles.
- **Active Exceptions**: 1 cross-institution dual-enrollment conflict, 1 regular intake capacity breach, 1 student-initiated dispute, and 1 unmapped identifier.
- **Security Notice**: All APAAR identifiers are synthetic and processed using privacy-preserving HMAC matching tokens and SHA-256 forward-linked audit chains.`;
  }

  res.json({
    answer,
    mode: 'DETERMINISTIC_REGULATORY_COPILOT',
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite middlewares in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`APAAR Integrity Mesh Server running on http://localhost:${PORT}`);
  });
}

startServer();
