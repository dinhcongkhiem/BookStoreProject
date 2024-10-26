package com.project.book_store_be.Response.OrderRes;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Enum.PaymentType;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class CreateOrderResponse {
    private OrderStatus orderStatus;
    private PaymentType paymentType;
    private String QRCodeURL;

}
