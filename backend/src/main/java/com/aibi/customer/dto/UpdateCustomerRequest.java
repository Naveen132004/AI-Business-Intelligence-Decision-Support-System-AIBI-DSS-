package com.aibi.customer.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateCustomerRequest {

    @NotBlank(message = "Customer name is required")
    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;

    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email must be at most 150 characters")
    private String email;

    @Size(max = 20, message = "Phone must be at most 20 characters")
    private String phone;

    private String address;
}
