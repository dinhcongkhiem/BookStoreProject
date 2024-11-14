package com.project.book_store_be.Interface;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Request.OrderRequest;
import com.project.book_store_be.Response.OrderRes.*;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;


public interface OrderService {
    Page<?> getOrdersByUser(Integer page, Integer pageSize, OrderStatus status, String keyword);

    //    Page<?> findAllOrders(Integer page, Integer pageSize, OrderStatus status, String keyword);
    OrderPageResponse findAllOrders(Integer page, Integer pageSize, OrderStatus status, String keyword);

    CreateOrderResponse createOrder(OrderRequest request);

    OrderStatus checkStatus(Long id);

    OrderDetailResponse getOrderDetailById(Long id);

    OrderResponse updateOrderStatus(Long id, OrderStatus status);

}
