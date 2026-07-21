package com.aibi.order;

import com.aibi.customer.Customer;
import com.aibi.customer.CustomerRepository;
import com.aibi.order.dto.*;
import com.aibi.product.Product;
import com.aibi.product.ProductRepository;
import com.aibi.user.User;
import com.aibi.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatusOrderByOrderDateDesc(status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long id) {
        Order order = findByIdOrThrow(id);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String creatorEmail) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + request.getCustomerId()));

        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Order order = Order.builder()
                .customer(customer)
                .createdBy(creator)
                .notes(request.getNotes())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + itemReq.getProductId()));

            if (!product.getIsActive()) {
                throw new IllegalArgumentException("Product '" + product.getName() + "' is no longer active");
            }

            BigDecimal subtotal = product.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getUnitPrice())
                    .subtotal(subtotal)
                    .build();

            order.getItems().add(item);
            totalAmount = totalAmount.add(subtotal);
        }

        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = findByIdOrThrow(id);

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot update a cancelled order");
        }
        if (order.getStatus() == OrderStatus.DELIVERED && newStatus != OrderStatus.CANCELLED) {
            throw new IllegalStateException("Delivered orders can only be cancelled");
        }

        order.setStatus(newStatus);
        order = orderRepository.save(order);
        return toResponse(order);
    }

    @Transactional
    public void cancelOrder(Long id) {
        Order order = findByIdOrThrow(id);
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order is already cancelled");
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    public List<OrderResponse> getRecentOrders() {
        return orderRepository.findTop5ByOrderByOrderDateDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Helpers ──────────────────────────────────────────────

    private Order findByIdOrThrow(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + id));
    }

    private OrderResponse toResponse(Order o) {
        List<OrderItemResponse> itemResponses = o.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .productSku(item.getProduct().getSku())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(o.getId())
                .customerId(o.getCustomer() != null ? o.getCustomer().getId() : null)
                .customerName(o.getCustomer() != null ? o.getCustomer().getName() : "N/A")
                .orderDate(o.getOrderDate())
                .status(o.getStatus())
                .totalAmount(o.getTotalAmount())
                .notes(o.getNotes())
                .createdByName(o.getCreatedBy() != null ? o.getCreatedBy().getFullName() : "System")
                .createdAt(o.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
