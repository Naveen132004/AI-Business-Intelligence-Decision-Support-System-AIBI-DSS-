package com.aibi.inventory;

import com.aibi.inventory.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAllInventory(
            @RequestParam(required = false) Long supplierId) {
        if (supplierId != null) {
            return ResponseEntity.ok(inventoryService.getBySupplier(supplierId));
        }
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryResponse> getInventory(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<InventoryResponse> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getByProductId(productId));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStock() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @GetMapping("/low-stock/count")
    public ResponseEntity<Map<String, Long>> getLowStockCount() {
        return ResponseEntity.ok(Map.of("count", inventoryService.getLowStockCount()));
    }

    @PostMapping
    public ResponseEntity<InventoryResponse> createInventory(
            @Valid @RequestBody CreateInventoryRequest request) {
        InventoryResponse inventory = inventoryService.createInventory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(inventory);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryResponse> updateInventory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateInventoryRequest request) {
        return ResponseEntity.ok(inventoryService.updateInventory(id, request));
    }

    @PutMapping("/{id}/restock")
    public ResponseEntity<InventoryResponse> restockInventory(
            @PathVariable Long id,
            @Valid @RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.ok(inventoryService.restockInventory(id, request.getQuantity()));
    }

    @PutMapping("/{id}/adjust")
    public ResponseEntity<InventoryResponse> adjustStock(
            @PathVariable Long id,
            @Valid @RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.ok(inventoryService.adjustStock(id, request.getQuantity()));
    }
}
