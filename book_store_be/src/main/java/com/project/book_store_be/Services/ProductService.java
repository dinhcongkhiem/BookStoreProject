package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.DiscountStatus;
import com.project.book_store_be.Enum.ProductStatus;
import com.project.book_store_be.Enum.SoftProductType;
import com.project.book_store_be.Model.Discount;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Repository.DisCountRepository;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Repository.Specification.ProductSpecification;
import com.project.book_store_be.Request.ProductRequest;
import com.project.book_store_be.Response.ProductRes.ProductDetailResponse;
import com.project.book_store_be.Response.ProductRes.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductService {
    private static final BigDecimal ONE_HUNDRED = new BigDecimal(100);
    private final ProductRepository productRepository;
    private final PublisherService publisherService;
    private final CategoryService categoryService;
    private final AuthorService authorService;
    private final ImageProductService imageProductService;
    private final ReviewService reviewService;

    public Page<ProductResponse> getProductsAvailable(
            int page, int pageSize, Long category, List<BigDecimal> price,
            List<Long> publisher, String sort, String keyword
    ) {
        SoftProductType sortType = SoftProductType.fromValue(sort);
        Specification<Product> spec = ProductSpecification.getProduct(
                 category, price,publisher, keyword, ProductStatus.AVAILABLE);

        Sort sortValue = Sort.unsorted();
        switch (sortType) {
            case TOPSELLER:
//                sort = Sort.by(Sort.Direction.ASC, "creationDate"); // Sắp xếp theo ngày tạo tăng dần
//                break;
            case NEWEST:
                sortValue = Sort.by(Sort.Direction.ASC, "createDate");
                break;
            case PRICE_DESC:
                sortValue = Sort.by(Sort.Direction.DESC, "price");
                break;
            case PRICE_ASC:
                sortValue = Sort.by(Sort.Direction.ASC, "price");
                break;
        }

        Pageable pageable = PageRequest.of(page, pageSize, sortValue);
        return productRepository.findAll(spec, pageable).map(this::convertToProductResponse);

    }

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
                .year_of_publication(request.getYear_of_publication())
                .cost(request.getCost())
                .original_price(request.getOriginal_price())
                .price(request.getOriginal_price())
                .size(request.getSize())
                .quantity(request.getQuantity())
                .status(request.getStatus())
                .coverType(request.getCoverType())
                .manufacturer(request.getManufacturer())
                .categories(categoryService.getCategories(request.getCategoriesId()))
                .authors(authorService.getAuthors(request.getAuthorsId()))
                .description(request.getDescription())
                .createDate(new Date())
                .updateDate(new Date())
                .build();
        productRepository.save(product);
        imageProductService.uploadMultipleImageProduct(images, product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public Product updateProduct(Long id, ProductRequest request) {
        Product pr = productRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Product not found"));
        BigDecimal price = request.getOriginal_price();
        if (pr.getDiscount() != null && pr.getDiscount().getStatus() == DiscountStatus.ACTIVE) {
            BigDecimal discountAmount = pr.getOriginal_price()
                    .multiply(BigDecimal.valueOf(pr.getDiscount().getDiscountRate()))
                    .divide(ONE_HUNDRED, RoundingMode.HALF_UP);

            price = pr.getOriginal_price().subtract(discountAmount);
        }

        pr.setName(request.getName());
        pr.setPublisher(publisherService.getPublisherById(request.getPublisherId()).orElse(null));
        pr.setNumber_of_pages(request.getNumber_of_pages());
        pr.setCost(request.getCost());
        pr.setOriginal_price(request.getOriginal_price());
        pr.setSize(request.getSize());
        pr.setQuantity(request.getQuantity());
        pr.setStatus(request.getStatus());
        pr.setCoverType(request.getCoverType());
        pr.setManufacturer(request.getManufacturer());
        pr.setCategories(categoryService.getCategories(request.getCategoriesId()));
        pr.setAuthors(authorService.getAuthors(request.getAuthorsId()));
        pr.setDescription(request.getDescription());
        pr.setPrice(price);
        pr.setUpdateDate(new Date());
        return productRepository.save(pr);
    }
    public Map<String,BigDecimal> getPriceRange() {
        Map<BigDecimal, BigDecimal> result = productRepository.findMinAndMaxPrice();
        BigDecimal minPrice = result.get("min");
        BigDecimal maxPrice = result.get("max");
        return Map.of("min", minPrice, "max", maxPrice);
    }
    public ProductResponse convertToProductResponse(Product product) {

        Integer discountRate = 0;

        if(product.getDiscount() != null) {
            discountRate = product.getDiscount().getDiscountRate();
        }
        BigDecimal discountValue = product.getOriginal_price().multiply(BigDecimal.valueOf(discountRate))
                .divide(ONE_HUNDRED, RoundingMode.HALF_UP);

        String thumbnailUrl = imageProductService.getThumbnailProduct(product.getId()) != null
                ? imageProductService.getThumbnailProduct(product.getId()).getUrlImage() : null;
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .original_price(product.getOriginal_price())
                .authors(product.getAuthors())
                .thumbnail_url(thumbnailUrl)
                .discount(discountValue)
                .discount_rate(discountRate)
                .price(product.getPrice())
                .rating_average(reviewService.calculateReviewAverage(product.getId()))
                .build();
//                .quantity_sold()   PENDING
    }

    public ProductDetailResponse convertToProductDetailResponse(Product product) {
        Integer discountRate = 0;

        if(product.getDiscount() != null) {
            discountRate = product.getDiscount().getDiscountRate();
        }
        BigDecimal discountValue = product.getOriginal_price().multiply(BigDecimal.valueOf(discountRate))
                .divide(ONE_HUNDRED, RoundingMode.HALF_UP);

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


}
