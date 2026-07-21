package com.aibi.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByIsActiveTrueOrderByNameAsc();

    Optional<Product> findBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCase(String sku);

    List<Product> findByCategoryIgnoreCaseAndIsActiveTrue(String category);

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL ORDER BY p.category")
    List<String> findDistinctCategories();

    long countByIsActiveTrue();
}
