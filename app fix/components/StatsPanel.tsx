import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { WarehouseStats, Spot } from '../types';

interface StatsPanelProps {
  stats: WarehouseStats;
  inventory: Spot[];
}

const COLORS = ['#2563eb', '#1f2937']; // Blue (Used), Dark Gray (Empty)

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, inventory }) => {
  
  const data = [
    { name: 'Used', value: stats.usedCapacity },
    { name: 'Available', value: stats.totalCapacity - stats.usedCapacity },
  ];

  // Calculate category distribution
  const categoryData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    inventory.forEach(s => {
      if (s.pallet) {
        counts[s.pallet.category] = (counts[s.pallet.category] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* KPI Cards */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col justify-between">
        <div>
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Occupancy Rate</h3>
          <p className="text-4xl font-bold text-white mt-2">
            {(stats.occupancyRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="mt-4 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500" 
            style={{ width: `${stats.occupancyRate * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col justify-between">
        <div>
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Pallets</h3>
          <p className="text-4xl font-bold text-white mt-2">{stats.usedCapacity}</p>
        </div>
        <p className="text-gray-500 text-sm mt-2">Across 56 Racks</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col justify-between">
        <div>
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Available Spots</h3>
          <p className="text-4xl font-bold text-green-500 mt-2">{stats.totalCapacity - stats.usedCapacity}</p>
        </div>
        <p className="text-gray-500 text-sm mt-2">Capacity: {stats.totalCapacity}</p>
      </div>

       {/* Simple Pie Chart */}
       <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 h-40">
        <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Category Split</h3>
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData.slice(0, 5)}>
              <XAxis dataKey="name" hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsPanel;