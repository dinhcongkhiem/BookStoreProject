package com.project.book_store_be.Response.ProductRes;

import com.project.book_store_be.Enum.ProductStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
@Data
@Builder
public class ProductCartResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private Integer productQuantity;
    private BigDecimal original_price;
    private BigDecimal discount;
    private BigDecimal price;
    private String thumbnail_url;
}
