package com.project.book_store_be.Services;

import java.util.stream.Collectors;

import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.project.book_store_be.Enum.*;
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
import com.project.book_store_be.Request.UpdateOrderRequest;
import com.project.book_store_be.Response.OrderRes.*;
import com.project.book_store_be.Response.PaymentResponse;
import com.project.book_store_be.Response.VoucherRes.VoucherInOrderResponse;
import jakarta.persistence.Tuple;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
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
    private final ReviewService reviewService;
    private final SimpMessagingTemplate messagingTemplate;
    private final SendMailService sendMailService;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);


    @Override
    public Page<?> getOrdersByUser(Integer page, Integer pageSize, OrderStatus status, String keyword) {
        Specification<Order> spec = OrderSpecification.getOrders(userService.getCurrentUser(), status, null, null, keyword);
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by(Sort.Direction.DESC, "orderDate"));
        return orderRepository.findAll(spec, pageable).map(this::convertOrderResponse);
    }

    @Override
    public OrderPageResponse findAllOrders(Integer page, Integer pageSize, OrderStatus status, LocalDateTime start, LocalDateTime end, String keyword) {
        Specification<Order> spec = OrderSpecification.getOrders(null, status, start, end, keyword);
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
    public Map<?, ?> createOrderCounterSales() {
        Order order = Order.builder()
                .type(OrderType.IN_STORE)
                .status(OrderStatus.PENDING)
                .shippingFee(BigDecimal.ZERO)
                .orderDate(LocalDateTime.now())
                .totalPrice(BigDecimal.ZERO)
                .build();
        orderRepository.save(order);
        return Map.of("orderId", order.getId(), "orderDate", order.getOrderDate());
    }

    @Transactional
    public void createOrderDetailByBarcode(String productCode, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found with ID: " + orderId));
        Product product = productService.findProductByCode(productCode);
        BigDecimal[] totalPrice = {order.getTotalPrice()};
        List<OrderDetail> orderDetailList = order.getOrderDetails();

        OrderDetail orderDetailContains = orderDetailRepository.findByOrderIdAndProductId(orderId, product.getId()).orElse(null);

        if (orderDetailContains != null) {
            totalPrice[0] = totalPrice[0].add(orderDetailContains.getPriceAtPurchase());
            orderDetailContains.setQuantity(orderDetailContains.getQuantity() + 1);
            orderDetailRepository.save(orderDetailContains);
        } else {
            BigDecimal discountVal = (BigDecimal) productService.getDiscountValue(product).get("discountVal");
            BigDecimal price = product.getOriginal_price().subtract(discountVal);
            totalPrice[0] = totalPrice[0].add(price);
            OrderDetail orderDetail = OrderDetail.builder()
                    .product(product)
                    .quantity(1)
                    .originalPriceAtPurchase(product.getOriginal_price())
                    .priceAtPurchase(price)
                    .order(order)
                    .discount(discountVal)
                    .build();
            orderDetailList.add(orderDetail);
            orderDetailRepository.save(orderDetail);
        }
        order.setOrderDetails(orderDetailList);
        order.setTotalPrice(totalPrice[0]);
        orderRepository.save(order);

        log.info("Successfully read barcode: " + productCode);
        messagingTemplate.convertAndSend("/stream/barcode", true);
    }

    @Transactional
    @Override
    public void updateQuantity(Integer quantity, Long orderDetailId) {
        OrderDetail orderDetail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new NoSuchElementException("Order detail not found with ID: " + orderDetailId));
        if (quantity < 1) {
            throw new IllegalArgumentException("Số lượng không hợp lệ. Phải lớn hơn hoặc bằng 1.");
        }
        if (quantity > orderDetail.getProduct().getQuantity()) {
            throw new IllegalArgumentException("Số lượng không hợp lệ. Phải nhỏ hơn hoặc bằng số lượng có sẵn.");
        }
        Order order = orderDetail.getOrder();
        order.setTotalPrice(order.getTotalPrice().subtract(orderDetail.getPriceAtPurchase().multiply(BigDecimal.valueOf(orderDetail.getQuantity()))));
        orderDetail.setQuantity(quantity);
        order.setTotalPrice(order.getTotalPrice().add(orderDetail.getPriceAtPurchase().multiply(BigDecimal.valueOf(quantity))));
        orderDetailRepository.save(orderDetail);
    }

    @Transactional
    @Override
    public void deleteOrderDetail(Long orderDetailId) {
        OrderDetail orderDetail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new NoSuchElementException("Order detail not found with ID: " + orderDetailId));
        orderDetailRepository.delete(orderDetail);
    }

    @Transactional
    @Override
    public void createOrderDetail(List<OrderRequest.OrderDetailRequest> request, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found with ID: " + orderId));
        BigDecimal[] totalPrice = {order.getTotalPrice()};
        List<OrderDetail> orderDetailList = order.getOrderDetails();

        request.forEach(item -> {
            Product product = productService.findProductById(item.getProductId());
            OrderDetail orderDetailContains = orderDetailRepository.findByOrderIdAndProductId(orderId, item.getProductId()).orElse(null);
            if (orderDetailContains != null) {
                orderDetailContains.setQuantity(orderDetailContains.getQuantity() + item.getQty());
                orderDetailRepository.save(orderDetailContains);
                return;
            } else {
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
                orderDetailList.add(orderDetail);
            }
        });
        order.setTotalPrice(totalPrice[0]);
        orderRepository.save(order);
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
                .type(OrderType.ONLINE)
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

        if (order.getOrderDetails() == null) {
            order.setOrderDetails(new ArrayList<>());
        }
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
        totalPrice[0] = totalPrice[0].add(order.getShippingFee());
        order.setOrderDetails(orderDetailList);
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
        BigDecimal finalPrice = totalPrice[0].subtract(voucherDiscount[0]);
        PaymentResponse paymentResponse = null;
        order.setTotalPrice(totalPrice[0]);
        if (order.getPaymentType() == PaymentType.bank_transfer) {
            paymentResponse = this.handlePaymentRequest(order, finalPrice);
        } else {
            String message = String.format("Người dùng %s đã đặt đơn hàng mới với giá trị %s", order.getUser().getFullName(), this.formatPrice(finalPrice));
            notificationService.sendAdminNotification("Đơn hàng mới", message, NotificationType.ORDER, "/admin/orderMng/" + order.getId());
            List<User> adminUsers = userService.getAdminUser();
            Map<String, Object> emailVariables = prepareEmailVariables(order);
            emailVariables.put("finalPrice", finalPrice);
            for (User admin : adminUsers) {
                sendMailService.sendEmail(admin,
                        "Thông báo: Đơn hàng mới từ " + order.getUser().getFullName(),
                        "orderUserSuccessTemplate", emailVariables);
            }
        }

        orderRepository.save(order);
        //subtract qty voucher
        if (voucher != null) {
            this.voucherService.updateQuantity(voucher.getId(), 1);
            voucher.setUsers(
                    voucher.getUsers().stream()
                            .filter(user -> !Objects.equals(user.getId(), u.getId()))
                            .collect(Collectors.toList())
            );
            voucherRepository.save(voucher);
        }
        //subtract qty cart
        request.getItems().forEach(item -> {
            Long cartId = item.getCartId();
            if (cartId != null) {
                cartService.removeCartItem(cartId);
            }
        });
        return CreateOrderResponse.builder()
                .finalPrice(finalPrice)
                .orderCode(paymentResponse != null ? paymentResponse.getOrderCode() : null)
                .orderStatus(order.getStatus())
                .paymentType(order.getPaymentType())
                .voucherId(voucher != null ? voucher.getId() : null)
                .QRCodeURL(paymentResponse != null ? paymentResponse.getQRCodeURL() : "")
                .build();
    }

    @Transactional
    @Override
    public CreateOrderResponse rePaymentOrder(Long orderId, PaymentType paymentType) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NoSuchElementException("Order not found"));
        BigDecimal totalPrice = order.getTotalPrice();
        BigDecimal voucherDiscount = this.calculateVoucherDiscount(order.getVoucher(), totalPrice, order.getShippingFee());

        BigDecimal finalPrice = totalPrice.add(order.getShippingFee()).subtract(voucherDiscount);

        PaymentResponse paymentResponse = null;
        if (paymentType == PaymentType.bank_transfer) {
            order.setStatus(OrderStatus.AWAITING_PAYMENT);
            paymentResponse = this.handlePaymentRequest(order, finalPrice);
        } else {
            order.setStatus(OrderStatus.PROCESSING);
            String message = String.format("Người dùng %s đã đặt đơn hàng mới với giá trị %s", order.getUser().getFullName(), this.formatPrice(finalPrice));
            notificationService.sendAdminNotification("Đơn hàng", message, NotificationType.ORDER, "/admin/orderMng/" + order.getId());
            List<User> adminUsers = userService.getAdminUser();
            Map<String, Object> emailVariables = prepareEmailVariables(order);
            emailVariables.put("finalPrice", finalPrice);
            for (User admin : adminUsers) {
                sendMailService.sendEmail(admin,
                        "Thông báo: Đơn hàng mới từ " + order.getUser().getFullName(),
                        "orderUserSuccessTemplate", emailVariables);
            }
        }

        order.setPaymentType(paymentType);
        orderRepository.save(order);

        return CreateOrderResponse.builder()
                .finalPrice(finalPrice)
                .orderCode(paymentResponse != null ? paymentResponse.getOrderCode() : null)
                .orderStatus(order.getStatus())
                .paymentType(order.getPaymentType())
                .voucherId(order.getVoucher() != null ? order.getVoucher().getId() : null)
                .QRCodeURL(paymentResponse != null ? paymentResponse.getQRCodeURL() : "")
                .build();
    }

    private PaymentResponse handlePaymentRequest(Order order, BigDecimal finalPrice) {
        try {
            String currentTimeString = String.valueOf(new Date().getTime());
            String time = currentTimeString.substring(currentTimeString.length() - 6);
            Long orderCode = Long.parseLong(String.valueOf(order.getId()) + time);
            PaymentResponse paymentResponse = paymentService.PaymentRequest(PaymentRequest.builder()
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
                notificationService.sendNotification(currentOrder.getUser(), title, message, NotificationType.ORDER, "/order/detail/" + currentOrder.getId());
                Map<String, Object> emailVariables = prepareEmailVariables(order);
                sendMailService.sendEmail(order.getUser(), "Thông báo: Đơn hàng bị hủy", "orderCancelTemplate", emailVariables);
                if (currentOrder.getStatus().equals(OrderStatus.AWAITING_PAYMENT)) {
                    currentOrder.setStatus(OrderStatus.CANCELED);
                    orderRepository.save(currentOrder);
                }
            }, 3, TimeUnit.HOURS);
            return paymentResponse;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
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

        Map<Long, Boolean> mapCheckReviewed = reviewService.checkUserReviewedProducts(userService.getCurrentUser().getId(),
                order.getOrderDetails().stream().map(detail -> detail.getProduct().getId()).toList());

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
                            .id(detail.getId())
                            .productId(product.getId())
                            .productName(product.getName())
                            .productQuantity(product.getQuantity())
                            .originalPrice(originalPriceAtPurchase)
                            .discount(discount)
                            .quantity(detail.getQuantity())
                            .thumbnailUrl(imageProductService.getThumbnailProduct(product.getId()))
                            .isReviewed(mapCheckReviewed.get(product.getId()))
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
                .type(order.getType())
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
                        .value(discountWithVoucher[0])
                        .build() : null)
                .amountPaid(order.getAmountPaid())
                .shippingFee(order.getShippingFee())
                .grandTotal(grandTotal[0])
                .items(itemDetails)
                .orderDate(order.getOrderDate())
                .build();
    }

    private GetAllOrderResponse convertToResMng(Order order) {
        return GetAllOrderResponse.builder()
                .type(order.getType())
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
                .type(order.getType())
                .orderId(order.getId())
                .status(order.getStatus())
                .finalPrice(finalPrice)
                .items(orderItemsRes)
                .build();
    }

    private String convertStatus(OrderStatus status) {
        return switch (status) {
            case PENDING -> "Chờ xác nhận";
            case AWAITING_PAYMENT -> "Chờ thanh toán";
            case PROCESSING -> "Đang xử lý";
            case SHIPPING -> "được giao cho bên vận chuyển bởi BookBazaar";
            case CANCELED -> "bị hủy";
            case COMPLETED -> "hoàn thành";
            default -> "Không xác định";
        };
    }

    @Override
    public void updateOrderStatus(Long id, OrderStatus orderStatus) {
        User currentUser = userService.getCurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));

        if (!order.getStatus().canTransitionTo(orderStatus)) {
            throw new IllegalArgumentException("Invalid status transition from " + order.getStatus() + " to " + orderStatus);
        }
        if (currentUser.getRole() == Role.ADMIN && order.getType() == OrderType.ONLINE) {
            if (order.getUser() != null) {
                this.notificationService.sendNotification(order.getUser(), "Cập nhật đơn hàng",
                        "Đơn hàng " + order.getId() + " của bạn đã  " + this.convertStatus(orderStatus),
                        NotificationType.ORDER, "/order/detail/" + order.getId());
                Map<String, Object> emailVariables = prepareEmailVariables(order);

                if (orderStatus == OrderStatus.CANCELED) {
                    sendMailService.sendEmail(order.getUser(),
                            "Đơn hàng " + order.getId() + " của bạn đã bị " + this.convertStatus(orderStatus),
                            "orderAdminCancelTemplate", emailVariables);
                } else if (orderStatus == OrderStatus.COMPLETED) {
                    sendMailService.sendEmail(order.getUser(),
                            "Đơn hàng " + order.getId() + " của bạn đã hoàn tất",
                            "orderAdminSuccessTemplate", emailVariables);
                } else if (orderStatus == OrderStatus.SHIPPING) {
                    sendMailService.sendEmail(order.getUser(),
                            "Đơn hàng " + order.getId() + " của bạn đang được vận chuyển",
                            "orderShippingTemplate", emailVariables);
                }
            }
        } else if (currentUser.getRole() == Role.USER) {
            this.notificationService.sendAdminNotification("Cập nhật đơn hàng",
                    "Đơn hàng " + order.getId() + " đã " + this.convertStatus(orderStatus) + " bởi khách hàng",
                    NotificationType.ORDER, "/admin/orderMng/" + order.getId());
            if (orderStatus == OrderStatus.CANCELED) {
                List<User> adminUsers = userService.getAdminUser();
                for (User admin : adminUsers) {
                    Map<String, Object> adminEmailVariables = prepareEmailVariables(order);
                    sendMailService.sendEmail(admin,
                            "Đơn hàng " + order.getId() + " đã được " + this.convertStatus(orderStatus) + " bởi khách hàng",
                            "orderUserCancelTemplate", adminEmailVariables);
                }
            }
        }
        if (orderStatus == OrderStatus.CANCELED) {
            order.getOrderDetails().forEach(orderDetail -> {
                Product product = orderDetail.getProduct();
                productService.updateQuantity(product, product.getQuantity() + orderDetail.getQuantity());
            });
            if (order.getVoucher() != null) {
                this.voucherService.returnVoucherWhenCancelOrder(order.getVoucher().getId(), order.getUser());

            }
        }
        order.setStatus(orderStatus);
        orderRepository.save(order);
    }


    @Override
    public byte[] successOrderInCounter(Long id, UpdateOrderRequest request) {
        OrderStatus status = OrderStatus.COMPLETED;
        User user = userService.findById(request.getUserId()).orElse(null);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Order not found"));

        if (!order.getStatus().canTransitionTo(status)) {
            throw new IllegalArgumentException("Invalid status transition from " + order.getStatus() + " to " + status);
        }
        order.getOrderDetails().forEach(item -> {
            Product product = item.getProduct();
            productService.updateQuantity(product, product.getQuantity() - item.getQuantity());
        });
        order.setBuyerName(user != null ? user.getFullName() : "Khách lẻ");
        order.setBuyerPhoneNum(user != null ? user.getPhoneNum() : null);
        order.setStatus(status);
        order.setAmountPaid(request.getPaymentType() == PaymentType.bank_transfer ? order.getTotalPrice() : request.getAmountPaid());
        order.setPaymentType(request.getPaymentType());
        order.setUser(user);
        orderRepository.save(order);
        return this.getBill(order);
    }

    @Override
    public void cancelOrderInCounter(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NoSuchElementException("Order not found with ID: " + orderId));
        order.setStatus(OrderStatus.CANCELED);
        order.setBuyerName(order.getBuyerName());
        order.getOrderDetails().forEach(orderDetail -> {
            Product product = orderDetail.getProduct();
            productService.updateQuantity(product, product.getQuantity() + orderDetail.getQuantity());
        });

        orderRepository.save(order);
    }

    private BigDecimal calculateVoucherDiscount(Voucher voucher, BigDecimal totalPrice, BigDecimal shippingFee) {
        BigDecimal voucherDiscount = BigDecimal.ZERO;
        if (voucher == null) {
            return voucherDiscount;
        }
        if (voucher.getType() == VoucherType.PERCENT) {
            if (voucher.getMaxValue() != null && voucher.getMaxValue().compareTo(totalPrice) < 0) {
                voucherDiscount = voucher.getValue().multiply(totalPrice).divide(BigDecimal.valueOf(100));
            } else if (voucher.getMaxValue() == null) {
                voucherDiscount = voucher.getValue().multiply(totalPrice).divide(BigDecimal.valueOf(100));
            }
        } else if (voucher.getType() == VoucherType.CASH) {
            voucherDiscount = voucher.getValue();
        }
        return voucherDiscount;
    }

    private byte[] getBill(Order order) {
        try {
            ByteArrayOutputStream pdfOutputStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(pdfOutputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument);
            String fontPath = "C:\\Windows\\Fonts\\arial.ttf";
            PdfFont font = PdfFontFactory.createFont(fontPath, PdfFontFactory.EmbeddingStrategy.FORCE_EMBEDDED);
            document.setFont(font);
            DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.getDefault());
            symbols.setGroupingSeparator('.');
            symbols.setDecimalSeparator(',');

            DecimalFormat decimalFormat = new DecimalFormat("#,###", symbols);
            InputStream logoStream = getClass().getResourceAsStream("/static/Logo-BookBazaar-nobg.png");
            if (logoStream != null) {
                ImageData logoData = ImageDataFactory.create(logoStream.readAllBytes());
                Image logo = new Image(logoData);
                logo.setWidth(250);
                logo.setHorizontalAlignment(HorizontalAlignment.CENTER);
                logo.setMarginBottom(20);

                document.add(logo);
            }

            document.add(new Paragraph("HÓA ĐƠN MUA HÀNG")
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMultipliedLeading(0.8f)
                    .setFontSize(16));
            document.add(new Paragraph("Số hóa đơn: " + order.getId())
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMultipliedLeading(0.8f));
            document.add(new Paragraph("Ngày: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")))
                    .setMarginBottom(14).setMultipliedLeading(0.8f));

            document.add(new Paragraph()
                    .add(new Text("Khách hàng: ").setBold())
                    .add(order.getBuyerName()).setMultipliedLeading(0.8f));
            if (order.getBuyerPhoneNum() != null) {
                document.add(new Paragraph()
                        .add(new Text("SĐT: ").setBold())
                        .add(order.getBuyerPhoneNum()).setMultipliedLeading(0.8f));
            }
            if (order.getAddress() != null) {
                document.add(new Paragraph()
                        .add(new Text("Địa chỉ: ").setBold())
                        .add(order.getAddress().getAddressDetail() + ", " + order.getAddress().getCommune().getLabel()
                                + ", " + order.getAddress().getDistrict().getLabel()
                                + ", " + order.getAddress().getProvince().getLabel())
                        .setMultipliedLeading(0.8f));
            }

            float[] columnWidths = {3, 2, 1, 2};
            Table table = new Table(columnWidths);
            table.setMarginTop(15);
            table.setWidth(UnitValue.createPercentValue(100));

            table.addHeaderCell(new Cell().add(new Paragraph("Sản phẩm").setBold()).setTextAlignment(TextAlignment.CENTER));
            table.addHeaderCell(new Cell().add(new Paragraph("Giá").setBold()).setTextAlignment(TextAlignment.CENTER));
            table.addHeaderCell(new Cell().add(new Paragraph("Số lượng").setBold()).setTextAlignment(TextAlignment.CENTER));
            table.addHeaderCell(new Cell().add(new Paragraph("Thành tiền").setBold()).setTextAlignment(TextAlignment.CENTER));

            order.getOrderDetails().forEach(orderDetail -> {
                Product product = orderDetail.getProduct();
                BigDecimal price = orderDetail.getPriceAtPurchase();
                BigDecimal quantity = BigDecimal.valueOf(orderDetail.getQuantity());
                BigDecimal total = price.multiply(quantity);
                table.addCell(new Cell().add(new Paragraph(product.getName())));
                table.addCell(new Cell().add(new Paragraph(decimalFormat.format(price) + " ₫").setTextAlignment(TextAlignment.RIGHT)));
                table.addCell(new Cell().add(new Paragraph(decimalFormat.format(quantity)).setTextAlignment(TextAlignment.CENTER)));
                table.addCell(new Cell().add(new Paragraph(decimalFormat.format(total) + " ₫").setTextAlignment(TextAlignment.RIGHT)));
            });
            document.add(table);

            document.add(new Paragraph()
                    .add(new Text("Tổng tiền hàng: ").setBold())
                    .add(decimalFormat.format(order.getTotalPrice()) + " ₫")
                    .setMarginTop(20)
                    .setTextAlignment(TextAlignment.RIGHT).setMultipliedLeading(0.8f));
            document.add(new Paragraph()
                    .add(new Text("Hình thức thanh toán: ").setBold())
                    .add(order.getPaymentType() == PaymentType.bank_transfer ? "Chuyển khoản" :
                            order.getPaymentType() == PaymentType.both ? "Tiền mặt và chuyển khoản" : "Tiền mặt")
                    .setTextAlignment(TextAlignment.RIGHT).setMultipliedLeading(0.8f));
            document.add(new Paragraph()
                    .add(new Text("Tiền khách đưa: ").setBold())
                    .add(decimalFormat.format(order.getAmountPaid()))
                    .setTextAlignment(TextAlignment.RIGHT).setMultipliedLeading(0.8f));
            document.add(new Paragraph()
                    .add(new Text("Tiền thừa: ").setBold())
                    .add(decimalFormat.format(order.getAmountPaid().subtract(order.getTotalPrice())) + " ₫")
                    .setTextAlignment(TextAlignment.RIGHT).setMultipliedLeading(0.8f));

            document.close();
            return pdfOutputStream.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private Map<String, Object> prepareEmailVariables(Order order) {
        User user = order.getUser();
        User currentUser = userService.getCurrentUser();
        if (user == null) {
            throw new IllegalArgumentException("Không tìm thấy thông tin khách hàng cho đơn hàng");
        }
        Order currentOrder = orderRepository.findById(order.getId()).orElseThrow(
                () -> new NoSuchElementException("Not found order id : " + order.getId())
        );
        Address address = user.getAddress();
        String fullAddress = (address != null)
                ? address.getAddressDetail() + ", " +
                (address.getDistrict() != null && address.getDistrict().getLabel() != null ? address.getDistrict().getLabel() : "") + ", " +
                (address.getCommune() != null && address.getCommune().getLabel() != null ? address.getCommune().getLabel() : "") + ", " +
                (address.getProvince() != null && address.getProvince().getLabel() != null ? address.getProvince().getLabel() : "")
                : "Địa chỉ không có";

        Address address1 = order.getAddress();
        String fullAddress1 = (address1 != null)
                ? address1.getAddressDetail() + ", " +
                (address1.getDistrict() != null && address1.getDistrict().getLabel() != null ? address1.getDistrict().getLabel() : "") + ", " +
                (address1.getCommune() != null && address1.getCommune().getLabel() != null ? address1.getCommune().getLabel() : "") + ", " +
                (address1.getProvince() != null && address1.getProvince().getLabel() != null ? address1.getProvince().getLabel() : "")
                : "Địa chỉ không có";
        String orderBuyerPhoneNum = order.getBuyerPhoneNum();
        String ordername = order.getBuyerName();
        List<OrderDetail> orderDetails = order.getOrderDetails() != null ? order.getOrderDetails() : Collections.emptyList();

        List<Map<String, Object>> productList = orderDetails.stream()
                .map(orderDetail -> {
                    Product product = orderDetail.getProduct();

                    String thumbnailUrl = imageProductService != null
                            ? imageProductService.getThumbnailProduct(product.getId())
                            : "default-thumbnail-url";

                    Map<String, Object> productMap = new HashMap<>();
                    productMap.put("productName", product.getName());
                    productMap.put("quantity", orderDetail.getQuantity());
                    productMap.put("productPrice", formatPrice(orderDetail.getOriginalPriceAtPurchase()));
                    productMap.put("thumbnailImage", thumbnailUrl);
                    return productMap;
                })
                .collect(Collectors.toList());

        BigDecimal subTotal = orderDetails.stream()
                .map(orderDetail -> orderDetail.getOriginalPriceAtPurchase().multiply(BigDecimal.valueOf(orderDetail.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDiscount = orderDetails.stream()
                .map(orderDetail -> {
                    BigDecimal discount = orderDetail.getDiscount() != null ? orderDetail.getDiscount() : BigDecimal.ZERO;
                    return discount.multiply(BigDecimal.valueOf(orderDetail.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shippingFee = order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO;
        BigDecimal totalAmountBeforeVoucher = subTotal.add(shippingFee).subtract(totalDiscount);
        BigDecimal voucherAmount = this.calculateVoucherDiscount(order.getVoucher(), order.getTotalPrice(), shippingFee);
        BigDecimal totalAmount = totalAmountBeforeVoucher.subtract(voucherAmount);

        String formattedVoucherAmount = formatPrice(voucherAmount.negate());
        String formattedTotalAmount = formatPrice(totalAmount);
        String frontendBaseUrl = "http://localhost:3000";
        String adminLink = String.format("%s/admin/orderMng/%d", frontendBaseUrl, order.getId());
        String userLink = String.format("%s/order/detail/%d", frontendBaseUrl, order.getId());
        String cancelLink = String.format("%s/order/detail/%d", frontendBaseUrl, currentOrder.getId());
        Map<String, Object> emailVariables = new HashMap<>();
        emailVariables.put("orderCode", order.getId());
        emailVariables.put("orderDate", order.getOrderDate());
        emailVariables.put("user1", currentUser);
        emailVariables.put("adminLink", adminLink);
        emailVariables.put("userLink", userLink);
        emailVariables.put("cancelLink", cancelLink);
        emailVariables.put("fullAddress1", fullAddress1);
        emailVariables.put("orderBuyerPhoneNum", orderBuyerPhoneNum);
        emailVariables.put("ordername", ordername);
        emailVariables.put("fullAddress", fullAddress);
        emailVariables.put("productList", productList);
        emailVariables.put("subTotal", formatPrice(subTotal));
        emailVariables.put("shippingFee", formatPrice(shippingFee));
        emailVariables.put("discount", formatPrice(totalDiscount.negate()));
        emailVariables.put("voucher", formattedVoucherAmount);
        emailVariables.put("totalAmount", formattedTotalAmount);
        return emailVariables;
    }

    private String formatPrice(BigDecimal amount) {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.getDefault());
        symbols.setGroupingSeparator('.');
        DecimalFormat formatter = new DecimalFormat("#,###", symbols);
        return formatter.format(amount) + " ₫";
    }

}
