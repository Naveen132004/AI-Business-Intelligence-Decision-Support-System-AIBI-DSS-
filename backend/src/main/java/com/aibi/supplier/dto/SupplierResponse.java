package com.aibi.supplier.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SupplierResponse {
    private Long id;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private LocalDateTime createdAt;
}
