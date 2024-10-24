package com.project.book_store_be.Interface;

import com.project.book_store_be.Response.FeeResponse;

public interface ShippingService {
     FeeResponse calculateShippingFee(int weight, int value, String deliverOption);
}