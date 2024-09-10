package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.ImageProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<ImageProduct,Long> {
    List<ImageProduct> findByProductId(Long productId);
    Optional<ImageProduct> findImageProductById(Long productId);
}
