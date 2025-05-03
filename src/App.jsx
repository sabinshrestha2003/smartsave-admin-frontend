import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetails from './pages/UserDetails';
import Transactions from './pages/Transactions';
import BillSplitting from './pages/BillSplitting';
import GroupDetails from './pages/GroupDetails';
import SendMessage from './pages/SendMessage';
import ReportsAnalytics from './pages/ReportsAnalytics';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography } from '@mui/material';
import colors from './styles/colors';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: colors.background,
      paper: colors.card,
    },
    text: {
      primary: colors.text,
      secondary: colors.textSecondary,
    },
    primary: {
      main: colors.primary,
      light: colors.primaryLight,
    },
    secondary: {
      main: colors.teal,
    },
    error: {
      main: colors.expense,
      light: colors.expenseLight,
    },
    success: {
      main: colors.income,
      light: colors.incomeLight,
    },
    warning: {
      main: colors.gold,
      light: colors.goldLight,
    },
    info: {
      main: colors.teal,
      light: colors.tealLight,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: colors.text,
    },
    h2: {
      fontWeight: 700,
      color: colors.text,
    },
    h3: {
      fontWeight: 600,
      color: colors.text,
    },
    h4: {
      fontWeight: 600,
      color: colors.text,
    },
    h5: {
      fontWeight: 600,
      color: colors.text,
    },
    h6: {
      fontWeight: 600,
      color: colors.text,
    },
    subtitle1: {
      fontWeight: 500,
      color: colors.text,
    },
    subtitle2: {
      fontWeight: 500,
      color: colors.textSecondary,
    },
    body1: {
      color: colors.text,
    },
    body2: {
      color: colors.textSecondary,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
        },
        contained: {
          boxShadow: `0 4px 12px ${colors.shadow}`,
          '&:hover': {
            boxShadow: `0 6px 16px ${colors.shadow}`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: `0 4px 12px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

function MainLayout({ isMinimized, setIsMinimized, children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/admin/login';

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        m: 0,
        backgroundColor: colors.background,
      }}
    >
      {!isLoginPage && <Navbar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          width: 0,
          ml: isLoginPage ? 0 : { xs: 0, md: isMinimized ? '72px' : '240px' },
          transition: 'margin-left 0.3s ease',
          bgcolor: colors.background,
          overflowY: 'auto',
          p: 0,
          m: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function App() {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <MainLayout isMinimized={isMinimized} setIsMinimized={setIsMinimized}>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard isMinimized={isMinimized} />} />
            <Route path="/users" element={<Users isMinimized={isMinimized} />} />
            <Route path="/user-details/:id" element={<UserDetails />} />
            <Route path="/transactions" element={<Transactions isMinimized={isMinimized} />} />
            <Route path="/bill-splitting" element={<BillSplitting isMinimized={isMinimized} />} />
            <Route path="/group-details/:id" element={<GroupDetails />} />
            <Route path="/send-message" element={<SendMessage />} />
            <Route path="/analytics" element={<ReportsAnalytics isMinimized={isMinimized} />} />
            <Route path="/savings" element={<PlaceholderPage title="Savings & Goals" />} />
            <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
            <Route path="/add-user" element={<PlaceholderPage title="Add User" />} />
            <Route path="/flagged-transactions" element={<PlaceholderPage title="Flagged Transactions" />} />
            <Route path="/logout" element={<PlaceholderPage title="Logging Out..." />} />
            <Route path="*" element={<PlaceholderPage title="404 - Page Not Found" error />} />
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
}

const PlaceholderPage = ({ title, error }) => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      color: error ? colors.expense : colors.text,
      p: 3,
      backgroundColor: colors.background,
    }}
  >
    <Box
      sx={{
        backgroundColor: colors.card,
        padding: 5,
        borderRadius: 4,
        boxShadow: `0 4px 20px ${colors.shadow}`,
        border: `1px solid ${colors.border}`,
        maxWidth: '600px',
        width: '100%',
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: '700',
          marginBottom: 2,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: colors.textSecondary,
          marginBottom: error ? 3 : 0,
        }}
      >
        {error
          ? 'The page you are looking for does not exist or has been moved.'
          : 'This page is under development.'}
      </Typography>
      {error && (
        <Typography variant="body2" sx={{ color: colors.primary }}>
          Please check the URL or navigate back to the dashboard.
        </Typography>
      )}
    </Box>
  </Box>
);

export default App;