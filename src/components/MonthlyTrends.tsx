import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { type Transaction } from '@/lib/types';
import { format, parseISO, subMonths } from 'date-fns';

interface MonthlyTrendsProps {
  transactions: Transaction[];
}

// Shadcn-Inspired Custom Tooltip for Timeline Data
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-200 min-w-[200px]">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 border-b border-gray-100 pb-2">
          {label}
        </p>
        <div className="space-y-3">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full shadow-sm" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  {entry.name}
                </span>
              </div>
              <span className={`text-base font-black tracking-tighter ${entry.name === 'Expenses' ? 'text-rose-600' : 'text-emerald-600'}`}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function MonthlyTrends({ transactions }: MonthlyTrendsProps) {
  // Aggregate data for the last 6 months
  const chartData = useMemo(() => {
    const monthsMap = new Map<string, { month: string; expenses: number; income: number }>();
    
    // Initialize the last 6 months with 0 to ensure continuous interpolation
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, 'MMM yyyy');
      monthsMap.set(monthKey, { month: format(date, 'MMM'), expenses: 0, income: 0 });
    }

    transactions.forEach(tx => {
      if (!tx.date) return;
      
      const txDate = parseISO(tx.date);
      const monthKey = format(txDate, 'MMM yyyy');
      
      if (monthsMap.has(monthKey)) {
        const current = monthsMap.get(monthKey)!;
        if (tx.type === 'expense') current.expenses += tx.amount;
        if (tx.type === 'income') current.income += tx.amount;
      }
    });

    return Array.from(monthsMap.values());
  }, [transactions]);

  // Determine if the chart has any meaningful data to prevent flatlining on empty states
  const hasData = chartData.some(data => data.income > 0 || data.expenses > 0);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col transition-all hover:shadow-md">
      <div className="mb-8">
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">Cash Flow Trajectory</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          6-Month Aggregated Timeline
        </p>
      </div>
      
      <div className="flex-1 h-[350px] w-full relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Refined SVG Gradients for a smoother, modern falloff */}
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                dy={15} 
              />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                tickFormatter={(value) => `$${value}`}
                dx={-10}
              />
              
              <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }} />
              
              <Area 
                type="monotone" 
                dataKey="income" 
                name="Income" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorIncome)" 
                animationBegin={200}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              
              <Area 
                type="monotone" 
                dataKey="expenses" 
                name="Expenses" 
                stroke="#f43f5e" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorExpenses)" 
                animationBegin={400}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
              Telemetry Offline
            </p>
            <p className="text-xs text-gray-500 font-medium">
              Awaiting sufficient ledger entries to render trajectory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}