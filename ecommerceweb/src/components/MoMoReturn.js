import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Button,
    Divider,
    Grid,
    Chip,
    Avatar
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Receipt as ReceiptIcon,
    Home as HomeIcon,
    ShoppingBag as ShoppingBagIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

const MoMoReturn = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [paymentResult, setPaymentResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Lấy các tham số từ URL
        const status = searchParams.get('status');
        const orderNumber = searchParams.get('orderNumber');
        const transactionId = searchParams.get('transactionId');
        const message = searchParams.get('message');
        const errorDetail = searchParams.get('errorDetail');
        const resultCode = searchParams.get('resultCode');
        const paymentUpdated = searchParams.get('paymentUpdated');

        // Thiết lập kết quả thanh toán
        const result = {
            status,
            orderNumber,
            transactionId,
            message: decodeURIComponent(message || ''),
            errorDetail: errorDetail ? decodeURIComponent(errorDetail) : null,
            resultCode,
            paymentUpdated: paymentUpdated === 'true'
        };        setPaymentResult(result);
        setLoading(false);
    }, [searchParams, navigate]);

    const handleGoToOrders = () => {
        navigate('/orders');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleViewOrderDetails = () => {
        if (paymentResult.orderNumber) {
            navigate(`/orders/${paymentResult.orderNumber}`);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <CircularProgress size={60} />
                    <Typography variant="h6">Đang xử lý kết quả thanh toán...</Typography>
                </Box>
            </Container>
        );
    }

    if (!paymentResult) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">
                    Không tìm thấy thông tin kết quả thanh toán.
                </Alert>
                <Box sx={{ mt: 3 }}>
                    <Button variant="contained" onClick={handleGoHome}>
                        Về trang chủ
                    </Button>
                </Box>
            </Container>
        );
    }

    const isSuccess = paymentResult.status === 'success';

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                {/* Header với icon và tiêu đề */}
                <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            mb: 2,
                            bgcolor: isSuccess ? 'success.main' : 'error.main'
                        }}
                    >
                        {isSuccess ? <CheckCircleIcon sx={{ fontSize: 40 }} /> : <ErrorIcon sx={{ fontSize: 40 }} />}
                    </Avatar>
                    
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                    </Typography>
                    
                    <Typography variant="h6" color="text.secondary" align="center">
                        {paymentResult.message}
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Thông tin chi tiết */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReceiptIcon />
                            Thông tin thanh toán
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {paymentResult.orderNumber && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Số đơn hàng:
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        #{paymentResult.orderNumber}
                                    </Typography>
                                </Grid>
                            )}
                            
                            {paymentResult.transactionId && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        Mã giao dịch:
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {paymentResult.transactionId}
                                    </Typography>
                                </Grid>
                            )}
                            
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Phương thức thanh toán:
                                </Typography>
                                <Chip 
                                    label="MoMo" 
                                    color="primary" 
                                    size="small" 
                                    sx={{ mt: 0.5 }}
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Trạng thái:
                                </Typography>
                                <Chip 
                                    label={isSuccess ? 'Thành công' : 'Thất bại'}
                                    color={isSuccess ? 'success' : 'error'}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                />
                            </Grid>
                            
                            {paymentResult.resultCode && (
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary">
                                        Mã kết quả:
                                    </Typography>
                                    <Typography variant="body1">
                                        {paymentResult.resultCode}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>

                {/* Thông báo lỗi chi tiết nếu có */}
                {!isSuccess && paymentResult.errorDetail && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            <strong>Chi tiết lỗi:</strong> {paymentResult.errorDetail}
                        </Typography>
                    </Alert>
                )}

                {/* Thông báo thành công */}
                {isSuccess && (
                    <Alert severity="success" sx={{ mb: 3 }}>                        <Typography variant="body2">
                            Đơn hàng của bạn đã được thanh toán thành công. 
                            {paymentResult.paymentUpdated && ' Trạng thái đơn hàng đã được cập nhật.'}
                        </Typography>
                    </Alert>
                )}

                {/* Các nút hành động */}
                <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                    {isSuccess && paymentResult.orderNumber && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleViewOrderDetails}
                            startIcon={<ReceiptIcon />}
                            size="large"
                        >
                            Xem chi tiết đơn hàng
                        </Button>
                    )}
                    
                    <Button
                        variant="outlined"
                        onClick={handleGoToOrders}
                        startIcon={<ShoppingBagIcon />}
                        size="large"
                    >
                        Danh sách đơn hàng
                    </Button>
                    
                    <Button
                        variant="outlined"
                        onClick={handleGoHome}
                        startIcon={<HomeIcon />}
                        size="large"
                    >
                        Về trang chủ
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default MoMoReturn;
