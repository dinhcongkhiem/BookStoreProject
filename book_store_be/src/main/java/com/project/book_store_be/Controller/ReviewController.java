package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.Review;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Request.ReviewRequest;
import com.project.book_store_be.Response.ReviewRes.ReviewDetailResponse;
import com.project.book_store_be.Services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/review")
public class ReviewController {
    private final ReviewService reviewService;
    @PostMapping
    public ResponseEntity<?> addReview(
            @RequestParam Long productId,
            @RequestBody ReviewRequest reviewRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            ReviewDetailResponse response = reviewService.addReview(productId, reviewRequest, page, size);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product or user not found.");
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }
    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable Long reviewId,
            @RequestBody ReviewRequest reviewRequest,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            ReviewDetailResponse response = reviewService.updateReview(reviewId, reviewRequest, page, size);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Review not found.");
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long reviewId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            ReviewDetailResponse response = reviewService.deleteReview(reviewId, page, size);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Review not found.");
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }


    @GetMapping("/detail/{productId}")
    public ResponseEntity<?> getReviewDetails(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            ReviewDetailResponse response = reviewService.getReviewDetails(productId, page, size);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found.");
        }
    }

}
