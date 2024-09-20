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


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/review")
public class ReviewController {
    private final ReviewService reviewService;
    @PostMapping
    public ResponseEntity<ReviewDetailResponse> addReview(
            @RequestParam Long productId,
            @RequestBody ReviewRequest reviewRequest) {
        Review review = new Review();
        User user = new User();
        user.setId(reviewRequest.getCustomerId());
        review.setUser(user);
        review.setComment(reviewRequest.getComment());
        review.setStar(reviewRequest.getStar());
        review.setLikeCount(reviewRequest.getLikeCount());
        ReviewDetailResponse response = reviewService.addReview(productId, review);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewDetailResponse> updateReview(
            @PathVariable Long reviewId,
            @RequestBody ReviewRequest reviewRequest) {
        Review updatedReview = new Review();
        updatedReview.setComment(reviewRequest.getComment());
        updatedReview.setStar(reviewRequest.getStar());
        updatedReview.setLikeCount(reviewRequest.getLikeCount());
        ReviewDetailResponse response = reviewService.updateReview(reviewId, updatedReview);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ReviewDetailResponse> deleteReview(@PathVariable Long reviewId) {
        ReviewDetailResponse response = reviewService.deleteReview(reviewId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/detail/{productId}")
    public ResponseEntity<ReviewDetailResponse> getReviewDetails(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page) {
        int size = 10;
        ReviewDetailResponse response = reviewService.getReviewDetails(productId, page, size);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
