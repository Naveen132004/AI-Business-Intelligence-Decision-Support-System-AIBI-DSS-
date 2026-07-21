package com.aibi.product;

import com.aibi.product.dto.CreateProductRequest;
import com.aibi.product.dto.ProductResponse;
import com.aibi.product.dto.UpdateProductRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductResponse> getActiveProducts() {
        return productRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(Long id) {
        Product product = findByIdOrThrow(id);
        return toResponse(product);
    }

    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsBySkuIgnoreCase(request.getSku())) {
            throw new IllegalArgumentException("A product with SKU '" + request.getSku() + "' already exists");
        }

        Product product = Product.builder()
                .name(request.getName())
                .sku(request.getSku().toUpperCase())
                .category(request.getCategory())
                .unitPrice(request.getUnitPrice())
                .costPrice(request.getCostPrice())
                .description(request.getDescription())
                .build();

        product = productRepository.save(product);
        return toResponse(product);
    }

    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = findByIdOrThrow(id);

        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setUnitPrice(request.getUnitPrice());
        product.setCostPrice(request.getCostPrice());
        product.setDescription(request.getDescription());

        product = productRepository.save(product);
        return toResponse(product);
    }

    public void deactivateProduct(Long id) {
        Product product = findByIdOrThrow(id);
        product.setIsActive(false);
        productRepository.save(product);
    }

    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }

    // ── Helpers ──────────────────────────────────────────────

    private Product findByIdOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
    }

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .sku(p.getSku())
                .category(p.getCategory())
                .unitPrice(p.getUnitPrice())
                .costPrice(p.getCostPrice())
                .description(p.getDescription())
                .isActive(p.getIsActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
