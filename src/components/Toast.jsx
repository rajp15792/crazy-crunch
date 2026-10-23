import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const bgStyles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-slate-900 text-white'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-200 shrink-0" />,
    info: <Info className="w-5 h-5 text-orange-300 shrink-0" />
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 z-50 animate-bounce-short">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl ${bgStyles[type] || bgStyles.info}`}>
        {icons[type]}
        <div className="text-sm font-medium flex-1 leading-snug">{message}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
