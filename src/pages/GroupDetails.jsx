import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  CalendarMonth,
  Group,
  AttachMoney,
  Flag,
  Description,
} from '@mui/icons-material';
import api from '../utils/api';
import colors from '../styles/colors';

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalBillSplits, setTotalBillSplits] = useState(0);
  const [flaggedBillSplits, setFlaggedBillSplits] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const response = await api.get(`/admin/groups/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const groupData = {
          ...response.data.group,
          id: response.data.group.id ?? 'Unknown',
          name: response.data.group.name ?? 'Unnamed Group',
          creator_id: response.data.group.creator_id ?? 'Unknown',
          creator_name: response.data.group.creator_name ?? 'Unknown',
          currency: response.data.group.currency ?? 'USD',
          type: response.data.group.type ?? 'Unknown',
          created_at: response.data.group.created_at ?? new Date().toISOString(),
          members: response.data.group.members ?? [],
          bill_splits: response.data.group.bill_splits ?? [],
        };
        if (!groupData.name) {
          console.warn('Group with null name:', groupData);
        }
        setGroup(groupData);

        const billSplits = groupData.bill_splits;
        setTotalBillSplits(billSplits.length);
        const flaggedCount = billSplits.filter(split => split.flagged).length;
        setFlaggedBillSplits(flaggedCount);
        const total = billSplits.reduce((sum, split) => sum + (split.total_amount || 0), 0);
        setTotalAmount(total);
      } catch (err) {
        console.error('Failed to fetch group details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroupDetails();
  }, [id]);

  const getAvatarColor = (name) => {
    const colorOptions = [
      { bg: '#EEF2FF', text: '#6366F1' },
      { bg: '#E0F2FE', text: '#0EA5E9' },
      { bg: '#ECFDF5', text: '#10B981' },
      { bg: '#FEF3C7', text: '#F59E0B' },
      { bg: '#FFF1F2', text: '#F43F5E' },
      { bg: '#F3E8FF', text: '#A855F7' },
    ];
    const safeName = name ?? 'Unnamed';
    const charCode = safeName.charCodeAt(0);
    return colorOptions[charCode % colorOptions.length];
  };

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
        }}
      >
        <CircularProgress size={40} sx={{ color: colors.primary }} />
        <Typography variant="h6" sx={{ color: colors.text }}>
          Loading group details...
        </Typography>
      </Box>
    );
  }

  if (!group) {
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
        }}
      >
        <Typography variant="h5" sx={{ color: colors.text, fontWeight: 600 }}>
          Group not found
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/bill-splitting')}
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
          }}
        >
          Back to Groups
        </Button>
      </Box>
    );
  }

  const avatarColor = getAvatarColor(group.name);

  return (
    <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/bill-splitting')}
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
          Back to Groups
        </Button>
      </Box>

      {/* Group Profile Card */}
      <Card
        sx={{
          bgcolor: colors.card,
          borderRadius: '16px',
          boxShadow: `0 4px 12px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' },
              gap: 3,
            }}
          >
            <Avatar
              sx={{
                bgcolor: avatarColor.bg,
                color: avatarColor.text,
                width: 80,
                height: 80,
                fontSize: '2rem',
                fontWeight: 600,
                boxShadow: `0 4px 12px ${colors.shadow}`,
              }}
            >
              {group.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Avatar>

            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography
                variant="h4"
                sx={{
                  color: colors.text,
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                  mb: 1,
                }}
              >
                {group.name}
              </Typography>

              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        bgcolor: colors.primaryLight,
                        color: colors.primary,
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Description />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                        Group ID
                      </Typography>
                      <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.95rem' }}>
                        {group.id}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        bgcolor: colors.tealLight,
                        color: colors.teal,
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Group />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                        Creator
                      </Typography>
                      <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.95rem' }}>
                        {group.creator_name} (ID: {group.creator_id})
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        bgcolor: colors.goldLight,
                        color: colors.gold,
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CalendarMonth />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                        Created At
                      </Typography>
                      <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.95rem' }}>
                        {new Date(group.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        bgcolor: colors.incomeLight,
                        color: colors.income,
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AttachMoney />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                        Currency
                      </Typography>
                      <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.95rem' }}>
                        {group.currency}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        bgcolor: colors.primaryLight,
                        color: colors.primary,
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Description />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                        Type
                      </Typography>
                      <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.95rem' }}>
                        {group.type}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Group Information */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              bgcolor: colors.card,
              borderRadius: '16px',
              boxShadow: `0 4px 12px ${colors.shadow}`,
              border: `1px solid ${colors.border}`,
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    bgcolor: colors.incomeLight,
                    color: colors.income,
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Group />
                </Box>
                <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                  Group Members
                </Typography>
              </Box>

              <List sx={{ p: 0 }}>
                {group.members.length > 0 ? (
                  group.members.map((member, index) => (
                    <ListItem
                      key={member.user_id}
                      sx={{
                        px: 0,
                        py: 1.5,
                        borderBottom: index < group.members.length - 1 ? `1px solid ${colors.border}` : 'none',
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1rem' }}>
                            {member.name}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                            ID: {member.user_id}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center', color: colors.textSecondary }}>
                    <Typography>No members found</Typography>
                  </Box>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              bgcolor: colors.card,
              borderRadius: '16px',
              boxShadow: `0 4px 12px ${colors.shadow}`,
              border: `1px solid ${colors.border}`,
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    bgcolor: colors.goldLight,
                    color: colors.gold,
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AttachMoney />
                </Box>
                <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                  Bill Split Summary
                </Typography>
              </Box>

              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0, py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
                  <ListItemText
                    primary={
                      <Typography sx={{ color: colors.textSecondary, fontSize: '0.9rem' }}>
                        Total Bill Splits
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1.1rem', mt: 0.5 }}>
                        {totalBillSplits}
                      </Typography>
                    }
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1.5, borderBottom: `1px solid ${colors.border}` }}>
                  <ListItemText
                    primary={
                      <Typography sx={{ color: colors.textSecondary, fontSize: '0.9rem' }}>
                        Flagged Bill Splits
                      </Typography>
                    }
                    secondary={
                      <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '1.1rem', mt: 0.5 }}>
                        {flaggedBillSplits}
                      </Typography>
                    }
                  />
                </ListItem>

                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemText
                    primary={
                      <Typography sx={{ color: colors.textSecondary, fontSize: '0.9rem', mb: 1 }}>
                        Flagged Progress
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <LinearProgress
                          variant="determinate"
                          value={totalBillSplits > 0 ? (flaggedBillSplits / totalBillSplits) * 100 : 0}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: colors.primaryLight,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: colors.primary,
                            },
                          }}
                        />
                        <Typography
                          sx={{ color: colors.text, fontWeight: 600, fontSize: '0.9rem', mt: 1, textAlign: 'right' }}
                        >
                          {(totalBillSplits > 0 ? (flaggedBillSplits / totalBillSplits) * 100 : 0).toFixed(0)}%
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bill Splits */}
      <Card
        sx={{
          bgcolor: colors.card,
          borderRadius: '16px',
          boxShadow: `0 4px 12px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                bgcolor: colors.primaryLight,
                color: colors.primary,
                width: 40,
                height: 40,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Flag />
            </Box>
            <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
              Bill Splits
            </Typography>
          </Box>

          <List sx={{ p: 0 }}>
            {group.bill_splits.length > 0 ? (
              group.bill_splits.map((split, index) => (
                <Paper
                  key={split.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: '12px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.background,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ color: colors.text, fontWeight: 600, fontSize: '0.95rem' }}>
                      {split.name} (ID: {split.id})
                    </Typography>
                    <Chip
                      label={split.flagged ? 'Flagged' : 'Normal'}
                      size="small"
                      sx={{
                        backgroundColor: split.flagged ? colors.expenseLight : colors.incomeLight,
                        color: split.flagged ? colors.expense : colors.income,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: '24px',
                        borderRadius: '6px',
                      }}
                    />
                  </Box>
                  <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem', mb: 1 }}>
                    Total Amount: ${split.total_amount.toFixed(2)}
                  </Typography>
                  <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem', mb: 1 }}>
                    Date: {new Date(split.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography sx={{ color: colors.textSecondary, fontSize: '0.8rem', mb: 1 }}>
                    Participants:
                  </Typography>
                  {split.participants.map((p, pIndex) => (
                    <Box key={pIndex} sx={{ display: 'flex', justifyContent: 'space-between', ml: 2, mb: 0.5 }}>
                      <Typography sx={{ color: colors.text, fontSize: '0.8rem' }}>
                        {p.name} (ID: {p.user_id})
                      </Typography>
                      <Typography sx={{ color: colors.income, fontSize: '0.8rem' }}>
                        Share: ${p.share_amount.toFixed(2)} | Paid: ${p.paid_amount.toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              ))
            ) : (
              <Box sx={{ py: 4, textAlign: 'center', color: colors.textSecondary }}>
                <Typography>No bill splits found</Typography>
              </Box>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}