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
  Paper
} from '@mui/material';
import { 
  ArrowBack, 
  CalendarMonth, 
  AdminPanelSettings,
  Savings,
  Flag,
  History
} from '@mui/icons-material';
import api from '../utils/api';
import colors from '../styles/colors';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([]);
  const [totalTarget, setTotalTarget] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [savingsProgress, setSavingsProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userResponse = await api.get(`/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUser(userResponse.data);

        const goalsResponse = await api.get(`/goals?user_id=${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const goalsData = goalsResponse.data || [];
        setGoals(goalsData);

        const targetResponse = await api.get(`/goals/total-target`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        let totalTargetValue = targetResponse.data.total_target || 0;

        if (totalTargetValue === 0 && goalsData.length > 0) {
          totalTargetValue = goalsData.reduce((sum, goal) => sum + (goal.target || 0), 0);
        }
        setTotalTarget(totalTargetValue);

        const totalSavingsValue = goalsData.reduce((sum, goal) => sum + (goal.progress || 0), 0);
        setTotalSavings(totalSavingsValue);

        const progress = totalTargetValue > 0 ? (totalSavingsValue / totalTargetValue) * 100 : 0;
        setSavingsProgress(Math.min(progress, 100));
      } catch (err) {
        console.error('Failed to fetch user details or savings data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [id]);

  const getStatusColor = (user) => {
    if (!user) return { bg: colors.goldLight, text: colors.gold };
    
    if (user.isBanned) {
      return {
        bg: colors.expenseLight,
        text: colors.expense
      };
    } else if (user.isActive) {
      return {
        bg: colors.incomeLight,
        text: colors.income
      };
    } else {
      return {
        bg: colors.goldLight,
        text: colors.gold
      };
    }
  };

  const getRandomColor = (name) => {
    const colorOptions = [
      { bg: '#EEF2FF', text: '#6366F1' }, 
      { bg: '#E0F2FE', text: '#0EA5E9' }, 
      { bg: '#ECFDF5', text: '#10B981' }, 
      { bg: '#FEF3C7', text: '#F59E0B' }, 
      { bg: '#FFF1F2', text: '#F43F5E' }, 
      { bg: '#F3E8FF', text: '#A855F7' }, 
    ];
    
    const charCode = name ? name.charCodeAt(0) : 0;
    return colorOptions[charCode % colorOptions.length];
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2,
        backgroundColor: colors.background
      }}>
        <CircularProgress size={40} sx={{ color: colors.primary }} />
        <Typography variant="h6" sx={{ color: colors.text }}>Loading user details...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2,
        backgroundColor: colors.background
      }}>
        <Typography variant="h5" sx={{ color: colors.text, fontWeight: 600 }}>User not found</Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/users')}
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
              opacity: 0.9
            }
          }}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  const statusColor = getStatusColor(user);
  const avatarColor = getRandomColor(user.name);

  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: colors.background,
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/users')}
          sx={{
            color: colors.text,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2,
            py: 1,
            border: `1px solid ${colors.border}`,
            '&:hover': {
              backgroundColor: colors.card
            }
          }}
        >
          Back to Users
        </Button>
      </Box>

      {/* User Profile Card */}
      <Card sx={{ 
        bgcolor: colors.card, 
        borderRadius: '16px',
        boxShadow: `0 4px 12px ${colors.shadow}`,
        border: `1px solid ${colors.border}`,
        mb: 3
      }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            gap: 3
          }}>
            <Avatar 
              sx={{ 
                bgcolor: avatarColor.bg, 
                color: avatarColor.text,
                width: 80, 
                height: 80, 
                fontSize: '2rem',
                fontWeight: 600,
                boxShadow: `0 4px 12px ${colors.shadow}`
              }}
            >
              {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
            </Avatar>
            
            <Box sx={{ 
              flex: 1,
              textAlign: { xs: 'center', sm: 'left' }
            }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'flex-start' },
                gap: { xs: 1, sm: 2 },
                mb: 1
              }}>
                <Typography variant="h4" sx={{ 
                  color: colors.text, 
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', sm: '1.75rem' }
                }}>
                  {user.name}
                </Typography>
                <Chip
                  label={user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive'}
                  size="small"
                  sx={{
                    backgroundColor: statusColor.bg,
                    color: statusColor.text,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: '24px',
                    borderRadius: '6px'
                  }}
                />
              </Box>
              
              <Typography sx={{ 
                color: colors.textSecondary,
                mb: 2,
                fontSize: '1rem'
              }}>
                {user.email}
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5 
                  }}>
                    <Box sx={{ 
                      bgcolor: colors.primaryLight,
                      color: colors.primary,
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CalendarMonth />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: colors.textSecondary,
                        fontSize: '0.8rem'
                      }}>
                        Joined Date
                      </Typography>
                      <Typography sx={{ 
                        color: colors.text,
                        fontWeight: 600,
                        fontSize: '0.95rem'
                      }}>
                        {new Date(user.joinedDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5 
                  }}>
                    <Box sx={{ 
                      bgcolor: user.isAdmin ? colors.incomeLight : colors.goldLight,
                      color: user.isAdmin ? colors.income : colors.gold,
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <AdminPanelSettings />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: colors.textSecondary,
                        fontSize: '0.8rem'
                      }}>
                        Admin Status
                      </Typography>
                      <Typography sx={{ 
                        color: colors.text,
                        fontWeight: 600,
                        fontSize: '0.95rem'
                      }}>
                        {user.isAdmin ? 'Administrator' : 'Regular User'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5 
                  }}>
                    <Box sx={{ 
                      bgcolor: colors.tealLight,
                      color: colors.teal,
                      width: 40,
                      height: 40,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Savings />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ 
                        color: colors.textSecondary,
                        fontSize: '0.8rem'
                      }}>
                        Total Savings
                      </Typography>
                      <Typography sx={{ 
                        color: colors.text,
                        fontWeight: 600,
                        fontSize: '0.95rem'
                      }}>
                        ${totalSavings.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            bgcolor: colors.card, 
            borderRadius: '16px',
            boxShadow: `0 4px 12px ${colors.shadow}`,
            border: `1px solid ${colors.border}`,
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                mb: 3
              }}>
                <Box sx={{ 
                  bgcolor: colors.incomeLight,
                  color: colors.income,
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Savings />
                </Box>
                <Typography variant="h6" sx={{ 
                  color: colors.text,
                  fontWeight: 600
                }}>
                  Savings Information
                </Typography>
              </Box>
              
              <List sx={{ p: 0 }}>
                <ListItem sx={{ 
                  px: 0, 
                  py: 1.5,
                  borderBottom: `1px solid ${colors.border}`
                }}>
                  <ListItemText 
                    primary={
                      <Typography sx={{ 
                        color: colors.textSecondary,
                        fontSize: '0.9rem'
                      }}>
                        Total Savings
                      </Typography>
                    } 
                    secondary={
                      <Typography sx={{ 
                        color: colors.text,
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        mt: 0.5
                      }}>
                        ${totalSavings.toFixed(2)}
                      </Typography>
                    } 
                  />
                </ListItem>
                
                <ListItem sx={{ 
                  px: 0, 
                  py: 1.5,
                  borderBottom: `1px solid ${colors.border}`
                }}>
                  <ListItemText 
                    primary={
                      <Typography sx={{ 
                        color: colors.textSecondary,
                        fontSize: '0.9rem'
                      }}>
                        Total Target
                      </Typography>
                    } 
                    secondary={
                      <Typography sx={{ 
                        color: colors.text,
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        mt: 0.5
                      }}>
                        ${totalTarget.toFixed(2)}
                      </Typography>
                    } 
                  />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemText 
                    primary={
                      <Typography sx={{ 
                        color: colors.textSecondary,
                        fontSize: '0.9rem',
                        mb: 1
                      }}>
                        Savings Progress
                      </Typography>
                    } 
                    secondary={
                      <Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={savingsProgress} 
                          sx={{ 
                            height: 8,
                            borderRadius: 4,
                            bgcolor: colors.primaryLight,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: colors.primary
                            }
                          }} 
                        />
                        <Typography sx={{ 
                          color: colors.text,
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          mt: 1,
                          textAlign: 'right'
                        }}>
                          {savingsProgress.toFixed(0)}%
                        </Typography>
                      </Box>
                    } 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            bgcolor: colors.card, 
            borderRadius: '16px',
            boxShadow: `0 4px 12px ${colors.shadow}`,
            border: `1px solid ${colors.border}`,
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                mb: 3
              }}>
                <Box sx={{ 
                  bgcolor: colors.goldLight,
                  color: colors.gold,
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Flag />
                </Box>
                <Typography variant="h6" sx={{ 
                  color: colors.text,
                  fontWeight: 600
                }}>
                  Goals & Targets
                </Typography>
              </Box>
              
              <List sx={{ p: 0 }}>
                {goals.length > 0 ? (
                  goals.map((goal, index) => (
                    <ListItem 
                      key={goal.id}
                      sx={{ 
                        px: 0, 
                        py: 1.5,
                        borderBottom: index < goals.length - 1 ? `1px solid ${colors.border}` : 'none'
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Typography sx={{ 
                            color: colors.text,
                            fontWeight: 600,
                            fontSize: '1rem'
                          }}>
                            {goal.name}
                          </Typography>
                        } 
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              mb: 0.5
                            }}>
                              <Typography sx={{ 
                                color: colors.textSecondary,
                                fontSize: '0.8rem'
                              }}>
                                ${goal.progress.toFixed(2)} of ${goal.target.toFixed(2)}
                              </Typography>
                              <Typography sx={{ 
                                color: colors.primary,
                                fontWeight: 600,
                                fontSize: '0.8rem'
                              }}>
                                {(goal.target > 0 ? (goal.progress / goal.target) * 100 : 0).toFixed(0)}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={goal.target > 0 ? (goal.progress / goal.target) * 100 : 0} 
                              sx={{ 
                                height: 6,
                                borderRadius: 3,
                                bgcolor: colors.primaryLight,
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: colors.primary
                                }
                              }} 
                            />
                          </Box>
                        } 
                      />
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ 
                    py: 4, 
                    textAlign: 'center',
                    color: colors.textSecondary
                  }}>
                    <Typography>No goals set</Typography>
                  </Box>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card sx={{ 
        bgcolor: colors.card, 
        borderRadius: '16px',
        boxShadow: `0 4px 12px ${colors.shadow}`,
        border: `1px solid ${colors.border}`
      }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            mb: 3
          }}>
            <Box sx={{ 
              bgcolor: colors.primaryLight,
              color: colors.primary,
              width: 40,
              height: 40,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <History />
            </Box>
            <Typography variant="h6" sx={{ 
              color: colors.text,
              fontWeight: 600
            }}>
              Recent Activity
            </Typography>
          </Box>
          
          <List sx={{ p: 0 }}>
            {user.recentActivity?.length > 0 ? (
              user.recentActivity.map((activity, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    borderRadius: '12px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.background
                  }}
                >
                  <Typography sx={{ 
                    color: colors.text,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    mb: 0.5
                  }}>
                    {activity.description}
                  </Typography>
                  <Typography sx={{ 
                    color: colors.textSecondary,
                    fontSize: '0.8rem'
                  }}>
                    {new Date(activity.date).toLocaleString()}
                  </Typography>
                </Paper>
              ))
            ) : (
              <Box sx={{ 
                py: 4, 
                textAlign: 'center',
                color: colors.textSecondary
              }}>
                <Typography>No recent activity</Typography>
              </Box>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}