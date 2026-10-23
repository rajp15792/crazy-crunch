import React from 'react';
import { Smartphone, Download, X, MoreVertical, PlusSquare, CheckCircle } from 'lucide-react';

export default function InstallPromptModal({ isOpen, onClose, onInstallClick, isInstallable }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden border border-orange-100">
        {/* Top Brand Banner */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="/icons/icon-192.svg" alt="Crazy Crunch Icon" className="w-14 h-14 rounded-2xl shadow-md" />
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-tight">Install Crazy Crunch</h3>
              <p className="text-xs text-orange-600 font-semibold">Free Android App (No Play Store Required)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits */}
        <div className="bg-orange-50 border border-orange-200/60 rounded-2xl p-3.5 mb-5 space-y-2">
          <div className="flex items-center gap-2 text-xs text-orange-950 font-medium">
            <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Opens like a native Android app in fullscreen</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-orange-950 font-medium">
            <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Faster snack ordering with instant home screen access</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-orange-950 font-medium">
            <CheckCircle className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Takes less than 1 MB storage, zero Google Play fees</span>
          </div>
        </div>

        {/* Direct Install Button if supported */}
        {isInstallable && (
          <button
            onClick={() => {
              onInstallClick();
              onClose();
            }}
            className="w-full mb-5 py-3.5 px-4 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all text-sm"
          >
            <Download className="w-5 h-5" />
            Install App Now (1-Tap)
          </button>
        )}

        {/* Chrome Step-by-Step Fallback Instructions */}
        <div className="border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Android Chrome Installation Steps:
          </h4>
          <ol className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs shrink-0 mt-0.5">
                1
              </span>
              <span>
                Tap the <strong>three dots</strong> menu (
                <MoreVertical className="w-4 h-4 inline-block text-slate-600 -mt-0.5" />
                ) in the top-right corner of Chrome.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs shrink-0 mt-0.5">
                2
              </span>
              <span>
                Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong> (
                <PlusSquare className="w-4 h-4 inline-block text-slate-600 -mt-0.5" />
                ).
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs shrink-0 mt-0.5">
                3
              </span>
              <span>
                Tap <strong>"Install"</strong> to confirm. Crazy Crunch will now appear on your home screen!
              </span>
            </li>
          </ol>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
}
