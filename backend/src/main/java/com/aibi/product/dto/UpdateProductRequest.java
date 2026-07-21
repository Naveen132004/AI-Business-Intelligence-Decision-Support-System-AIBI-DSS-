package com.aibi.product.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 150, message = "Name must be at most 150 characters")
    private String name;

    @Size(max = 100, message = "Category must be at most 100 characters")
    private String category;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.01", message = "Unit price must be positive")
    private BigDecimal unitPrice;

    @DecimalMin(value = "0.00", message = "Cost price cannot be negative")
    private BigDecimal costPrice;

    private String description;
}
