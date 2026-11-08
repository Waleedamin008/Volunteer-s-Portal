import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { ApplicationTable } from '../../components/applications/ApplicationTable';
import { StorageService } from '../../lib/storage';

export const AdminApplicationsPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const applications = StorageService.getApplications();
  const teams = StorageService.getTeams();

  return (
    <div className="space-y-6">
      <Header
        title="All Volunteer Applications"
        subtitle="Review, evaluate, contact, and export applications across all foundation teams"
      />

      <ApplicationTable
        key={refreshTrigger}
        applications={applications}
        teams={teams}
        showTeamColumn={true}
        onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </div>
  );
};
