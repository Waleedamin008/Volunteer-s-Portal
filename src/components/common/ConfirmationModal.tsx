import React, { useEffect } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Trash2,
  X,
} from 'lucide-react';

export type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  onConfirm: () => void;
  onCancel: () => void;
  isAlertOnly?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel,
  isAlertOnly = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-5 h-5 text-rose-600" />,
          iconBg: 'bg-rose-50 border-rose-200',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
          accentBorder: 'border-t-4 border-t-rose-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          iconBg: 'bg-amber-50 border-amber-200',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
          accentBorder: 'border-t-4 border-t-amber-500',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          iconBg: 'bg-emerald-50 border-emerald-200',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
          accentBorder: 'border-t-4 border-t-emerald-500',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-brand-navy" />,
          iconBg: 'bg-brand-warmIvory/60 border-brand-gold/30',
          confirmBtn: 'bg-brand-navy hover:bg-brand-darkNavy text-white shadow-brand-navy/20',
          accentBorder: 'border-t-4 border-t-brand-gold',
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className={`bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-100 ${vStyles.accentBorder} animate-in zoom-in-95 duration-150 my-auto`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Icon and Close */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border ${vStyles.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
            >
              {vStyles.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-navy leading-snug">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <div className="py-2 text-xs sm:text-sm text-brand-charcoal leading-relaxed whitespace-pre-line">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
          {!isAlertOnly && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            className={`px-5 py-2 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer ${vStyles.confirmBtn}`}
          >
            {isAlertOnly ? 'Understood' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

