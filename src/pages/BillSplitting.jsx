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
  useMediaQuery,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  Search,
} from '@mui/icons-material';
import api from '../utils/api';
import colors from '../styles/colors';

const BillSplitting = ({ isMinimized }) => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/groups', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const groupData = response.data.groups || [];
      setGroups(groupData);
      setFilteredGroups(groupData);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...groups];
    if (searchQuery) {
      filtered = filtered.filter(
        group =>
          group.id.toString().includes(searchQuery) ||
          group.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredGroups(filtered);
  }, [searchQuery, groups]);

  const handleViewDetails = group => {
    navigate(`/group-details/${group.id}`);
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
          Loading groups...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}
        >
          Group Management
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Monitor and manage groups and their bill splitting activities
        </Typography>
      </Box>

      <Card
        sx={{
          bgcolor: colors.card,
          borderRadius: '16px',
          boxShadow: `0 4px 12px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'flex-start',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
              p: 3,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                flex: 1,
                maxWidth: { xs: '100%', sm: '320px' },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <TextField
                placeholder="Search groups..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: colors.textSecondary, fontSize: '1.25rem' }} />
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
                    }}
                  >
                    Group ID
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        py: 2,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      Name
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    Creator
                  </TableCell>
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    Member Count
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        py: 2,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      Currency
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    Created At
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: colors.textSecondary,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredGroups.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isMobile ? 4 : 6}
                      align="center"
                      sx={{
                        color: colors.textSecondary,
                        fontSize: '0.9rem',
                        py: 4,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      No groups found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroups.map(group => (
                    <TableRow
                      key={group.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: colors.background,
                        },
                        cursor: 'pointer',
                      }}
                    >
                      <TableCell
                        sx={{
                          py: 2,
                          borderBottom: `1px solid ${colors.border}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color: colors.text,
                                fontSize: '0.9rem',
                                fontWeight: 600,
                              }}
                            >
                              {group.id}
                            </Typography>
                            {isMobile && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: colors.text,
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                }}
                              >
                                {group.name}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      {!isMobile && (
                        <TableCell
                          sx={{
                            color: colors.text,
                            fontSize: '0.9rem',
                            py: 2,
                            borderBottom: `1px solid ${colors.border}`,
                          }}
                        >
                          {group.name}
                        </TableCell>
                      )}
                      <TableCell
                        sx={{
                          color: colors.text,
                          fontSize: '0.9rem',
                          py: 2,
                          borderBottom: `1px solid ${colors.border}`,
                        }}
                      >
                        {group.creator_name} (ID: {group.creator_id})
                      </TableCell>
                      <TableCell
                        sx={{
                          color: colors.text,
                          fontSize: '0.9rem',
                          py: 2,
                          borderBottom: `1px solid ${colors.border}`,
                        }}
                      >
                        {group.member_count}
                      </TableCell>
                      {!isMobile && (
                        <TableCell
                          sx={{
                            color: colors.text,
                            fontSize: '0.9rem',
                            py: 2,
                            borderBottom: `1px solid ${colors.border}`,
                          }}
                        >
                          {group.currency}
                        </TableCell>
                      )}
                      <TableCell
                        sx={{
                          color: colors.text,
                          fontSize: '0.9rem',
                          py: 2,
                          borderBottom: `1px solid ${colors.border}`,
                        }}
                      >
                        {new Date(group.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          py: 2,
                          borderBottom: `1px solid ${colors.border}`,
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility sx={{ fontSize: '1rem' }} />}
                          onClick={() => handleViewDetails(group)}
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
                          }}
                        >
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
    </Box>
  );
};

export default BillSplitting;