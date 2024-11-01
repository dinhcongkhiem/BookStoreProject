package com.project.book_store_be.Interface;

import com.project.book_store_be.Response.FeeResponse;
import com.project.book_store_be.Response.GHTKRequest;
import com.project.book_store_be.Response.GHTKResponse;
import com.project.book_store_be.Response.GHTKStatusResponse;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;

public interface ShippingService {
     FeeResponse calculateShippingFee(int weight, BigDecimal value);
     FeeResponse calculateShippingFee(String province, String district,String ward,String address, int weight, BigDecimal value);

     GHTKResponse createOrder(GHTKRequest ghtkRequest);

     GHTKStatusResponse getTrackingStatus(String trackingOrder);

     ResponseEntity<InputStreamResource> getLabel(String trackingOrder, String original, String paperSize);

     ResponseEntity<String> cancelOrder(String trackingOrder, boolean usePartnerId);



}
