package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.NotificationType;
import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Enum.PaymentType;
import com.project.book_store_be.Enum.VoucherType;
import com.project.book_store_be.Interface.AddressService;
import com.project.book_store_be.Interface.OrderService;
import com.project.book_store_be.Interface.PaymentService;
import com.project.book_store_be.Interface.VoucherService;
import com.project.book_store_be.Model.*;
import com.project.book_store_be.Repository.OrderDetailRepository;
import com.project.book_store_be.Repository.OrderRepository;
import com.project.book_store_be.Repository.Specification.OrderSpecification;
import com.project.book_store_be.Repository.VoucherRepository;
import com.project.book_store_be.Request.OrderRequest;
import com.project.book_store_be.Request.PaymentRequest;
import com.project.book_store_be.Response.OrderRes.*;
import com.project.book_store_be.Response.PaymentResponse;
import com.project.book_store_be.Response.VoucherRes.VoucherInOrderResponse;
import jakarta.persistence.Tuple;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
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
    private final VoucherRepository voucherRepository;
    private final VoucherService voucherService;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);


    @Override
    public Page<?> getOrdersByUser(Integer page, Integer pageSize, OrderStatus status, String keyword) {
        Specification<Order> spec = OrderSpecification.getOrders(userService.getCurrentUser(), status, keyword);
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "orderDate"));
        return orderRepository.findAll(spec, pageable).map(this::convertOrderResponse);
    }

    @Override
    public OrderPageResponse findAllOrders(Integer page, Integer pageSize, OrderStatus status, String keyword) {
        Specification<Order> spec = OrderSpecification.getOrders(null, status, keyword);
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "orderDate"));
        Page<GetAllOrderResponse> ordersPage = orderRepository.findAll(spec, pageable).map(this::convertToResMng);
        Tuple count = orderRepository.countOrder();
        OrderStatusResponse orderStatusCountDTO = new OrderStatusResponse(
                count.get("awaiting_payment_count", Long.class),
                count.get("processing_count", Long.class),
                count.get("shipping_count", Long.class),
                count.get("canceled_count", Long.class),
                count.get("completed_count", Long.class),
                count.get("all_count", Long.class)
        );
        return new OrderPageResponse(ordersPage, orderStatusCountDTO);
    }

    @Override
    @Transactional
    public CreateOrderResponse createOrder(OrderRequest request) {
        List<OrderDetail> orderDetailList = new ArrayList<>();
        User u = userService.getCurrentUser();
        BigDecimal[] totalPrice = {BigDecimal.ZERO};
        Address address = request.getAddress() != null ? addressService.createAddress(request.getAddress()) : u.getAddress();
        BigDecimal[] voucherDiscount = {BigDecimal.ZERO};
        Voucher voucher = null;
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
            BigDecimal price = product.getOriginal_price().subtract(discountVal);
            totalPrice[0] = totalPrice[0].add(price.multiply(BigDecimal.valueOf(item.getQty())));

            OrderDetail orderDetail = OrderDetail.builder()
                    .product(product)
                    .quantity(item.getQty())
                    .originalPriceAtPurchase(product.getOriginal_price())
                    .priceAtPurchase(price)
                    .order(order)
                    .discount(discountVal)
                    .build();
            orderDetailRepository.save(orderDetail);
            productService.updateQuantity(product, product.getQuantity() - item.getQty());
            orderDetailList.add(orderDetail);
        });

        if (request.getVoucherCode() != null) {
            Optional<Voucher> optionalVoucher = voucherRepository.findByCode(request.getVoucherCode());
            if (optionalVoucher.isEmpty()) {
                throw new IllegalArgumentException("Voucher không hợp lệ.");
            }
            voucher = optionalVoucher.get();
            if (voucher.getStartDate().isAfter(LocalDateTime.now()) || voucher.getEndDate().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Voucher đã hết hạn.");
            }
            if (voucher.getCondition() != null && totalPrice[0].compareTo(voucher.getCondition()) < 0) {
                throw new IllegalArgumentException("Không đủ điều kiện để áp dụng voucher.");
            }

            voucherDiscount[0] = this.calculateVoucherDiscount(voucher, totalPrice[0], order.getShippingFee());
            order.setVoucher(voucher);
        }
        BigDecimal finalPrice = totalPrice[0].add(order.getShippingFee()).subtract(voucherDiscount[0]);

        PaymentResponse paymentResponse = null;
        Long orderCode = 0L;
        if (order.getPaymentType() == PaymentType.bank_transfer) {
            try {
                String currentTimeString = String.valueOf(new Date().getTime());
                Long time = Long.parseLong(currentTimeString.substring(currentTimeString.length() - 6));
                orderCode = Long.parseLong(order.getId() + String.valueOf(time));
                paymentResponse = paymentService.PaymentRequest(PaymentRequest.builder()
                        .orderCode(orderCode)
                        .amount(finalPrice)
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
            String message = String.format("Người dùng %s đã đặt đơn hàng mới với giá trị %s", order.getUser().getFullName(), finalPrice);
            notificationService.sendAdminNotification("Đơn hàng mới", message, NotificationType.ORDER);
        }

        order.setOrderDetails(orderDetailList);
        order.setTotalPrice(totalPrice[0]);
        orderRepository.save(order);

        this.voucherService.updateQuantity(voucher.getId(), 1);
        request.getItems().forEach(item -> {
            Long cartId = item.getCartId();
            if (cartId != null) {
                cartService.removeCartItem(cartId);
            }
        });
        return CreateOrderResponse.builder()
                .finalPrice(finalPrice)
                .orderCode(orderCode)
                .orderStatus(order.getStatus())
                .paymentType(order.getPaymentType())
                .voucherId(voucher != null ? voucher.getId() : null)
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
        final BigDecimal[] discountWithVoucher = {BigDecimal.ZERO};

        List<OrderItemsDetailResponse> itemDetails = order.getOrderDetails().stream()
                .map(detail -> {
                    Product product = detail.getProduct();
                    BigDecimal discount = detail.getDiscount() != null ? detail.getDiscount() : BigDecimal.ZERO;
                    BigDecimal quantity = BigDecimal.valueOf(detail.getQuantity());

                    BigDecimal originalPriceAtPurchase = detail.getOriginalPriceAtPurchase();
                    BigDecimal priceAtPurchase = detail.getPriceAtPurchase();
                    originalSubtotal[0] = originalSubtotal[0].add(originalPriceAtPurchase.multiply(quantity));
                    grandTotal[0] = grandTotal[0].add(priceAtPurchase.multiply(quantity));
                    totalDiscount[0] = totalDiscount[0].add(discount.multiply(quantity));

                    return OrderItemsDetailResponse.builder()
                            .productId(product.getId())
                            .productName(product.getName())
                            .originalPrice(originalPriceAtPurchase)
                            .discount(discount)
                            .quantity(detail.getQuantity())
                            .thumbnailUrl(imageProductService.getThumbnailProduct(product.getId()))
                            .build();
                })
                .toList();


        grandTotal[0] = grandTotal[0].add(order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO);
        Voucher voucher = order.getVoucher();
        if (voucher != null) {
            if (voucher.getType().equals(VoucherType.PERCENT)) {
                discountWithVoucher[0] = grandTotal[0].multiply(voucher.getValue()).divide(BigDecimal.valueOf(100));
            } else {
                discountWithVoucher[0] = voucher.getValue();
            }
        }
        grandTotal[0] = grandTotal[0].subtract(discountWithVoucher[0]);
        return OrderDetailResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .fullname(order.getBuyerName())
                .phoneNum(order.getBuyerPhoneNum())
                .address(order.getAddress())
                .paymentType(order.getPaymentType())
                .originalSubtotal(originalSubtotal[0])
                .totalDiscount(totalDiscount[0])
                .voucher(voucher != null ? VoucherInOrderResponse.builder()
                        .code(voucher.getCode())
                        .value(voucher.getValue())
                        .build() : null)
                .shippingFee(order.getShippingFee())
                .grandTotal(grandTotal[0])
                .items(itemDetails)
                .orderDate(order.getOrderDate())
                .build();
    }

    private GetAllOrderResponse convertToResMng(Order order) {
        return GetAllOrderResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .buyerName(order.getBuyerName())
                .finalPrice(order.getTotalPrice().add(order.getShippingFee()))
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
        Voucher voucher = order.getVoucher();
        BigDecimal shippingFee = order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO;

        BigDecimal voucherDiscount = this.calculateVoucherDiscount(voucher, totalPrice, shippingFee);
        BigDecimal finalPrice = totalPrice.add(shippingFee).subtract(voucherDiscount);

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

    private BigDecimal calculateVoucherDiscount(Voucher voucher, BigDecimal totalPrice, BigDecimal shippingFee) {
        BigDecimal voucherDiscount = BigDecimal.ZERO;
        if(voucher == null) {
            return voucherDiscount;
        }
        if (voucher.getType() == VoucherType.PERCENT) {
            voucherDiscount = voucher.getValue().multiply(totalPrice.add(shippingFee)).divide(BigDecimal.valueOf(100));
        } else if (voucher.getType() == VoucherType.CASH) {
            voucherDiscount = voucher.getValue();
        }
        return voucherDiscount;
    }
}
