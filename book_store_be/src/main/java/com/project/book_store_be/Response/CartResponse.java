package com.project.book_store_be.Response;

import com.project.book_store_be.Response.ProductRes.ProductCartResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CartResponse {
    private Long id;
    private List<ProductCartResponse> products;
    private BigDecimal totalPrice;
}
