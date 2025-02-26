import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box,
  Container, 
  Typography, 
  Paper, 
  Grid, 
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import MicIcon from '@mui/icons-material/Mic';
import { motion } from 'framer-motion';
import { useTransactions } from '../contexts/TransactionContext';

// Custom styled components
const ActionCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  borderRadius: '50%',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Predefined categories
const expenseCategories = [
  'Food & Dining',
  'Shopping',
  'Housing',
  'Transportation',
  'Entertainment',
  'Health & Fitness',
  'Personal Care',
  'Education',
  'Gifts & Donations',
  'Business',
  'Travel',
  'Utilities',
  'Other'
];

const incomeCategories = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Gifts',
  'Other'
];

const AddTransactionPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { addTransaction } = useTransactions();
  
  // State for the currently selected action
  const [currentAction, setCurrentAction] = useState(null);
  
  // State for transaction details
  const [transactionType, setTransactionType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);

  // Handle file selection
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(URL.createObjectURL(event.target.files[0]));
      setShowDetails(true);
    }
  };

  // Handle camera capture
  const handleCameraCapture = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(URL.createObjectURL(event.target.files[0]));
      setShowDetails(true);
    }
  };

  // Handle text notes
  const handleTextNotes = () => {
    setCurrentAction('text');
    setShowDetails(true);
  };

  // Handle voice recording
  const handleVoiceRecord = () => {
    setCurrentAction('voice');
    setIsRecording(!isRecording);
    // In a real app, we would start/stop recording here
    if (isRecording) {
      // Stop recording logic would go here
      setShowDetails(true);
    }
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      setCategory(newCategory.trim());
      setIsAddingCategory(false);
      setNewCategory('');
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Create transaction object
    const transaction = {
      id: Date.now().toString(),
      type: transactionType,
      amount: parseFloat(amount) || 0,
      category: category,
      notes: notes,
      date: new Date().toISOString(),
      receipt: selectedFile || null,
    };
    
    // Add transaction to context/database
    addTransaction(transaction);
    
    // Navigate back to home
    navigate('/');
  };

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
            Add Transaction
          </Typography>
        </Toolbar>
      </AppBar>

      {!showDetails ? (
        <Box sx={{ py: 4 }}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              textAlign: 'center', 
              mb: 4,
              fontWeight: 'medium'
            }}
          >
            How would you like to add this transaction?
          </Typography>
          
          <Grid container spacing={3}>
            {/* Camera option */}
            <Grid item xs={6} sm={3}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ActionCard>
                  <input
                    accept="image/*"
                    id="camera-input"
                    type="file"
                    capture="environment"
                    onChange={handleCameraCapture}
                    hidden
                  />
                  <label htmlFor="camera-input">
                    <IconContainer>
                      <PhotoCameraIcon fontSize="large" color="primary" />
                    </IconContainer>
                    <Typography align="center" variant="subtitle1">Take Photo</Typography>
                  </label>
                </ActionCard>
              </motion.div>
            </Grid>
            
            {/* Upload file option */}
            <Grid item xs={6} sm={3}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ActionCard>
                  <input
                    accept="image/*,.pdf,.csv"
                    id="file-input"
                    type="file"
                    onChange={handleFileChange}
                    hidden
                  />
                  <label htmlFor="file-input">
                    <IconContainer>
                      <UploadFileIcon fontSize="large" color="primary" />
                    </IconContainer>
                    <Typography align="center" variant="subtitle1">Upload File</Typography>
                  </label>
                </ActionCard>
              </motion.div>
            </Grid>
            
            {/* Text notes option */}
            <Grid item xs={6} sm={3}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ActionCard onClick={handleTextNotes}>
                  <IconContainer>
                    <TextFieldsIcon fontSize="large" color="primary" />
                  </IconContainer>
                  <Typography align="center" variant="subtitle1">Text Notes</Typography>
                </ActionCard>
              </motion.div>
            </Grid>
            
            {/* Voice notes option */}
            <Grid item xs={6} sm={3}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ActionCard onClick={handleVoiceRecord}>
                  <IconContainer>
                    <MicIcon fontSize="large" color="primary" />
                  </IconContainer>
                  <Typography align="center" variant="subtitle1">
                    {isRecording ? 'Stop Recording' : 'Voice Notes'}
                  </Typography>
                </ActionCard>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Box component={Paper} sx={{ p: 3, mt: 3, borderRadius: 3 }}>
          {selectedFile && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <img 
                src={selectedFile} 
                alt="Receipt preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px', 
                  borderRadius: '8px',
                  objectFit: 'contain'
                }} 
              />
            </Box>
          )}
          
          <Grid container spacing={3}>
            {/* Transaction Type */}
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
                <Select
                  labelId="transaction-type-label"
                  id="transaction-type"
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  label="Transaction Type"
                >
                  <MenuItem value="expense">Expense</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Amount */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="amount"
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputProps={{
                  startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                }}
                variant="outlined"
              />
            </Grid>
            
            {/* Category */}
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                >
                  {transactionType === 'expense' 
                    ? expenseCategories.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))
                    : incomeCategories.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))
                  }
                  <MenuItem value="add_new">
                    <em>+ Add New Category</em>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                label="Notes"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                variant="outlined"
              />
            </Grid>
            
            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
                sx={{ mt: 2 }}
              >
                Save Transaction
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Dialog for adding new category */}
      <Dialog open={category === 'add_new' || isAddingCategory} onClose={() => {
        setCategory('');
        setIsAddingCategory(false);
      }}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="new-category"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCategory('');
            setIsAddingCategory(false);
          }}>
            Cancel
          </Button>
          <Button onClick={handleAddCategory} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AddTransactionPage;
