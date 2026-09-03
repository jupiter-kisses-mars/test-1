import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import DashboardView from './components/dashboard/DashboardView';
import { getCurrentUser, logoutUser } from './api/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  const handleAuthSuccess = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      {user ? (
        <DashboardView user={user} onLogout={handleLogout} />
      ) : (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      )}
    </div>
  );
}

export default App;

