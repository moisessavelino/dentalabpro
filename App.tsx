
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
import { database } from './services/db';
import { isCloudEnabled } from './services/supabaseClient';
import { Lock, LogIn, Construction, AlertCircle, Loader2, CheckCircle2, Database, Cloud, CloudOff, RefreshCw } from 'lucide-react';

const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'admin', password: '1011', role: 'ADMIN', isActive: true },
  { id: 'u2', username: 'tecnico', password: '123', role: 'TECNICO', isActive: true },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState<LabJob[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ labCode: 'LAB-2024', username: '', password: '' });

  // 1. Carregamento Inicial (Local + Cloud)
  useEffect(() => {
    const initData = async () => {
      // Primeiro carrega o que tem local para ser rápido
      if (database.isFirstRun()) {
        setUsers(INITIAL_USERS);
        database.saveUsers(INITIAL_USERS);
        database.setInitialized();
      } else {
        setJobs(database.loadJobs());
        setDentists(database.loadDentists());
        setServices(database.loadServices());
        setExpenses(database.loadExpenses());
        setUsers(database.loadUsers());
      }

      // Se o cloud estiver ativo, tenta puxar os dados mais recentes
      if (isCloudEnabled()) {
        const cloudData = await database.fetchAllFromCloud();
        if (cloudData) {
          if (cloudData.jobs.length > 0) setJobs(cloudData.jobs);
          if (cloudData.dentists.length > 0) setDentists(cloudData.dentists);
          if (cloudData.services.length > 0) setServices(cloudData.services);
        }
      }
      
      setIsDbLoaded(true);
    };

    initData();
  }, []);

  // 2. Auto-Save Local
  useEffect(() => { if (isDbLoaded) database.saveJobs(jobs); }, [jobs, isDbLoaded]);
  useEffect(() => { if (isDbLoaded) database.saveDentists(dentists); }, [dentists, isDbLoaded]);
  useEffect(() => { if (isDbLoaded) database.saveServices(services); }, [services, isDbLoaded]);
  useEffect(() => { if (isDbLoaded) database.saveExpenses(expenses); }, [expenses, isDbLoaded]);
  useEffect(() => { if (isDbLoaded) database.saveUsers(users); }, [users, isDbLoaded]);

  // 3. Gerenciamento de Sessão
  useEffect(() => {
    const savedUser = localStorage.getItem('dentalab_session');
    if (savedUser && users.length > 0) {
      const parsed = JSON.parse(savedUser);
      const valid = users.find(u => u.id === parsed.id && u.isActive);
      if (valid) setCurrentUser(valid);
    }
  }, [users]);

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    const result = await database.syncToCloud();
    setTimeout(() => {
      setIsSyncing(false);
      if(!result.success) alert(result.message);
      else {
        // Recarrega para garantir consistência
        window.location.reload();
      }
    }, 1500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    setTimeout(() => {
      const foundUser = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
      if (foundUser) {
        if (foundUser.isActive) {
          setCurrentUser(foundUser);
          localStorage.setItem('dentalab_session', JSON.stringify(foundUser));
        } else {
          setLoginError('Sua conta está desativada.');
        }
      } else {
        setLoginError('Credenciais inválidas!');
      }
      setIsLoggingIn(false);
    }, 600);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dentalab_session');
    setActiveTab('dashboard');
  };

  const handleAddJob = (jobData: Partial<LabJob>) => {
    const newJob: LabJob = { ...jobData as LabJob, id: Math.random().toString(36).substr(2, 9), paymentStatus: 'PENDENTE', quantity: jobData.quantity || 1 };
    setJobs([newJob, ...jobs]);
  };

  const handleUpdateJob = (updatedJob: LabJob) => setJobs(jobs.map(j => j.id === updatedJob.id ? updatedJob : j));
  const handleDeleteJob = (id: string) => setJobs(jobs.filter(j => j.id !== id));

  const handleAddService = (serviceData: Partial<Service>) => {
    const newS: Service = { ...serviceData as Service, id: 's' + Math.random().toString(36).substr(2, 5) };
    setServices([...services, newS]);
  };

  const handleUpdateService = (updatedService: Service) => setServices(services.map(s => s.id === updatedService.id ? updatedService : s));
  const onDeleteService = (id: string) => setServices(services.filter(s => s.id !== id));

  const handleAddDentist = (dentistData: Partial<Dentist>) => {
    const newDentist: Dentist = { ...dentistData as Dentist, id: 'd' + Math.random().toString(36).substr(2, 5) };
    setDentists([newDentist, ...dentists]);
  };

  const handleUpdateDentist = (updatedDentist: Dentist) => setDentists(dentists.map(d => d.id === updatedDentist.id ? updatedDentist : d));
  const handleDeleteDentist = (id: string) => setDentists(dentists.filter(d => d.id !== id));

  const handleAddUser = (userData: Partial<User>) => {
    const newUser: User = { ...userData as User, id: 'u' + Math.random().toString(36).substr(2, 5), isActive: true };
    setUsers([...users, newUser]);
  };

  const handleToggleUserStatus = (id: string) => {
    setUsers(users.map(u => (u.id === id && u.username !== 'admin') ? { ...u, isActive: !u.isActive } : u));
  };

  const handleDeleteUser = (id: string) => setUsers(users.filter(u => u.id !== id));

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
                <p className="text-slate-400 text-lg max-w-sm">Sincronização em nuvem e suporte técnico por IA.</p>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-2 text-cyan-400/60 text-[10px] font-black uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              Sistema Operacional v3.5 - Cloud Ready
            </div>
          </div>
          <div className="flex-1 bg-white p-10 md:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h3 className="text-4xl font-black text-slate-800 mb-2 tracking-tighter">Entrar</h3>
              <p className="text-slate-400 font-medium mb-10">Use suas credenciais cadastradas no banco de dados.</p>
              
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
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-bold"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Senha</label>
                  <input 
                    type="password" 
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all font-bold"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  />
                </div>
                <button 
                  disabled={isLoggingIn}
                  className="w-full py-5 bg-[#0a3d62] hover:bg-[#083352] text-white font-black rounded-2xl transition-all shadow-xl uppercase tracking-widest text-xs active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
                >
                  {isLoggingIn ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
                  {isLoggingIn ? 'Autenticando...' : 'Acessar Sistema'}
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
          <div className="px-8 pt-8 flex justify-end gap-3">
            <button 
              onClick={handleSyncCloud}
              disabled={isSyncing}
              className={`px-4 py-2 rounded-full border flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm transition-all ${isCloudEnabled() ? 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100' : 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-50'}`}
              title={isCloudEnabled() ? 'Enviar dados para nuvem Supabase' : 'Configure a VITE_SUPABASE_ANON_KEY para ativar'}
            >
              {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : (isCloudEnabled() ? <Cloud size={14} /> : <CloudOff size={14} />)}
              {isSyncing ? 'Sincronizando...' : (isCloudEnabled() ? 'Enviar p/ Cloud' : 'Cloud Off')}
            </button>
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full border border-emerald-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm">
              <CheckCircle2 size={14} />
              Conectado: {currentUser.username}
            </div>
          </div>

          {activeTab === 'dashboard' && <Dashboard jobs={jobs} />}
          {activeTab === 'jobs' && <JobManager jobs={jobs} onAddJob={handleAddJob} onUpdateJob={handleUpdateJob} onDeleteJob={handleDeleteJob} dentists={dentists} services={services} />}
          {activeTab === 'clients' && <DentistManager dentists={dentists} onAddDentist={handleAddDentist} onUpdateDentist={handleUpdateDentist} onDeleteDentist={handleDeleteDentist} />}
          {activeTab === 'services' && <ServiceManager services={services} onAddService={handleAddService} onUpdateService={handleUpdateService} onDeleteService={onDeleteService} />}
          {activeTab === 'finance' && <FinancialManager jobs={jobs} dentists={dentists} expenses={expenses} />}
          {activeTab === 'ai-assistant' && <AiAssistant />}
          {activeTab === 'master' && <MasterArea users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} onToggleUserStatus={handleToggleUserStatus} />}
          
          {['agenda', 'support'].includes(activeTab) && (
            <div className="p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
              <Construction size={48} className="text-slate-300 mb-6" />
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
