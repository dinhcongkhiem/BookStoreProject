package com.project.book_store_be.Response.OrderRes;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Enum.PaymentType;
import com.project.book_store_be.Model.Address;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
public class OrderDetailResponse {
    private Long orderId;
    private OrderStatus status;
    private String fullname;
    private String phoneNum;
    private Address address;
    private List<OrderItemsDetailResponse> items;
    private PaymentType paymentType;
    private BigDecimal originalSubtotal;
    private BigDecimal totalDiscount;
    private BigDecimal shippingFee;
    private BigDecimal grandTotal ;
}
