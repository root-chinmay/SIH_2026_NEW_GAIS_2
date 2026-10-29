import React, { useState } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Building,
  RefreshCw,
} from 'lucide-react';
import { store } from '../services/store';

interface DataCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer || 'Unable to retrieve answer.',
          mode: data.mode,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Error connecting to copilot engine: ${err.message}`,
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/60 text-indigo-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>AICTE Regulatory Copilot</span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.2 rounded font-mono">
                  Gemini / Rule Engine
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Scope: {state.currentUser.role.replace('_', ' ')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap gap-1.5">
          <button
            onClick={() => handlePreset('Explain the intake capacity breach at DTU CSE')}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 text-left"
          >
            DTU Intake Breach?
          </button>
          <button
            onClick={() => handlePreset('Explain cross-institution duplicate for Sameer Singhania')}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 text-left"
          >
            Dual Enrolment Conflict?
          </button>
          <button
            onClick={() => handlePreset('What are the rules for supernumerary NRI and TFW quotas?')}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 text-left"
          >
            Supernumerary Quotas?
          </button>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
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
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm'
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
            <div className="flex items-center gap-2 text-indigo-400 text-xs p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing regulatory repository...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask regulatory or exception question..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !query.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white rounded-xl shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
