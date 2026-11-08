import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Users,
  Eye,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../lib/storage';
import { DynamicFormRenderer } from '../../components/forms/DynamicFormRenderer';

export const LeaderTeamPage: React.FC = () => {
  const { user, activeTeam } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!activeTeam) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl">
        <p className="text-base font-bold text-brand-navy">No Assigned Team</p>
      </div>
    );
  }

  const formConfig = StorageService.getFormConfigByTeamId(activeTeam.id);
  const teamStats = StorageService.getTeamStats(activeTeam.id);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/join/${activeTeam.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Header
        title="My Assigned Team & Public Link"
        subtitle="Recruitment configuration and sharing link for volunteer outreach"
      />

      {/* Share Box */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-brand-navy">{activeTeam.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-brand-mutedGray mt-1 max-w-xl">
              {activeTeam.description || 'No description entered.'}
            </p>
          </div>

          <div className="p-3.5 bg-brand-warmIvory/30 border border-brand-gold/40 rounded-xl">
            <span className="text-[10px] uppercase tracking-wider text-brand-mutedGray font-semibold block">
              Share Public Recruitment Link
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs font-bold text-brand-navy">
                /join/{activeTeam.slug}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1 bg-brand-navy text-white text-xs font-medium rounded-lg hover:bg-brand-darkNavy transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-brand-gold" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={`/join/${activeTeam.slug}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-white border border-gray-200 text-brand-navy hover:border-brand-gold rounded-lg transition-colors"
                title="Open Public Link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Form Preview Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-gold" />
              <h3 className="text-sm font-bold text-brand-navy">
                Public Volunteer Joining Form Preview
              </h3>
            </div>
            <span className="text-xs text-brand-mutedGray">
              Form Version {formConfig?.published_version || 1} &bull;{' '}
              {formConfig?.fields.length || 0} Fields
            </span>
          </div>

          {formConfig && (
            <div className="max-w-2xl mx-auto p-6 bg-brand-ivoryBg rounded-2xl border border-gray-200/80">
              <DynamicFormRenderer
                formConfig={formConfig}
                teamName={activeTeam.name}
                isPreview={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

