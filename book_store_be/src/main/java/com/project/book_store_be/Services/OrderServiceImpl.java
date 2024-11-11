package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.NotificationType;
import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Enum.PaymentType;
import com.project.book_store_be.Interface.AddressService;
import com.project.book_store_be.Interface.OrderService;
import com.project.book_store_be.Interface.PaymentService;
import com.project.book_store_be.Model.*;
import com.project.book_store_be.Repository.OrderDetailRepository;
import com.project.book_store_be.Repository.OrderRepository;
import com.project.book_store_be.Repository.Specification.OrderSpecification;
import com.project.book_store_be.Request.OrderRequest;
import com.project.book_store_be.Request.PaymentRequest;
import com.project.book_store_be.Response.OrderRes.*;
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
import java.util.NoSuchElementException;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductService productService;
    private final UserService userService;
    private final ImageProductService imageProductService;
    private final PaymentService paymentService;
    private final AddressService addressService;
    private final CartService cartService;
    private final NotificationService notificationService;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @Override
    public OrderResponse getAllOrders() {
        return null;
    }

    @Override
    public Page<?> getOrdersByUser(Integer page, Integer pageSize, OrderStatus status, String keyword) {
        Specification<Order> spec = OrderSpecification.getOrders(userService.getCurrentUser(), status, keyword);
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "orderDate"));
        return orderRepository.findAll(spec, pageable).map(this::convertOrderResponse);
    }

    @Override
    public CreateOrderResponse createOrder(OrderRequest request) {
        List<OrderDetail> orderDetailList = new ArrayList<>();
        User u = userService.getCurrentUser();
        BigDecimal[] totalPrice = {BigDecimal.ZERO};
        Address address = request.getAddress() != null ? addressService.createAddress(request.getAddress()) : u.getAddress();
        Order order = Order.builder()
                .paymentType(request.getPaymentType())
                .shippingFee(request.getShippingFee())
                .status(request.getPaymentType() == PaymentType.cash_on_delivery
                        ? OrderStatus.PROCESSING : OrderStatus.AWAITING_PAYMENT)
                .orderDate(LocalDateTime.now())
                .user(u)
                .address(address)
                .buyerName(request.getBuyerName() != null ? request.getBuyerName() : u.getFullName())
                .buyerPhoneNum(request.getBuyerPhoneNum() != null ? request.getBuyerPhoneNum() : u.getPhoneNum())
                .build();
        orderRepository.save(order);

        request.getItems().forEach(item -> {
            Product product = productService.findProductById(item.getProductId());
            BigDecimal discountVal = (BigDecimal) productService.getDiscountValue(product).get("discountVal");
            totalPrice[0] = totalPrice[0].add(product.getPrice().subtract(discountVal).multiply(BigDecimal.valueOf(item.getQty())));
            OrderDetail orderDetail = OrderDetail.builder()
                    .product(product)
                    .quantity(item.getQty())
                    .originalPriceAtPurchase(product.getOriginal_price())
                    .priceAtPurchase(product.getPrice())
                    .order(order)
                    .discount(discountVal)
                    .build();
            orderDetailRepository.save(orderDetail);
            orderDetailList.add(orderDetail);
        });
        PaymentResponse paymentResponse = null;
        Long orderCode = 0L;
        if (order.getPaymentType() == PaymentType.bank_transfer) {
            try {

                String currentTimeString = String.valueOf(new Date().getTime());
                Long time = Long.parseLong(currentTimeString.substring(currentTimeString.length() - 6));
                orderCode = Long.parseLong(order.getId() + String.valueOf(time));
                paymentResponse = paymentService.PaymentRequest(PaymentRequest.builder()
                        .orderCode(orderCode)
                        .amount(totalPrice[0].add(order.getShippingFee()))
                        .description("BB-" + currentTimeString.substring(currentTimeString.length() - 4))
                        .build()

                );

                scheduler.schedule(() -> {
                    Order currentOrder = orderRepository.findById(order.getId()).orElseThrow(
                            () -> new NoSuchElementException("Not found order id : " + order.getId())
                    );
                    String title = "Hủy đơn hàng vì quá thời hạn thanh toán.";
                    String message = String.format("Đơn hàng bị hủy do quá thời hạn thanh toán #%s đã bị hủy vì chưa được thanh toán!", currentOrder.getId());
                    notificationService.sendNotification(currentOrder.getUser(), title, message, NotificationType.ORDER);
                    if (currentOrder.getStatus().equals(OrderStatus.AWAITING_PAYMENT)) {
                        currentOrder.setStatus(OrderStatus.CANCELED);
                        orderRepository.save(currentOrder);
                    }
                }, 3, TimeUnit.HOURS);

            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        } else {
            String message = String.format("Người dùng %s đã đặt đơn hàng mới với giá trị %s", order.getUser().getFullName(), totalPrice[0].add(order.getShippingFee()));
            notificationService.sendAdminNotification("Đơn hàng mới", message, NotificationType.ORDER);
        }

        order.setOrderDetails(orderDetailList);
        order.setTotalPrice(totalPrice[0]);
        orderRepository.save(order);
        request.getItems().forEach(item -> {
            Long cartId = item.getCartId();
            if (cartId != null) {
                cartService.removeCartItem(cartId);
            }
        });
        return CreateOrderResponse.builder()
                .finalPrice(totalPrice[0].add(order.getShippingFee()))
                .orderCode(orderCode)
                .orderStatus(order.getStatus())
                .paymentType(order.getPaymentType())
                .QRCodeURL(paymentResponse != null ? paymentResponse.getQRCodeURL() : "")
                .build();
    }

    @Override
    public OrderStatus checkStatus(Long orderCode) {
        String orderCodeString = orderCode.toString();
        return orderRepository
                .findById(Long.valueOf(orderCodeString.substring(0, orderCodeString.length() - 6)))
                .orElseThrow(() -> new NoSuchElementException("Khong co order voi id la: " + orderCode))
                .getStatus();
    }

    @Override
    public OrderDetailResponse getOrderDetailById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Order not found with ID: " + id));

        final BigDecimal[] grandTotal = {BigDecimal.ZERO};
        final BigDecimal[] originalSubtotal = {BigDecimal.ZERO};
        final BigDecimal[] totalDiscount = {BigDecimal.ZERO};

        List<OrderItemsDetailResponse> itemDetails = order.getOrderDetails().stream()
                .map(detail -> {
                    Product product = detail.getProduct();
                    BigDecimal discount = detail.getDiscount() != null ? detail.getDiscount() : BigDecimal.ZERO;
                    BigDecimal quantity = BigDecimal.valueOf(detail.getQuantity());

                    BigDecimal originalPriceAtPurchase = detail.getOriginalPriceAtPurchase();
                    BigDecimal priceAtPurchase = detail.getPriceAtPurchase();
                    originalSubtotal[0] = originalSubtotal[0].add(originalPriceAtPurchase.multiply(quantity));
                    grandTotal[0] = grandTotal[0].add(priceAtPurchase.subtract(discount).multiply(quantity));
                    totalDiscount[0] = totalDiscount[0].add(discount.multiply(quantity));

                    return OrderItemsDetailResponse.builder()
                            .productName(product.getName())
                            .originalPrice(originalPriceAtPurchase)
                            .discount(discount)
                            .quantity(detail.getQuantity())
                            .thumbnailUrl(imageProductService.getThumbnailProduct(product.getId()))
                            .build();
                })
                .toList();

        grandTotal[0] = grandTotal[0].add(order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO);
        return OrderDetailResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .fullname(order.getBuyerName())
                .phoneNum(order.getBuyerPhoneNum())
                .address(order.getAddress())
                .paymentType(order.getPaymentType())
                .originalSubtotal(originalSubtotal[0])
                .totalDiscount(totalDiscount[0])
                .shippingFee(order.getShippingFee())
                .grandTotal(grandTotal[0])
                .items(itemDetails)
                .orderDate(order.getOrderDate())
                .build();
    }

    private OrderResponse convertOrderResponse(Order order) {
        List<OrderDetail> orderItems = order.getOrderDetails();

        BigDecimal totalPrice = order.getTotalPrice();
        List<OrderItemsResponse> orderItemsRes = orderItems.stream().map(o -> {
            Product product = o.getProduct();
            return OrderItemsResponse.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .originalPrice(o.getOriginalPriceAtPurchase())
                    .quantity(o.getQuantity())
                    .thumbnail_url(imageProductService.getThumbnailProduct(product.getId()))
                    .build();
        }).toList();

        BigDecimal finalPrice = totalPrice.add(order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO);

        return OrderResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .finalPrice(finalPrice)
                .items(orderItemsRes)
                .build();
    }

    @Override
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));

        if (order.getStatus().canTransitionTo(status)) {
            order.setStatus(status);
            orderRepository.save(order);
        } else {
            throw new IllegalArgumentException("Invalid status transition from " + order.getStatus() + " to " + status);
        }

        return OrderResponse.builder()
                .status(order.getStatus())
                .build();
    }
    public Order findById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }
}
