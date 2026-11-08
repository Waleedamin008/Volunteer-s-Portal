import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  FileText,
  UserCheck,
  CheckCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { StorageService } from '../../lib/storage';
import { CreateTeamModal } from '../../components/teams/CreateTeamModal';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const stats = StorageService.getAdminStats();
  const teams = StorageService.getTeams();
  const recentApplications = StorageService.getApplications().slice(0, 5);
  const recentActivities = StorageService.getActivityLogs().slice(0, 6);

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/join/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Header
        title="Foundation Recruitment Overview"
        subtitle="Centralized volunteer management, team links & application pipelines"
        actionButton={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-navy hover:bg-brand-darkNavy text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-brand-gold" />
            <span>New Team</span>
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-brand-mutedGray mb-2">
            <span className="text-xs font-semibold">Total Teams</span>
            <Users className="w-4 h-4 text-brand-navy" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{stats.totalTeams}</p>
          <span className="text-[11px] text-emerald-700 font-medium">
            {stats.activeTeams} active pipelines
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-brand-mutedGray mb-2">
            <span className="text-xs font-semibold">Team Leaders</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{stats.totalLeaders}</p>
          <span className="text-[11px] text-brand-mutedGray">Assigned to teams</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-brand-mutedGray mb-2">
            <span className="text-xs font-semibold">Total Applications</span>
            <FileText className="w-4 h-4 text-brand-gold" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{stats.totalApplications}</p>
          <span className="text-[11px] text-brand-mutedGray">Across all teams</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-brand-mutedGray mb-2">
            <span className="text-xs font-semibold">New Submissions</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.newApplications}</p>
          <span className="text-[11px] text-amber-700 font-medium">Awaiting evaluation</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-brand-mutedGray mb-2">
            <span className="text-xs font-semibold">Contacted</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-700">{stats.contactedApplications}</p>
          <span className="text-[11px] text-purple-600">In interview stage</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-brand-mutedGray mb-2">
            <span className="text-xs font-semibold">Inducted / Approved</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats.approvedApplications}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Selected volunteers</span>
        </div>
      </div>

      {/* Team Recruitment Activity Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-brand-navy">Team Recruitment Pipelines</h3>
            <p className="text-xs text-brand-mutedGray mt-0.5">
              Live status, assigned leaders, and applicant conversion per team
            </p>
          </div>
          <Link
            to="/admin/teams"
            className="text-xs font-semibold text-brand-navy hover:text-brand-gold flex items-center gap-1"
          >
            <span>Manage All Teams</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {teams.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-warmIvory/60 text-brand-navy flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-brand-navy">No recruitment teams created yet</h4>
            <p className="text-xs text-brand-mutedGray max-w-sm mx-auto mt-1 mb-4">
              Get started by creating your first team. The system will automatically generate a unique public joining link and customizable form.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-navy hover:bg-brand-darkNavy text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-brand-gold" />
              <span>Create First Team</span>
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card View (< sm) */}
            <div className="sm:hidden divide-y divide-gray-100">
              {teams.map((t) => {
                const teamStats = StorageService.getTeamStats(t.id);
                const isCopied = copiedSlug === t.slug;

                return (
                  <div key={t.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/teams/${t.id}`}
                            className="font-bold text-brand-navy hover:text-brand-gold transition-colors text-sm"
                          >
                            {t.name}
                          </Link>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              t.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[11px] font-mono text-brand-mutedGray">
                            /join/{t.slug}
                          </span>
                          <button
                            onClick={() => handleCopyLink(t.slug)}
                            className="text-brand-gold hover:text-brand-navy p-0.5"
                            title="Copy Public Link"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={`/join/${t.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-400 hover:text-brand-navy p-0.5"
                            title="Open Public Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-brand-mutedGray flex items-center justify-between bg-gray-50/60 p-2 rounded-lg">
                      <span>Leader:</span>
                      <span className="font-semibold text-brand-navy">
                        {t.leader_name || 'Unassigned'}
                      </span>
                    </div>

                    {/* Stats summary pills */}
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="bg-gray-50 p-1.5 rounded-lg">
                        <span className="text-[10px] text-brand-mutedGray block">Total</span>
                        <span className="font-bold text-xs text-brand-navy">{teamStats.total}</span>
                      </div>
                      <div className="bg-blue-50/60 p-1.5 rounded-lg">
                        <span className="text-[10px] text-blue-600 block">New</span>
                        <span className="font-bold text-xs text-blue-700">{teamStats.new}</span>
                      </div>
                      <div className="bg-purple-50/60 p-1.5 rounded-lg">
                        <span className="text-[10px] text-purple-600 block">Contacted</span>
                        <span className="font-bold text-xs text-purple-700">{teamStats.contacted}</span>
                      </div>
                      <div className="bg-emerald-50/60 p-1.5 rounded-lg">
                        <span className="text-[10px] text-emerald-600 block">Approved</span>
                        <span className="font-bold text-xs text-emerald-700">{teamStats.approved}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Link
                        to={`/admin/teams/${t.id}/form`}
                        className="flex-1 text-center py-1.5 text-xs font-medium text-brand-navy bg-brand-warmIvory/60 hover:bg-brand-warmIvory rounded-lg transition-colors border border-brand-gold/30"
                      >
                        Form Builder
                      </Link>
                      <Link
                        to={`/admin/teams/${t.id}`}
                        className="flex-1 text-center py-1.5 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-darkNavy rounded-lg transition-colors"
                      >
                        Manage Team
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= sm) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-brand-navy text-white text-[11px] font-semibold tracking-wider uppercase">
                    <th className="py-3 px-4">Team & Link</th>
                    <th className="py-3 px-4">Team Leader</th>
                    <th className="py-3 px-4 text-center">Total</th>
                    <th className="py-3 px-4 text-center">New</th>
                    <th className="py-3 px-4 text-center">Contacted</th>
                    <th className="py-3 px-4 text-center">Approved</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teams.map((t) => {
                    const teamStats = StorageService.getTeamStats(t.id);
                    const isCopied = copiedSlug === t.slug;

                    return (
                      <tr key={t.id} className="hover:bg-brand-warmIvory/10 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <Link
                              to={`/admin/teams/${t.id}`}
                              className="font-bold text-brand-navy hover:text-brand-gold transition-colors text-xs sm:text-sm"
                            >
                              {t.name}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-mono text-brand-mutedGray">
                                /join/{t.slug}
                              </span>
                              <button
                                onClick={() => handleCopyLink(t.slug)}
                                className="text-brand-gold hover:text-brand-navy"
                                title="Copy Public Link"
                              >
                                {isCopied ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                              <a
                                href={`/join/${t.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-400 hover:text-brand-navy"
                                title="Open Public Link"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {t.leader_name ? (
                            <div>
                              <p className="font-semibold text-brand-navy text-xs">{t.leader_name}</p>
                              <p className="text-[10px] text-brand-mutedGray">{t.leader_email}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-600 italic">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-brand-navy">
                          {teamStats.total}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs">
                            {teamStats.new}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold text-xs">
                            {teamStats.contacted}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs">
                            {teamStats.approved}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                              t.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}
                          >
                            {t.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/admin/teams/${t.id}/form`}
                              className="px-2.5 py-1 text-xs font-medium text-brand-navy bg-brand-warmIvory/60 hover:bg-brand-warmIvory rounded-lg transition-colors border border-brand-gold/30"
                            >
                              Form Builder
                            </Link>
                            <Link
                              to={`/admin/teams/${t.id}`}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-darkNavy rounded-lg transition-colors"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Two Column Section: Recent Applications & Recent Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-gold" />
              <span>Recent Applications</span>
            </h3>
            <Link
              to="/admin/applications"
              className="text-xs font-semibold text-brand-navy hover:text-brand-gold"
            >
              View All ({stats.totalApplications})
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="py-8 text-center text-xs text-brand-mutedGray">
              No volunteer applications submitted yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => navigate('/admin/applications')}
                  className="py-3 flex items-center justify-between hover:bg-gray-50/50 cursor-pointer rounded-lg px-2 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-brand-navy">
                        {app.full_name}
                      </span>
                      <span className="text-[10px] font-mono text-brand-mutedGray">
                        {app.reference_number}
                      </span>
                    </div>
                    <p className="text-[11px] text-brand-mutedGray mt-0.5">
                      {app.team_name} &bull; {app.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Foundation Audit Log */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-gold" />
              <span>Foundation Activity Log</span>
            </h3>
            <Link
              to="/admin/activity"
              className="text-xs font-semibold text-brand-navy hover:text-brand-gold"
            >
              Full Log
            </Link>
          </div>

          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-brand-gold mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-brand-navy font-semibold truncate">{act.action}</p>
                  <p className="text-[11px] text-brand-mutedGray truncate">
                    {act.team_name ? `${act.team_name} • ` : ''}
                    By {act.user_name || 'System'}
                  </p>
                </div>
                <span className="text-[10px] text-brand-mutedGray whitespace-nowrap">
                  {new Date(act.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Team Modal */}
      {isCreateModalOpen && (
        <CreateTeamModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onTeamCreated={(newTeam) => {
            navigate(`/admin/teams/${newTeam.id}`);
          }}
        />
      )}
    </div>
  );
};
