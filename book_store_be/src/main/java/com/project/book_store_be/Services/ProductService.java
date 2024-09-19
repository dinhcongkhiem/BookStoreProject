package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Request.ProductRequest;
import com.project.book_store_be.Response.ProductRes.ProductBaseResponse;
import com.project.book_store_be.Response.ProductRes.ProductDetailResponse;
import com.project.book_store_be.Response.ProductRes.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final PublisherService publisherService;
    private final CategoryService categoryService;
    private final AuthorService authorService;
    private final ImageProductService imageProductService;

    public Page<ProductResponse> getAllProducts(int pageNumber, int pageSize) {
        Pageable pageRequest = PageRequest.of(pageNumber, pageSize);
        return productRepository.findAll(pageRequest).map(this::convertToProductResponse);
    }
    public ProductDetailResponse findProductById(Long id) {
        return this.convertToProductDetailResponse(productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No product found with id: " + id)));
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

    public ProductResponse convertToProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .original_price(product.getOriginal_price())
                .authorName(product.getAuthor().getName())
                .thumbnail_url(imageProductService.getThumbnailProduct(product.getId()).getUrlImage())
//                .discount(CHUA LAM)  PENDING PENDING
//                .discount_rate()   PENDING PENDING
//                .price()  PENDING PENDING
//                .quantity_sold()   PENDING
//                .rating_average() PENDING
//                .review_count()    PENDING PENDING

                .build();
    }

    public ProductDetailResponse convertToProductDetailResponse(Product product) {

        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .original_price(product.getOriginal_price())
                .publication_date(product.getPublication_date())
                .number_of_pages(product.getNumber_of_pages())
                .description(product.getDescription())
                .quantity(product.getQuantity())
                .author(product.getAuthor())
                .category(product.getCategory())
                .publisher(product.getPublisher())
//                .discount(CHUA LAM)  PENDING PENDING
//                .discount_rate()   PENDING PENDING
//                .price()  PENDING PENDING
//                .quantity_sold()   PENDING
//                .rating_average() PENDING
//                .review_count()    PENDING PENDING
                .images(imageProductService.getImagesProductId(product.getId()))
                .build();
    }



}
