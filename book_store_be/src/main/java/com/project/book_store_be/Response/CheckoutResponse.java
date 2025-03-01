package com.project.book_store_be.Response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CheckoutResponse {
    private Long cartId;
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal original_price;
    private BigDecimal discount;
    private BigDecimal price;
    private String thumbnail_url;
    private Integer weight;
}
