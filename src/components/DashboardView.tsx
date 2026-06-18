import React from 'react';
import {
  Users,
  CalendarDays,
  Clock,
  TrendingUp,
  Award,
  CircleDot,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck2,
  AlertTriangle,
  PlaneTakeoff
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Employee, MonthSchedule, TimeLog, SystemConfig } from '../types';

interface DashboardViewProps {
  employees: Employee[];
  schedules: MonthSchedule[];
  timeLogs: TimeLog[];
  config: SystemConfig;
  theme: 'dark' | 'light';
}

export default function DashboardView({ employees, schedules, timeLogs, config, theme }: DashboardViewProps) {
  // Theme styling toggles
  const isDark = theme === 'dark';
  const textTitleClass = "text-xs font-mono tracking-widest uppercase text-slate-500 dark:text-gray-400 font-bold";
  const cardBgClass = "relative overflow-hidden rounded-2xl border dark:bg-white/5 bg-white/85 dark:border-purple-500/20 border-purple-900/10 dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] shadow-[0_8px_32px_rgba(31,38,135,0.05)] backdrop-blur-md p-6 transition-all duration-300 group hover:border-purple-500/40 hover:shadow-[0_0_22px_rgba(168,85,247,0.15)]";
  const neonGlowClass = isDark ? "absolute -right-12 -bottom-12 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl group-hover:bg-purple-500/20 transition-all duration-550" : "hidden";

  // --- Calculations ---

  // 1. Employee status splits
  const totalEmployees = employees.length;
  const activeCount = employees.filter(e => e.status === 'active').length;
  const vacationCount = employees.filter(e => e.status === 'on_vacation').length;
  const awayCount = employees.filter(e => e.status === 'away').length;

  // 2. Schedule totals for current month (June)
  let totalWorkedDays = 0;
  let totalRestDays = 0;
  let totalSickDays = 0;
  let totalVacationDays = 0;
  let totalAbsenceDays = 0;

  schedules.forEach(s => {
    Object.values(s.days).forEach(type => {
      switch (type) {
        case 'T':
        case 'N':
          totalWorkedDays++;
          break;
        case 'F':
          totalRestDays++;
          break;
        case 'A':
          totalSickDays++;
          break;
        case 'V':
          totalVacationDays++;
          break;
        case 'FA':
          totalAbsenceDays++;
          break;
        case 'HE':
          totalWorkedDays++; // counting as worked
          break;
      }
    });
  });

  // 3. Time Logs totals
  const totalOvertimeHours = timeLogs.reduce((sum, log) => sum + log.overtimeHours, 0);
  const totalNegativeHours = timeLogs.reduce((sum, log) => sum + log.negativeHours, 0);
  const totalNightHours = timeLogs.reduce((sum, log) => sum + log.nightHours, 0);
  
  // Hours balances
  const netBankBalance = totalOvertimeHours - totalNegativeHours;
  const nightShiftPayout = totalNightHours * config.nightShiftRate;

  // Overtime Hours per Employee for Bar Chart
  const overtimePerEmp = employees.map(emp => {
    const empLogs = timeLogs.filter(l => l.employeeId === emp.id);
    const sumOT = empLogs.reduce((sum, l) => sum + l.overtimeHours, 0);
    return {
      name: emp.name.split(' ')[0], // first name for label
      'Horas Extra': Math.round(sumOT * 10) / 10
    };
  }).sort((a, b) => b['Horas Extra'] - a['Horas Extra']).slice(0, 6); // Take top 6

  // Pie Chart - Employee Status
  const statusChartData = [
    { name: 'Ativos', value: activeCount, color: '#10B981' },
    { name: 'Férias', value: vacationCount, color: '#6366F1' },
    { name: 'Afastados', value: awayCount, color: '#F59E0B' }
  ];

  // Net hourly entries grouped by Date for Line Chart (from 1st to 17th)
  const daysWithLogs = Array.from(new Set(timeLogs.map(l => l.date))).sort();
  const bankHistoryData = daysWithLogs.map(date => {
    const dayNum = date.split('-')[2];
    const dayLogs = timeLogs.filter(l => l.date === date);
    const dayOT = dayLogs.reduce((sum, l) => sum + l.overtimeHours, 0);
    const dayNeg = dayLogs.reduce((sum, l) => sum + l.negativeHours, 0);
    return {
      name: `Dia ${dayNum}`,
      'Saldo Líquido': Math.round((dayOT - dayNeg) * 10) / 10
    };
  });

  // Daily Presence (Count of employees clocking in per day) for Area Chart
  const dailyPresenceData = daysWithLogs.map(date => {
    const dayNum = date.split('-')[2];
    const count = timeLogs.filter(l => l.date === date).length;
    return {
      name: `Dia ${dayNum}`,
      'Funcionários Presentes': count
    };
  });

  return (
    <div className="space-y-8 animate-fade-in select-none">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-bold text-2xl tracking-tight dark:text-slate-100 text-slate-900 flex items-center gap-2">
            Resumo Operacional
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 dark:text-purple-400 text-purple-600 border border-purple-500/20">
              Junho 2026
            </span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Indicadores do painel analítico geral e distribuição de efetivo em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2 border dark:border-purple-500/15 border-purple-900/10 p-2.5 rounded-xl dark:bg-purple-950/10 bg-white shadow-sm font-mono text-xs">
          <CircleDot className="text-emerald-500 animate-pulse" size={14} />
          <span className="text-slate-500">Fluxos de cálculos sincronizados</span>
        </div>
      </div>

      {/* TOP SUMMARY CARDS (GRID OF 5 CARDS AS SPECIFIED) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* CARD 1: Total de Funcionários */}
        <div className={cardBgClass} id="dashboard-card-employees">
          <div className={neonGlowClass} />
          <div className="flex items-start justify-between">
            <div>
              <span className={textTitleClass}>Funcionários</span>
              <p className="text-3xl font-sans font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-1 select-all">
                {totalEmployees}
              </p>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl dark:border dark:border-purple-500/20">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t dark:border-purple-500/10 border-purple-900/5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-emerald-500">
              <span className="flex items-center gap-1.5"><UserCheck2 size={12} />Ativos:</span>
              <span className="font-semibold select-all">{activeCount}</span>
            </div>
            <div className="flex items-center justify-between text-indigo-500">
              <span className="flex items-center gap-1.5"><PlaneTakeoff size={12} />Férias:</span>
              <span className="font-semibold select-all">{vacationCount}</span>
            </div>
            <div className="flex items-center justify-between text-amber-500">
              <span className="flex items-center gap-1.5"><AlertTriangle size={12} />Afastados:</span>
              <span className="font-semibold select-all">{awayCount}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Escala do Mês */}
        <div className={cardBgClass} id="dashboard-card-schedule">
          <div className={neonGlowClass} />
          <div className="flex items-start justify-between">
            <div>
              <span className={textTitleClass}>Escala do Mês</span>
              <p className="text-3xl font-sans font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-1 select-all">
                {totalWorkedDays + totalRestDays}d
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl dark:border dark:border-indigo-500/20">
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t dark:border-purple-500/10 border-purple-900/5 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Trabalho (T/N):</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 select-all">{totalWorkedDays}d</span>
            </div>
            <div className="flex justify-between">
              <span>Folgas (F):</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 select-all">{totalRestDays}d</span>
            </div>
            <div className="flex justify-between text-rose-500">
              <span>Faltas (FA):</span>
              <span className="font-semibold font-mono select-all">{totalAbsenceDays}d</span>
            </div>
          </div>
        </div>

        {/* CARD 3: Horas Extras */}
        <div className={cardBgClass} id="dashboard-card-overtime">
          <div className={neonGlowClass} />
          <div className="flex items-start justify-between">
            <div>
              <span className={textTitleClass}>Horas Extras</span>
              <p className="text-3xl font-sans font-bold tracking-tight text-emerald-500 mt-1 select-all">
                +{totalOvertimeHours.toFixed(1)}h
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl dark:border dark:border-emerald-500/20">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t dark:border-purple-500/10 border-purple-900/5 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Média p/ Fun.:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 select-all">{(totalOvertimeHours / totalEmployees).toFixed(1)}h</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Custo Previsto:</span>
              <span className="font-semibold text-emerald-500 font-mono select-all">
                R$ {(totalOvertimeHours * config.overtimeRate).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 4: Banco de Horas */}
        <div className={cardBgClass} id="dashboard-card-bank">
          <div className={neonGlowClass} />
          <div className="flex items-start justify-between">
            <div>
              <span className={textTitleClass}>Banco de Horas</span>
              <p className={`text-3xl font-sans font-bold tracking-tight mt-1 select-all ${netBankBalance >= 0 ? 'text-purple-500' : 'text-rose-500'}`}>
                {netBankBalance >= 0 ? `+${netBankBalance.toFixed(1)}` : `${netBankBalance.toFixed(1)}`}h
              </p>
            </div>
            <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl dark:border dark:border-cyan-500/20">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t dark:border-purple-500/10 border-purple-900/5 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-between text-purple-400">
              <span className="flex items-center gap-1.5"><ArrowUpRight size={12} />Créditos (+):</span>
              <span className="font-semibold font-mono select-all">+{totalOvertimeHours.toFixed(1)}h</span>
            </div>
            <div className="flex items-center justify-between text-rose-400">
              <span className="flex items-center gap-1.5"><ArrowDownRight size={12} />Débitos (-):</span>
              <span className="font-semibold font-mono select-all">-{totalNegativeHours.toFixed(1)}h</span>
            </div>
          </div>
        </div>

        {/* CARD 5: Adicional Noturno */}
        <div className={cardBgClass} id="dashboard-card-night">
          <div className={neonGlowClass} />
          <div className="flex items-start justify-between">
            <div>
              <span className={textTitleClass}>Adicional Noturno</span>
              <p className="text-3xl font-sans font-bold tracking-tight text-indigo-500 mt-1 select-all">
                {totalNightHours.toFixed(1)}h
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl dark:border dark:border-indigo-500/20">
              <Award size={18} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t dark:border-purple-500/10 border-purple-900/5 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex justify-between">
              <span>H. Noturnas total:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 select-all">{totalNightHours.toFixed(1)}h</span>
            </div>
            <div className="flex justify-between">
              <span>Adicional Pago:</span>
              <span className="font-semibold text-indigo-500 dark:text-indigo-400 font-mono select-all">
                R$ {nightShiftPayout.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* CHARTS GRID SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CHART 1: Pizza - Ativos, Férias, Afastados */}
        <div className="border border-purple-500/10 rounded-2xl dark:bg-slate-950/40 bg-white shadow-md p-6 relative">
          <h3 className="text-sm font-sans font-bold text-slate-900 dark:text-slate-200 mb-6 flex items-center justify-between">
            <span>Distribuição de Colaboradores</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Status do Efetivo</span>
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#13052a' : '#fff',
                    borderColor: isDark ? '#a855f7' : '#ddd',
                    borderRadius: '12px',
                    color: isDark ? '#f8fafc' : '#1e293b'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-xs font-sans text-slate-600 dark:text-slate-300 ml-1.5">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Barras - Horas Extras por Funcionário */}
        <div className="border border-purple-500/10 rounded-2xl dark:bg-slate-950/40 bg-white shadow-md p-6">
          <h3 className="text-sm font-sans font-bold text-slate-900 dark:text-slate-200 mb-6 flex items-center justify-between">
            <span>Horas Extras por Funcionário</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Top Extra Mês</span>
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overtimePerEmp} margin={{ left: -10, right: 10 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 10 }}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 10 }} 
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#13052a' : '#fff',
                    borderColor: isDark ? '#a855f7' : '#ddd',
                    borderRadius: '12px',
                    color: isDark ? '#f8fafc' : '#1e293b'
                  }}
                />
                <Bar dataKey="Horas Extra" fill="#A855F7" radius={[4, 4, 0, 0]}>
                  {overtimePerEmp.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#C084FC' : '#8B5CF6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Linha - Banco de Horas Mensal */}
        <div className="border border-purple-500/10 rounded-2xl dark:bg-slate-950/40 bg-white shadow-md p-6">
          <h3 className="text-sm font-sans font-bold text-slate-900 dark:text-slate-200 mb-6 flex items-center justify-between">
            <span>Saldo do Banco de Horas Diário</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Trend de Saldo Líquido</span>
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bankHistoryData} margin={{ left: -10, right: 15 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 10 }}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 10 }}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#13052a' : '#fff',
                    borderColor: isDark ? '#a855f7' : '#ddd',
                    borderRadius: '12px',
                    color: isDark ? '#f8fafc' : '#1e293b'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Saldo Líquido" 
                  stroke="#06B6D4" 
                  strokeWidth={3}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Área - Presença Mensal */}
        <div className="border border-purple-500/10 rounded-2xl dark:bg-slate-950/40 bg-white shadow-md p-6">
          <h3 className="text-sm font-sans font-bold text-slate-900 dark:text-slate-200 mb-6 flex items-center justify-between">
            <span>Efetivo de Trabalho Diário (Presença)</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Ativação de Presença</span>
          </h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyPresenceData} margin={{ left: -10, right: 15 }}>
                <defs>
                  <linearGradient id="colorPresence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 10 }}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 10 }}
                  axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#13052a' : '#fff',
                    borderColor: isDark ? '#a855f7' : '#ddd',
                    borderRadius: '12px',
                    color: isDark ? '#f8fafc' : '#1e293b'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Funcionários Presentes" 
                  stroke="#A855F7" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPresence)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
