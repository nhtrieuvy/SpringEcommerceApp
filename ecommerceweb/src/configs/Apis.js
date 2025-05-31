import axios from "axios";
import cookie from "react-cookies";

const BASE_URL = "/SpringEcommerceApp-1.0-SNAPSHOT";

export const endpoint = {
  LOGIN: `/api/login`,
  REGISTER: `/api/register`,
  GOOGLE_LOGIN: `/api/login/google`,
  FACEBOOK_LOGIN: `/api/login/facebook`,
  UPDATE_PROFILE: `/api/profile`,
  CHANGE_PASSWORD: `/api/profile/password`,
  GET_USER_INFO: `/api/profile`,
  FORGOT_PASSWORD: `/api/password/forgot`,
  VALIDATE_RESET_TOKEN: `/api/password/reset/validate`,
  RESET_PASSWORD: `/api/password/reset`,
  REGISTER_SELLER: `/api/seller/register`,
  SEARCH_USERS: `/api/users/search`,

  // Reviews & Ratings
  GET_PRODUCT_REVIEWS: (productId) => `/api/review/product/${productId}`,
  CREATE_PRODUCT_REVIEW: () => `/api/review/product`,
  UPDATE_PRODUCT_REVIEW: (reviewId) => `/api/review/product/${reviewId}`,
  DELETE_PRODUCT_REVIEW: (reviewId) => `/api/review/product/${reviewId}`,
  CREATE_REVIEW_REPLY: () => `/api/review/reply`,
  GET_REVIEW_REPLIES: (reviewId) => `/api/review/reply/${reviewId}`,
  DELETE_REVIEW_REPLY: (replyId) => `/api/review/reply/${replyId}`,

  // Seller Management
  SELLER_REQUEST_STATUS: `/api/seller/request-status`,
  SELLER_REQUESTS: `/api/seller/requests`,
  APPROVE_SELLER_REQUEST: (id) => `/api/seller/requests/${id}/approve`,
  REJECT_SELLER_REQUEST: (id) => `/api/seller/requests/${id}/reject`,
  USER_CURRENT: `/api/user/current`,

  // User Management
  USERS: `/api/admin/users`,
  USER_DETAIL: (id) => `/api/admin/users/${id}`,
  USER_UPDATE: (id) => `/api/admin/users/${id}`,
  USER_DELETE: (id) => `/api/admin/users/${id}`,
  ROLES: `/api/admin/roles`,
  ASSIGN_ROLE: (userId) => `/api/admin/users/${userId}/roles`,
  REMOVE_ROLE: (userId, roleId) => `/api/admin/users/${userId}/roles/${roleId}`,
  USERS_BY_ROLE: (roleName) => `/api/admin/users/role/${roleName}`,

  // Store Management
  GET_STORES: `/api/stores`,
  GET_STORE_BY_ID: (id) => `/api/stores/${id}`,
  GET_STORES_BY_SELLER: (sellerId) => `/api/stores/seller/${sellerId}`,
  GET_SELLER_STORES: `/api/seller/products/stores`,
  CREATE_STORE: `/api/stores`,
  UPDATE_STORE: (id) => `/api/stores/${id}`,
  DELETE_STORE: (id) => `/api/stores/${id}`,

  // Product Management
  GET_PRODUCTS: `/api/products`,
  GET_PRODUCTS_BY_STORE: (storeId, page = 0, size = 10) =>
    `/api/products?storeId=${storeId}&page=${page}&size=${size}`,
  GET_PRODUCT_BY_ID: (id) => `/api/products/${id}`,
  CREATE_PRODUCT: `/api/products`,
  UPDATE_PRODUCT: (id) => `/api/products/${id}`,
  DELETE_PRODUCT: (id) => `/api/products/${id}`,
  SEARCH_PRODUCTS: `/api/products/search`,

  // Seller Products
  GET_SELLER_PRODUCTS: `/api/seller/products`,
  GET_SELLER_PRODUCTS_BY_STORE: (storeId) => `/api/seller/products/store/${storeId}`,
  CREATE_SELLER_PRODUCT: `/api/seller/products/create`,
  UPDATE_SELLER_PRODUCT: (id) => `/api/seller/products/${id}/update`,
  DELETE_SELLER_PRODUCT: (id) => `/api/seller/products/${id}`,
  UPLOAD_PRODUCT_IMAGE: (id) => `/api/seller/products/${id}/upload-image`,
  TOGGLE_PRODUCT_STATUS: (id) => `/api/seller/products/${id}/status`,

  // Categories
  GET_CATEGORIES: `/api/categories`,
  GET_CATEGORY_BY_ID: (id) => `/api/categories/${id}`,
  CREATE_CATEGORY: `/api/categories`,
  UPDATE_CATEGORY: (id) => `/api/categories/${id}`,
  DELETE_CATEGORY: (id) => `/api/categories/${id}`,

  // Product APIs
  "product-detail": (productId) => `/api/products/${productId}`,
  "product-comparison": (categoryId) => `/api/products/compare?categoryId=${categoryId}`,
  "product-compare-with": (productId) => `/api/products/compare-with-product?productId=${productId}`,

  // Cart
  GET_CART: `/api/cart`,
  ADD_TO_CART: `/api/cart/items`,
  UPDATE_CART_ITEM: (productId) => `/api/cart/items/${productId}`,
  REMOVE_FROM_CART: (productId) => `/api/cart/items/${productId}`,
  CLEAR_CART: `/api/cart`,
  VALIDATE_COUPON: `/api/coupons/validate`,

  // Wishlist
  GET_WISHLIST: `/api/wishlist`,
  ADD_TO_WISHLIST: `/api/wishlist/items`,
  REMOVE_FROM_WISHLIST: (productId) => `/api/wishlist/items/${productId}`,
  MOVE_TO_CART_FROM_WISHLIST: (productId) => `/api/wishlist/move-to-cart/${productId}`,
  MOVE_ALL_TO_CART_FROM_WISHLIST: `/api/wishlist/move-all-to-cart`,

  // Shipping & Recommendations
  SHIPPING_METHODS: `/api/shipping/methods`,
  GET_RECOMMENDATIONS: `/api/products/recommendations`,

  // Orders
  GET_ORDERS: `/api/orders`,
  GET_MY_ORDERS: `/api/orders/my-orders`,
  GET_ORDER_BY_ID: (id) => `/api/orders/${id}`,
  GET_ORDER_FULL_DETAILS: (id) => `/api/orders/${id}/full`,
  GET_ORDER_HISTORY: (id) => `/api/orders/${id}/history`,
  CREATE_ORDER: `/api/orders/create-order`,
  UPDATE_ORDER_STATUS: (id) => `/api/orders/${id}/status`,
  MARK_PAYMENT_COMPLETED: (id) => `/api/orders/${id}/payment-completed`,
  PAYPAL_PAYMENT_COMPLETED: (id) => `/api/orders/${id}/paypal-payment-completed`,

  // Seller Orders
  GET_SELLER_ORDERS_ALL: `/api/orders/seller/all`,
  GET_SELLER_ORDERS_BY_STORE: (storeId) => `/api/orders/seller/store/${storeId}`,
  UPDATE_SELLER_ORDER_STATUS: (id) => `/api/orders/${id}/status`,
  SELLER_STATISTICS: `/api/seller/statistics`,

  // Payments
  MOMO_PAYMENT: `/api/payments/momo/create`,
  MOMO_RETURN: `/api/payments/momo/return`,
  MOMO_NOTIFY: `/api/payments/momo/notify`,
  PROCESS_PAYMENT: `/api/payments/process`,
  EXECUTE_PAYPAL_PAYMENT: `/api/payments/paypal/execute`,
  PAYMENT_STATUS: (orderId) => `/api/payments/status/${orderId}`,
};

export const authApi = () => {
  let token = cookie.load("token") || localStorage.getItem("token");
  const authHeader = token ? (token.startsWith("Bearer ") ? token : `Bearer ${token}`) : "";

  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true"
    },
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
      if (config.data && typeof config.data === "object") {
        config.data = JSON.stringify(config.data);
      }
    }
    return config;
  });

  return instance;
};

export const defaultApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const saveAuthCookie = (token, user) => {
  const tokenValue = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  
  cookie.save("token", tokenValue, {
    path: "/",
    secure: window.location.protocol === "https:",
    sameSite: "lax",
  });

  localStorage.setItem("token", tokenValue);
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
  return tokenValue;
};
