"use client";
import React, { createContext, useContext, useState } from 'react';
import Toast from './Toast';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    duration: number;
    visible: boolean;
  }>({ message: '', type: 'info', duration: 3000, visible: false });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
    setToast({ message, type, duration, visible: true });
  };

  const handleClose = () => setToast(t => ({ ...t, visible: false }));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={handleClose} />
      )}
    </ToastContext.Provider>
  );
}
