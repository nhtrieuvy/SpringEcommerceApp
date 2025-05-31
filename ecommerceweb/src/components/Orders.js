import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    Chip,
    Button,
    Alert,
    Skeleton,
    Divider,
    Avatar,
    Paper,
    TextField,
    InputAdornment,
    MenuItem,
    IconButton,
    Tooltip,
    TablePagination
} from '@mui/material';
import { 
    ShoppingBag as ShoppingBagIcon,
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Visibility as VisibilityIcon,
    LocalShipping as LocalShippingIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    AccessTime as AccessTimeIcon,
    Build as BuildIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../configs/MyContexts';
import { authApi, endpoint } from '../configs/Apis';
import { formatCurrency } from '../utils/FormatUtils';
import AsyncPageWrapper from './AsyncPageWrapper';

const Orders = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);    const [totalOrders, setTotalOrders] = useState(0);
    const [reorderLoading, setReorderLoading] = useState(false);
    const [reorderError, setReorderError] = useState(null);
    const [reorderSuccess, setReorderSuccess] = useState(false);

    // Check authentication
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
    }, [isAuthenticated, navigate]);

    // Fetch orders
    useEffect(() => {
        fetchOrders();
    }, [page, rowsPerPage, statusFilter, searchQuery]);    const fetchOrders = async () => {
        try {
            setLoading(true);
              // Since backend doesn't support pagination, status filter, or search,
            // we'll fetch all orders and filter client-side
            const response = await authApi().get(endpoint.GET_MY_ORDERS);
            
            console.log('Full response from backend:', response);
            console.log('Response data:', response.data);
            console.log('Response data type:', typeof response.data);
            console.log('Is response.data an array?', Array.isArray(response.data));
            
            if (response.data.success || Array.isArray(response.data)) {
                const allOrders = response.data.content || response.data.orders || response.data || [];
                console.log('Total orders received from backend:', allOrders.length);
                console.log('Orders array:', allOrders);
                
                // Since backend doesn't support pagination, we need to implement client-side pagination
                let filteredOrders = allOrders;
                
                // Apply status filter
                if (statusFilter !== 'ALL') {
                    filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
                }
                
                // Apply search filter
                if (searchQuery && searchQuery.trim()) {
                    const query = searchQuery.toLowerCase().trim();
                    filteredOrders = filteredOrders.filter(order => 
                        order.id.toString().includes(query) ||
                        (order.orderDetails && order.orderDetails.some(detail => 
                            detail.product && detail.product.name && 
                            detail.product.name.toLowerCase().includes(query)
                        ))
                    );
                }
                
                console.log('Filtered orders count:', filteredOrders.length);
                
                // Apply pagination
                const startIndex = page * rowsPerPage;
                const endIndex = startIndex + rowsPerPage;
                const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
                
                console.log(`Showing orders ${startIndex + 1}-${Math.min(endIndex, filteredOrders.length)} of ${filteredOrders.length}`);
                
                setOrders(paginatedOrders);
                setTotalOrders(filteredOrders.length);
                setError(null);
            } else {
                setError('Không thể tải danh sách đơn hàng');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            if (err.response) {
                // Server responded with an error status code
                if (err.response.status === 500) {
                    setError('Lỗi máy chủ nội bộ. Vui lòng thử lại sau hoặc liên hệ quản trị viên.');
                } else if (err.response.status === 401) {
                    setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    // Optionally redirect to login page
                    // setTimeout(() => navigate('/login'), 3000);
                } else if (err.response.status === 403) {
                    setError('Bạn không có quyền xem đơn hàng.');
                } else {
                    setError(`Đã xảy ra lỗi khi tải danh sách đơn hàng: ${err.response.status}`);
                }
            } else if (err.request) {
                // Request was made but no response received
                setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.');
            } else {
                // Something happened in setting up the request
                setError('Đã xảy ra lỗi khi tải danh sách đơn hàng');
            }
            
            // Set empty orders to prevent showing old data
            setOrders([]);
            setTotalOrders(0);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            'PENDING': { 
                label: 'Chờ xác nhận', 
                color: 'warning', 
                icon: <AccessTimeIcon fontSize="small" />,
                bgColor: '#fff3cd',
                textColor: '#856404'
            },
            'PROCESSING': { 
                label: 'Đang xử lý', 
                color: 'info', 
                icon: <BuildIcon fontSize="small" />,
                bgColor: '#d1ecf1',
                textColor: '#0c5460'
            },
            'SHIPPING': { 
                label: 'Đang giao hàng', 
                color: 'primary', 
                icon: <LocalShippingIcon fontSize="small" />,
                bgColor: '#d4edda',
                textColor: '#155724'
            },
            'COMPLETED': { 
                label: 'Đã hoàn thành', 
                color: 'success', 
                icon: <CheckCircleIcon fontSize="small" />,
                bgColor: '#d4edda',
                textColor: '#155724'
            },
            'CANCELLED': { 
                label: 'Đã hủy', 
                color: 'error', 
                icon: <CancelIcon fontSize="small" />,
                bgColor: '#f8d7da',
                textColor: '#721c24'
            }
        };
        return statusMap[status] || { 
            label: status, 
            color: 'default', 
            icon: <ReceiptIcon fontSize="small" />,
            bgColor: '#e9ecef',
            textColor: '#495057'
        };
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };    const handleViewDetails = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    // Function to handle reordering previous order items
    const handleReorder = async (order) => {
        try {
            setReorderLoading(true);
            setReorderError(null);
            
            if (!order.orderDetails || order.orderDetails.length === 0) {
                setReorderError('Không thể tải thông tin sản phẩm trong đơn hàng này.');
                return;
            }
            
            // Get existing cart items if any
            const existingCartResponse = await authApi().get('/api/cart');
            let existingCartItems = [];
            
            if (existingCartResponse.data && (existingCartResponse.data.success || existingCartResponse.data.cartItems)) {
                existingCartItems = existingCartResponse.data.cartItems || existingCartResponse.data.content || [];
            }
            
            // Build new cart from order items
            const newCartItems = order.orderDetails.map(item => ({
                productId: item.product.id,
                quantity: item.quantity
            }));
            
            // Update cart with new items
            const response = await authApi().post('/api/cart/batch', {
                items: newCartItems,
                replace: true // Replace existing cart
            });
            
            if (response.data && response.data.success) {
                setReorderSuccess(true);
                // Redirect to cart page
                navigate('/cart');
            } else {
                setReorderError('Không thể thêm các sản phẩm vào giỏ hàng.');
            }
        } catch (err) {
            console.error('Error reordering items:', err);
            setReorderError('Đã xảy ra lỗi khi thêm các sản phẩm vào giỏ hàng.');
        } finally {
            setReorderLoading(false);
            
            // Reset success message after some time
            if (reorderSuccess) {
                setTimeout(() => setReorderSuccess(false), 5000);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && orders.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width="300px" height={40} />
                    <Skeleton variant="text" width="200px" height={24} sx={{ mt: 1 }} />
                </Box>
                
                {[...Array(3)].map((_, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                        <CardContent>
                            <Skeleton variant="text" width="200px" height={24} />
                            <Skeleton variant="text" width="100%" height={20} sx={{ mt: 1 }} />
                            <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 2 }} />
                        </CardContent>
                    </Card>
                ))}
            </Container>
        );
    }    return (
        <AsyncPageWrapper isLoading={loading}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <ShoppingBagIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                        Đơn hàng của tôi
                    </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    Theo dõi trạng thái và quản lý các đơn hàng của bạn
                </Typography>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Tìm kiếm theo mã đơn hàng hoặc sản phẩm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton 
                                            size="small" 
                                            onClick={() => setSearchQuery('')}
                                            aria-label="clear search"
                                        >
                                            <CancelIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            size="small"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    fetchOrders();
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            select
                            label="Trạng thái"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="ALL">Tất cả</MenuItem>
                            <MenuItem value="PENDING">Chờ xác nhận</MenuItem>
                            <MenuItem value="PROCESSING">Đang xử lý</MenuItem>
                            <MenuItem value="SHIPPING">Đang giao hàng</MenuItem>
                            <MenuItem value="COMPLETED">Đã hoàn thành</MenuItem>
                            <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<FilterListIcon />}
                            onClick={fetchOrders}
                            size="small"
                        >
                            Lọc
                        </Button>
                    </Grid>
                </Grid>
            </Paper>            {/* Error or Success Messages */}
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 3 }}
                    action={
                        <Button 
                            color="inherit" 
                            size="small"
                            onClick={fetchOrders}
                            disabled={loading}
                        >
                            Thử lại
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}
            {reorderError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {reorderError}
                </Alert>
            )}
            {reorderSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Đã thêm các sản phẩm vào giỏ hàng thành công!
                </Alert>
            )}

            {/* Orders List */}
            {orders.length === 0 && !loading ? (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <ShoppingBagIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Chưa có đơn hàng nào
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Hãy bắt đầu mua sắm để tạo đơn hàng đầu tiên của bạn!
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/')}
                        size="large"
                    >
                        Mua sắm ngay
                    </Button>
                </Paper>
            ) : (
                <>
                    {orders.map((order) => {
                        const statusInfo = getStatusInfo(order.status);
                        return (
                            <Card 
                                key={order.id} 
                                sx={{ 
                                    mb: 2, 
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        borderColor: 'primary.main'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    {/* Order Header */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                Đơn hàng #{order.id}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Đặt ngày: {formatDate(order.orderDate || order.createdDate)}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            icon={statusInfo.icon}
                                            label={statusInfo.label}
                                            sx={{
                                                bgcolor: statusInfo.bgColor,
                                                color: statusInfo.textColor,
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Order Summary */}
                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                Tổng tiền:
                                            </Typography>
                                            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                                {formatCurrency(order.totalAmount || 0)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                Phương thức thanh toán:
                                            </Typography>
                                            <Typography variant="body1">
                                                {order.payment?.paymentMethod || order.paymentMethod || 'Chưa xác định'}
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    {/* Order Items Preview */}
                                    {order.orderDetails && order.orderDetails.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                Sản phẩm ({order.orderDetails.length} mặt hàng):
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                {order.orderDetails.slice(0, 3).map((detail, index) => (
                                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar
                                                            src={detail.product?.image || detail.product?.images?.[0]}
                                                            alt={detail.product?.name}
                                                            sx={{ width: 32, height: 32 }}
                                                        />
                                                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                                            {detail.product?.name || 'Sản phẩm'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            x{detail.quantity}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                                {order.orderDetails.length > 3 && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        +{order.orderDetails.length - 3} sản phẩm khác
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    )}                                    {/* Actions */}
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <Tooltip title="Đặt lại đơn hàng">
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<ReceiptIcon />}
                                                onClick={() => handleReorder(order)}
                                                disabled={order.orderDetails?.length === 0}
                                            >
                                                Đặt lại
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Xem chi tiết và theo dõi đơn hàng">
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleViewDetails(order.id)}
                                            >
                                                Chi tiết
                                            </Button>
                                        </Tooltip>
                                    </Box>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {/* Pagination */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <TablePagination
                            component="div"
                            count={totalOrders}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25]}
                            labelRowsPerPage="Hiển thị:"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`}                        />
                    </Box>
                </>
            )}
        </Container>
        </AsyncPageWrapper>
    );
};

export default Orders;
