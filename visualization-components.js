import React from 'react';
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { Box, Typography, ToggleButtonGroup, ToggleButton, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Expense Breakdown Pie Chart with account type toggle
export const ExpenseBreakdownChart = ({ transactions }) => {
  const theme = useTheme();
  const [accountType, setAccountType] = React.useState('all');

  // Handle toggle change
  const handleToggleChange = (event, newValue) => {
    if (newValue !== null) {
      setAccountType(newValue);
    }
  };

  // Filter transactions by account type
  const filteredTransactions = React.useMemo(() => {
    if (accountType === 'all') {
      return transactions.filter(t => t.type === 'expense');
    }
    return transactions.filter(t => t.type === 'expense' && t.accountType === accountType);
  }, [transactions, accountType]);

  // Prepare pie chart data for expenses by category
  const expensesByCategory = React.useMemo(() => {
    return filteredTransactions
      .reduce((acc, t) => {
        const existingCategory = acc.find(item => item.name === t.category);
        if (existingCategory) {
          existingCategory.value += parseFloat(t.amount);
        } else {
          acc.push({
            name: t.category || 'Uncategorized',
            value: parseFloat(t.amount)
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Colors for pie chart
  const COLORS = [
    '#5E35B1', // primary
    '#7E57C2',
    '#9575CD',
    '#B39DDB',
    '#00BFA5', // secondary
    '#26C6DA',
    '#4DD0E1',
    '#80DEEA',
    '#FF5722',
    '#FF7043'
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Expense Breakdown</Typography>
        <ToggleButtonGroup
          value={accountType}
          exclusive
          onChange={handleToggleChange}
          aria-label="account type"
          size="small"
        >
          <ToggleButton value="all" aria-label="all accounts">
            All
          </ToggleButton>
          <ToggleButton value="personal" aria-label="personal">
            <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
            Personal
          </ToggleButton>
          <ToggleButton value="business" aria-label="business">
            <BusinessIcon fontSize="small" sx={{ mr: 0.5 }} />
            Business
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Box sx={{ height: 300 }}>
        {expensesByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'text.secondary' 
          }}>
            <Typography>No expense data available</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Monthly Income & Expense Bar Chart with account type toggle
export const MonthlyBarChart = ({ transactions }) => {
  const theme = useTheme();
  const [accountType, setAccountType] = React.useState('all');

  // Handle toggle change
  const handleToggleChange = (event, newValue) => {
    if (newValue !== null) {
      setAccountType(newValue);
    }
  };

  // Filter transactions by account type
  const filteredTransactions = React.useMemo(() => {
    if (accountType === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.accountType === accountType);
  }, [transactions, accountType]);

  // Prepare monthly data for bar chart
  const monthlyData = React.useMemo(() => {
    const months = {};
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      if (!months[monthKey]) {
        months[monthKey] = {
          name: monthName,
          income: 0,
          expense: 0
        };
      }
      
      if (t.type === 'income') {
        months[monthKey].income += parseFloat(t.amount);
      } else {
        months[monthKey].expense += parseFloat(t.amount);
      }
    });
    
    // Sort months chronologically
    return Object.values(months).sort((a, b) => {
      const monthA = new Date(a.name + ' 1, 2000').getMonth();
      const monthB = new Date(b.name + ' 1, 2000').getMonth();
      return monthA - monthB;
    });
  }, [filteredTransactions]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Monthly Income & Expenses</Typography>
        <ToggleButtonGroup
          value={accountType}
          exclusive
          onChange={handleToggleChange}
          aria-label="account type"
          size="small"
        >
          <ToggleButton value="all" aria-label="all accounts">
            All
          </ToggleButton>
          <ToggleButton value="personal" aria-label="personal">
            <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
            Personal
          </ToggleButton>
          <ToggleButton value="business" aria-label="business">
            <BusinessIcon fontSize="small" sx={{ mr: 0.5 }} />
            Business
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Box sx={{ height: 400 }}>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar 
                dataKey="income" 
                fill={theme.palette.success.main} 
                name="Income" 
              />
              <Bar 
                dataKey="expense" 
                fill={theme.palette.error.main} 
                name="Expenses" 
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'text.secondary' 
          }}>
            <Typography>No data available for chart</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Account Summary component
export const AccountSummary = ({ transactions }) => {
  const theme = useTheme();
  const [accountType, setAccountType] = React.useState('all');

  // Handle toggle change
  const handleToggleChange = (event, newValue) => {
    if (newValue !== null) {
      setAccountType(newValue);
    }
  };

  // Calculate summary data based on account type
  const summaryData = React.useMemo(() => {
    let filteredTransactions = transactions;
    if (accountType !== 'all') {
      filteredTransactions = transactions.filter(t => t.accountType === accountType);
    }

    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const balance = income - expenses;

    return { income, expenses, balance };
  }, [transactions, accountType]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Account Summary</Typography>
        <ToggleButtonGroup
          value={accountType}
          exclusive
          onChange={handleToggleChange}
          aria-label="account type"
          size="small"
        >
          <ToggleButton value="all" aria-label="all accounts">
            All
          </ToggleButton>
          <ToggleButton value="personal" aria-label="personal">
            <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
            Personal
          </ToggleButton>
          <ToggleButton value="business" aria-label="business">
            <BusinessIcon fontSize="small" sx={{ mr: 0.5 }} />
            Business
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        flexWrap: 'wrap', 
        gap: 2,
        mt: 3
      }}>
        <Box sx={{ textAlign: 'center', minWidth: '25%' }}>
          <Typography variant="subtitle2" color="text.secondary">Balance</Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              color: summaryData.balance >= 0 ? theme.palette.success.main : theme.palette.error.main
            }}
          >
            {formatCurrency(summaryData.balance)}
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center', minWidth: '25%' }}>
          <Typography variant="subtitle2" color="text.secondary">Income</Typography>
          <Typography variant="h5" sx={{ color: theme.palette.success.main, fontWeight: 'medium' }}>
            {formatCurrency(summaryData.income)}
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center', minWidth: '25%' }}>
          <Typography variant="subtitle2" color="text.secondary">Expenses</Typography>
          <Typography variant="h5" sx={{ color: theme.palette.error.main, fontWeight: 'medium' }}>
            {formatCurrency(summaryData.expenses)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
