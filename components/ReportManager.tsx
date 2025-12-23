
import React, { useState, useMemo } from 'react';
import { LabJob, Dentist, Service } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  Users, 
  Target, 
  Award,
  Filter,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';

interface ReportManagerProps {
  jobs: LabJob[];
  dentists: Dentist[];
}

const ReportManager: React.FC<ReportManagerProps> = ({ jobs, dentists }) => {
  const [period, setPeriod] = useState('month');

  // Cálculos de KPI
  const stats = useMemo(() => {
    const totalRevenue = jobs.reduce((acc, j) => acc + j.value, 0);
    const avgTicket = jobs.length > 0 ? totalRevenue / jobs.length : 0;
    const completedJobs = jobs.filter(j => j.status === 'ENTREGUE').length;
    const conversionRate = jobs.length > 0 ? (completedJobs / jobs.length) * 100 : 0;

    return { totalRevenue, avgTicket, completedJobs, conversionRate };
  }, [jobs]);

  // Dados para Gráfico de Produção por Tipo
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => {
      counts[j.type] = (counts[j.type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [jobs]);

  // Ranking de Clientes (Top 5)
  const topClients = useMemo(() => {
    const clientStats: Record<string, { name: string, total: number, jobs: number }> = {};
    jobs.forEach(job => {
      if (!clientStats[job.dentistId]) {
        clientStats[job.dentistId] = { name: job.dentistName, total: 0, jobs: 0 };
      }
      clientStats[job.dentistId].total += job.value;
      clientStats[job.dentistId].jobs += 1;
    });
    return Object.values(clientStats).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [jobs]);

  const COLORS = ['#0891b2', '#0e7490', '#155e75', '#164e63', '#083344'];

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <FileText className="text-cyan-500" />
            Relatórios e Inteligência
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Análise de performance e resultados do laboratório.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Printer size={18} />
            Imprimir
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#0a3d62] text-white rounded-2xl font-black hover:bg-[#083352] transition-all shadow-xl shadow-[#0a3d62]/20">
            <Download size={18} />
            Exportar CSV
          </button>
        </div>
      </header>

      {/* Seletor de Período e Filtros Rápidos */}
      <div className="bg-white p-4 rounded-[24px] border border-slate-100 mb-8 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setPeriod('week')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${period === 'week' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500'}`}
          >
            Semana
          </button>
          <button 
            onClick={() => setPeriod('month')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${period === 'month' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500'}`}
          >
            Mês
          </button>
          <button 
            onClick={() => setPeriod('year')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${period === 'year' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500'}`}
          >
            Ano
          </button>
        </div>
        <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>
        <div className="flex items-center gap-2 text-slate-400 text-sm font-bold">
          <Calendar size={16} />
          <span>Janeiro 2024 - Junho 2024</span>
        </div>
      </div>

      {/* Cards de Performance (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Faturamento Total</p>
          <h3 className="text-3xl font-black text-slate-800">R$ {stats.totalRevenue.toLocaleString('pt-BR')}</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <ArrowUpRight size={16} />
            <span>+18.4% vs prev</span>
          </div>
        </div>
        <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ticket Médio</p>
          <h3 className="text-3xl font-black text-slate-800">R$ {stats.avgTicket.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</h3>
          <div className="mt-4 flex items-center gap-2 text-cyan-600 font-bold text-sm">
            <Target size={16} />
            <span>Meta: R$ 550</span>
          </div>
        </div>
        <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Trabalhos Finalizados</p>
          <h3 className="text-3xl font-black text-slate-800">{stats.completedJobs} <span className="text-slate-300 text-lg">un</span></h3>
          <div className="mt-4 flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <BarChart3 size={16} />
            <span>Eficiência: {stats.conversionRate.toFixed(1)}%</span>
          </div>
        </div>
        <div className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Novos Clientes</p>
          <h3 className="text-3xl font-black text-slate-800">12</h3>
          <div className="mt-4 flex items-center gap-2 text-amber-600 font-bold text-sm">
            <Users size={16} />
            <span>Expansão de mercado</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Produção por Tipo */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <BarChart3 size={20} className="text-cyan-500" />
              Volume por Tipo de Prótese
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking de Melhores Clientes */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Award size={20} className="text-amber-500" />
              Top 5 Parceiros (Receita)
            </h3>
          </div>
          <div className="space-y-4">
            {topClients.map((client, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-all group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-400 group-hover:text-cyan-600'}`}>
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{client.name}</h4>
                  <p className="text-xs text-slate-500">{client.jobs} pedidos realizados</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-800">R$ {client.total.toLocaleString('pt-BR')}</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">Parceiro Premium</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-cyan-600 transition-colors">
            Ver Listagem Completa
          </button>
        </div>
      </div>

      {/* Tabela de Resumo Técnico Mensal */}
      <div className="mt-10 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Extrato de Produção Mensal</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5">Mês Referência</th>
                <th className="px-8 py-5">Trabalhos Recebidos</th>
                <th className="px-8 py-5">Finalizados</th>
                <th className="px-8 py-5 text-right">Faturamento Bruto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {['Maio', 'Abril', 'Março'].map((mes, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-all text-sm">
                  <td className="px-8 py-6 font-bold text-slate-700">{mes} 2024</td>
                  <td className="px-8 py-6 text-slate-600">{25 + idx * 5} pedidos</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold text-xs">
                      {22 + idx * 4} entregues
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-slate-900">R$ 15.680,00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportManager;
