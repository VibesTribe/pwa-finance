import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  AppBar,
  Toolbar,
  useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import FlightIcon from '@mui/icons-material/Flight';
import WorkIcon from '@mui/icons-material/Work';
import { useTransactions } from '../contexts/TransactionContext';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Helper function to get the appropriate icon for a category
const getCategoryIcon = (category) => {
  switch (category) {
    case 'Food & Dining':
      return <RestaurantIcon />;
    case 'Housing':
      return <HomeIcon />;
    case 'Transportation':
      return <DirectionsCarIcon />;
    case 'Shopping':
      return <ShoppingBagIcon />;
    case 'Health & Fitness':
      return <LocalHospitalIcon />;
    case 'Education':
      return <SchoolIcon />;
    case 'Gifts & Donations':
      return <CardGiftcardIcon />;
    case 'Travel':
      return <FlightIcon />;
    case 'Business':
      return <WorkIcon />;
    default:
      return <ShoppingBagIcon />;
  }
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { transactions } = useTransactions();
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Calculate summary data
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const balance = totalIncome - totalExpenses;

  // Prepare pie chart data for expenses by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
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

  // Prepare recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Prepare monthly data for bar chart
  const getMonthlyData = () => {
    const months = {};
    
    transactions.forEach(t => {
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
    
    return Object.values(months);
  };

  const monthlyData = getMonthlyData();

  return (
    <Container maxWidth="md">
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 2, mb: 4 }}>
        {/* Summary Cards */}
        <Grid container spacing={3}>
          {/* Balance Card */}
          <Grid item xs={12} sm={4}>
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                backgroundColor: theme.palette.primary.main,
                color: 'white'
              }}
            >
              <Typography variant="subtitle1">Current Balance</Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                {formatCurrency(balance)}
              </Typography>
            </Paper>
          </Grid>
          
          {/* Income Card */}
          <Grid item xs={12} sm={4}>
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                backgroundColor: theme.palette.success.light
              }}
            >
              <Typography variant="subtitle1">Total Income</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <ArrowUpwardIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                  {formatCurrency(totalIncome)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Expenses Card */}
          <Grid item xs={12} sm={4}>
            <Paper 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                backgroundColor: theme.palette.error.light
              }}
            >
              <Typography variant="subtitle1">Total Expenses</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                <ArrowDownwardIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                  {formatCurrency(totalExpenses)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabs for different views */}
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ borderRadius: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Overview" />
              <Tab label="Transactions" />
              <Tab label="Analytics" />
            </Tabs>
            
            {/* Overview Tab */}
            {tabValue === 0 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Expense Breakdown Pie Chart */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Expense Breakdown
                    </Typography>
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
                  </Grid>
                  
                  {/* Recent Transactions */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Recent Transactions
                    </Typography>
                    <List>
                      {recentTransactions.length > 0 ? (
                        recentTransactions.map((transaction) => (
                          <React.Fragment key={transaction.id}>
                            <ListItem>
                              <ListItemIcon>
                                {transaction.type === 'income' ? (
                                  <ArrowUpwardIcon sx={{ color: theme.palette.success.main }} />
                                ) : (
                                  getCategoryIcon(transaction.category)
                                )}
                              </ListItemIcon>
                              <ListItemText 
                                primary={transaction.category || 'Uncategorized'} 
                                secondary={new Date(transaction.date).toLocaleDateString()}
                              />
                              <Typography 
                                variant="body2"
                                sx={{ 
                                  fontWeight: 'medium',
                                  color: transaction.type === 'income' 
                                    ? theme.palette.success.main 
                                    : theme.palette.error.main
                                }}
                              >
                                {transaction.type === 'income' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </Typography>
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        ))
                      ) : (
                        <Box sx={{ 
                          py: 4, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'text.secondary' 
                        }}>
                          <Typography>No recent transactions</Typography>
                        </Box>
                      )}
                    </List>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Transactions Tab */}
            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  All Transactions
                </Typography>
                <List>
                  {transactions.length > 0 ? (
                    [...transactions]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((transaction) => (
                        <React.Fragment key={transaction.id}>
                          <ListItem>
                            <ListItemIcon>
                              {transaction.type === 'income' ? (
                                <ArrowUpwardIcon sx={{ color: theme.palette.success.main }} />
                              ) : (
                                getCategoryIcon(transaction.category)
                              )}
                            </ListItemIcon>
                            <ListItemText 
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography variant="body1">
                                    {transaction.category || 'Uncategorized'}
                                  </Typography>
                                  <Chip 
                                    size="small" 
                                    label={transaction.type} 
                                    color={transaction.type === 'income' ? 'success' : 'error'}
                                    sx={{ ml: 1, height: 20 }}
                                  />
                                </Box>
                              } 
                              secondary={
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(transaction.date).toLocaleDateString()} - {transaction.notes || 'No notes'}
                                </Typography>
                              }
                            />
                            <Typography 
                              variant="body2"
                              sx={{ 
                                fontWeight: 'medium',
                                color: transaction.type === 'income' 
                                  ? theme.palette.success.main 
                                  : theme.palette.error.main
                              }}
                            >
                              {transaction.type === 'income' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </Typography>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))
                  ) : (
                    <Box sx={{ 
                      py: 4, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'text.secondary' 
                    }}>
                      <Typography>No transactions recorded</Typography>
                    </Box>
                  )}
                </List>
              </Box>
            )}
            
            {/* Analytics Tab */}
            {tabValue === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Monthly Income & Expenses
                </Typography>
                <Box sx={{ height: 400, mt: 2 }}>
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
            )}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardPage;
