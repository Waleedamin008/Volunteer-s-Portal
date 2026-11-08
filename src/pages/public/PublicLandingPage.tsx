import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/brand/Logo';
import { Shield, Lock, Users, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const PublicLandingPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="text-brand-lightGold text-xs font-semibold animate-pulse">
          Connecting to portal...
        </div>
      </div>
    );
  }

  // If already authenticated, redirect to respective dashboard
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/leader/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col justify-between items-center py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
        <Logo size="xl" variant="emblem" className="w-[800px] h-[800px]" />
      </div>

      <div className="w-full max-w-xl z-10 my-auto space-y-6">
        {/* Main Foundation Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-10 shadow-2xl border border-white/10 text-center space-y-6">
          <div className="flex justify-center">
            <Logo size="lg" variant="emblem" theme="light" />
          </div>

          <div>
            <span className="font-urdu text-2xl text-brand-gold font-bold block mb-1">
              مقامِ جود فاؤنڈیشن
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-navy tracking-tight">
              MAQAM-E-JOUD Foundation
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-brand-gold uppercase tracking-wider mt-1">
              Volunteer Recruitment &amp; Management System
            </p>
          </div>

          <div className="h-0.5 w-16 bg-brand-gold/40 mx-auto" />

          {/* Applicant Information Box */}
          <div className="p-4 rounded-2xl bg-brand-warmIvory/30 border border-brand-gold/30 text-left space-y-2.5">
            <div className="flex items-center gap-2 text-brand-navy font-bold text-xs sm:text-sm">
              <HeartHandshake className="w-4 h-4 text-brand-gold shrink-0" />
              <span>Prospective Volunteer Applicants</span>
            </div>
            <p className="text-xs text-brand-charcoal leading-relaxed">
              Volunteer recruitment at MAQAM-E-JOUD Foundation is organized across specialized teams. If you are applying to join our volunteer family, please open the <strong>unique recruitment link</strong> shared directly by your team leader (e.g.{' '}
              <code className="text-brand-navy font-mono bg-white px-1.5 py-0.5 rounded border border-brand-gold/30">
                /join/[team-slug]
              </code>
              ).
            </p>
            <p className="text-[11px] text-brand-mutedGray">
              No account creation or portal login is required for volunteer applicants.
            </p>
          </div>

          {/* Restricted Notice */}
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-brand-warmIvory/60 text-brand-navy flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-brand-gold" />
            </div>
            <div className="text-[11px] text-brand-mutedGray leading-tight">
              <p className="font-semibold text-brand-navy">Authorized Personnel Access</p>
              <p>Portal login is private and restricted to foundation administrators and appointed team leaders.</p>
            </div>
          </div>

          {/* Discreet Staff Login Link */}
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy/70 hover:text-brand-navy hover:underline transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-brand-gold" />
              <span>Authorized Personnel Login &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="z-10 text-center text-xs text-white/60 space-y-1">
        <p className="font-medium text-white/80">
          MAQAM-E-JOUD Foundation &bull; Serving Humanity with Compassion &amp; Dignity
        </p>
        <p className="text-[11px] text-white/50">
          Official Volunteer Management System &bull; Est. 2026
        </p>
      </footer>
    </div>
  );
};

