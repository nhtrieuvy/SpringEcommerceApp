import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { endpoint, defaultApi } from "../configs/Apis";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Link as MuiLink,
  InputLabel,
  InputAdornment,
  IconButton,
  Card,
  Grow,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  FormControlLabel,
  Checkbox,
  Tooltip
} from "@mui/material";
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { styled } from "@mui/system";

// Styled component cho icon header
const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(1),
  width: 60,
  height: 60,
  borderRadius: '50%',
  backgroundColor: 'var(--primary-light)',
  '& .MuiSvgIcon-root': {
    fontSize: 30,
    color: 'white'
  }
}));

// Styled component cho form
const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  overflow: 'visible',
  borderRadius: 16,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(4),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: 'var(--primary-gradient)',
    borderRadius: '16px 16px 0 0'
  }
}));

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

// Styled component cho avatar preview
const AvatarWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2)
}));

export default function Register() {
  const [form, setForm] = useState({ 
    username: "", 
    password: "", 
    email: "", 
    confirmPassword: "",
    isSeller: false 
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleFile = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setFileName(file.name);
      
      // Create preview URL for avatar
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMsg("Vui lòng nhập đúng định dạng email");
      return false;
    }

    // Validate password length
    if (form.password.length < 6) {
      setMsg("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    // Validate password match
    if (form.password !== form.confirmPassword) {
      setMsg("Mật khẩu xác nhận không khớp");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    // Kiểm tra dữ liệu đầu vào
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setMsg("Vui lòng điền đầy đủ thông tin cần thiết");
      setLoading(false);
      return;
    }

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }    try {
      console.log("Đang gửi request đăng ký đến:", endpoint.REGISTER);
      
      // Chuẩn bị dữ liệu để gửi
      const requestData = {
        username: form.username,
        email: form.email,
        password: form.password,
        isSeller: form.isSeller
      };
      
      // Thêm avatar nếu có (dưới dạng base64)
      if (avatarPreview) {
        requestData.avatar = avatarPreview;
      }
      
      // Gửi dữ liệu dưới dạng application/json
      const response = await defaultApi.post(endpoint.REGISTER, requestData);

      const data = response.data;
      console.log("Kết quả đăng ký:", data);

      if (data.success) {
        setMsg("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMsg(data.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      if (error.response) {
        console.error("Chi tiết lỗi:", error.response.data);
        setMsg(`Đăng ký thất bại: ${error.response.data.message || error.response.statusText}`);
      } else {
        setMsg("Không thể kết nối đến server. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" className="fade-in">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
        }}
      >
        <Grow in={true} timeout={800}>
          <StyledCard>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
              }}
            >
              <IconWrapper className="hover-scale">
                <PersonAddAltIcon />
              </IconWrapper>

              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'var(--primary-main)',
                  my: 2
                }}
              >
                Đăng ký tài khoản
              </Typography>

              {msg && (
                <Alert
                  severity={msg.includes("thành công") ? "success" : "error"}
                  sx={{ 
                    width: '100%', 
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: msg.includes("thành công") ? 'var(--success)' : 'var(--error)'
                    }
                  }}
                >
                  {msg}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Tên đăng nhập"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={form.username}
                  onChange={handleChange}
                  className="custom-input"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon sx={{ color: 'var(--primary-main)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className="custom-input"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'var(--primary-main)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
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
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
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
                          onClick={handleClickShowConfirmPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <AvatarWrapper>
                  <Typography variant="subtitle1" sx={{ mb: 1, color: 'var(--text-secondary)' }}>
                    Ảnh đại diện (tùy chọn)
                  </Typography>
                  
                  {avatarPreview ? (
                    <Avatar 
                      src={avatarPreview} 
                      alt="Avatar Preview" 
                      sx={{ 
                        width: 80, 
                        height: 80,
                        mb: 1,
                        border: '2px solid var(--primary-light)'
                      }}
                    />
                  ) : (
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80,
                        mb: 1,
                        bgcolor: 'var(--primary-light)'
                      }}
                    >
                      <PersonOutlineIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                  )}
                  
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCameraIcon />}
                    sx={{ 
                      textTransform: 'none',
                      mt: 1,
                      color: 'var(--primary-main)',
                      borderColor: 'var(--primary-light)',
                      '&:hover': {
                        borderColor: 'var(--primary-main)',
                        bgcolor: 'rgba(46, 125, 50, 0.04)'
                      }
                    }}
                  >
                    {fileName ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                    <VisuallyHiddenInput
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                    />
                  </Button>
                  {fileName && (
                    <Typography variant="caption" sx={{ mt: 0.5, color: 'var(--text-secondary)' }}>
                      {fileName}
                    </Typography>
                  )}
                </AvatarWrapper>

                <Box sx={{ mt: 2, mb: 2 }}>
                  <Tooltip title="Đăng ký như người bán hàng để tạo cửa hàng và bán sản phẩm">
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={form.isSeller}
                          onChange={handleChange}
                          name="isSeller"
                          color="primary"
                          icon={<StorefrontIcon sx={{ opacity: 0.5 }} />}
                          checkedIcon={<StorefrontIcon />}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2">
                            Đăng ký như người bán hàng
                          </Typography>
                        </Box>
                      }
                    />
                  </Tooltip>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  className="custom-btn btn-primary"
                  sx={{ 
                    mt: 1,
                    mb: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  {loading ? (
                    <CircularProgress 
                      size={24} 
                      sx={{ color: 'white' }} 
                      className="custom-spinner"
                    />
                  ) : (
                    'Đăng ký'
                  )}
                </Button>

                <Grid container justifyContent="center">
                  <Grid item>
                    <Typography variant="body2" sx={{ display: 'inline' }}>
                      Đã có tài khoản?
                    </Typography>
                    <MuiLink 
                      component={Link} 
                      to="/login" 
                      variant="body2"
                      sx={{ 
                        ml: 1,
                        color: 'var(--primary-main)',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      Đăng nhập ngay
                    </MuiLink>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </StyledCard>
        </Grow>
      </Box>
    </Container>
  );
}
