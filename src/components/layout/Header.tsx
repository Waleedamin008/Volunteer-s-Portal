import React, { useState } from 'react';
import { Menu, ExternalLink, Copy, Check, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../lib/storage';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  actionButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onMenuClick,
  actionButton,
}) => {
  const { user, activeTeam, refreshUserData } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!activeTeam) return;
    const url = `${window.location.origin}/join/${activeTeam.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all sample data, applications, and teams to fresh defaults?')) {
      StorageService.resetToSampleData();
      refreshUserData();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-gray-200 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-gray-600 hover:text-brand-navy hover:bg-gray-100 lg:hidden"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg lg:text-xl font-bold text-brand-navy tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-brand-mutedGray hidden sm:block mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* If leader has active team, show convenient copy-link widget */}
        {user?.role === 'team_leader' && activeTeam && (
          <div className="hidden md:flex items-center bg-brand-warmIvory/50 border border-brand-gold/40 rounded-lg px-2.5 py-1 text-xs text-brand-navy">
            <span className="font-medium mr-2 text-brand-navy truncate max-w-[140px]">
              /{activeTeam.slug}
            </span>
            <button
              onClick={handleCopyLink}
              title="Copy recruitment link"
              className="p-1 hover:bg-brand-gold/20 rounded transition-colors text-brand-navy"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                  <Check className="w-3.5 h-3.5" /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-brand-navy">
                  <Copy className="w-3.5 h-3.5" /> Copy Link
                </span>
              )}
            </button>
            <a
              href={`/join/${activeTeam.slug}`}
              target="_blank"
              rel="noreferrer"
              className="ml-1.5 p-1 hover:bg-brand-gold/20 rounded transition-colors text-brand-navy"
              title="Open public form"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Reset Demo Data Pill */}
        <button
          onClick={handleResetData}
          title="Reset database to initial sample data"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 hover:text-brand-navy hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Demo</span>
        </button>

        {actionButton}
      </div>
    </header>
  );
};
