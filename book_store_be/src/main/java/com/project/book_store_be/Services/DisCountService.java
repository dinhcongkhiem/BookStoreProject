package com.project.book_store_be.Services;

import com.project.book_store_be.Exception.DiscountNameAlreadyExistsException;
import com.project.book_store_be.Model.Discount;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Request.DisCountRequest;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Repository.DisCountRepository;
import com.project.book_store_be.Response.DiscountRes.DiscountResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class DisCountService {
    @Autowired
    private DisCountRepository repo;

    @Autowired
    private ProductService productService;
    @Autowired
    private ProductRepository productRepository;

    public Page<?> getDiscounts(int page, int size, String orderBy, String keyword, Integer status) {
        Sort sortValue = switch (orderBy) {
            case "name_asc" -> Sort.by(Sort.Direction.ASC, "name");
            case "name_desc" -> Sort.by(Sort.Direction.DESC, "name");
            case "value_asc" -> Sort.by(Sort.Direction.ASC, "discountRate");
            case "value_desc" -> Sort.by(Sort.Direction.DESC, "discountRate");
            case "start_asc" -> Sort.by(Sort.Direction.ASC, "startDate");
            case "start_desc" -> Sort.by(Sort.Direction.DESC, "startDate");
            case "end_asc" -> Sort.by(Sort.Direction.ASC, "endDate");
            case "end_desc" -> Sort.by(Sort.Direction.DESC, "endDate");
            default -> Sort.by(Sort.Direction.DESC, "createDate");
        };
        Pageable pageable = PageRequest.of(page, size, sortValue);
        return repo.getDiscount(pageable, keyword, status).map(this::convertToRes);
    }

    public DiscountResponse getDiscountById(Long id) {
        Discount discount =  this.findById(id).orElseThrow(() -> new NoSuchElementException("Khoong co discount nao id la: " + id));
        return this.convertToResDetail(discount);
    }
    private void validateDiscountRate(Integer discountRate) {
        if (discountRate < 0 || discountRate > 30) {
            throw new IllegalArgumentException("Discount rate must be between 0% and 30% ");
        }
    }
    private void validateDiscountDates(LocalDateTime startDate, LocalDateTime endDate) {
        LocalDateTime today = LocalDateTime.now().truncatedTo(ChronoUnit.DAYS);
        if (startDate.isAfter(endDate) || startDate.isEqual(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
        if (today.isAfter(startDate)) {
            throw new IllegalArgumentException("Start date must be before today");
        }
    }

    public void createDiscount(DisCountRequest disCountRequest) {
        validateDiscountRate(disCountRequest.getValue());
        validateDiscountDates(disCountRequest.getStartDate(), disCountRequest.getEndDate());

        if(this.repo.getDiscount( PageRequest.of(0, 1), disCountRequest.getName(), null).getContent().size() > 0){
            throw new DiscountNameAlreadyExistsException("Đã có đợt giảm giá " + disCountRequest.getName() + " đang hoạt động, vui lòng thử lại!");
        }

        List<Product> products = new ArrayList<>();
        if (disCountRequest.getIsAll()) {
            if (disCountRequest.getProductIds().isEmpty()) {
                products = productRepository.findAll();
            } else {
                products = productRepository.findAllByIdNotIn(disCountRequest.getProductIds());
            }
        } else {
            products = productService.findAllByIds(disCountRequest.getProductIds());
        }

        Discount disCount = Discount.builder()
                .name(disCountRequest.getName())
                .discountRate(disCountRequest.getValue())
                .startDate(disCountRequest.getStartDate())
                .endDate(disCountRequest.getEndDate().withHour(23).withMinute(59).withSecond(59))
                .createDate(LocalDateTime.now())
                .build();
        Discount newDiscount = repo.save(disCount);

        updateProductsWithDiscount(products, newDiscount);

    }

    public Optional<Discount> findById(Long id) {
        return repo.findById(id);
    }


    public Discount updateDiscount(Long id, DisCountRequest disCountRequest) {
        Optional<Discount> optionalDiscount = repo.findById(id);
        Discount discountExistsName = repo.getDiscount( PageRequest.of(0, 1), disCountRequest.getName(), null).getContent().get(0);
        if (optionalDiscount.isEmpty()) {
            throw new RuntimeException("Discount not found");
        }
        if(discountExistsName != null && !Objects.equals(discountExistsName.getId(), id)){
            throw new DiscountNameAlreadyExistsException("Đã có đợt giảm giá " + disCountRequest.getName() + " đang hoạt động, vui lòng thử lại!");
        }
        Discount existingDiscount = optionalDiscount.get();
        List<Product> products = new ArrayList<>();
        if (disCountRequest.getIsAll()) {
            if (disCountRequest.getProductIds().isEmpty()) {
                products = productRepository.findAll();
            } else {
                products = productRepository.findAllByIdNotIn(disCountRequest.getProductIds());
            }
        } else {
            products = productService.findAllByIds(disCountRequest.getProductIds());
        }
        Discount updatedDiscount = existingDiscount.toBuilder()
                .discountRate(disCountRequest.getValue())
                .startDate(disCountRequest.getStartDate())
                .endDate(disCountRequest.getEndDate().withHour(23).withMinute(59).withSecond(59))
                .build();
        Discount newDiscount = repo.save(updatedDiscount);

        updateProductsWithDiscount(products, newDiscount);

        return newDiscount;
    }

    @Transactional
    public void delete(Long id) {
        Discount disCount = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Discount not found"));
        repo.deleteProductDiscountLinks(id);
        repo.delete(disCount);
    }


    private void updateProductsWithDiscount(List<Product> products, Discount discount) {

        List<Product> currentProducts = discount.getProducts();

        List<Product> productsToRemove = currentProducts.stream()
                .filter(product -> !products.contains(product))
                .toList();
        for (Product product : productsToRemove) {
            product.getDiscounts().remove(discount);
            productRepository.save(product);
        }

        for (Product product : products) {
            if (!product.getDiscounts().contains(discount)) {
                product.getDiscounts().add(discount);
                productRepository.save(product);
            }
        }
        discount.setProducts(products);
        repo.save(discount);
    }

    private DiscountResponse convertToRes(Discount d) {
        return DiscountResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .discountRate(d.getDiscountRate())
                .startDate(d.getStartDate())
                .endDate(d.getEndDate())
                .build();
    }
    private DiscountResponse convertToResDetail(Discount d) {
        return DiscountResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .discountRate(d.getDiscountRate())
                .startDate(d.getStartDate())
                .endDate(d.getEndDate())
                .productIds(d.getProducts().stream().map(Product::getId).toList())
                .build();
    }
}
