package com.project.book_store_be.Response.OrderRes;

import com.project.book_store_be.Enum.OrderStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Getter
@Setter
@Builder
public class GetAllOrderResponse {
    private Long orderId;
    private OrderStatus status;
    private String buyerName;
    private BigDecimal finalPrice;
    private LocalDateTime orderDate;

}
