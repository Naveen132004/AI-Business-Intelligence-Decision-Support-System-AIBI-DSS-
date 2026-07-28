package com.aibi.dashboard;

import com.aibi.customer.CustomerRepository;
import com.aibi.dashboard.dto.DashboardStatsResponse;
import com.aibi.dashboard.dto.SalesChartDataPoint;
import com.aibi.expense.ExpenseRepository;
import com.aibi.order.OrderRepository;
import com.aibi.order.dto.OrderResponse;
import com.aibi.order.OrderService;
import com.aibi.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderService orderService;
    private final ExpenseRepository expenseRepository;

    public DashboardStatsResponse getStats() {
        return DashboardStatsResponse.builder()
                .totalOrders(orderRepository.countActiveOrders())
                .activeProducts(productRepository.countByIsActiveTrue())
                .totalRevenue(orderRepository.getTotalRevenue())
                .totalCustomers(customerRepository.count())
                .totalExpenses(expenseRepository.sumTotalExpenses())
                .build();
    }

    public List<SalesChartDataPoint> getMonthlySalesData() {
        return orderRepository.getMonthlySalesData().stream()
                .map(row -> SalesChartDataPoint.builder()
                        .month((String) row[0])
                        .revenue((BigDecimal) row[1])
                        .orderCount(((Number) row[2]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getRecentOrders() {
        return orderService.getRecentOrders();
    }
}
