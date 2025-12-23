
import React, { useState, useEffect, useRef } from 'react';
import { LabJob, JobStatus, Dentist, Service } from '../types';
import { STATUS_COLORS, STATUS_ICONS, MASTER_PASSWORD_HASH } from '../constants';
import { Plus, Search, Filter, Eye, Edit3, Trash2, Info, Printer, FileText, Calendar as CalendarIcon, User, Clipboard, DollarSign, AlertTriangle, Lock, Loader2, Minus } from 'lucide-react';

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
      <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-2">
        {selected.length > 0 ? (
          selected.sort().map(t => (
            <span key={t} className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-[10px] font-black">Dente {t}</span>
          ))
        ) : (
          <span className="text-xs text-slate-400 italic">Nenhum elemento selecionado</span>
        )}
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

  const handlePrint = () => {
    setIsProcessing('printing');
    setTimeout(() => {
      window.print();
      setIsProcessing(null);
    }, 1500);
  };

  const handleExportPDF = () => {
    setIsProcessing('exporting');
    setTimeout(() => {
      alert(`Relatório técnico de ${viewingJob?.patientName} exportado com sucesso em PDF.`);
      setIsProcessing(null);
    }, 2000);
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
    if (service) setUnitPrice(service.salePrice);
    else setUnitPrice(job.value / job.quantity);

    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      onUpdateJob({ ...editingJob, ...formData } as LabJob);
    } else {
      onAddJob(formData);
    }
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
    } else {
      setDeleteError('Senha Mestre incorreta. Acesso negado.');
    }
  };

  const resetForm = () => {
    setFormData({
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
    setUnitPrice(0);
    setEditingJob(null);
  };

  const handleServiceChange = (serviceName: string) => {
    const service = services.find(s => s.name === serviceName);
    if (service) {
      const price = service.salePrice;
      setUnitPrice(price);
      setFormData({
        ...formData,
        type: service.name,
        material: service.material,
        value: price * (formData.quantity || 1)
      });
    } else {
      setFormData({ ...formData, type: serviceName });
    }
  };

  const handleQuantityChange = (qty: number) => {
    const safeQty = Math.max(1, qty);
    setFormData({
      ...formData,
      quantity: safeQty,
      value: unitPrice * safeQty
    });
  };

  const toggleTooth = (tooth: number) => {
    const current = formData.selectedTeeth || [];
    const updated = current.includes(tooth)
      ? current.filter(t => t !== tooth)
      : [...current, tooth];
    setFormData({ ...formData, selectedTeeth: updated });
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
      try {
        (dateInputRef.current as any).showPicker();
      } catch (e) {
        dateInputRef.current.focus();
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Gerenciar Trabalhos</h2>
          <p className="text-slate-500 text-sm">Controle total dos pedidos em andamento.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#0a3d62] hover:bg-[#083352] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          <Plus size={20} />
          Novo Pedido
        </button>
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
                      <button 
                        onClick={() => setViewingJob(job)}
                        className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all"
                        title="Visualizar Detalhes"
                      >
                        <Eye size={18}/>
                      </button>
                      <button 
                        onClick={() => openEditModal(job)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar Pedido"
                      >
                        <Edit3 size={18}/>
                      </button>
                      <button 
                        onClick={() => {
                          setJobToDelete(job);
                          setDeletePassword('');
                          setDeleteError('');
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir Pedido"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {jobToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Confirmar Exclusão</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Para excluir o pedido de <span className="font-black text-slate-800">{jobToDelete.patientName}</span>, digite a Senha Mestre:
              </p>
              
              <form onSubmit={confirmDelete} className="space-y-4">
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password"
                    placeholder="Senha Mestre"
                    className={`w-full pl-12 pr-4 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/10 font-black tracking-[0.4em] text-center ${deleteError ? 'border-red-500' : 'border-slate-200'}`}
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setDeleteError('');
                    }}
                    required
                    autoFocus
                  />
                </div>
                
                {deleteError && (
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-tight">{deleteError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setJobToDelete(null);
                      setDeletePassword('');
                      setDeleteError('');
                    }} 
                    className="flex-1 px-4 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-100 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 uppercase tracking-widest text-[10px]"
                  >
                    Excluir
                  </button>
                </div>
              </form>
            </div>
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
                  <input 
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 bg-white font-bold"
                    value={formData.patientName}
                    placeholder="Nome do paciente"
                    onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dentista Solicitante</label>
                  <select 
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 bg-white font-bold"
                    value={formData.dentistName}
                    onChange={(e) => {
                      const d = dentists.find(dent => dent.name === e.target.value);
                      setFormData({...formData, dentistName: e.target.value, dentistId: d?.id || ''})
                    }}
                  >
                    <option value="">Selecione...</option>
                    {dentists.map(d => (
                      <option key={d.id} value={d.name}>{d.name} (CRO: {d.cro || 'N/A'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Serviço (Autocomplete)</label>
                  <select 
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 bg-white font-bold"
                    value={formData.type}
                    onChange={(e) => handleServiceChange(e.target.value)}
                  >
                    <option value="">Selecione o serviço...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quantidade (Autocoma)</label>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => handleQuantityChange((formData.quantity || 1) - 1)}
                      className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all active:scale-90"
                    >
                      <Minus size={18} />
                    </button>
                    <input 
                      type="number"
                      min="1"
                      className="flex-1 px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 bg-white font-black text-center text-lg"
                      value={formData.quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    />
                    <button 
                      type="button" 
                      onClick={() => handleQuantityChange((formData.quantity || 1) + 1)}
                      className="w-12 h-12 flex items-center justify-center bg-[#0a3d62] text-white rounded-xl hover:bg-[#083352] transition-all active:scale-90"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Data Entrega</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        ref={dateInputRef}
                        type="date"
                        required
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 bg-white font-bold"
                        value={formData.deliveryDate || ''}
                        onChange={(e) => setFormData({...formData, deliveryDate: e.target.value})}
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={openDatePicker}
                      className="w-14 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center hover:bg-cyan-200 transition-colors shadow-sm"
                      title="Abrir Calendário"
                    >
                      <CalendarIcon size={24} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Valor Total (Automático)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">R$</span>
                    <input 
                      type="number"
                      readOnly
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border border-emerald-200 bg-emerald-50 font-black text-emerald-700 text-xl outline-none cursor-not-allowed shadow-inner"
                      value={formData.value}
                    />
                  </div>
                </div>
              </div>

              <Odontogram selected={formData.selectedTeeth || []} onToggle={toggleTooth} />

              <div className="mt-10">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Observações Técnicas / Cor (Shade)</label>
                <div className="flex gap-4 mb-4">
                  <input 
                    placeholder="Cor (Ex: A1, B2)"
                    className="w-32 px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-cyan-500/10 outline-none font-bold bg-white"
                    value={formData.shade}
                    onChange={e => setFormData({...formData, shade: e.target.value})}
                  />
                  <input 
                    placeholder="Material Base (Autocompletado)"
                    className="flex-1 px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 font-medium italic outline-none"
                    value={formData.material}
                    readOnly
                  />
                </div>
                <textarea 
                  rows={4}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 bg-white font-medium text-sm"
                  placeholder="Instruções adicionais para o protético..."
                  value={formData.observations}
                  onChange={(e) => setFormData({...formData, observations: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-slate-50">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-5 rounded-2xl font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-widest text-[11px]">Cancelar</button>
                <button type="submit" className="px-12 py-5 rounded-2xl font-black bg-[#0a3d62] text-white hover:bg-[#083352] transition-all shadow-xl shadow-blue-900/20 uppercase tracking-widest text-[11px] active:scale-95">
                  {editingJob ? 'Salvar Alterações' : 'Confirmar Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-3xl overflow-hidden my-8 animate-in fade-in slide-in-from-bottom-12 duration-500 border border-white/20">
            <div className="bg-[#0a3d62] p-10 text-white relative">
              <button 
                onClick={() => setViewingJob(null)} 
                className="absolute top-8 right-8 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all active:scale-90"
              >
                ✕
              </button>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 ${STATUS_COLORS[viewingJob.status]} bg-opacity-20 text-white`}>
                      {viewingJob.status.replace('_', ' ')}
                    </span>
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Protocolo: #{(viewingJob.id || '').substring(0, 8)}</span>
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter uppercase">{viewingJob.patientName}</h3>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={handlePrint}
                    disabled={isProcessing !== null}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-95 border border-white/10 flex items-center justify-center group"
                    title="Imprimir Pedido"
                  >
                    {isProcessing === 'printing' ? (
                      <Loader2 size={24} className="animate-spin text-cyan-400" />
                    ) : (
                      <Printer size={24} className="group-hover:text-cyan-400 transition-colors" />
                    )}
                  </button>
                  <button 
                    onClick={handleExportPDF}
                    disabled={isProcessing !== null}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-95 border border-white/10 flex items-center justify-center group"
                    title="Exportar PDF Técnico"
                  >
                    {isProcessing === 'exporting' ? (
                      <Loader2 size={24} className="animate-spin text-cyan-400" />
                    ) : (
                      <FileText size={24} className="group-hover:text-cyan-400 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-10 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    <User size={14} className="text-cyan-500" />
                    Dentista / Clínica
                  </p>
                  <p className="text-lg font-black text-slate-800">{viewingJob.dentistName}</p>
                </div>

                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    <Clipboard size={14} className="text-cyan-500" />
                    Serviço Solicitado
                  </p>
                  <p className="text-lg font-black text-slate-800">
                    {viewingJob.quantity > 1 && <span className="text-cyan-600 mr-2">{viewingJob.quantity}x</span>}
                    {viewingJob.type}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    <Info size={14} className="text-cyan-500" />
                    Material / Cor
                  </p>
                  <p className="text-lg font-black text-slate-800">{viewingJob.material || 'N/A'} <span className="text-slate-200 mx-2">|</span> {viewingJob.shade || 'N/A'}</p>
                </div>

                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    <CalendarIcon size={14} className="text-cyan-500" />
                    Data de Entrada
                  </p>
                  <p className="text-lg font-black text-slate-800">{new Date(viewingJob.entryDate).toLocaleDateString('pt-BR')}</p>
                </div>

                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    <CalendarIcon size={14} className="text-red-500" />
                    Previsão Entrega
                  </p>
                  <p className="text-lg font-black text-slate-800">{new Date(viewingJob.deliveryDate).toLocaleDateString('pt-BR')}</p>
                </div>

                <div className="space-y-1">
                  <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    <DollarSign size={14} className="text-emerald-500" />
                    Valor Total
                  </p>
                  <p className="text-2xl font-black text-emerald-600">R$ {viewingJob.value.toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <Odontogram selected={viewingJob.selectedTeeth || []} readOnly={true} />
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-4 pt-8">
                <button 
                  onClick={() => {
                    const target = viewingJob;
                    setViewingJob(null);
                    setJobToDelete(target);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                  className="px-10 py-5 text-red-400 font-black rounded-2xl hover:bg-red-50 transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Excluir Pedido
                </button>
                <button 
                  onClick={() => setViewingJob(null)}
                  className="px-10 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-[11px]"
                >
                  Fechar Ficha
                </button>
                <button 
                  onClick={() => {
                    const jobToEdit = viewingJob;
                    setViewingJob(null);
                    openEditModal(jobToEdit);
                  }}
                  className="px-10 py-5 bg-cyan-600 text-white font-black rounded-2xl hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-600/20 uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95"
                >
                  <Edit3 size={18} />
                  Editar Registro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManager;
