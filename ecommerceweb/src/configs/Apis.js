import axios from "axios";
import cookie from "react-cookies";

// Trong React 19 với cấu hình proxy trong package.json,
// chúng ta KHÔNG cần prefix BASE_URL nữa
const BASE_URL = "/SpringEcommerceApp-1.0-SNAPSHOT";

console.log(`Đang sử dụng API server: ${BASE_URL || "proxy qua package.json"}`);

// Thêm interceptor để log mọi lỗi kết nối
axios.interceptors.request.use((request) => {
  console.log("Đang gửi request đến:", request.url);
  return request;
});

axios.interceptors.response.use(
  (response) => {
    console.log("Nhận response từ:", response.config.url);
    return response;
  },
  (error) => {
    console.error("Lỗi API:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error(
        "Không nhận được response. Chi tiết lỗi request:",
        error.request
      );
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
  RESET_PASSWORD: `/api/password/reset`, // Endpoints cho đăng ký và quản lý seller
  REGISTER_SELLER: `/api/seller/register`,

  // Endpoints cho reviews & ratings
  GET_PRODUCT_REVIEWS: (productId) => `/api/review/product/${productId}`,
  CREATE_PRODUCT_REVIEW: () => `/api/review/product`,
  UPDATE_PRODUCT_REVIEW: (reviewId) => `/api/review/product/${reviewId}`,
  DELETE_PRODUCT_REVIEW: (reviewId) => `/api/review/product/${reviewId}`,

  // GET_SELLER_REVIEWS: (sellerId) => `/api/review/seller/${sellerId}`, // Removed
  // CREATE_SELLER_REVIEW: () => `/api/review/seller`, // Removed
  // UPDATE_SELLER_REVIEW: (reviewId) => `/api/review/seller/${reviewId}`, // Removed
  // DELETE_SELLER_REVIEW: (reviewId) => `/api/review/seller/${reviewId}`, // Removed

  CREATE_REVIEW_REPLY: () => `/api/review/reply`,
  GET_REVIEW_REPLIES: (reviewId) => `/api/review/reply/${reviewId}`,
  DELETE_REVIEW_REPLY: (replyId) => `/api/review/reply/${replyId}`,
  SELLER_REQUEST_STATUS: `/api/seller/request-status`,
  SELLER_REQUESTS: `/api/seller/requests`,
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
  USERS_BY_ROLE: (roleName) => `/api/admin/users/role/${roleName}`,  // Endpoints cho quản lý cửa hàng
  GET_STORES: `/api/stores`,
  GET_STORE_BY_ID: (id) => `/api/stores/${id}`,
  GET_STORES_BY_SELLER: (sellerId) => `/api/stores/seller/${sellerId}`,
  GET_SELLER_STORES: `/api/seller/products/stores`,
  CREATE_STORE: `/api/stores`,
  UPDATE_STORE: (id) => `/api/stores/${id}`,
  DELETE_STORE: (id) => `/api/stores/${id}`,// Endpoints cho quản lý sản phẩm
  GET_PRODUCTS: `/api/products`,
  GET_PRODUCTS_BY_STORE: (storeId, page = 0, size = 10) =>
    `/api/products?storeId=${storeId}&page=${page}&size=${size}`,
  GET_PRODUCT_BY_ID: (id) => `/api/products/${id}`,
  CREATE_PRODUCT: `/api/products`,
  UPDATE_PRODUCT: (id) => `/api/products/${id}`,
  DELETE_PRODUCT: (id) => `/api/products/${id}`,
  SEARCH_PRODUCTS: `/api/products/search`, // Endpoints cho quản lý sản phẩm của seller
  GET_SELLER_PRODUCTS: `/api/seller/products`,
  GET_SELLER_PRODUCTS_BY_STORE: (storeId) =>
    `/api/seller/products/store/${storeId}`,
  CREATE_SELLER_PRODUCT: `/api/seller/products/create`, // Endpoint duy nhất cho tạo sản phẩm (bắt buộc có hình ảnh)
  UPDATE_SELLER_PRODUCT: (id) => `/api/seller/products/${id}/update`, // Endpoint duy nhất cho cập nhật sản phẩm (hỗ trợ cả có và không có hình ảnh)
  DELETE_SELLER_PRODUCT: (id) => `/api/seller/products/${id}`,
  UPLOAD_PRODUCT_IMAGE: (id) => `/api/seller/products/${id}/upload-image`,
  TOGGLE_PRODUCT_STATUS: (id) => `/api/seller/products/${id}/status`,

  // Endpoints cho quản lý danh mục
  GET_CATEGORIES: `/api/categories`,
  GET_CATEGORY_BY_ID: (id) => `/api/categories/${id}`,
  CREATE_CATEGORY: `/api/categories`,
  UPDATE_CATEGORY: (id) => `/api/categories/${id}`,
  DELETE_CATEGORY: (id) => `/api/categories/${id}`,
  // Product APIs
  products: `/api/products`,
  "product-detail": (productId) => `/api/products/${productId}`,
  "product-comparison": (categoryId) =>
    `/api/products/compare?categoryId=${categoryId}`,
  "product-compare-with": (productId) =>
    `/api/products/compare-with-product?productId=${productId}`,

  // Cart Endpoints
  GET_CART: `/api/cart`,
  ADD_TO_CART: `/api/cart/items`,
  UPDATE_CART_ITEM: (productId) => `/api/cart/items/${productId}`,
  REMOVE_FROM_CART: (productId) => `/api/cart/items/${productId}`,
  CLEAR_CART: `/api/cart`,
  VALIDATE_COUPON: `/api/coupons/validate`, // Wishlist Endpoints
  GET_WISHLIST: `/api/wishlist`,
  ADD_TO_WISHLIST: `/api/wishlist/items`,
  REMOVE_FROM_WISHLIST: (productId) => `/api/wishlist/items/${productId}`,
  MOVE_TO_CART_FROM_WISHLIST: (productId) =>
    `/api/wishlist/move-to-cart/${productId}`,
  MOVE_ALL_TO_CART_FROM_WISHLIST: `/api/wishlist/move-all-to-cart`,
  // Shipping Methods Endpoint
  SHIPPING_METHODS: `/api/shipping/methods`,

  // Recommendations Endpoint
  GET_RECOMMENDATIONS: `/api/products/recommendations`,  // Order Endpoints
  GET_ORDERS: `/api/orders`,
  GET_MY_ORDERS: `/api/orders/my-orders`,
  GET_ORDER_BY_ID: (id) => `/api/orders/${id}`,
  GET_ORDER_FULL_DETAILS: (id) => `/api/orders/${id}/full`,
  GET_ORDER_HISTORY: (id) => `/api/orders/${id}/history`,
  CREATE_ORDER: `/api/orders/create-order`,
  UPDATE_ORDER_STATUS: (id) => `/api/orders/${id}/status`,
  MARK_PAYMENT_COMPLETED: (id) => `/api/orders/${id}/payment-completed`,
  PAYPAL_PAYMENT_COMPLETED: (id) =>
    `/api/orders/${id}/paypal-payment-completed`,
    // Seller Order Management Endpoints
  GET_SELLER_ORDERS_ALL: `/api/orders/seller/all`,
  GET_SELLER_ORDERS_BY_STORE: (storeId) => `/api/orders/seller/store/${storeId}`,
  UPDATE_SELLER_ORDER_STATUS: (id) => `/api/orders/${id}/status`,
  
  // Seller Statistics Endpoints
  SELLER_STATISTICS: `/api/seller/statistics`,
  
  MOMO_PAYMENT: `/api/payments/momo/create`,
  MOMO_RETURN: `/api/payments/momo/return`,
  MOMO_NOTIFY: `/api/payments/momo/notify`,

  // Payment Endpoints
  PROCESS_PAYMENT: `/api/payments/process`,
  EXECUTE_PAYPAL_PAYMENT: `/api/payments/paypal/execute`,
  PAYMENT_STATUS: (orderId) => `/api/payments/status/${orderId}`,
};

// Hàm tạo instance axios với token xác thực
export const authApi = () => {
  // Kiểm tra và lấy token từ cookie hoặc localStorage
  let token = cookie.load("token");
  if (!token) {
    token = localStorage.getItem("token");
  }

  console.log("Token hiện tại:", token);

  // Đảm bảo token có đúng định dạng
  const authHeader = token
    ? token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`
    : "";

  console.log("Auth header:", authHeader); // Create axios instance with enhanced debugging
  const instance = axios.create({
    baseURL: BASE_URL, // Thêm baseURL cho các request có xác thực
    headers: {
      Authorization: authHeader,

      Accept: "application/json",
    },
    withCredentials: true,
  }); // Add request interceptor to handle FormData vs JSON
  instance.interceptors.request.use(
    (config) => {
      // Kiểm tra nếu dữ liệu là FormData thì xóa Content-Type
      // để browser tự động xác định multipart boundary
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      } else {
        // Đảm bảo Content-Type phù hợp cho JSON
        config.headers["Content-Type"] = "application/json";

        // Đảm bảo dữ liệu được stringify nếu là object và không phải FormData
        if (config.data && typeof config.data === "object") {
          config.data = JSON.stringify(config.data);
        }
      }

      // Đảm bảo Accept header được đặt cho mọi request
      config.headers["Accept"] = "application/json, text/plain, */*";

      // Debug log chi tiết
      console.log("DEBUG - Request Config:", {
        url: config.url,
        method: config.method,
        headers: JSON.stringify(config.headers),
        data:
          config.data instanceof FormData
            ? "FormData (không hiển thị)"
            : config.data,
      });
      return config;
    },
    (error) => {
      console.error("Request Error:", error);
      return Promise.reject(error);
    }
  ); // Add response interceptor for debugging
  instance.interceptors.response.use(
    (response) => {
      console.log("DEBUG - Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: JSON.stringify(response.headers),
        data: JSON.stringify(response.data),
      });
      return response;
    },
    (error) => {
      console.error("Response Error:", error.message);
      if (error.response) {
        console.error("Error Status:", error.response.status);
        console.error("Error StatusText:", error.response.statusText);
        console.error("Error Headers:", JSON.stringify(error.response.headers));
        console.error("Error Data:", JSON.stringify(error.response.data));
        console.error("Request URL:", error.config?.url);
        console.error("Request Method:", error.config?.method);
        console.error(
          "Request Headers:",
          JSON.stringify(error.config?.headers)
        );
        console.error(
          "Request Data:",
          error.config?.data instanceof FormData
            ? "FormData (không hiển thị)"
            : error.config?.data
        );
      } else if (error.request) {
        console.error("No response received, request details:", error.request);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Instance axios mặc định không có xác thực
export const defaultApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Thêm interceptors để log và debug
defaultApi.interceptors.request.use(
  (config) => {
    console.log("DEFAULT API - Request:", {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("DEFAULT API - Request Error:", error);
    return Promise.reject(error);
  }
);

defaultApi.interceptors.response.use(
  (response) => {
    console.log("DEFAULT API - Response:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("DEFAULT API - Response Error:", error);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    return Promise.reject(error);
  }
);

// Hàm lưu cookie với các thông số phù hợp cho HTTPS
export const saveAuthCookie = (token, user) => {
  // Đảm bảo token đúng định dạng
  const tokenValue = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

  // Lưu cookie với secure flag cho HTTPS
  cookie.save("token", tokenValue, {
    path: "/",
    secure: window.location.protocol === "https:", // Chỉ bật secure khi dùng HTTPS
    sameSite: "lax", // Điều chỉnh để hoạt động trong nhiều trường hợp hơn
  });

  // Lưu vào localStorage như backup
  localStorage.setItem("token", tokenValue);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));  }  return tokenValue;
};
