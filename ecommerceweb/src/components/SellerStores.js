import React, { useState, useEffect } from 'react';
import { authApi, endpoint } from '../configs/Apis';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  AlertTitle,
  Divider,
  Paper,
  Avatar,
  Tooltip,
  Chip,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../configs/MyContexts';

const SellerStores = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  
  // State for store dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);  const [currentStore, setCurrentStore] = useState({
    name: '',
    description: '',
    address: '',
    logo: ''
  });
  
  // State cho file logo
  const [logoFile, setLogoFile] = useState(null);
    // Hàm xử lý khi chọn file logo
  const handleLogoFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Tạo URL tạm thời để hiển thị ảnh preview
      const tempUrl = URL.createObjectURL(file);
      setCurrentStore({
        ...currentStore,
        logoPreview: tempUrl
      });
    }
  };
  
  // State for alerts
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Fetch stores on component mount
  useEffect(() => {
    fetchStores();
  }, [user]);
  const fetchStores = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await authApi().get(endpoint.GET_STORES_BY_SELLER(user.id));
      const storesWithProducts = response.data.map(store => ({
        ...store,
        products: store.products || [] // Ensure products collection is initialized
      }));
      setStores(storesWithProducts);
    } catch (error) {
      console.error("Error fetching stores:", error);
      showAlert("Không thể tải danh sách cửa hàng", "error");
    } finally {
      setLoading(false);
    }
  };    const handleOpenCreateDialog = () => {
    setCurrentStore({
      name: '',
      description: '',
      address: '',
      logo: ''
    });
    setLogoFile(null);
    setIsEditing(false);
    setOpenDialog(true);
  };
    const handleOpenEditDialog = (store) => {
    setCurrentStore({
      id: store.id,
      name: store.name,
      description: store.description,
      address: store.address,
      logo: store.logo
    });
    setLogoFile(null);
    setIsEditing(true);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStore({
      ...currentStore,
      [name]: value
    });
  };  const handleSubmitStore = async () => {
    try {
      let response;
      
      // Tạo FormData để gửi dữ liệu
      const formData = new FormData();
      formData.append('name', currentStore.name);
      formData.append('description', currentStore.description || '');
      formData.append('address', currentStore.address || '');
        // Nếu có chọn file logo mới thì gửi lên
      if (logoFile) {
        formData.append('file', logoFile);
      } else if (currentStore.logo) {
        // Nếu không có file mới nhưng có logo cũ (URL)
        formData.append('logoUrl', currentStore.logo);
      }
        if (isEditing) {
        console.log('Cập nhật cửa hàng với dữ liệu:', currentStore);
        console.log('FormData content:');
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }
        
        try {
          response = await authApi().put(
            endpoint.UPDATE_STORE(currentStore.id),
            formData
          );
          console.log('Phản hồi từ server:', response.data);
          showAlert("Cửa hàng đã được cập nhật thành công!");
        } catch (error) {
          console.error('Chi tiết lỗi cập nhật:', error);
          throw error; // Re-throw để catch block bên ngoài xử lý
        }
      } else {
        console.log('Tạo cửa hàng mới với dữ liệu:', currentStore.name);
        response = await authApi().post(
          endpoint.CREATE_STORE,
          formData
        );
        showAlert("Cửa hàng đã được tạo thành công!");
      }
      
      // Update stores list
      fetchStores();
      handleCloseDialog();
      
      // Reset logo file
      setLogoFile(null);    } catch (error) {
      console.error("Error saving store:", error);
      
      let errorMessage = `Không thể ${isEditing ? 'cập nhật' : 'tạo'} cửa hàng. `;
      
      if (error.response) {
        // Lỗi từ phía server
        const statusCode = error.response.status;
        console.log('Status code:', statusCode);
        
        switch(statusCode) {
          case 400:
            errorMessage += 'Dữ liệu không hợp lệ. Vui lòng kiểm tra thông tin và thử lại.';
            break;
          case 401:
            errorMessage += 'Bạn cần đăng nhập lại để thực hiện thao tác này.';
            break;
          case 403:
            errorMessage += 'Bạn không có quyền thực hiện thao tác này.';
            break;
          case 409:
            errorMessage += 'Có xung đột dữ liệu. Tên cửa hàng có thể đã được sử dụng.';
            break;
          case 500:
            errorMessage += 'Có lỗi từ máy chủ. Vui lòng thử lại sau.';
            break;
          default:
            errorMessage += 'Vui lòng thử lại!';
        }
      } else if (error.request) {
        // Không nhận được phản hồi từ server
        errorMessage += 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.';
      } else {
        // Lỗi trong quá trình thiết lập request
        errorMessage += 'Có lỗi xảy ra. Vui lòng thử lại sau.';
      }
      
      showAlert(errorMessage, "error");
    }
  };const handleDeleteStore = async (storeId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cửa hàng này? Tất cả sản phẩm trong cửa hàng cũng sẽ bị xóa.")) {
      return;
    }
    
    try {
      await authApi().delete(endpoint.DELETE_STORE(storeId));
      showAlert("Cửa hàng đã được xóa thành công!");
      fetchStores();
    } catch (error) {
      console.error("Error deleting store:", error);
      showAlert("Không thể xóa cửa hàng", "error");
    }
  };
  
  const navigateToProducts = (storeId) => {
    navigate('/seller/products', { state: { selectedStore: storeId } });
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
  };
  
  const renderStoreCards = () => {    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
          <CircularProgress color="primary" size={60} thickness={4} />
        </Box>
      );
    }
    
    if (stores.length === 0) {
      return (
        <Box sx={{ 
          textAlign: 'center', 
          py: 6, 
          background: 'rgba(0,0,0,0.01)', 
          borderRadius: 3,
          border: '2px dashed rgba(0,0,0,0.08)',
          mx: 2
        }}>
          <StorefrontIcon sx={{ 
            fontSize: 80, 
            color: 'primary.light', 
            mb: 2,
            opacity: 0.7
          }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary' }}>
            Bạn chưa có cửa hàng nào
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: '500px', mx: 'auto', mb: 4 }}>
            Tạo cửa hàng đầu tiên của bạn để bắt đầu bán hàng trên sàn thương mại điện tử
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
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
            Tạo cửa hàng ngay
          </Button>
        </Box>
      );
    }
      return (
      <Grid container spacing={3}>
        {stores.map((store) => (
          <Grid item xs={12} sm={6} md={4} key={store.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 3,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              boxShadow: '0 5px 15px rgba(0,0,0,0.06)',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '5px',
                height: '100%',
                backgroundColor: 'primary.main',
                transition: 'all 0.3s ease',
                opacity: 0.7
              }
            }}>
              <Box sx={{ 
                p: 2, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={store.logo || '/logo192.png'} 
                    alt={store.name}
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      mr: 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 'primary.main',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '150px'
                    }}
                  >
                    {store.name}
                  </Typography>
                </Box>
                <Box>
                  <Tooltip title="Chỉnh sửa cửa hàng" arrow placement="top">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditDialog(store)}
                      size="small"
                      sx={{ 
                        mr: 0.5,
                        transition: 'transform 0.2s ease',
                        '&:hover': { transform: 'translateY(-3px)' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa cửa hàng" arrow placement="top">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteStore(store.id)}
                      size="small"
                      sx={{ 
                        transition: 'transform 0.2s ease',
                        '&:hover': { transform: 'translateY(-3px)' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <CardContent sx={{ flexGrow: 1, p: 2.5, pt: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph 
                    sx={{ 
                      minHeight: '3em',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {store.description || "Chưa có mô tả cho cửa hàng này"}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    mb: 1,
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    p: 1.5,
                    borderRadius: 2
                  }}>
                    <LocationOnIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary', mt: 0.2 }} />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {store.address || "Chưa có địa chỉ"}
                    </Typography>
                  </Box>
                  
                  <Chip 
                    icon={<ShoppingBagIcon />} 
                    label={`${store.products?.length || 0} sản phẩm`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 1, borderRadius: 1 }}
                  />
                </Box>
              </CardContent>
              
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigateToProducts(store.id)}
                  sx={{ 
                    borderRadius: 2,
                    py: 1.2,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 15px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  Quản lý sản phẩm
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #f0f0f0, #ffffff)', 
          p: 3, 
          borderRadius: 2, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
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
            Quản lý cửa hàng
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            paragraph
            sx={{ ml: 6, maxWidth: '80%' }}
          >
            Tạo và quản lý các cửa hàng của bạn trên sàn thương mại điện tử
          </Typography>
        </Box>
      </Box>
        <Paper sx={{ 
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
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3 
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'medium', 
              display: 'flex', 
              alignItems: 'center' 
            }}
          >
            <StoreIcon sx={{ mr: 1, color: 'primary.main' }} />
            Cửa hàng của bạn
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            sx={{ 
              borderRadius: 2,
              py: 1.2,
              px: 3,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 15px rgba(0,0,0,0.15)'
              }
            }}
          >
            Tạo cửa hàng mới
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3, borderColor: 'rgba(0, 0, 0, 0.08)' }} />
        
        {renderStoreCards()}
      </Paper>
        {/* Dialog thêm/chỉnh sửa cửa hàng */}
      <Dialog 
        open={openDialog} 
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
          {isEditing ? 'Chỉnh sửa cửa hàng' : 'Tạo cửa hàng mới'}
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, py: 4 }}>
          <Box component="form" sx={{ mt: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <TextField
                  required
                  fullWidth
                  label="Tên cửa hàng"
                  name="name"
                  value={currentStore.name}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleIcon color="primary" />
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
                  fullWidth
                  label="Mô tả cửa hàng"
                  name="description"
                  value={currentStore.description}
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
                
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  name="address"
                  value={currentStore.address || ''}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <ImageIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Logo cửa hàng
                  </Typography>
                  
                  {!logoFile && currentStore.logo && (
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
                        Logo hiện tại:
                      </Typography>
                      <Box sx={{ 
                        position: 'relative',
                        width: '100%',
                        height: 120,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        mt: 1
                      }}>
                        <img 
                          src={currentStore.logo} 
                          alt="Logo hiện tại" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            e.target.src = '/logo192.png';
                            e.target.style.maxHeight = '60px';
                            e.target.alt = 'Logo mặc định';
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    flexGrow: logoFile ? 0 : 1
                  }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="logo-file-upload"
                      type="file"
                      onChange={handleLogoFileChange}
                    />
                    <label htmlFor="logo-file-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<FileUploadIcon />}
                        color={logoFile ? "success" : "primary"}
                        sx={{ 
                          borderRadius: 2,
                          py: 1.2,
                          px: 3,
                          borderWidth: logoFile ? 2 : 1,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderWidth: logoFile ? 2 : 1,
                            transform: 'translateY(-3px)',
                            boxShadow: '0 5px 10px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        {logoFile ? "Đã chọn logo mới" : (currentStore.logo ? "Thay đổi logo" : "Chọn logo cửa hàng")}
                      </Button>
                    </label>
                  </Box>
                  
                  {logoFile && (
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
                        Logo mới đã chọn:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <AttachFileIcon sx={{ mr: 0.5, fontSize: 18, color: 'primary.main' }} />
                        {logoFile.name}
                      </Typography>
                      
                      {currentStore.logoPreview && (
                        <Box sx={{ 
                          position: 'relative',
                          width: '100%',
                          height: 120,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}>
                          <img 
                            src={currentStore.logoPreview} 
                            alt="Logo preview" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '100%', 
                              objectFit: 'contain'
                            }}
                          />
                        </Box>
                      )}
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
            onClick={handleSubmitStore}
            disabled={!currentStore.name}
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
            {isEditing ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>
        {/* Snackbar thông báo */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 2 }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            '& .MuiAlert-icon': {
              fontSize: 28,
              mr: 2
            },
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          <AlertTitle>
            {alert.severity === 'success' ? 'Thành công' : 
             alert.severity === 'error' ? 'Lỗi' : 
             alert.severity === 'warning' ? 'Cảnh báo' : 'Thông tin'}
          </AlertTitle>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SellerStores;
