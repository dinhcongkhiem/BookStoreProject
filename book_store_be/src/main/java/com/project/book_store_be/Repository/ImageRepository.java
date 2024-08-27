package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Image;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepository extends JpaRepository<Image,Long> {
}
