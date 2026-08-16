
import { jsPDF } from "jspdf";
import { DiagnosticReport, CavitySeverity } from "../types";

export const generatePDFReport = async (report: DiagnosticReport) => {
  const doc = new jsPDF();
  const primaryColor = "#0d9488"; // Teal-600

  // --- Page 1: Data & Summary ---
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("DENTAL DIAGNOSTIC REPORT", 105, 25, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Information:", 20, 50);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${report.patientName}`, 20, 60);
  if (report.patientAge) {
    doc.text(`Age: ${report.patientAge}`, 20, 70);
    doc.text(`Date: ${report.date}`, 20, 80);
  } else {
    doc.text(`Date: ${report.date}`, 20, 70);
  }

  doc.setFont("helvetica", "bold");
  doc.text("Consultant Dentist:", 120, 50);
  doc.setFont("helvetica", "normal");
  const dentistDisplayName = report.dentistName.startsWith("Dr.") || report.dentistName.startsWith("Dr ") || report.dentistName.toLowerCase().includes("patient") || report.dentistName.toLowerCase().includes("self scan")
    ? report.dentistName
    : `Dr. ${report.dentistName}`;
  doc.text(dentistDisplayName, 120, 60);
  doc.text(`Clinic: Dental Cavity AI Lab`, 120, 70);

  const infoLineY = report.patientAge ? 90 : 80;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, infoLineY, 190, infoLineY);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Diagnostic Summary", 20, infoLineY + 15);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Cavities Detected: ${report.cavities.length}`, 20, infoLineY + 25);

  let yOffset = infoLineY + 35;
  report.cavities.forEach((cavity, index) => {
    const color = cavity.severity === CavitySeverity.HIGH ? "#ef4444" : 
                  cavity.severity === CavitySeverity.MODERATE ? "#f59e0b" : "#10b981";
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}.`, 20, yOffset);
    doc.setTextColor(color);
    doc.text(`${cavity.severity} Severity`, 30, yOffset);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Extent: ${cavity.extent}%    Depth: ${cavity.depth || 'N/A'}`, 80, yOffset);
    
    yOffset += 6;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    const recText = cavity.severity === CavitySeverity.HIGH
      ? "Care Plan: Urgent dentist callback for root canal coverage, crowns or structures."
      : cavity.severity === CavitySeverity.MODERATE
      ? "Care Plan: Standard clinical composite filling specified to freeze progression."
      : "Care Plan: Topical clinical fluoride pastes or specialized demineralization therapy.";
    doc.text(recText, 30, yOffset);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    yOffset += 10;
  });

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Clinical Notes:", 20, yOffset + 10);
  doc.setFont("helvetica", "normal");
  const splitText = doc.splitTextToSize(report.summary, 170);
  doc.text(splitText, 20, yOffset + 20);

  // --- Page 2: Visual Evidence ---
  doc.addPage();
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text("VISUAL EVIDENCE & ANALYSIS", 105, 13, { align: "center" });

  const imgWidth = 140;
  const imgHeight = 80;
  const centerX = (210 - imgWidth) / 2;

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("1. Original Uploaded Image", 20, 35);
  try {
    doc.addImage(report.originalImage, 'JPEG', centerX, 40, imgWidth, imgHeight);
  } catch (e) {
    doc.text("[Image Data Unavailable]", centerX, 80);
  }

  const analyzedY = 140;
  doc.text("2. AI Analyzed Image (Mapping)", 20, analyzedY - 5);
  try {
    doc.addImage(report.originalImage, 'JPEG', centerX, analyzedY, imgWidth, imgHeight);
    report.cavities.forEach(cavity => {
      const [ymin, xmin, ymax, xmax] = cavity.box;
      const rectX = centerX + (xmin / 1000) * imgWidth;
      const rectY = analyzedY + (ymin / 1000) * imgHeight;
      const rectW = ((xmax - xmin) / 1000) * imgWidth;
      const rectH = ((ymax - ymin) / 1000) * imgHeight;
      const color = cavity.severity === CavitySeverity.HIGH ? [239, 68, 68] : 
                    cavity.severity === CavitySeverity.MODERATE ? [245, 158, 11] : [16, 185, 129];
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(1);
      doc.rect(rectX, rectY, rectW, rectH);
      doc.setFontSize(8);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(`${cavity.severity} (${cavity.extent}%, ${cavity.depth || 'N/A'})`, rectX, rectY - 1);
    });
  } catch (e) {
    doc.text("[Analysis Visualization Unavailable]", centerX, analyzedY + 40);
  }

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text("Dental Cavity AI - Professional Diagnostic Report", 105, 285, { align: "center" });
  doc.save(`Dental_Report_${report.patientName.replace(/\s/g, '_')}.pdf`);
};
