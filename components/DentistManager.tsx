
import React, { useState } from 'react';
import { Dentist } from '../types';
import { MASTER_PASSWORD_HASH } from '../constants';
import { 
  UserPlus, 
  Search, 
  Phone, 
  Building2, 
  Edit3, 
  Trash2, 
  Mail, 
  MapPin, 
  FileText, 
  MessageSquare, 
  Users,
  Award,
  AlertTriangle,
  Lock
} from 'lucide-react';

interface DentistManagerProps {
  dentists: Dentist[];
  onAddDentist: (dentist: Partial<Dentist>) => void;
  onUpdateDentist: (dentist: Dentist) => void;
  onDeleteDentist: (id: string) => void;
}

const DentistManager: React.FC<DentistManagerProps> = ({ dentists, onAddDentist, onUpdateDentist, onDeleteDentist }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDentist, setEditingDentist] = useState<Dentist | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Dentist | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [formData, setFormData] = useState<Partial<Dentist>>({
    name: '',
    clinic: '',
    phone: '',
    email: '',
    address: '',
    document: '',
    cro: ''
  });

  const filteredDentists = dentists.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.clinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.cro && d.cro.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDentist) {
      onUpdateDentist({ ...editingDentist, ...formData } as Dentist);
    } else {
      onAddDentist(formData);
    }
    closeModal();
  };

  const confirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (deletePassword === MASTER_PASSWORD_HASH) {
      if (clientToDelete) {
        onDeleteDentist(clientToDelete.id);
        setClientToDelete(null);
        setDeletePassword('');
        setDeleteError('');
      }
    } else {
      setDeleteError('Senha Mestre incorreta. Acesso negado.');
    }
  };

  const openModal = (dentist?: Dentist) => {
    if (dentist) {
      setEditingDentist(dentist);
      setFormData({ 
        name: dentist.name, 
        clinic: dentist.clinic, 
        phone: dentist.phone,
        email: dentist.email || '',
        address: dentist.address || '',
        document: dentist.document || '',
        cro: dentist.cro || ''
      });
    } else {
      setEditingDentist(null);
      setFormData({ name: '', clinic: '', phone: '', email: '', address: '', document: '', cro: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDentist(null);
  };

  const openSupportWhatsApp = () => {
    window.open('https://api.whatsapp.com/send?phone=5571992863990&text=Olá, gostaria de suporte técnico do sistema DentaLab Pro.', '_blank');
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter uppercase">
            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
              <Users size={32} />
            </div>
            Gestão de Clientes
          </h2>
          <p className="text-slate-500 font-medium mt-1">Cadastro centralizado de dentistas, clínicas e parceiros.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={openSupportWhatsApp}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95 uppercase tracking-widest text-[10px]"
          >
            <MessageSquare size={18} />
            WhatsApp Suporte
          </button>
          
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-[#0a3d62] hover:bg-[#083352] text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-900/20 active:scale-95 uppercase tracking-widest text-[10px]"
          >
            <UserPlus size={18} />
            Novo Cadastro
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nome, clínica, CRO ou registro..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Identificação</th>
                <th className="px-8 py-5">Informações de Contato</th>
                <th className="px-8 py-5">Clínica / Endereço</th>
                <th className="px-8 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDentists.map((dentist) => (
                <tr key={dentist.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-slate-400 font-black text-xl border border-slate-200 shadow-sm">
                        {dentist.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-lg tracking-tight uppercase">{dentist.name}</div>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <Award size={12} className="text-cyan-500" />
                            CRO: {dentist.cro || 'Pendente'}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <FileText size={12} className="text-blue-500" />
                            Doc: {dentist.document || 'Não informado'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <Phone size={14} className="text-emerald-500" />
                        {dentist.phone}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                        <Mail size={14} className="text-blue-400" />
                        {dentist.email || 'Email não cadastrado'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-tighter">
                        <Building2 size={14} className="text-blue-900" />
                        {dentist.clinic}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                        <MapPin size={14} className="text-red-400" />
                        <span className="truncate max-w-[250px]">{dentist.address || 'Endereço pendente'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => openModal(dentist)}
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Editar Cadastro"
                      >
                        <Edit3 size={18}/>
                      </button>
                      <button 
                        onClick={() => {
                          setClientToDelete(dentist);
                          setDeletePassword('');
                          setDeleteError('');
                        }}
                        className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Remover Cliente"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDentists.length === 0 && (
            <div className="p-20 text-center text-slate-400 flex flex-col items-center">
              <Users size={64} className="opacity-10 mb-4" />
              <p className="font-bold uppercase tracking-widest text-xs">Nenhum cliente encontrado para sua busca.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Exclusão com Senha Mestre */}
      {clientToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Excluir Cliente?</h3>
              <p className="text-slate-500 text-xs mb-8 font-medium leading-relaxed">
                Você está prestes a remover o cadastro de <span className="font-black text-slate-800">"{clientToDelete.name}"</span>. Esta ação é irreversível. Digite a Senha Mestre:
              </p>
              
              <form onSubmit={confirmDelete} className="space-y-5">
                <div className="relative">
                  <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="password"
                    placeholder="SENHA MESTRE"
                    className={`w-full pl-14 pr-4 py-5 bg-white border rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/10 font-black tracking-[0.5em] text-center text-lg ${deleteError ? 'border-red-500' : 'border-slate-200'}`}
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
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-tight bg-red-50 py-2 rounded-lg">{deleteError}</p>
                )}

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setClientToDelete(null);
                      setDeletePassword('');
                      setDeleteError('');
                    }} 
                    className="flex-1 px-4 py-5 rounded-2xl font-black text-slate-400 hover:bg-slate-100 transition-all uppercase tracking-widest text-[10px]"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-5 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 uppercase tracking-widest text-[10px] active:scale-95"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="p-8 bg-[#0a3d62] text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">
                  {editingDentist ? 'Atualizar Cliente' : 'Novo Cadastro de Cliente'}
                </h3>
                <p className="text-white/60 text-xs font-medium uppercase tracking-widest mt-1">Preencha os dados cadastrais completos</p>
              </div>
              <button onClick={closeModal} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nome Completo do Dentista / Dr(a).</label>
                  <input 
                    required
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold bg-white"
                    value={formData.name}
                    placeholder="Ex: Dr. João Ricardo Oliveira"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Registro CRO</label>
                  <input 
                    required
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold bg-white uppercase"
                    value={formData.cro}
                    placeholder="UF-00000"
                    onChange={(e) => setFormData({...formData, cro: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">CPF ou CNPJ</label>
                  <input 
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold bg-white"
                    value={formData.document}
                    placeholder="000.000.000-00"
                    onChange={(e) => setFormData({...formData, document: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Clínica / Razão Social</label>
                  <input 
                    required
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold bg-white"
                    value={formData.clinic}
                    placeholder="Ex: Consultório Odonto Excellence"
                    onChange={(e) => setFormData({...formData, clinic: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Telefone / WhatsApp</label>
                  <input 
                    required
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold bg-white"
                    value={formData.phone}
                    placeholder="(71) 00000-0000"
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Email de Contato</label>
                  <input 
                    type="email"
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold bg-white"
                    value={formData.email}
                    placeholder="dentista@exemplo.com.br"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Endereço Comercial Completo</label>
                  <textarea 
                    rows={2}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-sm bg-white"
                    value={formData.address}
                    placeholder="Rua, Número, Bairro, Cidade, CEP..."
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-slate-50">
                <button type="button" onClick={closeModal} className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-100 transition-all uppercase tracking-widest text-[11px]">Cancelar</button>
                <button type="submit" className="px-12 py-4 rounded-2xl font-black bg-[#0a3d62] text-white hover:bg-[#083352] transition-all shadow-xl shadow-blue-900/20 uppercase tracking-widest text-[11px] active:scale-95">
                  {editingDentist ? 'Salvar Alterações' : 'Concluir Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DentistManager;
