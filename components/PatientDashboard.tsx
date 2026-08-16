import React, { useState, useEffect } from 'react';
import { User, DiagnosticReport } from '../types';
import { generatePDFReport } from '../services/reportService';
import { Activity, Download, FileText, Calendar, Shield, Heart, Sparkles, Smile, Search, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import CavityResults from './CavityResults';
import DetectionModule from './DetectionModule';

interface PatientDashboardProps {
  user: User;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user }) => {
  const [reports, setReports] = useState<DiagnosticReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DiagnosticReport | null>(null);
  const [customSearchName, setCustomSearchName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'records' | 'scan'>('records');

  // Automatically search and gather all reports matching the user's name across all dentist history and global history
  useEffect(() => {
    const matchedReports: DiagnosticReport[] = [];
    const reportIds = new Set<string>();

    const tryAddReport = (report: DiagnosticReport) => {
      const lowerFullName = user.fullName.toLowerCase().trim();
      const lowerPatientName = report.patientName.toLowerCase().trim();
      
      const isMatch = lowerPatientName === lowerFullName || 
                      lowerPatientName.includes(lowerFullName) || 
                      lowerFullName.includes(lowerPatientName);
                      
      if (isMatch && !reportIds.has(report.id)) {
        matchedReports.push(report);
        reportIds.add(report.id);
      }
    };

    // 1. Scan global history
    try {
      const globalSaved = localStorage.getItem('reports_global_history');
      if (globalSaved) {
        const parsed = JSON.parse(globalSaved) as DiagnosticReport[];
        parsed.forEach(tryAddReport);
      }
    } catch (e) {
      console.error("Failed to parse global history", e);
    }

    // 2. Scan dev/dentist keys in localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('reports_') && key !== 'reports_global_history') {
          const dentistSaved = localStorage.getItem(key);
          if (dentistSaved) {
            const parsed = JSON.parse(dentistSaved) as DiagnosticReport[];
            parsed.forEach(tryAddReport);
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse dentist keys", e);
    }

    // 3. Scan self-scan keys for patients
    try {
      const selfSaved = localStorage.getItem(`reports_patient_self_${user.id}`);
      if (selfSaved) {
        const parsed = JSON.parse(selfSaved) as DiagnosticReport[];
        parsed.forEach(tryAddReport);
      }
    } catch (e) {
      console.error("Failed to parse self scan keys for patient", e);
    }

    // Sort by date (newest first)
    matchedReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setReports(matchedReports);

    if (matchedReports.length > 0) {
      setSelectedReport(matchedReports[0]);
    }
  }, [user.fullName, user.id]);

  const handleSelfScanComplete = (newReport: DiagnosticReport) => {
    try {
      const selfSaved = localStorage.getItem(`reports_patient_self_${user.id}`);
      const currentList: DiagnosticReport[] = selfSaved ? JSON.parse(selfSaved) : [];
      const updatedList = [newReport, ...currentList];
      localStorage.setItem(`reports_patient_self_${user.id}`, JSON.stringify(updatedList));
      
      // Update state
      setReports(prev => {
        const updated = [newReport, ...prev];
        updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return updated;
      });
      setSelectedReport(newReport);
      setActiveTab('records');
    } catch (e) {
      console.error("Failed to save patient self-scan", e);
    }
  };

  // Handle searching by a different name (e.g. if their pediatric scan was registered under a minor's name or a typo)
  const handleCustomSearch = () => {
    if (!customSearchName.trim()) return;
    
    const matchedReports: DiagnosticReport[] = [];
    const reportIds = new Set<string>();

    const tryAddReport = (report: DiagnosticReport) => {
      const targetName = customSearchName.toLowerCase().trim();
      const lowerPatientName = report.patientName.toLowerCase().trim();
      
      const isMatch = lowerPatientName.includes(targetName) || targetName.includes(lowerPatientName);
      if (isMatch && !reportIds.has(report.id)) {
        matchedReports.push(report);
        reportIds.add(report.id);
      }
    };

    // Scan everything
    try {
      const globalSaved = localStorage.getItem('reports_global_history');
      if (globalSaved) {
        const parsed = JSON.parse(globalSaved) as DiagnosticReport[];
        parsed.forEach(tryAddReport);
      }
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('reports_') && key !== 'reports_global_history') {
          const dentistSaved = localStorage.getItem(key);
          if (dentistSaved) {
            const parsed = JSON.parse(dentistSaved) as DiagnosticReport[];
            parsed.forEach(tryAddReport);
          }
        }
      }
    } catch (e) {
       console.error("Search failed", e);
    }

    matchedReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setReports(matchedReports);
    if (matchedReports.length > 0) {
      setSelectedReport(matchedReports[0]);
    } else {
      setSelectedReport(null);
    }
  };

  const handleDownload = async (report: DiagnosticReport) => {
    try {
      await generatePDFReport(report);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to generate PDF report.");
    }
  };

  // Recommendations generator
  const getTipsForReport = (report: DiagnosticReport) => {
    const cavityCount = report.cavities.length;
    const hasHighSeverity = report.cavities.some(c => c.severity === 'High');
    const hasModerateSeverity = report.cavities.some(c => c.severity === 'Moderate');

    if (cavityCount === 0) {
      return {
        status: "Preventative Maintenance",
        color: "text-green-600 bg-green-50 border-green-200",
        actionPlan: [
          "Continue brushing at least twice a day with toothpaste containing fluoride.",
          "Floss once daily to clean plaque from hard-to-reach pockets between the teeth.",
          "Schedule standard cleanings and exams with your dentist every 6 months.",
          "Consider dental sealants on molars for extra cavity defense if recommended."
        ]
      };
    } else if (hasHighSeverity) {
      return {
        status: "Urgent Treatment Required",
        color: "text-red-600 bg-red-50 border-red-200",
        actionPlan: [
          "Schedule a dental appointment immediately for deep decay treatment (fillings/restoration).",
          "Rinse with lukewarm saltwater if you experience direct sensitivity or moderate aching.",
          "Avoid direct extreme temperatures (extremely cold ice or boiling-hot liquids) on high-decay teeth.",
          "Limit sugary beverages, snacks, and sticky foods that contribute to acid erosion."
        ]
      };
    } else if (hasModerateSeverity) {
      return {
        status: "Active Therapy Plan",
        color: "text-amber-600 bg-amber-50 border-amber-200",
        actionPlan: [
          "Consult your clinic for timely filling sessions to halt enamel decay progression.",
          "Incorporate a dentist-prescribed high-fluoride toothpaste or therapy gel.",
          "Minimize snacking sessions between standard meals to control oral pH levels.",
          "Use therapeutic mouthwash with essential oils to eliminate micro-cavity bacteria."
        ]
      };
    } else {
      return {
        status: "Early Decay Watch",
        color: "text-teal-600 bg-teal-50 border-teal-200",
        actionPlan: [
          "Re-mineralize initial enamel lesions using advanced fluoride/CPP-ACP applications.",
          "Gently brush teeth, focusing closely on the back molars for full plaque removal.",
          "Stay hydrated to prompt optimal saliva production—nature's oral cleaning system.",
          "Perform standard interdental flossing daily to block tooth-interface decay."
        ]
      };
    }
  };

  const activeTips = selectedReport ? getTipsForReport(selectedReport) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500" id="patient-dashboard-view">
      {/* Welcome Patient Header Card */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 p-8 rounded-3xl shadow-lg border border-teal-500/20 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-teal-100 border border-white/10">
            <Smile size={44} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {user.fullName}!</h1>
            <p className="text-teal-100 font-medium mt-1">Patient Portal & Diagnostic History</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 flex flex-col items-center">
          <span className="text-[11px] font-bold text-teal-200 uppercase tracking-widest">Total Diagnostic Scans</span>
          <span className="text-3xl font-extrabold text-white mt-1">{reports.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-slate-200/50 rounded-xl max-w-xs">
        <button
          onClick={() => setActiveTab('records')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'records' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Clinic History
        </button>
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'scan' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          AI Self-Scan
        </button>
      </div>

      {activeTab === 'records' ? (
        <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Side Column: Records Navigation */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Search size={18} className="text-teal-600" />
              Find Clinic Records
            </h3>
            <p className="text-xs text-slate-500">
              Not seeing your scan? Enter your full register name format to scan the archive.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Patient Full Name..."
                value={customSearchName}
                onChange={(e) => setCustomSearchName(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-teal-500 outline-none"
              />
              <button
                onClick={handleCustomSearch}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                Scan
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-teal-600" />
                Your Scan Scans
              </h2>
            </div>
            {reports.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full p-4 text-left flex items-start gap-4 transition-all ${selectedReport?.id === report.id ? 'bg-teal-50/70 border-l-4 border-teal-600' : 'hover:bg-slate-50/50'}`}
                  >
                    <div className={`p-2 rounded-xl ${report.cavities.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                      {report.cavities.length > 0 ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-bold text-slate-800">
                        {report.patientName} {report.patientAge ? `(${report.patientAge}yrs)` : ''}
                      </p>
                      <div className="flex items-center text-xs text-slate-500 gap-1.5">
                        <Calendar size={12} />
                        <span>{report.date}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-400">
                        Dentist: {report.dentistName.startsWith('Dr.') || report.dentistName.startsWith('Dr ') || report.dentistName.toLowerCase().includes('patient') || report.dentistName.toLowerCase().includes('self scan')
                          ? report.dentistName
                          : `Dr. ${report.dentistName}`}
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${report.cavities.length > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {report.cavities.length} {report.cavities.length === 1 ? 'Cavity' : 'Cavities'} Detected
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium text-slate-600 text-sm">No scans linked yet.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Ask your dentist to submit scans under your registered profile name: <strong className="text-slate-600 font-bold">"{user.fullName}"</strong>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Column: Report details & recommendations */}
        <div className="lg:col-span-8 space-y-6">
          {selectedReport ? (
            <div className="space-y-6">
              {/* Detailed Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Diagnosis Detail Report</h2>
                    <p className="text-sm text-slate-500">Scan ID: {selectedReport.id}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(selectedReport)}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-teal-600/10"
                  >
                    <Download size={16} />
                    Download PDF Report
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Visual segment */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 text-sm">Scan Diagnostics View</h3>
                    <div className="relative rounded-xl overflow-hidden shadow-inner bg-slate-900 border border-slate-200 aspect-[4/3] flex items-center justify-center">
                      <img src={selectedReport.originalImage} alt="Dental scan" className="max-w-full max-h-full object-contain opacity-85" />
                      <svg 
                        viewBox="0 0 1000 1000" 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        preserveAspectRatio="none"
                      >
                        {selectedReport.cavities.map((d) => {
                          const color = d.severity === 'High' ? "#ef4444" : d.severity === 'Moderate' ? "#f59e0b" : "#10b981";
                          return (
                            <React.Fragment key={d.id}>
                              <rect
                                x={d.box[1]}
                                y={d.box[0]}
                                width={d.box[3] - d.box[1]}
                                height={d.box[2] - d.box[0]}
                                fill="transparent"
                                stroke={color}
                                strokeWidth="8"
                              />
                            </React.Fragment>
                          );
                        })}
                      </svg>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Cavities & Specific Treatments</h4>
                      <div className="space-y-2">
                        {selectedReport.cavities.map((cav, i) => (
                          <div key={cav.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1.5 hover:border-teal-200 transition-all">
                            <div className="text-[11px] font-bold flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${cav.severity === 'High' ? 'bg-red-500 animate-pulse' : cav.severity === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                <span className="text-slate-800">#{i + 1}: {cav.severity} Severity ({cav.extent}% decay)</span>
                              </div>
                              <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-1.5 py-0.5 border border-teal-100 rounded">Depth: {cav.depth || 'N/A'}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed bg-white border border-slate-100 p-2 rounded-lg">
                              <span className="font-extrabold text-teal-600 uppercase text-[9px] tracking-wider block mb-0.5">Recommended Treatment:</span>
                              {cav.severity === 'High'
                                ? "Urgent clinical dentist consult, root canal therapy, crown coverage, or potential extraction to save structure."
                                : cav.severity === 'Moderate'
                                ? "Timely tooth-colored composite filling or glass ionomer restoration to halt enamel decay progression."
                                : "Fluoride therapy, tooth remineralizing paste, proper brushing, flossing, and soda/sugar reduction."}
                            </p>
                          </div>
                        ))}
                        {selectedReport.cavities.length === 0 && (
                          <div className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-green-100 bg-green-50 text-green-700">
                            Perfect Dental Health (0 Cavities detected)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Context and dentist info */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-sm">Clinical Metadata</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Dentist</span>
                          <span className="text-sm font-semibold text-slate-800">
                            {selectedReport.dentistName.startsWith('Dr.') || selectedReport.dentistName.startsWith('Dr ') || selectedReport.dentistName.toLowerCase().includes('patient') || selectedReport.dentistName.toLowerCase().includes('self scan')
                              ? selectedReport.dentistName
                              : `Dr. ${selectedReport.dentistName}`}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Date Created</span>
                          <span className="text-sm font-semibold text-slate-800">{selectedReport.date}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Patient Age</span>
                          <span className="text-sm font-semibold text-slate-800">{selectedReport.patientAge || 'N/A'}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Overall Verdict</span>
                          <span className={`text-sm font-bold block ${selectedReport.cavities.length > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                            {selectedReport.cavities.length > 0 ? 'Action Recommended' : 'Clear Health State'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Summarized Verdict */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-slate-800 text-sm">AI Diagnosis Summary</h3>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {selectedReport.summary || 'Enamel surfaces have been completely analyzed. No notable loss of calcium density, caries, or tooth visual defects detected. Maintain daily general hygienic care.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action plan / Teeth Care Recommendations Card */}
              {activeTips && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                      <Heart className="text-red-500 fill-red-500 animate-pulse" size={18} />
                      Your Personalized Oral Care Action Plan
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${activeTips.color}`}>
                      {activeTips.status}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-1 gap-3">
                    {activeTips.actionPlan.map((tip, idx) => (
                      <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-all">
                        <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                          {tip}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* General educational box */}
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-100 text-teal-800 mt-4 flex items-center gap-4">
                    <div className="p-2.5 bg-teal-600 rounded-xl text-white">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Brush properly with Fluoride!</p>
                      <p className="text-[11px] text-teal-600/90 font-medium mt-0.5">
                        Proper tooth surface mineral reinforcement halts low-level surface demineralization safely.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-16 text-center text-slate-400 rounded-2xl border border-slate-200 shadow-sm">
              <Activity size={64} className="mx-auto mb-4 opacity-10 animate-pulse" />
              <h2 className="text-lg font-bold text-slate-700 mb-2">No Report Selected</h2>
              <p className="text-xs max-w-sm mx-auto">
                Please register, scan or find a clinic record from the left side panel list to view details.
              </p>
            </div>
          )}
        </div>
      </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="text-teal-600 animate-pulse" size={24} />
              AI Cavity Self-Scan
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Analyze tooth close-up photographs or diagnostic X-rays instantly. All self-scanned diagnostic reports are saved under your personal history profile automatically.
            </p>
          </div>
          <DetectionModule user={user} onComplete={handleSelfScanComplete} />
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
