
import React from 'react';
import { LabJob, JobStatus } from '../types';
import { STATUS_COLORS, STATUS_ICONS } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { TrendingUp, Users, ClipboardList, Wallet } from 'lucide-react';

interface DashboardProps {
  jobs: LabJob[];
}

const Dashboard: React.FC<DashboardProps> = ({ jobs }) => {
  const stats = [
    { label: 'Trabalhos Ativos', value: jobs.filter(j => j.status !== 'ENTREGUE' && j.status !== 'CANCELADO').length, icon: <ClipboardList className="text-blue-500" />, color: 'blue' },
    { label: 'Entregas Hoje', value: jobs.filter(j => j.deliveryDate === new Date().toISOString().split('T')[0]).length, icon: <TrendingUp className="text-green-500" />, color: 'green' },
    { label: 'Novos Dentistas', value: 12, icon: <Users className="text-purple-500" />, color: 'purple' },
    { label: 'Receita Mensal', value: `R$ ${jobs.reduce((acc, j) => acc + j.value, 0).toLocaleString()}`, icon: <Wallet className="text-amber-500" />, color: 'amber' },
  ];

  const chartData = [
    { name: 'Recebido', value: jobs.filter(j => j.status === 'RECEBIDO').length },
    { name: 'Produção', value: jobs.filter(j => j.status === 'EM_PRODUCAO').length },
    { name: 'Prova', value: jobs.filter(j => j.status === 'AGUARDANDO_PROVA').length },
    { name: 'Finalizado', value: jobs.filter(j => j.status === 'FINALIZADO').length },
  ];

  const COLORS = ['#3b82f6', '#eab308', '#a855f7', '#22c55e'];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Bem-vindo, Administrador</h2>
        <p className="text-slate-500">Aqui está o resumo do seu laboratório hoje.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 bg-slate-50 rounded-xl`}>{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Status dos Pedidos</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Trabalhos Recentes</h3>
          <div className="space-y-4">
            {jobs.slice(0, 5).map(job => (
              <div key={job.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${STATUS_COLORS[job.status]}`}>
                  {STATUS_ICONS[job.status]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{job.patientName}</p>
                  <p className="text-xs text-slate-500">{job.type}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold text-slate-700">R$ {job.value}</p>
                  <p className="text-slate-400">{job.deliveryDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
