import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRightLeft,
  Plus,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  UserCheck,
  ChevronRight,
  AlertTriangle,
  BotMessageSquare,
  Shield,
  Layers,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { HandoverReport, Employee } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const HandoverManagementPage: React.FC = () => {
  const { currentRole, currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [handovers, setHandovers] = useState<HandoverReport[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Initiate Handover Modal
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedSuccessorId, setSelectedSuccessorId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hoList, empList] = await Promise.all([
        api.getHandovers(),
        api.getEmployees(),
      ]);
      setHandovers(hoList);
      setEmployees(empList);

      const initEmp = searchParams.get('initiate');
      if (initEmp) {
        setSelectedEmpId(initEmp);
        setShowInitiateModal(true);
      }
    } catch (err) {
      console.error('Failed to load handovers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !currentUser) return;

    try {
      setIsProcessing(true);
      const newHo = await api.initiateHandover(
        selectedEmpId,
        currentUser.id,
        selectedSuccessorId || undefined
      );

      // Trigger AI generation immediately
      await api.generateAiHandover(newHo.id);

      setShowInitiateModal(false);
      setSelectedEmpId('');
      setSelectedSuccessorId('');
      loadData();
    } catch (err) {
      console.error('Failed to initiate handover:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const workflowSteps = [
    { num: '01', title: 'INITIATION', desc: 'Notice period logged' },
    { num: '02', title: 'AI EXTRACTION', desc: 'Gemini indexes 13 modules' },
    { num: '03', title: 'MANAGER REVIEW', desc: 'Edits, verification & sign-off' },
    { num: '04', title: 'SUCCESSOR ASSIGN', desc: 'Designate onboarding successor' },
    { num: '05', title: 'CONTEXT Q&A', desc: 'Interactive assistant query' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-[#FF6B00]" />
              Employee Exit &amp; Handover Hub
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#A1A1A1] border border-[#2A2A2A]">
              KNOWLEDGE PRESERVATION
            </span>
          </div>
          <p className="text-xs text-[#A1A1A1] mt-0.5">
            5-step structured handover lifecycle preventing operational memory loss during employee transitions.
          </p>
        </div>

        {(currentRole === 'manager' || currentRole === 'admin') && (
          <button
            onClick={() => setShowInitiateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs shadow-xs transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Initiate Exit Handover
          </button>
        )}
      </div>

      {/* Horizontal Technical Workflow Lifecycle Tracker */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-[#686868] uppercase tracking-wider">
            HANDOVER LIFECYCLE SEQUENCE
          </span>
          <span className="text-[10px] font-mono text-[#FF8126]">MANDATORY HUMAN APPROVAL</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className="bg-[#161616] p-3.5 rounded-xl border border-[#242424] relative overflow-hidden"
            >
              <div className="flex items-center justify-between font-mono text-[#FF6B00] text-xs font-black mb-1">
                <span>{step.num}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
              </div>
              <div className="font-bold text-white text-xs font-mono">{step.title}</div>
              <p className="text-[11px] text-[#A1A1A1] mt-0.5 leading-snug">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Handover Dossiers Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Active Handover Dossiers
          </h3>
          <span className="text-xs font-mono text-[#686868]">{handovers.length} records</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {handovers.map((ho) => (
            <div
              key={ho.id}
              className="bg-[#111111] border border-[#222222] hover:border-[#383838] p-5 rounded-2xl shadow-xs transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#686868] bg-[#161616] px-1.5 py-0.5 rounded border border-[#262626]">
                        {ho.id}
                      </span>
                      <StatusBadge status={ho.status} size="sm" />
                    </div>

                    <h4 className="text-base font-extrabold text-white mt-1.5">
                      {ho.employeeName}
                    </h4>
                    <p className="text-xs text-[#A1A1A1]">
                      {ho.employeeDesignation} • <span className="font-mono text-[#FF6B00]">{ho.departmentName}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-mono font-black text-[#FF6B00] block">
                      {ho.handoverScore ?? 92}%
                    </span>
                    <span className="text-[10px] font-mono text-[#686868]">COMPLETION</span>
                  </div>
                </div>

                {/* Handover Metadata */}
                <div className="bg-[#161616] p-3.5 rounded-xl border border-[#242424] text-xs space-y-2 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#686868]">MANAGER:</span>
                    <span className="font-bold text-white">{ho.managerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#686868]">SUCCESSOR:</span>
                    <span className="font-bold text-[#FF8126]">
                      {ho.successorName || 'Pending Assignment'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#686868]">TASKS DOCUMENTED:</span>
                    <span className="text-white font-bold">{ho.pendingTasks.items.length} Pending Tasks</span>
                  </div>
                </div>

                {ho.missingOrConflictingInformation.items.length > 0 && (
                  <div className="bg-[#1F1608] p-3 rounded-xl border border-[#B45309]/50 text-xs text-[#FBBF24] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      <strong>Anomaly Detected:</strong> {ho.missingOrConflictingInformation.items[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-[#1E1E1E] flex items-center justify-between gap-2">
                <Link
                  to={`/handovers/${ho.id}`}
                  className="px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <span>Review 13 Modules</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                {ho.status === 'Shared with Successor' && (
                  <Link
                    to={`/successor-assistant?handoverId=${ho.id}`}
                    className="px-3 py-2 rounded-lg bg-[#181818] hover:bg-[#202020] text-[#FF8126] text-xs font-mono font-bold border border-[#FF6B00]/30 flex items-center gap-1"
                  >
                    <BotMessageSquare className="w-3.5 h-3.5" />
                    Query Assistant
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Initiate Handover Modal */}
      {showInitiateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#141414] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#292929] space-y-4">
            <h3 className="text-base font-bold text-white">Initiate Employee Exit Handover</h3>
            <p className="text-xs text-[#A1A1A1]">
              Select an employee entering notice period to aggregate their daily logs and trigger AI analysis.
            </p>

            <form onSubmit={handleInitiate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">
                  Departing Employee <span className="text-[#FF6B00]">*</span>
                </label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="">Select Employee...</option>
                  {employees
                    .filter((e) => e.employmentStatus !== 'Exited')
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.employeeCode} - {e.designation}) [{e.employmentStatus}]
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">
                  Designated Successor (Optional)
                </label>
                <select
                  value={selectedSuccessorId}
                  onChange={(e) => setSelectedSuccessorId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="">Assign later during manager review...</option>
                  {employees
                    .filter((e) => e.id !== selectedEmpId && e.employmentStatus === 'Active')
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.designation} - {e.departmentName})
                      </option>
                    ))}
                </select>
              </div>

              <div className="bg-[#261407] p-3 rounded-xl border border-[#FF6B00]/40 text-[#FF8126] text-[11px] space-y-1">
                <span className="font-bold font-mono block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
                  GEMINI 3.8 FLASH SYNTHESIS:
                </span>
                <p className="text-[#F5F5F5] leading-relaxed">
                  Upon initiation, WORKTRACE retrieves all daily activities and departmental SOPs, generating an evidence-backed 13-module handover report.
                </p>
              </div>

              <div className="pt-3 border-t border-[#222222] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInitiateModal(false)}
                  className="px-3 py-1.5 text-xs text-[#A1A1A1] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !selectedEmpId}
                  className="px-4 py-2 text-xs font-bold text-black bg-[#FF6B00] hover:bg-[#FF8126] rounded-lg shadow-xs disabled:opacity-50"
                >
                  {isProcessing ? 'Generating Synthesis...' : 'Initiate & Generate Dossier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};
