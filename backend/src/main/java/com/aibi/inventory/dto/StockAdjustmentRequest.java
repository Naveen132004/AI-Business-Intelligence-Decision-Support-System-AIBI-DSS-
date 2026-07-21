package com.aibi.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class StockAdjustmentRequest {

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}
