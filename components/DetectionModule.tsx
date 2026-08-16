
import React, { useState, useRef, useEffect } from 'react';
import { User, CavityDetection, DiagnosticReport } from '../types';
import { detectCavities } from '../services/geminiService';
import { generatePDFReport } from '../services/reportService';
import CavityResults from './CavityResults';
import { Upload, Camera, BrainCircuit, Loader2, AlertCircle, RefreshCw, FileText } from 'lucide-react';

interface DetectionModuleProps {
  user: User;
  onComplete: (report: DiagnosticReport) => void;
}

const DetectionModule: React.FC<DetectionModuleProps> = ({ user, onComplete }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [patientName, setPatientName] = useState(user.role === 'PATIENT' ? user.fullName : '');
  const [patientAge, setPatientAge] = useState<string>('');
  const [detections, setDetections] = useState<CavityDetection[]>([]);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'detecting' | 'completed'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user.role === 'PATIENT') {
      setPatientName(user.fullName);
    } else {
      setPatientName('');
    }
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resized = await resizeImage(file, 800);
        setImage(resized);
        setStatus('idle');
        setDetections([]);
      } catch (error) {
        console.error("Failed to resize image", error);
      }
    }
  };

  const [thinkingMessage, setThinkingMessage] = useState("AI is analyzing pixels...");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'detecting') {
      const messages = [
        "AI is analyzing pixels...",
        "Identifying tooth structures...",
        "Detecting density variations...",
        "Classifying potential cavities...",
        "Calculating extent of decay...",
        "Generating diagnostic report..."
      ];
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setThinkingMessage(messages[i]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const resizeImage = (file: File, maxSize: number): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          // Optimized for speed: 800px max and 0.7 quality
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDetect = async () => {
    if (!image) {
      alert("Please upload an X-ray image first.");
      return;
    }
    if (!patientName.trim()) {
      alert("Please enter a patient name.");
      return;
    }

    setIsProcessing(true);
    setStatus('detecting');
    
    try {
      const results = await detectCavities(image);
      setDetections(results);
      setStatus('completed');
    } catch (error: any) {
      console.error("Detection Error:", error);
      setStatus('idle');
      const errorMessage = error.message || "AI processing failed. Please try again.";
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateReport = async () => {
    const report: DiagnosticReport = {
      id: Math.random().toString(36).substr(2, 9),
      patientName,
      patientAge: patientAge ? parseInt(patientAge) : undefined,
      dentistName: user.role === 'DENTIST' ? `Dr. ${user.fullName}` : "Self Scan (Patient)",
      date: new Date().toLocaleDateString(),
      originalImage: image!,
      cavities: detections,
      summary: detections.length > 0 
        ? `Patient exhibits ${detections.length} identifiable carious lesions. Recommend immediate restorative action for severe areas.`
        : "No significant dental caries identified in this scan."
    };
    
    await generatePDFReport(report);
    onComplete(report);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col md:flex-row">
      {/* Upload/Preview Side */}
      <div className="md:w-1/2 p-8 border-r border-slate-100 bg-slate-50/50">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <Camera className="mr-2 text-teal-600" /> Image Acquisition
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Patient Name</label>
              <input 
                type="text" 
                placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Age</label>
              <input 
                type="number" 
                placeholder="Age"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group ${
              image ? 'border-teal-500' : 'border-slate-300 hover:border-teal-400 hover:bg-white'
            }`}
          >
            {image ? (
              <>
                <img src={image} alt="X-ray" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-bold flex items-center">
                    <RefreshCw className="mr-2" /> Change Image
                  </p>
                </div>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-slate-300 mb-4 group-hover:text-teal-500 transition-colors" />
                <p className="text-slate-500 font-medium">Click to upload Dental X-ray</p>
                <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, DICOM</p>
              </>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>

          <button
            onClick={handleDetect}
            disabled={!image || !patientName || isProcessing}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
              !image || !patientName || isProcessing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-teal-600 text-white shadow-lg hover:bg-teal-700 transform hover:scale-[1.01]'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Processing Scan...
              </>
            ) : (
              <>
                <BrainCircuit className="mr-2" />
                Run AI Detection
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Side */}
      <div className="md:w-1/2 p-8 bg-white">
        <h3 className="text-xl font-bold mb-6">Detection Workspace</h3>
        
        {status === 'idle' && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <AlertCircle size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500">Awaiting scan analysis...</p>
          </div>
        )}

        {status === 'detecting' && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-teal-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BrainCircuit className="text-teal-600" />
              </div>
            </div>
            <p className="font-bold text-slate-800 text-lg">{thinkingMessage}</p>
            <p className="text-slate-500 max-w-xs mt-2">Running convolutional neural networks for semantic segmentation and object detection.</p>
          </div>
        )}

        {status === 'completed' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <CavityResults detections={detections} image={image!} />
            
            <div className="pt-6 border-t border-slate-100 flex space-x-4">
              <button 
                onClick={handleGenerateReport}
                className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center"
              >
                <FileText className="mr-2" size={20} /> Generate PDF
              </button>
              <button 
                onClick={() => { setStatus('idle'); setDetections([]); setImage(null); }}
                className="px-6 py-3 border border-slate-200 font-bold rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionModule;
