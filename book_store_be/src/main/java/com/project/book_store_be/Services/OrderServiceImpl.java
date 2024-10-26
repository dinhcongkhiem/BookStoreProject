package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Enum.PaymentType;
import com.project.book_store_be.Interface.OrderService;
import com.project.book_store_be.Interface.PaymentService;
import com.project.book_store_be.Model.*;
import com.project.book_store_be.Repository.OrderDetailRepository;
import com.project.book_store_be.Repository.OrderRepository;
import com.project.book_store_be.Repository.Specification.OrderSpecification;
import com.project.book_store_be.Request.OrderRequest;
import com.project.book_store_be.Request.PaymentRequest;
import com.project.book_store_be.Response.OrderRes.CreateOrderResponse;
import com.project.book_store_be.Response.OrderRes.OrderItemsResponse;
import com.project.book_store_be.Response.OrderRes.OrderResponse;
import com.project.book_store_be.Response.PaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductService productService;
    private final UserService userService;
    private final ImageProductService imageProductService;
    private final PaymentService paymentService;

    @Override
    public OrderResponse getAllOrders() {
        return null;
    }

    @Override
    public Page<?> getOrdersByUser(Integer page, Integer pageSize, OrderStatus status, String keyword) {
        Specification<Order> spec = OrderSpecification.getOrders(userService.getCurrentUser(), status, keyword);
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by(Sort.Direction.ASC, "orderDate"));
        return orderRepository.findAll(spec, pageable).map(this::convertOrderResponse);
    }

    @Override
    public CreateOrderResponse createOrder(OrderRequest request) {
        List<OrderDetail> orderDetailList = new ArrayList<>();
        User u = userService.getCurrentUser();
        BigDecimal[] totalPrice = {BigDecimal.ZERO};

        Order order = Order.builder()
                .paymentType(request.getPaymentType())
                .shippingFee(request.getShippingFee())
                .status(request.getPaymentType() == PaymentType.cash_on_delivery
                        ? OrderStatus.PROCESSING : OrderStatus.AWAITING_PAYMENT)
                .orderDate(LocalDateTime.now())
                .user(u)
                .address(request.getAddress() != null ? request.getAddress() : u.getAddress())
                .build();
        orderRepository.save(order);

        request.getItems().forEach(item -> {
            Product product = productService.findProductById(item.getProductId());
            BigDecimal discountVal = (BigDecimal) productService.getDiscountValue(product).get("discountVal");
            totalPrice[0] = totalPrice[0].add(product.getPrice().subtract(discountVal).multiply(BigDecimal.valueOf(item.getQty())));
            OrderDetail orderDetail = OrderDetail.builder()
                    .product(product)
                    .quantity(item.getQty())
                    .order(order)
                    .discount(discountVal)
                    .build();
            orderDetailRepository.save(orderDetail);
            orderDetailList.add(orderDetail);
        });
        PaymentResponse paymentResponse = null;

        if(order.getPaymentType() == PaymentType.bank_transfer) {
            try {

                String currentTimeString = String.valueOf(new Date().getTime());
                Long time = Long.parseLong(currentTimeString.substring(currentTimeString.length() - 6));
                Long orderCode = Long.parseLong(order.getId() + String.valueOf(time));
                paymentResponse = paymentService.PaymentRequest(PaymentRequest.builder()
                                .orderCode(orderCode)
                                .amount(totalPrice[0].add(order.getShippingFee()))
                                .description("BB-" + currentTimeString.substring(currentTimeString.length() - 4))
                        .build()

                );
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        order.setOrderDetails(orderDetailList);
        orderRepository.save(order);
        return CreateOrderResponse.builder()
                .orderStatus(order.getStatus())
                .paymentType(order.getPaymentType())
                .QRCodeURL(paymentResponse != null ? paymentResponse.getQRCodeURL() : "")
                .build();
    }

    private OrderResponse convertOrderResponse(Order order) {
        List<OrderDetail> orderItems = order.getOrderDetails();

        BigDecimal[] totalPrice = {BigDecimal.ZERO};
        List<OrderItemsResponse> orderItemsRes = orderItems.stream().map(o -> {
            Product product = o.getProduct();
            BigDecimal discount = o.getDiscount() != null ? o.getDiscount() : BigDecimal.ZERO;
            totalPrice[0] = totalPrice[0].add(product.getPrice().subtract(discount).multiply(BigDecimal.valueOf(o.getQuantity())));

            return OrderItemsResponse.builder()
                    .productName(product.getName())
                    .originalPrice(product.getOriginal_price())
                    .quantity(o.getQuantity())
                    .thumbnail_url(imageProductService.getThumbnailProduct(product.getId()))
                    .build();
        }).toList();

        BigDecimal finalPrice = totalPrice[0].add(order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO);

        return OrderResponse.builder()
                .status(order.getStatus())
                .finalPrice(finalPrice)
                .orderResponseList(orderItemsRes)
                .build();
    }
}
