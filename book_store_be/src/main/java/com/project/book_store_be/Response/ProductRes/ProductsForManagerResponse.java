package com.project.book_store_be.Response.ProductRes;

import com.project.book_store_be.Enum.ProductStatus;
import lombok.Builder;
import lombok.Data;


import java.math.BigDecimal;
import java.util.Date;

@Data
@Builder
public class ProductsForManagerResponse {
    private Long id;
    private String name;
    private BigDecimal originalPrice;
    private BigDecimal price;
    private Integer quantity;
    private ProductStatus status;
    private Date createDate;
    private String thumbnail_url;
}
