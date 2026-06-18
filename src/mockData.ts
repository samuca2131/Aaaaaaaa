/**
 * Initial mock data for RH Manager Pro
 */

import { Employee, MonthSchedule, TimeLog, Vacation, SystemConfig, ScheduleType } from './types';
import { calculateShiftMetrics } from './utils';

export const INITIAL_CONFIG: SystemConfig = {
  companyName: "RH Manager Pro Ltda",
  companyLogo: "", // default avatar logo
  standardWorkday: 8,
  overtimeRate: 35.50, // R$ per extra hour
  nightShiftRate: 45.00, // R$ per night hour (or premium)
  defaultTheme: "dark",
  autoBackup: true
};

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "emp_1",
    badgeNum: "1001",
    name: "João Silva de Souza",
    cpf: "123.456.789-01",
    phone: "(11) 98765-4321",
    email: "joao.silva@empresa.com.br",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    role: "Analista de Sistemas Pleno",
    sector: "Tecnologia de Informação",
    admissionDate: "2023-03-15",
    transportType: "vp",
    vehicleDetails: {
      model: "Honda Civic G10",
      plate: "ABC-1C23",
      color: "Cinza Metálico"
    },
    status: "active"
  },
  {
    id: "emp_2",
    badgeNum: "1002",
    name: "Maria Eduarda Santos",
    cpf: "234.567.890-12",
    phone: "(21) 99888-7766",
    email: "maria.santos@empresa.com.br",
    address: "Rua Copacabana, 450 - Rio de Janeiro - RJ",
    role: "Coordenadora de Recursos Humanos",
    sector: "Recursos Humanos",
    admissionDate: "2021-06-01",
    transportType: "vt",
    status: "active"
  },
  {
    id: "emp_3",
    badgeNum: "1003",
    name: "Pedro Alves de Oliveira",
    cpf: "345.678.901-23",
    phone: "(11) 97766-5544",
    email: "pedro.oliveira@empresa.com.br",
    address: "Rua Augusta, 1800 - Consolação, São Paulo - SP",
    role: "Técnico de Suporte TI",
    sector: "Suporte Técnico",
    admissionDate: "2024-01-10",
    transportType: "vp",
    vehicleDetails: {
      model: "Yamaha Fazer 250",
      plate: "XYZ-9A88",
      color: "Preto Fosco"
    },
    status: "on_vacation"
  },
  {
    id: "emp_4",
    badgeNum: "1004",
    name: "Ana Beatriz Souza Cruz",
    cpf: "456.789.012-34",
    phone: "(31) 98844-3322",
    email: "ana.souza@empresa.com.br",
    address: "Av. Afonso Pena, 2500 - Belo Horizonte - MG",
    role: "Operadora de Logística",
    sector: "Operações",
    admissionDate: "2022-10-20",
    transportType: "vt",
    status: "active"
  },
  {
    id: "emp_5",
    badgeNum: "1005",
    name: "Marcos Vinicius Costa",
    cpf: "567.890.123-45",
    phone: "(11) 96543-2109",
    email: "marcos.costa@empresa.com.br",
    address: "Rua Pamplona, 920 - Jardim Paulista, São Paulo - SP",
    role: "Segurança de Data Center",
    sector: "Segurança",
    admissionDate: "2023-08-01",
    transportType: "vp",
    vehicleDetails: {
      model: "VW Gol",
      plate: "MKL-4D12",
      color: "Branco"
    },
    status: "active" // Works mostly night shift
  },
  {
    id: "emp_6",
    badgeNum: "1006",
    name: "Julia Ribeiro Pereira",
    cpf: "678.901.234-56",
    phone: "(11) 95432-1098",
    email: "julia.pereira@empresa.com.br",
    address: "Rua Vergueiro, 3050 - Vila Mariana, São Paulo - SP",
    role: "Analista de Marketing Jr",
    sector: "Vendas e Marketing",
    admissionDate: "2024-04-15",
    transportType: "vt",
    status: "active"
  },
  {
    id: "emp_7",
    badgeNum: "1007",
    name: "Carlos Eduardo Rodrigues",
    cpf: "789.012.345-67",
    phone: "(81) 94321-0987",
    email: "carlos.rodrigues@empresa.com.br",
    address: "Av. Boa Viagem, 1200 - Recife - PE",
    role: "Supervisor de Almoxarifado",
    sector: "Operações",
    admissionDate: "2020-02-10",
    transportType: "vp",
    vehicleDetails: {
      model: "Fiat Toro",
      plate: "PEE-8H45",
      color: "Verde Militar"
    },
    status: "away" // Away with medical certificate
  },
  {
    id: "emp_8",
    badgeNum: "1008",
    name: "Beatriz Helena Martins",
    cpf: "890.123.456-78",
    phone: "(11) 93210-9876",
    email: "beatriz.martins@empresa.com.br",
    address: "Rua Frei Caneca, 140 - Consolação, São Paulo - SP",
    role: "Analista de Atendimento Sênior",
    sector: "Atendimento ao Cliente",
    admissionDate: "2019-11-25",
    transportType: "vt",
    status: "active"
  },
  {
    id: "emp_9",
    badgeNum: "1009",
    name: "Lucas Gabriel Ferreira",
    cpf: "901.234.567-89",
    phone: "(11) 92109-8765",
    email: "lucas.ferreira@empresa.com.br",
    address: "Av. Sumaré, 800 - Perdizes, São Paulo - SP",
    role: "Arquiteto de Software",
    sector: "Tecnologia de Informação",
    admissionDate: "2018-05-15",
    transportType: "vp",
    vehicleDetails: {
      model: "Toyota Corolla",
      plate: "TOY-1A09",
      color: "Prata"
    },
    status: "active" // Works lots of overtime
  },
  {
    id: "emp_10",
    badgeNum: "1010",
    name: "Fernanda Luiza Lima",
    cpf: "012.345.678-90",
    phone: "(11) 91098-7654",
    email: "fernanda.lima@empresa.com.br",
    address: "Rua Domingos de Morais, 1200 - Vila Mariana, São Paulo - SP",
    role: "Auxiliar Administrativo",
    sector: "Administrativo",
    admissionDate: "2024-05-02",
    transportType: "vt",
    status: "active"
  }
];

// In June 2026, let's designate schedules (30 days total)
// Helper to know day of week in June 2026
// June 1st, 2026 is a MONDAY
function getDayOfWeekInJune2026(day: number): number {
  // 1 is Monday, ..., 6 is Saturday, 0 is Sunday
  return (day % 7) === 0 ? 0 : (day % 7); // June 1st is Mon (1), June 7th is Sun (0)
}

export function generateMockSchedules(): MonthSchedule[] {
  const year = 2026;
  const month = 6; // June
  const schedules: MonthSchedule[] = [];

  INITIAL_EMPLOYEES.forEach((emp) => {
    const days: Record<number, ScheduleType> = {};
    
    for (let day = 1; day <= 30; day++) {
      const dayOfWeek = getDayOfWeekInJune2026(day);
      
      // Default pattern: Weekends are off (F) unless exceptional
      if (dayOfWeek === 6 || dayOfWeek === 0) {
        days[day] = 'F';
      } else {
        // Weekdays:
        if (emp.status === 'on_vacation') {
          // Vacation code (V)
          days[day] = 'V';
        } else if (emp.status === 'away') {
          // Atestado (A)
          days[day] = 'A';
        } else if (emp.id === 'emp_5') {
          // Seguridad, mostly Night Shifts (N)
          days[day] = 'N';
        } else if (emp.id === 'emp_9' && (day % 5 === 2 || day % 5 === 4)) {
          // Arquiteto de Software on Overtime some weekdays
          days[day] = 'HE';
        } else if (emp.id === 'emp_6' && day === 15) {
          // Junior took a sick day/absence
          days[day] = 'FA';
        } else {
          days[day] = 'T'; // Ordinary Workday
        }
      }
    }
    schedules.push({ employeeId: emp.id, year, month, days });
  });

  return schedules;
}

export const INITIAL_VACATIONS: Vacation[] = [
  {
    id: "vac_1",
    employeeId: "emp_3", // Pedro Alves de Oliveira
    startDate: "2026-06-08",
    endDate: "2026-07-07",
    returnDate: "2026-07-08",
    remainingDays: 14,
    expiredDays: 0,
    notes: "Férias anuais regulares referentes ao período de 2024."
  },
  {
    id: "vac_2",
    employeeId: "emp_2", // Maria
    startDate: "2026-02-01",
    endDate: "2026-02-15",
    returnDate: "2026-02-16",
    remainingDays: 15,
    expiredDays: 5,
    notes: "Gozo de metade do período aquisitivo de 2022/2023."
  }
];

/**
 * Generates initial realistic time logs from June 1st to June 17th, 2026.
 */
export function generateMockTimeLogs(employees: Employee[], schedules: MonthSchedule[]): TimeLog[] {
  const logs: TimeLog[] = [];
  let logIdCounter = 1;

  // We operate from day 1 to day 17 of June 2026
  for (let day = 1; day <= 17; day++) {
    const dateStr = `2026-06-${String(day).padStart(2, '0')}`;
    
    employees.forEach((emp) => {
      // Find employee schedule for this month
      const sched = schedules.find(s => s.employeeId === emp.id);
      if (!sched) return;
      
      const type = sched.days[day];

      // No log for weekend off days
      if (type === 'F') return;
      if (type === 'V') return; // Vacation means no punches
      if (type === 'A') return; // Sick leave means no punches
      if (type === 'FA') return; // Unexcused absence means empty punches or no punches

      // Prepare punches based on type
      let entry1 = "08:00";
      let exit1 = "12:00";
      let entry2 = "13:00";
      let exit2 = "18:00";

      // Introduce human-like minute variance (-10min to +10min) to make it real
      const seed = (emp.badgeNum.charCodeAt(0) + day) % 20 - 10; // predictable human randomness
      const formatTimeWithDiff = (baseHour: number, baseMin: number, diff: number) => {
        let totalMin = baseHour * 60 + baseMin + diff;
        if (totalMin < 0) totalMin += 1440;
        const h = Math.floor(totalMin / 60) % 24;
        const m = Math.floor(totalMin % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      };

      if (type === 'T') {
        entry1 = formatTimeWithDiff(8, 0, seed);
        exit1 = formatTimeWithDiff(12, 0, seed > 0 ? seed - 2 : seed + 1);
        entry2 = formatTimeWithDiff(13, 0, seed < 0 ? seed + 3 : seed - 1);
        exit2 = formatTimeWithDiff(18, 0, seed + 2);
      } else if (type === 'HE') {
        // Overtime Day
        entry1 = "08:00";
        exit1 = "12:00";
        entry2 = "13:00";
        exit2 = "20:00"; // 2h OT
      } else if (type === 'N') {
        // Night Shift
        // 22:00 to 02:00 and 03:00 to 05:00
        entry1 = "22:00";
        exit1 = "02:00";
        entry2 = "03:00";
        exit2 = "05:00";
      }

      // Calculate complete metrics
      const metrics = calculateShiftMetrics(entry1, exit1, entry2, exit2, INITIAL_CONFIG.standardWorkday);

      logs.push({
        id: `log_${logIdCounter++}`,
        employeeId: emp.id,
        date: dateStr,
        entry1,
        exit1,
        entry2,
        exit2,
        workedHours: metrics.workedHours,
        overtimeHours: metrics.overtimeHours,
        negativeHours: metrics.negativeHours,
        nightHours: metrics.nightHours
      });
    });
  }

  return logs;
}
