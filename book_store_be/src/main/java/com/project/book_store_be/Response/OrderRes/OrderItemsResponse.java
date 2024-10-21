package com.project.book_store_be.Response.OrderRes;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Builder
@Data
public class OrderItemsResponse {
    private String productName;
    private BigDecimal originalPrice;
    private Integer quantity;
    private String thumbnail_url;
}

