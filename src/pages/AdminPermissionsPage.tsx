import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Building,
  Key,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
  Terminal,
  Activity,
} from 'lucide-react';
import { api } from '../services/api';
import { Employee, Department, AuditLog, UserRole } from '../types';
import { RoleBadge } from '../components/common/RoleBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const AdminPermissionsPage: React.FC = () => {
  const { currentRole, currentUser } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'audit' | 'roles' | 'departments'>('audit');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const loadAdminData = async () => {
    try {
      const [emps, depts, logs] = await Promise.all([
        api.getEmployees(),
        api.getDepartments(),
        api.getAuditLogs(),
      ]);
      setEmployees(emps);
      setDepartments(depts);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (employeeId: string, newRole: UserRole) => {
    try {
      const updated = await api.updateEmployee(employeeId, { role: newRole });
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (err) {
      console.error('Failed to change role:', err);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('Are you sure you want to reset the demonstration database back to initial synthetic records?')) {
      return;
    }

    try {
      setIsResetting(true);
      await api.resetDatabase();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
      loadAdminData();
    } catch (err) {
      console.error('Failed to reset db:', err);
    } finally {
      setIsResetting(false);
    }
  };

  if (currentRole !== 'admin') {
    return (
      <div className="p-12 text-center space-y-4 max-w-md mx-auto my-12 bg-[#111111] rounded-2xl border border-[#262626]">
        <div className="w-12 h-12 rounded-xl bg-[#261407] text-[#FF6B00] border border-[#FF6B00]/40 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black text-white">Administrator Access Required</h3>
        <p className="text-xs text-[#A1A1A1] leading-relaxed">
          This governance console is restricted to Administrator roles. Use the persona switcher at the top right to switch to <strong className="text-white">Ananya Sen (Admin)</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#261407] border border-[#FF6B00]/30 text-[#FF6B00] text-[11px] font-mono font-bold tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-[#FF6B00]" />
            MODULE G // GOVERNANCE &amp; AUDIT TRAIL
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            System Security &amp; Access Control
          </h1>
          <p className="text-xs text-[#A1A1A1] mt-1">
            Role-Based Access Control (RBAC), security classifications, and immutable activity audit records for ABC Consumer Products.
          </p>
        </div>

        <button
          onClick={handleResetDatabase}
          disabled={isResetting}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#181818] hover:bg-[#222222] text-[#FF6B00] hover:text-[#FF8126] border border-[#333333] hover:border-[#FF6B00]/50 text-xs font-bold transition-all disabled:opacity-50 shrink-0"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          {isResetting ? 'Resetting DB...' : 'Reset Demo Database'}
        </button>
      </div>

      {resetSuccess && (
        <div className="p-3.5 rounded-xl bg-[#0F291E] border border-[#10B981]/40 text-[#6EE7B7] text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          Synthetic database successfully reset to clean demonstration baseline!
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222222]">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-[#FF6B00] text-[#FF6B00]'
              : 'border-transparent text-[#686868] hover:text-[#A1A1A1]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>System Audit Trail ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'border-[#FF6B00] text-[#FF6B00]'
              : 'border-transparent text-[#686868] hover:text-[#A1A1A1]'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Role Assignment Matrix ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'departments'
              ? 'border-[#FF6B00] text-[#FF6B00]'
              : 'border-transparent text-[#686868] hover:text-[#A1A1A1]'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Departments ({departments.length})</span>
        </button>
      </div>

      {/* Tab 1: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-[#111111] rounded-xl border border-[#262626] overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#222222] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF6B00]" />
              <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                Immutable System Activity Log
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#686868]">
              All security actions timestamped &amp; attributed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0B0B] text-[#686868] font-mono uppercase text-[10px] tracking-wider border-b border-[#222222]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">IP / Host</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D1D1D] text-[#A1A1A1]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#161616] transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-[#A1A1A1] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-[#1C1C1C] text-white border border-[#2E2E2E] text-[11px] font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-white">{log.actorName}</span>
                      <span className="text-[10px] text-[#FF6B00] block uppercase font-mono mt-0.5">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-white">
                      {log.targetName || '—'}
                    </td>
                    <td className="px-4 py-3 max-w-sm text-[#A1A1A1] line-clamp-2">
                      {log.details}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-[#686868] whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Role Management */}
      {activeTab === 'roles' && (
        <div className="bg-[#111111] rounded-xl border border-[#262626] overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#222222]">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
              Role-Based Access Control (RBAC) Assignment
            </h3>
            <p className="text-xs text-[#A1A1A1] mt-0.5">
              Change user roles to test permissions enforcement across Employee, Manager, and Administrator functions.
            </p>
          </div>

          <div className="divide-y divide-[#1D1D1D]">
            {employees.map((emp) => (
              <div key={emp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:bg-[#141414] transition-colors">
                <div className="flex items-center gap-3.5">
                  <img
                    src={emp.avatarUrl}
                    alt={emp.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-[#333333]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{emp.name}</span>
                      <span className="font-mono text-[#686868] text-[11px]">({emp.employeeCode})</span>
                      <StatusBadge status={emp.employmentStatus} size="sm" />
                    </div>
                    <p className="text-[#A1A1A1] mt-0.5">
                      {emp.designation} • <span className="text-[#686868]">{emp.departmentName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <RoleBadge role={emp.role} size="sm" />

                  <select
                    value={emp.role}
                    onChange={(e) => handleRoleChange(emp.id, e.target.value as UserRole)}
                    className="px-3 py-1.5 rounded-lg border border-[#333333] text-xs font-semibold bg-[#1A1A1A] text-white focus:outline-none focus:border-[#FF6B00] transition-colors"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Departments */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-[#111111] rounded-xl border border-[#262626] p-5 space-y-3 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold text-[#FF6B00] bg-[#261407] px-2 py-0.5 rounded border border-[#FF6B00]/30">
                    {dept.code}
                  </span>
                  <h4 className="text-base font-black text-white mt-2">{dept.name}</h4>
                </div>
                <span className="text-xs font-mono font-bold text-[#A1A1A1] bg-[#181818] px-2.5 py-1 rounded border border-[#262626]">
                  {dept.employeeCount} Personnel
                </span>
              </div>

              <p className="text-xs text-[#A1A1A1] leading-relaxed">{dept.description}</p>

              <div className="pt-3 border-t border-[#222222] text-xs text-[#686868] flex items-center justify-between">
                <span>
                  Department Head: <strong className="text-white">{dept.headName}</strong>
                </span>
                <span className="text-[11px] text-[#FF6B00] font-mono font-semibold">Active Hub</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
