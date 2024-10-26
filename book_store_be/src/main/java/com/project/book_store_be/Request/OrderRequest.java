package com.project.book_store_be.Request;

import com.project.book_store_be.Enum.PaymentType;
import com.project.book_store_be.Model.Address;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class OrderRequest {
    private Address address;
    private BigDecimal shippingFee;
    private PaymentType paymentType;
    private List<OrderDetailRequest> items;

    @Data
    @Builder
    public static class OrderDetailRequest {
        private Long productId;
        private Integer qty;
    }
}

