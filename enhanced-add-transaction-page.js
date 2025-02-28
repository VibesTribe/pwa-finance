import React, { useState, useRef } from 'react';
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
  useTheme,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
  Card,
  CardContent,
  Alert,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import MicIcon from '@mui/icons-material/Mic';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
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
  const fileInputRef = useRef(null);
  
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
  
  // New state for business/personal categorization
  const [accountType, setAccountType] = useState('personal');
  
  // New state for shared expenses
  const [isShared, setIsShared] = useState(false);
  const [sharedWith, setSharedWith] = useState([]);
  const [newSharedPerson, setNewSharedPerson] = useState('');
  const [isAddingSharedPerson, setIsAddingSharedPerson] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('completed');
  
  // Voice notes state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState(null);
  const [recordingFeedback, setRecordingFeedback] = useState('');
  const [showRecordingAlert, setShowRecordingAlert] = useState(false);

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
    
    // Simulate voice recording functionality
    if (!isRecording) {
      // Start recording
      setRecordingFeedback('Recording started...');
      setShowRecordingAlert(true);
    } else {
      // Stop recording
      setRecordingFeedback('Recording saved!');
      setShowRecordingAlert(true);
      
      // Simulate saving a voice note URL
      setVoiceNoteUrl('voice-note-' + Date.now() + '.mp3');
      
      // Hide alert after 2 seconds
      setTimeout(() => {
        setShowRecordingAlert(false);
      }, 2000);
      
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
  
  // Handle adding a person to share with
  const handleAddSharedPerson = () => {
    if (newSharedPerson.trim() && !sharedWith.includes(newSharedPerson.trim())) {
      setSharedWith([...sharedWith, newSharedPerson.trim()]);
      setNewSharedPerson('');
      setIsAddingSharedPerson(false);
    }
  };
  
  // Handle removing a shared person
  const handleRemoveSharedPerson = (personToRemove) => {
    setSharedWith(sharedWith.filter(person => person !== personToRemove));
  };

  // Handle form submission
  const handleSubmit = () => {
    // Create transaction object
    const transaction = {
      type: transactionType,
      amount: parseFloat(amount) || 0,
      category: category,
      notes: notes,
      date: new Date().toISOString(),
      receipt: selectedFile || null,
      accountType: accountType,
      isShared: isShared,
      sharedWith: isShared ? sharedWith : [],
      paymentStatus: isShared ? paymentStatus : 'completed',
      voiceNoteUrl: voiceNoteUrl
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

      {/* Recording alert */}
      <Collapse in={showRecordingAlert}>
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          onClose={() => setShowRecordingAlert(false)}
        >
          {recordingFeedback}
        </Alert>
      </Collapse>

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
                    ref={fileInputRef}
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
          
          {voiceNoteUrl && (
            <Card sx={{ mb: 3, bgcolor: theme.palette.grey[50] }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MicIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2">Voice note recorded</Typography>
                </Box>
                <Button size="small" variant="outlined">
                  Play
                </Button>
              </CardContent>
            </Card>
          )}
          
          <Grid container spacing={3}>
            {/* Account Type Selection */}
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: theme.palette.grey[50],
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Account Type
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant={accountType === 'personal' ? 'contained' : 'outlined'}
                      startIcon={<PersonIcon />}
                      onClick={() => setAccountType('personal')}
                      sx={{ p: 1 }}
                    >
                      Personal
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant={accountType === 'business' ? 'contained' : 'outlined'}
                      startIcon={<BusinessIcon />}
                      onClick={() => setAccountType('business')}
                      sx={{ p: 1 }}
                    >
                      Business
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
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
            
            {/* Shared Expense Toggle */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isShared}
                    onChange={(e) => setIsShared(e.target.checked)}
                    color="primary"
                  />
                }
                label="This is a shared expense"
              />
            </Grid>
            
            {/* Shared Expense Details */}
            {isShared && (
              <>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">
                        <GroupIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Shared With
                      </Typography>
                      <Button 
                        size="small" 
                        startIcon={<AddIcon />}
                        onClick={() => setIsAddingSharedPerson(true)}
                      >
                        Add Person
                      </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {sharedWith.length > 0 ? (
                        sharedWith.map((person, index) => (
                          <Chip
                            key={index}
                            label={person}
                            onDelete={() => handleRemoveSharedPerson(person)}
                            color="primary"
                            variant="outlined"
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No contacts added yet
                        </Typography>
                      )}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Payment Status
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant={paymentStatus === 'completed' ? 'contained' : 'outlined'}
                          onClick={() => setPaymentStatus('completed')}
                          sx={{ p: 1 }}
                        >
                          Paid
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          fullWidth
                          variant={paymentStatus === 'pending' ? 'contained' : 'outlined'}
                          onClick={() => setPaymentStatus('pending')}
                          sx={{ p: 1 }}
                        >
                          Pending
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </>
            )}
            
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
                disabled={!amount || !category}
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
      
      {/* Dialog for adding shared person */}
      <Dialog open={isAddingSharedPerson} onClose={() => setIsAddingSharedPerson(false)}>
        <DialogTitle>Add Person</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="shared-person"
            label="Email or Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newSharedPerson}
            onChange={(e) => setNewSharedPerson(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddingSharedPerson(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddSharedPerson} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AddTransactionPage;
