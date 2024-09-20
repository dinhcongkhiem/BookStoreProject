package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.DisCount;
import com.project.book_store_be.Services.DisCountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/discounts")
public class DisCountController {
    @Autowired
    private DisCountService service;

    @GetMapping
    public List<DisCount> getAllDiscounts() {
        return service.getAllDiscounts();
    }

    @PostMapping
    public ResponseEntity<?> createDiscount(@RequestBody DisCount discount) {
        try {
            DisCount createdDiscount = service.createDiscount(discount);
            return new ResponseEntity<>(createdDiscount, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDiscount(@PathVariable Long id, @RequestBody DisCount discount) {
        try {
            DisCount updatedDiscount = service.updateDiscount(id, discount);
            if (updatedDiscount != null) {
                return new ResponseEntity<>(updatedDiscount, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiscount(@PathVariable Long id) {
        service.deleteDiscount(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


}
