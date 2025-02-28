import React, { useState, useEffect, useContext } from 'react';
import { TransactionContext } from '../contexts/transaction-context';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle,
  CardDescription 
} from '../components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Button } from '../components/ui/button';
import { ExpenseBreakdownChart } from '../components/ExpenseBreakdownChart';
import { MonthlyBarChart } from '../components/MonthlyBarChart';

const ReportSummary = () => {
  const { transactions } = useContext(TransactionContext);
  const [summaryType, setSummaryType] = useState('weekly');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [accountType, setAccountType] = useState('all');
  const [periodOptions, setPeriodOptions] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [periodTransactions, setPeriodTransactions] = useState([]);
  
  // Generate period options based on summaryType
  useEffect(() => {
    if (!transactions.length) return;
    
    // Get all transaction dates and sort them
    const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a - b);
    const options = [];
    
    if (summaryType === 'weekly') {
      // Generate week options
      const startDate = new Date(dates[0]);
      const endDate = new Date(dates[dates.length - 1]);
      
      // Set to the beginning of the week (Sunday)
      startDate.setDate(startDate.getDate() - startDate.getDay());
      
      let currentWeekStart = new Date(startDate);
      
      while (currentWeekStart <= endDate) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        options.push({
          value: currentWeekStart.toISOString(),
          label: `${currentWeekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`
        });
        
        // Move to next week
        currentWeekStart = new Date(currentWeekStart);
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }
    } else if (summaryType === 'monthly') {
      // Generate month options
      const months = [];
      
      // Create a Set of year-month combinations
      transactions.forEach(t => {
        const date = new Date(t.date);
        const yearMonth = `${date.getFullYear()}-${date.getMonth()}`;
        months.push(yearMonth);
      });
      
      // Get unique months and sort them
      const uniqueMonths = [...new Set(months)].sort();
      
      uniqueMonths.forEach(yearMonth => {
        const [year, month] = yearMonth.split('-').map(Number);
        const monthDate = new Date(year, month, 1);
        
        options.push({
          value: monthDate.toISOString(),
          label: monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        });
      });
    }
    
    setPeriodOptions(options);
    
    // Set default selected period to the most recent one
    if (options.length > 0) {
      setSelectedPeriod(options[options.length - 1].value);
    }
  }, [summaryType, transactions]);
  
  // Filter transactions based on selected period and account type
  useEffect(() => {
    if (!transactions.length || !selectedPeriod) return;
    
    const periodStart = new Date(selectedPeriod);
    let periodEnd;
    
    if (summaryType === 'weekly') {
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);
    } else if (summaryType === 'monthly') {
      periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
      periodEnd.setHours(23, 59, 59, 999);
    }
    
    // Filter transactions by date range and account type
    let filtered = transactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate >= periodStart && transDate <= periodEnd;
    });
    
    if (accountType !== 'all') {
      filtered = filtered.filter(t => t.accountType === accountType);
    }
    
    setPeriodTransactions(filtered);
    
    // Generate summary data
    generateSummaryData(filtered, periodStart, periodEnd);
  }, [selectedPeriod, accountType, summaryType, transactions]);
  
  // Generate summary data for the selected period
  const generateSummaryData = (data, startDate, endDate) => {
    if (!data.length) {
      setSummaryData(null);
      return;
    }
    
    // Basic summary calculations
    const summary = {
      totalTransactions: data.length,
      income: {
        total: data.filter(t => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0),
        count: data.filter(t => t.type === 'income').length
      },
      expenses: {
        total: data.filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0),
        count: data.filter(t => t.type === 'expense').length
      },
      categories: {},
      topExpenseCategories: [],
      topIncomeCategories: [],
      dailyTransactions: [],
      period: {
        start: startDate.toLocaleDateString(),
        end: endDate.toLocaleDateString()
      }
    };
    
    // Calculate category breakdown
    data.forEach(t => {
      if (!summary.categories[t.category]) {
        summary.categories[t.category] = {
          incomeAmount: 0,
          incomeCount: 0,
          expenseAmount: 0,
          expenseCount: 0
        };
      }
      
      if (t.type === 'income') {
        summary.categories[t.category].incomeAmount += parseFloat(t.amount);
        summary.categories[t.category].incomeCount += 1;
      } else {
        summary.categories[t.category].expenseAmount += parseFloat(t.amount);
        summary.categories[t.category].expenseCount += 1;
      }
    });
    
    // Calculate top expense categories
    summary.topExpenseCategories = Object.entries(summary.categories)
      .filter(([_, data]) => data.expenseAmount > 0)
      .sort((a, b) => b[1].expenseAmount - a[1].expenseAmount)
      .slice(0, 5)
      .map(([category, data]) => ({
        category,
        amount: data.expenseAmount,
        count: data.expenseCount
      }));
    
    // Calculate top income categories
    summary.topIncomeCategories = Object.entries(summary.categories)
      .filter(([_, data]) => data.incomeAmount > 0)
      .sort((a, b) => b[1].incomeAmount - a[1].incomeAmount)
      .slice(0, 5)
      .map(([category, data]) => ({
        category,
        amount: data.incomeAmount,
        count: data.incomeCount
      }));
    
    // Calculate daily transactions for the period
    const dailyMap = new Map();
    
    // Initialize with all days in the period
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      dailyMap.set(dateString, {
        date: new Date(currentDate),
        income: 0,
        expense: 0,
        transactions: 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Populate with actual transaction data
    data.forEach(t => {
      const dateString = new Date(t.date).toISOString().split('T')[0];
      const dayData = dailyMap.get(dateString) || {
        date: new Date(t.date),
        income: 0,
        expense: 0,
        transactions: 0
      };
      
      if (t.type === 'income') {
        dayData.income += parseFloat(t.amount);
      } else {
        dayData.expense += parseFloat(t.amount);
      }
      
      dayData.transactions += 1;
      dailyMap.set(dateString, dayData);
    });
    
    // Convert Map to Array and sort by date
    summary.dailyTransactions = Array.from(dailyMap.values())
      .sort((a, b) => a.date - b.date);
    
    setSummaryData(summary);
  };
  
  // Navigate to previous period
  const goToPreviousPeriod = () => {
    const currentIndex = periodOptions.findIndex(option => option.value === selectedPeriod);
    if (currentIndex > 0) {
      setSelectedPeriod(periodOptions[currentIndex - 1].value);
    }
  };
  
  // Navigate to next period
  const goToNextPeriod = () => {
    const currentIndex = periodOptions.findIndex(option => option.value === selectedPeriod);
    if (currentIndex < periodOptions.length - 1) {
      setSelectedPeriod(periodOptions[currentIndex + 1].value);
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Financial Summary Report</CardTitle>
        <CardDescription>
          View your {summaryType} financial summary
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Type Selector */}
        <Tabs value={summaryType} onValueChange={setSummaryType} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly Summary</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Summary</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Period Selection & Navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={goToPreviousPeriod}
            disabled={periodOptions.findIndex(o => o.value === selectedPeriod) === 0}
          >
            ← Previous
          </Button>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="ghost" 
            onClick={goToNextPeriod}
            disabled={periodOptions.findIndex(o => o.value === selectedPeriod) === periodOptions.length - 1}
          >
            Next →
          </Button>
        </div>
        
        {/* Account Type Selector */}
        <div>
          <label className="text-sm font-medium">Account Type</label>
          <Select value={accountType} onValueChange={setAccountType} className="mt-1">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Summary Data Display */}
        {summaryData ? (
          <div className="space-y-6">
            {/* Overall Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">Total Income</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${summaryData.income.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {summaryData.income.count} transactions
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">
                      ${summaryData.expenses.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {summaryData.expenses.count} transactions
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-medium">Net Balance</p>
                    <p className={`text-2xl font-bold ${summaryData.income.total - summaryData.expenses.total >= 0 ?