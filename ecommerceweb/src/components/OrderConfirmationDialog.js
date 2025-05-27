import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';

const OrderConfirmationDialog = ({ open, onClose, orderData }) => {
    const navigate = useNavigate();
    const [emailSent, setEmailSent] = useState(false);
    const [emailSending, setEmailSending] = useState(false);

    React.useEffect(() => {
        if (open && orderData) {
            // Simulate email sending process
            setEmailSending(true);
            setTimeout(() => {
                setEmailSending(false);
                setEmailSent(true);
            }, 2000);
        }
    }, [open, orderData]);

    const handleClose = () => {
        setEmailSent(false);
        setEmailSending(false);
        onClose();
    };

    if (!orderData) return null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
                    <Typography variant="h6">Đặt hàng thành công!</Typography>
                </Box>
            </DialogTitle>
            
            <DialogContent>
                <Box sx={{ py: 2 }}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Đơn hàng #{orderData.id} đã được tạo thành công!
                    </Alert>
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
                    </Typography>

                    <Box 
                        sx={{ 
                            p: 2, 
                            bgcolor: 'grey.50', 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200'
                        }}
                    >
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                            Thông tin đơn hàng:
                        </Typography>
                        <Typography variant="body2">
                            <strong>Mã đơn hàng:</strong> #{orderData.id}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Trạng thái:</strong> {orderData.status === 'PENDING' ? 'Chờ xử lý' : orderData.status}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Ngày đặt:</strong> {new Date().toLocaleString('vi-VN')}
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon color="primary" />
                        {emailSending ? (
                            <Box display="flex" alignItems="center" gap={1}>
                                <CircularProgress size={16} />
                                <Typography variant="body2" color="text.secondary">
                                    Đang gửi email xác nhận...
                                </Typography>
                            </Box>
                        ) : emailSent ? (
                            <Typography variant="body2" color="success.main">
                                ✓ Email xác nhận đã được gửi đến địa chỉ email của bạn
                            </Typography>
                        ) : (
                            <Typography variant="body2" color="text.secondary">
                                Email xác nhận sẽ được gửi đến bạn
                            </Typography>
                        )}
                    </Box>

                    <Alert severity="info" sx={{ mt: 2 }}>
                        Bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi" hoặc qua email xác nhận.
                    </Alert>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={handleClose} variant="outlined">
                    Đóng
                </Button>                <Button 
                    onClick={() => {
                        handleClose();
                        navigate('/orders');
                    }} 
                    variant="contained"
                >
                    Xem đơn hàng
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrderConfirmationDialog;
