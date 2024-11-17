package com.project.book_store_be.Controller;

import com.google.zxing.NotFoundException;
import com.project.book_store_be.Services.BarcodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/barcode")
public class BarcodeController {
    @Autowired
    private BarcodeService barcodeService;

    @PostMapping("/read")
    public ResponseEntity<?> readBarcode(@RequestParam("file") MultipartFile file) {
        try {
            String barcodeText = barcodeService.readBarcode(file.getInputStream());
            return ResponseEntity.ok(barcodeText);
        } catch (IOException | NotFoundException e) {
            return ResponseEntity.badRequest().body("Không thể đọc barcode: " + e.getMessage());
        }
    }
}
