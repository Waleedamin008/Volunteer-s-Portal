import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmationModal, ConfirmationVariant } from '../components/common/ConfirmationModal';

export interface ConfirmOptions {
  title?: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
}

export interface AlertOptions {
  title?: string;
  message: string | React.ReactNode;
  variant?: ConfirmationVariant;
  buttonText?: string;
}

interface ConfirmationContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  showAlert: (options: AlertOptions) => Promise<void>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant: ConfirmationVariant;
    isAlertOnly: boolean;
    resolver?: (value: boolean) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'warning',
    isAlertOnly: false,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || 'Please Confirm',
        message: options.message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        variant: options.variant || 'warning',
        isAlertOnly: false,
        resolver: resolve,
      });
    });
  }, []);

  const showAlert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || 'Notice',
        message: options.message,
        confirmText: options.buttonText || 'Understood',
        variant: options.variant || 'info',
        isAlertOnly: true,
        resolver: () => resolve(),
      });
    });
  }, []);

  const handleConfirm = () => {
    modalState.resolver?.(true);
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    modalState.resolver?.(false);
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmationContext.Provider value={{ confirm, showAlert }}>
      {children}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        variant={modalState.variant}
        isAlertOnly={modalState.isAlertOnly}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmationContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmationProvider');
  }
  return context;
};

