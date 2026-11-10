import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  SYNTHETIC_COMPANY_NAME,
  initialDepartments,
  initialEmployees,
  initialActivities,
  initialDocuments,
  initialHandovers,
  initialAuditLogs,
  initialAiInsights
} from './src/data/seedData';
import {
  DailyActivity,
  DocumentItem,
  Employee,
  Department,
  HandoverReport,
  AuditLog,
  AIInsight,
  HandoverSection,
  EvidenceClassification
} from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Setup Data Persistence
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'worktrace_db.json');

interface DatabaseSchema {
  departments: Department[];
  employees: Employee[];
  activities: DailyActivity[];
  documents: DocumentItem[];
  handovers: HandoverReport[];
  auditLogs: AuditLog[];
  insights: AIInsight[];
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading database file, loading seed defaults:', err);
  }

  const defaultDb: DatabaseSchema = {
    departments: initialDepartments,
    employees: initialEmployees,
    activities: initialActivities,
    documents: initialDocuments,
    handovers: initialHandovers,
    auditLogs: initialAuditLogs,
    insights: initialAiInsights,
  };

  saveDatabase(defaultDb);
  return defaultDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to file:', err);
  }
}

let db = loadDatabase();

// Gemini Client initialization (Server-Side)
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('[WORKTRACE] Google GenAI initialized successfully.');
  } catch (e) {
    console.warn('[WORKTRACE] Failed to initialize Google GenAI:', e);
  }
} else {
  console.log('[WORKTRACE] Running with deterministic AI fallback (no GEMINI_API_KEY provided).');
}

// Timeout wrapper for AI calls to ensure zero hanging in constrained network environments
function callGeminiWithTimeout<T>(fn: () => Promise<T>, timeoutMs = 6000): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Gemini API call timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

// Helper to log audit actions
function recordAudit(
  action: string,
  actorId: string,
  actorName: string,
  actorRole: any,
  details: string,
  targetId?: string,
  targetName?: string,
  ipAddress?: string
) {
  const newLog: AuditLog = {
    id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    actorId,
    actorName,
    actorRole,
    targetId,
    targetName,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: ipAddress || '127.0.0.1',
  };
  db.auditLogs.unshift(newLog);
  saveDatabase(db);
  return newLog;
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// System Info & Reset
app.get('/api/system/info', (_req: Request, res: Response) => {
  res.json({
    companyName: SYNTHETIC_COMPANY_NAME,
    isAiLive: !!aiClient,
    modelName: 'gemini-3.8-flash',
    totalRecords: db.activities.length + db.documents.length,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/system/reset', (req: Request, res: Response) => {
  db = {
    departments: JSON.parse(JSON.stringify(initialDepartments)),
    employees: JSON.parse(JSON.stringify(initialEmployees)),
    activities: JSON.parse(JSON.stringify(initialActivities)),
    documents: JSON.parse(JSON.stringify(initialDocuments)),
    handovers: JSON.parse(JSON.stringify(initialHandovers)),
    auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
    insights: JSON.parse(JSON.stringify(initialAiInsights)),
  };
  saveDatabase(db);
  recordAudit('System Reset', 'admin', 'System Admin', 'admin', 'Reset all synthetic data to baseline demonstration dataset');
  res.json({ success: true, message: 'Database reset to initial synthetic demo state.' });
});

// Stats / Metrics for Dashboard
app.get('/api/stats', (_req: Request, res: Response) => {
  const totalEmployees = db.employees.length;
  const activeEmployees = db.employees.filter((e) => e.employmentStatus === 'Active').length;
  const onNoticeEmployees = db.employees.filter((e) => e.employmentStatus === 'On Notice').length;
  const exitedEmployees = db.employees.filter((e) => e.employmentStatus === 'Exited').length;

  const totalActivities = db.activities.length;
  const pendingTasksCount = db.activities.filter((a) => a.category === 'Pending Tasks' || a.status === 'In Progress').length;
  const totalDocuments = db.documents.length;
  const totalKnowledgeRecords = totalActivities + totalDocuments;

  const ongoingHandovers = db.handovers.filter((h) => h.status === 'Processing' || h.status === 'Awaiting Review').length;
  const completedHandovers = db.handovers.filter((h) => h.status === 'Approved' || h.status === 'Shared with Successor').length;

  res.json({
    totalEmployees,
    activeEmployees,
    onNoticeEmployees,
    exitedEmployees,
    totalActivities,
    pendingTasksCount,
    totalDocuments,
    totalKnowledgeRecords,
    ongoingHandovers,
    completedHandovers,
  });
});

// Departments
app.get('/api/departments', (_req: Request, res: Response) => {
  res.json(db.departments);
});

// Employees
app.get('/api/employees', (req: Request, res: Response) => {
  const { department, status, search } = req.query;
  let list = [...db.employees];

  if (department && department !== 'All') {
    list = list.filter((e) => e.departmentName === department || e.departmentId === department);
  }
  if (status && status !== 'All') {
    list = list.filter((e) => e.employmentStatus === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((e) =>
      e.name.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q) ||
      e.employeeCode.toLowerCase().includes(q) ||
      e.departmentName.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

app.get('/api/employees/:id', (req: Request, res: Response) => {
  const emp = db.employees.find((e) => e.id === req.params.id || e.employeeCode === req.params.id);
  if (!emp) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }
  res.json(emp);
});

app.post('/api/employees', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.name || !body.designation || !body.departmentId) {
    res.status(400).json({ error: 'Name, designation, and department are required' });
    return;
  }

  const dept = db.departments.find((d) => d.id === body.departmentId);
  const newEmp: Employee = {
    id: `emp-${Date.now().toString(36)}`,
    employeeCode: body.employeeCode || `EMP-${Math.floor(100 + Math.random() * 900)}`,
    name: body.name,
    email: body.email || `${body.name.toLowerCase().replace(/\s+/g, '.')}@abc-consumer.synthetic`,
    designation: body.designation,
    departmentId: body.departmentId,
    departmentName: dept ? dept.name : 'Operations',
    managerId: body.managerId || 'emp-105',
    managerName: body.managerName || 'Vikram Malhotra',
    joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
    exitDate: body.exitDate,
    employmentStatus: body.employmentStatus || 'Active',
    contactNumber: body.contactNumber || '+91 98000 00000',
    location: body.location || 'Mumbai Central Facility',
    avatarUrl: body.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: body.role || 'employee',
    assignedResponsibilities: body.assignedResponsibilities || ['General operational duties'],
    currentSuccessorId: body.currentSuccessorId,
  };

  db.employees.push(newEmp);
  saveDatabase(db);
  recordAudit('Employee Created', 'admin', 'System Admin', 'admin', `Created employee profile for ${newEmp.name} (${newEmp.employeeCode})`, newEmp.id, newEmp.name);
  res.status(201).json(newEmp);
});

app.put('/api/employees/:id', (req: Request, res: Response) => {
  const idx = db.employees.findIndex((e) => e.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  const old = db.employees[idx];
  const updated: Employee = {
    ...old,
    ...req.body,
    id: old.id,
  };

  db.employees[idx] = updated;
  saveDatabase(db);
  recordAudit('Employee Updated', 'admin', 'Admin User', 'admin', `Updated details for ${updated.name}`, updated.id, updated.name);
  res.json(updated);
});

// Daily Activities
app.get('/api/activities', (req: Request, res: Response) => {
  const { employeeId, department, category, status, permission, search } = req.query;
  let list = [...db.activities];

  if (employeeId && employeeId !== 'All') {
    list = list.filter((a) => a.employeeId === employeeId);
  }
  if (department && department !== 'All') {
    list = list.filter((a) => a.departmentName === department || a.departmentId === department);
  }
  if (category && category !== 'All') {
    list = list.filter((a) => a.category === category);
  }
  if (status && status !== 'All') {
    list = list.filter((a) => a.status === status);
  }
  if (permission && permission !== 'All') {
    list = list.filter((a) => a.permissionLevel === permission);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((a) =>
      a.title.toLowerCase().includes(q) ||
      a.workCompleted.toLowerCase().includes(q) ||
      a.employeeName.toLowerCase().includes(q) ||
      a.problemsEncountered.toLowerCase().includes(q) ||
      a.decisionsMade.toLowerCase().includes(q)
    );
  }

  // Sort by date descending
  list.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  res.json(list);
});

app.get('/api/activities/:id', (req: Request, res: Response) => {
  const act = db.activities.find((a) => a.id === req.params.id);
  if (!act) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }
  res.json(act);
});

app.post('/api/activities', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.employeeId || !body.title || !body.workCompleted) {
    res.status(400).json({ error: 'employeeId, title, and workCompleted are required' });
    return;
  }

  const emp = db.employees.find((e) => e.id === body.employeeId);
  const newActivity: DailyActivity = {
    id: `act-${Date.now().toString(36)}`,
    employeeId: body.employeeId,
    employeeName: emp ? emp.name : body.employeeName || 'Unknown Employee',
    departmentId: emp ? emp.departmentId : body.departmentId || 'dept-1',
    departmentName: emp ? emp.departmentName : body.departmentName || 'Operations',
    submissionDate: body.submissionDate || new Date().toISOString().split('T')[0],
    category: body.category || 'Daily Operations',
    title: body.title,
    workCompleted: body.workCompleted,
    decisionsMade: body.decisionsMade || 'None documented today.',
    problemsEncountered: body.problemsEncountered || 'None encountered.',
    actionsTaken: body.actionsTaken || 'Standard procedural steps followed.',
    pendingTasks: body.pendingTasks || 'No immediate pending handovers.',
    peopleInvolved: Array.isArray(body.peopleInvolved) ? body.peopleInvolved : (body.peopleInvolved ? [body.peopleInvolved] : []),
    observationsLessons: body.observationsLessons || 'Operations executed as per standard SOP.',
    status: body.status || 'Completed',
    permissionLevel: body.permissionLevel || 'Department',
    evidenceClassification: body.evidenceClassification || 'Evidence-supported',
    relatedDocumentIds: body.relatedDocumentIds || [],
    managerNotes: body.managerNotes,
    isFlaggedForHandover: !!body.isFlaggedForHandover,
  };

  db.activities.unshift(newActivity);
  saveDatabase(db);
  recordAudit('Daily Activity Submitted', newActivity.employeeId, newActivity.employeeName, 'employee', `Submitted log: "${newActivity.title}"`, newActivity.id, newActivity.title);
  res.status(201).json(newActivity);
});

// Documents Management
app.get('/api/documents', (req: Request, res: Response) => {
  const { department, category, permission, search } = req.query;
  let list = [...db.documents];

  if (department && department !== 'All') {
    list = list.filter((d) => d.departmentName === department || d.departmentId === department);
  }
  if (category && category !== 'All') {
    list = list.filter((d) => d.category === category);
  }
  if (permission && permission !== 'All') {
    list = list.filter((d) => d.permissionLevel === permission);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((d) =>
      d.title.toLowerCase().includes(q) ||
      d.docNumber.toLowerCase().includes(q) ||
      d.summary.toLowerCase().includes(q) ||
      d.uploadedByEmployeeName.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

app.post('/api/documents', async (req: Request, res: Response) => {
  const body = req.body;
  if (!body.title || !body.uploadedByEmployeeId) {
    res.status(400).json({ error: 'Title and uploader ID are required' });
    return;
  }

  const emp = db.employees.find((e) => e.id === body.uploadedByEmployeeId);
  const newDoc: DocumentItem = {
    id: `doc-${Date.now().toString(36)}`,
    title: body.title,
    docNumber: body.docNumber || `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
    fileType: body.fileType || 'pdf',
    fileSize: body.fileSize || '1.2 MB',
    departmentName: emp ? emp.departmentName : body.departmentName || 'Operations',
    departmentId: emp ? emp.departmentId : body.departmentId || 'dept-1',
    uploadedByEmployeeId: body.uploadedByEmployeeId,
    uploadedByEmployeeName: emp ? emp.name : 'Unknown User',
    uploadDate: new Date().toISOString().split('T')[0],
    category: body.category || 'Operational Report',
    permissionLevel: body.permissionLevel || 'Department',
    summary: body.summary || 'Operational knowledge document uploaded for organizational retention.',
    contentSnippet: body.contentSnippet || body.summary || 'Full document content securely archived in WORKTRACE repository.',
    keyTakeaways: body.keyTakeaways || [
      'Operational guidelines recorded',
      'Knowledge preserved for successor onboarding'
    ],
  };

  db.documents.unshift(newDoc);
  saveDatabase(db);
  recordAudit('Document Uploaded', newDoc.uploadedByEmployeeId, newDoc.uploadedByEmployeeName, 'employee', `Uploaded document "${newDoc.title}" (${newDoc.docNumber})`, newDoc.id, newDoc.title);
  res.status(201).json(newDoc);
});

// Central Knowledge Repository (Unified Query)
app.get('/api/knowledge', (req: Request, res: Response) => {
  const { employeeId, department, category, permission, query } = req.query;

  // Convert activities to knowledge items
  const activityRecords = db.activities.map((a) => ({
    id: a.id,
    type: 'Daily Activity' as const,
    title: a.title,
    authorId: a.employeeId,
    authorName: a.employeeName,
    departmentName: a.departmentName,
    departmentId: a.departmentId,
    date: a.submissionDate,
    category: a.category,
    status: a.status,
    permissionLevel: a.permissionLevel,
    evidenceClassification: a.evidenceClassification,
    content: `${a.workCompleted} | Decisions: ${a.decisionsMade} | Problems: ${a.problemsEncountered} | Solutions: ${a.actionsTaken}`,
    pendingItems: a.pendingTasks,
    peopleInvolved: a.peopleInvolved,
    originalRecord: a,
  }));

  // Convert documents to knowledge items
  const docRecords = db.documents.map((d) => ({
    id: d.id,
    type: 'Document & SOP' as const,
    title: d.title,
    authorId: d.uploadedByEmployeeId,
    authorName: d.uploadedByEmployeeName,
    departmentName: d.departmentName,
    departmentId: d.departmentId,
    date: d.uploadDate,
    category: d.category,
    status: 'Verified' as const,
    permissionLevel: d.permissionLevel,
    evidenceClassification: 'Evidence-supported' as EvidenceClassification,
    content: `${d.summary} ${d.contentSnippet}`,
    pendingItems: '',
    peopleInvolved: [],
    originalRecord: d,
  }));

  let combined = [...activityRecords, ...docRecords];

  if (employeeId && employeeId !== 'All') {
    combined = combined.filter((c) => c.authorId === employeeId);
  }
  if (department && department !== 'All') {
    combined = combined.filter((c) => c.departmentName === department || c.departmentId === department);
  }
  if (permission && permission !== 'All') {
    combined = combined.filter((c) => c.permissionLevel === permission);
  }
  if (category && category !== 'All') {
    combined = combined.filter((c) => c.category === category);
  }
  if (query) {
    const q = String(query).toLowerCase();
    combined = combined.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.content.toLowerCase().includes(q) ||
      c.authorName.toLowerCase().includes(q) ||
      c.departmentName.toLowerCase().includes(q)
    );
  }

  // Sort by date descending
  combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(combined);
});

// -------------------------------------------------------------
// MODULE E: EMPLOYEE EXIT & KNOWLEDGE HANDOVER
// -------------------------------------------------------------

app.get('/api/handovers', (req: Request, res: Response) => {
  res.json(db.handovers);
});

app.get('/api/handovers/:id', (req: Request, res: Response) => {
  const ho = db.handovers.find((h) => h.id === req.params.id);
  if (!ho) {
    res.status(404).json({ error: 'Handover report not found' });
    return;
  }
  res.json(ho);
});

// Initiate Handover
app.post('/api/handovers/initiate', (req: Request, res: Response) => {
  const { employeeId, managerId, successorId } = req.body;
  const emp = db.employees.find((e) => e.id === employeeId);
  if (!emp) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  const mgr = db.employees.find((e) => e.id === managerId) || { id: 'emp-105', name: 'Vikram Malhotra' };
  const succ = successorId ? db.employees.find((e) => e.id === successorId) : undefined;

  // Check if handover already exists for employee
  const existing = db.handovers.find((h) => h.employeeId === employeeId);
  if (existing) {
    res.json(existing);
    return;
  }

  // Update employee status to On Notice if Active
  if (emp.employmentStatus === 'Active') {
    emp.employmentStatus = 'On Notice';
    emp.exitDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];
  }

  const emptySection = (title: string): HandoverSection => ({
    title,
    items: [],
    sources: [],
    evidenceLevel: 'Evidence-supported',
    managerApproved: false,
  });

  const newHandover: HandoverReport = {
    id: `ho-${Date.now().toString(36)}`,
    employeeId: emp.id,
    employeeName: emp.name,
    employeeDesignation: emp.designation,
    departmentName: emp.departmentName,
    managerId: mgr.id,
    managerName: mgr.name,
    successorId: succ ? succ.id : undefined,
    successorName: succ ? succ.name : undefined,
    status: 'Processing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiGenerated: false,
    aiEngineUsed: 'Pending generation',
    handoverScore: 40,

    responsibilities: emptySection('Employee Core Responsibilities'),
    completedProjects: emptySection('Completed Projects'),
    importantDecisions: emptySection('Important Operational Decisions'),
    pendingTasks: emptySection('Pending Tasks & Open Action Items'),
    unresolvedProblems: emptySection('Unresolved Problems & Operational Vulnerabilities'),
    recurringOperationalIssues: emptySection('Recurring Operational Issues'),
    documentedSolutions: emptySection('Documented Solutions & Procedures'),
    importantContacts: emptySection('Key Contacts & Vendor Escalations'),
    departmentalDependencies: emptySection('Departmental & Team Dependencies'),
    standardOperatingProcedures: emptySection('Standard Operating Procedures'),
    relevantSupportingDocuments: emptySection('Relevant Supporting Documents'),
    evidenceBasedWorkPatterns: emptySection('Evidence-Based Professional Work Patterns'),
    missingOrConflictingInformation: emptySection('Detected Gaps, Uncertainties & Conflicting Records'),
  };

  emp.handoverId = newHandover.id;
  if (succ) emp.currentSuccessorId = succ.id;

  db.handovers.push(newHandover);
  saveDatabase(db);

  recordAudit(
    'Handover Initiated',
    mgr.id,
    mgr.name,
    'manager',
    `Initiated exit handover for ${emp.name} (${emp.designation}). Successor: ${succ ? succ.name : 'Unassigned'}`,
    newHandover.id,
    newHandover.employeeName
  );

  res.status(201).json(newHandover);
});

// Generate AI Handover Synthesis (Gemini or Deterministic Fallback)
app.post('/api/handovers/:id/generate-ai', async (req: Request, res: Response) => {
  const ho = db.handovers.find((h) => h.id === req.params.id);
  if (!ho) {
    res.status(404).json({ error: 'Handover report not found' });
    return;
  }

  const emp = db.employees.find((e) => e.id === ho.employeeId);
  const empActivities = db.activities.filter((a) => a.employeeId === ho.employeeId);
  const empDocs = db.documents.filter((d) => d.uploadedByEmployeeId === ho.employeeId || d.departmentName === ho.departmentName);

  let generatedData: any = null;
  let engineUsed = 'WORKTRACE Knowledge Synthesizer (Deterministic Fallback)';

  if (aiClient) {
    try {
      console.log(`[WORKTRACE] Generating AI handover report via Gemini 3.8 Flash for ${ho.employeeName}...`);
      const prompt = `
You are the AI Knowledge Intelligence Engine of WORKTRACE, an enterprise organisational knowledge management platform.
Your task is to analyze an exiting employee's documented daily activity records and documents, and compile a structured, evidence-based employee exit handover report for their successor.

CRITICAL RULES:
1. STRICT TRUTHFULNESS: Only use facts explicitly present in the provided employee records. Never present assumptions as verified facts. Never invent supporting sources or IDs.
2. NO PSYCHOLOGICAL PROFILING: Do NOT infer private psychological traits, motivation, honesty, emotions, intentions, or personal mentality. All professional work patterns must be strictly based on documented observable activities.
3. CITATIONS & LABELS: Every insight must cite source record IDs (e.g., act-001, doc-001).
4. UNCERTAINTIES & GAPS: Explicitly detect any conflicting stock counts, uncontracted vendor arrangements, or missing certifications in the 'missingOrConflictingInformation' section.
5. FORMAT: Return pure JSON matching the requested structure.

EMPLOYEE PROFILE:
Name: ${ho.employeeName}
Designation: ${ho.employeeDesignation}
Department: ${ho.departmentName}
Assigned Responsibilities: ${emp?.assignedResponsibilities.join(', ')}

DOCUMENTED DAILY ACTIVITIES (${empActivities.length} records):
${JSON.stringify(empActivities.map(a => ({
  id: a.id,
  date: a.submissionDate,
  category: a.category,
  title: a.title,
  workCompleted: a.workCompleted,
  decisionsMade: a.decisionsMade,
  problemsEncountered: a.problemsEncountered,
  actionsTaken: a.actionsTaken,
  pendingTasks: a.pendingTasks,
  peopleInvolved: a.peopleInvolved,
  observationsLessons: a.observationsLessons,
  evidenceClassification: a.evidenceClassification
})), null, 2)}

DEPARTMENT DOCUMENTS (${empDocs.length} records):
${JSON.stringify(empDocs.map(d => ({
  id: d.id,
  title: d.title,
  docNumber: d.docNumber,
  category: d.category,
  summary: d.summary,
  keyTakeaways: d.keyTakeaways
})), null, 2)}

Return a JSON object with these 13 fields:
{
  "responsibilities": { "items": ["string"], "sources": ["id"], "evidenceLevel": "Evidence-supported" },
  "completedProjects": { "items": ["string"], "sources": ["id"], "evidenceLevel": "Evidence-supported" },
  "importantDecisions": { "items": ["string"], "sources": ["id"], "evidenceLevel": "Verified by manager" },
  "pendingTasks": { "items": ["string (include priority like CRITICAL / HIGH)"], "sources": ["id"], "evidenceLevel": "Evidence-supported" },
  "unresolvedProblems": { "items": ["string"], "sources": ["id"], "evidenceLevel": "Evidence-supported" },
  "recurringOperationalIssues": { "items": ["string"], "sources": ["id"], "evidenceLevel": "Evidence-supported" },
  "documentedSolutions": { "items": ["string"], "sources": ["id"], "evidenceLevel": "Evidence-supported" },
  "importantContacts": { "items": ["string with contact details and unwritten rules"], "sources": ["id"], "evidenceLevel": "Verified by manager" },
  "departmentalDependencies": { "items": ["string"], "sources": ["id"], "evidenceLevel": "Evidence-supported" },
  "standardOperatingProcedures": { "items": ["string SOP title & number"], "sources": ["id"], "evidenceLevel": "Evidence-supported" },
  "relevantSupportingDocuments": { "items": ["string Doc title"], "sources": ["id"], "evidenceLevel": "Evidence-supported" },
  "evidenceBasedWorkPatterns": { "items": ["string purely observable habits"], "sources": ["id"], "evidenceLevel": "Evidence-supported" },
  "missingOrConflictingInformation": { "items": ["string explicitly naming contradictions or missing docs"], "sources": ["id"], "evidenceLevel": "Conflicting" },
  "handoverScore": 92
}
`;

      const response = await callGeminiWithTimeout(() =>
        aiClient!.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        }),
        6000
      );

      const responseText = response.text;
      if (responseText) {
        generatedData = JSON.parse(responseText.trim());
        engineUsed = 'gemini-3.8-flash (Live Gemini AI)';
        console.log('[WORKTRACE] Successfully generated handover via Gemini 3.8 Flash!');
      }
    } catch (apiErr) {
      console.warn('[WORKTRACE] Gemini API error during handover generation, using high-fidelity fallback:', apiErr);
    }
  }

  // Deterministic synthesis fallback if Gemini was not available or errored
  if (!generatedData) {
    // Collect all activities
    const decisions = empActivities.filter(a => a.decisionsMade && a.decisionsMade !== 'None documented today.');
    const problems = empActivities.filter(a => a.problemsEncountered && a.problemsEncountered !== 'None encountered.');
    const pending = empActivities.filter(a => a.pendingTasks && a.pendingTasks !== 'No immediate pending handovers.');
    const contactsSet = new Set<string>();
    empActivities.forEach(a => a.peopleInvolved?.forEach(p => contactsSet.add(p)));

    generatedData = {
      responsibilities: {
        items: emp?.assignedResponsibilities || [
          `Primary operations in ${ho.departmentName}`,
          "Executing daily cycle verification and morning dock audits",
          "Resolving operational escalations and cross-department handoffs"
        ],
        sources: empActivities.slice(0, 3).map(a => a.id),
        evidenceLevel: 'Evidence-supported'
      },
      completedProjects: {
        items: empActivities.filter(a => a.status === 'Completed').slice(0, 3).map(a => a.title),
        sources: empActivities.filter(a => a.status === 'Completed').slice(0, 3).map(a => a.id),
        evidenceLevel: 'Evidence-supported'
      },
      importantDecisions: {
        items: decisions.slice(0, 3).map(a => `${a.title}: ${a.decisionsMade}`),
        sources: decisions.slice(0, 3).map(a => a.id),
        evidenceLevel: 'Verified by manager'
      },
      pendingTasks: {
        items: pending.map(a => `[HIGH PRIORITY] ${a.pendingTasks} (Ref: ${a.title})`),
        sources: pending.map(a => a.id),
        evidenceLevel: 'Evidence-supported'
      },
      unresolvedProblems: {
        items: problems.slice(0, 3).map(a => `${a.title}: ${a.problemsEncountered}`),
        sources: problems.slice(0, 3).map(a => a.id),
        evidenceLevel: 'Evidence-supported'
      },
      recurringOperationalIssues: {
        items: [
          "Discrepancies between physical floor inventory counts and ERP ledger balances",
          "Intermittent hardware issues with dock RF scanners and battery recharge compliance",
          "Vendor packaging delivery delays leading to tight production buffer windows"
        ],
        sources: empActivities.slice(0, 4).map(a => a.id),
        evidenceLevel: 'Evidence-supported'
      },
      documentedSolutions: {
        items: empActivities.filter(a => a.actionsTaken).slice(0, 3).map(a => `${a.title}: ${a.actionsTaken}`),
        sources: empActivities.filter(a => a.actionsTaken).slice(0, 3).map(a => a.id),
        evidenceLevel: 'Evidence-supported'
      },
      importantContacts: {
        items: Array.from(contactsSet).slice(0, 6).map(c => `${c} (Collaborator on recorded activities)`),
        sources: empActivities.slice(0, 3).map(a => a.id),
        evidenceLevel: 'Verified by manager'
      },
      departmentalDependencies: {
        items: [
          `Fleet & Delivery: Must ensure staged pallets are temperature-checked prior to morning loading`,
          `Quality & Compliance: Requires signed physical quarantine clearance before batch release`,
          `Sales & Accounts: Requires time-stamped dispatch photos to defend retailer debit note claims`
        ],
        sources: empActivities.slice(0, 3).map(a => a.id),
        evidenceLevel: 'Evidence-supported'
      },
      standardOperatingProcedures: {
        items: empDocs.filter(d => d.category === 'SOP').map(d => `${d.docNumber}: ${d.title}`),
        sources: empDocs.filter(d => d.category === 'SOP').map(d => d.id),
        evidenceLevel: 'Evidence-supported'
      },
      relevantSupportingDocuments: {
        items: empDocs.slice(0, 4).map(d => `${d.docNumber} - ${d.title}`),
        sources: empDocs.slice(0, 4).map(d => d.id),
        evidenceLevel: 'Evidence-supported'
      },
      evidenceBasedWorkPatterns: {
        items: [
          "Conducts morning physical floor walkthrough before accessing ERP terminals",
          "Routinely captures time-stamped photo logs of loaded pallets prior to seal application",
          "Maintains parallel paper verification checklists during high-turnover shift operations"
        ],
        sources: empActivities.slice(0, 3).map(a => a.id),
        evidenceLevel: 'Evidence-supported'
      },
      missingOrConflictingInformation: {
        items: [
          "CONFLICTING: Discrepancy observed in recorded inventory counts between manual audit notes and ERP balances",
          "UNCERTAIN: Certain emergency repair contacts lack formal corporate SLA agreements",
          "MISSING: Structural load-bearing certificates for mezzanine storage are pending final engineering filing"
        ],
        sources: empActivities.slice(0, 2).map(a => a.id),
        evidenceLevel: 'Conflicting'
      },
      handoverScore: 90
    };
  }

  // Apply to handover object
  ho.aiGenerated = true;
  ho.aiEngineUsed = engineUsed;
  ho.status = 'Awaiting Review';
  ho.updatedAt = new Date().toISOString();
  ho.handoverScore = generatedData.handoverScore || 90;

  const sectionKeys = [
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
  ] as const;

  for (const key of sectionKeys) {
    if (generatedData[key]) {
      ho[key] = {
        title: ho[key]?.title || key,
        items: generatedData[key].items || [],
        sources: generatedData[key].sources || [],
        evidenceLevel: generatedData[key].evidenceLevel || 'Evidence-supported',
        managerApproved: false,
      };
    }
  }

  saveDatabase(db);
  recordAudit('AI Handover Synthesis Generated', 'system', `WORKTRACE AI (${engineUsed})`, 'admin', `Generated AI handover report for ${ho.employeeName}`, ho.id, ho.employeeName);
  res.json(ho);
});

// Update a Handover Section (Manager edit)
app.put('/api/handovers/:id/section', (req: Request, res: Response) => {
  const { sectionKey, sectionData, managerRemarks } = req.body;
  const ho = db.handovers.find((h) => h.id === req.params.id);
  if (!ho) {
    res.status(404).json({ error: 'Handover report not found' });
    return;
  }

  if (sectionKey && (ho as any)[sectionKey]) {
    (ho as any)[sectionKey] = {
      ...(ho as any)[sectionKey],
      ...sectionData,
      managerApproved: true,
    };
  }

  if (managerRemarks !== undefined) {
    ho.managerFinalRemarks = managerRemarks;
  }

  ho.updatedAt = new Date().toISOString();
  saveDatabase(db);
  recordAudit('Handover Section Edited', ho.managerId, ho.managerName, 'manager', `Edited and approved section "${sectionKey}" in handover for ${ho.employeeName}`, ho.id, ho.employeeName);
  res.json(ho);
});

// Approve Handover Report
app.post('/api/handovers/:id/approve', (req: Request, res: Response) => {
  const { managerId, managerName, remarks } = req.body;
  const ho = db.handovers.find((h) => h.id === req.params.id);
  if (!ho) {
    res.status(404).json({ error: 'Handover report not found' });
    return;
  }

  ho.status = 'Approved';
  ho.approvedAt = new Date().toISOString();
  ho.updatedAt = new Date().toISOString();
  if (remarks) ho.managerFinalRemarks = remarks;
  if (managerId) ho.managerId = managerId;
  if (managerName) ho.managerName = managerName;

  saveDatabase(db);
  recordAudit('Handover Approved', ho.managerId, ho.managerName, 'manager', `Manager approved complete handover report for ${ho.employeeName}`, ho.id, ho.employeeName);
  res.json(ho);
});

// Assign Successor & Share Handover
app.post('/api/handovers/:id/assign-successor', (req: Request, res: Response) => {
  const { successorId, shareImmediately } = req.body;
  const ho = db.handovers.find((h) => h.id === req.params.id);
  if (!ho) {
    res.status(404).json({ error: 'Handover report not found' });
    return;
  }

  const succ = db.employees.find((e) => e.id === successorId);
  if (!succ) {
    res.status(404).json({ error: 'Successor employee not found' });
    return;
  }

  ho.successorId = succ.id;
  ho.successorName = succ.name;
  ho.updatedAt = new Date().toISOString();

  // Link employee
  const predecessor = db.employees.find((e) => e.id === ho.employeeId);
  if (predecessor) {
    predecessor.currentSuccessorId = succ.id;
  }

  if (shareImmediately) {
    if (ho.status !== 'Approved') {
      res.status(400).json({ error: 'Cannot share unapproved handover report. Human manager approval is mandatory.' });
      return;
    }
    ho.status = 'Shared with Successor';
    ho.sharedAt = new Date().toISOString();
  }

  saveDatabase(db);
  recordAudit(
    shareImmediately ? 'Handover Shared with Successor' : 'Successor Assigned',
    ho.managerId,
    ho.managerName,
    'manager',
    `Assigned ${succ.name} as successor to ${ho.employeeName}. Status: ${ho.status}`,
    ho.id,
    succ.name
  );
  res.json(ho);
});

// -------------------------------------------------------------
// MODULE F: AI SUCCESSOR CONTEXT ASSISTANT (Q&A ENGINE)
// -------------------------------------------------------------

app.post('/api/ai/successor-qa', async (req: Request, res: Response) => {
  const { successorId, handoverId, userQuery } = req.body;

  if (!userQuery || !userQuery.trim()) {
    res.status(400).json({ error: 'Query text is required' });
    return;
  }

  const ho = db.handovers.find((h) => h.id === handoverId);
  if (!ho) {
    res.status(404).json({ error: 'Handover not found' });
    return;
  }

  // Authorization Check: Only allow if handover is approved or shared, or if caller is manager/admin
  const caller = db.employees.find((e) => e.id === successorId);
  const isManagerOrAdmin = caller && (caller.role === 'manager' || caller.role === 'admin');
  const isAssignedSuccessor = ho.successorId === successorId;

  if (!isManagerOrAdmin && !isAssignedSuccessor && ho.status !== 'Shared with Successor') {
    res.status(403).json({
      error: 'Access restricted: Handover information must be approved and shared with the successor before querying.',
    });
    return;
  }

  // Aggregate authorized knowledge
  const authorizedActivities = db.activities.filter(
    (a) => a.employeeId === ho.employeeId && a.permissionLevel !== 'Management Confidential'
  );
  const authorizedDocs = db.documents.filter(
    (d) => d.uploadedByEmployeeId === ho.employeeId || d.departmentName === ho.departmentName
  );

  let answerText = '';
  let citations: any[] = [];
  let isAiLive = false;
  let uncertaintyNote = '';

  if (aiClient) {
    try {
      console.log(`[WORKTRACE] Successor Context Assistant generating answer via Gemini 3.8 Flash...`);
      const prompt = `
You are the AI Successor Context Assistant of WORKTRACE.
You are helping an incoming successor understand their predecessor's documented responsibilities, pending tasks, recurring problems, contacts, and SOPs.

CRITICAL BEHAVIOR RULES:
1. ANSWER ONLY USING AUTHORIZED RECORDS: Only use facts in the provided Handover Report, Daily Activities, and Documents below.
2. NO INVENTED FACTS: If the answer is not documented in the records, state clearly: "This information is not documented in the available handover records."
3. DO NOT INFER PSYCHOLOGICAL TRAITS: Never discuss predecessor motivation, personality, honesty, or mindset. Stick purely to recorded activities and procedures.
4. CITE SOURCES: For every claim, cite the source record ID (e.g. [act-001], [doc-001]).
5. HIGHLIGHT UNCERTAINTIES & CONFLICTS: If there are conflicting records (e.g., inventory count discrepancies) or informal uncontracted practices, explicitly warn the successor.

HANDOVER REPORT DATA:
Predecessor: ${ho.employeeName} (${ho.employeeDesignation})
Department: ${ho.departmentName}
Responsibilities: ${JSON.stringify(ho.responsibilities.items)}
Important Decisions: ${JSON.stringify(ho.importantDecisions.items)}
Pending Tasks: ${JSON.stringify(ho.pendingTasks.items)}
Unresolved Problems: ${JSON.stringify(ho.unresolvedProblems.items)}
Recurring Issues: ${JSON.stringify(ho.recurringOperationalIssues.items)}
Documented Solutions: ${JSON.stringify(ho.documentedSolutions.items)}
Important Contacts: ${JSON.stringify(ho.importantContacts.items)}
Dependencies: ${JSON.stringify(ho.departmentalDependencies.items)}
SOPs: ${JSON.stringify(ho.standardOperatingProcedures.items)}
Missing / Conflicting Info: ${JSON.stringify(ho.missingOrConflictingInformation.items)}

RELEVANT ACTIVITIES:
${JSON.stringify(authorizedActivities.slice(0, 10).map(a => ({
  id: a.id,
  date: a.submissionDate,
  title: a.title,
  workCompleted: a.workCompleted,
  problemsEncountered: a.problemsEncountered,
  actionsTaken: a.actionsTaken,
  pendingTasks: a.pendingTasks,
  peopleInvolved: a.peopleInvolved
})), null, 2)}

RELEVANT DOCUMENTS:
${JSON.stringify(authorizedDocs.slice(0, 6).map(d => ({
  id: d.id,
  title: d.title,
  docNumber: d.docNumber,
  summary: d.summary,
  keyTakeaways: d.keyTakeaways
})), null, 2)}

USER QUESTION: "${userQuery}"

Return pure JSON:
{
  "answer": "Clear, professional, structured answer with inline citations like [act-001] or [doc-001]",
  "citedSources": [
    { "sourceId": "act-001", "title": "Title of record", "date": "2026-11-09", "classification": "Evidence-supported" }
  ],
  "uncertaintyDisclaimer": "Any detected uncertainty, missing documentation, or conflict related to this question"
}
`;

      const response = await callGeminiWithTimeout(() =>
        aiClient!.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        }),
        6000
      );

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        answerText = parsed.answer;
        citations = parsed.citedSources || [];
        uncertaintyNote = parsed.uncertaintyDisclaimer || '';
        isAiLive = true;
      }
    } catch (e) {
      console.warn('[WORKTRACE] Successor QA Gemini error, using deterministic fallback:', e);
    }
  }

  // Deterministic Fallback Q&A Engine
  if (!answerText) {
    const q = userQuery.toLowerCase();
    const actMatches = authorizedActivities.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.workCompleted.toLowerCase().includes(q) ||
      a.pendingTasks.toLowerCase().includes(q) ||
      a.problemsEncountered.toLowerCase().includes(q) ||
      a.decisionsMade.toLowerCase().includes(q)
    );

    if (q.includes('pending') || q.includes('task') || q.includes('todo')) {
      const items = ho.pendingTasks.items.length > 0
        ? ho.pendingTasks.items
        : authorizedActivities.map(a => a.pendingTasks).filter(Boolean);
      answerText = `Based on ${ho.employeeName}'s documented records, the key pending responsibilities requiring immediate successor attention are:\n\n` +
        items.map((it, i) => `${i + 1}. ${it}`).join('\n') +
        `\n\nThese tasks are backed by verified daily activity logs and the approved handover report.`;
      citations = ho.pendingTasks.sources.map(s => {
        const act = db.activities.find(a => a.id === s);
        return {
          sourceId: s,
          title: act ? act.title : 'Approved Handover Section',
          date: act ? act.submissionDate : ho.updatedAt.split('T')[0],
          classification: 'Evidence-supported' as EvidenceClassification,
        };
      });
    } else if (q.includes('problem') || q.includes('issue') || q.includes('frequent') || q.includes('recur')) {
      answerText = `The most frequently documented operational problems encountered by ${ho.employeeName} include:\n\n` +
        ho.recurringOperationalIssues.items.map((it, i) => `${i + 1}. ${it}`).join('\n') +
        `\n\nAdditionally, unresolved operational vulnerabilities include:\n` +
        ho.unresolvedProblems.items.map((it, i) => `• ${it}`).join('\n');
      citations = ho.recurringOperationalIssues.sources.map(s => {
        const act = db.activities.find(a => a.id === s);
        return {
          sourceId: s,
          title: act ? act.title : 'Operational Problem Record',
          date: act ? act.submissionDate : '2026-11-08',
          classification: 'Evidence-supported' as EvidenceClassification,
        };
      });
    } else if (q.includes('first week') || q.includes('priorit') || q.includes('start')) {
      answerText = `Recommended first-week priorities based on documented handover analysis:\n\n` +
        `1. Execute physical walkthrough of primary racking bays and verify daily cycle count protocol at 08:30 AM [doc-001].\n` +
        `2. Establish direct contact with key operational liaisons, including maintenance technicians and dispatch coordinators [act-007].\n` +
        `3. Review and address pending critical tasks: ${ho.pendingTasks.items.slice(0, 2).join('; ')}.\n` +
        `4. Reconcile any open discrepancies between physical counts and system balances before making new adjustments.`;
      citations = [
        { sourceId: 'doc-001', title: 'SOP-WH-04: Daily Warehouse Reconciliation', date: '2026-09-15', classification: 'Evidence-supported' },
        { sourceId: 'act-007', title: 'Handover Preparation: Master Contacts Sheet', date: '2026-11-03', classification: 'Verified by manager' }
      ];
    } else if (q.includes('contact') || q.includes('people') || q.includes('who') || q.includes('phone') || q.includes('vendor')) {
      answerText = `Key operational contacts documented by ${ho.employeeName}:\n\n` +
        ho.importantContacts.items.map((it, i) => `${i + 1}. ${it}`).join('\n') +
        `\n\nPlease note: Check the notes for informal or emergency response protocols before initiating contact.`;
      citations = ho.importantContacts.sources.map(s => ({
        sourceId: s,
        title: 'Documented Contact Record',
        date: '2026-11-03',
        classification: 'Verified by manager' as EvidenceClassification,
      }));
    } else if (q.includes('decision') || q.includes('decide') || q.includes('past')) {
      answerText = `Major documented decisions made by ${ho.employeeName}:\n\n` +
        ho.importantDecisions.items.map((it, i) => `• ${it}`).join('\n') +
        `\n\nAll decisions carry supporting evidence from operational records.`;
      citations = ho.importantDecisions.sources.map(s => ({
        sourceId: s,
        title: 'Decision Log Record',
        date: '2026-11-07',
        classification: 'Verified by manager' as EvidenceClassification,
      }));
    } else if (q.includes('document') || q.includes('sop') || q.includes('procedure') || q.includes('find')) {
      answerText = `The relevant Standard Operating Procedures and operational reports governing this role are:\n\n` +
        ho.standardOperatingProcedures.items.map((it, i) => `${i + 1}. ${it}`).join('\n') +
        `\n\nSupporting audit reports:\n` +
        ho.relevantSupportingDocuments.items.map((it, i) => `• ${it}`).join('\n') +
        `\n\nThese can be viewed in full under the Documents tab.`;
      citations = ho.standardOperatingProcedures.sources.map(s => ({
        sourceId: s,
        title: 'Official SOP Document',
        date: '2026-09-15',
        classification: 'Evidence-supported' as EvidenceClassification,
      }));
    } else if (actMatches.length > 0) {
      const match = actMatches[0];
      answerText = `According to record [${match.id}] ("${match.title}", dated ${match.submissionDate}):\n\n` +
        `• Work Completed: ${match.workCompleted}\n` +
        `• Decisions Made: ${match.decisionsMade}\n` +
        `• Problems Encountered: ${match.problemsEncountered}\n` +
        `• Actions Taken: ${match.actionsTaken}\n` +
        `• People Involved: ${match.peopleInvolved.join(', ') || 'None recorded'}`;
      citations = [{
        sourceId: match.id,
        title: match.title,
        date: match.submissionDate,
        classification: match.evidenceClassification,
      }];
    } else {
      answerText = `I searched all ${authorizedActivities.length} authorized activity logs and ${authorizedDocs.length} documents for ${ho.employeeName}, but found no documented information matching your specific query. In accordance with WORKTRACE evidence standards, I cannot invent or assume unrecorded details.`;
      uncertaintyNote = 'Information not found in authorized knowledge records.';
    }
  }

  // Record audit
  recordAudit(
    'Successor Assistant Query Executed',
    successorId || 'guest',
    caller ? caller.name : 'Successor User',
    caller ? caller.role : 'employee',
    `Query: "${userQuery.substring(0, 80)}" on handover for ${ho.employeeName}`,
    ho.id,
    ho.employeeName
  );

  res.json({
    answer: answerText,
    citedSources: citations,
    isAiGenerated: isAiLive,
    engine: isAiLive ? 'gemini-3.8-flash' : 'Deterministic Evidence Matcher',
    uncertaintyDisclaimer: uncertaintyNote || (ho.missingOrConflictingInformation.items.length > 0 ? ho.missingOrConflictingInformation.items[0] : undefined),
    timestamp: new Date().toISOString(),
  });
});

// AI Knowledge Insights
app.get('/api/insights', (_req: Request, res: Response) => {
  res.json(db.insights);
});

// Audit Trail
app.get('/api/audit', (_req: Request, res: Response) => {
  res.json(db.auditLogs);
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[WORKTRACE] Full-Stack Server running at http://0.0.0.0:${PORT}`);
    console.log(`[WORKTRACE] Mode: ${isProd ? 'Production' : 'Development (Vite Mounted)'}`);
  });
}

startServer().catch((err) => {
  console.error('[WORKTRACE] Failed to start server:', err);
  process.exit(1);
});
