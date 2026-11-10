import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRightLeft,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Shield,
  Edit2,
  Save,
  Download,
  Share2,
  Plus,
  Trash2,
  BotMessageSquare,
  FileText,
  Clock,
  Layers,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import { HandoverReport, HandoverSection, Employee, EvidenceClassification } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { EvidenceTag } from '../components/common/EvidenceTag';
import { useAuth } from '../context/AuthContext';

export const HandoverReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, currentRole } = useAuth();
  const [handover, setHandover] = useState<HandoverReport | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Successor Assignment Modal
  const [showSuccessorModal, setShowSuccessorModal] = useState(false);
  const [selectedSuccessorId, setSelectedSuccessorId] = useState('');
  const [shareImmediately, setShareImmediately] = useState(true);

  // Section Editing Modal
  const [editingKey, setEditingKey] = useState<keyof HandoverReport | null>(null);
  const [editItemsText, setEditItemsText] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editEvidenceLevel, setEditEvidenceLevel] = useState<EvidenceClassification>('Evidence-supported');

  // Manager Approval Remarks
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [ho, emps] = await Promise.all([
        api.getHandover(id),
        api.getEmployees(),
      ]);
      setHandover(ho);
      setEmployees(emps);
      if (ho.successorId) setSelectedSuccessorId(ho.successorId);
    } catch (err) {
      console.error('Failed to load handover:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleRegenerate = async () => {
    if (!handover) return;
    try {
      setIsRegenerating(true);
      const updated = await api.generateAiHandover(handover.id);
      setHandover(updated);
    } catch (err) {
      console.error('Failed to regenerate AI handover:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleOpenEditSection = (key: keyof HandoverReport) => {
    if (!handover) return;
    const sec = handover[key] as HandoverSection;
    if (!sec || !sec.items) return;

    setEditingKey(key);
    setEditItemsText(sec.items.join('\n'));
    setEditNotes(sec.notes || '');
    setEditEvidenceLevel(sec.evidenceLevel || 'Evidence-supported');
  };

  const handleSaveSection = async () => {
    if (!handover || !editingKey) return;
    const items = editItemsText.split('\n').map((s) => s.trim()).filter(Boolean);

    try {
      const updated = await api.updateHandoverSection(
        handover.id,
        editingKey as string,
        {
          items,
          notes: editNotes,
          evidenceLevel: editEvidenceLevel,
          managerApproved: true,
        }
      );
      setHandover(updated);
      setEditingKey(null);
    } catch (err) {
      console.error('Failed to save section:', err);
    }
  };

  const handleApprove = async () => {
    if (!handover || !currentUser) return;
    try {
      const updated = await api.approveHandover(
        handover.id,
        currentUser.id,
        currentUser.name,
        approvalRemarks || 'Verified by manager. Comprehensive operational knowledge retained.'
      );
      setHandover(updated);
      setShowApprovalModal(false);
    } catch (err) {
      console.error('Failed to approve handover:', err);
    }
  };

  const handleAssignSuccessor = async () => {
    if (!handover || !selectedSuccessorId) return;
    try {
      const updated = await api.assignSuccessor(
        handover.id,
        selectedSuccessorId,
        shareImmediately
      );
      setHandover(updated);
      setShowSuccessorModal(false);
    } catch (err) {
      console.error('Failed to assign successor:', err);
      alert(err instanceof Error ? err.message : 'Error assigning successor');
    }
  };

  const exportMarkdown = () => {
    if (!handover) return;
    let md = `# WORKTRACE Handover Dossier: ${handover.employeeName}\n`;
    md += `**Designation:** ${handover.employeeDesignation} | **Department:** ${handover.departmentName}\n`;
    md += `**Status:** ${handover.status} | **Score:** ${handover.handoverScore}%\n`;
    md += `**Supervising Manager:** ${handover.managerName} | **Successor:** ${handover.successorName || 'Unassigned'}\n\n`;

    const sections: (keyof HandoverReport)[] = [
      'responsibilities',
      'completedProjects',
      'importantDecisions',
      'pendingTasks',
      'unresolvedProblems',
      'recurringOperationalIssues',
      'documentedSolutions',
      'importantContacts',
      'departmentalDependencies',
      'standardOperatingProcedures',
      'relevantSupportingDocuments',
      'evidenceBasedWorkPatterns',
      'missingOrConflictingInformation',
    ];

    sections.forEach((k) => {
      const sec = handover[k] as HandoverSection;
      if (sec && sec.items) {
        md += `## ${sec.title} (${sec.evidenceLevel})\n`;
        sec.items.forEach((item) => (md += `- ${item}\n`));
        if (sec.notes) md += `*Manager Notes: ${sec.notes}*\n`;
        md += '\n';
      }
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WORKTRACE_Handover_${handover.employeeName.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#A1A1A1] text-xs font-mono">
        Loading handover dossier...
      </div>
    );
  }

  if (!handover) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-[#A1A1A1] text-sm">Handover report not found.</p>
        <Link to="/handovers" className="text-[#FF8126] text-xs font-semibold hover:underline">
          &larr; Back to Handover Hub
        </Link>
      </div>
    );
  }

  const sectionsToRender: { key: keyof HandoverReport; section: HandoverSection }[] = [
    { key: 'responsibilities', section: handover.responsibilities },
    { key: 'completedProjects', section: handover.completedProjects },
    { key: 'importantDecisions', section: handover.importantDecisions },
    { key: 'pendingTasks', section: handover.pendingTasks },
    { key: 'unresolvedProblems', section: handover.unresolvedProblems },
    { key: 'recurringOperationalIssues', section: handover.recurringOperationalIssues },
    { key: 'documentedSolutions', section: handover.documentedSolutions },
    { key: 'importantContacts', section: handover.importantContacts },
    { key: 'departmentalDependencies', section: handover.departmentalDependencies },
    { key: 'standardOperatingProcedures', section: handover.standardOperatingProcedures },
    { key: 'relevantSupportingDocuments', section: handover.relevantSupportingDocuments },
    { key: 'evidenceBasedWorkPatterns', section: handover.evidenceBasedWorkPatterns },
    { key: 'missingOrConflictingInformation', section: handover.missingOrConflictingInformation },
  ];

  const isManager = currentRole === 'manager' || currentRole === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6"
    >
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/handovers"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A1A1A1] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-[#FF6B00]" />
          BACK TO HANDOVER HUB
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A2A2A] bg-[#141414] hover:bg-[#1E1E1E] text-white text-xs font-mono font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            Export (.MD)
          </button>

          {isManager && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#261407] hover:bg-[#381B09] text-[#FF8126] border border-[#FF6B00]/40 text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
              {isRegenerating ? 'Re-analyzing...' : 'Re-run Gemini AI Analysis'}
            </button>
          )}

          {isManager && handover.status !== 'Approved' && handover.status !== 'Shared with Successor' && (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-black font-bold text-xs shadow-xs transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              Approve Handover Report
            </button>
          )}

          {isManager && (
            <button
              onClick={() => setShowSuccessorModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs shadow-xs transition-all"
            >
              <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
              {handover.status === 'Shared with Successor' ? 'Successor Shared' : 'Assign & Share with Successor'}
            </button>
          )}

          {handover.status === 'Shared with Successor' && (
            <Link
              to={`/successor-assistant?handoverId=${handover.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs shadow-xs transition-all"
            >
              <BotMessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
              Open Successor Assistant
            </Link>
          )}
        </div>
      </div>

      {/* Main Dossier Header Block */}
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#FF8126] bg-[#261407] px-2 py-0.5 rounded border border-[#FF6B00]/40">
                {handover.id}
              </span>
              <StatusBadge status={handover.status} />
              <span className="text-xs font-mono text-[#34D399] bg-[#0E1A13] border border-[#065F46]/50 px-2 py-0.5 rounded font-bold">
                Confidence: {handover.handoverScore ?? 92}%
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight pt-1">
              Knowledge Handover Dossier: {handover.employeeName}
            </h1>
            <p className="text-xs text-[#A1A1A1]">
              {handover.employeeDesignation} • <span className="text-[#FF6B00] font-semibold">{handover.departmentName}</span>
            </p>
          </div>

          <div className="bg-[#161616] p-4 rounded-xl border border-[#242424] text-xs font-mono space-y-2 shrink-0 md:w-80">
            <div className="flex items-center justify-between">
              <span className="text-[#686868]">SUPERVISING MANAGER:</span>
              <span className="font-bold text-white">{handover.managerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#686868]">DESIGNATED SUCCESSOR:</span>
              <span className="font-bold text-[#FF8126]">
                {handover.successorName || 'Pending Assignment'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#686868]">AI ENGINE:</span>
              <span className="font-medium text-[#F5F5F5] truncate max-w-[150px]">
                {handover.aiEngineUsed}
              </span>
            </div>
          </div>
        </div>

        {handover.managerFinalRemarks && (
          <div className="p-4 rounded-xl bg-[#0E1A13] border border-[#065F46] text-xs text-[#34D399] space-y-1">
            <span className="font-bold font-mono block flex items-center gap-2 text-white">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              OFFICIAL MANAGER VERIFICATION ({handover.managerName}):
            </span>
            <p className="leading-relaxed text-[#A7F3D0]">{handover.managerFinalRemarks}</p>
          </div>
        )}
      </div>

      {/* 13 Handover Modules Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono font-bold text-[#A1A1A1] uppercase tracking-wider">
            13 MANDATORY HANDOVER MODULES
          </h2>
          <span className="text-xs text-[#686868]">
            Click &ldquo;Edit Section&rdquo; to modify bullet items or amend evidence level
          </span>
        </div>

        {sectionsToRender.map(({ key, section }, index) => {
          if (!section) return null;

          const isConflicting = section.evidenceLevel === 'Conflicting';

          return (
            <div
              key={key}
              className={`bg-[#111111] border rounded-2xl p-5 shadow-xs transition-all space-y-3.5 ${
                isConflicting ? 'border-[#EF4444]/60 bg-[#160D0D]' : 'border-[#222222]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1E1E1E]">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="w-5 h-5 rounded-md bg-[#181818] border border-[#2A2A2A] text-white font-mono font-bold text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-white text-sm tracking-tight">{section.title}</h3>
                  <EvidenceTag classification={section.evidenceLevel} size="sm" />
                  {section.managerApproved && (
                    <span className="text-[10px] font-mono font-bold text-[#34D399] bg-[#0E1A13] px-2 py-0.5 rounded border border-[#065F46]">
                      MANAGER VERIFIED
                    </span>
                  )}
                </div>

                {isManager && (
                  <button
                    onClick={() => handleOpenEditSection(key)}
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#FF8126] hover:text-[#FF6B00]"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit Section
                  </button>
                )}
              </div>

              {/* Items List */}
              <ul className="space-y-2 text-xs text-[#F5F5F5]">
                {section.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-[#161616] p-3 rounded-lg border border-[#242424]">
                    <span className="text-[#FF6B00] font-bold mt-0.5">•</span>
                    <span className="flex-1 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              {/* Source Footprint and Notes */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#1E1E1E] text-[11px] font-mono text-[#686868]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[#A1A1A1]">SOURCE RECORDS:</span>
                  {section.sources.map((s, i) => (
                    <span key={i} className="px-1.5 py-0.2 rounded bg-[#181818] border border-[#262626] text-[#FF8126] font-bold">
                      {s}
                    </span>
                  ))}
                </div>

                {section.notes && (
                  <span className="text-[#A1A1A1] italic">
                    Note: &ldquo;{section.notes}&rdquo;
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Edit Modal */}
      {editingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#141414] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#292929] space-y-4">
            <h3 className="text-base font-bold text-white font-mono uppercase">
              Edit Handover Module: {String(editingKey)}
            </h3>
            <p className="text-xs text-[#A1A1A1]">
              Managers can edit bullet items, append context, and calibrate evidence levels.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">
                  Bullet Items (one item per line)
                </label>
                <textarea
                  rows={6}
                  value={editItemsText}
                  onChange={(e) => setEditItemsText(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">
                  Evidence Classification
                </label>
                <select
                  value={editEvidenceLevel}
                  onChange={(e) => setEditEvidenceLevel(e.target.value as EvidenceClassification)}
                  className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white"
                >
                  <option value="Evidence-supported">Evidence-supported</option>
                  <option value="Verified by manager">Verified by manager</option>
                  <option value="Uncertain">Uncertain</option>
                  <option value="Conflicting">Conflicting</option>
                  <option value="Missing information">Missing information</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">
                  Manager Verification Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verified with warehouse supervisor; priority for Day 1."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#222222] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingKey(null)}
                className="px-3 py-1.5 text-xs text-[#A1A1A1] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSection}
                className="px-4 py-2 text-xs font-bold text-black bg-[#FF6B00] hover:bg-[#FF8126] rounded-lg shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manager Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#141414] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#292929] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              Official Manager Approval
            </h3>
            <p className="text-xs text-[#A1A1A1] leading-relaxed">
              Verify that the 13 modules accurately reflect {handover.employeeName}&apos;s responsibilities and pending tasks.
            </p>

            <div className="text-xs space-y-2">
              <label className="block font-semibold text-[#A1A1A1]">Manager Verification Remarks</label>
              <textarea
                rows={3}
                placeholder="e.g. Comprehensive handover report verified. Successor is shadowed on floor. Approved."
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div className="pt-3 border-t border-[#222222] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="px-3 py-1.5 text-xs text-[#A1A1A1] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="px-4 py-2 text-xs font-bold text-black bg-[#10B981] hover:bg-[#059669] rounded-lg shadow-xs"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Successor Assignment & Sharing Modal */}
      {showSuccessorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#141414] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#292929] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#FF6B00]" />
              Assign Successor &amp; Grant Access
            </h3>
            <p className="text-xs text-[#A1A1A1] leading-relaxed">
              Designate the successor taking over {handover.employeeName}&apos;s duties and unlock the AI Context Assistant.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">
                  Select Successor Employee <span className="text-[#FF6B00]">*</span>
                </label>
                <select
                  value={selectedSuccessorId}
                  onChange={(e) => setSelectedSuccessorId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="">Choose an active employee...</option>
                  {employees
                    .filter((e) => e.id !== handover.employeeId && e.employmentStatus === 'Active')
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.employeeCode} - {e.designation}) [{e.departmentName}]
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#181818] rounded-lg border border-[#2A2A2A]">
                <input
                  type="checkbox"
                  id="shareImmediate"
                  checked={shareImmediately}
                  onChange={(e) => setShareImmediately(e.target.checked)}
                  className="rounded accent-[#FF6B00]"
                />
                <label htmlFor="shareImmediate" className="text-xs text-white font-medium cursor-pointer">
                  Share immediately with successor (Requires Manager Approval)
                </label>
              </div>

              {handover.status !== 'Approved' && shareImmediately && (
                <div className="p-3 bg-[#1F1608] rounded-lg border border-[#B45309]/50 text-[#FBBF24] text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <span>
                    <strong>Human Approval Mandatory:</strong> Unapproved reports cannot be shared. Click &ldquo;Approve Handover Report&rdquo; first.
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#222222] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSuccessorModal(false)}
                className="px-3 py-1.5 text-xs text-[#A1A1A1] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignSuccessor}
                disabled={!selectedSuccessorId}
                className="px-4 py-2 text-xs font-bold text-black bg-[#FF6B00] hover:bg-[#FF8126] rounded-lg shadow-xs disabled:opacity-50"
              >
                Save &amp; Grant Access
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
