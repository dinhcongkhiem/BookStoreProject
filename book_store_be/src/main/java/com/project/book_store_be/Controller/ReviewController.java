package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.Review;
import com.project.book_store_be.Response.ReviewMetaDataResponse;
import com.project.book_store_be.Response.ReviewResponse;
import com.project.book_store_be.Services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/review")
public class ReviewController {
    private final ReviewService reviewService;
    @PostMapping("/{productId}")
    public ResponseEntity<ReviewResponse> addReview(@PathVariable Long productId, @RequestBody Review review) {
        ReviewResponse reviewResponse = reviewService.addReview(productId, review);
        return new ResponseEntity<>(reviewResponse, HttpStatus.CREATED);
    }
    @GetMapping("/{productId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByProductId(@PathVariable Long productId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByProductId(productId);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }
    @GetMapping("/meta/{productId}")
    public ResponseEntity<ReviewMetaDataResponse> getReviewMetaData(@PathVariable Long productId) {
        ReviewMetaDataResponse metaData = reviewService.getReviewMetaData(productId);
        return new ResponseEntity<>(metaData, HttpStatus.OK);
    }
}
