package com.aibi.order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findAllByOrderByOrderDateDesc();

    List<Order> findByStatusOrderByOrderDateDesc(OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status <> 'CANCELLED'")
    long countActiveOrders();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status <> 'CANCELLED'")
    java.math.BigDecimal getTotalRevenue();

    @Query(value = """
        SELECT TO_CHAR(o.order_date, 'YYYY-MM') AS month,
               COALESCE(SUM(o.total_amount), 0) AS revenue,
               COUNT(o.id) AS order_count
        FROM orders o
        WHERE o.status <> 'CANCELLED'
          AND o.order_date >= NOW() - INTERVAL '12 months'
        GROUP BY TO_CHAR(o.order_date, 'YYYY-MM')
        ORDER BY month
        """, nativeQuery = true)
    List<Object[]> getMonthlySalesData();

    List<Order> findTop5ByOrderByOrderDateDesc();
}
