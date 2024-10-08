package com.project.book_store_be.Request;

import com.project.book_store_be.Enum.CoverType;
import com.project.book_store_be.Enum.ProductStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    private String name;
    private Long publisherId;
    private Integer number_of_pages;
    private Integer year_of_publication;
    private BigDecimal cost;
    private BigDecimal original_price;
    private String size;
    private Integer quantity;
    private ProductStatus status;
    private String translator;
    private CoverType coverType;
    private String manufacturer;
    private String description;
    private List<Long> categoriesId;
    private List<Long> authorsId;
}
