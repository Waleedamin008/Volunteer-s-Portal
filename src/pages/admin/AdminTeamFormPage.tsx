import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { FormBuilder } from '../../components/forms/FormBuilder';
import { StorageService } from '../../lib/storage';

export const AdminTeamFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div>Invalid team ID</div>;

  const team = StorageService.getTeamById(id);

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

  return (
    <div className="space-y-6">
      <Header
        title={`Dynamic Form Builder — ${team.name}`}
        subtitle={`Configure volunteer recruitment form fields, validation, and publishing`}
        actionButton={
          <Link
            to={`/admin/teams/${team.id}`}
            className="px-3.5 py-1.5 text-xs text-brand-navy bg-white border border-gray-200 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Team Details</span>
          </Link>
        }
      />

      <FormBuilder teamId={team.id} />
    </div>
  );
};
