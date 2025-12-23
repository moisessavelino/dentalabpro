
import React, { useState, useMemo } from 'react';
import { LabJob, Dentist, Expense } from '../types';
import { database } from '../services/db';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  Filter, 
  Search, 
  ChevronRight, 
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Loader2,
  Printer,
  ChevronLeft,
  Award,
  Download
} from 'lucide-react';

interface FinancialManagerProps {
  jobs: LabJob[];
  dentists: Dentist[];
  expenses: Expense[];
}

const FinancialManager: React.FC<FinancialManagerProps> = ({ jobs, dentists, expenses }) => {
  const [view, setView] = useState<'overview' | 'individual'>('overview');
  const [selectedDentist, setSelectedDentist] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const debtors = useMemo(() => {
    const list: Record<string, { dentist: Dentist, total: number, jobCount: number }> = {};
    jobs.filter(j => j.paymentStatus === 'PENDENTE' && j.status !== 'CANCELADO').forEach(job => {
      if (!list[job.dentistId]) {
        const dentist = dentists.find(d => d.id === job.dentistId);
        if (dentist) {
          list[job.dentistId] = { dentist, total: 0, jobCount: 0 };
        }
      }
      if (list[job.dentistId]) {
        list[job.dentistId].total += job.value;
        list[job.dentistId].jobCount += 1;
      }
    });
    return Object.values(list).sort((a, b) => b.total - a.total);
  }, [jobs, dentists]);

  const creditors = useMemo(() => {
    return expenses.filter(e => !e.isPaid).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [expenses]);

  const stats = useMemo(() => {
    const toReceive = debtors.reduce((acc, d) => acc + d.total, 0);
    const toPay = creditors.reduce((acc, c) => acc + c.value, 0);
    const totalPaid = jobs.filter(j => j.paymentStatus === 'PAGO').reduce((acc, j) => acc + j.value, 0);
    return { toReceive, toPay, totalPaid, balance: toReceive - toPay };
  }, [debtors, creditors, jobs]);

  const individualReport = useMemo(() => {
    if (!selectedDentist) return [];
    return jobs.filter(j => {
      const matchDentist = j.dentistId === selectedDentist;
      const jobDate = new Date(j.entryDate).getTime();
      const start = dateRange.start ? new Date(dateRange.start).getTime() : 0;
      const end = dateRange.end ? new Date(dateRange.end).getTime() : Infinity;
      return matchDentist && jobDate >= start && jobDate <= end;
    });
  }, [selectedDentist, dateRange, jobs]);

  const individualTotal = individualReport.reduce((acc, j) => acc + j.value, 0);

  const handleExportCSV = () => {
    setIsGenerating(true);
    setTimeout(() => {
      if (view === 'overview') {
        const dataToExport = debtors.map(d => ({
          Dentista: d.dentist.name,
          Clinica: d.dentist.clinic,
          CRO: d.dentist.cro,
          Total_Pendente: d.total,
          Pedidos: d.jobCount
        }));
        database.exportToCSV(dataToExport, 'relatorio_financeiro_geral');
      } else {
        const dataToExport = individualReport.map(j => ({
          Data: j.entryDate,
          Paciente: j.patientName,
          Servico: j.type,
          Valor: j.value,
          Status_Pagamento: j.paymentStatus
        }));
        const name = dentists.find(d => d.id === selectedDentist)?.name || 'cliente';
        database.exportToCSV(dataToExport, `extrato_${name.toLowerCase().replace(/\s+/g, '_')}`);
      }
      setIsGenerating(false);
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3 uppercase">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Wallet size={32} />
            </div>
            Gestão Financeira
          </h2>
          <p className="text-slate-500 font-medium text-sm">Controle de caixa, extratos e relatórios CSV.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setView('overview')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'overview' ? 'bg-[#0a3d62] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Visão Geral
            </button>
            <button 
              onClick={() => setView('individual')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'individual' ? 'bg-[#0a3d62] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Extrato Individual
            </button>
          </div>
          
          <button 
            onClick={handleExportCSV}
            disabled={isGenerating || (view === 'individual' && !selectedDentist)}
            className="flex items-center gap-2 bg-white border-2 border-[#0a3d62] text-[#0a3d62] hover:bg-slate-50 px-6 py-3 rounded-2xl font-black transition-all active:scale-95 uppercase tracking-widest text-[10px] disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isGenerating ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>
      </header>

      <div className="hidden print:block mb-10 border-b-4 border-[#0a3d62] pb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-[#0a3d62] tracking-tighter">DentaLab <span className="text-cyan-600">Pro</span></h1>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Relatório Financeiro de Laboratório</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Documento Digital • {view === 'overview' ? 'Visão Geral' : 'Extrato Cliente'}</p>
          </div>
        </div>
      </div>

      {view === 'overview' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={20} /></div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter">Efetuado</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Recebido</p>
                <h3 className="text-2xl font-black text-slate-800">R$ {stats.totalPaid.toLocaleString('pt-BR')}</h3>
              </div>
            </div>

            <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><ArrowUpRight size={20} /></div>
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-tighter">Ativo</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">A Receber</p>
                <h3 className="text-2xl font-black text-slate-800">R$ {stats.toReceive.toLocaleString('pt-BR')}</h3>
              </div>
            </div>

            <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><ArrowDownRight size={20} /></div>
                <span className="text-[10px] font-black uppercase text-red-600 tracking-tighter">Pendente</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">A Pagar</p>
                <h3 className="text-2xl font-black text-slate-800">R$ {stats.toPay.toLocaleString('pt-BR')}</h3>
              </div>
            </div>

            <div className="bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all bg-gradient-to-br from-white to-slate-50">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stats.balance >= 0 ? 'bg-cyan-50 text-cyan-600' : 'bg-red-50 text-red-600'}`}>
                  <Wallet size={20} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${stats.balance >= 0 ? 'text-cyan-600' : 'text-red-600'}`}>
                  {stats.balance >= 0 ? 'Superávit' : 'Déficit'}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Projetado</p>
                <h3 className={`text-2xl font-black ${stats.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                  R$ {stats.balance.toLocaleString('pt-BR')}
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden print:border-none">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-blue-500 shadow-sm"><ArrowUpRight size={16} /></div>
                  Maiores Devedores
                </h3>
              </div>
              <div className="divide-y divide-slate-50">
                {debtors.map(item => (
                  <div key={item.dentist.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-400 uppercase shadow-sm">
                        {item.dentist.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 uppercase text-xs tracking-tight">{item.dentist.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{item.jobCount} pedidos pendentes</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-black text-blue-600 text-lg leading-none">R$ {item.total.toLocaleString('pt-BR')}</p>
                        <span className="text-[8px] font-black uppercase text-slate-300">Total Aberto</span>
                      </div>
                      <button 
                        onClick={() => { setView('individual'); setSelectedDentist(item.dentist.id); }}
                        className="p-3 bg-slate-50 text-slate-300 group-hover:text-cyan-600 group-hover:bg-cyan-50 rounded-xl transition-all print:hidden"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                ))}
                {debtors.length === 0 && <p className="p-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum devedor encontrado.</p>}
              </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden print:border-none">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-red-500 shadow-sm"><ArrowDownRight size={16} /></div>
                  Compromissos / Credores
                </h3>
              </div>
              <div className="divide-y divide-slate-50">
                {creditors.map(expense => (
                  <div key={expense.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-800 uppercase text-xs tracking-tight">{expense.description}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                        <Calendar size={10} className="text-red-400" />
                        Venc: {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-red-600 text-lg leading-none">R$ {expense.value.toLocaleString('pt-BR')}</p>
                      <span className="text-[9px] uppercase font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full inline-block mt-1">{expense.category}</span>
                    </div>
                  </div>
                ))}
                {creditors.length === 0 && <p className="p-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhuma conta pendente.</p>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden print:border-none">
          <div className="p-10 bg-slate-50/50 border-b border-slate-100 print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Profissional Solicitante</label>
                <select 
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none bg-white font-black text-slate-800"
                  value={selectedDentist}
                  onChange={e => setSelectedDentist(e.target.value)}
                >
                  <option value="">Selecione um dentista...</option>
                  {dentists.map(d => <option key={d.id} value={d.id}>{d.name} (CRO: {d.cro || 'N/A'})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Início do Período</label>
                <input 
                  type="date"
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none bg-white font-black"
                  value={dateRange.start}
                  onChange={e => setDateRange({...dateRange, start: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fim do Período</label>
                <input 
                  type="date"
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none bg-white font-black"
                  value={dateRange.end}
                  onChange={e => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="p-12">
            {!selectedDentist ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
                  <AlertCircle size={40} className="opacity-20" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">Selecione um cliente para visualizar o extrato profissional</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-2 border-dashed border-slate-100 pb-12 gap-8 print:border-solid">
                  <div>
                    <h4 className="text-[10px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-3">Demonstrativo Financeiro do Cliente</h4>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">
                      {dentists.find(d => d.id === selectedDentist)?.name}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-4">
                      <p className="text-slate-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Calendar size={14} className="text-[#0a3d62]" />
                        {dateRange.start ? new Date(dateRange.start).toLocaleDateString('pt-BR') : 'Desde o Início'} — {dateRange.end ? new Date(dateRange.end).toLocaleDateString('pt-BR') : 'Hoje'}
                      </p>
                      <p className="text-slate-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Award size={14} className="text-cyan-500" />
                        CRO: {dentists.find(d => d.id === selectedDentist)?.cro || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right p-8 bg-slate-50 rounded-[40px] border border-slate-100 min-w-[300px] shadow-inner print:bg-white print:shadow-none">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Devedor Acumulado</p>
                    <p className="text-5xl font-black text-[#0a3d62] tracking-tighter">R$ {individualTotal.toLocaleString('pt-BR')}</p>
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2 block">Total de {individualReport.length} registros</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">
                        <th className="py-5 px-6">Data Entrada</th>
                        <th className="py-5 px-6">Ficha / Paciente</th>
                        <th className="py-5 px-6">Serviço Técnico</th>
                        <th className="py-5 px-6 text-center">Pagamento</th>
                        <th className="py-5 px-6 text-right">Valor Bruto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {individualReport.map(job => (
                        <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-6 px-6 text-slate-500 font-bold text-xs">{new Date(job.entryDate).toLocaleDateString('pt-BR')}</td>
                          <td className="py-6 px-6">
                            <div className="font-black text-slate-800 uppercase text-xs tracking-tight">{job.patientName}</div>
                            <span className="text-[8px] font-black text-slate-300">REF: #{job.id.substring(0, 6)}</span>
                          </td>
                          <td className="py-6 px-6 text-slate-600 font-black text-xs uppercase">
                            {job.quantity > 1 && <span className="text-cyan-600 mr-2">{job.quantity}x</span>}
                            {job.type}
                          </td>
                          <td className="py-6 px-6 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${job.paymentStatus === 'PAGO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {job.paymentStatus}
                            </span>
                          </td>
                          <td className="py-6 px-6 text-right font-black text-slate-800 text-lg">R$ {job.value.toLocaleString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {individualReport.length === 0 && (
                    <div className="p-16 text-center text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] bg-slate-50/30 rounded-3xl mt-4">
                      Nenhum registro encontrado para este filtro
                    </div>
                  )}
                </div>

                <div className="mt-16 flex justify-end gap-4 print:hidden">
                  <button 
                    onClick={handleExportCSV}
                    disabled={isGenerating}
                    className="flex items-center gap-3 px-10 py-5 bg-[#0a3d62] text-white rounded-2xl font-black hover:bg-[#083352] transition-all shadow-xl shadow-blue-900/20 uppercase tracking-widest text-[11px] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    {isGenerating ? 'Exportando CSV...' : 'Exportar Fatura CSV'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManager;
