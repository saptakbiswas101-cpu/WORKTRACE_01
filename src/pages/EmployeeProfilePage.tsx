import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Users,
  Briefcase,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ArrowRightLeft,
  Clock,
  FileText,
  CheckCircle2,
  ChevronLeft,
  Edit2,
  Save,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { Employee, DailyActivity, DocumentItem, HandoverReport } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RoleBadge } from '../components/common/RoleBadge';
import { EvidenceTag } from '../components/common/EvidenceTag';
import { useAuth } from '../context/AuthContext';

export const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentRole } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [handover, setHandover] = useState<HandoverReport | null>(null);
  const [activeTab, setActiveTab] = useState<'activities' | 'documents' | 'handover'>('activities');
  const [loading, setLoading] = useState(true);

  // Status edit
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<'Active' | 'On Notice' | 'Exited'>('Active');
  const [exitDate, setExitDate] = useState('');

  useEffect(() => {
    async function fetchEmpData() {
      if (!id) return;
      try {
        setLoading(true);
        const emp = await api.getEmployee(id);
        setEmployee(emp);
        setNewStatus(emp.employmentStatus);
        setExitDate(emp.exitDate || '');

        const [acts, docs, allHandovers] = await Promise.all([
          api.getActivities({ employeeId: emp.id }),
          api.getDocuments(),
          api.getHandovers(),
        ]);

        setActivities(acts);
        setDocuments(docs.filter((d) => d.uploadedByEmployeeId === emp.id));
        const ho = allHandovers.find((h) => h.employeeId === emp.id);
        if (ho) setHandover(ho);
      } catch (err) {
        console.error('Failed to load employee profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEmpData();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!employee) return;
    try {
      const updated = await api.updateEmployee(employee.id, {
        employmentStatus: newStatus,
        exitDate: newStatus !== 'Active' ? exitDate || new Date().toISOString().split('T')[0] : undefined,
      });
      setEmployee(updated);
      setIsEditingStatus(false);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#A1A1A1] text-xs font-mono">
        Loading employee profile data...
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-[#A1A1A1] text-sm">Employee profile not found.</p>
        <Link to="/employees" className="text-[#FF8126] text-xs font-semibold hover:underline">
          &larr; Back to Employee Directory
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6"
    >
      {/* Back button */}
      <Link
        to="/employees"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A1A1A1] hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-[#FF6B00]" />
        BACK TO DIRECTORY
      </Link>

      {/* Main Profile Header Block */}
      <div className="bg-[#111111] rounded-2xl border border-[#222222] p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={employee.avatarUrl}
              alt={employee.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#FF6B00]/40 shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  {employee.name}
                </h1>
                <span className="text-xs font-mono font-bold text-[#FF8126] px-2 py-0.5 rounded bg-[#261407] border border-[#FF6B00]/30">
                  {employee.employeeCode}
                </span>
                <RoleBadge role={employee.role} size="sm" />
                <StatusBadge status={employee.employmentStatus} size="sm" />
              </div>

              <p className="text-sm font-semibold text-[#F5F5F5]">{employee.designation}</p>
              <p className="text-xs text-[#FF6B00] font-mono">{employee.departmentName}</p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#A1A1A1] font-mono">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#686868]" />
                  {employee.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#686868]" />
                  {employee.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#686868]" />
                  Joined: {employee.joiningDate}
                </span>
                {employee.exitDate && (
                  <span className="text-[#FBBF24] font-semibold">
                    Exit: {employee.exitDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className="flex flex-col items-end gap-2.5 shrink-0">
            {handover ? (
              <Link
                to={`/handovers/${handover.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs shadow-xs transition-all"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Handover Dossier ({handover.status})
              </Link>
            ) : (
              (currentRole === 'manager' || currentRole === 'admin') &&
              employee.employmentStatus !== 'Exited' && (
                <Link
                  to={`/handovers?initiate=${employee.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs shadow-xs transition-all"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Initiate Exit Handover
                </Link>
              )
            )}

            {(currentRole === 'manager' || currentRole === 'admin') && (
              <button
                onClick={() => setIsEditingStatus(!isEditingStatus)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#292929] hover:bg-[#181818] text-[#A1A1A1] hover:text-white text-xs font-mono"
              >
                <Edit2 className="w-3 h-3 text-[#FF6B00]" />
                Update Status
              </button>
            )}
          </div>
        </div>

        {/* Status Edit Inline Bar */}
        {isEditingStatus && (
          <div className="pt-4 border-t border-[#1E1E1E] bg-[#161616] p-3.5 rounded-xl flex items-center gap-3 flex-wrap text-xs">
            <span className="font-semibold text-white">Status:</span>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-[#2A2A2A] bg-[#101010] text-xs text-white"
            >
              <option value="Active">Active</option>
              <option value="On Notice">On Notice</option>
              <option value="Exited">Exited</option>
            </select>

            {newStatus !== 'Active' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[#A1A1A1]">Exit Date:</span>
                <input
                  type="date"
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                  className="px-2 py-1 rounded border border-[#2A2A2A] bg-[#101010] text-white text-xs font-mono"
                />
              </div>
            )}

            <button
              onClick={handleUpdateStatus}
              className="px-3.5 py-1.5 rounded-lg bg-[#FF6B00] text-black font-bold text-xs flex items-center gap-1 ml-auto"
            >
              <Save className="w-3 h-3" />
              Save
            </button>
          </div>
        )}

        {/* Responsibilities & Reporting Info Grid */}
        <div className="pt-5 border-t border-[#1E1E1E] grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs font-mono font-bold text-[#A1A1A1] uppercase tracking-wider mb-2.5">
              Assigned Operational Responsibilities
            </h3>
            <ul className="space-y-1.5 text-xs text-[#F5F5F5]">
              {employee.assignedResponsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-2 bg-[#161616] p-2.5 rounded-lg border border-[#242424]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-mono font-bold text-[#A1A1A1] uppercase tracking-wider mb-2.5">
              Transition &amp; Successor Alignment
            </h3>
            <div className="bg-[#161616] p-3.5 rounded-lg border border-[#242424] text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[#686868]">Reporting Manager:</span>
                <span className="font-bold text-white">{employee.managerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#686868]">Designated Successor:</span>
                <span className="font-bold text-[#FF8126]">
                  {handover?.successorName || (employee.currentSuccessorId ? 'Assigned' : 'None Assigned')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#686868]">Handover Dossier:</span>
                <span className="font-mono text-white">
                  {handover ? handover.status : 'Not Started'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#222222]">
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-2.5 text-xs font-bold font-mono transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'activities'
              ? 'border-[#FF6B00] text-[#FF6B00]'
              : 'border-transparent text-[#686868] hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          WORK ACTIVITY LOGBOOK ({activities.length})
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2.5 text-xs font-bold font-mono transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'border-[#FF6B00] text-[#FF6B00]'
              : 'border-transparent text-[#686868] hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          SOPS &amp; OPERATIONAL REPORTS ({documents.length})
        </button>
      </div>

      {/* Tab 1: Activities */}
      {activeTab === 'activities' && (
        <div className="space-y-3">
          {activities.map((act) => (
            <div key={act.id} className="bg-[#111111] rounded-xl p-4 border border-[#222222] shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold text-[#686868] bg-[#161616] px-1.5 py-0.5 rounded border border-[#262626]">
                      {act.id}
                    </span>
                    <h4 className="font-bold text-white text-sm">{act.title}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161616] text-[#A1A1A1] border border-[#262626]">
                      {act.category}
                    </span>
                    <EvidenceTag classification={act.evidenceClassification} size="sm" />
                  </div>
                  <p className="text-[11px] font-mono text-[#686868]">Submitted on {act.submissionDate}</p>
                </div>
                <StatusBadge status={act.status} size="sm" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#161616] p-3.5 rounded-lg border border-[#242424]">
                <div>
                  <strong className="text-white block mb-0.5">1. Work Completed:</strong>
                  <p className="text-[#A1A1A1] leading-relaxed">{act.workCompleted}</p>
                </div>
                <div>
                  <strong className="text-white block mb-0.5">2. Decisions Made:</strong>
                  <p className="text-[#A1A1A1] leading-relaxed">{act.decisionsMade}</p>
                </div>
                <div>
                  <strong className="text-white block mb-0.5">3. Problems &amp; Actions:</strong>
                  <p className="text-[#FBBF24] leading-relaxed">
                    {act.problemsEncountered} &rarr; <span className="text-white">{act.actionsTaken}</span>
                  </p>
                </div>
                <div>
                  <strong className="text-white block mb-0.5">4. Pending Tasks:</strong>
                  <p className="text-[#A1A1A1] leading-relaxed">{act.pendingTasks}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-[#111111] rounded-xl p-4 border border-[#222222] shadow-xs flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#261407] text-[#FF8126] border border-[#FF6B00]/30">
                    {doc.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{doc.docNumber}</span>
                </div>
                <h4 className="font-bold text-white text-sm">{doc.title}</h4>
                <p className="text-xs text-[#A1A1A1] leading-relaxed">{doc.summary}</p>
              </div>
              <Link
                to="/documents"
                className="px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#202020] text-white text-xs font-medium border border-[#2A2A2A] shrink-0"
              >
                Archive &rarr;
              </Link>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
