package com.project.book_store_be.Response.OrderRes;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Model.Address;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Builder
@Data
public class OrderResponse {
    private List<OrderItemsResponse> items;
    private OrderStatus status;
    private BigDecimal finalPrice;
    private Long orderId;
}
