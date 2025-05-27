package com.ecommerce.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderDTO {
    private Long id;
    private Date orderDate;
    private String status;
    private String paymentMethod;
    private Double total;
    private Double subtotal;
    private Double shipping;
    private Map<String, Object> shippingMethod;
    private Map<String, String> shippingInfo;
    private List<OrderItemDTO> items;
    
    
    public Double getTotal() {
        return total;
    }
    
    public void setTotal(Double total) {
        this.total = total;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OrderItemDTO {
        private Long id;
        private Long productId;
        private Integer quantity;
        private Double price;
    }
}
