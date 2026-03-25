import React, { useState, useEffect, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { type TransactionType, type Transaction, CATEGORY_MAP } from '@/lib/types';
import { Calendar } from 'lucide-react';

const ACCOUNTS = ['Checking', 'Credit Card', 'Savings'];
const STATUSES = ['Cleared', 'Pending'];

const defaultFormData = {
  date: new Date().toISOString().split('T')[0],
  merchant: '',
  category: 'Food & Drink',
  description: '',
  amount: '',
  account: 'Checking',
  status: 'Cleared' as const
};

// Helper for category emojis (optional, based on your screenshot's vibe)
const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    'Food & Drink': '🍔',
    'Groceries': '🛒',
    'Transport': '🚗',
    'Entertainment': '📺',
    'Utilities': '💡',
    'Payroll': '💵',
    'Investments': '📈'
  };
  return icons[category] || '🏷️';
};

export default function TransactionsView(): React.JSX.Element {
  const { 
    data: transactions, 
    isLoading, 
    error, 
    fetchTransactions, 
    addTransaction, 
    editTransaction, 
    deleteTransaction 
  } = useTransactions();
  
  // --- Filter State ---
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterAccount, setFilterAccount] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Modal & Form State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => { 
    fetchTransactions(); 
  }, [fetchTransactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterAccount, startDate, endDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = (type: TransactionType) => {
    setEditingId(null);
    setTransactionType(type);
    setFormData({
      ...defaultFormData,
      date: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setTransactionType(tx.type);
    setFormData({
      date: tx.date,
      merchant: tx.merchant,
      category: tx.category,
      description: tx.description || '',
      amount: tx.amount.toString(),
      account: tx.account,
      status: tx.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = { 
      ...formData, 
      amount: parseFloat(formData.amount), 
      type: transactionType 
    };

    let success = false;

    if (editingId) {
      success = await editTransaction(editingId, payload);
    } else {
      success = await addTransaction(payload);
    }

    if (success) {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData(defaultFormData);
    }
    
    setIsSubmitting(false);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchCategory = filterCategory === 'All' || t.category === filterCategory;
      const matchAccount = filterAccount === 'All' || t.account === filterAccount;
      const matchStartDate = !startDate || t.date >= startDate;
      const matchEndDate = !endDate || t.date <= endDate;

      return matchCategory && matchAccount && matchStartDate && matchEndDate;
    });
  }, [transactions, filterCategory, filterAccount, startDate, endDate]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const currentTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatCurrency = (amount: number, type: TransactionType) => {
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    return type === 'expense' ? `-${formatted}` : `+${formatted}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Master Ledger</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium tracking-wide">Immutable transaction records.</p>
      </div>

      {/* Advanced Filter Container */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col lg:flex-row gap-6 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400 [&::-webkit-calendar-picker-indicator]:opacity-50" />
            <span className="text-gray-300 font-medium">-</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400 [&::-webkit-calendar-picker-indicator]:opacity-50" />
          </div>
        </div>

        <div className="flex-1 w-full">
           <label className="block text-sm font-semibold text-gray-700 mb-2">Categories</label>
           <div className="relative">
             <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer">
                <option value="All">All Categories</option>
                {Object.keys(CATEGORY_MAP).map(cat => <option key={cat} value={cat}>{cat}</option>)}
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
           </div>
        </div>

        <div className="flex-1 w-full">
           <label className="block text-sm font-semibold text-gray-700 mb-2">Account</label>
           <div className="relative">
             <select value={filterAccount} onChange={e => setFilterAccount(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer">
                <option value="All">All Accounts</option>
                {ACCOUNTS.map(acc => <option key={acc} value={acc}>{acc}</option>)}
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
           </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded border-l-4 border-red-600">
          <p className="text-xs font-black text-red-800 uppercase tracking-widest">Network Error</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Main Table Area */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="hidden md:flex items-center text-sm font-bold text-gray-700">
            Recent Transactions
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => handleOpenAdd('expense')} 
              className="bg-emerald-500 text-white px-4 py-2 text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-sm"
            >
              <span>+</span> Record Expense
            </button>
            <button 
              onClick={() => handleOpenAdd('income')} 
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <span>+</span> Record Income
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 border-b border-gray-200">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 border-b border-gray-200">Merchant</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 border-b border-gray-200">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 border-b border-gray-200">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 border-b border-gray-200 text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 border-b border-gray-200">Account</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 border-b border-gray-200 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 border-b border-gray-200 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Fetching Ledger Data...</span>
                  </td>
                </tr>
              ) : currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-gray-400 font-medium tracking-wide">
                    NO RECORDS FOUND
                  </td>
                </tr>
              ) : (
                currentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">{tx.date}</td>
                    <td className="px-6 py-4 text-gray-700">{tx.merchant}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-gray-700 border border-yellow-100">
                        {getCategoryIcon(tx.category)} {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{tx.description || '-'}</td>
                    <td className={`px-6 py-4 font-bold text-right ${tx.type === 'expense' ? 'text-red-600' : 'text-emerald-500'}`}>
                      {formatCurrency(tx.amount, tx.type)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{tx.account}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${tx.status === 'Cleared' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEdit(tx)} className="text-xs font-bold text-blue-500 hover:text-blue-700 transition-all">Edit</button>
                      <button onClick={() => deleteTransaction(tx.id)} className="text-xs font-bold text-red-400 hover:text-red-600 transition-all">Void</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex justify-between bg-gray-50 text-xs font-bold uppercase tracking-widest">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-gray-900 disabled:text-gray-300 hover:text-gray-600 transition-colors">
            PREV
          </button>
          <span className="text-gray-500">PAGE {currentPage} OF {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="text-gray-900 disabled:text-gray-300 hover:text-gray-600 transition-colors">
            NEXT
          </button>
        </div>
      </div>

      {/* Data Entry/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
              {editingId ? 'Edit' : 'Record'} {transactionType === 'expense' ? 'Expense' : 'Income'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                  <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount</label>
                  <input required type="number" step="0.01" min="0.01" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{transactionType === 'expense' ? 'Merchant' : 'Source'}</label>
                <input required type="text" name="merchant" value={formData.merchant} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="e.g. Server Hosting" />
              </div>

              {/* NEW DESCRIPTION FIELD */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description (Optional)</label>
                <input type="text" name="description" value={formData.description} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="Add notes or details..." />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer">
                    {Object.keys(CATEGORY_MAP).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account</label>
                  <select name="account" value={formData.account} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer">
                    {ACCOUNTS.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer">
                    {STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-emerald-500 text-white px-6 py-2 text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-sm">
                  {isSubmitting ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}