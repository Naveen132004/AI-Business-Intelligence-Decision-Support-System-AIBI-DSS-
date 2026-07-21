package com.aibi.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    List<Inventory> findBySupplierIdOrderByProductNameAsc(Long supplierId);

    @Query("SELECT i FROM Inventory i WHERE i.quantityInStock <= i.reorderLevel ORDER BY i.quantityInStock ASC")
    List<Inventory> findLowStockItems();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantityInStock <= i.reorderLevel")
    long countLowStockItems();

    List<Inventory> findAllByOrderByUpdatedAtDesc();

    boolean existsByProductId(Long productId);
}
