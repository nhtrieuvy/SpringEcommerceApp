import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api', // thay đổi nếu backend dùng cổng khác
});

export default API;
