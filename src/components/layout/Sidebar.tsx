import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  Activity,
  LogOut,
  ExternalLink,
  Shield,
  Briefcase,
  ChevronRight,
  Repeat,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../brand/Logo';
import { StorageService } from '../../lib/storage';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, logout, switchUser, assignedTeams, activeTeam } = useAuth();
  const navigate = useNavigate();
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const isAdmin = user?.role === 'admin';

  const adminNavItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/teams', icon: Users, label: 'Teams & Links' },
    { to: '/admin/applications', icon: FileText, label: 'Applications' },
    { to: '/admin/leaders', icon: UserCheck, label: 'Team Leaders' },
    { to: '/admin/activity', icon: Activity, label: 'Audit Log' },
  ];

  const leaderNavItems = [
    { to: '/leader/dashboard', icon: LayoutDashboard, label: 'Team Dashboard' },
    { to: '/leader/applications', icon: FileText, label: 'Team Applications' },
    { to: '/leader/team', icon: Share2, label: 'Recruitment Link' },
    { to: '/leader/profile', icon: UserCheck, label: 'My Account' },
  ];

  const navItems = isAdmin ? adminNavItems : leaderNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allDemoUsers = StorageService.getUsers();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-brand-navy/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-brand-navy text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-brand-gold/15`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 bg-brand-darkNavy/40">
          <Logo size="md" variant="horizontal" theme="dark" />
        </div>

        {/* Current Role Banner */}
        <div className="px-5 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <span className="p-1 rounded bg-brand-gold/20 text-brand-gold">
                <Shield className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="p-1 rounded bg-blue-500/20 text-blue-300">
                <Briefcase className="w-3.5 h-3.5" />
              </span>
            )}
            <div>
              <p className="text-xs font-semibold text-white tracking-wide">
                {isAdmin ? 'Foundation Admin' : 'Team Leader'}
              </p>
              {!isAdmin && activeTeam && (
                <p className="text-[10px] text-brand-lightGold truncate max-w-[120px]">
                  {activeTeam.name}
                </p>
              )}
            </div>
          </div>

          {/* Quick switch button for evaluation */}
          <button
            onClick={() => setShowSwitchModal(true)}
            title="Switch User / Role for Evaluation"
            className="text-[11px] px-2 py-0.5 rounded border border-brand-gold/40 text-brand-gold hover:bg-brand-gold/10 transition-colors flex items-center gap-1"
          >
            <Repeat className="w-3 h-3" />
            Switch
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-gold text-brand-navy shadow-sm font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-brand-navy' : 'text-brand-lightGold/80'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-brand-navy" />}
                </>
              )}
            </NavLink>
          ))}

          {/* Public Link Preview item */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <p className="px-3 text-[11px] font-semibold text-brand-gold uppercase tracking-wider mb-2">
              Public Portal
            </p>
            {isAdmin ? (
              <NavLink
                to="/join/donation-team"
                target="_blank"
                className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-3.5 h-3.5 text-brand-lightGold" />
                  <span>Public Joining Form</span>
                </div>
                <span className="text-[10px] text-brand-lightGold bg-white/10 px-1.5 py-0.5 rounded">
                  Live
                </span>
              </NavLink>
            ) : activeTeam ? (
              <NavLink
                to={`/join/${activeTeam.slug}`}
                target="_blank"
                className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-3.5 h-3.5 text-brand-lightGold" />
                  <span>View Team Link</span>
                </div>
                <span className="text-[10px] text-brand-lightGold bg-white/10 px-1.5 py-0.5 rounded">
                  Live
                </span>
              </NavLink>
            ) : null}
          </div>
        </nav>

        {/* User Info & Logout Footer */}
        <div className="p-3 border-t border-white/10 bg-brand-darkNavy/60">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-gold text-brand-navy font-bold flex items-center justify-center text-xs shrink-0">
                {user?.full_name ? user.full_name[0] : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.full_name || 'Logged User'}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-white/10 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Switch User Modal for quick testing/evaluation */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-brand-navy font-bold text-base">
                <Repeat className="w-5 h-5 text-brand-gold" />
                <span>Switch Role / User Account</span>
              </div>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-brand-mutedGray mt-2 mb-4">
              Switch between users to evaluate permissions, dashboard interfaces, and team isolation.
            </p>

            <div className="space-y-2">
              {allDemoUsers.map((u) => {
                const isSelected = u.id === user?.id;
                const userTeams = StorageService.getUserTeams(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowSwitchModal(false);
                      if (u.role === 'admin') {
                        navigate('/admin/dashboard');
                      } else {
                        navigate('/leader/dashboard');
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-brand-gold bg-brand-warmIvory/30 shadow-xs'
                        : 'border-gray-200 hover:border-brand-navy/30 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-brand-navy">
                          {u.full_name}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            u.role === 'admin'
                              ? 'bg-brand-navy text-brand-lightGold'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {u.role === 'admin' ? 'Admin' : 'Team Leader'}
                        </span>
                      </div>
                      <p className="text-xs text-brand-mutedGray mt-0.5">{u.email}</p>
                      {u.role === 'team_leader' && userTeams.length > 0 && (
                        <p className="text-[11px] text-brand-gold font-medium mt-1">
                          Team: {userTeams[0].name}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-xs font-semibold text-brand-navy bg-brand-gold/30 px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowSwitchModal(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
