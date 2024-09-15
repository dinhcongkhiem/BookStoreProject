package com.project.book_store_be.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Request.ProductRequest;
import com.project.book_store_be.Services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/product")
public class ProductController {
    private final ProductService productService;

    @GetMapping("/list")
    public ResponseEntity<Page<?>> getAllProducts(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok().body(productService.getAllProducts(pageNumber, pageSize));
    }

    @GetMapping()
    public ResponseEntity<?> getProduct(@RequestParam Long id){
        try {
            return ResponseEntity.ok(productService.findProductById(id));
        }catch (NoSuchElementException e){
            return ResponseEntity.badRequest().body("No product found with id: " + id);
        }
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

        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok().build();
        }catch (NoSuchElementException e){
            return ResponseEntity.badRequest().body("No product found with id: " + id);
        }
    }

    @PatchMapping()
    public ResponseEntity<Product> updateProduct(@RequestParam Long id, @RequestBody ProductRequest request) {
        Product updatedProduct = productService.updateProduct(id, request);
        return ResponseEntity.ok(updatedProduct);
    }
}
