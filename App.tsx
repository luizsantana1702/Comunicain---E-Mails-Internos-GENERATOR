import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, EmailVersion, PautaData } from './types';
import { generateEmailVersion } from './services/geminiService';
import { EmailCard } from './components/EmailCard';
import { ChatEditor } from './components/ChatEditor';
import { FileText, LayoutTemplate, History, AlertCircle, Smile } from 'lucide-react';

function App() {
  const [pauta, setPauta] = useState<PautaData>({ title: '', content: '', useEmojis: null });
  const [versions, setVersions] = useState<EmailVersion[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const contentEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (versions.length > 0) {
      // Scroll to the latest version smoothly
      contentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [versions]);

  const handleGenerate = async (feedback: string = '') => {
    if (!pauta.content.trim()) {
      alert("Por favor, preencha a pauta antes de gerar.");
      return;
    }

    if (pauta.useEmojis === null) {
      alert("Por favor, selecione se deseja emojis ou não.");
      return;
    }

    setIsProcessing(true);
    
    // Add user message to chat
    if (feedback) {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        content: feedback,
        timestamp: Date.now()
      }]);
    } else {
      // Initial generation message
       setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        content: `Gerar primeira versão. ${pauta.useEmojis ? 'Com emojis.' : 'Sem emojis.'}`,
        timestamp: Date.now()
      }]);
    }

    try {
      const historyContext = chatMessages.map(m => `${m.role}: ${m.content}`).join('\n');
      
      const newVersionData = await generateEmailVersion(
        `Título: ${pauta.title}\nConteúdo: ${pauta.content}`, 
        feedback, 
        historyContext,
        pauta.useEmojis || false // Default to false if null (though guarded above)
      );

      const newVersion: EmailVersion = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        sections: newVersionData.sections,
        subject: newVersionData.subject,
        feedbackUsed: feedback,
        isSimulation: newVersionData.isSimulation
      };

      setVersions(prev => [...prev, newVersion]);
      
      const botMessage = newVersionData.isSimulation 
        ? "Modo Simulação: Gerei um rascunho básico baseado no seu texto. A inteligência de edição está desativada no modo gratuito."
        : `Gerei uma nova versão (${versions.length + 1}) com base nas suas instruções. Ela foi adicionada ao feed à direita.`;

      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: botMessage,
        timestamp: Date.now()
      }]);

    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Houve um erro ao gerar o email. Tente novamente mais tarde.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              C
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">
              Comunicain <span className="text-purple-600">Generator</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {!process.env.API_KEY && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
                <AlertCircle size={14} className="text-yellow-600" />
                <span className="text-xs font-semibold text-yellow-700">Modo Gratuito (Simulação)</span>
              </div>
            )}
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm border border-purple-200">
              SE
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input & Chat (Sticky on Desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24 h-auto lg:h-[calc(100vh-8rem)]">
          
          {/* Pauta Input Block */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText size={18} className="text-purple-600" />
                Pauta / Dados
              </h2>
              <span className="text-xs text-gray-400 uppercase font-medium tracking-wide">Input</span>
            </div>
            
            <input 
              type="text" 
              placeholder="Título da Pauta (ex: Campanha Dia das Mães)"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 outline-none"
              value={pauta.title}
              onChange={(e) => setPauta(prev => ({...prev, title: e.target.value}))}
            />
            
            <textarea 
              className="w-full h-40 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:ring-1 focus:ring-purple-500 outline-none"
              placeholder="Cole aqui todas as informações, dados, aspas e contexto..."
              value={pauta.content}
              onChange={(e) => setPauta(prev => ({...prev, content: e.target.value}))}
            ></textarea>

            {/* Mandatory Emoji Toggle */}
            <div className="flex flex-col gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
               <label className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                  <Smile size={16} /> Colocar Emojis no Texto? <span className="text-xs text-red-500 font-normal">*Obrigatório</span>
               </label>
               <div className="flex gap-3">
                  <button
                    onClick={() => setPauta(prev => ({...prev, useEmojis: true}))}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      pauta.useEmojis === true 
                        ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Sim 🤩
                  </button>
                  <button
                    onClick={() => setPauta(prev => ({...prev, useEmojis: false}))}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      pauta.useEmojis === false 
                        ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Não
                  </button>
               </div>
            </div>

            {versions.length === 0 && (
              <button 
                onClick={() => handleGenerate()}
                disabled={isProcessing || !pauta.content || pauta.useEmojis === null}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={pauta.useEmojis === null ? "Selecione se deseja emojis antes de gerar" : ""}
              >
                {isProcessing ? 'Gerando...' : 'Gerar Primeira Versão'} <LayoutTemplate size={18} />
              </button>
            )}
          </div>

          {/* Chat Editor - Only shows after first generation or if manually toggled */}
          <div className="flex-1 min-h-[400px]">
             <ChatEditor 
                messages={chatMessages} 
                onSendMessage={handleGenerate} 
                isProcessing={isProcessing}
             />
          </div>
        </div>

        {/* RIGHT COLUMN: Email Feed (Scrollable) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <History size={18} className="text-purple-600" />
              Feed de Versões
            </h2>
            <span className="text-sm text-gray-500">
              {versions.length} {versions.length === 1 ? 'versão gerada' : 'versões geradas'}
            </span>
          </div>

          {versions.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center text-gray-400 min-h-[400px]">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <LayoutTemplate size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum email gerado ainda</h3>
              <p className="max-w-md">Preencha a pauta ao lado e escolha se quer emojis para criar o primeiro rascunho.</p>
            </div>
          ) : (
            <div className="space-y-8 pb-20">
              {versions.map((version, index) => (
                <div key={version.id} className="relative">
                   {/* Visual connector line between versions */}
                   {index < versions.length - 1 && (
                     <div className="absolute left-8 top-full h-8 w-0.5 bg-gray-300 z-0"></div>
                   )}
                   <EmailCard version={version} index={index} />
                </div>
              ))}
              {/* Invisible element to scroll to */}
              <div ref={contentEndRef} />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

export default App;