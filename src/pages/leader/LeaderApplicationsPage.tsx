import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { ApplicationTable } from '../../components/applications/ApplicationTable';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../lib/storage';

export const LeaderApplicationsPage: React.FC = () => {
  const { user, activeTeam } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!activeTeam) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
        <h2 className="text-lg font-bold text-brand-navy">No Assigned Team</h2>
        <p className="text-xs text-brand-mutedGray mt-1">
          Your account is not currently assigned to a recruitment team.
        </p>
      </div>
    );
  }

  // Strictly enforce team isolation: Leader can ONLY view their assigned team
  const applications = StorageService.getApplications({ teamId: activeTeam.id });

  return (
    <div className="space-y-6">
      <Header
        title={`${activeTeam.name} — Applications`}
        subtitle="Review volunteer profiles, record internal follow-up notes, and generate PDF dossiers"
      />

      <ApplicationTable
        key={refreshTrigger}
        applications={applications}
        showTeamColumn={false}
        title={`${activeTeam.name} Applicants`}
        onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </div>
  );
};
