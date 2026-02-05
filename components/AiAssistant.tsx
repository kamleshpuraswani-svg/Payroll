import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, Bot, Clock, MessageSquare } from 'lucide-react';
import { generateAiInsight } from '../services/geminiService';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  contextData: string;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose, contextData }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! I am CollabAI. I can help you analyze payroll data, draft compliance emails, or summarize audit logs. How can I assist you today?' }
  ]);
  
  // Initialize history from localStorage
  const [history, setHistory] = useState<string[]>(() => {
    try {
        const saved = localStorage.getItem('collab_ai_history');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  // Persist history changes
  useEffect(() => {
      try {
        localStorage.setItem('collab_ai_history', JSON.stringify(history));
      } catch (e) {
        console.error("Failed to save history", e);
      }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setQuery('');
    
    // Update History (Deduplicate and keep top 5)
    setHistory(prev => {
        const newHistory = [userMsg, ...prev.filter(h => h !== userMsg)];
        return newHistory.slice(0, 5);
    });

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await generateAiInsight(userMsg, contextData);
    
    setMessages(prev => [...prev, { role: 'ai', content: response }]);
    setIsLoading(false);
  };

  const handleSuggestionClick = (text: string) => {
      setQuery(text);
      // Optional: Auto-submit? Let's just populate for now so user can edit.
  };

  // If not open, return null to hide, but component remains mounted in parent to preserve state
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[600px] border border-white/20 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-500 to-purple-600 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
               <Bot size={20} className="text-white" />
            </div>
            <div>
               <h3 className="font-bold text-sm">CollabAI Assistant</h3>
               {/* Updated label to Gemini 3 for consistency with geminiService */}
               <p className="text-xs text-indigo-100">Powered by Gemini 3</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`
                  max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-br-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}
                `}
              >
                {msg.role === 'ai' && <Sparkles size={14} className="text-purple-500 mb-1 inline-block mr-2" />}
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                 <Loader2 size={16} className="animate-spin text-purple-600" />
                 <span className="text-xs text-slate-500 font-medium">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about payroll trends or updates..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-2 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send size={16} />
            </button>
          </form>
          
          {/* Suggestions & History */}
          <div className="mt-3 overflow-x-auto pb-1 no-scrollbar flex gap-2">
             {/* History Items */}
             {history.length > 0 && history.map((h, i) => (
                 <button 
                    key={`hist-${i}`}
                    onClick={() => handleSuggestionClick(h)} 
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-xs text-indigo-700 rounded-full transition-colors font-medium"
                 >
                    <Clock size={12} />
                    <span className="max-w-[100px] truncate">{h}</span>
                 </button>
             ))}

             {/* Separator if history exists */}
             {history.length > 0 && <div className="w-px bg-slate-200 mx-1 shrink-0"></div>}

             {/* Default Suggestions */}
             <button onClick={() => handleSuggestionClick("Summarize the audit logs")} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 rounded-full transition-colors">
                <MessageSquare size={12} /> Summarize Audit Logs
             </button>
             <button onClick={() => handleSuggestionClick("Draft a statutory update email")} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 rounded-full transition-colors">
                <MessageSquare size={12} /> Draft Email
             </button>
             <button onClick={() => handleSuggestionClick("Any suspicious activity?")} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 rounded-full transition-colors">
                <MessageSquare size={12} /> Check Security
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;