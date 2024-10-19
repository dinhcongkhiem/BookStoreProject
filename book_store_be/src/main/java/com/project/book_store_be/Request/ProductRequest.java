package com.project.book_store_be.Request;

import com.project.book_store_be.Enum.CoverType;
import com.project.book_store_be.Enum.ProductStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class ProductRequest {
    private String name;
    private Long publisherId;
    private Integer numberOfPages;
    private Integer yearOfPublication;
    private BigDecimal cost;
    private BigDecimal originalPrice;
    private Double height;
    private Double length;
    private Double width;
    private Double weight;
    private Integer quantity;
    private ProductStatus status;
    private String translator;
    private CoverType coverType;
    private String manufacturer;
    private String description;
    private List<Long> categoriesId;
    private List<Long> authorsId;
}
