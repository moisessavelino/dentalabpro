
export type JobStatus = 'RECEBIDO' | 'EM_PRODUCAO' | 'AGUARDANDO_PROVA' | 'FINALIZADO' | 'ENTREGUE' | 'CANCELADO';
export type PaymentStatus = 'PENDENTE' | 'PAGO';

export interface Patient {
  name: string;
  age?: number;
}

export interface Dentist {
  id: string;
  name: string;
  clinic: string;
  phone: string;
  cro?: string; // Novo campo de registro profissional
  email?: string;
  address?: string;
  document?: string; // CPF ou CNPJ
}

export interface LabJob {
  id: string;
  dentistId: string;
  dentistName: string;
  patientName: string;
  type: string;
  material: string;
  shade: string;
  status: JobStatus;
  paymentStatus: PaymentStatus;
  entryDate: string;
  deliveryDate: string;
  value: number;
  quantity: number;
  selectedTeeth?: number[];
  observations?: string;
}

export interface Service {
  id: string;
  name: string;
  material: string;
  salePrice: number; // "Preço" (Venda)
  quantity: number;  // "Quantidade"
  estimatedDays: number;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  value: number;
  dueDate: string;
  isPaid: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Cerâmica' | 'Metal' | 'Polímero' | 'Insumo';
  currentStock: number;
  minStock: number;
  unit: string;
  lastPurchasePrice: number;
  expiryDate?: string;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'ADMIN' | 'TECNICO';
  isActive: boolean; // Novo campo para ativar/desativar entrada no sistema
}
