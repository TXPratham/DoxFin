import React from 'react';
import {
  LayoutDashboard,
  LineChart,
  AlertTriangle,
  GitCompare,
  Cpu,
  Shield
} from 'lucide-react';

interface SidebarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  unreviewedAnomaliesCount: number;
  activeProcessingCount: number;
  currentUser?: { name: string; role: string };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  setActiveNav,
  unreviewedAnomaliesCount,
  activeProcessingCount,
  currentUser = { name: 'Pratham', role: 'Financial Analyst' }
}) => {
  const coreNavItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'financial_analysis', label: 'Financial Analysis', icon: LineChart },
    {
      id: 'anomalies',
      label: 'Anomalies',
      icon: AlertTriangle,
      badge: unreviewedAnomaliesCount > 0 ? String(unreviewedAnomaliesCount) : undefined,
      badgeColor: 'amber'
    },
    { id: 'compare_reports', label: 'Compare Reports', icon: GitCompare },
    {
      id: 'processing',
      label: 'Processing Pipeline',
      icon: Cpu,
      badge: activeProcessingCount > 0 ? 'Active' : undefined,
      badgeColor: 'brand'
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 select-none shadow-[1px_0_4px_rgba(15,23,42,0.03)]">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0F3E5D] flex items-center justify-center text-white shadow-sm ring-2 ring-[#0F3E5D]/10">
            <Shield className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900 font-['DM_Sans']">DOXFIN</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                LOCAL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Financial Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {coreNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[#0F3E5D] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-sky-300' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-sky-400/20 text-sky-200'
                      : item.badgeColor === 'amber'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Infrastructure & User Section */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/60 space-y-2">
        {/* System Status Pill */}
        <div className="px-3 py-2 rounded-md bg-white border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-700 font-medium">Local Engine</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono font-medium">100% Private</span>
        </div>

        {/* User Card */}
        <div className="px-3 py-2.5 rounded-md bg-white border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 font-semibold text-xs flex items-center justify-center flex-shrink-0 border border-sky-200">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{currentUser.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
