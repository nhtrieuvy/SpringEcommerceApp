import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { authApi, endpoint } from '../configs/Apis';

const MoMoReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    const handleMoMoReturn = async () => {
      try {
        // Get parameters from URL
        const params = Object.fromEntries(searchParams.entries());
        
        console.log('MoMo return parameters:', params);

        // Verify payment with backend
        const response = await authApi().post(endpoint.MOMO_RETURN, params);

        if (response.data.success) {
          setStatus('success');
          setMessage('Thanh toán MoMo thành công!');
          setOrderNumber(response.data.orderNumber || params.orderId);
          
          // Dispatch cart update event to refresh cart
          window.dispatchEvent(new CustomEvent('cartUpdated'));        } else {
          setStatus('error');
          // Show more detailed error messages from MoMo if available
          if (response.data.resultCode) {
            setMessage(`${response.data.message || 'Thanh toán thất bại'} (Mã lỗi: ${response.data.resultCode})`);
          } else {
            setMessage(response.data.message || 'Thanh toán thất bại');
          }
        }
      } catch (error) {
        console.error('Error processing MoMo return:', error);
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Có lỗi xảy ra khi xử lý thanh toán'
        );
      }
    };

    handleMoMoReturn();
  }, [searchParams]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  if (status === 'processing') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <CircularProgress size={60} sx={{ mb: 3, color: 'primary.main' }} />
          <Typography variant="h5" gutterBottom>
            Đang xử lý thanh toán...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vui lòng đợi trong giây lát
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
        {status === 'success' ? (
          <>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
              Thanh toán thành công!
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              {message}
            </Typography>
            {orderNumber && (
              <Box sx={{ 
                bgcolor: 'success.light', 
                p: 2, 
                borderRadius: 2, 
                mb: 3,
                color: 'white'
              }}>
                <Typography variant="body1">
                  Mã đơn hàng: <strong>{orderNumber}</strong>
                </Typography>
              </Box>
            )}
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body2">
                Đơn hàng của bạn đã được xác nhận và sẽ được xử lý trong thời gian sớm nhất.
              </Typography>
            </Alert>
          </>
        ) : (
          <>
            <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
              Thanh toán thất bại
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body2">
                Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
              </Typography>
            </Alert>
          </>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleContinueShopping}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Tiếp tục mua sắm
          </Button>
          {status === 'success' && (
            <Button
              variant="contained"
              onClick={handleViewOrders}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Xem đơn hàng
            </Button>
          )}
          {status === 'error' && (
            <Button
              variant="contained"
              onClick={() => navigate('/checkout')}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Thử lại
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default MoMoReturn;
