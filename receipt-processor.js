import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  IconButton, 
  Chip, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  CircularProgress, 
  Divider,
  Stack,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionContext';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const ReceiptProcessor = ({ receipt, onDelete, onProcessed }) => {
  const { currentUser } = useAuth();
  const { addTransaction } = useTransactions();
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('idle'); // idle, processing, success, error
  const [editMode, setEditMode] = useState(true);
  const [message, setMessage] = useState('');
  const [extractedData, setExtractedData] = useState({
    merchantName: '',
    date: null,
    totalAmount: '',
    category: '',
    description: '',
    items: [],
    accountType: 'personal', // default to personal
    isShared: false,
    sharedWith: [],
  });

  // Categories for the dropdown
  const categories = [
    'Food & Dining', 
    'Groceries', 
    'Shopping', 
    'Transportation', 
    'Entertainment', 
    'Travel', 
    'Utilities', 
    'Health', 
    'Education', 
    'Business', 
    'Other'
  ];

  // Simulate receipt data extraction (placeholder for future AI)
  const extractReceiptData = async () => {
    setProcessingStatus('processing');
    setMessage('Analyzing receipt...');
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just use placeholder data
      // In a real implementation, this would call your OCR/AI service
      const simulatedData = {
        merchantName: 'Sample Merchant',
        date: new Date(),
        totalAmount: '45.99',
        category: 'Food & Dining',
        description: 'Lunch with colleagues',
        items: [
          { name: 'Item 1', price: '12.99' },
          { name: 'Item 2', price: '8.50' },
          { name: 'Item 3', price: '24.50' },
        ],
      };
      
      setExtractedData(prev => ({
        ...prev,
        ...simulatedData
      }));
      
      setProcessingStatus('success');
      setMessage('Receipt analyzed successfully. Please verify the information below.');
    } catch (error) {
      console.error('Error extracting receipt data:', error);
      setProcessingStatus('error');
      setMessage('Failed to analyze receipt. Please enter the details manually.');
    }
  };

  // Handle form changes
  const handleChange = (field) => (event) => {
    setExtractedData({
      ...extractedData,
      [field]: event.target.value,
    });
  };

  // Handle date change separately
  const handleDateChange = (newDate) => {
    setExtractedData({
      ...extractedData,
      date: newDate,
    });
  };

  // Handle shared expense toggle
  const handleSharedToggle = () => {
    setExtractedData({
      ...extractedData,
      isShared: !extractedData.isShared,
    });
  };

  // Handle account type change
  const handleAccountTypeChange = (event) => {
    setExtractedData({
      ...extractedData,
      accountType: event.target.value,
    });
  };

  // Save the processed receipt data
  const handleSave = async () => {
    if (!extractedData.merchantName || !extractedData.totalAmount || !extractedData.date) {
      setMessage('Please fill in all required fields (merchant, amount, date)');
      setProcessingStatus('error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create a new transaction from the receipt data
      const transactionData = {
        type: 'expense',
        amount: parseFloat(extractedData.totalAmount),
        category: extractedData.category,
        description: extractedData.description || extractedData.merchantName,
        date: extractedData.date,
        accountType: extractedData.accountType,
        isShared: extractedData.isShared,
        sharedWith: extractedData.isShared ? extractedData.sharedWith : [],
        paymentStatus: extractedData.isShared ? 'pending' : 'paid',
        receiptUrl: receipt.url,
        createdAt: new Date(),
        userId: currentUser.uid,
      };
      
      // Add the transaction to your database
      await addTransaction(transactionData);
      
      setEditMode(false);
      setLoading(false);
      setProcessingStatus('success');
      setMessage('Receipt processed and transaction created successfully!');
      
      if (onProcessed) {
        onProcessed(transactionData);
      }
    } catch (error) {
      console.error('Error saving receipt data:', error);
      setLoading(false);
      setProcessingStatus('error');
      setMessage('Failed to save data. Please try again.');
    }
  };

  // Delete the receipt
  const handleDeleteReceipt = async () => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      try {
        setLoading(true);
        
        // Delete the file from storage
        const storageRef = ref(storage, receipt.url);
        await deleteObject(storageRef);
        
        if (onDelete) {
          onDelete(receipt);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error deleting receipt:', error);
        setLoading(false);
        setMessage('Failed to delete receipt. Please try again.');
        setProcessingStatus('error');
      }
    }
  };

  // Extract data when component mounts
  useEffect(() => {
    if (receipt && editMode) {
      extractReceiptData();
    }
  }, [receipt]);

  return (
    <StyledCard>
      <CardContent>
        <Grid container spacing={3}>
          {/* Receipt image and basic info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                image={receipt.url}
                alt="Receipt"
                sx={{ 
                  borderRadius: 1, 
                  maxHeight: 400, 
                  objectFit: 'contain',
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                }}
              />
              
              {!editMode && (
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <IconButton 
                    onClick={() => setEditMode(true)}
                    sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Uploaded: {new Date(receipt.uploadedAt).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                File: {receipt.name}
              </Typography>
            </Box>
            
            {editMode && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AutorenewIcon />}
                onClick={extractReceiptData}
                sx={{ mt: 2 }}
                disabled={processingStatus === 'processing'}
              >
                {processingStatus === 'processing' ? 'Analyzing...' : 'Re-analyze Receipt'}
              </Button>
            )}
          </Grid>
          
          {/* Form fields */}
          <Grid item xs={12} md={8}>
            {processingStatus === 'processing' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {message}
                </Typography>
              </Box>
            ) : (
              <>
                {message && (
                  <Alert 
                    severity={processingStatus === 'error' ? 'error' : 'success'} 
                    sx={{ mb: 2 }}
                    onClose={() => setMessage('')}
                  >
                    {message}
                  </Alert>
                )}
                
                {editMode ? (
                  <Box component="form" noValidate>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Merchant Name"
                          value={extractedData.merchantName}
                          onChange={handleChange('merchantName')}
                          margin="normal"
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Receipt Date"
                            value={extractedData.date}
                            onChange={handleDateChange}
                            renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
                            inputFormat="MM/dd/yyyy"
                          />
                        </LocalizationProvider>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Total Amount"
                          value={extractedData.totalAmount}
                          onChange={handleChange('totalAmount')}
                          margin="normal"
                          required
                          type="number"
                          InputProps={{
                            startAdornment: <Typography variant="body1">$</Typography>,
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={extractedData.category}
                            onChange={handleChange('category')}
                            label="Category"
                          >
                            {categories.map((category) => (
                              <MenuItem key={category} value={category}>
                                {category}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={extractedData.description}
                          onChange={handleChange('description')}
                          margin="normal"
                          multiline
                          rows={2}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" gutterBottom>
                          Transaction Settings
                        </Typography>
                        
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                          <FormControl component="fieldset">
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Account Type
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Chip
                                label="Personal"
                                color={extractedData.accountType === 'personal' ? 'primary' : 'default'}
                                onClick={() => handleAccountTypeChange({ target: { value: 'personal' } })}
                                variant={extractedData.accountType === 'personal' ? 'filled' : 'outlined'}
                              />
                              <Chip
                                label="Business"
                                color={extractedData.accountType === 'business' ? 'primary' : 'default'}
                                onClick={() => handleAccountTypeChange({ target: { value: 'business' } })}
                                variant={extractedData.accountType === 'business' ? 'filled' : 'outlined'}
                              />
                            </Stack>
                          </FormControl>
                          
                          <FormControl component="fieldset">
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Shared Expense
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              <Chip
                                label="Not Shared"
                                color={!extractedData.isShared ? 'primary' : 'default'}
                                onClick={extractedData.isShared ? handleSharedToggle : undefined}
                                variant={!extractedData.isShared ? 'filled' : 'outlined'}
                              />
                              <Chip
                                label="Shared"
                                color={extractedData.isShared ? 'primary' : 'default'}
                                onClick={!extractedData.isShared ? handleSharedToggle : undefined}
                                variant={extractedData.isShared ? 'filled' : 'outlined'}
                              />
                            </Stack>
                          </FormControl>
                        </Stack>
                        
                        {extractedData.isShared && (
                          <TextField
                            fullWidth
                            label="Shared with (comma-separated emails)"
                            value={extractedData.sharedWith.join(', ')}
                            onChange={(e) => setExtractedData({
                              ...extractedData,
                              sharedWith: e.target.value.split(',').map(email => email.trim())
                            })}
                            margin="normal"
                            placeholder="friend@example.com, colleague@example.com"
                          />
                        )}
                      </Grid>
                      
                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDeleteReceipt}
                            disabled={loading}
                          >
                            Delete Receipt
                          </Button>
                          
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Save & Create Transaction'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  // View mode (read-only)
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>
                          {extractedData.merchantName}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Date
                        </Typography>
                        <Typography variant="body1">
                          {extractedData.date ? extractedData.date.toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          ${parseFloat(extractedData.totalAmount).toFixed(2)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Chip 
                          label={extractedData.category || 'Uncategorized'} 
                          size="small" 
                          sx={{ mt: 0.5 }} 
                        />
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Account Type
                        </Typography>
                        <Chip 
                          label={extractedData.accountType === 'personal' ? 'Personal' : 'Business'} 
                          color={extractedData.accountType === 'business' ? 'secondary' : 'primary'}
                          size="small" 
                          sx={{ mt: 0.5 }} 
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body1">
                          {extractedData.description || 'No description'}
                        </Typography>
                      </Grid>
                      
                      {extractedData.isShared && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            Shared with
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            {extractedData.sharedWith.map((email, index) => (
                              <Chip 
                                key={index} 
                                label={email} 
                                size="small" 
                                sx={{ mr: 0.5, mb: 0.5 }} 
                              />
                            ))}
                          </Box>
                        </Grid>
                      )}
                      
                      <Grid item xs={12} sx={{ mt: 2 }}>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDeleteReceipt}
                            sx={{ mr: 2 }}
                          >
                            Delete
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setEditMode(true)}
                          >
                            Edit
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

export default ReceiptProcessor;
