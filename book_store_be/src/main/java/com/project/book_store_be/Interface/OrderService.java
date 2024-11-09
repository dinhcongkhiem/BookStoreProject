package com.project.book_store_be.Interface;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Model.Order;
import com.project.book_store_be.Request.OrderRequest;
import com.project.book_store_be.Response.OrderRes.CreateOrderResponse;
import com.project.book_store_be.Response.OrderRes.OrderDetailResponse;
import com.project.book_store_be.Response.OrderRes.OrderResponse;
import org.springframework.data.domain.Page;


public interface OrderService {
    OrderResponse getAllOrders();
    Page<?> getOrdersByUser(Integer page, Integer pageSize, OrderStatus status, String keyword);
    CreateOrderResponse createOrder(OrderRequest request);
    OrderStatus checkStatus(Long id);
    OrderDetailResponse getOrderDetailById(Long id);
    OrderResponse updateOrderStatus(Long id, OrderStatus status);

    Order getOrderById(Long id);
}
