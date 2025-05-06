import React, { useContext, useState, useEffect } from 'react';
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
  Tooltip
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
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

const Profile = () => {
  const [user, dispatch] = useContext(MyUserContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [tabValue, setTabValue] = useState(0);
  
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
  
  // States cho hiển thị/ẩn mật khẩu
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Preview cho avatar
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  // Cập nhật form từ thông tin user hiện tại
  useEffect(() => {
    if (user) {
      setProfileData({
        fullname: user.fullname || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: null
      });
    }
  }, [user]);
  
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
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    {user.fullname || user.username}
                  </Typography>
                  
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
                
                <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
                  Thành viên từ: {user.createdDate ? new Date(user.createdDate).toLocaleDateString('vi-VN') : 'N/A'}
                </Typography>
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
        
        {/* Tabs */}
        <StyledTabs 
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
          </Box>
        </TabPanel>
      </Card>
    </Container>
  );
};

export default Profile;