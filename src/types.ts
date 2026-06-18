/**
 * Types and interfaces for RH Manager Pro
 */

export type ScheduleType = 'T' | 'F' | 'A' | 'V' | 'FA' | 'N' | 'HE';

export interface VehicleDetails {
  model: string;
  plate: string;
  color: string;
}

export type EmployeeStatus = 'active' | 'on_vacation' | 'away';
export type TransportType = 'vt' | 'vp'; // Vale Transporte or Veículo Próprio

export interface Employee {
  id: string;
  badgeNum: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  role: string;
  sector: string;
  admissionDate: string;
  transportType: TransportType;
  vehicleDetails?: VehicleDetails;
  status: EmployeeStatus;
  photoUrl?: string;
}

export interface DaySchedule {
  day: number;
  type: ScheduleType;
}

export interface MonthSchedule {
  employeeId: string;
  year: number;
  month: number; // 1-12
  days: Record<number, ScheduleType>; // Key: day of the month (1-31)
}

export interface TimeLog {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  entry1: string; // HH:MM
  exit1: string;  // HH:MM
  entry2: string; // HH:MM
  exit2: string;  // HH:MM
  workedHours: number;
  overtimeHours: number;
  negativeHours: number;
  nightHours: number;
}

export interface Vacation {
  id: string;
  employeeId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  remainingDays: number;
  expiredDays: number;
  notes?: string;
}

export interface SystemConfig {
  companyName: string;
  companyLogo: string; // Base64 or placeholder URL
  standardWorkday: number; // In hours (default 8)
  overtimeRate: number; // In BRL per hour
  nightShiftRate: number; // Night hour surcharge rate/multiplier or absolute per-hour addition (R$)
  defaultTheme: 'dark' | 'light';
  autoBackup: boolean;
}

export type ActiveTab =
  | 'dashboard'
  | 'employees'
  | 'schedules'
  | 'point'
  | 'overtime'
  | 'bank'
  | 'vacations'
  | 'reports'
  | 'config';
