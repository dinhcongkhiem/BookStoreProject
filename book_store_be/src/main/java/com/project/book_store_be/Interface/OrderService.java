package com.project.book_store_be.Interface;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Enum.PaymentType;
import com.project.book_store_be.Request.OrderRequest;
import com.project.book_store_be.Request.UpdateOrderRequest;
import com.project.book_store_be.Response.OrderRes.*;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;


public interface OrderService {
    Page<?> getOrdersByUser(Integer page, Integer pageSize, OrderStatus status, String keyword);
    
    OrderPageResponse findAllOrders(Integer page, Integer pageSize, OrderStatus status, String keyword);

    CreateOrderResponse createOrder(OrderRequest request);

    OrderStatus checkStatus(Long id);

    OrderDetailResponse getOrderDetailById(Long id);

    CreateOrderResponse rePaymentOrder(Long orderId, PaymentType paymentType);
    Map<?, ?> createOrderCounterSales();

    @Transactional
    void updateQuantity(Integer quantity, Long orderDetailId);

    @Transactional
    void deleteOrderDetail(Long orderDetailId);

    void createOrderDetail(List<OrderRequest.OrderDetailRequest> request, Long orderId);

    void updateOrderStatus(Long id, UpdateOrderRequest request);

    void cancelOrderInCounter(Long orderId);
}
