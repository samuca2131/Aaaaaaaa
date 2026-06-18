/**
 * Utility functions for RH Manager Pro
 */

import { ScheduleType } from './types';

/**
 * Parses time string "HH:MM" into minutes from midnight (0 to 1439).
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return (h % 24) * 60 + (m % 60);
}

/**
 * Formats minutes from midnight into "HH:MM".
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Returns true if a given minute from midnight falls in the Brazilian Night Shift range
 * (22:00 to 05:00).
 * 22:00 = 1320 minutes
 * 05:00 = 300 minutes
 */
export function isNightMinute(minuteOfDay: number): boolean {
  return minuteOfDay >= 1320 || minuteOfDay < 300;
}

/**
 * Calculates total worked decimal hours and night hours for a single interval.
 * Handles cases where the interval crosses midnight (e.g. 22:00 to 06:00).
 */
export function calculateIntervalHours(startStr: string, endStr: string): { worked: number; night: number } {
  if (!startStr || !endStr) return { worked: 0, night: 0 };
  
  const startMin = timeToMinutes(startStr);
  let endMin = timeToMinutes(endStr);
  
  // If end is before start, it crossed midnight (e.g., 22:00 to 05:00)
  let totalMinutes = 0;
  if (endMin < startMin) {
    totalMinutes = (1440 - startMin) + endMin;
  } else {
    totalMinutes = endMin - startMin;
  }
  
  if (totalMinutes <= 0) return { worked: 0, night: 0 };

  // Count night minutes
  let nightMinutes = 0;
  let currentMin = startMin;
  for (let i = 0; i < totalMinutes; i++) {
    if (isNightMinute(currentMin)) {
      nightMinutes++;
    }
    currentMin = (currentMin + 1) % 1440;
  }

  return {
    worked: totalMinutes / 60,
    night: nightMinutes / 60
  };
}

/**
 * Calculates complete shift data for two punch blocks (morning and afternoon/night).
 * Inputs are of format "HH:MM".
 */
export function calculateShiftMetrics(
  entry1: string,
  exit1: string,
  entry2: string,
  exit2: string,
  standardWorkday: number = 8
): {
  workedHours: number;
  overtimeHours: number;
  negativeHours: number;
  nightHours: number;
} {
  const block1 = calculateIntervalHours(entry1, exit1);
  const block2 = calculateIntervalHours(entry2, exit2);

  const totalWorked = block1.worked + block2.worked;
  const totalNight = block1.night + block2.night;

  let overtime = 0;
  let negative = 0;

  if (totalWorked > standardWorkday) {
    overtime = totalWorked - standardWorkday;
  } else if (totalWorked < standardWorkday) {
    negative = standardWorkday - totalWorked;
  }

  // Round metrics to 2 decimal places to prevent float issues
  return {
    workedHours: Math.round(totalWorked * 100) / 100,
    overtimeHours: Math.round(overtime * 100) / 100,
    negativeHours: Math.round(negative * 100) / 100,
    nightHours: Math.round(totalNight * 100) / 100,
  };
}

/**
 * Safe CPF formater
 */
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return value;
}

/**
 * Safe phone formater
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 11) {
    if (digits.length > 10) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return value;
}

/**
 * Legend color and descriptive text mapping for scale codes
 */
export const SCHEDULE_LEGEND: Record<ScheduleType, { label: string; bg: string; text: string; glow: string }> = {
  T: { label: 'Trabalhou (Diurno)', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-500 dark:text-emerald-400 border border-emerald-500/30', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.2)]' },
  F: { label: 'Folga', bg: 'bg-zinc-500/10 dark:bg-zinc-500/20', text: 'text-zinc-500 dark:text-zinc-400 border border-zinc-500/20', glow: '' },
  A: { label: 'Atestado Médico', bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-500 dark:text-amber-400 border border-amber-500/30', glow: 'shadow-[0_0_10px_rgba(245,158,11,0.2)]' },
  V: { label: 'Férias', bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-500 dark:text-indigo-400 border border-indigo-500/30', glow: 'shadow-[0_0_10px_rgba(99,102,241,0.2)]' },
  FA: { label: 'Falta Justificada/Injust.', bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-500 dark:text-rose-400 border border-rose-500/30', glow: 'shadow-[0_0_10px_rgba(239,68,68,0.2)]' },
  N: { label: 'Noturno', bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-500 dark:text-purple-400 border border-purple-500/30', glow: 'shadow-[0_0_10px_rgba(168,85,247,0.3)]' },
  HE: { label: 'Hora Extra', bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-500 dark:text-cyan-400 border border-cyan-500/30', glow: 'shadow-[0_0_10px_rgba(6,182,212,0.3)]' },
};

/**
 * Gets number of days in a month. Year is four-digit, month is 1-12.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Name of months in Portuguese
 */
export const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Generates an elegant CSV string and triggers a browser download.
 */
export function exportToCSV(filename: string, headers: string[], rows: string[][]) {
  const content = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';'))
  ].join('\n');
  
  // Add UTF-8 BOM so Excel opens PT characters correctly (like ção, é, í, etc.)
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
