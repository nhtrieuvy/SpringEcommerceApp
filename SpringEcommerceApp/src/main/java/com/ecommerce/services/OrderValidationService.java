package com.ecommerce.services;

import com.ecommerce.dtos.OrderCreateDTO;
import com.ecommerce.pojo.Order;

/**
 * Service interface for order validation business logic
 */
public interface OrderValidationService {
    
    /**
     * Validates order creation data
     * @param orderDTO Order creation data to validate
     * @throws OrderException if validation fails
     */
    void validateOrderCreation(OrderCreateDTO orderDTO);
    
    /**
     * Validates order update operation
     * @param existingOrder Current order state
     * @param updatedOrder Updated order data
     * @throws OrderException if validation fails
     */
    void validateOrderUpdate(Order existingOrder, Order updatedOrder);
    
    /**
     * Validates product stock availability
     * @param productId Product to check
     * @param requestedQuantity Requested quantity
     * @throws ProductException if stock is insufficient
     */
    void validateStockAvailability(Long productId, int requestedQuantity);
}
