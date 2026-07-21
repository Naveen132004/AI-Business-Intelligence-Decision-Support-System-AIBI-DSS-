package com.aibi.dashboard;

import com.aibi.dashboard.dto.DashboardStatsResponse;
import com.aibi.dashboard.dto.SalesChartDataPoint;
import com.aibi.order.dto.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/sales-chart")
    public ResponseEntity<List<SalesChartDataPoint>> getSalesChart() {
        return ResponseEntity.ok(dashboardService.getMonthlySalesData());
    }

    @GetMapping("/recent-orders")
    public ResponseEntity<List<OrderResponse>> getRecentOrders() {
        return ResponseEntity.ok(dashboardService.getRecentOrders());
    }
}
