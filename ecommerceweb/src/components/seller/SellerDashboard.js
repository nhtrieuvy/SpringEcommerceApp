import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MoneyIcon from '@mui/icons-material/Money';
import InsightsIcon from '@mui/icons-material/Insights';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../configs/MyContexts';

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Dashboard card data
  const dashboardCards = [
    {
      title: 'Quản lý cửa hàng',
      description: 'Tạo và quản lý cửa hàng của bạn',
      icon: <StorefrontIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => navigate('/seller/stores'),
      primary: true
    },
    {
      title: 'Quản lý sản phẩm',
      description: 'Thêm, sửa và quản lý sản phẩm của bạn',
      icon: <ShoppingBagIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      action: () => navigate('/seller/products'),
      primary: false
    },
    {
      title: 'Quản lý đơn hàng',
      description: 'Xem và xử lý đơn hàng từ khách hàng',
      icon: <InventoryIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      action: () => navigate('/seller/orders'),
      primary: false
    },
    {
      title: 'Thống kê & báo cáo',
      description: 'Xem thống kê doanh thu và báo cáo',
      icon: <InsightsIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      action: () => navigate('/seller/statistics'),
      primary: false
    },
    {
      title: 'Quản lý thanh toán',
      description: 'Cài đặt và quản lý thanh toán',
      icon: <MoneyIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      action: () => navigate('/seller/payments'),
      primary: false
    },
    {
      title: 'Cài đặt tài khoản',
      description: 'Cập nhật thông tin tài khoản người bán',
      icon: <SettingsIcon sx={{ fontSize: 40, color: 'text.secondary' }} />,
      action: () => navigate('/profile'),
      primary: false
    }
  ];
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <DashboardIcon sx={{ fontSize: 35, mr: 1, verticalAlign: 'text-bottom', color: 'var(--primary-main)' }} />
          Bảng điều khiển người bán
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Chào mừng{user ? `, ${user.firstName} ${user.lastName}` : ''}! Quản lý hoạt động kinh doanh của bạn trên sàn thương mại điện tử.
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Tổng quan
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {dashboardCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  border: card.primary ? '1px solid var(--primary-main)' : 'none',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
                    {card.description}
                  </Typography>
                  <Box sx={{ mt: 'auto' }}>
                    <Button 
                      variant={card.primary ? "contained" : "outlined"} 
                      color={card.primary ? "primary" : "inherit"}
                      onClick={card.action}
                      fullWidth
                    >
                      Truy cập
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Hoạt động gần đây
          </Typography>
          <Button variant="text" color="primary">
            Xem tất cả
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Chưa có hoạt động nào. Hãy bắt đầu bằng cách tạo cửa hàng và thêm sản phẩm!
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<StorefrontIcon />}
              onClick={() => navigate('/seller/stores')}
              sx={{ mr: 2 }}
            >
              Quản lý cửa hàng
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<ShoppingBagIcon />}
              onClick={() => navigate('/seller/products')}
            >
              Quản lý sản phẩm
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SellerDashboard;
