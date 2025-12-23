
import React, { useState, useEffect, useRef } from 'react';
import { LabJob, JobStatus, Dentist, Service } from '../types';
import { database } from '../services/db';
import { STATUS_COLORS, STATUS_ICONS, MASTER_PASSWORD_HASH } from '../constants';
import { Plus, Search, Filter, Eye, Edit3, Trash2, Info, Printer, FileText, Calendar as CalendarIcon, User, Clipboard, DollarSign, AlertTriangle, Lock, Loader2, Minus, Download } from 'lucide-react';

interface JobManagerProps {
  jobs: LabJob[];
  onAddJob: (job: Partial<LabJob>) => void;
  onUpdateJob: (job: LabJob) => void;
  onDeleteJob: (id: string) => void;
  dentists?: Dentist[];
  services?: Service[];
}

const Odontogram: React.FC<{ selected: number[], onToggle?: (tooth: number) => void, readOnly?: boolean }> = ({ selected, onToggle, readOnly }) => {
  const quadrants = [
    { label: 'Sup. Dir.', teeth: [18, 17, 16, 15, 14, 13, 12, 11] },
    { label: 'Sup. Esq.', teeth: [21, 22, 23, 24, 25, 26, 27, 28] },
    { label: 'Inf. Dir.', teeth: [48, 47, 46, 45, 44, 43, 42, 41] },
    { label: 'Inf. Esq.', teeth: [31, 32, 33, 34, 35, 36, 37, 38] },
  ];

  return (
    <div className={`bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-4 ${readOnly ? 'bg-white' : ''}`}>
      <div className="flex items-center gap-2 mb-4 text-slate-500 font-bold text-xs uppercase tracking-widest">
        <span className="p-1 bg-cyan-100 text-cyan-600 rounded">
          <Info size={12} />
        </span>
        {readOnly ? 'Elementos do Trabalho' : 'Seleção de Elementos (Odontograma Centralizado)'}
      </div>
      <div className="grid grid-cols-2 gap-x-2 md:gap-x-8 gap-y-6">
        {quadrants.map((q, qIdx) => (
          <div key={qIdx} className="flex flex-col gap-2">
            <span className={`text-[10px] font-black text-slate-400 uppercase tracking-tighter ${qIdx % 2 !== 0 ? 'text-left' : 'text-right'}`}>{q.label}</span>
            <div className={`flex gap-1 flex-wrap ${qIdx % 2 !== 0 ? 'justify-start' : 'justify-end'}`}>
              {q.teeth.map(t => (
                <button
                  key={t}
                  type="button"
                  disabled={readOnly}
                  onClick={() => onToggle && onToggle(t)}
                  className={`w-8 h-10 flex flex-col items-center justify-center rounded-lg border-2 transition-all font-black text-xs ${
                    selected.includes(t)
                      ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/30 scale-105 z-10'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-cyan-300 hover:text-cyan-500'
                  } ${readOnly ? 'cursor-default' : 'active:scale-90'}`}
                >
                  <span className="opacity-40 text-[8px] mb-0.5">D</span>
                  {t}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const JobManager: React.FC<JobManagerProps> = ({ jobs, onAddJob, onUpdateJob, onDeleteJob, dentists = [], services = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<LabJob | null>(null);
  const [viewingJob, setViewingJob] = useState<LabJob | null>(null);
  const [jobToDelete, setJobToDelete] = useState<LabJob | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [unitPrice, setUnitPrice] = useState(0);
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<LabJob>>({
    status: 'RECEBIDO',
    value: 0,
    quantity: 1,
    entryDate: new Date().toISOString().split('T')[0],
    material: '',
    observations: '',
    patientName: '',
    dentistName: '',
    type: '',
    shade: '',
    selectedTeeth: [],
  });

  const filteredJobs = jobs.filter(j => 
    j.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.dentistName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    setIsProcessing('exporting_csv');
    setTimeout(() => {
      const dataToExport = filteredJobs.map(j => ({
        Paciente: j.patientName,
        Dentista: j.dentistName,
        Servico: j.type,
        Material: j.material,
        Cor: j.shade,
        Valor: j.value,
        Status: j.status,
        Entrega: j.deliveryDate
      }));
      database.exportToCSV(dataToExport, 'lista_pedidos_dentalab');
      setIsProcessing(null);
    }, 800);
  };

  const openAddModal = () => {
    setEditingJob(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (job: LabJob) => {
    setEditingJob(job);
    setFormData({ ...job });
    const service = services.find(s => s.name === job.type);
    setUnitPrice(service ? service.salePrice : job.value / job.quantity);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) onUpdateJob({ ...editingJob, ...formData } as LabJob);
    else onAddJob(formData);
    setShowModal(false);
    resetForm();
  };

  const confirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (deletePassword === MASTER_PASSWORD_HASH) {
      if (jobToDelete) {
        onDeleteJob(jobToDelete.id);
        setJobToDelete(null);
        setDeletePassword('');
        setDeleteError('');
      }
    } else setDeleteError('Senha Mestre incorreta.');
  };

  const resetForm = () => {
    setFormData({
      status: 'RECEBIDO', value: 0, quantity: 1, entryDate: new Date().toISOString().split('T')[0],
      material: '', observations: '', patientName: '', dentistName: '', type: '', shade: '', selectedTeeth: [],
    });
    setUnitPrice(0);
  };

  const handleServiceChange = (serviceName: string) => {
    const service = services.find(s => s.name === serviceName);
    if (service) {
      setUnitPrice(service.salePrice);
      setFormData({ ...formData, type: service.name, material: service.material, value: service.salePrice * (formData.quantity || 1) });
    } else setFormData({ ...formData, type: serviceName });
  };

  const handleQuantityChange = (qty: number) => {
    const safeQty = Math.max(1, qty);
    setFormData({ ...formData, quantity: safeQty, value: unitPrice * safeQty });
  };

  const toggleTooth = (tooth: number) => {
    const current = formData.selectedTeeth || [];
    setFormData({ ...formData, selectedTeeth: current.includes(tooth) ? current.filter(t => t !== tooth) : [...current, tooth] });
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Gerenciar Trabalhos</h2>
          <p className="text-slate-500 text-sm">Controle total dos pedidos em andamento.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            disabled={isProcessing === 'exporting_csv'}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-6 py-3 rounded-xl font-black transition-all shadow-sm active:scale-95 text-[10px] uppercase tracking-widest"
          >
            {isProcessing === 'exporting_csv' ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Exportar CSV
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#0a3d62] hover:bg-[#083352] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus size={20} />
            Novo Pedido
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por paciente ou dentista..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest transition-all">
            <Filter size={16} />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Paciente / Elementos</th>
                <th className="px-6 py-5">Dentista</th>
                <th className="px-6 py-5">Tipo/Material</th>
                <th className="px-6 py-5 text-center">Entrega</th>
                <th className="px-6 py-5 text-right">Valor</th>
                <th className="px-6 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${STATUS_COLORS[job.status]}`}>
                      {STATUS_ICONS[job.status]}
                      {job.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{job.patientName}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {job.selectedTeeth?.map(t => (
                        <span key={t} className="text-[8px] font-black bg-white text-slate-400 border border-slate-200 px-1.5 rounded">D{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-600">{job.dentistName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-slate-700">
                      {job.quantity > 1 && <span className="text-cyan-600 mr-1">{job.quantity}x</span>}
                      {job.type}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">{job.material || 'N/A'} • {job.shade || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`text-xs font-black ${new Date(job.deliveryDate) < new Date() && job.status !== 'ENTREGUE' ? 'text-red-500' : 'text-slate-500'}`}>
                      {job.deliveryDate ? new Date(job.deliveryDate).toLocaleDateString('pt-BR') : 'Sem data'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-black text-slate-800">R$ {job.value.toLocaleString('pt-BR')}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => setViewingJob(job)} className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"><Eye size={18}/></button>
                      <button onClick={() => openEditModal(job)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={18}/></button>
                      <button onClick={() => setJobToDelete(job)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS mantidos conforme original mas com suporte a exclusão */}
      {jobToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center animate-in zoom-in">
             <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
             <h3 className="text-xl font-black text-slate-800 mb-2">Excluir Pedido</h3>
             <form onSubmit={confirmDelete} className="space-y-4">
                <input type="password" placeholder="Senha Mestre" className="w-full px-4 py-3 bg-slate-50 border rounded-xl text-center font-black tracking-widest outline-none" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} required />
                {deleteError && <p className="text-red-500 text-xs font-bold">{deleteError}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setJobToDelete(null)} className="flex-1 py-3 font-bold text-slate-400">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black">Excluir</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-[#0a3d62] uppercase tracking-tighter">
                {editingJob ? 'Editar Registro' : 'Novo Pedido de Prótese'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 max-h-[85vh] overflow-y-auto bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                <div className="col-span-1 md:col-span-2 lg:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Paciente</label>
                  <input required className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 bg-white font-bold" value={formData.patientName} placeholder="Nome do paciente" onChange={(e) => setFormData({...formData, patientName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dentista Solicitante</label>
                  <select required className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 bg-white font-bold" value={formData.dentistName} onChange={(e) => {
                      const d = dentists.find(dent => dent.name === e.target.value);
                      setFormData({...formData, dentistName: e.target.value, dentistId: d?.id || ''})
                    }}>
                    <option value="">Selecione...</option>
                    {dentists.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Serviço</label>
                  <select required className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 bg-white font-bold" value={formData.type} onChange={(e) => handleServiceChange(e.target.value)}>
                    <option value="">Selecione o serviço...</option>
                    {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quantidade</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => handleQuantityChange((formData.quantity || 1) - 1)} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-xl"><Minus size={18} /></button>
                    <input type="number" className="flex-1 px-5 py-3.5 rounded-2xl border border-slate-200 font-black text-center" value={formData.quantity} onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)} />
                    <button type="button" onClick={() => handleQuantityChange((formData.quantity || 1) + 1)} className="w-12 h-12 flex items-center justify-center bg-[#0a3d62] text-white rounded-xl"><Plus size={18} /></button>
                  </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Data Entrega</label>
                   <input type="date" required className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none font-bold" value={formData.deliveryDate || ''} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Valor Total</label>
                  <input type="number" readOnly className="w-full px-5 py-4 rounded-2xl border border-emerald-200 bg-emerald-50 font-black text-emerald-700 outline-none" value={formData.value} />
                </div>
              </div>
              <Odontogram selected={formData.selectedTeeth || []} onToggle={toggleTooth} />
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 font-black text-slate-400 uppercase text-[10px]">Cancelar</button>
                <button type="submit" className="px-10 py-4 bg-[#0a3d62] text-white rounded-2xl font-black uppercase text-[10px] shadow-lg">Confirmar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManager;
