import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { authApi, endpoint } from "../configs/Apis";

const PayPalModal = ({
  open,
  onClose,
  amount,
  currency = "USD",
  onSuccess,
  onError,
  onCancel,
  orderId,
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalRef = useRef();
  const paypalButtonsRef = useRef();

  // Convert VND to USD for PayPal
  const convertToUSD = (vndAmount) => {
    const exchangeRate = 24000; // 1 USD = 24,000 VND (approximate)
    return Math.round((vndAmount / exchangeRate) * 100) / 100;
  };

  const usdAmount = convertToUSD(amount);

  const loadPayPalSDK = useCallback(() => {
    // Check if PayPal SDK is already loaded
    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${`AU9JPC-5jvlkaN9wXRX3M0rrkqNPR7oJtpXkEbw1A2kaRmYwkGwMry4BJ3mLcPj40H-p3Kq09_qV-ZT8`}&currency=${currency}`;
    script.async = true;
    
    script.onload = () => {
      setPaypalLoaded(true);
    };
    
    script.onerror = () => {
      setPaymentError("Không thể tải PayPal SDK");
    };

    document.body.appendChild(script);
  }, [currency]);

  const initializePayPalButtons = useCallback(() => {
    if (!window.paypal || !paypalRef.current) return;

    // Clear any existing buttons
    paypalRef.current.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      },
        createOrder: async (data, actions) => {
        try {
          setLoading(true);
          
          // Create PayPal order directly using PayPal SDK
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: currency,
                value: usdAmount.toFixed(2)
              },
              description: `Payment for Order #${orderId}`,
              custom_id: orderId.toString(), // Store our order ID in custom_id
            }]
          });
        } catch (error) {
          console.error("Error creating PayPal order:", error);
          setPaymentError(error.message || "Không thể tạo đơn thanh toán PayPal");
          return null;
        } finally {
          setLoading(false);
        }
      },      onApprove: async (data, actions) => {
        try {
          setLoading(true);
          
          // Capture the payment using PayPal SDK
          const captureResult = await actions.order.capture();
          
          // Check if payment was successful
          if (captureResult.status === 'COMPLETED') {            // Notify our backend about the successful payment
            try {
              await authApi().put(endpoint.PAYPAL_PAYMENT_COMPLETED(orderId), {
                paypalOrderId: data.orderID,
                paypalPayerId: data.payerID,
                captureId: captureResult.purchase_units[0]?.payments?.captures[0]?.id,
                amount: usdAmount,
                currency: currency
              });
            } catch (backendError) {
              console.warn("Failed to update backend, but PayPal payment was successful:", backendError);
              // Continue with success flow since PayPal payment actually succeeded
            }
            
            // Payment successful
            onSuccess && onSuccess(data.orderID, { 
              payerId: data.payerID,
              captureId: captureResult.purchase_units[0]?.payments?.captures[0]?.id
            });
            onClose();
          } else {
            throw new Error(`Payment status: ${captureResult.status}`);
          }
        } catch (error) {
          console.error("PayPal payment error:", error);
          setPaymentError(error.message || "Thanh toán thất bại");
          onError && onError(error);
        } finally {
          setLoading(false);
        }
      },

      onCancel: (data) => {
        console.log("PayPal payment cancelled:", data);
        onCancel && onCancel();
        onClose();
      },

      onError: (err) => {
        console.error("PayPal error:", err);
        setPaymentError("Đã xảy ra lỗi với PayPal");
        onError && onError(err);
      }
    }).render(paypalRef.current).then(() => {
      paypalButtonsRef.current = true;
    }).catch((error) => {
      console.error("Error rendering PayPal buttons:", error);
      setPaymentError("Không thể hiển thị nút PayPal");
    });
  }, [currency, orderId, onCancel, onClose, onError, onSuccess, usdAmount]);

  // Load PayPal SDK
  useEffect(() => {
    if (open && !paypalLoaded) {
      loadPayPalSDK();
    }
  }, [open, paypalLoaded, loadPayPalSDK]);

  // Initialize PayPal buttons when modal opens and SDK is loaded
  useEffect(() => {
    if (open && paypalLoaded && paypalRef.current && !paypalButtonsRef.current) {
      initializePayPalButtons();
    }
  }, [open, paypalLoaded, initializePayPalButtons]);

  // Clean up when modal closes
  useEffect(() => {
    if (!open && paypalButtonsRef.current) {
      paypalButtonsRef.current = null;
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }
    }
  }, [open]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Thanh toán PayPal</Typography>
          <IconButton 
            onClick={handleClose} 
            disabled={loading}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" gutterBottom>
            Số tiền thanh toán: <strong>${usdAmount} USD</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            (≈ {amount?.toLocaleString('vi-VN')} VND)
          </Typography>

          {paymentError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {paymentError}
            </Alert>
          )}

          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 3 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Đang xử lý thanh toán...
              </Typography>
            </Box>

          )}

          {!paypalLoaded && !paymentError && (
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 3 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Đang tải PayPal...
              </Typography>
            </Box>
          )}

          <Box 
            ref={paypalRef}
            sx={{ 
              mt: 2,
              minHeight: paypalLoaded ? 120 : 60,
              display: paypalLoaded && !loading ? 'block' : 'none'
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          variant="outlined"
        >
          Hủy
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PayPalModal;
