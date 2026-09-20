import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Server,
  FileCheck2,
  ArrowRight,
  Cpu,
  KeyRound
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: { name: string; role: string; email: string }) => void;
  onBackToApp?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToApp }) => {
  const [email, setEmail] = useState('pratham@internal.doxfin');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<'Administrator' | 'Financial Analyst' | 'Reviewer'>('Financial Analyst');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        role: selectedRole === 'Administrator' ? 'Lead Administrator' : 'Senior Financial Analyst',
        email
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-['Inter']">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Section: DoxFin Enterprise Branding */}
        <div className="lg:col-span-6 bg-[#0F3E5D] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-white">
                <Shield className="w-6 h-6 text-sky-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-2xl tracking-tight text-white font-['DM_Sans']">DOXFIN</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-sky-400/20 text-sky-300 border border-sky-400/30">
                    ON-PREMISES
                  </span>
                </div>
                <p className="text-xs text-sky-200/80 font-medium">Document Intelligence Engine</p>
              </div>
            </div>

            {/* Headline & Subheading */}
            <div className="space-y-4 my-8">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight font-['DM_Sans']">
                Financial Intelligence.<br />
                <span className="text-sky-300">Inside Your Infrastructure.</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Analyze complex annual reports, financial statements, and balance sheets using locally hosted, high-precision AI models with deterministic verification.
              </p>
            </div>

            {/* Small Trust Indicators */}
            <div className="space-y-3 pt-4 border-t border-sky-700/50">
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-white">Local Processing</span>
                  <span className="text-xs text-slate-300 block">AI runs natively on your private GPU/CPU nodes</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-300 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-white">Private Documents</span>
                  <span className="text-xs text-slate-300 block">Zero data egress; financial PDFs never leave your network</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                  <FileCheck2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-white">Evidence-Based AI</span>
                  <span className="text-xs text-slate-300 block">Every extracted ratio cites audited page & table coordinates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Local Cluster Footnote */}
          <div className="pt-8 mt-6 border-t border-sky-800/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono">
              <Server className="w-3.5 h-3.5 text-sky-400" /> Host: 192.168.1.140:8000
            </span>
            <span className="text-emerald-400 font-medium">Cluster v4.2 Local</span>
          </div>
        </div>

        {/* Right Section: Sign In Card */}
        <div className="lg:col-span-6 p-8 sm:p-12 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-['DM_Sans']">Internal Sign In</h2>
                <p className="text-xs text-slate-500 mt-0.5">Enterprise Role-Based Access Control</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active Server</span>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Working Profile</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Financial Analyst', 'Administrator', 'Reviewer'] as const).map((role) => (
                    <button
                      type="button"
                      key={role}
                      onClick={() => {
                        setSelectedRole(role);
                        if (role === 'Administrator') setEmail('pratham.admin@internal.doxfin');
                        else if (role === 'Reviewer') setEmail('rajesh.audit@internal.doxfin');
                        else setEmail('pratham@internal.doxfin');
                      }}
                      className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                        selectedRole === role
                          ? 'border-[#0F3E5D] bg-[#0F3E5D] text-white shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Internal Enterprise Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="dox-input text-sm pl-9"
                    placeholder="analyst@internal.doxfin"
                  />
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Local Server Password / PIN</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="dox-input text-sm pl-9 font-mono"
                    placeholder="••••••••••••"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Server Connection Status Banner */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Server className="w-4 h-4 text-sky-700" />
                  <span>Connected to DoxFin Local Server</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-700 font-semibold">TLS 1.3 Verified</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary py-2.5 text-sm font-semibold rounded-lg mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Authenticating Local Node...</span>
                ) : (
                  <>
                    <span>Enter DoxFin Workstation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom helper */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Air-Gapped & Enterprise Compliant</span>
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="text-sky-700 hover:text-sky-900 font-medium hover:underline"
              >
                Quick Return to Dashboard →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
