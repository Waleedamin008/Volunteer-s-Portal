import React, { useState } from 'react';
import { Activity, Filter, Clock, Users, FileText, CheckCircle2 } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { StorageService } from '../../lib/storage';

export const AdminActivityPage: React.FC = () => {
  const [teamFilter, setTeamFilter] = useState('all');

  const teams = StorageService.getTeams();
  const logs = StorageService.getActivityLogs(teamFilter);

  return (
    <div className="space-y-6">
      <Header
        title="Foundation Activity & Audit Logs"
        subtitle="Immutable event audit trail across all recruitment pipelines and volunteer actions"
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-brand-mutedGray" />
          <span className="font-semibold text-brand-navy">Filter by Team:</span>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-gray-300 bg-gray-50 text-brand-navy font-medium focus:outline-none"
          >
            <option value="all">All Teams ({teams.length})</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-brand-mutedGray">
          Showing <strong>{logs.length}</strong> logged events
        </span>
      </div>

      {/* Activity Timeline Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-6">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-brand-gold/30">
          {logs.map((log) => (
            <div key={log.id} className="relative group">
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-brand-gold border-2 border-white shadow-xs group-hover:scale-125 transition-transform" />
              <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 hover:border-brand-gold/40 hover:bg-brand-warmIvory/10 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-brand-navy">
                      {log.action}
                    </span>
                    {log.team_name && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-warmIvory text-brand-navy border border-brand-gold/30 font-medium">
                        {log.team_name}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-brand-mutedGray font-mono">
                    {new Date(log.created_at).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-brand-mutedGray mt-2">
                  <span>
                    Initiated by:{' '}
                    <strong className="text-brand-navy font-semibold">
                      {log.user_name || 'Public Applicant'}
                    </strong>
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-gray-400">
                    Entity: {log.entity_type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
