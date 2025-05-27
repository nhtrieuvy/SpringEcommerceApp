import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { authApi, endpoint, defaultApi } from '../configs/Apis';
import { useAuth } from '../configs/MyContexts';
import { formatCurrency } from '../utils/FormatUtils';

// MUI imports
import {
  Container, Box, Grid, Paper, Typography, Button, CircularProgress,
  Alert, Card, CardMedia, CardContent, CardActions, Rating, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Snackbar, IconButton, Autocomplete, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
  OutlinedInput, InputAdornment, Checkbox, FormGroup, FormControlLabel,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Accordion, AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Compare as CompareIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import '../styles/ProductComparison.css';
import '../styles/CartStyles.css';


const ProductComparison = () => {
    const [products, setProducts] = useState([]); // Selected products for comparison
    const [allCategoryProducts, setAllCategoryProducts] = useState([]); // All products in category
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);
    const [productListDialogOpen, setProductListDialogOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [currentCategoryId, setCurrentCategoryId] = useState(null);
    const [selectedProductIds, setSelectedProductIds] = useState(new Set());
    const [localSearchTerm, setLocalSearchTerm] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    
    // Enhanced filter products with multiple filter criteria
    const [filterOptions, setFilterOptions] = useState({
        minPrice: '',
        maxPrice: '',
        minRating: 0,
        inStockOnly: false
    });
    
    const { categoryId, productId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    
    // Cart animation refs
    const cartButtonRefs = useRef({});
    
    // Get categoryId or productId from query params if not in URL params
    const queryParams = new URLSearchParams(location.search);
    const queryCategoryId = queryParams.get('categoryId');
    const queryProductId = queryParams.get('productId');
    
    const effectiveCategoryId = categoryId || queryCategoryId;
    const effectiveProductId = productId || queryProductId;

    // Fetch products for comparison by category
    const fetchProductComparison = async (categoryId) => {
        try {
            const res = await defaultApi.get(endpoint['product-comparison'](categoryId));
            return res.data;
        } catch (ex) {
            console.error("Lỗi khi lấy dữ liệu so sánh sản phẩm:", ex);
            throw ex;
        }
    };

    // Fetch products for comparison by product
    const fetchProductComparisonByProduct = async (productId) => {
        try {
            const res = await defaultApi.get(endpoint['product-compare-with'](productId));
            return res.data;
        } catch (ex) {
            console.error("Lỗi khi lấy dữ liệu so sánh sản phẩm:", ex);
            throw ex;
        }
    };

    // Fetch all products in a category
    const fetchCategoryProducts = async (categoryId) => {
        try {
            const res = await defaultApi.get(`${endpoint.SEARCH_PRODUCTS}?categoryId=${categoryId}&size=100`);
            return res.data;
        } catch (ex) {
            console.error("Lỗi khi lấy sản phẩm trong danh mục:", ex);
            return [];
        }
    };    // Search products - now strictly enforcing category match
    const searchProducts = async (term) => {
        try {
            if (!term || term.length < 2) return [];
            setSearchLoading(true);
            
            // Always require a category ID to ensure products are of the same type
            if (!currentCategoryId) {
                setSnackbarMessage('Vui lòng chọn danh mục sản phẩm trước khi tìm kiếm');
                setSnackbarSeverity('warning');
                setSnackbarOpen(true);
                return [];
            }
            
            // Always include category filter to ensure we only get comparable products
            const searchEndpoint = `${endpoint.SEARCH_PRODUCTS}?q=${encodeURIComponent(term)}&categoryId=${currentCategoryId}&size=50`;
            
            const res = await defaultApi.get(searchEndpoint);
            return res.data;
        } catch (ex) {
            console.error("Lỗi khi tìm kiếm sản phẩm:", ex);
            return [];
        } finally {
            setSearchLoading(false);
        }
    };    // Handle product search with category validation
    const handleSearch = async (term) => {
        if (term.length >= 2) {
            if (!currentCategoryId && products.length > 0) {
                // Extract category ID from the first product if not explicitly set
                const firstProductCategoryId = products[0].category?.id || 
                    (products[0].categoryId ? products[0].categoryId : null);
                
                if (firstProductCategoryId) {
                    // Set current category ID for future searches
                    setCurrentCategoryId(firstProductCategoryId);
                }
            }
            
            const results = await searchProducts(term);
            
            // Double check that all results match our category
            const categoryFilteredResults = results.filter(product => {
                const productCategoryId = product.category?.id || product.categoryId;
                return productCategoryId && productCategoryId.toString() === currentCategoryId.toString();
            });
            
            // Filter out products already in comparison
            const filteredResults = categoryFilteredResults.filter(product => 
                !selectedProductIds.has(product.id || product.productId)
            );
            
            setSearchResults(filteredResults);
        } else {
            setSearchResults([]);
        }
    };    // Filter products locally in the category - ensuring same category only
    const filterProducts = (searchTerm, options = filterOptions) => {
        if (!allCategoryProducts.length) return;
        
        // First ensure we only have products from the selected category
        let filtered = [...allCategoryProducts].filter(product => {
            // If no current category ID set yet but we have products, use the first product's category
            if (!currentCategoryId && products.length > 0) {
                const firstProductCategoryId = products[0].category?.id || 
                    products[0].categoryId || 
                    (products[0].category ? products[0].category.id : null);
                
                if (firstProductCategoryId) {
                    return (product.category?.id || product.categoryId || '').toString() === firstProductCategoryId.toString();
                }
                return true; // If we can't determine, show all
            } 
            // Otherwise use the currently set category ID
            else if (currentCategoryId) {
                return (product.category?.id || product.categoryId || '').toString() === currentCategoryId.toString();
            }
            return true; // If no context for filtering, show all
        });
        
        // Text search filtering
        if (searchTerm && searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(term) ||
                (product.description && product.description.toLowerCase().includes(term)) ||
                (product.storeName && product.storeName.toLowerCase().includes(term))
            );
        }
        
        // Price range filtering
        if (options.minPrice && !isNaN(options.minPrice)) {
            filtered = filtered.filter(product => product.price >= parseFloat(options.minPrice));
        }
        
        if (options.maxPrice && !isNaN(options.maxPrice)) {
            filtered = filtered.filter(product => product.price <= parseFloat(options.maxPrice));
        }
        
        // Rating filtering
        if (options.minRating > 0) {
            filtered = filtered.filter(product => (product.averageRating || 0) >= options.minRating);
        }
        
        // In-stock only filtering
        if (options.inStockOnly) {
            filtered = filtered.filter(product => product.quantity > 0);
        }
        
        setFilteredProducts(filtered);
    };

    // Handle filter options change
    const handleFilterChange = (field, value) => {
        const newOptions = { ...filterOptions, [field]: value };
        setFilterOptions(newOptions);
        filterProducts(localSearchTerm, newOptions);
    };    // Handle adding a product to comparison with category validation
    const addToComparison = (product) => {
        if (!product) return;
        
        // Extract category information from product
        const productCategoryId = product.category?.id || product.categoryId;
        const productCategoryName = product.category?.name || product.categoryName;
        
        // Verify product is in the same category as existing products
        if (products.length > 0) {
            // Get the category of the first product for comparison
            const existingCategoryId = products[0].category?.id || 
                products[0].categoryId || 
                (products[0].category ? products[0].category.id : null);
            
            // Check if categories match
            if (existingCategoryId && productCategoryId && 
                existingCategoryId.toString() !== productCategoryId.toString()) {
                // Show error if product is from a different category
                setSnackbarMessage('Chỉ có thể so sánh các sản phẩm cùng loại với nhau');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
            }
            
            // If no categoryId yet, set it from the first product
            if (!currentCategoryId && existingCategoryId) {
                setCurrentCategoryId(existingCategoryId);
            }
        } else if (productCategoryId) {
            // If this is the first product, set the category ID
            setCurrentCategoryId(productCategoryId);
        }
        
        // Add the product to the selectedProductIds set
        setSelectedProductIds(prev => {
            const newSet = new Set(prev);
            newSet.add(product.id || product.productId);
            return newSet;
        });
        
        // If the product is not already in the products array, add it
        const productId = product.id || product.productId;
        const alreadyExists = products.some(p => (p.id || p.productId) === productId);
        
        if (!alreadyExists) {
            // Convert format if needed
            const formattedProduct = product.productName ? product : {
                productId: product.id,
                productName: product.name,
                price: product.price,
                imageUrl: product.image,
                description: product.description,
                storeName: product.storeName || (product.store ? product.store.name : ''),
                storeId: product.storeId || (product.store ? product.store.id : ''),
                quantity: product.quantity || 0,
                averageRating: product.averageRating || 0,
                reviewCount: product.reviewCount || 0,
                categoryId: productCategoryId,
                categoryName: productCategoryName || (product.category ? product.category.name : ''),
                inStock: product.quantity > 0,
                storeAddress: product.storeAddress || (product.store ? product.store.address : ''),
                priceComparisonPercent: 0
            };
            
            setProducts(prev => [...prev, formattedProduct]);
        }
        
        setSearchDialogOpen(false);
        setProductListDialogOpen(false);
        
        setSnackbarMessage('Đã thêm sản phẩm vào danh sách so sánh');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    };
    
    // Remove a product from comparison
    const removeFromComparison = (productId) => {
        setProducts(prev => prev.filter(p => (p.id || p.productId) !== productId));
        
        setSelectedProductIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
        });
        
        setSnackbarMessage('Đã xóa sản phẩm khỏi danh sách so sánh');
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
    };

    useEffect(() => {
        const loadComparisonData = async () => {
            setLoading(true);
            try {
                let data;
                let categoryId;
                
                if (effectiveProductId) {
                    data = await fetchProductComparisonByProduct(effectiveProductId);
                    
                    // Set the category ID from the first product if available
                    if (data && data.length > 0 && data[0].category && data[0].category.id) {
                        categoryId = data[0].category.id;
                    } else if (data && data.length > 0) {
                        // Get the product to find its category
                        const product = await defaultApi.get(endpoint.GET_PRODUCT_BY_ID(effectiveProductId));
                        if (product.data && product.data.category) {
                            categoryId = product.data.category.id;
                        }
                    }
                } else if (effectiveCategoryId) {
                    data = await fetchProductComparison(effectiveCategoryId);
                    categoryId = effectiveCategoryId;
                } else {
                    throw new Error("Không tìm thấy thông số danh mục hoặc sản phẩm để so sánh");
                }
                
                if (data && data.length > 0) {
                    setProducts(data);
                    
                    // Set selected product IDs
                    const ids = new Set(data.map(p => p.productId || p.id));
                    setSelectedProductIds(ids);
                    
                    // Store the category ID for future use
                    setCurrentCategoryId(categoryId);
                    
                    // Load all products in this category
                    if (categoryId) {
                        const allProducts = await fetchCategoryProducts(categoryId);
                        setAllCategoryProducts(allProducts);
                        setFilteredProducts(allProducts);
                    }
                } else {
                    setError("Không tìm thấy sản phẩm để so sánh");
                }
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu so sánh:", err);
                setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu so sánh sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        loadComparisonData();
    }, [effectiveCategoryId, effectiveProductId]);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);
    
    // Filter local products
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            filterProducts(localSearchTerm);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [localSearchTerm, allCategoryProducts]);
    
    // Recalculate price comparison percentages and find best products whenever products change
    useEffect(() => {
        if (products.length > 0) {
            // Calculate average price
            const avgPrice = products.reduce((total, p) => total + p.price, 0) / products.length;
            
            // Calculate lowest price and highest rating
            const lowestPrice = Math.min(...products.map(p => p.price));
            const highestRating = Math.max(...products.map(p => p.averageRating || 0));
            
            // Update products with price comparison and best indicators
            const updatedProducts = products.map(product => {
                // Calculate price comparison percentage against average
                const priceComparisonPercent = avgPrice > 0 
                    ? ((product.price - avgPrice) / avgPrice) * 100 
                    : 0;
                    
                // Determine if this is the best price 
                // (allowing for tiny floating point differences)
                const bestPrice = Math.abs(product.price - lowestPrice) < 0.01;
                
                // Determine if this is the best rated product
                // (allowing for tiny floating point differences)
                const bestRated = Math.abs((product.averageRating || 0) - highestRating) < 0.01 && highestRating > 0;
                
                return {
                    ...product,
                    priceComparisonPercent,
                    bestPrice,
                    bestRated,
                    priceDifference: product.price - avgPrice
                };
            });
            
            // Sort products by price (lowest first) if user has selected fewer than 6 products
            // This makes comparison easier by placing best deals first
            let sortedProducts = [...updatedProducts];
            if (sortedProducts.length < 6) {
                sortedProducts.sort((a, b) => a.price - b.price);
            }
            
            setProducts(sortedProducts);
        }
    }, [products.length, selectedProductIds]);

    // Format price comparison percentage
    const formatPercentage = (percent) => {
        if (percent > 0) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                    <ArrowUpIcon fontSize="small" />
                    <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                        {Math.abs(percent).toFixed(1)}% cao hơn TB
                    </Typography>
                </Box>
            );
        } else if (percent < 0) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                    <ArrowDownIcon fontSize="small" />
                    <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
                        {Math.abs(percent).toFixed(1)}% thấp hơn TB
                    </Typography>
                </Box>
            );
        } else {
            return (
                <Typography variant="body2" color="text.secondary">
                    Giá trung bình
                </Typography>
            );
        }
    };

    // Handle add to cart action
    const handleAddToCart = async (product) => {
        if (!isAuthenticated) {
            setSnackbarMessage('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
            return;
        }
        
        try {
            // Create product object for API
            const productForCart = {
                id: product.productId,
                name: product.productName,
                price: product.price,
                image: product.imageUrl
            };
            
            // Use API directly instead of CartService
            await authApi().post(endpoint.ADD_TO_CART, {
                productId: productForCart.id,
                quantity: 1
            });
            
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            
            // Trigger cart animation if we have a reference to the button
            if (cartButtonRefs.current[product.productId]) {
                cartButtonRefs.current[product.productId].classList.add('button-added-to-cart');
                setTimeout(() => {
                    if (cartButtonRefs.current[product.productId]) {
                        cartButtonRefs.current[product.productId].classList.remove('button-added-to-cart');
                    }
                }, 2000);
            }
            
            // Show success message
            setSnackbarMessage('Đã thêm sản phẩm vào giỏ hàng');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error adding product to cart:", error);
            setSnackbarMessage('Không thể thêm sản phẩm vào giỏ hàng');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    // Navigate to product detail
    const viewProductDetail = (productId) => {
        navigate(`/products/${productId}`);
    };

    // Close snackbar message
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };
    
    // Open the product list dialog to select products
    const openProductList = () => {
        setProductListDialogOpen(true);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Đang tải dữ liệu so sánh sản phẩm...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 5 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="h6" component="div">
                        Có lỗi xảy ra!
                    </Typography>
                    <Typography variant="body1">{error}</Typography>
                </Alert>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="outlined" color="error" onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 4 }}>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            
            <Typography variant="h4" component="h2" gutterBottom align="center">
                So sánh sản phẩm cùng loại
            </Typography>
            
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                {products.length > 0 && (
                    <Typography variant="body1" sx={{ mb: { xs: 2, md: 0 } }}>
                        Danh mục: <strong>{products[0].categoryName}</strong> | {products.length} sản phẩm so sánh
                    </Typography>
                )}
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<SearchIcon />}
                        onClick={() => setSearchDialogOpen(true)}
                    >
                        Tìm sản phẩm
                    </Button>
                    
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CompareIcon />}
                        onClick={openProductList}
                    >
                        Chọn sản phẩm để so sánh
                    </Button>
                </Box>
            </Box>
            
            {products.length === 0 && (
                <Paper sx={{ p: 4, mt: 2, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        Không có sản phẩm nào để so sánh
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Vui lòng chọn sản phẩm để thêm vào danh sách so sánh
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<AddIcon />}
                        onClick={openProductList}
                    >
                        Thêm sản phẩm
                    </Button>
                </Paper>
            )}

            {/* Enhanced search dialog for finding products by keyword */}
            <Dialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Typography variant="h6">Tìm sản phẩm để so sánh</Typography>
                    {products.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                            Đang so sánh sản phẩm trong danh mục: <strong>{products[0].categoryName}</strong>
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Chỉ có thể so sánh các sản phẩm cùng loại với nhau để đảm bảo so sánh công bằng
                    </Alert>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Tên sản phẩm"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            endAdornment: searchLoading && <CircularProgress size={20} />,
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                        placeholder="Nhập tên sản phẩm cần tìm kiếm (tối thiểu 2 ký tự)..."
                        helperText={searchTerm && searchTerm.length < 2 ? "Nhập ít nhất 2 ký tự để tìm kiếm" : ""}
                    />
                    
                    {/* Search results section with enhanced UI */}
                    {searchResults.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Kết quả tìm kiếm: {searchResults.length} sản phẩm
                            </Typography>
                            <Paper variant="outlined" sx={{ maxHeight: 350, overflow: 'auto' }}>
                                <List dense>
                                    {searchResults.map((product) => (
                                        <ListItem 
                                            key={product.id}
                                            divider
                                            button
                                            selected={selectedProduct && selectedProduct.id === product.id}
                                            onClick={() => setSelectedProduct(product)}
                                            sx={{
                                                cursor: 'pointer',
                                                bgcolor: selectedProductIds.has(product.id) ? '#e3f2fd' : 'transparent',
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar 
                                                    variant="rounded" 
                                                    src={product.image || 'https://via.placeholder.com/50'}
                                                    alt={product.name}
                                                />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={product.name}
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography variant="body2" component="span" color="primary.main">
                                                            {formatCurrency(product.price)}
                                                        </Typography>
                                                        {product.storeName && (
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                {product.storeName}
                                                            </Typography>
                                                        )}
                                                        {(product.averageRating || 0) > 0 && (
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                                <Rating value={product.averageRating || 0} size="small" readOnly precision={0.5} />
                                                                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                                                                    ({product.reviewCount || 0})
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </React.Fragment>
                                                }
                                            />
                                            {selectedProductIds.has(product.id) && (
                                                <Chip 
                                                    size="small" 
                                                    color="primary" 
                                                    label="Đã chọn" 
                                                />
                                            )}
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Box>
                    )}
                    
                    {searchTerm && searchTerm.length >= 2 && searchResults.length === 0 && !searchLoading && (
                        <Box sx={{ mt: 2, textAlign: 'center', p: 2 }}>
                            <Typography variant="body1" color="textSecondary">
                                Không tìm thấy sản phẩm nào phù hợp
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                Thử tìm kiếm với từ khóa khác hoặc chọn sản phẩm từ danh mục
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSearchDialogOpen(false)}>Đóng</Button>
                    <Button 
                        onClick={() => addToComparison(selectedProduct)} 
                        disabled={!selectedProduct || selectedProductIds.has(selectedProduct.id)}
                        variant="contained"
                        startIcon={<AddIcon />}
                    >
                        {selectedProductIds.has(selectedProduct?.id) ? 'Đã thêm vào so sánh' : 'Thêm vào so sánh'}
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Product list dialog to select from category products - Enhanced with filters */}
            <Dialog open={productListDialogOpen} onClose={() => setProductListDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6">Chọn sản phẩm để so sánh</Typography>
                            {products.length > 0 && (
                                <Typography variant="caption" color="text.secondary">
                                    Đang so sánh sản phẩm trong danh mục: <strong>{products[0].categoryName}</strong>
                                </Typography>
                            )}
                        </Box>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                            Đã chọn {selectedProductIds.size} sản phẩm
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Hệ thống chỉ hiển thị các sản phẩm cùng danh mục để đảm bảo so sánh công bằng và chính xác
                    </Alert>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        {/* Search input */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Tìm kiếm trong danh mục"
                                value={localSearchTerm}
                                onChange={(e) => setLocalSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        
                        {/* Filter section */}
                        <Grid item xs={12} md={6}>
                            <Accordion sx={{ boxShadow: 'none', bgcolor: 'transparent' }}>
                                <AccordionSummary 
                                    expandIcon={<FilterListIcon />} 
                                    sx={{ p: 0 }}
                                >
                                    <Typography>Bộ lọc nâng cao</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Giá thấp nhất"
                                                type="number"
                                                value={filterOptions.minPrice}
                                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">₫</InputAdornment>
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                label="Giá cao nhất"
                                                type="number"
                                                value={filterOptions.maxPrice}
                                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">₫</InputAdornment>
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Đánh giá từ</InputLabel>
                                                <Select
                                                    value={filterOptions.minRating}
                                                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                                    label="Đánh giá từ"
                                                >
                                                    <MenuItem value={0}>Tất cả</MenuItem>
                                                    <MenuItem value={3}>3 sao trở lên</MenuItem>
                                                    <MenuItem value={4}>4 sao trở lên</MenuItem>
                                                    <MenuItem value={4.5}>4.5 sao trở lên</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox 
                                                        checked={filterOptions.inStockOnly} 
                                                        onChange={(e) => handleFilterChange('inStockOnly', e.target.checked)}
                                                    />
                                                }
                                                label="Chỉ sản phẩm còn hàng"
                                            />
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    </Grid>
                    
                    <Typography variant="subtitle2" gutterBottom>
                        Đang hiển thị {filteredProducts.length} sản phẩm
                    </Typography>
                    
                    {/* Product list */}
                    <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {filteredProducts.length > 0 ? (
                            <List dense>
                                {filteredProducts.map(product => (
                                    <ListItem 
                                        key={product.id} 
                                        divider
                                        secondaryAction={
                                            selectedProductIds.has(product.id) ? (
                                                <Button 
                                                    variant="outlined" 
                                                    color="error"
                                                    startIcon={<DeleteIcon />}
                                                    size="small"
                                                    onClick={() => removeFromComparison(product.id)}
                                                >
                                                    Bỏ chọn
                                                </Button>
                                            ) : (
                                                <Button 
                                                    variant="outlined" 
                                                    color="primary"
                                                    startIcon={<AddIcon />}
                                                    size="small"
                                                    onClick={() => addToComparison(product)}
                                                >
                                                    So sánh
                                                </Button>
                                            )
                                        }
                                        sx={{ 
                                            bgcolor: selectedProductIds.has(product.id) ? '#e3f2fd' : 'transparent',
                                            '&:hover': { bgcolor: selectedProductIds.has(product.id) ? '#e3f2fd' : '#f5f5f5' },
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar 
                                                variant="rounded" 
                                                src={product.image || 'https://via.placeholder.com/60'} 
                                                alt={product.name}
                                                sx={{ width: 60, height: 60 }}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" noWrap>
                                                    {product.name}
                                                </Typography>
                                            }
                                            secondary={
                                                <React.Fragment>
                                                    <Typography variant="body2" color="primary.main" component="span">
                                                        {formatCurrency(product.price)}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                        <Rating value={product.averageRating || 0} size="small" readOnly precision={0.5} />
                                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                                            ({product.reviewCount || 0})
                                                        </Typography>
                                                    </Box>
                                                    {product.store && (
                                                        <Typography variant="body2" color="text.secondary" noWrap>
                                                            {product.store.name}
                                                        </Typography>
                                                    )}
                                                </React.Fragment>
                                            }
                                            primaryTypographyProps={{ noWrap: true }}
                                            sx={{ ml: 1 }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body1" color="text.secondary">
                                    Không tìm thấy sản phẩm nào phù hợp
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setProductListDialogOpen(false)}>Đóng</Button>
                    <Button 
                        onClick={() => setProductListDialogOpen(false)} 
                        variant="contained"
                        disabled={selectedProductIds.size === 0}
                    >
                        Xem so sánh
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Mobile view - Card layout */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Grid container spacing={2}>
                    {products.map(product => (
                        <Grid item xs={12} sm={6} key={product.productId || product.id}>
                            <Card elevation={3} sx={{ height: '100%', position: 'relative' }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={product.imageUrl || product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                                    alt={product.productName || product.name}
                                    sx={{ objectFit: 'contain', cursor: 'pointer' }}
                                    onClick={() => viewProductDetail(product.productId || product.id)}
                                />
                                
                                <IconButton 
                                    color="error" 
                                    size="small" 
                                    sx={{ 
                                        position: 'absolute', 
                                        top: 8, 
                                        right: 8, 
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' } 
                                    }}
                                    onClick={() => removeFromComparison(product.productId || product.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                                
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <Typography 
                                            variant="h6" 
                                            component="div" 
                                            sx={{ cursor: 'pointer', mb: 1 }}
                                            onClick={() => viewProductDetail(product.productId || product.id)}
                                        >
                                            {product.productName || product.name}
                                        </Typography>
                                        <Box>
                                            {product.bestPrice && (
                                                <Chip 
                                                    size="small" 
                                                    color="success" 
                                                    label="Giá tốt nhất" 
                                                    sx={{ ml: 1, mb: 1 }} 
                                                />
                                            )}
                                            {product.bestRated && (
                                                <Chip 
                                                    size="small" 
                                                    color="warning" 
                                                    label="Đánh giá cao nhất" 
                                                    sx={{ ml: 1 }} 
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Cửa hàng: {product.storeName || (product.store ? product.store.name : '')}
                                    </Typography>
                                    
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="h6" component="div" color="primary.main">
                                            {formatCurrency(product.price)}
                                        </Typography>
                                        {formatPercentage(product.priceComparisonPercent)}
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <Rating 
                                            value={product.averageRating || 0} 
                                            precision={0.5} 
                                            readOnly 
                                            size="small" 
                                        />
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                            ({product.reviewCount || 0} đánh giá)
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mt: 1 }}>
                                        {(product.inStock || product.quantity > 0) ? (
                                            <Chip 
                                                icon={<CheckCircleIcon />} 
                                                label="Còn hàng" 
                                                color="success" 
                                                size="small" 
                                                sx={{ mr: 1 }} 
                                            />
                                        ) : (
                                            <Chip 
                                                icon={<CancelIcon />} 
                                                label="Hết hàng" 
                                                color="error" 
                                                size="small" 
                                                sx={{ mr: 1 }} 
                                            />
                                        )}
                                        <Typography variant="body2" component="span">
                                            Số lượng: {product.quantity || 0}
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button 
                                        variant="outlined" 
                                        fullWidth 
                                        onClick={() => viewProductDetail(product.productId || product.id)}
                                        sx={{ mb: 1 }}
                                    >
                                        Xem chi tiết
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        fullWidth 
                                        disabled={!(product.inStock || product.quantity > 0)}
                                        onClick={() => handleAddToCart(product)}
                                        ref={el => cartButtonRefs.current[product.productId || product.id] = el}
                                        startIcon={<ShoppingCartIcon />}
                                    >
                                        Thêm vào giỏ
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Desktop view - Table layout */}
            {products.length > 0 && (
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <TableContainer component={Paper} elevation={3}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: '20%', fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Sản phẩm</TableCell>
                                    {products.map(product => (
                                        <TableCell key={product.productId || product.id} align="center" sx={{ position: 'relative' }}>
                                            <IconButton 
                                                color="error" 
                                                size="small" 
                                                sx={{ 
                                                    position: 'absolute', 
                                                    top: 8, 
                                                    right: 8,
                                                    bgcolor: 'rgba(255,255,255,0.9)',
                                                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                                }}
                                                onClick={() => removeFromComparison(product.productId || product.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <CardMedia
                                                    component="img"
                                                    sx={{ 
                                                        height: 150, 
                                                        width: '100%', 
                                                        objectFit: 'contain',
                                                        cursor: 'pointer'
                                                    }}
                                                    image={product.imageUrl || product.image || 'https://via.placeholder.com/150?text=No+Image'}
                                                    alt={product.productName || product.name}
                                                    onClick={() => viewProductDetail(product.productId || product.id)}
                                                />
                                                <Typography 
                                                    variant="body1" 
                                                    component="div" 
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        mt: 1, 
                                                        cursor: 'pointer',
                                                        '&:hover': { textDecoration: 'underline' }
                                                    }}
                                                    onClick={() => viewProductDetail(product.productId || product.id)}
                                                >
                                                    {product.productName || product.name}
                                                </Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    {product.bestPrice && (
                                                        <Chip 
                                                            size="small" 
                                                            color="success" 
                                                            label="Giá tốt nhất" 
                                                            sx={{ mr: 1, mb: 1 }} 
                                                        />
                                                    )}
                                                    {product.bestRated && (
                                                        <Chip 
                                                            size="small" 
                                                            color="warning" 
                                                            label="Đánh giá cao nhất" 
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Giá bán</TableCell>
                                    {products.map((product) => (
                                        <TableCell key={product.productId || product.id} align="center">
                                            <Typography variant="body1" component="div" color="primary.main" fontWeight="bold">
                                                {formatCurrency(product.price)}
                                            </Typography>
                                            {formatPercentage(product.priceComparisonPercent)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Đánh giá</TableCell>
                                    {products.map(product => (
                                        <TableCell key={product.productId || product.id} align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                                                <Rating 
                                                    value={product.averageRating || 0} 
                                                    precision={0.5} 
                                                    readOnly 
                                                    size="small" 
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                ({product.reviewCount || 0} đánh giá)
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Cửa hàng</TableCell>
                                    {products.map(product => (
                                        <TableCell key={product.productId || product.id} align="center">
                                            <Typography variant="body1">{product.storeName || (product.store ? product.store.name : '')}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {product.storeAddress || (product.store ? product.store.address : '')}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Tình trạng</TableCell>
                                    {products.map(product => (
                                        <TableCell key={product.productId || product.id} align="center">
                                            {(product.inStock || product.quantity > 0) ? (
                                                <Chip 
                                                    icon={<CheckCircleIcon />} 
                                                    label={`Còn hàng (${product.quantity || 0})`} 
                                                    color="success" 
                                                    size="small" 
                                                />
                                            ) : (
                                                <Chip 
                                                    icon={<CancelIcon />} 
                                                    label="Hết hàng" 
                                                    color="error" 
                                                    size="small" 
                                                />
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Mô tả</TableCell>
                                    {products.map(product => (
                                        <TableCell key={product.productId || product.id} align="left">
                                            <Typography variant="body2" sx={{ maxHeight: '100px', overflow: 'auto' }}>
                                                {(product.description || '').substring(0, 150)}
                                                {(product.description || '').length > 150 ? '...' : ''}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Hành động</TableCell>
                                    {products.map(product => (
                                        <TableCell key={product.productId || product.id} align="center">
                                            <Button 
                                                variant="outlined" 
                                                sx={{ mr: 1, mb: { xs: 1, sm: 0 } }}
                                                onClick={() => viewProductDetail(product.productId || product.id)}
                                            >
                                                Xem chi tiết
                                            </Button>
                                            <Button 
                                                variant="contained" 
                                                color="primary" 
                                                disabled={!(product.inStock || product.quantity > 0)}
                                                startIcon={<ShoppingCartIcon />}
                                                onClick={() => handleAddToCart(product)}
                                                ref={el => cartButtonRefs.current[product.productId || product.id] = el}
                                            >
                                                Thêm vào giỏ
                                            </Button>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Container>
    );
};

export default ProductComparison;