import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  UserCheck,
  Sparkles,
  Lock,
  Mail,
  Building2,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SYNTHETIC_COMPANY_NAME } from '../data/seedData';
import { RoleBadge } from '../components/common/RoleBadge';

export const LoginPage: React.FC = () => {
  const { demoUsers, loginAs } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSelectDemo = async (empId: string) => {
    await loginAs(empId);
    navigate('/');
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (demoUsers.length > 0) {
      await loginAs(demoUsers[0].employee.id);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F5F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Tech Grid */}
      <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />

      {/* Decorative Brand Accent Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-[#261407] border border-[#FF6B00]/40 text-[#FF6B00] font-black flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,107,0,0.2)]">
          <Layers className="w-6 h-6 text-[#FF6B00]" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          WORK<span className="text-[#FF6B00]">TRACE</span>
        </h1>
        <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#FF6B00]">
          AI Knowledge Continuity &amp; Handover Platform
        </div>
        <p className="text-xs text-[#A1A1A1] max-w-sm mx-auto leading-relaxed">
          &ldquo;When an employee leaves, their knowledge shouldn&apos;t leave with them.&rdquo;
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-[#111111] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Company Environment Header */}
          <div className="p-3.5 bg-[#161616] border border-[#292929] rounded-xl text-center space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF6B00] bg-[#261407] px-2.5 py-0.5 rounded border border-[#FF6B00]/30 inline-block">
              Synthetic Demonstration Environment
            </span>
            <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#FF6B00]" />
              {SYNTHETIC_COMPANY_NAME}
            </div>
            <p className="text-[11px] text-[#A1A1A1]">
              Select any role persona below for instant 1-click evaluation access:
            </p>
          </div>

          {/* Quick 1-Click Demo Login Personas */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono font-bold text-[#686868] uppercase tracking-wider flex items-center justify-between">
              <span>Select Active Persona</span>
              <span className="text-[#FF6B00]">Instant Access</span>
            </div>

            {demoUsers.map((item) => (
              <button
                key={item.employee.id}
                onClick={() => handleSelectDemo(item.employee.id)}
                className="w-full text-left p-3.5 rounded-xl border border-[#262626] hover:border-[#FF6B00]/60 bg-[#141414] hover:bg-[#1F140A] transition-all flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={item.employee.avatarUrl}
                    alt={item.employee.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-[#333333] shrink-0 group-hover:ring-[#FF6B00]/50 transition-all"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs group-hover:text-[#FF6B00] transition-colors">
                        {item.employee.name}
                      </span>
                      <RoleBadge role={item.employee.role} size="sm" />
                    </div>
                    <p className="text-[11px] text-[#A1A1A1] truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-lg bg-[#1C1C1C] group-hover:bg-[#FF6B00] group-hover:text-black text-[#A1A1A1] flex items-center justify-center transition-all shrink-0">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>

          {/* Fallback Standard Form */}
          <div className="pt-4 border-t border-[#222222]">
            <details className="text-xs text-[#686868] group">
              <summary className="cursor-pointer font-medium hover:text-[#A1A1A1] transition-colors flex items-center gap-1">
                <span>Or sign in with custom credentials</span>
                <ChevronRight className="w-3.5 h-3.5 group-open:rotate-90 transition-transform" />
              </summary>
              <form onSubmit={handleCustomLogin} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#A1A1A1] mb-1">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@abc-consumer.synthetic"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#161616] border border-[#292929] text-white text-xs placeholder-[#555] focus:outline-none focus:border-[#FF6B00] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#A1A1A1] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#161616] border border-[#292929] text-white text-xs placeholder-[#555] focus:outline-none focus:border-[#FF6B00] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  Authenticate
                </button>
              </form>
            </details>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 text-center text-[11px] font-mono text-[#686868]">
          WORKTRACE SECURE INSTANCE v2.4 • ENCRYPTED AUDIT TRAIL ENABLED
        </div>
      </div>
    </div>
  );
};
