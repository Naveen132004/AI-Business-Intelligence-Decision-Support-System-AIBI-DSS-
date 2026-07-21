package com.aibi.supplier;

import com.aibi.supplier.dto.CreateSupplierRequest;
import com.aibi.supplier.dto.SupplierResponse;
import com.aibi.supplier.dto.UpdateSupplierRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getSupplier(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<SupplierResponse>> searchSuppliers(@RequestParam String name) {
        return ResponseEntity.ok(supplierService.searchByName(name));
    }

    @PostMapping
    public ResponseEntity<SupplierResponse> createSupplier(@Valid @RequestBody CreateSupplierRequest request) {
        SupplierResponse supplier = supplierService.createSupplier(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(supplier);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSupplierRequest request) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(Map.of("message", "Supplier deleted successfully"));
    }
}
