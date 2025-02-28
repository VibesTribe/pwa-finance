import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper,
  useTheme
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { motion } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          borderRadius: 4, 
          backgroundColor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6
        }}
      >
        <Box textAlign="center">
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              mb: 2
            }}
          >
            Finance Tracker
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Simplify your personal finances
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: 320 }}>
          {/* Add Transaction Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              fullWidth
              size="large"
              variant="contained"
              color="primary"
              startIcon={<AddCircleOutlineIcon sx={{ fontSize: 28 }} />}
              onClick={() => navigate('/add-transaction')}
              sx={{ 
                py: 2,
                fontSize: '1.1rem',
                display: 'flex',
                justifyContent: 'flex-start',
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }}
            >
              Add Transaction
            </Button>
          </motion.div>

          {/* Dashboard Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              fullWidth
              size="large"
              variant="outlined"
              color="primary"
              startIcon={<DashboardIcon sx={{ fontSize: 28 }} />}
              onClick={() => navigate('/dashboard')}
              sx={{ 
                py: 2,
                fontSize: '1.1rem',
                display: 'flex',
                justifyContent: 'flex-start',
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                }
              }}
            >
              View Dashboard
            </Button>
          </motion.div>
        </Box>
      </Paper>
    </Container>
  );
};

export default HomePage;
