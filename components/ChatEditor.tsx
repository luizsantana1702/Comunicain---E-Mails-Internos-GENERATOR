import React, { useRef, useEffect } from 'react';
import { Send, Edit2, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatEditorProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export const ChatEditor: React.FC<ChatEditorProps> = ({ messages, onSendMessage, isProcessing }) => {
  const [input, setInput] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center gap-2">
        <Sparkles className="text-purple-600" size={20} />
        <h3 className="font-semibold text-gray-700">Editor IA</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-sm">Envie a pauta no campo acima para começar.</p>
          </div>
        )}
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-purple-600 text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-700 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isProcessing && (
           <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
               <Bot size={16} />
             </div>
             <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
               <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
             </div>
           </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Peça alterações (ex: 'Deixe o tom mais formal')..."
            className="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            disabled={isProcessing}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};