import React, { useState } from 'react';
import { MOCK_PRODUCTS } from '../constants';
import { Pallet } from '../types';

interface InboundFormProps {
  onReceive: (sku: string, qty: number, customName?: string, customCat?: string) => void;
  isFull: boolean;
}

const InboundForm: React.FC<InboundFormProps> = ({ onReceive, isFull }) => {
  const [selectedSku, setSelectedSku] = useState(MOCK_PRODUCTS[0].sku);
  const [quantity, setQuantity] = useState(1);
  const [isCustom, setIsCustom] = useState(false);
  
  // Custom fields
  const [customSku, setCustomSku] = useState('');
  const [customName, setCustomName] = useState('');
  const [customCat, setCustomCat] = useState('General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFull) return;
    
    if (isCustom) {
      if (!customSku || !customName) return;
      onReceive(customSku, quantity, customName, customCat);
    } else {
      onReceive(selectedSku, quantity);
    }
    
    // Reset slightly
    setQuantity(1);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        Inbound Receiving
      </h2>
      
      {isFull ? (
        <div className="p-4 bg-red-900/30 border border-red-500 text-red-200 rounded mb-4">
          Warehouse is at Maximum Capacity! Cannot receive more items.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="flex gap-4 mb-4">
            <button 
              type="button"
              onClick={() => setIsCustom(false)}
              className={`flex-1 py-2 rounded text-sm font-medium ${!isCustom ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              Select Existing
            </button>
            <button 
              type="button"
              onClick={() => setIsCustom(true)}
              className={`flex-1 py-2 rounded text-sm font-medium ${isCustom ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}
            >
              New Product
            </button>
          </div>

          {!isCustom ? (
            <div>
              <label className="block text-gray-400 text-sm mb-1">Product SKU</label>
              <select 
                value={selectedSku} 
                onChange={(e) => setSelectedSku(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
              >
                {MOCK_PRODUCTS.map(p => (
                  <option key={p.sku} value={p.sku}>{p.sku} - {p.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
               <div>
                <label className="block text-gray-400 text-sm mb-1">New SKU</label>
                <input 
                  type="text" 
                  required
                  value={customSku}
                  onChange={(e) => setCustomSku(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g. XY-999"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                  placeholder="e.g. Super Widget"
                />
              </div>
               <div>
                <label className="block text-gray-400 text-sm mb-1">Category</label>
                <input 
                  type="text" 
                  required
                  value={customCat}
                  onChange={(e) => setCustomCat(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-gray-400 text-sm mb-1">Quantity (Pallets)</label>
            <input 
              type="number" 
              min="1" 
              max="50"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Each unit represents one full pallet slot.</p>
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-lg transform transition active:scale-95"
          >
            Receive Pallets
          </button>
        </form>
      )}
    </div>
  );
};

export default InboundForm;