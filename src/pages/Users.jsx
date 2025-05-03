import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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
  Switch,
  TextField,
  Tabs,
  Tab,
  Avatar,
  useMediaQuery,
  InputAdornment,
  Chip,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material"
import { Visibility, Search, Add as AddIcon, Block as BanIcon } from "@mui/icons-material"
import api from "../utils/api"
import colors from "../styles/colors"

const getRandomColor = (name) => {
  const colorsArray = [
    { bg: colors.primaryLight, text: colors.primary }, 
    { bg: colors.tealLight, text: colors.teal }, 
    { bg: colors.incomeLight, text: colors.income }, 
    { bg: colors.goldLight, text: colors.gold }, 
    { bg: colors.expenseLight, text: colors.expense },
    { bg: colors.background, text: colors.textSecondary }, 
  ]

  const charCode = name ? name.charCodeAt(0) : 0
  return colorsArray[charCode % colorsArray.length]
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const navigate = useNavigate()
  const isMobile = useMediaQuery("(max-width:600px)")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/users")
      console.log("Fetch users response:", response.data)
      const userData = response.data.users || []
      setUsers(userData)
      setFilteredUsers(userData)
    } catch (err) {
      console.error("Failed to fetch users:", err.response || err)
      setSnackbar({
        open: true,
        message: "Failed to fetch users.",
        severity: "error",
      })
    }
  }

  useEffect(() => {
    let filtered = [...users]
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter((user) => user.isActive && !user.isBanned)
      } else if (statusFilter === "banned") {
        filtered = filtered.filter((user) => user.isBanned)
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter((user) => !user.isActive && !user.isBanned)
      }
    }
    setFilteredUsers(filtered)
  }, [searchQuery, statusFilter, users])

  const handleToggleAdmin = async (userId, currentStatus) => {
    try {
      const updatedUser = { isAdmin: !currentStatus }
      await api.put(`/admin/users/${userId}`, updatedUser)
      setUsers(users.map((user) => (user.id === userId ? { ...user, isAdmin: !currentStatus } : user)))
      setSnackbar({
        open: true,
        message: "Admin status updated successfully.",
        severity: "success",
      })
    } catch (err) {
      console.error("Failed to update admin status:", err.response || err)
      setSnackbar({
        open: true,
        message: "Failed to update admin status.",
        severity: "error",
      })
    }
  }

  const handleToggleBan = async (userId, currentStatus) => {
    try {
      const updatedUser = { isBanned: !currentStatus }
      await api.put(`/admin/users/${userId}`, updatedUser)
      setUsers(users.map((user) => (user.id === userId ? { ...user, isBanned: !currentStatus } : user)))
      setSnackbar({
        open: true,
        message: `User ${!currentStatus ? "banned" : "unbanned"} successfully.`,
        severity: "success",
      })
    } catch (err) {
      console.error("Failed to update ban status:", err.response || err)
      setSnackbar({
        open: true,
        message: "Failed to update ban status.",
        severity: "error",
      })
    }
  }

  const handleViewDetails = (userId) => {
    navigate(`/user-details/${userId}`)
  }

  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "NA"
  }

  const getStatusColor = (user) => {
    if (user.isBanned) {
      return {
        bg: colors.expenseLight,
        text: colors.expense,
      }
    } else if (user.isActive) {
      return {
        bg: colors.incomeLight,
        text: colors.income,
      }
    } else {
      return {
        bg: colors.goldLight,
        text: colors.gold,
      }
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <Box sx={{ p: 3, backgroundColor: colors.background, minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: colors.text, mb: 0.5 }}>
            User Management
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Manage user accounts and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/add-user")}
          sx={{
            bgcolor: colors.primary,
            color: colors.white,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
            "&:hover": {
              bgcolor: colors.primary,
              opacity: 0.9,
            },
          }}
        >
          Add User
        </Button>
      </Box>

      <Card
        sx={{
          bgcolor: colors.cardBackground,
          borderRadius: "16px",
          boxShadow: `0 4px 12px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2,
              p: 3,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <Box
              sx={{
                position: "relative",
                flex: 1,
                maxWidth: { xs: "100%", sm: "320px" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <TextField
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: colors.textSecondary, fontSize: "1.25rem" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    backgroundColor: colors.background,
                    "&:hover": {
                      backgroundColor: colors.background,
                    },
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: colors.border },
                    "&:hover fieldset": { borderColor: colors.primary },
                    "&.Mui-focused fieldset": { borderColor: colors.primary },
                  },
                }}
              />
            </Box>
            <Paper
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "none",
                border: `1px solid ${colors.border}`,
                bgcolor: colors.background,
              }}
            >
              <Tabs
                value={statusFilter}
                onChange={(e, value) => setStatusFilter(value)}
                sx={{
                  minWidth: "320px", // Adjusted to accommodate the new tab
                  "& .MuiTab-root": {
                    color: colors.textSecondary,
                    fontSize: "0.9rem",
                    textTransform: "none",
                    fontWeight: 500,
                    minWidth: "80px",
                  },
                  "& .Mui-selected": {
                    color: colors.primary,
                    fontWeight: 600,
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: colors.primary,
                  },
                }}
              >
                <Tab label="All Users" value="all" />
                <Tab label="Active" value="active" />
                <Tab label="Inactive" value="inactive" />
                <Tab label="Banned" value="banned" />
              </Tabs>
            </Paper>
          </Box>

          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: colors.background }}>
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    Name
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      sx={{
                        color: colors.textSecondary,
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        py: 2,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      Email
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    Status
                  </TableCell>
                  {!isMobile && (
                    <TableCell
                      sx={{
                        color: colors.textSecondary,
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        py: 2,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      Joined
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    Admin
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: colors.textSecondary,
                      fontSize: "0.85rem",
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
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isMobile ? 4 : 6}
                      align="center"
                      sx={{
                        color: colors.textSecondary,
                        fontSize: "0.9rem",
                        py: 4,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const statusColor = getStatusColor(user)
                    const avatarColor = getRandomColor(user.name)

                    return (
                      <TableRow
                        key={user.id}
                        sx={{
                          "&:hover": {
                            backgroundColor: colors.background,
                          },
                          cursor: "pointer",
                        }}
                      >
                        <TableCell
                          sx={{
                            py: 2,
                            borderBottom: `1px solid ${colors.border}`,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              sx={{
                                bgcolor: avatarColor.bg,
                                color: avatarColor.text,
                                width: 36,
                                height: 36,
                                fontSize: "0.9rem",
                                fontWeight: 600,
                              }}
                            >
                              {getInitials(user.name)}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: colors.text,
                                  fontSize: "0.95rem",
                                  fontWeight: 600,
                                }}
                              >
                                {user.name}
                              </Typography>
                              {isMobile && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: colors.textSecondary,
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  {user.email}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        {!isMobile && (
                          <TableCell
                            sx={{
                              color: colors.text,
                              fontSize: "0.9rem",
                              py: 2,
                              borderBottom: `1px solid ${colors.border}`,
                            }}
                          >
                            {user.email}
                          </TableCell>
                        )}
                        <TableCell
                          sx={{
                            py: 2,
                            borderBottom: `1px solid ${colors.border}`,
                          }}
                        >
                          <Chip
                            label={user.isBanned ? "Banned" : user.isActive ? "Active" : "Inactive"}
                            size="small"
                            sx={{
                              backgroundColor: statusColor.bg,
                              color: statusColor.text,
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              height: "24px",
                              borderRadius: "6px",
                            }}
                          />
                        </TableCell>
                        {!isMobile && (
                          <TableCell
                            sx={{
                              color: colors.text,
                              fontSize: "0.9rem",
                              py: 2,
                              borderBottom: `1px solid ${colors.border}`,
                            }}
                          >
                            {new Date(user.joinedDate).toLocaleDateString()}
                          </TableCell>
                        )}
                        <TableCell
                          sx={{
                            py: 2,
                            borderBottom: `1px solid ${colors.border}`,
                          }}
                        >
                          <Switch
                            size="small"
                            checked={user.isAdmin || false}
                            onChange={() => handleToggleAdmin(user.id, user.isAdmin)}
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: colors.primary,
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                backgroundColor: colors.primaryLight,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            py: 2,
                            borderBottom: `1px solid ${colors.border}`,
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Visibility sx={{ fontSize: "1rem" }} />}
                              onClick={() => handleViewDetails(user.id)}
                              sx={{
                                fontSize: "0.8rem",
                                borderRadius: "8px",
                                borderColor: colors.border,
                                color: colors.primary,
                                textTransform: "none",
                                fontWeight: 600,
                                "&:hover": {
                                  borderColor: colors.primary,
                                  backgroundColor: colors.primaryLight,
                                },
                              }}
                            >
                              {isMobile ? "" : "View"}
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<BanIcon sx={{ fontSize: "1rem" }} />}
                              onClick={() => handleToggleBan(user.id, user.isBanned)}
                              sx={{
                                fontSize: "0.8rem",
                                borderRadius: "8px",
                                backgroundColor: user.isBanned ? colors.incomeLight : colors.expenseLight,
                                color: user.isBanned ? colors.income : colors.expense,
                                textTransform: "none",
                                fontWeight: 600,
                                "&:hover": {
                                  backgroundColor: user.isBanned ? colors.incomeLight : colors.expenseLight,
                                  opacity: 0.9,
                                },
                              }}
                            >
                              {isMobile ? "" : user.isBanned ? "Unban" : "Ban"}
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            bgcolor: snackbar.severity === "success" ? colors.incomeLight : colors.expenseLight,
            color: snackbar.severity === "success" ? colors.successGreen : colors.errorRed,
            border: `1px solid ${snackbar.severity === "success" ? colors.income : colors.expense}`,
            fontWeight: "500",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}