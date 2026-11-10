import {
  Employee,
  Department,
  DailyActivity,
  DocumentItem,
  HandoverReport,
  AuditLog,
  AIInsight,
  HandoverSection,
  SuccessorMessage
} from '../types';

export const api = {
  // System & Stats
  async getSystemInfo(): Promise<{ companyName: string; isAiLive: boolean; modelName: string; totalRecords: number }> {
    const res = await fetch('/api/system/info');
    return res.json();
  },

  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/system/reset', { method: 'POST' });
    return res.json();
  },

  async getStats(): Promise<{
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
  }> {
    const res = await fetch('/api/stats');
    return res.json();
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const res = await fetch('/api/departments');
    return res.json();
  },

  // Employees
  async getEmployees(params?: { department?: string; status?: string; search?: string }): Promise<Employee[]> {
    const url = new URL('/api/employees', window.location.origin);
    if (params?.department) url.searchParams.set('department', params.department);
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.search) url.searchParams.set('search', params.search);
    const res = await fetch(url.toString());
    return res.json();
  },

  async getEmployee(id: string): Promise<Employee> {
    const res = await fetch(`/api/employees/${id}`);
    if (!res.ok) throw new Error('Failed to fetch employee');
    return res.json();
  },

  async createEmployee(employee: Partial<Employee>): Promise<Employee> {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee),
    });
    if (!res.ok) throw new Error('Failed to create employee');
    return res.json();
  },

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update employee');
    return res.json();
  },

  // Activities
  async getActivities(params?: {
    employeeId?: string;
    department?: string;
    category?: string;
    status?: string;
    permission?: string;
    search?: string;
  }): Promise<DailyActivity[]> {
    const url = new URL('/api/activities', window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v);
      });
    }
    const res = await fetch(url.toString());
    return res.json();
  },

  async getActivity(id: string): Promise<DailyActivity> {
    const res = await fetch(`/api/activities/${id}`);
    return res.json();
  },

  async createActivity(activity: Partial<DailyActivity>): Promise<DailyActivity> {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    });
    if (!res.ok) throw new Error('Failed to submit activity');
    return res.json();
  },

  // Documents
  async getDocuments(params?: { department?: string; category?: string; permission?: string; search?: string }): Promise<DocumentItem[]> {
    const url = new URL('/api/documents', window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v);
      });
    }
    const res = await fetch(url.toString());
    return res.json();
  },

  async uploadDocument(doc: Partial<DocumentItem>): Promise<DocumentItem> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    if (!res.ok) throw new Error('Failed to upload document');
    return res.json();
  },

  // Knowledge Central Query
  async queryKnowledge(params?: {
    employeeId?: string;
    department?: string;
    category?: string;
    permission?: string;
    query?: string;
  }): Promise<any[]> {
    const url = new URL('/api/knowledge', window.location.origin);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v);
      });
    }
    const res = await fetch(url.toString());
    return res.json();
  },

  // Handovers
  async getHandovers(): Promise<HandoverReport[]> {
    const res = await fetch('/api/handovers');
    return res.json();
  },

  async getHandover(id: string): Promise<HandoverReport> {
    const res = await fetch(`/api/handovers/${id}`);
    if (!res.ok) throw new Error('Failed to fetch handover');
    return res.json();
  },

  async initiateHandover(employeeId: string, managerId: string, successorId?: string): Promise<HandoverReport> {
    const res = await fetch('/api/handovers/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, managerId, successorId }),
    });
    if (!res.ok) throw new Error('Failed to initiate handover');
    return res.json();
  },

  async generateAiHandover(handoverId: string): Promise<HandoverReport> {
    const res = await fetch(`/api/handovers/${handoverId}/generate-ai`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to generate AI handover');
    return res.json();
  },

  async updateHandoverSection(
    handoverId: string,
    sectionKey: string,
    sectionData: Partial<HandoverSection>,
    managerRemarks?: string
  ): Promise<HandoverReport> {
    const res = await fetch(`/api/handovers/${handoverId}/section`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionKey, sectionData, managerRemarks }),
    });
    if (!res.ok) throw new Error('Failed to update handover section');
    return res.json();
  },

  async approveHandover(handoverId: string, managerId: string, managerName: string, remarks?: string): Promise<HandoverReport> {
    const res = await fetch(`/api/handovers/${handoverId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ managerId, managerName, remarks }),
    });
    if (!res.ok) throw new Error('Failed to approve handover');
    return res.json();
  },

  async assignSuccessor(handoverId: string, successorId: string, shareImmediately: boolean): Promise<HandoverReport> {
    const res = await fetch(`/api/handovers/${handoverId}/assign-successor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ successorId, shareImmediately }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to assign successor');
    }
    return res.json();
  },

  // AI Successor Q&A
  async askSuccessorAssistant(
    handoverId: string,
    successorId: string,
    userQuery: string
  ): Promise<{
    answer: string;
    citedSources: any[];
    isAiGenerated: boolean;
    engine: string;
    uncertaintyDisclaimer?: string;
    timestamp: string;
  }> {
    const res = await fetch('/api/ai/successor-qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handoverId, successorId, userQuery }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to get answer from Successor Assistant');
    }
    return res.json();
  },

  // Insights & Audit
  async getInsights(): Promise<AIInsight[]> {
    const res = await fetch('/api/insights');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit');
    return res.json();
  },
};
