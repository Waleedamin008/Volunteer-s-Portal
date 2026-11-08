import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Power,
  Users,
  Settings,
  Shield,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { StorageService } from '../../lib/storage';
import { CreateTeamModal } from '../../components/teams/CreateTeamModal';
import { Team } from '../../types';

export const AdminTeamsPage: React.FC = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>(StorageService.getTeams());
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const refreshTeams = () => {
    setTeams(StorageService.getTeams());
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/join/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleToggleStatus = (teamId: string, currentStatus: string) => {
    const next = currentStatus === 'active' ? 'deactivate' : 'activate';
    if (
      window.confirm(
        `Are you sure you want to ${next} this team? Inactive teams will not accept public volunteer submissions.`
      )
    ) {
      StorageService.toggleTeamStatus(teamId);
      refreshTeams();
    }
  };

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.leader_name && t.leader_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Header
        title="Recruitment Teams & Joining Links"
        subtitle="Manage volunteer teams, customize dynamic forms, and configure public links"
        actionButton={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-navy hover:bg-brand-darkNavy text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 text-brand-gold" />
            <span>Create New Team</span>
          </button>
        }
      />

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-brand-mutedGray absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams by name, URL slug, or leader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg text-brand-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
          />
        </div>
        <span className="text-xs text-brand-mutedGray">
          Showing <strong>{filteredTeams.length}</strong> of {teams.length} teams
        </span>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeams.map((team) => {
          const teamStats = StorageService.getTeamStats(team.id);
          const formConfig = StorageService.getFormConfigByTeamId(team.id);
          const isCopied = copiedSlug === team.slug;

          return (
            <div
              key={team.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-3.5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${
                        team.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {team.status}
                    </span>
                    <h3 className="font-bold text-base text-brand-navy hover:text-brand-gold transition-colors">
                      <Link to={`/admin/teams/${team.id}`}>{team.name}</Link>
                    </h3>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(team.id, team.status)}
                    title={team.status === 'active' ? 'Deactivate Team' : 'Activate Team'}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      team.status === 'active'
                        ? 'text-gray-400 hover:text-rose-600 border-gray-200'
                        : 'text-gray-400 hover:text-emerald-600 border-gray-200'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-brand-mutedGray line-clamp-2 leading-relaxed">
                  {team.description || 'No description provided.'}
                </p>

                {/* Assigned Leader */}
                <div className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-brand-mutedGray block">
                      Team Leader
                    </span>
                    <span className="font-semibold text-brand-navy">
                      {team.leader_name || 'Unassigned'}
                    </span>
                  </div>
                  {team.leader_email && (
                    <span className="text-[11px] text-brand-mutedGray truncate max-w-[140px]">
                      {team.leader_email}
                    </span>
                  )}
                </div>

                {/* Public Link Box */}
                <div className="p-2 rounded-xl bg-brand-warmIvory/30 border border-brand-gold/30 flex items-center justify-between gap-2 text-xs">
                  <div className="truncate min-w-0">
                    <span className="text-[10px] text-brand-mutedGray block">Public URL:</span>
                    <span className="font-mono text-brand-navy text-[11px] truncate font-medium block">
                      /join/{team.slug}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopyLink(team.slug)}
                      className="p-1.5 rounded-md hover:bg-brand-gold/20 text-brand-navy transition-colors"
                      title="Copy Public Link"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={`/join/${team.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-md hover:bg-brand-gold/20 text-brand-navy transition-colors"
                      title="Open Public Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Applicant Counters */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-brand-mutedGray block">Total</span>
                    <span className="text-sm font-bold text-brand-navy">{teamStats.total}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                    <span className="text-[10px] text-blue-700 block">New</span>
                    <span className="text-sm font-bold text-blue-700">{teamStats.new}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 block">Approved</span>
                    <span className="text-sm font-bold text-emerald-700">{teamStats.approved}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-brand-mutedGray text-[11px]">
                  Form v{formConfig?.published_version || 1} &bull;{' '}
                  {formConfig?.fields.length || 0} fields
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/teams/${team.id}/form`}
                    className="px-2.5 py-1 font-semibold text-brand-navy bg-brand-warmIvory/60 hover:bg-brand-warmIvory rounded-lg border border-brand-gold/30 transition-colors"
                  >
                    Form Builder
                  </Link>
                  <Link
                    to={`/admin/teams/${team.id}`}
                    className="px-2.5 py-1 font-semibold text-white bg-brand-navy hover:bg-brand-darkNavy rounded-lg transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isCreateModalOpen && (
        <CreateTeamModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onTeamCreated={() => {
            refreshTeams();
          }}
        />
      )}
    </div>
  );
};
