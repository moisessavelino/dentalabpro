
import React, { useState } from 'react';
import { Service } from '../types';
import { MASTER_PASSWORD_HASH } from '../constants';
import { Plus, Search, Trash2, Edit3, Package, Layers, BarChart3, Clock, ClipboardList, Lock, AlertTriangle } from 'lucide-react';

interface ServiceManagerProps {
  services: Service[];
  onAddService: (service: Partial<Service>) => void;
  onUpdateService: (service: Service) => void;
  onDeleteService: (id: string) => void;
}

const ServiceManager: React.FC<ServiceManagerProps> = ({ services, onAddService, onUpdateService, onDeleteService }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [formData, setFormData] = useState<Partial<Service>>({ 
    name: '', 
    material: '', 
    salePrice: 0, 
    quantity: 0, 
    estimatedDays: 5 
  });

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.material.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({ name: '', material: '', salePrice: 0, quantity: 0, estimatedDays: 5 });
    setShowModal(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({ ...service });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      onUpdateService({ ...editingService, ...formData } as Service);
    } else {
      onAddService(formData);
    }
    setShowModal(false);
  };

  const confirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPassword === MASTER_PASSWORD_HASH) {
      if (serviceToDelete) {
        onDeleteService(serviceToDelete.id);
        setServiceToDelete(null);
        setMasterPassword('');
        setDeleteError('');
      }
    } else {
      setDeleteError('Senha Mestre incorreta. Acesso negado.');
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter uppercase">
            <div className="p-2 bg-cyan-100 rounded-2xl text-cyan-600">
              <ClipboardList size={32} />
            </div>
            Tabela de Serviços
          </h2>
          <p className="text-slate-500 font-medium mt-1">Gestão de preços e prazos de laboratório.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-[#0a3d62] hover:bg-[#083352] text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-900/20 transition-all active:scale-95 uppercase tracking-widest text-xs"
        >
          <Plus size={20} />
          Novo Serviço
        </button>
      </div>

      <div className="mb-10 relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Pesquisar por nome ou material..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all shadow-sm font-bold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredServices.map(service => {
          return (
            <div key={service.id} className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-2xl transition-all border-b-8 border-b-cyan-500/5 hover:border-b-cyan-500">
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-white border border-slate-100 rounded-[24px] text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                    <Package size={28} />
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenEditModal(service)}
                      className="w-10 h-10 flex items-center justify-center text-blue-500 hover:text-white hover:bg-blue-500 rounded-xl transition-all border border-blue-50 shadow-sm bg-white"
                      title="Editar Serviço"
                    >
                      <Edit3 size={18}/>
                    </button>
                    <button 
                      onClick={() => {
                        setServiceToDelete(service);
                        setMasterPassword('');
                        setDeleteError('');
                      }} 
                      className="w-10 h-10 flex items-center justify-center text-red-500 hover:text-white hover:bg-red-50 rounded-xl transition-all border border-red-50 shadow-sm bg-white"
                      title="Remover Serviço"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>

                <h3 className="font-black text-slate-800 text-xl mb-1 tracking-tight uppercase leading-tight">{service.name}</h3>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">{service.material}</div>

                <div className="mb-8">
                  <div className="bg-emerald-50 p-6 rounded-[24px] border border-emerald-100 text-center">
                    <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Preço de Venda</span>
                    <span className="text-2xl font-black text-emerald-700">R$ {service.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 uppercase font-black text-[9px] tracking-widest">Prazo Est.</span>
                    <span className="text-slate-800 font-black text-xs flex items-center gap-1">
                      <Clock size={12} className="text-cyan-500" />
                      {service.estimatedDays} dias
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {serviceToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Apagar Serviço?</h3>
              <p className="text-slate-500 text-xs mb-8 font-medium leading-relaxed">
                Você está prestes a remover o serviço <span className="font-black text-slate-800">"{serviceToDelete.name}"</span> da tabela. Digite a Senha Mestre:
              </p>
              
              <form onSubmit={confirmDelete} className="space-y-5">
                <div className="relative">
                  <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="password"
                    placeholder="SENHA MESTRE"
                    className={`w-full pl-14 pr-4 py-5 bg-white border rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/10 font-black tracking-[0.5em] text-center text-lg ${deleteError ? 'border-red-500' : 'border-slate-200'}`}
                    value={masterPassword}
                    onChange={(e) => {
                      setMasterPassword(e.target.value);
                      setDeleteError('');
                    }}
                    required
                    autoFocus
                  />
                </div>
                
                {deleteError && (
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-tight bg-red-50 py-2 rounded-lg">{deleteError}</p>
                )}

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setServiceToDelete(null);
                      setMasterPassword('');
                      setDeleteError('');
                    }} 
                    className="flex-1 px-4 py-5 rounded-2xl font-black text-slate-400 hover:bg-slate-100 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Desistir
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-5 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 uppercase tracking-widest text-[10px] active:scale-95"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
            <div className="p-10 bg-[#0a3d62] text-white flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter">
                {editingService ? 'Editar' : 'Novo'} Serviço Técnico
              </h3>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-10 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Nome do Serviço / Prótese</label>
                  <input 
                    required 
                    placeholder="Ex: Coroa Zircônia Anatômica"
                    className="w-full px-6 py-5 bg-white border border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-[#0a3d62] transition-all" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Material Base</label>
                  <input 
                    placeholder="Ex: Cerâmica Feldspática"
                    className="w-full px-6 py-5 bg-white border border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-[#0a3d62] transition-all" 
                    value={formData.material} 
                    onChange={e => setFormData({...formData, material: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Preço de Venda (R$)</label>
                  <input type="number" step="0.01" required className="w-full px-6 py-5 bg-white border border-slate-200 rounded-2xl font-black text-cyan-600 outline-none focus:ring-4 focus:ring-cyan-900/5 focus:border-cyan-600 transition-all" value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Prazo de Produção (Dias)</label>
                  <input type="number" required className="w-full px-6 py-5 bg-white border border-slate-200 rounded-2xl font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-900/5 focus:border-[#0a3d62] transition-all" value={formData.estimatedDays} onChange={e => setFormData({...formData, estimatedDays: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-10 border-t border-slate-50">
                <button type="button" onClick={() => setShowModal(false)} className="px-8 py-5 text-slate-400 font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 rounded-2xl transition-all">Cancelar</button>
                <button type="submit" className="px-12 py-5 bg-[#0a3d62] text-white rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-900/30 transition-all active:scale-95">
                  Confirmar e Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManager;
