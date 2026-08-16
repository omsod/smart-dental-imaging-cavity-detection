
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Microscope, ArrowRight, Zap, Activity, FileText, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { DiagnosticReport } from '../types';
import { generatePDFReport } from '../services/reportService';

const LandingPage: React.FC = () => {
  const [recentReports, setRecentReports] = useState<DiagnosticReport[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('reports_global_history');
    if (saved) {
      try {
        setRecentReports(JSON.parse(saved).slice(0, 3)); // Show top 3
      } catch (e) {
        console.error("Failed to load global history", e);
      }
    }
  }, []);

  const handleDownload = async (report: DiagnosticReport) => {
    try {
      await generatePDFReport(report);
    } catch (e) {
      alert("Failed to download report.");
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
              <Zap size={14} />
              <span>Next-Gen Dental Diagnostics</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
              AI-Powered <span className="text-teal-600">Cavity Detection</span> System
            </h1>
            <p className="text-lg text-slate-600 max-w-lg">
              Empowering dental professionals and patients with high-precision automated scan analysis. Detect cavities, analyze severity (Low, Moderate, High), download diagnostic reports, and access customized oral health blueprints.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register" className="flex items-center justify-center px-8 py-4 bg-teal-600 text-white rounded-xl font-bold shadow-lg hover:bg-teal-700 hover:shadow-xl transition-all group">
                Create Account
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="flex items-center justify-center px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold hover:border-teal-300 hover:text-teal-600 transition-all">
                Sign In Portal
              </Link>
            </div>

          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-teal-500/10 blur-3xl rounded-full"></div>
            <img 
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800" 
              alt="Dental Imaging Preview" 
              className="relative rounded-2xl shadow-2xl border-8 border-white object-cover w-full h-[400px]"
            />
          </div>
        </div>
      </section>

      {/* Recent Public Scans Section */}
      {recentReports.length > 0 && (
        <section className="py-24 bg-slate-50 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Recent Diagnostic History</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Publicly available diagnostic history for demonstration and training purposes.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {recentReports.map((report) => (
                <div key={report.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${report.cavities.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                        {report.cavities.length > 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{report.patientName}{report.patientAge ? `, ${report.patientAge}` : ''}</p>
                        <p className="text-xs text-slate-400">{report.date}</p>
                      </div>
                    </div>
                  </div>
                  <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-slate-900">
                    <img src={report.originalImage} alt="Scan" className="w-full h-full object-cover opacity-80" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${report.cavities.length > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {report.cavities.length} Cavities Found
                    </span>
                    <button 
                      onClick={() => handleDownload(report)}
                      className="text-teal-600 hover:text-teal-700 font-bold text-xs flex items-center"
                    >
                      <Download size={14} className="mr-1" /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link to="/login" className="text-teal-600 font-bold hover:underline flex items-center justify-center">
                Sign in to view full history <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Dual Portal Experience */}
      <section className="py-20 bg-slate-100/50 px-4 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tailored Experience for Both Portals</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Whether you are a dental health practitioner or a patient seeking personal diagnostics, we provide specialized tools for your needs.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Dentist Column */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600 font-bold text-xl">
                  Dr.
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Professional Dentist Portal</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Equip your clinic with intelligent, automated diagnostic capabilities. Upload dental scans, visualize labeled cavity overlays instantly, and keep durable records for all patients.
                </p>
                <ul className="space-y-2 text-slate-500 text-xs font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full" />
                    Millimeter-precise multi-cavity mapping & severity grading
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full" />
                    Automated, printable PDF Diagnostic Reports
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full" />
                    Seamless, organized diagnostic history panels
                  </li>
                </ul>
              </div>
              <Link to="/register" className="inline-flex items-center justify-center py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm transition-all shadow-md mt-4">
                Enter Dentist Portal
              </Link>
            </div>

            {/* Patient Column */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600 font-bold text-xl">
                  Pt.
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Personal Patient Portal</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Take active ownership of your dental health. Find clinic-registered reports by registering with your name, access personalized action plans, and complete instant AI self-scans.
                </p>
                <ul className="space-y-2 text-slate-500 text-xs font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full" />
                    Instant home AI cavity self-scans & dental health checks
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full" />
                    Personalized, interactive care guidance & action plans
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full" />
                    Look up and download clinic-registered PDF scans
                  </li>
                </ul>
              </div>
              <Link to="/register" className="inline-flex items-center justify-center py-3 px-6 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-all shadow-md mt-4">
                Enter Patient Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white px-4 border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Precision Diagnostic Features</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Built on advanced deep learning architectures for reliable dental health assessment.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center text-white mb-6">
                <Microscope />
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-Cavity Detection</h3>
              <p className="text-slate-600">Simultaneously detects and maps multiple carious lesions across full dental X-rays with millimeter precision.</p>
            </div>
            <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center text-white mb-6">
                <Activity />
              </div>
              <h3 className="text-xl font-bold mb-3">Severity Mapping</h3>
              <p className="text-slate-600">Classifies detections as Low (1-40%), Moderate (41-80%), or High (81-100%) based on clinical extent.</p>
            </div>
            <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center text-white mb-6">
                <Stethoscope />
              </div>
              <h3 className="text-xl font-bold mb-3">Professional Reporting</h3>
              <p className="text-slate-600">Automated PDF generation including detection stats, mapping overlays, and clinician recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4 bg-teal-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to modernize your practice?</h2>
          <p className="text-teal-50 text-lg">
            Join hundreds of practitioners using AI to improve diagnostic accuracy and patient trust.
          </p>
          <div className="flex justify-center">
            <Link to="/register" className="px-10 py-4 bg-white text-teal-600 rounded-xl font-bold shadow-xl hover:bg-teal-50 transition-all transform hover:scale-105">
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
