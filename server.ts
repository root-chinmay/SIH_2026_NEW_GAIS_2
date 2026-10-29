import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { verifyAuditChain, simulateTampering, verifyCredentialSignature } from './src/services/cryptoEngine';

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

// Server-Side Gemini AI Data Copilot with Deterministic Rule-Based Fallback
app.post('/api/copilot', async (req: Request, res: Response) => {
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return res.json({
        answer: response.text || 'Unable to generate copilot response.',
        mode: 'GEMINI_LIVE_API',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to deterministic engine:', err.message);
    }
  }

  // Deterministic rule-based copilot response when Gemini API key is unset or in mock mode
  let answer = '';
  const qLower = sanitizedQuery.toLowerCase();

  if (qLower.includes('intake') || qLower.includes('capacity') || qLower.includes('exceeded')) {
    answer = `**AICTE Regulatory Finding — Intake Capacity Analysis**:
- **Statutory Rule**: Clause 2.4 of the Approval Process Handbook (APH 2026-27) mandates strict compliance with sanctioned intake.
- **Identified Violation**: Delhi Technological University (DTU) has reported 21 regular admissions against a sanctioned capacity of 20 in B.Tech CSE (PROG-DEL-CSE).
- **Available Remedy**: Verify candidate documentation to determine if the 21st admission qualifies under unallocated supernumerary quotas (such as EWS, TFW, or NRI) where sanctioned limits are not yet breached.
- **Recommended Action**: Institutional Data Operator must submit a Category Correction Request with attested quota certificates.`;
  } else if (qLower.includes('duplicate') || qLower.includes('dual') || qLower.includes('transfer')) {
    answer = `**Academic Identity & Transfer Reconciliation**:
- **Cross-Institution Overlap Detected**: Identifier \`APAAR-DEMO-0099\` (Sameer Singhania) holds concurrent active admissions at DTU (Delhi) and MIT Pune (Maharashtra).
- **Temporal Analysis**: No formal withdrawal timestamp has been registered by either institution, violating AICTE concurrent enrollment guidelines.
- **Legitimate Transfer Distinctions**: For student \`APAAR-DEMO-0098\` (Pooja Raghavan), withdrawal was finalized at BCE Bangalore prior to reporting at MIT Pune; this constitutes a valid sequential transfer.
- **Recommended Action**: AICTE regulatory administrator should request verification statements from both registrars.`;
  } else if (qLower.includes('rule') || qLower.includes('version') || qLower.includes('aph')) {
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
