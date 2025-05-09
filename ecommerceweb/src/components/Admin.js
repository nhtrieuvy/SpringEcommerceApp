import React, { useState, useEffect, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { MyUserContext } from '../configs/MyContexts';
import { endpoint } from '../configs/Apis';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Collapse,
  Badge,
  Tooltip
} from '@mui/material';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DescriptionIcon from '@mui/icons-material/Description';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';

// Styled components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: '1px solid #e8e8e8',
  '& .MuiTabs-indicator': {
    backgroundColor: 'var(--primary-main)',
    height: 3,
  },
}));

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

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Admin = () => {
  const [user, dispatch] = useContext(MyUserContext);
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  
  // State cho trang quản lý yêu cầu đăng ký seller
  const [sellerRequests, setSellerRequests] = useState([]);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [currentRequest, setCurrentRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalRequests, setTotalRequests] = useState(0);
  const [reload, setReload] = useState(false);
  const [imageDialog, setImageDialog] = useState({ open: false, url: '', title: '' });
  
  // Lọc yêu cầu
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'
  
  useEffect(() => {
    // Kiểm tra quyền truy cập
    if (user && !(user.roles.some(role => role.name === 'ADMIN' || role.name === 'STAFF'))) {
      navigate('/', { replace: true });
      return;
    }
    
    // Lấy danh sách yêu cầu đăng ký seller
    fetchSellerRequests();
  }, [user, navigate, page, rowsPerPage, filter, reload]);
  
  const fetchSellerRequests = async () => {
    setLoading(true);
    try {
      const { authApi } = require('../configs/Apis');
      
      // Sử dụng query params để phân trang và lọc
      const response = await authApi().get(`${endpoint.SELLER_REQUESTS}?page=${page}&size=${rowsPerPage}&status=${filter}`);
      
      const data = response.data;
      if (data.success) {
        setSellerRequests(data.content);
        setTotalRequests(data.totalElements);
      } else {
        setMessage({ type: 'error', content: data.message || 'Không thể lấy danh sách yêu cầu' });
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách yêu cầu đăng ký seller:', error);
      setMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'Không thể kết nối đến máy chủ'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setMessage({ type: '', content: '' });
  };
  
  const handleExpandRequest = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };
  
  // Dialog handlers
  const handleOpenDialog = (type, request) => {
    setDialogType(type);
    setCurrentRequest(request);
    setRejectReason('');
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Xem ảnh
  const handleViewImage = (url, title) => {
    setImageDialog({ open: true, url, title });
  };
  
  const handleCloseImageDialog = () => {
    setImageDialog({ ...imageDialog, open: false });
  };
  
  // Xử lý yêu cầu đăng ký seller
  const handleApproveRequest = async () => {
    setLoading(true);
    try {
      const { authApi } = require('../configs/Apis');
      
      const response = await authApi().put(`${endpoint.SELLER_REQUESTS}/${currentRequest.id}/approve`);
      
      const data = response.data;
      if (data.success) {
        setMessage({ type: 'success', content: 'Đã phê duyệt yêu cầu đăng ký seller thành công!' });
        // Refresh danh sách yêu cầu
        setReload(!reload);
        handleCloseDialog();
      } else {
        setMessage({ type: 'error', content: data.message || 'Không thể phê duyệt yêu cầu' });
      }
    } catch (error) {
      console.error('Lỗi khi phê duyệt yêu cầu:', error);
      setMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'Không thể kết nối đến máy chủ'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRejectRequest = async () => {
    if (!rejectReason.trim()) {
      setMessage({ type: 'error', content: 'Vui lòng nhập lý do từ chối' });
      return;
    }
    
    setLoading(true);
    try {
      const { authApi } = require('../configs/Apis');
      
      const response = await authApi().put(`${endpoint.SELLER_REQUESTS}/${currentRequest.id}/reject`, {
        reason: rejectReason
      });
      
      const data = response.data;
      if (data.success) {
        setMessage({ type: 'success', content: 'Đã từ chối yêu cầu đăng ký seller!' });
        // Refresh danh sách yêu cầu
        setReload(!reload);
        handleCloseDialog();
      } else {
        setMessage({ type: 'error', content: data.message || 'Không thể từ chối yêu cầu' });
      }
    } catch (error) {
      console.error('Lỗi khi từ chối yêu cầu:', error);
      setMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'Không thể kết nối đến máy chủ'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Nếu chưa đăng nhập hoặc không có quyền admin/staff, chuyển hướng về trang chủ
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user && !(user.roles.some(role => role.name === 'ADMIN' || role.name === 'STAFF'))) {
    return <Navigate to="/" />;
  }
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Lấy màu chip theo trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return { bg: 'warning.light', color: 'warning.dark' };
      case 'APPROVED':
        return { bg: 'success.light', color: 'success.dark' };
      case 'REJECTED':
        return { bg: 'error.light', color: 'error.dark' };
      default:
        return { bg: 'grey.300', color: 'text.secondary' };
    }
  };
  
  // Lấy text hiển thị theo trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Đang chờ duyệt';
      case 'APPROVED':
        return 'Đã phê duyệt';
      case 'REJECTED':
        return 'Đã từ chối';
      default:
        return 'Không xác định';
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="fade-in">
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ 
          p: 3,
          background: 'linear-gradient(135deg, #4568DC 0%, #B06AB3 100%)',
          color: 'white'
        }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Quản trị hệ thống
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            Quản lý người dùng, sản phẩm và các hoạt động trên hệ thống.
          </Typography>
        </Box>
        
        {/* Tabs */}
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="admin tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <StyledTab
            icon={<StoreIcon />}
            iconPosition="start"
            label="Yêu cầu đăng ký bán hàng"
          />
          <StyledTab
            icon={<PersonIcon />}
            iconPosition="start"
            label="Quản lý người dùng"
          />
          <StyledTab
            icon={<SupervisorAccountIcon />}
            iconPosition="start"
            label="Phân quyền"
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
              onClose={() => setMessage({ type: '', content: '' })}
            >
              {message.content}
            </Alert>
          )}
          
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6">
              Danh sách yêu cầu đăng ký bán hàng
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label="Tất cả" 
                onClick={() => setFilter('ALL')} 
                color={filter === 'ALL' ? 'primary' : 'default'}
                variant={filter === 'ALL' ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Đang chờ duyệt" 
                onClick={() => setFilter('PENDING')} 
                color={filter === 'PENDING' ? 'warning' : 'default'} 
                variant={filter === 'PENDING' ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Đã phê duyệt" 
                onClick={() => setFilter('APPROVED')} 
                color={filter === 'APPROVED' ? 'success' : 'default'} 
                variant={filter === 'APPROVED' ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Đã từ chối" 
                onClick={() => setFilter('REJECTED')} 
                color={filter === 'REJECTED' ? 'error' : 'default'} 
                variant={filter === 'REJECTED' ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {!loading && sellerRequests.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Không tìm thấy yêu cầu đăng ký bán hàng nào.
            </Alert>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
                      <TableCell width="5%"></TableCell>
                      <TableCell>Người đăng ký</TableCell>
                      <TableCell>Tên cửa hàng</TableCell>
                      <TableCell>Ngày đăng ký</TableCell>
                      <TableCell>Loại</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sellerRequests.map((request) => (
                      <React.Fragment key={request.id}>
                        <TableRow 
                          hover
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            cursor: 'pointer',
                            backgroundColor: expandedRequest === request.id ? 'rgba(0, 0, 0, 0.02)' : 'inherit'
                          }}
                          onClick={() => handleExpandRequest(request.id)}
                        >
                          <TableCell>
                            <IconButton size="small">
                              {expandedRequest === request.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar 
                                src={request.user?.avatar} 
                                alt={request.user?.username}
                                sx={{ width: 32, height: 32 }}
                              >
                                {request.user?.username?.charAt(0)?.toUpperCase()}
                              </Avatar>
                              <div>
                                <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                                  {request.user?.fullname}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {request.user?.email}
                                </Typography>
                              </div>
                            </Box>
                          </TableCell>
                          <TableCell>{request.shopName}</TableCell>
                          <TableCell>{formatDate(request.createdDate)}</TableCell>
                          <TableCell>
                            <Chip 
                              size="small"
                              label={request.sellerType === 'individual' ? 'Cá nhân' : 'Doanh nghiệp'} 
                              color={request.sellerType === 'individual' ? 'info' : 'secondary'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              size="small"
                              label={getStatusText(request.status)} 
                              sx={{ 
                                bgcolor: getStatusColor(request.status).bg,
                                color: getStatusColor(request.status).color,
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {request.status === 'PENDING' && (
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <Tooltip title="Phê duyệt">
                                  <IconButton 
                                    size="small" 
                                    color="success" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenDialog('approve', request);
                                    }}
                                  >
                                    <CheckCircleIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Từ chối">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenDialog('reject', request);
                                    }}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                        
                        {/* Chi tiết yêu cầu */}
                        <TableRow>
                          <TableCell colSpan={7} style={{ paddingTop: 0, paddingBottom: 0, border: 0 }}>
                            <Collapse in={expandedRequest === request.id} timeout="auto" unmountOnExit>
                              <Box sx={{ py: 3, px: 2 }}>
                                <Grid container spacing={3}>
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <DescriptionIcon fontSize="small" /> Thông tin cửa hàng
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                      <Typography variant="body2" gutterBottom>
                                        <strong>Tên cửa hàng:</strong> {request.shopName}
                                      </Typography>
                                      <Typography variant="body2" gutterBottom>
                                        <strong>Mô tả:</strong> {request.description || 'Không có'}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                        <LocationOnIcon fontSize="small" color="primary" />
                                        <Typography variant="body2">
                                          {request.address}
                                        </Typography>
                                      </Box>
                                    </Paper>
                                    
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <AccountBalanceIcon fontSize="small" /> Thông tin thanh toán
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                      <Typography variant="body2" gutterBottom>
                                        <strong>Ngân hàng:</strong> {request.bankName}
                                      </Typography>
                                      <Typography variant="body2" gutterBottom>
                                        <strong>Số tài khoản:</strong> {request.bankAccount}
                                      </Typography>
                                      {request.taxNumber && (
                                        <Typography variant="body2" gutterBottom>
                                          <strong>Mã số thuế:</strong> {request.taxNumber}
                                        </Typography>
                                      )}
                                    </Paper>
                                  </Grid>
                                  
                                  <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <ReceiptIcon fontSize="small" /> Giấy tờ xác minh
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                      {request.sellerType === 'individual' ? (
                                        <Grid container spacing={2}>
                                          {request.idCardFront && (
                                            <Grid item xs={6}>
                                              <Button
                                                variant="outlined"
                                                fullWidth
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleViewImage(request.idCardFront, 'CMND/CCCD mặt trước')}
                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                              >
                                                CMND mặt trước
                                              </Button>
                                            </Grid>
                                          )}
                                          {request.idCardBack && (
                                            <Grid item xs={6}>
                                              <Button
                                                variant="outlined"
                                                fullWidth
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleViewImage(request.idCardBack, 'CMND/CCCD mặt sau')}
                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                              >
                                                CMND mặt sau
                                              </Button>
                                            </Grid>
                                          )}
                                        </Grid>
                                      ) : (
                                        <Grid container spacing={2}>
                                          {request.businessLicense && (
                                            <Grid item xs={12}>
                                              <Button
                                                variant="outlined"
                                                fullWidth
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => handleViewImage(request.businessLicense, 'Giấy phép kinh doanh')}
                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                              >
                                                Giấy phép kinh doanh
                                              </Button>
                                            </Grid>
                                          )}
                                        </Grid>
                                      )}
                                    </Paper>
                                    
                                    {request.status !== 'PENDING' && (
                                      <>
                                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <InfoIcon fontSize="small" /> Thông tin xét duyệt
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                          <Typography variant="body2" gutterBottom>
                                            <strong>Trạng thái:</strong> {getStatusText(request.status)}
                                          </Typography>
                                          <Typography variant="body2" gutterBottom>
                                            <strong>Thời gian xét duyệt:</strong> {formatDate(request.updatedDate)}
                                          </Typography>
                                          {request.reviewedBy && (
                                            <Typography variant="body2" gutterBottom>
                                              <strong>Người xét duyệt:</strong> {request.reviewedBy}
                                            </Typography>
                                          )}
                                          {request.rejectionReason && (
                                            <Typography variant="body2" gutterBottom>
                                              <strong>Lý do từ chối:</strong> {request.rejectionReason}
                                            </Typography>
                                          )}
                                        </Paper>
                                      </>
                                    )}
                                  </Grid>
                                </Grid>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalRequests}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Hiển thị:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`}
              />
            </>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6">Quản lý người dùng</Typography>
          <Typography variant="body2" color="text.secondary">
            Chức năng đang phát triển...
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6">Phân quyền</Typography>
          <Typography variant="body2" color="text.secondary">
            Chức năng đang phát triển...
          </Typography>
        </TabPanel>
      </Paper>
      
      {/* Dialogs */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="dialog-title"
      >
        <DialogTitle id="dialog-title">
          {dialogType === 'approve' ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogType === 'approve' 
              ? `Bạn có chắc chắn muốn phê duyệt yêu cầu đăng ký bán hàng của "${currentRequest?.shopName}" không?` 
              : `Bạn có chắc chắn muốn từ chối yêu cầu đăng ký bán hàng của "${currentRequest?.shopName}" không?`}
          </DialogContentText>
          
          {dialogType === 'reject' && (
            <TextField
              autoFocus
              margin="dense"
              label="Lý do từ chối"
              fullWidth
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
              multiline
              rows={3}
              sx={{ mt: 2 }}
              placeholder="Nhập lý do từ chối để người dùng hiểu và có thể khắc phục"
              variant="outlined"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Hủy</Button>
          <Button 
            onClick={dialogType === 'approve' ? handleApproveRequest : handleRejectRequest} 
            color={dialogType === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={dialogType === 'reject' && !rejectReason.trim()}
          >
            {dialogType === 'approve' ? 'Phê duyệt' : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Image Preview Dialog */}
      <Dialog
        open={imageDialog.open}
        onClose={handleCloseImageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{imageDialog.title}</DialogTitle>
        <DialogContent>
          {imageDialog.url && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <img 
                src={imageDialog.url} 
                alt={imageDialog.title}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} 
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog} color="inherit">Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;
