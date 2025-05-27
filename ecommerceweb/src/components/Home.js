import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
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
    TextField,
    InputAdornment,

    Chip,
    Rating,
    Skeleton,
    IconButton,
    Pagination,
    useTheme,
    alpha,

    Collapse,
    Slider,
    FormControl,
   
    Select,
    MenuItem
    
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import FilterListIcon from '@mui/icons-material/FilterList';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import ExploreIcon from '@mui/icons-material/Explore';
import CategoryIcon from '@mui/icons-material/Category';
import StoreMallDirectoryIcon from '@mui/icons-material/StoreMallDirectory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SortIcon from '@mui/icons-material/Sort';

import defaultApi from '../configs/Apis';

const Home = () => {
    const theme = useTheme();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [openFilters, setOpenFilters] = useState(false);
    const [showNewProductsAlert, setShowNewProductsAlert] = useState(true);
    const [expandedFAQ, setExpandedFAQ] = useState(null);
    const [cardHeight, setCardHeight] = useState(null);
    const cardsRef = useRef([]);
    const [priceRange, setPriceRange] = useState([0, 10000000]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [sortOption, setSortOption] = useState('default');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [stores, setStores] = useState([]);
    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(10000000);

    // Define filteredProducts at the top level
    const filteredProducts = products.filter(product => {
        const matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = !selectedCategory ||
            (product.category && product.category.name === selectedCategory);

        const matchesPrice =
            (!priceRange[0] || (product.price >= priceRange[0])) &&
            (!priceRange[1] || (product.price <= priceRange[1]));

        const matchesStore = !selectedStore ||
            (product.store && product.store.id === selectedStore);

        return matchesSearch && matchesCategory && matchesPrice && matchesStore;
    });

    // Sort products based on selected sorting option
    const sortedProducts = useMemo(() => {
        const productsToSort = [...filteredProducts];
        switch (sortOption) {
            case 'nameAsc':
                return productsToSort.sort((a, b) => a.name.localeCompare(b.name));
            case 'nameDesc':
                return productsToSort.sort((a, b) => b.name.localeCompare(a.name));
            case 'priceAsc':
                return productsToSort.sort((a, b) => a.price - b.price);
            case 'priceDesc':
                return productsToSort.sort((a, b) => b.price - a.price);
            default:
                return productsToSort;
        }
    }, [filteredProducts, sortOption]);

    // Paginate products
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedProducts, currentPage, itemsPerPage]);

    // Get top rated products
    const topRatedProducts = [...products]
        .sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))
        .slice(0, 3);

    // Get newest products (using id as a proxy for recency)
    const newestProducts = [...products]
        .sort((a, b) => b.id - a.id)
        .slice(0, 4);

    // Function to normalize card heights
    const normalizeCardHeights = () => {
        if (cardsRef.current.length > 0) {
            // Reset heights first to get actual content height
            cardsRef.current.forEach(card => {
                if (card) card.style.height = 'auto';
            });

            // Delay measurement to ensure DOM is updated
            setTimeout(() => {
                const heights = cardsRef.current.map(card => card ? card.offsetHeight : 0);
                const maxHeight = Math.max(...heights);
                if (maxHeight > 0) {
                    setCardHeight(maxHeight);
                    cardsRef.current.forEach(card => {
                        if (card) card.style.height = `${maxHeight}px`;
                    });
                }
            }, 100);
        }
    };

    // Update card heights when products change
    useEffect(() => {
        if (!loading && filteredProducts.length > 0) {
            cardsRef.current = cardsRef.current.slice(0, filteredProducts.length);
            normalizeCardHeights();

            // Also normalize on window resize
            window.addEventListener('resize', normalizeCardHeights);
            return () => window.removeEventListener('resize', normalizeCardHeights);
        }
    }, [loading, filteredProducts]);

    // Reset card refs when filtered products change
    useEffect(() => {
        cardsRef.current = Array(filteredProducts.length).fill(null);
    }, [filteredProducts.length]); useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await defaultApi.get('/api/products');
                setProducts(response.data);

                // Extract unique categories
                const uniqueCategories = [...new Set(response.data
                    .filter(product => product.category)
                    .map(product => product.category.name))];
                setCategories(uniqueCategories);

                // Extract unique stores and their IDs
                const uniqueStores = [...new Set(response.data
                    .filter(product => product.store)
                    .map(product => ({
                        id: product.store.id,
                        name: product.store.name
                    })))];

                // Remove duplicates based on store ID
                const storeMap = new Map();
                uniqueStores.forEach(store => {
                    if (!storeMap.has(store.id)) {
                        storeMap.set(store.id, store);
                    }
                });

                setStores(Array.from(storeMap.values()));

                // Find min and max prices for price filter
                const prices = response.data
                    .map(product => product.price)
                    .filter(price => price !== undefined && price !== null);

                if (prices.length > 0) {
                    const minPrice = Math.floor(Math.min(...prices));
                    const maxPrice = Math.ceil(Math.max(...prices));
                    setPriceMin(minPrice);
                    setPriceMax(maxPrice);
                    setPriceRange([minPrice, maxPrice]);
                }

            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);
}
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
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
    TextField,
    InputAdornment,

    Chip,
    Rating,
    Skeleton,
    IconButton,
    Pagination,
    useTheme,
    alpha,

    Collapse,
    Slider,
    FormControl,
   
    Select,
    MenuItem
    
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import FilterListIcon from '@mui/icons-material/FilterList';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import ExploreIcon from '@mui/icons-material/Explore';
import CategoryIcon from '@mui/icons-material/Category';
import StoreMallDirectoryIcon from '@mui/icons-material/StoreMallDirectory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SortIcon from '@mui/icons-material/Sort';

import defaultApi from '../configs/Apis';

const Home = () => {
    const theme = useTheme();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [openFilters, setOpenFilters] = useState(false);
    const [showNewProductsAlert, setShowNewProductsAlert] = useState(true);
    const [expandedFAQ, setExpandedFAQ] = useState(null);
    const [cardHeight, setCardHeight] = useState(null);
    const cardsRef = useRef([]);
    const [priceRange, setPriceRange] = useState([0, 10000000]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [sortOption, setSortOption] = useState('default');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [stores, setStores] = useState([]);
    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(10000000);

    // Define filteredProducts at the top level
    const filteredProducts = products.filter(product => {
        const matchesSearch = !searchQuery ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory = !selectedCategory ||
            (product.category && product.category.name === selectedCategory);

        const matchesPrice =
            (!priceRange[0] || (product.price >= priceRange[0])) &&
            (!priceRange[1] || (product.price <= priceRange[1]));

        const matchesStore = !selectedStore ||
            (product.store && product.store.id === selectedStore);

        return matchesSearch && matchesCategory && matchesPrice && matchesStore;
    });

    // Sort products based on selected sorting option
    const sortedProducts = useMemo(() => {
        const productsToSort = [...filteredProducts];
        switch (sortOption) {
            case 'nameAsc':
                return productsToSort.sort((a, b) => a.name.localeCompare(b.name));
            case 'nameDesc':
                return productsToSort.sort((a, b) => b.name.localeCompare(a.name));
            case 'priceAsc':
                return productsToSort.sort((a, b) => a.price - b.price);
            case 'priceDesc':
                return productsToSort.sort((a, b) => b.price - a.price);
            default:
                return productsToSort;
        }
    }, [filteredProducts, sortOption]);

    // Paginate products
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedProducts, currentPage, itemsPerPage]);

    // Get top rated products
    const topRatedProducts = [...products]
        .sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5))
        .slice(0, 3);

    // Get newest products (using id as a proxy for recency)
    const newestProducts = [...products]
        .sort((a, b) => b.id - a.id)
        .slice(0, 4);

    // Function to normalize card heights
    const normalizeCardHeights = () => {
        if (cardsRef.current.length > 0) {
            // Reset heights first to get actual content height
            cardsRef.current.forEach(card => {
                if (card) card.style.height = 'auto';
            });

            // Delay measurement to ensure DOM is updated
            setTimeout(() => {
                const heights = cardsRef.current.map(card => card ? card.offsetHeight : 0);
                const maxHeight = Math.max(...heights);
                if (maxHeight > 0) {
                    setCardHeight(maxHeight);
                    cardsRef.current.forEach(card => {
                        if (card) card.style.height = `${maxHeight}px`;
                    });
                }
            }, 100);
        }
    };

    // Update card heights when products change
    useEffect(() => {
        if (!loading && filteredProducts.length > 0) {
            cardsRef.current = cardsRef.current.slice(0, filteredProducts.length);
            normalizeCardHeights();

            // Also normalize on window resize
            window.addEventListener('resize', normalizeCardHeights);
            return () => window.removeEventListener('resize', normalizeCardHeights);
        }
    }, [loading, filteredProducts]);

    // Reset card refs when filtered products change
    useEffect(() => {
        cardsRef.current = Array(filteredProducts.length).fill(null);
    }, [filteredProducts.length]); useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await defaultApi.get('/api/products');
                setProducts(response.data);

                // Extract unique categories
                const uniqueCategories = [...new Set(response.data
                    .filter(product => product.category)
                    .map(product => product.category.name))];
                setCategories(uniqueCategories);

                // Extract unique stores and their IDs
                const uniqueStores = [...new Set(response.data
                    .filter(product => product.store)
                    .map(product => ({
                        id: product.store.id,
                        name: product.store.name
                    })))];

                // Remove duplicates based on store ID
                const storeMap = new Map();
                uniqueStores.forEach(store => {
                    if (!storeMap.has(store.id)) {
                        storeMap.set(store.id, store);
                    }
                });

                setStores(Array.from(storeMap.values()));

                // Find min and max prices for price filter
                const prices = response.data
                    .map(product => product.price)
                    .filter(price => price !== undefined && price !== null);

                if (prices.length > 0) {
                    const minPrice = Math.floor(Math.min(...prices));
                    const maxPrice = Math.ceil(Math.max(...prices));
                    setPriceMin(minPrice);
                    setPriceMax(maxPrice);
                    setPriceRange([minPrice, maxPrice]);
                }

            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const toggleFavorite = (productId) => {
        if (favorites.includes(productId)) {
            setFavorites(favorites.filter(id => id !== productId));
        } else {
            setFavorites([...favorites, productId]);
        }
    }; const toggleFAQ = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    // Functions for filtering, sorting and pagination
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        // Scroll to top of product section when page changes
        window.scrollTo({
            top: document.getElementById('products-section').offsetTop - 100,
            behavior: 'smooth'
        });
    };

    const handlePriceRangeChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const handleStoreChange = (event) => {
        setSelectedStore(event.target.value);
    };

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedCategory(null);
        setPriceRange([priceMin, priceMax]);
        setSelectedStore(null);
        setSortOption('default');
        setCurrentPage(1);
    };

    // FAQ data
    const faqData = [
        {
            question: "Làm thế nào để đặt hàng?",
            answer: "Bạn có thể dễ dàng đặt hàng bằng cách thêm sản phẩm vào giỏ hàng, sau đó tiến hành thanh toán. Chúng tôi hỗ trợ nhiều phương thức thanh toán khác nhau."
        },
        {
            question: "Chính sách đổi trả như thế nào?",
            answer: "Chúng tôi chấp nhận đổi trả trong vòng 30 ngày kể từ ngày mua hàng. Sản phẩm phải còn nguyên trạng và đầy đủ phụ kiện kèm theo."
        },
        {
            question: "Thời gian giao hàng mất bao lâu?",
            answer: "Thời gian giao hàng thông thường từ 2-5 ngày làm việc tùy thuộc vào khu vực của bạn. Đối với các khu vực xa, thời gian có thể kéo dài hơn."
        },
        {
            question: "Làm thế nào để theo dõi đơn hàng?",
            answer: "Sau khi đặt hàng thành công, bạn sẽ nhận được email xác nhận kèm mã đơn hàng. Bạn có thể sử dụng mã này để theo dõi trạng thái đơn hàng trong tài khoản của mình."
        }
    ];

    const toggleFavorite = (productId) => {
        if (favorites.includes(productId)) {
            setFavorites(favorites.filter(id => id !== productId));
        } else {
            setFavorites([...favorites, productId]);
        }
    }; const toggleFAQ = (index) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    // Functions for filtering, sorting and pagination
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        // Scroll to top of product section when page changes
        window.scrollTo({
            top: document.getElementById('products-section').offsetTop - 100,
            behavior: 'smooth'
        });
    };

    const handlePriceRangeChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    const handleStoreChange = (event) => {
        setSelectedStore(event.target.value);
    };

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedCategory(null);
        setPriceRange([priceMin, priceMax]);
        setSelectedStore(null);
        setSortOption('default');
        setCurrentPage(1);
    };

    // FAQ data
    const faqData = [
        {
            question: "Làm thế nào để đặt hàng?",
            answer: "Bạn có thể dễ dàng đặt hàng bằng cách thêm sản phẩm vào giỏ hàng, sau đó tiến hành thanh toán. Chúng tôi hỗ trợ nhiều phương thức thanh toán khác nhau."
        },
        {
            question: "Chính sách đổi trả như thế nào?",
            answer: "Chúng tôi chấp nhận đổi trả trong vòng 30 ngày kể từ ngày mua hàng. Sản phẩm phải còn nguyên trạng và đầy đủ phụ kiện kèm theo."
        },
        {
            question: "Thời gian giao hàng mất bao lâu?",
            answer: "Thời gian giao hàng thông thường từ 2-5 ngày làm việc tùy thuộc vào khu vực của bạn. Đối với các khu vực xa, thời gian có thể kéo dài hơn."
        },
        {
            question: "Làm thế nào để theo dõi đơn hàng?",
            answer: "Sau khi đặt hàng thành công, bạn sẽ nhận được email xác nhận kèm mã đơn hàng. Bạn có thể sử dụng mã này để theo dõi trạng thái đơn hàng trong tài khoản của mình."
        }
    ];

    return (
        <Box sx={{
            background: 'linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%)',
            minHeight: '100vh',
            pb: 8
        }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                    color: 'white',
                    py: { xs: 6, md: 10 },
                    px: 3,
                    mb: 6,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-100px',
                        right: '-100px',
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        zIndex: 1
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-50px',
                        left: '-50px',
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        zIndex: 1
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Typography
                                variant="h2"
                                component="h1"
                                gutterBottom
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                    mb: 2,
                                    animation: 'fadeIn 1s ease-out',
                                    '@keyframes fadeIn': {
                                        '0%': {
                                            opacity: 0,
                                            transform: 'translateY(20px)'
                                        },
                                        '100%': {
                                            opacity: 1,
                                            transform: 'translateY(0)'
                                        }
                                    }
                                }}
                            >
                                Mua sắm thông minh, <br />
                                Tiết kiệm hiệu quả
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    mb: 4,
                                    fontSize: { xs: '1rem', md: '1.2rem' },
                                    fontWeight: 'normal',
                                    opacity: 0.9,
                                    maxWidth: '600px',
                                    lineHeight: 1.6,
                                    animation: 'fadeIn 1s ease-out 0.3s both',
                                }}
                            >
                                Khám phá hàng ngàn sản phẩm chất lượng với giá cả hợp lý
                                và dịch vụ giao hàng nhanh chóng.
                            </Typography>
                            <Box sx={{
                                display: 'flex',
                                gap: 2,
                                flexWrap: 'wrap',
                                animation: 'fadeIn 1s ease-out 0.6s both'
                            }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component={Link}
                                    to="#products-section" // Link to products section
                                    size="large"
                                    endIcon={<ArrowForwardIcon />} // Added icon
                                    sx={{
                                        borderRadius: '50px',
                                        py: 1.5,
                                        px: 4,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                        backgroundColor: '#ffffff',
                                        color: '#6a11cb',
                                        '&:hover': {
                                            backgroundColor: '#f5f5f5',
                                            transform: 'translateY(-3px)',
                                            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                                            transition: 'all 0.3s ease'
                                        }
                                    }}
                                >
                                    Mua sắm ngay
                                </Button>
                                <Button
                                    variant="outlined"
                                    component={Link}
                                    to="/categories" // Assuming a categories page exists
                                    size="large"
                                    endIcon={<ChevronRightIcon />} // Added icon
                                    sx={{
                                        borderRadius: '50px',
                                        py: 1.5,
                                        px: 4,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        border: '2px solid white',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            borderColor: 'white',
                                            transform: 'translateY(-3px)',
                                            transition: 'all 0.3s ease'
                                        }
                                    }}
                                >
                                    Xem danh mục
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Box
                                component="img"
                                src="https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=2940&auto=format&fit=crop"
                                alt="Shopping"
                                sx={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    borderRadius: '15px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                    transform: 'perspective(1000px) rotateY(-10deg)',
                                    animation: 'float 6s ease-in-out infinite',
                                    '@keyframes float': {
                                        '0%': { transform: 'perspective(1000px) rotateY(-10deg) translateY(0)' },
                                        '50%': { transform: 'perspective(1000px) rotateY(-10deg) translateY(-15px)' },
                                        '100%': { transform: 'perspective(1000px) rotateY(-10deg) translateY(0)' }
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Search and Categories */}
            <Container maxWidth="lg">                <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 5,
                    borderRadius: 4,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                    background: 'white'
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="primary" />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="clear search"
                                            onClick={() => setSearchQuery("")}
                                            edge="end"
                                            size="small"
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: {
                                    borderRadius: 3,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                    '&.Mui-focused': {
                                        backgroundColor: 'white',
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'transparent'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: theme.palette.primary.light
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: theme.palette.primary.main
                                    },
                                    py: 0.5,
                                    px: 1
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 1,
                                flexWrap: 'wrap',
                                justifyContent: { xs: 'flex-start', md: 'flex-end' }
                            }}
                        >
                            <Button
                                variant="outlined"
                                startIcon={<FilterListIcon />}
                                onClick={() => setOpenFilters(!openFilters)}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 'medium'
                                }}
                            >
                                Bộ lọc
                            </Button>
                            <FormControl sx={{ minWidth: 150 }}>
                                <Select
                                    value={sortOption}
                                    onChange={handleSortChange}
                                    displayEmpty
                                    size="small"
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <SortIcon fontSize="small" />
                                        </InputAdornment>
                                    }
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: alpha(theme.palette.primary.main, 0.2)
                                        }
                                    }}
                                >
                                    <MenuItem value="default">Sắp xếp mặc định</MenuItem>
                                    <MenuItem value="nameAsc">Tên A-Z</MenuItem>
                                    <MenuItem value="nameDesc">Tên Z-A</MenuItem>
                                    <MenuItem value="priceAsc">Giá tăng dần</MenuItem>
                                    <MenuItem value="priceDesc">Giá giảm dần</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                </Grid>

                {/* Advanced Filters */}
                <Collapse in={openFilters}>
                    <Box sx={{ pt: 3, mt: 3, borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} /> Danh mục
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                    <Chip
                                        label="Tất cả"
                                        clickable
                                        color={!selectedCategory ? "primary" : "default"}
                                        variant={!selectedCategory ? "filled" : "outlined"}
                                        onClick={() => setSelectedCategory(null)}
                                        sx={{ borderRadius: 2 }}
                                    />
                                    {categories.map(category => (
                                        <Chip
                                            key={category}
                                            label={category}
                                            clickable
                                            color={selectedCategory === category ? "primary" : "default"}
                                            variant={selectedCategory === category ? "filled" : "outlined"}
                                            onClick={() => setSelectedCategory(category)}
                                            sx={{ borderRadius: 2 }}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} /> Khoảng giá
                                </Typography>
                                <Box sx={{ px: 2, pt: 1 }}>
                                    <Slider
                                        value={priceRange}
                                        onChange={handlePriceRangeChange}
                                        valueLabelDisplay="auto"
                                        min={priceMin}
                                        max={priceMax}
                                        valueLabelFormat={(value) => `${value.toLocaleString('vi-VN')}₫`}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {priceRange[0].toLocaleString('vi-VN')}₫
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {priceRange[1].toLocaleString('vi-VN')}₫
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <StoreMallDirectoryIcon sx={{ mr: 1, color: 'primary.main' }} /> Cửa hàng
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={selectedStore || ''}
                                        onChange={handleStoreChange}
                                        displayEmpty
                                        sx={{ borderRadius: 2 }}
                                    >
                                        <MenuItem value="">Tất cả cửa hàng</MenuItem>
                                        {stores.map((store) => (
                                            <MenuItem key={store.id} value={store.id}>
                                                {store.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={resetFilters}
                                    startIcon={<CloseIcon />}
                                    sx={{ borderRadius: 2, textTransform: 'none' }}
                                >
                                    Xóa bộ lọc
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Collapse>
            </Paper>                {/* Featured Products */}
                <Box id="products-section">
                    <Typography
                        variant="h4"
                        component="h2"
                        sx={{
                            mb: 1,
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <ExploreIcon sx={{ mr: 1, fontSize: 32, color: theme.palette.primary.main }} />
                        Sản phẩm nổi bật
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                            Khám phá các sản phẩm chất lượng cao của chúng tôi
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Hiển thị {sortedProducts.length > 0 ? `1-${Math.min(paginatedProducts.length, itemsPerPage)} / ${sortedProducts.length}` : '0'} sản phẩm
                        </Typography>
                    </Box>

                    {loading ? (<Grid container sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(3, 1fr)'
                        },
                        gap: 3,
                        mt: 0
                    }}>
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <Card key={item} sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 3,
                                overflow: 'hidden',
                                boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
                            }}>
                                <Skeleton variant="rectangular" height={200} animation="wave" />
                                <CardContent>
                                    <Skeleton variant="text" height={28} width="80%" animation="wave" />
                                    <Skeleton variant="text" height={20} animation="wave" />
                                    <Skeleton variant="text" height={20} width="60%" animation="wave" />
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Skeleton variant="text" height={32} width="40%" animation="wave" />
                                        <Skeleton variant="circular" width={36} height={36} animation="wave" />
                                    </Box>                                    </CardContent>
                            </Card>
                        ))}
                    </Grid>) : sortedProducts.length > 0 ? (
                        <Grid container sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(3, 1fr)'
                            },
                            gap: 3,
                            mt: 0 // Override default margin that comes with Grid container
                        }}>
                            {paginatedProducts.map((product, index) => (
                                <Card
                                    key={product.id}
                                    ref={el => cardsRef.current[index] = el}
                                    sx={{
                                        height: cardHeight ? `${cardHeight}px` : 'auto',
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
                                    }}>                                    <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                                        <CardMedia
                                            component="img"
                                            image={product.image || "https://via.placeholder.com/400x200?text=No+Image"}
                                            alt={product.name}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.6s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.05)'
                                                }
                                            }}
                                        />
                                        <IconButton
                                            aria-label="add to favorites"
                                            onClick={() => toggleFavorite(product.id)}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                backgroundColor: 'white',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                '&:hover': {
                                                    backgroundColor: 'white',
                                                    transform: 'scale(1.1)'
                                                },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {favorites.includes(product.id) ?
                                                <FavoriteIcon color="error" /> :
                                                <FavoriteBorderIcon />
                                            }
                                        </IconButton>
                                        {product.category && (
                                            <Chip
                                                label={product.category.name}
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 12,
                                                    left: 12,
                                                    backgroundColor: 'rgba(255,255,255,0.85)',
                                                    fontWeight: 'medium',
                                                    fontSize: '0.75rem',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                }}
                                            />
                                        )}
                                    </Box>                                    <CardContent sx={{
                                        flexGrow: 1,
                                        p: 3,
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            mb: 1,
                                            height: '3.5rem' // Fixed height for title area
                                        }}>                                            <Typography
                                                variant="h6"
                                                component={Link}
                                                to={`/products/${product.id}`}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: 'text.primary',
                                                    textDecoration: 'none',
                                                    lineHeight: 1.2,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    '&:hover': {
                                                        color: theme.palette.primary.main
                                                    },
                                                    transition: 'color 0.2s ease'
                                                }}
                                            >
                                                {product.name}
                                            </Typography>
                                            <Typography
                                                variant="subtitle1"
                                                color="primary.main"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    ml: 1,
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {product.price?.toLocaleString('vi-VN')}₫
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, height: '24px' }}>
                                            <Rating value={product.rating || 4.5} precision={0.5} readOnly size="small" />
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                                ({product.ratingCount || Math.floor(Math.random() * 50) + 10})
                                            </Typography>
                                        </Box>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                height: '60px'
                                            }}
                                        >
                                            {product.description || "Không có mô tả sản phẩm"}
                                        </Typography>

                                        {product.store && (
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 2,
                                                height: '20px',
                                                mt: 'auto' // Push to bottom of flex container
                                            }}>
                                                <StorefrontIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
                                                    {product.store.name}
                                                </Typography>
                                            </Box>
                                        )}
                                        {!product.store && (
                                            <Box sx={{ mb: 2, height: '20px', mt: 'auto' }}></Box>
                                        )}
                                    </CardContent>                                    <Box sx={{
                                        p: 2,
                                        pt: 0,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        height: '48px' // Fixed height for button area
                                    }}>                                        <Button
                                            component={Link}
                                            to={`/products/${product.id}`}
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 'medium',
                                                textTransform: 'none',
                                                minWidth: '80px'
                                            }}
                                        >
                                            Chi tiết
                                        </Button>                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            startIcon={<ShoppingCartIcon />}
                                            component={Link}
                                            to={`/products/${product.id}`}
                                            sx={{
                                                borderRadius: 2,
                                                fontWeight: 'medium',
                                                textTransform: 'none',
                                                boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                                                '&:hover': {
                                                    boxShadow: '0 5px 15px rgba(0,0,0,0.15)'
                                                }
                                            }}
                                        >
                                            Mua ngay
                                        </Button></Box>
                                </Card>
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{
                            py: 6,
                            textAlign: 'center',
                            backgroundColor: 'rgba(0,0,0,0.02)',
                            borderRadius: 3
                        }}>
                            <Typography variant="h6" color="text.secondary">
                                Không tìm thấy sản phẩm nào phù hợp với tìm kiếm của bạn.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ mt: 2 }}
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory(null);
                                }}
                            >
                                Xóa tìm kiếm
                            </Button>                    </Box>
                    )}
                    {/* Pagination */}
                    {sortedProducts.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                            <Pagination
                                count={Math.ceil(sortedProducts.length / itemsPerPage)}
                                page={currentPage}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                                size="large"
                                showFirstButton
                                showLastButton
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Box>
                    )}

                    {/* Recent Products Section */}
                    {newestProducts.length > 0 && (
                        <Box sx={{ mt: 8 }}>
                            <Typography
                                variant="h4"
                                component="h2"
                                sx={{
                                    mb: 1,
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <NewReleasesIcon sx={{ mr: 1, fontSize: 32, color: theme.palette.secondary.main }} />
                                Sản phẩm mới
                            </Typography>
                            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                                Những sản phẩm mới nhất vừa được cập nhật
                            </Typography>

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, 1fr)',
                                        md: 'repeat(4, 1fr)'
                                    },
                                    gap: 3
                                }}
                            >
                                {newestProducts.map((product) => (
                                    <Card
                                        key={product.id}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 3,
                                            overflow: 'hidden',
                                            boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                                            transition: 'all 0.3s ease',
                                            height: '100%',
                                            '&:hover': {
                                                transform: 'translateY(-8px)',
                                                boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                                            <CardMedia
                                                component="img"
                                                image={product.image || "https://via.placeholder.com/400x200?text=No+Image"}
                                                alt={product.name}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.6s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)'
                                                    }
                                                }}
                                            />
                                            <Chip
                                                label="Mới"
                                                size="small"
                                                color="secondary"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    left: 12,
                                                    fontWeight: 'bold',
                                                    fontSize: '0.75rem',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
                                                    lineHeight: 1.2,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    height: '2.4em',
                                                    mb: 1,
                                                    '&:hover': {
                                                        color: theme.palette.primary.main
                                                    }
                                                }}
                                            >
                                                {product.name}
                                            </Typography>
                                            <Typography
                                                variant="subtitle1"
                                                color="primary.main"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    mb: 1
                                                }}
                                            >
                                                {product.price?.toLocaleString('vi-VN')}₫
                                            </Typography>
                                        </CardContent>
                                        <Box sx={{ p: 2, pt: 0 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="secondary" // Changed color for visual distinction
                                                size="small"
                                                startIcon={<ShoppingCartIcon />}
                                                endIcon={<ChevronRightIcon />} // Added icon
                                                component={Link}
                                                to={`/products/${product.id}`}
                                                sx={{
                                                    borderRadius: 2,
                                                    fontWeight: 'medium',
                                                    textTransform: 'none',
                                                    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                                                }}
                                            >
                                                Xem chi tiết
                                            </Button>
                                        </Box>
                                    </Card>
                                ))}
                            </Box>
                        </Box>
                    )}

                </Box>

                {/* FAQ Section */}
                <Box sx={{ mt: 8, mb: 4 }}>
                    <Typography
                        variant="h4"
                        component="h2"
                        sx={{
                            mb: 1,
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <InfoIcon sx={{ mr: 1, fontSize: 32, color: theme.palette.info.main }} />
                        Câu hỏi thường gặp
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                        Những thông tin hữu ích về dịch vụ của chúng tôi
                    </Typography>

                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 4,
                            overflow: 'hidden',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                        }}
                    >
                        {faqData.map((faq, index) => (
                            <Box key={index}>
                                {index > 0 && <Divider />}
                                <Box
                                    sx={{
                                        p: 3,
                                        backgroundColor: expandedFAQ === index ? alpha(theme.palette.primary.main, 0.04) : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.04)
                                        }
                                    }}
                                    onClick={() => toggleFAQ(index)}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {faq.question}
                                        </Typography>
                                        <IconButton size="small">
                                            {expandedFAQ === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        </IconButton>
                                    </Box>
                                    <Collapse in={expandedFAQ === index}>
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            sx={{ mt: 2, lineHeight: 1.6 }}
                                        >
                                            {faq.answer}
                                        </Typography>
                                    </Collapse>
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
};


export default Home;