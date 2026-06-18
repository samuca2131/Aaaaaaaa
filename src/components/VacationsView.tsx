import React from 'react';
import {
  Palmtree,
  Plus,
  Calendar,
  AlertTriangle,
  User,
  X,
  Clock,
  Briefcase,
  HelpCircle,
  CheckCircle2,
  BellRing
} from 'lucide-react';
import { Employee, Vacation } from '../types';

interface VacationsViewProps {
  employees: Employee[];
  vacations: Vacation[];
  setVacations: React.Dispatch<React.SetStateAction<Vacation[]>>;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  theme: 'dark' | 'light';
}

export default function VacationsView({ employees, vacations, setVacations, setEmployees, theme }: VacationsViewProps) {
  const isDark = theme === 'dark';

  // Form Management
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [formValidationError, setFormValidationError] = React.useState('');

  // Form Fields
  const [employeeId, setEmployeeId] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [returnDate, setReturnDate] = React.useState('');
  const [remainingDays, setRemainingDays] = React.useState(15);
  const [expiredDays, setExpiredDays] = React.useState(0);
  const [notes, setNotes] = React.useState('');

  // Dynamic calculability for holiday range size
  const requestedHolidaysSize = React.useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    const diff = end.getTime() - start.getTime();
    if (diff < 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1; // inclusive
  }, [startDate, endDate]);

  // Handle active vacationers
  const activeVacationers = React.useMemo(() => {
    // Current simulated date is 2026-06-17
    const today = new Date("2026-06-17T00:00:00");
    return vacations.filter(vac => {
      const start = new Date(vac.startDate + "T00:00:00");
      const end = new Date(vac.endDate + "T00:00:00");
      return today >= start && today <= end;
    });
  }, [vacations]);

  // Custom Automated Alerts - Check if any employee has expired days > 0
  const legalAlertsList = React.useMemo(() => {
    const alerts: string[] = [];
    
    // Alert 1: Any Vacation entry with actual expiredDays > 5
    vacations.forEach(vac => {
      const empName = employees.find(e => e.id === vac.employeeId)?.name || 'Efetivo';
      if (vac.expiredDays > 0) {
        alerts.push(`O colaborador ${empName} possui ${vac.expiredDays} dias de férias VENCIDAS. Risco legal iminente de multa pecuniária em dobro!`);
      }
    });

    // Alert 2: Check employees with no recorded vacation but admission age > 1.8 years (approx June 2024 or earlier)
    employees.forEach(emp => {
      const admYear = new Date(emp.admissionDate).getFullYear();
      const hasVacRecord = vacations.some(v => v.employeeId === emp.id);
      if (admYear <= 2024 && !hasVacRecord) {
        alerts.push(`Aviso de prazo: ${emp.name} (Admissão: ${emp.admissionDate}) está prestes a completar 2 anos de serviço sem gozo de férias acumuladas.`);
      }
    });

    return alerts;
  }, [vacations, employees]);

  const openBookVacation = () => {
    setEmployeeId(employees[0]?.id || '');
    setStartDate('2026-07-01');
    setEndDate('2026-07-30');
    setReturnDate('2026-07-31');
    setRemainingDays(15);
    setExpiredDays(0);
    setNotes('');
    setFormValidationError('');
    setIsFormOpen(true);
  };

  const handleCreateVacation = (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationError('');

    if (!employeeId || !startDate || !endDate || !returnDate) {
      setFormValidationError('Preencha as informações obrigatórias.');
      return;
    }

    if (requestedHolidaysSize <= 0) {
      setFormValidationError('A data de fim deve ser posterior à data de início das férias.');
      return;
    }

    // Book new structure
    const newVac: Vacation = {
      id: `vac_${Date.now()}`,
      employeeId,
      startDate,
      endDate,
      returnDate,
      remainingDays,
      expiredDays,
      notes
    };

    setVacations(prev => [newVac, ...prev]);

    // Update Employee Contract Status during active period immediately for consistency
    const startObj = new Date(startDate + "T00:00:00");
    const endObj = new Date(endDate + "T00:00:00");
    const today = new Date("2026-06-17T00:00:00");
    
    if (today >= startObj && today <= endObj) {
      setEmployees(prev => prev.map(emp => {
        if (emp.id === employeeId) {
          return { ...emp, status: 'on_vacation' };
        }
        return emp;
      }));
    }

    setIsFormOpen(false);
  };

  const handleRemoveVacation = (id: string, empId: string) => {
    if (confirm("Tem certeza que deseja cancelar esta escala de férias e restabelecer o status do funcionário?")) {
      setVacations(prev => prev.filter(v => v.id !== id));
      // Reset Employee status back to active
      setEmployees(prev => prev.map(emp => {
        if (emp.id === empId && emp.status === 'on_vacation') {
          return { ...emp, status: 'active' };
        }
        return emp;
      }));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in select-none">
      
      {/* HEADER PORTAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-bold text-2xl tracking-tight dark:text-slate-100 text-slate-900 flex items-center gap-2">
            Gestão de Concessão de Férias
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Planejamento anual de férias regulamentares. Controle de saldos, períodos aquisitivos, retornos programados e alertas de multas.
          </p>
        </div>
        <button
          onClick={openBookVacation}
          id="btn-book-vacation"
          className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-505 text-white font-medium text-sm px-5 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.35)] cursor-pointer"
        >
          <Plus size={16} />
          <span>Cadastrar Grade de Férias</span>
        </button>
      </div>

      {/* COMPLIANCE ALERT BOX - ALERTA AUTOMÁTICOS AS SPECIFIED */}
      {legalAlertsList.length > 0 && (
        <div className="border border-amber-500/20 rounded-2xl bg-amber-500/5 p-5 shadow-[0_0_15px_rgba(245,158,11,0.05)] text-xs text-amber-600 dark:text-amber-400 space-y-2 animate-pulse-slow">
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="text-amber-500" size={16} />
            <span className="font-sans font-bold text-xs uppercase tracking-widest font-mono">Alertas Legais do RH e Prazos</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 font-sans">
            {legalAlertsList.map((alert, i) => (
              <li key={i} className="leading-relaxed select-all">
                {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CURRENT VACATIONERS BLOCK */}
        <div className="lg:col-span-1 border dark:border-purple-500/20 border-purple-900/10 rounded-2xl dark:bg-white/5 bg-white/85 backdrop-blur-md p-5 shadow-md space-y-4">
          <h3 className="text-xs font-bold tracking-widest font-mono text-slate-500 uppercase flex items-center gap-1.5">
            <Palmtree size={14} className="text-purple-500 animate-bounce" /> Ativos em Gozo de Férias
          </h3>
          
          <div className="space-y-3">
            {activeVacationers.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">Nenhum funcionário em férias hoje.</p>
            ) : (
              activeVacationers.map(vac => {
                const emp = employees.find(e => e.id === vac.employeeId);
                if (!emp) return null;

                // compute remaining active days of vacation from today June 17, 2026
                const end = new Date(vac.endDate + "T00:00:00");
                const today = new Date("2026-06-17T00:00:00");
                const activeRemDays = Math.max(0, Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

                return (
                  <div key={vac.id} className="p-3.5 rounded-xl border dark:border-purple-500/10 border-purple-900/5 bg-slate-950/10 dark:bg-slate-950/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={emp.photoUrl}
                        referrerPolicy="no-referrer"
                        alt={emp.name}
                        className="w-8.5 h-8.5 rounded-full border border-purple-500/15"
                      />
                      <div>
                        <p className="font-semibold text-xs dark:text-slate-100 text-slate-800">{emp.name.split(' ')[0]} {emp.name.split(' ').pop()}</p>
                        <p className="text-[10px] text-slate-500">Retorno: {new Date(vac.returnDate + "T00:00:00").toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      {activeRemDays}d úteis rest.
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* VACATION GRID CHRONOLOGY CALENDAR - CALENDÁRIO DE FÉRIAS AS REQUESTED */}
        <div className="lg:col-span-2 border dark:border-purple-500/20 border-purple-900/10 rounded-2xl dark:bg-white/5 bg-white shadow-md overflow-hidden flex flex-col justify-between backdrop-blur-md">
          <div className="p-5 border-b dark:border-purple-500/15 border-purple-900/10">
            <h3 className="text-xs font-bold tracking-widest font-mono text-slate-500 uppercase flex items-center gap-1.5">
              <Calendar size={14} /> Cronograma Anual e Saldos Individuais
            </h3>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b dark:border-purple-500/15 border-purple-900/10 text-[10px] font-mono tracking-widest uppercase dark:text-slate-400 text-slate-500 bg-slate-50 dark:bg-slate-950/20">
                  <th className="py-3.5 px-6">Funcionário</th>
                  <th className="py-3.5 px-6">Intervalo das Férias</th>
                  <th className="py-3.5 px-6 text-center">Dias Restantes</th>
                  <th className="py-3.5 px-6 text-center">Dias Vencidos</th>
                  <th className="py-3.5 px-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-purple-500/10 divide-purple-900/5 text-xs dark:text-slate-350 text-slate-650">
                {vacations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Nenhuma escala de férias programada na empresa.
                    </td>
                  </tr>
                ) : (
                  vacations.map(vac => {
                    const emp = employees.find(e => e.id === vac.employeeId);
                    if (!emp) return null;

                    return (
                      <tr key={vac.id} className="hover:bg-purple-500/5 transition-all select-none">
                        
                        {/* Person details */}
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2">
                            <img
                              src={emp.photoUrl}
                              referrerPolicy="no-referrer"
                              alt={emp.name}
                              className="w-7 h-7 rounded-full border border-purple-500/10"
                            />
                            <div>
                              <span className="font-semibold select-all block">{emp.name}</span>
                              <span className="text-[10px] font-mono text-purple-400 font-bold select-all">#{emp.badgeNum}</span>
                            </div>
                          </div>
                        </td>

                        {/* Schedule period */}
                        <td className="py-3 px-6 font-mono select-all text-[11px]">
                          <div className="flex flex-col">
                            <span>De: {new Date(vac.startDate + "T00:00:00").toLocaleDateString('pt-BR')}</span>
                            <span>Até: {new Date(vac.endDate + "T00:00:00").toLocaleDateString('pt-BR')}</span>
                          </div>
                        </td>

                        {/* Balance remaining */}
                        <td className="py-3 px-6 text-center font-mono font-bold select-all">
                          {vac.remainingDays} dias
                        </td>

                        {/* Expired days limit */}
                        <td className="py-3 px-6 text-center">
                          {vac.expiredDays > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 font-mono font-bold select-all">
                              {vac.expiredDays} dias vencidos
                            </span>
                          ) : (
                            <span className="text-emerald-500 font-mono font-semibold">Sem vencimentos</span>
                          )}
                        </td>

                        {/* Trash removals */}
                        <td className="py-3 px-6 text-right">
                          <button
                            onClick={() => handleRemoveVacation(vac.id, vac.employeeId)}
                            className="p-1.5 text-slate-440 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                            title="Remover"
                          >
                            <X size={14} />
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ================= REGISTER VACATION MODAL ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsFormOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <form
            onSubmit={handleCreateVacation}
            className="relative w-full max-w-lg bg-slate-900 border dark:border-purple-500/25 border-purple-900/15 dark:bg-[#0B001A] bg-zinc-50 rounded-2xl shadow-2xl flex flex-col z-10 animate-zoom-in"
          >
            {/* Header */}
            <div className="p-6 border-b dark:border-purple-500/15 border-purple-900/10 flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Palmtree className="text-purple-500 animate-pulse" size={16} /> Planejar Período de Férias
                </h3>
                <p className="text-xs text-slate-500">
                  Selecione o funcionário e configure as respectivas datas de repouso anual.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Warning alerts */}
            {formValidationError && (
              <div className="m-6 mb-0 p-4 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 text-xs flex items-center gap-2">
                <AlertTriangle size={15} />
                <span>{formValidationError}</span>
              </div>
            )}

            {/* Inputs grid body */}
            <div className="p-6 space-y-5">
              
              {/* Employee list dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                  Colaborador do Quadros *
                </label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} (Crachá: #{emp.badgeNum})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                    Data de Fim *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Return Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                  Data de Retorno ao Serviço *
                </label>
                <input
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Remaining Days to keep */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                    Dias Restantes (Saldo do Período)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={remainingDays}
                    onChange={(e) => setRemainingDays(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                {/* Expired days to load */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                    Dias Vencidos (Se houver)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={expiredDays}
                    onChange={(e) => setExpiredDays(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Dynamic size layout informational badge */}
              {requestedHolidaysSize > 0 && (
                <div className="border border-purple-500/10 rounded-xl p-3.5 bg-purple-500/5 text-xs text-purple-600 dark:text-purple-300 font-semibold flex items-center justify-between">
                  <span>Duração Solicitada das Férias:</span>
                  <span className="font-mono text-sm font-bold bg-purple-550/10 px-2.5 py-0.5 rounded border border-purple-500/20">{requestedHolidaysSize} Dias Corridos</span>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                  Observações de Desligamento Temporário
                </label>
                <textarea
                  rows={2}
                  maxLength={180}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Justificativa comercial ou observações de concessão de abonos de férias."
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

            </div>

            {/* Footer triggers */}
            <div className="p-6 border-t dark:border-purple-500/15 border-purple-900/10 flex justify-end gap-3.5 bg-slate-950/30">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2.5 rounded-xl border dark:border-slate-800 border-slate-300 text-sm font-medium hover:bg-slate-500/10 dark:text-slate-405 text-slate-600 select-none cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="modal-book-vacation-btn"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-505 text-white font-medium text-sm transition-all shadow-md select-none cursor-pointer"
              >
                Salvar Programação
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
