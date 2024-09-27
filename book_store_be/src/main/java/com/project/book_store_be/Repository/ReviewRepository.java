package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface ReviewRepository extends JpaRepository<Review,Long> {
    Page<Review> findByProductId(Long productId, Pageable pageable);
    List<Review> findByProductId(Long productId);
    int countByProductId(Long productId);
}
