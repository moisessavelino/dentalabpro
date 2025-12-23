
import React, { useState } from 'react';
import { MASTER_PASSWORD_HASH } from '../constants';
import { User } from '../types';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Trash2, 
  KeyRound, 
  UserPlus, 
  Users, 
  ShieldCheck,
  UserCog,
  Check,
  X,
  Settings,
  Activity,
  Edit3,
  Plus,
  Shield,
  AlertTriangle,
  Power
} from 'lucide-react';

interface Permission {
  id: string;
  module: string;
  admin: boolean;
  tech: boolean;
}

interface MasterAreaProps {
  users: User[];
  onAddUser: (user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onToggleUserStatus?: (id: string) => void;
}

const MasterArea: React.FC<MasterAreaProps> = ({ users, onAddUser, onDeleteUser, onToggleUserStatus }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [newUser, setNewUser] = useState<Partial<User>>({ username: '', password: '', role: 'TECNICO' });
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [permToDelete, setPermToDelete] = useState<Permission | null>(null);

  const [permissions, setPermissions] = useState<Permission[]>([
    { id: '1', module: 'Dashboards', admin: true, tech: true },
    { id: '2', module: 'Gestão de Produção', admin: true, tech: true },
    { id: '3', module: 'Cadastro de Novos Pedidos', admin: true, tech: true },
    { id: '4', module: 'Exclusão de Registros', admin: true, tech: false },
    { id: '5', module: 'Tabela de Preços & Insumos', admin: true, tech: false },
    { id: '6', module: 'Relatórios Financeiros', admin: true, tech: false },
    { id: '7', module: 'Gestão de Contas a Pagar/Receber', admin: true, tech: false },
    { id: '8', module: 'Configurações de Acesso (Master)', admin: true, tech: false },
  ]);

  const [showPermModal, setShowPermModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [permFormData, setPermFormData] = useState<Partial<Permission>>({
    module: '',
    admin: true,
    tech: false
  });

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MASTER_PASSWORD_HASH) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Senha Mestre Incorreta. Acesso Negado.');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.username && newUser.password) {
      onAddUser(newUser);
      setNewUser({ username: '', password: '', role: 'TECNICO' });
    }
  };

  const openPermModal = (perm?: Permission) => {
    if (perm) {
      setEditingPermission(perm);
      setPermFormData({ ...perm });
    } else {
      setEditingPermission(null);
      setPermFormData({ module: '', admin: true, tech: false });
    }
    setShowPermModal(true);
  };

  const handleSavePermission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permFormData.module) return;

    if (editingPermission) {
      setPermissions(permissions.map(p => p.id === editingPermission.id ? { ...editingPermission, ...permFormData } as Permission : p));
    } else {
      const newPerm: Permission = {
        id: Math.random().toString(36).substr(2, 9),
        module: permFormData.module || '',
        admin: permFormData.admin ?? true,
        tech: permFormData.tech ?? false
      };
      setPermissions([...permissions, newPerm]);
    }
    setShowPermModal(false);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  const confirmDeletePermission = () => {
    if (permToDelete) {
      setPermissions(permissions.filter(p => p.id !== permToDelete.id));
      setPermToDelete(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Lock size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tighter">Acesso Restrito</h2>
          <p className="text-slate-500 mb-10 font-medium leading-relaxed">Esta seção requer a **Senha Mestre** para acesso. Apenas o proprietário do laboratório deve acessar aqui.</p>
          
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="relative">
              <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="password" 
                placeholder="Digite a Senha Mestre"
                className="w-full pl-14 pr-4 py-5 bg-white border border-slate-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 text-center font-black tracking-[0.5em] text-lg transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs font-black uppercase tracking-tight">{error}</p>}
            <button className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-3xl transition-all shadow-xl shadow-amber-500/20 uppercase tracking-widest text-xs active:scale-95">
              Desbloquear Administração
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 pb-24 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">ADMINISTRAÇÃO DO SISTEMA</h2>
            <p className="text-slate-500 font-medium text-sm">Controle de acessos, usuários e delegação de funções.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="px-8 py-4 text-slate-500 hover:text-red-600 font-black flex items-center gap-2 border border-slate-200 rounded-2xl transition-all hover:bg-red-50 uppercase tracking-widest text-[10px] active:scale-95"
        >
          <Unlock size={18} />
          Encerrar Sessão
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-10">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl"><UserPlus size={24} /></div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Novo Acesso</h3>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Login do Usuário</label>
                <input 
                  required
                  type="text"
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-bold text-slate-700"
                  placeholder="Ex: marcos.tec"
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Senha Temporária</label>
                <input 
                  required
                  type="password"
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-bold tracking-widest"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Função Designada</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setNewUser({...newUser, role: 'TECNICO'})}
                    className={`p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${newUser.role === 'TECNICO' ? 'bg-[#0a3d62] text-white border-transparent shadow-lg shadow-blue-900/20' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'}`}
                  >
                    Técnico
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewUser({...newUser, role: 'ADMIN'})}
                    className={`p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${newUser.role === 'ADMIN' ? 'bg-[#0a3d62] text-white border-transparent shadow-lg shadow-blue-900/20' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'}`}
                  >
                    Admin
                  </button>
                </div>
              </div>
              
              <button type="submit" className="w-full py-5 bg-[#0a3d62] text-white rounded-3xl font-black shadow-xl shadow-[#0a3d62]/20 hover:bg-[#083352] transition-all uppercase tracking-[0.15em] flex items-center justify-center gap-3 text-xs active:scale-95">
                <ShieldCheck size={20} />
                Conceder Acesso
              </button>
            </form>
          </div>

          <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Activity size={100} />
            </div>
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-2">Segurança</h4>
              <h3 className="text-xl font-bold mb-6">Logs de Atividade</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span>Admin alterou status do pedido #1204</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                  <span>Novo login detectado: tec.marcos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-10">
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400"><Settings size={24} /></div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Delegação de Funções</h3>
              </div>
              <button 
                onClick={() => openPermModal()}
                className="p-3 bg-cyan-600 text-white rounded-xl shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transition-all active:scale-90"
                title="Adicionar Nova Regra"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-5">Módulo / Permissão</th>
                    <th className="px-6 py-5 text-center">Técnico</th>
                    <th className="px-6 py-5 text-center">Admin</th>
                    <th className="px-6 py-5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                  {permissions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-4 text-sm font-bold text-slate-700">{p.module}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {p.tech ? <div className="p-1 bg-emerald-100 text-emerald-600 rounded-lg"><Check size={16} /></div> : <div className="p-1 bg-slate-100 text-slate-300 rounded-lg"><X size={16} /></div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {p.admin ? <div className="p-1 bg-emerald-100 text-emerald-600 rounded-lg"><Check size={16} /></div> : <div className="p-1 bg-slate-100 text-slate-300 rounded-lg"><X size={16} /></div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => openPermModal(p)}
                            className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => setPermToDelete(p)}
                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Users size={24} /></div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Acessos Ativos</h3>
            </div>

            <div className="divide-y divide-slate-50">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 uppercase">
                      {u.username.substring(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-black text-slate-800">{u.username}</p>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${u.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          {u.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {u.username !== 'admin' && (
                      <button 
                        onClick={() => onToggleUserStatus && onToggleUserStatus(u.id)}
                        className={`p-4 rounded-2xl transition-all active:scale-90 ${u.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-50'}`}
                        title={u.isActive ? 'Desativar Entrada' : 'Ativar Entrada'}
                      >
                        <Power size={20} />
                      </button>
                    )}
                    
                    {u.username !== 'admin' ? (
                      <button 
                        onClick={() => setUserToDelete(u)}
                        className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                        title="Revogar Acesso"
                      >
                        <Trash2 size={20} />
                      </button>
                    ) : (
                      <span className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl" title="Acesso Principal do Sistema">
                        <ShieldCheck size={20} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE EXCLUSÃO DE USUÁRIO */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Revogar Acesso?</h3>
              <p className="text-slate-500 text-xs mb-8 font-medium leading-relaxed">
                O usuário <span className="font-black text-slate-800">"{userToDelete.username}"</span> perderá acesso imediato ao sistema. Deseja confirmar?
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-5 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDeleteUser}
                  className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 uppercase tracking-widest text-[10px] active:scale-95"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO DE PERMISSÃO */}
      {permToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ShieldAlert size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">Remover Regra?</h3>
              <p className="text-slate-500 text-xs mb-8 font-medium leading-relaxed">
                Remover a regra de <span className="font-black text-slate-800">"{permToDelete.module}"</span> pode impactar a visibilidade de módulos para outros usuários.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setPermToDelete(null)}
                  className="flex-1 py-5 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px]"
                >
                  Manter
                </button>
                <button 
                  onClick={confirmDeletePermission}
                  className="flex-1 py-5 bg-amber-600 text-white rounded-2xl font-black hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/20 uppercase tracking-widest text-[10px] active:scale-95"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPermModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-[#0a3d62] uppercase tracking-tighter">
                {editingPermission ? 'Editar Módulo' : 'Nova Delegação'}
              </h3>
              <button onClick={() => setShowPermModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all">✕</button>
            </div>
            <form onSubmit={handleSavePermission} className="p-10 space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nome do Módulo</label>
                <input 
                  required
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all font-bold text-slate-700 bg-white"
                  placeholder="Ex: Tabela de Preços"
                  value={permFormData.module}
                  onChange={e => setPermFormData({...permFormData, module: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Níveis de Acesso</label>
                
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <UserCog size={20} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Técnico</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setPermFormData({...permFormData, tech: !permFormData.tech})}
                    className={`w-12 h-6 rounded-full relative transition-all ${permFormData.tech ? 'bg-cyan-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${permFormData.tech ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Administrador</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setPermFormData({...permFormData, admin: !permFormData.admin})}
                    className={`w-12 h-6 rounded-full relative transition-all ${permFormData.admin ? 'bg-[#0a3d62]' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${permFormData.admin ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowPermModal(false)}
                  className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-[#0a3d62] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
                >
                  {editingPermission ? 'Salvar Regra' : 'Criar Regra'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterArea;
