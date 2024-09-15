package com.project.book_store_be.Response.ProductRes;


import com.project.book_store_be.Enum.ProductStatus;
import lombok.Data;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@SuperBuilder
public class ProductBaseResponse {
    private Long id;
    private String name;
    private BigDecimal original_price;
    private ProductStatus status;
    private BigDecimal discount;
    private Integer discount_rate;
    private BigDecimal price;
    private Integer quantity_sold;
    private Float rating_average;

}
