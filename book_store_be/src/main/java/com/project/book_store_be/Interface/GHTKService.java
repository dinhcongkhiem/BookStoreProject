package com.project.book_store_be.Interface;

import com.project.book_store_be.Response.FeeResponse;

import java.math.BigDecimal;

public interface GHTKService {
    BigDecimal getShipmentTotalFee(String province, String district, String ward, String street, String address,
                                   int weight, Integer value, String deliverOption);

}
