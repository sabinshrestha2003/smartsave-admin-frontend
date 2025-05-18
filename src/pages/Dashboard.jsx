import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Card,
  InputBase,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Snackbar,
  Alert,
  Paper,
  Grid,
  IconButton,
  Divider,
  Tooltip,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  People as UsersIcon,
  BarChart as BarChartIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import api from "../utils/api";
import Slide from "@mui/material/Slide";
import colors from "../styles/colors";

const Dashboard = ({ isMinimized }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;
  const navigate = useNavigate();

  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    banned: 0,
  });
  const [transactionStats, setTransactionStats] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    totalAmount: "$0",
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!isMounted) return;
      setLoading(true);
      try {
        const [
          usersResponse,
          transactionsResponse,
          overviewResponse,
          activitiesResponse,
        ] = await Promise.all([
          api
            .get("/admin/users")
            .catch((err) => ({ error: err, endpoint: "/admin/users" })),
          api
            .get("/transactions/all")
            .catch((err) => ({ error: err, endpoint: "/transactions/all" })),
          api
            .get("/transactions/overview")
            .catch((err) => ({
              error: err,
              endpoint: "/transactions-overview",
            })),
          api
            .get("/transactions/recent")
            .catch((err) => ({ error: err, endpoint: "/transactions/recent" })),
        ]);

        if (!isMounted) return;

        const errors = [];
        const safeErrorMessage = (err, endpoint) => {
          if (!err) return "Unknown error";
          if (err.response) {
            const status = err.response.status;
            if (status === 401) return "Unauthorized: Please log in";
            if (status === 403) return "Forbidden: Admin access required";
            return (
              err.response.data?.error || err.message || `HTTP ${status} error`
            );
          }
          return (
            err.message || `Network error (check backend logs for ${endpoint})`
          );
        };

        if (usersResponse.error) {
          errors.push(
            `Users (${usersResponse.endpoint}): ${safeErrorMessage(
              usersResponse.error,
              usersResponse.endpoint
            )}`
          );
          console.error("Users error details:", usersResponse.error);
        }
        if (transactionsResponse.error) {
          errors.push(
            `Transactions (${
              transactionsResponse.endpoint
            }): ${safeErrorMessage(
              transactionsResponse.error,
              transactionsResponse.endpoint
            )}`
          );
          console.error(
            "Transactions error details:",
            transactionsResponse.error
          );
        }
        if (overviewResponse.error) {
          errors.push(
            `Overview (${overviewResponse.endpoint}): ${safeErrorMessage(
              overviewResponse.error,
              overviewResponse.endpoint
            )}`
          );
          console.error(
            "Overview error details:",
            JSON.stringify(overviewResponse.error, null, 2)
          );
        }
        if (activitiesResponse.error) {
          errors.push(
            `Activities (${activitiesResponse.endpoint}): ${safeErrorMessage(
              activitiesResponse.error,
              activitiesResponse.endpoint
            )}`
          );
          console.error("Activities error details:", activitiesResponse.error);
        }

        if (errors.length > 0) {
          console.error("API errors:", errors);
          setError(`Partial data loaded. Issues: ${errors.join("; ")}`);
          setOpenSnackbar(true);
          if (
            errors.some(
              (e) => e.includes("Unauthorized") || e.includes("Forbidden")
            )
          ) {
            localStorage.removeItem("token");
            navigate("/");
            return;
          }
        }

        if (!usersResponse.error) {
          const {
            totalActiveUsers = 0,
            totalInactiveUsers = 0,
            totalBannedUsers = 0,
            users = [],
          } = usersResponse.data || {};
          setUserStats({
            total: users.length,
            active: totalActiveUsers,
            inactive: totalInactiveUsers,
            banned: totalBannedUsers,
          });
        }

        if (!transactionsResponse.error) {
          const transactions = transactionsResponse.data || [];
          const dailyTransactions = transactions.filter(
            (t) =>
              t?.date &&
              new Date(t.date).toDateString() === new Date().toDateString()
          ).length;
          const weeklyTransactions = transactions.filter((t) => {
            const transactionDate = new Date(t?.date || "");
            const now = new Date();
            const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
            return (
              !isNaN(transactionDate) &&
              transactionDate >= oneWeekAgo &&
              transactionDate <= new Date()
            );
          }).length;
          const monthlyTransactions = transactions.filter((t) => {
            const transactionDate = new Date(t?.date || "");
            const now = new Date();
            const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return (
              !isNaN(transactionDate) &&
              transactionDate >= oneMonthAgo &&
              transactionDate <= new Date()
            );
          }).length;

          let totalSavings = 0;
          let totalExpenses = 0;
          if (!overviewResponse.error) {
            totalSavings = overviewResponse.data?.totalSavings || 0;
            totalExpenses = overviewResponse.data?.totalExpenses || 0;
          } else {
            totalSavings = transactions
              .filter((t) => t.type === "income")
              .reduce((sum, t) => sum + t.amount, 0);
            totalExpenses = transactions
              .filter((t) => t.type === "expense")
              .reduce((sum, t) => sum + t.amount, 0);
          }

          const totalAmount = (totalSavings - totalExpenses).toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: "USD",
            }
          );

          setTransactionStats({
            daily: dailyTransactions,
            weekly: weeklyTransactions,
            monthly: monthlyTransactions,
            totalAmount,
          });
        }

        if (!activitiesResponse.error) {
          const {
            recentTransactions = [],
            newUserSignups = [],
            flaggedTransactions = [],
          } = activitiesResponse.data || {};

          const formattedActivities = [
            ...recentTransactions.map((t) => ({
              id: t.id,
              type: "transaction",
              user: t.user_id != null ? `User ${t.user_id}` : "Unknown User",
              time: new Date(t.date).toLocaleString(),
              amount: t.amount != null ? `$${Math.abs(t.amount)}` : "$0",
              status: "completed",
            })),
            ...newUserSignups.map((u) => ({
              id: u.id,
              type: "signup",
              user: u.name ?? "Unknown User",
              time: new Date(u.joinedDate).toLocaleString(),
              status: "completed",
            })),
            ...flaggedTransactions.map((t) => ({
              id: t.id,
              type: "transaction",
              user: t.user_id != null ? `User ${t.user_id}` : "Unknown User",
              time: new Date(t.date).toLocaleString(),
              amount: t.amount != null ? `$${Math.abs(t.amount)}` : "$0",
              status: "pending",
            })),
          ].sort((a, b) => new Date(b.time) - new Date(a.time));

          setRecentActivity(formattedActivities);
        }
      } catch (err) {
        console.error(
          "Unexpected error:",
          err,
          "Error details:",
          JSON.stringify(err, null, 2)
        );
        setError(
          `Failed to load dashboard: ${
            err.message || "Unknown error (check backend logs)"
          }`
        );
        setOpenSnackbar(true);
        if (err.message?.includes("401") || err.message?.includes("403")) {
          localStorage.removeItem("token");
          navigate("/");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const filteredActivity = useMemo(() => {
    return recentActivity.filter((activity) => {
      const user = activity.user ?? "";
      const amount = activity.amount ?? "";
      const query = searchQuery.toLowerCase();
      return (
        user.toLowerCase().includes(query) ||
        (amount && amount.toLowerCase().includes(query))
      );
    });
  }, [recentActivity, searchQuery]);

  const paginatedActivity = useMemo(() => {
    return filteredActivity.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredActivity, page]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError("");
  };

  const handleNextPage = () => {
    if ((page + 1) * rowsPerPage < filteredActivity.length) setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: colors.background, pb: 4 }}>
        <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 3 } }}>
          <Box sx={{ mb: 4 }}>
            <Skeleton height={40} width={300} />
            <Skeleton height={20} width={400} />
          </Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ p: 3, bgcolor: colors.card, borderRadius: "16px" }}>
                <Skeleton height={48} width={48} circle />
                <Skeleton height={40} width={100} style={{ marginTop: 16 }} />
                <Skeleton height={20} width={150} />
                <Skeleton height={20} width={300} style={{ marginTop: 16 }} />
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ p: 3, bgcolor: colors.card, borderRadius: "16px" }}>
                <Skeleton height={48} width={48} circle />
                <Skeleton height={40} width={100} style={{ marginTop: 16 }} />
                <Skeleton height={20} width={150} />
                <Skeleton height={20} width={300} style={{ marginTop: 16 }} />
              </Card>
            </Grid>
          </Grid>
          <Card sx={{ bgcolor: colors.card, borderRadius: "16px" }}>
            <Box sx={{ p: 3 }}>
              <Skeleton height={30} width={200} />
              <Skeleton height={20} width={300} />
            </Box>
            <Skeleton height={200} />
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.background, pb: 4 }}>
      <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: "700", color: colors.text, mb: 1 }}
            >
              Admin Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary }}>
              Welcome back! Here's what's happening with your platform today.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Paper
              sx={{
                display: "flex",
                alignItems: "center",
                borderRadius: "12px",
                px: 2,
                py: 1,
                boxShadow: `0 2px 8px ${colors.shadow}`,
                border: `1px solid ${colors.border}`,
                flex: { xs: 1, sm: "auto" },
                width: { xs: "100%", sm: "240px" },
              }}
            >
              <SearchIcon sx={{ color: colors.textSecondary, mr: 1 }} />
              <InputBase
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  flex: 1,
                  fontSize: "0.95rem",
                  color: colors.text,
                  "& ::placeholder": { color: colors.textSecondary },
                }}
              />
            </Paper>

            <Tooltip title="Refresh data">
              <IconButton
                onClick={() => window.location.reload()}
                sx={{
                  color: colors.primary,
                  bgcolor: colors.primaryLight,
                  width: 40,
                  height: 40,
                  borderRadius: "10px",
                  "&:hover": { bgcolor: colors.primaryLight, opacity: 0.9 },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                bgcolor: colors.card,
                borderRadius: "16px",
                boxShadow: `0 4px 12px ${colors.shadow}`,
                border: `1px solid ${colors.border}`,
                height: "100%",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 24px ${colors.shadow}`,
                },
                cursor: "pointer",
                overflow: "hidden",
              }}
              onClick={() => navigate("/users")}
            >
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: colors.primaryLight,
                      color: colors.primary,
                      width: 48,
                      height: 48,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UsersIcon sx={{ fontSize: "1.5rem" }} />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      bgcolor: colors.incomeLight,
                      color: colors.income,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    <TrendingUpIcon sx={{ fontSize: "0.875rem" }} />+
                    {Math.floor(Math.random() * 10) + 5}%
                  </Box>
                </Box>

                <Typography
                  variant="h4"
                  sx={{ fontWeight: "700", mb: 1, color: colors.text }}
                >
                  {userStats.total.toLocaleString()}
                </Typography>

                <Typography
                  variant="subtitle1"
                  sx={{ color: colors.textSecondary, mb: 2 }}
                >
                  Total Users
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.income,
                          fontWeight: 700,
                          fontSize: "1rem",
                        }}
                      >
                        {userStats.active.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.textSecondary }}
                      >
                        Active
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.textSecondary,
                          fontWeight: 700,
                          fontSize: "1rem",
                        }}
                      >
                        {userStats.inactive.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.textSecondary }}
                      >
                        Inactive
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.expense,
                          fontWeight: 700,
                          fontSize: "1rem",
                        }}
                      >
                        {userStats.banned.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.textSecondary }}
                      >
                        Banned
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card
              sx={{
                bgcolor: colors.card,
                borderRadius: "16px",
                boxShadow: `0 4px 12px ${colors.shadow}`,
                border: `1px solid ${colors.border}`,
                height: "100%",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 24px ${colors.shadow}`,
                },
                cursor: "pointer",
                overflow: "hidden",
              }}
              onClick={() => navigate("/transactions")}
            >
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 3,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: colors.tealLight,
                      color: colors.teal,
                      width: 48,
                      height: 48,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BarChartIcon sx={{ fontSize: "1.5rem" }} />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      bgcolor: colors.incomeLight,
                      color: colors.income,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    <TrendingUpIcon sx={{ fontSize: "0.875rem" }} />+
                    {Math.floor(Math.random() * 15) + 10}%
                  </Box>
                </Box>

                <Typography
                  variant="h4"
                  sx={{ fontWeight: "700", mb: 1, color: colors.text }}
                >
                  {transactionStats.totalAmount}
                </Typography>

                <Typography
                  variant="subtitle1"
                  sx={{ color: colors.textSecondary, mb: 2 }}
                >
                  Total Transactions
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.primary,
                          fontWeight: 700,
                          fontSize: "1rem",
                        }}
                      >
                        {transactionStats.daily.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.textSecondary }}
                      >
                        Daily
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.primary,
                          fontWeight: 700,
                          fontSize: "1rem",
                        }}
                      >
                        {transactionStats.weekly.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.textSecondary }}
                      >
                        Weekly
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.primary,
                          fontWeight: 700,
                          fontSize: "1rem",
                        }}
                      >
                        {transactionStats.monthly.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: colors.textSecondary }}
                      >
                        Monthly
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Card
          sx={{
            bgcolor: colors.card,
            borderRadius: "16px",
            boxShadow: `0 4px 12px ${colors.shadow}`,
            border: `1px solid ${colors.border}`,
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 3, borderBottom: `1px solid ${colors.border}` }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "600", color: colors.text }}
            >
              Recent Activity
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.textSecondary, mt: 0.5 }}
            >
              Latest transactions and user signups
            </Typography>
          </Box>

          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: colors.background }}>
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      py: 2,
                      px: 3,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    Type
                  </TableCell>
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      py: 2,
                      px: 3,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    User
                  </TableCell>
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      py: 2,
                      px: 3,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    Details
                  </TableCell>
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      py: 2,
                      px: 3,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    Time
                  </TableCell>
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      py: 2,
                      px: 3,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedActivity.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 4, color: colors.textSecondary }}
                    >
                      No activities found matching your search
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedActivity.map((activity) => (
                    <TableRow
                      key={activity.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: colors.background,
                          cursor: "pointer",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontSize: "0.875rem",
                          borderBottom: `1px solid ${colors.border}`,
                          py: 2,
                          px: 3,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            bgcolor:
                              activity.type === "signup"
                                ? colors.primaryLight
                                : colors.tealLight,
                            color:
                              activity.type === "signup"
                                ? colors.primary
                                : colors.teal,
                          }}
                        >
                          {activity.type === "signup" ? (
                            <UsersIcon sx={{ fontSize: "1.25rem" }} />
                          ) : (
                            <BarChartIcon sx={{ fontSize: "1.25rem" }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: colors.text,
                          borderBottom: `1px solid ${colors.border}`,
                          py: 2,
                          px: 3,
                        }}
                      >
                        {activity.user}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: "0.875rem",
                          color: colors.text,
                          borderBottom: `1px solid ${colors.border}`,
                          py: 2,
                          px: 3,
                        }}
                      >
                        {activity.type === "signup"
                          ? "New user registration"
                          : `Transaction of ${activity.amount}`}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: "0.875rem",
                          color: colors.textSecondary,
                          borderBottom: `1px solid ${colors.border}`,
                          py: 2,
                          px: 3,
                        }}
                      >
                        {activity.time}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: "0.875rem",
                          borderBottom: `1px solid ${colors.border}`,
                          py: 2,
                          px: 3,
                        }}
                      >
                        <Chip
                          label={activity.status}
                          size="small"
                          sx={{
                            fontSize: "0.75rem",
                            height: "24px",
                            backgroundColor:
                              activity.status === "completed"
                                ? colors.incomeLight
                                : colors.goldLight,
                            color:
                              activity.status === "completed"
                                ? colors.income
                                : colors.gold,
                            fontWeight: "600",
                            borderRadius: "6px",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 3,
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <Box sx={{ color: colors.textSecondary, fontSize: "0.875rem" }}>
              Showing {paginatedActivity.length} of {filteredActivity.length}{" "}
              activities
            </Box>
            <Box sx={{ display: "(PSR) flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handlePreviousPage}
                disabled={page === 0}
                sx={{
                  color: colors.primary,
                  borderColor: colors.border,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: "600",
                  "&:hover": {
                    borderColor: colors.primary,
                    backgroundColor: colors.primaryLight,
                  },
                  "&:disabled": {
                    color: colors.textSecondary,
                    borderColor: colors.border,
                  },
                }}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNextPage}
                disabled={(page + 1) * rowsPerPage >= filteredActivity.length}
                sx={{
                  color: colors.primary,
                  borderColor: colors.border,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: "600",
                  "&:hover": {
                    borderColor: colors.primary,
                    backgroundColor: colors.primaryLight,
                  },
                  "&:disabled": {
                    color: colors.textSecondary,
                    borderColor: colors.border,
                  },
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        </Card>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={Slide}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="warning"
            sx={{
              bgcolor: colors.expenseLight,
              color: colors.expense,
              border: `1px solid ${colors.expense}`,
              fontWeight: "500",
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Dashboard;