import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Paper,
    Skeleton,
    Alert,
    Grid,
    Chip
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';

// Import API related functions
import { authApi, endpoint } from '../configs/Apis';
import { formatCurrency } from '../utils/FormatUtils';

const ShippingMethodSelection = ({ onShippingMethodChange, subtotal }) => {
    const [shippingMethods, setShippingMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);    // Fetch shipping methods only once when component mounts
    useEffect(() => {
        const fetchShippingMethods = async () => {
            try {
                setLoading(true);
                const response = await authApi().get(endpoint.SHIPPING_METHODS);
                const methods = response.data;
                setShippingMethods(methods);
                setError(null);
            } catch (err) {
                console.error("Error fetching shipping methods:", err);
                setError("Không thể tải phương thức vận chuyển. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchShippingMethods();
    }, []); // Empty dependency array - only run once

    // Separate effect to handle default selection when shipping methods or subtotal changes
    useEffect(() => {
        if (shippingMethods.length > 0) {
            // Filter eligible shipping methods based on subtotal
            const eligibleMethods = shippingMethods.filter(method => 
                !method.minimumOrder || subtotal >= method.minimumOrder
            );
            
            // Set default shipping method only if no method is selected or current method is not eligible
            if (eligibleMethods.length > 0) {
                const currentMethod = shippingMethods.find(method => method.id === selectedMethod);
                const isCurrentMethodEligible = currentMethod && eligibleMethods.includes(currentMethod);
                
                if (!selectedMethod || !isCurrentMethodEligible) {
                    setSelectedMethod(eligibleMethods[0].id);
                    onShippingMethodChange(eligibleMethods[0]);
                }
            }
        }
    }, [shippingMethods, subtotal, selectedMethod]); // Remove onShippingMethodChange from dependencies

    const handleChange = (event) => {
        const methodId = event.target.value;
        setSelectedMethod(methodId);
        
        const selectedShippingMethod = shippingMethods.find(method => method.id === methodId);
        onShippingMethodChange(selectedShippingMethod);
    };
    
    // Get shipping method icon based on id
    const getShippingIcon = (methodId) => {
        switch (methodId) {
            case 'express':
                return <FlashOnIcon color="error" />;
            case 'free':
                return <FreeBreakfastIcon color="success" />;
            default:
                return <LocalShippingIcon color="primary" />;
        }
    };

    if (loading) {
        return (
            <Box sx={{ mt: 3 }}>
                <Skeleton variant="rectangular" height={40} width="50%" sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={60} />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>;
    }

    // Filter eligible shipping methods based on subtotal
    const eligibleMethods = shippingMethods.filter(method => 
        !method.minimumOrder || subtotal >= method.minimumOrder
    );
    
    // Show message if no eligible shipping methods
    if (eligibleMethods.length === 0) {
        return (
            <Alert severity="info" sx={{ mt: 3 }}>
                Không có phương thức vận chuyển khả dụng. Vui lòng tăng giá trị đơn hàng.
            </Alert>
        );
    }

    return (
        <Box sx={{ mt: 3 }}>
            <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
                    Phương thức vận chuyển
                </FormLabel>
                <RadioGroup 
                    name="shipping-method" 
                    value={selectedMethod} 
                    onChange={handleChange}
                >                    {eligibleMethods.map((method) => {
                        return (
                            <Paper
                                key={method.id}
                                elevation={0}
                                sx={{
                                    mb: 2,
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: selectedMethod === method.id 
                                        ? 'primary.main' 
                                        : 'divider',
                                    borderRadius: 2,
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                    }
                                }}
                            >
                                <FormControlLabel
                                    value={method.id}
                                    control={<Radio />}
                                    label={
                                        <Grid container alignItems="center" spacing={1}>
                                            <Grid item>{getShippingIcon(method.id)}</Grid>
                                            <Grid item xs>
                                                <Typography variant="subtitle1" fontWeight="medium">
                                                    {method.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Thời gian giao hàng dự kiến: {method.estimatedDelivery}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                                    {method.price === 0 
                                                        ? 'Miễn phí' 
                                                        : formatCurrency(method.price)
                                                    }
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    }
                                    sx={{ 
                                        margin: 0, 
                                        width: '100%',
                                        '& .MuiFormControlLabel-label': {
                                            width: '100%'
                                        }
                                    }}
                                />
                                
                                {method.minimumOrder && (
                                    <Chip 
                                        label={`Đơn tối thiểu ${formatCurrency(method.minimumOrder)}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ 
                                            position: 'absolute',
                                            top: 8,
                                            right: 8
                                        }}
                                    />
                                )}
                            </Paper>
                        );
                    })}
                </RadioGroup>
            </FormControl>
        </Box>
    );
};

export default ShippingMethodSelection;
