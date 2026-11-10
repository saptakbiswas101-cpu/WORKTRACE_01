import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Upload,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem, Department, PermissionLevel } from '../types';
import { useAuth } from '../context/AuthContext';

export const DocumentManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');

  // Preview & Upload Modal
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'SOP' | 'Operational Report' | 'Strategy & Planning' | 'Incident & Audit'>('Operational Report');
  const [uploadPermission, setUploadPermission] = useState<PermissionLevel>('Department');
  const [uploadSummary, setUploadSummary] = useState('');
  const [uploadKeyTakeaways, setUploadKeyTakeaways] = useState('');
  const [mockFileName, setMockFileName] = useState('');

  const loadDocuments = async () => {
    try {
      const [docs, depts] = await Promise.all([
        api.getDocuments({
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          department: selectedDept !== 'All' ? selectedDept : undefined,
          search: search.trim() || undefined,
        }),
        api.getDepartments(),
      ]);
      setDocuments(docs);
      setDepartments(depts);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [selectedCategory, selectedDept]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !uploadTitle) return;

    try {
      await api.uploadDocument({
        title: uploadTitle,
        category: uploadCategory,
        permissionLevel: uploadPermission,
        uploadedByEmployeeId: currentUser.id,
        summary: uploadSummary || 'Operational document uploaded to WORKTRACE archive.',
        contentSnippet: uploadSummary,
        keyTakeaways: uploadKeyTakeaways
          ? uploadKeyTakeaways.split('\n').filter(Boolean)
          : ['Operational protocols documented', 'Retained for handover continuity'],
        fileType: mockFileName.endsWith('.docx') ? 'docx' : 'pdf',
        fileSize: '1.4 MB',
      });

      setShowUploadModal(false);
      setUploadTitle('');
      setUploadSummary('');
      setUploadKeyTakeaways('');
      setMockFileName('');
      loadDocuments();
    } catch (err) {
      console.error('Failed to upload document:', err);
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
              <FileText className="w-5 h-5 text-[#FF6B00]" />
              Standard Operating Procedures &amp; Documents
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#A1A1A1] border border-[#2A2A2A]">
              {documents.length} REPOSITORY DOCS
            </span>
          </div>
          <p className="text-xs text-[#A1A1A1] mt-0.5">
            Preserved operational procedures, vendor contracts, incident root-cause reports, and audits.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs shadow-xs transition-all"
        >
          <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
          Upload SOP or Report
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full md:w-80">
          <Search className="w-4 h-4 text-[#686868] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search document title, SOP number, or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadDocuments()}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#161616] border border-[#262626] text-xs text-white placeholder-[#686868] focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#262626] bg-[#161616] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="All">All Categories</option>
            <option value="SOP">SOPs (Procedures)</option>
            <option value="Operational Report">Operational Reports</option>
            <option value="Strategy & Planning">Strategy &amp; Planning</option>
            <option value="Incident & Audit">Incident &amp; Audit</option>
          </select>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#262626] bg-[#161616] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FF6B00]"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-[#111111] border border-[#222222] hover:border-[#383838] p-5 rounded-xl transition-all shadow-xs flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#261407] text-[#FF8126] border border-[#FF6B00]/30">
                  {doc.category}
                </span>

                <span className="text-[11px] font-mono text-[#686868]">
                  {doc.fileType.toUpperCase()} • {doc.fileSize}
                </span>
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-[#FF8126] block mb-0.5">
                  {doc.docNumber}
                </span>
                <h3 className="font-bold text-white text-sm leading-snug group-hover:text-[#FF8126] transition-colors">
                  {doc.title}
                </h3>
              </div>

              <p className="text-xs text-[#A1A1A1] leading-relaxed line-clamp-2">
                {doc.summary}
              </p>

              {/* Takeaways snippet */}
              <div className="bg-[#161616] p-2.5 rounded-lg border border-[#242424] space-y-1">
                <span className="text-[9px] font-mono font-bold text-[#686868] uppercase">CORE PRINCIPLES</span>
                <ul className="text-[11px] text-[#F5F5F5] space-y-0.5">
                  {doc.keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                      <span className="text-[#FF6B00] font-bold">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E1E1E] flex items-center justify-between text-xs">
              <div className="text-[11px] font-mono text-[#686868]">
                <span>{doc.uploadDate}</span> • <span>{doc.uploadedByEmployeeName.split(' ')[0]}</span>
              </div>

              <button
                onClick={() => setPreviewDoc(doc)}
                className="px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-[#202020] text-white text-xs font-mono font-semibold flex items-center gap-1 border border-[#2A2A2A] transition-all"
              >
                <Eye className="w-3.5 h-3.5 text-[#FF6B00]" />
                Inspect
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Document Reader Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#141414] rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#292929] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#261407] text-[#FF8126] border border-[#FF6B00]/30">
                    {previewDoc.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-white">
                    {previewDoc.docNumber}
                  </span>
                  <span className="text-xs text-[#686868] font-mono">
                    ({previewDoc.fileType.toUpperCase()} • {previewDoc.fileSize})
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">{previewDoc.title}</h3>
                <p className="text-xs font-mono text-[#686868] mt-0.5">
                  Uploaded by {previewDoc.uploadedByEmployeeName} ({previewDoc.departmentName}) on {previewDoc.uploadDate}
                </p>
              </div>

              <button
                onClick={() => setPreviewDoc(null)}
                className="text-[#686868] hover:text-white p-1 text-lg"
              >
                &times;
              </button>
            </div>

            <div className="bg-[#181818] p-4 rounded-xl border border-[#242424] space-y-2">
              <span className="text-xs font-mono font-bold text-[#A1A1A1] uppercase tracking-wider block">
                Executive Overview:
              </span>
              <p className="text-xs text-[#F5F5F5] leading-relaxed">{previewDoc.summary}</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-[#A1A1A1] uppercase tracking-wider block">
                Document Body Text:
              </span>
              <div className="p-4 rounded-xl border border-[#242424] bg-[#0F0F0F] font-mono text-xs text-[#F5F5F5] leading-relaxed whitespace-pre-line">
                {previewDoc.contentSnippet}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-[#A1A1A1] uppercase tracking-wider block">
                Mandatory Key Takeaways:
              </span>
              <ul className="space-y-1 text-xs text-[#F5F5F5]">
                {previewDoc.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#181818] p-2.5 rounded-lg border border-[#242424]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-[#222222] flex items-center justify-between">
              <span className="text-xs font-mono text-[#686868]">
                Permission: <strong className="text-white">{previewDoc.permissionLevel}</strong>
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#141414] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#292929] space-y-4">
            <h3 className="text-base font-bold text-white">Upload Operational Document or SOP</h3>
            <p className="text-xs text-[#A1A1A1]">
              Attach operational reports to preserve policies for team members and successors.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">Select File (PDF / DOCX)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setMockFileName(f.name);
                      if (!uploadTitle) setUploadTitle(f.name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="w-full p-2 border border-[#2A2A2A] rounded-lg bg-[#181818] text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOP-WH-05: Cold-Chain Incident &amp; Temperature Excursion"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white text-xs focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A1A1A1] font-semibold mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white text-xs"
                  >
                    <option value="SOP">SOP (Standard Operating Procedure)</option>
                    <option value="Operational Report">Operational Report</option>
                    <option value="Strategy & Planning">Strategy &amp; Planning</option>
                    <option value="Incident & Audit">Incident &amp; Audit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A1A1A1] font-semibold mb-1">Permission</label>
                  <select
                    value={uploadPermission}
                    onChange={(e) => setUploadPermission(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white text-xs"
                  >
                    <option value="Department">Department Only</option>
                    <option value="Public">Public (Org-wide)</option>
                    <option value="Management Confidential">Management Confidential</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">Executive Summary / Content</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Key procedural steps, triggers, and mandatory actions..."
                  value={uploadSummary}
                  onChange={(e) => setUploadSummary(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white text-xs focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-[#A1A1A1] font-semibold mb-1">
                  Key Takeaways (one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Mandatory temperature checks every 2 hours...&#10;Escalate to Operations Head after 30 mins..."
                  value={uploadKeyTakeaways}
                  onChange={(e) => setUploadKeyTakeaways(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#181818] border border-[#2A2A2A] text-white text-xs focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="pt-3 border-t border-[#222222] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 text-xs text-[#A1A1A1] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-black bg-[#FF6B00] hover:bg-[#FF8126] rounded-lg shadow-xs"
                >
                  Upload &amp; Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};
