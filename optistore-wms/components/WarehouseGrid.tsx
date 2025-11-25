import React, { useMemo } from 'react';
import { Spot, Pallet } from '../types';
import { TOTAL_RACKS, ROWS_PER_RACK } from '../constants';

interface WarehouseGridProps {
  inventory: Spot[];
  onSpotClick: (spot: Spot) => void;
}

const WarehouseGrid: React.FC<WarehouseGridProps> = ({ inventory, onSpotClick }) => {
  
  // Group spots by Rack ID for easy rendering
  const racks = useMemo(() => {
    const grouped: Record<number, Spot[]> = {};
    for (let i = 1; i <= TOTAL_RACKS; i++) {
      grouped[i] = [];
    }
    inventory.forEach(spot => {
      if (grouped[spot.rackId]) {
        grouped[spot.rackId].push(spot);
      }
    });
    // Ensure rows are sorted 1-5 inside each rack
    Object.values(grouped).forEach(rackSpots => {
      rackSpots.sort((a, b) => a.rowId - b.rowId);
    });
    return grouped;
  }, [inventory]);

  const getSpotColor = (spot: Spot) => {
    if (!spot.pallet) return 'bg-gray-800 border-gray-700';
    
    // Color logic based on age (FIFO visualization)
    const now = new Date().getTime();
    const age = now - spot.pallet.receivedAt.getTime();
    const hour = 1000 * 60 * 60;
    
    if (age > hour * 24 * 30) return 'bg-red-900 border-red-700'; // Old (> 30 days)
    if (age > hour * 24 * 7) return 'bg-amber-700 border-amber-600'; // Medium (> 7 days)
    return 'bg-blue-600 border-blue-500'; // Fresh
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 p-4 overflow-y-auto h-full pb-24">
      {Object.keys(racks).map((rackIdStr) => {
        const rackId = parseInt(rackIdStr);
        const spots = racks[rackId];

        return (
          <div key={rackId} className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xs font-bold text-gray-400 text-center mb-1">Rack {rackId}</div>
            <div className="flex flex-col-reverse gap-1"> {/* Reverse to stack bottom-up visually */}
              {spots.map((spot) => (
                <div
                  key={`${spot.rackId}-${spot.rowId}`}
                  onClick={() => onSpotClick(spot)}
                  className={`
                    h-6 w-full rounded border text-[10px] flex items-center justify-center cursor-pointer transition-colors
                    ${getSpotColor(spot)}
                    hover:brightness-110
                  `}
                  title={spot.pallet ? `${spot.pallet.name} (SKU: ${spot.pallet.sku})\nRow: ${spot.rowId}` : `Empty - Row ${spot.rowId}`}
                >
                   {spot.pallet ? (
                     <span className="truncate px-1 text-white font-mono">{spot.pallet.sku.split('-')[1] || 'ITEM'}</span>
                   ) : (
                     <span className="text-gray-600">-</span>
                   )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WarehouseGrid;