package com.aibi.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SalesChartDataPoint {
    private String month;
    private BigDecimal revenue;
    private long orderCount;
}
