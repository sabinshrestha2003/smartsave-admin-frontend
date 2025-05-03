import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  TextField,
  Tabs,
  Tab,
  Switch,
  useMediaQuery,
  Modal,
  Paper,
  InputAdornment,
  Chip,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Flag,
  Visibility,
  Search,
  ArrowUpward,
  ArrowDownward,
  CalendarMonth,
  Category,
  AccountBalance,
  Description,
} from '@mui/icons-material';
import api from '../utils/api';
import colors from '../styles/colors';

const Transactions = ({ isMinimized }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transactions/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const transactionData = (response.data || []).map(txn => ({
        ...txn,
        user_id: txn.user_id ?? 'Unknown',
        category: txn.category ?? 'Uncategorized',
        flagged: txn.flagged ?? false,
        date: txn.date ?? new Date().toISOString(),
        amount: txn.amount ?? 0,
      }));
      setTransactions(transactionData);
      setFilteredTransactions(transactionData);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...transactions];
    if (searchQuery) {
      filtered = filtered.filter(txn => {
        if (!txn.category) {
          console.warn('Transaction with null category:', txn);
        }
        return (
          txn.user_id?.toString().includes(searchQuery) ||
          (txn.category ?? '').toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(txn =>
        statusFilter === 'flagged' ? txn.flagged : !txn.flagged,
      );
    }
    setFilteredTransactions(filtered);
  }, [searchQuery, statusFilter, transactions]);

  const handleToggleFlag = async (txnId, currentStatus) => {
    try {
      const updatedTransaction = { flagged: !currentStatus };
      await api.patch(`/transactions/${txnId}/flag`, updatedTransaction, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTransactions(
        transactions.map(txn =>
          txn.id === txnId ? { ...txn, flagged: !currentStatus } : txn,
        ),
      );
    } catch (err) {
      console.error('Failed to update flag status:', err);
    }
  };

  const handleViewDetails = txn => {
    setSelectedTransaction(txn);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTransaction(null);
  };

  const getTransactionTypeIcon = (type, amount) => {
    if (type === 'expense' || amount < 0) {
      return (
        <ArrowDownward sx={{ color: colors.expense, fontSize: '1.25rem' }} />
      );
    } else {
      return <ArrowUpward sx={{ color: colors.income, fontSize: '1.25rem' }} />;
    }
  };

  const getAmountColor = amount => {
    return amount < 0 ? colors.expense : colors.income;
  };

  const renderModal = () => (
    <Modal open={modalOpen} onClose={closeModal}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: colors.text,
          borderRadius: '16px',
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5)`,
          border: `1px solid ${colors.textSecondary}`,
          p: 4,
        }}>
        {selectedTransaction && (
          <>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: colors.white,
                mb: 3,
              }}>
              Transaction Details
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2,
                  }}>
                  <Box
                    sx={{
                      bgcolor: colors.primary,
                      color: colors.white,
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Description />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.8rem',
                      }}>
                      Transaction ID
                    </Typography>
                    <Typography
                      sx={{
                        color: colors.white,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      }}>
                      {selectedTransaction.id}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2,
                  }}>
                  <Box
                    sx={{
                      bgcolor: colors.primary,
                      color: colors.white,
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Description />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.8rem',
                      }}>
                      User ID
                    </Typography>
                    <Typography
                      sx={{
                        color: colors.white,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      }}>
                      {selectedTransaction.user_id}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2,
                  }}>
                  <Box
                    sx={{
                      bgcolor:
                        selectedTransaction.amount < 0
                          ? colors.expense
                          : colors.income,
                      color: colors.white,
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    {getTransactionTypeIcon(
                      selectedTransaction.type,
                      selectedTransaction.amount,
                    )}
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.8rem',
                      }}>
                      Amount
                    </Typography>
                    <Typography
                      sx={{
                        color: getAmountColor(selectedTransaction.amount),
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      }}>
                      ${Math.abs(selectedTransaction.amount).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2,
                  }}>
                  <Box
                    sx={{
                      bgcolor: colors.teal,
                      color: colors.white,
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <CalendarMonth />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.8rem',
                      }}>
                      Date
                    </Typography>
                    <Typography
                      sx={{
                        color: colors.white,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      }}>
                      {new Date(selectedTransaction.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2,
                  }}>
                  <Box
                    sx={{
                      bgcolor: colors.gold,
                      color: colors.white,
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Category />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.8rem',
                      }}>
                      Category
                    </Typography>
                    <Typography
                      sx={{
                        color: colors.white,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      }}>
                      {selectedTransaction.category || 'Uncategorized'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2,
                  }}>
                  <Box
                    sx={{
                      bgcolor: colors.primary,
                      color: colors.white,
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <AccountBalance />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.8rem',
                      }}>
                      Account
                    </Typography>
                    <Typography
                      sx={{
                        color: colors.white,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      }}>
                      {selectedTransaction.account || 'Main Account'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2,
                  }}>
                  <Box
                    sx={{
                      bgcolor: selectedTransaction.flagged
                        ? colors.expense
                        : colors.income,
                      color: colors.white,
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Flag />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.8rem',
                      }}>
                      Status
                    </Typography>
                    <Typography
                      sx={{
                        color: selectedTransaction.flagged
                          ? colors.expense
                          : colors.income,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                      }}>
                      {selectedTransaction.flagged ? 'Flagged' : 'Normal'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 2,
                  }}>
                  <Box
                    sx={{
                      bgcolor: colors.primary,
                      color: colors.white,
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Description />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.8rem',
                      }}>
                      Type
                    </Typography>
                    <Typography
                      sx={{
                        color: colors.white,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        textTransform: 'capitalize',
                      }}>
                      {selectedTransaction.type ||
                        (selectedTransaction.amount < 0 ? 'Expense' : 'Income')}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {selectedTransaction.description && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.textSecondary,
                    fontSize: '0.8rem',
                    mb: 0.5,
                  }}>
                  Description
                </Typography>
                <Typography
                  sx={{
                    color: colors.white,
                    fontSize: '0.95rem',
                    p: 2,
                    borderRadius: '10px',
                    backgroundColor: colors.textSecondary,
                    border: `1px solid ${colors.textSecondary}`,
                  }}>
                  {selectedTransaction.description}
                </Typography>
              </Box>
            )}

            <Box
              sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
              <Button
                onClick={closeModal}
                variant="outlined"
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  color: colors.white,
                  borderColor: colors.textSecondary,
                  '&:hover': {
                    borderColor: colors.primary,
                    backgroundColor: colors.primaryLight,
                  },
                }}>
                Close
              </Button>
              <Button
                onClick={() => {
                  closeModal();
                  handleToggleFlag(
                    selectedTransaction.id,
                    selectedTransaction.flagged,
                  );
                }}
                variant="contained"
                startIcon={<Flag />}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: selectedTransaction.flagged
                    ? colors.income
                    : colors.expense,
                  color: colors.white,
                  '&:hover': {
                    bgcolor: selectedTransaction.flagged
                      ? colors.income
                      : colors.expense,
                    opacity: 0.9,
                  },
                }}>
                {selectedTransaction.flagged
                  ? 'Remove Flag'
                  : 'Flag Transaction'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: colors.background,
        }}>
        <CircularProgress size={40} sx={{ color: colors.primary }} />
        <Typography variant="h6" sx={{ color: colors.text }}>
          Loading transactions...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
          Transaction Management
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Monitor and control financial transactions
        </Typography>
      </Box>

      <Card
        sx={{
          bgcolor: colors.card,
          borderRadius: '16px',
          boxShadow: `0 4px 12px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
        }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
              p: 3,
              borderBottom: `1px solid ${colors.border}`,
            }}>
            <Box
              sx={{
                position: 'relative',
                flex: 1,
                maxWidth: { xs: '100%', sm: '320px' },
                width: { xs: '100%', sm: 'auto' },
              }}>
              <TextField
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search
                        sx={{ color: colors.textSecondary, fontSize: '1.25rem' }}
                      />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    backgroundColor: colors.background,
                    '&:hover': {
                      backgroundColor: colors.background,
                    },
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: colors.border },
                    '&:hover fieldset': { borderColor: colors.primary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />
            </Box>
            <Paper
              sx={{
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: 'none',
                border: `1px solid ${colors.border}`,
                bgcolor: colors.background,
              }}>
              <Tabs
                value={statusFilter}
                onChange={(e, value) => setStatusFilter(value)}
                sx={{
                  minWidth: '240px',
                  '& .MuiTab-root': {
                    color: colors.textSecondary,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    fontWeight: 500,
                    minWidth: '80px',
                  },
                  '& .Mui-selected': {
                    color: colors.primary,
                    fontWeight: 600,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: colors.primary,
                  },
                }}>
                <Tab label="All Transactions" value="all" />
                <Tab label="Normal" value="normal" />
                <Tab label="Flagged" value="flagged" />
              </Tabs>
            </Paper>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: colors.background }}>
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}>
                    User ID
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        py: 2,
                        borderBottom: `1px solid ${colors.border}`,
                      }}>
                      Amount
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}>
                    Date
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        py: 2,
                        borderBottom: `1px solid ${colors.border}`,
                      }}>
                      Category
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}>
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}>
                    Flagged
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: colors.textSecondary,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isMobile ? 4 : 6}
                      align="center"
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.9rem',
                        py: 4,
                        borderBottom: `1px solid ${colors.border}`,
                      }}>
                      No transactions found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map(txn => (
                    <TableRow
                      key={txn.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: colors.background,
                        },
                        cursor: 'pointer',
                      }}>
                      <TableCell
                        sx={{
                          py: 2,
                          borderBottom: `1px solid ${colors.border}`,
                        }}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: colors.text,
                                fontSize: '0.9rem',
                                fontWeight: 600,
                              }}>
                              {txn.user_id}
                            </Typography>
                            {isMobile && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: getAmountColor(txn.amount),
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                }}>
                                ${Math.abs(txn.amount).toFixed(2)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      {!isMobile && (
                        <TableCell
                          sx={{
                            color: getAmountColor(txn.amount),
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            py: 2,
                            borderBottom: `1px solid ${colors.border}`,
                          }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}>
                            {getTransactionTypeIcon(txn.type, txn.amount)}$
                            {Math.abs(txn.amount).toFixed(2)}
                          </Box>
                        </TableCell>
                      )}
                      <TableCell
                        sx={{
                          color: colors.text,
                          fontSize: '0.9rem',
                          py: 2,
                          borderBottom: `1px solid ${colors.border}`,
                        }}>
                        {new Date(txn.date).toLocaleDateString()}
                      </TableCell>
                      {!isMobile && (
                        <TableCell
                          sx={{
                            color: colors.text,
                            fontSize: '0.9rem',
                            py: 2,
                            borderBottom: `1px solid ${colors.border}`,
                          }}>
                          {txn.category || 'Uncategorized'}
                        </TableCell>
                      )}
                      <TableCell
                        sx={{
                          py: 2,
                          borderBottom: `1px solid ${colors.border}`,
                        }}>
                        <Chip
                          label={txn.flagged ? 'Flagged' : 'Normal'}
                          size="small"
                          sx={{
                            backgroundColor: txn.flagged
                              ? colors.expenseLight
                              : colors.incomeLight,
                            color: txn.flagged ? colors.expense : colors.income,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: '24px',
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 2,
                          borderBottom: `1px solid ${colors.border}`,
                        }}>
                        <Switch
                          size="small"
                          checked={txn.flagged || false}
                          onChange={() => handleToggleFlag(txn.id, txn.flagged)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: colors.expense,
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                              {
                                backgroundColor: colors.expenseLight,
                              },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          py: 2,
                          borderBottom: `1px solid ${colors.border}`,
                        }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility sx={{ fontSize: '1rem' }} />}
                          onClick={() => handleViewDetails(txn)}
                          sx={{
                            fontSize: '0.8rem',
                            borderRadius: '8px',
                            borderColor: colors.border,
                            color: colors.primary,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: colors.primary,
                              backgroundColor: colors.primaryLight,
                            },
                          }}>
                          {isMobile ? '' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
      {renderModal()}
    </Box>
  );
};

export default Transactions;