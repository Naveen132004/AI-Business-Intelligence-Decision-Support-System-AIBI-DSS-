package com.aibi.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalOrders;
    private long activeProducts;
    private BigDecimal totalRevenue;
    private long totalCustomers;
}
