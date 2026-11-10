import React, { useState } from 'react';
import { Info, Sparkles, X, Terminal } from 'lucide-react';
import { SYNTHETIC_COMPANY_NAME } from '../../data/seedData';

export const SyntheticDataBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#0C0C0C] border-b border-[#222222] px-4 py-2 text-xs text-[#A1A1A1] flex items-center justify-between select-none">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-[#FF6B00]/15 text-[#FF8126] border border-[#FF6B00]/30">
          <Terminal className="w-2.5 h-2.5" />
          SYNTHETIC DEMO
        </span>
        <span className="font-medium text-[#F5F5F5] text-xs">
          Simulated Workspace for <strong className="font-bold text-white">{SYNTHETIC_COMPANY_NAME}</strong>
        </span>
        <span className="hidden lg:inline text-[#686868] text-[11px]">
          — All employee records, vendor claims, and operational events are fictional data.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#F5F5F5] bg-[#161616] border border-[#292929] px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shadow-[0_0_6px_#FF6B00]" />
          Gemini 3.8 Flash
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#686868] hover:text-[#F5F5F5] p-1 rounded transition-colors"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
