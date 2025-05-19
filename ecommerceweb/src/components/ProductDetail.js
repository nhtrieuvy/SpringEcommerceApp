import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    Typography,
    Container,
    Box,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    Paper,
    Divider,
    Chip,
    Rating,
    IconButton,
    Breadcrumbs,
    Tabs,
    Tab,
    useTheme,
    Skeleton,
    TextField,
    Alert,
    Snackbar,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    List,
    ListItem,
    Pagination,
} from "@mui/material";

// Icons
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ReplyIcon from '@mui/icons-material/Reply';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import PersonIcon from '@mui/icons-material/Person';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ReadMoreIcon from '@mui/icons-material/ReadMore';

import defaultApi from '../configs/Apis';
import { authApi, endpoint } from '../configs/Apis';
import { useAuth } from '../configs/MyContexts';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const { user, isAuthenticated } = useAuth();
    
    // State for product data
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedImage, setSelectedImage] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    
    // State for pagination of related products
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(4); // Show 4 products per page
    const [totalPages, setTotalPages] = useState(0);
    
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: '',
    });
    const [editingReview, setEditingReview] = useState(null);
    const [replyDialogOpen, setReplyDialogOpen] = useState(false);
    const [replyToReviewId, setReplyToReviewId] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
      // Fetch product data
    useEffect(() => {
        const fetchProductDetail = async () => {
            setLoading(true);
            try {
                const response = await defaultApi.get(`/api/products/${id}`);
                setProduct(response.data);
                
                // Check if the product is in favorites (from localStorage)
                const favoritesFromStorage = JSON.parse(localStorage.getItem('favorites') || '[]');
                setIsFavorite(favoritesFromStorage.includes(response.data.id));
                
                // Fetch related products based on category
                if (response.data.category) {
                    try {
                        // Fetch all related products for the category
                        const relatedResponse = await defaultApi.get(`/api/products?category=${response.data.category.id}`);
                        // Filter out the current product
                        const filteredRelatedProducts = relatedResponse.data.filter(p => p.id !== response.data.id);
                        setRelatedProducts(filteredRelatedProducts);
                        // Calculate total pages for related products pagination
                        setTotalPages(Math.ceil(filteredRelatedProducts.length / productsPerPage));
                    } catch (error) {
                        console.error("Error fetching related products:", error);
                        setRelatedProducts([]); // Clear related products on error
                        setTotalPages(0); // Reset total pages on error
                    }
                }
                
                // Fetch product reviews
                fetchProductReviews();
            } catch (error) {
                console.error("Error fetching product details:", error);
                setSnackbar({
                    open: true,
                    message: 'Không thể tải thông tin sản phẩm, vui lòng thử lại sau',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductDetail();
        }
    }, [id, productsPerPage]); // Added productsPerPage to dependency array
    // Fetch product reviews
    const fetchProductReviews = async () => {
        setReviewsLoading(true);
        try {
            const reviewSummaryResponse = await defaultApi.get(endpoint.GET_PRODUCT_REVIEWS(id));
            console.log("Product reviews data:", reviewSummaryResponse.data);
            
            const reviewsData = reviewSummaryResponse.data.reviews;
            const averageRating = reviewSummaryResponse.data.averageRating;
            const ratingCount = reviewSummaryResponse.data.count;

            // Update product state with new rating info
            setProduct(prevProduct => {
                if (!prevProduct) return null; // Should not happen if fetchProductDetail ran first
                return {
                    ...prevProduct,
                    rating: averageRating,
                    ratingCount: ratingCount
                };
            });
            
            // Fetch replies for each review
            const reviewsWithReplies = await Promise.all(
                reviewsData.map(async (review) => {
                    try {
                        const repliesResponse = await defaultApi.get(endpoint.GET_REVIEW_REPLIES(review.id));
                        console.log(`Replies for review ${review.id}:`, repliesResponse.data);
                        return {
                            ...review,
                            replies: repliesResponse.data || []
                        };
                    } catch (error) {
                        console.error(`Error fetching replies for review ${review.id}:`, error);
                        return {
                            ...review,
                            replies: []
                        };
                    }
                })
            );
            
            setReviews(reviewsWithReplies);
        } catch (error) {
            console.error("Error fetching product reviews:", error);
        } finally {
            setReviewsLoading(false);
        }
    };
    
    // Handle change in quantity
    const handleQuantityChange = (newValue) => {
        if (newValue >= 1 && newValue <= (product?.stock || 10)) {
            setQuantity(newValue);
        }
    };
    
    // Toggle favorite status
    const toggleFavorite = () => {
        const newStatus = !isFavorite;
        setIsFavorite(newStatus);
        
        // Update localStorage
        const favoritesFromStorage = JSON.parse(localStorage.getItem('favorites') || '[]');
        let updatedFavorites;
          if (newStatus) {
            updatedFavorites = [...favoritesFromStorage, product.id];
            setSnackbar({
                open: true,
                message: 'Đã thêm vào danh sách yêu thích',
                severity: 'success'
            });
        } else {
            updatedFavorites = favoritesFromStorage.filter(id => id !== product.id);
            setSnackbar({
                open: true,
                message: 'Đã xóa khỏi danh sách yêu thích',
                severity: 'success'
            });
        }
        
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    };
    
    // Handle opening review dialog
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
        setNewReview({ rating: 5, comment: '' });
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
      // Submit product review (CONSOLIDATED AND FINAL VERSION)
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
            const api = authApi(); // Use a single instance of authApi
            const userId = user?.id; // Get userId from the authenticated user object
            console.log("Submitting review with userId:", userId);

            if (editingReview) {
                // Update existing review
                try {
                    const response = await api.put(endpoint.UPDATE_PRODUCT_REVIEW(editingReview.id), {
                        // id: editingReview.id, // ID is in the endpoint, not needed in body
                        rating: newReview.rating,
                        comment: newReview.comment,
                        userId: userId // Include userId explicitly
                    });
                    console.log("Update review response:", response.data);
                    setSnackbar({
                        open: true,
                        message: 'Đã cập nhật đánh giá thành công',
                        severity: 'success'
                    });
                } catch (error) {
                    console.error("Error updating review:", error.response?.data || error.message);
                    setSnackbar({
                        open: true,
                        message: `Đã xảy ra lỗi khi cập nhật đánh giá: ${error.response?.data?.error || error.message}`,
                        severity: 'error'
                    });
                    throw error; // Re-throw to be caught by outer catch block
                }
            } else {            // Create new review
                try {
                    const response = await api.post(endpoint.CREATE_PRODUCT_REVIEW(), { // Use api variable
                        productId: id,
                        rating: newReview.rating,
                        comment: newReview.comment,
                        userId: userId // Include userId explicitly
                    });
                    console.log("Review submission response:", response.data);
                    setSnackbar({
                        open: true,
                        message: 'Đã đăng đánh giá thành công', // Standardized message
                        severity: 'success'
                    });
                } catch (error) {
                    console.error("Error submitting review:", error.response?.data || error.message);
                    setSnackbar({
                        open: true,
                        message: `Đã xảy ra lỗi khi đăng đánh giá: ${error.response?.data?.error || error.message}`,
                        severity: 'error'
                    });
                    throw error; // Re-throw to be caught by outer catch block
                }
            }
            
            // Refresh reviews
            fetchProductReviews();
            handleCloseReviewDialog();
        } catch (error) {
            console.error("Error submitting review:", error);
            setSnackbar({
                open: true,
                message: 'Đã xảy ra lỗi khi đăng đánh giá, vui lòng thử lại', // Standardized message
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
            await authApi().delete(endpoint.DELETE_PRODUCT_REVIEW(reviewId));
            setSnackbar({
                open: true,
                message: 'Đã xóa đánh giá thành công',
                severity: 'success'
            });
            fetchProductReviews();
        } catch (error) {
            console.error("Error deleting review:", error);
            setSnackbar({
                open: true,
                message: 'Không thể xóa đánh giá, vui lòng thử lại sau',
                severity: 'error'
            });
        }
    };
    
    // Open reply dialog
    const handleOpenReplyDialog = (reviewId) => {
        if (!isAuthenticated) {
            setSnackbar({
                open: true,
                message: 'Vui lòng đăng nhập để trả lời đánh giá',
                severity: 'warning'
            });
            return;
        }
        
        setReplyToReviewId(reviewId);
        setReplyContent('');
        setReplyDialogOpen(true);
    };
    
    // Close reply dialog
    const handleCloseReplyDialog = () => {
        setReplyDialogOpen(false);
        setReplyToReviewId(null);
    };
    
    // Submit reply
    const handleReplySubmit = async () => {
        if (!isAuthenticated) {
            setSnackbar({
                open: true,
                message: 'Vui lòng đăng nhập để trả lời đánh giá',
                severity: 'warning'
            });
            return;
        }
        
        try {
            const api = authApi();
            const userId = user?.id;
            console.log("Submitting reply with userId:", userId);            try {
                console.log("Submitting reply with data:", {
                    reviewId: replyToReviewId,
                    comment: replyContent,
                    userId: userId
                });
                
                const response = await api.post(endpoint.CREATE_REVIEW_REPLY(), {
                    reviewId: replyToReviewId,
                    comment: replyContent,
                    userId: userId // Include userId explicitly
                });
                
                console.log("Reply submission response:", response.data);
                
                setSnackbar({
                    open: true,
                    message: 'Đã gửi trả lời thành công',
                    severity: 'success'
                });
                
                // Refresh reviews to include the new reply
                fetchProductReviews();
                handleCloseReplyDialog();
            } catch (error) {
                console.error("Error submitting reply:", error.response?.data || error.message);
                setSnackbar({
                    open: true,
                    message: `Đã xảy ra lỗi khi gửi trả lời: ${error.response?.data?.error || error.message}`,
                    severity: 'error'
                });
                throw error; // Re-throw to be caught by outer catch
            }
        } catch (error) {
            console.error("Error in handleReplySubmit:", error);
            setSnackbar({
                open: true,
                message: 'Không thể gửi trả lời, vui lòng thử lại sau',
                severity: 'error'
            });
        }
    };
      // Delete reply
    const handleDeleteReply = async (replyId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa trả lời này?')) {
            return;
        }
        
        try {
            await authApi().delete(endpoint.DELETE_REVIEW_REPLY(replyId));
            
            setSnackbar({
                open: true,
                message: 'Đã xóa trả lời thành công',
                severity: 'success'
            });
            
            // Refresh reviews to update the view
            fetchProductReviews();
        } catch (error) {
            console.error("Error deleting reply:", error);
            setSnackbar({
                open: true,
                message: 'Không thể xóa trả lời, vui lòng thử lại sau',
                severity: 'error'
            });
        }
    };
    
    // Check if user can modify a review
    const canModifyReviewCheck = (review) => {
        if (!user || !review) return false;
        
        // Nếu user là admin hoặc moderator, cho phép sửa/xóa bất kỳ review nào
        if (user.roles && (user.roles.some(role => role.name === "ADMIN") || 
                          user.roles.some(role => role.name === "STAFF"))) {
            return true;
        }
        
        // Người dùng chỉ có thể sửa/xóa review của chính họ
        // Check if the current user is the author of the review
        return isAuthenticated && user && ((review.user && review.user.id === user.id) || (review.userId && review.userId === user.id));
    };
    
    // Check if user can reply to a review
    const canReplyToReviewCheck = (review) => {
        if (!user || !product) return false;
        
        // Admin có thể trả lời bất kỳ review nào
        if (user.roles && user.roles.some(role => role.name === "ADMIN")) {
            return true;
        }
          // Moderator có thể trả lời tất cả review
        if (user.roles && user.roles.some(role => role.name === "STAFF")) {
            return true;
        }
        
        // Seller chỉ có thể trả lời review cho sản phẩm của họ
        if (user.roles && user.roles.some(role => role.name === "SELLER") && 
            product.store && product.store.seller) {
            return product.store.seller.id === user.id;
        }
        
        return false;
    };
    
    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    
    // Handle snackbar close
    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };
    
    // Handle page change for related products pagination
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };
    
    // Get current related products based on pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentRelatedProducts = relatedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    
    // Hàm xử lý thêm sản phẩm vào giỏ hàng
    const handleAddToCart = () => {
        if (!product) return;
        
        if (!isAuthenticated) {
            setSnackbar({
                open: true,
                message: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
                severity: 'warning'
            });
            return;
        }
        
        // Kiểm tra số lượng sản phẩm
        if (quantity <= 0) {
            setSnackbar({
                open: true,
                message: 'Vui lòng chọn số lượng hợp lệ',
                severity: 'error'
            });
            return;
        }
        
        try {
            // Lấy giỏ hàng từ localStorage hoặc tạo mới nếu chưa có
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            const existingItemIndex = cart.findIndex(item => item.id === product.id);
            
            if (existingItemIndex >= 0) {
                // Nếu có, cập nhật số lượng
                cart[existingItemIndex].quantity += quantity;
            } else {
                // Nếu chưa, thêm mới vào giỏ hàng
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: quantity,
                    store: product.store ? product.store.name : null
                });
            }
            
            // Lưu giỏ hàng vào localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Hiển thị thông báo thành công
            setSnackbar({
                open: true,
                message: 'Đã thêm sản phẩm vào giỏ hàng',
                severity: 'success'
            });
            
            // Cập nhật số lượng sản phẩm trong giỏ hàng ở header (nếu có)
            // Thông báo cho các component khác thông qua context hoặc redux (nếu có)
        } catch (error) {
            console.error("Error adding product to cart:", error);
            setSnackbar({
                open: true,
                message: 'Không thể thêm sản phẩm vào giỏ hàng',
                severity: 'error'
            });
        }
    };
    
    // Placeholder images for product gallery
    const getProductImages = () => {
        // If product has multiple images, use them
        if (product?.images && product.images.length > 0) {
            return product.images;
        }
        
        // If single image, create array with main image plus placeholders
        return [
            product?.image || "https://via.placeholder.com/600x400?text=No+Image",
            "https://via.placeholder.com/600x400?text=Product+View+2",
            "https://via.placeholder.com/600x400?text=Product+View+3",
            "https://via.placeholder.com/600x400?text=Product+View+4"
        ];
    };
    
    // Format price with Vietnamese currency
    const formatPrice = (price) => {
        return price?.toLocaleString('vi-VN') + '₫';
    };
    
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
            {product?.category && (
                <Link 
                    to={`/?category=${product.category.name}`} 
                    style={{ color: 'inherit', textDecoration: 'none' }}
                >
                    {product.category.name}
                </Link>
            )}
            <Typography color="text.primary">{product?.name || 'Chi tiết sản phẩm'}</Typography>
        </Breadcrumbs>
    );
    
    // Loading skeleton
    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {renderBreadcrumbs()}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 4, boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                {[1, 2, 3, 4].map((_, index) => (
                                    <Skeleton key={index} variant="rectangular" width={80} height={80} sx={{ borderRadius: 1 }} />
                                ))}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Skeleton variant="text" height={40} width="80%" />
                            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                                <Skeleton variant="text" width={120} height={30} />
                            </Box>
                            <Skeleton variant="text" height={60} width="60%" sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={100} sx={{ mb: 3, borderRadius: 2 }} />
                            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                <Skeleton variant="rectangular" width={120} height={50} sx={{ borderRadius: 2 }} />
                                <Skeleton variant="rectangular" width={200} height={50} sx={{ borderRadius: 2 }} />
                            </Box>
                            <Skeleton variant="text" height={30} width="90%" />
                            <Skeleton variant="text" height={30} width="70%" />
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        );
    }
    
    // If product not found
    if (!product && !loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Paper elevation={0} sx={{ p: 5, borderRadius: 3, textAlign: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.05)' }}>
                    <Typography variant="h5" gutterBottom>
                        Không tìm thấy sản phẩm
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                        Sản phẩm này không tồn tại hoặc đã bị xóa.
                    </Typography>
                    <Button 
                        variant="contained" 
                        startIcon={<ArrowBackIcon />} 
                        onClick={() => navigate('/')}
                        sx={{ mt: 2, borderRadius: 2 }}
                    >
                        Quay lại trang chủ
                    </Button>
                </Paper>
            </Container>
        );
    }
    
    const productImages = getProductImages();
    
    return (
        <Box sx={{ background: 'linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%)', minHeight: '100vh', pb: 8 }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {renderBreadcrumbs()}
                
                {/* Main Product Details */}
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: { xs: 2, md: 4 }, 
                        borderRadius: 3, 
                        mb: 4, 
                        boxShadow: '0 6px 20px rgba(0,0,0,0.05)'
                    }}
                >
                    <Grid container spacing={4}>
                        {/* Left: Images */}
                        <Grid item xs={12} md={6}>
                            <Box 
                                sx={{ 
                                    borderRadius: 3, 
                                    overflow: 'hidden', 
                                    mb: 2, 
                                    height: 400, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    backgroundColor: '#f5f5f5' 
                                }}
                            >
                                <Box 
                                    component="img" 
                                    src={productImages[selectedImage]} 
                                    alt={product.name}
                                    sx={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '100%', 
                                        objectFit: 'contain',
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                            transform: 'scale(1.05)'
                                        }
                                    }}
                                />
                            </Box>
                            
                            {/* Thumbnail Images */}
                            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                                {productImages.map((img, index) => (
                                    <Box 
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        component="img"
                                        src={img}
                                        alt={`Product view ${index + 1}`}
                                        sx={{ 
                                            width: 80, 
                                            height: 80, 
                                            objectFit: 'cover', 
                                            borderRadius: 2, 
                                            cursor: 'pointer',
                                            border: index === selectedImage ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                                            opacity: index === selectedImage ? 1 : 0.7,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                opacity: 1
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Grid>
                        
                        {/* Right: Product Information */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    {product.name}
                                </Typography>
                                <IconButton 
                                    onClick={toggleFavorite}
                                    sx={{ 
                                        color: isFavorite ? 'error.main' : 'action.active',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0,0,0,0.04)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {isFavorite ? <FavoriteIcon fontSize="large" /> : <FavoriteBorderIcon fontSize="large" />}
                                </IconButton>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Rating 
                                    value={product.rating || 4.5} 
                                    precision={0.5} 
                                    readOnly 
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                    ({product.ratingCount || Math.floor(Math.random() * 50) + 10} đánh giá)
                                </Typography>
                            </Box>
                            
                            <Typography 
                                variant="h4" 
                                color="primary.main" 
                                sx={{ 
                                    fontWeight: 'bold', 
                                    mb: 3,
                                    fontSize: { xs: '1.75rem', md: '2.25rem' } 
                                }}
                            >
                                {formatPrice(product.price)}
                            </Typography>
                            
                            {/* Product Info Box */}
                            <Paper 
                                variant="outlined" 
                                sx={{ 
                                    p: 2, 
                                    mb: 3, 
                                    borderRadius: 2, 
                                    borderColor: 'divider' 
                                }}
                            >
                                <Typography variant="body1" paragraph>
                                    {product.description || "Không có mô tả sản phẩm"}
                                </Typography>
                                
                                {/* Product Attributes */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {product.category && (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1, minWidth: 100 }}>
                                                Danh mục:
                                            </Typography>
                                            <Chip 
                                                label={product.category.name} 
                                                size="small" 
                                                sx={{ borderRadius: 1 }} 
                                            />
                                        </Box>
                                    )}
                                      {product.store && (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1, minWidth: 100 }}>
                                                Cửa hàng:
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <StorefrontIcon fontSize="small" sx={{ mr: 0.5, fontSize: 18 }} />
                                                <Link 
                                                    to={`/sellers/${product.store.seller?.id}`} 
                                                    style={{ textDecoration: 'none', color: theme.palette.primary.main }}
                                                >
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                        {product.store.name}
                                                    </Typography>
                                                </Link>
                                            </Box>
                                        </Box>
                                    )}
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1, minWidth: 100 }}>
                                            Tình trạng:
                                        </Typography>
                                        <Chip 
                                            icon={<VerifiedIcon />}
                                            label="Còn hàng" 
                                            color="success" 
                                            size="small" 
                                            sx={{ borderRadius: 1 }} 
                                        />
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1, minWidth: 100 }}>
                                            Giao hàng:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <LocalShippingIcon fontSize="small" sx={{ mr: 0.5, fontSize: 18 }} />
                                            <Typography variant="body2">
                                                Giao hàng 2-5 ngày
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                            
                            {/* Quantity Section */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                <Typography variant="body1" sx={{ mr: 2 }}>Số lượng:</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        disabled={quantity <= 1}
                                        sx={{ 
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1
                                        }}
                                    >
                                        <RemoveIcon fontSize="small" />
                                    </IconButton>
                                    <TextField
                                        value={quantity}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val)) handleQuantityChange(val);
                                        }}
                                        inputProps={{ 
                                            min: 1, 
                                            style: { textAlign: 'center' } 
                                        }}
                                        variant="outlined"
                                        size="small"
                                        sx={{ 
                                            width: 60, 
                                            mx: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1
                                            }
                                        }}
                                    />
                                    <IconButton 
                                        size="small" 
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                        disabled={quantity >= (product.stock || 10)}
                                        sx={{ 
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1
                                        }}
                                    >
                                        <AddIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                            
                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    startIcon={<ShoppingCartIcon />}
                                    onClick={handleAddToCart}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.5,
                                        px: 4,
                                        flexGrow: 1,
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        '&:hover': {
                                            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                                        }
                                    }}
                                >
                                    Thêm vào giỏ hàng
                                </Button>
                                
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="large"
                                    startIcon={<FlashOnIcon />} // Added icon
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.5,
                                        px: 3,
                                        borderWidth: 2,
                                        textTransform: 'none',
                                        fontWeight: 'bold'
                                    }}                                    onClick={() => {
                                        handleAddToCart();
                                        // Redirect to checkout page if implemented
                                        navigate('/checkout');
                                    }}
                                >
                                    Mua ngay
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
                
                {/* Product Details Tabs */}
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
                                py: 2,
                                // Add minHeight to ensure consistent tab height with icons
                                minHeight: 72 // Adjust as needed
                            }
                        }}
                    >
                        <Tab label="Thông tin chi tiết" icon={<InfoOutlinedIcon />} iconPosition="start" />
                        <Tab label="Đánh giá" icon={<RateReviewOutlinedIcon />} iconPosition="start" />
                        <Tab label="Hướng dẫn" icon={<HelpOutlineOutlinedIcon />} iconPosition="start" />
                    </Tabs>
                    
                    <Box sx={{ p: 3 }}>
                        {/* Tab 1: Product Details */}
                        {activeTab === 0 && (
                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Thông tin sản phẩm
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {product.description || "Không có thông tin chi tiết về sản phẩm này."}
                                </Typography>
                                
                                {/* Product Specifications */}
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
                                    Thông số kỹ thuật
                                </Typography>
                                
                                {product.specifications ? (
                                    <Box>
                                        {Object.entries(product.specifications).map(([key, value]) => (
                                            <Box 
                                                key={key} 
                                                sx={{ 
                                                    display: 'flex', 
                                                    py: 1.5,
                                                    borderBottom: '1px solid',
                                                    borderColor: 'divider'
                                                }}
                                            >
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        width: '30%', 
                                                        color: 'text.secondary', 
                                                        fontWeight: 'medium' 
                                                    }}
                                                >
                                                    {key}
                                                </Typography>
                                                <Typography variant="body2" sx={{ width: '70%' }}>
                                                    {value}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Không có thông số kỹ thuật cho sản phẩm này.
                                    </Typography>
                                )}
                                
                                {/* FAQ Section */}
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
                                    Câu hỏi thường gặp
                                </Typography>
                                
                                <Box sx={{ mt: 2 }}>
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography fontWeight="medium">Sản phẩm có bảo hành không?</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography>
                                                Có, sản phẩm được bảo hành chính hãng 12 tháng kể từ ngày mua.
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                    
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography fontWeight="medium">Chính sách đổi trả như thế nào?</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography>
                                                Sản phẩm có thể đổi trả trong vòng 7 ngày kể từ ngày nhận hàng nếu có lỗi từ nhà sản xuất.
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                    
                                    <Accordion>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography fontWeight="medium">Thời gian giao hàng mất bao lâu?</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography>
                                                Thời gian giao hàng thông thường từ 2-5 ngày làm việc tùy thuộc vào khu vực của bạn.
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                </Box>
                            </Box>
                        )}
                          {/* Tab 2: Reviews */}
                        {activeTab === 1 && (
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        Đánh giá từ khách hàng
                                    </Typography>
                                    <Button 
                                        variant="outlined" 
                                        startIcon={<StarIcon />}
                                        onClick={handleOpenReviewDialog}
                                        sx={{ borderRadius: 2, textTransform: 'none' }}
                                    >
                                        Viết đánh giá
                                    </Button>
                                </Box>
                                
                                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h3" color="primary" fontWeight="bold">
                                            {product.rating || 0}
                                        </Typography>
                                        <Rating value={product.rating || 0} precision={0.5} readOnly size="large" />
                                        <Typography variant="body2" color="text.secondary">
                                            {product.ratingCount || 0} đánh giá
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ flexGrow: 1 }}>
                                        {[5, 4, 3, 2, 1].map((rating) => {
                                            // Calculate percentage based on actual reviews
                                            const reviewsWithRating = reviews.filter(r => Math.round(r.rating) === rating).length;
                                            const percentage = reviews.length > 0 
                                                ? Math.round((reviewsWithRating / reviews.length) * 100) 
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
                                                                bgcolor: theme.palette.primary.main, 
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
                                
                                {/* Review List */}
                                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                    Tất cả đánh giá
                                </Typography>
                                
                                {reviewsLoading ? (
                                    <Box sx={{ py: 3 }}>
                                        <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                                        <Skeleton variant="text" height={20} width="30%" sx={{ mb: 1 }} />
                                        <Skeleton variant="rectangular" height={80} sx={{ mb: 3, borderRadius: 2 }} />
                                        
                                        <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
                                        <Skeleton variant="text" height={20} width="30%" sx={{ mb: 1 }} />
                                        <Skeleton variant="rectangular" height={80} sx={{ mb: 3, borderRadius: 2 }} />
                                    </Box>
                                ) : reviews.length > 0 ? (
                                    <List>
                                        {reviews.map(review => (
                                            <Box key={review.id} sx={{ mb: 3 }}>
                                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar 
                                                                src={review.user?.avatar} 
                                                                sx={{ width: 36, height: 36, mr: 1.5 }}
                                                            >
                                                                <PersonIcon />
                                                            </Avatar>                                            <Box>                                                                <Typography fontWeight="bold">
                                                                    {review.user?.fullName || review.user?.username || (review.userId ? `Người dùng #${review.userId}` : "Người dùng không xác định")}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {new Date(review.createdAt || review.createdDate).toLocaleDateString('vi-VN', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                          {canModifyReviewCheck(review) && (
                                                            <Box>
                                                                <IconButton 
                                                                    size="small" 
                                                                    onClick={() => handleEditReview(review)}
                                                                    sx={{ mr: 0.5 }}
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton 
                                                                    size="small" 
                                                                    onClick={() => handleDeleteReview(review.id)}
                                                                    color="error"
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    
                                                    <Rating value={review.rating} readOnly size="small" sx={{ my: 1 }} />
                                                    
                                                    <Typography variant="body1" paragraph sx={{ mt: 1 }}>
                                                        {review.comment}
                                                    </Typography>
                                                      {canReplyToReviewCheck(review) && (
                                                        <Button
                                                            startIcon={<ReplyIcon />}
                                                            size="small"
                                                            sx={{ mt: 1, textTransform: 'none' }}
                                                            onClick={() => handleOpenReplyDialog(review.id)}
                                                        >
                                                            Trả lời
                                                        </Button>
                                                    )}
                                                    
                                                    {/* Review Replies */}
                                                    {review.replies && review.replies.length > 0 && (
                                                        <Box sx={{ ml: 4, mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                                                            {review.replies.map(reply => (
                                                                <Box key={reply.id} sx={{ mb: 2 }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                            <Avatar 
                                                                                src={reply.user?.avatar} 
                                                                                sx={{ width: 24, height: 24, mr: 1 }}
                                                                            >
                                                                                <PersonIcon fontSize="small" />
                                                                            </Avatar>                                                            <Typography variant="subtitle2" fontWeight="bold">
                                                                                {reply.user?.fullName || reply.user?.username || (reply.userId ? `Người dùng #${reply.userId}` : "Người dùng không xác định")}
                                                                                {(reply.user?.roles?.some(role => role.name === 'ROLE_SELLER') || reply.isFromSeller) && (
                                                                                    <Chip 
                                                                                        label="Người bán" 
                                                                                        size="small" 
                                                                                        color="primary" 
                                                                                        sx={{ ml: 1, height: 20, fontSize: '0.6rem' }} 
                                                                                    />
                                                                                )}
                                                                            </Typography>
                                                                        </Box>                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {new Date(reply.createdAt || reply.createdDate || new Date()).toLocaleDateString('vi-VN', {
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric'
                                                                            })}
                                                                        </Typography>
                                                                    </Box>                                                                    <Typography variant="body2" sx={{ ml: 4 }}>
                                                                        {reply.comment || "Không có nội dung"}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Paper>
                                            </Box>
                                        ))}
                                    </List>
                                ) : (
                                    <Box sx={{ py: 4, textAlign: 'center' }}>
                                        <Typography variant="body1" color="text.secondary">
                                            Sản phẩm này chưa có đánh giá nào.
                                        </Typography>
                                        <Button 
                                            variant="contained" 
                                            startIcon={<StarIcon />}
                                            onClick={handleOpenReviewDialog}
                                            sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
                                        >
                                            Trở thành người đầu tiên đánh giá
                                        </Button>
                                    </Box>
                                )}
                                
                                {reviews.length > 5 && (
                                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                                        <Button 
                                            variant="outlined" 
                                            color="primary"
                                            startIcon={<ReadMoreIcon />} // Added icon
                                            sx={{ borderRadius: 2, textTransform: 'none' }}
                                        >
                                            Xem thêm đánh giá
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        )}
                        
                        {/* Tab 3: Usage Guide */}
                        {activeTab === 2 && (
                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Hướng dẫn sử dụng
                                </Typography>
                                
                                <Typography variant="body1" paragraph>
                                    Sản phẩm này có thể được sử dụng theo các bước sau:
                                </Typography>
                                
                                <Box component="ol" sx={{ pl: 2 }}>
                                    <Typography component="li" variant="body1" paragraph>
                                        Kiểm tra sản phẩm sau khi nhận hàng để đảm bảo không có hư hỏng.
                                    </Typography>
                                    <Typography component="li" variant="body1" paragraph>
                                        Đọc kỹ hướng dẫn sử dụng đi kèm theo sản phẩm.
                                    </Typography>
                                    <Typography component="li" variant="body1" paragraph>
                                        Làm theo các bước được hướng dẫn trong sách hướng dẫn.
                                    </Typography>
                                    <Typography component="li" variant="body1" paragraph>
                                        Liên hệ với dịch vụ khách hàng nếu có bất kỳ vấn đề gì.
                                    </Typography>
                                </Box>
                                
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
                                    Lưu ý khi sử dụng
                                </Typography>
                                
                                <Box component="ul" sx={{ pl: 2 }}>
                                    <Typography component="li" variant="body1" paragraph>
                                        Tránh tiếp xúc với nước và độ ẩm cao.
                                    </Typography>
                                    <Typography component="li" variant="body1" paragraph>
                                        Không để sản phẩm ở nơi có nhiệt độ cao hoặc dưới ánh nắng trực tiếp.
                                    </Typography>
                                    <Typography component="li" variant="body1" paragraph>
                                        Vệ sinh sản phẩm thường xuyên theo hướng dẫn.
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Paper>
                
                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Sản phẩm liên quan
                        </Typography>
                        <Grid container spacing={3} alignItems="stretch">
                            {currentRelatedProducts.map((relatedProd) => (
                                <Grid item xs={12} sm={6} md={3} key={relatedProd.id} sx={{ display: 'flex' }}>
                                    <Card sx={{ 
                                        width: '100%',
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        height: 340, // Fixed card height
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 16px rgba(0,0,0,0.12)'
                                        }
                                    }}>
                                        {/* Product Image - Fixed height container */}
                                        <Box sx={{ 
                                            width: 270,
                                            height: 160, // Fixed image container height
                                            backgroundColor: '#f5f5f5',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            padding: 0,
                                            overflow: 'hidden'
                                        }}>
                                            <Box
                                                component="img"
                                                src={relatedProd.image || "https://via.placeholder.com/300x200?text=No+Image"}
                                                alt={relatedProd.name}
                                                sx={{ 
                                                    width: 'auto',
                                                    height: 'auto',
                                                    maxWidth: '80%',
                                                    maxHeight: '80%',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        </Box>
                                        
                                        {/* Product Content - Fixed layout */}
                                        <Box sx={{ 
                                            p: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: 180, // Fixed content container height
                                            boxSizing: 'border-box'
                                        }}>
                                            {/* Product Name - Fixed height */}
                                            <Box sx={{ height: 52, mb: 1, overflow: 'hidden' }}>
                                                <Typography 
                                                    variant="subtitle1" 
                                                    fontWeight="medium" 
                                                    component={Link} 
                                                    to={`/products/${relatedProd.id}`}
                                                    title={relatedProd.name}
                                                    sx={{
                                                        textDecoration: 'none', 
                                                        color: 'inherit', 
                                                        '&:hover': { color: 'primary.main' },
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        lineHeight: '1.3em',
                                                        height: '2.6em'
                                                    }}
                                                >
                                                    {relatedProd.name}
                                                </Typography>
                                            </Box>
                                            
                                            {/* Rating - Fixed height */}
                                            <Box sx={{ height: 24, mb: 2 }}>
                                                <Rating 
                                                    value={relatedProd.rating || 0} 
                                                    precision={0.5} 
                                                    readOnly 
                                                    size="small"
                                                />
                                            </Box>
                                            
                                            {/* Price - Fixed position at bottom */}
                                            <Box sx={{ mt: 'auto', height: 30 }}>
                                                <Typography 
                                                    variant="h6" 
                                                    color="primary.main"
                                                    fontWeight="bold"
                                                >
                                                    {formatPrice(relatedProd.price)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        
                        {/* Pagination Component */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Pagination 
                                    count={totalPages} 
                                    page={currentPage} 
                                    onChange={handlePageChange} 
                                    color="primary"
                                    size="large"
                                    sx={{
                                        '& .MuiPaginationItem-root': {
                                            borderRadius: 2,
                                            mx: 0.5
                                        }
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                )}
            </Container>
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
            
            {/* Product Review Dialog */}
            <Dialog 
                open={reviewDialogOpen} 
                onClose={handleCloseReviewDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    {editingReview ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 1 }}>
                        <Typography variant="body1" sx={{ mr: 2 }}>Đánh giá của bạn:</Typography>
                        <Rating
                            value={newReview.rating}
                            onChange={(event, newValue) => {
                                setNewReview({ ...newReview, rating: newValue });
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
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này"
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button 
                        onClick={handleCloseReviewDialog}
                        variant="outlined"
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleReviewSubmit}
                        variant="contained"
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                        disabled={!newReview.rating || !newReview.comment}
                    >
                        {editingReview ? 'Cập nhật' : 'Đăng đánh giá'}
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Reply Dialog */}
            <Dialog 
                open={replyDialogOpen} 
                onClose={handleCloseReplyDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    Trả lời đánh giá
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Nội dung trả lời"
                        multiline
                        rows={3}
                        fullWidth
                        variant="outlined"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Nhập nội dung trả lời của bạn"
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button 
                        onClick={handleCloseReplyDialog}
                        variant="outlined"
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleReplySubmit}
                        variant="contained"
                        startIcon={<SendIcon />}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                        disabled={!replyContent.trim()}
                    >
                        Gửi
                    </Button>
                </DialogActions>            </Dialog>
            
        </Box>
    );
    
};
export default ProductDetail;
