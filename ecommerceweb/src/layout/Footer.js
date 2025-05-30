import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Stack,
  Divider,
  Grid,
  TextField,
  useTheme,
  IconButton,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      className="footer"
      sx={{
        mt: 6,
        pt: 6,
        pb: 3,
        backgroundColor: 'var(--primary-dark)',
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        {/* Footer Main Content */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Logo and Description Column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShoppingBasketIcon sx={{ fontSize: 36, mr: 1 }} />
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                E-commerce Store
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, color: 'rgba(255,255,255,0.7)' }}>
              Trang thương mại điện tử với đa dạng sản phẩm chất lượng cao, 
              dịch vụ khách hàng tuyệt vời và giao hàng nhanh chóng. 
              Mua sắm an toàn và tiện lợi ngay hôm nay!
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                className="hover-scale"
                sx={{ 
                  color: 'white', 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { 
                    bgcolor: 'var(--primary-main)',
                    transform: 'translateY(-5px)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
                aria-label="Facebook"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton 
                className="hover-scale"
                sx={{ 
                  color: 'white', 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { 
                    bgcolor: 'var(--primary-main)',
                    transform: 'translateY(-5px)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
                aria-label="Twitter"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton 
                className="hover-scale"
                sx={{ 
                  color: 'white', 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { 
                    bgcolor: 'var(--primary-main)',
                    transform: 'translateY(-5px)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
                aria-label="Instagram"
              >
                <InstagramIcon />
              </IconButton>
              <IconButton 
                className="hover-scale"
                sx={{ 
                  color: 'white', 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { 
                    bgcolor: 'var(--primary-main)',
                    transform: 'translateY(-5px)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton 
                className="hover-scale"
                sx={{ 
                  color: 'white', 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { 
                    bgcolor: 'var(--primary-main)',
                    transform: 'translateY(-5px)'
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
                aria-label="YouTube"
              >
                <YouTubeIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links Column */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Liên kết nhanh
            </Typography>
            <Stack spacing={1}>
              <Link 
                component={RouterLink} 
                to="/"
                className="footer-link"
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  textDecoration: 'none',
                  position: 'relative',
                  width: 'fit-content',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '0',
                    height: '2px',
                    bottom: '-2px',
                    left: 0,
                    backgroundColor: 'var(--primary-light)',
                    transition: 'width 0.3s ease-in-out'
                  },
                  '&:hover::after': {
                    width: '100%'
                  }
                }}
              >
                Trang chủ
              </Link>
              <Link 
                component={RouterLink} 
                to="/products"
                className="footer-link"
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  textDecoration: 'none',
                  position: 'relative',
                  width: 'fit-content',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '0',
                    height: '2px',
                    bottom: '-2px',
                    left: 0,
                    backgroundColor: 'var(--primary-light)',
                    transition: 'width 0.3s ease-in-out'
                  },
                  '&:hover::after': {
                    width: '100%'
                  }
                }}
              >
                Sản phẩm
              </Link>
              <Link 
                href="#"
                className="footer-link"
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  textDecoration: 'none',
                  position: 'relative',
                  width: 'fit-content',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '0',
                    height: '2px',
                    bottom: '-2px',
                    left: 0,
                    backgroundColor: 'var(--primary-light)',
                    transition: 'width 0.3s ease-in-out'
                  },
                  '&:hover::after': {
                    width: '100%'
                  }
                }}
              >
                Về chúng tôi
              </Link>
              <Link 
                href="#"
                className="footer-link"
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  textDecoration: 'none',
                  position: 'relative',
                  width: 'fit-content',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '0',
                    height: '2px',
                    bottom: '-2px',
                    left: 0,
                    backgroundColor: 'var(--primary-light)',
                    transition: 'width 0.3s ease-in-out'
                  },
                  '&:hover::after': {
                    width: '100%'
                  }
                }}
              >
                Liên hệ
              </Link>
            </Stack>
          </Grid>

          {/* Services Column */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Dịch vụ
            </Typography>
            <Stack spacing={1}>
              <Link 
                href="#"
                className="footer-link"
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  textDecoration: 'none',
                  position: 'relative',
                  width: 'fit-content',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '0',
                    height: '2px',
                    bottom: '-2px',
                    left: 0,
                    backgroundColor: 'var(--primary-light)',
                    transition: 'width 0.3s ease-in-out'
                  },
                  '&:hover::after': {
                    width: '100%'
                  }
                }}
              >
                Giao hàng nhanh
              </Link>
              <Link 
                href="#"
                className="footer-link"
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  textDecoration: 'none',
                  position: 'relative',
                  width: 'fit-content',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '0',
                    height: '2px',
                    bottom: '-2px',
                    left: 0,
                    backgroundColor: 'var(--primary-light)',
                    transition: 'width 0.3s ease-in-out'
                  },
                  '&:hover::after': {
                    width: '100%'
                  }
                }}
              >
                Đổi trả dễ dàng
              </Link>
              <Link 
                href="#"
                className="footer-link"
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  textDecoration: 'none',
                  position: 'relative',
                  width: 'fit-content',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '0',
                    height: '2px',
                    bottom: '-2px',
                    left: 0,
                    backgroundColor: 'var(--primary-light)',
                    transition: 'width 0.3s ease-in-out'
                  },
                  '&:hover::after': {
                    width: '100%'
                  }
                }}
              >
                Thanh toán an toàn
              </Link>
              <Link 
                href="#"
                className="footer-link"
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  textDecoration: 'none',
                  position: 'relative',
                  width: 'fit-content',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: '0',
                    height: '2px',
                    bottom: '-2px',
                    left: 0,
                    backgroundColor: 'var(--primary-light)',
                    transition: 'width 0.3s ease-in-out'
                  },
                  '&:hover::after': {
                    width: '100%'
                  }
                }}
              >
                Hỗ trợ 24/7
              </Link>
            </Stack>
          </Grid>

          {/* Contact Information and Newsletter */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Liên hệ với chúng tôi
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon sx={{ mr: 1, color: 'var(--primary-light)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Tp. Hồ Chí Minh, Việt Nam
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon sx={{ mr: 1, color: 'var(--primary-light)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                +84 123 456 789
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <EmailIcon sx={{ mr: 1, color: 'var(--primary-light)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                support@ecommerce.com
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
              Đăng ký nhận tin
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
              Đăng ký để nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
            </Typography>
            <Box
              component="form"
              sx={{
                display: 'flex',
                position: 'relative',
              }}
            >
              <TextField
                variant="outlined"
                placeholder="Email của bạn"
                fullWidth
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  input: { 
                    color: 'white',
                    paddingRight: '40px',
                    '&::placeholder': {
                      color: 'rgba(255,255,255,0.5)',
                      opacity: 1
                    }
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--primary-light)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--primary-light)',
                    },
                  }
                }}
              />
              <IconButton
                type="submit"
                aria-label="Đăng ký"
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--primary-light)',
                  '&:hover': {
                    color: 'white',
                    bgcolor: 'var(--primary-main)',
                  }
                }}
              >
                <ArrowForwardIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Copyright Section */}
        <Box sx={{ pt: 3, pb: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            &copy; {new Date().getFullYear()} E-commerce Website. Tất cả quyền được bảo lưu.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mt: 1 }}>
            Thiết kế bởi Triệu Vỹ
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;