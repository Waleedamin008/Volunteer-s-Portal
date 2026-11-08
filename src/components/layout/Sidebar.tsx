import React from 'react';
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
  Share2,
  Database,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../brand/Logo';
import { StorageService } from '../../lib/storage';
import { isSupabaseActive } from '../../lib/supabase';
import { SupabaseConfigModal } from '../common/SupabaseConfigModal';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, logout, activeTeam } = useAuth();
  const navigate = useNavigate();
  const [isConfigModalOpen, setIsConfigModalOpen] = React.useState(false);

  const isAdmin = user?.role === 'admin';
  const isCloudActive = isSupabaseActive();
  const allTeams = StorageService.getTeams();
  const activeTeams = allTeams.filter((t) => t.status === 'active');
  const primaryPublicSlug = activeTeams.length > 0 ? activeTeams[0].slug : null;

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
                <p className="text-[10px] text-brand-lightGold truncate max-w-[130px]">
                  {activeTeam.name}
                </p>
              )}
            </div>
          </div>
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

          {/* Public Link Shortcut */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <p className="px-3 text-[11px] font-semibold text-brand-gold uppercase tracking-wider mb-2">
              Public Portal
            </p>
            {isAdmin ? (
              primaryPublicSlug ? (
                <NavLink
                  to={`/join/${primaryPublicSlug}`}
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
              ) : (
                <NavLink
                  to="/admin/teams"
                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <span className="italic text-[11px]">Create team to enable links</span>
                </NavLink>
              )
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

        {/* Supabase Cloud Sync Badge (Admin Only) */}
        {isAdmin && (
          <div className="px-3 py-2 border-t border-white/10 bg-white/5">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-black/20 hover:bg-black/30 border border-white/10 transition-colors text-left cursor-pointer group"
              title="Click to view or configure Supabase Cloud Database"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isCloudActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-white block truncate">
                    {isCloudActive ? 'Supabase Cloud' : 'Offline Mode'}
                  </span>
                  <span className="text-[10px] text-brand-lightGold/80 block truncate">
                    {isCloudActive ? 'Realtime Connected' : 'Click to connect DB'}
                  </span>
                </div>
              </div>
              <Database className="w-3.5 h-3.5 text-brand-gold shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        )}

        {/* User Info & Logout Footer */}
        <div className="p-3 border-t border-white/10 bg-brand-darkNavy/60">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-gold text-brand-navy font-bold flex items-center justify-center text-xs shrink-0">
                {user?.full_name ? user.full_name[0] : 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.full_name || 'Administrator'}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {user?.email || 'admin@maqamejoud.org'}
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

      <SupabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </>
  );
};
