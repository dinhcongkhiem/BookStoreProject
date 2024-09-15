package com.project.book_store_be.Response.ProductRes;

import lombok.*;
import lombok.experimental.SuperBuilder;


@Getter
@Setter
@SuperBuilder
public class ProductResponse extends ProductBaseResponse{
    private String authorName;
    private Integer quantity_sold;
    private String thumbnail_url;
}
