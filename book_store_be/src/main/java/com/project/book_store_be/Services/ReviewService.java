package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Model.Review;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Repository.ReviewRepository;
import com.project.book_store_be.Response.ReviewMetaDataResponse;
import com.project.book_store_be.Response.ReviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;


    public ReviewResponse addReview(Long productId, Review review) {
        Optional<Product> productOptional = productRepository.findById(productId);
        if (productOptional.isEmpty()) {
            System.out.println("Product not found with ID: " + productId);
            return null;
        }
        Product product = productOptional.get();
        review.setProduct(product);
        review.setUpdateTime(LocalDateTime.now());
        Review savedReview = reviewRepository.save(review);
        return convertToReviewResponse(savedReview);
    }


    private ReviewResponse convertToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getUser().getId())
                .fullName(review.getUser().getFullName())
                .comment(review.getComment())
                .star(review.getStar())
                .likeCount(review.getLikeCount())
                .updateTime(review.getUpdateTime())
                .build();
    }
    public List<ReviewResponse> getReviewsByProductId(Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        return reviews.stream()
                .map(this::convertToReviewResponse)
                .collect(Collectors.toList());
    }

    public ReviewMetaDataResponse getReviewMetaData(Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);

        Map<Integer, List<ReviewResponse>> reviewsByStar = reviews.stream()
                .map(this::convertToReviewResponse)
                .collect(Collectors.groupingBy(ReviewResponse::getStar));

        return ReviewMetaDataResponse.builder()
                .totalCount(reviews.size())
                .reviewsByStar(reviewsByStar)
                .build();
    }
}
