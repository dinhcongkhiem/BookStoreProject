package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.Discount;
import com.project.book_store_be.Request.DisCountRequest;
import com.project.book_store_be.Services.DisCountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/discount")
public class DisCountController {
    @Autowired
    private DisCountService service;

    @GetMapping
    public ResponseEntity<?> getDiscounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "all") String orderBy,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false) Integer status) {
        return ResponseEntity.ok().body(service.getDiscounts(page, size, orderBy, keyword, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDiscounts(@PathVariable Long id) {
        try {
            return ResponseEntity.ok().body(service.getDiscountById(id));

        }catch (NoSuchElementException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createDiscount(@RequestBody DisCountRequest disCountRequest) {
        try {
            service.createDiscount(disCountRequest);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDiscount(@PathVariable Long id, @RequestBody DisCountRequest disCountRequest) {
        try {
            Discount updatedDiscount = service.updateDiscount(id, disCountRequest);
            return new ResponseEntity<>(updatedDiscount, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDiscount(@PathVariable Long id) {
        try {
            service.delete(id);
            return new ResponseEntity<>("Discount deleted successfully", HttpStatus.OK);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>("Discount not found", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while deleting the discount", HttpStatus.INTERNAL_SERVER_ERROR);  // Lỗi không mong muốn
        }
    }

}
