
import React from 'react';
import { 
  ClipboardList, 
  Users, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Plus, 
  Search, 
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck
} from 'lucide-react';
import { JobStatus } from './types';

export const STATUS_COLORS: Record<JobStatus, string> = {
  RECEBIDO: 'bg-blue-100 text-blue-800',
  EM_PRODUCAO: 'bg-yellow-100 text-yellow-800',
  AGUARDANDO_PROVA: 'bg-purple-100 text-purple-800',
  FINALIZADO: 'bg-green-100 text-green-800',
  ENTREGUE: 'bg-gray-100 text-gray-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

export const STATUS_ICONS: Record<JobStatus, React.ReactNode> = {
  RECEBIDO: <ClipboardList size={16} />,
  EM_PRODUCAO: <Clock size={16} />,
  AGUARDANDO_PROVA: <AlertCircle size={16} />,
  FINALIZADO: <CheckCircle2 size={16} />,
  ENTREGUE: <Truck size={16} />,
  CANCELADO: <AlertCircle size={16} />,
};

export const MASTER_PASSWORD_HASH = "MASTER123"; // Simulação de senha mestre
