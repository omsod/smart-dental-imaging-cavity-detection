
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, UserRole } from '../types';
import { ArrowLeft, User as UserIcon, Mail, Lock, ShieldCheck, HeartHandshake } from 'lucide-react';

interface AuthPageProps {
  mode: 'login' | 'register';
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, onLogin }) => {
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('DENTIST');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use a deterministic ID based on email so history persists across logins
    // Simple hash function for safe ID generation
    const hash = formData.email.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
    }, 0);
    const userId = Math.abs(hash).toString(36).substr(0, 10);
    
    let finalFullName = formData.fullName;
    let finalRole = role;

    try {
      const registeredUsersStr = localStorage.getItem('dental_registered_users');
      const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : {};
      const emailKey = formData.email.toLowerCase().trim();

      if (mode === 'register') {
        registeredUsers[emailKey] = {
          fullName: formData.fullName,
          role: role
        };
        localStorage.setItem('dental_registered_users', JSON.stringify(registeredUsers));
      } else {
        // mode === 'login'
        const matched = registeredUsers[emailKey];
        if (matched) {
          finalFullName = matched.fullName;
          finalRole = matched.role;
        }
      }
    } catch (err) {
      console.error("Failed to handle user registration storage:", err);
    }

    if (!finalFullName) {
      finalFullName = finalRole === 'DENTIST' ? 'Professional Dentist' : 'Patient';
    }
    
    const mockUser: User = {
      id: userId,
      fullName: finalFullName,
      email: formData.email,
      role: finalRole
    };
    onLogin(mockUser);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium mb-6">
          <ArrowLeft size={16} className="mr-1" /> Back to Home
        </Link>
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <h2 className="text-center text-3xl font-extrabold text-slate-900 mb-2">
            {mode === 'login' ? 'Sign In Portal' : 'Register Account'}
          </h2>
          <p className="text-center text-slate-500 mb-6 font-medium">
            AI-Powered Dental Diagnostics & Care
          </p>

          {/* Role selector tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole('DENTIST')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${role === 'DENTIST' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ShieldCheck size={14} />
              Dentist Portal
            </button>
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${role === 'PATIENT' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <HeartHandshake size={14} />
              Patient Portal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder={role === 'DENTIST' ? "Doctor Full Name" : "Patient Full Name"}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-teal-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {mode === 'login' ? `Sign In as ${role === 'DENTIST' ? 'Dentist' : 'Patient'}` : `Register as ${role === 'DENTIST' ? 'Dentist' : 'Patient'}`}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-500">
              {mode === 'login' ? "New user?" : "Already registered?"}
              <Link
                to={mode === 'login' ? "/register" : "/login"}
                className="ml-1 text-teal-600 font-bold hover:underline"
              >
                {mode === 'login' ? 'Create Account' : 'Sign In'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

