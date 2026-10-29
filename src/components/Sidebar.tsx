import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  Users,
  DoorOpen,
  Layers,
  Cpu,
  AlertOctagon,
  History,
  Clock,
  Link2,
  GraduationCap,
  ShieldCheck,
  Building,
  Lock,
  FileText,
  Home,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { store } from '../services/store';
import { TRANSLATIONS } from '../locales/translations';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed,
}) => {
  const state = store.getState();
  const t = TRANSLATIONS[state.language] || TRANSLATIONS.en;
  const role = state.currentUser.role;

  const navItems = [
    {
      id: 'landing',
      label: 'Public Overview',
      icon: Home,
      category: 'Public',
      badge: 'Start',
    },
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: LayoutDashboard,
      category: 'Institutional',
      highlight: true,
    },
    {
      id: 'upload',
      label: t.dataUpload,
      icon: UploadCloud,
      category: 'Institutional',
      disabled: role === 'AICTE_AUDITOR' || role === 'STUDENT' || role === 'AUTHORIZED_VERIFIER',
    },
    {
      id: 'students',
      label: t.studentDirectory,
      icon: Users,
      category: 'Institutional',
      count: state.students.length,
    },
    {
      id: 'gate',
      label: t.admissionGate,
      icon: DoorOpen,
      category: 'Innovation',
      badge: 'Live API',
    },
    {
      id: 'ledger',
      label: t.seatLedger,
      icon: Layers,
      category: 'Capacity',
    },
    {
      id: 'digital-twin',
      label: t.digitalTwin,
      icon: Cpu,
      category: 'Innovation',
      badge: 'What-If',
    },
    {
      id: 'discrepancies',
      label: t.discrepancies,
      icon: AlertOctagon,
      category: 'Regulatory',
      badge: `${state.discrepancies.length}`,
      badgeColor: 'bg-rose-900/60 text-rose-300 border-rose-700/50',
    },
    {
      id: 'rules-engine',
      label: t.rulesEngine,
      icon: History,
      category: 'Regulatory',
      badge: 'v2.1',
    },
    {
      id: 'bitemporal',
      label: t.biTemporal,
      icon: Clock,
      category: 'Regulatory',
    },
    {
      id: 'audit-chain',
      label: t.auditChain,
      icon: Link2,
      category: 'Security',
      badge: 'SHA-256',
      badgeColor: 'bg-teal-900/60 text-teal-300 border-teal-700/50',
    },
    {
      id: 'student-portal',
      label: t.studentPortal,
      icon: GraduationCap,
      category: 'Student',
      badge: 'Attestation',
    },
    {
      id: 'verifier',
      label: t.verifierPortal,
      icon: ShieldCheck,
      category: 'Verification',
      badge: 'QR',
    },
    {
      id: 'aicte-central',
      label: t.aicteCentral,
      icon: Building,
      category: 'Regulatory',
      badge: 'National',
    },
    {
      id: 'security',
      label: t.securityCentre,
      icon: Lock,
      category: 'Security',
    },
    {
      id: 'reports',
      label: t.reports,
      icon: FileText,
      category: 'Reports',
    },
  ];

  return (
    <aside
      className={`bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-200 z-20 shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Toggle */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        {!collapsed && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Platform Navigation
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors mx-auto"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              disabled={item.disabled}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : item.disabled
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />

              {!collapsed && (
                <div className="flex-1 text-left flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border ml-1 font-mono uppercase font-semibold ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && !item.badge && (
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                      {item.count}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
        {!collapsed ? (
          <div className="text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span>SIH-2026 Sandbox</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {state.currentUser.email}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-400" title="System Active" />
          </div>
        )}
      </div>
    </aside>
  );
};
