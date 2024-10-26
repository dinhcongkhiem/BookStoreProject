package com.project.book_store_be.Response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PaymentResponse {
    private Integer expiredAt;
    private BigDecimal amount;
    private String description;
    private Long orderCode;
    private String status;
    private String QRCodeURL;
}
