package com.project.book_store_be.Controller;
import com.project.book_store_be.Services.BarcodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
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



//@PostMapping(value = "/generate-barcode", produces = MediaType.APPLICATION_PDF_VALUE)
//public ResponseEntity<byte[]> generateBarcodePdf(@RequestBody List<String> texts) {
//    try {
//        byte[] pdfFile = barcodeService.generateBarcodePdf(texts, 300, 100);
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_PDF);
//        headers.setContentDisposition(ContentDisposition.attachment().filename("barcodes.pdf").build());
//
//        return ResponseEntity.ok()
//                .headers(headers)
//                .body(pdfFile);
//    } catch (Exception e) {
//        e.printStackTrace();
//        return ResponseEntity.badRequest().build();
//    }
//}





}
