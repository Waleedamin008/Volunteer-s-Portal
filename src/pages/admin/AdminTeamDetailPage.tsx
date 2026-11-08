import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Power,
  Sparkles,
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Clock,
  UserCheck,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { StorageService } from '../../lib/storage';
import { ApplicationTable } from '../../components/applications/ApplicationTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { exportApplicationsToExcel } from '../../lib/exportUtils';

export const AdminTeamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isEditingLeader, setIsEditingLeader] = useState(false);
  const [selectedLeaderId, setSelectedLeaderId] = useState('');

  if (!id) return <div>Invalid team ID</div>;

  const team = StorageService.getTeamById(id);
  const formConfig = StorageService.getFormConfigByTeamId(id);
  const applications = StorageService.getApplications({ teamId: id });
  const teamStats = StorageService.getTeamStats(id);
  const allLeaders = StorageService.getUsers().filter((u) => u.role === 'team_leader');

  if (!team) {
    return (
      <div className="p-8 text-center bg-white rounded-xl">
        <p className="text-base text-brand-navy font-bold">Team not found</p>
        <Link to="/admin/teams" className="text-xs text-brand-gold mt-2 inline-block">
          &larr; Return to Teams
        </Link>
      </div>
    );
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/join/${team.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaderSave = () => {
    StorageService.updateTeam(team.id, { leader_id: selectedLeaderId });
    setIsEditingLeader(false);
  };

  const handleToggleStatus = () => {
    const next = team.status === 'active' ? 'deactivate' : 'activate';
    if (
      window.confirm(
        `Are you sure you want to ${next} this team? Inactive teams reject new applications.`
      )
    ) {
      StorageService.toggleTeamStatus(team.id);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title={team.name}
        subtitle={`Recruitment Pipeline & Volunteer Roster • /join/${team.slug}`}
        actionButton={
          <div className="flex items-center gap-2">
            <Link
              to="/admin/teams"
              className="px-3 py-1.5 text-xs text-brand-navy bg-white border border-gray-200 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>
            <Link
              to={`/admin/teams/${team.id}/form`}
              className="px-3.5 py-1.5 bg-brand-navy hover:bg-brand-darkNavy text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              <span>Form Builder</span>
            </Link>
          </div>
        }
      />

      {/* Top Banner Overview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-brand-navy">{team.name}</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  team.status === 'active'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                {team.status}
              </span>
              <button
                onClick={handleToggleStatus}
                className="text-xs text-gray-400 hover:text-rose-600 underline"
              >
                {team.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
            <p className="text-xs text-brand-mutedGray mt-1 max-w-2xl leading-relaxed">
              {team.description || 'No description entered.'}
            </p>
          </div>

          {/* Public Link Card */}
          <div className="p-3 bg-brand-warmIvory/30 border border-brand-gold/40 rounded-xl min-w-[280px]">
            <span className="text-[10px] font-semibold text-brand-mutedGray uppercase tracking-wider block">
              Unique Public Joining Link
            </span>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="font-mono text-xs text-brand-navy font-semibold truncate">
                /join/{team.slug}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-lg bg-white border border-brand-gold/30 hover:bg-brand-gold/20 text-brand-navy transition-colors text-xs flex items-center gap-1"
                >
                  {copied ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-semibold text-[10px]">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-medium text-[10px]">
                      <Copy className="w-3 h-3 text-brand-gold" /> Copy
                    </span>
                  )}
                </button>
                <a
                  href={`/join/${team.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white border border-brand-gold/30 hover:bg-brand-gold/20 text-brand-navy transition-colors"
                  title="Test Public Form"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Leader and Form Version info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-brand-mutedGray font-medium">Assigned Leader</span>
              <button
                onClick={() => {
                  setSelectedLeaderId(team.leader_id || '');
                  setIsEditingLeader(!isEditingLeader);
                }}
                className="text-[11px] text-brand-gold hover:underline font-semibold"
              >
                {isEditingLeader ? 'Cancel' : 'Change'}
              </button>
            </div>
            {isEditingLeader ? (
              <div className="space-y-2 mt-2">
                <select
                  value={selectedLeaderId}
                  onChange={(e) => setSelectedLeaderId(e.target.value)}
                  className="w-full text-xs p-1.5 rounded border border-gray-300 bg-white"
                >
                  <option value="">-- None --</option>
                  {allLeaders.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.full_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleLeaderSave}
                  className="w-full py-1 text-xs font-semibold bg-brand-navy text-white rounded"
                >
                  Update Leader
                </button>
              </div>
            ) : (
              <div>
                <p className="font-bold text-brand-navy text-sm">
                  {team.leader_name || 'No leader assigned'}
                </p>
                <p className="text-[11px] text-brand-mutedGray">{team.leader_email}</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[11px] text-brand-mutedGray font-medium block mb-1">
              Active Form Version
            </span>
            <p className="font-bold text-brand-navy text-sm">
              Version {formConfig?.published_version || 1}
            </p>
            <p className="text-[11px] text-brand-mutedGray">
              {formConfig?.fields.length || 0} configured fields
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[11px] text-brand-mutedGray font-medium block mb-1">
              Form Status
            </span>
            <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-brand-warmIvory text-brand-navy border border-brand-gold/30">
              {formConfig?.status.toUpperCase() || 'DRAFT'}
            </span>
            <Link
              to={`/admin/teams/${team.id}/form`}
              className="text-[11px] text-brand-gold hover:underline font-medium block mt-1"
            >
              Open Form Builder &rarr;
            </Link>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[11px] text-brand-mutedGray font-medium block mb-1">
              Created Timestamp
            </span>
            <p className="font-bold text-brand-navy text-xs">
              {new Date(team.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <span className="text-[10px] text-brand-mutedGray">System Record</span>
          </div>
        </div>

        {/* Status Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
            <span className="text-[10px] text-brand-mutedGray block">Total</span>
            <span className="text-xl font-bold text-brand-navy">{teamStats.total}</span>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-center">
            <span className="text-[10px] text-blue-700 block">New</span>
            <span className="text-xl font-bold text-blue-700">{teamStats.new}</span>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-center">
            <span className="text-[10px] text-amber-700 block">Under Review</span>
            <span className="text-xl font-bold text-amber-700">{teamStats.under_review}</span>
          </div>
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-center">
            <span className="text-[10px] text-purple-700 block">Contacted</span>
            <span className="text-xl font-bold text-purple-700">{teamStats.contacted}</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
            <span className="text-[10px] text-emerald-700 block">Approved</span>
            <span className="text-xl font-bold text-emerald-700">{teamStats.approved}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-600 block">On Hold</span>
            <span className="text-xl font-bold text-slate-700">{teamStats.on_hold}</span>
          </div>
        </div>
      </div>

      {/* Applications for this Team */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-gold" />
            <span>Applicants Assigned to {team.name}</span>
          </h3>
          <button
            onClick={() => exportApplicationsToExcel(applications, `${team.slug}_applicants`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Team Excel</span>
          </button>
        </div>

        <ApplicationTable
          applications={applications}
          showTeamColumn={false}
          onRefresh={() => {
            // refresh
          }}
        />
      </div>
    </div>
  );
};
