import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Database,
  Search,
  Filter,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { Department, Employee, EvidenceClassification } from '../types';
import { EvidenceTag } from '../components/common/EvidenceTag';
import { StatusBadge } from '../components/common/StatusBadge';

export const KnowledgeRepositoryPage: React.FC = () => {
  const [knowledgeItems, setKnowledgeItems] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Filters
  const [query, setQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedAuthor, setSelectedAuthor] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPermission, setSelectedPermission] = useState('All');

  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadKnowledge = async () => {
    try {
      setLoading(true);
      const [items, depts, emps] = await Promise.all([
        api.queryKnowledge({
          department: selectedDept !== 'All' ? selectedDept : undefined,
          employeeId: selectedAuthor !== 'All' ? selectedAuthor : undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          permission: selectedPermission !== 'All' ? selectedPermission : undefined,
          query: query.trim() || undefined,
        }),
        api.getDepartments(),
        api.getEmployees(),
      ]);
      setKnowledgeItems(items);
      setDepartments(depts);
      setEmployees(emps);
    } catch (err) {
      console.error('Failed to load knowledge items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKnowledge();
  }, [selectedDept, selectedAuthor, selectedCategory, selectedPermission]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6"
    >
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-[#FF6B00]" />
              Central Organisational Knowledge Archive
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1A1A1A] text-[#A1A1A1] border border-[#2A2A2A]">
              {knowledgeItems.length} ARTIFACTS
            </span>
          </div>
          <p className="text-xs text-[#A1A1A1] mt-0.5">
            Unified index of daily logs, operating procedures, vendor negotiations, and incident resolutions.
          </p>
        </div>

        <Link
          to="/ai-insights"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#181818] hover:bg-[#202020] text-[#FF8126] border border-[#FF6B00]/30 text-xs font-mono font-bold transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Pattern Insights &rarr;
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#686868] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by keywords, decisions, SOP numbers, or incident titles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadKnowledge()}
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

            {/* Author */}
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#262626] bg-[#161616] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="All">All Authors</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>

            {/* Permission */}
            <select
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#262626] bg-[#161616] text-xs text-[#F5F5F5] focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="All">All Permissions</option>
              <option value="Public">Public</option>
              <option value="Department">Department</option>
              <option value="Management Confidential">Management Confidential</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[#686868] pt-2 border-t border-[#1E1E1E]">
          <span>
            Aggregating <strong className="text-white">{knowledgeItems.length}</strong> verified records with full lineage
          </span>
          <button
            onClick={() => {
              setQuery('');
              setSelectedDept('All');
              setSelectedAuthor('All');
              setSelectedCategory('All');
              setSelectedPermission('All');
            }}
            className="text-[#FF8126] hover:underline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Editorial Knowledge Articles List (Avoids identical rounded cards) */}
      <div className="space-y-3">
        {knowledgeItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="bg-[#111111] border border-[#222222] hover:border-[#383838] p-5 rounded-xl transition-all shadow-xs cursor-pointer group flex flex-col md:flex-row md:items-start justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] font-bold text-[#FF8126] bg-[#261407] px-1.5 py-0.5 rounded border border-[#FF6B00]/30">
                  {item.id}
                </span>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#181818] text-[#A1A1A1] border border-[#282828]">
                  {item.type}
                </span>
                <EvidenceTag classification={item.evidenceClassification} size="sm" />
              </div>

              <h3 className="font-bold text-white text-sm group-hover:text-[#FF8126] transition-colors leading-snug">
                {item.title}
              </h3>

              <p className="text-xs text-[#A1A1A1] leading-relaxed line-clamp-2">
                {item.content}
              </p>

              <div className="flex items-center gap-4 text-[11px] font-mono text-[#686868] pt-1">
                <span>Author: <strong className="text-white">{item.authorName}</strong></span>
                <span>•</span>
                <span>{item.departmentName}</span>
                <span>•</span>
                <span>{item.date}</span>
              </div>
            </div>

            <div className="shrink-0 flex items-center md:flex-col md:items-end justify-between gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#1E1E1E]">
              <span className="text-[10px] font-mono text-[#686868]">{item.permissionLevel}</span>
              <span className="text-xs font-mono font-bold text-[#FF8126] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Read Dossier &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Modal Drawer */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#141414] rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#292929] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#261407] text-[#FF8126] border border-[#FF6B00]/30">
                    {activeItem.type}
                  </span>
                  <EvidenceTag classification={activeItem.evidenceClassification} size="sm" />
                </div>
                <h3 className="text-base font-extrabold text-white">{activeItem.title}</h3>
                <p className="text-xs font-mono text-[#686868]">
                  ID: <span className="text-white">{activeItem.id}</span> • Authored on {activeItem.date} by {activeItem.authorName}
                </p>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="text-[#686868] hover:text-white p-1 text-lg"
              >
                &times;
              </button>
            </div>

            <div className="bg-[#181818] p-4 rounded-xl border border-[#242424] text-xs space-y-3 leading-relaxed">
              <span className="font-bold text-white block">Documented Operational Record:</span>
              <p className="text-[#F5F5F5] whitespace-pre-line leading-relaxed">{activeItem.content}</p>

              {activeItem.pendingItems && (
                <div className="pt-2 border-t border-[#2A2A2A] text-[#FBBF24]">
                  <strong>Pending Action Obligations:</strong> {activeItem.pendingItems}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg border border-[#242424] bg-[#161616]">
                <span className="text-[#686868] block mb-0.5">DEPARTMENT</span>
                <p className="text-white font-bold">{activeItem.departmentName}</p>
              </div>
              <div className="p-3 rounded-lg border border-[#242424] bg-[#161616]">
                <span className="text-[#686868] block mb-0.5">PERMISSION LEVEL</span>
                <p className="text-white font-bold">{activeItem.permissionLevel}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#222222] flex items-center justify-end">
              <button
                onClick={() => setActiveItem(null)}
                className="px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
