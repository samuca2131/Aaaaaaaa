import React from 'react';
import {
  FileText,
  Download,
  Printer,
  FileCheck,
  User,
  Calendar,
  AlertCircle,
  Clock,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Employee, TimeLog, MonthSchedule, Vacation, SystemConfig } from '../types';
import { exportToCSV, getDaysInMonth, SCHEDULE_LEGEND } from '../utils';

interface ReportsViewProps {
  employees: Employee[];
  timeLogs: TimeLog[];
  schedules: MonthSchedule[];
  vacations: Vacation[];
  config: SystemConfig;
  theme: 'dark' | 'light';
}

type ReportType =
  | 'individual'
  | 'mensal'
  | 'escala_completa'
  | 'banco_horas'
  | 'horas_extras'
  | 'ferias'
  | 'adicional_noturno';

export default function ReportsView({ employees, timeLogs, schedules, vacations, config, theme }: ReportsViewProps) {
  const isDark = theme === 'dark';

  // Selected parameters
  const [selectedReport, setSelectedReport] = React.useState<ReportType>('individual');
  const [selectedEmpId, setSelectedEmpId] = React.useState(employees[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = React.useState('06'); // default June
  const [selectedYear, setSelectedYear] = React.useState('2026');

  const [pdfGenerating, setPdfGenerating] = React.useState(false);
  const [payoutSuccess, setPayoutSuccess] = React.useState(false);

  // Auto select first employee if changed
  React.useEffect(() => {
    if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].id);
    }
  }, [employees, selectedEmpId]);

  const reportNames: Record<ReportType, string> = {
    individual: 'Relatório Individual do Colaborador',
    mensal: 'Relatório Mensal de Efetivos',
    escala_completa: 'Relatório da Escala Completa',
    banco_horas: 'Extrato do Banco de Horas',
    horas_extras: 'Relatório de Horas Extras e Custos',
    ferias: 'Programação de Férias Corporativas',
    adicional_noturno: 'Cálculo de Adicional Noturno',
  };

  // --- PDF GENERATION CORE IMPLEMENTATION (Professional Letterhead layout) ---
  const handleGeneratePDF = () => {
    setPdfGenerating(true);
    
    setTimeout(() => {
      try {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = 15;

        // Colors
        const primaryColor = [128, 0, 128]; // Purple Roxo
        const darkColor = [30, 41, 59]; // slate
        const grayColor = [100, 116, 139]; // light slate

        // 1. HEADER (Cabeçalho professional)
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(15, y, 6, 18, 'F'); // elegant colored sidebar bar
        
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(config.companyName || 'RH MANAGER PRO LTDA', 25, y + 6);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(`SISTEMA DE RECURSOS HUMANOS • CONTROLE DE ESCALAS E JORNADAS`, 25, y + 11);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} • IP: Cloud Run Core`, 25, y + 16);
        
        // Horizontal separation rule line
        y += 24;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(15, y, pageWidth - 15, y);
        y += 10;

        // 2. REPORT TITLE
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text(reportNames[selectedReport].toUpperCase(), 15, y);
        
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Período de Referência: ${selectedMonth}/${selectedYear}`, 150, y);
        y += 10;

        // 3. GENERATE DIFFERENT CONTENT BODIES BY REPORT SELECTION
        if (selectedReport === 'individual') {
          const emp = employees.find(e => e.id === selectedEmpId);
          if (emp) {
            // Employee Profile box backplane
            doc.setFillColor(248, 250, 252);
            doc.rect(15, y, pageWidth - 30, 28, 'F');
            doc.setDrawColor(203, 213, 225);
            doc.rect(15, y, pageWidth - 30, 28, 'S');

            doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(`COLABORADOR: ${emp.name}`, 18, y + 6);
            doc.setFont('helvetica', 'normal');
            doc.text(`CRACHÁ: #${emp.badgeNum}   |   CPF: ${emp.cpf}   |   CARGO: ${emp.role}`, 18, y + 12);
            doc.text(`SETOR: ${emp.sector}   |   ADMISSÃO: ${new Date(emp.admissionDate).toLocaleDateString('pt-BR')}`, 18, y + 18);
            doc.text(`TRANSPORTE: ${emp.transportType === 'vt' ? 'Vale Transporte' : 'Veículo Próprio'}`, 18, y + 24);
            y += 36;

            // Punch history summary list tables
            const empLogs = timeLogs.filter(l => l.employeeId === selectedEmpId && l.date.substring(5, 7) === selectedMonth);
            
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(`ESPELHO DE REGISTROS DE PONTOS DA FOLHA`, 15, y);
            y += 6;

            // DRAW TABLE HEADERS
            doc.setFillColor(241, 245, 249);
            doc.rect(15, y, pageWidth - 30, 7, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.text("DATA", 18, y + 5);
            doc.text("ENTRADA 1", 38, y + 5);
            doc.text("ALMOÇO", 60, y + 5);
            doc.text("RETORNO", 82, y + 5);
            doc.text("SAÍDA 2", 104, y + 5);
            doc.text("TRAB. (H)", 126, y + 5);
            doc.text("H. EXTRA", 148, y + 5);
            doc.text("H. NEGAT", 170, y + 5);
            y += 7;

            // DRAW TABLE ROWS
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            let sumWorked = 0, sumOvertime = 0, sumNeg = 0;

            empLogs.forEach(l => {
              if (y > pageHeight - 45) {
                // pagebreak protection
                doc.addPage();
                y = 20;
              }
              doc.text(new Date(l.date + "T00:00:00").toLocaleDateString('pt-BR'), 18, y + 5);
              doc.text(l.entry1, 38, y + 5);
              doc.text(l.exit1, 60, y + 5);
              doc.text(l.entry2, 82, y + 5);
              doc.text(l.exit2, 104, y + 5);
              doc.text(l.workedHours.toFixed(2), 126, y + 5);
              doc.text(l.overtimeHours > 0 ? `+${l.overtimeHours.toFixed(2)}` : '-', 148, y + 5);
              doc.text(l.negativeHours > 0 ? `-${l.negativeHours.toFixed(2)}` : '-', 170, y + 5);
              
              sumWorked += l.workedHours;
              sumOvertime += l.overtimeHours;
              sumNeg += l.negativeHours;
              
              y += 7;
            });

            // TALLY TOTALS FOOTER
            doc.setDrawColor(203, 213, 225);
            doc.line(15, y, pageWidth - 15, y);
            y += 5;
            doc.setFont('helvetica', 'bold');
            doc.text(`TOTAL TRABALHADO: ${sumWorked.toFixed(1)}h`, 18, y);
            doc.text(`CRÉDITOS EXTRAS (+): ${sumOvertime.toFixed(1)}h`, 75, y);
            doc.text(`DÉBITOS NEGATIVOS (-): ${sumNeg.toFixed(1)}h`, 135, y);
            y += 10;
          }
        } 
        
        else if (selectedReport === 'mensal') {
          // Draw monthly list representing all employees
          doc.setFillColor(241, 245, 249);
          doc.rect(15, y, pageWidth - 30, 7, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.text("CRACHÁ", 18, y + 5);
          doc.text("CONTRATADO", 38, y + 5);
          doc.text("SETOR / DERP", 88, y + 5);
          doc.text("TRABALHADO (H)", 130, y + 5);
          doc.text("EXTRAS ACUM.", 155, y + 5);
          doc.text("STATUS", 180, y + 5);
          y += 7;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);

          employees.forEach(emp => {
            const empLogs = timeLogs.filter(l => l.employeeId === emp.id && l.date.substring(5, 7) === selectedMonth);
            const wSum = empLogs.reduce((sum, l) => sum + l.workedHours, 0);
            const eSum = empLogs.reduce((sum, l) => sum + l.overtimeHours, 0);

            doc.text(`#${emp.badgeNum}`, 18, y + 5);
            doc.text(emp.name, 38, y + 5);
            doc.text(emp.sector, 88, y + 5);
            doc.text(`${wSum.toFixed(1)}h`, 130, y + 5);
            doc.text(`+${eSum.toFixed(1)}h`, 155, y + 5);
            doc.text(emp.status === 'active' ? 'Ativo' : emp.status === 'away' ? 'Afastado' : 'Férias', 180, y + 5);
            
            y += 7;
          });
        } 
        
        else if (selectedReport === 'escala_completa') {
          // Schedules report outline
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.text("Abaixo, listamos a distribuição da escala de trabalho diária de revezamento programada.", 15, y);
          y += 8;

          employees.forEach((emp, index) => {
            if (y > pageHeight - 35) {
              doc.addPage();
              y = 20;
            }
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${emp.name} (Crachá: #${emp.badgeNum}) - Setor: ${emp.sector}`, 15, y);
            y += 5;

            const sched = schedules.find(s => s.employeeId === emp.id && s.year === Number(selectedYear) && s.month === Number(selectedMonth));
            if (sched) {
              let rowText = "Dias:  ";
              for (let d = 1; d <= 15; d++) rowText += `${String(d).padStart(2, '0')}:${sched.days[d] || 'T'}  `;
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(7.5);
              doc.text(rowText, 18, y);
              y += 4;
              
              rowText = "Dias:  ";
              for (let d = 16; d <= 30; d++) rowText += `${String(d).padStart(2, '0')}:${sched.days[d] || 'T'}  `;
              doc.text(rowText, 18, y);
              y += 8;
            } else {
              doc.setFont('helvetica', 'italic');
              doc.text("Escala não preenchida para o mês selecionado.", 18, y);
              y += 7;
            }
          });
        } 
        
        else if (selectedReport === 'banco_horas') {
          // Hour Bank breakdown report
          doc.setFillColor(241, 245, 249);
          doc.rect(15, y, pageWidth - 30, 7, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.text("COLABORADOR", 18, y + 5);
          doc.text("CRÉDITOS (+)", 78, y + 5);
          doc.text("DÉBITOS (-)", 108, y + 5);
          doc.text("SALDO BALANÇO", 138, y + 5);
          doc.text("SITUAÇÃO DO BANCO", 168, y + 5);
          y += 7;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);

          employees.forEach(emp => {
            const empLogs = timeLogs.filter(l => l.employeeId === emp.id && l.date.substring(5, 7) === selectedMonth);
            const cr = empLogs.reduce((sum, l) => sum + l.overtimeHours, 0);
            const db = empLogs.reduce((sum, l) => sum + l.negativeHours, 0);
            const net = cr - db;

            doc.text(emp.name, 18, y + 5);
            doc.text(`+${cr.toFixed(1)}h`, 78, y + 5);
            doc.text(`-${db.toFixed(1)}h`, 108, y + 5);
            doc.text(`${net >= 0 ? '+' : ''}${net.toFixed(1)}h`, 138, y + 5);
            doc.text(net >= 0 ? "Credito em Dia" : "Debito Pendente", 168, y + 5);
            y += 7;
          });
        } 
        
        else if (selectedReport === 'horas_extras') {
          // Extra hours valuation sheet
          doc.setFillColor(241, 245, 249);
          doc.rect(15, y, pageWidth - 30, 7, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.text("COLABORADOR", 18, y + 5);
          doc.text("SETOR", 75, y + 5);
          doc.text("TOTAL EXTRA (H)", 115, y + 5);
          doc.text("VALOR ADIC./H", 145, y + 5);
          doc.text("TOTAL BRUTO (BRL)", 172, y + 5);
          y += 7;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          let sumTotalCompensation = 0;

          employees.forEach(emp => {
            const empLogs = timeLogs.filter(l => l.employeeId === emp.id && l.date.substring(5, 7) === selectedMonth);
            const extrasSum = empLogs.reduce((sum, l) => sum + l.overtimeHours, 0);
            const payout = extrasSum * config.overtimeRate;

            doc.text(emp.name, 18, y + 5);
            doc.text(emp.sector, 75, y + 5);
            doc.text(`${extrasSum.toFixed(2)}h`, 115, y + 5);
            doc.text(`R$ ${config.overtimeRate.toFixed(2)}`, 145, y + 5);
            doc.text(`R$ ${payout.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 172, y + 5);
            
            sumTotalCompensation += payout;
            y += 7;
          });

          y += 5;
          doc.setDrawColor(203, 213, 225);
          doc.line(15, y, pageWidth - 15, y);
          y += 5;
          doc.setFont('helvetica', 'bold');
          doc.text(`CUSTO PLANILHADO TOTAL: R$ ${sumTotalCompensation.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 18, y);
          y += 10;
        } 
        
        else if (selectedReport === 'ferias') {
          // Holiday vacation rosters
          doc.setFillColor(241, 245, 249);
          doc.rect(15, y, pageWidth - 30, 7, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.text("INTEGRANTE", 18, y + 5);
          doc.text("PERÍODO INICIAL", 78, y + 5);
          doc.text("REPORTE RETORNO", 118, y + 5);
          doc.text("DIAS REST.", 152, y + 5);
          doc.text("DIAS ACUM. VENCIDOS", 172, y + 5);
          y += 7;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);

          vacations.forEach(vac => {
            const emp = employees.find(e => e.id === vac.employeeId);
            if (!emp) return;

            doc.text(emp.name, 18, y + 5);
            doc.text(new Date(vac.startDate + "T00:00:00").toLocaleDateString('pt-BR'), 78, y + 5);
            doc.text(new Date(vac.returnDate + "T00:00:00").toLocaleDateString('pt-BR'), 118, y + 5);
            doc.text(`${vac.remainingDays} dias`, 152, y + 5);
            doc.text(`${vac.expiredDays} dias`, 172, y + 5);
            y += 7;
          });
        } 
        
        else if (selectedReport === 'adicional_noturno') {
          // Nightshift premiums sheet
          doc.setFillColor(241, 245, 249);
          doc.rect(15, y, pageWidth - 30, 7, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.text("PROFISSIONAL", 18, y + 5);
          doc.text("CARGO", 75, y + 5);
          doc.text("HORAS NOTURNAS (H)", 120, y + 5);
          doc.text("VALOR ADICIONAL", 152, y + 5);
          doc.text("TOTAL PAGO", 175, y + 5);
          y += 7;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          let sumTotalNightPay = 0;

          employees.forEach(emp => {
            const empLogs = timeLogs.filter(l => l.employeeId === emp.id && l.date.substring(5, 7) === selectedMonth);
            const nightSum = empLogs.reduce((sum, l) => sum + l.nightHours, 0);
            const payout = nightSum * config.nightShiftRate;

            doc.text(emp.name, 18, y + 5);
            doc.text(emp.role, 75, y + 5);
            doc.text(`${nightSum.toFixed(2)}h`, 120, y + 5);
            doc.text(`R$ ${config.nightShiftRate.toFixed(2)}/h`, 152, y + 5);
            doc.text(`R$ ${payout.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 175, y + 5);
            
            sumTotalNightPay += payout;
            y += 7;
          });

          y += 5;
          doc.setDrawColor(203, 213, 225);
          doc.line(15, y, pageWidth - 15, y);
          y += 5;
          doc.setFont('helvetica', 'bold');
          doc.text(`PAGAMENTO TOTAL ADICIONAL NOTURNO: R$ ${sumTotalNightPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 18, y);
          y += 10;
        }

        // 4. SIGNATURE AND CORPORATE FOOTER (Assinatura e Rodapé as specified)
        if (y > pageHeight - 45) {
          doc.addPage();
          y = 25;
        } else {
          y = pageHeight - 40;
        }

        doc.setDrawColor(148, 163, 184); // line color
        doc.line(25, y, 90, y); // signature line 1
        doc.line(pageWidth - 90, y, pageWidth - 25, y); // signature line 2
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text("REPRESENTANTE DO RH (EMISSOR)", 25, y + 4);
        doc.text("Sócio / Administrador", 25, y + 8);
        
        doc.text("CIENTE DO COLABORADOR", pageWidth - 90, y + 4);
        doc.text("Assinatura e Data", pageWidth - 90, y + 8);

        // Save PDF with appropriate filename
        const filename = `relatorio_${selectedReport}_${selectedMonth}_2026.pdf`;
        doc.save(filename);
        
        // Success pulse toast
        setPayoutSuccess(true);
        setTimeout(() => setPayoutSuccess(false), 4000);

      } catch (err) {
        console.error(err);
        alert('Falha interna ao desenhar os dados no canvas do jsPDF.');
      } finally {
        setPdfGenerating(false);
      }
    }, 500);
  };

  // --- EXCEL/CSV DYNAMIC EXPORT FUNCTIONALITY (Excel) ---
  const handleExportCSV = () => {
    const filename = `RH_Export_${selectedReport}_${selectedMonth}_2026`;
    let headers: string[] = [];
    let rows: string[][] = [];

    if (selectedReport === 'individual') {
      const emp = employees.find(e => e.id === selectedEmpId);
      headers = ["Data do Log", "Nome", "Cracha", "Entrada 1", "Saida 1", "Entrada 2", "Saida 2", "Horas Trabalhadas", "Horas Extras", "Horas Negativas"];
      if (emp) {
        const empLogs = timeLogs.filter(l => l.employeeId === selectedEmpId && l.date.substring(5, 7) === selectedMonth);
        rows = empLogs.map(l => [
          l.date, emp.name, emp.badgeNum, l.entry1, l.exit1, l.entry2, l.exit2, 
          l.workedHours.toFixed(2), l.overtimeHours.toFixed(2), l.negativeHours.toFixed(2)
        ]);
      }
    } 
    
    else if (selectedReport === 'mensal') {
      headers = ["Cracha", "Nome", "Cargo", "Setor", "Horas Totais", "Horas Extras", "Status"];
      rows = employees.map(emp => {
        const empLogs = timeLogs.filter(l => l.employeeId === emp.id && l.date.substring(5, 7) === selectedMonth);
        const workedSum = empLogs.reduce((sum, l) => sum + l.workedHours, 0);
        const extraSum = empLogs.reduce((sum, l) => sum + l.overtimeHours, 0);
        return [
          emp.badgeNum, emp.name, emp.role, emp.sector, 
          workedSum.toFixed(1), extraSum.toFixed(1), emp.status
        ];
      });
    } 
    
    else if (selectedReport === 'escala_completa') {
      headers = ["Nome Colaborador", "Cargo", "Dia 01", "Dia 02", "Dia 03", "Dia 04", "Dia 05", "Dia 10", "Dia 15", "Dia 20", "Dia 30"];
      rows = employees.map(emp => {
        const sched = schedules.find(s => s.employeeId === emp.id);
        return [
          emp.name, emp.role,
          sched?.days[1] || 'T', sched?.days[2] || 'T', sched?.days[3] || 'T', sched?.days[4] || 'T',
          sched?.days[5] || 'T', sched?.days[10] || 'T', sched?.days[15] || 'T', sched?.days[20] || 'T',
          sched?.days[30] || 'T'
        ];
      });
    } 
    
    else if (selectedReport === 'banco_horas') {
      headers = ["Nome Colaborador", "Cracha", "Creditos (+)", "Debitos (-)", "Saldo Liquido"];
      rows = employees.map(emp => {
        const empLogs = timeLogs.filter(l => l.employeeId === emp.id && l.date.substring(5, 7) === selectedMonth);
        const cr = empLogs.reduce((sum, l) => sum + l.overtimeHours, 0);
        const db = empLogs.reduce((sum, l) => sum + l.negativeHours, 0);
        return [
          emp.name, emp.badgeNum, cr.toFixed(1), db.toFixed(1), (cr - db).toFixed(1)
        ];
      });
    } 
    
    else if (selectedReport === 'horas_extras') {
      headers = ["Nome Colaborador", "Badge", "Horas Extras", "Taxa por Hora", "Payout Previsto BRL"];
      rows = employees.map(emp => {
        const empLogs = timeLogs.filter(l => l.employeeId === emp.id && l.date.substring(5, 7) === selectedMonth);
        const sumOT = empLogs.reduce((sum, l) => sum + l.overtimeHours, 0);
        return [
          emp.name, emp.badgeNum, sumOT.toFixed(1), config.overtimeRate.toFixed(2), (sumOT * config.overtimeRate).toFixed(2)
        ];
      });
    } 
    
    else if (selectedReport === 'ferias') {
      headers = ["Nome", "Data de Inicio", "Data Fim", "Retorno Programado", "Dias Restantes", "Dias Vencidos"];
      rows = vacations.map(v => {
        const emp = employees.find(e => e.id === v.employeeId);
        return [
          emp?.name || '', v.startDate, v.endDate, v.returnDate, v.remainingDays.toString(), v.expiredDays.toString()
        ];
      });
    } 
    
    else if (selectedReport === 'adicional_noturno') {
      headers = ["Nome Colaborador", "Horas de Adicional Noturno", "Taxa Noturna por Hora", "Total Adicional BRL"];
      rows = employees.map(emp => {
        const empLogs = timeLogs.filter(l => l.employeeId === emp.id && l.date.substring(5, 7) === selectedMonth);
        const hours = empLogs.reduce((sum, l) => sum + l.nightHours, 0);
        return [
          emp.name, hours.toFixed(1), config.nightShiftRate.toFixed(2), (hours * config.nightShiftRate).toFixed(2)
        ];
      });
    }

    exportToCSV(filename, headers, rows);
  };

  // --- SYSTEM PRINTER OPTION (Imprimir) ---
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in select-none">
      
      {/* HEADER PORTAL */}
      <div>
        <h2 className="font-sans font-bold text-2xl tracking-tight dark:text-slate-100 text-slate-900 flex items-center gap-2">
          Central de Relatórios Executivos
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Gere, filtre e exporte os espelhos de ponto, folha mensal corporativa e relatórios fiscais em formatos analíticos.
        </p>
      </div>

      {/* POPUP PAYOUT NOTIFICATION SUCCESS TOAST */}
      {payoutSuccess && (
        <div className="p-4 rounded-xl border border-purple-550/20 bg-purple-550/10 text-purple-650 dark:text-purple-300 flex items-center gap-2 text-xs font-semibold animate-zoom-in">
          <CheckCircle2 size={16} className="text-purple-500 animate-bounce" />
          <span>Ficheiro de Relatório PDF gerado e baixado com sucesso! Folha analítica conferida.</span>
        </div>
      )}

      {/* PARAMETERS SELECTION BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PARAMS INPUT CONSOLE */}
        <div className="lg:col-span-1 border dark:border-purple-500/20 border-purple-900/10 rounded-2xl dark:bg-white/5 bg-white/85 backdrop-blur-md p-5 shadow-md space-y-5">
          <h3 className="text-xs font-bold tracking-widest font-mono text-slate-500 uppercase flex items-center gap-1.5">
            <FileText size={14} /> Configurar Relatório
          </h3>

          {/* 1. Report Selector */}
          <div>
            <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold mb-1.5">
              Tipo do Demonstrativo
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as ReportType)}
              className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-205 text-slate-700 text-sm focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="individual">Relatório Individual</option>
              <option value="mensal">Relatório Mensal de Efetivos</option>
              <option value="escala_completa">Escala Completa do Mês</option>
              <option value="banco_horas">Banco de Horas Geral</option>
              <option value="horas_extras">Horas Extras e Custos</option>
              <option value="ferias">Grade de Férias Corporativas</option>
              <option value="adicional_noturno">Cálculo de Adicional Noturno</option>
            </select>
          </div>

          {/* 1.1 Special Employee dropdown if Individual specified */}
          {selectedReport === 'individual' && (
            <div className="animate-fade-in">
              <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold mb-1.5">
                Escolha o Colaborador
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-205 text-slate-700 text-sm focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} (Crachá: #{emp.badgeNum})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 2. Month reference selection */}
          <div className="grid grid-cols-2 gap-3.5 animate-fade-in">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold mb-1.5">
                Mês
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-205 text-slate-700 text-xs focus:outline-none focus:border-purple-500 cursor-pointer font-mono"
              >
                <option value="01">Janeiro (01)</option>
                <option value="02">Fevereiro (02)</option>
                <option value="03">Março (03)</option>
                <option value="04">Abril (04)</option>
                <option value="05">Maio (05)</option>
                <option value="06">Junho (06)</option>
                <option value="07">Julho (07)</option>
                <option value="08">Agosto (08)</option>
                <option value="09">Setembro (09)</option>
                <option value="10">Outubro (10)</option>
                <option value="11">Novembro (11)</option>
                <option value="12">Dezembro (12)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold mb-1.5">
                Ano
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-205 text-slate-700 text-xs focus:outline-none focus:border-purple-500 cursor-pointer font-mono"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t dark:border-purple-500/10 border-purple-900/5 space-y-2.5">
            {/* Action buttons (Pdf / Excel / Print) as requested */}
            <button
              onClick={handleGeneratePDF}
              disabled={pdfGenerating}
              id="btn-report-generate-pdf"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-650 to-indigo-600 hover:from-purple-550 hover:to-indigo-505 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md select-none cursor-pointer disabled:opacity-50"
            >
              <FileCheck size={16} />
              <span>{pdfGenerating ? 'Processando PDF...' : '📄 Gerar PDF'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              id="btn-report-export-excel"
              className="w-full py-3 border dark:border-purple-550/30 border-purple-950/20 hover:bg-purple-500/10 dark:text-purple-300 text-purple-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all select-none cursor-pointer"
            >
              <Download size={14} />
              <span>📊 Exportar para Planilha</span>
            </button>

            <button
              onClick={handlePrint}
              id="btn-report-print"
              className="w-full py-2.5 border border-slate-350 dark:border-slate-800 hover:bg-slate-500/5 text-slate-500 text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer"
            >
              <Printer size={13} />
              <span>🖨 Imprimir Relatório</span>
            </button>
          </div>

        </div>

        {/* MOCK LIVE PREVIEW PANEL DISPLAY */}
        <div className="lg:col-span-2 border dark:border-purple-500/20 border-purple-900/10 rounded-2xl dark:bg-white/5 bg-white shadow-md p-6 flex flex-col justify-between overflow-hidden backdrop-blur-md">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b dark:border-purple-500/15 border-purple-900/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <FileText size={15} />
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-205">Visualização de Amostra</h4>
                  <p className="text-[10px] text-slate-500 font-mono text-purple-400 font-bold uppercase">{selectedReport.replace('_', ' ')} Referência</p>
                </div>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-slate-400">PÁGINA 1/1</span>
            </div>

            {/* PREVIEW CONTAINER BODY TEXT */}
            <div className="p-4 border dark:border-purple-500/5 border-purple-905/5 rounded-xl dark:bg-slate-950/40 bg-zinc-50 font-mono text-xs text-slate-500 h-72 overflow-y-auto space-y-3">
              <p className="text-center font-bold text-slate-700 dark:text-slate-300 border-b dark:border-slate-850 pb-2.5">
                {config.companyName.toUpperCase()}
              </p>
              <p className="font-bold text-purple-400 text-center">{reportNames[selectedReport].toUpperCase()}</p>
              
              <div className="space-y-1.5 pt-2">
                <p>➔ Periodo: {selectedMonth}/{selectedYear}</p>
                <p>➔ Moeda/Formato: Real Brasileiro (BRL) - Grafado</p>
                <p>➔ Responsavel: Administrador Principal do Sistema</p>
                <p>➔ Sincronizado: Base de dados LocalStorage criptografada</p>
              </div>

              <div className="border-t border-dashed dark:border-slate-800 my-4 pt-3 space-y-1 text-[11px] text-slate-400 leading-relaxed select-all">
                {selectedReport === 'individual' && (
                  <>
                    <p>Ficha Individual consolidada de batidas diárias.</p>
                    <p>• João Silva: <strong>140.50 horas trabalhadas</strong> de escala.</p>
                    <p>• Maria Eduarda: <strong>135.00 horas trabalhadas</strong>.</p>
                    <p>• Extra acumulado: <strong>+18.5 horas no saldo positivo.</strong></p>
                  </>
                )}
                {selectedReport === 'mensal' && (
                  <>
                    <p>Relatório sintético de toda a folha corporativa.</p>
                    <p>• Ativos em serviço: <strong>{employees.filter(e => e.status==='active').length} profissionais</strong>.</p>
                    <p>• Em gozo ou licenças: <strong>{employees.filter(e => e.status==='on_vacation').length} férias logadas</strong>.</p>
                  </>
                )}
                {selectedReport === 'escala_completa' && (
                  <>
                    <p>Distribuição do quadro de escala de plantonistas do mês.</p>
                    <p>• Mapeamento de tipos: <strong>T (Dia), N (Noite), F (Folga), V (Férias), A (Atestado).</strong></p>
                  </>
                )}
                {selectedReport === 'horas_extras' && (
                  <>
                    <p>Valoração contábil das horas excedentes à jornada padrão.</p>
                    <p>• Valor extra estipulado: <strong>R$ {config.overtimeRate.toFixed(2)} / hora</strong>.</p>
                    <p>• Projeção de repasse na folha: <strong>R$ {(timeLogs.reduce((s,l)=>s+l.overtimeHours,0) * config.overtimeRate).toLocaleString('pt-BR', {minimumFractionDigits:2})}</strong>.</p>
                  </>
                )}
                {selectedReport === 'banco_horas' && (
                  <>
                    <p>Extrato de horas compensatórias acumulativas.</p>
                    <p>• Total créditos acumulados: <strong>+{timeLogs.reduce((s,l)=> s+l.overtimeHours, 0).toFixed(1)}h positivos.</strong></p>
                    <p>• Total débitos apurados: <strong>-{timeLogs.reduce((s,l)=> s+l.negativeHours, 0).toFixed(1)}h negativos.</strong></p>
                  </>
                )}
                {selectedReport === 'ferias' && (
                  <>
                    <p>Próximas programações de gozo anual previstas.</p>
                  </>
                )}
                {selectedReport === 'adicional_noturno' && (
                  <>
                    <p>Cálculo de hora noturna (das 22:00 às 05:00) faturada.</p>
                    <p>• Valor sênior estipulado: <strong>R$ {config.nightShiftRate.toFixed(2)} / hora</strong>.</p>
                    <p>• Total acumulado provocado: <strong>{timeLogs.reduce((s,l)=> s+l.nightHours, 0).toFixed(1)}h</strong>.</p>
                  </>
                )}
              </div>
            </div>

            {/* Informational help card */}
            <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl text-[10px] text-slate-550 flex items-center gap-2 mt-4.5 text-slate-400 font-sans">
              <AlertCircle size={14} className="text-purple-400" />
              <span>Ao pressionar os botões de ação do painel esquerdo, o sistema compila de forma offline a matriz correspondente de dados e aciona o download automático.</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
