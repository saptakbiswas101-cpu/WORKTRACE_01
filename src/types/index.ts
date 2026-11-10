export type UserRole = 'employee' | 'manager' | 'admin';

export type EmploymentStatus = 'Active' | 'On Notice' | 'Exited';

export type PermissionLevel = 'Public' | 'Department' | 'Management Confidential';

export type ActivityCategory =
  | 'Daily Operations'
  | 'Decision Making'
  | 'Problem Resolution'
  | 'Customer Interaction'
  | 'Project Work'
  | 'Planning and Strategy'
  | 'Pending Tasks';

export type EvidenceClassification =
  | 'Evidence-supported'
  | 'Verified by manager'
  | 'Uncertain'
  | 'Conflicting'
  | 'Missing information';

export type HandoverStatus =
  | 'Not Started'
  | 'Processing'
  | 'Awaiting Review'
  | 'Approved'
  | 'Shared with Successor';

export interface Employee {
  id: string;
  employeeCode: string; // e.g. "EMP-101"
  name: string;
  email: string;
  designation: string;
  departmentId: string;
  departmentName: string;
  managerId: string;
  managerName: string;
  joiningDate: string;
  exitDate?: string;
  employmentStatus: EmploymentStatus;
  contactNumber: string;
  location: string;
  avatarUrl: string;
  role: UserRole;
  assignedResponsibilities: string[];
  currentSuccessorId?: string;
  handoverId?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headName: string;
  employeeCount: number;
  description: string;
}

export interface DailyActivity {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  submissionDate: string;
  category: ActivityCategory;
  title: string;
  // The 7 required structured questions
  workCompleted: string;
  decisionsMade: string;
  problemsEncountered: string;
  actionsTaken: string;
  pendingTasks: string;
  peopleInvolved: string[]; // List of names or departments
  observationsLessons: string;
  
  status: 'Completed' | 'In Progress' | 'Blocked';
  permissionLevel: PermissionLevel;
  relatedDocumentIds?: string[];
  evidenceClassification: EvidenceClassification;
  managerNotes?: string;
  isFlaggedForHandover?: boolean;
}

export interface DocumentItem {
  id: string;
  title: string;
  docNumber: string;
  fileType: 'pdf' | 'docx' | 'txt';
  fileSize: string;
  departmentName: string;
  departmentId: string;
  uploadedByEmployeeId: string;
  uploadedByEmployeeName: string;
  uploadDate: string;
  category: 'SOP' | 'Operational Report' | 'Strategy & Planning' | 'Incident & Audit';
  permissionLevel: PermissionLevel;
  summary: string;
  contentSnippet: string;
  keyTakeaways: string[];
}

export interface HandoverSection {
  title: string;
  items: string[];
  sources: string[];
  evidenceLevel: EvidenceClassification;
  managerApproved?: boolean;
  notes?: string;
}

export interface HandoverReport {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDesignation: string;
  departmentName: string;
  managerId: string;
  managerName: string;
  successorId?: string;
  successorName?: string;
  status: HandoverStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  sharedAt?: string;
  aiGenerated: boolean;
  aiEngineUsed: string;
  
  // Handover Report Core Modules
  responsibilities: HandoverSection;
  completedProjects: HandoverSection;
  importantDecisions: HandoverSection;
  pendingTasks: HandoverSection;
  unresolvedProblems: HandoverSection;
  recurringOperationalIssues: HandoverSection;
  documentedSolutions: HandoverSection;
  importantContacts: HandoverSection;
  departmentalDependencies: HandoverSection;
  standardOperatingProcedures: HandoverSection;
  relevantSupportingDocuments: HandoverSection;
  evidenceBasedWorkPatterns: HandoverSection;
  missingOrConflictingInformation: HandoverSection;
  
  managerFinalRemarks?: string;
  handoverScore?: number; // 0-100 completion/confidence score
}

export interface AIInsight {
  id: string;
  category: string;
  headline: string;
  description: string;
  supportingSourceRecords: { id: string; title: string; date: string }[];
  evidenceClassification: EvidenceClassification;
  confidenceScore: number; // 0-100
  uncertaintyNotes?: string;
  impactLevel: 'High' | 'Medium' | 'Low';
  department: string;
  detectedAt: string;
}

export interface SuccessorMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  citedSources?: {
    sourceId: string;
    title: string;
    date: string;
    classification: EvidenceClassification;
  }[];
  isAiGenerated?: boolean;
  uncertaintyDisclaimer?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  targetId?: string;
  targetName?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}
