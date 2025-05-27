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
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Breadcrumbs,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot,
    TimelineOppositeContent
} from '@mui/lab';
import { 
    ArrowBack as ArrowBackIcon,
    ShoppingBag as ShoppingBagIcon,
    LocalShipping as LocalShippingIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    AccessTime as AccessTimeIcon,
    Build as BuildIcon,
    Receipt as ReceiptIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationOnIcon,
    Payment as PaymentIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../configs/MyContexts';
import { authApi, endpoint } from '../configs/Apis';
import { formatCurrency } from '../utils/FormatUtils';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [order, setOrder] = useState(null);
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [error, setError] = useState(null);

    // New state variables for cancellation
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [cancelling, setCancelling] = useState(false);    const [cancelError, setCancelError] = useState(null);
    const [reorderLoading, setReorderLoading] = useState(false);
    const [reorderSuccess, setReorderSuccess] = useState(false);
    const [reorderError, setReorderError] = useState(null);
    
    // Check authentication
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
    }, [isAuthenticated, navigate]);

    // Fetch order details and history
    useEffect(() => {
        if (id) {
            fetchOrderDetails();
            fetchOrderHistory();
        }
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await authApi().get(endpoint.GET_ORDER_BY_ID(id));
            
            if (response.data.success || response.data) {
                setOrder(response.data.order || response.data);
                setError(null);
            } else {
                setError('Không thể tải thông tin đơn hàng');
            }
        } catch (err) {
            console.error('Error fetching order details:', err);
            if (err.response?.status === 404) {
                setError('Không tìm thấy đơn hàng');
            } else if (err.response?.status === 403) {
                setError('Bạn không có quyền xem đơn hàng này');
            } else {
                setError('Đã xảy ra lỗi khi tải thông tin đơn hàng');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderHistory = async () => {
        try {
            setHistoryLoading(true);
            const response = await authApi().get(endpoint.GET_ORDER_HISTORY(id));
            
            if (response.data.success || Array.isArray(response.data)) {
                setOrderHistory(response.data.history || response.data || []);
            }
        } catch (err) {
            console.error('Error fetching order history:', err);
            // Don't show error for history as it's not critical
        } finally {
            setHistoryLoading(false);
        }
    };    const getStatusInfo = (status) => {
        // List of valid MUI colors for TimelineDot
        // Limited to these values to ensure theme.palette[color].contrastText exists
        const validMuiColors = ['primary', 'secondary', 'error', 'info', 'success', 'warning'];
        
        const statusMap = {
            'PENDING': { 
                label: 'Chờ xác nhận', 
                color: 'warning', 
                icon: <AccessTimeIcon />,
                description: 'Đơn hàng đã được tạo và đang chờ xác nhận từ người bán'
            },
            'PROCESSING': { 
                label: 'Đang xử lý', 
                color: 'info', 
                icon: <BuildIcon />,
                description: 'Đơn hàng đã được xác nhận và đang được chuẩn bị'
            },
            'SHIPPING': { 
                label: 'Đang giao hàng', 
                color: 'primary', 
                icon: <LocalShippingIcon />,
                description: 'Đơn hàng đã được giao cho đơn vị vận chuyển'
            },
            'COMPLETED': { 
                label: 'Đã hoàn thành', 
                color: 'success', 
                icon: <CheckCircleIcon />,
                description: 'Đơn hàng đã được giao thành công'
            },
            'CANCELLED': { 
                label: 'Đã hủy', 
                color: 'error', 
                icon: <CancelIcon />,
                description: 'Đơn hàng đã bị hủy'
            }
        };
        
        // If status is null, undefined, or not found in statusMap, use a default
        if (!status || !statusMap[status]) {
            return { 
                label: status || 'Không xác định', 
                color: 'primary', // Using primary as default since it's always defined in MUI themes
                icon: <ReceiptIcon />,
                description: 'Trạng thái không xác định'
            };
        }
        
        // If status is found, ensure the color is valid
        const result = {...statusMap[status]};
        
        // Make sure the color is a valid MUI color
        if (!validMuiColors.includes(result.color)) {
            result.color = 'primary'; // Use 'primary' as a fallback instead of 'default'
        }
        
        return result;
    };

    const getOrderSteps = () => {
        const steps = [
            { key: 'PENDING', label: 'Chờ xác nhận' },
            { key: 'PROCESSING', label: 'Đang xử lý' },
            { key: 'SHIPPING', label: 'Đang giao hàng' },
            { key: 'COMPLETED', label: 'Đã hoàn thành' }
        ];

        const currentStatusIndex = steps.findIndex(step => step.key === order?.status);
        return { steps, currentStatusIndex };
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

    const formatHistoryDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('vi-VN'),
            time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
    };

    // Function to check if the order is cancellable by the user
    const isOrderCancellable = () => {
        if (!order) return false;
        // Users can only cancel orders in PENDING or PROCESSING state
        return ['PENDING', 'PROCESSING'].includes(order.status);
    };

    // Function to handle opening the cancel dialog
    const handleOpenCancelDialog = () => {
        setCancelDialogOpen(true);
        setCancelError(null);
    };    // Function to handle closing the cancel dialog
    const handleCloseCancelDialog = () => {
        setCancelDialogOpen(false);
        setCancellationReason('');
    };
    
    // Function to handle reordering items from this order
    const handleReorder = async () => {
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
                setTimeout(() => navigate('/cart'), 1500);
            } else {
                setReorderError('Không thể thêm các sản phẩm vào giỏ hàng.');
            }
        } catch (err) {
            console.error('Error reordering items:', err);
            setReorderError('Đã xảy ra lỗi khi thêm các sản phẩm vào giỏ hàng.');
        } finally {
            setReorderLoading(false);
        }
    };// Function to handle order cancellation
    const handleCancelOrder = async () => {
        try {
            setCancelling(true);
            setCancelError(null);
            
            const response = await authApi().put(endpoint.UPDATE_ORDER_STATUS(id), {
                status: 'CANCELLED',
                note: cancellationReason || 'Hủy theo yêu cầu của khách hàng'
            });
            
            if (response.data.success) {
                // Update the local order state
                setOrder({
                    ...order,
                    status: 'CANCELLED'
                });
                
                // Refresh order history
                fetchOrderHistory();
                
                // Close the dialog
                handleCloseCancelDialog();
            } else {
                setCancelError('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
            }
        } catch (err) {
            console.error('Error cancelling order:', err);
            if (err.response?.status === 403) {
                setCancelError('Bạn không có quyền hủy đơn hàng này.');
            } else {
                setCancelError('Đã xảy ra lỗi khi hủy đơn hàng. Vui lòng thử lại sau.');
            }
        } finally {
            setCancelling(false);
        }
    };
    
    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Skeleton variant="text" width="300px" height={40} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={300} />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/orders')}
                >
                    Quay lại danh sách đơn hàng
                </Button>
            </Container>
        );
    }

    if (!order) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="info">
                    Không tìm thấy thông tin đơn hàng
                </Alert>
            </Container>
        );
    }

    const statusInfo = getStatusInfo(order.status);
    const { steps, currentStatusIndex } = getOrderSteps();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumbs */}            <Breadcrumbs sx={{ mb: 3 }}>
                <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
                    Trang chủ
                </Link>
                <Link component={RouterLink} to="/orders" sx={{ display: 'flex', alignItems: 'center' }}>
                    Đơn hàng của tôi
                </Link>
                <Typography color="text.primary">
                    Chi tiết đơn hàng #{order.id}
                </Typography>
            </Breadcrumbs>
            
            {/* Reorder Success Message */}
            {reorderSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    Đã thêm các sản phẩm vào giỏ hàng! Đang chuyển hướng...
                </Alert>
            )}
            
            {/* Reorder Error Message */}
            {reorderError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {reorderError}
                </Alert>
            )}

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Chi tiết đơn hàng #{order.id}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Đặt ngày: {formatDate(order.orderDate || order.createdDate)}
                    </Typography>
                </Box>                <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Cancel Order Button - only show for PENDING or PROCESSING orders */}
                    {isOrderCancellable() && (
                        <Button
                            startIcon={<CancelIcon />}
                            onClick={handleOpenCancelDialog}
                            variant="outlined"
                            color="error"
                        >
                            Hủy đơn hàng
                        </Button>
                    )}
                    {/* Reorder Button - available for all orders that have items */}
                    {order.orderDetails && order.orderDetails.length > 0 && (
                        <Button
                            startIcon={<ReceiptIcon />}
                            onClick={() => handleReorder()}
                            variant="outlined"
                            color="primary"
                        >
                            Đặt lại
                        </Button>
                    )}
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/orders')}
                        variant="outlined"
                    >
                        Quay lại
                    </Button>
                </Box>
            </Box>

            {/* Cancel Order Dialog */}
            <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog}>
                <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Bạn có chắc chắn muốn hủy đơn hàng #{order?.id} không? 
                        Hành động này không thể khôi phục lại.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="reason"
                        label="Lý do hủy đơn hàng (tùy chọn)"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                    />
                    {cancelError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {cancelError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCancelDialog}>Không, giữ đơn hàng</Button>
                    <Button 
                        onClick={handleCancelOrder} 
                        color="error" 
                        variant="contained"
                        disabled={cancelling}
                    >
                        {cancelling ? 'Đang hủy...' : 'Có, hủy đơn hàng'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Grid container spacing={3}>
                {/* Order Status and Tracking */}
                <Grid item xs={12} lg={8}>
                    {/* Current Status */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                {statusInfo.icon}
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {statusInfo.label}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {statusInfo.description}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Order Progress Stepper */}
                            {order.status !== 'CANCELLED' && (
                                <Stepper activeStep={currentStatusIndex} alternativeLabel>
                                    {steps.map((step, index) => (
                                        <Step key={step.key} completed={index <= currentStatusIndex}>
                                            <StepLabel>
                                                {step.label}
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            )}

                            {order.status === 'CANCELLED' && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    Đơn hàng đã bị hủy
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Order History Timeline */}
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                <HistoryIcon />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    Lịch sử đơn hàng
                                </Typography>
                            </Box>

                            {historyLoading ? (
                                <Box>
                                    {[...Array(3)].map((_, index) => (
                                        <Skeleton key={index} variant="text" height={60} sx={{ mb: 1 }} />
                                    ))}
                                </Box>
                            ) : orderHistory.length > 0 ? (
                                <Timeline>
                                    {orderHistory.map((item, index) => {
                                        const itemStatusInfo = getStatusInfo(item.status);
                                        const dateTime = formatHistoryDate(item.createdAt);
                                        
                                        return (
                                            <TimelineItem key={index}>
                                                <TimelineOppositeContent sx={{ flex: 0.3 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {dateTime.date}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {dateTime.time}
                                                    </Typography>
                                                </TimelineOppositeContent>                                                <TimelineSeparator>
                                                    <TimelineDot color={itemStatusInfo?.color || 'default'}>
                                                        {itemStatusInfo?.icon || <ReceiptIcon />}
                                                    </TimelineDot>
                                                    {index < orderHistory.length - 1 && <TimelineConnector />}
                                                </TimelineSeparator>
                                                <TimelineContent>
                                                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                                                        {itemStatusInfo.label}
                                                    </Typography>
                                                    {item.note && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {item.note}
                                                        </Typography>
                                                    )}
                                                    {item.createdBy && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Thực hiện bởi: {item.createdBy.fullname || item.createdBy.username}
                                                        </Typography>
                                                    )}
                                                </TimelineContent>
                                            </TimelineItem>
                                        );
                                    })}
                                </Timeline>
                            ) : (
                                <Alert severity="info">
                                    Chưa có lịch sử trạng thái nào được ghi nhận
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Order Information Sidebar */}
                <Grid item xs={12} lg={4}>
                    {/* Order Summary */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Tóm tắt đơn hàng
                            </Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Tạm tính:</Typography>
                                <Typography variant="body2">
                                    {formatCurrency(order.subtotal || (order.totalAmount - (order.shippingFee || 0)))}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Phí vận chuyển:</Typography>
                                <Typography variant="body2">
                                    {formatCurrency(order.shippingFee || 0)}
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 1 }} />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tổng cộng:</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {formatCurrency(order.totalAmount)}
                                </Typography>
                            </Box>

                            <Chip
                                icon={<PaymentIcon />}
                                label={order.payment?.paymentMethod || order.paymentMethod || 'Chưa xác định'}
                                color="primary"
                                variant="outlined"
                                sx={{ width: '100%' }}
                            />
                        </CardContent>
                    </Card>

                    {/* Shipping Information */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Thông tin giao hàng
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                                <LocationOnIcon fontSize="small" color="action" />
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        Địa chỉ giao hàng:
                                    </Typography>
                                    <Typography variant="body2">
                                        {order.shippingAddress || order.deliveryAddress || 'Chưa có thông tin'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PhoneIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                    {order.user?.phone || order.customerPhone || 'Chưa có SĐT'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon fontSize="small" color="action" />
                                <Typography variant="body2">
                                    {order.user?.email || order.customerEmail || 'Chưa có email'}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Order Items */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                        Sản phẩm đã đặt ({order.orderDetails?.length || 0} mặt hàng)
                    </Typography>

                    {order.orderDetails && order.orderDetails.length > 0 ? (
                        order.orderDetails.map((detail, index) => (
                            <Box key={index}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={2}>
                                        <Avatar
                                            src={detail.product?.image || detail.product?.images?.[0]}
                                            alt={detail.product?.name}
                                            variant="rounded"
                                            sx={{ width: 80, height: 80 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {detail.product?.name || 'Sản phẩm'}
                                        </Typography>
                                        {detail.product?.category && (
                                            <Typography variant="body2" color="text.secondary">
                                                Danh mục: {detail.product.category.name}
                                            </Typography>
                                        )}
                                    </Grid>
                                    <Grid item xs={6} sm={2}>
                                        <Typography variant="body2" color="text.secondary">
                                            Số lượng:
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                            {detail.quantity}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} sm={2}>
                                        <Typography variant="body2" color="text.secondary">
                                            Đơn giá:
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatCurrency(detail.price || detail.product?.price || 0)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Typography variant="body2" color="text.secondary">
                                            Thành tiền:
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            {formatCurrency((detail.price || detail.product?.price || 0) * detail.quantity)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                {index < order.orderDetails.length - 1 && <Divider sx={{ my: 2 }} />}
                            </Box>
                        ))
                    ) : (
                        <Alert severity="info">
                            Không có thông tin sản phẩm
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default OrderDetails;
