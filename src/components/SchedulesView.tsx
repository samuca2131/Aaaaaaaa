import React from 'react';
import {
  Calendar,
  Grid,
  Info,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Save,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Employee, MonthSchedule, ScheduleType } from '../types';
import { SCHEDULE_LEGEND, MONTHS_PT } from '../utils';

interface SchedulesViewProps {
  employees: Employee[];
  schedules: MonthSchedule[];
  setSchedules: React.Dispatch<React.SetStateAction<MonthSchedule[]>>;
  theme: 'dark' | 'light';
}

export default function SchedulesView({ employees, schedules, setSchedules, theme }: SchedulesViewProps) {
  const isDark = theme === 'dark';
  
  // Hardcoded for June 2026 as per user-local setting and sample data
  const year = 2026;
  const month = 6; // June
  const daysInMonth = 30; // June has 30 days

  // Cell editing coordinates
  const [activeCell, setActiveCell] = React.useState<{ employeeId: string; day: number } | null>(null);

  const handleCellClick = (employeeId: string, day: number) => {
    setActiveCell({ employeeId, day });
  };

  const handleSetScheduleType = (type: ScheduleType) => {
    if (!activeCell) return;

    setSchedules(prev => {
      return prev.map(s => {
        if (s.employeeId === activeCell.employeeId && s.year === year && s.month === month) {
          const updatedDays = { ...s.days, [activeCell.day]: type };
          return { ...s, days: updatedDays };
        }
        return s;
      });
    });

    setActiveCell(null);
  };

  // Helper to count individual employee code occurrences for rows and summary
  const getEmployeeMetrics = (empId: string) => {
    const empSched = schedules.find(s => s.employeeId === empId && s.year === year && s.month === month);
    if (!empSched) return { T: 0, F: 0, A: 0, V: 0, FA: 0, N: 0, HE: 0 };

    const counts = { T: 0, F: 0, A: 0, V: 0, FA: 0, N: 0, HE: 0 };
    Object.values(empSched.days).forEach(type => {
      if (type in counts) {
        counts[type as ScheduleType]++;
      }
    });

    return counts;
  };

  return (
    <div className="space-y-8 animate-fade-in select-none">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-bold text-2xl tracking-tight dark:text-slate-100 text-slate-900 flex items-center gap-2">
            Escala Mensal Ordinária
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Gestão e acompanhamento da escala de revezamento. Clique em qualquer célula para alterar o status diário.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 px-4 py-2.5 rounded-xl text-purple-400 font-semibold font-mono text-xs select-none">
          <Calendar size={14} />
          <span>Junho de 2026 (30 Dias)</span>
        </div>
      </div>

      {/* DETAILED LEDGEND BAR */}
      <div className="border dark:border-purple-500/20 border-purple-900/10 rounded-2xl dark:bg-white/5 bg-white/85 backdrop-blur-md p-4.5 shadow-md">
        <h3 className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase mb-3 flex items-center gap-1.5">
          <Info size={13} /> Legenda de Atividades do Plantão
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {Object.entries(SCHEDULE_LEGEND).map(([code, data]) => (
            <div
              key={code}
              className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col justify-center items-center text-center transition-all ${data.bg} ${data.text} ${data.glow}`}
            >
              <span className="text-sm font-mono font-bold">{code}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{data.label.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CALENDAR MATRIX WRAPPER */}
      <div className="border dark:border-purple-500/20 border-purple-900/10 rounded-2xl dark:bg-white/5 bg-white shadow-md overflow-hidden relative backdrop-blur-md">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse table-fixed min-w-[1200px]">
            <thead>
              <tr className="border-b dark:border-purple-500/15 border-purple-900/10 bg-slate-50 dark:bg-slate-950/30 text-xs font-mono tracking-wider dark:text-slate-400 text-slate-500">
                {/* Fixed Employee Column */}
                <th className="py-4 px-4 font-bold sticky left-0 z-20 dark:bg-[#0B001A] bg-slate-100 border-r dark:border-purple-500/20 border-purple-900/10 w-52">
                  Funcionário
                </th>
                
                {/* Day Columns */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  // check weekend
                  const dayOfWeek = (day % 7) === 0 ? 0 : (day % 7); // June 1st is Mon (1), June 7th is Sun (0)
                  const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;

                  return (
                    <th
                      key={day}
                      className={`py-3 px-1 text-center font-bold border-r dark:border-purple-500/10 border-purple-900/5 ${isWeekend ? 'bg-purple-500/5 dark:bg-purple-950/40 text-purple-400' : ''}`}
                      style={{ width: '40px' }}
                    >
                      {String(day).padStart(2, '0')}
                    </th>
                  );
                })}

                {/* Metrics Tally columns at end */}
                <th className="py-4 px-2 font-bold text-center w-20 text-emerald-500 font-mono">Trab</th>
                <th className="py-4 px-2 font-bold text-center w-20 text-sky-500 font-mono">Folgas</th>
                <th className="py-4 px-2 font-bold text-center w-20 text-indigo-400 font-mono">Férias</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-purple-500/10 divide-purple-900/5 text-xs text-slate-650">
              {employees.map((emp) => {
                const rowSched = schedules.find(s => s.employeeId === emp.id && s.year === year && s.month === month);
                const metrics = getEmployeeMetrics(emp.id);

                return (
                  <tr key={emp.id} className="hover:bg-purple-500/5 transition-all">
                    {/* Sticky Employee Identity */}
                    <td className="py-3 px-4 sticky left-0 z-20 dark:bg-[#0B001A] bg-zinc-50 border-r dark:border-purple-500/20 border-purple-900/10 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.05)] h-full">
                      <img
                        src={emp.photoUrl}
                        referrerPolicy="no-referrer"
                        alt={emp.name}
                        className="w-7 h-7 rounded-full border border-purple-500/10 object-cover"
                      />
                      <span className="truncate select-all text-xs" title={emp.name}>
                        {emp.name.split(' ')[0]} {emp.name.split(' ').pop()}
                      </span>
                    </td>

                    {/* Day Entries */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const type = rowSched?.days[day] || 'T';
                      const legend = SCHEDULE_LEGEND[type];

                      // Is active editing cell?
                      const isCellActive = activeCell?.employeeId === emp.id && activeCell?.day === day;

                      return (
                        <td
                          key={day}
                          onClick={() => handleCellClick(emp.id, day)}
                          className={`p-1.5 border-r dark:border-purple-500/5 border-purple-905/5 text-center font-mono font-bold cursor-pointer transition-transform duration-100 active:scale-95 hover:brightness-125
                            ${isCellActive ? 'ring-2 ring-purple-500 ring-inset' : ''}
                            ${legend ? legend.bg + ' ' + legend.text : 'bg-transparent text-slate-300'}`}
                        >
                          {type}
                        </td>
                      );
                    })}

                    {/* Tally Metrics columns */}
                    <td className="py-3 px-2 text-center text-xs font-mono font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/5 select-all">
                      {metrics.T + metrics.N + metrics.HE}d
                    </td>
                    <td className="py-3 px-2 text-center text-xs font-mono font-bold text-sky-500 dark:text-sky-450 bg-sky-500/5 select-all">
                      {metrics.F}d
                    </td>
                    <td className="py-3 px-2 text-center text-xs font-mono font-bold text-indigo-400 bg-indigo-550/5 select-all">
                      {metrics.V}d
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= CONTROLLER ACTIVE CELL MODAL ================= */}
      {activeCell && (() => {
        const emp = employees.find(e => e.id === activeCell.employeeId);
        const currentType = schedules.find(s => s.employeeId === activeCell.employeeId)?.days[activeCell.day] || 'T';
        
        return (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <div
              onClick={() => setActiveCell(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <div className="relative w-full max-w-md dark:bg-slate-950 bg-white border dark:border-purple-500/25 border-purple-900/15 rounded-2xl shadow-2xl overflow-hidden animate-zoom-in z-10 p-6">
              
              <div className="flex justify-between items-start pb-4 border-b dark:border-purple-500/15 border-purple-900/10 mb-5">
                <div>
                  <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-slate-100">
                    Alterar Atividade Diária
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modifique a escala de <strong>{emp?.name}</strong> no dia <strong>{String(activeCell.day).padStart(2, '0')}/06/2026</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setActiveCell(null)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Selector Options grid */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {Object.entries(SCHEDULE_LEGEND).map(([code, data]) => {
                  const isSelected = currentType === code;

                  return (
                    <button
                      key={code}
                      onClick={() => handleSetScheduleType(code as ScheduleType)}
                      className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between border select-none cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-purple-500 dark:bg-purple-900/20 bg-purple-50 text-purple-600 dark:text-purple-300 font-semibold' 
                          : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-650'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold border ${data.bg} ${data.text}`}>
                          {code}
                        </span>
                        <span className="text-xs">{data.label}</span>
                      </div>
                      
                      {isSelected && <CheckCircle2 size={16} className="text-purple-500" />}
                    </button>
                  );
                })}
              </div>

              {/* Cancel Button */}
              <div className="mt-5 pt-4 border-t dark:border-purple-500/15 border-purple-900/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveCell(null)}
                  className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-900 font-semibold text-xs text-slate-700 dark:text-slate-350 select-none cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
