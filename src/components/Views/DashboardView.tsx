import React, { useEffect, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';

// ... (keep the rest of DashboardView exactly the same) ...
export default function DashboardView(): React.JSX.Element {
  const { data: transactions, isLoading, error, fetchTransactions } = useTransactions();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    let inc = 0, exp = 0;
    transactions.forEach(tx => {
      if (tx.type === 'income') inc += tx.amount;
      if (tx.type === 'expense') exp += tx.amount;
    });
    return { totalIncome: inc, totalExpenses: exp, balance: inc - exp };
  }, [transactions]);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 w-full border border-dashed border-gray-300 bg-gray-50 rounded-lg">
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
          Initializing SpendWise Telemetry...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-600">
        <p className="text-xs font-black text-red-800 uppercase tracking-widest">System Fault Detected</p>
        <p className="text-sm text-red-700 mt-2 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Page Header Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">SpendWise Dashboard</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium tracking-wide">
          Real-time aggregation of your financial ledger.
        </p>
      </div>

      {/* Primary Telemetry Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Metric Card: Net Balance */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
            Net Capital Balance
          </p>
          <h3 className={`text-5xl font-black tracking-tighter ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </h3>
        </div>

        {/* Metric Card: Total Income */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center border-t-4 border-t-emerald-500 transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
            Inbound Cash Flow
          </p>
          <h3 className="text-4xl font-extrabold text-emerald-600 tracking-tight">
            {formatCurrency(totalIncome)}
          </h3>
        </div>

        {/* Metric Card: Total Expenses */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center border-t-4 border-t-red-500 transition-all hover:shadow-md">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
            Outbound Cash Flow
          </p>
          <h3 className="text-4xl font-extrabold text-red-600 tracking-tight">
            {formatCurrency(totalExpenses)}
          </h3>
        </div>
      </div>

      {/* Typography-Driven Information Block */}
      <div className="bg-gray-900 text-white p-10 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Ledger Integrity Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-gray-700 pt-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Entries</p>
            <p className="text-xl font-medium">{transactions.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Data Source</p>
            <p className="text-xl font-medium">Supabase PG</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Status</p>
            <p className="text-xl font-medium text-emerald-400">Synchronized</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Last Update</p>
            <p className="text-xl font-medium">Just Now</p>
          </div>
        </div>
      </div>

    </div>
  );
}