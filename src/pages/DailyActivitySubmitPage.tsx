import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  PenSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Shield,
  FileText,
  Users,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ActivityCategory, PermissionLevel, EvidenceClassification } from '../types';

export const DailyActivitySubmitPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Daily Operations');
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('Department');
  const [status, setStatus] = useState<'Completed' | 'In Progress' | 'Blocked'>('Completed');
  const [evidenceClassification, setEvidenceClassification] = useState<EvidenceClassification>('Evidence-supported');

  // The 7 Required Structured Knowledge Questions
  const [workCompleted, setWorkCompleted] = useState('');
  const [decisionsMade, setDecisionsMade] = useState('');
  const [problemsEncountered, setProblemsEncountered] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [pendingTasks, setPendingTasks] = useState('');
  const [peopleInvolved, setPeopleInvolved] = useState('');
  const [observationsLessons, setObservationsLessons] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // Fast Synthetic Sample Templates
  const loadTemplate = (type: 'inventory' | 'fleet' | 'supplier') => {
    if (type === 'inventory') {
      setTitle('Cold Storage Bay 9 Pallet Shrinkage Reconciliation');
      setCategory('Problem Resolution');
      setWorkCompleted('Completed physical audit of 1,200 cartons of plant-based Almond Milk across Cold Storage Bay 9.');
      setDecisionsMade('Ordered immediate quarantine write-off for 12 crushed cartons at lower layer of Pallet #P-441.');
      setProblemsEncountered('Forklift driver overloaded secondary rack without corner timber edge protectors.');
      setActionsTaken('Re-stacked into single tier and mandated corner protection on all chilled inventory pallets.');
      setPendingTasks('Follow up with shift supervisor to conduct refresher training on cold-room forklift protocols.');
      setPeopleInvolved('Rajesh Kulkarni (Quality), Manoj (Forklift Driver), Vikram Malhotra (Ops Head)');
      setObservationsLessons('Corrugated carton walls absorb humidity over 72 hours, dropping vertical crush resistance by 25%.');
    } else if (type === 'fleet') {
      setTitle('Ahmedabad Express Highway Breakdown & Emergency Reefer Transshipment');
      setCategory('Problem Resolution');
      setWorkCompleted('Monitored Reefer Truck MH-04-GP-8812 transporting 850 cartons to Ahmedabad distribution center.');
      setDecisionsMade('Authorized emergency transfer of entire stock to standby 3PL reefer truck at Vapi highway hub within 40 minutes.');
      setProblemsEncountered('Reefer generator alternator belt snapped near Manor toll plaza during peak heat.');
      setActionsTaken('Dispatched local technician and verified digital temperature logger remained below 4.2°C throughout transfer.');
      setPendingTasks('Audit receiver receiving stamp on delivery challan to verify zero spoilage deductions.');
      setPeopleInvolved('Devanshi Joshi (Logistics), Vapi 3PL Hub Supervisor, Transporter Owner');
      setObservationsLessons('Carrying two spare alternator belts inside the vehicle cabin prevents 3 hours of highway stranding.');
    } else if (type === 'supplier') {
      setTitle('Secondary Corrugated Packaging Bursting Strength Evaluation');
      setCategory('Decision Making');
      setWorkCompleted('Conducted random calibrated bursting test on 20 sample outer cartons from PackWell Solutions.');
      setDecisionsMade('Approved trial production batch run of 1,500 boxes for Monday night packaging schedule.');
      setProblemsEncountered('Adhesive along side joints showed minor bleeding under high-humidity test chamber.');
      setActionsTaken('Requested vendor quality engineer to adjust hot-melt glue applicator nozzle temperature by +5°C.');
      setPendingTasks('Monitor high-speed filling line performance with PackWell cartons on Monday at 09:00 AM.');
      setPeopleInvolved('Tanya Kapoor (Procurement), Rahul Sharma (Lead Specialist)');
      setObservationsLessons('Secondary vendor packaging must always be tested at actual line speed (120 units/min) before full production sign-off.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setIsSubmitting(true);
      await api.createActivity({
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        departmentId: currentUser.departmentId,
        departmentName: currentUser.departmentName,
        title,
        category,
        permissionLevel,
        status,
        evidenceClassification,
        workCompleted,
        decisionsMade: decisionsMade || 'None documented today.',
        problemsEncountered: problemsEncountered || 'None encountered.',
        actionsTaken: actionsTaken || 'Standard procedural steps followed.',
        pendingTasks: pendingTasks || 'No immediate pending handovers.',
        peopleInvolved: peopleInvolved ? peopleInvolved.split(',').map((p) => p.trim()) : [],
        observationsLessons: observationsLessons || 'Standard procedures adhered to.',
      });

      setSuccessMessage(true);
      setTimeout(() => {
        navigate('/activity-history');
      }, 1200);
    } catch (err) {
      console.error('Failed to submit daily activity:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6"
    >
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            <PenSquare className="w-5 h-5 text-[#FF6B00]" />
            Daily Work Journal &amp; Knowledge Capture
          </h2>
          <p className="text-xs text-[#A1A1A1] mt-0.5">
            Document today&apos;s completed work, decisions, and lessons learned across the 7 structured questions.
          </p>
        </div>

        {/* Quick Sample Template Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono font-bold text-[#686868] uppercase">
            QUICK PRESETS:
          </span>
          <button
            type="button"
            onClick={() => loadTemplate('inventory')}
            className="px-2.5 py-1 text-[11px] font-mono font-bold rounded bg-[#161616] hover:bg-[#202020] text-[#A1A1A1] hover:text-[#FF8126] border border-[#262626] transition-all"
          >
            Inventory Incident
          </button>
          <button
            type="button"
            onClick={() => loadTemplate('fleet')}
            className="px-2.5 py-1 text-[11px] font-mono font-bold rounded bg-[#161616] hover:bg-[#202020] text-[#A1A1A1] hover:text-[#FF8126] border border-[#262626] transition-all"
          >
            Fleet Breakdown
          </button>
          <button
            type="button"
            onClick={() => loadTemplate('supplier')}
            className="px-2.5 py-1 text-[11px] font-mono font-bold rounded bg-[#161616] hover:bg-[#202020] text-[#A1A1A1] hover:text-[#FF8126] border border-[#262626] transition-all"
          >
            Vendor Audit
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-[#0E1A13] border border-[#065F46] text-[#34D399] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
          Daily activity recorded and indexed into WORKTRACE central knowledge base! Redirecting to activity history...
        </div>
      )}

      {/* Main Work Journal Form */}
      <form onSubmit={handleSubmit} className="bg-[#111111] rounded-2xl border border-[#222222] p-6 shadow-xs space-y-6">
        {/* Top Metadata Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-[#1E1E1E] text-xs">
          <div>
            <label className="block font-mono text-[#686868] mb-1 uppercase text-[10px]">Author Profile</label>
            <div className="p-2.5 rounded-lg bg-[#161616] border border-[#262626] text-white font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
              <span className="truncate">{currentUser?.name}</span>
              <span className="text-[10px] text-[#686868] font-mono">({currentUser?.departmentName.split(' ')[0]})</span>
            </div>
          </div>

          <div>
            <label className="block font-mono text-[#686868] mb-1 uppercase text-[10px]">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ActivityCategory)}
              className="w-full p-2.5 rounded-lg bg-[#161616] border border-[#262626] text-white font-medium focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="Daily Operations">Daily Operations</option>
              <option value="Decision Making">Decision Making</option>
              <option value="Problem Resolution">Problem Resolution</option>
              <option value="Customer Interaction">Customer Interaction</option>
              <option value="Project Work">Project Work</option>
              <option value="Planning and Strategy">Planning and Strategy</option>
              <option value="Pending Tasks">Pending Tasks</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[#686868] mb-1 uppercase text-[10px]">Visibility &amp; Permission</label>
            <select
              value={permissionLevel}
              onChange={(e) => setPermissionLevel(e.target.value as PermissionLevel)}
              className="w-full p-2.5 rounded-lg bg-[#161616] border border-[#262626] text-white font-medium focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="Department">Department Only</option>
              <option value="Public">Public (All Authorized Org)</option>
              <option value="Management Confidential">Management Confidential</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-white mb-1.5">
            Subject Title <span className="text-[#FF6B00]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Cold Storage Unit C Temperature Spike &amp; Sensor Calibration"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-lg bg-[#161616] border border-[#262626] text-white text-xs placeholder-[#686868] focus:outline-none focus:border-[#FF6B00] font-medium"
          />
        </div>

        {/* THE 7 STRUCTURED KNOWLEDGE QUESTIONS */}
        <div className="space-y-5 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1E1E1E]">
            <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-black font-black text-xs flex items-center justify-center">
              7
            </span>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              OPERATIONAL CONTINUITY QUESTIONS
            </h3>
          </div>

          {/* Q1 */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-white">
              1. What work did you complete today? <span className="text-[#FF6B00]">*</span>
            </label>
            <p className="text-[11px] text-[#686868]">
              Specific operations, physical audits, dispatches, reconciliations, or client meetings completed.
            </p>
            <textarea
              required
              rows={2}
              value={workCompleted}
              onChange={(e) => setWorkCompleted(e.target.value)}
              placeholder="e.g. Completed physical audit of 1,450 cartons of Almond Beverage in Bays 3, 4 and 5..."
              className="w-full p-3 rounded-lg bg-[#161616] border border-[#262626] text-white text-xs placeholder-[#686868] focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          {/* Q2 */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-white">
              2. What decisions did you make?
            </label>
            <p className="text-[11px] text-[#686868]">
              Batch quarantines, route diversions, priority overrides, supplier consignment rejections, etc.
            </p>
            <textarea
              rows={2}
              value={decisionsMade}
              onChange={(e) => setDecisionsMade(e.target.value)}
              placeholder="e.g. Prioritized FIFO dispatch for lot expiring on Dec 15; stickered pallets with fluorescent green tags..."
              className="w-full p-3 rounded-lg bg-[#161616] border border-[#262626] text-white text-xs placeholder-[#686868] focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          {/* Q3 */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-white">
              3. What problems did you encounter?
            </label>
            <p className="text-[11px] text-[#686868]">
              Stock count variances, carton crush, temperature excursions, delayed truck turnarounds, etc.
            </p>
            <textarea
              rows={2}
              value={problemsEncountered}
              onChange={(e) => setProblemsEncountered(e.target.value)}
              placeholder="e.g. Temperature drifted to 8.2°C for 55 minutes due to sensor cable vibration..."
              className="w-full p-3 rounded-lg bg-[#161616] border border-[#262626] text-white text-xs placeholder-[#686868] focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          {/* Q4 */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-white">
              4. What actions did you take to resolve those problems?
            </label>
            <p className="text-[11px] text-[#686868]">
              Documented workarounds, CCTV reviews, emergency vendor dispatches, or temporary calibrations.
            </p>
            <textarea
              rows={2}
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
              placeholder="e.g. Re-anchored sensor with insulated cable bracket and installed secondary data logger..."
              className="w-full p-3 rounded-lg bg-[#161616] border border-[#262626] text-white text-xs placeholder-[#686868] focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          {/* Q5 */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-white">
              5. What tasks are still pending?
            </label>
            <p className="text-[11px] text-[#686868]">
              Action items awaiting manager sign-off, vendor replies, successor handover, or night-shift clearance.
            </p>
            <textarea
              rows={2}
              value={pendingTasks}
              onChange={(e) => setPendingTasks(e.target.value)}
              placeholder="e.g. Receive sign-off from Rajesh Kulkarni before clearing Batch #ALM-992 for outward dispatch..."
              className="w-full p-3 rounded-lg bg-[#161616] border border-[#262626] text-white text-xs placeholder-[#686868] focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          {/* Q6 & Q7 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-white">
                6. People or departments involved?
              </label>
              <input
                type="text"
                value={peopleInvolved}
                onChange={(e) => setPeopleInvolved(e.target.value)}
                placeholder="e.g. Rajesh Kulkarni (Quality), Vikram Malhotra (Ops Head)"
                className="w-full p-3 rounded-lg bg-[#161616] border border-[#262626] text-white text-xs placeholder-[#686868] focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-white">
                7. Important observations or lessons learned?
              </label>
              <input
                type="text"
                value={observationsLessons}
                onChange={(e) => setObservationsLessons(e.target.value)}
                placeholder="e.g. Cold storage door curtain flaps need replacement every 90 days..."
                className="w-full p-3 rounded-lg bg-[#161616] border border-[#262626] text-white text-xs placeholder-[#686868] focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-[#1E1E1E] flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/activity-history')}
            className="text-xs text-[#A1A1A1] hover:text-white font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,107,0,0.3)] disabled:opacity-50"
          >
            {isSubmitting ? 'Indexing Activity...' : 'Submit Work Log'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};
