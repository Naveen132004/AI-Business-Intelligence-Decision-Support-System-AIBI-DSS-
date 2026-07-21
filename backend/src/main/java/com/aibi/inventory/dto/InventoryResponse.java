package com.aibi.inventory.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InventoryResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer quantityInStock;
    private Integer reorderLevel;
    private Long supplierId;
    private String supplierName;
    private LocalDateTime lastRestockedAt;
    private LocalDateTime updatedAt;
    private boolean lowStock;
}
