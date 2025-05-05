import axios from 'axios';
import cookie from 'react-cookies';

const SERVER = "http://localhost:8080";
const SERVER_CONTEXT = "/SpringEcommerceApp-1.0-SNAPSHOT";

export const endpoint = {
    LOGIN: `${SERVER_CONTEXT}/api/login`,
    REGISTER: `${SERVER_CONTEXT}/api/register`,
    
    UPDATE_PROFILE: `${SERVER_CONTEXT}/api/profile`,
    CHANGE_PASSWORD: `${SERVER_CONTEXT}/api/profile/password`,
    GET_USER_INFO: `${SERVER_CONTEXT}/api/profile`,
};

// Hàm tạo instance axios với token xác thực
export const authApi = () => {
    // Kiểm tra và lấy token từ cookie hoặc localStorage 
    let token = cookie.load('token');
    if (!token) {
        token = localStorage.getItem('token');
    }
    
    console.log("Token hiện tại:", token); // Log để kiểm tra token
    
    // Đảm bảo token có đúng định dạng
    const authHeader = token ? (
        token.startsWith('Bearer ') ? token : `Bearer ${token}`
    ) : '';
    
    console.log("Auth header:", authHeader);
    
    return axios.create({
        baseURL: SERVER,
        headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
        },
        withCredentials: true,
    });
}

// Instance axios mặc định không có xác thực
export default axios.create({
    baseURL: SERVER,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true
});