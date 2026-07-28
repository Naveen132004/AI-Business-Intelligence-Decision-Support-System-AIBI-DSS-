package com.aibi.expense.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ExpenseResponse {
    private Long id;
    private String category;
    private BigDecimal amount;
    private String description;
    private LocalDate expenseDate;
    private String recordedByName;
    private LocalDateTime createdAt;
}
