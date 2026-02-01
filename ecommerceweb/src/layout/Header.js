import React, { useContext, useState, useEffect, useRef, Fragment } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Container,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme,
    Avatar,
    Tooltip,
    Badge,
    Slide,
    List,    
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondaryAction,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InsightsIcon from '@mui/icons-material/Insights';
import DeleteIcon from '@mui/icons-material/Delete';
import { endpoint, authApi } from '../configs/Apis';
import { MyUserContext } from '../configs/MyContexts';
import '../styles/CartStyles.css';
import { formatCurrency } from '../utils/FormatUtils';
import ChatNotifications from '../components/ChatNotifications';

// Định nghĩa các hàm API trực tiếp trong component
const getCartItems = async () => {
    try {
        const res = await authApi().get(endpoint.GET_CART);
        return res.data;
    } catch (error) {
        console.error('Error fetching cart items:', error);
        throw error;
    }
};

const removeFromCart = async (productId) => {
    try {
        await authApi().delete(endpoint.REMOVE_FROM_CART(productId));
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
        return true;
    } catch (error) {
        console.error('Error removing item from cart:', error);
        throw error;
    }
};

const getWishlistItems = async () => {
    try {
        const res = await authApi().get(endpoint.GET_WISHLIST);
        return res.data;
    } catch (error) {
        console.error('Error fetching wishlist items:', error);
        throw error;
    }
};

const Header = () => {
    const [user, dispatch] = useContext(MyUserContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const [cartMenuAnchor, setCartMenuAnchor] = useState(null);    
    const [scrolled, setScrolled] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();    
    const cartIconRef = useRef(null);
    
    // Theo dõi scroll để thay đổi kiểu header
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);    

    // Load cart items using direct API function instead of CartService
    useEffect(() => {
        const loadCartItems = async () => {
            try {
                if (user) {
                    // Use direct API function
                    const items = await getCartItems();
                    setCartItems(items);
                    
                    // Calculate total quantity
                    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
                    setCartItemCount(totalItems);
                } else {
                    setCartItems([]);
                    setCartItemCount(0);
                }
            } catch (error) {
                console.error("Error loading cart items:", error);
                setCartItems([]);
                setCartItemCount(0);
            }
        };

        loadCartItems();
        
        // Listen for cart updates
        window.addEventListener('cartUpdated', loadCartItems);
        
        return () => {
            window.removeEventListener('cartUpdated', loadCartItems);
        };
    }, [user]);

    // Load wishlist count using direct API function instead of WishlistService
    useEffect(() => {
        const loadWishlistCount = async () => {
            try {
                if (user) {
                    // Use direct API function to get wishlist items and count them
                    const items = await getWishlistItems();
                    setWishlistCount(items.length);
                } else {
                    setWishlistCount(0);
                }
            } catch (error) {
                console.error("Error loading wishlist count:", error);
                setWishlistCount(0);
            }
        };
        
        loadWishlistCount();
        
        // Listen for wishlist updates
        window.addEventListener('wishlistUpdated', loadWishlistCount);
        
        return () => {
            window.removeEventListener('wishlistUpdated', loadWishlistCount);
        };
    }, [user]);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleUserMenu = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: "LOGOUT" });
        handleUserMenuClose();
        navigate('/');
    };

    // Giỏ hàng
    const handleCartMenu = (event) => {
        setCartMenuAnchor(event.currentTarget);
    };
    
    const handleCartMenuClose = () => {
        setCartMenuAnchor(null);
    };
    
    const handleRemoveFromCart = async (itemId) => {
        try {
            // Use direct API function instead of CartService
            await removeFromCart(itemId);
            // The cartUpdated event will be dispatched by the API function,
            // which will trigger our cart loader useEffect
        } catch (error) {
            console.error("Error removing item from cart:", error);
        }
    };
      const handleViewCart = () => {
        handleCartMenuClose();
        navigate('/cart');
    };
    
    const handleCheckout = () => {
        handleCartMenuClose();
        navigate('/checkout');
    };
    
    // Tính tổng giá trị giỏ hàng
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            // Handle both API response structure and localStorage structure
            const price = item.product ? item.product.price : item.price;
            return total + (price * item.quantity);
        }, 0);
    };
      return (
        <Slide appear={false} direction="down" in={!scrolled}>
            <AppBar
                position="sticky"
                className="app-header"
                elevation={scrolled ? 4 : 0}
                sx={{
                    background: scrolled ? 'var(--primary-gradient)' : '#fff',
                    color: scrolled ? '#fff' : 'var(--text-primary)',
                    transition: 'all 0.3s ease-in-out',
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar sx={{ py: 1 }}>
                        {/* Logo */}
                        <Typography
                            variant="h5"
                            component={RouterLink}
                            to="/"
                            sx={{
                                flexGrow: { xs: 1, md: 0 },
                                fontWeight: 'bold',
                                mr: 3,
                                textDecoration: 'none',
                                color: 'inherit',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'scale(1.05)'
                                }
                            }}
                        >
                            <ShoppingBasketIcon
                                sx={{
                                    fontSize: 32,
                                    color: scrolled ? 'inherit' : 'var(--primary-main)'
                                }}
                            />
                            <span className="fade-in">E-commerce Store</span>
                        </Typography>

                        {isMobile ? (
                            <Fragment>                                {/* Mobile menu */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>                                    {user && (
                                        <Fragment>                                            <Tooltip title="Danh sách yêu thích">
                                                <IconButton 
                                                    color="inherit" 
                                                    component={RouterLink} 
                                                    to="/wishlist"
                                                    className="wishlist-icon-wrapper"
                                                >
                                                    <Badge 
                                                        badgeContent={wishlistCount} 
                                                        color="error"
                                                        className={wishlistCount > 0 ? "quantity-badge-updated" : ""}
                                                    >
                                                        <FavoriteIcon />
                                                    </Badge>
                                                </IconButton>
                                            </Tooltip>                                            {/* Chat Notifications */}
                                            <ChatNotifications />
                                            <Tooltip title="Giỏ hàng">
                                                <IconButton color="inherit" onClick={handleCartMenu} className="cart-icon-wrapper">
                                                    <Badge 
                                                        badgeContent={cartItemCount} 
                                                        color="error"
                                                        className={cartItemCount > 0 ? "quantity-badge-updated" : ""}
                                                    >
                                                        <ShoppingCartIcon ref={cartIconRef} />
                                                    </Badge>
                                                </IconButton>
                                            </Tooltip>                                        </Fragment>
                                    )}
                                    <IconButton
                                        size="large"
                                        edge="end"
                                        color="inherit"
                                        aria-label="menu"
                                        onClick={handleMenu}
                                        className="hover-scale"
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                </Box>
                                <Menu
                                    id="menu-appbar"
                                    anchorEl={anchorEl}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem
                                        component={RouterLink}
                                        to="/"
                                        onClick={handleClose}
                                        sx={{
                                            gap: 1,
                                            color: location.pathname === '/' ? 'var(--primary-main)' : 'inherit',
                                            fontWeight: location.pathname === '/' ? 600 : 400
                                        }}
                                    >                                        <HomeIcon fontSize="small" />
                                        Trang chủ
                                    </MenuItem>

                                    
                                    {user ? (                                        // Menu items khi đã đăng nhập
                                        <Fragment>
                                            <MenuItem
                                                component={RouterLink}
                                                to="/profile"
                                                onClick={handleClose}
                                                sx={{ 
                                                    gap: 1,
                                                    color: location.pathname === '/profile' ? 'var(--primary-main)' : 'inherit',
                                                    fontWeight: location.pathname === '/profile' ? 600 : 400
                                                }}
                                            >                                                <AccountCircleIcon fontSize="small" />
                                                Tài khoản
                                            </MenuItem>                                            {user && user.roles && user.roles.some(role => role.name === 'SELLER') && (
                                                <Fragment>
                                                    <MenuItem 
                                                        component={RouterLink}
                                                        to="/seller/dashboard"
                                                        onClick={handleClose}
                                                        sx={{ 
                                                            gap: 1,
                                                            color: location.pathname === '/seller/dashboard' ? 'var(--primary-main)' : 'inherit',
                                                            fontWeight: location.pathname === '/seller/dashboard' ? 600 : 400
                                                        }}
                                                    >
                                                        <StorefrontIcon fontSize="small" />
                                                        Bảng điều khiển người bán
                                                    </MenuItem>
                                                    <MenuItem 
                                                        component={RouterLink}
                                                        to="/seller/stores"
                                                        onClick={handleClose}
                                                        sx={{ 
                                                            gap: 1,
                                                            color: location.pathname === '/seller/stores' ? 'var(--primary-main)' : 'inherit',
                                                            fontWeight: location.pathname === '/seller/stores' ? 600 : 400
                                                        }}
                                                    >
                                                        <StorefrontIcon fontSize="small" />
                                                        Quản lý cửa hàng
                                                    </MenuItem>
                                                    <MenuItem 
                                                        component={RouterLink}
                                                        to="/seller/products"
                                                        onClick={handleClose}
                                                        sx={{ 
                                                            gap: 1,
                                                            color: location.pathname === '/seller/products' ? 'var(--primary-main)' : 'inherit',
                                                            fontWeight: location.pathname === '/seller/products' ? 600 : 400
                                                        }}                                                    >                                                        <ShoppingBasketIcon fontSize="small" />
                                                        Quản lý sản phẩm
                                                    </MenuItem>                                                    <MenuItem 
                                                        component={RouterLink}
                                                        to="/seller/orders"
                                                        onClick={handleClose}
                                                        sx={{ 
                                                            gap: 1,
                                                            color: location.pathname === '/seller/orders' ? 'var(--primary-main)' : 'inherit',
                                                            fontWeight: location.pathname === '/seller/orders' ? 600 : 400
                                                        }}
                                                    >
                                                        <LocalShippingIcon fontSize="small" />
                                                        Quản lý đơn hàng
                                                    </MenuItem>
                                                    <MenuItem 
                                                        component={RouterLink}
                                                        to="/seller/statistics"
                                                        onClick={handleClose}
                                                        sx={{ 
                                                            gap: 1,
                                                            color: location.pathname === '/seller/statistics' ? 'var(--primary-main)' : 'inherit',
                                                            fontWeight: location.pathname === '/seller/statistics' ? 600 : 400
                                                        }}
                                                    >
                                                        <InsightsIcon fontSize="small" />
                                                        Thống kê
                                                    </MenuItem>
                                                </Fragment>
                                            )}

                                            {user && user.roles && user.roles.some(role => role.name === 'ADMIN' || role.name === 'STAFF') && (
                                                <MenuItem
                                                    component={RouterLink}
                                                    to="/admin"
                                                    onClick={handleClose}
                                                    sx={{
                                                        gap: 1,
                                                        color: location.pathname === '/admin' ? 'var(--primary-main)' : 'inherit',
                                                        fontWeight: location.pathname === '/admin' ? 600 : 400
                                                    }}
                                                >
                                                    <AdminPanelSettingsIcon fontSize="small" />
                                                    Quản trị
                                                </MenuItem>
                                            )}
                                            <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
                                                <LogoutIcon fontSize="small" />
                                                Đăng xuất                                            </MenuItem>
                                        </Fragment>
                                    ) : (                                        // Menu items khi chưa đăng nhập
                                        <Fragment>
                                            <MenuItem
                                                component={RouterLink}
                                                to="/login"
                                                onClick={handleClose}
                                                sx={{
                                                    gap: 1,
                                                    color: location.pathname === '/login' ? 'var(--primary-main)' : 'inherit',
                                                    fontWeight: location.pathname === '/login' ? 600 : 400
                                                }}
                                            >
                                                <LoginIcon fontSize="small" />
                                                Đăng nhập
                                            </MenuItem>
                                            <MenuItem
                                                component={RouterLink}
                                                to="/register"
                                                onClick={handleClose}
                                                sx={{
                                                    gap: 1,
                                                    color: location.pathname === '/register' ? 'var(--primary-main)' : 'inherit',
                                                    fontWeight: location.pathname === '/register' ? 600 : 400
                                                }}
                                            >
                                                <HowToRegIcon fontSize="small" />
                                                Đăng ký
                                            </MenuItem>
                                        </Fragment>
                                    )}                                </Menu>
                            </Fragment>
                        ) : (
                            // Desktop menu
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 'auto' }}>
                                <Button
                                    className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                                    component={RouterLink}
                                    to="/"
                                    startIcon={<HomeIcon />}
                                    sx={{
                                        color: scrolled ? 'white' : (location.pathname === '/' ? 'var(--primary-main)' : 'var(--text-primary)'),
                                        fontWeight: location.pathname === '/' ? 600 : 500
                                    }}
                                >
                                    Trang chủ
                                </Button>
                                  {user ? (
                                    <Fragment>                                        {/* Nút wishlist */}
                                        <Tooltip title="Danh sách yêu thích">
                                            <IconButton 
                                                component={RouterLink} 
                                                to="/wishlist"
                                                className="hover-scale wishlist-icon-wrapper"
                                            >
                                                <Badge 
                                                    badgeContent={wishlistCount} 
                                                    color="error"
                                                    className={wishlistCount > 0 ? "quantity-badge-updated" : ""}
                                                >
                                                    <FavoriteIcon sx={{ color: scrolled ? 'white' : '#f44336' }} />
                                                </Badge>
                                            </IconButton>
                                        </Tooltip>                                        {/* Chat Notifications */}
                                        <ChatNotifications />
                                          {/* Nút giỏ hàng */}                                        <Tooltip title="Giỏ hàng">
                                            <IconButton className="hover-scale cart-icon-wrapper" onClick={handleCartMenu}>
                                                <Badge 
                                                    badgeContent={cartItemCount} 
                                                    color="error"
                                                    className={cartItemCount > 0 ? "quantity-badge-updated" : ""}
                                                >
                                                    <ShoppingCartIcon 
                                                        ref={cartIconRef}
                                                        sx={{ color: scrolled ? 'white' : 'var(--primary-main)' }} 
                                                    />
                                                </Badge>
                                            </IconButton>
                                        </Tooltip>

                                        {/* Menu người dùng */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>                                            {/* Cart Menu */}                                            <Menu
                                                id="cart-menu"
                                                anchorEl={cartMenuAnchor}
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'right',
                                                }}
                                                keepMounted
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                open={Boolean(cartMenuAnchor)}
                                                onClose={handleCartMenuClose}
                                                slotProps={{
                                                    paper: {
                                                        elevation: 3,
                                                        className: isMobile ? 'mobile-cart-menu' : '',
                                                        sx: { 
                                                            width: isMobile ? '100%' : 320,
                                                            maxHeight: isMobile ? '80vh' : 400,
                                                            overflow: 'auto',
                                                            mt: 1.5,
                                                            borderRadius: isMobile ? 0 : 2,
                                                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                                                        }
                                                    }
                                                }}
                                            >
                                                <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        Giỏ hàng của bạn
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {cartItems.length > 0 
                                                            ? `${cartItems.length} sản phẩm (${cartItemCount} món)` 
                                                            : 'Chưa có sản phẩm nào'
                                                        }
                                                    </Typography>
                                                </Box>
                                                  {cartItems.length === 0 ? (
                                                    <Box sx={{ p: 2, textAlign: 'center' }} className="empty-cart-container">
                                                        <ShoppingCartIcon sx={{ fontSize: 50, color: 'action.disabled', mb: 1 }} className="empty-cart-icon" />
                                                        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                                                            Giỏ hàng của bạn đang trống
                                                        </Typography>
                                                        <Button 
                                                            variant="outlined" 
                                                            color="primary"
                                                            component={RouterLink}
                                                            to="/"
                                                            onClick={handleCartMenuClose}
                                                            sx={{ borderRadius: 2, px: 3 }}
                                                            startIcon={<HomeIcon />}
                                                        >
                                                            Mua sắm ngay
                                                        </Button>
                                                    </Box>                                                ) : (
                                                    <Fragment>
                                                        <List sx={{ py: 0 }}>
                                                            {cartItems.map((item) => {
    // Determine product structure (API or localStorage)
    const product = item.product || item;
    const productId = item.productId || product.id;
    const productName = product.name;
    const productImage = product.image || "https://via.placeholder.com/60";
    const productPrice = product.price;
    const quantity = item.quantity;

    return (
        <ListItem 
            key={productId} 
            sx={{ 
                py: 2, 
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease'
            }}
            className="cart-menu-item cart-item-enter cart-item-enter-active"
        >
            <ListItemAvatar>
                <Avatar 
                    variant="rounded"
                    src={productImage}
                    alt={productName}
                    sx={{ 
                        width: 50, 
                        height: 50, 
                        borderRadius: 1,
                        border: '1px solid rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                            transform: 'scale(1.05)'
                        }
                    }}
                />
            </ListItemAvatar>
            <ListItemText
                primary={
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            fontWeight: 'medium',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 0.5,
                            cursor: 'pointer',
                            '&:hover': {
                                color: 'primary.main'
                            }
                        }}
                        onClick={() => {
                            handleCartMenuClose();
                            navigate(`/products/${productId}`);
                        }}
                    >
                        {productName}
                    </Typography>
                }
                secondary={
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            {formatCurrency(productPrice)} × {quantity}
                        </Typography>
                        <Typography variant="body2" color="primary.main" fontWeight="bold">
                            {formatCurrency(productPrice * quantity)}
                        </Typography>
                    </Box>
                }
            />
            <ListItemSecondaryAction>
                <IconButton 
                    edge="end" 
                    size="small"
                    onClick={() => handleRemoveFromCart(productId)}
                    sx={{ 
                        color: 'error.main',
                        '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.04)'
                        }
                    }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    );
})}                                                        </List>
                                                        
                                                        <Box 
                                                            sx={{ 
                                                                p: 2, 
                                                                borderTop: '1px solid rgba(0,0,0,0.08)',
                                                                position: 'sticky',
                                                                bottom: 0,
                                                                bgcolor: 'background.paper',
                                                                zIndex: 1
                                                            }}
                                                            className={isMobile ? 'mobile-cart-action-buttons' : ''}
                                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <Typography variant="subtitle1">Tổng tiền:</Typography>
                                                <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                                                    {formatCurrency(calculateTotal())}
                                                </Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={handleViewCart}
                                                    sx={{ 
                                                        borderRadius: 2,
                                                        py: 1
                                                    }}
                                                >
                                                    Xem giỏ hàng
                                                </Button>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleCheckout}
                                                    className={cartItems.length > 0 ? "checkout-button-pulse" : ""}
                                                    sx={{ 
                                                        borderRadius: 2,
                                                        py: 1,
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Thanh toán
                                                </Button>
                                            </Box>                                        </Box>
                                                    </Fragment>
                                                )}
                                            </Menu>

                                            <Typography variant="body1" sx={{ mr: 1, color: scrolled ? 'white' : 'var(--text-primary)' }}>
                                                {user.fullname || user.name || user.username}
                                            </Typography>
                                            <Tooltip title="Tài khoản">
                                                <IconButton
                                                    onClick={handleUserMenu}
                                                    className="avatar"
                                                    sx={{
                                                        p: 0,
                                                        border: `2px solid ${scrolled ? 'white' : 'var(--primary-light)'}`,
                                                    }}
                                                >
                                                    {user.avatar || user.picture ? (
                                                        <Avatar
                                                            alt={user.username || user.name}
                                                            src={user.avatar || user.picture}
                                                            sx={{ width: 38, height: 38 }}
                                                        />
                                                    ) : (
                                                        <Avatar sx={{ width: 38, height: 38, bgcolor: scrolled ? 'white' : 'var(--primary-main)', color: scrolled ? 'var(--primary-main)' : 'white' }}>
                                                            {(user.username || user.name || "U")?.charAt(0)?.toUpperCase()}
                                                        </Avatar>
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                            <Menu
                                                id="user-menu"
                                                anchorEl={userMenuAnchor}
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'right',
                                                }}
                                                keepMounted
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                open={Boolean(userMenuAnchor)}
                                                onClose={handleUserMenuClose}
                                                PaperProps={{
                                                    className: 'custom-card',
                                                }}

                                            >                                                <MenuItem 
                                                    component={RouterLink} 
                                                    to="/profile" 
                                                    onClick={handleUserMenuClose}
                                                    sx={{ 
                                                        gap: 1,
                                                        color: location.pathname === '/profile' ? 'var(--primary-main)' : 'inherit'
                                                    }}
                                                >                                                    <AccountCircleIcon fontSize="small" sx={{ color: 'var(--primary-main)' }} />                                                    Tài khoản
                                                </MenuItem>                                                <MenuItem 
                                                    component={RouterLink} 
                                                    to="/orders" 
                                                    onClick={handleUserMenuClose}
                                                    sx={{ 
                                                        gap: 1,
                                                        color: location.pathname === '/orders' ? 'var(--primary-main)' : 'inherit'
                                                    }}
                                                >
                                                    <ShoppingBagIcon fontSize="small" sx={{ color: 'var(--primary-main)' }} />
                                                    Đơn hàng của tôi
                                                </MenuItem>
                                                {user && user.roles && user.roles.some(role => role.name === 'SELLER') && (
                                                    <Fragment>
                                                        <MenuItem 
                                                            component={RouterLink} 
                                                            to="/seller/dashboard"
                                                            onClick={handleUserMenuClose}
                                                            sx={{ 

                                                                gap: 1,
                                                                color: location.pathname === '/seller/dashboard' ? 'var(--primary-main)' : 'inherit'
                                                            }}
                                                        >
                                                            <StorefrontIcon fontSize="small" sx={{ color: 'var(--primary-main)' }} />
                                                            Bảng điều khiển
                                                        </MenuItem>

                                                        <MenuItem 
                                                            component={RouterLink} 
                                                            to="/seller/stores" 
                                                            onClick={handleUserMenuClose}
                                                            sx={{ 

                                                                gap: 1,
                                                                color: location.pathname === '/seller/stores' ? 'var(--primary-main)' : 'inherit'
                                                            }}
                                                        >
                                                            <StorefrontIcon fontSize="small" sx={{ color: 'var(--primary-main)' }} />
                                                            Quản lý cửa hàng
                                                        </MenuItem>

                                                        <MenuItem 
                                                            component={RouterLink} 
                                                            to="/seller/products" 
                                                            onClick={handleUserMenuClose}
                                                            sx={{ 

                                                                gap: 1,
                                                                color: location.pathname === '/seller/products' ? 'var(--primary-main)' : 'inherit'
                                                            }}
                                                        >                                                            <ShoppingBasketIcon fontSize="small" sx={{ color: 'var(--primary-main)' }} />
                                                            Quản lý sản phẩm
                                                        </MenuItem>
                                                    </Fragment>
                                                )}
                                                {user && user.roles && user.roles.some(role => role.name === 'ADMIN' || role.name === 'STAFF') && (
                                                    <MenuItem
                                                        component={RouterLink}
                                                        to="/admin"
                                                        onClick={handleUserMenuClose}
                                                        sx={{
                                                            gap: 1,
                                                            color: location.pathname === '/admin' ? 'var(--primary-main)' : 'inherit'
                                                        }}
                                                    >
                                                        <AdminPanelSettingsIcon fontSize="small" sx={{ color: 'var(--primary-main)' }} />
                                                        Quản trị
                                                    </MenuItem>
                                                )}
                                                <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
                                                    <LogoutIcon fontSize="small" sx={{ color: 'var(--error)' }} />
                                                    Đăng xuất
                                                </MenuItem>                                            </Menu>
                                        </Box>
                                    </Fragment>                                ) : (
                                    // Hiện nút đăng nhập và đăng ký khi chưa đăng nhập
                                    <Fragment>
                                        <Button
                                            className="custom-btn"
                                            variant={scrolled ? "outlined" : "text"}
                                            component={RouterLink}
                                            to="/login"
                                            startIcon={<LoginIcon />}
                                            sx={{
                                                color: scrolled ? 'white' : 'var(--primary-main)',
                                                borderColor: scrolled ? 'white' : undefined
                                            }}
                                        >
                                            Đăng nhập
                                        </Button>
                                        <Button
                                            className="custom-btn"
                                            variant="contained"
                                            component={RouterLink}
                                            to="/register"
                                            startIcon={<HowToRegIcon />}
                                            sx={{
                                                ml: 1,
                                                bgcolor: scrolled ? 'white' : 'var(--primary-main)',
                                                color: scrolled ? 'var(--primary-main)' : 'white',
                                                '&:hover': {
                                                    bgcolor: scrolled ? 'white' : 'var(--primary-dark)',
                                                }
                                            }}                                        >
                                            Đăng ký
                                        </Button>
                                    </Fragment>
                                )}
                            </Box>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>
        </Slide>
    );
}

export default Header;