import axios from 'axios';
import cookie from 'react-cookies';

// Trong React 19 với cấu hình proxy trong package.json,
// chúng ta KHÔNG cần prefix BASE_URL nữa
const BASE_URL = "/SpringEcommerceApp-1.0-SNAPSHOT";

console.log(`Đang sử dụng API server: ${BASE_URL || "proxy qua package.json"}`);

// Thêm interceptor để log mọi lỗi kết nối
axios.interceptors.request.use(request => {
    console.log('Đang gửi request đến:', request.url);
    return request;
});

axios.interceptors.response.use(
    response => {
        console.log('Nhận response từ:', response.config.url);
        return response;
    },
    error => {
        console.error('Lỗi API:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('Không nhận được response. Chi tiết lỗi request:', error.request);
        }
        return Promise.reject(error);
    }
);

export const endpoint = {
    LOGIN: `/api/login`,
    REGISTER: `/api/register`,
    
    // Thêm endpoints mới cho đăng nhập bằng mạng xã hội
    GOOGLE_LOGIN: `/api/login/google`,
    FACEBOOK_LOGIN: `/api/login/facebook`,
    
    UPDATE_PROFILE: `/api/profile`,
    CHANGE_PASSWORD: `/api/profile/password`,
    GET_USER_INFO: `/api/profile`,
    
    // Endpoints cho chức năng quên mật khẩu
    FORGOT_PASSWORD: `/api/password/forgot`,
    VALIDATE_RESET_TOKEN: `/api/password/reset/validate`,
    RESET_PASSWORD: `/api/password/reset`,
    
    // Endpoints cho đăng ký và quản lý seller
    REGISTER_SELLER: `/api/seller/register`,
    SELLER_REQUEST_STATUS: `/api/seller/request-status`,    SELLER_REQUESTS: `/api/seller/requests`,
    APPROVE_SELLER_REQUEST: (id) => `/api/seller/requests/${id}/approve`,
    REJECT_SELLER_REQUEST: (id) => `/api/seller/requests/${id}/reject`,
    
    // Endpoint lấy thông tin người dùng hiện tại
    USER_CURRENT: `/api/user/current`,

    // Endpoints cho quản lý người dùng
    USERS: `/api/admin/users`,
    USER_DETAIL: (id) => `/api/admin/users/${id}`,
    USER_UPDATE: (id) => `/api/admin/users/${id}`,
    USER_DELETE: (id) => `/api/admin/users/${id}`,
      // Endpoints cho phân quyền
    ROLES: `/api/admin/roles`,
    ASSIGN_ROLE: (userId) => `/api/admin/users/${userId}/roles`,
    REMOVE_ROLE: (userId, roleId) => `/api/admin/users/${userId}/roles/${roleId}`,
    
    // Endpoints để lấy danh sách người dùng theo role
    USERS_BY_ROLE: (roleName) => `/api/admin/users/role/${roleName}`,
};

// Hàm tạo instance axios với token xác thực
export const authApi = () => {
    // Kiểm tra và lấy token từ cookie hoặc localStorage 
    let token = cookie.load('token');
    if (!token) {
        token = localStorage.getItem('token');
    }
    
    console.log("Token hiện tại:", token);
    
    // Đảm bảo token có đúng định dạng
    const authHeader = token ? (
        token.startsWith('Bearer ') ? token : `Bearer ${token}`
    ) : '';
    
    console.log("Auth header:", authHeader);
    
    return axios.create({
        baseURL: BASE_URL, // Thêm baseURL cho các request có xác thực
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        withCredentials: true,
    });
}

// Instance axios mặc định không có xác thực
const defaultApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Hàm lưu cookie với các thông số phù hợp cho HTTPS
export const saveAuthCookie = (token, user) => {
    // Đảm bảo token đúng định dạng
    const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    // Lưu cookie với secure flag cho HTTPS
    cookie.save('token', tokenValue, {
        path: "/",
        secure: window.location.protocol === 'https:', // Chỉ bật secure khi dùng HTTPS
        sameSite: 'lax' // Điều chỉnh để hoạt động trong nhiều trường hợp hơn
    });
    
    // Lưu vào localStorage như backup
    localStorage.setItem('token', tokenValue);
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    }
    
    return tokenValue;
};

export default defaultApi;