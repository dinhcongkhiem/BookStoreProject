package com.project.book_store_be.Response;

import com.project.book_store_be.Model.Address;
import com.project.book_store_be.Response.ProductRes.ProductCartResponse;
import com.project.book_store_be.Response.ProductRes.ProductOrderResponse;

import java.util.List;

public class OrderResponse {
    private List<ProductOrderResponse> orderResponseList;
    private Address address;
}
