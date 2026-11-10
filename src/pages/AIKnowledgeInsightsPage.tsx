import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Building,
  ArrowRight,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { AIInsight } from '../types';
import { EvidenceTag } from '../components/common/EvidenceTag';

export const AIKnowledgeInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getInsights();
        setInsights(data);
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredInsights = activeFilter === 'All'
    ? insights
    : insights.filter((ins) => ins.evidenceClassification === activeFilter || ins.category === activeFilter);

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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#261407] border border-[#FF6B00]/40 text-[#FF8126] text-[11px] font-mono font-semibold">
              <Terminal className="w-3 h-3 text-[#FF6B00]" />
              ANALYTICAL KNOWLEDGE ENGINE
            </span>
            <span className="text-xs font-mono text-[#686868]">GEMINI 3.8 FLASH</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-1">
            Organisational Synthesis &amp; Anomaly Detection
          </h2>
          <p className="text-xs text-[#A1A1A1] mt-0.5">
            Continuous synthesis across employee daily activity records and documents to detect repeated failure modes, knowledge gaps, and inventory anomalies.
          </p>
        </div>

        <Link
          to="/handovers"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8126] text-black font-bold text-xs shadow-xs transition-all shrink-0"
        >
          Review Handover Dossiers
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Ethical Guardrails Banner */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-xs text-[#A1A1A1] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white text-xs font-mono">
            EVIDENCE-BASED INTEGRITY &amp; ANTI-SURVEILLANCE POLICY
          </div>
          <p className="leading-relaxed text-[11px] text-[#A1A1A1]">
            WORKTRACE is strictly an operational continuity platform. The analytical engine is prohibited from inferring psychological traits, personal motivation, or private intent. Every insight is strictly grounded in verifiable operational logs, equipment telemetry, signed agreements, and standard operating procedures.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <button
          onClick={() => setActiveFilter('All')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeFilter === 'All'
              ? 'bg-[#FF6B00] text-black'
              : 'bg-[#141414] border border-[#242424] text-[#A1A1A1] hover:text-white'
          }`}
        >
          ALL SYNTHESES ({insights.length})
        </button>
        <button
          onClick={() => setActiveFilter('Conflicting')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeFilter === 'Conflicting'
              ? 'bg-[#EF4444] text-white'
              : 'bg-[#141414] border border-[#242424] text-[#A1A1A1] hover:text-white'
          }`}
        >
          CONFLICTING ANOMALIES
        </button>
        <button
          onClick={() => setActiveFilter('Verified by manager')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeFilter === 'Verified by manager'
              ? 'bg-[#FF6B00] text-black'
              : 'bg-[#141414] border border-[#242424] text-[#A1A1A1] hover:text-white'
          }`}
        >
          VERIFIED BEST PRACTICES
        </button>
        <button
          onClick={() => setActiveFilter('Evidence-supported')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activeFilter === 'Evidence-supported'
              ? 'bg-[#10B981] text-black'
              : 'bg-[#141414] border border-[#242424] text-[#A1A1A1] hover:text-white'
          }`}
        >
          EVIDENCE-SUPPORTED
        </button>
      </div>

      {/* Analytical Insights Stream */}
      <div className="space-y-4">
        {filteredInsights.map((ins) => (
          <div
            key={ins.id}
            className={`bg-[#111111] border rounded-2xl p-5 shadow-xs transition-all space-y-4 ${
              ins.evidenceClassification === 'Conflicting'
                ? 'border-[#EF4444]/60 bg-[#160D0D]'
                : 'border-[#222222] hover:border-[#383838]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] font-bold text-[#FF8126] bg-[#261407] px-1.5 py-0.5 rounded border border-[#FF6B00]/30">
                    {ins.id}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#181818] text-[#A1A1A1] border border-[#2A2A2A]">
                    {ins.category}
                  </span>
                  <EvidenceTag classification={ins.evidenceClassification} size="sm" />
                  <span className="text-[11px] font-mono text-[#686868]">
                    DEPT: <strong className="text-white">{ins.department}</strong>
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-white tracking-tight pt-1">
                  {ins.headline}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                <span className="px-2.5 py-1 rounded bg-[#181818] border border-[#2A2A2A] text-white">
                  Score: <strong className="text-[#FF8126]">{ins.confidenceScore}%</strong>
                </span>
                <span
                  className={`px-2 py-1 rounded uppercase font-bold text-[10px] ${
                    ins.impactLevel === 'High'
                      ? 'bg-[#1A0C0C] text-[#F87171] border border-[#991B1B]/40'
                      : 'bg-[#141414] text-[#A1A1A1] border border-[#2A2A2A]'
                  }`}
                >
                  {ins.impactLevel} Impact
                </span>
              </div>
            </div>

            <p className="text-xs text-[#F5F5F5] leading-relaxed bg-[#161616] p-3.5 rounded-xl border border-[#242424]">
              {ins.description}
            </p>

            {ins.uncertaintyNotes && (
              <div className="bg-[#1F1608] border border-[#B45309]/50 p-3 rounded-xl text-xs text-[#FBBF24] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Detected Uncertainty / Gap:</strong> {ins.uncertaintyNotes}
                </div>
              </div>
            )}

            {/* Traceability records */}
            <div className="pt-3 border-t border-[#1E1E1E]">
              <span className="text-[10px] font-mono font-bold text-[#686868] uppercase tracking-wider block mb-2">
                SUPPORTING EVIDENCE &amp; AUDIT TRAIL:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {ins.supportingSourceRecords.map((rec) => (
                  <span
                    key={rec.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161616] border border-[#262626] text-xs font-mono text-[#F5F5F5]"
                  >
                    <span className="text-[#FF6B00] font-bold">{rec.id}</span>
                    <span>{rec.title}</span>
                    <span className="text-[#686868]">({rec.date})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
