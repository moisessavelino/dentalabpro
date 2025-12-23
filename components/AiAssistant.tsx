
import React, { useState } from 'react';
import { getSmartJobSuggestions } from '../services/geminiService';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';

const AiAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Olá! Sou o assistente inteligente do DentaLab. Como posso ajudar com seus casos técnicos hoje? Ex: "Quais materiais usar em um protocolo de carga imediata?"' }
  ]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const suggestion = await getSmartJobSuggestions(userMsg);
    setMessages(prev => [...prev, { role: 'bot', text: suggestion || 'Não consegui processar sua dúvida.' }]);
    setLoading(false);
  };

  return (
    <div className="p-8 h-[calc(100vh-40px)] flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="text-cyan-500" />
          IA Assistant
        </h2>
        <p className="text-slate-500">Consultoria técnica e insights instantâneos para o seu laboratório.</p>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-600'}`}>
                  {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'bg-slate-50 text-slate-700'}`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-2">
                  <Loader2 className="animate-spin text-cyan-600" size={18} />
                  <span className="text-sm text-slate-500">Analisando dados...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Digite sua dúvida técnica..."
              className="w-full pl-4 pr-14 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-sm transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
