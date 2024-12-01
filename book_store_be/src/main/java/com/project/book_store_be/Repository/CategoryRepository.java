package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category,Long> {
    Optional<Category> findByNameIgnoreCase(String name);
    List<Category> findByNameContainingIgnoreCaseOrderByIdAsc(String keyword);


}
