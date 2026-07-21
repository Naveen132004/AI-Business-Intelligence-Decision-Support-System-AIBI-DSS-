package com.aibi.supplier.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateSupplierRequest {

    @NotBlank(message = "Supplier name is required")
    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;

    @Size(max = 100, message = "Contact person must be at most 100 characters")
    private String contactPerson;

    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email must be at most 150 characters")
    private String email;

    @Size(max = 20, message = "Phone must be at most 20 characters")
    private String phone;

    private String address;
}
