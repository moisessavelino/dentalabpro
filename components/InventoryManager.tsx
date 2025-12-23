
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  TrendingDown, 
  ShoppingCart, 
  Layers, 
  History,
  Box,
  Cylinder,
  Cpu
} from 'lucide-react';

interface InventoryManagerProps {
  items: InventoryItem[];
  onAddItem: (item: Partial<InventoryItem>) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ items, onAddItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Cerâmica', 'Metal', 'Polímero', 'Insumo'];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'Cerâmica': return <Cylinder className="text-cyan-500" />;
      case 'Metal': return <Cpu className="text-slate-500" />;
      case 'Polímero': return <Box className="text-amber-500" />;
      default: return <Package className="text-indigo-500" />;
    }
  };

  return (
    <div className="p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Layers className="text-cyan-500" />
            Gestão de Matéria-Prima
          </h2>
          <p className="text-slate-500 mt-1">Controle de blocos, discos e insumos técnicos.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#0a3d62] text-white rounded-2xl font-black hover:bg-[#083352] transition-all shadow-xl shadow-[#0a3d62]/20">
          <Plus size={18} />
          Novo Material
        </button>
      </header>

      {/* Grid de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Estoque Crítico</p>
            <h4 className="text-2xl font-black text-slate-800">{items.filter(i => i.currentStock <= i.minStock).length} Itens</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-50 text-cyan-500 rounded-2xl flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Valor em Estoque</p>
            <h4 className="text-2xl font-black text-slate-800">R$ {items.reduce((acc, i) => acc + (i.currentStock * i.lastPurchasePrice), 0).toLocaleString('pt-BR')}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center">
            <History size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Última Reposição</p>
            <h4 className="text-2xl font-black text-slate-800">Há 2 dias</h4>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar material por nome..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'bg-white text-slate-500 border border-slate-200 hover:border-cyan-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Materiais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map(item => {
          const stockPercentage = Math.min((item.currentStock / (item.minStock * 3)) * 100, 100);
          const isLow = item.currentStock <= item.minStock;

          return (
            <div key={item.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-slate-50 rounded-2xl transition-colors group-hover:bg-cyan-50">
                    {getIcon(item.category)}
                  </div>
                  {isLow && (
                    <span className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase animate-pulse">
                      <TrendingDown size={12} />
                      Repor
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-1">{item.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{item.category}</p>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Nível de Estoque</span>
                      <span className={`text-sm font-black ${isLow ? 'text-red-500' : 'text-cyan-600'}`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${isLow ? 'bg-red-500' : 'bg-cyan-500'}`}
                        style={{ width: `${stockPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Custo Médio</p>
                      <p className="text-sm font-bold text-slate-700">R$ {item.lastPurchasePrice.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Min. Ideal</p>
                      <p className="text-sm font-bold text-slate-500">{item.minStock} {item.unit}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="w-full py-4 bg-slate-50 border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all">
                Registrar Movimentação
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryManager;
