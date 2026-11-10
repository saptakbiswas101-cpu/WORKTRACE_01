import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BotMessageSquare,
  Sparkles,
  Send,
  User,
  ArrowRight,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  Lock,
  ExternalLink,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import { HandoverReport, SuccessorMessage, EvidenceClassification } from '../types';
import { EvidenceTag } from '../components/common/EvidenceTag';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const SuccessorAssistantPage: React.FC = () => {
  const { currentUser, currentRole } = useAuth();
  const [searchParams] = useSearchParams();
  const [handovers, setHandovers] = useState<HandoverReport[]>([]);
  const [selectedHandoverId, setSelectedHandoverId] = useState<string>('');
  const [messages, setMessages] = useState<SuccessorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<any | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      try {
        const hoList = await api.getHandovers();
        setHandovers(hoList);

        const paramId = searchParams.get('handoverId');
        const defaultHo = paramId
          ? hoList.find((h) => h.id === paramId)
          : hoList.find((h) => h.status === 'Shared with Successor' || h.status === 'Approved') || hoList[0];

        if (defaultHo) {
          setSelectedHandoverId(defaultHo.id);
          setupInitialGreeting(defaultHo);
        }

        const preQuery = searchParams.get('q');
        if (preQuery && defaultHo) {
          if (preQuery === 'pending') {
            handleSendQuery("What are my predecessor's pending tasks?", defaultHo.id);
          } else if (preQuery === 'problems') {
            handleSendQuery("Which operational problems occurred frequently?", defaultHo.id);
          }
        }
      } catch (err) {
        console.error('Failed to init successor assistant:', err);
      }
    }
    init();
  }, [searchParams]);

  const setupInitialGreeting = (ho: HandoverReport) => {
    setMessages([
      {
        id: 'msg-init',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Hello! I am your AI Successor Context Assistant for **${ho.employeeName}** (${ho.employeeDesignation}).\n\nI have indexed all ${ho.departmentName} daily work logs, vendor resolutions, approved handover sections, and SOPs. You can ask me about pending action items, recurring equipment issues, critical vendor contacts, or first-week priorities.\n\n*All responses cite verifiable source records and flag detected uncertainties.*`,
        isAiGenerated: true,
      },
    ]);
  };

  const handleSelectHandover = (hoId: string) => {
    setSelectedHandoverId(hoId);
    const ho = handovers.find((h) => h.id === hoId);
    if (ho) setupInitialGreeting(ho);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendQuery = async (queryText?: string, hoId?: string) => {
    const q = (queryText || inputText).trim();
    if (!q || !currentUser) return;

    const targetHoId = hoId || selectedHandoverId;
    if (!targetHoId) return;

    const userMsg: SuccessorMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.askSuccessorAssistant(targetHoId, currentUser.id, q);

      const assistantMsg: SuccessorMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.answer,
        citedSources: response.citedSources,
        isAiGenerated: response.isAiGenerated,
        uncertaintyDisclaimer: response.uncertaintyDisclaimer,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to get answer:', err);
      const errorMsg: SuccessorMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: err instanceof Error ? err.message : 'Failed to query knowledge repository.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentHandover = handovers.find((h) => h.id === selectedHandoverId);

  const quickPrompts = [
    "What are my predecessor's pending tasks?",
    "Which operational problems occurred frequently?",
    "What should I prioritise during my first week?",
    "Which people were involved in important activities?",
    "What decisions were made previously?",
    "Where can I find the supporting documents?",
    "Are there any conflicting or uncertain records?",
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#261407] border border-[#FF6B00]/30 text-[#FF6B00] text-[11px] font-mono font-bold tracking-wider mb-2">
            <Terminal className="w-3.5 h-3.5 text-[#FF6B00]" />
            MODULE F // CONTEXT Q&amp;A ENGINE
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <BotMessageSquare className="w-6 h-6 text-[#FF6B00]" />
            Successor Knowledge Assistant
          </h1>
          <p className="text-xs text-[#A1A1A1] mt-1 max-w-2xl leading-relaxed">
            Query predecessor&apos;s verified work records, vendor workarounds, and pending responsibilities with exact source attribution.
          </p>
        </div>

        {/* Handover Selector Dropdown */}
        <div className="flex items-center gap-2.5 bg-[#141414] p-2 rounded-xl border border-[#262626]">
          <span className="text-[11px] font-mono uppercase text-[#686868] pl-1 font-semibold">Dossier:</span>
          <select
            value={selectedHandoverId}
            onChange={(e) => handleSelectHandover(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#333333] text-xs text-white font-medium bg-[#1A1A1A] focus:outline-none focus:border-[#FF6B00] transition-colors"
          >
            {handovers.map((h) => (
              <option key={h.id} value={h.id} className="bg-[#1A1A1A] text-white">
                {h.employeeName} ({h.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Handover Status Banner */}
      {currentHandover && (
        <div className="bg-[#111111] rounded-xl p-4 sm:p-5 border border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-[#1F140A] border border-[#FF6B00]/30 flex items-center justify-center font-mono font-black text-[#FF6B00] text-base shrink-0">
              {currentHandover.employeeName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-white text-sm">{currentHandover.employeeName}</span>
                <span className="text-[#A1A1A1]">({currentHandover.employeeDesignation})</span>
                <StatusBadge status={currentHandover.status} size="sm" />
              </div>
              <p className="text-[#686868] mt-1 text-[11px]">
                Successor: <strong className="text-[#FF6B00] font-mono">{currentHandover.successorName || 'Not Assigned'}</strong> • Manager:{' '}
                <span className="text-white">{currentHandover.managerName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/handovers/${currentHandover.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#242424] text-white text-xs font-semibold border border-[#2E2E2E] transition-all hover:border-[#FF6B00]/40"
            >
              <span>View 13-Module Dossier</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#FF6B00]" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Terminal Chat Interface */}
      <div className="bg-[#111111] rounded-2xl border border-[#262626] flex flex-col h-[600px] overflow-hidden shadow-2xl">
        {/* Terminal Header Bar */}
        <div className="px-4 py-3 bg-[#0B0B0B] border-b border-[#222222] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/60" />
            </div>
            <span className="font-mono text-[11px] text-[#686868] ml-2">
              knowledge_session::{currentHandover?.employeeName.toLowerCase().replace(/\s+/g, '_') || 'predecessor'}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[#A1A1A1]">
            <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
            <span>AI Knowledge Engine Live</span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0E0E0E]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isUser
                      ? 'bg-[#1F1F1F] text-white border border-[#333333]'
                      : 'bg-[#261407] text-[#FF6B00] border border-[#FF6B00]/40'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <BotMessageSquare className="w-4 h-4 text-[#FF6B00]" />}
                </div>

                <div className={`space-y-2 max-w-2xl ${isUser ? 'text-right' : ''}`}>
                  <div
                    className={`p-4 rounded-xl text-xs leading-relaxed whitespace-pre-line text-left ${
                      isUser
                        ? 'bg-[#1F1F1F] text-white border border-[#FF6B00]/40 rounded-tr-none'
                        : 'bg-[#141414] text-[#F5F5F5] border border-[#262626] rounded-tl-none'
                    }`}
                  >
                    {msg.text}

                    {/* Cited Sources Footprint */}
                    {msg.citedSources && msg.citedSources.length > 0 && (
                      <div className="mt-3.5 pt-3.5 border-t border-[#222222] space-y-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#FF6B00] block font-bold">
                          Verified Source Records Cited:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {msg.citedSources.map((cite, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedCitation(cite)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1A1A1A] hover:bg-[#261407] border border-[#2B2B2B] hover:border-[#FF6B00]/50 text-[#F5F5F5] text-[11px] font-mono transition-colors"
                            >
                              <span className="text-[#FF6B00] font-bold">[{cite.sourceId}]</span>
                              <span className="truncate max-w-[150px] font-sans text-xs">{cite.title}</span>
                              <span className="text-[10px] text-[#686868]">({cite.date})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Uncertainty Disclaimer */}
                    {msg.uncertaintyDisclaimer && (
                      <div className="mt-3 p-3 rounded-lg bg-[#1C150A] border border-[#B45309]/50 text-[#FDE68A] text-[11px] flex items-start gap-2 text-left">
                        <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">Note on Uncertainty:</strong> {msg.uncertaintyDisclaimer}
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-[#686868] px-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-md">
              <div className="w-8 h-8 rounded-lg bg-[#261407] border border-[#FF6B00]/40 text-[#FF6B00] flex items-center justify-center shrink-0">
                <BotMessageSquare className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#A1A1A1] rounded-tl-none flex items-center gap-2.5 font-mono">
                <Sparkles className="w-4 h-4 text-[#FF6B00] animate-spin" />
                <span>Searching authorized handover records &amp; synthesizing answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Suggestions Pills */}
        <div className="px-4 py-2.5 border-t border-[#222222] bg-[#0E0E0E] flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="font-mono text-[10px] font-bold text-[#686868] uppercase tracking-wider shrink-0">
            SUGGESTIONS:
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendQuery(prompt)}
              className="px-2.5 py-1 rounded bg-[#161616] hover:bg-[#261407] text-[#A1A1A1] hover:text-[#FF6B00] whitespace-nowrap transition-all font-medium border border-[#262626] hover:border-[#FF6B00]/40 text-xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-[#222222] bg-[#111111]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              placeholder={`Ask anything about ${currentHandover?.employeeName || 'predecessor'}'s tasks, vendors, workarounds, or contacts...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#161616] border border-[#292929] text-xs text-white placeholder-[#686868] focus:outline-none focus:border-[#FF6B00] font-medium"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF8126] text-white font-bold text-xs transition-all flex items-center gap-2 disabled:opacity-40 disabled:hover:bg-[#FF6B00] shrink-0"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Citation Detail Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#141414] rounded-2xl max-w-md w-full p-6 border border-[#2E2E2E] shadow-2xl space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono font-bold text-[#FF6B00] text-xs block">
                  [{selectedCitation.sourceId}]
                </span>
                <h4 className="font-bold text-white text-sm mt-1">
                  {selectedCitation.title}
                </h4>
                <p className="text-[11px] font-mono text-[#686868] mt-0.5">Date: {selectedCitation.date}</p>
              </div>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-[#686868] hover:text-white p-1 text-lg font-mono transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="bg-[#1A1A1A] p-3.5 rounded-lg border border-[#292929] text-[#A1A1A1] leading-relaxed">
              This record was cited directly by the AI Context Assistant as verifiable evidence for the generated answer. It reflects documented operational history and manager-approved logs.
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#222222]">
              <EvidenceTag classification={selectedCitation.classification || 'Evidence-supported'} size="sm" />
              <button
                onClick={() => setSelectedCitation(null)}
                className="px-4 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2B2B2B] text-white text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
