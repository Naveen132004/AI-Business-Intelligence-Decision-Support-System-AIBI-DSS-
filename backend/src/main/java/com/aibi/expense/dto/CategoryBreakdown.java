package com.aibi.expense.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CategoryBreakdown {
    private String category;
    private BigDecimal total;
    private long count;
}
