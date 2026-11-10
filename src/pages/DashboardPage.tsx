import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Users,
  PenSquare,
  ArrowRightLeft,
  Database,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  BotMessageSquare,
  Building,
  AlertCircle,
  ArrowUpRight,
  Activity,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DailyActivity, HandoverReport, Employee } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { EvidenceTag } from '../components/common/EvidenceTag';
import { AnimatedCounter } from '../components/common/AnimatedCounter';

export const DashboardPage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const [stats, setStats] = useState<{
    totalEmployees: number;
    activeEmployees: number;
    onNoticeEmployees: number;
    exitedEmployees: number;
    totalActivities: number;
    pendingTasksCount: number;
    totalDocuments: number;
    totalKnowledgeRecords: number;
    ongoingHandovers: number;
    completedHandovers: number;
  } | null>(null);

  const [handovers, setHandovers] = useState<HandoverReport[]>([]);
  const [recentActivities, setRecentActivities] = useState<DailyActivity[]>([]);
  const [noticeEmployees, setNoticeEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsData, hoData, actData, empData] = await Promise.all([
          api.getStats(),
          api.getHandovers(),
          api.getActivities(),
          api.getEmployees({ status: 'On Notice' }),
        ]);
        setStats(statsData);
        setHandovers(hoData);
        setRecentActivities(actData.slice(0, 6));
        setNoticeEmployees(empData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6"
    >
      {/* Top Editorial Welcome Header */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 relative overflow-hidden">
        {/* Subtle geometric orange accent glow */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#FF6B00]/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#261407] border border-[#FF6B00]/40 text-[#FF8126] text-[11px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shadow-[0_0_6px_#FF6B00]" />
                KNOWLEDGE CONTINUITY ENGINE
              </span>
              <span className="text-xs text-[#686868] font-mono">B2C FMCG &amp; RETAIL</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#F5F5F5] tracking-tight">
              Organisational Intelligence Hub
            </h1>

            <p className="text-sm font-normal text-[#A1A1A1] leading-relaxed">
              When an employee leaves, their operational knowledge shouldn&apos;t leave with them. 
              Currently tracking <strong className="text-[#F5F5F5] font-medium">ABC Consumer Products</strong> across 4 core departments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/submit-activity"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs transition-all shadow-[0_0_20px_rgba(255,107,0,0.3)]"
            >
              <PenSquare className="w-4 h-4 stroke-[2.5]" />
              Submit Today&apos;s Log
            </Link>

            {(currentRole === 'manager' || currentRole === 'admin') && (
              <Link
                to="/handovers"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#181818] hover:bg-[#202020] text-[#F5F5F5] border border-[#2A2A2A] font-semibold text-xs transition-all"
              >
                <ArrowRightLeft className="w-4 h-4 text-[#FF6B00]" />
                Exit Handovers
              </Link>
            )}

            <Link
              to="/successor-assistant"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#181818] hover:bg-[#202020] text-[#FF8126] border border-[#FF6B00]/30 font-semibold text-xs transition-all"
            >
              <BotMessageSquare className="w-4 h-4" />
              Successor Assistant
            </Link>
          </div>
        </div>
      </div>

      {/* Notice Period Urgent Attention Strip */}
      {noticeEmployees.length > 0 && (
        <div className="bg-[#19110B] border border-[#FF6B00]/40 rounded-xl p-4 text-[#F5F5F5] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#261407] border border-[#FF6B00]/50 text-[#FF6B00] shrink-0 mt-0.5">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-bold text-sm text-white">Active Notice Period Transition:</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF8126] border border-[#FF6B00]/40">
                  {noticeEmployees[0].name} ({noticeEmployees[0].designation})
                </span>
              </div>
              <p className="text-xs text-[#A1A1A1] mt-1 leading-relaxed">
                Notice period concludes on <strong className="text-white">{noticeEmployees[0].exitDate || '2026-11-28'}</strong>. 
                Handover report is currently in <strong className="text-[#FBBF24]">Awaiting Review</strong> status.
              </p>
            </div>
          </div>

          <Link
            to="/handovers/ho-101"
            className="px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs transition-all shrink-0 flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,107,0,0.25)]"
          >
            <span>Review Handover Dossier</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Asymmetrical Metric Dashboard Composition */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Large Hero Metric: Total Activities Submitted */}
        <div className="md:col-span-4 bg-[#111111] border border-[#222222] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#A1A1A1] mb-2 font-mono text-xs">
              <span className="uppercase tracking-wider">DAILY ACTIVITIES</span>
              <Activity className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <div className="text-4xl sm:text-5xl font-display font-bold text-[#FF6B00] tracking-tight">
              <AnimatedCounter value={stats?.totalActivities ?? 32} />
            </div>
            <p className="text-xs text-[#A1A1A1] mt-2">
              Captured across Warehouse, Logistics, Modern Trade Sales &amp; Operations.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E1E1E] flex items-center justify-between text-xs text-[#686868]">
            <span className="font-medium">100% Retained</span>
            <span className="text-[#34D399] flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" /> +8 This Week
            </span>
          </div>
        </div>

        {/* Metric 2: Knowledge Records & SOPs */}
        <div className="md:col-span-4 bg-[#111111] border border-[#222222] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#A1A1A1] mb-2 font-mono text-xs">
              <span className="uppercase tracking-wider">TOTAL KNOWLEDGE REPOSITORY</span>
              <Database className="w-4 h-4 text-white" />
            </div>
            <div className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">
              <AnimatedCounter value={stats?.totalKnowledgeRecords ?? 42} />
            </div>
            <p className="text-xs text-[#A1A1A1] mt-2">
              Includes {stats?.totalDocuments ?? 10} certified SOPs, supplier failure RCAs, and incident protocols.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E1E1E] flex items-center justify-between text-xs text-[#686868]">
            <span className="font-medium">Verified Sources</span>
            <span className="text-[#F5F5F5] font-medium">{stats?.totalDocuments ?? 10} Archived Docs</span>
          </div>
        </div>

        {/* Small Metrics Stack: Right Side */}
        <div className="md:col-span-4 grid grid-cols-2 gap-4">
          {/* Workforce */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 flex flex-col justify-between">
            <div className="text-[10px] font-mono font-bold uppercase text-[#686868]">
              WORKFORCE
            </div>
            <div className="text-2xl font-display font-bold text-white my-1">
              <AnimatedCounter value={stats?.totalEmployees ?? 10} />
            </div>
            <div className="text-[11px] text-[#A1A1A1]">
              <span className="text-[#34D399] font-semibold">{stats?.activeEmployees ?? 8}</span> Active •{' '}
              <span className="text-[#FBBF24] font-semibold">{stats?.onNoticeEmployees ?? 1}</span> Notice
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 flex flex-col justify-between">
            <div className="text-[10px] font-mono font-bold uppercase text-[#686868]">
              PENDING TASKS
            </div>
            <div className="text-2xl font-display font-bold text-[#FBBF24] my-1">
              <AnimatedCounter value={stats?.pendingTasksCount ?? 7} />
            </div>
            <div className="text-[11px] text-[#A1A1A1]">
              Awaiting Handover
            </div>
          </div>

          {/* Ongoing Handovers */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 flex flex-col justify-between col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-[#686868]">
                ACTIVE HANDOVER LIFECYCLES
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#261407] text-[#FF8126] border border-[#FF6B00]/40">
                LOCKED
              </span>
            </div>
            <div className="flex items-baseline gap-3 my-1">
              <span className="text-2xl font-display font-bold text-white">
                <AnimatedCounter value={stats?.ongoingHandovers ?? 1} />
              </span>
              <span className="text-xs text-[#A1A1A1]">In Review &amp; Approval</span>
              <span className="text-xs text-[#34D399] font-medium ml-auto">
                <AnimatedCounter value={stats?.completedHandovers ?? 1} /> Completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Stream Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Recent Activity Log Stream */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#1E1E1E]">
              <div>
                <h3 className="font-bold text-white text-sm">Recent Operational Activity Stream</h3>
                <p className="text-xs text-[#686868] mt-0.5">
                  7-question daily work logs capturing real problems, decisions, and lessons
                </p>
              </div>

              <Link
                to="/activity-history"
                className="text-xs font-mono font-semibold text-[#FF8126] hover:text-[#FF6B00] flex items-center gap-1 transition-colors"
              >
                VIEW ALL LOGS &rarr;
              </Link>
            </div>

            <div className="divide-y divide-[#1A1A1A] mt-2">
              {recentActivities.map((act) => (
                <div key={act.id} className="py-4 hover:bg-[#161616]/60 transition-all rounded-lg px-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-[#686868] bg-[#181818] px-1.5 py-0.5 rounded border border-[#262626]">
                          {act.id}
                        </span>
                        <h4 className="font-bold text-white text-sm hover:text-[#FF8126] transition-colors cursor-pointer">
                          {act.title}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181818] text-[#A1A1A1] border border-[#262626]">
                          {act.category}
                        </span>
                        <EvidenceTag classification={act.evidenceClassification} size="sm" />
                      </div>

                      <p className="text-xs text-[#A1A1A1] leading-relaxed line-clamp-2">
                        <strong className="text-white">Completed:</strong> {act.workCompleted}
                      </p>

                      {act.problemsEncountered && act.problemsEncountered !== 'None encountered.' && (
                        <div className="text-xs text-[#FBBF24] bg-[#1F1608] border border-[#B45309]/40 px-2.5 py-1.5 rounded-md">
                          <strong>Problem &amp; Resolution:</strong> {act.problemsEncountered} &rarr;{' '}
                          <em className="text-[#F5F5F5]">{act.actionsTaken}</em>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[11px] font-mono text-[#686868] pt-1">
                        <span className="font-bold text-white">{act.employeeName}</span>
                        <span>•</span>
                        <span>{act.departmentName}</span>
                        <span>•</span>
                        <span>{act.submissionDate}</span>
                      </div>
                    </div>

                    <StatusBadge status={act.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Active Handover Dossiers & Assistant Launcher */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Handover Dossier Card */}
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E]">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="font-bold text-white text-sm">Handover Dossiers</h3>
              </div>
              <Link to="/handovers" className="text-xs font-mono text-[#FF8126] hover:underline">
                MANAGE
              </Link>
            </div>

            <div className="space-y-3">
              {handovers.map((ho) => (
                <div
                  key={ho.id}
                  className="p-3.5 rounded-xl border border-[#262626] bg-[#141414] hover:border-[#383838] transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">{ho.employeeName}</div>
                      <div className="text-[11px] text-[#686868]">{ho.employeeDesignation}</div>
                    </div>
                    <StatusBadge status={ho.status} size="sm" />
                  </div>

                  <div className="text-[11px] font-mono text-[#A1A1A1] flex items-center justify-between pt-1 border-t border-[#1E1E1E]">
                    <span>
                      Successor: <strong className="text-white">{ho.successorName || 'Unassigned'}</strong>
                    </span>
                    <span className="text-[#FF8126] font-bold">{ho.handoverScore ?? 92}% Score</span>
                  </div>

                  <Link
                    to={`/handovers/${ho.id}`}
                    className="block text-center w-full py-1.5 px-3 rounded-lg bg-[#1D1D1D] hover:bg-[#252525] border border-[#2A2A2A] text-xs font-bold text-white transition-all shadow-xs"
                  >
                    Open Handover Dossier &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* AI Successor Terminal Launcher */}
          <div className="bg-[#141414] border border-[#FF6B00]/40 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#261407] text-[#FF6B00] border border-[#FF6B00]/40">
                <BotMessageSquare className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                SUCCESSOR CONTEXT ASSISTANT
              </h4>
            </div>

            <p className="text-xs text-[#A1A1A1] leading-relaxed">
              Successors can query authorized predecessor records with exact source citations and anomaly warnings.
            </p>

            <div className="space-y-1.5 text-xs font-mono">
              <Link
                to="/successor-assistant?q=pending"
                className="block p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#202020] border border-[#2A2A2A] text-[#F5F5F5] transition-all hover:border-[#FF6B00]/40 truncate"
              >
                &ldquo;What are my predecessor&apos;s pending tasks?&rdquo;
              </Link>
              <Link
                to="/successor-assistant?q=problems"
                className="block p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#202020] border border-[#2A2A2A] text-[#F5F5F5] transition-all hover:border-[#FF6B00]/40 truncate"
              >
                &ldquo;Which operational problems occurred frequently?&rdquo;
              </Link>
            </div>

            <Link
              to="/successor-assistant"
              className="block text-center py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-black text-xs transition-all shadow-[0_0_15px_rgba(255,107,0,0.25)]"
            >
              Launch Successor Terminal &rarr;
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
