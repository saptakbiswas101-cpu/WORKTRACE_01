import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PenSquare,
  Clock,
  Database,
  FileText,
  Sparkles,
  ArrowRightLeft,
  BotMessageSquare,
  Shield,
  Layers,
  LogOut,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/RoleBadge';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { currentUser, currentRole, logout } = useAuth();

  const navSections = [
    {
      group: 'MAIN',
      items: [
        { label: 'Overview', to: '/', icon: LayoutDashboard, roles: ['employee', 'manager', 'admin'] },
        { label: 'Employees', to: '/employees', icon: Users, roles: ['employee', 'manager', 'admin'] },
      ],
    },
    {
      group: 'KNOWLEDGE CAPTURE',
      items: [
        { label: 'Daily Activities', to: '/submit-activity', icon: PenSquare, roles: ['employee', 'manager', 'admin'] },
        { label: 'Activity Logbook', to: '/activity-history', icon: Clock, roles: ['employee', 'manager', 'admin'] },
        { label: 'Knowledge Repository', to: '/knowledge', icon: Database, roles: ['employee', 'manager', 'admin'] },
        { label: 'Documents', to: '/documents', icon: FileText, roles: ['employee', 'manager', 'admin'] },
      ],
    },
    {
      group: 'CONTINUITY & HANDOVER',
      items: [
        {
          label: 'Handover Management',
          to: '/handovers',
          icon: ArrowRightLeft,
          roles: ['employee', 'manager', 'admin'],
          badge: currentRole === 'manager' || currentRole === 'admin' ? 'REVIEW' : undefined,
        },
        {
          label: 'Successor Assistant',
          to: '/successor-assistant',
          icon: BotMessageSquare,
          roles: ['employee', 'manager', 'admin'],
          highlight: true,
        },
        {
          label: 'AI Intelligence',
          to: '/ai-insights',
          icon: Sparkles,
          roles: ['manager', 'admin'],
        },
      ],
    },
    {
      group: 'GOVERNANCE',
      items: [
        { label: 'Settings & Audit', to: '/admin', icon: Shield, roles: ['admin'] },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0B0B0B] border-r border-[#222222] flex flex-col shrink-0 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#1E1E1E] bg-[#090909]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(255,107,0,0.35)]">
              <Layers className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-white text-base tracking-tight">
                  WORK<span className="text-[#FF6B00]">TRACE</span>
                </span>
              </div>
              <p className="text-[10px] text-[#686868] tracking-wider uppercase font-medium">KNOWLEDGE CONTINUITY</p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1A1A1A] text-[#A1A1A1] border border-[#2A2A2A]">
            v1.0
          </span>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs">
          {navSections.map((section, idx) => {
            const visible = section.items.filter((item) => item.roles.includes(currentRole));
            if (visible.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-[#686868] mb-1.5">
                  {section.group}
                </div>

                {visible.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `group relative flex items-center justify-between px-3 py-2 rounded-md font-medium transition-all ${
                          isActive
                            ? 'bg-[#181818] text-white border border-[#2A2A2A]'
                            : 'text-[#A1A1A1] hover:text-white hover:bg-[#121212]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active Orange Bar */}
                          {isActive && (
                            <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#FF6B00] shadow-[0_0_8px_#FF6B00]" />
                          )}

                          <div className="flex items-center gap-2.5 truncate">
                            <Icon
                              className={`w-4 h-4 transition-colors ${
                                isActive
                                  ? 'text-[#FF6B00]'
                                  : 'text-[#686868] group-hover:text-[#A1A1A1]'
                              } ${item.highlight ? 'text-[#FF6B00]' : ''}`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#261407] text-[#FF8126] border border-[#FF6B00]/40">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Profile & Logout Bottom Bar */}
        {currentUser && (
          <div className="p-3 border-t border-[#1E1E1E] bg-[#0A0A0A] space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-[#141414] border border-[#222222]">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#FF6B00]/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-[#A1A1A1] truncate">{currentUser.designation}</div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 text-xs">
              <RoleBadge role={currentRole} size="sm" />
              <button
                onClick={logout}
                className="text-[11px] font-medium text-[#686868] hover:text-[#EF4444] flex items-center gap-1 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3 h-3" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
