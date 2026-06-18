import React, { useState, useEffect } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  RefreshCw,
  Clock,
  UserCheck2,
  CalendarCheck2
} from 'lucide-react';

// Data types & Default assets
import { Employee, MonthSchedule, TimeLog, Vacation, SystemConfig, ActiveTab } from './types';
import {
  INITIAL_CONFIG,
  INITIAL_EMPLOYEES,
  INITIAL_VACATIONS,
  generateMockSchedules,
  generateMockTimeLogs
} from './mockData';

// Component Portals
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import EmployeesView from './components/EmployeesView';
import SchedulesView from './components/SchedulesView';
import TimeLogsView from './components/TimeLogsView';
import OvertimeView from './components/OvertimeView';
import BankHoursView from './components/BankHoursView';
import VacationsView from './components/VacationsView';
import ReportsView from './components/ReportsView';
import ConfigView from './components/ConfigView';

export default function App() {
  // 1. Core State Init Engine with LocalStorage Fallbacks
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('rhm_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [schedules, setSchedules] = useState<MonthSchedule[]>(() => {
    const saved = localStorage.getItem('rhm_schedules');
    return saved ? JSON.parse(saved) : generateMockSchedules();
  });

  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(() => {
    const saved = localStorage.getItem('rhm_timelogs');
    if (saved) return JSON.parse(saved);
    // Dynamic generation matched to current employees and default schedules
    const defaultSchedules = generateMockSchedules();
    return generateMockTimeLogs(INITIAL_EMPLOYEES, defaultSchedules);
  });

  const [vacations, setVacations] = useState<Vacation[]>(() => {
    const saved = localStorage.getItem('rhm_vacations');
    return saved ? JSON.parse(saved) : INITIAL_VACATIONS;
  });

  const [config, setConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('rhm_config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('rhm_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // 2. Real-time Persistence Sync subscription
  useEffect(() => {
    if (config.autoBackup) {
      localStorage.setItem('rhm_employees', JSON.stringify(employees));
      localStorage.setItem('rhm_schedules', JSON.stringify(schedules));
      localStorage.setItem('rhm_timelogs', JSON.stringify(timeLogs));
      localStorage.setItem('rhm_vacations', JSON.stringify(vacations));
      localStorage.setItem('rhm_config', JSON.stringify(config));
    }
  }, [employees, schedules, timeLogs, vacations, config]);

  // Handle Tailinds class updates on HTML roots
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('rhm_theme', theme);
  }, [theme]);

  // 3. Manual Backup Devices (Export / Import JSON Data snapshoting)
  const handleExportBackup = () => {
    try {
      const backupObj = {
        employees,
        schedules,
        timeLogs,
        vacations,
        config
      };
      
      const jsonString = JSON.stringify(backupObj, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RH_Manager_Pro_Backup_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('Backup gerado e baixado com sucesso!');
    } catch (err) {
      alert('Falha ao exportar backup de dados.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Esta importação substituirá todos os seus dados e configurações atuais de RH. Deseja prosseguir?')) {
      e.target.value = ''; // clear input
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Assert fields are present before writing to states
        if (parsed.employees && parsed.schedules && parsed.timeLogs && parsed.vacations && parsed.config) {
          setEmployees(parsed.employees);
          setSchedules(parsed.schedules);
          setTimeLogs(parsed.timeLogs);
          setVacations(parsed.vacations);
          setConfig(parsed.config);
          
          alert('Backup importado com sucesso!');
        } else {
          alert('Formato de arquivo inválido. Verifique se o arquivo JSON provém de uma exportação corporativa do RH Manager Pro.');
        }
      } catch (err) {
        alert('Erro ao decodificar arquivo JSON de backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // clear input
  };

  // 4. Component Tab Router Switch
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            employees={employees}
            schedules={schedules}
            timeLogs={timeLogs}
            config={config}
            theme={theme}
          />
        );
      case 'employees':
        return (
          <EmployeesView
            employees={employees}
            setEmployees={setEmployees}
            theme={theme}
          />
        );
      case 'schedules':
        return (
          <SchedulesView
            employees={employees}
            schedules={schedules}
            setSchedules={setSchedules}
            theme={theme}
          />
        );
      case 'point':
        return (
          <TimeLogsView
            employees={employees}
            timeLogs={timeLogs}
            setTimeLogs={setTimeLogs}
            config={config}
            theme={theme}
          />
        );
      case 'overtime':
        return (
          <OvertimeView
            employees={employees}
            timeLogs={timeLogs}
            config={config}
            theme={theme}
          />
        );
      case 'bank':
        return (
          <BankHoursView
            employees={employees}
            timeLogs={timeLogs}
            theme={theme}
          />
        );
      case 'vacations':
        return (
          <VacationsView
            employees={employees}
            vacations={vacations}
            setVacations={setVacations}
            setEmployees={setEmployees}
            theme={theme}
          />
        );
      case 'reports':
        return (
          <ReportsView
            employees={employees}
            timeLogs={timeLogs}
            schedules={schedules}
            vacations={vacations}
            config={config}
            theme={theme}
          />
        );
      case 'config':
        return (
          <ConfigView
            config={config}
            setConfig={setConfig}
            theme={theme}
            setTheme={setTheme}
            onManualExport={handleExportBackup}
            onManualImport={handleImportBackup}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-slate-500">
            Página não encontrada.
          </div>
        );
    }
  };

  // Settle background style
  const bodyBgClass = theme === 'dark' 
    ? 'bg-[#0B001A] text-slate-100 bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.15),_transparent_45%)]' 
    : 'bg-slate-50 text-slate-800 bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.05),_transparent_45%)]';

  return (
    <div className={`min-h-screen font-sans flex flex-col md:flex-row ${bodyBgClass} transition-colors duration-350`}>
      
      {/* SIDEBAR NAVIGATION DRAWER */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        brandName={config.companyName}
      />

      {/* BODY PANEL MAIN FRAME ZONE */}
      <div className="flex-1 flex flex-col min-w-0" id="main-content-panel">
        
        {/* UPPER CONE NAVIGATION NAVBAR */}
        <header className="sticky top-0 z-30 px-6 py-5 border-b dark:border-purple-500/20 border-purple-900/10 dark:bg-black/40 bg-white/70 backdrop-blur-xl flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          
          <div className="flex items-center gap-4.5 select-none pl-12 md:pl-0">
            <div>
              <p className="text-[10px] font-mono tracking-widest text-purple-400 font-bold uppercase">
                EMISSOR PRINCIPAL
              </p>
              <h2 className="text-sm font-sans font-bold dark:text-slate-1 py-0.5 text-slate-800">
                Olá, Admin do RH
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark mode/Light mode status indicator matching design */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full dark:bg-white/5 bg-purple-500/5 border dark:border-purple-500/30 border-purple-500/10 select-none">
              <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-purple-500 neon-dot-glow' : 'bg-purple-400'} shadow-[0_0_8px_rgba(168,85,247,0.6)]`}></div>
              <span className="text-[10px] font-bold tracking-widest dark:text-purple-200 text-purple-600 uppercase">
                {theme === 'dark' ? 'Dark Mode Ativo' : 'Claro Ativo'}
              </span>
            </div>

            {/* Live Clock indicator in upper navbar */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl dark:bg-slate-900 bg-zinc-100 border dark:border-slate-800 border-slate-205 text-[11px] font-mono text-slate-500 font-semibold select-none shadow-inner">
              <Clock size={12} className="text-purple-500 animate-pulse" />
              <span>Quarta, 17 Junho de 2026</span>
            </div>

            {/* LIGHT AND DARK THEME TOGGLER (Top right as specified) */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              id="theme-toggle-upper-btn"
              className="p-2.5 rounded-xl border dark:border-purple-500/20 border-purple-950/20 dark:bg-purple-950/15 bg-white hover:bg-slate-500/5 text-purple-650 dark:text-purple-400 shadow-sm transition-all select-none cursor-pointer hover:scale-105"
              title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            >
              {theme === 'dark' ? <Sun size={17} className="animate-pulse" /> : <Moon size={17} />}
            </button>
          </div>

        </header>

        {/* CONTAINER SHELF RENDER ZONE */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto pb-16">
          {renderActiveView()}
        </main>

      </div>

    </div>
  );
}
