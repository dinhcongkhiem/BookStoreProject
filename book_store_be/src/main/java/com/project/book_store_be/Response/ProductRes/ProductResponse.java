package com.project.book_store_be.Response.ProductRes;

import com.project.book_store_be.Model.Author;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;


@Getter
@Setter
@SuperBuilder
public class ProductResponse extends ProductBaseResponse{
    private Integer quantity_sold;
    private String thumbnail_url;
}
