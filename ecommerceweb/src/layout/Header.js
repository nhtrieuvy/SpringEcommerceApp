import React, { useContext, useState, useEffect } from 'react';
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
    InputBase,
    alpha
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { MyUserContext } from '../configs/MyContexts';

const Header = () => {
    const [user, dispatch] = useContext(MyUserContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();

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

                        {/* Search bar - Hiển thị trên desktop */}
                        {!isMobile && (
                            <Box 
                                sx={{ 
                                    flexGrow: 1, 
                                    mx: 2,
                                    display: 'flex',
                                    borderRadius: '20px',
                                    backgroundColor: alpha(theme.palette.common.black, scrolled ? 0.15 : 0.06),
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.common.black, scrolled ? 0.25 : 0.1),
                                    },
                                    pl: 2
                                }}
                            >
                                <SearchIcon sx={{ alignSelf: 'center', mr: 1, opacity: 0.7 }} />
                                <InputBase
                                    placeholder="Tìm kiếm sản phẩm..."
                                    sx={{ 
                                        width: '100%',
                                        '& .MuiInputBase-input': {
                                            p: 1,
                                        }
                                    }}
                                />
                            </Box>
                        )}

                        {isMobile ? (
                            <>
                                {/* Mobile menu */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {user && (
                                        <Tooltip title="Giỏ hàng">
                                            <IconButton color="inherit">
                                                <Badge badgeContent={3} color="error">
                                                    <ShoppingCartIcon />
                                                </Badge>
                                            </IconButton>
                                        </Tooltip>
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
                                    >
                                        <HomeIcon fontSize="small" />
                                        Trang chủ
                                    </MenuItem>
<<<<<<< Updated upstream
                                    <MenuItem
                                        component={RouterLink}
                                        to="/products"
                                        onClick={handleClose}
                                        sx={{ 
                                            gap: 1,
                                            color: location.pathname === '/products' ? 'var(--primary-main)' : 'inherit',
                                            fontWeight: location.pathname === '/products' ? 600 : 400
                                        }}
                                    >
                                        <ShoppingCartIcon fontSize="small" />
                                        Sản phẩm
                                    </MenuItem>
=======
>>>>>>> Stashed changes
                                    
                                    {user ? (
                                        // Menu items khi đã đăng nhập
                                        <>                                            <MenuItem 
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
                                                <>
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
                                                        }}
                                                    >
                                                        <ShoppingBasketIcon fontSize="small" />
                                                        Quản lý sản phẩm
                                                    </MenuItem>
                                                </>
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
                                                Đăng xuất
                                            </MenuItem>
                                        </>
                                    ) : (
                                        // Menu items khi chưa đăng nhập
                                        <>
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
                                        </>
                                    )}
                                </Menu>
                            </>
                        ) : (
                            // Desktop menu
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
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
<<<<<<< Updated upstream
                                <Button
                                    className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
                                    component={RouterLink}
                                    to="/products"
                                    startIcon={<ShoppingCartIcon />}
                                    sx={{ 
                                        color: scrolled ? 'white' : (location.pathname === '/products' ? 'var(--primary-main)' : 'var(--text-primary)'),
                                        fontWeight: location.pathname === '/products' ? 600 : 500
                                    }}
                                >
                                    Sản phẩm
                                </Button>
=======
>>>>>>> Stashed changes
                                
                                {user ? (
                                    <>
                                        {/* Nút wishlist */}
                                        <Tooltip title="Danh sách yêu thích">
                                            <IconButton className="hover-scale">
                                                <Badge badgeContent={2} color="error">
                                                    <FavoriteIcon sx={{ color: scrolled ? 'white' : '#f44336' }} />
                                                </Badge>
                                            </IconButton>
                                        </Tooltip>
                                        
                                        {/* Nút giỏ hàng */}
                                        <Tooltip title="Giỏ hàng">
                                            <IconButton className="hover-scale">
                                                <Badge badgeContent={3} color="error">
                                                    <ShoppingCartIcon sx={{ color: scrolled ? 'white' : 'var(--primary-main)' }} />
                                                </Badge>
                                            </IconButton>
                                        </Tooltip>
                                        
                                        {/* Menu người dùng */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
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
                                                >                                                    <AccountCircleIcon fontSize="small" sx={{ color: 'var(--primary-main)' }} />
                                                    Tài khoản
                                                </MenuItem>                                                {user && user.roles && user.roles.some(role => role.name === 'SELLER') && (
                                                    <>
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
                                                        >
                                                            <ShoppingBasketIcon fontSize="small" sx={{ color: 'var(--primary-main)' }} />
                                                            Quản lý sản phẩm
                                                        </MenuItem>
                                                    </>
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
                                                </MenuItem>
                                            </Menu>
                                        </Box>
                                    </>
                                ) : (
                                    // Hiện nút đăng nhập và đăng ký khi chưa đăng nhập
                                    <>
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
                                            }}
                                        >
                                            Đăng ký
                                        </Button>
                                    </>
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