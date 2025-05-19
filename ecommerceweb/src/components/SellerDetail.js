import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Typography,
    Container,
    Box,
    Grid,
    Paper,
    Divider,
    Rating,
    Button,
    Avatar,
    Card,
    CardContent,
    CardMedia,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    List,
    ListItem,
    IconButton,
    Tabs,
    Tab,
    Skeleton,
    Alert,
    Snackbar,
    Breadcrumbs
} from '@mui/material';

// Icons
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedIcon from '@mui/icons-material/Verified';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LoyaltyIcon from '@mui/icons-material/Loyalty';

import defaultApi from '../configs/Apis';
import { authApi, endpoint } from '../configs/Apis';
import { useAuth } from '../configs/MyContexts';
// import { hasRole, ROLES, canModifyReview } from '../configs/Roles';

const SellerDetail = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    
    // State for seller data
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: '',
    });
    const [editingReview, setEditingReview] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    
    // Fetch seller data
    useEffect(() => {
        const fetchSellerDetail = async () => {
            setLoading(true);
            try {
                const response = await defaultApi.get(`/api/sellers/${id}`);
                setSeller(response.data);
                
                // Fetch seller products
                fetchSellerProducts();
                
                // Fetch seller reviews
                fetchSellerReviews();
            } catch (error) {
                console.error("Error fetching seller details:", error);
                setSnackbar({
                    open: true,
                    message: 'Không thể tải thông tin người bán, vui lòng thử lại sau',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSellerDetail();
        }
    }, [id]);
    
    // Fetch seller products
    const fetchSellerProducts = async () => {
        setProductsLoading(true);
        try {
            const response = await defaultApi.get(`/api/products?seller=${id}`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching seller products:", error);
        } finally {
            setProductsLoading(false);
        }    };
      // Fetch seller reviews
    const fetchSellerReviews = async () => {
        setReviewsLoading(true);
        try {
            const response = await defaultApi.get(endpoint.GET_SELLER_REVIEWS(id));
            
            if (response.data && response.data.reviews) {
                setReviews(response.data.reviews);
                
                // Also update the seller data with the latest average rating
                if (response.data.averageRating !== undefined) {
                    setSeller(prev => ({
                        ...prev,
                        rating: response.data.averageRating
                    }));
                }
                
                console.log("Fetched reviews:", response.data.reviews.length, "Average rating:", response.data.averageRating);
            } else {
                // Fallback for unexpected data structure
                setReviews(response.data || []);
            }
        } catch (error) {
            console.error("Error fetching seller reviews:", error);
        } finally {
            setReviewsLoading(false);
        }
    };
    const handleOpenReviewDialog = () => {
        if (!isAuthenticated) {
            setSnackbar({
                open: true,
                message: 'Vui lòng đăng nhập để viết đánh giá',
                severity: 'warning'
            });
            return;
        }
        setNewReview({
            rating: 5,
            comment: '',
        });
        setEditingReview(null);
        setReviewDialogOpen(true);
    };
    
    // Handle closing review dialog
    const handleCloseReviewDialog = () => {
        setReviewDialogOpen(false);
        setEditingReview(null);
    };
    
    // Handle review input change
    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setNewReview(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Handle review rating change
    const handleRatingChange = (event, newValue) => {
        setNewReview(prev => ({
            ...prev,
            rating: newValue
        }));
    };
      // Submit seller review
    const handleReviewSubmit = async () => {
        if (!isAuthenticated) {
            setSnackbar({
                open: true,
                message: 'Vui lòng đăng nhập để viết đánh giá',
                severity: 'warning'
            });
            return;
        }
        
        try {
            if (editingReview) {
                // Update existing review
                await authApi().put(endpoint.UPDATE_SELLER_REVIEW(editingReview.id), {
                    rating: newReview.rating,
                    comment: newReview.comment
                });
                setSnackbar({
                    open: true,
                    message: 'Đã cập nhật đánh giá thành công',
                    severity: 'success'
                });            } else {
                // Create new review with user ID if available
                const reviewData = {
                    sellerId: id,
                    rating: newReview.rating,
                    comment: newReview.comment
                };
                
                // Add userId if available from auth context
                if (user && user.id) {
                    reviewData.userId = user.id;
                    console.log('Setting userId to:', user.id);
                } else {
                    console.log('User ID not available in context');
                }
                
                console.log('Submitting review data:', JSON.stringify(reviewData));
                
                const response = await authApi().post(endpoint.CREATE_SELLER_REVIEW(), reviewData);
                console.log('Review submission response:', response.data);
                
                setSnackbar({
                    open: true,
                    message: 'Đã gửi đánh giá thành công',
                    severity: 'success'
                });
            }
            
            // Refresh reviews
            fetchSellerReviews();
            
            // Also refresh ratings to update the count and average
            fetchSellerRatings();
            
            handleCloseReviewDialog();
        } catch (error) {
            console.error("Error submitting review:", error);
            setSnackbar({
                open: true,
                message: 'Không thể gửi đánh giá, vui lòng thử lại sau',
                severity: 'error'
            });
        }
    };
    
    // Edit review
    const handleEditReview = (review) => {
        setEditingReview(review);
        setNewReview({
            rating: review.rating,
            comment: review.comment
        });
        setReviewDialogOpen(true);
    };
    
    // Delete review
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            return;
        }
        
        try {
            await authApi().delete(endpoint.DELETE_SELLER_REVIEW(reviewId));
            setSnackbar({
                open: true,
                message: 'Đã xóa đánh giá thành công',
                severity: 'success'
            });
            fetchSellerReviews();
        } catch (error) {
            console.error("Error deleting review:", error);            setSnackbar({
                open: true,
                message: 'Không thể xóa đánh giá, vui lòng thử lại sau',
                severity: 'error'
            });
        }
    };
    
    // Check if user can modify a review
    const canModifyReviewCheck = (review) => {
        if (!user || !review) return false;
        
        // Nếu user là admin hoặc moderator, cho phép sửa/xóa bất kỳ review nào
        if (user.roles && (user.roles.some(role => role.name === "ADMIN") || 
                          user.roles.some(role => role.name === "MODERATOR"))) {
            return true;
        }
        
        // Người dùng chỉ có thể sửa/xóa review của chính họ
        return review.user && review.user.id === user.id;
    };
    
    // State
    const [ratings, setRatings] = useState([]);
    const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
    const [newRating, setNewRating] = useState({
        rating: 5,
        comment: '',
    });
    const [editingRating, setEditingRating] = useState(null);
    
    // Fetch seller data
    useEffect(() => {
        const fetchSellerDetail = async () => {
            setLoading(true);
            try {
                // Get seller details
                const response = await defaultApi.get(`/api/sellers/${id}`);
                setSeller(response.data);
                
                // Get seller ratings
                fetchSellerRatings();
                
                // Get seller products
                const productsResponse = await defaultApi.get(`/api/products?sellerId=${id}&limit=8`);
                setProducts(productsResponse.data);
            } catch (error) {
                console.error("Error fetching seller details:", error);
                setSnackbar({
                    open: true,
                    message: 'Không thể tải thông tin người bán, vui lòng thử lại sau',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        };
        
        if (id) {
            fetchSellerDetail();
        }
    }, [id]);    // Fetch seller ratings
    const fetchSellerRatings = async () => {
        try {
            const response = await defaultApi.get(endpoint.GET_SELLER_REVIEWS(id));
            // Properly extract the reviews array, averageRating, and count
            if (response.data && response.data.reviews) {
                setRatings(response.data.reviews);
                // Update the seller object with the new average rating if needed
                if (seller && response.data.averageRating) {
                    setSeller(prev => ({
                        ...prev,
                        rating: response.data.averageRating
                    }));
                }
            } else {
                // Fallback if the structure is different
                setRatings(response.data.reviews || response.data || []);
            }
        } catch (error) {
            console.error("Error fetching seller ratings:", error);
        }
    };
    
    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    
    // Handle snackbar close
    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };
    
    // Open rating dialog
    const handleOpenRatingDialog = () => {
        if (!isAuthenticated) {
            setSnackbar({
                open: true,
                message: 'Vui lòng đăng nhập để đánh giá người bán',
                severity: 'warning'
            });
            return;
        }
        
        setRatingDialogOpen(true);
    };
    
    // Close rating dialog
    const handleCloseRatingDialog = () => {
        setRatingDialogOpen(false);
        setNewRating({ rating: 5, comment: '' });
        setEditingRating(null);
    };
      // Submit a new seller rating
    const handleSubmitRating = async () => {
        try {
            const api = authApi();
            
            if (editingRating) {                
                // Update existing rating
                await api.put(endpoint.UPDATE_SELLER_REVIEW(editingRating.id), {
                    rating: newRating.rating,
                    comment: newRating.comment
                });
                
                setSnackbar({
                    open: true,
                    message: 'Đã cập nhật đánh giá thành công',
                    severity: 'success'
                });
            } else {                      // Create new rating
                const reviewData = {
                    sellerId: id,
                    rating: newRating.rating,
                    comment: newRating.comment,
                    userId: user && user.id ? user.id : null
                };
                
                console.log("Submitting review with data:", reviewData);
                await api.post(endpoint.CREATE_SELLER_REVIEW(), reviewData);
                
                setSnackbar({
                    open: true,
                    message: 'Đã đăng đánh giá thành công',
                    severity: 'success'
                });
            }
            
            // Refresh ratings
            fetchSellerRatings();
            handleCloseRatingDialog();
        } catch (error) {
            console.error("Error submitting rating:", error);
            setSnackbar({
                open: true,
                message: 'Đã xảy ra lỗi khi đăng đánh giá, vui lòng thử lại',
                severity: 'error'
            });
        }
    };
    
    // Delete a rating
    const handleDeleteRating = async (ratingId) => {        try {
            const api = authApi();
            
            await api.delete(endpoint.DELETE_SELLER_REVIEW(ratingId));
            
            setSnackbar({
                open: true,
                message: 'Đã xóa đánh giá thành công',
                severity: 'success'
            });
            
            // Refresh ratings
            fetchSellerRatings();
        } catch (error) {
            console.error("Error deleting rating:", error);
            setSnackbar({
                open: true,
                message: 'Đã xảy ra lỗi khi xóa đánh giá, vui lòng thử lại',
                severity: 'error'
            });
        }
    };
    
    // Edit a rating
    const handleEditRating = (rating) => {
        setEditingRating(rating);
        setNewRating({
            rating: rating.rating,
            comment: rating.comment
        });
        setRatingDialogOpen(true);
    };
      // Check if user can modify a rating
    const canModifyRatingCheck = (rating) => {
        if (!user || !rating) return false;
        
        // Nếu user là admin hoặc moderator, cho phép sửa/xóa bất kỳ đánh giá nào
        if (user.roles && (user.roles.some(role => role.name === "ADMIN") || 
                          user.roles.some(role => role.name === "MODERATOR"))) {
            return true;
        }
        
        // Người dùng chỉ có thể sửa/xóa đánh giá của chính họ
        return rating.user && rating.user.id === user.id;
    };
    
    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    // Render breadcrumbs
    const renderBreadcrumbs = () => (
        <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            aria-label="breadcrumb"
            sx={{ mb: 3 }}
        >
            <Link to="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                Trang chủ
            </Link>
            <Link to="/sellers" style={{ color: 'inherit', textDecoration: 'none' }}>
                Người bán
            </Link>
            <Typography color="text.primary">{seller?.storeName || 'Chi tiết người bán'}</Typography>
        </Breadcrumbs>
    );
    
    // Loading skeleton
    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Skeleton variant="text" width="30%" height={30} sx={{ mb: 3 }} />
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 4, boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <Skeleton variant="circular" width={150} height={150} sx={{ mx: 'auto' }} />
                            <Skeleton variant="text" sx={{ mt: 2 }} />
                            <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
                        </Grid>
                        <Grid item xs={12} md={9}>
                            <Skeleton variant="text" height={40} width="60%" />
                            <Skeleton variant="text" height={20} sx={{ mt: 1 }} />
                            <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 2 }} />
                            <Box sx={{ display: 'flex', mt: 2, gap: 2 }}>
                                <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
                                <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
                                <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        );
    }
    
    // If seller not found
    if (!seller && !loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Paper elevation={0} sx={{ p: 5, borderRadius: 3, textAlign: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}>
                    <Typography variant="h5" gutterBottom>
                        Không tìm thấy người bán
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                        Người bán này không tồn tại hoặc đã bị xóa.
                    </Typography>
                    <Button 
                        variant="contained" 
                        component={Link} 
                        to="/"
                        sx={{ mt: 2, borderRadius: 2 }}
                    >
                        Quay lại trang chủ
                    </Button>
                </Paper>
            </Container>
        );
    }
    
    return (
        <Box sx={{ background: 'linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%)', minHeight: '100vh', pb: 8 }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {renderBreadcrumbs()}
                
                {/* Seller Profile Card */}
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: { xs: 2, md: 4 }, 
                        borderRadius: 3, 
                        mb: 4, 
                        boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
                    }}
                >
                    <Grid container spacing={3}>
                        {/* Seller Avatar and Basic Info */}
                        <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                            <Avatar 
                                src={seller.avatar} 
                                sx={{ 
                                    width: 150, 
                                    height: 150, 
                                    mx: 'auto',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            >
                                <StorefrontIcon sx={{ fontSize: 80 }} />
                            </Avatar>
                            <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                                {seller.store?.name || seller.username}
                                {seller.verified && (
                                    <VerifiedIcon color="primary" sx={{ ml: 0.5, fontSize: '1rem', verticalAlign: 'text-top' }} />
                                )}
                            </Typography>                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
                                <Rating 
                                    value={seller.rating || 0} 
                                    precision={0.5} 
                                    readOnly 
                                    size="small" 
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                    ({ratings ? ratings.length : 0} đánh giá)
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Thành viên từ {formatDate(seller.createdDate)}
                            </Typography>
                        </Grid>
                        
                        {/* Seller Details */}
                        <Grid item xs={12} md={9}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="h4" gutterBottom>
                                    Thông tin người bán
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<StarIcon />}
                                    onClick={handleOpenRatingDialog}
                                    sx={{ borderRadius: 2, textTransform: 'none' }}
                                >
                                    Đánh giá người bán
                                </Button>
                            </Box>
                            
                            <Divider sx={{ mb: 2 }} />
                            
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} sm={4}>
                                    <Paper 
                                        variant="outlined" 
                                        sx={{ 
                                            p: 2, 
                                            borderRadius: 2, 
                                            textAlign: 'center',
                                            height: '100%'
                                        }}
                                    >
                                        <ShoppingBagIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                                        <Typography variant="h6">
                                            {seller.productCount || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Sản phẩm
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Paper 
                                        variant="outlined" 
                                        sx={{ 
                                            p: 2, 
                                            borderRadius: 2, 
                                            textAlign: 'center',
                                            height: '100%'
                                        }}
                                    >
                                        <StarIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                                        <Typography variant="h6">
                                            {seller.rating?.toFixed(1) || "0.0"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Đánh giá trung bình
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Paper 
                                        variant="outlined" 
                                        sx={{ 
                                            p: 2, 
                                            borderRadius: 2, 
                                            textAlign: 'center',
                                            height: '100%'
                                        }}
                                    >
                                        <LoyaltyIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                                        <Typography variant="h6">
                                            {seller.soldCount || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Sản phẩm đã bán
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                            
                            {seller.description && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Giới thiệu:
                                    </Typography>
                                    <Typography variant="body1">
                                        {seller.description}
                                    </Typography>
                                </Box>
                            )}
                            
                            {seller.store && (
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Cửa hàng:
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <StorefrontIcon sx={{ mr: 1, color: 'primary.main' }} />
                                        <Typography variant="body1">
                                            {seller.store.name}
                                        </Typography>
                                        <Chip 
                                            label={seller.store.status || "Đang hoạt động"} 
                                            color="success" 
                                            size="small" 
                                            sx={{ ml: 2, borderRadius: 1 }} 
                                        />
                                    </Box>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Paper>
                
                {/* Tabs Section */}
                <Paper 
                    elevation={0} 
                    sx={{ 
                        borderRadius: 3, 
                        mb: 4, 
                        overflow: 'hidden',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
                    }}
                >
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 'medium',
                                fontSize: '1rem',
                                py: 2
                            }
                        }}
                    >
                        <Tab label="Sản phẩm" />
                        <Tab label="Đánh giá" />
                    </Tabs>
                    
                    <Box sx={{ p: 3 }}>
                        {/* Tab 1: Products */}
                        {activeTab === 0 && (
                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Sản phẩm của người bán
                                </Typography>
                                
                                {products.length > 0 ? (
                                    <Grid container spacing={3} sx={{ mt: 1 }}>
                                        {products.map((product) => (
                                            <Grid item xs={12} sm={6} md={3} key={product.id}>
                                                <Card
                                                    sx={{
                                                        height: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        borderRadius: 3,
                                                        overflow: 'hidden',
                                                        boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'translateY(-8px)',
                                                            boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ position: 'relative', pt: '75%', overflow: 'hidden' }}>
                                                        <CardMedia
                                                            component="img"
                                                            image={product.image || "https://via.placeholder.com/400x300?text=No+Image"}
                                                            alt={product.name}
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                transition: 'transform 0.6s ease',
                                                                '&:hover': {
                                                                    transform: 'scale(1.05)'
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                    
                                                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                                        <Typography
                                                            variant="subtitle1"
                                                            component={Link}
                                                            to={`/products/${product.id}`}
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                color: 'text.primary',
                                                                textDecoration: 'none',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                overflow: 'hidden',
                                                                lineHeight: 1.2,
                                                                height: 40,
                                                                '&:hover': {
                                                                    color: 'primary.main'
                                                                }
                                                            }}
                                                        >
                                                            {product.name}
                                                        </Typography>
                                                        
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                                                            <Rating value={product.rating || 0} precision={0.5} readOnly size="small" />
                                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                                                ({product.ratingCount || 0})
                                                            </Typography>
                                                        </Box>
                                                        
                                                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                                                            {product.price?.toLocaleString('vi-VN') + '₫'}
                                                        </Typography>
                                                    </CardContent>
                                                    
                                                    <Box sx={{ p: 2, pt: 0 }}>
                                                        <Button
                                                            component={Link}
                                                            to={`/products/${product.id}`}
                                                            variant="outlined"
                                                            fullWidth
                                                            size="small"
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: 'none'
                                                            }}
                                                        >
                                                            Xem chi tiết
                                                        </Button>
                                                    </Box>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Box sx={{ py: 4, textAlign: 'center' }}>
                                        <Typography variant="body1" color="text.secondary">
                                            Người bán chưa có sản phẩm nào.
                                        </Typography>
                                    </Box>
                                )}
                                
                                {products.length > 8 && (
                                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                                        <Button 
                                            variant="outlined" 
                                            component={Link}
                                            to={`/sellers/${id}/products`}
                                            sx={{ borderRadius: 2, textTransform: 'none' }}
                                        >
                                            Xem tất cả sản phẩm
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        )}
                        
                        {/* Tab 2: Ratings */}
                        {activeTab === 1 && (
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        Đánh giá về người bán
                                    </Typography>
                                    <Button 
                                        variant="outlined" 
                                        startIcon={<StarIcon />}
                                        onClick={handleOpenRatingDialog}
                                        sx={{ borderRadius: 2, textTransform: 'none' }}
                                    >
                                        Đánh giá người bán
                                    </Button>
                                </Box>
                                
                                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" color="primary" fontWeight="bold">
                                            {seller.rating?.toFixed(1) || "0.0"}
                                        </Typography>
                                        <Rating value={seller.rating || 0} precision={0.5} readOnly size="large" />
                                        <Typography variant="body2" color="text.secondary">
                                            {ratings.length} đánh giá
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ flexGrow: 1 }}>
                                        {[5, 4, 3, 2, 1].map((rating) => {
                                            // Calculate percentage based on actual ratings
                                            const ratingsWithRating = ratings.filter(r => Math.round(r.rating) === rating).length;
                                            const percentage = ratings.length > 0 
                                                ? Math.round((ratingsWithRating / ratings.length) * 100) 
                                                : 0;
                                            
                                            return (
                                                <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', width: 80 }}>
                                                        <Typography variant="body2" sx={{ mr: 0.5 }}>{rating}</Typography>
                                                        <StarIcon fontSize="small" color="action" />
                                                    </Box>
                                                    <Box 
                                                        sx={{ 
                                                            flexGrow: 1, 
                                                            bgcolor: 'grey.100', 
                                                            borderRadius: 1, 
                                                            height: 8, 
                                                            mr: 2 
                                                        }}
                                                    >
                                                        <Box 
                                                            sx={{ 
                                                                width: `${percentage}%`, 
                                                                bgcolor: 'primary.main', 
                                                                height: '100%', 
                                                                borderRadius: 1 
                                                            }} 
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ width: 40 }}>
                                                        {percentage}%
                                                    </Typography>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>
                                
                                {/* Rating List */}
                                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                    Tất cả đánh giá
                                </Typography>
                                
                                {ratings.length > 0 ? (
                                    <List>
                                        {ratings.map(rating => (
                                            <Box key={rating.id} sx={{ mb: 3 }}>
                                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar 
                                                                src={rating.user?.avatar} 
                                                                sx={{ width: 36, height: 36, mr: 1.5 }}
                                                            >
                                                                <PersonIcon />
                                                            </Avatar>
                                                            <Box>                                                                <Typography fontWeight="bold">
                                                                    {rating.user?.fullName || rating.user?.username || `Người dùng #${rating.userId || 'không xác định'}`}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {formatDate(rating.createdDate)}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                          {canModifyRatingCheck(rating) && (
                                                            <Box>
                                                                <IconButton 
                                                                    size="small" 
                                                                    onClick={() => handleEditRating(rating)}
                                                                    sx={{ mr: 0.5 }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton 
                                                                    size="small" 
                                                                    onClick={() => handleDeleteRating(rating.id)}
                                                                    color="error"
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    
                                                    <Rating value={rating.rating} readOnly size="small" sx={{ my: 1 }} />
                                                    
                                                    <Typography variant="body1" paragraph sx={{ mt: 1 }}>
                                                        {rating.comment}
                                                    </Typography>
                                                </Paper>
                                            </Box>
                                        ))}
                                    </List>
                                ) : (
                                    <Box sx={{ py: 4, textAlign: 'center' }}>
                                        <Typography variant="body1" color="text.secondary">
                                            Người bán này chưa có đánh giá nào.
                                        </Typography>
                                        <Button 
                                            variant="contained" 
                                            startIcon={<StarIcon />}
                                            onClick={handleOpenRatingDialog}
                                            sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
                                        >
                                            Trở thành người đầu tiên đánh giá
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                </Paper>
                
                {/* Rating Dialog */}
                <Dialog 
                    open={ratingDialogOpen} 
                    onClose={handleCloseRatingDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ pb: 1 }}>
                        {editingRating ? 'Chỉnh sửa đánh giá' : 'Đánh giá người bán'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 1 }}>
                            <Typography variant="body1" sx={{ mr: 2 }}>Đánh giá của bạn:</Typography>
                            <Rating
                                value={newRating.rating}
                                onChange={(event, newValue) => {
                                    setNewRating({ ...newRating, rating: newValue });
                                }}
                                precision={1}
                                size="large"
                            />
                        </Box>
                        
                        <TextField
                            label="Nhận xét của bạn"
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            value={newRating.comment}
                            onChange={(e) => setNewRating({ ...newRating, comment: e.target.value })}
                            placeholder="Chia sẻ trải nghiệm của bạn với người bán này"
                            sx={{ mb: 2 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button 
                            onClick={handleCloseRatingDialog}
                            variant="outlined"
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            Hủy
                        </Button>
                        <Button 
                            onClick={handleSubmitRating}
                            variant="contained"
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                            disabled={!newRating.rating || !newRating.comment}
                        >
                            {editingRating ? 'Cập nhật' : 'Đăng đánh giá'}
                        </Button>
                    </DialogActions>
                </Dialog>
                
                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert 
                        onClose={handleSnackbarClose} 
                        severity={snackbar.severity} 
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default SellerDetail;
