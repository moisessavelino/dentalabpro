
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import JobManager from './components/JobManager';
import DentistManager from './components/DentistManager';
import ServiceManager from './components/ServiceManager';
import FinancialManager from './components/FinancialManager';
import AiAssistant from './components/AiAssistant';
import MasterArea from './components/MasterArea';
import { LabJob, User, Dentist, Service, Expense } from './types';
import { Lock, LogIn, Building, Globe, Mail, Instagram, Linkedin, Youtube, Facebook, Construction, Info, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const MOCK_SERVICES: Service[] = [
  { id: 's1', name: 'Coroa Zircônia', material: 'Zircônia Pre-Shaded', salePrice: 450, quantity: 45, estimatedDays: 7 },
  { id: 's2', name: 'Inlay E-Max', material: 'Dissilicato de Lítio', salePrice: 380, quantity: 12, estimatedDays: 5 },
  { id: 's3', name: 'Protocolo Acrílico', material: 'Acrílico Ivoclar + Titânio', salePrice: 3500, quantity: 4, estimatedDays: 15 },
  { id: 's4', name: 'Placa Miorrelaxante', material: 'Resina Termo', salePrice: 180, quantity: 22, estimatedDays: 3 },
];

const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', description: 'Aluguel Sala 302', category: 'Fixo', value: 1200, dueDate: '2024-06-10', isPaid: false },
  { id: 'e2', description: 'Resina Ivoclar', category: 'Insumos', value: 340, dueDate: '2024-05-25', isPaid: false },
  { id: 'e3', description: 'Energia Elétrica', category: 'Utilidades', value: 215, dueDate: '2024-06-05', isPaid: false },
];

const MOCK_JOBS: LabJob[] = [
  { id: '1', dentistId: 'd1', dentistName: 'Dr. Roberto Santos', patientName: 'Ana Clara Silva', type: 'Coroa Zircônia', material: 'Zircônia Pre-Shaded', shade: 'A1', status: 'EM_PRODUCAO', paymentStatus: 'PENDENTE', entryDate: '2024-05-15', deliveryDate: '2024-05-24', value: 450, quantity: 1, selectedTeeth: [11, 21] },
  { id: '2', dentistId: 'd2', dentistName: 'Dra. Marina Costa', patientName: 'João Pedro Alves', type: 'Inlay E-Max', material: 'Dissilicato de Lítio', shade: 'A2', status: 'RECEBIDO', paymentStatus: 'PENDENTE', entryDate: '2024-05-18', deliveryDate: '2024-05-27', value: 380, quantity: 1, selectedTeeth: [46] },
  { id: '3', dentistId: 'd1', dentistName: 'Dr. Roberto Santos', patientName: 'Carlos Eduardo', type: 'Protocolo Superior', material: 'Acrílico + Titânio', shade: 'B1', status: 'AGUARDANDO_PROVA', paymentStatus: 'PAGO', entryDate: '2024-05-10', deliveryDate: '2024-05-21', value: 4500, quantity: 1, selectedTeeth: [11, 12, 13, 21, 22, 23] },
];

const MOCK_DENTISTS: Dentist[] = [
  { id: 'd1', name: 'Dr. Roberto Santos', clinic: 'Sorriso Real', phone: '(11) 98888-7777', cro: 'SP-12345', email: 'roberto@dentista.com', document: '123.456.789-00', address: 'Av. Paulista, 1000 - SP' },
  { id: 'd2', name: 'Dra. Marina Costa', clinic: 'Odonto Excellence', phone: '(11) 97777-6666', cro: 'MG-67890', email: 'marina@excellence.com', document: '456.789.123-11', address: 'Rua das Flores, 45 - BH' },
  { id: 'd3', name: 'Dr. Ricardo Lima', clinic: 'Oral Clinic', phone: '(11) 96666-5555', cro: 'BA-11223', email: 'ricardo@oral.com', document: '12.345.678/0001-99', address: 'Centro Empresarial, Sala 12 - Salvador' },
];

const MOCK_USERS: User[] = [
  { id: 'u1', username: 'admin', password: '1011', role: 'ADMIN', isActive: true },
  { id: 'u2', username: 'tecnico', password: '123', role: 'TECNICO', isActive: true },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState<LabJob[]>(MOCK_JOBS);
  const [dentists, setDentists] = useState<Dentist[]>(MOCK_DENTISTS);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ 
    labCode: 'LAB-2024', 
    username: '', 
    password: '' 
  });

  // Persistência de Sessão
  useEffect(() => {
    const savedUser = localStorage.getItem('dentalab_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Verifica se o usuário ainda existe e está ativo na lista de MOCK_USERS (ou estado local)
        const validUser = users.find(u => u.id === parsedUser.id && u.isActive);
        if (validUser) {
          setCurrentUser(validUser);
        } else {
          localStorage.removeItem('dentalab_user');
        }
      } catch (e) {
        localStorage.removeItem('dentalab_user');
      }
    }
  }, [users]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    // Simulação de delay de rede para "Ativar o Sistema"
    setTimeout(() => {
      const foundUser = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
      
      if (foundUser) {
        if (foundUser.isActive) {
          setCurrentUser(foundUser);
          localStorage.setItem('dentalab_user', JSON.stringify(foundUser));
        } else {
          setLoginError('Sua conta está desativada. Entre em contato com a administração.');
        }
      } else {
        setLoginError('Credenciais inválidas! Verifique usuário e senha.');
      }
      setIsLoggingIn(false);
    }, 800);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dentalab_user');
    setActiveTab('dashboard');
  };

  const handleAddJob = (jobData: Partial<LabJob>) => {
    const newJob: LabJob = {
      ...jobData as LabJob,
      id: Math.random().toString(36).substr(2, 9),
      paymentStatus: 'PENDENTE',
      quantity: jobData.quantity || 1
    };
    setJobs([newJob, ...jobs]);
  };

  const handleUpdateJob = (updatedJob: LabJob) => {
    setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  const handleDeleteJob = (id: string) => {
    setJobs(jobs.filter(j => j.id !== id));
  };

  const handleAddService = (serviceData: Partial<Service>) => {
    const newS: Service = {
      ...serviceData as Service,
      id: 's' + Math.random().toString(36).substr(2, 5),
    };
    setServices([...services, newS]);
  };

  const handleUpdateService = (updatedService: Service) => {
    setServices(services.map(s => s.id === updatedService.id ? updatedService : s));
  };

  const onDeleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleAddDentist = (dentistData: Partial<Dentist>) => {
    const newDentist: Dentist = {
      ...dentistData as Dentist,
      id: 'd' + Math.random().toString(36).substr(2, 5),
    };
    setDentists([newDentist, ...dentists]);
  };

  const handleUpdateDentist = (updatedDentist: Dentist) => {
    setDentists(dentists.map(d => d.id === updatedDentist.id ? updatedDentist : d));
  };

  const handleDeleteDentist = (id: string) => {
    setDentists(dentists.filter(d => d.id !== id));
  };

  const handleAddUser = (userData: Partial<User>) => {
    const newUser: User = {
      ...userData as User,
      id: 'u' + Math.random().toString(36).substr(2, 5),
      isActive: true
    };
    setUsers([...users, newUser]);
  };

  const handleToggleUserStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id && u.username !== 'admin') {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    }));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 md:p-10 font-sans">
        <div className="bg-white w-full max-w-6xl min-h-[650px] rounded-none md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white">
          <div className="w-full md:w-[45%] bg-[#0a3d62] p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-cyan-500 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black italic text-2xl">D</div>
                <h1 className="text-2xl font-black text-white tracking-tighter">DentaLab<span className="text-cyan-400">Pro</span></h1>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white leading-tight">Gestão Inteligente.</h2>
                <p className="text-slate-400 text-lg max-w-sm">Simplifique seu fluxo de trabalho.</p>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-2 text-cyan-400/60 text-[10px] font-black uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              Sistema Operacional v3.1
            </div>
          </div>
          <div className="flex-1 bg-white p-10 md:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h3 className="text-4xl font-black text-slate-800 mb-2 tracking-tighter">Entrar</h3>
              <p className="text-slate-400 font-medium mb-10">Insira suas credenciais para acessar o painel.</p>
              
              <form onSubmit={handleLogin} className="space-y-6">
                {loginError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-4">
                    <AlertCircle size={20} />
                    {loginError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Usuário</label>
                  <input 
                    type="text" 
                    autoComplete="username"
                    required
                    disabled={isLoggingIn}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-bold"
                    value={loginForm.username}
                    onChange={(e) => {
                      setLoginForm({...loginForm, username: e.target.value});
                      if(loginError) setLoginError('');
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Senha</label>
                  <input 
                    type="password" 
                    autoComplete="current-password"
                    required
                    disabled={isLoggingIn}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-bold"
                    value={loginForm.password}
                    onChange={(e) => {
                      setLoginForm({...loginForm, password: e.target.value});
                      if(loginError) setLoginError('');
                    }}
                  />
                </div>
                <button 
                  disabled={isLoggingIn}
                  className="w-full py-5 bg-[#0a3d62] hover:bg-[#083352] text-white font-black rounded-2xl transition-all shadow-xl uppercase tracking-widest text-xs active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Autenticando...
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      Acessar Sistema
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-[1400px] mx-auto">
          {/* Top Bar de Status Ativo */}
          <div className="px-8 pt-8 flex justify-end">
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full border border-emerald-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm">
              <CheckCircle2 size={14} />
              Conexão Segura e Ativa
            </div>
          </div>

          {activeTab === 'dashboard' && <Dashboard jobs={jobs} />}
          {activeTab === 'jobs' && (
            <JobManager 
              jobs={jobs} 
              onAddJob={handleAddJob} 
              onUpdateJob={handleUpdateJob}
              onDeleteJob={handleDeleteJob}
              dentists={dentists} 
              services={services} 
            />
          )}
          {activeTab === 'clients' && (
            <DentistManager 
              dentists={dentists} 
              onAddDentist={handleAddDentist}
              onUpdateDentist={handleUpdateDentist}
              onDeleteDentist={handleDeleteDentist}
            />
          )}
          {activeTab === 'services' && (
            <ServiceManager 
              services={services} 
              onAddService={handleAddService}
              onUpdateService={handleUpdateService}
              onDeleteService={onDeleteService} 
            />
          )}
          {activeTab === 'finance' && <FinancialManager jobs={jobs} dentists={dentists} expenses={expenses} />}
          {activeTab === 'ai-assistant' && <AiAssistant />}
          {activeTab === 'master' && (
            <MasterArea 
              users={users} 
              onAddUser={handleAddUser} 
              onDeleteUser={handleDeleteUser}
              onToggleUserStatus={handleToggleUserStatus}
            />
          )}
          {['agenda', 'support'].includes(activeTab) && (
            <div className="p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
                <Construction size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">Módulo em Desenvolvimento</h3>
              <button onClick={() => setActiveTab('dashboard')} className="mt-8 px-6 py-2 bg-[#0a3d62] text-white font-bold rounded-xl">Voltar ao Início</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
