import React, { useState, useEffect } from 'react';
import { authApi, endpoint } from '../configs/Apis';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  AlertTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Divider,
  Tooltip,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaidIcon from '@mui/icons-material/Paid';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PhotoIcon from '@mui/icons-material/Photo';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import { useAuth } from '../configs/MyContexts';
import { useLocation, useNavigate } from 'react-router-dom';
import AsyncPageWrapper from './AsyncPageWrapper';

const SellerProducts = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);

  // State cho dialog thêm/sửa sản phẩm
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    categoryId: '',
    storeId: '',
    image: ''
  });

  // State cho dialog tải lên hình ảnh
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // State cho thông báo
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  // Lấy danh sách cửa hàng của người bán
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await authApi().get(endpoint.GET_STORES_BY_SELLER(user.id));
        const storesWithProducts = response.data.map(store => ({
          ...store,
          products: store.products || [] // Ensure products collection is initialized
        }));
        setStores(storesWithProducts);

        // Use store from navigation state if available, otherwise use first store
        if (location.state && location.state.selectedStore) {
          setSelectedStore(location.state.selectedStore);
        } else if (storesWithProducts.length > 0) {
          setSelectedStore(storesWithProducts[0].id);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
        showAlert("Không thể tải danh sách cửa hàng", "error");
      }
    };

    if (user) {
      fetchStores();
    }
  }, [user, location.state]);  // Lấy danh sách sản phẩm của cửa hàng đã chọn
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedStore) return;

      setLoading(true);
      try {
        const response = await authApi().get(endpoint.GET_SELLER_PRODUCTS_BY_STORE(selectedStore));
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        showAlert("Không thể tải danh sách sản phẩm", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedStore]);  // Lấy danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authApi().get(endpoint.GET_CATEGORIES);
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);
  const handleOpenCreateDialog = () => {
    setCurrentProduct({
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      categoryId: categories.length > 0 ? categories[0].id : '',
      storeId: selectedStore,
      image: ''
    });
    setIsEditing(false);
    setSelectedImage(null); // Reset image selection
    setOpenProductDialog(true);
  };
  const handleOpenEditDialog = (product) => {
    setCurrentProduct({
      ...product,
      categoryId: product.category ? product.category.id : '',
      storeId: product.store ? product.store.id : ''
    });
    setIsEditing(true);
    setSelectedImage(null); // Reset image selection when editing
    setOpenProductDialog(true);
  };

  const handleOpenImageDialog = (product) => {
    setCurrentProduct(product);
    setSelectedImage(null);
    setOpenImageDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenProductDialog(false);
    setOpenImageDialog(false);
    // Xóa hình ảnh đã chọn khi đóng dialog
    if (!isEditing) {
      setSelectedImage(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: name === 'price' || name === 'quantity'
        ? parseFloat(value)
        : value
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleStoreChange = (e) => {
    setSelectedStore(e.target.value);
  };

  const showAlert = (message, severity = 'success') => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  const handleCloseAlert = () => {
    setAlert({
      ...alert,
      open: false
    });
  };  const handleSubmitProduct = async () => {
    try {
      let response;

      if (isEditing) {
        // Luôn sử dụng FormData khi cập nhật sản phẩm, bất kể có hình ảnh mới hay không
        const formData = new FormData();
        formData.append('name', currentProduct.name);
        formData.append('description', currentProduct.description || '');
        formData.append('price', currentProduct.price);
        formData.append('quantity', currentProduct.quantity);
        formData.append('categoryId', currentProduct.categoryId);
        
        // Nếu có hình ảnh mới, thêm vào FormData
        if (selectedImage) {
          formData.append('image', selectedImage);
          console.log("Updating product with new image:", {
            name: currentProduct.name,
            imageFileName: selectedImage.name
          });
        } else {
          console.log("Updating product without new image:", {
            name: currentProduct.name
          });
        }
        
        // Sử dụng endpoint cập nhật duy nhất
        response = await authApi().post(
          endpoint.UPDATE_SELLER_PRODUCT(currentProduct.id),
          formData
        );
        
        console.log("Update response:", response);
        console.log("Updated product data:", response.data);
        
        showAlert("Sản phẩm đã được cập nhật thành công!");
      } else {
        // Kiểm tra bắt buộc phải có hình ảnh khi tạo sản phẩm mới
        if (!selectedImage) {
          showAlert("Vui lòng chọn hình ảnh cho sản phẩm", "error");
          return;
        }
        
        // Tạo FormData để gửi cả dữ liệu sản phẩm và hình ảnh
        const formData = new FormData();
        formData.append('name', currentProduct.name);
        formData.append('description', currentProduct.description || '');
        formData.append('price', currentProduct.price);
        formData.append('quantity', currentProduct.quantity);
        formData.append('storeId', currentProduct.storeId);
        formData.append('categoryId', currentProduct.categoryId);
        formData.append('image', selectedImage);
        
        console.log("Creating product with image:", {
          name: currentProduct.name,
          price: currentProduct.price,
          storeId: currentProduct.storeId,
          categoryId: currentProduct.categoryId,
          imageFileName: selectedImage.name
        });
        
        response = await authApi().post(
          endpoint.CREATE_SELLER_PRODUCT,
          formData
        );
        showAlert("Sản phẩm và hình ảnh đã được tạo thành công!");
      }
      
      // Always refresh the product list after any operation to ensure UI is in sync with the database
      try {
        console.log("Refreshing product list...");
        const refreshResponse = await authApi().get(endpoint.GET_SELLER_PRODUCTS_BY_STORE(selectedStore));
        setProducts(refreshResponse.data);
        console.log("Product list refreshed successfully with", refreshResponse.data.length, "products");
      } catch (refreshError) {
        console.error("Failed to refresh product list:", refreshError);
        
        // Fallback: try to update the local state if we can't refresh from the server
        if (isEditing) {
          const updatedProduct = response.data.product || response.data;
          setProducts(prev => prev.map(p => p.id === currentProduct.id ? updatedProduct : p));
        } else {
          const newProduct = response.data.product || response.data;
          setProducts(prev => [...prev, newProduct]);
        }
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error saving product:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      showAlert(
        `Không thể ${isEditing ? 'cập nhật' : 'tạo'} sản phẩm. Lỗi: ${error.response?.data?.message || error.message}`,
        "error"
      );
    }
  };const handleUploadImage = async () => {
    if (!selectedImage) {
      showAlert("Vui lòng chọn hình ảnh trước khi tải lên", "error");
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedImage);

    setUploadLoading(true);    
    try {
      const response = await authApi().post(
        endpoint.UPLOAD_PRODUCT_IMAGE(currentProduct.id),
        formData
      );

      // Refresh the product list to ensure we have the latest data
      try {
        console.log("Refreshing product list after image upload...");
        const refreshResponse = await authApi().get(endpoint.GET_SELLER_PRODUCTS_BY_STORE(selectedStore));
        setProducts(refreshResponse.data);
        console.log("Product list refreshed successfully after image upload");
      } catch (refreshError) {
        console.error("Failed to refresh products after image upload:", refreshError);
        
        // Fallback: update local state if server refresh fails
        setProducts(prev =>
          prev.map(p => p.id === currentProduct.id ? response.data.product : p)
        );
      }

      showAlert("Hình ảnh đã được tải lên thành công!");
      handleCloseDialog();
    } catch (error) {
      console.error("Error uploading image:", error);
      showAlert("Không thể tải lên hình ảnh. Vui lòng thử lại!", "error");
    } finally {
      setUploadLoading(false);
    }
  };const handleToggleProductStatus = async (product) => {
    try {
      const response = await authApi().put(
        endpoint.TOGGLE_PRODUCT_STATUS(product.id),
        null,
        {
          params: {
            active: !product.active
          }
        }
      );

      // Refresh the product list to ensure we have the latest data
      try {
        console.log("Refreshing product list after status toggle...");
        const refreshResponse = await authApi().get(endpoint.GET_SELLER_PRODUCTS_BY_STORE(selectedStore));
        setProducts(refreshResponse.data);
        console.log("Product list refreshed successfully after status toggle");
      } catch (refreshError) {
        console.error("Failed to refresh products after status toggle:", refreshError);
        
        // Fallback: update local state if server refresh fails
        setProducts(prev =>
          prev.map(p => p.id === product.id ? response.data : p)
        );
      }

      showAlert(`Sản phẩm đã được ${!product.active ? 'kích hoạt' : 'vô hiệu hóa'}!`);
    } catch (error) {
      console.error("Error toggling product status:", error);
      showAlert("Không thể thay đổi trạng thái sản phẩm", "error");
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      return;
    }    
    try {
      await authApi().delete(endpoint.DELETE_SELLER_PRODUCT(product.id));

      // For deletions, local state update is more efficient, but let's still refresh from server
      // to be consistent with our approach
      try {
        console.log("Refreshing product list after deletion...");
        const refreshResponse = await authApi().get(endpoint.GET_SELLER_PRODUCTS_BY_STORE(selectedStore));
        setProducts(refreshResponse.data);
        console.log("Product list refreshed successfully after deletion");
      } catch (refreshError) {
        console.error("Failed to refresh products after deletion:", refreshError);
        
        // Fallback: update local state if server refresh fails
        setProducts(prev => prev.filter(p => p.id !== product.id));
      }

      showAlert("Sản phẩm đã được xóa thành công!");
    } catch (error) {
      console.error("Error deleting product:", error);
      showAlert("Không thể xóa sản phẩm", "error");
    }
  };  return (
    <AsyncPageWrapper isLoading={loading}>
      <Container maxWidth="lg" sx={{ py: 4 }}><Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                   background: 'linear-gradient(145deg, #f0f0f0, #ffffff)', 
                   p: 3, 
                   borderRadius: 2, 
                   boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center',
                color: 'primary.main'
              }}
            >
              <StorefrontIcon sx={{ 
                fontSize: 40, 
                mr: 2, 
                color: 'primary.main',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 0.8, transform: 'scale(0.95)' },
                  '50%': { opacity: 1, transform: 'scale(1.05)' },
                  '100%': { opacity: 0.8, transform: 'scale(0.95)' },
                }
              }} />
              Quản lý sản phẩm
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              paragraph
              sx={{ ml: 6, maxWidth: '80%' }}
            >
              Quản lý các sản phẩm của cửa hàng của bạn trên sàn thương mại điện tử
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate('/seller/stores')}
            startIcon={<ArrowBackIcon />}
            sx={{ 
              borderRadius: 2,
              py: 1,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 15px rgba(0,0,0,0.15)'
              }
            }}
          >
            Quay lại cửa hàng
          </Button>
        </Box>
      </Box>      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 3, 
        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: 'linear-gradient(90deg, primary.main, primary.light)'
        }
      }}>
        <Grid container spacing={2} alignItems="center" mb={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Chọn cửa hàng</InputLabel>
              <Select
                value={selectedStore || ''}
                onChange={handleStoreChange}
                label="Chọn cửa hàng"
                startAdornment={
                  <InputAdornment position="start">
                    <StoreIcon color="primary" />
                  </InputAdornment>
                }
                sx={{ 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.1)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                  }
                }}
              >
                {stores.length === 0 ? (
                  <MenuItem disabled>Không có cửa hàng nào</MenuItem>
                ) : (
                  stores.map(store => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              disabled={!selectedStore}
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                px: 3,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.15)'
                },
                '&.Mui-disabled': {
                  background: '#e0e0e0',
                  color: '#a0a0a0'
                }
              }}
            >
              Thêm sản phẩm mới
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3, borderColor: 'rgba(0, 0, 0, 0.08)' }} />        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="primary" size={60} thickness={4} />
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6, 
            background: 'rgba(0,0,0,0.01)', 
            borderRadius: 3,
            border: '2px dashed rgba(0,0,0,0.08)',
            mx: 2
          }}>
            <ProductionQuantityLimitsIcon 
              sx={{ 
                fontSize: 80, 
                color: 'primary.light', 
                mb: 2,
                opacity: 0.7
              }} 
            />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary' }}>
              Không có sản phẩm nào
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: '500px', mx: 'auto', mb: 4 }}>
              Hãy thêm sản phẩm mới để bắt đầu bán hàng trên cửa hàng của bạn
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
              disabled={!selectedStore}
              sx={{ 
                borderRadius: 2,
                py: 1.5,
                px: 3,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.15)'
                }
              }}
            >
              Thêm sản phẩm ngay
            </Button>
          </Box>
        ) : (          <TableContainer sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 0 15px rgba(0,0,0,0.02)'
          }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    backgroundColor: 'rgba(0,0,0,0.02)', 
                    py: 2
                  }}>Hình ảnh</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    backgroundColor: 'rgba(0,0,0,0.02)', 
                    py: 2
                  }}>Tên sản phẩm</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    backgroundColor: 'rgba(0,0,0,0.02)', 
                    py: 2
                  }}>Giá</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    backgroundColor: 'rgba(0,0,0,0.02)', 
                    py: 2
                  }}>Số lượng</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    backgroundColor: 'rgba(0,0,0,0.02)', 
                    py: 2
                  }}>Danh mục</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    backgroundColor: 'rgba(0,0,0,0.02)', 
                    py: 2
                  }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ 
                    fontWeight: 'bold', 
                    backgroundColor: 'rgba(0,0,0,0.02)', 
                    py: 2
                  }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow 
                    key={product.id}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: 'rgba(0,0,0,0.01)' },
                      '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ 
                        position: 'relative', 
                        width: 70, 
                        height: 70, 
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}>
                        <CardMedia
                          component="img"
                          height="70"
                          image={product.image || `https://via.placeholder.com/70x70?text=${encodeURIComponent(product.name)}`}
                          alt={product.name}
                          sx={{ objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            '&:hover': { 
                              backgroundColor: 'primary.light',
                              color: 'white'
                            },
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => handleOpenImageDialog(product)}
                        >
                          <UploadFileIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">{product.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body1" 
                        fontWeight="bold" 
                        color="primary.main"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <PaidIcon sx={{ fontSize: 18, mr: 0.5, opacity: 0.7 }} /> 
                        {product.price?.toLocaleString('vi-VN')}₫
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Inventory2Icon sx={{ fontSize: 18, mr: 0.5, opacity: 0.7, color: 'info.main' }} />
                        <Typography variant="body1">{product.quantity}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={product.category?.name || 'Chưa phân loại'} 
                        size="small" 
                        variant="outlined"
                        color="info"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.active ? 'Đang bán' : 'Ngừng bán'}
                        color={product.active ? 'success' : 'default'}
                        size="small"
                        icon={product.active ? <CheckCircleIcon /> : <BlockIcon />}
                        sx={{ 
                          fontWeight: 'medium',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="Chỉnh sửa" arrow placement="top">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEditDialog(product)}
                            sx={{ 
                              mx: 0.5,
                              transition: 'transform 0.2s ease',
                              '&:hover': { transform: 'translateY(-3px)' }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={product.active ? 'Vô hiệu hóa' : 'Kích hoạt'} arrow placement="top">
                          <IconButton
                            color={product.active ? 'default' : 'success'}
                            onClick={() => handleToggleProductStatus(product)}
                            sx={{ 
                              mx: 0.5,
                              transition: 'transform 0.2s ease',
                              '&:hover': { transform: 'translateY(-3px)' }
                            }}
                          >
                            {product.active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa" arrow placement="top">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteProduct(product)}
                            sx={{ 
                              mx: 0.5,
                              transition: 'transform 0.2s ease',
                              '&:hover': { transform: 'translateY(-3px)' }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>      {/* Dialog thêm/chỉnh sửa sản phẩm */}
      <Dialog
        open={openProductDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          pb: 2,
          background: 'linear-gradient(to right, primary.light, primary.main)',
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}>
          {isEditing ? (
            <EditNoteIcon sx={{ mr: 1, fontSize: 28 }} />
          ) : (
            <AddCircleOutlineIcon sx={{ mr: 1, fontSize: 28 }} />
          )}
          {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, py: 4 }}>
          <Box component="form" sx={{ mt: 1 }}>
            {!isEditing && (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  '& .MuiAlert-icon': {
                    fontSize: 24
                  }
                }}
              >
                <AlertTitle>Lưu ý</AlertTitle>
                Hình ảnh sản phẩm là bắt buộc khi tạo sản phẩm mới.
              </Alert>
            )}
            {isEditing && (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  '& .MuiAlert-icon': {
                    fontSize: 24
                  }
                }}
              >
                <AlertTitle>Lưu ý</AlertTitle>
                Bạn có thể cập nhật thông tin sản phẩm mà không cần thay đổi hình ảnh. Chỉ chọn hình ảnh mới nếu muốn thay đổi.
              </Alert>
            )}
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Tên sản phẩm"
                  name="name"
                  value={currentProduct.name}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ShoppingBagIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Mô tả sản phẩm"
                  name="description"
                  value={currentProduct.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                        <DescriptionIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Giá"
                      name="price"
                      type="number"
                      value={currentProduct.price}
                      onChange={handleInputChange}
                      InputProps={{ 
                        inputProps: { min: 0, step: 1000 },
                        startAdornment: (
                          <InputAdornment position="start">
                            <PaidIcon color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: <InputAdornment position="end">₫</InputAdornment>
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Số lượng"
                      name="quantity"
                      type="number"
                      value={currentProduct.quantity}
                      onChange={handleInputChange}
                      InputProps={{ 
                        inputProps: { min: 0 },
                        startAdornment: (
                          <InputAdornment position="start">
                            <Inventory2Icon color="primary" />
                          </InputAdornment>
                        )
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                
                <FormControl fullWidth margin="normal" sx={{ mt: 3 }}>
                  <InputLabel>Danh mục</InputLabel>
                  <Select
                    name="categoryId"
                    value={currentProduct.categoryId}
                    onChange={handleInputChange}
                    label="Danh mục"
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon color="primary" />
                      </InputAdornment>
                    }
                    sx={{ 
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    {categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                {/* Thêm trường chọn hình ảnh */}
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhotoIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Hình ảnh sản phẩm {!isEditing && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
                  </Typography>
                  
                  {isEditing && currentProduct.image && (
                    <Box sx={{ 
                      mt: 2, 
                      mb: 3, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      p: 2,
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 2
                    }}>
                      <Typography variant="body2" gutterBottom color="text.secondary">
                        Hình ảnh hiện tại:
                      </Typography>
                      <Box sx={{ 
                        position: 'relative',
                        width: '100%',
                        height: 150,
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        mt: 1
                      }}>
                        <img 
                          src={currentProduct.image} 
                          alt="Hình ảnh hiện tại" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain'
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    flexGrow: selectedImage ? 0 : 1
                  }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadFileIcon />}
                      color={selectedImage ? "success" : "primary"}
                      sx={{ 
                        borderRadius: 2,
                        py: 1.2,
                        px: 3,
                        borderWidth: selectedImage ? 2 : 1,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderWidth: selectedImage ? 2 : 1,
                          transform: 'translateY(-3px)',
                          boxShadow: '0 5px 10px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      {selectedImage ? "Đã chọn hình ảnh mới" : isEditing ? "Thay đổi hình ảnh" : "Chọn hình ảnh"}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                        required={!isEditing}
                      />
                    </Button>
                  </Box>
                  
                  {selectedImage && (
                    <Box sx={{ 
                      mt: 3, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      p: 2,
                      border: '1px dashed rgba(0,0,0,0.1)',
                      borderRadius: 2,
                      backgroundColor: 'rgba(0,0,0,0.01)',
                      flexGrow: 1
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {isEditing ? "Hình ảnh mới:" : "Đã chọn:"}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <AttachFileIcon sx={{ mr: 0.5, fontSize: 18, color: 'primary.main' }} />
                        {selectedImage.name}
                      </Typography>
                      <Box sx={{ 
                        position: 'relative',
                        width: '100%',
                        height: 120,
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                      }}>
                        <img 
                          src={URL.createObjectURL(selectedImage)} 
                          alt="Preview" 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain'
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitProduct}
            disabled={!currentProduct.name || currentProduct.price <= 0 || (!isEditing && !selectedImage)}
            startIcon={isEditing ? <SaveIcon /> : <AddCircleIcon />}
            sx={{ 
              borderRadius: 2,
              px: 3,
              ml: 1,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 15px rgba(0,0,0,0.15)'
              },
              '&.Mui-disabled': {
                background: '#e0e0e0',
                color: '#a0a0a0'
              }
            }}
          >
            {isEditing ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog tải lên hình ảnh */}
      <Dialog
        open={openImageDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Tải lên hình ảnh sản phẩm</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            {currentProduct.image && (
              <CardMedia
                component="img"
                height="150"
                image={currentProduct.image}
                alt="Hình ảnh hiện tại"
                sx={{ mb: 2, borderRadius: 1, objectFit: 'contain' }}
              />
            )}
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
            >
              Chọn hình ảnh
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </Button>
            {selectedImage && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Đã chọn: {selectedImage.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleUploadImage}
            disabled={!selectedImage || uploadLoading}
          >
            {uploadLoading ? <CircularProgress size={24} /> : 'Tải lên'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>      </Snackbar>
    </Container>
    </AsyncPageWrapper>
  );
};

export default SellerProducts;
