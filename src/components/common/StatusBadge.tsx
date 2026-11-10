import React from 'react';
import { EmploymentStatus, HandoverStatus } from '../../types';

export const StatusBadge: React.FC<{
  status: EmploymentStatus | HandoverStatus | 'Completed' | 'In Progress' | 'Blocked';
  size?: 'sm' | 'md';
}> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const pad = isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-[#141414] text-[#A1A1A1] border-[#292929]';
  let dotColor = 'bg-[#686868]';

  switch (status) {
    case 'Active':
    case 'Completed':
    case 'Approved':
      colorClasses = 'bg-[#0E1A13] text-[#34D399] border-[#065F46]/50';
      dotColor = 'bg-[#10B981]';
      break;
    case 'Shared with Successor':
      colorClasses = 'bg-[#261407] text-[#FF8126] border-[#FF6B00]/40';
      dotColor = 'bg-[#FF6B00] shadow-[0_0_8px_#FF6B00]';
      break;
    case 'On Notice':
    case 'Awaiting Review':
    case 'In Progress':
      colorClasses = 'bg-[#1F1608] text-[#FBBF24] border-[#B45309]/50';
      dotColor = 'bg-[#F59E0B]';
      break;
    case 'Processing':
      colorClasses = 'bg-[#261407] text-[#FF8126] border-[#FF6B00]/50';
      dotColor = 'bg-[#FF6B00] animate-ping';
      break;
    case 'Exited':
    case 'Blocked':
      colorClasses = 'bg-[#1A0C0C] text-[#F87171] border-[#991B1B]/50';
      dotColor = 'bg-[#EF4444]';
      break;
    case 'Not Started':
    default:
      colorClasses = 'bg-[#141414] text-[#888888] border-[#292929]';
      dotColor = 'bg-[#555555]';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${pad} ${colorClasses} tracking-tight`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status}</span>
    </span>
  );
};
