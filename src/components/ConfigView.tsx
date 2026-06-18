import React from 'react';
import {
  Settings,
  DollarSign,
  Clock,
  Layers,
  Save,
  CheckCircle2,
  Download,
  Upload,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import { SystemConfig } from '../types';

interface ConfigViewProps {
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  onManualExport: () => void;
  onManualImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ConfigView({
  config,
  setConfig,
  theme,
  setTheme,
  onManualExport,
  onManualImport
}: ConfigViewProps) {
  
  // Local editable states to match form submit
  const [companyName, setCompanyName] = React.useState(config.companyName);
  const [standardWorkday, setStandardWorkday] = React.useState(config.standardWorkday);
  const [overtimeRate, setOvertimeRate] = React.useState(config.overtimeRate);
  const [nightShiftRate, setNightShiftRate] = React.useState(config.nightShiftRate);
  const [autoBackup, setAutoBackup] = React.useState(config.autoBackup);

  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig({
      companyName,
      companyLogo: "",
      standardWorkday,
      overtimeRate,
      nightShiftRate,
      defaultTheme: theme,
      autoBackup
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8 animate-fade-in select-none">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="font-sans font-bold text-2xl tracking-tight dark:text-slate-100 text-slate-900 flex items-center gap-2">
          Configurações de Parâmetros
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Ajuste as diretrizes padrão de trabalho do seu RH, regras tributárias, taxas de adicionais de horas e tema visual padrão.
        </p>
      </div>

      {/* POPUP SUCCESS TOAST */}
      {saveSuccess && (
        <div className="p-4 rounded-xl border border-purple-550/20 bg-purple-550/10 text-purple-655 dark:text-purple-300 flex items-center gap-2 text-xs font-semibold animate-zoom-in">
          <CheckCircle2 size={16} className="text-purple-500 animate-bounce" />
          <span>Configurações globais salvas com sucesso! As alterações já estão operando em todos os portais.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PARAMS ADJUST FORM CONTROL */}
        <form onSubmit={handleSaveConfig} className="lg:col-span-2 border dark:border-purple-500/20 border-purple-900/10 rounded-2xl dark:bg-white/5 bg-white shadow-md p-6 space-y-6 backdrop-blur-md">
          <div className="border-b dark:border-purple-500/15 border-purple-900/10 pb-4 flex items-center gap-2.5">
            <Settings className="text-purple-500" size={18} />
            <h3 className="font-sans font-bold text-slate-900 dark:text-slate-200 text-sm">Diretrizes da Empresa e Jornada</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Companny Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                Nome da Empresa *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex Nome fantasia Ltda"
                className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-202 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Daily shift standard time */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                Carga Horária Diária Padrão (Horas) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={24}
                value={standardWorkday}
                onChange={(e) => setStandardWorkday(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-202 text-slate-700 text-sm focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Overwork payout per hour BRL */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                Valor Unitário Hora Extra (BRL/Hora) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-xs text-slate-400 font-bold font-mono">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={overtimeRate}
                  onChange={(e) => setOvertimeRate(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-202 text-slate-700 text-sm focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            {/* Night shift hourly surcharge rate BRL */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                Valor Adicional Noturno (BRL/Hora) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-xs text-slate-400 font-bold font-mono">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={nightShiftRate}
                  onChange={(e) => setNightShiftRate(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-202 text-slate-700 text-sm focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* VISUAL THEME PREFERENCE AND BACKUPS TOGGLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-purple-500/10 border-purple-900/5">
            {/* 1. Theme choose toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-2">
                Esquema de Cores Padrão
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl border select-none cursor-pointer transition-all
                    ${theme === 'dark' 
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.15)]' 
                      : 'border-slate-800 dark:text-slate-400 text-slate-500 hover:bg-slate-800/20'}`}
                >
                  Tema Dark (Roxo Neon)
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl border select-none cursor-pointer transition-all
                    ${theme === 'light' 
                      ? 'border-purple-500 bg-purple-50/20 text-purple-600 shadow-sm' 
                      : 'border-slate-800 dark:text-slate-400 text-slate-500 hover:bg-slate-800/20'}`}
                >
                  Tema Light (Soft Clean)
                </button>
              </div>
            </div>

            {/* 2. Auto local backups checkbox */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-3_5">
                Segurança de Dados e Backups
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium dark:text-slate-300 text-slate-700 pt-1.5 select-none h-9">
                <input
                  type="checkbox"
                  checked={autoBackup}
                  onChange={(e) => setAutoBackup(e.target.checked)}
                  className="w-4.5 h-4.5 accent-purple-600 rounded"
                />
                <span>Backup Automático em LocalStorage</span>
              </label>
            </div>
          </div>

          {/* Trigger click submissions */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              id="btn-save-config"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-505 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.35)] cursor-pointer"
            >
              <Save size={16} />
              <span>Gravar Diretrizes</span>
            </button>
          </div>
        </form>

        {/* BACKUP MANUELS SIDEBAR PANEL (SaaS feeling as specified) */}
        <div className="lg:col-span-1 border dark:border-purple-500/20 border-purple-900/10 rounded-2xl dark:bg-white/5 bg-white/85 backdrop-blur-md p-6 shadow-md flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b dark:border-purple-500/15 border-purple-900/10 pb-4 flex items-center gap-2.5">
              <RefreshCw className="text-purple-500" size={18} />
              <h3 className="font-sans font-bold text-slate-900 dark:text-slate-200 text-sm">Dispositivo de Sincronia</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              O sistema armazena todas as operações de forma imediata e encriptada nas chaves locais do navegador. Para migrar ou blindar seu banco de dados, utilize as opções abaixo.
            </p>

            <div className="space-y-2.5 pt-2">
              {/* Backups Export */}
              <button
                type="button"
                onClick={onManualExport}
                id="btn-config-backup-export"
                className="w-full py-3 px-4 rounded-xl border border-dashed dark:border-purple-550/35 border-purple-950/20 hover:bg-purple-500/5 dark:text-purple-305 text-purple-700 text-xs font-semibold flex items-center justify-between transition-all select-none cursor-pointer"
              >
                <span className="flex items-center gap-2"><Download size={14} /> Exportar Backup (JSON)</span>
                <span className="text-[9px] font-mono text-slate-450 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded uppercase">Download</span>
              </button>

              {/* Backups Import */}
              <button
                type="button"
                onClick={triggerFileInput}
                id="btn-config-backup-import"
                className="w-full py-3 px-4 rounded-xl border border-dashed text-slate-500 hover:bg-slate-500/5 dark:border-slate-800 border-slate-300 text-xs font-medium flex items-center justify-between transition-all select-none cursor-pointer"
              >
                <span className="flex items-center gap-2"><Upload size={14} /> Restaurar Importação (JSON)</span>
                <span className="text-[9px] font-mono text-slate-450 dark:text-slate-450 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded uppercase">Upload</span>
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={onManualImport}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Hint info bar */}
          <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl text-[10px] text-slate-550 flex items-start gap-2 text-slate-400 font-sans mt-6">
            <Info size={14} className="text-purple-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">Por segurança, reforce suas salvaguardas gerando relatórios PDF completos antes de efetuar limpezas no histórico do cache de cookies do seu navegador.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
