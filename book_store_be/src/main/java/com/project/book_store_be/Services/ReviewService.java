package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Model.Review;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Repository.ReviewRepository;
import com.project.book_store_be.Repository.UserRepository;
import com.project.book_store_be.Response.ReviewRes.ReviewDetailResponse;
import com.project.book_store_be.Response.ReviewRes.ReviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private  final UserRepository userRepository;

    public ReviewDetailResponse addReview(Long productId, Review review) {
        Optional<Product> productOptional = productRepository.findById(productId);
        if (productOptional.isEmpty()) {
            System.out.println("Product not found with ID: " + productId);
            return null;
        }
        Product product = productOptional.get();
        review.setProduct(product);
        Optional<User> userOptional = userRepository.findById(review.getUser().getId());
        if (userOptional.isEmpty()) {
            System.out.println("User not found with ID: " + review.getUser().getId());
            return null;
        }
        User user = userOptional.get();
        review.setUser(user);
        review.setUpdateTime(new Date());
        reviewRepository.save(review);
        return getReviewDetails(productId, 0, 10);
    }

    public ReviewDetailResponse updateReview(Long reviewId, Review updatedReview) {
        Optional<Review> reviewOptional = reviewRepository.findById(reviewId);
        if (reviewOptional.isEmpty()) {
            System.out.println("Review not found with ID: " + reviewId);
            return null;
        }
        Review review = reviewOptional.get();
        review.setComment(updatedReview.getComment());
        review.setStar(updatedReview.getStar());
        review.setLikeCount(updatedReview.getLikeCount());
        review.setUpdateTime(new Date());
        reviewRepository.save(review);
        return getReviewDetails(review.getProduct().getId(), 0, 10);
    }

    public ReviewDetailResponse deleteReview(Long reviewId) {
        Optional<Review> reviewOptional = reviewRepository.findById(reviewId);
        if (reviewOptional.isEmpty()) {
            System.out.println("Review not found with ID: " + reviewId);
            return null;
        }
        Review review = reviewOptional.get();
        Long productId = review.getProduct().getId();
        reviewRepository.deleteById(reviewId);
        return getReviewDetails(productId,0 , 10);
    }

    public ReviewDetailResponse getReviewDetails(Long productId, int page, int size) {
        int pageSize = Math.max(size, 1); // Đảm bảo pageSize không nhỏ hơn 1
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("updateTime").descending());

        Page<Review> reviewPage = reviewRepository.findByProductId(productId, pageable);

        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(this::convertToReviewResponse)
                .collect(Collectors.toList());

        Map<Integer, Long> starCounts = reviewPage.getContent().stream()
                .collect(Collectors.groupingBy(Review::getStar, Collectors.counting()));
        int countStar1 = starCounts.getOrDefault(1, 0L).intValue();
        int countStar2 = starCounts.getOrDefault(2, 0L).intValue();
        int countStar3 = starCounts.getOrDefault(3, 0L).intValue();
        int countStar4 = starCounts.getOrDefault(4, 0L).intValue();
        int countStar5 = starCounts.getOrDefault(5, 0L).intValue();

        ReviewDetailResponse.MetaData metaData = ReviewDetailResponse.MetaData.builder()
                .totalCount((int) reviewPage.getTotalElements())
                .countStar1(countStar1)
                .countStar2(countStar2)
                .countStar3(countStar3)
                .countStar4(countStar4)
                .countStar5(countStar5)
                .build();

        return ReviewDetailResponse.builder()
                .data(reviewResponses)
                .metaData(metaData)
                .build();
    }

    private ReviewResponse convertToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userName(review.getUser().getFullName())
                .customerId(review.getUser().getId())
                .comment(review.getComment())
                .star(review.getStar())
                .likeCount(review.getLikeCount())
                .updateTime(review.getUpdateTime())
                .build();
    }
}
