// Lấy chi tiết đơn hàng
const loadOrderDetails = async (orderId) => {
  try {
    // Sử dụng API endpoint mới để lấy chi tiết đơn hàng đầy đủ
    const response = await authApi().get(endpoint.GET_ORDER_FULL_DETAILS(orderId));
    console.log("Chi tiết đơn hàng đầy đủ từ API:", response.data);
    
    // Thêm log chi tiết hơn về cấu trúc dữ liệu
    if (response.data && response.data.order && response.data.order.orderDetails && response.data.order.orderDetails.length > 0) {
      console.log("Chi tiết đơn hàng (raw):", response.data.order.orderDetails[0]);
      const detail = response.data.order.orderDetails[0];
      console.log("Detail price structure:", {
        detail_price: detail.price,
        detail_product_price: detail.product?.price,
        detail_unitPrice: detail.unitPrice,
        detail_product_unitPrice: detail.product?.unitPrice,
        product_details: detail.product
      });
    }
    
    if (response.data && response.data.success && response.data.order) {
      // Xử lý và validate orderDetails
      const processedOrderDetails = (response.data.order.orderDetails || []).map(detail => {
        // Kiểm tra tất cả các trường có thể chứa giá - ưu tiên unitPrice vì đó là trường được backend trả về
        const productPrice = detail.unitPrice || 
                             detail.price || 
                             (detail.product && (detail.product.price || detail.product.unitPrice)) ||
                             detail.pricePerUnit;
        
        console.log(`Tìm giá cho sản phẩm ${detail.product?.name || 'không tên'}:`, {
          id: detail.id,
          detail_price: detail.price,
          detail_unitPrice: detail.unitPrice,
          product_price: detail.product?.price,
          product_unitPrice: detail.product?.unitPrice,
          pricePerUnit: detail.pricePerUnit,
          final_price: productPrice
        });
        
        return {
          ...detail,
          price: parseFloat(productPrice) || 0,
          quantity: parseInt(detail.quantity) || 0,
          product: detail.product || {}
        };
      });
      
      // Khởi tạo các thuộc tính mặc định nếu không tồn tại và validate tất cả trường số
      const orderData = {
        ...response.data.order,
        payment: response.data.order.payment || null,
        shippingAddress: response.data.order.shippingAddress || response.data.order.address || null,
        // Đảm bảo totalAmount là một số hợp lệ
        totalAmount: parseFloat(response.data.order.totalAmount) || 0,
        // Validate các trường số khác
        shippingFee: parseFloat(response.data.order.shippingFee) || 0,
        subtotal: parseFloat(response.data.order.subtotal) || 0,
        tax: parseFloat(response.data.order.tax) || 0,
        discount: parseFloat(response.data.order.discount) || 0,
        orderDetails: processedOrderDetails
      };
      
      console.log("Processed order details:", processedOrderDetails);
      
      // Log chi tiết giá cho từng sản phẩm để debug
      processedOrderDetails.forEach((item, index) => {
        console.log(`Sản phẩm ${index + 1}:`, {
          name: item.product?.name,
          originalPrice: item.price,
          unitPrice: item.unitPrice,
          productPrice: item.product?.price,
          productUnitPrice: item.product?.unitPrice,
          finalPrice: item.price
        });
      });
      
      setOrderDetails(orderData);
      
      // Lấy lịch sử trạng thái từ response mới
      setOrderHistory(response.data.order.history || []);
    } else {
      console.error("Dữ liệu đơn hàng không hợp lệ:", response.data);
      setError("Không thể tải chi tiết đơn hàng - dữ liệu không hợp lệ");
    }
  } catch (error) {
    console.error("Lỗi khi tải chi tiết đơn hàng:", error);
    setError("Không thể tải chi tiết đơn hàng");
    
    // Fallback: Thử sử dụng API cũ
    try {
      const fallbackResponse = await authApi().get(endpoint.GET_ORDER_BY_ID(orderId));
      console.log("Sử dụng API cũ để lấy chi tiết đơn hàng:", fallbackResponse.data);
      
      // Xử lý và validate orderDetails cho fallback
      const processedOrderDetails = (fallbackResponse.data.orderDetails || []).map(detail => ({
        ...detail,
        price: parseFloat(detail.price) || 0,
        quantity: parseInt(detail.quantity) || 0,
        product: detail.product || {}
      }));
      
      // Khởi tạo các thuộc tính mặc định nếu không tồn tại
      const orderData = {
        ...fallbackResponse.data,
        payment: fallbackResponse.data.payment || null,
        shippingAddress: fallbackResponse.data.shippingAddress || fallbackResponse.data.address || null,
        orderDetails: processedOrderDetails
      };
      
      console.log("Processed fallback order details:", processedOrderDetails);
      setOrderDetails(orderData);
      
      // Lấy lịch sử trạng thái đơn hàng
      try {
        const historyResponse = await authApi().get(endpoint.GET_ORDER_HISTORY(orderId));
        console.log("Lịch sử đơn hàng từ API:", historyResponse.data);
        setOrderHistory(historyResponse.data.history || []);
      } catch (historyError) {
        console.error("Lỗi khi tải lịch sử đơn hàng:", historyError);
        setOrderHistory([]);
      }
    } catch (fallbackError) {
      console.error("Lỗi khi tải chi tiết đơn hàng (cả fallback):", fallbackError);
      setError("Không thể tải chi tiết đơn hàng");
    }
  }
};
