package com.project.book_store_be.Interface;

import com.project.book_store_be.Response.FeeResponse;

import java.math.BigDecimal;

public interface GHTKService {
    FeeResponse calculateShippingFee(String province, String district,String ward,String address, int weight, int value, String deliverOption);
}