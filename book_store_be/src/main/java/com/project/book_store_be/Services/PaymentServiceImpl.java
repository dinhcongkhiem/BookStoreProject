package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.NotificationType;
import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Interface.PaymentService;
import com.project.book_store_be.Model.Order;
import com.project.book_store_be.Model.OrderDetail;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Repository.OrderRepository;
import com.project.book_store_be.Request.PaymentRequest;
import com.project.book_store_be.Response.OrderRes.OrderItemsResponse;
import com.project.book_store_be.Response.PaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.type.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@EnableScheduling
public class PaymentServiceImpl implements PaymentService {
    private final SendMailService sendMailService;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;
    private final PayOS payOS;
    private static final String CANCEL_URL = "http://localhost:3000/profile";
    private static final String RETURN_URL = "http://localhost:3000/cart";
    private Set<String> sentEmailOrderCodes = new HashSet<>();

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);


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
                BigDecimal[] totalPrice = {BigDecimal.ZERO};

                orderItems.forEach(o -> {
                    Product product = o.getProduct();
                    BigDecimal discount = o.getDiscount() != null ? o.getDiscount() : BigDecimal.ZERO;
                    totalPrice[0] = totalPrice[0].add(product.getPrice().subtract(discount).multiply(BigDecimal.valueOf(o.getQuantity())));
                });

                BigDecimal finalPrice = totalPrice[0].add(order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO);
                String message = String.format("Người dùng %s đã đặt đơn hàng mới với giá trị %s", user.getFullName(), finalPrice);
                notificationService.sendAdminNotification("Đơn hàng mới", message, NotificationType.ORDER);

                if (!sentEmailOrderCodes.contains(orderCode)) {
                    Map<String, Object> variables = new HashMap<>();
                    variables.put("orderCode", order.getId());
                    variables.put("amount", order.getOrderDetails().stream()
                            .map(detail -> BigDecimal.valueOf(detail.getProduct().getPrice().doubleValue())
                                    .multiply(BigDecimal.valueOf(detail.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add));

                    if (user != null) {
                        try {
                            sendMailService.sendEmail(user, "Thanh toán thành công", "paymentSuccessTemplate", variables);
                            User shopUser = new User();
                            shopUser.setEmail("admin@khiemcongdinh.id.vn");
                            sendMailService.sendEmail(shopUser, "Thông báo đơn hàng mới" + orderCode, "paymentAdminSuccessTemplate", variables);
                            sentEmailOrderCodes.add(orderCode);
                        } catch (Exception e) {
                            System.out.println("Có lỗi xảy ra khi gửi email: " + e.getMessage());
                        }
                    } else {
                        System.out.println("User không được tìm thấy cho đơn hàng: " + orderCode);
                    }
                } else {
                    System.out.println("Email đã được gửi trước đó cho đơn hàng: " + orderCode);
                }
            }

        } catch (NoSuchElementException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return webhook.getCode();
    }

    @Override
    public String cancelPayment(Long orderCode) throws Exception {
        try {
            payOS.cancelPaymentLink(orderCode, "Customer requested cancellation");

//          HỦY THANK TOÁN (SEND MAIL Ở ĐÂY NHA)

            return "Order " + orderCode + " has been canceled on both system and third-party.";
        } catch (Exception e) {
            throw new Exception("Failed to cancel payment with third-party: " + e.getMessage());
        }
    }

}
