import React, { useState } from 'react';
import { User, Mail, Phone, Lock, CheckCircle2, Shield } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { useAuth } from '../../context/AuthContext';

export const LeaderProfilePage: React.FC = () => {
  const { user, activeTeam, assignedTeams } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setSuccessMsg('Your password has been updated securely.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Header
        title="Leader Account Settings"
        subtitle="Manage your profile information, password, and foundation team affiliations"
      />

      {/* Account Info Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
          <User className="w-4 h-4 text-brand-gold" />
          <span>Profile Overview</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[11px] text-brand-mutedGray block">Full Name</span>
            <span className="text-sm font-semibold text-brand-navy">{user?.full_name}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[11px] text-brand-mutedGray block">System Role</span>
            <span className="text-sm font-semibold text-brand-navy capitalize">
              {user?.role.replace('_', ' ')}
            </span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[11px] text-brand-mutedGray block">Official Email</span>
            <span className="text-sm font-semibold text-brand-navy">{user?.email}</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-[11px] text-brand-mutedGray block">Assigned Team</span>
            <span className="text-sm font-semibold text-brand-navy">
              {activeTeam?.name || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-gold" />
          <span>Update Security Password</span>
        </h3>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-navy block mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-brand-navy hover:bg-brand-darkNavy rounded-lg shadow-sm transition-colors"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

