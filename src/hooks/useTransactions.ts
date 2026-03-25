import { useState, useCallback } from 'react';
import type { Transaction, TransactionPayload, ApiResponse } from '@/lib/types'; 

// ... (keep the rest of the useTransactions hook logic exactly the same, only the import changed) ... 

export function useTransactions() {
  const [data, setData] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper for consistent headers
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/transactions', {
        method: 'GET',
        headers: getHeaders()
      });
      
      if (!response.ok) throw new Error(`Network protocol error: ${response.status}`);

      const result: ApiResponse<Transaction[]> = await response.json();

      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to retrieve ledger data');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected failure occurred';
      setError(message);
      console.error('[SpendWise System]:', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTransaction = async (payload: TransactionPayload): Promise<boolean> => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      
      const result: ApiResponse<Transaction> = await response.json();

      if (result.success && result.data) {
        const newData = result.data;
        setData(prev => [newData, ...prev]);
        return true;
      } else {
        console.error('[SpendWise Validation]:', result.details);
        throw new Error(result.error || 'Validation rejected by server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Commit operation failed');
      return false;
    }
  };

  const editTransaction = async (id: string, payload: TransactionPayload): Promise<boolean> => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      const result: ApiResponse<Transaction> = await response.json();

      if (result.success && result.data) {
        const updatedData = result.data;
        setData(prev => prev.map(t => t.id === id ? updatedData : t));
        return true;
      } else {
        console.error('[SpendWise Validation]:', result.details);
        throw new Error(result.error || 'Modification rejected by server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update operation failed');
      return false;
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      const result: ApiResponse<{ deletedId: string }> = await response.json();

      if (result.success) {
        setData(prev => prev.filter(t => t.id !== id));
        return true;
      } else {
        throw new Error(result.error || 'Deletion rejected by server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete operation failed');
      return false;
    }
  };

  return {
    data,
    isLoading,
    error,
    fetchTransactions,
    addTransaction,
    editTransaction,
    deleteTransaction
  };
}