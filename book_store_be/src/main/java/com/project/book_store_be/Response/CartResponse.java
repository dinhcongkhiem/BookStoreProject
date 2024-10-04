package com.project.book_store_be.Response;

import com.project.book_store_be.Response.ProductRes.ProductCartResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CartResponse {
    private List<ProductCartResponse> cart;
    private Integer totalPages;
    private Integer currentPage;
    private Long totalItems;
}
