import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Mail,
  Phone,
  Lock,
  X,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Shield,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { StorageService } from '../../lib/storage';
import { UserProfile, Team } from '../../types';

export const AdminLeadersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(
    StorageService.getUsers().filter((u) => u.role === 'team_leader')
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [teamId, setTeamId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const teams = StorageService.getTeams();

  const refreshList = () => {
    setUsers(StorageService.getUsers().filter((u) => u.role === 'team_leader'));
  };

  const handleCreateLeader = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim()) {
      setError('Please provide full name and email address.');
      return;
    }

    const existing = StorageService.getUserByEmail(email.trim());
    if (existing) {
      setError('A user account with this email address already exists.');
      return;
    }

    try {
      const newUser = StorageService.createUser({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role: 'team_leader',
      });

      if (teamId) {
        StorageService.updateTeam(teamId, { leader_id: newUser.id });
      }

      setFullName('');
      setEmail('');
      setPhone('');
      setTeamId('');
      setPassword('');
      setIsModalOpen(false);
      setSuccessMsg(`Team leader account for ${newUser.full_name} created successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      refreshList();
    } catch (err: any) {
      setError(err?.message || 'Failed to create leader account.');
    }
  };

  const handleResetPassword = (leader: UserProfile) => {
    if (
      window.confirm(
        `Generate secure password reset invitation for ${leader.full_name} (${leader.email})?`
      )
    ) {
      StorageService.logActivity({
        user_name: 'Admin',
        action: `Initiated password reset for ${leader.full_name}`,
        entity_type: 'user',
        entity_id: leader.id,
      });
      alert(`Password reset link dispatched to ${leader.email}.`);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Team Leaders Management"
        subtitle="Manage credentials, team assignments, and access permissions for foundation team leads"
        actionButton={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-navy hover:bg-brand-darkNavy text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 text-brand-gold" />
            <span>Create Leader Account</span>
          </button>
        }
      />

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Leaders Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-brand-navy">Authorized Team Leaders</h3>
            <p className="text-xs text-brand-mutedGray mt-0.5">
              Each leader is granted restricted access strictly to their assigned team's applications
            </p>
          </div>
          <span className="text-xs font-semibold text-brand-navy bg-brand-warmIvory/60 border border-brand-gold/30 px-2.5 py-1 rounded-lg">
            {users.length} Active Leaders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-brand-navy text-white text-[11px] font-semibold tracking-wider uppercase">
                <th className="py-3 px-4">Leader Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4">Account Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-brand-charcoal">
              {users.map((leader) => {
                const assignedTeams = StorageService.getUserTeams(leader.id);
                return (
                  <tr key={leader.id} className="hover:bg-brand-warmIvory/10 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {leader.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-brand-navy text-xs sm:text-sm">
                            {leader.full_name}
                          </p>
                          <span className="text-[10px] text-brand-gold font-medium uppercase tracking-wider">
                            Team Leader
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-xs">
                        <p className="text-brand-navy font-medium">{leader.email}</p>
                        <p className="text-brand-mutedGray text-[11px]">
                          {leader.phone || 'No phone recorded'}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {assignedTeams.length > 0 ? (
                        <div className="space-y-1">
                          {assignedTeams.map((t) => (
                            <span
                              key={t.id}
                              className="inline-block px-2.5 py-1 rounded-lg bg-brand-warmIvory/50 border border-brand-gold/30 text-brand-navy font-medium text-xs"
                            >
                              {t.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 italic">No team assigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-brand-mutedGray">
                      {new Date(leader.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleResetPassword(leader)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Reset leader password"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-brand-gold" />
                        <span>Reset PW</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Leader Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-warmIvory/60 flex items-center justify-center text-brand-navy">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-navy">New Team Leader Account</h3>
                  <p className="text-xs text-brand-mutedGray">
                    Create credentials and assign to recruitment pipeline
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
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

            <form onSubmit={handleCreateLeader} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-brand-navy block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-navy block mb-1">
                  Official Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="leader@maqamejoud.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-navy block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-navy block mb-1">
                  Assigned Recruitment Team
                </label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none bg-white"
                >
                  <option value="">-- Assign Later --</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-navy block mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  placeholder="Leave blank for secure auto-invite"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-darkNavy rounded-lg shadow-sm transition-colors"
                >
                  Create Leader
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
