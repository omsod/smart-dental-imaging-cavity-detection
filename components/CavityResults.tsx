
import React from 'react';
import { CavityDetection, CavitySeverity } from '../types';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface CavityResultsProps {
  detections: CavityDetection[];
  image: string;
}

const CavityResults: React.FC<CavityResultsProps> = ({ detections, image }) => {
  const getSeverityColor = (sev: CavitySeverity) => {
    switch (sev) {
      case CavitySeverity.HIGH: return "#ef4444"; // Red
      case CavitySeverity.MODERATE: return "#f59e0b"; // Amber
      case CavitySeverity.LOW: return "#10b981"; // Emerald
      default: return "#94a3b8";
    }
  };

  const getTreatmentRecommendation = (severity: CavitySeverity) => {
    switch (severity) {
      case CavitySeverity.LOW:
        return "Fluoride therapy, tooth remineralizing paste, proper brushing, flossing, and soda/sugar reduction.";
      case CavitySeverity.MODERATE:
        return "Timely tooth-colored composite filling or glass ionomer restoration to halt enamel decay progression.";
      case CavitySeverity.HIGH:
        return "Urgent clinical dentist consult, root canal therapy, crown coverage, or potential extraction to save structure.";
      default:
        return "Maintain standard twice-yearly prophylaxis, brushing, and flossing routines.";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg mr-3 ${detections.length > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
            {detections.length > 0 ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Analysis Result</p>
            <p className="text-xl font-bold text-slate-800">
              {detections.length > 0 ? `${detections.length} Cavities Found` : "Clear Scan"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Analysis Image */}
      <div className="relative rounded-xl overflow-hidden shadow-inner bg-slate-900 border border-slate-200">
        <img src={image} alt="Analyzed" className="w-full h-auto opacity-70" />
        <svg 
          viewBox="0 0 1000 1000" 
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {detections.map((d) => (
            <React.Fragment key={d.id}>
              {/* Bounding Box */}
              <rect
                x={d.box[1]}
                y={d.box[0]}
                width={d.box[3] - d.box[1]}
                height={d.box[2] - d.box[0]}
                fill="transparent"
                stroke={getSeverityColor(d.severity)}
                strokeWidth="8"
                className="animate-pulse"
              />
              {/* Label: Severity (Extent%) */}
              <g>
                <rect 
                  x={d.box[1]} 
                  y={d.box[0] - 50} 
                  width="380" 
                  height="50" 
                  fill={getSeverityColor(d.severity)}
                  rx="4"
                />
                <text
                  x={d.box[1] + 10}
                  y={d.box[0] - 15}
                  fill="white"
                  fontSize="32"
                  fontWeight="bold"
                >
                  {d.severity} ({d.extent}%, {d.depth || 'N/A'})
                </text>
              </g>
            </React.Fragment>
          ))}
        </svg>
      </div>

      {/* Result Detail Cards */}
      <div className="space-y-3">
        {detections.map((d, i) => (
          <div key={d.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between gap-3 group hover:border-teal-200 transition-all">
            <div className="flex items-start">
              <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold mr-3 shrink-0">#{i + 1}</span>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800">{d.severity} Severity</p>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getSeverityColor(d.severity) }} />
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[12px] font-semibold text-slate-600">
                    Extent: {d.extent}%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({d.severity === CavitySeverity.LOW ? "1-40%" : d.severity === CavitySeverity.MODERATE ? "41-80%" : "81-100%"})
                  </span>
                  <span className="text-slate-300 text-xs">|</span>
                  <span className="text-[11px] font-extrabold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md">
                    Depth: {d.depth || 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-100 text-xs font-semibold text-slate-600">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-600 block mb-1">Recommended Care & Treatment:</span>
                  {getTreatmentRecommendation(d.severity)}
                </div>
              </div>
            </div>
          </div>
        ))}
        {detections.length === 0 && (
          <div className="p-8 text-center text-slate-500 italic">
            Patient scan appears normal with no visible decay.
          </div>
        )}
      </div>
    </div>
  );
};

export default CavityResults;
