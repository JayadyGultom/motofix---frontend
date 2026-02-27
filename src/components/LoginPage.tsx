import React, { useState } from 'react';
import { User, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { api, setAuthToken } from '../lib/api';

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.post<{ token: string; user: any }>('/auth/login', {
        username,
        password,
      });
      setAuthToken(data.token);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa username dan password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-brand-dark px-4">
      <div
        className="absolute inset-0 z-0 opacity-20 scale-110 blur-sm"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-6 sm:p-8 bg-brand-card/80 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8 sm:mb-10">
          <Logo iconSize={40} textSize="text-3xl" className="mb-4" />
          <p className="text-gray-400 text-xs sm:text-sm font-medium text-center">Sistem Manajemen Bengkel Profesional</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm"
          >
            <AlertCircle size={18} />
            <p>{error}</p>
          </motion.div>
        )}

        <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-orange transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={isLoading}
                className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-orange/50 focus:ring-4 focus:ring-brand-orange/10 transition-all font-medium text-sm sm:text-base disabled:opacity-50"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-brand-orange transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
                className="w-full bg-brand-dark/50 border border-white/10 rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-white focus:outline-none focus:border-brand-orange/50 focus:ring-4 focus:ring-brand-orange/10 transition-all font-medium text-sm sm:text-base disabled:opacity-50"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold py-3.5 sm:py-4 rounded-2xl shadow-lg shadow-brand-orange/20 transition-all active:scale-[0.98] uppercase tracking-widest text-xs sm:text-sm mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              'Login Sistem'
            )}
          </button>
        </form>

        <div className="mt-10 sm:mt-12 text-center space-y-2">
          <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase tracking-[0.2em]">Akses: Admin / Kasir / Mekanik</p>
          <p className="text-[8px] sm:text-[10px] text-gray-600">© 2026 MotoFix Systems</p>
        </div>
      </motion.div>
    </div>
  );
};
