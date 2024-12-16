package com.project.book_store_be.Controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.book_store_be.Exception.ProductCodeAlreadyExistsException;
import com.project.book_store_be.Exception.ProductNameAlreadyExistsException;
import com.project.book_store_be.Request.ProductRequest;
import com.project.book_store_be.Services.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/product")
public class ProductController {
    private final ProductService productService;
    @GetMapping("/available")
    public ResponseEntity<Page<?>> getAvailableProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) List<BigDecimal> price,
            @RequestParam(required = false) List<Long> publisher,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok().body(productService.getProductsAvailable(page, pageSize, category,
                price, publisher, sort, keyword));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getALlProduct(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status
    ) {
        return ResponseEntity.ok().body(productService.getAllProducts(page, pageSize, sort, keyword,status));
    }

    @GetMapping()
    public ResponseEntity<?> getProduct(@RequestParam Long id) {
        try {
            return ResponseEntity.ok(productService.findProductDetailById(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.badRequest().body("No product found with id: " + id);
        }
    }

    @PostMapping()
    public ResponseEntity<?> addProduct(
            @RequestParam("product") String productJson,
            @RequestParam("images") List<MultipartFile> images,
            @RequestParam("i_thumbnail") Integer indexThumbnail) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            ProductRequest productRequest = objectMapper.readValue(productJson, ProductRequest.class);
            if (productRequest == null || images.isEmpty()) {
                return ResponseEntity.badRequest().body("Dữ liệu không hợp lệ");
            }
            productService.addProduct(productRequest, images, indexThumbnail);
            return ResponseEntity.status(HttpStatus.CREATED).body("Thành công");
        }catch (ProductNameAlreadyExistsException | ProductCodeAlreadyExistsException e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Dữ liệu JSON không hợp lệ");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Có lỗi xảy ra");
        }
    }

    @DeleteMapping()
    public ResponseEntity<?> deleteProduct(@RequestParam Long id) {

        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.badRequest().body("No product found with id: " + id);
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("product") String productJson,
            @RequestParam("images") List<MultipartFile> images,
            @RequestParam("i_thumbnail") Integer indexThumbnail,
            @RequestParam("listOldImg") List<Long> listOldImg) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            ProductRequest productRequest = objectMapper.readValue(productJson, ProductRequest.class);
            if (productRequest == null || images.isEmpty()) {
                return ResponseEntity.badRequest().body("Dữ liệu không hợp lệ");
            }
            productService.updateProduct(id, productRequest, images, indexThumbnail, listOldImg);
            return ResponseEntity.status(HttpStatus.CREATED).body("Thành công");

        }catch (ProductNameAlreadyExistsException e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Dữ liệu JSON không hợp lệ");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Có lỗi xảy ra");
        }
    }


    @GetMapping("/price-range")
    public ResponseEntity<Map<String, BigDecimal>> getPriceRange() {
        return ResponseEntity.ok(productService.getPriceRange());
    }

    @GetMapping("/attributes")
    public ResponseEntity<?> getAtributes() {
        return ResponseEntity.ok(productService.getAttributes());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping(value = "/generate-barcode", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> generateBarcodePdf(@RequestParam List<Long> productIds, @RequestParam Boolean isAllProduct) {
        try {
            byte[] pdfFile = productService.getBarcodes(productIds, isAllProduct);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment().filename("barcodes.pdf").build());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfFile);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

}
