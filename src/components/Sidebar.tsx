import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  PlusCircle,
  Scale,
  Palmtree,
  FileText,
  Settings,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  brandName: string;
}

export default function Sidebar({ activeTab, setActiveTab, brandName }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees' as ActiveTab, label: 'Funcionários', icon: Users },
    { id: 'schedules' as ActiveTab, label: 'Escalas', icon: Calendar },
    { id: 'point' as ActiveTab, label: 'Ponto', icon: Clock },
    { id: 'overtime' as ActiveTab, label: 'Horas Extras', icon: PlusCircle },
    { id: 'bank' as ActiveTab, label: 'Banco de Horas', icon: Scale },
    { id: 'vacations' as ActiveTab, label: 'Férias', icon: Palmtree },
    { id: 'reports' as ActiveTab, label: 'Relatórios', icon: FileText },
    { id: 'config' as ActiveTab, label: 'Configurações', icon: Settings },
  ];

  const handleNav = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl bg-purple-950/20 text-purple-400 border border-purple-500/30 hover:bg-purple-950/40 backdrop-blur-md transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 z-40 text-slate-200 transition-transform duration-300 transform 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
          dark:bg-black/40 dark:backdrop-blur-xl bg-slate-100/95 backdrop-blur-lg dark:border-r dark:border-purple-500/20 border-r border-purple-900/10 dark:text-slate-100 text-slate-800 flex flex-col`}
      >
        {/* Brand Header with neon effect */}
        <div className="p-6 border-b dark:border-purple-500/15 border-purple-900/10 flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <Sparkles className="text-white w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent dark:from-purple-350 dark:to-indigo-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.3)] select-none">
              {brandName || 'RH Manager Pro'}
            </h1>
            <span className="text-[10px] font-mono tracking-widest text-purple-400 font-bold block">
              SISTEMA CORPORATIVO
            </span>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                id={`sidebar-link-${item.id}`}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 select-none cursor-pointer
                  ${
                    isActive
                      ? 'dark:bg-purple-500/10 bg-purple-100 text-purple-650 dark:text-purple-350 border-r-4 border-purple-500 dark:border-purple-500 shadow-[inset_0_0_15px_rgba(168,85,247,0.15)] glow-active'
                      : 'text-slate-500 dark:text-slate-400 hover:text-purple-500 hover:bg-purple-500/5 dark:hover:bg-purple-500/10'
                  }`}
              >
                <Icon
                  size={18}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-purple-500 dark:text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]' : 'text-slate-500 dark:text-slate-400 group-hover:text-purple-550'
                  }`}
                />
                <span className="tracking-wide select-none">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info panel */}
        <div className="p-4 border-t dark:border-purple-500/15 border-purple-900/10 flex flex-col gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-500">
          <div className="flex justify-between">
            <span>Versão:</span>
            <span className="text-purple-400/80 font-semibold h-4">3.4.1 (React 19)</span>
          </div>
          <div className="flex justify-between">
            <span>Plataforma:</span>
            <span className="text-slate-400 dark:text-slate-400 font-semibold h-4">Cloud Native</span>
          </div>
        </div>
      </aside>
    </>
  );
}
