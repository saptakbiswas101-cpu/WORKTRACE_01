import React from 'react';
import { UserRole } from '../../types';
import { ShieldCheck, UserCheck, Briefcase } from 'lucide-react';

export const RoleBadge: React.FC<{ role: UserRole; size?: 'sm' | 'md' }> = ({ role, size = 'md' }) => {
  const isSm = size === 'sm';

  switch (role) {
    case 'admin':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border border-[#FF6B00]/40 bg-[#FF6B00]/10 text-[#FF8126] ${
            isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
          }`}
        >
          <ShieldCheck className={isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
          ADMIN
        </span>
      );
    case 'manager':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border border-[#333333] bg-[#161616] text-[#F5F5F5] ${
            isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
          }`}
        >
          <Briefcase className={`${isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-[#FF6B00]`} />
          MANAGER
        </span>
      );
    case 'employee':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border border-[#222222] bg-[#121212] text-[#A1A1A1] ${
            isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
          }`}
        >
          <UserCheck className={isSm ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
          EMPLOYEE
        </span>
      );
  }
};
