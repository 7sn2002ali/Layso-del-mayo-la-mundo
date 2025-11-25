import React, { useState } from 'react';
import { chatWithInventory } from '../services/geminiService';
import { Spot } from '../types';

interface AIAssistantProps {
  inventory: Spot[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ inventory }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Hello! I'm your WMS Assistant. Ask me about stock levels, item locations, or warehouse status."}
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    const response = await chatWithInventory(userMsg, inventory);
    
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setLoading(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col h-[600px] shadow-lg">
       <div className="p-4 border-b border-gray-700 bg-gray-800 rounded-t-xl flex items-center">
         <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse mr-2"></div>
         <h2 className="text-lg font-bold text-white">Gemini Warehouse Assistant</h2>
       </div>

       <div className="flex-1 overflow-y-auto p-4 space-y-4">
         {messages.map((m, idx) => (
           <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
               {m.text}
             </div>
           </div>
         ))}
         {loading && (
           <div className="flex justify-start">
             <div className="bg-gray-700 p-3 rounded-lg flex space-x-1">
               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
         )}
       </div>

       <form onSubmit={handleSend} className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-xl flex gap-2">
         <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., Where are the oldest Brake Pads?"
            className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
         />
         <button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-bold disabled:opacity-50"
         >
           Send
         </button>
       </form>
    </div>
  );
};

export default AIAssistant;