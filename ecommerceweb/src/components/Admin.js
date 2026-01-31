import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  Tooltip,
  FormControlLabel,
  Checkbox
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
  const [user] = useContext(MyUserContext);
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
  
  // State cho trang quản lý người dùng
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogType, setUserDialogType] = useState('');
  const [userFilter, setUserFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'INACTIVE'
    // State cho trang phân quyền
  const [roles, setRoles] = useState([]);
  const [userForRole, setUserForRole] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [roleReload, setRoleReload] = useState(false);
  const [usersByRole, setUsersByRole] = useState([]);
  const [currentRoleView, setCurrentRoleView] = useState('');
  const [roleUserDialogOpen, setRoleUserDialogOpen] = useState(false);
  const fetchSellerRequests = useCallback(async () => {
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
  }, [page, rowsPerPage, filter]);
  
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
  
  // Lấy danh sách người dùng
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { authApi } = require('../configs/Apis');
      
      // Sử dụng query params để phân trang và lọc
      const response = await authApi().get(`${endpoint.USERS}?page=${userPage}&size=${userRowsPerPage}&status=${userFilter}`);
      
      const data = response.data;
      if (data.success) {
        setUsers(data.content);
        setTotalUsers(data.totalElements);
      } else {
        setMessage({ type: 'error', content: data.message || 'Không thể lấy danh sách người dùng' });
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      setMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'Không thể kết nối đến máy chủ'
      });
    } finally {
      setLoading(false);
    }
  }, [userPage, userRowsPerPage, userFilter]);
  
  // Lấy chi tiết người dùng
  const fetchUserDetail = async (userId) => {
    setLoading(true);
    try {
      const { authApi } = require('../configs/Apis');
      
      const response = await authApi().get(endpoint.USER_DETAIL(userId));
      
      const data = response.data;
      if (data.success) {
        setSelectedUser(data.user);
        return data.user;
      } else {
        setMessage({ type: 'error', content: data.message || 'Không thể lấy thông tin người dùng' });
        return null;
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      setMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'Không thể kết nối đến máy chủ'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Cập nhật trạng thái người dùng (khóa/mở khóa)
  const updateUserStatus = async (userId, isActive) => {
    setLoading(true);
    try {
      const { authApi } = require('../configs/Apis');
        const response = await authApi().put(endpoint.USER_UPDATE(userId), {
        isActive: isActive,
        active: isActive // Include both property names for better compatibility
      });
      
      const data = response.data;
      if (data.success) {
        setMessage({ 
          type: 'success', 
          content: isActive 
            ? 'Đã kích hoạt tài khoản người dùng thành công!' 
            : 'Đã khóa tài khoản người dùng thành công!' 
        });
        
        // Refresh danh sách người dùng
        fetchUsers();
      } else {
        setMessage({ 
          type: 'error', 
          content: data.message || 'Không thể cập nhật trạng thái người dùng' 
        });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
      setMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'Không thể kết nối đến máy chủ'
      });
    } finally {
      setLoading(false);
      setUserDialogOpen(false);
    }
  };
  
  // Lấy danh sách quyền
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const { authApi } = require('../configs/Apis');
      
      const response = await authApi().get(endpoint.ROLES);
      
      const data = response.data;
      if (data.success) {
        setRoles(data.roles);
      } else {
        setMessage({ type: 'error', content: data.message || 'Không thể lấy danh sách quyền' });
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách quyền:', error);
      setMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'Không thể kết nối đến máy chủ'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Kiểm tra quyền truy cập
    if (user && !(user.roles.some(role => role.name === 'ADMIN' || role.name === 'STAFF'))) {
      navigate('/', { replace: true });
      return;
    }
    
    // Lấy danh sách yêu cầu đăng ký seller
    fetchSellerRequests();

    // Khi chuyển sang tab quản lý người dùng
    if (tabValue === 1) {
      fetchUsers();
    }

    // Khi chuyển sang tab phân quyền
    if (tabValue === 2) {
      fetchRoles();
    }
  }, [user, navigate, page, rowsPerPage, filter, reload, tabValue, userPage, userRowsPerPage, userFilter, roleReload, fetchSellerRequests, fetchUsers, fetchRoles]);
  
  // Mở dialog phân quyền
  const openRoleDialog = async (user) => {
    const userData = await fetchUserDetail(user.id);
    if (userData) {
      setUserForRole(userData);
      
      // Lấy danh sách quyền hiện có của người dùng
      const userRoles = userData.roles.map(role => role.id);
      setSelectedRoles(userRoles);
      
      // Lấy danh sách tất cả quyền
      if (roles.length === 0) {
        await fetchRoles();
      }
      
      // Hiển thị dialog
      setRoleDialogOpen(true);
    }
  };
    // Cập nhật quyền cho người dùng
  const updateUserRoles = async () => {
    // Kiểm tra người dùng hiện tại có phải là STAFF không
    const currentUserIsStaff = user && 
      user.roles.some(r => r.name === 'STAFF') && 
      !user.roles.some(r => r.name === 'ADMIN');
      
    // Kiểm tra người dùng đích có quyền ADMIN không
    const targetUserHasAdmin = userForRole.roles.some(r => r.name === 'ADMIN');
    
    // Nếu người dùng hiện tại là STAFF và người dùng đích có quyền ADMIN, không cho phép thay đổi
    if (currentUserIsStaff && targetUserHasAdmin) {
      setMessage({ type: 'error', content: 'Nhân viên không có quyền thay đổi quyền của người dùng có quyền ADMIN' });
      return;
    }
    
    // Lấy thông tin quyền ADMIN
    const adminRole = roles.find(role => role.name === 'ADMIN');
    
    // Kiểm tra nếu người dùng hiện tại là STAFF và đang cố gắng thêm quyền ADMIN
    if (currentUserIsStaff && adminRole && selectedRoles.includes(adminRole.id)) {
      setMessage({ type: 'error', content: 'Nhân viên không có quyền cấp quyền ADMIN cho người dùng' });
      return;
    }
      
    setLoading(true);
    try {
      const { authApi } = require('../configs/Apis');
      
      const response = await authApi().put(endpoint.ASSIGN_ROLE(userForRole.id), {
        roleIds: selectedRoles
      });
      
      const data = response.data;
      if (data.success) {
        setMessage({ type: 'success', content: 'Đã cập nhật quyền cho người dùng thành công!' });
        // Refresh
        setRoleReload(!roleReload);
        setRoleDialogOpen(false);
      } else {
        setMessage({ type: 'error', content: data.message || 'Không thể cập nhật quyền' });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật quyền:', error);
      setMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'Không thể kết nối đến máy chủ'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Lấy danh sách người dùng theo quyền
  const fetchUsersByRole = async (roleName) => {
    setLoading(true);
    try {
      const { authApi } = require('../configs/Apis');
      
      const response = await authApi().get(endpoint.USERS_BY_ROLE(roleName));
      
      const data = response.data;
      if (data.success) {
        setUsersByRole(data.content);
        // Mở dialog hiển thị danh sách
        setCurrentRoleView(roleName);
        setRoleUserDialogOpen(true);
      } else {
        setMessage({ type: 'error', content: data.message || `Không thể lấy danh sách người dùng có quyền ${roleName}` });
      }
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách người dùng có quyền ${roleName}:`, error);
      setMessage({ 
        type: 'error', 
        content: error.response?.data?.message || 'Không thể kết nối đến máy chủ'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý thay đổi trang và số dòng hiển thị cho phần quản lý người dùng
  const handleUserChangePage = (event, newPage) => {
    setUserPage(newPage);
  };

  const handleUserChangeRowsPerPage = (event) => {
    setUserRowsPerPage(parseInt(event.target.value, 10));
    setUserPage(0);
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
              Danh sách người dùng
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label="Tất cả" 
                onClick={() => setUserFilter('ALL')} 
                color={userFilter === 'ALL' ? 'primary' : 'default'}
                variant={userFilter === 'ALL' ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Đang hoạt động" 
                onClick={() => setUserFilter('ACTIVE')} 
                color={userFilter === 'ACTIVE' ? 'success' : 'default'} 
                variant={userFilter === 'ACTIVE' ? 'filled' : 'outlined'}
              />
              <Chip 
                label="Đã khóa" 
                onClick={() => setUserFilter('INACTIVE')} 
                color={userFilter === 'INACTIVE' ? 'error' : 'default'} 
                variant={userFilter === 'INACTIVE' ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          {!loading && users.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Không tìm thấy người dùng nào.
            </Alert>
          ) : (
            <>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
                      <TableCell>ID</TableCell>
                      <TableCell>Thông tin người dùng</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Vai trò</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow 
                        key={user.id}
                        hover
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell>{user.id}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar 
                              src={user.avatar} 
                              alt={user.username}
                              sx={{ width: 40, height: 40 }}
                            >
                              {user.fullname?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <div>
                              <Typography variant="body2" component="div" sx={{ fontWeight: 'bold' }}>
                                {user.fullname}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Tham gia: {formatDate(user.createdDate)}
                              </Typography>
                            </div>
                          </Box>
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {user.roles && user.roles.map((role) => (
                              <Chip 
                                key={role.id} 
                                size="small"
                                label={role.name === 'ADMIN' ? 'Quản trị viên' : 
                                       role.name === 'STAFF' ? 'Nhân viên' : 
                                       role.name === 'USER' ? 'Người dùng' : 
                                       role.name === 'SELLER' ? 'Người bán' : role.name}
                                color={role.name === 'ADMIN' ? 'error' : 
                                       role.name === 'STAFF' ? 'warning' : 
                                       role.name === 'SELLER' ? 'success' : 'info'}
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>                          <Chip 
                            size="small"
                            label={user.isActive || user.active ? 'Đang hoạt động' : 'Đã khóa'} 
                            color={user.isActive || user.active ? 'success' : 'error'}
                            sx={{ fontWeight: 'medium' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="Phân quyền">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => openRoleDialog(user)}
                              >
                                <SupervisorAccountIcon />
                              </IconButton>
                            </Tooltip>
                              {(user.isActive || user.active) ? (
                              <Tooltip title="Khóa tài khoản">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setUserDialogType('deactivate');
                                    setUserDialogOpen(true);
                                  }}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Kích hoạt tài khoản">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setUserDialogType('activate');
                                    setUserDialogOpen(true);
                                  }}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={totalUsers}
                rowsPerPage={userRowsPerPage}
                page={userPage}
                onPageChange={handleUserChangePage}
                onRowsPerPageChange={handleUserChangeRowsPerPage}
                labelRowsPerPage="Hiển thị:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`}
              />
            </>
          )}
        </TabPanel>
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
              onClose={() => setMessage({ type: '', content: '' })}
            >
              {message.content}
            </Alert>
          )}
          
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quản lý phân quyền người dùng
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Bạn có thể phân quyền cho người dùng bằng cách sử dụng chức năng phân quyền ở tab "Quản lý người dùng".
              Hoặc bạn có thể xem danh sách người dùng theo nhóm quyền dưới đây.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )}
            
            {!loading && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
                    <CardContent>
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          <SupervisorAccountIcon />
                        </Avatar>
                        <Typography variant="h6" component="div">
                          Quản trị viên
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Người dùng có toàn quyền quản trị hệ thống, bao gồm phân quyền và quản lý người dùng.
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => fetchUsersByRole('ADMIN')}
                      >
                        Xem danh sách
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
                    <CardContent>
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Typography variant="h6" component="div">
                          Nhân viên
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Người dùng có quyền quản lý nội dung hệ thống, phê duyệt đăng ký người bán.
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => fetchUsersByRole('STAFF')}
                      >
                        Xem danh sách
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
                    <CardContent>
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <StoreIcon />
                        </Avatar>
                        <Typography variant="h6" component="div">
                          Người bán
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Người dùng có quyền đăng bán sản phẩm, quản lý cửa hàng và đơn hàng.
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => fetchUsersByRole('SELLER')}
                      >
                        Xem danh sách
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
                    <CardContent>
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Typography variant="h6" component="div">
                          Người dùng
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Người dùng thông thường, có thể mua sắm và quản lý tài khoản cá nhân.
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => fetchUsersByRole('USER')}
                      >
                        Xem danh sách
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Paper>
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
      
      {/* User Management Dialog */}
      <Dialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        aria-labelledby="user-dialog-title"
      >
        <DialogTitle id="user-dialog-title">
          {userDialogType === 'activate' ? 'Kích hoạt tài khoản' : 'Khóa tài khoản'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {userDialogType === 'activate' 
              ? `Bạn có chắc chắn muốn kích hoạt tài khoản của "${selectedUser?.fullname || selectedUser?.username}" không?` 
              : `Bạn có chắc chắn muốn khóa tài khoản của "${selectedUser?.fullname || selectedUser?.username}" không?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)} color="inherit">Hủy</Button>
          <Button 
            onClick={() => updateUserStatus(selectedUser.id, userDialogType === 'activate')} 
            color={userDialogType === 'activate' ? 'success' : 'error'}
            variant="contained"
          >
            {userDialogType === 'activate' ? 'Kích hoạt' : 'Khóa tài khoản'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Role Management Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        aria-labelledby="role-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="role-dialog-title">
          Phân quyền người dùng
        </DialogTitle>
        <DialogContent>
          {userForRole && (
            <>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  src={userForRole.avatar} 
                  alt={userForRole.username}
                  sx={{ width: 50, height: 50 }}
                >
                  {userForRole.fullname?.charAt(0)?.toUpperCase() || userForRole.username?.charAt(0)?.toUpperCase()}
                </Avatar>
                <div>
                  <Typography variant="h6" component="div">
                    {userForRole.fullname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userForRole.email}
                  </Typography>
                </div>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                Quyền hạn
              </Typography>
                <Box sx={{ mt: 1 }}>
                {roles.map((role) => {
                  // Kiểm tra người dùng hiện tại có phải là STAFF không
                  const currentUserIsStaff = user && 
                    user.roles.some(r => r.name === 'STAFF') && 
                    !user.roles.some(r => r.name === 'ADMIN');
                  
                  // Nếu người dùng là STAFF và role là ADMIN, không hiển thị
                  if (currentUserIsStaff && role.name === 'ADMIN') {
                    return null;
                  }
                  
                  return (
                    <FormControlLabel
                      key={role.id}
                      control={
                        <Checkbox
                          checked={selectedRoles.includes(role.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRoles([...selectedRoles, role.id]);
                            } else {
                              setSelectedRoles(selectedRoles.filter(id => id !== role.id));
                            }
                          }}
                          // Vô hiệu hóa checkbox nếu người dùng là STAFF và đang thao tác với người dùng có quyền ADMIN
                          disabled={currentUserIsStaff && userForRole.roles.some(r => r.name === 'ADMIN')}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            size="small"
                            label={role.name === 'ADMIN' ? 'Quản trị viên' : 
                                  role.name === 'STAFF' ? 'Nhân viên' : 
                                  role.name === 'USER' ? 'Người dùng' : 
                                  role.name === 'SELLER' ? 'Người bán' : role.name}
                            color={role.name === 'ADMIN' ? 'error' : 
                                  role.name === 'STAFF' ? 'warning' : 
                                  role.name === 'SELLER' ? 'success' : 'info'}
                          />
                          <Typography variant="body2">
                            {role.description}
                          </Typography>
                        </Box>
                      }
                    />
                  );
                })}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)} color="inherit">Hủy</Button>
          <Button 
            onClick={updateUserRoles} 
            color="primary"
            variant="contained"
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog hiển thị danh sách người dùng theo quyền */}
      <Dialog
        open={roleUserDialogOpen}
        onClose={() => setRoleUserDialogOpen(false)}
        aria-labelledby="role-users-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="role-users-dialog-title">
          Danh sách người dùng có quyền {
            currentRoleView === 'ADMIN' ? 'Quản trị viên' :
            currentRoleView === 'STAFF' ? 'Nhân viên' :
            currentRoleView === 'SELLER' ? 'Người bán' :
            currentRoleView === 'USER' ? 'Người dùng thông thường' : 
            currentRoleView
          }
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : usersByRole.length === 0 ? (
            <Alert severity="info" sx={{ my: 2 }}>
              Không tìm thấy người dùng nào có quyền này.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
                    <TableCell>Người dùng</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersByRole.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar 
                            src={user.avatar} 
                            alt={user.username}
                            sx={{ width: 32, height: 32 }}
                          >
                            {user.fullname?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {user.fullname || user.username}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          size="small"
                          label={user.isActive || user.active ? 'Đang hoạt động' : 'Đã khóa'} 
                          color={user.isActive || user.active ? 'success' : 'error'}
                          sx={{ fontWeight: 'medium' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="Phân quyền">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setRoleUserDialogOpen(false);
                                openRoleDialog(user);
                              }}
                            >
                              <SupervisorAccountIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleUserDialogOpen(false)} color="inherit">Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;
