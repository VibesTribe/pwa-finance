// search-context.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, startAt, endAt } from 'firebase/firestore';
import { db, auth } from './firebase-config-updated';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    minAmount: '',
    maxAmount: '',
    accountType: 'all', // 'personal', 'business', 'all'
    categories: [],
    isShared: null,
  });

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (term) => {
    if (!term.trim()) return;
    
    const updatedSearches = [
      term,
      ...recentSearches.filter(search => search !== term).slice(0, 4)
    ];
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      minAmount: '',
      maxAmount: '',
      accountType: 'all',
      categories: [],
      isShared: null,
    });
  };

  // Search function
  const searchTransactions = async (searchTerm = '') => {
    if (!auth.currentUser) return;

    try {
      setIsSearching(true);
      
      // Build query based on filters
      let transactionsRef = collection(db, 'transactions');
      let conditions = [where('userId', '==', auth.currentUser.uid)];
      
      // Account type filter
      if (filters.accountType !== 'all') {
        conditions.push(where('accountType', '==', filters.accountType));
      }
      
      // Shared expenses filter
      if (filters.isShared !== null) {
        conditions.push(where('isShared', '==', filters.isShared));
      }
      
      // Date range filter
      if (filters.startDate) {
        conditions.push(where('date', '>=', filters.startDate));
      }
      
      if (filters.endDate) {
        conditions.push(where('date', '<=', filters.endDate));
      }
      
      // Category filter
      if (filters.categories.length > 0) {
        conditions.push(where('category', 'in', filters.categories));
      }
      
      // Create query with filters
      let q = query(transactionsRef, ...conditions, orderBy('date', 'desc'));
      
      // Execute query
      const snapshot = await getDocs(q);
      
      // Process and filter results
      let results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Apply amount filters (client-side filtering)
      if (filters.minAmount) {
        results = results.filter(transaction => 
          transaction.amount >= parseFloat(filters.minAmount)
        );
      }
      
      if (filters.maxAmount) {
        results = results.filter(transaction => 
          transaction.amount <= parseFloat(filters.maxAmount)
        );
      }
      
      // Apply text search if provided
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        results = results.filter(transaction => 
          transaction.description?.toLowerCase().includes(term) ||
          transaction.category?.toLowerCase().includes(term) ||
          transaction.notes?.toLowerCase().includes(term) ||
          (transaction.payee && transaction.payee.toLowerCase().includes(term))
        );
        
        // Save search term
        saveRecentSearch(searchTerm);
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching transactions:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <SearchContext.Provider
      value={{
        searchResults,
        isSearching,
        recentSearches,
        filters,
        searchTransactions,
        updateFilters,
        resetFilters,
        clearRecentSearches
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);