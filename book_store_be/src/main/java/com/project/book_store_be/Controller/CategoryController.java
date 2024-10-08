package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.Category;
import com.project.book_store_be.Services.CategoryService;
import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;
    @GetMapping("/api/v1/category")
    public ResponseEntity<List<Category>> getAllCategories(@RequestParam(value = "keyword", defaultValue = "") String keyword) {
        List<Category> categories;
        if (!keyword.isEmpty()) {
            categories = categoryService.searchCategoriesByName(keyword);
        } else {
            categories = categoryService.getAllCategories();
        }
        if (categories.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(categories);
    }
    @GetMapping("/api/v1/category/categoryIds")
    public ResponseEntity<List<Category>> getCategories(@RequestParam List<Long> categoryIds) {
        List<Category> categories = categoryService.getCategories(categoryIds);
        if (categories.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(categories);
    }

    @PostMapping("/api/v1/admin/category")
    public Category createCategory(@RequestBody Category category) {
        return categoryService.createCategory(category);
    }
    @PutMapping("/api/v1/admin/category/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        Category updatedCategory = categoryService.updateCategory(id, categoryDetails);
        if (updatedCategory == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedCategory);
    }
    @DeleteMapping("/api/v1/admin/category/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
