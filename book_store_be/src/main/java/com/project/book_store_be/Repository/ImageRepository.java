package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.ImageProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<ImageProduct,Long> {
    List<ImageProduct> findByProductIdOrderByIsThumbnailDesc(Long productId);
    Optional<ImageProduct> findByProductIdAndIsThumbnail(Long productId, Boolean isThumbnail);
    default Optional<ImageProduct> findThumbnailByProductId(Long productId) {
        return findByProductIdAndIsThumbnail(productId, true);
    }
}
