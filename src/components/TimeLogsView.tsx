import React from 'react';
import {
  Clock,
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { Employee, TimeLog, SystemConfig } from '../types';
import { calculateShiftMetrics } from '../utils';

interface TimeLogsViewProps {
  employees: Employee[];
  timeLogs: TimeLog[];
  setTimeLogs: React.Dispatch<React.SetStateAction<TimeLog[]>>;
  config: SystemConfig;
  theme: 'dark' | 'light';
}

export default function TimeLogsView({ employees, timeLogs, setTimeLogs, config, theme }: TimeLogsViewProps) {
  const isDark = theme === 'dark';

  // Filters
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterDate, setFilterDate] = React.useState('');

  // Form Management
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingLog, setEditingLog] = React.useState<TimeLog | null>(null);

  // Form Fields
  const [employeeId, setEmployeeId] = React.useState('');
  const [date, setDate] = React.useState('');
  const [entry1, setEntry1] = React.useState('08:00');
  const [exit1, setExit1] = React.useState('12:00');
  const [entry2, setEntry2] = React.useState('13:00');
  const [exit2, setExit2] = React.useState('18:00');

  const [formValidationError, setFormValidationError] = React.useState('');

  // Auto Calculations dynamic preview
  const liveMetrics = React.useMemo(() => {
    return calculateShiftMetrics(entry1, exit1, entry2, exit2, config.standardWorkday);
  }, [entry1, exit1, entry2, exit2, config.standardWorkday]);

  const filteredLogs = timeLogs.filter(log => {
    const emp = employees.find(e => e.id === log.employeeId);
    if (!emp) return false;

    const matchText = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.badgeNum.includes(searchTerm) ||
      emp.cpf.includes(searchTerm);

    const matchDate = !filterDate || log.date === filterDate;

    return matchText && matchDate;
  }).sort((a, b) => b.date.localeCompare(a.date)); // Sort latest first

  const openAddLog = () => {
    setEditingLog(null);
    setFormValidationError('');
    setEmployeeId(employees[0]?.id || '');
    // Today formatted June 17, 2026
    setDate('2026-06-17');
    setEntry1('08:00');
    setExit1('12:00');
    setEntry2('13:00');
    setExit2('18:00');
    setIsFormOpen(true);
  };

  const openEditLog = (log: TimeLog) => {
    setEditingLog(log);
    setFormValidationError('');
    setEmployeeId(log.employeeId);
    setDate(log.date);
    setEntry1(log.entry1);
    setExit1(log.exit1);
    setEntry2(log.entry2);
    setExit2(log.exit2);
    setIsFormOpen(true);
  };

  const handleDeleteLog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Deseja realmente remover este registro de ponto eletrônico?")) {
      setTimeLogs(prev => prev.filter(log => log.id !== id));
    }
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationError('');

    if (!employeeId || !date || !entry1 || !exit1 || !entry2 || !exit2) {
      setFormValidationError('Preencha as marcações de horário corretamente.');
      return;
    }

    // Check pre-existing log for the same employee on that day
    const duplicate = timeLogs.find(
      l => l.employeeId === employeeId && l.date === date && (!editingLog || l.id !== editingLog.id)
    );
    if (duplicate) {
      const empName = employees.find(e => e.id === employeeId)?.name || 'Este colaborador';
      setFormValidationError(`${empName} já possui um registro de ponto cadastrado no dia ${new Date(date).toLocaleDateString('pt-BR')}.`);
      return;
    }

    const calculatedData = calculateShiftMetrics(entry1, exit1, entry2, exit2, config.standardWorkday);

    const finalLog: TimeLog = {
      id: editingLog ? editingLog.id : `log_${Date.now()}`,
      employeeId,
      date,
      entry1,
      exit1,
      entry2,
      exit2,
      ...calculatedData
    };

    if (editingLog) {
      setTimeLogs(prev => prev.map(l => l.id === editingLog.id ? finalLog : l));
    } else {
      setTimeLogs(prev => [finalLog, ...prev]);
    }

    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in select-none">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-bold text-2xl tracking-tight dark:text-slate-100 text-slate-900 flex items-center gap-2">
            Ponto Eletrônico
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Registro, edição e averiguação das batidas de ponto, horas extraordinárias, atrasos e adicionais.
          </p>
        </div>
        <button
          onClick={openAddLog}
          id="btn-add-timelog"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm px-5 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.35)] cursor-pointer"
        >
          <Plus size={16} />
          <span>Lançar Ponto Manual</span>
        </button>
      </div>

      {/* FILTER SEARCH BAR */}
      <div className="border dark:border-purple-500/20 border-purple-900/10 rounded-2xl dark:bg-white/5 bg-white/85 backdrop-blur-md p-5 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Filtrar por nome do funcionário, crachá, CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900/40 bg-zinc-50 dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="relative">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900/40 bg-zinc-50 dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* LOG ENTIRES LIST TABLE */}
      <div className="border dark:border-purple-500/20 border-purple-900/10 rounded-2xl dark:bg-white/5 bg-white shadow-md overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <Clock size={48} className="mx-auto text-purple-500/30 mb-4" />
              <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">Nenhum espelho de ponto encontrado</p>
              <p className="text-xs mt-1">Verifique as datas inseridas ou insira novas batidas.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b dark:border-purple-500/15 border-purple-900/10 text-xs font-mono tracking-wider dark:text-slate-400 text-slate-500 bg-slate-50 dark:bg-slate-950/30">
                  <th className="py-4 px-6 font-bold">Colaborador</th>
                  <th className="py-4 px-6 font-bold">Data</th>
                  <th className="py-4 px-6 font-bold">Punches (Intervalos 1 & 2)</th>
                  <th className="py-4 px-6 font-bold text-center">Trabalhado</th>
                  <th className="py-4 px-6 font-bold text-center">Horas Extras</th>
                  <th className="py-4 px-6 font-bold text-center">Faltas/Horas Neg</th>
                  <th className="py-4 px-6 font-bold text-center text-purple-400">Noturno</th>
                  <th className="py-4 px-6 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-purple-500/10 divide-purple-900/5 text-xs dark:text-slate-350 text-slate-600">
                {filteredLogs.map(log => {
                  const emp = employees.find(e => e.id === log.employeeId);
                  if (!emp) return null;

                  return (
                    <tr key={log.id} className="hover:bg-purple-500/5 transition-all select-none">
                      {/* Person Identity */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp.photoUrl}
                            referrerPolicy="no-referrer"
                            alt={emp.name}
                            className="w-8 h-8 rounded-full border border-purple-500/10 object-cover"
                          />
                          <div>
                            <p className="font-semibold dark:text-slate-200 text-slate-800 select-all">
                              {emp.name}
                            </p>
                            <p className="text-[10px] text-slate-500 select-all">Crachá #{emp.badgeNum}</p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 font-mono font-bold text-slate-700 dark:text-slate-305 select-all">
                        {new Date(log.date + "T00:00:00").toLocaleDateString('pt-BR')}
                      </td>

                      {/* Clock Punch Blocks */}
                      <td className="py-4 px-6 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 text-slate-600 dark:text-slate-350">{log.entry1}</span>
                          <span className="text-slate-450">➔</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 text-slate-600 dark:text-slate-350">{log.exit1}</span>
                          <span className="text-purple-400 font-bold">|</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 text-slate-600 dark:text-slate-350">{log.entry2}</span>
                          <span className="text-slate-450">➔</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 text-slate-600 dark:text-slate-350">{log.exit2}</span>
                        </div>
                      </td>

                      {/* Worked metrics */}
                      <td className="py-4 px-6 text-center font-mono font-bold dark:text-slate-200 text-slate-805 select-all">
                        {log.workedHours.toFixed(2)}h
                      </td>

                      {/* Extra Hours */}
                      <td className="py-4 px-6 text-center">
                        {log.overtimeHours > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono font-bold select-all">
                            +{log.overtimeHours.toFixed(2)}h
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Negative Hours */}
                      <td className="py-4 px-6 text-center">
                        {log.negativeHours > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 font-mono font-bold select-all">
                            -{log.negativeHours.toFixed(2)}h
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Night Hours */}
                      <td className="py-4 px-6 text-center">
                        {log.nightHours > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono font-bold select-all">
                            {log.nightHours.toFixed(2)}h
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openEditLog(log)}
                            className="p-1.5 text-slate-440 hover:text-indigo-500 hover:bg-indigo-505/10 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteLog(log.id, e)}
                            className="p-1.5 text-slate-440 hover:text-rose-500 hover:bg-rose-505/10 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================= EDIT / CREATE PUNCH LOG MODAL ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsFormOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <form
            onSubmit={handleSaveLog}
            className="relative w-full max-w-xl bg-slate-900 border dark:border-purple-500/25 border-purple-900/15 dark:bg-[#0B001A] bg-zinc-50 rounded-2xl shadow-2xl flex flex-col z-10 max-h-[90vh] overflow-y-auto animate-zoom-in"
          >
            {/* Header */}
            <div className="p-6 border-b dark:border-purple-500/15 border-purple-900/10 flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="text-purple-500 animate-pulse" size={18} />
                  {editingLog ? 'Editar Registro de Ponto' : 'Log de Ponto Manual'}
                </h3>
                <p className="text-xs text-slate-500">
                  Insira as 4 batidas obrigatórias de ponto correspondentes aos turnos diários.
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

            {/* Validation warnings */}
            {formValidationError && (
              <div className="m-6 mb-0 p-4 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 text-xs flex items-center gap-2">
                <AlertTriangle size={15} />
                <span>{formValidationError}</span>
              </div>
            )}

            {/* Form Fields body */}
            <div className="p-6 space-y-6 flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Employee Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                    Colaborador *
                  </label>
                  <select
                    disabled={!!editingLog}
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} (Crachá: #{emp.badgeNum})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                    Data do Serviço *
                  </label>
                  <input
                    type="date"
                    required
                    disabled={!!editingLog}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* CLOCK PUNCHE TIMERS */}
              <div className="border border-purple-500/10 rounded-2xl p-5 dark:bg-purple-950/10 bg-zinc-150">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="text-purple-400" size={15} />
                  <span className="text-xs font-bold text-indigo-505 dark:text-purple-400 uppercase tracking-wider font-mono">
                    Registros das Batidas de Horários
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Entrance 1 */}
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 mb-1 font-bold">
                      1ª Ent (08:00)
                    </label>
                    <input
                      type="time"
                      required
                      value={entry1}
                      onChange={(e) => setEntry1(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-center border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-950 bg-white dark:text-slate-200 text-slate-700 text-xs focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  {/* Exit 1 */}
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 mb-1 font-bold">
                      1ª Saída (12:00)
                    </label>
                    <input
                      type="time"
                      required
                      value={exit1}
                      onChange={(e) => setExit1(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-center border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-950 bg-white dark:text-slate-200 text-slate-700 text-xs focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  {/* Entrance 2 */}
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 mb-1 font-bold">
                      2ª Ent (13:00)
                    </label>
                    <input
                      type="time"
                      required
                      value={entry2}
                      onChange={(e) => setEntry2(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-center border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-950 bg-white dark:text-slate-200 text-slate-700 text-xs focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  {/* Exit 2 */}
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 mb-1 font-bold">
                      2ª Saída (18:00)
                    </label>
                    <input
                      type="time"
                      required
                      value={exit2}
                      onChange={(e) => setExit2(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-center border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-950 bg-white dark:text-slate-200 text-slate-700 text-xs focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* REAL-TIME MATH PREVIEW */}
              <div className="border dark:bg-[#130630]/20 bg-purple-500/5 dark:border-purple-500/20 border-purple-900/10 rounded-2xl p-5 shadow-[inset_0_0_15px_rgba(168,85,247,0.05)]">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="text-purple-500" size={15} />
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    Resultado dos Cálculos Automáticos
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4.5 text-center mt-4">
                  <div className="p-3 bg-slate-950/20 rounded-xl border dark:border-slate-800 border-slate-205">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Horas Trabalhadas</p>
                    <p className="text-xl font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">{liveMetrics.workedHours.toFixed(2)}h</p>
                  </div>

                  <div className="p-3 bg-slate-950/20 rounded-xl border dark:border-slate-800 border-slate-205">
                    <p className="text-[10px] text-slate-550 font-semibold uppercase tracking-wider text-emerald-500">Horas Extras</p>
                    <p className="text-xl font-mono font-bold text-emerald-500 mt-1">+{liveMetrics.overtimeHours.toFixed(2)}h</p>
                  </div>

                  <div className="p-3 bg-slate-950/20 rounded-xl border dark:border-slate-800 border-slate-205">
                    <p className="text-[10px] text-slate-550 font-semibold uppercase tracking-wider text-rose-500">Horas Negativas</p>
                    <p className="text-xl font-mono font-bold text-rose-500 mt-1">-{liveMetrics.negativeHours.toFixed(2)}h</p>
                  </div>

                  <div className="p-3 bg-[#170B34]/30 rounded-xl border dark:border-purple-500/10 border-purple-900/10 flex flex-col justify-center">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider text-purple-400 flex items-center justify-center gap-1"><Award size={10} />Adic. Noturno</p>
                    <p className="text-xl font-mono font-bold text-purple-400 mt-1">{liveMetrics.nightHours.toFixed(2)}h</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t dark:border-purple-500/15 border-purple-900/10 flex justify-end gap-3.5 bg-slate-950/30">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2.5 rounded-xl border dark:border-slate-800 border-slate-300 text-sm font-medium hover:bg-slate-500/10 dark:text-slate-405 text-slate-600 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="modal-save-log-btn"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-md select-none cursor-pointer animate-pulse"
              >
                {editingLog ? 'Salvar Edição' : 'Registrar Ponto'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
