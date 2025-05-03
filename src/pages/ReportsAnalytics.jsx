"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  CircularProgress,
  Grid,
  Alert,
} from "@mui/material"
import {
  BarChart as BarChartIcon,
  FileDownload as DownloadIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon,
  Category as CategoryIcon,
  Work as WorkIcon,
} from "@mui/icons-material"
import { Bar, Pie } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import api from "../utils/api"
import colors from "../styles/colors"

// Debug the colors object to ensure matteBlack is correct
console.log("Colors object:", colors);

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const ReportsAnalytics = ({ isMinimized }) => {
  const [tabValue, setTabValue] = useState(0)
  const [reportType, setReportType] = useState("spendingTrends")
  const [exportFormat, setExportFormat] = useState("csv")
  const [financialData, setFinancialData] = useState([])
  const [engagementData, setEngagementData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFinancialData()
    fetchEngagementData()
  }, [reportType])

  const fetchFinancialData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/analytics/financial?type=${reportType}`)
      setFinancialData(response.data)
    } catch (error) {
      console.error("Error fetching financial data:", error)
      setError("Failed to load financial data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const fetchEngagementData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get("/analytics/engagement")
      setEngagementData(response.data)
    } catch (error) {
      console.error("Error fetching engagement data:", error)
      setError("Failed to load engagement data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value)
  }

  const handleExport = async () => {
    try {
      const type = tabValue === 0 ? "financial" : "engagement"
      const response = await api.post("/analytics/export", { type, format: exportFormat }, { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${type}_report.${exportFormat}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error("Error exporting data:", error)
      setError("Failed to export data. Please try again later.")
    }
  }

  const getChartColors = () => {
    return {
      spendingTrends: [
        colors.primary,
        colors.teal,
        colors.gold,
        colors.income,
        colors.expense,
        "#A855F7", // Purple
        "#EC4899", // Pink
        "#14B8A6", // Teal
        "#8B5CF6", // Violet
        "#F97316", // Orange
      ],
      savings: [
        colors.income,
        colors.primary,
        colors.teal,
        colors.gold,
        "#A855F7", // Purple
        "#EC4899", // Pink
        "#14B8A6", // Teal
        "#8B5CF6", // Violet
        "#F97316", // Orange
      ],
      transactionVolume: [
        colors.teal,
        colors.primary,
        colors.gold,
        colors.income,
        colors.expense,
        "#A855F7", // Purple
        "#EC4899", // Pink
        "#14B8A6", // Teal
        "#8B5CF6", // Violet
        "#F97316", // Orange
      ],
      professionSpending: [
        colors.gold,
        colors.primary,
        colors.teal,
        colors.income,
        colors.expense,
        "#A855F7", // Purple
        "#EC4899", // Pink
        "#14B8A6", // Teal
        "#8B5CF6", // Violet
        "#F97316", // Orange
      ],
    }
  }

  const getChartData = () => {
    if (!financialData.length) return null

    // Debug financialData to inspect its contents
    console.log("financialData:", financialData);

    const chartColors = getChartColors()[reportType]

    if (reportType === "spendingTrends" || reportType === "professionSpending") {
      const labels = financialData.map((item) => item.category || item.profession || "Unknown")
      const data = financialData.map((item) => item.amount ?? 0) // Use nullish coalescing for fallback
      return {
        labels,
        datasets: [
          {
            label: reportType === "spendingTrends" ? "Spending by Category" : "Spending by Profession",
            data,
            backgroundColor: labels.map((_, index) => chartColors[index % chartColors.length]),
            borderColor: labels.map((_, index) => chartColors[index % chartColors.length]),
            borderWidth: 1,
          },
        ],
      }
    } else if (reportType === "savings") {
      const labels = financialData.map((item) => item.profession || "Unknown")
      const data = financialData.map((item) => item.amount ?? 0) // Use nullish coalescing for fallback
      return {
        labels,
        datasets: [
          {
            label: "Savings by Profession",
            data,
            backgroundColor: labels.map((_, index) => chartColors[index % chartColors.length]),
            borderColor: labels.map((_, index) => chartColors[index % chartColors.length]),
            borderWidth: 1,
          },
        ],
      }
    } else if (reportType === "transactionVolume") {
      const labels = financialData.map((item) => item.category || "Unknown")
      const data = financialData.map((item) => item.count ?? 0) // Use nullish coalescing for fallback
      return {
        labels,
        datasets: [
          {
            label: "Transaction Volume by Category",
            data,
            backgroundColor: labels.map((_, index) => chartColors[index % chartColors.length]),
            borderColor: labels.map((_, index) => chartColors[index % chartColors.length]),
            borderWidth: 1,
          },
        ],
      }
    }
  }

  const getReportTypeIcon = () => {
    switch (reportType) {
      case "spendingTrends":
        return <TrendingUpIcon sx={{ color: colors.primary }} />
      case "savings":
        return <SavingsIcon sx={{ color: colors.income }} />
      case "transactionVolume":
        return <BarChartIcon sx={{ color: colors.teal }} />
      case "professionSpending":
        return <WorkIcon sx={{ color: colors.gold }} />
      default:
        return <CategoryIcon sx={{ color: colors.primary }} />
    }
  }

  const renderFinancialReports = () => {
    const chartData = getChartData()

    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel
                id="report-type-label"
                sx={{
                  color: colors.textSecondary,
                  fontSize: "0.9rem",
                }}
              >
                Report Type
              </InputLabel>
              <Select
                labelId="report-type-label"
                value={reportType}
                label="Report Type"
                onChange={handleReportTypeChange}
                sx={{
                  fontSize: "0.9rem",
                  color: colors.text,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.border,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary,
                  },
                  "& .MuiSelect-icon": {
                    color: colors.primary,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: colors.cardBackground,
                      border: `1px solid ${colors.border}`,
                      boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1)`,
                      borderRadius: "8px",
                      marginTop: "4px",
                      "& .MuiMenuItem-root": {
                        color: colors.matteBlack,
                        fontSize: "0.9rem",
                        padding: "10px 16px",
                        "&:hover": {
                          backgroundColor: colors.subtleAccent,
                        },
                        "&.Mui-selected": {
                          backgroundColor: colors.primary,
                          color: colors.white,
                          "&:hover": {
                            backgroundColor: colors.primary,
                            opacity: 0.9,
                          },
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="spendingTrends" sx={{ fontSize: "0.9rem" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUpIcon sx={{ color: colors.primary, fontSize: "1.25rem" }} />
                    <Typography>Spending Trends</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="savings" sx={{ fontSize: "0.9rem" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <SavingsIcon sx={{ color: colors.income, fontSize: "1.25rem" }} />
                    <Typography>Savings by Profession</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="transactionVolume" sx={{ fontSize: "0.9rem" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BarChartIcon sx={{ color: colors.teal, fontSize: "1.25rem" }} />
                    <Typography>Transaction Volume</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="professionSpending" sx={{ fontSize: "0.9rem" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <WorkIcon sx={{ color: colors.gold, fontSize: "1.25rem" }} />
                    <Typography>Spending by Profession</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CircularProgress size={40} sx={{ color: colors.primary }} />
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Loading chart data...
            </Typography>
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              bgcolor: colors.expenseLight,
              color: colors.expense,
              border: `1px solid ${colors.expense}`,
              "& .MuiAlert-icon": {
                color: colors.expense,
              },
            }}
          >
            {error}
          </Alert>
        ) : financialData.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
              flexDirection: "column",
              gap: 2,
              bgcolor: colors.background,
              borderRadius: "16px",
              border: `1px dashed ${colors.border}`,
            }}
          >
            {getReportTypeIcon()}
            <Typography variant="body1" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
              No data available for this report type
            </Typography>
          </Box>
        ) : (
          <Paper
            sx={{
              p: 3,
              borderRadius: "16px",
              boxShadow: `0 4px 12px ${colors.shadow}`,
              border: `1px solid ${colors.border}`,
              bgcolor: colors.card,
              height: "400px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 2,
              }}
            >
              {getReportTypeIcon()}
              <Typography
                variant="h6"
                sx={{
                  color: colors.text,
                  fontWeight: 600,
                }}
              >
                {reportType === "spendingTrends"
                  ? "Spending by Category"
                  : reportType === "savings"
                    ? "Savings by Profession"
                    : reportType === "transactionVolume"
                      ? "Transaction Volume by Category"
                      : "Spending by Profession"}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, position: "relative" }}>
              {chartData &&
                (reportType === "savings" ? (
                  <Pie
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                          labels: {
                            font: {
                              size: 12,
                            },
                            color: colors.text,
                          },
                        },
                        tooltip: {
                          backgroundColor: colors.white, // White background
                          titleColor: colors.matteBlack || "#2D3436", // Dark text with fallback
                          bodyColor: colors.matteBlack || "#2D3436", // Dark text with fallback
                          color: colors.matteBlack || "#2D3436", // Override default text color
                          borderColor: colors.border,
                          borderWidth: 2,
                          padding: 10,
                          boxPadding: 4,
                          usePointStyle: true,
                          cornerRadius: 8,
                          titleAlign: "center",
                          bodyAlign: "center",
                          boxShadow: `0 2px 8px rgba(0, 0, 0, 0.1)`, // Subtle shadow
                          titleFont: {
                            size: 14,
                            weight: "bold",
                          },
                          bodyFont: {
                            size: 13,
                          },
                          callbacks: {
                            label: (context) => {
                              const label = context.label || ""
                              const value = context.raw ?? 0 // Robust fallback
                              return `${label}: $${Number(value).toLocaleString()}`
                            },
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: colors.white, // White background
                          titleColor: colors.matteBlack || "#2D3436", // Dark text with fallback
                          bodyColor: colors.matteBlack || "#2D3436", // Dark text with fallback
                          color: colors.matteBlack || "#2D3436", // Override default text color
                          borderColor: colors.border,
                          borderWidth: 2,
                          padding: 10,
                          boxPadding: 4,
                          usePointStyle: true,
                          cornerRadius: 8,
                          titleAlign: "center",
                          bodyAlign: "center",
                          boxShadow: `0 2px 8px rgba(0, 0, 0, 0.1)`, // Subtle shadow
                          titleFont: {
                            size: 14,
                            weight: "bold",
                          },
                          bodyFont: {
                            size: 13,
                          },
                          callbacks: {
                            label: (context) => {
                              const label = context.dataset.label || ""
                              const value = context.raw ?? 0 // Robust fallback
                              return reportType === "transactionVolume"
                                ? `${label}: ${Number(value).toLocaleString()} transactions`
                                : `${label}: $${Number(value).toLocaleString()}`
                            },
                          },
                        },
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false,
                            color: colors.border,
                          },
                          ticks: {
                            color: colors.textSecondary,
                            font: {
                              size: 11,
                            },
                          },
                        },
                        y: {
                          grid: {
                            color: colors.border,
                            drawBorder: false,
                          },
                          ticks: {
                            color: colors.textSecondary,
                            font: {
                              size: 11,
                            },
                            callback: (value) => (reportType === "transactionVolume" ? value : `$${value}`),
                          },
                        },
                      },
                    }}
                  />
                ))}
            </Box>
          </Paper>
        )}

        {!loading && financialData.length > 0 && (
          <Paper
            sx={{
              mt: 3,
              p: 3,
              borderRadius: "16px",
              boxShadow: `0 4px 12px ${colors.shadow}`,
              border: `1px solid ${colors.border}`,
              bgcolor: colors.card,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: colors.text,
                fontWeight: 600,
                mb: 2,
              }}
            >
              Data Table
            </Typography>

            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        color: colors.textSecondary,
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        py: 2,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      {reportType === "spendingTrends" || reportType === "transactionVolume"
                        ? "Category"
                        : "Profession"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: colors.textSecondary,
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        py: 2,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      {reportType === "transactionVolume" ? "Count" : "Amount"}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: colors.textSecondary,
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        py: 2,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      Percentage
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {financialData.map((item, index) => {
                    const total = financialData.reduce(
                      (sum, curr) => sum + (reportType === "transactionVolume" ? (curr.count ?? 0) : (curr.amount ?? 0)),
                      0,
                    )
                    const value = reportType === "transactionVolume" ? (item.count ?? 0) : (item.amount ?? 0)
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0

                    return (
                      <TableRow
                        key={index}
                        sx={{
                          "&:hover": {
                            backgroundColor: colors.background,
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            color: colors.text,
                            fontSize: "0.9rem",
                            py: 2,
                            borderBottom: `1px solid ${colors.border}`,
                          }}
                        >
                          {item.category || item.profession || "Unknown"}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: colors.text,
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            py: 2,
                            borderBottom: `1px solid ${colors.border}`,
                          }}
                        >
                          {reportType === "transactionVolume"
                            ? Number(value).toLocaleString()
                            : `$${Number(value).toLocaleString()}`}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: colors.text,
                            fontSize: "0.9rem",
                            py: 2,
                            borderBottom: `1px solid ${colors.border}`,
                          }}
                        >
                          {percentage}%
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        )}
      </Box>
    )
  }

  const renderUserEngagement = () => (
    <Paper
      sx={{
        p: 3,
        borderRadius: "16px",
        boxShadow: `0 4px 12px ${colors.shadow}`,
        border: `1px solid ${colors.border}`,
        bgcolor: colors.card,
      }}
    >
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <CircularProgress size={40} sx={{ color: colors.primary }} />
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Loading engagement data...
          </Typography>
        </Box>
      ) : error ? (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            bgcolor: colors.expenseLight,
            color: colors.expense,
            border: `1px solid ${colors.expense}`,
            "& .MuiAlert-icon": {
              color: colors.expense,
            },
          }}
        >
          {error}
        </Alert>
      ) : engagementData.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            flexDirection: "column",
            gap: 2,
            bgcolor: colors.background,
            borderRadius: "16px",
            border: `1px dashed ${colors.border}`,
          }}
        >
          <BarChartIcon sx={{ color: colors.primary }} />
          <Typography variant="body1" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
            No engagement data available
          </Typography>
        </Box>
      ) : (
        <>
          <Typography
            variant="h6"
            sx={{
              color: colors.text,
              fontWeight: 600,
              mb: 3,
            }}
          >
            User Engagement Metrics
          </Typography>

          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    Metric
                  </TableCell>
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    Value
                  </TableCell>
                  <TableCell
                    sx={{
                      color: colors.textSecondary,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      py: 2,
                      borderBottom: `1px solid ${colors.border}`,
                    }}
                  >
                    Change
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {engagementData.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": {
                        backgroundColor: colors.background,
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        color: colors.text,
                        fontSize: "0.9rem",
                        py: 2,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      {row.metric}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: colors.text,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        py: 2,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      {row.value}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 2,
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            row.change > 0 ? colors.income : row.change < 0 ? colors.expense : colors.textSecondary,
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        {row.change > 0 ? "+" : ""}
                        {row.change}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </>
      )}
    </Paper>
  )

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
            Reports & Analytics
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            Insights into app performance and user behavior
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel
              id="export-format-label"
              sx={{
                color: colors.textSecondary,
                fontSize: "0.9rem",
              }}
            >
              Export As
            </InputLabel>
            <Select
              labelId="export-format-label"
              value={exportFormat}
              label="Export As"
              onChange={(e) => setExportFormat(e.target.value)}
              sx={{
                fontSize: "0.9rem",
                color: colors.text,
                height: "40px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.border,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: colors.primary,
                },
                "& .MuiSelect-icon": {
                  color: colors.primary,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: colors.cardBackground,
                    border: `1px solid ${colors.border}`,
                    boxShadow: `0 4px 12px rgba(0, 0, 0, 0.1)`,
                    borderRadius: "8px",
                    marginTop: "4px",
                    "& .MuiMenuItem-root": {
                      color: colors.matteBlack,
                      fontSize: "0.9rem",
                      padding: "10px 16px",
                      "&:hover": {
                        backgroundColor: colors.subtleAccent,
                      },
                      "&.Mui-selected": {
                        backgroundColor: colors.primary,
                        color: colors.white,
                        "&:hover": {
                          backgroundColor: colors.primary,
                          opacity: 0.9,
                        },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="csv" sx={{ fontSize: "0.9rem" }}>
                CSV
              </MenuItem>
              <MenuItem value="excel" sx={{ fontSize: "0.9rem" }}>
                Excel
              </MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{
              bgcolor: colors.primary,
              color: colors.white,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              height: "40px",
              "&:hover": {
                bgcolor: colors.primary,
                opacity: 0.9,
              },
            }}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      <Paper
        sx={{
          borderRadius: "16px",
          boxShadow: `0 4px 12px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          bgcolor: colors.card,
          mb: 3,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: `1px solid ${colors.border}`,
            "& .MuiTab-root": {
              color: colors.textSecondary,
              fontSize: "0.9rem",
              textTransform: "none",
              fontWeight: 500,
              py: 2,
              px: 3,
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
          <Tab label="Financial Reports" icon={<BarChartIcon />} iconPosition="start" />
          <Tab label="User Engagement" icon={<PieChartIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {tabValue === 0 && renderFinancialReports()}
      {tabValue === 1 && renderUserEngagement()}
    </Box>
  )
}

export default ReportsAnalytics