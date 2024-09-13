package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.ImageProduct;
import com.project.book_store_be.Services.ImageProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/files")
public class ImageController {
    @Autowired
    private ImageProductService service;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file,
                                             @RequestParam("fileName") String fileName,
                                             @RequestParam("productId") Long productId) {
        try {
            String fileUrl = service.uploadFile(file, productId);
            return ResponseEntity.ok(fileUrl);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid input: " + e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(500).body("File upload failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteImageProduct(@PathVariable Long id) {
        try {
            service.deleteImageProduct(id);
            return ResponseEntity.ok("ImageProduct with id" + id + "has been deleted.");

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping("/product/{productId}")
    public List<ImageProduct> listProductId(@PathVariable Long productId) {
        return service.listImageProductId(productId);
    }

    @GetMapping("/imageproduct/{productId}")
    public Optional<ImageProduct> getImageProduct(@PathVariable Long productId) {
        return service.getImageProductId(productId);
    }
}

