package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Model.Review;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Repository.ReviewRepository;
import com.project.book_store_be.Request.ReviewRequest;
import com.project.book_store_be.Response.ReviewRes.ReviewDetailResponse;
import com.project.book_store_be.Response.ReviewRes.ReviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private void validateStarValue(int star) {
        if (star < 1 || star > 5) {
            throw new IllegalArgumentException("Star value must be between 1 and 5.");
        }
    }

    public Float calculateReviewAverage(Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        if (reviews.isEmpty()) {
            return 0.0F;
        }
        double totalStars = reviews.stream().mapToInt(Review::getStar).sum();
        double average = totalStars / reviews.size();
        if (average < 0.5) {
            return 0.0F;
        } else if (average % 1 < 0.5) {
            return (float) (Math.floor(average) + 0.5F);
        } else {
            return (float) Math.ceil(average);
        }
    }

    public int getReviewCount(Long productId) {
        return reviewRepository.countByProductId(productId);
    }

    public ReviewDetailResponse addReview(Long productId, ReviewRequest reviewRequest, int page, int size) {
        validateStarValue(reviewRequest.getStar());
        Product product = productRepository.findById(productId).orElseThrow(() -> new NoSuchElementException("No product found with id: " + productId));
        User currentUser = userService.getCurrentUser();
        Review review = new Review();
        review.setProduct(product);
        review.setUser(currentUser);
        review.setComment(reviewRequest.getComment());
        review.setStar(reviewRequest.getStar());
        review.setLikeCount(reviewRequest.getLikeCount());
        review.setUpdateTime(new Date());
        reviewRepository.save(review);
        return getReviewDetails(productId, page, size);
    }


    public ReviewDetailResponse updateCommentAndStar(Long reviewId, ReviewRequest reviewRequest, int page, int size) {
        validateStarValue(reviewRequest.getStar());
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new NoSuchElementException("No review found with id: " + reviewId));
        review.setComment(reviewRequest.getComment());
        review.setStar(reviewRequest.getStar());
        reviewRepository.save(review);
        return getReviewDetails(review.getProduct().getId(), page, size);
    }

    public ReviewDetailResponse updateLikeCount(Long reviewId, ReviewRequest reviewRequest, int page, int size) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new NoSuchElementException("No review found with id: " + reviewId));
        review.setLikeCount(reviewRequest.getLikeCount());
        reviewRepository.save(review);
        return getReviewDetails(review.getProduct().getId(), page, size);
    }


    public ReviewDetailResponse deleteReview(Long reviewId, int page, int size) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new NoSuchElementException("No review found with id: " + reviewId));
        Long productId = review.getProduct().getId();
        reviewRepository.deleteById(reviewId);
        return getReviewDetails(productId, page, size);
    }

    public ReviewDetailResponse getReviewDetails(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("updateTime").descending());
        List<Review> allReviews = reviewRepository.findByProductId(productId);
        Page<Review> reviewPage = new PageImpl<>(allReviews, pageable, allReviews.size());

        Map<Integer, Long> starCounts = allReviews.stream().collect(Collectors.groupingBy(Review::getStar, Collectors.counting()));
        int countStar1 = starCounts.getOrDefault(1, 0L).intValue();
        int countStar2 = starCounts.getOrDefault(2, 0L).intValue();
        int countStar3 = starCounts.getOrDefault(3, 0L).intValue();
        int countStar4 = starCounts.getOrDefault(4, 0L).intValue();
        int countStar5 = starCounts.getOrDefault(5, 0L).intValue();

        ReviewDetailResponse.MetaData metaData = ReviewDetailResponse.MetaData.builder().totalCount(allReviews.size()).countStar1(countStar1).countStar2(countStar2).countStar3(countStar3).countStar4(countStar4).countStar5(countStar5).build();

        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream().map(this::convertToReviewResponse).collect(Collectors.toList());

        return ReviewDetailResponse.builder().data(reviewResponses).metaData(metaData).build();
    }

    private ReviewResponse convertToReviewResponse(Review review) {
        return ReviewResponse.builder().id(review.getId()).userName(review.getUser().getFullName()).customerId(review.getUser().getId()).comment(review.getComment()).star(review.getStar()).likeCount(review.getLikeCount()).updateTime(review.getUpdateTime()).build();
    }
}
