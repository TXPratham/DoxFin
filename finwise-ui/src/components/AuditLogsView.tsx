import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  Search
} from 'lucide-react';
import type { AuditLog } from '../types/doxfin';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs: initialLogs }) => {
  const [logs] = useState<AuditLog[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');

  const actionTypes = [
    'ALL',
    'UPLOAD_DOCUMENT',
    'VIEW_ANALYSIS',
    'VERIFY_METRIC',
    'EXPORT_REPORT',
    'RUN_QUERY',
    'CHANGE_SYSTEM_MODE'
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = 'Timestamp,User,Role,Action,Document,Status,IP Address,Details\n';
    const rows = logs
      .map(
        (l) =>
          `"${l.timestamp}","${l.user}","${l.role}","${l.actionLabel}","${l.document}","${l.status}","${l.ipAddress}","${l.details.replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DoxFin_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#0F3E5D]/10 text-[#0F3E5D] font-mono uppercase tracking-wider">
                Enterprise Governance
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">Immutable Cryptographic Audit Trail</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['DM_Sans']">
              Enterprise Audit Log
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Complete chronological ledger of document uploads, formula verifications, metric queries, and administrative operations.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn btn-secondary text-xs sm:text-sm font-semibold flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Audit Trail (CSV)</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 mr-1">Action:</span>
            {actionTypes.slice(0, 5).map((act) => (
              <button
                key={act}
                onClick={() => setSelectedAction(act)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  selectedAction === act
                    ? 'bg-[#0F3E5D] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {act === 'ALL' ? 'All Actions' : act.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, doc, details..."
              className="dox-input text-xs pl-8"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="dox-card p-6 bg-white border border-slate-200">
        <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 font-['DM_Sans']">Activity Records</h2>
          <span className="text-xs font-mono text-slate-500">{filteredLogs.length} Records Logged</span>
        </div>

        <div className="dox-table-container">
          <table className="dox-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User / Identity</th>
                <th>Action Performed</th>
                <th>Target Document</th>
                <th>Status</th>
                <th>IP / Local Node</th>
                <th>Audit Details & Context</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Timestamp */}
                  <td className="font-mono text-xs text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  {/* User */}
                  <td>
                    <span className="font-semibold text-xs text-slate-900 block">{log.user}</span>
                    <span className="text-[10px] text-slate-400">{log.role}</span>
                  </td>

                  {/* Action */}
                  <td>
                    <span className="text-xs font-semibold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-mono">
                      {log.actionLabel}
                    </span>
                  </td>

                  {/* Document */}
                  <td>
                    <div className="text-xs font-mono text-slate-700 truncate max-w-[180px]" title={log.document}>
                      {log.document}
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <span className="badge badge-completed font-mono text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {log.status}
                    </span>
                  </td>

                  {/* IP Address */}
                  <td className="font-mono text-xs text-slate-500">
                    {log.ipAddress}
                  </td>

                  {/* Details */}
                  <td className="text-xs text-slate-600 max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
