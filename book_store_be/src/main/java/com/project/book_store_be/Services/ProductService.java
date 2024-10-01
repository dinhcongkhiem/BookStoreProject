package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.DiscountStatus;
import com.project.book_store_be.Model.DisCount;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Repository.DisCountRepository;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Request.ProductRequest;
import com.project.book_store_be.Response.ProductRes.ProductDetailResponse;
import com.project.book_store_be.Response.ProductRes.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.math.BigDecimal;
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
    private final DisCountRepository disCountRepository;
    private final ReviewService reviewService;

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
                .cost(request.getCost())
                .original_price(request.getOriginal_price())
                .quantity(request.getQuantity())
                .status(request.getStatus())
                .categories(categoryService.getCategories(request.getCategoriesId()))
                .authors(authorService.getAuthors(request.getAuthorsId()))
                .year_of_publication(request.getYear_of_publication())
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
        pr.setCost(request.getCost());
        pr.setOriginal_price(request.getOriginal_price());
        pr.setQuantity(request.getQuantity());
        pr.setStatus(request.getStatus());
        pr.setCategories(categoryService.getCategories(request.getCategoriesId()));
        pr.setAuthors(authorService.getAuthors(request.getAuthorsId()));
        return productRepository.save(pr);
    }

    public ProductResponse convertToProductResponse(Product product) {
        DisCount disCount = disCountRepository.findByStatus(DiscountStatus.ACTIVE).orElse(null);
        Integer discountRate = 0;
        BigDecimal discountValue = BigDecimal.ZERO;
        if (disCount != null && disCount.getProducts().contains(product)) {
            discountRate = disCount.getDiscountRate();
            discountValue = product.getOriginal_price()
                    .multiply(BigDecimal.valueOf(discountRate))
                    .divide(BigDecimal.valueOf(100));
        }
        String thumbnailUrl =  imageProductService.getThumbnailProduct(product.getId()) != null
                ? imageProductService.getThumbnailProduct(product.getId()).getUrlImage() : null;
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .original_price(product.getOriginal_price())
                .authors(product.getAuthors())
                .thumbnail_url(thumbnailUrl)
                .discount(discountValue)
                .discount_rate(discountRate)
                .price(product.getOriginal_price().subtract(discountValue))
                .build();
//                .quantity_sold()   PENDING
//                .rating_average() PENDING
//                .review_count()    PENDING PENDING
    }

    public ProductDetailResponse convertToProductDetailResponse(Product product) {
        DisCount disCount = disCountRepository.findByStatus(DiscountStatus.ACTIVE).orElse(null);
        Integer discountRate = 0;
        BigDecimal discountValue = BigDecimal.ZERO;
        if (disCount != null && disCount.getProducts().contains(product)) {
            discountRate = disCount.getDiscountRate();
            discountValue = product.getOriginal_price()
                    .multiply(BigDecimal.valueOf(discountRate))
                    .divide(BigDecimal.valueOf(100));
        }

        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .original_price(product.getOriginal_price())
                .year_of_publication(product.getYear_of_publication())
                .number_of_pages(product.getNumber_of_pages())
                .description(product.getDescription())
                .quantity(product.getQuantity())
                .coverType(product.getCoverType())
                .size(product.getSize())
                .translatorName(product.getTranslatorName())
                .manufacturer(product.getManufacturer())
                .authors(product.getAuthors())
                .categories(product.getCategories())
                .publisher(product.getPublisher())
                .discount(discountValue)
                .discount_rate(discountRate)
                .status(product.getStatus())
                .price(product.getOriginal_price().subtract(discountValue))
//                .quantity_sold()   PENDING
                .rating_average(reviewService.calculateReviewAverage(product.getId()))
                .review_count(reviewService.getReviewCount(product.getId()))
                .images(imageProductService.getImagesProductId(product.getId()))
                .build();
    }


    public List<Product> findAllByIds(List<Long> productIds) {
        return productRepository.findAllById(productIds);
    }

    public List<Product> searchProducts(String productName, String categoryName, String authorName, String publisherName) {
        return productRepository.searchProducts(productName, categoryName, authorName, publisherName);
    }

}
