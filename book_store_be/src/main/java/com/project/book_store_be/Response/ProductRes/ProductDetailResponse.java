package com.project.book_store_be.Response.ProductRes;

import com.project.book_store_be.Enum.ProductStatus;
import com.project.book_store_be.Model.Author;
import com.project.book_store_be.Model.Category;
import com.project.book_store_be.Model.ImageProduct;
import com.project.book_store_be.Model.Publisher;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.Date;
import java.util.List;

@SuperBuilder
@Getter
@Setter
public class ProductDetailResponse extends ProductBaseResponse {
    private Date publication_date;
    private Integer number_of_pages;
    private Integer review_count;
    private Integer quantity;
    private String description;
    private List<ImageProduct> images;
    private Category category;
    private Author author;
    private Publisher publisher;

}
