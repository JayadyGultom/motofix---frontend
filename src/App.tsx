import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { api, removeAuthToken, getAuthToken } from './lib/api';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsRestoring(false);
        return;
      }

      try {
        const userData = await api.get('/auth/me');
        setUser(userData);
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Session restoration failed', err);
        removeAuthToken();
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();

    const handleUnauthorized = () => {
      setIsLoggedIn(false);
      setUser(null);
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setIsLoggedIn(false);
  };

  if (isRestoring) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand-orange animate-spin" size={48} />
        <p className="text-gray-400 font-medium animate-pulse">Memuat Sesi...</p>
      </div>
    );
  }

  return (
    <div className="antialiased selection:bg-brand-orange/30 selection:text-brand-orange">
      {isLoggedIn ? (
        <DashboardPage onLogout={handleLogout} user={user} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}
