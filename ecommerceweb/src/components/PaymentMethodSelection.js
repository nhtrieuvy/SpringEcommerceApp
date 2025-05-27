import React from 'react';
import {
    Box,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Paper,
    Alert,
    Avatar,
    useTheme
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentsIcon from '@mui/icons-material/Payments';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';

const PaymentMethodSelection = ({ onPaymentMethodChange, selectedPaymentMethod }) => {
    const theme = useTheme();

    // Handle payment method change
    const handleChange = (event) => {
        const method = event.target.value;
        onPaymentMethodChange(method);
    };

    return (
        <Box sx={{ mt: 3 }}>
            <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
                    Chọn phương thức thanh toán
                </FormLabel>
                <RadioGroup 
                    name="payment-method" 
                    value={selectedPaymentMethod} 
                    onChange={handleChange}
                >                    {[
                        {
                            id: 'cod',
                            name: 'Thanh toán khi nhận hàng (COD)',
                            description: 'Thanh toán bằng tiền mặt khi nhận hàng',
                            icon: <LocalShippingIcon />
                        },
                        {
                            id: 'paypal',
                            name: 'PayPal',
                            description: 'Thanh toán an toàn qua PayPal',
                            icon: <PaymentsIcon />
                        },
                        {
                            id: 'momo',
                            name: 'MoMo',
                            description: 'Thanh toán qua ví điện tử MoMo',
                            icon: <PhoneAndroidIcon />
                        },
                        {
                            id: 'card',
                            name: 'Thẻ tín dụng/Ghi nợ',
                            description: 'Hỗ trợ Visa, Mastercard, JCB',
                            icon: <CreditCardIcon />
                        },
                        {
                            id: 'banking',
                            name: 'Chuyển khoản ngân hàng',
                            description: 'Chuyển khoản qua ngân hàng hoặc ứng dụng ngân hàng',
                            icon: <AccountBalanceIcon />
                        }
                    ].map((method) => (
                        <Paper
                            key={method.id}
                            elevation={selectedPaymentMethod === method.id ? 2 : 0}
                            sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 2,
                                border: `1px solid ${
                                    selectedPaymentMethod === method.id
                                        ? theme.palette.primary.main
                                        : "rgba(0,0,0,0.1)"
                                }`,
                                bgcolor:
                                    selectedPaymentMethod === method.id
                                        ? "rgba(25, 118, 210, 0.05)"
                                        : "transparent",
                            }}
                        >
                            <FormControlLabel
                                value={method.id}
                                control={<Radio color="primary" />}
                                label={
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <Avatar
                                            sx={{
                                                mr: 2,                                                bgcolor: method.id === 'cod' 
                                                    ? 'primary.light' 
                                                    : method.id === 'paypal' 
                                                        ? 'info.light' 
                                                        : method.id === 'momo'
                                                            ? 'warning.light'
                                                            : method.id === 'card' 
                                                                ? 'secondary.light' 
                                                                : 'success.light',
                                                width: 40,
                                                height: 40,
                                            }}
                                        >
                                            {method.icon}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle1">
                                                {method.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {method.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                }
                                sx={{ width: "100%", m: 0 }}
                            />
                        </Paper>
                    ))}
                </RadioGroup>
            </FormControl>            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="body2">
                    PayPal và MoMo đã được tích hợp. Các phương thức thanh toán khác (thẻ tín dụng, ngân hàng) 
                    hiện tại chỉ là demo và sẽ được xử lý dưới dạng COD.
                </Typography>
            </Alert>
        </Box>
    );
};

export default PaymentMethodSelection;
