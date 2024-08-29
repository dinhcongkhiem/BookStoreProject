package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.ImageProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepository extends JpaRepository<ImageProduct,Long> {
}
