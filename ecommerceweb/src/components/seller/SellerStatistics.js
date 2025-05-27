import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Button,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import InsightsIcon from "@mui/icons-material/Insights";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CategoryIcon from "@mui/icons-material/Category";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import InventoryIcon from "@mui/icons-material/Inventory";
import {
  format,
  subMonths,
  subQuarters,
  subYears,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";
import { vi } from "date-fns/locale";
import { authApi, endpoint } from "../../configs/Apis";
import { useAuth } from "../../configs/MyContexts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7300",
];

const SellerStatistics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // State for statistics data
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrderValue: 0,
  });

  // Generate years for selection
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod, selectedYear]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null); // Calculate date range based on selected period and year
      const { startDate, endDate } = getDateRange(selectedPeriod, selectedYear); // Fetch seller statistics using authApi() which handles token automatically
      const response = await authApi().get(
        `${endpoint.SELLER_STATISTICS}?period=${selectedPeriod}&year=${selectedYear}&startDate=${startDate}&endDate=${endDate}`
      );

      console.log("Full response:", response);
      console.log("Response data:", response.data);

      if (response.data.success) {
        console.log("Data from backend:", response.data.data);

        const { revenueByPeriod, categoryRevenue, productRevenue, summary } =
          response.data.data;

        console.log("Parsed data:", {
          revenueByPeriod,
          categoryRevenue,
          productRevenue,
          summary,
        });

        setRevenueData(revenueByPeriod || []);
        setCategoryData(categoryRevenue || []);
        setProductData(productRevenue || []);
        setSummaryStats(
          summary || {
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
            averageOrderValue: 0,
          }
        );
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setError(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tải dữ liệu thống kê"
      );
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (period, year) => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "month":
        startDate = format(startOfYear(new Date(year, 0, 1)), "yyyy-MM-dd");
        endDate = format(endOfYear(new Date(year, 11, 31)), "yyyy-MM-dd");
        break;
      case "quarter":
        startDate = format(startOfYear(new Date(year, 0, 1)), "yyyy-MM-dd");
        endDate = format(endOfYear(new Date(year, 11, 31)), "yyyy-MM-dd");
        break;
      case "year":
        startDate = format(new Date(year - 4, 0, 1), "yyyy-MM-dd");
        endDate = format(new Date(year, 11, 31), "yyyy-MM-dd");
        break;
      default:
        startDate = format(startOfYear(now), "yyyy-MM-dd");
        endDate = format(endOfYear(now), "yyyy-MM-dd");
    }

    return { startDate, endDate };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "month":
        return `Thống kê theo tháng năm ${selectedYear}`;
      case "quarter":
        return `Thống kê theo quý năm ${selectedYear}`;
      case "year":
        return `Thống kê theo năm (${selectedYear - 4} - ${selectedYear})`;
      default:
        return "Thống kê";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <InsightsIcon sx={{ fontSize: 35, mr: 1, color: "primary.main" }} />
          Thống kê & Báo cáo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Xem thống kê doanh thu, sản phẩm và hiệu suất bán hàng của bạn
        </Typography>
      </Box>
      {/* Filter Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Bộ lọc thống kê
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Kỳ thống kê</InputLabel>
              <Select
                value={selectedPeriod}
                label="Kỳ thống kê"
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <MenuItem value="month">Theo tháng</MenuItem>
                <MenuItem value="quarter">Theo quý</MenuItem>
                <MenuItem value="year">Theo năm</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Năm</InputLabel>
              <Select
                value={selectedYear}
                label="Năm"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <Button
              variant="contained"
              onClick={fetchStatistics}
              fullWidth
              sx={{ height: "56px" }}
            >
              Cập nhật
            </Button>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <Chip label={getPeriodLabel()} color="primary" variant="outlined" />
        </Box>
      </Paper>
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "primary.main", color: "white" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h6" component="div">
                    Tổng doanh thu
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    {formatCurrency(summaryStats.totalRevenue)}
                  </Typography>
                </Box>
                <MonetizationOnIcon sx={{ fontSize: 50, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "success.main", color: "white" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h6" component="div">
                    Tổng đơn hàng
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    {formatNumber(summaryStats.totalOrders)}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 50, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "info.main", color: "white" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h6" component="div">
                    Tổng sản phẩm
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    {formatNumber(summaryStats.totalProducts)}
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 50, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "warning.main", color: "white" }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="h6" component="div">
                    Giá trị đơn TB
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: "bold" }}
                  >
                    {formatCurrency(summaryStats.averageOrderValue)}
                  </Typography>
                </Box>
                <CategoryIcon sx={{ fontSize: 50, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Revenue Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Biểu đồ doanh thu theo{" "}
          {selectedPeriod === "month"
            ? "tháng"
            : selectedPeriod === "quarter"
            ? "quý"
            : "năm"}
        </Typography>
        <Divider sx={{ mb: 3 }} />{" "}
        <ResponsiveContainer width="100%" height={400}>
          {" "}
          <AreaChart
            data={Array.isArray(revenueData) ? revenueData : []}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="period"
              axisLine={false}
              tickLine={false}
              padding={{ left: 15, right: 15 }}
              style={{ fontSize: "0.875rem" }}
            />
            <YAxis
              tickFormatter={(value) =>
                formatCurrency(value).replace("₫", "").trim()
              }
              width={95}
              style={{ fontSize: "0.875rem" }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
              padding={{ top: 10, bottom: 10 }}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), "Doanh thu"]}
              labelFormatter={(label) => {
                // Format period label based on type
                if (label.includes("-Q")) {
                  // Quarter format: 2024-Q1 -> Q1 2024
                  const [year, quarter] = label.split("-");
                  return `${quarter} năm ${year}`;
                } else if (label.includes("-")) {
                  // Month format: 2024-01 -> Tháng 1/2024
                  const [year, month] = label.split("-");
                  return `Tháng ${parseInt(month)}/${year}`;
                } else {
                  // Year format: 2024 -> Năm 2024
                  return `Năm ${label}`;
                }
              }}
            />
            <Legend />{" "}
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3f51b5"
              fill="#8884d8"
              fillOpacity={0.4}
              name="Doanh thu"
              animationDuration={1000}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>{" "}      {/* Category Revenue Chart and Top Products - Side by Side */}
      
        {/* Category Revenue Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Doanh thu theo danh mục
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={Array.isArray(categoryData) ? categoryData : []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="revenue"
                  nameKey="name"
                >
                  {Array.isArray(categoryData) &&
                    categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ fontSize: "0.875rem" }}
                />
                <Legend
                  formatter={(value) => value}
                  layout="horizontal"
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Top Products */}
        <Grid item xs={12} md={6} style={{ marginTop: '2rem' }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top sản phẩm bán chạy
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {Array.isArray(productData) && productData.length > 0 ? (
              <Box sx={{ height: 400, pt: 1 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Top 5 sản phẩm có doanh thu cao nhất
                </Typography>
                {productData.slice(0, 5).map((product, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: "medium", fontSize: "1rem" }}
                      >
                        {product.name.length > 20
                          ? `${product.name.substring(0, 20)}...`
                          : product.name}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip
                          label={`${product.quantity} SP`}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: "medium", fontSize: "0.75rem" }}
                        />
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: "bold",
                            color: "success.main",
                            minWidth: "100px",
                            textAlign: "right",
                            fontSize: "0.9rem"
                          }}
                        >
                          {formatCurrency(product.revenue)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        position: "relative",
                        height: 10,
                        bgcolor: "grey.200",
                        borderRadius: 1,
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          height: "100%",
                          bgcolor:
                            index === 0
                              ? "success.main"
                              : index === 1
                              ? "primary.main"
                              : index === 2
                              ? "warning.main"
                              : index === 3
                              ? "info.main"
                              : "grey.500",
                          borderRadius: 1,
                          width: `${
                            productData.length > 0
                              ? (product.revenue /
                                  Math.max(...productData.map((p) => p.revenue))) *
                                100
                              : 0
                          }%`,
                          transition: "width 0.5s ease-in-out",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 400,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Chưa có dữ liệu sản phẩm
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
     
    </Container>
  );
};

export default SellerStatistics;
