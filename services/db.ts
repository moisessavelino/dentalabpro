
import { LabJob, Dentist, Service, Expense, User } from '../types';
import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  JOBS: 'dentalab_jobs',
  DENTISTS: 'dentalab_dentists',
  SERVICES: 'dentalab_services',
  EXPENSES: 'dentalab_expenses',
  USERS: 'dentalab_users',
  INITIALIZED: 'dentalab_db_init'
};

export const database = {
  // --- PERSISTÊNCIA LOCAL (CACHE) ---
  saveJobs: (jobs: LabJob[]) => localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs)),
  loadJobs: (): LabJob[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]'),

  saveDentists: (dentists: Dentist[]) => localStorage.setItem(STORAGE_KEYS.DENTISTS, JSON.stringify(dentists)),
  loadDentists: (): Dentist[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.DENTISTS) || '[]'),

  saveServices: (services: Service[]) => localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services)),
  loadServices: (): Service[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]'),

  saveExpenses: (expenses: Expense[]) => localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)),
  loadExpenses: (): Expense[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]'),

  saveUsers: (users: User[]) => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)),
  loadUsers: (): User[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),

  isFirstRun: () => !localStorage.getItem(STORAGE_KEYS.INITIALIZED),
  setInitialized: () => localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true'),

  // --- UTILITÁRIO CSV ---
  exportToCSV: (data: any[], filename: string) => {
    if (!data || !data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(fieldName => {
          const value = row[fieldName] ?? '';
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        }).join(',')
      )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  },

  // --- INTEGRAÇÃO REAL SUPABASE (CLOUD) ---
  
  fetchAllFromCloud: async () => {
    if (!supabase) return null;

    try {
      const [jobsRes, dentistsRes, servicesRes] = await Promise.all([
        supabase.from('jobs').select('*'),
        supabase.from('dentists').select('*'),
        supabase.from('services').select('*')
      ]);

      const mappedJobs: LabJob[] = (jobsRes.data || []).map(j => ({
        id: j.id,
        dentistId: j.dentist_id,
        dentistName: '', 
        patientName: j.patient_name,
        type: j.type,
        material: j.material,
        shade: j.shade,
        status: j.status,
        paymentStatus: j.payment_status,
        entryDate: j.entry_date,
        deliveryDate: j.delivery_date,
        value: Number(j.value),
        quantity: 1,
        selectedTeeth: j.selected_teeth,
        observations: j.observations
      }));

      const mappedServices: Service[] = (servicesRes.data || []).map(s => ({
        id: s.id,
        name: s.name,
        material: s.material,
        salePrice: Number(s.sale_price),
        quantity: 0,
        estimatedDays: s.estimated_days
      }));

      return {
        jobs: mappedJobs,
        dentists: dentistsRes.data || [],
        services: mappedServices
      };
    } catch (e) {
      console.error("Erro ao buscar dados cloud:", e);
      return null;
    }
  },

  syncToCloud: async () => {
    if (!supabase) return { success: false, message: 'Supabase não inicializado.' };

    try {
      const localJobs = database.loadJobs();
      const localDentists = database.loadDentists();
      const localServices = database.loadServices();

      if (localDentists.length > 0) {
        const { error: dError } = await supabase.from('dentists').upsert(localDentists.map(d => ({
          id: d.id,
          name: d.name,
          clinic: d.clinic,
          phone: d.phone,
          cro: d.cro,
          email: d.email,
          address: d.address,
          document: d.document
        })));
        if (dError) throw dError;
      }

      if (localServices.length > 0) {
        const { error: sError } = await supabase.from('services').upsert(localServices.map(s => ({
          id: s.id,
          name: s.name,
          material: s.material,
          sale_price: s.salePrice,
          estimated_days: s.estimatedDays
        })));
        if (sError) throw sError;
      }

      if (localJobs.length > 0) {
        const { error: jError } = await supabase.from('jobs').upsert(localJobs.map(j => ({
          id: j.id,
          dentist_id: j.dentistId,
          patient_name: j.patientName,
          type: j.type,
          material: j.material,
          shade: j.shade,
          status: j.status,
          payment_status: j.paymentStatus,
          value: j.value,
          entry_date: j.entryDate,
          delivery_date: j.deliveryDate,
          selected_teeth: j.selectedTeeth,
          observations: j.observations
        })));
        if (jError) throw jError;
      }

      return { success: true, message: 'Sincronização concluída com sucesso!' };
    } catch (error: any) {
      console.error("Erro na sincronização:", error);
      return { success: false, message: `Falha: ${error.message || 'Erro desconhecido'}` };
    }
  },

  exportBackup: () => {
    const data = {
      jobs: database.loadJobs(),
      dentists: database.loadDentists(),
      services: database.loadServices(),
      expenses: database.loadExpenses(),
      users: database.loadUsers()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_dentalab_cloud_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  },

  clearAll: () => {
    if (confirm("Isso apagará apenas o cache LOCAL. Os dados no Supabase permanecerão. Continuar?")) {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      window.location.reload();
    }
  }
};
