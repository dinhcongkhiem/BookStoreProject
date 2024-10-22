package com.project.book_store_be.Interface;

import com.project.book_store_be.Response.FeeResponse;

public interface GHTKService {
    FeeResponse calculateShippingFee(String pickProvince, String pickDistrict, String province, String district, int weight, int value, String deliverOption);

}
