package com.project.book_store_be.Controller;
import com.project.book_store_be.Services.BarcodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequestMapping("/api/barcode")
public class BarcodeController {
    @Autowired
    private BarcodeService barcodeService;



    @PostMapping("/generate-barcode")
    public ResponseEntity<byte[]> generateBarcodePdf(@RequestBody List<String> texts) {
        try {
            byte[] pdfFile = barcodeService.generateBarcodePdf(texts, 300, 100);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=barcodes.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfFile);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }





}
