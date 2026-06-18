import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Layers,
  Search,
  Users
} from 'lucide-react';
import { Employee, TimeLog, SystemConfig } from '../types';

interface OvertimeViewProps {
  employees: Employee[];
  timeLogs: TimeLog[];
  config: SystemConfig;
  theme: 'dark' | 'light';
}

export default function OvertimeView({ employees, timeLogs, config, theme }: OvertimeViewProps) {
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = React.useState('');

  const overtimeData = React.useMemo(() => {
    return employees.map(emp => {
      const empLogs = timeLogs.filter(l => l.employeeId === emp.id);
      const totalHours = empLogs.reduce((sum, l) => sum + l.overtimeHours, 0);
      const compensation = totalHours * config.overtimeRate;
      
      return {
        employee: emp,
        hours: totalHours,
        compensation: compensation
      };
    }).filter(item => {
      const matchText = 
        item.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employee.badgeNum.includes(searchTerm);
      return matchText;
    }).sort((a, b) => b.hours - a.hours);
  }, [employees, timeLogs, config.overtimeRate, searchTerm]);

  const totalCompanyOvertime = React.useMemo(() => {
    return timeLogs.reduce((sum, l) => sum + l.overtimeHours, 0);
  }, [timeLogs]);

  const totalCompanyCompensation = React.useMemo(() => {
    return totalCompanyOvertime * config.overtimeRate;
  }, [totalCompanyOvertime, config.overtimeRate]);

  return (
    <div className="space-y-8 animate-fade-in select-none">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="font-sans font-bold text-2xl tracking-tight dark:text-slate-100 text-slate-900 flex items-center gap-2">
          Gestão de Horas Extras e Custos
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Acompanhamento individualizado e acumulado das horas trabalhadas além da jornada normal contratada de {config.standardWorkday}h diárias.
        </p>
      </div>

      {/* STATS SUMMARY WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TOTAL HOURS COUNTER */}
        <div className="relative overflow-hidden rounded-2xl border dark:bg-white/5 bg-white/85 dark:border-purple-500/20 border-purple-900/10 p-6 flex items-center justify-between shadow-md dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:border-purple-500/35">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider uppercase text-slate-500">Horas Extras Totais</span>
            <p className="text-3.5xl font-sans font-bold tracking-tight text-emerald-500 select-all">
              {totalCompanyOvertime.toFixed(1)}h
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Registradas no mês atual de Junho</p>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-xl dark:border dark:border-emerald-500/20">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* OVERTIME HOURLY VALUATION RATE */}
        <div className="relative overflow-hidden rounded-2xl border dark:bg-white/5 bg-white/85 dark:border-purple-500/20 border-purple-900/10 p-6 flex items-center justify-between shadow-md dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:border-purple-500/35">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider uppercase text-slate-500">Valor Adicional da Hora</span>
            <p className="text-3.5xl font-sans font-bold tracking-tight text-slate-800 dark:text-slate-100 select-all">
              R$ {config.overtimeRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Configurado para o dissídio corporativo</p>
          </div>
          <div className="p-3.5 bg-purple-500/10 text-purple-500 rounded-xl dark:border dark:border-purple-500/20">
            <DollarSign size={22} />
          </div>
        </div>

        {/* FINANCIAL COMPENSATION PROJECTION */}
        <div className="relative overflow-hidden rounded-2xl border dark:bg-white/5 bg-white/85 dark:border-purple-500/20 border-purple-900/10 p-6 flex items-center justify-between shadow-md dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:border-purple-500/35">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider uppercase text-slate-550 text-indigo-500">Projeção de Reembolso RH</span>
            <p className="text-3.5xl font-sans font-bold tracking-tight text-indigo-500 select-all">
              R$ {totalCompanyCompensation.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Custo total provisionado para folha</p>
          </div>
          <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-xl dark:border dark:border-indigo-500/20">
            <Layers size={22} />
          </div>
        </div>

      </div>

      {/* FILTER SEARCH INPUT */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-3 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Pesquisar por funcionário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* DETAILS BREAKDOWN GRID TABLE */}
      <div className="border dark:border-purple-500/20 border-purple-900/10 rounded-2xl dark:bg-white/5 bg-white shadow-md overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-purple-500/15 border-purple-900/10 text-xs font-mono tracking-wider dark:text-slate-400 text-slate-500 bg-slate-50 dark:bg-slate-950/30">
                <th className="py-4 px-6 font-bold">Funcionário</th>
                <th className="py-4 px-6 font-bold">Cargo / Setor</th>
                <th className="py-4 px-6 font-bold text-center">Horas Extras de Plantão</th>
                <th className="py-4 px-6 font-bold text-center">Hora Extra Base</th>
                <th className="py-4 px-6 font-bold text-center">Adicional Previsto (BRL)</th>
                <th className="py-4 px-6 font-bold text-right" style={{ width: '220px' }}>Porcentagem do Total</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-purple-500/10 divide-purple-900/5 text-xs dark:text-slate-350 text-slate-650">
              {overtimeData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    <Users size={32} className="mx-auto text-purple-500/30 mb-2" />
                    <span>Nenhum funcionário encontrado com filtros atuais.</span>
                  </td>
                </tr>
              ) : (
                overtimeData.map(item => {
                  const pct = totalCompanyOvertime > 0 ? (item.hours / totalCompanyOvertime) * 100 : 0;
                  
                  return (
                    <tr key={item.employee.id} className="hover:bg-purple-500/5 transition-all select-none">
                      
                      {/* Name / Badge */}
                      <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-205">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.employee.photoUrl}
                            referrerPolicy="no-referrer"
                            alt={item.employee.name}
                            className="w-8 h-8 rounded-full border border-purple-500/10"
                          />
                          <div>
                            <span className="font-semibold block select-all">{item.employee.name}</span>
                            <span className="text-[10px] font-mono text-purple-500 select-all font-bold">CRACHÁ #{item.employee.badgeNum}</span>
                          </div>
                        </div>
                      </td>

                      {/* Cargo */}
                      <td className="py-4 px-6 text-slate-500">
                        <div>
                          <span>{item.employee.role}</span>
                          <span className="block text-[10px] tracking-wide text-slate-400">{item.employee.sector}</span>
                        </div>
                      </td>

                      {/* Hours */}
                      <td className="py-4 px-6 text-center font-mono font-bold text-emerald-500 select-all">
                        {item.hours > 0 ? `+${item.hours.toFixed(2)}h` : '0.00h'}
                      </td>

                      {/* Overtime rate standard */}
                      <td className="py-4 px-6 text-center font-mono select-all text-slate-400">
                        R$ {config.overtimeRate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/h
                      </td>

                      {/* Compensation Cost payout */}
                      <td className="py-4 px-6 text-center font-mono font-bold text-slate-900 dark:text-slate-100 select-all">
                        R$ {item.compensation.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Proportional visual gauge */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3.5">
                          <span className="font-mono text-[10px] text-slate-500 font-semibold">{pct.toFixed(1)}%</span>
                          <div className="w-24 bg-zinc-200 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
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
  );
}
