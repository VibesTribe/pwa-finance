import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs,
  Paper,
  CircularProgress,
  Badge,
  Tooltip,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PaidIcon from '@mui/icons-material/Paid';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionContext';

// Styled components
const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: status === 'paid' 
    ? theme.palette.success.light 
    : status === 'pending' 
      ? theme.palette.warning.light 
      : theme.palette.error.light,
  color: status === 'paid' 
    ? theme.palette.success.contrastText 
    : status === 'pending' 
      ? theme.palette.warning.contrastText 
      : theme.palette.error.contrastText,
}));

const SplitExpensesManager = () => {
  const { currentUser } = useAuth();
  const { transactions, updateTransaction } = useTransactions();
  const [loading, setLoading] = useState(true);
  const [sharedTransactions, setSharedTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [remindDialog, setRemindDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [summaryData, setSummaryData] = useState({
    totalShared: 0,
    totalOwed: 0,
    totalOwedByOthers: 0,
    pendingCount: 0,
    paidCount: 0
  });

  // Filter options
  const tabOptions = ['All', 'I Owe', 'Others Owe Me', 'Settled'];

  // Process transactions to get shared expenses
  useEffect(() => {
    if (transactions) {
      // Filter for shared transactions
      const shared = transactions.filter(t => t.isShared);
      setSharedTransactions(shared);
      
      // Apply initial filter (All)
      handleTabChange(null, selectedTab);
      
      // Calculate summary data
      calculateSummary(shared);
      
      setLoading(false);
    }
  }, [transactions]);

  // Calculate summary information
  const calculateSummary = (shared) => {
    let totalShared = 0;
    let totalOwed = 0;
    let totalOwedByOthers = 0;
    let pendingCount = 0;
    let paidCount = 0;
    
    shared.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      totalShared += amount;
      
      // Check if current user is the one who paid
      const userPaid = transaction.userId === currentUser.uid;
      
      // Count based on payment status
      if (transaction.paymentStatus === 'pending') {
        pendingCount++;
        if (userPaid) {
          // Current user paid, others owe them
          totalOwedByOthers += amount / (transaction.sharedWith.length + 1) * transaction.sharedWith.length;
        } else {
          // Current user owes the payer
          totalOwed += amount / (transaction.sharedWith.length + 1);
        }
      } else if (transaction.paymentStatus === 'paid') {
        paidCount++;
      }
    });
    
    setSummaryData({
      totalShared,
      totalOwed,
      totalOwedByOthers,
      pendingCount,
      paidCount
    });
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    
    // Filter transactions based on selected tab
    let filtered = [];
    switch (newValue) {
      case 0: // All
        filtered = sharedTransactions;
        break;
      case 1: // I Owe
        filtered = sharedTransactions.filter(t => 
          t.sharedWith.includes(currentUser.email) && 
          t.userId !== currentUser.uid &&
          t.paymentStatus === 'pending'
        );
        break;
      case 2: // Others Owe Me
        filtered = sharedTransactions.filter(t => 
          t.userId === currentUser.uid && 
          t.paymentStatus === 'pending'
        );
        break;
      case 3: // Settled
        filtered = sharedTransactions.filter(t => 
          t.paymentStatus === 'paid'
        );
        break;
      default:
        filtered = sharedTransactions;
    }
    
    setFilteredTransactions(filtered);
  };

  // Open reminder dialog
  const handleOpenRemind = (transaction) => {
    setSelectedTransaction(transaction);
    const defaultMessage = `Hi there! Just a friendly reminder about the ${transaction.description} expense of $${transaction.amount} that we split. Could you please settle up when you get a chance? Thanks!`;
    setReminderMessage(defaultMessage);
    setRemindDialog(true);
  };

  // Send reminder
  const handleSendReminder = async () => {
    // In a real app, this would send an email or notification
    // For now, just update the transaction to mark that a reminder was sent
    try {
      const updatedTransaction = {
        ...selectedTransaction,
        lastReminderSent: new Date().toISOString()
      };
      
      await updateTransaction(updatedTransaction.id, updatedTransaction);
      
      setRemindDialog(false);
      alert('Reminder sent successfully!');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder. Please try again.');
    }
  };

  // Mark expense as paid
  const handleMarkPaid = async (transaction) => {
    try {
      const updatedTransaction = {
        ...transaction,
        paymentStatus: 'paid',
        paidDate: new Date().toISOString()
      };
      
      await updateTransaction(updatedTransaction.id, updatedTransaction);
      
      // Refresh the data
      const updated = sharedTransactions.map(t => 
        t.id === transaction.id ? updatedTransaction : t
      );
      
      setSharedTransactions(updated);
      calculateSummary(updated);
      handleTabChange(null, selectedTab);
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status. Please try again.');
    }
  };

  // Calculate individual share
  const calculateShare = (transaction) => {
    const total = parseFloat(transaction.amount);
    const people = transaction.sharedWith.length + 1; // +1 for the payer
    return (total / people).toFixed(2);
  };

  // Get friendly payment status
  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon fontSize="small" />;
      case 'pending':
        return <AccessTimeIcon fontSize="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Split Expenses Manager
      </Typography>
      
      {/* Summary Cards */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Shared Expenses
                </Typography>
                <Typography variant="h5" component="div">
                  ${summaryData.totalShared.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Across {sharedTransactions.length} transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  You Owe
                </Typography>
                <Typography variant="h5" component="div" color="error.main">
                  ${summaryData.totalOwed.toFixed(2)}
                </Typography>
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={() => handleTabChange(null, 1)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Others Owe You
                </Typography>
                <Typography variant="h5" component="div" color="success.main">
                  ${summaryData.totalOwedByOthers.toFixed(2)}
                </Typography>
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={() => handleTabChange(null, 2)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip 
                    icon={<AccessTimeIcon />} 
                    label={`${summaryData.pendingCount} Pending`} 
                    size="small" 
                    color="warning" 
                    variant="outlined" 
                  />
                  <Chip 
                    icon={<CheckCircleIcon />} 
                    label={`${summaryData.paidCount} Paid`} 
                    size="small" 
                    color="success" 
                    variant="outlined" 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      {/* Tabs and Filters */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabOptions.map((option, index) => (
            <Tab key={index} label={option} />
          ))}
        </Tabs>
      </Paper>
      
      {/* Transactions Table */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Your Share</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Shared With</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => {
                const isCurrentUserPayer = transaction.userId === currentUser.uid;
                const yourShare = calculateShare(transaction);
                
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>${parseFloat(transaction.amount).toFixed(2)}</TableCell>
                    <TableCell>${yourShare}</TableCell>
                    <TableCell>
                      <StatusChip
                        status={transaction.paymentStatus}
                        icon={getStatusIcon(transaction.paymentStatus)}
                        label={getStatusText(transaction.paymentStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {transaction.sharedWith.length === 1 
                          ? transaction.sharedWith[0]
                          : `${transaction.sharedWith.length} people`
                        }
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {transaction.paymentStatus === 'pending' && (
                        <>
                          {isCurrentUserPayer ? (
                            <Tooltip title="Send Reminder">
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={() => handleOpenRemind(transaction)}
                              >
                                <EmailIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Mark as Paid">
                              <IconButton 
                                size="small" 
                                color="success" 
                                onClick={() => handleMarkPaid(transaction)}
                              >
                                <PaidIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Reminder Dialog */}
      <Dialog open={remindDialog} onClose={() => setRemindDialog(false)}>
        <DialogTitle>Send Payment Reminder</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Send a reminder for: {selectedTransaction.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Recipients:
              </Typography>
              <List dense>
                {selectedTransaction.sharedWith.map((email, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={email} />
                  </ListItem>
                ))}
              </List>
              <TextField
                autoFocus
                margin="dense"
                label="Reminder Message"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemindDialog(false)}>Cancel</Button>
          <Button onClick={handleSendReminder} variant="contained" color="primary">
            Send Reminder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SplitExpensesManager;
