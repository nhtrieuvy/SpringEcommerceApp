import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Rating,
  Divider,
  Paper,
  InputAdornment,
  Pagination,
  CircularProgress,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';

const ProductSearch = () => {
  const [params, setParams] = useState({
    name: '',
    minPrice: '',
    maxPrice: '',
    storeId: '',
    sortBy: 'name',
    sortDir: 'asc',
    page: 0,
    size: 12
  });

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/products/search', { params });
      
      // Kiểm tra nếu API trả về dữ liệu đúng định dạng
      if (res.data && Array.isArray(res.data)) {
        setProducts(res.data);
        // Nếu API trả về số lượng trang
        if (res.data.totalPages) {
          setTotalPages(res.data.totalPages);
        } else {
          // Nếu không, tính tạm 5 trang để có phân trang demo
          setTotalPages(5);
        }
      } else if (res.data && res.data.content && Array.isArray(res.data.content)) {
        // Nếu API trả về dạng Page của Spring
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages || 5);
      } else {
        // Dữ liệu mẫu nếu API không trả về đúng định dạng
        setProducts(sampleProducts);
        setTotalPages(5);
      }
      
      setError(null);
    } catch (err) {
      console.error('Lỗi khi gọi API:', err);
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
      setProducts(sampleProducts);
      setTotalPages(5);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [params.page, params.sortBy, params.sortDir]);

  // Chỉ tìm kiếm khi người dùng đã ngừng nhập trong 500ms
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (params.page === 0) {
        fetchProducts();
      } else {
        // Reset về trang 0 nếu điều kiện tìm kiếm thay đổi
        setParams(prev => ({ ...prev, page: 0 }));
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [params.name, params.minPrice, params.maxPrice, params.storeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setParams({ ...params, [name]: value });
  };

  const handlePageChange = (event, newPage) => {
    setParams({ ...params, page: newPage - 1 });
  };

  const resetFilters = () => {
    setParams({
      name: '',
      minPrice: '',
      maxPrice: '',
      storeId: '',
      sortBy: 'name',
      sortDir: 'asc',
      page: 0,
      size: 12
    });
  };

  // Dữ liệu mẫu nếu API chưa có
  const sampleProducts = [
    {
      id: 1,
      name: "Laptop Gaming Asus ROG",
      price: 25000000,
      description: "Laptop gaming hiệu năng cao, màn hình 15.6 inch, card đồ họa RTX 3060",
      image: "https://via.placeholder.com/300x200?text=Gaming+Laptop",
      rating: 4.5
    },
    {
      id: 2,
      name: "Điện thoại Samsung Galaxy S22",
      price: 18000000,
      description: "Điện thoại cao cấp, camera 108MP, màn hình Dynamic AMOLED 2X",
      image: "https://via.placeholder.com/300x200?text=Samsung+S22",
      rating: 4.7
    },
    {
      id: 3,
      name: "Tai nghe Sony WH-1000XM4",
      price: 7500000,
      description: "Tai nghe chống ồn chủ động, chất lượng âm thanh Hi-Res",
      image: "https://via.placeholder.com/300x200?text=Sony+Headphones",
      rating: 4.8
    },
    {
      id: 4,
      name: "Đồng hồ thông minh Apple Watch Series 7",
      price: 12000000,
      description: "Màn hình luôn hiển thị, GPS + Cellular, theo dõi sức khỏe toàn diện",
      image: "https://via.placeholder.com/300x200?text=Apple+Watch",
      rating: 4.6
    },
    {
      id: 5,
      name: "Máy ảnh Mirrorless Sony Alpha A7 III",
      price: 42000000,
      description: "Cảm biến Full-frame 24.2MP, quay video 4K HDR",
      image: "https://via.placeholder.com/300x200?text=Sony+Camera",
      rating: 4.9
    },
    {
      id: 6,
      name: "Màn hình Dell UltraSharp 27 inch 4K",
      price: 15000000,
      description: "Độ phân giải 3840 x 2160, độ phủ màu 99% sRGB",
      image: "https://via.placeholder.com/300x200?text=Dell+Monitor",
      rating: 4.4
    }
  ];

  // Dùng sản phẩm mẫu nếu API chưa trả về dữ liệu
  const displayProducts = products.length > 0 ? products : sampleProducts;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <ShoppingBagIcon sx={{ fontSize: 35, mr: 1, verticalAlign: 'text-bottom', color: 'var(--primary-main)' }} />
          Tìm kiếm sản phẩm
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Khám phá hàng nghìn sản phẩm chất lượng với giá cả hợp lý
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField 
              name="name" 
              label="Tên sản phẩm" 
              variant="outlined" 
              fullWidth 
              value={params.name}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField 
              name="minPrice" 
              label="Giá từ" 
              type="number" 
              variant="outlined" 
              fullWidth 
              value={params.minPrice}
              onChange={handleChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">đ</InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField 
              name="maxPrice" 
              label="Giá đến" 
              type="number" 
              variant="outlined" 
              fullWidth 
              value={params.maxPrice}
              onChange={handleChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">đ</InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sắp xếp theo</InputLabel>
              <Select
                name="sortBy"
                value={params.sortBy}
                onChange={handleChange}
                label="Sắp xếp theo"
              >
                <MenuItem value="name">Tên sản phẩm</MenuItem>
                <MenuItem value="price">Giá</MenuItem>
                <MenuItem value="createdDate">Mới nhất</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Thứ tự</InputLabel>
              <Select
                name="sortDir"
                value={params.sortDir}
                onChange={handleChange}
                label="Thứ tự"
              >
                <MenuItem value="asc">Tăng dần</MenuItem>
                <MenuItem value="desc">Giảm dần</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={resetFilters}
              startIcon={<DeleteIcon />}
            >
              Xóa bộ lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="error" paragraph>{error}</Typography>
          <Button variant="contained" onClick={fetchProducts}>Thử lại</Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {displayProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card 
                  className="hover-card"
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`}
                      alt={product.name}
                    />
                    <IconButton 
                      size="small" 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        bgcolor: 'rgba(255,255,255,0.8)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' }
                      }}
                    >
                      <FavoriteIcon sx={{ color: '#f44336' }} />
                    </IconButton>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography gutterBottom variant="h6" component={Link} to={`/product/${product.id}`} sx={{ 
                      textDecoration: 'none', 
                      color: 'inherit',
                      '&:hover': { color: 'var(--primary-main)' }
                    }}>
                      {product.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={product.rating || 0} precision={0.5} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({product.reviewCount || 0} đánh giá)
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      mb: 2, 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {product.description}
                    </Typography>
                    
                    <Box sx={{ mt: 'auto' }}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {product.price?.toLocaleString('vi-VN')}₫
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          startIcon={<ShoppingCartIcon />}
                          sx={{ flexGrow: 1 }}
                        >
                          Mua ngay
                        </Button>
                        <Button 
                          component={Link} 
                          to={`/review/product/${product.id}`} 
                          variant="outlined"
                        >
                          Đánh giá
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {displayProducts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6">Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm</Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={params.page + 1}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default ProductSearch;
