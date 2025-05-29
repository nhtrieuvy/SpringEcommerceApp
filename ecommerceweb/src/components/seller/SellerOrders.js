import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Fab,
  Slide,
  Fade,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  Avatar,
  TablePagination,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
  Backdrop,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Store as StoreIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon,
  MonetizationOn as MoneyIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon,
  Pending as PendingIcon,
  Assignment as AssignmentIcon,
  Payment as PaymentIcon,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import { authApi, endpoint } from "../../configs/Apis";
import { MyUserContext } from "../../configs/MyContexts";
import { formatCurrency, formatDate, formatTime } from "../../utils/FormatUtils";

// Styled components for beautiful animations and effects
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
  },
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 25,
    background: alpha(theme.palette.common.white, 0.9),
    transition: 'all 0.3s ease',
    '&:hover': {
      background: alpha(theme.palette.common.white, 1),
      transform: 'scale(1.02)',
    },
    '&.Mui-focused': {
      background: alpha(theme.palette.common.white, 1),
      transform: 'scale(1.02)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    },
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  '& .MuiTableHead-root': {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    color: 'white',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  '& .MuiTableBody-root .MuiTableRow-root': {
    transition: 'all 0.3s ease',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.04),
      transform: 'scale(1.001)',
    },
  },
}));

const AnimatedChip = styled(Chip)(({ theme }) => ({
  borderRadius: 20,
  fontWeight: 600,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
}));

const GlassDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    background: alpha(theme.palette.background.paper, 0.95),
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
}));

const SellerOrders = () => {
  const [user] = useContext(MyUserContext);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedStore, setSelectedStore] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrderForMenu, setSelectedOrderForMenu] = useState(null);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState({ orderId: null, status: null });
  const [statusNote, setStatusNote] = useState("");

  // Các trạng thái đơn hàng với màu sắc và icon đẹp
  const orderStatuses = [
    { 
      value: "PENDING",
      label: "Chờ xác nhận",
      icon: <PendingIcon fontSize="small" />,
      bgColor: alpha('#ff9800', 0.1),
      textColor: '#ff9800'
    },
    { 
      value: "CONFIRMED",
      label: "Đã xác nhận",
      icon: <CheckCircleIcon fontSize="small" />,
      bgColor: alpha('#2196f3', 0.1),
      textColor: '#2196f3'
    },
    { 
      value: "PROCESSING",
      label: "Đang xử lý",
      icon: <ShippingIcon fontSize="small" />,
      bgColor: alpha('#9c27b0', 0.1),
      textColor: '#9c27b0'
    },
    { 
      value: "SHIPPING",
      label: "Đang giao hàng",
      icon: <ShippingIcon fontSize="small" />,
      bgColor: alpha('#3f51b5', 0.1),
      textColor: '#3f51b5'
    },
    { 
      value: "COMPLETED",
      label: "Đã nhận hàng",
      icon: <CheckCircleIcon fontSize="small" />,
      bgColor: alpha('#4caf50', 0.1),
      textColor: '#4caf50'
    },
    { 
      value: "CANCELLED",
      label: "Đã hủy",
      icon: <CancelIcon fontSize="small" />,
      bgColor: alpha('#f44336', 0.1),
      textColor: '#f44336'
    }
  ];

  // Helper function để lấy cấu hình status
  const getStatusConfig = (status) => {
    return orderStatuses.find(s => s.value === status) || {
      value: status,
      label: status,
      icon: <PendingIcon fontSize="small" />,
      bgColor: alpha('#757575', 0.1),
      textColor: '#757575'
    };
  };  // Load orders từ API
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");
      
      let url;
      if (selectedStore === "all") {
        url = endpoint.GET_SELLER_ORDERS_ALL;
      } else {
        url = endpoint.GET_SELLER_ORDERS_BY_STORE(selectedStore);
      }
      
      const response = await authApi().get(url);
      console.log("Orders response:", response.data);
        // Backend trả về cấu trúc: { success: true, orders: [...], totalElements: number }
      if (response.data && response.data.success && Array.isArray(response.data.orders)) {
        // Xử lý dữ liệu đơn hàng từ API response
        const processedOrders = response.data.orders.map(order => {
          // Sử dụng trực tiếp các giá trị từ OrderSummaryDTO
          return {
            ...order,
            // Đảm bảo các trường có giá trị mặc định phù hợp nếu null từ backend
            firstProductName: order.firstProductName || 'Chưa có sản phẩm',
            orderDetailsCount: order.orderDetailsCount || 0,
            storeName: order.storeName || 'Chưa xác định',
            storeId: order.storeId,
            // Validate các trường số để tránh hiển thị NaN
            totalAmount: parseFloat(order.totalAmount) || 0,
            customerName: order.customerName || 'Khách hàng không xác định',
            customerEmail: order.customerEmail || ''
          };
        });
        
        console.log("Processed orders:", processedOrders);
        setOrders(processedOrders);      } else if (response.data && Array.isArray(response.data)) {
        // Fallback cho trường hợp API trả về array trực tiếp
        const processedOrders = response.data.map(order => {
          // Sử dụng trực tiếp các giá trị từ OrderSummaryDTO
          return {
            ...order,
            // Đảm bảo các trường có giá trị mặc định phù hợp nếu null từ backend
            firstProductName: order.firstProductName || 'Chưa có sản phẩm',
            orderDetailsCount: order.orderDetailsCount || 0,
            storeName: order.storeName || 'Chưa xác định',
            storeId: order.storeId,
            // Validate các trường số để tránh hiển thị NaN
            totalAmount: parseFloat(order.totalAmount) || 0,
            customerName: order.customerName || 'Khách hàng không xác định',
            customerEmail: order.customerEmail || ''
          };
        });
        
        setOrders(processedOrders);
      } else {
        setOrders([]);
        console.warn("API trả về dữ liệu không đúng format:", response.data);
      }
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
      setError("Không thể tải danh sách đơn hàng");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  // Load stores
  const loadStores = async () => {
    try {
      const response = await authApi().get(endpoint.GET_SELLER_STORES);
      if (response.data && Array.isArray(response.data)) {
        setStores(response.data);
      }
    } catch (error) {
      console.error("Lỗi tải cửa hàng:", error);
    }
  };

  // Format functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit', 
      second: '2-digit'
    });
  };
  const formatCurrency = (amount) => {
    // Kiểm tra và xử lý giá trị không hợp lệ
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || !isFinite(numericAmount)) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(0);
    }
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numericAmount);
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    setStatusToUpdate({ orderId, status: newStatus });
    setStatusNote("");
    setShowNoteDialog(true);
  };

  const confirmStatusUpdate = async () => {
    try {
      setUpdating(true);
      setShowNoteDialog(false);

      const updateData = {
        status: statusToUpdate.status,
        note: statusNote.trim() || null
      };

      await authApi().put(endpoint.UPDATE_ORDER_STATUS(statusToUpdate.orderId), updateData);

      // Cập nhật state local
      setOrders(prev => prev.map(order => 
        order.id === statusToUpdate.orderId 
          ? { ...order, status: statusToUpdate.status }
          : order
      ));      // Cập nhật orderDetails nếu đang xem chi tiết
      if (selectedOrder && selectedOrder.id === statusToUpdate.orderId) {
        await loadOrderDetails(statusToUpdate.orderId);
      }

      // Hiển thị thông báo thành công với animation
      const statusConfig = getStatusConfig(statusToUpdate.status);
      setSuccessMessage(`Đơn hàng #${statusToUpdate.orderId} đã được cập nhật thành ${statusConfig.label} thành công`);

      // Tự động ẩn thông báo sau 5 giây
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

      // Reset state
      setStatusToUpdate({ orderId: null, status: null });
      setStatusNote("");
      
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      setError(error.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng");
    } finally {
      setUpdating(false);
    }
  };
  // Lấy chi tiết đơn hàng
  const loadOrderDetails = async (orderId) => {
    try {
      // Sử dụng API endpoint mới để lấy chi tiết đơn hàng đầy đủ
      const response = await authApi().get(endpoint.GET_ORDER_FULL_DETAILS(orderId));
      console.log("Chi tiết đơn hàng đầy đủ từ API:", response.data);
      
      // Thêm log chi tiết hơn về cấu trúc dữ liệu
      if (response.data && response.data.order && response.data.order.orderDetails && response.data.order.orderDetails.length > 0) {
        console.log("Chi tiết đơn hàng (raw):", response.data.order.orderDetails[0]);
        const detail = response.data.order.orderDetails[0];
        console.log("Detail price structure:", {
          detail_price: detail.price,
          detail_product_price: detail.product?.price,
          detail_unitPrice: detail.unitPrice,
          detail_product_unitPrice: detail.product?.unitPrice,
          product_details: detail.product
        });
      }
      
      if (response.data && response.data.success && response.data.order) {
        // Xử lý và validate orderDetails
        const processedOrderDetails = (response.data.order.orderDetails || []).map(detail => {
          // Kiểm tra tất cả các trường có thể chứa giá - ưu tiên unitPrice vì đó là trường được backend trả về
          const productPrice = detail.unitPrice || 
                               detail.price || 
                               (detail.product && (detail.product.price || detail.product.unitPrice)) ||
                               detail.pricePerUnit;
          
          console.log(`Tìm giá cho sản phẩm ${detail.product?.name || 'không tên'}:`, {
            id: detail.id,
            detail_price: detail.price,
            detail_unitPrice: detail.unitPrice,
            product_price: detail.product?.price,
            product_unitPrice: detail.product?.unitPrice,
            pricePerUnit: detail.pricePerUnit,
            final_price: productPrice
          });
          
          return {
            ...detail,
            price: parseFloat(productPrice) || 0,
            quantity: parseInt(detail.quantity) || 0,
            product: detail.product || {}
          };
        });
        
        // Khởi tạo các thuộc tính mặc định nếu không tồn tại và validate tất cả trường số
        const orderData = {
          ...response.data.order,
          payment: response.data.order.payment || null,
          shippingAddress: response.data.order.shippingAddress || response.data.order.address || null,
          // Đảm bảo totalAmount là một số hợp lệ
          totalAmount: parseFloat(response.data.order.totalAmount) || 0,
          // Validate các trường số khác
          shippingFee: parseFloat(response.data.order.shippingFee) || 0,
          subtotal: parseFloat(response.data.order.subtotal) || 0,
          tax: parseFloat(response.data.order.tax) || 0,
          discount: parseFloat(response.data.order.discount) || 0,
          orderDetails: processedOrderDetails
        };
        
        console.log("Processed order details:", processedOrderDetails);
        
        // Log chi tiết giá cho từng sản phẩm để debug
        processedOrderDetails.forEach((item, index) => {
          console.log(`Sản phẩm ${index + 1}:`, {
            name: item.product?.name,
            originalPrice: item.price,
            unitPrice: item.unitPrice,
            productPrice: item.product?.price,
            productUnitPrice: item.product?.unitPrice,
            finalPrice: item.price
          });
        });
        
        setOrderDetails(orderData);
        
        // Lấy lịch sử trạng thái từ response mới
        setOrderHistory(response.data.order.history || []);
      } else {
        console.error("Dữ liệu đơn hàng không hợp lệ:", response.data);
        setError("Không thể tải chi tiết đơn hàng - dữ liệu không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
      setError("Không thể tải chi tiết đơn hàng");
      
      // Fallback: Thử sử dụng API cũ
      try {
        const fallbackResponse = await authApi().get(endpoint.GET_ORDER_BY_ID(orderId));
        console.log("Sử dụng API cũ để lấy chi tiết đơn hàng:", fallbackResponse.data);
        
        // Xử lý và validate orderDetails cho fallback
        const processedOrderDetails = (fallbackResponse.data.orderDetails || []).map(detail => ({
          ...detail,
          price: parseFloat(detail.price) || 0,
          quantity: parseInt(detail.quantity) || 0,
          product: detail.product || {}
        }));
        
        // Khởi tạo các thuộc tính mặc định nếu không tồn tại
        const orderData = {
          ...fallbackResponse.data,
          payment: fallbackResponse.data.payment || null,
          shippingAddress: fallbackResponse.data.shippingAddress || fallbackResponse.data.address || null,
          orderDetails: processedOrderDetails
        };
        
        console.log("Processed fallback order details:", processedOrderDetails);
        setOrderDetails(orderData);
        
        // Lấy lịch sử trạng thái đơn hàng
        try {
          const historyResponse = await authApi().get(endpoint.GET_ORDER_HISTORY(orderId));
          console.log("Lịch sử đơn hàng từ API:", historyResponse.data);
          setOrderHistory(historyResponse.data.history || []);
        } catch (historyError) {
          console.error("Lỗi khi tải lịch sử đơn hàng:", historyError);
          setOrderHistory([]);
        }
      } catch (fallbackError) {
        console.error("Lỗi khi tải chi tiết đơn hàng (cả fallback):", fallbackError);
        setError("Không thể tải chi tiết đơn hàng");
      }
    }
  };

  // Show order details
  const showOrderDetails = async (order) => {
    setSelectedOrder(order);
    await loadOrderDetails(order.id);
    setShowOrderModal(true);
  };

  // Menu handlers
  const handleMenuClick = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderForMenu(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderForMenu(null);
  };

  // Effects
  useEffect(() => {
    if (user) {
      loadOrders();
      loadStores();
    }
  }, [user, selectedStore, statusFilter]);

  // Filter and pagination logic
  const filteredOrders = orders.filter(order => {
    const matchesStore = selectedStore === "all" || order.storeId === parseInt(selectedStore);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = !searchTerm || 
      order.id.toString().includes(searchTerm) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.storeName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStore && matchesStatus && matchesSearch;
  });

  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!user) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          Vui lòng đăng nhập để xem danh sách đơn hàng
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Fade in timeout={800}>
        <Box>
          {/* Header Section */}
          <StyledCard sx={{ mb: 4, p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: 56, 
                  height: 56,
                  backdropFilter: 'blur(10px)'
                }}>
                  <ShoppingCartIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Quản lý đơn hàng
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Tổng: {filteredOrders.length} đơn hàng
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Làm mới dữ liệu">
                <Fab
                  color="secondary"
                  size="medium"
                  onClick={loadOrders}
                  sx={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)',
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <RefreshIcon />
                </Fab>
              </Tooltip>
            </Box>
          </StyledCard>

          {/* Error Alert */}
          {error && (
            <Slide direction="down" in={Boolean(error)} mountOnEnter unmountOnExit>
              <Alert 
                severity="error" 
                onClose={() => setError("")} 
                sx={{ mb: 3, borderRadius: 2 }}
              >
                {error}
              </Alert>
            </Slide>
          )}
          
          {/* Success Alert */}
          {successMessage && (
            <Slide direction="down" in={Boolean(successMessage)} mountOnEnter unmountOnExit>
              <Alert 
                severity="success" 
                onClose={() => setSuccessMessage("")}
                icon={<CheckCircleIcon fontSize="inherit" />}
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(46, 125, 50, 0.2)',
                  '& .MuiAlert-icon': {
                    color: 'success.main'
                  }
                }}
              >
                {successMessage}
              </Alert>
            </Slide>
          )}

          {/* Filters Section */}
          <StyledPaper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Cửa hàng</InputLabel>
                  <Select
                    value={selectedStore}
                    label="Cửa hàng"
                    onChange={(e) => setSelectedStore(e.target.value)}
                    startAdornment={<StoreIcon sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    <MenuItem value="all">Tất cả cửa hàng</MenuItem>
                    {stores.map(store => (
                      <MenuItem key={store.id} value={store.id}>
                        {store.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Trạng thái"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    startAdornment={<FilterListIcon sx={{ mr: 1, color: 'action.active' }} />}
                  >
                    <MenuItem value="all">Tất cả trạng thái</MenuItem>
                    {orderStatuses.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {status.icon}
                          {status.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <SearchField
                  fullWidth
                  placeholder="Tìm kiếm theo mã đơn hàng, khách hàng, cửa hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </StyledPaper>

          {/* Orders Table */}
          {loading ? (
            <StyledPaper sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Đang tải đơn hàng...
              </Typography>
            </StyledPaper>
          ) : filteredOrders.length === 0 ? (
            <StyledPaper sx={{ p: 6, textAlign: 'center' }}>
              <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Không có đơn hàng nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || statusFilter !== "all" || selectedStore !== "all" 
                  ? "Thử điều chỉnh bộ lọc để xem thêm đơn hàng"
                  : "Chưa có đơn hàng nào được tạo"}
              </Typography>
            </StyledPaper>
          ) : (
            <StyledPaper>
              <StyledTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã đơn hàng</TableCell>
                      <TableCell>Ngày đặt</TableCell>
                      <TableCell>Khách hàng</TableCell>
                      <TableCell>Cửa hàng</TableCell>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell>Tổng tiền</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedOrders.map((order, index) => {
                      const statusConfig = getStatusConfig(order.status);
                      return (
                        <Slide 
                          key={order.id} 
                          direction="up" 
                          in 
                          timeout={300 + index * 100}
                        >
                          <TableRow>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  bgcolor: 'primary.main',
                                  fontSize: '0.8rem'
                                }}>
                                  #{order.id.toString().slice(-2)}
                                </Avatar>
                                <Typography fontWeight="bold">
                                  #{order.id}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <DateRangeIcon color="action" fontSize="small" />
                                <Typography variant="body2">
                                  {formatDate(order.orderDate)}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <PersonIcon color="action" fontSize="small" />
                                <Typography>{order.customerName}</Typography>
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <StoreIcon color="action" fontSize="small" />
                                <Typography>{order.storeName}</Typography>
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {order.firstProductName}
                                </Typography>
                                {order.orderDetailsCount > 1 && (
                                  <AnimatedChip
                                    size="small"
                                    label={`+${order.orderDetailsCount - 1} sản phẩm`}
                                    color="primary"
                                    variant="outlined"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </Box>
                            </TableCell>

                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <MoneyIcon color="success" fontSize="small" />
                                <Typography fontWeight="bold" color="success.main">
                                  {formatCurrency(order.totalAmount)}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell>
                              <AnimatedChip
                                icon={statusConfig.icon}
                                label={statusConfig.label}
                                sx={{
                                  bgcolor: statusConfig.bgColor,
                                  color: statusConfig.textColor,
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>

                            <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Tooltip title="Xem chi tiết" arrow>
                                  <IconButton
                                    color="primary"
                                    onClick={() => showOrderDetails(order)}
                                    size="small"
                                    sx={{
                                      transition: 'all 0.2s ease',
                                      backgroundColor: alpha('#1976d2', 0.08),
                                      '&:hover': {
                                        transform: 'scale(1.15)',
                                        backgroundColor: alpha('#1976d2', 0.15),
                                        boxShadow: '0 4px 10px rgba(25, 118, 210, 0.2)'
                                      }
                                    }}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Cập nhật trạng thái" arrow>
                                  <IconButton
                                    color="secondary"
                                    onClick={(e) => handleMenuClick(e, order)}
                                    disabled={updating}
                                    size="small"
                                    sx={{
                                      transition: 'all 0.2s ease',
                                      backgroundColor: alpha('#9c27b0', 0.08),
                                      '&:hover': {
                                        transform: 'scale(1.15)',
                                        backgroundColor: alpha('#9c27b0', 0.15),
                                        boxShadow: '0 4px 10px rgba(156, 39, 176, 0.2)'
                                      },
                                      '&.Mui-disabled': {
                                        backgroundColor: alpha('#9c27b0', 0.03),
                                        opacity: 0.6
                                      }
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        </Slide>
                      );
                    })}
                  </TableBody>
                </Table>
              </StyledTableContainer>
              
              <TablePagination
                component="div"
                count={filteredOrders.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Số hàng mỗi trang:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
                }
              />
            </StyledPaper>
          )}

          {/* Order Details Dialog */}
          <GlassDialog
            open={showOrderModal}
            onClose={() => setShowOrderModal(false)}
            maxWidth="lg"
            fullWidth
            TransitionComponent={Slide}
            TransitionProps={{ direction: "up" }}
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <AssignmentIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  Chi tiết đơn hàng #{selectedOrder?.id}
                </Typography>
              </Box>
              <IconButton 
                onClick={() => setShowOrderModal(false)}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
              {orderDetails ? (
                <Fade in timeout={500}>
                  <Box>
                    <Grid container spacing={3}>
                      {/* Customer Information */}
                      <Grid item xs={12} md={6}>
                        <StyledPaper sx={{ p: 3, height: '100%' }}>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <PersonIcon color="primary" />
                            <Typography variant="h6" fontWeight="bold">
                              Thông tin khách hàng
                            </Typography>
                          </Box>
                          <Divider sx={{ mb: 2 }} />
                          <Stack spacing={1.5}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Tên khách hàng
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {orderDetails.user?.fullname || orderDetails.user?.username || 'Chưa cập nhật'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Email
                              </Typography>
                              <Typography variant="body1">
                                {orderDetails.user?.email || 'Chưa cập nhật'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Điện thoại
                              </Typography>
                              <Typography variant="body1">
                                {orderDetails.phoneNumber || orderDetails.user?.phoneNumber || 'Chưa cập nhật'}
                              </Typography>
                            </Box>
                          </Stack>
                        </StyledPaper>
                      </Grid>

                      {/* Order Information */}
                      <Grid item xs={12} md={6}>
                        <StyledPaper sx={{ p: 3, height: '100%' }}>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <ShoppingCartIcon color="primary" />
                            <Typography variant="h6" fontWeight="bold">
                              Thông tin đơn hàng
                            </Typography>
                          </Box>
                          <Divider sx={{ mb: 2 }} />
                          <Stack spacing={1.5}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Ngày đặt hàng
                              </Typography>
                              <Typography variant="body1">
                                {formatDate(orderDetails.orderDate)}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Trạng thái
                              </Typography>
                              <Box mt={0.5} display="flex" alignItems="center" gap={1}>
                                {(() => {
                                  const statusConfig = getStatusConfig(orderDetails.status);
                                  return (
                                    <AnimatedChip
                                      icon={statusConfig.icon}
                                      label={statusConfig.label}
                                      sx={{
                                        bgcolor: statusConfig.bgColor,
                                        color: statusConfig.textColor,
                                        fontWeight: 600
                                      }}
                                    />
                                  );
                                })()}
                                <Tooltip title="Cập nhật trạng thái">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => {
                                      setSelectedOrderForMenu(orderDetails);
                                      setAnchorEl(e.currentTarget);
                                    }}
                                    disabled={updating}
                                    sx={{
                                      ml: 1,
                                      border: '1px dashed',
                                      borderColor: 'primary.main',
                                      '&:hover': {
                                        bgcolor: alpha('#1976d2', 0.1)
                                      }
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Tổng tiền
                              </Typography>
                              <Typography variant="h6" color="success.main" fontWeight="bold">
                                {formatCurrency(orderDetails.totalAmount)}
                              </Typography>
                            </Box>
                          </Stack>
                        </StyledPaper>
                      </Grid>

                      {/* Address Information */}
                      {orderDetails.shippingAddress && (
                        <Grid item xs={12}>
                          <StyledPaper sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                              <ShippingIcon color="primary" />
                              <Typography variant="h6" fontWeight="bold">
                                Địa chỉ giao hàng
                              </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body1">
                              {orderDetails.shippingAddress}
                            </Typography>
                          </StyledPaper>
                        </Grid>
                      )}

                      {/* Order Items */}
                      {orderDetails.orderDetails && orderDetails.orderDetails.length > 0 && (
                        <Grid item xs={12}>
                          <StyledPaper sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                              <AssignmentIcon color="primary" />
                              <Typography variant="h6" fontWeight="bold">
                                Chi tiết sản phẩm
                              </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <StyledTableContainer>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Sản phẩm</TableCell>
                                    <TableCell align="center">Số lượng</TableCell>
                                    <TableCell align="right">Đơn giá</TableCell>
                                    <TableCell align="right">Thành tiền</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {orderDetails.orderDetails.map((detail, index) => (
                                    <Slide 
                                      key={detail.id} 
                                      direction="up" 
                                      in 
                                      timeout={300 + index * 100}
                                    >
                                      <TableRow>
                                        <TableCell>
                                          <Box display="flex" alignItems="center" gap={2}>
                                            {detail.product?.image && (
                                              <Avatar
                                                src={detail.product.image}
                                                alt={detail.product.name}
                                                sx={{ 
                                                  width: 50, 
                                                  height: 50,
                                                  borderRadius: 2
                                                }}
                                              />
                                            )}
                                            <Box>
                                              <Typography fontWeight="medium" variant="body2">
                                                {detail.product?.name || 'Tên sản phẩm không xác định'}
                                              </Typography>
                                              <Typography variant="caption" color="text.secondary">
                                                ID: {detail.product?.id}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </TableCell>                                        <TableCell align="center">
                                          <AnimatedChip 
                                            label={detail.quantity || 0}
                                            color="primary"
                                            size="small"
                                          />                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography color="text.secondary">
                                            {formatCurrency(detail.unitPrice || detail.price || detail.product?.price || detail.product?.unitPrice || 0)}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography fontWeight="bold" color="success.main">
                                            {formatCurrency((detail.quantity || 0) * (detail.unitPrice || detail.price || detail.product?.price || detail.product?.unitPrice || 0))}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    </Slide>
                                  ))}
                                </TableBody>
                              </Table>
                            </StyledTableContainer>
                          </StyledPaper>
                        </Grid>
                      )}

                      {/* Order Status History */}
                      {orderHistory && orderHistory.length > 0 && (
                        <Grid item xs={12}>
                          <StyledPaper sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                              <DateRangeIcon color="primary" />
                              <Typography variant="h6" fontWeight="bold">
                                Lịch sử trạng thái đơn hàng
                              </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={2}>
                              {orderHistory.map((history, index) => {
                                const statusConfig = getStatusConfig(history.status);
                                
                                return (
                                  <Fade key={history.id} in timeout={300 + index * 100}>
                                    <Box
                                      sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: alpha(statusConfig.textColor, 0.05),
                                        borderLeft: 4,
                                        borderLeftColor: statusConfig.textColor,
                                        position: 'relative'
                                      }}
                                    >
                                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                        <Box>
                                          <Typography variant="body1" fontWeight="medium">
                                            <Box display="flex" alignItems="center" gap={1}>
                                              {statusConfig.icon}
                                              {statusConfig.label}
                                            </Box>
                                          </Typography>
                                          
                                          {history.note && (
                                            <Box mt={1} sx={{ 
                                              p: 1, 
                                              borderRadius: 1,
                                              bgcolor: alpha(statusConfig.textColor, 0.03),
                                              borderLeft: 2,
                                              borderLeftColor: statusConfig.textColor
                                            }}>
                                              <Typography variant="body2" color="text.secondary">
                                                {history.note}
                                              </Typography>
                                            </Box>
                                          )}
                                          
                                          <Box mt={1} display="flex" alignItems="center" gap={0.5}>
                                            <PersonIcon fontSize="small" color="action" sx={{ opacity: 0.6 }} />
                                            <Typography variant="caption" color="text.secondary">
                                              {history.createdBy || 'Hệ thống'}
                                            </Typography>
                                          </Box>
                                        </Box>
                                        
                                        <Box textAlign="right">
                                          <Typography variant="caption" color="text.secondary">
                                            {formatDate(history.createdAt || history.updatedAt)}
                                          </Typography>
                                          <Typography variant="caption" display="block" color="text.secondary">
                                            {formatTime(history.createdAt || history.updatedAt)}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Box>
                                  </Fade>
                                );
                              })}
                            </Stack>
                          </StyledPaper>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Fade>
              ) : (
                <Box display="flex" justifyContent="center" py={8}>
                  <CircularProgress size={60} thickness={4} />
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 3, background: alpha('#667eea', 0.05) }}>
              <Button
                variant="contained"
                onClick={() => setShowOrderModal(false)}
                sx={{
                  borderRadius: 20,
                  px: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  }
                }}
              >
                Đóng
              </Button>
            </DialogActions>
          </GlassDialog>

          {/* Status Update Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                borderRadius: 2,
                minWidth: 200,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                mt: 1.5,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Cập nhật trạng thái
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đơn hàng #{selectedOrderForMenu?.id}
              </Typography>
            </Box>
            {orderStatuses.map((status) => (
              <MenuItem 
                key={status.value}
                onClick={() => {
                  if (selectedOrderForMenu) {
                    handleMenuClose();
                    updateOrderStatus(selectedOrderForMenu.id, status.value);
                  }
                }}
                disabled={selectedOrderForMenu?.status === status.value}
                sx={{ 
                  pl: 1, 
                  py: 1.2,
                  borderLeft: 3,
                  borderColor: selectedOrderForMenu?.status === status.value ? status.textColor : 'transparent',
                  bgcolor: selectedOrderForMenu?.status === status.value ? alpha(status.textColor, 0.08) : 'transparent',
                  '&:hover': {
                    bgcolor: alpha(status.textColor, 0.08),
                  }
                }}
              >
                <ListItemIcon sx={{ color: status.textColor }}>
                  {status.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={status.label}
                  primaryTypographyProps={{ 
                    fontWeight: selectedOrderForMenu?.status === status.value ? 'bold' : 'regular'
                  }}
                />
                {selectedOrderForMenu?.status === status.value && (
                  <CheckCircleIcon fontSize="small" sx={{ ml: 1, color: status.textColor }} />
                )}
              </MenuItem>
            ))}
          </Menu>

          {/* Loading Backdrop */}
          <Backdrop
            sx={{ 
              color: '#fff', 
              zIndex: (theme) => theme.zIndex.drawer + 1,
              background: 'rgba(102, 126, 234, 0.1)',
              backdropFilter: 'blur(5px)'
            }}
            open={updating}
          >
            <Box textAlign="center">
              <CircularProgress color="inherit" size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Đang cập nhật trạng thái...
              </Typography>
            </Box>
          </Backdrop>
          
          {/* Status Note Dialog */}
          <Dialog 
            open={showNoteDialog} 
            onClose={() => setShowNoteDialog(false)}
            TransitionComponent={Slide}
            TransitionProps={{ direction: "up" }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                maxWidth: 500,
                width: '100%',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                animation: 'fadeIn 0.3s ease-out'
              }
            }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box display="flex" alignItems="center" gap={1}>
                <EditIcon />
                <Typography variant="h6">Cập nhật trạng thái đơn hàng</Typography>
              </Box>
              <IconButton 
                onClick={() => setShowNoteDialog(false)} 
                sx={{ color: 'white' }}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, mt: 2 }}>
              {statusToUpdate.orderId && statusToUpdate.status && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Bạn đang cập nhật trạng thái đơn hàng:
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha('#f5f5f5', 0.5)
                    }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        #{statusToUpdate.orderId.toString().slice(-2)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          Đơn hàng #{statusToUpdate.orderId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Trạng thái mới:
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Fade in timeout={500}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3
                      }}>
                        {(() => {
                          const statusConfig = getStatusConfig(statusToUpdate.status);
                          return (
                            <AnimatedChip
                              icon={statusConfig.icon}
                              label={statusConfig.label}
                              sx={{
                                bgcolor: statusConfig.bgColor,
                                color: statusConfig.textColor,
                                fontWeight: 600,
                                p: 2,
                                height: 40,
                                '& .MuiChip-label': {
                                  fontSize: '1rem'
                                }
                              }}
                            />
                          );
                        })()}
                      </Box>
                    </Fade>
                  </Box>
                
                  <TextField
                    label="Ghi chú (tùy chọn)"
                    multiline
                    rows={4}
                    fullWidth
                    variant="outlined"
                    placeholder="Thêm ghi chú về việc cập nhật trạng thái này"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AssignmentIcon color="action" />
                        </InputAdornment>
                      ),
                      sx: { 
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      }
                    }}
                    helperText="Ghi chú sẽ được hiển thị trong lịch sử trạng thái đơn hàng"
                  />
                </>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 2, bgcolor: alpha('#f5f5f5', 0.3) }}>
              <Button 
                onClick={() => setShowNoteDialog(false)}
                variant="outlined"
                color="inherit"
                startIcon={<CloseIcon />}
                sx={{ 
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    bgcolor: alpha('#f44336', 0.08)
                  }
                }}
              >
                Hủy
              </Button>
              <Button 
                onClick={confirmStatusUpdate}
                variant="contained"
                startIcon={<CheckCircleIcon />}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 10px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 15px rgba(102, 126, 234, 0.5)',
                  }
                }}
              >
                Cập nhật trạng thái
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </Container>
  );
};

export default SellerOrders;
