import React, { useState } from 'react';
import { Lock, X, AlertCircle, Loader2 } from 'lucide-react';

export default function OwnerLoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      localStorage.setItem('cc_admin_token', data.token);
      onLoginSuccess(data.token);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-[#c5a059]/30">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#f4ede2] text-[#1b4332] rounded-xl border border-[#c5a059]/30">
              <Lock className="w-5 h-5 text-[#1b4332]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0f382c] leading-tight brand-font">Owner Authentication</h3>
              <p className="text-[11px] text-slate-500">Protected Store Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-1">
              Owner ID
            </label>
            <input
              type="text"
              required
              placeholder="Enter Owner ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-[#fdfbf7] border border-[#c5a059]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0f382c] uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter owner password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#fdfbf7] border border-[#c5a059]/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b4332] focus:bg-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#1b4332] hover:bg-[#0f382c] active:scale-[0.98] disabled:bg-slate-300 text-[#d4af37] rounded-xl font-bold flex items-center justify-center gap-2 text-xs shadow-md shadow-[#0f382c]/20 transition-all border border-[#d4af37]/40"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Access Protected Dashboard</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
