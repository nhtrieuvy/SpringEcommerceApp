// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Alert,
//   CircularProgress,
//   Button,
// } from "@mui/material";
// import { authApi, endpoint } from "../configs/Apis";

// const PayPalCheckout = ({
//   amount,
//   currency = "USD",
//   onSuccess,
//   onError,
//   onCancel,
//   disabled = false,
//   orderId, // Add orderId prop to link payment with order
// }) => {
//   const [loading, setLoading] = useState(false);
//   const [paymentError, setPaymentError] = useState(null);
//   const [paymentRecord, setPaymentRecord] = useState(null);

//   // Convert VND to USD for PayPal (approximate exchange rate)
//   const convertToUSD = (vndAmount) => {
//     const exchangeRate = 24000; // 1 USD = 24,000 VND (approximate)
//     return Math.round((vndAmount / exchangeRate) * 100) / 100; // Round to 2 decimal places
//   };

//   const usdAmount = convertToUSD(amount);

//   // Check for PayPal return parameters in URL
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const paymentId = urlParams.get("paymentId");
//     const payerId = urlParams.get("PayerID");

//     if (paymentId && payerId) {
//       // User returned from PayPal, execute the payment
//       executePaypalPayment(paymentId, payerId);

//       // Clean up URL
//       window.history.replaceState({}, document.title, window.location.pathname);
//     }
//   }, []);

//   const createPaypalPayment = async () => {
//     try {
//       setLoading(true);
//       setPaymentError(null); // Call backend to create payment record and PayPal payment

//       const paymentData = {
//         orderId: orderId,
//         paymentMethod: "PAYPAL",
//         amount: amount,
//         currency: currency,
//         successUrl: `${window.location.origin}${window.location.pathname}?paypal=success`,
//         cancelUrl: `${window.location.origin}${window.location.pathname}?paypal=cancel`,
//       };

//       console.log("Creating PayPal payment:", paymentData);

//       const paymentResponse = await authApi().post(
//         endpoint.PROCESS_PAYMENT,
//         paymentData
//       );
//       const paymentRecord = paymentResponse.data;

//       console.log("PayPal payment created:", paymentRecord);
//       setPaymentRecord(paymentRecord);

//       if (paymentRecord.redirectUrl) {
//         // Redirect to PayPal for approval
//         window.location.href = paymentRecord.redirectUrl;
//       } else {
//         throw new Error("No approval URL received from PayPal");
//       }
//     } catch (error) {
//       console.error("Error creating PayPal payment:", error);
//       setPaymentError(error);
//       if (onError) onError(error);
//       setLoading(false);
//     }
//   };

//   const executePaypalPayment = async (paymentId, payerId) => {
//     try {
//       setLoading(true);
//       setPaymentError(null);

//       console.log("Executing PayPal payment:", { paymentId, payerId });

//       const response = await authApi().post(endpoint.EXECUTE_PAYPAL_PAYMENT, {
//         paymentId: paymentId,
//         payerId: payerId,
//       });

//       const result = response.data;

//       if (result.status === "COMPLETED") {
//         console.log("PayPal payment completed:", result);

//         // Call the success handler
//         if (onSuccess) {
//           onSuccess(paymentId, {
//             paymentId: paymentId,
//             payerId: payerId,
//             status: result.status,
//             amount: result.amount,
//             currency: result.currency || currency,
//             transactionId: result.transactionId,
//             timestamp: new Date().toISOString(),
//           });
//         }
//       } else {
//         throw new Error(
//           `Payment execution failed: ${result.message || "Unknown error"}`
//         );
//       }
//     } catch (error) {
//       console.error("Error executing PayPal payment:", error);
//       setPaymentError(error);
//       if (onError) onError(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     console.log("PayPal payment cancelled");
//     setLoading(false);
//     if (onCancel) onCancel();
//   };

//   // Check for cancel parameter
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     if (urlParams.get("paypal") === "cancel") {
//       handleCancel();
//       // Clean up URL
//       window.history.replaceState({}, document.title, window.location.pathname);
//     }
//   }, []);

//   if (disabled) {
//     return (
//       <Box sx={{ mt: 2 }}>
//         <Alert severity="info">
//           <Typography variant="body2">
//             PayPal đang được xử lý. Vui lòng đợi...
//           </Typography>
//         </Alert>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ mt: 2, position: "relative" }}>
//       <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//         Tổng tiền: {amount.toLocaleString("vi-VN")}₫ (≈ ${usdAmount} USD)
//       </Typography>

//       <Button
//         variant="contained"
//         onClick={createPaypalPayment}
//         disabled={loading || disabled || !orderId}
//         sx={{
//           backgroundColor: "#0070f3",
//           color: "white",
//           "&:hover": {
//             backgroundColor: "#0051cc",
//           },
//           minHeight: 48,
//           width: "100%",
//         }}
//       >
//         {loading ? (
//           <>
//             <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
//             Đang xử lý...
//           </>
//         ) : (
//           "Thanh toán bằng PayPal"
//         )}
//       </Button>

//       {!loading && !orderId && (
//         <Alert severity="warning" sx={{ mt: 2 }}>
//           <Typography variant="body2">
//             Vui lòng tạo đơn hàng trước khi thanh toán.
//           </Typography>
//         </Alert>
//       )}

//       {!loading && orderId && (
//         <Alert severity="info" sx={{ mt: 2 }}>
//           <Typography variant="body2">
//             Nhấn vào nút trên để thanh toán an toàn qua PayPal. Bạn sẽ được
//             chuyển hướng đến PayPal để hoàn tất giao dịch.
//           </Typography>
//         </Alert>
//       )}

//       {loading && (
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             mt: 2,
//             p: 2,
//             bgcolor: "rgba(0,0,0,0.05)",
//             borderRadius: 1,
//           }}
//         >
//           <CircularProgress size={20} sx={{ mr: 1 }} />
//           <Typography variant="body2" color="text.secondary">
//             Đang xử lý thanh toán PayPal...
//           </Typography>
//         </Box>
//       )}

//       {paymentError && (
//         <Alert severity="error" sx={{ mt: 2 }}>
//           <Typography variant="body2">
//             Đã xảy ra lỗi trong quá trình thanh toán:{" "}
//             {paymentError.message || "Vui lòng thử lại"}
//           </Typography>
//         </Alert>
//       )}
//     </Box>
//   );
// };

// export default PayPalCheckout;
