package com.project.book_store_be.Response.OrderRes;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Enum.PaymentType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Builder
@Data
public class CreateOrderResponse {
    private BigDecimal finalPrice;
    private Long orderCode;
    private OrderStatus orderStatus;
    private PaymentType paymentType;
    private String QRCodeURL;
    private Long voucherId;

}
