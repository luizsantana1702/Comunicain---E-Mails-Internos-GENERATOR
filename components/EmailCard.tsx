import React from 'react';
import { EmailVersion } from '../types';
import { Copy, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

interface EmailCardProps {
  version: EmailVersion;
  index: number;
}

export const EmailCard: React.FC<EmailCardProps> = ({ version, index }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    // Basic copy text approximation
    const textContent = version.sections.map(s => `[Texto]: ${s.text}\n[Visual]: ${s.imageKeyword}`).join('\n\n');
    navigator.clipboard.writeText(`Assunto: ${version.subject}\n\n${textContent}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-purple-100 mb-8 animate-fade-in-up transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className={`p-4 text-white flex justify-between items-center ${version.isSimulation ? 'bg-gray-600' : 'bg-gradient-to-r from-purple-700 to-indigo-600'}`}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider opacity-75 bg-black/20 px-2 py-1 rounded">
            Versão {index + 1}
          </span>
          <span className="font-medium text-white/90 text-sm">
            {new Date(version.timestamp).toLocaleTimeString()}
          </span>
          {version.isSimulation && (
            <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Modo Simulação
            </span>
          )}
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleCopy}
            className="p-2 hover:bg-white/20 rounded-full transition-colors flex items-center gap-2 text-sm"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar Pauta'}</span>
          </button>
        </div>
      </div>

      {/* Subject Line */}
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assunto Sugerido</label>
        <h2 className="text-xl font-semibold text-gray-800">{version.subject}</h2>
      </div>

      {/* Content Body */}
      <div className="p-8 space-y-12 bg-white">
        {version.sections.map((section, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col md:flex-row gap-8 items-stretch ${
              section.imagePosition === 'right' ? '' : 'md:flex-row-reverse'
            }`}
          >
            {/* Text Side */}
            <div className="flex-1 flex flex-col justify-center">
               <div className="prose prose-purple text-gray-600 text-lg leading-relaxed">
                  {/* Highlight variables */}
                  {section.text.split(/(\{\{.*?\}\})/).map((part, i) => (
                    part.startsWith('{{') && part.endsWith('}}') ? (
                      <span key={i} className="bg-yellow-100 text-yellow-800 font-mono px-1 rounded border border-yellow-200 font-bold text-base">
                        {part}
                      </span>
                    ) : (
                      <span key={i}>{part}</span>
                    )
                  ))}
               </div>
            </div>

            {/* Visual Placeholder Side */}
            <div className="flex-1 w-full md:w-auto min-h-[200px]">
              <div className="h-full w-full bg-purple-50 border-2 border-dashed border-purple-200 rounded-xl flex flex-col items-center justify-center p-6 text-center group hover:border-purple-400 transition-colors relative overflow-hidden">
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#6b21a8_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                <div className="z-10 bg-white p-3 rounded-full shadow-sm mb-3 text-purple-600 group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon size={24} />
                </div>
                
                <h4 className="z-10 text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Sugestão Visual</h4>
                
                <p className="z-10 text-gray-700 font-medium italic px-4">
                  "{section.imageKeyword}"
                </p>

                {version.isSimulation ? null : (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles size={14} className="text-purple-400" />
                    </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Branding Mockup */}
      <div className="bg-gray-50 p-6 border-t border-gray-100 flex flex-col items-center justify-center text-center space-y-2">
        <div className="h-1 w-12 bg-purple-600 rounded-full mb-2"></div>
        <p className="text-sm text-gray-500 font-medium">Comunicain Interna • Sebrae</p>
      </div>
    </div>
  );
};