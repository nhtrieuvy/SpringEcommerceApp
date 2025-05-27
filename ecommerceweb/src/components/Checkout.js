import React, { useState, useEffect, useRef } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Divider,
  Avatar,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Snackbar,
  Chip,
  Breadcrumbs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import HomeIcon from "@mui/icons-material/Home";
import SecurityIcon from "@mui/icons-material/Security";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { useAuth } from "../configs/MyContexts";
import ShippingMethodSelection from "./ShippingMethodSelection";
import PaymentMethodSelection from "./PaymentMethodSelection";
import OrderConfirmationDialog from "./OrderConfirmationDialog";
import PayPalModal from "./PayPalModal";
import "../styles/CartStyles.css";
import { authApi, endpoint } from "../configs/Apis";
import { formatCurrency } from "../utils/FormatUtils";

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const orderCompleteRef = useRef(false);

  // API Helper Functions
  const getCartItems = async () => {
    try {
      const res = await authApi().get(endpoint.GET_CART);
      return res.data;
    } catch (error) {
      console.error("Error fetching cart items:", error);
      throw error;
    }
  };

  const getShippingMethods = async () => {
    try {
      const res = await authApi().get(endpoint.SHIPPING_METHODS);
      return res.data;
    } catch (error) {
      console.error("Error fetching shipping methods:", error);
      throw error;
    }
  };
  const submitOrder = async (orderData) => {
    try {
      // Ensure proper headers and content formatting
      const api = authApi();

      // Don't manually set Content-Type as it's handled by the interceptor
      // api.defaults.headers.common['Content-Type'] = 'application/json';

      // Convert any non-serializable objects to simpler formats
      const serializedOrderData = JSON.parse(JSON.stringify(orderData)); // Map payment method to backend enum
      if (serializedOrderData.paymentMethod) {
        // Convert frontend payment method to backend enum
        const paymentMethodMap = {
          cod: "CASH_ON_DELIVERY",
          paypal: "PAYPAL",
          PAYPAL: "PAYPAL", // Handle uppercase override from PayPal flow
          momo: "MOMO",
          MOMO: "MOMO", // Handle uppercase override
          card: "CASH_ON_DELIVERY", // Fallback for unsupported methods
          banking: "CASH_ON_DELIVERY", // Fallback for unsupported methods
        };

        console.log(
          "DEBUG: Original payment method:",
          serializedOrderData.paymentMethod
        );
        serializedOrderData.paymentMethod =
          paymentMethodMap[serializedOrderData.paymentMethod] ||
          "CASH_ON_DELIVERY";
        console.log(
          "DEBUG: Mapped payment method:",
          serializedOrderData.paymentMethod
        );
      }

      console.log("Sending order data:", serializedOrderData);
      const res = await api.post(endpoint.CREATE_ORDER, serializedOrderData);
      console.log("Order creation response:", res.data);

      return {
        success: true,
        orderNumber: res.data.order.id,
        ...res.data,
      };
    } catch (error) {
      console.error("Error submitting order:", error);
      setSnackbar({
        open: true,
        message: `Lỗi khi đặt hàng: ${
          error.response?.data?.message || error.message
        }`,
        severity: "error",
      });
      throw error;
    }
  };

  const validateCoupon = async (code) => {
    try {
      const res = await authApi().post(endpoint.VALIDATE_COUPON, { code });
      return res.data;
    } catch (error) {
      console.error("Error validating coupon:", error);
      throw error;
    }
  };
  // State variables
  const [cartItems, setCartItems] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.fullname || "",
    phone: "",
    email: user?.email || "",
    address: "",
    city: "",
    district: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  // PayPal-specific state - consolidated
  const [paypalOrderData, setPaypalOrderData] = useState(null);
  const [paypalError, setPaypalError] = useState(null);
  const [paypalModalOpen, setPaypalModalOpen] = useState(false); // Steps in the checkout process - simplified
  const steps = [
    "Thông tin giao hàng",
    "Phương thức thanh toán",
    "Xác nhận đơn hàng",
  ];

  // Calculate subtotal with proper null checking
  const getSubtotal = () => {
    if (!cartItems || !Array.isArray(cartItems)) {
      return 0;
    }
    return cartItems.reduce((total, item) => {
      const price = (item.product && item.product.price) || item.price || 0;
      return total + price * item.quantity;
    }, 0);
  };
  // Load cart items from API
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const initializeCheckout = async () => {
      try {
        setLoading(true); // Load cart items
        const cartData = await getCartItems();
        if (!cartData || cartData.length === 0) {
          navigate("/cart");
          return;
        }
        setCartItems(cartData);

        // Load shipping methods
        const shippingOptions = await getShippingMethods();
        setShippingMethods(shippingOptions);

        // Select default shipping method based on cart total
        // Calculate subtotal directly from cartData since cartItems state hasn't been updated yet
        const subtotal = cartData.reduce((total, item) => {
          const price = (item.product && item.product.price) || item.price || 0;
          return total + price * item.quantity;
        }, 0);

        const freeShippingOption = shippingOptions.find(
          (method) =>
            method.id === "free" &&
            (!method.minimumOrder || subtotal >= method.minimumOrder)
        );

        if (freeShippingOption) {
          setSelectedShipping(freeShippingOption);
        } else {
          setSelectedShipping(
            shippingOptions.find((method) => method.id === "standard") ||
              shippingOptions[0]
          );
        }
      } catch (error) {
        console.error("Error initializing checkout:", error);
        setSnackbar({
          open: true,
          message: "Không thể tải giỏ hàng. Vui lòng thử lại.",
          severity: "error",
        });
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout(); // Add event listener for cart updates
    const handleCartUpdate = async () => {
      try {
        const updatedCart = await getCartItems();
        setCartItems(updatedCart);

        // Only navigate to cart if order is not complete
        if (
          (!updatedCart || updatedCart.length === 0) &&
          !orderCompleteRef.current
        ) {
          navigate("/cart");
        }
      } catch (error) {
        console.error("Error updating cart:", error);
        // On error, clear cart items and navigate to cart
        setCartItems([]);
        if (!orderCompleteRef.current) {
          navigate("/cart");
        }
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [isAuthenticated, navigate]);

  // Handle shipping info changes
  const handleShippingInfoChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo({
      ...shippingInfo,
      [name]: value,
    });
  };
  // Handle shipping method change
  const handleShippingMethodChange = (shippingMethod) => {
    setSelectedShipping(shippingMethod);
  };
  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  // Calculate subtotal from cart items
  const calculateSubtotal = () => {
    return getSubtotal();
  };

  // Calculate shipping cost
  const calculateShipping = () => {
    return selectedShipping ? selectedShipping.price : 0;
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };
  // Format currency to VND
  const formatCurrency = (amount) => {
    // Handle null, undefined or NaN values
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "0 đ";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };
  // Validate shipping info
  const validateShippingInfo = () => {
    const { fullName, phone, email, address, city, district } = shippingInfo;
    return fullName && phone && email && address && city && district;
  };

  // Handle next step - simplified
  const handleNext = async () => {
    if (activeStep === 0 && !validateShippingInfo()) {
      setSnackbar({
        open: true,
        message: "Vui lòng điền đầy đủ thông tin giao hàng",
        severity: "error",
      });
      return;
    }
    if (activeStep === steps.length - 1) {
      // Final step - handle order placement
      console.log("DEBUG: handleNext - paymentMethod:", paymentMethod);
      if (paymentMethod === "paypal") {
        console.log("DEBUG: Taking PayPal path");
        // For PayPal, create initial order if not already created
        if (!paypalOrderData) {
          try {
            setLoading(true);
            const orderData = createOrderData();
            await handlePayPalOrder(orderData);
          } catch (error) {
            console.error("Error creating PayPal order:", error);
            setSnackbar({
              open: true,
              message: `Lỗi tạo đơn hàng PayPal: ${error.message}`,
              severity: "error",
            });
          } finally {
            setLoading(false);
          }
        }
        // PayPal payment will be handled by PayPalCheckout component
        return;
      } else if (paymentMethod === "momo") {
        console.log("DEBUG: Taking MoMo path");
        // Handle MoMo payment
        try {
          setLoading(true);
          const orderData = createOrderData();
          await handleMoMoPayment(orderData);
        } catch (error) {
          console.error("Error creating MoMo payment:", error);
          setSnackbar({
            open: true,
            message: `Lỗi tạo thanh toán MoMo: ${error.message}`,
            severity: "error",
          });
        } finally {
          setLoading(false);
        }
        return;
      } else {
        console.log(
          "DEBUG: Taking COD/Other path for payment method:",
          paymentMethod
        );
        // For other methods, process the order directly
        handlePlaceOrder();
      }
      return;
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Helper function to create order data
  const createOrderData = () => {
    if (!cartItems || !Array.isArray(cartItems)) {
      throw new Error("Cart items not available");
    }

    console.log("DEBUG: createOrderData - paymentMethod:", paymentMethod);

    const simplifiedItems = cartItems.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    return {
      items: simplifiedItems,
      subtotal: calculateSubtotal(),
      shipping: calculateShipping(),
      shippingMethod: selectedShipping
        ? {
            id: selectedShipping.id || null,
            name: selectedShipping.name,
            price: selectedShipping.price,
          }
        : null,
      total: calculateTotal(),
      shippingInfo: {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        email: shippingInfo.email,
        address: shippingInfo.address,
        district: shippingInfo.district,
        city: shippingInfo.city,
        notes: shippingInfo.notes || "",
      },
      paymentMethod: paymentMethod,
      orderDate: new Date().toISOString(),
    };
  };
  // Helper function to handle PayPal order creation
  const handlePayPalOrder = async (orderData) => {
    const initialOrder = await submitOrder({
      ...orderData,
      paymentMethod: "PAYPAL",
    });

    if (initialOrder.success) {
      console.log("Initial PayPal order created:", initialOrder);
      setPaypalOrderData({
        ...orderData,
        orderId: initialOrder.orderNumber,
        paymentMethod: "PAYPAL",
      });
      // Stay on the same step - PayPal button will handle the payment flow
    } else {
      throw new Error(
        initialOrder.message || "Failed to create initial PayPal order"
      );
    }
  };
  // Helper function to handle MoMo payment creation
  const handleMoMoPayment = async (orderData) => {
    try {
      // First, create the order in the database
      const initialOrder = await submitOrder({
        ...orderData,
        paymentMethod: "MOMO",
      });

      if (initialOrder.success) {
        console.log("Initial MoMo order created:", initialOrder);
          // Then create MoMo payment URL with the order ID using PaymentRequestDTO structure
        const response = await authApi().post(endpoint.MOMO_PAYMENT, {
          orderId: initialOrder.orderNumber,
          paymentMethod: "MOMO",
          successUrl: `${window.location.origin}/checkout/momo/return`,
          cancelUrl: `${window.location.origin}/checkout/momo/cancel`,
        });        if (response.data && response.data.redirectUrl) {
          console.log("MoMo payment URL created:", response.data.redirectUrl);
          // Redirect to MoMo payment page
          window.location.href = response.data.redirectUrl;
        } else {          throw new Error(
            (response.data && response.data.message) || 
            (response.data && response.data.error) || 
            "Failed to create MoMo payment"
          );
        }
      } else {
        throw new Error(
          initialOrder.message || "Failed to create initial MoMo order"
        );
      }
    } catch (error) {
      console.error("MoMo payment error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create MoMo payment"
      );
    }
  };
  // Handle place order for non-external payment methods (COD, etc.)
  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const orderData = createOrderData();

      const response = await submitOrder(orderData);

      if (response.success) {
        // Set order data for confirmation dialog
        setOrderData({
          id: response.orderNumber,
          status: 'PENDING',
          ...response
        });
        setOrderNumber(response.orderNumber);
        setOrderComplete(true);
        setShowConfirmationDialog(true);
        setActiveStep(3);
        // Dispatch cart update event to refresh cart
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        setSnackbar({
          open: true,
          message: "Đặt hàng thành công!",
          severity: "success",
        });
      } else {
        throw new Error(response.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setSnackbar({
        open: true,
        message: `Lỗi đặt hàng: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  // PayPal success handler
  const handlePayPalSuccess = (details, data) => {
    console.log("PayPal payment successful:", details, data);
    
    // Get order ID from paypalOrderData that was set during order creation
    const orderId = paypalOrderData?.orderId;
    
    if (orderId) {
      // Set order data for confirmation dialog
      setOrderData({
        id: orderId,
        status: 'PENDING',
        paymentMethod: 'PAYPAL'
      });
      setOrderNumber(orderId);
    }
    
    setOrderComplete(true);
    setShowConfirmationDialog(true);
    setActiveStep(3);
    // Dispatch cart update event to refresh cart
    window.dispatchEvent(new CustomEvent("cartUpdated"));
    setSnackbar({
      open: true,
      message: "Thanh toán PayPal thành công!",
      severity: "success",
    });
  };

  // PayPal cancel handler
  const handlePayPalCancel = (data) => {
    console.log("PayPal payment cancelled:", data);
    setSnackbar({
      open: true,
      message: "Thanh toán PayPal đã bị hủy",
      severity: "warning",
    });
  };

  // PayPal error handler
  const handlePayPalError = (err) => {
    console.error("PayPal payment error:", err);
    setSnackbar({
      open: true,
      message: "Lỗi thanh toán PayPal",
      severity: "error",
    });
  };

  // Order confirmation dialog handlers
  const handleConfirmationDialogClose = () => {
    setOrderComplete(false);
    navigate("/orders");
  };

  const handleContinueShopping = () => {
    setOrderComplete(false);
    navigate("/");
  };

  const handleTrackOrder = () => {
    setOrderComplete(false);
    navigate("/orders");
  };

  // Order status check handler
  const checkOrderStatus = () => {
    navigate("/orders");
  };

  // Continue shopping handler
  const continueShopping = () => {
    navigate("/");
  };

  // Render breadcrumbs
  const renderBreadcrumbs = () => (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 3 }}
    >
      <Typography
        component={RouterLink}
        to="/"
        sx={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          color: "text.primary",
          "&:hover": { color: "primary.main" },
        }}
      >
        <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
        Trang chủ
      </Typography>
      <Typography
        component={RouterLink}
        to="/cart"
        sx={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          color: "text.primary",
          "&:hover": { color: "primary.main" },
        }}
      >
        <ShoppingCartIcon sx={{ mr: 0.5 }} fontSize="inherit" />
        Giỏ hàng
      </Typography>
      <Typography
        color="text.primary"
        sx={{ display: "flex", alignItems: "center" }}
      >
        <PaymentIcon sx={{ mr: 0.5 }} fontSize="inherit" />
        Thanh toán
      </Typography>
    </Breadcrumbs>
  );

  // Render shipping form
  const renderShippingForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "medium" }}>
          Thông tin người nhận
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label="Họ và tên"
          name="fullName"
          value={shippingInfo.fullName}
          onChange={handleShippingInfoChange}
          InputProps={{
            startAdornment: (
              <PersonIcon
                fontSize="small"
                sx={{ mr: 1, color: "action.active" }}
              />
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="Số điện thoại"
          name="phone"
          value={shippingInfo.phone}
          onChange={handleShippingInfoChange}
          InputProps={{
            startAdornment: (
              <PhoneIcon
                fontSize="small"
                sx={{ mr: 1, color: "action.active" }}
              />
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="Email"
          name="email"
          type="email"
          value={shippingInfo.email}
          onChange={handleShippingInfoChange}
          InputProps={{
            startAdornment: (
              <EmailIcon
                fontSize="small"
                sx={{ mr: 1, color: "action.active" }}
              />
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: "medium", mt: 2 }}
        >
          Địa chỉ giao hàng
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label="Địa chỉ"
          name="address"
          value={shippingInfo.address}
          onChange={handleShippingInfoChange}
          InputProps={{
            startAdornment: (
              <LocationOnIcon
                fontSize="small"
                sx={{ mr: 1, color: "action.active" }}
              />
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="Thành phố/Tỉnh"
          name="city"
          value={shippingInfo.city}
          onChange={handleShippingInfoChange}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="Quận/Huyện"
          name="district"
          value={shippingInfo.district}
          onChange={handleShippingInfoChange}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Ghi chú đặt hàng (tùy chọn)"
          name="notes"
          multiline
          rows={3}
          value={shippingInfo.notes}
          onChange={handleShippingInfoChange}
          placeholder="Thông tin thêm về đơn hàng, yêu cầu giao hàng, v.v."
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
      </Grid>
    </Grid>
  );

  // Render shipping methods
  const renderShippingMethods = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: "medium", mb: 2 }}
        >
          Phương thức vận chuyển
        </Typography>

        <ShippingMethodSelection
          onShippingMethodChange={handleShippingMethodChange}
          subtotal={calculateSubtotal()}
        />
      </Grid>
    </Grid>
  ); // Render payment methods
  const renderPaymentMethods = () => (
    <Grid container spacing={3}>
      {/* Shipping Method Selection */}
      <Grid item xs={12}>
        {renderShippingMethods()}
      </Grid>
      <Grid item xs={12}>
        <Divider sx={{ my: 3 }} />
      </Grid>
      <Grid item xs={12}>
        <PaymentMethodSelection
          selectedPaymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
        />
      </Grid>{" "}
      <Grid item xs={12}>
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          <Typography variant="body2">
            {paymentMethod === "paypal"
              ? "PayPal đã được tích hợp và sẵn sàng để sử dụng. Bạn sẽ được chuyển hướng đến PayPal để hoàn tất thanh toán."
              : "Chức năng thanh toán hiện tại chỉ là demo. Tất cả các phương thức thanh toán đều sẽ được xử lý dưới dạng COD."}
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  );

  // Render order summary
  const renderOrderSummary = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "medium" }}>
          Xác nhận đơn hàng
        </Typography>
        <Paper
          elevation={0}
          sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(0,0,0,0.02)" }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Thông tin giao hàng
          </Typography>
          <Box sx={{ ml: 2, mb: 2 }}>
            <Typography variant="body2">
              <strong>Người nhận:</strong> {shippingInfo.fullName}
            </Typography>
            <Typography variant="body2">
              <strong>Điện thoại:</strong> {shippingInfo.phone}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {shippingInfo.email}
            </Typography>
            <Typography variant="body2">
              <strong>Địa chỉ:</strong> {shippingInfo.address},{" "}
              {shippingInfo.district}, {shippingInfo.city}
            </Typography>
            {shippingInfo.notes && (
              <Typography variant="body2">
                <strong>Ghi chú:</strong> {shippingInfo.notes}
              </Typography>
            )}
          </Box>
          <Typography variant="subtitle1" gutterBottom>
            Phương thức vận chuyển
          </Typography>
          <Box sx={{ ml: 2, mb: 2 }}>
            {" "}
            <Typography variant="body2">
              {selectedShipping
                ? `${selectedShipping.name} - ${
                    selectedShipping.price === 0
                      ? "Miễn phí"
                      : formatCurrency(selectedShipping.price)
                  }`
                : "Không có"}
            </Typography>
            {selectedShipping && (
              <Typography variant="body2" color="text.secondary">
                Thời gian giao hàng dự kiến:{" "}
                {selectedShipping.estimatedDelivery}
              </Typography>
            )}
          </Box>{" "}
          <Typography variant="subtitle1" gutterBottom>
            Phương thức thanh toán
          </Typography>
          <Box sx={{ ml: 2, mb: 2 }}>
            <Typography variant="body2">
              {paymentMethod === "cod" && "Thanh toán khi nhận hàng (COD)"}
              {paymentMethod === "card" && "Thẻ tín dụng/Ghi nợ"}
              {paymentMethod === "banking" && "Chuyển khoản ngân hàng"}
              {paymentMethod === "paypal" && "PayPal"}
            </Typography>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
          Các sản phẩm trong đơn hàng
        </Typography>{" "}
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <List sx={{ width: "100%", p: 0 }}>
            {cartItems &&
              cartItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem sx={{ py: 2, px: 3 }}>
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        alt={item.product.name}
                        src={
                          item.product.image || "https://via.placeholder.com/40"
                        }
                        sx={{ width: 40, height: 40, borderRadius: 1 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.product.name}
                      secondary={`${formatCurrency(item.product.price)} x ${
                        item.quantity
                      }`}
                    />
                    <Typography variant="subtitle2" color="primary.main">
                      {formatCurrency(item.product.price * item.quantity)}
                    </Typography>{" "}
                  </ListItem>
                  {index < (cartItems ? cartItems.length - 1 : 0) && (
                    <Divider />
                  )}
                </React.Fragment>
              ))}
          </List>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            borderRadius: 2,
            mt: 2,
            bgcolor: "primary.light",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Tổng cộng:</Typography>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {formatCurrency(calculateSubtotal())}
            </Typography>
          </Box>
        </Paper>
      </Grid>{" "}
      <Grid item xs={12}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <Typography variant="body2">
            Vui lòng kiểm tra kỹ thông tin đơn hàng trước khi đặt hàng. Đơn hàng
            không thể hủy sau khi đã xác nhận.
          </Typography>
        </Alert>
      </Grid>
      {/* PayPal Payment Section - shown only for PayPal payment method */}
      {paymentMethod === "paypal" && (
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: "rgba(0,0,0,0.02)",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/349/349230.png"
                alt="PayPal"
                height="32"
                style={{ marginRight: 12 }}
              />
              <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                Thanh toán PayPal: {formatCurrency(calculateTotal())}
              </Typography>
            </Box>{" "}
            {paypalError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {paypalError}
              </Alert>
            )}
            <Button
              variant="contained"
              onClick={() => setPaypalModalOpen(true)}
              disabled={loading || !paypalOrderData?.orderId}
              sx={{
                bgcolor: "#0070ba",
                color: "white",
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: "bold",
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "#005ea6",
                },
                "&:disabled": {
                  bgcolor: "rgba(0,0,0,0.12)",
                },
              }}
              fullWidth
            >
              {loading ? "Đang xử lý..." : "Thanh toán với PayPal"}
            </Button>
            {loading && (
              <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Đang xử lý thanh toán PayPal...
                </Typography>
              </Box>
            )}
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              <Typography variant="body2">
                Nhấn nút trên để mở cửa sổ thanh toán PayPal. Bạn có thể hoàn
                tất thanh toán mà không cần rời khỏi trang này.
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
  // Render current step content  
  const getStepContent = (step) => {
    // If order is complete, show a simple message and let OrderConfirmationDialog handle the main success flow
    if (orderComplete) {
      return (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Đơn hàng đã được xử lý thành công!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vui lòng đóng hộp thoại xác nhận để tiếp tục.
          </Typography>
        </Box>
      );
    }

    switch (step) {
      case 0:
        return renderShippingForm();
      case 1:
        return renderPaymentMethods();
      case 2:
        return renderOrderSummary();
      default:
        return <Typography>Unknown step</Typography>;
    }
  };
  // If cart is empty, redirect to cart page
  if ((!cartItems || cartItems.length === 0) && !orderComplete) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {renderBreadcrumbs()}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
          }}
        >
          <ShoppingCartIcon
            sx={{ fontSize: 60, color: "action.disabled", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            Giỏ hàng của bạn đang trống
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Bạn cần có sản phẩm trong giỏ hàng để tiến hành thanh toán.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/"
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 2, py: 1, px: 3 }}
          >
            Tiếp tục mua sắm
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      {!orderComplete && renderBreadcrumbs()}
      {/* Stepper */}
      {!orderComplete && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}
      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Checkout Form */}{" "}
        <Grid item xs={12} md={orderComplete ? 12 : 7}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
            }}
          >
            {getStepContent(activeStep)}

            {!orderComplete && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Quay lại
                </Button>{" "}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={loading}
                  endIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : activeStep === steps.length - 1 ? (
                      <CheckCircleIcon />
                    ) : (
                      <NavigateNextIcon />
                    )
                  }
                  sx={{ borderRadius: 2, px: 3, py: 1 }}
                >
                  {" "}
                  {loading
                    ? "Đang xử lý..."
                    : activeStep === steps.length - 1
                    ? paymentMethod === "paypal"
                      ? paypalOrderData
                        ? "Thanh toán qua PayPal"
                        : "Tạo đơn hàng PayPal"
                      : "Đặt hàng"
                    : "Tiếp tục"}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        {/* Order Summary */}
        {!orderComplete && (
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
                position: "sticky",
                top: 24,
                height: "100%",
              }}
            >
              {" "}
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: "primary.main",
                  color: "white",
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    sx={{ bgcolor: "white", color: "primary.main", mr: 1.5 }}
                  >
                    <ShoppingCartIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Tóm tắt đơn hàng
                  </Typography>
                </Box>{" "}
                <Chip
                  label={`${cartItems ? cartItems.length : 0} sản phẩm`}
                  size="small"
                  color="default"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: "medium",
                  }}
                />
              </Box>{" "}
              <Box sx={{ p: 3 }}>
                {" "}
                <List sx={{ width: "100%", p: 0 }}>
                  {cartItems &&
                    cartItems.map((item) => (
                      <ListItem
                        key={item.product.id}
                        sx={{
                          px: 0,
                          py: 2,
                          borderBottom: "1px dashed rgba(0,0,0,0.08)",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box
                          component="img"
                          src={
                            item.product.image ||
                            "https://via.placeholder.com/50"
                          }
                          alt={item.product.name}
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 1,
                            mr: 2,
                            objectFit: "cover",
                            border: "1px solid rgba(0,0,0,0.08)",
                          }}
                        />
                        <ListItemText
                          primary={
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500, mb: 0.5 }}
                            >
                              {item.product.name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {formatCurrency(item.product.price)} ×{" "}
                                {item.quantity}
                              </Typography>
                            </Box>
                          }
                        />
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          color="primary.main"
                        >
                          {formatCurrency(item.product.price * item.quantity)}
                        </Typography>
                      </ListItem>
                    ))}
                </List>{" "}
                <Divider sx={{ my: 3 }} />
                <Box
                  sx={{
                    mb: 3,
                    bgcolor: "rgba(0,0,0,0.02)",
                    p: 2,
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body1">Tạm tính:</Typography>
                    <Typography variant="body1">
                      {formatCurrency(calculateSubtotal())}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body1">Phí vận chuyển:</Typography>
                    {selectedShipping && selectedShipping.price === 0 ? (
                      <Typography
                        variant="body1"
                        color="success.main"
                        fontWeight={500}
                      >
                        Miễn phí
                      </Typography>
                    ) : (
                      <Typography variant="body1">
                        {selectedShipping
                          ? formatCurrency(selectedShipping.price)
                          : "N/A"}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {/* Delivery Estimate */}
                {selectedShipping && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 3,
                      py: 1.5,
                      px: 2,
                      borderRadius: 2,
                      bgcolor: "success.light",
                      color: "white",
                    }}
                  >
                    <LocalShippingIcon sx={{ mr: 1.5 }} />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        Giao hàng dự kiến:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedShipping.estimatedDelivery}
                      </Typography>
                    </Box>
                  </Box>
                )}
                <Divider sx={{ my: 3 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "primary.main",
                    p: 2.5,
                    borderRadius: 2,
                    mb: 2,
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" color="white">
                    Tổng cộng:
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    {formatCurrency(calculateTotal())}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  sx={{
                    py: 1.5,
                    mt: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {" "}
                  {activeStep === steps.length - 1
                    ? paymentMethod === "paypal"
                      ? paypalOrderData
                        ? "Thanh toán PayPal"
                        : "Tạo đơn hàng PayPal"
                      : "Xác nhận đặt hàng"
                    : "Tiếp tục thanh toán"}
                </Button>
                {/* Security Badge */}{" "}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 3,
                    pt: 2,
                    borderTop: "1px dashed rgba(0,0,0,0.1)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <SecurityIcon color="success" sx={{ mr: 1 }} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight="medium"
                    >
                      Thanh toán an toàn &amp; bảo mật
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/349/349221.png"
                      alt="Visa"
                      height="24"
                    />
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/349/349228.png"
                      alt="MasterCard"
                      height="24"
                    />
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/349/349230.png"
                      alt="PayPal"
                      height="24"
                    />
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/5968/5968299.png"
                      alt="JCB"
                      height="24"
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}{" "}
      </Grid>{" "}
      {/* PayPal Modal */}
      <PayPalModal
        open={paypalModalOpen}
        onClose={() => setPaypalModalOpen(false)}
        amount={calculateTotal()}
        orderId={paypalOrderData?.orderId}
        onSuccess={handlePayPalSuccess}
        onCancel={handlePayPalCancel}
        onError={handlePayPalError}
      />
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Order Confirmation Dialog */}
      <OrderConfirmationDialog
        open={showConfirmationDialog}
        onClose={handleConfirmationDialogClose}
        orderData={orderData}
        onContinueShopping={handleContinueShopping}
        onTrackOrder={handleTrackOrder}
      />
    </Container>
  );
};

export default Checkout;
