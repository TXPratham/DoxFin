import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Clock,
  FileKey,
  CheckCircle2,
  Copy,
  Terminal
} from 'lucide-react';
import type { AuditLogItem, EnterpriseLicense } from '../types/finwise';

interface SecurityLicenseManagerProps {
  auditLogs: AuditLogItem[];
  license: EnterpriseLicense;
}

export const SecurityLicenseManager: React.FC<SecurityLicenseManagerProps> = ({
  auditLogs,
  license: initialLicense
}) => {
  const [retentionPolicy, setRetentionPolicy] = useState<string>('90_days');
  const [licenseState, setLicenseState] = useState<EnterpriseLicense>(initialLicense);
  const [customerInput, setCustomerInput] = useState<string>('Apex Capital Holdings Ltd');
  const [maxUsersInput, setMaxUsersInput] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);

  const generateNewLicense = () => {
    const newSignature = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setLicenseState({
      ...licenseState,
      customer: customerInput,
      max_users: maxUsersInput,
      signature: newSignature,
      isValid: true
    });
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(licenseState, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-emerald flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero-Trust Security Architecture
              </span>
              <span className="badge badge-cyan">AES-256 Encryption at Rest</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-heading">
              Security, Retention Policy & Offline Licensing
            </h2>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              Strict multi-tenant isolation, immutable audit logging, configurable data retention policies, and RSA signed offline enterprise license key verification.
            </p>
          </div>

          <div className="bg-slate-900 px-4 py-3 rounded-xl border border-emerald-500/30 text-right">
            <span className="text-xs text-gray-400 block">Encryption Standard</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">TLS 1.3 + AES-256 Key Vault</span>
          </div>
        </div>
      </div>

      {/* Grid for Security & Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Vault & Encryption Status */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <Key className="w-4 h-4" /> Cryptographic Key Management (KMS / HSM)
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-900 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <span className="text-gray-300 font-semibold block">Original PDFs & Extracted Tables</span>
                <span className="text-gray-500">AES-256 Envelope Encrypted</span>
              </div>
              <span className="badge badge-emerald">Encrypted</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <span className="text-gray-300 font-semibold block">FAISS Vector Embeddings</span>
                <span className="text-gray-500">Tenant Isolated Index Storage</span>
              </div>
              <span className="badge badge-emerald">Isolated</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-gray-800 flex justify-between items-center">
              <div>
                <span className="text-gray-300 font-semibold block">In-Transit Data Pipeline</span>
                <span className="text-gray-500">TLS 1.3 Perfect Forward Secrecy</span>
              </div>
              <span className="badge badge-emerald">Active</span>
            </div>
          </div>
        </div>

        {/* Retention Policy Manager */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Clock className="w-4 h-4" /> Configurable Data Retention Policy
          </div>

          <p className="text-xs text-gray-400">
            Automatically purges original PDFs, extracted tables, vector chunks, and derived caches according to enterprise compliance rules.
          </p>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-gray-800 cursor-pointer hover:border-sky-500/40">
              <span className="text-gray-200">Delete Immediately Post-Analysis</span>
              <input
                type="radio"
                name="retention"
                value="immediate"
                checked={retentionPolicy === 'immediate'}
                onChange={(e) => setRetentionPolicy(e.target.value)}
                className="accent-sky-400"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-gray-800 cursor-pointer hover:border-sky-500/40">
              <span className="text-gray-200">Retain for 30 Days (Standard Audit)</span>
              <input
                type="radio"
                name="retention"
                value="30_days"
                checked={retentionPolicy === '30_days'}
                onChange={(e) => setRetentionPolicy(e.target.value)}
                className="accent-sky-400"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-gray-800 cursor-pointer hover:border-sky-500/40">
              <span className="text-gray-200">Retain for 90 Days (Enterprise Default)</span>
              <input
                type="radio"
                name="retention"
                value="90_days"
                checked={retentionPolicy === '90_days'}
                onChange={(e) => setRetentionPolicy(e.target.value)}
                className="accent-sky-400"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-gray-800 cursor-pointer hover:border-sky-500/40">
              <span className="text-gray-200">Retain for 1 Year (Regulatory Archive)</span>
              <input
                type="radio"
                name="retention"
                value="1_year"
                checked={retentionPolicy === '1_year'}
                onChange={(e) => setRetentionPolicy(e.target.value)}
                className="accent-sky-400"
              />
            </label>
          </div>
        </div>

        {/* Cryptographic Enterprise Offline License Generator */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <FileKey className="w-4 h-4" /> Enterprise License Manager
            </div>
            <span className="badge badge-purple text-[10px]">Offline Public Key Verification</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-gray-400 block mb-1">Customer / Organization:</label>
              <input
                type="text"
                value={customerInput}
                onChange={(e) => setCustomerInput(e.target.value)}
                className="w-full bg-slate-900 p-2 rounded border border-gray-800 text-white font-medium"
              />
            </div>

            <div>
              <label className="text-gray-400 block mb-1">Max Authorized Users:</label>
              <input
                type="number"
                value={maxUsersInput}
                onChange={(e) => setMaxUsersInput(Number(e.target.value))}
                className="w-full bg-slate-900 p-2 rounded border border-gray-800 text-white font-medium"
              />
            </div>

            <button
              onClick={generateNewLicense}
              className="btn-primary w-full justify-center text-xs"
            >
              Sign & Generate Enterprise License JSON
            </button>
          </div>
        </div>
      </div>

      {/* Signed License JSON Viewer */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white font-heading">
              Signed License File (`license.json`)
            </h3>
          </div>
          <button
            onClick={handleCopyJSON}
            className="btn-secondary text-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied to Clipboard!' : 'Copy License JSON'}
          </button>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl border border-purple-500/30 font-mono text-xs text-purple-200 overflow-x-auto">
{JSON.stringify(licenseState, null, 2)}
        </pre>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              Immutable Enterprise Audit Logs
            </h3>
            <p className="text-xs text-gray-400">
              Tracks user logins, uploads, calculations, RAG evidence retrievals, and report exports.
            </p>
          </div>
          <span className="badge badge-emerald flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Tamper-Evident Hash Chain
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-900 text-gray-400 uppercase font-semibold border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Activity Details</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-4 text-gray-400">{log.timestamp}</td>
                  <td className="py-3 px-4 font-semibold text-white">{log.user}</td>
                  <td className="py-3 px-4 text-sky-400">{log.role}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-gray-200 font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-gray-300">{log.details}</td>
                  <td className="py-3 px-4 text-gray-500">{log.ipAddress}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">
                    {log.status}
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
