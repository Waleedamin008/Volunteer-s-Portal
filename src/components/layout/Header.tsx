import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Menu, ExternalLink, Copy, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../brand/Logo';

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
  const { user, activeTeam } = useAuth();
  const [copied, setCopied] = useState(false);
  const outlet = useOutletContext<{ openMobileMenu?: () => void }>() || {};
  const handleMenuClick = onMenuClick || outlet.openMobileMenu;

  const handleCopyLink = () => {
    if (!activeTeam) return;
    const url = `${window.location.origin}/join/${activeTeam.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-gray-200 px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={handleMenuClick}
          className="p-2 -ml-1 rounded-lg text-gray-600 hover:text-brand-navy hover:bg-gray-100 lg:hidden shrink-0 cursor-pointer"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Foundation mini emblem on mobile */}
        <div className="lg:hidden shrink-0">
          <Logo size="sm" variant="emblem" />
        </div>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-brand-navy tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-brand-mutedGray hidden sm:block mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* If leader has active team, show copy-link widget */}
        {user?.role === 'team_leader' && activeTeam && (
          <div className="hidden md:flex items-center bg-brand-warmIvory/50 border border-brand-gold/40 rounded-lg px-2.5 py-1 text-xs text-brand-navy">
            <span className="font-medium mr-2 text-brand-navy truncate max-w-[140px]">
              /{activeTeam.slug}
            </span>
            <button
              onClick={handleCopyLink}
              title="Copy recruitment link"
              className="p-1 hover:bg-brand-gold/20 rounded transition-colors text-brand-navy cursor-pointer"
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

        {actionButton}
      </div>
    </header>
  );
};
