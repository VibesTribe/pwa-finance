// search-component.js
import React, { useState } from 'react';
import { useSearch } from './search-context';

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { 
    searchResults, 
    isSearching, 
    recentSearches, 
    filters,
    searchTransactions, 
    updateFilters, 
    resetFilters,
    clearRecentSearches
  } = useSearch();

  const handleSearch = (e) => {
    e.preventDefault();
    searchTransactions(searchTerm);
  };

  const handleRecentSearch = (term) => {
    setSearchTerm(term);
    searchTransactions(term);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions..."
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          <button 
            type="button" 
            onClick={toggleFilters} 
            className="filter-toggle-button"
          >
            Filters {showFilters ? '▲' : '▼'}
          </button>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Account Type</label>
                <select 
                  value={filters.accountType}
                  onChange={(e) => updateFilters({ accountType: e.target.value })}
                >
                  <option value="all">All Accounts</option>
                  <option value="personal">Personal</option>
                  <option value="business">Business</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Shared Expenses</label>
                <select
                  value={filters.isShared === null ? '' : filters.isShared.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateFilters({ isShared: value === '' ? null : value === 'true' });
                  }}
                >
                  <option value="">All</option>
                  <option value="true">Shared Only</option>
                  <option value="false">Not Shared</option>
                </select>
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <label>Date From</label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => updateFilters({ 
                    startDate: e.target.value ? new Date(e.target.value) : null 
                  })}
                />
              </div>
              
              <div className="filter-group">
                <label>Date To</label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => updateFilters({ 
                    endDate: e.target.value ? new Date(e.target.value) : null 
                  })}
                />
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <label>Min Amount</label>
                <input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => updateFilters({ minAmount: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="filter-group">
                <label>Max Amount</label>
                <input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => updateFilters({ maxAmount: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="filter-actions">
              <button 
                type="button" 
                onClick={resetFilters}
                className="reset-filters-button"
              >
                Reset Filters
              </button>
              <button 
                type="button" 
                onClick={() => searchTransactions(searchTerm)}
                className="apply-filters-button"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <div className="recent-searches-header">
              <span>Recent Searches:</span>
              <button 
                type="button"
                onClick={clearRecentSearches}
                className="clear-recent-button"
              >
                Clear
              </button>
            </div>
            <div className="recent-search-terms">
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleRecentSearch(term)}
                  className="recent-search-term"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
      
      {/* Search Results */}
      <div className="search-results">
        {isSearching ? (
          <div className="searching-indicator">Searching...</div>
        ) : searchResults.length > 0 ? (
          <div className="results-container">
            <div className="results-header">
              <h3>Found {searchResults.length} transactions</h3>
            </div>
            <div className="results-list">
              {searchResults.map(transaction => (
                <div key={transaction.id} className="result-item">
                  <div className="result-date">
                    {transaction.date ? new Date(transaction.date.toDate()).toLocaleDateString() : 'No date'}
                  </div>
                  <div className="result-description">
                    <h4>{transaction.description}</h4>
                    <div className="result-metadata">
                      <span className="result-category">{transaction.category}</span>
                      {transaction.isShared && (
                        <span className="result-shared-indicator">Shared</span>
                      )}
                      <span className={`result-type ${transaction.accountType}`}>
                        {transaction.accountType}
                      </span>
                    </div>
                  </div>
                  <div className="result-amount">
                    ${transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-results">
            {searchTerm ? 'No transactions found matching your search criteria.' : 'Use the search box above to find transactions.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;