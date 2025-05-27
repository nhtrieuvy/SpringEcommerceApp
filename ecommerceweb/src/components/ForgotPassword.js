import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress, 
  Paper,
  Card,
  InputAdornment,
  IconButton,
  Grow
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { defaultApi, endpoint } from '../configs/Apis';
import { styled } from "@mui/system";
import EmailIcon from '@mui/icons-material/Email';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

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

// Styled component cho form card
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

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Vui lòng nhập địa chỉ email.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setMessage(null);

      const response = await defaultApi.post(endpoint.FORGOT_PASSWORD, { email });
      
      if (response.data.success) {
        setMessage(response.data.message || 'Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn.');
        setSubmitted(true);
      } else {
        setError(response.data.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu khôi phục mật khẩu:', err);
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
                {submitted ? <MarkEmailReadIcon /> : <EmailIcon />}
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
                Quên mật khẩu
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

              {!submitted ? (
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
                    id="email"
                    label="Địa chỉ email"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="custom-input"
                    placeholder="Nhập địa chỉ email đã đăng ký"
                    helperText="Chúng tôi sẽ gửi một liên kết đặt lại mật khẩu đến địa chỉ email này."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: 'var(--primary-main)' }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />

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
                      'Gửi yêu cầu đặt lại mật khẩu'
                    )}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Vui lòng kiểm tra email của bạn để tiếp tục quá trình đặt lại mật khẩu.
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/login')}
                    sx={{ 
                      borderRadius: 2,
                    }}
                  >
                    Quay lại đăng nhập
                  </Button>
                </Box>
              )}

              {!submitted && (
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
              )}
            </Box>
          </StyledCard>
        </Grow>
      </Box>
    </Container>
  );
};

export default ForgotPassword;