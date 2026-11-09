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
  Eye,
  EyeOff,
  Copy,
  Check,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { StorageService } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmationContext';
import { UserProfile, Team } from '../../types';

export const AdminLeadersPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { confirm, showAlert } = useConfirm();
  const [users, setUsers] = useState<UserProfile[]>(
    StorageService.getUsers().filter((u) => u.role === 'team_leader')
  );

  // Create Leader Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [teamId, setTeamId] = useState('');
  const [initialPassword, setInitialPassword] = useState('leader123');
  const [createError, setCreateError] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');

  // Change Password Modal States
  const [passwordModalLeader, setPasswordModalLeader] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedLeaderId, setCopiedLeaderId] = useState<string | null>(null);

  const teams = StorageService.getTeams();

  const refreshList = () => {
    setUsers(StorageService.getUsers().filter((u) => u.role === 'team_leader'));
  };

  React.useEffect(() => {
    const handleSync = () => refreshList();
    window.addEventListener('mj_data_synced', handleSync);
    return () => window.removeEventListener('mj_data_synced', handleSync);
  }, []);

  const handleCopyLeaderCredentials = (leader: UserProfile) => {
    const password = StorageService.getUserPassword(leader.email);
    const loginUrl = `${window.location.origin}/login`;
    const assigned = StorageService.getUserTeams(leader.id);
    const teamName = assigned.length > 0 ? assigned.map((t) => t.name).join(', ') : 'Unassigned';

    const text = [
      `MAQAM-E-JOUD Foundation — Team Leader Portal Access`,
      `Portal Link: ${loginUrl}`,
      `Email: ${leader.email}`,
      `Password: ${password}`,
      `Assigned Team: ${teamName}`,
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedLeaderId(leader.id);
    setNotificationMsg(`Copied credentials for ${leader.full_name} to clipboard!`);
    setTimeout(() => {
      setCopiedLeaderId(null);
      setNotificationMsg('');
    }, 3000);
  };

  const handleCreateLeader = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!fullName.trim() || !email.trim()) {
      setCreateError('Please provide full name and email address.');
      return;
    }

    const existing = StorageService.getUserByEmail(email.trim());
    if (existing) {
      setCreateError('A user account with this email address already exists.');
      return;
    }

    try {
      const newUser = StorageService.createUser(
        {
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          role: 'team_leader',
        },
        initialPassword.trim() || 'leader123'
      );

      if (teamId) {
        StorageService.updateTeam(teamId, { leader_id: newUser.id });
      }

      const createdPwd = initialPassword.trim() || 'leader123';
      setFullName('');
      setEmail('');
      setPhone('');
      setTeamId('');
      setInitialPassword('leader123');
      setIsCreateModalOpen(false);

      // Open credentials card with 1-click copy for the admin to share
      setPasswordModalLeader(newUser);
      setNewPassword(createdPwd);
      setPasswordSuccess(
        `Leader account created for ${newUser.full_name}! You can copy and share the private portal link and credentials below:`
      );
      refreshList();
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create leader account.');
    }
  };

  const openPasswordModal = (leader: UserProfile) => {
    setPasswordModalLeader(leader);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setCopiedPassword(false);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let generated = 'MJ#';
    for (let i = 0; i < 7; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setConfirmPassword(generated);
  };

  const handleSaveLeaderPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordModalLeader) return;

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Password and confirmation do not match.');
      return;
    }

    const adminName = currentAdmin?.full_name || 'Foundation Administrator';
    const result = StorageService.changeLeaderPassword(
      passwordModalLeader.id,
      newPassword,
      adminName
    );

    if (result.success) {
      setPasswordSuccess(
        `Password updated successfully! Leader ${passwordModalLeader.full_name} can now sign in using this password.`
      );
      setNotificationMsg(
        `Password updated for ${passwordModalLeader.full_name} (${passwordModalLeader.email})`
      );
      setTimeout(() => setNotificationMsg(''), 6000);
    } else {
      setPasswordError('Failed to update leader password.');
    }
  };

  const handleCopyPassword = () => {
    if (!newPassword || !passwordModalLeader) return;
    const loginUrl = `${window.location.origin}/login`;
    const message = `MAQAM-E-JOUD Foundation — Team Leader Portal Access\nPortal Login URL: ${loginUrl}\nEmail: ${passwordModalLeader.email}\nPassword: ${newPassword}`;
    navigator.clipboard.writeText(message);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  const handleDeleteLeader = async (leader: UserProfile) => {
    const assigned = StorageService.getUserTeams(leader.id);
    const teamWarning =
      assigned.length > 0
        ? `Assigned to: ${assigned.map((t) => t.name).join(', ')}. These teams will become unassigned.`
        : 'This leader is not currently assigned to any team.';

    const confirmed = await confirm({
      title: 'Delete Team Leader',
      message: `Are you sure you want to permanently delete team leader "${leader.full_name}" (${leader.email})?\n\n${teamWarning}\n\nThis action cannot be undone.`,
      confirmText: 'Delete Leader',
      variant: 'danger',
    });

    if (!confirmed) return;

    const res = StorageService.deleteUser(
      leader.id,
      currentAdmin?.full_name || 'Foundation Administrator'
    );
    if (res.success) {
      setNotificationMsg(`Team leader "${leader.full_name}" has been permanently deleted.`);
      setTimeout(() => setNotificationMsg(''), 5000);
      refreshList();
    } else {
      await showAlert({
        title: 'Action Blocked',
        message: res.error || 'Failed to delete leader account.',
        variant: 'danger',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Team Leaders & Credentials"
        subtitle="Manage leader accounts, assign recruitment teams, and update security passwords"
        actionButton={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 bg-brand-navy hover:bg-brand-darkNavy text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-brand-gold" />
            <span>Create Leader Account</span>
          </button>
        }
      />

      {notificationMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Leaders Card / Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-brand-navy">Authorized Team Leaders</h3>
            <p className="text-xs text-brand-mutedGray mt-0.5">
              Each leader is granted restricted access strictly to their assigned team's applications
            </p>
          </div>
          <span className="text-xs font-semibold text-brand-navy bg-brand-warmIvory/60 border border-brand-gold/30 px-2.5 py-1 rounded-lg">
            {users.length} Active {users.length === 1 ? 'Leader' : 'Leaders'}
          </span>
        </div>

        {/* Empty State */}
        {users.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-brand-warmIvory/60 text-brand-navy flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-brand-navy">No team leaders created yet</p>
            <p className="text-xs text-brand-mutedGray max-w-sm mx-auto mt-1 mb-4">
              Create leader credentials to assign dedicated supervisors to each volunteer recruitment pipeline.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-navy hover:bg-brand-darkNavy text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-brand-gold" />
              <span>Create First Leader</span>
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Cards View (< sm screens) */}
            <div className="sm:hidden divide-y divide-gray-100">
              {users.map((leader) => {
                const assignedTeams = StorageService.getUserTeams(leader.id);
                return (
                  <div key={leader.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {leader.full_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-brand-navy text-sm truncate">
                            {leader.full_name}
                          </p>
                          <p className="text-xs text-brand-mutedGray truncate">{leader.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-brand-gold bg-brand-warmIvory/60 px-2 py-0.5 rounded font-semibold uppercase shrink-0">
                        Leader
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-[10px] text-brand-mutedGray block">Phone</span>
                        <span className="font-medium text-brand-navy truncate block">
                          {leader.phone || 'None'}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <span className="text-[10px] text-brand-mutedGray block">Assigned Team</span>
                        <span className="font-medium text-brand-navy truncate block">
                          {assignedTeams.length > 0 ? assignedTeams[0].name : 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleCopyLeaderCredentials(leader)}
                        className="py-2 px-3 bg-white hover:bg-brand-warmIvory/60 border border-gray-200 text-brand-navy text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title={`Copy portal link, email, and password for ${leader.full_name}`}
                      >
                        {copiedLeaderId === leader.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-brand-gold" />
                            <span>Copy Credentials</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openPasswordModal(leader)}
                        className="flex-1 py-2 px-3 bg-brand-warmIvory/60 hover:bg-brand-warmIvory border border-brand-gold/40 text-brand-navy text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-brand-gold" />
                        <span>Change Password</span>
                      </button>
                      <button
                        onClick={() => handleDeleteLeader(leader)}
                        className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer shrink-0"
                        title={`Delete leader ${leader.full_name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= sm screens) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-brand-navy text-white text-[11px] font-semibold tracking-wider uppercase">
                    <th className="py-3 px-4">Leader Name</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Assigned Team</th>
                    <th className="py-3 px-4">Account Created</th>
                    <th className="py-3 px-4 text-right">Security Actions</th>
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
                                  className="inline-block px-2.5 py-1 rounded-lg bg-brand-warmIvory/50 border border-brand-gold/30 text-brand-navy font-medium text-xs truncate max-w-[200px]"
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
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCopyLeaderCredentials(leader)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-navy bg-white hover:bg-brand-warmIvory/60 border border-gray-200 hover:border-brand-gold/40 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              title={`Copy portal link, email, and password for ${leader.full_name}`}
                            >
                              {copiedLeaderId === leader.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-brand-gold" />
                                  <span>Copy Credentials</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => openPasswordModal(leader)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-navy bg-brand-warmIvory/60 hover:bg-brand-warmIvory border border-brand-gold/40 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              title={`Change password for ${leader.full_name}`}
                            >
                              <KeyRound className="w-3.5 h-3.5 text-brand-gold" />
                              <span>Change Password</span>
                            </button>
                            <button
                              onClick={() => handleDeleteLeader(leader)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
                              title={`Delete leader ${leader.full_name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* Change Leader Password Modal */}
      {passwordModalLeader && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-warmIvory/70 border border-brand-gold/30 flex items-center justify-center text-brand-navy">
                  <KeyRound className="w-4 h-4 text-brand-gold" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-navy">Change Leader Password</h3>
                  <p className="text-xs text-brand-mutedGray">
                    Set a new security password for {passwordModalLeader.full_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalLeader(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Leader Details Card */}
            <div className="my-3.5 p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase text-brand-mutedGray block">Team Leader</span>
                <span className="font-bold text-brand-navy">{passwordModalLeader.full_name}</span>
                <span className="text-[11px] text-brand-mutedGray block">
                  {passwordModalLeader.email}
                </span>
              </div>
              <span className="text-[10px] font-semibold bg-brand-warmIvory/60 border border-brand-gold/30 text-brand-navy px-2 py-0.5 rounded">
                Leader
              </span>
            </div>

            {passwordError && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Password Updated Successfully!</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    You can copy the new credentials below and share them with the team leader:
                  </p>
                  <div className="rounded-xl bg-white border border-emerald-200 p-3.5 space-y-3 shadow-2xs">
                    <div className="font-mono text-xs text-brand-navy space-y-2 break-all">
                      <div>
                        <span className="text-brand-mutedGray block text-[10px] font-sans uppercase font-bold tracking-wider">
                          Portal Login Link
                        </span>
                        <span className="text-brand-navy font-semibold select-all">
                          {window.location.origin}/login
                        </span>
                      </div>
                      <div>
                        <span className="text-brand-mutedGray block text-[10px] font-sans uppercase font-bold tracking-wider">
                          Leader Email
                        </span>
                        <span className="text-brand-navy font-semibold select-all">
                          {passwordModalLeader.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-brand-mutedGray block text-[10px] font-sans uppercase font-bold tracking-wider">
                          New Password
                        </span>
                        <span className="text-brand-navy font-bold select-all bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                          {newPassword}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleCopyPassword}
                      className="w-full py-2.5 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      {copiedPassword ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Copied All to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-white" />
                          <span>Copy Link &amp; Credentials</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setPasswordModalLeader(null)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-darkNavy rounded-lg cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveLeaderPassword} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-brand-navy">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] text-brand-gold hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-Generate</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-brand-mutedGray absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-navy block mb-1">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-brand-mutedGray absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPasswordModalLeader(null)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-darkNavy rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Leader Account Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 my-auto">
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
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
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
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none bg-white cursor-pointer"
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
                  Initial Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. leader123"
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none font-mono"
                />
                <p className="text-[11px] text-brand-mutedGray mt-0.5">
                  You can change this password at any time later.
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-darkNavy rounded-lg shadow-sm transition-colors cursor-pointer"
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
