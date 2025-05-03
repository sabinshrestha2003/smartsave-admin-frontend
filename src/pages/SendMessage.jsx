import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack, Send } from '@mui/icons-material';
import api from '../utils/api';
import colors from '../styles/colors';

export default function SendMessage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
    details: null,
  });

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
        const response = await api.get('/admin/users/count', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000, 
        });
        console.log('User count response:', response.data); 
        setUserCount(response.data.count || 0);
      } catch (err) {
        console.error('Failed to fetch user count:', err);
        let errorMessage = 'Failed to fetch user count.';
        if (err.response) {
          if (err.response.status === 401) {
            errorMessage = 'Unauthorized. Please log in again.';
            navigate('/admin/login');
          } else if (err.response.status === 403) {
            errorMessage = 'Admin access required.';
          } else {
            errorMessage = err.response.data?.error || 'Server error.';
          }
        } else if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = err.message || 'Network error.';
        }
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      }
    };
    fetchUserCount();
  }, [navigate, setSnackbar]);

  const handleSendMessage = useCallback(async () => {
    console.log('Initiating message send:', { subject, message });
    if (!subject.trim() || !message.trim()) {
      setSnackbar({
        open: true,
        message: 'Subject and message are required.',
        severity: 'error',
      });
      return;
    }

    if (message.length > 10000) {
      setSnackbar({
        open: true,
        message: 'Message is too long (max 10,000 characters).',
        severity: 'error',
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setSnackbar({
        open: true,
        message: 'Authentication token missing. Please log in again.',
        severity: 'error',
      });
      navigate('/admin/login');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        '/admin/send-message',
        { subject, message },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 60000, 
        }
      );
      console.log('API Response:', response.data);
      
      setSnackbar({
        open: true,
        message: `Message sent successfully to ${response.data.success_count} users.`,
        severity: 'success',
        details: response.data.failed_count > 0 ? 
          `Failed to send to ${response.data.failed_count} users.` : null
      });
      
      setSubject('');
      setMessage('');
    } catch (err) {
      console.error('API Error:', err);
      let errorMessage = 'Failed to send message.';
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again later.';
      } else if (err.response) {
        errorMessage = err.response.data?.error || err.response.statusText;
        if (err.response.status === 401) {
          navigate('/admin/login');
        }
      } else {
        errorMessage = err.message;
      }
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
      console.log('Loading state reset');
    }
  }, [subject, message, navigate]);

  const handleConfirmSend = () => {
    setConfirmOpen(true);
  };

  const handleActualSend = () => {
    setConfirmOpen(false);
    handleSendMessage();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{
            color: colors.text,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
            py: 1,
            border: `1px solid ${colors.border}`,
            '&:hover': {
              backgroundColor: colors.card,
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Card
        sx={{
          bgcolor: colors.card,
          borderRadius: '16px',
          boxShadow: `0 4px 12px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          maxWidth: '800px',
          mx: 'auto',
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ color: colors.text, fontWeight: 600, mb: 3 }}>
            Send Message to All Users
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
            This will be sent to {userCount} registered users.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              fullWidth
              variant="outlined"
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: colors.border },
                  '&:hover fieldset': { borderColor: colors.primary },
                  '&.Mui-focused fieldset': { borderColor: colors.primary },
                },
                '& .MuiInputLabel-root': { color: colors.textSecondary },
                '& .MuiInputLabel-root.Mui-focused': { color: colors.primary },
              }}
            />
            <TextField
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              variant="outlined"
              multiline
              rows={6}
              disabled={loading}
              helperText={`${message.length}/10000 characters`}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: colors.border },
                  '&:hover fieldset': { borderColor: colors.primary },
                  '&.Mui-focused fieldset': { borderColor: colors.primary },
                },
                '& .MuiInputLabel-root': { color: colors.textSecondary },
                '& .MuiInputLabel-root.Mui-focused': { color: colors.primary },
              }}
            />
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={handleConfirmSend}
              disabled={loading || !subject.trim() || !message.trim()}
              sx={{
                bgcolor: colors.primary,
                color: colors.white,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                '&:hover': {
                  bgcolor: colors.primary,
                  opacity: 0.9,
                },
                '&.Mui-disabled': {
                  bgcolor: colors.primaryLight,
                  color: colors.white,
                },
              }}
            >
              {loading ? <CircularProgress key={loading ? 'loading' : 'idle'} size={24} sx={{ color: colors.white }} /> : 'Send Message'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent dark backdrop
          },
        }}
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: colors.white, 
            borderRadius: '12px',
            boxShadow: `0 8px 24px ${colors.shadow}`, 
            zIndex: 1300, 
            padding: '16px',
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 600 }}>
          Confirm Message Send
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.text }}>
            This will send to all {userCount} registered users.
          </Typography>
          <Typography sx={{ mt: 2, fontWeight: 600, color: colors.text }}>
            Subject: {subject}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{ color: colors.text, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleActualSend}
            color="primary"
            variant="contained"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: colors.primary,
              '&:hover': {
                bgcolor: colors.primary,
                opacity: 0.9,
              },
            }}
          >
            Confirm Send
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%', bgcolor: snackbar.severity === 'success' ? colors.incomeLight : colors.expenseLight }}
        >
          {snackbar.message}
          {snackbar.details && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {snackbar.details}
            </Typography>
          )}
        </Alert>
      </Snackbar>
    </Box>
  );
}