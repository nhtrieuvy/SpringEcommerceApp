import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Grid,
    Paper,
    Button,
    Divider,
    IconButton,
    Avatar,
    TextField,
    Alert,
    Snackbar,
    Breadcrumbs,
    Badge,
    
} from '@mui/material';
import { authApi, endpoint } from '../configs/Apis'; // Import authApi and endpoint
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import StoreIcon from '@mui/icons-material/Store';
import PaymentIcon from '@mui/icons-material/Payment';
import { useAuth } from '../configs/MyContexts';
import '../styles/CartStyles.css';
import ProductRecommendation from './ProductRecommendation';
import { formatCurrency } from '../utils/FormatUtils';
import AsyncPageWrapper from './AsyncPageWrapper';

const Cart = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [discount, setDiscount] = useState(0);

    // Cart API Helper Functions (moved from Apis.js)
    const getCartItems = async () => {
        try {
            const res = await authApi().get(endpoint.GET_CART);
            return res.data;
        } catch (error) {
            console.error('Error fetching cart items:', error);
            throw error;
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            const res = await authApi().put(endpoint.UPDATE_CART_ITEM(productId), {
                quantity: quantity
            });
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            return res.data;
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            throw error;
        }
    };

    const removeFromCart = async (productId) => {
        try {
            await authApi().delete(endpoint.REMOVE_FROM_CART(productId));
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            return true;
        } catch (error) {
            console.error('Error removing item from cart:', error);
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            await authApi().delete(endpoint.CLEAR_CART);
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    };

    const validateCoupon = async (couponCode) => {
        try {
            const res = await authApi().post(endpoint.VALIDATE_COUPON, { code: couponCode }); // Assuming endpoint.VALIDATE_COUPON exists
            return res.data;
        } catch (error) {
            console.error('Error validating coupon:', error);
            throw error;
        }
    };

    // Load cart items using local getCartItems
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        const loadCartItems = async () => {
            try {
                setLoading(true);
                const items = await getCartItems(); // Use local function
                setCartItems(items);
            } catch (error) {
                console.error("Error loading cart items:", error);
                setSnackbar({
                    open: true,
                    message: 'Không thể tải giỏ hàng. Vui lòng thử lại.',
                    severity: 'error'
                });
                setCartItems([]);
            } finally {
                setLoading(false);
            }
        };

        loadCartItems();
        
        // Listen for cart updates
        window.addEventListener('cartUpdated', loadCartItems);
        
        return () => {
            window.removeEventListener('cartUpdated', loadCartItems);
        };
    }, [isAuthenticated, navigate]);    // Calculate subtotal
    const calculateSubtotal = () => {
        if (!cartItems || cartItems.length === 0) {
            return 0;
        }
        return cartItems.reduce((total, item) => {
            // Make sure to prioritize product.price if available, fallback to item.price
            const price = (item.product && item.product.price) || item.price || 0;
            const quantity = item.quantity || 1;
            return total + (price * quantity);
        }, 0);
    };
    
    // Calculate total
    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discountAmount = couponApplied ? subtotal * (discount / 100) : 0;
        return subtotal - discountAmount;
    };    // Update item quantity
    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        
        try {
            const updatedItem = await updateQuantity(itemId, newQuantity); // Use local function
            
            if (updatedItem) {
                setSnackbar({
                    open: true,
                    message: 'Giỏ hàng đã được cập nhật',
                    severity: 'success'
                });
            } else {
                throw new Error("Failed to update cart");
            }
        } catch (error) {
            console.error("Error updating cart item:", error);
            setSnackbar({
                open: true,
                message: 'Không thể cập nhật giỏ hàng',
                severity: 'error'
            });
        }
    };
    
    // Remove item from cart
    const removeItem = async (itemId) => {
        try {
            const success = await removeFromCart(itemId); // Use local function
            
            if (success) {
                setSnackbar({
                    open: true,
                    message: 'Sản phẩm đã được xóa khỏi giỏ hàng',
                    severity: 'success'
                });
            } else {
                throw new Error("Failed to remove item from cart");
            }
        } catch (error) {
            console.error("Error removing cart item:", error);
            setSnackbar({
                open: true,
                message: 'Không thể xóa sản phẩm khỏi giỏ hàng',
                severity: 'error'
            });
        }
    };
    
    // Clear entire cart
    const handleClearCart = async () => {
        try {
            const success = await clearCart(); // Use local function
            
            if (success) {
                setSnackbar({
                    open: true,
                    message: 'Giỏ hàng đã được xóa',
                    severity: 'success'
                });
            } else {
                throw new Error("Failed to clear cart");
            }
        } catch (error) {
            console.error("Error clearing cart:", error);
            setSnackbar({
                open: true,
                message: 'Không thể xóa giỏ hàng',
                severity: 'error'
            });
        }
    };
    
    // Apply coupon code
    const applyCoupon = async () => {
        if (!couponCode.trim()) {
            setSnackbar({
                open: true,
                message: 'Vui lòng nhập mã giảm giá',
                severity: 'warning'
            });
            return;
        }
        
        try {
            const result = await validateCoupon(couponCode); // Use local function
            
            if (result.isValid) {
                // Check if there's a minimum order requirement
                const subtotal = calculateSubtotal();
                if (result.minimumOrder && subtotal < result.minimumOrder) {
                    setSnackbar({
                        open: true,
                        message: `Mã giảm giá chỉ áp dụng cho đơn hàng từ ${formatCurrency(result.minimumOrder)}`,
                        severity: 'warning'
                    });
                    return;
                }
                
                setCouponApplied(true);
                setDiscount(result.discount);
                
                setSnackbar({
                    open: true,
                    message: `Mã giảm giá ${result.discount}% đã được áp dụng`,
                    severity: 'success'
                });
            } else {
                setSnackbar({
                    open: true,
                    message: result.message || 'Mã giảm giá không hợp lệ',
                    severity: 'error'
                });
            }
        } catch (error) {
            console.error("Error applying coupon:", error);
            setSnackbar({
                open: true,
                message: 'Không thể áp dụng mã giảm giá',
                severity: 'error'
            });
        }
    };
    
    // Remove coupon
    const removeCoupon = () => {
        setCouponApplied(false);
        setDiscount(0);
        setCouponCode('');
        setSnackbar({
            open: true,
            message: 'Đã hủy mã giảm giá',
            severity: 'info'
        });
    };
      // Proceed to checkout
    const proceedToCheckout = () => {
        // Pass coupon information to checkout page via navigation state
        const checkoutState = {
            couponApplied,
            discount,
            couponCode: couponApplied ? couponCode : ''
        };
        navigate('/checkout', { state: checkoutState });
    };
    
    // Handle snackbar close
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };
    
    // Render breadcrumbs
    const renderBreadcrumbs = () => (
        <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
            sx={{ mb: 3 }}
        >
            <Typography 
                component={RouterLink} 
                to="/"
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'text.primary',
                    '&:hover': { color: 'primary.main' }
                }}
            >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Trang chủ
            </Typography>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCartIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Giỏ hàng
            </Typography>
        </Breadcrumbs>
    );
    
    // Loading state
    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {renderBreadcrumbs()}
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <Typography>Đang tải giỏ hàng...</Typography>
                </Box>
            </Container>
        );
    }
    
    // Empty cart
    if (cartItems.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {renderBreadcrumbs()}
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 4, 
                        borderRadius: 3, 
                        textAlign: 'center',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
                    }}
                >
                    <ShoppingCartIcon sx={{ fontSize: 80, color: 'action.disabled', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>Giỏ hàng của bạn đang trống</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Bạn chưa thêm sản phẩm nào vào giỏ hàng.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        component={RouterLink}
                        to="/"
                        startIcon={<ArrowBackIcon />}
                        sx={{ 
                            py: 1.5, 
                            px: 3, 
                            borderRadius: 2,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                    >
                        Tiếp tục mua sắm
                    </Button>
                </Paper>
            </Container>
        );    }
    
    return (
        <AsyncPageWrapper isLoading={loading}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            {renderBreadcrumbs()}
            
            {/* Main Content */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <ShoppingCartIcon sx={{ mr: 1.5, fontSize: 32 }} />
                    Giỏ hàng của bạn
                    <Badge badgeContent={cartItems.length} color="primary" sx={{ ml: 2 }} />
                </Typography>
                
                <Typography variant="body1" color="text.secondary">
                    Bạn có {cartItems.length} sản phẩm trong giỏ hàng.
                </Typography>
            </Box>
            
            {/* Cart Layout */}
            <Grid container spacing={4}>
                {/* Cart Items */}
                <Grid item xs={12} md={8}>
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            borderRadius: 3, 
                            overflow: 'hidden',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                            mb: { xs: 3, md: 0 }
                        }}
                    >
                        <Box sx={{ 
                            p: 2, 
                            bgcolor: 'primary.light', 
                            color: 'white',
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12
                        }}>
                            <Typography variant="h6">Sản phẩm trong giỏ hàng</Typography>
                        </Box>
                        
                        <Box sx={{ p: 0 }}>
                            {cartItems.map((item, index) => (
                                <Box key={item.product.id}>
                                    <Box sx={{ p: 3, display: 'flex', position: 'relative' }}>
                                        {/* Product Image */}
                                        <Box 
                                            component={RouterLink}
                                            to={`/products/${item.product.id}`}
                                            sx={{ 
                                                width: 80, 
                                                height: 80, 
                                                flexShrink: 0,
                                                border: '1px solid rgba(0,0,0,0.1)',
                                                borderRadius: 2,
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <Avatar 
                                                variant="square"
                                                src={item.product.image || "https://via.placeholder.com/80"}
                                                alt={item.product.name}
                                                sx={{ width: '100%', height: '100%' }}
                                            />
                                        </Box>
                                        
                                        {/* Product Details */}
                                        <Box sx={{ ml: 2, flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Typography 
                                                    variant="subtitle1" 
                                                    component={RouterLink}
                                                    to={`/products/${item.product.id}`}
                                                    sx={{ 
                                                        fontWeight: 'medium',
                                                        color: 'text.primary',
                                                        textDecoration: 'none',
                                                        '&:hover': { color: 'primary.main' }
                                                    }}
                                                >
                                                    {item.product.name}
                                                </Typography>
                                                  <IconButton 
                                                    size="small" 
                                                    color="error"
                                                    onClick={() => removeItem(item.product.id)}
                                                    sx={{ ml: 1 }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                            
                                            {item.store && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                    <StoreIcon fontSize="small" sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.store}
                                                    </Typography>
                                                </Box>
                                            )}
                                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>                                                <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                                                    {formatCurrency((item.product && item.product.price) || item.price || 0)}
                                                </Typography>
                                                
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>                                                <IconButton 
                                                        size="small"
                                                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        sx={{ 
                                                            border: '1px solid rgba(0,0,0,0.1)',
                                                            borderRadius: 1
                                                        }}
                                                    >
                                                        <RemoveIcon fontSize="small" />
                                                    </IconButton>
                                                    
                                                    <Typography variant="body1" sx={{ mx: 2, minWidth: 20, textAlign: 'center' }}>
                                                        {item.quantity}
                                                    </Typography>
                                                    
                                                    <IconButton 
                                                        size="small"
                                                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                                                        sx={{ 
                                                            border: '1px solid rgba(0,0,0,0.1)',
                                                            borderRadius: 1
                                                        }}
                                                    >
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                    
                                    {index < cartItems.length - 1 && <Divider />}
                                </Box>
                            ))}
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                component={RouterLink}
                                to="/"
                                sx={{ borderRadius: 2 }}
                            >
                                Tiếp tục mua sắm
                            </Button>
                            
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleClearCart}
                                sx={{ borderRadius: 2 }}
                            >
                                Xóa giỏ hàng
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
                
                {/* Order Summary */}
                <Grid item xs={12} md={4}>
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            borderRadius: 3, 
                            overflow: 'hidden',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                            position: 'sticky',
                            top: 24
                        }}
                    >
                        <Box sx={{ 
                            p: 2, 
                            bgcolor: 'primary.light', 
                            color: 'white',
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12
                        }}>
                            <Typography variant="h6">Tóm tắt đơn hàng</Typography>
                        </Box>
                        
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body1">Tạm tính ({cartItems.length} sản phẩm):</Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {formatCurrency(calculateSubtotal())}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="body1">Phí vận chuyển:</Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {formatCurrency(0)} <Typography component="span" variant="body2" color="success.main">(Miễn phí)</Typography>
                                </Typography>
                            </Box>
                            
                            {couponApplied && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="body1">Giảm giá ({discount}%):</Typography>
                                    <Typography variant="body1" fontWeight="medium" color="error.main">
                                        -{formatCurrency(calculateSubtotal() * (discount / 100))}
                                    </Typography>
                                </Box>
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6">Tổng cộng:</Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary.main">
                                    {formatCurrency(calculateTotal())}
                                </Typography>
                            </Box>
                            
                            {!couponApplied ? (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" gutterBottom>Mã giảm giá</Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            placeholder="Nhập mã giảm giá"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            sx={{ 
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2
                                                }
                                            }}
                                        />
                                        <Button 
                                            variant="outlined" 
                                            onClick={applyCoupon}
                                            disabled={!couponCode}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Áp dụng
                                        </Button>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        * Thử dùng mã SALE10 hoặc SALE20 để kiểm tra tính năng giảm giá
                                    </Typography>
                                </Box>
                            ) : (
                                <Box sx={{ mb: 3 }}>
                                    <Alert 
                                        severity="success"
                                        action={
                                            <IconButton
                                                aria-label="close"
                                                color="inherit"
                                                size="small"
                                                onClick={removeCoupon}
                                            >
                                                <DeleteIcon fontSize="inherit" />
                                            </IconButton>
                                        }
                                        sx={{ mb: 2, borderRadius: 2 }}
                                    >
                                        Mã giảm giá {discount}% đã được áp dụng
                                    </Alert>
                                </Box>
                            )}
                            
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="large"
                                startIcon={<PaymentIcon />}
                                onClick={proceedToCheckout}
                                sx={{ 
                                    py: 1.5, 
                                    borderRadius: 2,
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                }}
                            >
                                Tiến hành thanh toán
                            </Button>
                            
                            <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LocalShippingIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="body2" color="text.secondary">
                                    Miễn phí vận chuyển cho đơn hàng từ {formatCurrency(200000)}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Product Recommendations */}
            <ProductRecommendation 
                cartItems={cartItems} 
                addToCartCallback={(product) => {
                    setSnackbar({
                        open: true,
                        message: `Đã thêm ${product.name} vào giỏ hàng`,
                        severity: 'success'
                    });
                }} 
            />
            
            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>            </Snackbar>
        </Container>
        </AsyncPageWrapper>
    );
};

export default Cart;
