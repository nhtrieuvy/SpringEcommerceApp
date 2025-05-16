import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Box,
  Rating,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontIcon from '@mui/icons-material/Storefront';
import defaultApi from '../configs/Apis';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await defaultApi.get('/api/stores');
      setStores(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi tải danh sách cửa hàng:', err);
      setError('Không thể tải danh sách cửa hàng. Vui lòng thử lại sau.');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store => 
    store.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tạo dữ liệu mẫu nếu API chưa hoạt động
  const sampleStores = [
    {
      id: 1,
      name: "Cửa hàng Điện tử ABC",
      description: "Chuyên kinh doanh các sản phẩm điện tử, máy tính, smartphone chính hãng",
      image: "https://via.placeholder.com/300x150?text=Electronics+Shop",
      rating: 4.5
    },
    {
      id: 2,
      name: "Shop Thời trang XYZ",
      description: "Cửa hàng thời trang nam nữ với nhiều mẫu mã đa dạng, phong cách",
      image: "https://via.placeholder.com/300x150?text=Fashion+Shop",
      rating: 4.2
    },
    {
      id: 3,
      name: "Nhà sách Tri Thức",
      description: "Nhà sách với hàng nghìn đầu sách chất lượng, đa dạng thể loại",
      image: "https://via.placeholder.com/300x150?text=Book+Store",
      rating: 4.7
    }
  ];

  // Sử dụng dữ liệu mẫu nếu danh sách trống
  const displayedStores = stores.length > 0 ? filteredStores : sampleStores;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <StorefrontIcon sx={{ fontSize: 35, mr: 1, verticalAlign: 'text-bottom', color: 'var(--primary-main)' }} />
          Danh sách cửa hàng
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Khám phá các cửa hàng chất lượng với đa dạng sản phẩm trên sàn thương mại điện tử của chúng tôi
        </Typography>
        
        <TextField
          label="Tìm kiếm cửa hàng"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: 500, mx: 'auto', mt: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Divider sx={{ mb: 4 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="error" paragraph>{error}</Typography>
          <Button variant="contained" onClick={fetchStores}>Thử lại</Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {displayedStores.map((store) => (
            <Grid item xs={12} sm={6} md={4} key={store.id}>
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
                <CardMedia
                  component="img"
                  height="150"
                  image={store.image || `https://via.placeholder.com/300x150?text=${encodeURIComponent(store.name)}`}
                  alt={store.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {store.name}
                  </Typography>
                  <Rating value={store.rating || 0} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                    {store.description || "Chưa có mô tả"}
                  </Typography>
                  <Box sx={{ mt: 'auto', pt: 2, display: 'flex', justifyContent: 'space-between' }}>                    <Button 
                      component={Link} 
                      to={`/store/${store.id}`} 
                      variant="outlined" 
                      size="small"
                    >
                      Xem cửa hàng
                    </Button>
                    <Button 
                      component={Link} 
                      to={`/review/store/${store.id}`} 
                      variant="text" 
                      size="small"
                    >
                      Đánh giá
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {displayedStores.length === 0 && !loading && !error && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">Không tìm thấy cửa hàng nào</Typography>
          <Button 
            component={Link} 
            to="/create-store" 
            variant="contained" 
            sx={{ mt: 2 }}
          >
            Tạo cửa hàng mới
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default StoreList;
