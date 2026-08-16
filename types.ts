
export type UserRole = 'DENTIST' | 'PATIENT';

export enum CavitySeverity {
  LOW = 'Low',
  MODERATE = 'Moderate',
  HIGH = 'High'
}

export interface CavityDetection {
  id: string;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  severity: CavitySeverity;
  extent: number; // Clinical percentage (1-100%)
  confidence: number; // AI confidence (0-1)
  depth?: string; // Estimated physical depth of decay/cavity (e.g., "1.2 mm")
}

export interface DiagnosticReport {
  id: string;
  patientName: string;
  patientAge?: number;
  dentistName: string;
  date: string;
  originalImage: string;
  cavities: CavityDetection[];
  summary: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  clinicName?: string;
  contact?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
