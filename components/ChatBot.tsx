import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { chatWithGemini } from '../services/geminiService';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

interface ChatBotProps {
  contextData: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', sender: 'ai', text: 'Hola, soy tu asistente de ventas inteligente. ¿En qué puedo ayudarte hoy para alcanzar tu meta de $1M?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: crypto.randomUUID(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithGemini(input, contextData);
      const aiMessage: Message = { id: crypto.randomUUID(), sender: 'ai', text: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { id: crypto.randomUUID(), sender: 'ai', text: 'Lo siento, tuve un problema al pensar. Inténtalo de nuevo.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all z-40 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300" style={{ height: '500px', maxHeight: '80vh' }}>
          
          {/* Header */}
          <div className="bg-indigo-900 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-700 rounded-lg">
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Asistente IA</h3>
                <p className="text-xs text-indigo-300">Modo Pensamiento Profundo</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span className="text-xs text-gray-500 font-medium">Pensando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Pregunta sobre tus ventas..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent focus:bg-white border focus:border-indigo-500 rounded-xl text-sm outline-none transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-2">
               <span className="text-[10px] text-gray-400">Powered by Gemini 3 Pro Preview</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};