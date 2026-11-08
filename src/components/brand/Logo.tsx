import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'emblem' | 'horizontal';
  theme?: 'dark' | 'light';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  theme = 'dark',
  className = '',
}) => {
  const sizeMap = {
    sm: { img: 'w-8 h-8', text: 'text-sm', subtext: 'text-[9px]' },
    md: { img: 'w-10 h-10', text: 'text-base', subtext: 'text-[10px]' },
    lg: { img: 'w-16 h-16', text: 'text-xl', subtext: 'text-xs' },
    xl: { img: 'w-24 h-24', text: 'text-2xl', subtext: 'text-sm' },
  };

  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-brand-navy';
  const subtextColor = 'text-brand-gold';

  const logoSrc = "/Logo Maqam-e-JOUD.jpeg";

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    if (target.src.includes('.jpeg')) {
      target.src = '/logo.png';
    }
  };

  if (variant === 'emblem') {
    return (
      <img
        src={logoSrc}
        onError={handleImgError}
        alt="MAQAM-E-JOUD Foundation Emblem"
        className={`${sizeMap[size].img} object-contain rounded-full shadow-sm transition-transform hover:scale-105 ${className}`}
      />
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <img
          src={logoSrc}
          onError={handleImgError}
          alt="MAQAM-E-JOUD Foundation Emblem"
          className={`${sizeMap[size].img} mb-3 shadow-md rounded-full object-contain`}
        />
        <span className="font-urdu text-lg leading-tight text-brand-gold font-bold">
          مقامِ جود فاؤنڈیشن
        </span>
        <span className={`font-bold tracking-widest ${sizeMap[size].text} ${textColor} mt-1`}>
          MAQAM-E-JOUD
        </span>
        <span className={`font-semibold tracking-[0.25em] ${sizeMap[size].subtext} ${subtextColor}`}>
          FOUNDATION
        </span>
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logoSrc}
        onError={handleImgError}
        alt="MAQAM-E-JOUD Foundation Emblem"
        className={`${sizeMap[size].img} object-contain shrink-0 rounded-full shadow-sm border border-brand-gold/30`}
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-bold tracking-wider leading-none ${sizeMap[size].text} ${textColor}`}>
            MAQAM-E-JOUD
          </span>
          <span className="font-urdu text-xs text-brand-gold leading-none pb-0.5">
            مقامِ جود
          </span>
        </div>
        <span className={`font-semibold tracking-[0.22em] ${sizeMap[size].subtext} ${subtextColor} mt-0.5`}>
          FOUNDATION
        </span>
      </div>
    </div>
  );
};
