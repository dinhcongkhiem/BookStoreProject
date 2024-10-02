package com.project.book_store_be.Response.ProductRes;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
@Data
@Builder
public class ProductCartResponse {
    private Long productId;
    private String productName;
    private Integer availableQuantity;
    private Integer cartQuantity; 
    private BigDecimal price;
    private BigDecimal totalPrice;
}
