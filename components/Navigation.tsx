
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthState } from '../types';
import { LogOut, Activity } from 'lucide-react';

interface NavigationProps {
  auth: AuthState;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ auth, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-teal-600 p-2 rounded-lg">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">DentalCavity<span className="text-teal-600">AI</span></span>
          </Link>

          <div className="flex items-center space-x-4">
            {auth.isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-teal-600 font-medium text-sm transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-500">
                      {auth.user?.role === 'DENTIST' ? 'Dentist' : 'Patient'}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {auth.user?.role === 'DENTIST'
                        ? (auth.user?.fullName?.startsWith('Dr.') || auth.user?.fullName?.startsWith('Dr ')
                          ? auth.user.fullName
                          : `Dr. ${auth.user?.fullName}`)
                        : auth.user?.fullName}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-all"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-teal-600 hover:bg-teal-50 rounded-lg transition-all">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700 rounded-lg shadow-sm transition-all">
                  Create Account
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navigation;
