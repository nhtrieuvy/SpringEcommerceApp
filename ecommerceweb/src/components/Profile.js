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
  Tab
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';

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
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Header section */}
        <Box sx={{ 
          p: 3, 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <AccountCircleIcon fontSize="large" />
          <Typography variant="h5" component="h1">Thông tin tài khoản</Typography>
        </Box>
        
        {/* Tabs */}
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="profile tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Thông tin cá nhân" />
          <Tab label="Đổi mật khẩu" />
        </Tabs>
        
        {/* Tab content */}
        <TabPanel value={tabValue} index={0}>
          {message.content && (
            <Alert severity={message.type} sx={{ mb: 3 }}>
              {message.content}
            </Alert>
          )}
          
          <form onSubmit={handleProfileSubmit}>
            <Grid container spacing={3}>
              {/* Avatar section */}
              <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar 
                  src={avatarPreview || (user.avatar ? user.avatar : undefined)} 
                  sx={{ width: 120, height: 120, mb: 2 }}
                >
                  {!avatarPreview && !user.avatar && user.username.charAt(0).toUpperCase()}
                </Avatar>
                
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                >
                  Chọn ảnh đại diện
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Button>
                
                <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
                  Định dạng: JPG, JPEG, PNG. <br />
                  Kích thước tối đa: 5MB
                </Typography>
              </Grid>
              
              {/* Info section */}
              <Grid item xs={12} sm={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tên người dùng"
                      value={user.username}
                      disabled
                      variant="filled"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="fullname"
                      value={profileData.fullname}
                      onChange={handleProfileChange}
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
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={loading}
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
            <Alert severity={message.type} sx={{ mb: 3 }}>
              {message.content}
            </Alert>
          )}
          
          <Box sx={{ maxWidth: 500, mx: 'auto' }}>
            <form onSubmit={handlePasswordSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mật khẩu hiện tại"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mật khẩu mới"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu mới"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                    helperText={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' ? 'Mật khẩu không khớp' : ''}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Profile;