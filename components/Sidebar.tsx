
import React from 'react';
import { 
  Calendar, 
  LayoutGrid, 
  Box, 
  Coins, 
  ShieldCheck, 
  PhoneCall, 
  Power,
  ChevronDown,
  Sparkles,
  ClipboardList,
  Users
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboards', icon: <LayoutGrid size={20} />, hasSub: true },
    { id: 'jobs', label: 'Produção', icon: <Box size={20} />, hasSub: true },
    { id: 'clients', label: 'Clientes', icon: <Users size={20} />, hasSub: false },
    { id: 'services', label: 'Tabela de Preços', icon: <ClipboardList size={20} />, hasSub: false },
    { id: 'finance', label: 'Financeiro', icon: <Coins size={20} />, hasSub: true },
    { id: 'master', label: 'Administração', icon: <ShieldCheck size={20} />, hasSub: true },
    { id: 'ai-assistant', label: 'DentaLab IA', icon: <Sparkles size={20} />, hasSub: false },
    { id: 'support', label: 'Suporte', icon: <PhoneCall size={20} />, hasSub: true },
  ];

  return (
    <div className="w-64 bg-[#0a3d62] h-screen text-white flex flex-col fixed left-0 top-0 shadow-2xl z-50">
      <div className="p-4">
        <button 
          onClick={() => setActiveTab('agenda')}
          className={`w-full flex items-center gap-4 px-4 py-2.5 rounded shadow-sm transition-all ${
            activeTab === 'agenda' 
              ? 'bg-white text-[#0a3d62]' 
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Calendar size={20} className={activeTab === 'agenda' ? 'text-[#0a3d62]' : 'text-white'} />
          <span className="font-semibold text-sm">Agenda</span>
        </button>
      </div>
      
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded transition-colors group ${
              activeTab === item.id 
                ? 'bg-[#002a4d] text-white border-l-4 border-cyan-400' 
                : 'text-slate-100 hover:bg-[#002a4d]/50 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`${activeTab === item.id ? 'text-cyan-400' : 'text-slate-300 group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="text-[13px] font-medium tracking-wide">{item.label}</span>
            </div>
            {item.hasSub && <ChevronDown size={14} className="text-slate-400" />}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 bg-[#083352]">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-red-500/20 rounded transition-colors"
        >
          <Power size={20} />
          <span className="text-[13px] font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
