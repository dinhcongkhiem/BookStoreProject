package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Request.ProductRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final PublisherService publisherService;
    private final CategoryService categoryService;
    private final AuthorService authorService;
    private final ImageProductService imageProductService;

    public Page<Product> getAllProducts(int pageNumber, int pageSize) {
        Pageable pageRequest = PageRequest.of(pageNumber, pageSize);
        return productRepository.findAll(pageRequest);
    }

    public void addProduct(ProductRequest request, List<MultipartFile> images) {
        Product product = Product.builder()
                .name(request.getName())
                .publisher(publisherService.getPublisherById(request.getPublisherId()).orElse(null))
                .number_of_pages(request.getNumber_of_pages())
                .original_price(request.getOriginal_price())
                .quantity(request.getQuantity())
                .status(request.getStatus())
                .category(categoryService.getCategoryById(request.getCategoryId()))
                .author(authorService.getAuthorById(request.getAuthorId()).orElse(null))
                .publication_date(new Date())
                .build();
        productRepository.save(product);
        imageProductService.uploadMultipleImageProduct(images, product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public Product updateProduct(Long id, ProductRequest request) {
        Product pr = productRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Product not found"));
        pr.setName(request.getName());
        pr.setPublisher(publisherService.getPublisherById(request.getPublisherId()).orElse(null));
        pr.setNumber_of_pages(request.getNumber_of_pages());
        pr.setOriginal_price(request.getOriginal_price());
        pr.setQuantity(request.getQuantity());
        pr.setStatus(request.getStatus());
        pr.setCategory(categoryService.getCategoryById(request.getCategoryId()));
        pr.setAuthor(authorService.getAuthorById(request.getAuthorId()).orElse(null));


        return productRepository.save(pr);
    }
}
