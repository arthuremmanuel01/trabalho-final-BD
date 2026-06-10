'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

const toastStyles = {
  success: {
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.4)',
    color: '#34d399',
    icon: '✅',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: '#f87171',
    icon: '❌',
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid rgba(245, 158, 11, 0.4)',
    color: '#fbbf24',
    icon: '⚠️',
  },
};

export default function Toast({ message, type, onClose }: ToastProps) {
  const styles = toastStyles[type];

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl"
      style={{
        background: styles.background,
        border: styles.border,
        color: styles.color,
        backdropFilter: 'blur(12px)',
        maxWidth: '360px',
        minWidth: '240px',
      }}
      role="alert"
      aria-live="polite"
    >
      <span className="text-base flex-shrink-0 mt-0.5">{styles.icon}</span>
      <p className="text-sm font-medium flex-1 leading-snug">{message}</p>
      <button
        onClick={onClose}
        aria-label="Fechar notificação"
        className="flex-shrink-0 text-xs opacity-60 hover:opacity-100 transition-opacity"
        style={{ color: styles.color }}
      >
        ✕
      </button>
    </div>
  );
}
