import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Clock,
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronUp,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { DailyActivity, Department, Employee } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { EvidenceTag } from '../components/common/EvidenceTag';

export const ActivityHistoryPage: React.FC = () => {
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const [acts, depts, emps] = await Promise.all([
        api.getActivities({
          department: selectedDept !== 'All' ? selectedDept : undefined,
          employeeId: selectedEmployee !== 'All' ? selectedEmployee : undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          status: selectedStatus !== 'All' ? selectedStatus : undefined,
          search: search.trim() || undefined,
        }),
        api.getDepartments(),
        api.getEmployees(),
      ]);
      setActivities(acts);
      setDepartments(depts);
      setEmployees(emps);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [selectedDept, selectedEmployee, selectedCategory, selectedStatus]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `worktrace_activities_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

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
              <Clock className="w-5 h-5 text-[#FF6B00]" />
              Organisational Work Activity Logbook
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#A1A1A1] border border-[#2A2A2A]">
              {activities.length} RECORDS
            </span>
          </div>
          <p className="text-xs text-[#A1A1A1] mt-0.5">
            Chronological audit of daily employee submissions, decisions, operational issues, and workarounds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2A2A2A] bg-[#141414] hover:bg-[#1E1E1E] text-[#A1A1A1] hover:text-white text-xs font-mono font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
          <Link
            to="/submit-activity"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Submit Work Log
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#686868] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search across work completed, problems encountered, decisions made..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadActivities()}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#161616] border border-[#262626] text-xs text-white placeholder-[#686868] focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Department */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#262626] bg-[#161616] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Employee */}
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#262626] bg-[#161616] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="All">All Authors</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#262626] bg-[#161616] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="All">All Categories</option>
              <option value="Daily Operations">Daily Operations</option>
              <option value="Decision Making">Decision Making</option>
              <option value="Problem Resolution">Problem Resolution</option>
              <option value="Customer Interaction">Customer Interaction</option>
              <option value="Project Work">Project Work</option>
              <option value="Planning and Strategy">Planning and Strategy</option>
              <option value="Pending Tasks">Pending Tasks</option>
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#262626] bg-[#161616] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[#686868] pt-2 border-t border-[#1E1E1E]">
          <span>
            Displaying <strong className="text-white">{activities.length}</strong> activity logs matching filters
          </span>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDept('All');
              setSelectedEmployee('All');
              setSelectedCategory('All');
              setSelectedStatus('All');
            }}
            className="text-[#FF8126] hover:underline"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Activity Log List */}
      <div className="space-y-3">
        {activities.map((act) => {
          const isExpanded = expandedId === act.id;

          return (
            <div
              key={act.id}
              className={`bg-[#111111] rounded-xl border transition-all overflow-hidden ${
                isExpanded ? 'border-[#FF6B00]/60 ring-1 ring-[#FF6B00]/30' : 'border-[#222222] hover:border-[#333333]'
              }`}
            >
              {/* Header Bar */}
              <div
                onClick={() => toggleExpand(act.id)}
                className="p-4 cursor-pointer hover:bg-[#161616] transition-colors flex items-start justify-between gap-4 select-none"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold text-[#686868] bg-[#161616] px-1.5 py-0.5 rounded border border-[#262626]">
                      {act.id}
                    </span>
                    <h3 className="font-bold text-white text-sm hover:text-[#FF8126] transition-colors">
                      {act.title}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161616] text-[#A1A1A1] border border-[#262626]">
                      {act.category}
                    </span>
                    <EvidenceTag classification={act.evidenceClassification} size="sm" />
                  </div>

                  <p className="text-xs text-[#A1A1A1] line-clamp-1">
                    <strong className="text-white">Completed:</strong> {act.workCompleted}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#686868]">
                    <span className="font-bold text-white">{act.employeeName}</span>
                    <span>•</span>
                    <span>{act.departmentName}</span>
                    <span>•</span>
                    <span>{act.submissionDate}</span>
                    {act.pendingTasks && act.pendingTasks !== 'No immediate pending handovers.' && (
                      <>
                        <span>•</span>
                        <span className="text-[#FF8126] font-semibold bg-[#261407] px-1.5 py-0.5 rounded border border-[#FF6B00]/30">
                          Pending Handover Task
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={act.status} size="sm" />
                  <button className="text-[#686868] hover:text-white p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#FF6B00]" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Detailed 7 Questions View */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-[#1E1E1E] space-y-4 bg-[#0D0D0D] text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Q1 */}
                    <div className="bg-[#141414] p-3.5 rounded-lg border border-[#242424]">
                      <span className="font-bold text-white block mb-1">
                        1. Work Completed
                      </span>
                      <p className="text-[#A1A1A1] leading-relaxed">{act.workCompleted}</p>
                    </div>

                    {/* Q2 */}
                    <div className="bg-[#141414] p-3.5 rounded-lg border border-[#242424]">
                      <span className="font-bold text-white block mb-1">
                        2. Decisions Made
                      </span>
                      <p className="text-[#A1A1A1] leading-relaxed">{act.decisionsMade}</p>
                    </div>

                    {/* Q3 */}
                    <div className="bg-[#141414] p-3.5 rounded-lg border border-[#242424]">
                      <span className="font-bold text-white block mb-1">
                        3. Problems Encountered
                      </span>
                      <p className="text-[#FBBF24] leading-relaxed">{act.problemsEncountered}</p>
                    </div>

                    {/* Q4 */}
                    <div className="bg-[#141414] p-3.5 rounded-lg border border-[#242424]">
                      <span className="font-bold text-white block mb-1">
                        4. Actions Taken
                      </span>
                      <p className="text-[#34D399] leading-relaxed">{act.actionsTaken}</p>
                    </div>

                    {/* Q5 */}
                    <div className="bg-[#141414] p-3.5 rounded-lg border border-[#242424]">
                      <span className="font-bold text-white block mb-1">
                        5. Tasks Still Pending
                      </span>
                      <p className="text-[#A1A1A1] leading-relaxed">{act.pendingTasks}</p>
                    </div>

                    {/* Q7 */}
                    <div className="bg-[#141414] p-3.5 rounded-lg border border-[#242424]">
                      <span className="font-bold text-white block mb-1">
                        7. Observations &amp; Lessons
                      </span>
                      <p className="text-[#A1A1A1] leading-relaxed">{act.observationsLessons}</p>
                    </div>
                  </div>

                  {/* Footnote */}
                  <div className="bg-[#141414] p-3 rounded-lg border border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-[#686868]">
                    <div>
                      <span className="text-white mr-1.5 font-bold">Collaborators:</span>
                      <span>{act.peopleInvolved.join(', ') || 'None recorded'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span>Permission: <strong className="text-white">{act.permissionLevel}</strong></span>
                      <Link
                        to={`/employees/${act.employeeId}`}
                        className="text-[#FF8126] hover:underline font-bold"
                      >
                        Author Profile &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
