package com.project.book_store_be.Response.OrderRes;

import lombok.Builder;
import lombok.Data;


import java.math.BigDecimal;

@Data
@Builder
public class OrderItemsDetailResponse {
    private Long productId;
    private String productName;
    private BigDecimal originalPrice;
    private BigDecimal discount;
    private Integer quantity;
    private String thumbnailUrl;
}