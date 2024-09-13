package com.project.book_store_be.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Request.ProductRequest;
import com.project.book_store_be.Services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/product")
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(@RequestParam int pageNumber, @RequestParam int pageSize) {
        return ResponseEntity.ok().body(productService.getAllProducts(pageNumber, pageSize));
    }

    @PostMapping()
    public ResponseEntity<?> addProduct(
            @RequestParam("product") String productJson,
            @RequestParam("images") List<MultipartFile> images) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            ProductRequest productRequest = objectMapper.readValue(productJson, ProductRequest.class);

            productService.addProduct(productRequest, images);
            return ResponseEntity.status(200).body("Thành công");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }

    @DeleteMapping()
    public ResponseEntity<?> deleteProduct(@RequestParam Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping()
    public ResponseEntity<Product> updateProduct(@RequestParam Long id, @RequestBody ProductRequest request) {
        Product updatedProduct = productService.updateProduct(id, request);
        return ResponseEntity.ok(updatedProduct);
    }
}
