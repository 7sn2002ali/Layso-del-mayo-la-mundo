import React, { useState, useEffect, useCallback } from 'react';
import { Spot, Pallet, Tab, WarehouseStats, OperationLog } from './types';
import { TOTAL_RACKS, ROWS_PER_RACK, MOCK_PRODUCTS } from './constants';
import WarehouseGrid from './components/WarehouseGrid';
import StatsPanel from './components/StatsPanel';
import InboundForm from './components/InboundForm';
import OutboundForm from './components/OutboundForm';
import AIAssistant from './components/AIAssistant';
import { generateWarehouseInsight, generateMockData } from './services/geminiService';

// Initial Empty Warehouse State
const createInitialState = (): Spot[] => {
  const spots: Spot[] = [];
  for (let r = 1; r <= TOTAL_RACKS; r++) {
    for (let l = 1; l <= ROWS_PER_RACK; l++) {
      spots.push({ rackId: r, rowId: l, pallet: null });
    }
  }
  return spots;
};

export default function App() {
  const [inventory, setInventory] = useState<Spot[]>(createInitialState());
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [insight, setInsight] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // Stats derivation
  const stats: WarehouseStats = {
    totalCapacity: inventory.length,
    usedCapacity: inventory.filter(s => s.pallet !== null).length,
    occupancyRate: inventory.filter(s => s.pallet !== null).length / inventory.length,
    uniqueSkus: new Set(inventory.filter(s => s.pallet).map(s => s.pallet!.sku)).size
  };

  // Log Helper
  const addLog = (type: OperationLog['type'], message: string) => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date()
    }, ...prev]);
  };

  // ----- FIFO LOGIC CORE ----- //

  // Find next empty spot (Lowest Rack ID, Lowest Row ID)
  const findNextEmptySpot = (): Spot | undefined => {
    // Sort logic: Rack Ascending, then Row Ascending
    const emptySpots = inventory.filter(s => s.pallet === null);
    if (emptySpots.length === 0) return undefined;
    
    // Default sorting of array is usually by index which matches creation order (1-1, 1-2... 56-5)
    // But to be safe and explicit:
    return emptySpots.sort((a, b) => {
      if (a.rackId !== b.rackId) return a.rackId - b.rackId;
      return a.rowId - b.rowId;
    })[0];
  };

  // Find oldest pallet for a SKU (FIFO)
  const findOldestPallets = (sku: string, qty: number): Spot[] => {
    const relevantSpots = inventory.filter(s => s.pallet && s.pallet.sku === sku);
    
    // Sort by Date Ascending (Oldest first)
    relevantSpots.sort((a, b) => {
      return a.pallet!.receivedAt.getTime() - b.pallet!.receivedAt.getTime();
    });

    return relevantSpots.slice(0, qty);
  };

  const handleReceive = (sku: string, qty: number, customName?: string, customCat?: string) => {
    let currentInventory = [...inventory];
    let successCount = 0;

    const productInfo = MOCK_PRODUCTS.find(p => p.sku === sku) || { 
      sku, 
      name: customName || 'Unknown', 
      category: customCat || 'General' 
    };

    for (let i = 0; i < qty; i++) {
      // Must recalculate next empty spot based on mutation in loop
      // We can optimize by filtering currentInventory inside the loop
      const emptySpotIndex = currentInventory.findIndex(s => s.pallet === null); // Finds first because array is ordered 1-1 to 56-5
      
      if (emptySpotIndex === -1) {
        addLog('ERROR', `Warehouse Full! Could not receive remaining ${qty - successCount} units of ${sku}.`);
        break;
      }

      const newPallet: Pallet = {
        id: Math.random().toString(36).substr(2, 9),
        sku: productInfo.sku,
        name: productInfo.name,
        category: productInfo.category,
        receivedAt: new Date() // Current timestamp
      };

      currentInventory[emptySpotIndex] = {
        ...currentInventory[emptySpotIndex],
        pallet: newPallet
      };
      
      successCount++;
    }

    if (successCount > 0) {
      setInventory(currentInventory);
      addLog('INBOUND', `Received ${successCount} pallets of ${productInfo.name} (${sku}).`);
    }
  };

  const handleShip = (sku: string, qty: number) => {
    const spotsToClear = findOldestPallets(sku, qty);
    
    if (spotsToClear.length < qty) {
      addLog('ERROR', `Insufficient stock for ${sku}. Requested: ${qty}, Available: ${spotsToClear.length}`);
      return; // Atomic operation: all or nothing? Let's do nothing if full request can't be met for safety
    }

    const newInventory = inventory.map(spot => {
      const isTarget = spotsToClear.find(s => s.rackId === spot.rackId && s.rowId === spot.rowId);
      if (isTarget) {
        return { ...spot, pallet: null };
      }
      return spot;
    });

    setInventory(newInventory);
    
    // Log locations for pick list
    const locations = spotsToClear.map(s => `R${s.rackId}-L${s.rowId}`).join(', ');
    addLog('OUTBOUND', `Shipped ${qty} units of ${sku}. Pick from: ${locations}`);
  };

  // AI Insights Handler
  const fetchInsight = async () => {
    setLoadingAI(true);
    const text = await generateWarehouseInsight(inventory, logs);
    setInsight(text);
    setLoadingAI(false);
  };

  // Initial Load & Mock Data
  useEffect(() => {
    // Optionally seed data? Let's just leave it empty or add a button to seed.
    addLog('AI_INSIGHT', 'System initialized. Ready for operations.');
  }, []);

  const handleSeedData = async () => {
     setLoadingAI(true);
     const mockItems = await generateMockData();
     if(mockItems.length > 0) {
        // Distribute them randomly or sequentially
        let currentInventory = [...inventory];
        let placed = 0;
        
        // Let's place 30-40 items
        for(const item of mockItems) {
            // Place 1-3 of each
            const qty = Math.floor(Math.random() * 3) + 1;
            for(let q=0; q<qty; q++) {
                const emptyIdx = currentInventory.findIndex(s => s.pallet === null);
                if(emptyIdx === -1) break;
                
                // Randomize date slightly for FIFO testing (past 30 days)
                const randomDate = new Date();
                randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 60));

                currentInventory[emptyIdx] = {
                    ...currentInventory[emptyIdx],
                    pallet: {
                        id: Math.random().toString(36).substr(2,9),
                        sku: item.sku || `GEN-${placed}`,
                        name: item.name || 'Generic Item',
                        category: item.category || 'General',
                        receivedAt: randomDate
                    }
                };
                placed++;
            }
        }
        setInventory(currentInventory);
        addLog('INBOUND', `AI Generated ${placed} mock pallets.`);
     }
     setLoadingAI(false);
  }

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-100 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">O</span>
            OptiStore
          </h1>
          <p className="text-xs text-gray-500 mt-1">WMS v2.0 • FIFO Engine</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab(Tab.DASHBOARD)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeTab === Tab.DASHBOARD ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50' : 'hover:bg-gray-700 text-gray-400'}`}
          >
            <span className="mr-3">📊</span> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab(Tab.INBOUND)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeTab === Tab.INBOUND ? 'bg-green-600/20 text-green-400 border border-green-600/50' : 'hover:bg-gray-700 text-gray-400'}`}
          >
            <span className="mr-3">📥</span> Inbound
          </button>
          <button 
            onClick={() => setActiveTab(Tab.OUTBOUND)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeTab === Tab.OUTBOUND ? 'bg-amber-600/20 text-amber-400 border border-amber-600/50' : 'hover:bg-gray-700 text-gray-400'}`}
          >
            <span className="mr-3">📤</span> Outbound
          </button>
          <button 
            onClick={() => setActiveTab(Tab.AI_ASSISTANT)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeTab === Tab.AI_ASSISTANT ? 'bg-purple-600/20 text-purple-400 border border-purple-600/50' : 'hover:bg-gray-700 text-gray-400'}`}
          >
            <span className="mr-3">✨</span> AI Assistant
          </button>
        </nav>

        <div className="p-4 border-t border-gray-700">
            <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase">Recent Logs</h3>
            <div className="h-32 overflow-y-auto space-y-2 text-xs">
                {logs.slice(0, 10).map(log => (
                    <div key={log.id} className="text-gray-400 pb-1 border-b border-gray-700/50 last:border-0">
                        <span className={`font-bold ${log.type === 'INBOUND' ? 'text-green-500' : log.type === 'OUTBOUND' ? 'text-amber-500' : log.type === 'ERROR' ? 'text-red-500' : 'text-purple-500'}`}>
                            [{log.type.substring(0,3)}]
                        </span> {log.message}
                    </div>
                ))}
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 border-b border-gray-700 bg-gray-800/50 backdrop-blur flex items-center justify-between px-6">
           <div className="flex items-center gap-4">
               <h2 className="text-xl font-semibold text-white">
                   {activeTab === Tab.DASHBOARD && 'Warehouse Overview'}
                   {activeTab === Tab.INBOUND && 'Receive Inventory'}
                   {activeTab === Tab.OUTBOUND && 'Ship Inventory'}
                   {activeTab === Tab.AI_ASSISTANT && 'Intelligent Assistant'}
               </h2>
               {activeTab === Tab.DASHBOARD && (
                   <button 
                    onClick={handleSeedData} 
                    disabled={loadingAI}
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-gray-300 border border-gray-600"
                   >
                       {loadingAI ? 'Generating...' : '+ Demo Data'}
                   </button>
               )}
           </div>

           <div className="flex items-center gap-4">
              {/* Quick AI Insight Banner */}
               <div className="hidden lg:flex items-center bg-purple-900/20 border border-purple-500/30 px-3 py-1 rounded-full">
                  <span className="text-purple-400 text-xs mr-2">✨ AI Insight:</span>
                  <span className="text-gray-300 text-xs truncate max-w-xs" title={insight || "Click refresh to analyze"}>
                      {insight || "System operating normally."}
                  </span>
                  <button onClick={fetchInsight} className="ml-2 text-purple-400 hover:text-white">
                    <svg className={`w-3 h-3 ${loadingAI ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </button>
               </div>
               
               <div className="text-right">
                   <div className="text-xs text-gray-400">Total Capacity</div>
                   <div className="text-sm font-mono font-bold">{stats.usedCapacity} / {stats.totalCapacity}</div>
               </div>
           </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-auto p-6 relative">
            
            {activeTab === Tab.DASHBOARD && (
                <>
                    <StatsPanel stats={stats} inventory={inventory} />
                    <h3 className="text-lg font-bold text-white mb-4">Warehouse Map (56 Racks)</h3>
                    <WarehouseGrid inventory={inventory} onSpotClick={setSelectedSpot} />
                </>
            )}

            {activeTab === Tab.INBOUND && (
                <div className="flex flex-col items-center justify-center h-full">
                     <InboundForm onReceive={handleReceive} isFull={stats.usedCapacity >= stats.totalCapacity} />
                     <div className="mt-8 text-center text-gray-500 text-sm max-w-md">
                         Items are automatically assigned to the first available Rack/Row following sequence (1-1 to 56-5).
                     </div>
                </div>
            )}

            {activeTab === Tab.OUTBOUND && (
                <div className="flex flex-col items-center justify-center h-full">
                    <OutboundForm inventory={inventory} onShip={handleShip} />
                </div>
            )}

            {activeTab === Tab.AI_ASSISTANT && (
                <div className="max-w-4xl mx-auto h-full">
                    <AIAssistant inventory={inventory} />
                </div>
            )}

            {/* Modal for Spot Details */}
            {selectedSpot && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-600 shadow-2xl max-w-sm w-full p-6 relative">
                        <button 
                            onClick={() => setSelectedSpot(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-bold text-white mb-2">
                            Location: Rack {selectedSpot.rackId} - Level {selectedSpot.rowId}
                        </h3>
                        <div className="h-px bg-gray-700 my-4" />
                        
                        {selectedSpot.pallet ? (
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Status</span>
                                    <span className="text-green-400 font-bold bg-green-900/30 px-2 py-0.5 rounded">OCCUPIED</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">SKU</span>
                                    <span className="text-white font-mono">{selectedSpot.pallet.sku}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Product</span>
                                    <span className="text-white">{selectedSpot.pallet.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Category</span>
                                    <span className="text-white">{selectedSpot.pallet.category}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Received</span>
                                    <span className="text-white text-sm text-right">
                                        {selectedSpot.pallet.receivedAt.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ) : (
                             <div className="py-8 text-center">
                                 <p className="text-gray-500 mb-2">This spot is currently empty.</p>
                                 <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Ready for Inbound</span>
                             </div>
                        )}
                    </div>
                </div>
            )}

        </div>
      </main>
    </div>
  );
}