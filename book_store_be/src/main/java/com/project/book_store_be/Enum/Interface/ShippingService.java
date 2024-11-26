package com.project.book_store_be.Enum.Interface;

import com.project.book_store_be.Response.FeeResponse;

import java.math.BigDecimal;

public interface ShippingService {
     FeeResponse calculateShippingFee(int weight, BigDecimal value);
     FeeResponse calculateShippingFee(String province, String district,String ward,String address, int weight, BigDecimal value);

}
