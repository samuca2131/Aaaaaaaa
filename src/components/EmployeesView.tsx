import React from 'react';
import {
  Plus,
  Search,
  UserPlus,
  Trash2,
  Edit,
  Eye,
  X,
  User,
  MapPin,
  Mail,
  Phone,
  FileBadge,
  TrendingUp,
  Briefcase,
  AlertCircle,
  Car
} from 'lucide-react';
import { Employee, TransportType, EmployeeStatus } from '../types';
import { formatCPF, formatPhone } from '../utils';

interface EmployeesViewProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  theme: 'dark' | 'light';
}

export default function EmployeesView({ employees, setEmployees, theme }: EmployeesViewProps) {
  const isDark = theme === 'dark';

  // State Management
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterSector, setFilterSector] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('');

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null);
  
  // Detailed Inspector Modal
  const [inspectingEmployee, setInspectingEmployee] = React.useState<Employee | null>(null);

  // Form Field States
  const [badgeNum, setBadgeNum] = React.useState('');
  const [name, setName] = React.useState('');
  const [cpf, setCpf] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [role, setRole] = React.useState('');
  const [sector, setSector] = React.useState('');
  const [admissionDate, setAdmissionDate] = React.useState('');
  const [transportType, setTransportType] = React.useState<TransportType>('vt');
  const [status, setStatus] = React.useState<EmployeeStatus>('active');

  // Vehicular specs
  const [vehicleModel, setVehicleModel] = React.useState('');
  const [vehiclePlate, setVehiclePlate] = React.useState('');
  const [vehicleColor, setVehicleColor] = React.useState('');

  const [formValidationError, setFormValidationError] = React.useState('');

  // Extract unique sectors lists for search filtering
  const sectors = Array.from(new Set(employees.map(e => e.sector))).filter(Boolean);

  // Filter Employees List
  const filteredEmployees = employees.filter((emp) => {
    const text = searchTerm.toLowerCase();
    const matchText = 
      emp.name.toLowerCase().includes(text) ||
      emp.badgeNum.includes(text) ||
      emp.cpf.includes(text) ||
      emp.role.toLowerCase().includes(text);
    
    const matchSector = !filterSector || emp.sector === filterSector;
    const matchStatus = !filterStatus || emp.status === filterStatus;

    return matchText && matchSector && matchStatus;
  });

  // Handle slide Drawer toggle
  const openAddForm = () => {
    setEditingEmployee(null);
    setFormValidationError('');
    // clear fields
    setBadgeNum('');
    setName('');
    setCpf('');
    setPhone('');
    setEmail('');
    setAddress('');
    setRole('');
    setSector('');
    setAdmissionDate('');
    setTransportType('vt');
    setStatus('active');
    setVehicleModel('');
    setVehiclePlate('');
    setVehicleColor('');
    setIsFormOpen(true);
  };

  const openEditForm = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEmployee(emp);
    setFormValidationError('');
    
    setBadgeNum(emp.badgeNum);
    setName(emp.name);
    setCpf(emp.cpf);
    setPhone(emp.phone);
    setEmail(emp.email);
    setAddress(emp.address);
    setRole(emp.role);
    setSector(emp.sector);
    setAdmissionDate(emp.admissionDate);
    setTransportType(emp.transportType);
    setStatus(emp.status);
    
    if (emp.transportType === 'vp' && emp.vehicleDetails) {
      setVehicleModel(emp.vehicleDetails.model);
      setVehiclePlate(emp.vehicleDetails.plate);
      setVehicleColor(emp.vehicleDetails.color);
    } else {
      setVehicleModel('');
      setVehiclePlate('');
      setVehicleColor('');
    }
    setIsFormOpen(true);
  };

  // Safe deletion handler
  const handleDelete = (empId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este funcionário e todos os seus registros associados?")) {
      setEmployees(prev => prev.filter(emp => emp.id !== empId));
      if (inspectingEmployee?.id === empId) {
        setInspectingEmployee(null);
      }
    }
  };

  // Save changes
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationError('');

    // Verification
    if (!badgeNum || !name || !cpf || !phone || !email || !address || !role || !sector || !admissionDate) {
      setFormValidationError('Preencha todos os campos obrigatórios marcados com *');
      return;
    }

    // Check Badge duplications
    const checkBadge = employees.find(e => e.badgeNum === badgeNum && (!editingEmployee || e.id !== editingEmployee.id));
    if (checkBadge) {
      setFormValidationError(`O crachá nº ${badgeNum} já está cadastrado para outro funcionário.`);
      return;
    }

    const employeeData: Employee = {
      id: editingEmployee ? editingEmployee.id : `emp_${Date.now()}`,
      badgeNum,
      name,
      cpf,
      phone,
      email,
      address,
      role,
      sector,
      admissionDate,
      transportType,
      status,
      photoUrl: editingEmployee?.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      ...(transportType === 'vp' ? {
        vehicleDetails: {
          model: vehicleModel,
          plate: vehiclePlate,
          color: vehicleColor
        }
      } : {})
    };

    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? employeeData : emp));
    } else {
      setEmployees(prev => [...prev, employeeData]);
    }

    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-bold text-2xl tracking-tight dark:text-slate-100 text-slate-900 flex items-center gap-2">
            Quadro de Funcionários
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Cadastre, edite e acompanhe os dados dos colaboradores ativos e licenciados do seu RH.
          </p>
        </div>
        <button
          onClick={openAddForm}
          id="btn-add-employee"
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm px-5 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.35)] cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Cadastrar Funcionário</span>
        </button>
      </div>

      {/* FILTER SEARCH PANEL */}
      <div className="border dark:border-purple-500/20 border-purple-900/10 rounded-2xl dark:bg-white/5 bg-white/85 backdrop-blur-md p-5 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-md">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por nome, crachá, CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900/40 bg-zinc-50 dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Sector Filter */}
        <div>
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900/40 bg-zinc-50 dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="">Filtrar por Setor (Todos)</option>
            {sectors.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900/40 bg-zinc-50 dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="">Filtrar por Status (Todos)</option>
            <option value="active">Ativo</option>
            <option value="on_vacation">Em Férias</option>
            <option value="away">Afastado</option>
          </select>
        </div>
      </div>

      {/* DETAILED EMPLOYEES GRID/TABLE LIST */}
      <div className="border dark:border-purple-500/20 border-purple-900/10 rounded-2xl dark:bg-white/5 bg-white shadow-md overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          {filteredEmployees.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <User size={48} className="mx-auto text-purple-500/30 mb-4" />
              <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">Nenhum funcionário encontrado</p>
              <p className="text-xs mt-1">Tente ajustar seus filtros de busca ou cadastre um novo colaborador.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b dark:border-purple-500/15 border-purple-900/10 text-xs font-mono tracking-wider dark:text-slate-400 text-slate-500 bg-slate-50 dark:bg-slate-950/30">
                  <th className="py-4 px-6 font-bold">Crachá</th>
                  <th className="py-4 px-6 font-bold">Colaborador</th>
                  <th className="py-4 px-6 font-bold">Cargo / Setor</th>
                  <th className="py-4 px-6 font-bold">Transporte</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-purple-500/10 divide-purple-900/5 text-sm dark:text-slate-300 text-slate-600">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => setInspectingEmployee(emp)}
                    className="hover:bg-purple-500/5 transition-all cursor-pointer group"
                    id={`employee-row-${emp.id}`}
                  >
                    {/* Badge */}
                    <td className="py-4 px-6 font-mono font-bold text-purple-500 select-all">
                      #{emp.badgeNum}
                    </td>

                    {/* Name Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.photoUrl}
                          referrerPolicy="no-referrer"
                          alt={emp.name}
                          className="w-10 h-10 rounded-full border border-purple-500/20 object-cover"
                        />
                        <div>
                          <p className="font-semibold dark:text-slate-200 text-slate-800 select-all group-hover:text-purple-400 transition-colors">
                            {emp.name}
                          </p>
                          <p className="text-xs text-slate-400 select-all">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Job Details */}
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-300">{emp.role}</p>
                        <p className="text-xs text-slate-500">{emp.sector}</p>
                      </div>
                    </td>

                    {/* Transportation Info */}
                    <td className="py-4 px-6">
                      {emp.transportType === 'vt' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          Vale Transp.
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-purple-500/10 text-purple-400">
                          <Car size={12} /> Veículo Próprio
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {emp.status === 'active' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          Ativo
                        </span>
                      )}
                      {emp.status === 'on_vacation' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                          Em Férias
                        </span>
                      )}
                      {emp.status === 'away' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Afastado
                        </span>
                      )}
                    </td>

                    {/* Operations */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setInspectingEmployee(emp)}
                          className="p-1.5 text-slate-400 hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-all"
                          title="Inspecionar"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => openEditForm(emp, e)}
                          className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(emp.id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================= EDIT / CREATE SIDE OVER DRAWER ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsFormOpen(false)}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          />
          
          {/* Drawer Body */}
          <form
            onSubmit={handleSaveEmployee}
            className="relative w-full max-w-xl h-full bg-slate-900 border-l border-purple-550/20 dark:bg-[#0B001A] bg-zinc-50 dark:border-purple-500/20 border-purple-900/15 shadow-2xl flex flex-col z-10 animate-slide-in overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b dark:border-purple-500/15 border-purple-900/10 flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {editingEmployee ? 'Editar Dados' : 'Novo Funcionário'}
                </h3>
                <p className="text-xs text-slate-500">
                  Preencha cuidadosamente todas as credenciais cadastrais corporativas.
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

            {/* Validation Message */}
            {formValidationError && (
              <div className="m-6 mb-0 p-4 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{formValidationError}</span>
              </div>
            )}

            {/* Form Fields container */}
            <div className="flex-1 p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Badge ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                    Número do Crachá *
                  </label>
                  <input
                    type="text"
                    required
                    value={badgeNum}
                    onChange={(e) => setBadgeNum(e.target.value.replace(/\D/g, ''))}
                    placeholder="1011"
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Admission Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                    Data de Admissão *
                  </label>
                  <input
                    type="date"
                    required
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do colaborador"
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* CPF */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                    CPF *
                  </label>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                  Endereço de E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@empresa.com.br"
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                  Endereço Completo *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Analista de RH Sênior"
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                    Setor *
                  </label>
                  <input
                    type="text"
                    required
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="Recursos Humanos"
                    className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Current Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-350 mb-1.5">
                  Status Inicial / Contratual
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                  className="w-full px-4 py-2.5 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-900 bg-white dark:text-slate-200 text-slate-700 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="active">Ativo</option>
                  <option value="on_vacation">Em Férias</option>
                  <option value="away">Afastado (Médico)</option>
                </select>
              </div>

              {/* TRANSPORTATION CHOICE - RADIO BUTTONS AS REQUESTED */}
              <div className="border border-purple-500/10 rounded-xl p-4.5 dark:bg-purple-950/10 bg-zinc-100">
                <span className="block text-xs font-bold text-indigo-505 dark:text-purple-400 mb-3.5 uppercase tracking-wider font-mono">
                  Opções de Transporte / Locomoção *
                </span>
                
                <div className="flex flex-col sm:flex-row gap-6 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm dark:text-slate-300 text-slate-700 font-medium">
                    <input
                      type="radio"
                      name="transportType"
                      checked={transportType === 'vt'}
                      onChange={() => setTransportType('vt')}
                      className="accent-purple-600 w-4 h-4"
                    />
                    <span>Vale Transporte</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-sm dark:text-slate-300 text-slate-700 font-medium">
                    <input
                      type="radio"
                      name="transportType"
                      checked={transportType === 'vp'}
                      onChange={() => setTransportType('vp')}
                      className="accent-purple-600 w-4 h-4"
                    />
                    <span>Veículo Próprio</span>
                  </label>
                </div>

                {/* Additional vehicular specs if veiculo proprio selected */}
                {transportType === 'vp' && (
                  <div className="space-y-4 pt-3 border-t border-purple-500/10 animate-fade-in">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Modelo do Veículo *
                      </label>
                      <input
                        type="text"
                        required={transportType === 'vp'}
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        placeholder="Ex: Chevrolet Onix LTZ"
                        className="w-full px-3.5 py-2 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-950 bg-white dark:text-slate-200 text-slate-700 text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Placa do Veículo *
                        </label>
                        <input
                          type="text"
                          required={transportType === 'vp'}
                          value={vehiclePlate}
                          onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                          placeholder="ABC-1234"
                          className="w-full px-3.5 py-2 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-950 bg-white dark:text-slate-200 text-slate-700 text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Cor *
                        </label>
                        <input
                          type="text"
                          required={transportType === 'vp'}
                          value={vehicleColor}
                          onChange={(e) => setVehicleColor(e.target.value)}
                          placeholder="Dourado"
                          className="w-full px-3.5 py-2 rounded-xl border dark:border-purple-500/15 border-purple-900/10 dark:bg-slate-950 bg-white dark:text-slate-200 text-slate-700 text-xs focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Footer buttons */}
            <div className="p-6 border-t dark:border-purple-500/15 border-purple-900/10 flex justify-end gap-3.5 bg-slate-950/30">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 rounded-xl border dark:border-slate-700 border-slate-300 dark:text-slate-350 text-slate-600 text-sm hover:bg-slate-500/10 transition-all select-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="drawer-save-employee-btn"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-md select-none cursor-pointer"
              >
                {editingEmployee ? 'Salvar Alterações' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= DETAILED INSPECTION MODAL ================= */}
      {inspectingEmployee && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div
            onClick={() => setInspectingEmployee(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-2xl dark:bg-slate-950 bg-white border dark:border-purple-500/25 border-purple-900/15 rounded-2xl shadow-2xl overflow-hidden animate-zoom-in z-10 p-6 max-h-[90vh] overflow-y-auto">
            {/* Header info */}
            <div className="flex items-start justify-between pb-6 border-b dark:border-purple-500/15 border-purple-900/10">
              <div className="flex items-center gap-4">
                <img
                  src={inspectingEmployee.photoUrl}
                  referrerPolicy="no-referrer"
                  alt={inspectingEmployee.name}
                  className="w-14 h-14 rounded-full border border-purple-500/20 object-cover"
                />
                <div>
                  <h3 className="font-sans font-bold text-lg text-slate-900 dark:text-slate-150">
                    {inspectingEmployee.name}
                  </h3>
                  <span className="font-mono text-xs text-purple-400 font-bold uppercase">
                    CRACHÁ #{inspectingEmployee.badgeNum} • {inspectingEmployee.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingEmployee(null)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content body info */}
            <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm dark:text-slate-350 text-slate-650">
              
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <User className="text-purple-400" size={16} />
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">CPF</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200 select-all">{inspectingEmployee.cpf}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <Phone className="text-purple-400" size={16} />
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Telefone</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200 select-all">{inspectingEmployee.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <Mail className="text-purple-400" size={16} />
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">E-mail</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200 select-all">{inspectingEmployee.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <MapPin className="text-purple-400" size={16} />
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Endereço Residencial</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200 select-all">{inspectingEmployee.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <Briefcase className="text-purple-400" size={16} />
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Setor / Departamento</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{inspectingEmployee.sector}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <FileBadge className="text-purple-400" size={16} />
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Data de Contratação</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {new Date(inspectingEmployee.admissionDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Transport/Vehicle specific metrics */}
            <div className="p-4.5 border dark:border-purple-500/15 border-purple-900/10 rounded-xl dark:bg-purple-950/10 bg-zinc-50 flex flex-col sm:flex-row items-start sm:items-center gap-4.5">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <Car size={20} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">Modalidade de Transporte</span>
                {inspectingEmployee.transportType === 'vt' ? (
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                    Vale Transporte (VT) faturado mensalmente pelo RH.
                  </p>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                      Veículo Próprio (Estacionamento Privado Sincronizado)
                    </p>
                    <div className="mt-1.5 flex gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <span>Modelo: <strong className="text-slate-700 dark:text-slate-200">{inspectingEmployee.vehicleDetails?.model}</strong></span>
                      <span>Placa: <strong className="text-slate-700 dark:text-slate-200">{inspectingEmployee.vehicleDetails?.plate}</strong></span>
                      <span>Cor: <strong className="text-slate-700 dark:text-slate-200">{inspectingEmployee.vehicleDetails?.color}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Operations on Modal */}
            <div className="mt-6 pt-6 border-t dark:border-purple-500/15 border-purple-900/10 flex justify-end gap-3.5">
              <button
                onClick={(e) => {
                  setInspectingEmployee(null);
                  openEditForm(inspectingEmployee, e);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border dark:border-purple-500/30 border-purple-950/20 dark:text-purple-300 text-purple-650 text-xs font-semibold hover:bg-purple-500/10 transition-all select-none cursor-pointer"
              >
                <Edit size={14} />
                <span>Editar Informações</span>
              </button>
              <button
                onClick={() => setInspectingEmployee(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs select-none"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
