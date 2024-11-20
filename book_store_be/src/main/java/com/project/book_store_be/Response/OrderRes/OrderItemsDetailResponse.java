package com.project.book_store_be.Response.OrderRes;

import lombok.Builder;
import lombok.Data;


import java.math.BigDecimal;

@Data
@Builder
public class OrderItemsDetailResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Integer productQuantity;
    private BigDecimal originalPrice;
    private BigDecimal discount;
    private Integer quantity;
    private String thumbnailUrl;
    private Boolean isReviewed;
}