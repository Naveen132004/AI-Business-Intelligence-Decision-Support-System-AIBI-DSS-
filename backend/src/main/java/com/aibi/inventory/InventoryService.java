package com.aibi.inventory;

import com.aibi.inventory.dto.*;
import com.aibi.product.Product;
import com.aibi.product.ProductRepository;
import com.aibi.supplier.Supplier;
import com.aibi.supplier.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    public List<InventoryResponse> getAllInventory() {
        return inventoryRepository.findAllByOrderByUpdatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public InventoryResponse getInventoryById(Long id) {
        Inventory inventory = findByIdOrThrow(id);
        return toResponse(inventory);
    }

    public InventoryResponse getByProductId(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No inventory record found for product id: " + productId));
        return toResponse(inventory);
    }

    public List<InventoryResponse> getBySupplier(Long supplierId) {
        return inventoryRepository.findBySupplierIdOrderByProductNameAsc(supplierId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<InventoryResponse> getLowStockItems() {
        return inventoryRepository.findLowStockItems().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public long getLowStockCount() {
        return inventoryRepository.countLowStockItems();
    }

    @Transactional
    public InventoryResponse createInventory(CreateInventoryRequest request) {
        if (inventoryRepository.existsByProductId(request.getProductId())) {
            throw new IllegalArgumentException(
                    "An inventory record already exists for this product");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Product not found with id: " + request.getProductId()));

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Supplier not found with id: " + request.getSupplierId()));
        }

        Inventory inventory = Inventory.builder()
                .product(product)
                .quantityInStock(request.getQuantityInStock())
                .reorderLevel(request.getReorderLevel())
                .supplier(supplier)
                .build();

        inventory = inventoryRepository.save(inventory);
        return toResponse(inventory);
    }

    @Transactional
    public InventoryResponse updateInventory(Long id, UpdateInventoryRequest request) {
        Inventory inventory = findByIdOrThrow(id);

        if (request.getReorderLevel() != null) {
            inventory.setReorderLevel(request.getReorderLevel());
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Supplier not found with id: " + request.getSupplierId()));
            inventory.setSupplier(supplier);
        }

        inventory = inventoryRepository.save(inventory);
        return toResponse(inventory);
    }

    @Transactional
    public InventoryResponse restockInventory(Long id, int quantity) {
        Inventory inventory = findByIdOrThrow(id);
        inventory.setQuantityInStock(inventory.getQuantityInStock() + quantity);
        inventory.setLastRestockedAt(LocalDateTime.now());
        inventory = inventoryRepository.save(inventory);
        return toResponse(inventory);
    }

    @Transactional
    public InventoryResponse adjustStock(Long id, int quantity) {
        Inventory inventory = findByIdOrThrow(id);
        int newStock = inventory.getQuantityInStock() - quantity;
        if (newStock < 0) {
            throw new IllegalArgumentException(
                    "Cannot reduce stock below 0. Current stock: " + inventory.getQuantityInStock());
        }
        inventory.setQuantityInStock(newStock);
        inventory = inventoryRepository.save(inventory);
        return toResponse(inventory);
    }

    // ── Helpers ──────────────────────────────────────────────

    private Inventory findByIdOrThrow(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Inventory record not found with id: " + id));
    }

    private InventoryResponse toResponse(Inventory i) {
        return InventoryResponse.builder()
                .id(i.getId())
                .productId(i.getProduct().getId())
                .productName(i.getProduct().getName())
                .productSku(i.getProduct().getSku())
                .quantityInStock(i.getQuantityInStock())
                .reorderLevel(i.getReorderLevel())
                .supplierId(i.getSupplier() != null ? i.getSupplier().getId() : null)
                .supplierName(i.getSupplier() != null ? i.getSupplier().getName() : null)
                .lastRestockedAt(i.getLastRestockedAt())
                .updatedAt(i.getUpdatedAt())
                .lowStock(i.getQuantityInStock() <= i.getReorderLevel())
                .build();
    }
}
