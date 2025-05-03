import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
    Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { MyUserContext } from '../configs/MyContexts';

const Header = () => {
    const [user, dispatch] = useContext(MyUserContext);

    const [anchorEl, setAnchorEl] = useState(null);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

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
        dispatch({ type: "LOGOUT" });
        handleUserMenuClose();
        navigate('/');
    };

    return (
        <AppBar position="static" color="primary">
            <Container maxWidth="lg">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, fontWeight: 'bold' }}
                    >
                        E-commerce Store
                    </Typography>

                    {isMobile ? (
                        <>
                            <IconButton
                                size="large"
                                edge="end"
                                color="inherit"
                                aria-label="menu"
                                onClick={handleMenu}
                            >
                                <MenuIcon />
                            </IconButton>
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
                                    sx={{ gap: 1 }}
                                >
                                    <HomeIcon fontSize="small" />
                                    Trang chủ
                                </MenuItem>
                                <MenuItem
                                    component={RouterLink}
                                    to="/products"
                                    onClick={handleClose}
                                    sx={{ gap: 1 }}
                                >
                                    <ShoppingCartIcon fontSize="small" />
                                    Sản phẩm
                                </MenuItem>
                                
                                {user ? (
                                    // Menu items khi đã đăng nhập
                                    <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
                                        <LogoutIcon fontSize="small" />
                                        Đăng xuất
                                    </MenuItem>
                                ) : (
                                    // Menu items khi chưa đăng nhập
                                    <>
                                        <MenuItem
                                            component={RouterLink}
                                            to="/login"
                                            onClick={handleClose}
                                            sx={{ gap: 1 }}
                                        >
                                            <LoginIcon fontSize="small" />
                                            Đăng nhập
                                        </MenuItem>
                                        <MenuItem
                                            component={RouterLink}
                                            to="/register"
                                            onClick={handleClose}
                                            sx={{ gap: 1 }}
                                        >
                                            <HowToRegIcon fontSize="small" />
                                            Đăng ký
                                        </MenuItem>
                                    </>
                                )}
                            </Menu>
                        </>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/"
                                startIcon={<HomeIcon />}
                            >
                                Trang chủ
                            </Button>
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/products"
                                startIcon={<ShoppingCartIcon />}
                            >
                                Sản phẩm
                            </Button>
                            
                            {user ? (
                                // Hiện thông tin user và menu dropdown khi đã đăng nhập
                                <>
                                    <Typography variant="body1" sx={{ ml: 2 }}>
                                        Xin chào, {user.username || 'Người dùng'}
                                    </Typography>
                                    <Tooltip title="Cài đặt tài khoản">
                                        <IconButton onClick={handleUserMenu} sx={{ p: 0, ml: 1 }}>
                                            {user.avatar ? (
                                                <Avatar alt={user.username} src={user.avatar} />
                                            ) : (
                                                <Avatar>
                                                    {user.username?.charAt(0)?.toUpperCase() || "U"}
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
                                    >
                                        <MenuItem component={RouterLink} to="/profile" onClick={handleUserMenuClose}>
                                            <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
                                            Tài khoản
                                        </MenuItem>
                                        <MenuItem onClick={handleLogout}>
                                            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                                            Đăng xuất
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                // Hiện nút đăng nhập và đăng ký khi chưa đăng nhập
                                <>
                                    <Button
                                        color="inherit"
                                        component={RouterLink}
                                        to="/login"
                                        startIcon={<LoginIcon />}
                                    >
                                        Đăng nhập
                                    </Button>
                                    <Button
                                        color="inherit"
                                        variant="outlined"
                                        component={RouterLink}
                                        to="/register"
                                        startIcon={<HowToRegIcon />}
                                        sx={{ ml: 1 }}
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
    );
}

export default Header;