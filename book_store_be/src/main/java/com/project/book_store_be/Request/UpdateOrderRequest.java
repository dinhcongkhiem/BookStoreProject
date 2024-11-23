package com.project.book_store_be.Request;

import com.project.book_store_be.Enum.PaymentType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class UpdateOrderRequest {
    private Long userId;
    private String status;
    private PaymentType paymentType;
    private BigDecimal amountPaid;

}
