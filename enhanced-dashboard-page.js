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
  useTheme,
  ToggleButtonGroup,
  ToggleButton
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
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { useTransactions } from '../contexts/TransactionContext';

// Import visualization components
import { 
  ExpenseBreakdownChart,
  MonthlyBarChart,
  AccountSummary,
  formatCurrency
} from '../components/visualization-components';

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

const DashboardPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { transactions } = useTransactions();
  const [tabValue, setTabValue] = useState(0);
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle account type filter change
  const handleAccountTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setAccountTypeFilter(newValue);
    }
  };

  // Filter transactions by account type
  const filteredTransactions = accountTypeFilter === 'all' 
    ? transactions 
    : transactions.filter(t => t.accountType === accountTypeFilter);

  // Prepare recent transactions based on filter
  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

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
          <ToggleButtonGroup
            value={accountTypeFilter}
            exclusive
            onChange={handleAccountTypeChange}
            aria-label="account type filter"
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
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 2, mb: 4 }}>
        {/* Account Summary Component */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <AccountSummary transactions={transactions} />
        </Paper>

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
                    <ExpenseBreakdownChart transactions={transactions} />
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
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body1">
                                      {transaction.category || 'Uncategorized'}
                                    </Typography>
                                    {transaction.accountType && (
                                      <Chip 
                                        size="small" 
                                        icon={transaction.accountType === 'personal' ? <PersonIcon fontSize="small" /> : <BusinessIcon fontSize="small" />}
                                        label={transaction.accountType} 
                                        sx={{ ml: 1, height: 20 }}
                                      />
                                    )}
                                  </Box>
                                }
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
                  {accountTypeFilter === 'all' ? 'All Transactions' : 
                   accountTypeFilter === 'personal' ? 'Personal Transactions' : 'Business Transactions'}
                </Typography>
                <List>
                  {filteredTransactions.length > 0 ? (
                    [...filteredTransactions]
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
                                  {transaction.isShared && (
                                    <Chip 
                                      size="small" 
                                      label="Shared" 
                                      color="info"
                                      sx={{ ml: 1, height: 20 }}
                                    />
                                  )}
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
                <MonthlyBarChart transactions={transactions} />
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardPage;
