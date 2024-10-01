package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Category;
import com.project.book_store_be.Repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    public List<Category> getCategories(List<Long> categoriesId) {
        return categoryRepository.findAllById(categoriesId);
    }
    public Category createCategory(Category category) {
        if (categoryRepository.findByName(category.getName()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name already exists");
        }
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category != null) {
            if (category.getName().equals(categoryDetails.getName())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New category name must be different from the old name");
            }
            if (categoryRepository.findByName(categoryDetails.getName()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name already exists");
            }
            category.setName(categoryDetails.getName());
            return categoryRepository.save(category);
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found");
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found");
        }
        categoryRepository.deleteById(id);
    }
}
