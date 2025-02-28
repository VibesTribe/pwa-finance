import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage';
import AddTransactionPage from './pages/AddTransactionPage';
import DashboardPage from './pages/DashboardPage';
import { TransactionProvider } from './contexts/TransactionContext';
import { AuthProvider } from './contexts/AuthContext';

// Create a custom theme for the application
const theme = createTheme({
  palette: {
    primary: {
      main: '#5E35B1', // Deep purple
    },
    secondary: {
      main: '#00BFA5', // Teal
    },
    background: {
      default: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <TransactionProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/add-transaction" element={<AddTransactionPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </Router>
        </TransactionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
