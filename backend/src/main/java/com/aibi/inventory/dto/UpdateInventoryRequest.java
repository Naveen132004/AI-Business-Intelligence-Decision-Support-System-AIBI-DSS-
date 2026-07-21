package com.aibi.inventory.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateInventoryRequest {

    @Min(value = 0, message = "Reorder level cannot be negative")
    private Integer reorderLevel;

    private Long supplierId;
}
