import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

// Create the transaction context
const TransactionContext = createContext();

// Custom hook to use the transaction context
export const useTransactions = () => {
  return useContext(TransactionContext);
};

// Provider component
export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Fetch transactions from Firestore
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const transactionData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTransactions(transactionData);
        setError(null);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentUser]);

  // Add a new transaction
  const addTransaction = async (transaction) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Add userId and additional required fields to the transaction
      const transactionWithUser = {
        ...transaction,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        // Ensure accountType exists (personal or business)
        accountType: transaction.accountType || 'personal',
        // For split payments
        isShared: transaction.isShared || false,
        sharedWith: transaction.sharedWith || [],
        paymentStatus: transaction.paymentStatus || 'completed', // 'pending', 'completed'
        // For voice notes
        voiceNoteUrl: transaction.voiceNoteUrl || null
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, "transactions"), transactionWithUser);
      
      // Update local state
      setTransactions(prev => [
        { id: docRef.id, ...transactionWithUser },
        ...prev
      ]);
      
      return docRef.id;
    } catch (err) {
      console.error("Error adding transaction:", err);
      setError("Failed to add transaction. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Delete from Firestore
      await deleteDoc(doc(db, "transactions", id));
      
      // Update local state
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError("Failed to delete transaction. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a transaction
  const updateTransaction = async (id, updatedData) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Update in Firestore
      await updateDoc(doc(db, "transactions", id), updatedData);
      
      // Update local state
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id 
            ? { ...transaction, ...updatedData }
            : transaction
        )
      );
    } catch (err) {
      console.error("Error updating transaction:", err);
      setError("Failed to update transaction. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get transactions by account type (personal/business)
  const getTransactionsByAccountType = (accountType) => {
    return transactions.filter(transaction => transaction.accountType === accountType);
  };

  // Get personal transactions
  const getPersonalTransactions = () => {
    return transactions.filter(transaction => transaction.accountType === 'personal');
  };

  // Get business transactions
  const getBusinessTransactions = () => {
    return transactions.filter(transaction => transaction.accountType === 'business');
  };

  // Get shared transactions
  const getSharedTransactions = () => {
    return transactions.filter(transaction => transaction.isShared);
  };

  // Get transactions by payment status
  const getTransactionsByPaymentStatus = (status) => {
    return transactions.filter(transaction => transaction.paymentStatus === status);
  };

  // Get transactions by date range
  const getTransactionsByDateRange = (startDate, endDate) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  // Calculate totals by type and account type
  const calculateTotals = (accountType = null) => {
    let filteredTransactions = transactions;
    if (accountType) {
      filteredTransactions = transactions.filter(t => t.accountType === accountType);
    }

    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    return {
      income,
      expenses,
      balance: income - expenses
    };
  };

  // For testing purposes, add some mock data if we don't have Firebase
  useEffect(() => {
    // If not using Firebase or in development mode, add sample data
    if (!currentUser && process.env.NODE_ENV === 'development') {
      const sampleTransactions = [
        {
          id: '1',
          type: 'income',
          amount: 2500,
          category: 'Salary',
          accountType: 'personal',
          isShared: false,
          sharedWith: [],
          notes: 'Monthly salary',
          date: new Date(2025, 1, 15).toISOString(),
          paymentStatus: 'completed'
        },
        {
          id: '2',
          type: 'expense',
          amount: 850,
          category: 'Housing',
          accountType: 'personal',
          isShared: true,
          sharedWith: ['roommate@example.com'],
          notes: 'Rent payment',
          date: new Date(2025, 1, 18).toISOString(),
          paymentStatus: 'completed'
        },
        {
          id: '3',
          type: 'expense',
          amount: 120,
          category: 'Food & Dining',
          accountType: 'personal',
          isShared: false,
          sharedWith: [],
          notes: 'Grocery shopping',
          date: new Date(2025, 1, 20).toISOString(),
          paymentStatus: 'completed'
        },
        {
          id: '4',
          type: 'expense',
          amount: 65,
          category: 'Transportation',
          accountType: 'business',
          isShared: false,
          sharedWith: [],
          notes: 'Gas',
          date: new Date(2025, 1, 22).toISOString(),
          paymentStatus: 'completed'
        },
        {
          id: '5',
          type: 'income',
          amount: 350,
          category: 'Freelance',
          accountType: 'business',
          isShared: false,
          sharedWith: [],
          notes: 'Design project',
          date: new Date(2025, 1, 25).toISOString(),
          paymentStatus: 'pending'
        }
      ];
      
      setTransactions(sampleTransactions);
      setLoading(false);
    }
  }, [currentUser]);

  // Context value
  const value = {
    transactions,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getTransactionsByAccountType,
    getPersonalTransactions,
    getBusinessTransactions,
    getSharedTransactions,
    getTransactionsByPaymentStatus,
    getTransactionsByDateRange,
    calculateTotals
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};
