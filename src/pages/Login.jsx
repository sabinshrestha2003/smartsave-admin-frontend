import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Paper,
} from '@mui/material';
import colors from '../styles/colors';
import logo from '../assets/original.png'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(''); 
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: '40px',
          borderRadius: '16px',
          backgroundColor: colors.white,
          boxShadow: `0 4px 20px ${colors.shadow}`,
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3, 
          }}
        >
          <img
            src={logo || "/placeholder.svg"} 
            alt="SmartSave Logo"
            style={{
              width: '80px', 
              height: '80px',
              objectFit: 'contain',
            }}
          />
        </Box>

        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ color: colors.text, fontWeight: '600', fontSize: '28px' }}
        >
          Admin Login
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{ color: colors.textSecondary, marginBottom: '24px' }}
        >
          Sign in to manage SmartSave
        </Typography>

        <Box component="form" noValidate>
          <TextField
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ style: { color: colors.textSecondary } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: colors.border },
                '&:hover fieldset': { borderColor: colors.primary },
                '&.Mui-focused fieldset': { borderColor: colors.primary },
              },
              marginBottom: '16px',
            }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            variant="outlined"
            InputLabelProps={{ style: { color: colors.textSecondary } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: colors.border },
                '&:hover fieldset': { borderColor: colors.primary },
                '&.Mui-focused fieldset': { borderColor: colors.primary },
              },
              marginBottom: '16px',
            }}
          />
          {error && (
            <Typography
              variant="body2"
              align="center"
              sx={{ color: colors.expense, marginTop: '10px', marginBottom: '10px' }}
            >
              {error}
            </Typography>
          )}
          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            disabled={loading}
            sx={{
              marginTop: '16px',
              backgroundColor: colors.primary,
              color: colors.white,
              padding: '12px 0',
              fontWeight: '600',
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '16px',
              '&:hover': { backgroundColor: colors.primary, opacity: 0.9 },
              '&:disabled': { backgroundColor: colors.border, color: colors.textSecondary },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;