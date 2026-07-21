package com.aibi.order.dto;

import com.aibi.order.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private LocalDateTime orderDate;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private String notes;
    private String createdByName;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
