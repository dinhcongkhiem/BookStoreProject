package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.NotificationType;
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

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    private void validateStarValue(Float star) {
        if (star < 1 || star > 5) {
            throw new IllegalArgumentException("Star value must be between 1 and 5.");
        }
    }

    public Float calculateReviewAverage(Long productId) {
        List<Review> reviews = reviewRepository.findByProductId(productId);
        if (reviews.isEmpty()) {
            return 0.0F;
        }
        double totalStars = reviews.stream().mapToDouble(Review::getStar).sum();
        double average = totalStars / reviews.size();
        return (float) (Math.round(average * 2) / 2.0);
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
        review.setUsersWhoLiked(new ArrayList<>());
        review.setUpdateTime(LocalDateTime.now());
        reviewRepository.save(review);
        return getReviews(productId, page, size);
    }


    public ReviewDetailResponse updateCommentAndStar(Long reviewId, ReviewRequest reviewRequest, int page, int size) {
        validateStarValue(reviewRequest.getStar());
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new NoSuchElementException("No review found with id: " + reviewId));
        review.setComment(reviewRequest.getComment());
        review.setStar(reviewRequest.getStar());
        reviewRepository.save(review);
        return getReviews(review.getProduct().getId(), page, size);
    }

    public void likeReview(Long reviewId) {
        User currentUser = userService.getCurrentUser();
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new NoSuchElementException("No review found with id: " + reviewId));
        List<Long> userIds = review.getUsersWhoLiked().stream().map(User::getId).toList();
        if(userIds.contains(currentUser.getId())) {
            review.getUsersWhoLiked().removeIf(user -> user.getId().equals(currentUser.getId()));
        } else {
            review.getUsersWhoLiked().add(currentUser);
            if(!Objects.equals(currentUser.getId(), review.getUser().getId())) {
                this.notificationService.sendNotification(review.getUser(), "Đánh giá sản phẩm",  currentUser.getFullName() +" đã vừa thích bình luận của bạn của bạn", NotificationType.REVIEW, "/product/detail?id=" + review.getProduct().getId());
            }
        }
        reviewRepository.save(review);
    }


    public ReviewDetailResponse deleteReview(Long reviewId, int page, int size) {
        Review review = reviewRepository.findById(reviewId).orElseThrow(() -> new NoSuchElementException("No review found with id: " + reviewId));
        Long productId = review.getProduct().getId();
        reviewRepository.deleteById(reviewId);
        return getReviews(productId, page, size);
    }

    public ReviewDetailResponse getReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("updateTime").descending());
        Page<Review> reviewPage = reviewRepository.findByProductId(productId, pageable);
        List<Review> allReviews = reviewRepository.findByProductId(productId);

        Map<Integer, Long> starCounts = allReviews.stream()
                .collect(Collectors.groupingBy(review -> (int) Math.ceil(review.getStar()), Collectors.counting()));
        int countStar1 = starCounts.getOrDefault(1, 0L).intValue();
        int countStar2 = starCounts.getOrDefault(2, 0L).intValue();
        int countStar3 = starCounts.getOrDefault(3, 0L).intValue();
        int countStar4 = starCounts.getOrDefault(4, 0L).intValue();
        int countStar5 = starCounts.getOrDefault(5, 0L).intValue();
        double averageRate = 0;
        if (!allReviews.isEmpty()) {
            double totalStars = allReviews.stream().mapToDouble(Review::getStar).sum();
            double average = totalStars / allReviews.size();
            averageRate =  (double) (Math.round(average * 2) / 2.0);
        }

        ReviewDetailResponse.MetaData metaData = ReviewDetailResponse.MetaData.builder()
                .average(averageRate)
                .totalCount(allReviews.size())
                .countStar1(countStar1)
                .countStar2(countStar2)
                .countStar3(countStar3)
                .countStar4(countStar4)
                .countStar5(countStar5)
                .build();

        Page<ReviewResponse> reviewResponses = reviewPage.map(this::convertToReviewResponse);
        return ReviewDetailResponse.builder().data(reviewResponses).metaData(metaData).build();
    }

    private ReviewResponse convertToReviewResponse(Review review) {
        List<Long> userIds = review.getUsersWhoLiked().stream().map(User::getId).toList();
        Boolean isLike = userIds.contains(userService.getCurrentUser().getId());
        Integer likeQty = userIds.size();
        return ReviewResponse.builder()
                .id(review.getId())
                .userName(review.getUser().getFullName())
                .customerId(review.getUser().getId())
                .comment(review.getComment())
                .star(review.getStar())
                .isLiked(isLike)
                .likeQty(likeQty)
                .createDate(review.getUpdateTime())
                .build();
    }
    public Map<Long, Boolean> checkUserReviewedProducts(Long userId, List<Long> productIds) {
        List<Long> reviewedProductIds = reviewRepository.findReviewedProductIdsByUser(userId, productIds);
        Map<Long, Boolean> isReviewedMap = productIds.stream()
                .collect(Collectors.toMap(productId -> productId, productId -> false));
        reviewedProductIds.forEach(productId -> isReviewedMap.put(productId, true));
        return isReviewedMap;
    }
}
