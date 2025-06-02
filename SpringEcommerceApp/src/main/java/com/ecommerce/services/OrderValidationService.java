package com.ecommerce.services;

import com.ecommerce.dtos.OrderCreateDTO;
import com.ecommerce.pojo.Order;

/**
 * Service interface for order validation business logic
 */
public interface OrderValidationService {
    
    
    void validateOrderCreation(OrderCreateDTO orderDTO);
    
   
    void validateOrderUpdate(Order existingOrder, Order updatedOrder);
    
    
    void validateStockAvailability(Long productId, int requestedQuantity);
}
