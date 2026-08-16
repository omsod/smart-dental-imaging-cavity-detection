
import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import Navigation from './components/Navigation';
import { User, AuthState } from './types';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-600 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-teal-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-teal-700 transition-all"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV !== 'production' && (
              <pre className="mt-6 p-4 bg-slate-100 rounded-lg text-left text-xs overflow-auto max-h-40 text-red-600">
                {this.state.error?.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });

  // Simulated session persistence
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('dental_user');
      if (storedUser) {
        setAuth({ user: JSON.parse(storedUser), isAuthenticated: true });
      }
    } catch (error) {
      console.error("Failed to load user session:", error);
      localStorage.removeItem('dental_user');
    }
  }, []);

  const login = (user: User) => {
    setAuth({ user, isAuthenticated: true });
    try {
      localStorage.setItem('dental_user', JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user session:", error);
    }
  };

  const logout = () => {
    setAuth({ user: null, isAuthenticated: false });
    try {
      localStorage.removeItem('dental_user');
    } catch (error) {
      console.error("Failed to clear user session:", error);
    }
  };

  return (
    <ErrorBoundary>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Navigation auth={auth} onLogout={logout} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage mode="login" onLogin={login} />} />
              <Route path="/register" element={<AuthPage mode="register" onLogin={login} />} />
              <Route 
                path="/dashboard" 
                element={auth.isAuthenticated ? <DashboardPage auth={auth} /> : <Navigate to="/login" />} 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center">
            <p>© 2024 Dental Cavity AI Project. All rights reserved.</p>
            <p className="text-sm mt-2 font-mono opacity-50 italic">Professional AI Diagnostics for Dentists</p>
          </footer>
        </div>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
