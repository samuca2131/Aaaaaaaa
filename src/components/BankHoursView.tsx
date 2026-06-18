import React from 'react';
import {
  Scale,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Search,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Employee, TimeLog } from '../types';

interface BankHoursViewProps {
  employees: Employee[];
  timeLogs: TimeLog[];
  theme: 'dark' | 'light';
}

export default function BankHoursView({ employees, timeLogs, theme }: BankHoursViewProps) {
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = React.useState('');

  const bankData = React.useMemo(() => {
    return employees.map(emp => {
      const empLogs = timeLogs.filter(l => l.employeeId === emp.id);
      const credits = empLogs.reduce((sum, l) => sum + l.overtimeHours, 0);
      const debits = empLogs.reduce((sum, l) => sum + l.negativeHours, 0);
      const net = credits - debits;

      return {
        employee: emp,
        credits: credits,
        debits: debits,
        net: net
      };
    }).filter(item => {
      const matchText = 
        item.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employee.badgeNum.includes(searchTerm);
      return matchText;
    }).sort((a, b) => b.net - a.net);
  }, [employees, timeLogs, searchTerm]);

  // Overall totals
  const totalCredits = React.useMemo(() => {
    return timeLogs.reduce((sum, l) => sum + l.overtimeHours, 0);
  }, [timeLogs]);

  const totalDebits = React.useMemo(() => {
    return timeLogs.reduce((sum, l) => sum + l.negativeHours, 0);
  }, [timeLogs]);

  const totalNetBalance = totalCredits - totalDebits;

  return (
    <div className="space-y-8 animate-fade-in select-none">
      
      {/* HEADER BAR */}
      <div>
        <h2 className="font-sans font-bold text-2xl tracking-tight dark:text-slate-100 text-slate-900 flex items-center gap-2">
          Banco de Horas Corporativo
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Balanço consolidado de compensação de horas de trabalho. Acompanhamento de créditos acumulados e débitos de horas negativas.
        </p>
      </div>

      {/* STATS DECK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TOTAL CREDITS (POSITIVAS) */}
        <div className="relative overflow-hidden rounded-2xl border dark:bg-white/5 bg-white/85 dark:border-purple-500/20 border-purple-900/10 p-6 flex items-center justify-between shadow-md dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-305 group hover:border-emerald-500/30">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider uppercase text-slate-500">Créditos Totais (Acúmulo)</span>
            <p className="text-3.5xl font-sans font-bold tracking-tight text-emerald-500 select-all">
              +{totalCredits.toFixed(1)}h
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Horas excedentes a compensar</p>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-xl dark:border dark:border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <ArrowUpRight size={22} className="animate-pulse" />
          </div>
        </div>

        {/* TOTAL DEBITS (NEGATIVAS) */}
        <div className="relative overflow-hidden rounded-2xl border dark:bg-white/5 bg-white/85 dark:border-purple-500/20 border-purple-900/10 p-6 flex items-center justify-between shadow-md dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-305 group hover:border-rose-500/30">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider uppercase text-slate-550 text-rose-500">Débitos Totais (Atrasos)</span>
            <p className="text-3.5xl font-sans font-bold tracking-tight text-rose-500 select-all">
              -{totalDebits.toFixed(1)}h
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Horas não trabalhadas sob jornada</p>
          </div>
          <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-xl dark:border dark:border-rose-500/20">
            <ArrowDownRight size={22} />
          </div>
        </div>

        {/* TOTAL NET HOUR BALANCE */}
        <div className="relative overflow-hidden rounded-2xl border dark:bg-white/5 bg-white/85 dark:border-purple-500/20 border-purple-900/10 p-6 flex items-center justify-between shadow-md dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-305 group hover:border-purple-500/30">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-wider uppercase text-slate-500">Saldo Geral Consolidado</span>
            <p className={`text-3.5xl font-sans font-bold tracking-tight select-all ${totalNetBalance >= 0 ? 'text-purple-500' : 'text-rose-500'}`}>
              {totalNetBalance >= 0 ? `+${totalNetBalance.toFixed(1)}` : `${totalNetBalance.toFixed(1)}`}h
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Saldo líquido de créditos corporativos</p>
          </div>
          <div className="p-3.5 bg-purple-500/10 text-purple-500 rounded-xl dark:border dark:border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <Scale size={22} />
          </div>
        </div>

      </div>

      {/* SEARCH AND CONTROL LINE */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-3 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Pesquisar por colaborador ou crachá..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* SUMMARY BANK GRID */}
      <div className="border dark:border-purple-500/20 border-purple-900/10 rounded-2xl dark:bg-white/5 bg-white shadow-md overflow-hidden backdrop-blur-md animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-purple-500/15 border-purple-900/10 text-xs font-mono tracking-wider dark:text-slate-400 text-slate-500 bg-slate-50 dark:bg-slate-950/30">
                <th className="py-4 px-6 font-bold">Colaborador</th>
                <th className="py-4 px-6 font-bold">Cargo / Setor</th>
                <th className="py-4 px-6 font-bold text-center text-emerald-500">Créditos (+)</th>
                <th className="py-4 px-6 font-bold text-center text-rose-500">Débitos (-)</th>
                <th className="py-4 px-6 font-bold text-center">Saldo Líquido</th>
                <th className="py-4 px-6 font-bold text-right" style={{ width: '180px' }}>Situação do Banco</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-purple-500/10 divide-purple-900/5 text-xs dark:text-slate-350 text-slate-650">
              {bankData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    <User size={32} className="mx-auto text-purple-500/30 mb-2" />
                    <span>Nenhum funcionário encontrado com filtros atuais.</span>
                  </td>
                </tr>
              ) : (
                bankData.map(item => {
                  const isPositive = item.net >= 0;
                  return (
                    <tr key={item.employee.id} className="hover:bg-purple-500/5 transition-all select-none">
                      
                      {/* Person Details */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.employee.photoUrl}
                            referrerPolicy="no-referrer"
                            alt={item.employee.name}
                            className="w-8 h-8 rounded-full border border-purple-500/10 object-cover"
                          />
                          <div>
                            <span className="font-semibold block select-all">{item.employee.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 select-all">Crachá #{item.employee.badgeNum}</span>
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

                      {/* Credits */}
                      <td className="py-4 px-6 text-center font-mono font-semibold text-emerald-500 bg-emerald-550/5 select-all">
                        {item.credits > 0 ? `+${item.credits.toFixed(1)}h` : '0.0h'}
                      </td>

                      {/* Debits */}
                      <td className="py-4 px-6 text-center font-mono font-semibold text-rose-500 bg-rose-555/5 select-all">
                        {item.debits > 0 ? `-${item.debits.toFixed(1)}h` : '0.0h'}
                      </td>

                      {/* Net Balance */}
                      <td className="py-4 px-6 text-center font-mono font-bold select-all">
                        <span className={isPositive ? 'text-purple-500' : 'text-rose-500'}>
                          {isPositive ? `+${item.net.toFixed(1)}` : `${item.net.toFixed(1)}`}h
                        </span>
                      </td>

                      {/* Status label directive */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end">
                          {isPositive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-550/20 shadow-[0_0_10px_rgba(16,185,129,0.15)] select-none">
                              <CheckCircle2 size={11} /> SALDO EM DIA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-550 border border-rose-500/30 select-none">
                              <XCircle size={11} /> SALDO DEVEDOR
                            </span>
                          )}
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
