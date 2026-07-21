package com.aibi.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findByNameContainingIgnoreCaseOrderByNameAsc(String name);

    boolean existsByEmailIgnoreCase(String email);
}
