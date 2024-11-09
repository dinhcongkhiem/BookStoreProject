package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.DiscountStatus;
import com.project.book_store_be.Model.Discount;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Request.DisCountRequest;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Repository.DisCountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class DisCountService {
    @Autowired
    private DisCountRepository repo;

    @Autowired
    private ProductService productService;
    @Autowired
    private ProductRepository productRepository;

    public Page<Discount> getDiscounts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return repo.findAll(pageable);
    }

    private void validateDiscountRate(double discountRate) {
        if (discountRate < 0 || discountRate > 30) {
            throw new IllegalArgumentException("Discount rate must be between 0% and 30% ");
        }
    }

    private void validateDiscountDates(Date startDate, Date endDate) {
        if (startDate.after(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
    }

    public Discount createDiscount(DisCountRequest disCountRequest) {
        validateDiscountRate(disCountRequest.getDiscountRate());
        validateDiscountDates(disCountRequest.getStartDate(), disCountRequest.getEndDate());
        List<Product> products = productService.findAllByIds(disCountRequest.getProductIds());
        Discount disCount = Discount.builder()
                .discountRate(disCountRequest.getDiscountRate())
                .startDate(disCountRequest.getStartDate())
                .endDate(disCountRequest.getEndDate())
                .status(disCountRequest.getEndDate().before(new Date()) ? DiscountStatus.ACTIVE : DiscountStatus.INACTIVE)
                .build();
        Discount newDiscount = repo.save(disCount);
        products.forEach(p -> {
            p.setPrice(p.getOriginal_price().multiply(BigDecimal.valueOf(disCount.getDiscountRate()))
                    .divide(new BigDecimal(100), RoundingMode.HALF_UP));
            p.setDiscount(newDiscount);
        });
        productRepository.saveAll(products);
        return newDiscount;
    }

    public Optional<Discount> findById(Long id) {
        return repo.findById(id);
    }

    public Discount updateDiscount(Long id, DisCountRequest disCountRequest) {
        Optional<Discount> optionalDiscount = repo.findById(id);
        if (!optionalDiscount.isPresent()) {
            throw new RuntimeException("Discount not found");
        }
        Discount existingDiscount = optionalDiscount.get();
        List<Product> products = productService.findAllByIds(disCountRequest.getProductIds());

        DiscountStatus discountStatus = (disCountRequest.getStartDate().before(new Date()) && disCountRequest.getStartDate()
                .after(new Date())) ? DiscountStatus.ACTIVE : DiscountStatus.INACTIVE;

        Discount updatedDiscount = existingDiscount.toBuilder()
                .discountRate(disCountRequest.getDiscountRate())
                .startDate(disCountRequest.getStartDate())
                .endDate(disCountRequest.getEndDate())
                .status(discountStatus)
                .build();
        Discount newDiscount = repo.save(updatedDiscount);
        products.forEach(p -> {
            p.setPrice(p.getOriginal_price().multiply(BigDecimal.valueOf(newDiscount.getDiscountRate()))
                    .divide(new BigDecimal(100), RoundingMode.HALF_UP));
            p.setDiscount(newDiscount);
        });
        productRepository.saveAll(products);
        return newDiscount;
    }

    public void delete(Long id) {
        Discount disCount = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Discount not found"));
        repo.deleteById(id);
    }

}
