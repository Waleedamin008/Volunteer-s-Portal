import React, { useState } from 'react';
import { X, Users, Sparkles, AlertCircle } from 'lucide-react';
import { StorageService } from '../../lib/storage';
import { Team } from '../../types';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: (team: Team) => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  onTeamCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const leaders = StorageService.getUsers().filter((u) => u.role === 'team_leader');

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-generate slug from name
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a team name.');
      return;
    }

    if (!slug.trim()) {
      setError('A valid public URL slug is required.');
      return;
    }

    // Check slug uniqueness
    const existing = StorageService.getTeamBySlug(slug.trim());
    if (existing) {
      setError('This public URL slug is already in use by another team. Please choose a different one.');
      return;
    }

    try {
      const newTeam = StorageService.createTeam({
        name: name.trim(),
        description: description.trim(),
        slug: slug.trim(),
        leader_id: leaderId || undefined,
      });

      onTeamCreated(newTeam);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create team.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-warmIvory/60 flex items-center justify-center text-brand-navy">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-navy">Create Recruitment Team</h3>
              <p className="text-xs text-brand-mutedGray">
                Add a new volunteer team, generate its unique link, and assign a leader
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              Team Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Donation & Welfare Team"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              Public Joining Link Slug <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-brand-gold focus-within:bg-white">
              <span className="text-xs text-brand-mutedGray px-3 py-2 border-r border-gray-200 select-none">
                /join/
              </span>
              <input
                type="text"
                required
                placeholder="donation-team"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full text-xs sm:text-sm p-2 bg-transparent focus:outline-none text-brand-navy font-mono"
              />
            </div>
            <p className="text-[11px] text-brand-mutedGray mt-1">
              Unique web URL where prospective volunteers submit their forms.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              Assigned Team Leader
            </label>
            <select
              value={leaderId}
              onChange={(e) => setLeaderId(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none bg-white"
            >
              <option value="">-- Assign Later / No Primary Leader --</option>
              {leaders.map((leader) => (
                <option key={leader.id} value={leader.id}>
                  {leader.full_name} ({leader.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              Team Mission / Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the scope of responsibility, campaigns managed, and volunteer qualifications for this team..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-darkNavy rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              <span>Create Team & Form</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

