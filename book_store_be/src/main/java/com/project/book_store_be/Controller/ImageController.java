package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.ImageProduct;
import com.project.book_store_be.Services.ImageProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/image")
public class ImageController {
    private final ImageProductService service;

    @PostMapping
    public ResponseEntity<String> uploadFile(@RequestParam MultipartFile file) {
        try {
            String fileUrl = service.uploadImage(file);
            return ResponseEntity.ok(fileUrl.trim());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid input: " + e.getMessage());
        }
    }
}

