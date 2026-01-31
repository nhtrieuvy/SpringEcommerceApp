import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { MyUserContext } from '../configs/MyContexts';
import { endpoint } from '../configs/Apis';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  IconButton,
  InputAdornment,
  Fade,
  Chip,
  Tooltip,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  AlertTitle
} from '@mui/material';
import BadgeIcon from '@mui/icons-material/Badge';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import StoreIcon from '@mui/icons-material/Store';
import BusinessIcon from '@mui/icons-material/Business';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MoneyIcon from '@mui/icons-material/Money';
import CheckIcon from '@mui/icons-material/Check';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';

// Styled component cho thẻ Tabs tùy chỉnh
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: '1px solid #e8e8e8',
  '& .MuiTabs-indicator': {
    backgroundColor: 'var(--primary-main)',
    height: 3,
  },
}));

// Styled component cho thẻ Tab tùy chỉnh
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 'bold',
  fontSize: 16,
  marginRight: theme.spacing(1),
  color: 'var(--text-secondary)',
  '&.Mui-selected': {
    color: 'var(--primary-main)',
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(100, 95, 228, 0.32)',
  },
}));

// TabPanel component để hiển thị nội dung của từng tab
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={value === index}>
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
}

// Styled component cho upload avatar
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const Profile = () => {  const [user, dispatch] = useContext(MyUserContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sellerRequestStatus, setSellerRequestStatus] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [requestStatusChanged, setRequestStatusChanged] = useState(false);
  
  // Form states cho thông tin cá nhân
  const [profileData, setProfileData] = useState({
    fullname: '',
    email: '',
    phone: '',
    avatar: null
  });
  
  // Form states cho đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Form states cho đăng ký seller
  const [sellerData, setSellerData] = useState({
    shopName: '',
    description: '',
    address: '',
    taxNumber: '',
    bankAccount: '',
    bankName: '',
    sellerType: 'individual',
    idCardFront: null,
    idCardBack: null,
    businessLicense: null
  });
  
  // Preview cho ảnh giấy tờ
  const [idCardFrontPreview, setIdCardFrontPreview] = useState(null);
  const [idCardBackPreview, setIdCardBackPreview] = useState(null);
  const [businessLicensePreview, setBusinessLicensePreview] = useState(null);
    // States cho hiển thị/ẩn mật khẩu
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Preview cho avatar
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  // Các bước đăng ký seller
  const sellerRegistrationSteps = [
    'Thông tin cửa hàng',
    'Thông tin thanh toán',
    'Xác minh danh tính',
    'Hoàn tất'
  ];
  // Chức năng kiểm tra phải hiển thị tab bán hàng không
  const showSellerRegistrationTab = useCallback(() => {
    if (!user || !user.roles) return false;
    
    // Hiển thị tab đăng ký nếu là USER nhưng không phải SELLER, ADMIN hoặc STAFF
        return user.roles.some(role => role.name === 'USER') && 
          !user.roles.some(role => ['SELLER', 'ADMIN', 'STAFF'].includes(role.name));
      }, [user]);

  // Lấy trạng thái đăng ký seller 
  const fetchSellerRequestStatus = useCallback(async () => {
    try {
      const { authApi } = require('../configs/Apis');
      const response = await authApi().get(endpoint.SELLER_REQUEST_STATUS);
      const data = response.data;
      
      if (data.success) {
        if (data.status) {
          setSellerRequestStatus(data.status);
        }
        
        // Lưu lại thông tin lý do từ chối nếu có
        if (data.rejectionReason) {
          setRequestMessage(data.rejectionReason);
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy trạng thái đăng ký seller:', error);
    }
  }, []);
    // Cập nhật form từ thông tin user hiện tại
  useEffect(() => {
    if (user) {
      
      setProfileData({
        fullname: user.fullname || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: null
      });
      
      // Thiết lập giá trị mặc định cho form đăng ký seller
      setSellerData((prev) => ({
        ...prev,
        shopName: user.fullname ? `Cửa hàng của ${user.fullname}` : '',
        email: user.email || ''
      }));
      
      // Kiểm tra trạng thái đăng ký seller nếu phù hợp
      if (showSellerRegistrationTab()) {
        fetchSellerRequestStatus();
      }
    }
  }, [user, requestStatusChanged, showSellerRegistrationTab, fetchSellerRequestStatus]);
    // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setMessage({ type: '', content: '' });
  };
  
  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  // Handle seller form change
  const handleSellerChange = (e) => {
    const { name, value } = e.target;
    setSellerData({
      ...sellerData,
      [name]: value
    });
  };
  
  // Handle file upload cho đăng ký seller
  const handleSellerFileChange = (e, fileType) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fileType === 'idCardFront') {
          setIdCardFrontPreview(reader.result);
          setSellerData({ ...sellerData, idCardFront: file });
        } else if (fileType === 'idCardBack') {
          setIdCardBackPreview(reader.result);
          setSellerData({ ...sellerData, idCardBack: file });
        } else if (fileType === 'businessLicense') {
          setBusinessLicensePreview(reader.result);
          setSellerData({ ...sellerData, businessLicense: file });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Chuyển bước trong form đăng ký seller
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Mở/đóng dialog xác nhận đăng ký seller
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
    // Toggle hiện/ẩn mật khẩu
  const handleTogglePasswordVisibility = (field) => {
    if (field === 'current') setShowCurrentPassword(!showCurrentPassword);
    else if (field === 'new') setShowNewPassword(!showNewPassword);
    else if (field === 'confirm') setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Handle avatar upload
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileData({
        ...profileData,
        avatar: file
      });
      
      // Tạo preview cho avatar
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Submit đăng ký seller
  const handleSellerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });
    
    try {
      // Tạo FormData để gửi dữ liệu
      const formData = new FormData();
      
      // Thêm các trường vào formData
      formData.append('shopName', sellerData.shopName);
      formData.append('description', sellerData.description);
      formData.append('address', sellerData.address);
      formData.append('taxNumber', sellerData.taxNumber);
      formData.append('bankAccount', sellerData.bankAccount);
      formData.append('bankName', sellerData.bankName);
      formData.append('sellerType', sellerData.sellerType);
      
      // Thêm files nếu có
      if (sellerData.idCardFront) {
        formData.append('idCardFront', sellerData.idCardFront);
      }
      
      if (sellerData.idCardBack) {
        formData.append('idCardBack', sellerData.idCardBack);
      }
      
      if (sellerData.businessLicense) {
        formData.append('businessLicense', sellerData.businessLicense);
      }
      
      // Import authApi từ Apis.js
      const { authApi } = require('../configs/Apis');
      
      console.log("Đang gửi yêu cầu đăng ký seller...");
      
      // Gửi yêu cầu
      const response = await authApi().post(endpoint.REGISTER_SELLER, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("Kết quả đăng ký seller:", response.data);
      
      const data = response.data;
        if (data && data.success) {
        setMessage({ type: 'success', content: 'Yêu cầu đăng ký đã được gửi đi! Cửa hàng của bạn đang chờ được phê duyệt.' });
        setSellerRequestStatus('PENDING');
        setRequestStatusChanged(!requestStatusChanged);
        
        // Đóng dialog nếu đang mở
        handleCloseDialog();
        
        // Reset form
        setActiveStep(0);
      } else {
        setMessage({ type: 'error', content: data?.message || 'Có lỗi xảy ra, vui lòng thử lại.' });
      }
    } catch (error) {
      console.error('Lỗi đăng ký seller:', error);
      setMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'Không thể kết nối đến máy chủ. Lỗi: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Submit cập nhật thông tin cá nhân
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });
    
    try {
      // Tạo FormData để gửi dữ liệu
      const formData = new FormData();
      
      // Thêm tất cả các trường vào formData với tên rõ ràng
      formData.append('fullname', profileData.fullname || '');
      formData.append('email', profileData.email || '');
      formData.append('phone', profileData.phone || '');
      
      // Log xem có dữ liệu không
      console.log("FormData fields:", {
        fullname: profileData.fullname,
        email: profileData.email,
        phone: profileData.phone,
        hasAvatar: !!profileData.avatar
      });
      
      if (profileData.avatar) {
        formData.append('avatar', profileData.avatar);
      }
      
      // Import authApi từ Apis.js
      const { authApi } = require('../configs/Apis');
      
      console.log("Đang gửi request cập nhật thông tin đến:", endpoint.UPDATE_PROFILE);
      
      // Thêm thêm thông tin debug cho request
      const api = authApi();
      console.log("Request headers:", api.defaults.headers);
      
      // Gửi yêu cầu
      const response = await api.put(endpoint.UPDATE_PROFILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("Kết quả cập nhật:", response.data);
      
      const data = response.data;
      
      if (data && data.success) {
        setMessage({ type: 'success', content: 'Cập nhật thông tin thành công!' });
        
        // Cập nhật thông tin user trong context
        dispatch({
          type: 'LOGIN',
          payload: { ...user, ...data.user }
        });
        
        // Cập nhật thông tin vào localStorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...data.user }));
        
        // Reset avatar field
        setProfileData({
          ...profileData,
          avatar: null
        });
        setAvatarPreview(null);
      } else {
        setMessage({ type: 'error', content: data?.message || 'Có lỗi xảy ra, vui lòng thử lại.' });
      }
    } catch (error) {
      console.error('Lỗi cập nhật thông tin:', error);
      // Show detailed error information
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      
      setMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'Không thể kết nối đến máy chủ. Lỗi: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Submit đổi mật khẩu
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });
    
    // Kiểm tra mật khẩu mới và xác nhận mật khẩu
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', content: 'Mật khẩu mới và xác nhận mật khẩu không khớp!' });
      setLoading(false);
      return;
    }
    
    try {
      // Import authApi từ Apis.js thay vì sử dụng fetch trực tiếp
      const { authApi } = require('../configs/Apis');
      
      const response = await authApi().put(endpoint.CHANGE_PASSWORD, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      const data = response.data;
      
      if (data.success) {
        setMessage({ type: 'success', content: 'Đổi mật khẩu thành công!' });
        
        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', content: data.message || 'Có lỗi xảy ra, vui lòng thử lại.' });
      }
    } catch (error) {
      console.error('Lỗi đổi mật khẩu:', error);
      setMessage({ type: 'error', content: error.response?.data?.message || 'Không thể kết nối đến máy chủ.' });
    } finally {
      setLoading(false);
    }
  };
  
  // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    console.log("User data:", user),
    console.log("User roles:", user.roles),
    <Container maxWidth="md" sx={{ py: 4 }} className="fade-in">
      <Card className="custom-card" sx={{ overflow: 'visible', borderRadius: 3 }}>
        {/* Header section */}
        <Box sx={{ 
          p: { xs: 2, md: 3 }, 
          background: 'var(--primary-gradient)',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm="auto">
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar 
                  src={avatarPreview || (user.avatar ? user.avatar : undefined)} 
                  alt={user.username}
                  className="avatar"
                  sx={{ 
                    width: 80, 
                    height: 80,
                    border: '3px solid white',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  {!avatarPreview && !user.avatar && user.username?.charAt(0).toUpperCase()}
                </Avatar>
                
                {/* Nút thay đổi ảnh ngay trên avatar */}
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'white',
                    color: 'var(--primary-main)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    width: 30,
                    height: 30,
                    '&:hover': {
                      bgcolor: '#f0f0f0',
                    }
                  }}
                >
                  <PhotoCameraIcon fontSize="small" />
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </IconButton>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm>
              <Box>                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    {user.fullname || user.username}
                  </Typography>
                  
                  {/* Hiển thị vai trò cao nhất của người dùng */}
                  {user.roles && (
                    <Tooltip title="Vai trò của bạn">
                      <Chip 
                        icon={<SecurityIcon fontSize="small" />} 
                        label={user.roles.some(role => role.name === 'ADMIN') 
                              ? 'Admin' 
                              : user.roles.some(role => role.name === 'STAFF') 
                              ? 'Nhân viên' 
                              : user.roles.some(role => role.name === 'SELLER') 
                              ? 'Người bán' 
                              : 'Khách hàng'}
                        size="small"
                        sx={{ 
                          bgcolor: user.roles.some(role => role.name === 'ADMIN') 
                                 ? 'rgba(255,95,87,0.6)' 
                                 : user.roles.some(role => role.name === 'STAFF')
                                 ? 'rgba(255,160,0,0.6)'
                                 : user.roles.some(role => role.name === 'SELLER')
                                 ? 'rgba(65,176,110,0.6)'
                                 : 'rgba(92,119,255,0.6)', 
                          color: 'white',
                          '& .MuiChip-icon': { color: 'white' } 
                        }}
                      />
                    </Tooltip>
                  )}
                  
                  {user.authProvider && (
                    <Tooltip title={`Tài khoản đăng nhập qua ${user.authProvider}`}>
                      <Chip 
                        icon={<VerifiedUserIcon fontSize="small" />} 
                        label={user.authProvider === 'GOOGLE' ? 'Google' : user.authProvider === 'FACEBOOK' ? 'Facebook' : user.authProvider}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.2)', 
                          color: 'white',
                          '& .MuiChip-icon': { color: 'white' } 
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>
                
                <Typography variant="body1" sx={{ mt: 0.5, opacity: 0.9 }}>
                  {user.email}
                </Typography>
                
                <Box sx={{ mt: 0.5, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0, sm: 1 }, opacity: 0.8 }}>
                  <Typography variant="body2">
                    Thành viên từ: {user.createdDate ? new Date(user.createdDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>•</Typography>
                  <Typography variant="body2">
                    Lần cuối đăng nhập: {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString('vi-VN') + " " + new Date(user.createdDate).toLocaleDateString('vi-VN'): 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          {/* Background pattern */}
          <Box sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            zIndex: 0
          }} />
        </Box>
          {/* Tabs */}        <StyledTabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="profile tabs"
          variant="fullWidth"
        >
          <StyledTab 
            icon={<PersonIcon />} 
            iconPosition="start" 
            label="Thông tin cá nhân" 
          />
          <StyledTab 
            icon={<SecurityIcon />} 
            iconPosition="start" 
            label="Bảo mật" 
          />
          {showSellerRegistrationTab() && (
            <StyledTab 
              icon={<StoreIcon />} 
              iconPosition="start" 
              label="Đăng ký bán hàng" 
            />
          )}
        </StyledTabs>
        
        {/* Tab content */}
        <TabPanel value={tabValue} index={0}>
          {message.content && (
            <Alert 
              severity={message.type} 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: message.type === 'success' ? 'var(--success)' : 'var(--error)'
                }
              }}
            >
              {message.content}
            </Alert>
          )}
          
          <form onSubmit={handleProfileSubmit}>
            <Grid container spacing={3}>
              {/* Info section */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Tên đăng nhập"
                      value={user.username}
                      disabled
                      variant="outlined"
                      className="custom-input"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: 'var(--text-secondary)' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="fullname"
                      value={profileData.fullname}
                      onChange={handleProfileChange}
                      className="custom-input"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon sx={{ color: 'var(--primary-main)' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="custom-input"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: 'var(--primary-main)' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="custom-input"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: 'var(--primary-main)' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={loading}
                    className="custom-btn btn-primary"
                    sx={{ 
                      mt: 1,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      px: 3
                    }}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </TabPanel>
          <TabPanel value={tabValue} index={1}>
          {message.content && (
            <Alert 
              severity={message.type} 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: message.type === 'success' ? 'var(--success)' : 'var(--error)'
                }
              }}
            >
              {message.content}
            </Alert>
          )}
          
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <form onSubmit={handlePasswordSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mật khẩu hiện tại"
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="custom-input"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: 'var(--primary-main)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => handleTogglePasswordVisibility('current')}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mật khẩu mới"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    className="custom-input"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: 'var(--primary-main)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => handleTogglePasswordVisibility('new')}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu mới"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                    helperText={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'Mật khẩu không khớp' : ''}
                    className="custom-input"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: 'var(--primary-main)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => handleTogglePasswordVisibility('confirm')}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                      disabled={loading}
                      className="custom-btn btn-primary"
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 'bold',
                        px: 3
                      }}
                    >
                      {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Box>        </TabPanel>
        
        {/* Tab đăng ký bán hàng */}
        {showSellerRegistrationTab() && (
        <TabPanel value={tabValue} index={2}>
          {message.content && (
            <Alert 
              severity={message.type} 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: message.type === 'success' ? 'var(--success)' : 'var(--error)'
                }
              }}
            >
              {message.content}
            </Alert>
          )}
          
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Đăng ký trở thành người bán
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Mở rộng cơ hội kinh doanh của bạn bằng cách trở thành người bán trên nền tảng của chúng tôi. 
              Hoàn thành biểu mẫu đăng ký dưới đây để bắt đầu.
            </Typography>
              {sellerRequestStatus === 'PENDING' ? (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                <AlertTitle>Yêu cầu đang được xử lý</AlertTitle>
                Đăng ký bán hàng của bạn đã được gửi đi và đang trong quá trình xét duyệt. 
                Chúng tôi sẽ thông báo kết quả qua email trong vòng 2-3 ngày làm việc.
              </Alert>
            ) : sellerRequestStatus === 'APPROVED' ? (
              <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                <AlertTitle>Đăng ký đã được phê duyệt</AlertTitle>
                Chúc mừng! Đăng ký bán hàng của bạn đã được phê duyệt. Hãy làm mới trang để cập nhật quyền truy cập của bạn.
                <Button 
                  variant="contained" 
                  color="success" 
                  size="small" 
                  sx={{ mt: 1, borderRadius: 2 }}
                  onClick={() => window.location.reload()}
                >
                  Làm mới trang
                </Button>
              </Alert>
            ) : sellerRequestStatus === 'REJECTED' ? (
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                <AlertTitle>Đăng ký bị từ chối</AlertTitle>
                {requestMessage ? (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Lý do từ chối:</strong> {requestMessage}
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Rất tiếc, đăng ký bán hàng của bạn đã bị từ chối.
                  </Typography>
                )}
                <Button 
                  variant="contained" 
                  color="warning" 
                  size="small" 
                  sx={{ mt: 1, borderRadius: 2 }}
                  onClick={() => {
                    setSellerRequestStatus('');
                    setRequestStatusChanged(!requestStatusChanged);
                  }}
                >
                  Đăng ký lại
                </Button>
              </Alert>
            ) : (
              <>
                <Box sx={{ width: '100%', mt: 3 }}>
                  <Stepper activeStep={activeStep} alternativeLabel>
                    {sellerRegistrationSteps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (activeStep === sellerRegistrationSteps.length - 1) {
                    handleOpenDialog();
                  } else {
                    handleNext();
                  }
                }}>
                  <Box sx={{ mt: 4, minHeight: 320 }}>
                    {activeStep === 0 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Tên cửa hàng"
                            name="shopName"
                            value={sellerData.shopName}
                            onChange={handleSellerChange}
                            required
                            className="custom-input"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <StoreIcon sx={{ color: 'var(--primary-main)' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Mô tả cửa hàng"
                            name="description"
                            value={sellerData.description}
                            onChange={handleSellerChange}
                            required
                            multiline
                            rows={4}
                            className="custom-input"
                            helperText="Mô tả ngắn gọn về cửa hàng và sản phẩm của bạn"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Địa chỉ cửa hàng"
                            name="address"
                            value={sellerData.address}
                            onChange={handleSellerChange}
                            required
                            className="custom-input"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationOnIcon sx={{ color: 'var(--primary-main)' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">Loại hình kinh doanh</FormLabel>
                            <RadioGroup
                              row
                              name="sellerType"
                              value={sellerData.sellerType}
                              onChange={handleSellerChange}
                            >
                              <FormControlLabel 
                                value="individual" 
                                control={<Radio />} 
                                label="Cá nhân" 
                              />
                              <FormControlLabel 
                                value="business" 
                                control={<Radio />} 
                                label="Doanh nghiệp" 
                              />
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                      </Grid>
                    )}
                    
                    {activeStep === 1 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Mã số thuế"
                            name="taxNumber"
                            value={sellerData.taxNumber}
                            onChange={handleSellerChange}
                            required={sellerData.sellerType === 'business'}
                            className="custom-input"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <BusinessIcon sx={{ color: 'var(--primary-main)' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Số tài khoản ngân hàng"
                            name="bankAccount"
                            value={sellerData.bankAccount}
                            onChange={handleSellerChange}
                            required
                            className="custom-input"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CreditCardIcon sx={{ color: 'var(--primary-main)' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Tên ngân hàng"
                            name="bankName"
                            value={sellerData.bankName}
                            onChange={handleSellerChange}
                            required
                            className="custom-input"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <MoneyIcon sx={{ color: 'var(--primary-main)' }} />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    )}
                    
                    {activeStep === 2 && (
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" gutterBottom>
                            Xác minh danh tính
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            Vui lòng tải lên ảnh CMND/CCCD/Hộ chiếu hoặc giấy phép kinh doanh (nếu là doanh nghiệp)
                          </Typography>
                        </Grid>
                        
                        {sellerData.sellerType === 'individual' ? (
                          <>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  CMND/CCCD mặt trước
                                </Typography>
                                <Box 
                                  sx={{ 
                                    border: '1px dashed #ccc', 
                                    borderRadius: 2, 
                                    p: 2,
                                    height: 150,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    bgcolor: 'background.paper',
                                    boxShadow: idCardFrontPreview ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                                  }}
                                >
                                  {idCardFrontPreview ? (
                                    <img 
                                      src={idCardFrontPreview} 
                                      alt="CMND/CCCD mặt trước" 
                                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      Chưa có ảnh
                                    </Typography>
                                  )}
                                </Box>
                                <Button
                                  component="label"
                                  variant="outlined"
                                  startIcon={<PhotoCameraIcon />}
                                  sx={{ mt: 1, borderRadius: 2 }}
                                >
                                  Tải ảnh lên
                                  <VisuallyHiddenInput 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleSellerFileChange(e, 'idCardFront')}
                                    required={!idCardFrontPreview}
                                  />
                                </Button>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ textAlign: 'center', mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  CMND/CCCD mặt sau
                                </Typography>
                                <Box 
                                  sx={{ 
                                    border: '1px dashed #ccc', 
                                    borderRadius: 2, 
                                    p: 2,
                                    height: 150,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    bgcolor: 'background.paper',
                                    boxShadow: idCardBackPreview ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                                  }}
                                >
                                  {idCardBackPreview ? (
                                    <img 
                                      src={idCardBackPreview} 
                                      alt="CMND/CCCD mặt sau" 
                                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                                    />
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      Chưa có ảnh
                                    </Typography>
                                  )}
                                </Box>
                                <Button
                                  component="label"
                                  variant="outlined"
                                  startIcon={<PhotoCameraIcon />}
                                  sx={{ mt: 1, borderRadius: 2 }}
                                >
                                  Tải ảnh lên
                                  <VisuallyHiddenInput 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleSellerFileChange(e, 'idCardBack')}
                                    required={!idCardBackPreview}
                                  />
                                </Button>
                              </Box>
                            </Grid>
                          </>
                        ) : (
                          <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', mb: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Giấy phép kinh doanh
                              </Typography>
                              <Box 
                                sx={{ 
                                  border: '1px dashed #ccc', 
                                  borderRadius: 2, 
                                  p: 2,
                                  height: 200,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  bgcolor: 'background.paper',
                                  boxShadow: businessLicensePreview ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                                }}
                              >
                                {businessLicensePreview ? (
                                  <img 
                                    src={businessLicensePreview} 
                                    alt="Giấy phép kinh doanh" 
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                                  />
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    Chưa có ảnh
                                  </Typography>
                                )}
                              </Box>
                              <Button
                                component="label"
                                variant="outlined"
                                startIcon={<PhotoCameraIcon />}
                                sx={{ mt: 1, borderRadius: 2 }}
                              >
                                Tải ảnh lên
                                <VisuallyHiddenInput 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => handleSellerFileChange(e, 'businessLicense')}
                                  required={!businessLicensePreview}
                                />
                              </Button>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    )}
                      {activeStep === 3 && (
                      <Box sx={{ p: 3 }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                          <CheckIcon sx={{ fontSize: 60, color: 'var(--success)', mb: 2 }} />
                          <Typography variant="h6" gutterBottom>
                            Thông tin đã sẵn sàng
                          </Typography>
                          <Typography variant="body1">
                            Vui lòng kiểm tra lại thông tin trước khi gửi đi. 
                          </Typography>
                        </Box>
                        
                        {/* Tóm tắt thông tin đăng ký */}
                        <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'primary.main' }}>
                            Tóm tắt thông tin đăng ký
                          </Typography>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Tên cửa hàng</Typography>
                              <Typography variant="body1" gutterBottom>{sellerData.shopName}</Typography>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">Loại hình kinh doanh</Typography>
                              <Typography variant="body1" gutterBottom>
                                {sellerData.sellerType === 'individual' ? 'Cá nhân' : 'Doanh nghiệp'}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">Địa chỉ</Typography>
                              <Typography variant="body1" gutterBottom>{sellerData.address}</Typography>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">Thông tin thanh toán</Typography>
                              <Typography variant="body1" gutterBottom>
                                Ngân hàng {sellerData.bankName} - STK: {sellerData.bankAccount}
                              </Typography>
                            </Grid>
                            
                            {sellerData.taxNumber && (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">Mã số thuế</Typography>
                                <Typography variant="body1" gutterBottom>{sellerData.taxNumber}</Typography>
                              </Grid>
                            )}
                            
                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">Giấy tờ đã tải lên</Typography>
                              <Typography variant="body1">
                                {sellerData.sellerType === 'individual' 
                                  ? 'CMND/CCCD mặt trước và mặt sau' 
                                  : 'Giấy phép kinh doanh'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                        
                        <Box sx={{ mt: 2, bgcolor: 'info.lighter', p: 2, borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Sau khi gửi, yêu cầu của bạn sẽ được xem xét và phê duyệt bởi đội ngũ quản trị.
                            Thời gian xét duyệt thông thường là 2-3 ngày làm việc.
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                    <Button
                      color="inherit"
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                    >
                      Quay lại
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    <Button 
                      variant="contained" 
                      type="submit"
                      disabled={(activeStep === 2 && (
                        (sellerData.sellerType === 'individual' && (!sellerData.idCardFront || !sellerData.idCardBack)) || 
                        (sellerData.sellerType === 'business' && !sellerData.businessLicense)
                      )) || loading}
                    >
                      {activeStep === sellerRegistrationSteps.length - 1 ? 'Hoàn tất đăng ký' : 'Tiếp theo'}
                    </Button>
                  </Box>
                </form>
                
                {/* Dialog xác nhận */}
                <Dialog
                  open={dialogOpen}
                  onClose={handleCloseDialog}
                  aria-labelledby="confirm-dialog-title"
                  aria-describedby="confirm-dialog-description"
                >
                  <DialogTitle id="confirm-dialog-title">
                    Xác nhận đăng ký trở thành người bán
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText id="confirm-dialog-description">
                      Bạn có chắc chắn muốn gửi đăng ký này không? Đảm bảo rằng tất cả thông tin bạn cung cấp là chính xác.
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseDialog} color="inherit">Hủy</Button>
                    <Button 
                      onClick={handleSellerSubmit} 
                      variant="contained"
                      color="primary"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : 'Xác nhận gửi'}
                    </Button>
                  </DialogActions>
                </Dialog>
              </>
            )}
          </Box>
        </TabPanel>
        )}
      </Card>
    </Container>
  );
};

export default Profile;