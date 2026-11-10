import React from 'react';
import { EvidenceClassification } from '../../types';
import { CheckCircle2, UserCheck, HelpCircle, AlertTriangle, FileX } from 'lucide-react';

export const EvidenceTag: React.FC<{ classification: EvidenceClassification; size?: 'sm' | 'md' }> = ({
  classification,
  size = 'md',
}) => {
  const isSm = size === 'sm';
  const pad = isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const iconSize = isSm ? 'w-3 h-3' : 'w-3.5 h-3.5';

  switch (classification) {
    case 'Evidence-supported':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded border border-[#065F46]/60 bg-[#0E1A13] text-[#34D399] ${pad}`}
          title="Directly supported by documented activity logs or uploaded files"
        >
          <CheckCircle2 className={`${iconSize} text-[#10B981]`} />
          <span>Evidence-supported</span>
        </span>
      );
    case 'Verified by manager':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded border border-[#FF6B00]/40 bg-[#261407] text-[#FF8126] ${pad}`}
          title="Directly corroborated and countersigned by reporting manager"
        >
          <UserCheck className={`${iconSize} text-[#FF6B00]`} />
          <span>Verified by manager</span>
        </span>
      );
    case 'Uncertain':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded border border-[#B45309]/50 bg-[#1F1608] text-[#FBBF24] ${pad}`}
          title="Insufficient documentation or unverified informal practice"
        >
          <HelpCircle className={`${iconSize} text-[#F59E0B]`} />
          <span>Uncertain</span>
        </span>
      );
    case 'Conflicting':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded border border-[#991B1B]/60 bg-[#1A0C0C] text-[#F87171] ${pad}`}
          title="Conflicting records detected across activities, documents, or systems"
        >
          <AlertTriangle className={`${iconSize} text-[#EF4444]`} />
          <span>Conflicting</span>
        </span>
      );
    case 'Missing information':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded border border-[#333333] bg-[#141414] text-[#A1A1A1] ${pad}`}
          title="Required document, SOP, or handover parameter is missing"
        >
          <FileX className={`${iconSize} text-[#888888]`} />
          <span>Missing information</span>
        </span>
      );
    default:
      return null;
  }
};
