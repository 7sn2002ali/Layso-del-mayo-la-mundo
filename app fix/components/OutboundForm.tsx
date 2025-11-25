import React, { useMemo, useState } from 'react';
import { Spot } from '../types';

interface OutboundFormProps {
  inventory: Spot[];
  onShip: (sku: string, qty: number) => void;
}

const OutboundForm: React.FC<OutboundFormProps> = ({ inventory, onShip }) => {
  
  // Aggregate inventory by SKU
  const stockSummary = useMemo(() => {
    const summary: Record<string, { name: string, count: number, oldest: Date }> = {};
    
    inventory.forEach(spot => {
      if (spot.pallet) {
        if (!summary[spot.pallet.sku]) {
          summary[spot.pallet.sku] = { 
            name: spot.pallet.name, 
            count: 0, 
            oldest: spot.pallet.receivedAt 
          };
        }
        summary[spot.pallet.sku].count += 1;
        // Check for oldest (FIFO check)
        if (spot.pallet.receivedAt < summary[spot.pallet.sku].oldest) {
          summary[spot.pallet.sku].oldest = spot.pallet.receivedAt;
        }
      }
    });
    return summary;
  }, [inventory]);

  const [selectedSku, setSelectedSku] = useState<string>('');
  const [shipQty, setShipQty] = useState(1);

  const availableSkus = Object.keys(stockSummary);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku) return;
    onShip(selectedSku, shipQty);
    setShipQty(1); // Reset
  };

  const selectedStock = selectedSku ? stockSummary[selectedSku] : null;

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
        Outbound Shipping (FIFO)
      </h2>

      {availableSkus.length === 0 ? (
         <div className="p-4 bg-gray-700/50 border border-gray-600 text-gray-300 rounded text-center">
           Warehouse is empty. Receive items first.
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Select Product to Ship</label>
            <select 
              value={selectedSku} 
              onChange={(e) => {
                setSelectedSku(e.target.value);
                setShipQty(1);
              }}
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
            >
              <option value="">-- Select SKU --</option>
              {availableSkus.map(sku => (
                <option key={sku} value={sku}>
                  {sku} - {stockSummary[sku].name} (Qty: {stockSummary[sku].count})
                </option>
              ))}
            </select>
          </div>

          {selectedStock && (
            <div className="bg-gray-700/30 p-4 rounded border border-gray-600">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-gray-400 text-sm">Available Stock:</span>
                 <span className="text-white font-bold">{selectedStock.count} pallets</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-400 text-sm">Oldest Stock:</span>
                 <span className="text-amber-400 text-sm font-mono">{selectedStock.oldest.toLocaleDateString()}</span>
               </div>
               <div className="text-xs text-gray-500 mt-2 italic">
                 System will automatically target the oldest pallets first.
               </div>
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm mb-1">Quantity to Ship</label>
            <input 
              type="number" 
              min="1" 
              max={selectedStock?.count || 1}
              value={shipQty}
              onChange={(e) => setShipQty(parseInt(e.target.value))}
              className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none disabled:opacity-50"
              disabled={!selectedSku}
            />
          </div>

          <button 
            type="submit" 
            disabled={!selectedSku}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold rounded shadow-lg transform transition active:scale-95"
          >
            Generate Pick List & Ship
          </button>
        </form>
      )}
    </div>
  );
};

export default OutboundForm;