package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.NotificationType;
import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Enum.VoucherType;
import com.project.book_store_be.Interface.PaymentService;
import com.project.book_store_be.Model.*;
import com.project.book_store_be.Repository.OrderRepository;
import com.project.book_store_be.Request.PaymentRequest;
import com.project.book_store_be.Response.OrderRes.OrderItemsResponse;
import com.project.book_store_be.Response.PaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.*;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@EnableScheduling
public class PaymentServiceImpl implements PaymentService {
    private final SendMailService sendMailService;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;
    private final ImageProductService imageProductService;
    private final UserService userService;
    private final PayOS payOS;
    private static final String CANCEL_URL = "http://localhost:3000/profile";
    private static final String RETURN_URL = "http://localhost:3000/cart";
    private Set<String> sentEmailOrderCodes = new HashSet<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    private String formatPrice(BigDecimal price) {
        DecimalFormat formatter = new DecimalFormat("#,###");
        return formatter.format(price) + " ₫";
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
        BigDecimal voucherAmount = BigDecimal.ZERO;
        if (order.getVoucher() != null) {
            if (order.getVoucher().getType() == VoucherType.PERCENT) {
                voucherAmount = totalAmountBeforeVoucher.multiply(order.getVoucher().getValue()).divide(BigDecimal.valueOf(100));
                BigDecimal maxDiscount = order.getVoucher().getMaxValue();
                if (voucherAmount.compareTo(maxDiscount) > 0) {
                    voucherAmount = maxDiscount;
                }
            } else if (order.getVoucher().getType() == VoucherType.CASH) {
                voucherAmount = order.getVoucher().getValue();
            }
        }
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


    @Override
    public PaymentResponse PaymentRequest(PaymentRequest request) throws Exception {
        PaymentData paymentData = PaymentData.builder()
                .orderCode(request.getOrderCode())
                .amount(request.getAmount().intValue())
                .description(request.getDescription())
                .returnUrl(CANCEL_URL)
                .cancelUrl(RETURN_URL)
                .build();
        CheckoutResponseData result = payOS.createPaymentLink(paymentData);
        String QRCodeURL = String.format("https://api.vietqr.io/image/970422-%s-bXU1iBq.jpg?addInfo=%s&amount=%s",
                result.getAccountNumber(), request.getDescription(), request.getAmount());

        scheduler.schedule(() -> {
            Long orderCode = request.getOrderCode();
            try {
                PaymentLinkData paymentLinkData = payOS.getPaymentLinkInformation(orderCode);
                if (!paymentLinkData.getStatus().equalsIgnoreCase("PAID")) {
                    payOS.cancelPaymentLink(orderCode, "payment due");
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, 5, TimeUnit.MINUTES);
        return PaymentResponse.builder()
                .expiredAt(5)
                .amount(BigDecimal.valueOf(result.getAmount()))
                .description(result.getDescription())
                .orderCode(result.getOrderCode())
                .status(result.getStatus())
                .QRCodeURL(QRCodeURL)
                .build();
    }

    @Override
    public String UpdateStatus(Webhook webhook) {
        WebhookData data = webhook.getData();
        try {
            if (data.getCode().equalsIgnoreCase("00")) {
                String orderCode = String.valueOf(data.getOrderCode());
                Order order = orderRepository.findById(Long.valueOf(orderCode.substring(0, orderCode.length() - 6)))
                        .orElseThrow(() -> new NoSuchElementException("Order not found: " + orderCode));

                User user = order.getUser();
                order.setStatus(OrderStatus.PROCESSING);
                orderRepository.save(order);

                List<OrderDetail> orderItems = order.getOrderDetails();
                BigDecimal[] totalPrice = { BigDecimal.ZERO };

                orderItems.forEach(o -> {
                    Product product = o.getProduct();
                    BigDecimal discount = o.getDiscount() != null ? o.getDiscount() : BigDecimal.ZERO;
                    totalPrice[0] = totalPrice[0].add(product.getOriginal_price().subtract(discount)
                            .multiply(BigDecimal.valueOf(o.getQuantity())));
                });

                BigDecimal finalPrice = totalPrice[0]
                        .add(order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO);
                String message = String.format("Người dùng %s đã đặt đơn hàng mới với giá trị %s", user.getFullName(),
                        finalPrice);
                notificationService.sendAdminNotification("Thanh toán đơn hàng", message, NotificationType.ORDER,
                        "/admin/orderMng/" + order.getId());

                if (!sentEmailOrderCodes.contains(orderCode)) {
                    List<User> adminUsers = userService.getAdminUser();
                    for (User admin : adminUsers) {
                        Map<String, Object> variables = prepareEmailVariables(order);
                        sendMailService.sendEmail(admin, "Thông báo thanh toán đơn hàng", "orderUserSuccessTemplate", variables);  // Send to admin
                    }
                    sentEmailOrderCodes.add(orderCode);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return webhook.getCode();
    }

    @Override
    public String cancelPayment(Long orderCode) throws Exception {
        try {
            payOS.cancelPaymentLink(orderCode, "Customer requested cancellation");
            return "Order " + orderCode + " has been canceled on both system and third-party.";
        } catch (Exception e) {
            throw new Exception("Failed to cancel payment with third-party: " + e.getMessage());
        }
    }
}