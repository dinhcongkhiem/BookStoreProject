package com.project.book_store_be.Response;

import com.project.book_store_be.Model.Author;
import com.project.book_store_be.Model.Category;
import com.project.book_store_be.Model.Publisher;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Builder
@Data
public class ProductResponse {
    private Long id;
    private String name;
    private Publisher publisher;
    private Date publication_date;
    private Integer number_of_pages;
    private BigDecimal original_price;
    private Integer quantity;
    private Category category;
    private Author author;
    private BigDecimal discount;
    private Integer discount_rate;
    private BigDecimal price;
    private Integer quantity_sold;
    private Float rating_average;
    private Integer review_count;
}
