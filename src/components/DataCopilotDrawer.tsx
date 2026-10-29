import React, { useState } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { store } from '../services/store';

interface DataCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Client-side resilient regulatory knowledge engine (instant, offline-capable fallback)
function getLocalRegulatoryAnswer(
  query: string,
  userRole: string,
  institutionContext?: string
): { answer: string; mode: string } {
  const qLower = query.toLowerCase().trim();

  if (
    qLower === 'hi' ||
    qLower === 'hello' ||
    qLower === 'hey' ||
    qLower.startsWith('hi ') ||
    qLower.startsWith('hello ')
  ) {
    return {
      answer: `Hello! I am your **AICTE Regulatory Copilot**. I provide real-time regulatory guidance and data reconciliation intelligence for **${institutionContext || 'AICTE Institutions'}**.

Here are key topics you can query:
- **Intake Breaches**: "Explain the intake capacity breach at DTU CSE"
- **Dual Enrolment**: "Explain cross-institution duplicate for Sameer Singhania"
- **Quotas**: "What are the rules for supernumerary NRI and TFW quotas?"
- **Rules Time Machine**: "What are the changes between APH 2025 and 2026?"
- **Audit Verification**: "How does the SHA-256 forward-linked audit chain protect student records?"

Select a preset question above or enter your inquiry below.`,
      mode: 'REGULATORY_COPILOT_ENGINE',
    };
  }

  if (
    qLower.includes('intake') ||
    qLower.includes('capacity') ||
    qLower.includes('exceeded') ||
    qLower.includes('dtu') ||
    qLower.includes('breach')
  ) {
    return {
      answer: `**AICTE Regulatory Finding — Intake Capacity Analysis**:
- **Statutory Rule**: Clause 2.4 of the Approval Process Handbook (APH 2026-27) mandates strict compliance with sanctioned intake limits.
- **Identified Violation**: Delhi Technological University (DTU) has reported 21 regular admissions against a sanctioned capacity of 20 in B.Tech CSE (\`PROG-DEL-CSE\`).
- **Capacity Utilization**: **105.0%** (1 student in statutory excess).
- **Available Remedy**:
  1. Verify candidate documentation to determine if the 21st admission qualifies under unallocated supernumerary quotas (such as EWS, TFW, or NRI) where sanctioned limits are not yet breached.
  2. If candidate is eligible for supernumerary quota, Institutional Data Operator must submit a Category Correction Request with attested quota certificates.
  3. If unallocated, the institution must re-seat the student or execute an emergency dual-override through AICTE central regulatory approval.`,
      mode: 'REGULATORY_COPILOT_ENGINE',
    };
  }

  if (
    qLower.includes('duplicate') ||
    qLower.includes('dual') ||
    qLower.includes('transfer') ||
    qLower.includes('sameer') ||
    qLower.includes('singhania')
  ) {
    return {
      answer: `**Academic Identity & Transfer Reconciliation**:
- **Cross-Institution Overlap Detected**: Identifier \`APAAR-DEMO-0099\` (Sameer Singhania) holds concurrent active admissions at **DTU (Delhi)** and **MIT Pune (Maharashtra)**.
- **Temporal Analysis**: No formal withdrawal timestamp or Transfer Certificate (TC) has been registered by either institution, violating AICTE concurrent enrollment guidelines.
- **Legitimate Transfer Distinctions**: For student \`APAAR-DEMO-0098\` (Pooja Raghavan), withdrawal was finalized at BCE Bangalore prior to reporting at MIT Pune; this constitutes a valid sequential transfer.
- **Recommended Action**: AICTE regulatory administrator should request verification statements from both registrars and issue a DigiLocker re-attestation challenge.`,
      mode: 'REGULATORY_COPILOT_ENGINE',
    };
  }

  if (
    qLower.includes('nri') ||
    qLower.includes('tfw') ||
    qLower.includes('quota') ||
    qLower.includes('supernumerary') ||
    qLower.includes('ews')
  ) {
    return {
      answer: `**AICTE Approval Process Handbook (APH 2026-27) Quota Framework**:
- **Tuition Fee Waiver (TFW)**: Up to **5% supernumerary seats** over and above sanctioned intake for meritorious candidates from economically backward families (parental income < ₹8 Lakhs/year).
- **NRI / PIO / Foreign Nationals**: Up to **15% supernumerary seats** subject to AICTE prior approval and requisite infrastructure adequacy (1/3rd earmarked for Gulf/CWG wards).
- **Economically Weaker Section (EWS)**: **10% supernumerary seats** allocated under statutory constitutional norms.
- **Key Principle**: Supernumerary seats do NOT breach sanctioned regular intake provided valid verified category documentation is maintained.`,
      mode: 'REGULATORY_COPILOT_ENGINE',
    };
  }

  if (
    qLower.includes('rule') ||
    qLower.includes('version') ||
    qLower.includes('aph') ||
    qLower.includes('time machine')
  ) {
    return {
      answer: `**Regulatory Rules Engine & Versioning Context**:
- Currently Active Rulebook: **APH 2026-27 Version 2.1**.
- The platform supports a **Regulatory Time Machine** enabling auditors to replay historical admissions under earlier rule versions (e.g., APH 2025 v1.0 vs APH 2026 v2.1) to evaluate the impact on institutional compliance.
- Note: All rules in this SIH prototype are illustrative demonstration models.`,
      mode: 'REGULATORY_COPILOT_ENGINE',
    };
  }

  return {
    answer: `**APAAR Integrity Mesh Regulatory Summary**:
- **System Overview**: 4 synthetic AICTE-approved institutions registered with 100+ synthetic student profiles.
- **Active Exceptions**: 1 cross-institution dual-enrollment conflict, 1 regular intake capacity breach, 1 student-initiated dispute, and 1 unmapped identifier.
- **Security Notice**: All APAAR identifiers are synthetic and processed using privacy-preserving HMAC matching tokens and SHA-256 forward-linked audit chains.`,
    mode: 'REGULATORY_COPILOT_ENGINE',
  };
}

export const DataCopilotDrawer: React.FC<DataCopilotDrawerProps> = ({ isOpen, onClose }) => {
  const state = store.getState();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; mode?: string }[]
  >([
    {
      role: 'assistant',
      text: `Hello! I am your **AICTE Regulatory Copilot**. I can explain intake compliance, analyze cross-institution discrepancies, or cite clauses from the Approval Process Handbook (APH 2026-27). How can I assist you?`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || query).trim();
    if (!q || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          userRole: state.currentUser.role,
          institutionContext: state.currentUser.institutionName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer || 'Unable to retrieve answer.',
          mode: data.mode,
        },
      ]);
    } catch {
      // Offline-resilient local knowledge fallback
      const fallback = getLocalRegulatoryAnswer(
        q,
        state.currentUser.role,
        state.currentUser.institutionName
      );
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: fallback.answer,
          mode: fallback.mode,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreset = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white border-l border-slate-200 w-full max-w-lg h-full flex flex-col shadow-2xl">
        {/* Header in deep AICTE blue */}
        <div className="p-4 border-b border-blue-800 flex items-center justify-between bg-blue-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-800 text-blue-200 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>AICTE Regulatory Copilot</span>
                <span className="text-[10px] bg-blue-950 text-blue-200 border border-blue-700 px-1.5 py-0.5 rounded font-mono">
                  Gemini / Rule Engine
                </span>
              </h3>
              <p className="text-[11px] text-blue-200">
                Scope: {state.currentUser.role.replace('_', ' ')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-blue-800 transition-colors"
            aria-label="Close copilot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="p-3 border-b border-blue-100 bg-blue-50/60 flex flex-wrap gap-1.5">
          <button
            onClick={() => handlePreset('Explain the intake capacity breach at DTU CSE')}
            className="text-[11px] bg-white hover:bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-200 text-left font-medium shadow-2xs transition-colors"
          >
            DTU Intake Breach?
          </button>
          <button
            onClick={() => handlePreset('Explain cross-institution duplicate for Sameer Singhania')}
            className="text-[11px] bg-white hover:bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-200 text-left font-medium shadow-2xs transition-colors"
          >
            Dual Enrolment Conflict?
          </button>
          <button
            onClick={() => handlePreset('What are the rules for supernumerary NRI and TFW quotas?')}
            className="text-[11px] bg-white hover:bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg border border-blue-200 text-left font-medium shadow-2xs transition-colors"
          >
            Supernumerary Quotas?
          </button>
        </div>

        {/* Chat Feed on clean light background */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-xs font-medium'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                }`}
              >
                {m.text}
              </div>
              {m.mode && (
                <span className="text-[9px] font-mono text-slate-500 mt-1 px-1">
                  Engine: {m.mode}
                </span>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600 text-xs p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Consulting regulatory handbook...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-slate-200 bg-white flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask regulatory or exception question..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !query.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl shadow-xs transition-colors"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
