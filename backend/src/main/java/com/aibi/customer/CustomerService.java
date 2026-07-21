package com.aibi.customer;

import com.aibi.customer.dto.CreateCustomerRequest;
import com.aibi.customer.dto.CustomerResponse;
import com.aibi.customer.dto.UpdateCustomerRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CustomerResponse getCustomerById(Long id) {
        Customer customer = findByIdOrThrow(id);
        return toResponse(customer);
    }

    public List<CustomerResponse> searchByName(String name) {
        return customerRepository.findByNameContainingIgnoreCaseOrderByNameAsc(name).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && customerRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new IllegalArgumentException("A customer with this email already exists");
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .build();

        customer = customerRepository.save(customer);
        return toResponse(customer);
    }

    public CustomerResponse updateCustomer(Long id, UpdateCustomerRequest request) {
        Customer customer = findByIdOrThrow(id);

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());

        customer = customerRepository.save(customer);
        return toResponse(customer);
    }

    public void deleteCustomer(Long id) {
        Customer customer = findByIdOrThrow(id);
        customerRepository.delete(customer);
    }

    // ── Helpers ──────────────────────────────────────────────

    private Customer findByIdOrThrow(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + id));
    }

    private CustomerResponse toResponse(Customer c) {
        return CustomerResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .address(c.getAddress())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
