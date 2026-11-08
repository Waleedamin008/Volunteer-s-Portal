import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../lib/storage';
import { ApplicationTable } from '../../components/applications/ApplicationTable';
import { exportApplicationsToExcel } from '../../lib/exportUtils';

export const LeaderDashboard: React.FC = () => {
  const { user, activeTeam, assignedTeams } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!activeTeam) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
        <h2 className="text-lg font-bold text-brand-navy">No Assigned Team Found</h2>
        <p className="text-xs text-brand-mutedGray mt-1">
          Your account has not been linked to an active recruitment team yet. Please contact the administrator.
        </p>
      </div>
    );
  }

  const teamStats = StorageService.getTeamStats(activeTeam.id);
  const teamApplications = StorageService.getApplications({ teamId: activeTeam.id });
  const recentTeamApps = teamApplications.slice(0, 5);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/join/${activeTeam.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Header
        title={`${activeTeam.name} — Leader Dashboard`}
        subtitle={`Welcome, ${user?.full_name}. Manage volunteer applications and candidate onboarding`}
        actionButton={
          <button
            onClick={() => exportApplicationsToExcel(teamApplications, `${activeTeam.slug}_volunteers`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Team Excel</span>
          </button>
        }
      />

      {/* Unique Recruitment Link Card */}
      <div className="bg-gradient-to-r from-brand-navy via-brand-darkNavy to-brand-navy p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-brand-gold/5 blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-brand-gold uppercase tracking-widest flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              <span>Official Public Recruitment Link</span>
            </span>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight">
              Share your team's unique joining link with prospective volunteers
            </h3>
            <p className="text-xs text-gray-300 max-w-xl">
              Every applicant submitting through this URL will automatically appear in your team dashboard without requiring an account.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-xs font-mono text-brand-lightGold truncate max-w-[280px]">
              /join/{activeTeam.slug}
            </div>

            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-brand-gold hover:bg-brand-lightGold text-brand-navy font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-brand-navy" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-brand-navy" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <a
              href={`/join/${activeTeam.slug}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
              title="Open Public Form in New Tab"
            >
              <ExternalLink className="w-4 h-4 text-brand-lightGold" />
            </a>
          </div>
        </div>
      </div>

      {/* Team KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-brand-mutedGray mb-2">
            <span className="text-xs font-semibold">Total Applicants</span>
            <Users className="w-4 h-4 text-brand-navy" />
          </div>
          <p className="text-2xl font-bold text-brand-navy">{teamStats.total}</p>
          <span className="text-[11px] text-brand-mutedGray">For this team</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-brand-mutedGray mb-2">
            <span className="text-xs font-semibold">New Submissions</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700">{teamStats.new}</p>
          <span className="text-[11px] text-blue-700 font-medium">Ready for review</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-brand-mutedGray mb-2">
            <span className="text-xs font-semibold">Under Review</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{teamStats.under_review}</p>
          <span className="text-[11px] text-amber-700 font-medium">Evaluation pending</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-brand-mutedGray mb-2">
            <span className="text-xs font-semibold">Contacted</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-700">{teamStats.contacted}</p>
          <span className="text-[11px] text-purple-700 font-medium">Calls / WhatsApp sent</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-brand-mutedGray mb-2">
            <span className="text-xs font-semibold">Approved</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{teamStats.approved}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Active volunteers</span>
        </div>
      </div>

      {/* Team Applications Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-brand-navy">Team Volunteer Applications</h3>
            <p className="text-xs text-brand-mutedGray">
              Search, filter, update statuses, contact via WhatsApp, and download official PDF profiles
            </p>
          </div>
          <Link
            to="/leader/applications"
            className="text-xs font-semibold text-brand-navy hover:text-brand-gold flex items-center gap-1"
          >
            <span>Full Application Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ApplicationTable
          applications={teamApplications}
          showTeamColumn={false}
          onRefresh={() => {
            // refresh
          }}
        />
      </div>
    </div>
  );
};
