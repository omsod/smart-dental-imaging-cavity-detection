import React, { useState } from 'react';
import { User, DiagnosticReport } from '../types';
import DetectionModule from './DetectionModule';
import { generatePDFReport } from '../services/reportService';
import { Users, FileText, Plus, Search, Download } from 'lucide-react';

interface DentistDashboardProps {
  user: User;
}

const DentistDashboard: React.FC<DentistDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'patients' | 'analyze'>('patients');
  const [reports, setReports] = useState<DiagnosticReport[]>([]);

  const addReport = (report: DiagnosticReport) => {
    setReports([report, ...reports]);
    setActiveTab('patients');
  };

  const handleDownload = async (report: DiagnosticReport) => {
    try {
      await generatePDFReport(report);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to generate PDF report.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {user.fullName.startsWith('Dr.') || user.fullName.startsWith('Dr ')
                ? user.fullName
                : `Dr. ${user.fullName}`}
            </h1>
            <p className="text-slate-500">Dental Professional</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <div className="text-center px-4 py-2 bg-slate-50 rounded-xl">
            <p className="text-xs font-bold text-slate-400 uppercase">Reports</p>
            <p className="text-xl font-bold text-slate-800">{reports.length}</p>
          </div>
          <button 
            onClick={() => setActiveTab('analyze')}
            className="flex items-center px-6 py-2 bg-teal-600 text-white font-bold rounded-xl shadow-md hover:bg-teal-700 transition-all"
          >
            <Plus size={18} className="mr-2" /> New Analysis
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-slate-200/50 rounded-xl max-w-xs font-medium">
        <button
          onClick={() => setActiveTab('patients')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'patients' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Patient List
        </button>
        <button
          onClick={() => setActiveTab('analyze')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'analyze' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          AI Analysis
        </button>
      </div>

      {/* Content */}
      <div className="transition-all duration-300">
        {activeTab === 'patients' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Recent Diagnostic History</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search patients..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
            {reports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Findings</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{report.patientName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-semibold">{report.date}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${report.cavities.length > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {report.cavities.length} {report.cavities.length === 1 ? 'Cavity' : 'Cavities'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDownload(report)}
                            className="bg-slate-50 hover:bg-slate-150 border border-slate-200 hover:text-teal-700 text-teal-600 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center justify-end ml-auto transition-all"
                          >
                            <Download size={14} className="mr-1.5" /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-semibold text-slate-600">No patient records found yet.</p>
                <button 
                  onClick={() => setActiveTab('analyze')}
                  className="mt-4 text-teal-600 font-bold hover:underline py-1 px-3"
                >
                  Start your first analysis
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <DetectionModule user={user} onComplete={addReport} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DentistDashboard;
