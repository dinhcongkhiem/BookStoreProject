package com.project.book_store_be.Controller;

import com.project.book_store_be.DTO.DisCountRequest;
import com.project.book_store_be.Model.DisCount;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Services.DisCountService;
import com.project.book_store_be.Services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/discount")
public class DisCountController {
    @Autowired
    private DisCountService service;

    @Autowired
    private ProductService productService;

    @GetMapping
    public List<DisCount> getAllDiscounts() {
        return service.getAllDiscounts();
    }
    @GetMapping("/discountpage")
    public Page<DisCount> getDiscounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return service.getDiscounts(page, size);
    }

    @PostMapping
    public ResponseEntity<?> createDiscount(@RequestBody DisCountRequest disCountRequest) {
        try {
            List<Product> products = productService.findAllByIds(disCountRequest.getProductIds());

            DisCount disCount = new DisCount();
            disCount.setDiscountRate(disCountRequest.getDiscountRate());
            disCount.setStartDate(disCountRequest.getStartDate());
            disCount.setEndDate(disCountRequest.getEndDate());
            disCount.setProducts(products);

            DisCount createDisCount = service.createDiscount(disCount);
            return new ResponseEntity<>(createDisCount,HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            System.out.println(e);
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDiscount(@PathVariable Long id, @RequestBody DisCountRequest disCountRequest) {
        try {
            Optional<DisCount> optionalDiscount = service.findById(id);

            if (!optionalDiscount.isPresent()) {
                return new ResponseEntity<>("Discount not found", HttpStatus.NOT_FOUND);
            }

            DisCount existingDiscount = optionalDiscount.get();

            List<Product> products = productService.findAllByIds(disCountRequest.getProductIds());
            existingDiscount.setDiscountRate(disCountRequest.getDiscountRate());
            existingDiscount.setStartDate(disCountRequest.getStartDate());
            existingDiscount.setEndDate(disCountRequest.getEndDate());
            existingDiscount.setProducts(products);
            DisCount updatedDiscount = service.updateDiscount(existingDiscount);
            return new ResponseEntity<>(updatedDiscount, HttpStatus.OK);

        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while updating the discount", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDisCount(@PathVariable Long id){
        try {
            service.delete(id);
            return ResponseEntity.ok("Discount delete successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Discount not found");
        }
    }

}
