import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/brand/Logo';
import { StorageService } from '../../lib/storage';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Shield,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/leader/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const user = StorageService.getUserByEmail(email.trim());
    if (!user) {
      setError('Account with this email does not exist.');
      setIsSubmitting(false);
      return;
    }

    const success = login(email.trim(), password);
    if (success) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/leader/dashboard');
      }
    } else {
      setError('Invalid password. Please check your credentials.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col justify-center items-center py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
        <Logo size="xl" variant="emblem" className="w-[800px] h-[800px]" />
      </div>

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Foundation Crest Header */}
        <div className="text-center">
          <Logo size="lg" variant="full" theme="dark" className="mx-auto" />
          <h2 className="text-xl font-bold text-white mt-4 tracking-tight">
            Volunteer Management Portal
          </h2>
          <p className="text-xs text-brand-lightGold mt-1">
            Sign in to manage teams, recruit volunteers, and track applications
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-white/10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-brand-navy block mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-mutedGray absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@maqamejoud.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-brand-navy">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-brand-gold hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-mutedGray absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-brand-navy hover:bg-brand-darkNavy transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-brand-gold" />
              <span>{isSubmitting ? 'Signing in...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

          {/* Restricted Access Guidance */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy">
              <Shield className="w-3.5 h-3.5 text-brand-gold" />
              <span>Restricted Access Portal</span>
            </div>
            <p className="text-[11px] text-brand-mutedGray leading-relaxed">
              This login page is restricted to authorized MAQAM-E-JOUD Foundation administrators and designated team leaders. All access is logged.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-base font-bold text-brand-navy mb-1">Reset Password</h3>
            <p className="text-xs text-brand-mutedGray mb-4">
              Enter your registered official email to receive a password reset link.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg mb-4">
                Password reset instructions have been sent to your email.
              </div>
            ) : (
              <input
                type="email"
                placeholder="your.email@maqamejoud.org"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-gray-300 mb-4 focus:ring-2 focus:ring-brand-gold focus:outline-none"
              />
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSuccess(false);
                }}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
              {!forgotSuccess && (
                <button
                  onClick={() => setForgotSuccess(true)}
                  className="px-4 py-1.5 text-xs font-semibold bg-brand-navy text-white rounded-lg"
                >
                  Send Reset Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
