package com.project.book_store_be.Response.ProductRes;

import com.project.book_store_be.Enum.CoverType;
import com.project.book_store_be.Model.Category;
import com.project.book_store_be.Model.ImageProduct;
import com.project.book_store_be.Model.Publisher;
import com.project.book_store_be.Response.ImageProductResponse;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Year;
import java.util.Date;
import java.util.List;

@SuperBuilder
@Getter
@Setter
public class ProductDetailResponse extends ProductBaseResponse {
    private Integer year_of_publication;
    private Integer number_of_pages;
    private Integer review_count;
    private Integer quantity;
    private String description;
    private String size;
    private String translatorName;
    private String manufacturer;
    private CoverType coverType;
    private List<ImageProductResponse> images;
    private List<Category> categories;
    private Publisher publisher;
    private List<ProductResponse> related_products;

}
