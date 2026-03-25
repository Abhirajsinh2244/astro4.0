import React, { useEffect, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { CATEGORY_MAP } from '@/lib/types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

// Professional Grade Monochromatic & Accent Palette for the Chart
const CHART_COLORS = [
  '#0f172a', // Slate 900
  '#334155', // Slate 700
  '#64748b', // Slate 500
  '#94a3b8', // Slate 400
  '#cbd5e1', // Slate 300
  '#10b981', // Emerald 500 (Accent)
  '#f43f5e', // Rose 500 (Accent)
];

// Custom Tooltip for Shadcn Aesthetic
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
          {payload[0].name}
        </p>
        <p className="text-xl font-black text-gray-900 tracking-tighter">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function BudgetsView(): React.JSX.Element {
  const { data: transactions, isLoading, error, fetchTransactions } = useTransactions();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Advanced Data Aggregation Engine
  const { categoryData, totalExpenses } = useMemo(() => {
    let aggregatedTotal = 0;
    const categoryTotals: Record<string, number> = {};

    Object.keys(CATEGORY_MAP).forEach(cat => {
      categoryTotals[cat] = 0;
    });

    transactions.forEach(tx => {
      if (tx.type === 'expense') {
        categoryTotals[tx.category] += tx.amount;
        aggregatedTotal += tx.amount;
      }
    });

    const mappedData = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: category,       // Renamed to 'name' for Recharts compatibility
        value: amount,        // Renamed to 'value' for Recharts compatibility
        percentage: aggregatedTotal > 0 ? (amount / aggregatedTotal) * 100 : 0,
      }))
      .filter(item => item.value > 0) // Only render categories with actual spend in the chart
      .sort((a, b) => b.value - a.value);

    return { categoryData: mappedData, totalExpenses: aggregatedTotal };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[600px] border border-gray-200 bg-white shadow-sm rounded-xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
            Compiling Analytics...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-600 shadow-sm">
        <p className="text-xs font-black text-red-800 uppercase tracking-widest">Analytics Engine Failure</p>
        <p className="text-sm text-red-700 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Budget Analytics</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium tracking-wide">
          Comprehensive visualization of your outbound cash flow distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Interactive Shadcn-style Chart */}
        <div className="xl:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">Distribution Matrix</h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
            Visualized Capital Allocation
          </p>
          
          <div className="flex-1 min-h-[400px] w-full relative">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={110}
                    outerRadius={150}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    animationBegin={200}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        className="transition-all duration-300 hover:opacity-80 outline-none"
                      />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-sm font-semibold text-gray-700 ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  No Expense Data Available
                </p>
              </div>
            )}
            
            {/* Center Label for the Donut Chart */}
            {categoryData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                  Total Spend
                </span>
                <span className="text-3xl font-black text-gray-900 tracking-tighter">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Key Metrics & Linear Progress Indicators */}
        <div className="space-y-8">
          
          {/* Executive Summary Card */}
          <div className="bg-gray-900 text-white p-8 rounded-xl shadow-xl border border-gray-800 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 border-b border-gray-700 pb-3">
                Total Outbound Capital
              </p>
              <h3 className="text-5xl font-black tracking-tighter text-white">
                {formatCurrency(totalExpenses)}
              </h3>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-gray-100 pb-3">
              Categorical Breakdown
            </p>
            
            <div className="space-y-6">
              {categoryData.length > 0 ? categoryData.map((item, index) => (
                <div key={item.name} className="group cursor-default">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      {/* Legend Color Dot */}
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-gray-900 tracking-tighter mr-3">
                        {formatCurrency(item.value)}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {/* Linear Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full transition-all duration-1000 ease-out rounded-full"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              )) : (
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center py-4">
                  Insufficient Data
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}