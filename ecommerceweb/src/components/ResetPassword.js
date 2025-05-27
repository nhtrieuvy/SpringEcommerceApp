import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Card,
  InputAdornment,
  IconButton,
  Grow,
  FormHelperText,
  LinearProgress
} from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { defaultApi, endpoint } from '../configs/Apis';
import { styled } from "@mui/system";
import LockResetIcon from '@mui/icons-material/LockReset';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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
  width: '100%',
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

// Component cho thanh tiến trình mật khẩu
const PasswordStrengthMeter = ({ password }) => {
  const calculateStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Độ dài tối thiểu
    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 10;
    
    // Có ký tự số
    if (/\d/.test(password)) strength += 20;
    
    // Có ký tự đặc biệt
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
    
    // Có ký tự in hoa
    if (/[A-Z]/.test(password)) strength += 15;
    
    // Có ký tự in thường
    if (/[a-z]/.test(password)) strength += 15;
    
    return Math.min(strength, 100);
  };
  
  const strength = calculateStrength(password);
  
  const getColor = () => {
    if (strength < 30) return 'error';
    if (strength < 60) return 'warning';
    return 'success';
  };
  
  const getMessage = () => {
    if (strength < 30) return 'Yếu';
    if (strength < 60) return 'Trung bình';
    if (strength < 80) return 'Khá mạnh';
    return 'Mạnh';
  };
  
  return (
    <Box sx={{ width: '100%', mb: 2, mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Độ mạnh mật khẩu:
        </Typography>
        <Typography variant="caption" color={getColor()}>
          {getMessage()}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={strength}
        color={getColor()}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(3);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Lấy token từ URL parameter
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Token không hợp lệ hoặc đã hết hạn.');
    }
  }, [location]);

  // Hiệu ứng đếm ngược khi đặt lại mật khẩu thành công
  useEffect(() => {
    let timer;
    if (success && redirectTimer > 0) {
      timer = setTimeout(() => {
        setRedirectTimer(redirectTimer - 1);
      }, 1000);
    } else if (success && redirectTimer === 0) {
      navigate('/login');
    }
    return () => clearTimeout(timer);
  }, [success, redirectTimer, navigate]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setMessage(null);

      // Tạo payload đúng định dạng mà backend mong đợi
      const payload = {
        token: token.trim(), // Cắt bỏ khoảng trắng nếu có
        password: password
      };
      
      console.log("DEBUG - Chuẩn bị gửi request:");
      console.log("URL:", endpoint.RESET_PASSWORD);
      console.log("Payload:", JSON.stringify(payload, null, 2));

      const response = await defaultApi.post(endpoint.RESET_PASSWORD, payload);
      
      console.log("DEBUG - Phản hồi từ server:", response.data);
      
      if (response.data.success) {
        setMessage(response.data.message || 'Mật khẩu của bạn đã được đặt lại thành công.');
        setSuccess(true);
      } else {
        setError(response.data.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Lỗi khi đặt lại mật khẩu:', err);
      console.error('Chi tiết lỗi response:', err.response?.data);
      console.error('Chi tiết request:', err.config?.url, err.config?.data);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
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
                {success ? <CheckCircleIcon /> : <LockResetIcon />}
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
                Đặt lại mật khẩu
              </Typography>

              {error && 
                <Alert 
                  severity="error" 
                  sx={{ 
                    width: '100%', 
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: 'var(--error)'
                    }
                  }}
                >
                  {error}
                </Alert>
              }

              {message && 
                <Alert 
                  severity="success" 
                  sx={{ 
                    width: '100%', 
                    mb: 2,
                    borderRadius: 2,
                  }}
                >
                  {message}
                </Alert>
              }

              {!token ? (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                  </Typography>
                  <Button 
                    variant="contained" 
                    component={Link} 
                    to="/forgot-password"
                    sx={{ 
                      mr: 2,
                      borderRadius: 2,
                    }}
                  >
                    Yêu cầu link mới
                  </Button>
                  <Button 
                    variant="outlined" 
                    component={Link} 
                    to="/login"
                    sx={{ 
                      borderRadius: 2,
                    }}
                  >
                    Đăng nhập
                  </Button>
                </Box>
              ) : success ? (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Mật khẩu của bạn đã được đặt lại thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập trong {redirectTimer} giây...
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(3 - redirectTimer) * 33.33} 
                    sx={{ mb: 3, height: 6, borderRadius: 3 }} 
                  />
                  <Button 
                    variant="contained" 
                    component={Link} 
                    to="/login"
                    sx={{ 
                      borderRadius: 2,
                    }}
                  >
                    Đăng nhập ngay
                  </Button>
                </Box>
              ) : (
                <Box 
                  component="form" 
                  onSubmit={handleSubmit} 
                  noValidate 
                  sx={{ width: '100%' }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Mật khẩu mới"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                      mb: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  
                  <PasswordStrengthMeter password={password} />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                    error={confirmPassword !== '' && password !== confirmPassword}
                    helperText={confirmPassword !== '' && password !== confirmPassword ? 'Mật khẩu không khớp' : ''}
                  />

                  <FormHelperText sx={{ mb: 3, textAlign: 'left' }}>
                    Mật khẩu phải có ít nhất 6 ký tự. Nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt để tăng độ bảo mật.
                  </FormHelperText>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting}
                    className="custom-btn btn-primary"
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      mb: 2
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress 
                        size={24} 
                        sx={{ color: 'white' }} 
                        className="custom-spinner"
                      />
                    ) : (
                      'Đặt lại mật khẩu'
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button 
                      variant="text" 
                      component={Link} 
                      to="/login"
                      sx={{ 
                        color: 'var(--primary-main)',
                      }}
                    >
                      Quay lại đăng nhập
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          </StyledCard>
        </Grow>
      </Box>
    </Container>
  );
};

export default ResetPassword;