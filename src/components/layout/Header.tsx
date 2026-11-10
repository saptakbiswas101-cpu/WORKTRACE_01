import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/RoleBadge';
import {
  Sparkles,
  ChevronDown,
  Menu,
  Building2,
  LogOut,
  Check,
  Search,
} from 'lucide-react';
import { api } from '../../services/api';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { currentUser, currentRole, loginAs, demoUsers, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [systemInfo, setSystemInfo] = useState<{ isAiLive: boolean; modelName: string } | null>(null);

  useEffect(() => {
    api.getSystemInfo().then(setSystemInfo).catch(() => {});
  }, []);

  return (
    <header className="h-16 bg-[#0B0B0B] border-b border-[#222222] px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 select-none">
      {/* Left section: Mobile Toggle & Workspace Info */}
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-[#A1A1A1] hover:text-white hover:bg-[#161616] border border-[#222222]"
            aria-label="Toggle navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#141414] border border-[#242424] text-xs">
            <Building2 className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span className="font-semibold text-white">ABC Consumer Products</span>
            <span className="text-[#686868]">•</span>
            <span className="text-[#A1A1A1]">{currentUser?.departmentName}</span>
          </div>

          <div className="sm:hidden font-display font-bold text-sm tracking-tight text-white">
            WORK<span className="text-[#FF6B00]">TRACE</span>
          </div>
        </div>
      </div>

      {/* Right section: AI Engine Badge + Demo Switcher */}
      <div className="flex items-center gap-3">
        {/* Gemini AI Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-[#121212] border border-[#242424] text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[#FF6B00]" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B00] shadow-[0_0_6px_#FF6B00]" />
          </span>
          <span className="text-[#A1A1A1]">AI:</span>
          <span className="text-white font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FF6B00]" />
            Gemini 3.8 Flash
          </span>
        </div>

        {/* Demo Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#292929] hover:border-[#FF6B00]/60 bg-[#161616] hover:bg-[#1C1C1C] transition-all text-xs text-[#F5F5F5] shadow-xs"
          >
            <span className="text-[#686868] hidden sm:inline">Role:</span>
            <span className="font-bold text-white">{currentUser?.name.split(' ')[0]}</span>
            <RoleBadge role={currentRole} size="sm" />
            <ChevronDown className="w-3.5 h-3.5 text-[#686868] ml-0.5" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-[#141414] rounded-xl shadow-2xl border border-[#292929] py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-[#222222]">
                  <div className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                    DEMO PERSONA SWITCHER
                  </div>
                  <p className="text-[11px] text-[#A1A1A1] mt-0.5">
                    Experience role-based permissions and workflows in 1-click
                  </p>
                </div>

                <div className="p-1 space-y-1 max-h-[360px] overflow-y-auto">
                  {demoUsers.map((item) => {
                    const isSelected = currentUser?.id === item.employee.id;
                    return (
                      <button
                        key={item.employee.id}
                        onClick={() => {
                          loginAs(item.employee.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-[#261407] border border-[#FF6B00]/40 text-white'
                            : 'hover:bg-[#1E1E1E] text-[#A1A1A1]'
                        }`}
                      >
                        <img
                          src={item.employee.avatarUrl}
                          alt={item.employee.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#333333] mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white truncate">
                              {item.employee.name}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#FF6B00]" />}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <RoleBadge role={item.employee.role} size="sm" />
                            <span className="text-[10px] text-[#686868] truncate font-mono">
                              {item.employee.employeeCode}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#A1A1A1] truncate mt-1">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="px-3 py-2 border-t border-[#222222] mt-1 flex items-center justify-between text-[11px] text-[#686868]">
                  <span>Dept: {currentUser?.departmentName.split(' ')[0]}</span>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="text-[#EF4444] hover:text-[#F87171] font-medium flex items-center gap-1 transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
