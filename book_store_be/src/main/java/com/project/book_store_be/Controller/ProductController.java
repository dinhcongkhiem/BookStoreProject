package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Services.AmazonS3Service;
import com.project.book_store_be.Services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/product")
public class ProductController {
    private final ProductService productService;
    private final AmazonS3Service s3Service;
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }
    @PostMapping()
    public Product addProduct(@RequestBody Product product) {
        return productService.addProduct(product);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Product updatedProduct = productService.updateProduct(id, productDetails);
        return ResponseEntity.ok(updatedProduct);
    }



}
