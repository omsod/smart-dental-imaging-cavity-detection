
import React from 'react';
import { AuthState } from '../types';
import DentistDashboard from '../components/DentistDashboard';
import PatientDashboard from '../components/PatientDashboard';

interface DashboardPageProps {
  auth: AuthState;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ auth }) => {
  if (!auth.user) return null;
  
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {auth.user.role === 'DENTIST' ? (
          <DentistDashboard user={auth.user} />
        ) : (
          <PatientDashboard user={auth.user} />
        )}
      </div>
    </div>
  );
};


export default DashboardPage;
