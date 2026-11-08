import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { StorageService } from '../../lib/storage';
import { DynamicFormRenderer } from '../../components/forms/DynamicFormRenderer';
import { Logo } from '../../components/brand/Logo';
import { CheckCircle2, AlertCircle, Copy, Check, ArrowLeft, Heart, Shield } from 'lucide-react';

export const PublicJoinPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!slug) {
    return (
      <div className="min-h-screen bg-brand-ivoryBg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center shadow-lg border border-gray-100">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-brand-navy">Invalid Recruitment Link</h2>
          <p className="text-xs text-brand-mutedGray mt-2">
            No recruitment team slug was specified in the URL.
          </p>
        </div>
      </div>
    );
  }

  const team = StorageService.getTeamBySlug(slug);

  // Check if team exists and is active
  if (!team) {
    return (
      <div className="min-h-screen bg-brand-ivoryBg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center shadow-lg border border-gray-100">
          <Logo size="lg" variant="emblem" theme="light" className="mx-auto mb-4" />
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-brand-navy">Recruitment Team Not Found</h2>
          <p className="text-xs text-brand-mutedGray mt-2">
            The link you followed for team slug <code>"{slug}"</code> does not exist or has been removed.
          </p>
          <p className="text-xs text-brand-mutedGray mt-4">
            Please verify the joining link provided by your team leader or contact MAQAM-E-JOUD Foundation.
          </p>
        </div>
      </div>
    );
  }

  if (team.status !== 'active') {
    return (
      <div className="min-h-screen bg-brand-ivoryBg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center shadow-lg border border-gray-100">
          <Logo size="lg" variant="emblem" theme="light" className="mx-auto mb-4" />
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-brand-navy">Recruitment Currently Closed</h2>
          <p className="text-xs text-brand-mutedGray mt-2 leading-relaxed">
            Applications for <strong>{team.name}</strong> are currently not being accepted. Please check back later or contact the foundation for upcoming drives.
          </p>
          <p className="text-xs text-brand-gold font-urdu mt-4 text-base">
            جزاکم اللہ خیراً و أحسن الجزاء
          </p>
        </div>
      </div>
    );
  }

  const formConfig = StorageService.getFormConfigByTeamId(team.id);

  if (!formConfig || formConfig.status !== 'published') {
    return (
      <div className="min-h-screen bg-brand-ivoryBg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center shadow-lg border border-gray-100">
          <Logo size="lg" variant="emblem" theme="light" className="mx-auto mb-4" />
          <h2 className="text-lg font-bold text-brand-navy">Form Under Preparation</h2>
          <p className="text-xs text-brand-mutedGray mt-2">
            This team's recruitment form is currently being updated by the administration and will be open shortly.
          </p>
        </div>
      </div>
    );
  }

  const handleFormSubmit = (formData: Record<string, any>) => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = StorageService.submitApplication({
        team_slug: team.slug,
        answers: formData,
      });

      setSubmittedRef(res.application.reference_number);
      setSubmittedName(res.application.full_name);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit application. Please check your fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (!submittedRef) return;
    navigator.clipboard.writeText(submittedRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-brand-ivoryBg py-8 px-4 sm:px-6 flex flex-col items-center">
      {/* Container Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Top Decorative Gold Stripe */}
        <div className="h-2 bg-gradient-to-r from-brand-gold via-brand-lightGold to-brand-gold" />

        <div className="p-6 sm:p-10">
          {submittedRef ? (
            /* Success Screen */
            <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="font-urdu text-xl text-brand-gold block mb-1">
                  مقامِ جود فاؤنڈیشن
                </span>
                <h2 className="text-2xl font-bold text-brand-navy">
                  Application Received Successfully!
                </h2>
                <p className="text-xs sm:text-sm text-brand-mutedGray mt-2 max-w-md mx-auto">
                  Thank you, <strong>{submittedName}</strong>. Your volunteer application for the{' '}
                  <strong>{team.name}</strong> has been registered in our system.
                </p>
              </div>

              {/* Reference ID Box */}
              <div className="p-4 rounded-2xl bg-brand-warmIvory/30 border border-brand-gold/40 max-w-sm mx-auto text-center space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-mutedGray block">
                  Application Reference ID
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl font-mono font-bold text-brand-navy">
                    {submittedRef}
                  </span>
                  <button
                    onClick={handleCopyRef}
                    className="p-1.5 rounded-md hover:bg-brand-gold/20 text-brand-navy transition-colors"
                    title="Copy Reference Number"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-brand-gold" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-brand-mutedGray">
                  Please save this reference number for future communication.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 max-w-md mx-auto text-xs text-brand-charcoal text-left space-y-1.5">
                <div className="flex items-center gap-2 text-brand-navy font-semibold">
                  <Shield className="w-4 h-4 text-brand-gold" />
                  <span>What happens next?</span>
                </div>
                <p className="text-[11px] text-brand-mutedGray">
                  Our team leader will review your profile and contact you via phone, WhatsApp, or email for the introductory orientation, in sha Allah.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center">
                <button
                  onClick={() => {
                    setSubmittedRef(null);
                    setSubmittedName('');
                  }}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 text-brand-navy hover:bg-gray-50 text-xs font-semibold transition-colors"
                >
                  Submit Another Response
                </button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <>
              {errorMsg && (
                <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <DynamicFormRenderer
                formConfig={formConfig}
                teamName={team.name}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
              />
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-brand-mutedGray space-y-1">
        <p className="font-medium text-brand-navy">
          MAQAM-E-JOUD Foundation &bull; Volunteer Recruitment System
        </p>
        <p className="text-[11px] text-brand-mutedGray">
          Serving Humanity with Compassion, Dignity &amp; Excellence &bull; Est. 2026
        </p>
      </footer>
    </div>
  );
};

