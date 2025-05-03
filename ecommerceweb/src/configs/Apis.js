import axios from 'axios';
import cookie from 'react-cookies';
// Cập nhật chính xác context path
const SERVER_CONTEXT = "/SpringEcommerceApp-1.0-SNAPSHOT";
const SERVER = "http://localhost:8080";

export const endpoint = {
    LOGIN: `${SERVER_CONTEXT}/api/login`,
    REGISTER: `${SERVER_CONTEXT}/api/register`,
};

export const authApi = () => {
    return axios.create({
        baseURL: SERVER,
        headers: {
            'Authorization': cookie.load('token')
        },
        withCredentials: true,
    });
}
export default axios.create({
    baseURL: SERVER,
    withCredentials: true
})