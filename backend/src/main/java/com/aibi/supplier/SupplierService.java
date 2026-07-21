package com.aibi.supplier;

import com.aibi.supplier.dto.CreateSupplierRequest;
import com.aibi.supplier.dto.SupplierResponse;
import com.aibi.supplier.dto.UpdateSupplierRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = findByIdOrThrow(id);
        return toResponse(supplier);
    }

    public List<SupplierResponse> searchByName(String name) {
        return supplierRepository.findByNameContainingIgnoreCaseOrderByNameAsc(name).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SupplierResponse createSupplier(CreateSupplierRequest request) {
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && supplierRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new IllegalArgumentException("A supplier with this email already exists");
        }

        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .contactPerson(request.getContactPerson())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .build();

        supplier = supplierRepository.save(supplier);
        return toResponse(supplier);
    }

    public SupplierResponse updateSupplier(Long id, UpdateSupplierRequest request) {
        Supplier supplier = findByIdOrThrow(id);

        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());

        supplier = supplierRepository.save(supplier);
        return toResponse(supplier);
    }

    public void deleteSupplier(Long id) {
        Supplier supplier = findByIdOrThrow(id);
        supplierRepository.delete(supplier);
    }

    // ── Helpers ──────────────────────────────────────────────

    private Supplier findByIdOrThrow(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found with id: " + id));
    }

    private SupplierResponse toResponse(Supplier s) {
        return SupplierResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .contactPerson(s.getContactPerson())
                .email(s.getEmail())
                .phone(s.getPhone())
                .address(s.getAddress())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
