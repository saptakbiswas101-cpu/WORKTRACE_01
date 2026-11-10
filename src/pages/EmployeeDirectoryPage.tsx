import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Users,
  Search,
  Filter,
  Plus,
  ArrowRightLeft,
  MapPin,
  Calendar,
  ChevronRight,
  Table as TableIcon,
  LayoutGrid,
  Building,
} from 'lucide-react';
import { api } from '../services/api';
import { Employee, Department } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { RoleBadge } from '../components/common/RoleBadge';
import { useAuth } from '../context/AuthContext';

export const EmployeeDirectoryPage: React.FC = () => {
  const { currentRole } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [loading, setLoading] = useState(true);

  // New employee modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpDesignation, setNewEmpDesignation] = useState('');
  const [newEmpDeptId, setNewEmpDeptId] = useState('dept-1');
  const [newEmpStatus, setNewEmpStatus] = useState<'Active' | 'On Notice' | 'Exited'>('Active');
  const [newEmpResponsibilities, setNewEmpResponsibilities] = useState('');

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const [empList, deptList] = await Promise.all([
        api.getEmployees({
          department: selectedDept !== 'All' ? selectedDept : undefined,
          status: selectedStatus !== 'All' ? selectedStatus : undefined,
          search: search.trim() || undefined,
        }),
        api.getDepartments(),
      ]);
      setEmployees(empList);
      setDepartments(deptList);
    } catch (err) {
      console.error('Failed to load employee directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [selectedDept, selectedStatus]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpDesignation) return;

    try {
      await api.createEmployee({
        name: newEmpName,
        designation: newEmpDesignation,
        departmentId: newEmpDeptId,
        employmentStatus: newEmpStatus,
        assignedResponsibilities: newEmpResponsibilities
          ? newEmpResponsibilities.split('\n').filter(Boolean)
          : ['Core departmental operations'],
      });
      setShowAddModal(false);
      setNewEmpName('');
      setNewEmpDesignation('');
      setNewEmpResponsibilities('');
      loadEmployees();
    } catch (err) {
      console.error('Failed to create employee:', err);
    }
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
              <Users className="w-5 h-5 text-[#FF6B00]" />
              Organisational Personnel Directory
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#A1A1A1] border border-[#2A2A2A]">
              {employees.length} EMPLOYEES
            </span>
          </div>
          <p className="text-xs text-[#A1A1A1] mt-0.5">
            Personnel profiles with roles, designated reporting lines, and exit handover status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#141414] border border-[#242424] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-mono flex items-center gap-1 transition-all ${
                viewMode === 'table' ? 'bg-[#FF6B00] text-black font-bold' : 'text-[#686868] hover:text-white'
              }`}
              title="Table view"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-mono flex items-center gap-1 transition-all ${
                viewMode === 'grid' ? 'bg-[#FF6B00] text-black font-bold' : 'text-[#686868] hover:text-white'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {(currentRole === 'admin' || currentRole === 'manager') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(255,107,0,0.25)]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full md:w-80">
          <Search className="w-4 h-4 text-[#686868] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, ID, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadEmployees()}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#161616] border border-[#262626] text-xs text-white placeholder-[#686868] focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#262626] bg-[#161616] text-xs text-[#F5F5F5] font-medium focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#262626] bg-[#161616] text-xs text-[#F5F5F5] font-medium focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Notice">On Notice</option>
            <option value="Exited">Exited</option>
          </select>
        </div>
      </div>

      {/* View 1: Clean Professional Table Layout */}
      {viewMode === 'table' ? (
        <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] text-[#686868] uppercase font-mono text-[10px] tracking-wider border-b border-[#222222]">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Designation</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Reporting Manager</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A] text-[#A1A1A1]">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-[#161616] transition-colors group cursor-pointer"
                  >
                    {/* Employee Name & Code */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Link to={`/employees/${emp.id}`} className="flex items-center gap-3">
                        <img
                          src={emp.avatarUrl}
                          alt={emp.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-[#333333] shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white group-hover:text-[#FF8126] transition-colors">
                            {emp.name}
                          </div>
                          <div className="font-mono text-[10px] text-[#686868]">
                            {emp.employeeCode}
                          </div>
                        </div>
                      </Link>
                    </td>

                    {/* Designation */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-white">
                      {emp.designation}
                    </td>

                    {/* Department */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#A1A1A1]">
                      {emp.departmentName}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <RoleBadge role={emp.role} size="sm" />
                    </td>

                    {/* Employment Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={emp.employmentStatus} size="sm" />
                    </td>

                    {/* Reporting Manager */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-[#F5F5F5]">
                      {emp.managerName}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {emp.handoverId ? (
                          <Link
                            to={`/handovers/${emp.handoverId}`}
                            className="px-2.5 py-1 rounded bg-[#261407] hover:bg-[#381B09] text-[#FF8126] border border-[#FF6B00]/40 font-mono text-[10px] font-bold"
                          >
                            HANDOVER DOSSIER
                          </Link>
                        ) : (
                          <Link
                            to={`/employees/${emp.id}`}
                            className="px-2.5 py-1 rounded bg-[#181818] hover:bg-[#202020] text-[#A1A1A1] hover:text-white border border-[#2A2A2A] text-xs font-medium"
                          >
                            Profile &rarr;
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View 2: Asymmetrical Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className={`bg-[#111111] border rounded-xl p-5 transition-all flex flex-col justify-between ${
                emp.employmentStatus === 'On Notice'
                  ? 'border-[#FF6B00]/50 bg-[#1A120B]'
                  : 'border-[#222222] hover:border-[#383838]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatarUrl}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-[#333333] shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-white text-sm">{emp.name}</h3>
                      <p className="text-[10px] font-mono text-[#686868]">{emp.employeeCode}</p>
                      <p className="text-xs text-[#A1A1A1] mt-0.5">{emp.designation}</p>
                    </div>
                  </div>
                  <StatusBadge status={emp.employmentStatus} size="sm" />
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E1E1E] space-y-1.5 text-xs text-[#A1A1A1]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#686868]">Dept:</span>
                    <span className="font-semibold text-white">{emp.departmentName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#686868]">Manager:</span>
                    <span className="text-white">{emp.managerName}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[#686868]">Joined:</span>
                    <span>{emp.joiningDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1E1E1E] flex items-center justify-between">
                <RoleBadge role={emp.role} size="sm" />
                <Link
                  to={`/employees/${emp.id}`}
                  className="text-xs font-semibold text-[#FF8126] hover:text-[#FF6B00] flex items-center gap-1"
                >
                  View Profile &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#141414] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#292929] space-y-4">
            <h3 className="text-base font-bold text-white">Add Synthetic Employee Profile</h3>
            <p className="text-xs text-[#A1A1A1]">
              Simulate operational responsibilities and handover workflows.
            </p>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sumanth Varma"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#181818] border border-[#292929] text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inbound Gate Lead"
                  value={newEmpDesignation}
                  onChange={(e) => setNewEmpDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#181818] border border-[#292929] text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">Department</label>
                <select
                  value={newEmpDeptId}
                  onChange={(e) => setNewEmpDeptId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#181818] border border-[#292929] text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">Employment Status</label>
                <select
                  value={newEmpStatus}
                  onChange={(e) => setNewEmpStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#181818] border border-[#292929] text-white focus:outline-none focus:border-[#FF6B00]"
                >
                  <option value="Active">Active</option>
                  <option value="On Notice">On Notice</option>
                  <option value="Exited">Exited</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">
                  Assigned Responsibilities (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Daily cycle counting...&#10;Cold storage telemetry..."
                  value={newEmpResponsibilities}
                  onChange={(e) => setNewEmpResponsibilities(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#181818] border border-[#292929] text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="pt-3 border-t border-[#222222] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-[#A1A1A1] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-black bg-[#FF6B00] hover:bg-[#FF8126] rounded-lg shadow-xs"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};
