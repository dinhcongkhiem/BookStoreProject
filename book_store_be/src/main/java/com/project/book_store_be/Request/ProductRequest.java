package com.project.book_store_be.Request;

import com.project.book_store_be.Enum.ProductStatus;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {
    private String name;
    private Long publisherId;
    private Integer number_of_pages;
    private BigDecimal original_price;
    private Integer quantity;
    private ProductStatus status;
    private Long categoryId;
    private Long authorId;
}
