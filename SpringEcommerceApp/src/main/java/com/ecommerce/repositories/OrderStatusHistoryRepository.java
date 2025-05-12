package com.ecommerce.repositories;

import com.ecommerce.pojo.OrderStatusHistory;
import java.util.List;

public interface OrderStatusHistoryRepository {
    List<OrderStatusHistory> findByOrderId(Long orderId);
    void save(OrderStatusHistory history);
}
