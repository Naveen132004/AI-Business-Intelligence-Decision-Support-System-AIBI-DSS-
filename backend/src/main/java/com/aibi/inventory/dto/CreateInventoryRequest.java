package com.aibi.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateInventoryRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantityInStock = 0;

    @Min(value = 0, message = "Reorder level cannot be negative")
    private Integer reorderLevel = 10;

    private Long supplierId;
}
