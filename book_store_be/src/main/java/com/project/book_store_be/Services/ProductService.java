package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.ProductStatus;
import com.project.book_store_be.Enum.SoftProductType;
import com.project.book_store_be.Interface.AuthorService;
import com.project.book_store_be.Interface.ProductRepositoryCustom;
import com.project.book_store_be.Model.Author;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Repository.Specification.ProductSpecification;
import com.project.book_store_be.Request.ProductRequest;
import com.project.book_store_be.Response.ProductRes.ProductDetailResponse;
import com.project.book_store_be.Response.ProductRes.ProductResponse;
import com.project.book_store_be.Response.ProductRes.ProductsForManagerResponse;
import jakarta.persistence.Tuple;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final ProductRepositoryCustom productRepositoryCustom;

    public Page<ProductResponse> getProductsAvailable(
            int page, int pageSize, Long category, List<BigDecimal> price,
            List<Long> publisher, String sort, String keyword
    ) {
        SoftProductType sortType = SoftProductType.fromValue(sort);
        Specification<Product> spec = ProductSpecification.getProduct(
                category, price, publisher, keyword, ProductStatus.AVAILABLE);
        Sort sortValue = switch (sortType) {
            case PRICE_DESC -> Sort.by(Sort.Direction.DESC, "price");
            case PRICE_ASC -> Sort.by(Sort.Direction.ASC, "price");
            default -> Sort.by(Sort.Direction.ASC, "createDate");

        };
        Pageable pageable = PageRequest.of(page, pageSize, sortValue);

        if (sortType == SoftProductType.TOP_SELLER) {
            Page<Tuple> dtoPage = productRepositoryCustom.findProductsWithQtySold(spec, pageable, true);
            return dtoPage.map(d -> {
                Product product = d.get(0, Product.class);
                Long qtySold = d.get(1, Long.class);
                return this.convertToProductResponse(product, qtySold.intValue());
            });
        } else {
            Page<Tuple> dtoPage = productRepositoryCustom.findProductsWithQtySold(spec, pageable, false);
            return dtoPage.map(d -> {
                Product product = d.get(0, Product.class);
                Long qtySold = d.get(1, Long.class);

                return this.convertToProductResponse(product, qtySold.intValue());
            });
        }
    }

    public Page<?> getAllProducts(int pageNumber, int pageSize, String sort, String keyword) {
        SoftProductType sortType = SoftProductType.fromValue(sort);

        Sort sortValue = switch (sortType) {
            case PRICE_DESC -> Sort.by(Sort.Direction.DESC, "price");
            case PRICE_ASC -> Sort.by(Sort.Direction.ASC, "price");
            case ID_ASC -> Sort.by(Sort.Direction.ASC, "id");
            case ID_DESC -> Sort.by(Sort.Direction.DESC, "id");
            case NAME_ASC -> Sort.by(Sort.Direction.ASC, "name");
            case NAME_DESC -> Sort.by(Sort.Direction.DESC, "name");
            case QTY_ASC -> Sort.by(Sort.Direction.ASC, "quantity");
            case QTY_DESC -> Sort.by(Sort.Direction.DESC, "quantity");
            case STATUS_ASC -> Sort.by(Sort.Direction.ASC, "status");
            case STATUS_DESC -> Sort.by(Sort.Direction.DESC, "status");
            case OLDEST -> Sort.by(Sort.Direction.ASC, "createDate");
            default -> Sort.by(Sort.Direction.DESC, "createDate");
        };
        Pageable pageRequest = PageRequest.of(pageNumber, pageSize, sortValue);
        if (sortType == SoftProductType.TOP_SELLER) {
            Page<Tuple> dtoPage = productRepositoryCustom.findProductsWithQtySold(null, pageRequest, true);
            return dtoPage.map(d -> {
                Product product = d.get(0, Product.class);
                return this.convertToForManagerRes(product);
            });
        }
        long id;
        try {
            id = Long.parseLong(keyword);
        } catch (NumberFormatException e) {
            id = -1L;
        }
        return productRepository.searchByNameContainingIgnoreCaseOrId(keyword, id, pageRequest)
                .map(this::convertToForManagerRes);
    }

    public List<ProductResponse> getTheSameAuthor(Long productId) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("No product found with id: " + productId));
        List<Author> authors = product.getAuthors();
        return productRepository.findTop10ByAuthorsExceptCurrent(authors, productId, PageRequest.of(0, 10))
                .stream()
                .map(t -> convertToProductResponse(t.get(0, Product.class), t.get(1, Long.class).intValue()))
                .toList();
    }

    public ProductDetailResponse findProductById(Product product) {
        return this.convertToProductDetailResponse(product);
    }

    public void addProduct(ProductRequest request, List<MultipartFile> images, Integer indexThumbnail) {
        Map<String, Integer> size = Map.of("x", request.getLength(), "y", request.getWidth(), "z", request.getHeight());

        Product product = Product.builder()
                .name(request.getName())
                .publisher(publisherService.getPublisherById(request.getPublisherId()).orElse(null))
                .number_of_pages(request.getNumberOfPages())
                .year_of_publication(request.getYearOfPublication())
                .cost(request.getCost())
                .original_price(request.getOriginalPrice())
                .price(request.getOriginalPrice())
                .size(size)
                .weight(request.getWeight())
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
        imageProductService.uploadMultipleImageProduct(images, product.getId(), indexThumbnail, null);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Khong co product nao co ID la: " + id));
        imageProductService.deleteImagesProduct(product.getId());
        productRepository.deleteById(id);
    }

    public void updateProduct(Long productId, ProductRequest request, List<MultipartFile> images, Integer indexThumbnail, List<Long> listOldImg) {
        Map<String, Integer> size = Map.of("x", request.getLength(), "y", request.getWidth(), "z", request.getHeight());

        Product product = Product.builder()
                .id(productId)
                .name(request.getName())
                .publisher(publisherService.getPublisherById(request.getPublisherId()).orElse(null))
                .number_of_pages(request.getNumberOfPages())
                .year_of_publication(request.getYearOfPublication())
                .cost(request.getCost())
                .original_price(request.getOriginalPrice())
                .price(request.getOriginalPrice())
                .size(size)
                .weight(request.getWeight())
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
        imageProductService.updateOldImg(listOldImg, productId);
        productRepository.save(product);
        imageProductService.uploadMultipleImageProduct(images, product.getId(), indexThumbnail, listOldImg);
    }

    public Map<String, BigDecimal> getPriceRange() {
        Map<BigDecimal, BigDecimal> result = productRepository.findMinAndMaxPrice();
        BigDecimal minPrice = result.get("min");
        BigDecimal maxPrice = result.get("max");
        return Map.of("min", minPrice, "max", maxPrice);
    }

    public List<Product> findAllByIds(List<Long> productIds) {
        return productRepository.findAllById(productIds);
    }

    public Map<String, List<?>> getAttributes() {
        Map<String, List<?>> attributes = new HashMap<>();
        attributes.put("authors", authorService.getAllAuthor());
        attributes.put("categories", categoryService.getAllCategories());
        attributes.put("publishers", publisherService.getAllPublisher());
        return attributes;
    }

    public ProductResponse convertToProductResponse(Product product, Integer qty_sold) {

        Map<String, ?> discountValue = getDiscountValue(product);
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .original_price(product.getOriginal_price())
                .authors(product.getAuthors())
                .thumbnail_url(imageProductService.getThumbnailProduct(product.getId()))
                .discount((BigDecimal) discountValue.get("discountVal"))
                .discount_rate((Integer) discountValue.get("discountRate"))
                .price(product.getPrice())
                .rating_average(reviewService.calculateReviewAverage(product.getId()))
                .quantity_sold(qty_sold)
                .build();
    }

    public ProductDetailResponse convertToProductDetailResponse(Product product) {
        Map<String, ?> discountValue = getDiscountValue(product);
        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .cost(product.getCost())
                .original_price(product.getOriginal_price())
                .year_of_publication(product.getYear_of_publication())
                .number_of_pages(product.getNumber_of_pages())
                .description(product.getDescription())
                .quantity(product.getQuantity())
                .coverType(product.getCoverType())
                .size(product.getSize())
                .weight(product.getWeight())
                .translatorName(product.getTranslatorName())
                .manufacturer(product.getManufacturer())
                .authors(product.getAuthors())
                .categories(product.getCategories())
                .publisher(product.getPublisher())
                .discount((BigDecimal) discountValue.get("discountVal"))
                .discount_rate((Integer) discountValue.get("discountRate"))
                .status(product.getStatus())
                .price(product.getOriginal_price().subtract((BigDecimal) discountValue.get("discountVal")))
//                .quantity_sold()   PENDING
                .rating_average(reviewService.calculateReviewAverage(product.getId()))
                .review_count(reviewService.getReviewCount(product.getId()))
                .images(imageProductService.getImagesProductId(product.getId()))
                .related_products(this.getTheSameAuthor(product.getId()))
                .build();
    }

    private ProductsForManagerResponse convertToForManagerRes(Product product) {
        Map<String, ?> discountValue = getDiscountValue(product);
        return ProductsForManagerResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getOriginal_price().subtract((BigDecimal) discountValue.get("discountVal")))
                .quantity(product.getQuantity())
                .status(product.getStatus())
                .createDate(product.getCreateDate())
                .thumbnail_url(imageProductService.getThumbnailProduct(product.getId()))
                .build();
    }

    public Map<String, ?> getDiscountValue(Product p) {
        Integer discountRate = 0;

        if (p.getDiscount() != null) {
            discountRate = p.getDiscount().getDiscountRate();
        }
        BigDecimal discountValue = p.getOriginal_price().multiply(BigDecimal.valueOf(discountRate))
                .divide(ONE_HUNDRED, RoundingMode.HALF_UP);
        return Map.of("discountRate", discountRate, "discountVal", discountValue);
    }

    public Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No product found with id: " + id));
    }

}
