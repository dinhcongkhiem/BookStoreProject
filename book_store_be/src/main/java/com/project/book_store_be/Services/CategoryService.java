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

    public List<Category> searchCategoriesByName(String keyword) {
        return categoryRepository.findByNameContainingIgnoreCase(keyword);
    }

    public List<Category> getCategories(List<Long> categoryId) {
        return categoryRepository.findAllById(categoryId);
    }

    public Category createCategory(Category category) {
        if (categoryRepository.findByName(category.getName()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên danh mục đã tồn tại");
        }
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category != null) {
            if (category.getName().equals(categoryDetails.getName())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên danh mục mới phải khác với tên cũ");
            }
            if (categoryRepository.findByName(categoryDetails.getName()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên danh mục đã tồn tại");
            }
            category.setName(categoryDetails.getName());
            return categoryRepository.save(category);
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục");
    }

    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục");
        }
        categoryRepository.deleteById(id);
    }
}
