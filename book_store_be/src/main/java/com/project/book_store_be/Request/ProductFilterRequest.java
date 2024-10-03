package com.project.book_store_be.Request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
@Data
public class ProductFilterRequest {
    private List<Long> categoriesId;  // Filter by multiple categories
    private BigDecimal minPrice;      // Minimum price filter
    private BigDecimal maxPrice;      // Maximum price filter
    private Long publisherId;
}
