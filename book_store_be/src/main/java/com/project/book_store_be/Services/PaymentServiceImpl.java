package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Interface.PaymentService;
import com.project.book_store_be.Model.Order;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Repository.OrderRepository;
import com.project.book_store_be.Request.PaymentRequest;
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

@Service
@RequiredArgsConstructor
@EnableScheduling
public class PaymentServiceImpl implements PaymentService {
    private final SendMailService sendMailService;
    private final OrderRepository orderRepository;
    private final PayOS payOS;
    private final UserService userService;
//    PayOS payOS = new PayOS("70a18b0d-a6ca-4669-90ad-428219735d7e",
//            "3f638a32-7058-4150-8209-3e3a0d3c3e37", "b1f4e005bf78ce32e52e0c685d468441e2e0949c60c1969866131c27e85b0e2c");
    private static final String CANCEL_URL = "http://localhost:3000/profile";
    private static final String RETURN_URL = "http://localhost:3000/cart";

    @Scheduled(fixedRate = 60000)
    public void checkPendingOrders() {
        List<Order> pendingOrders = orderRepository.findByStatus(OrderStatus.AWAITING_PAYMENT);
        pendingOrders.forEach(order -> {
            LocalDateTime orderDate = order.getOrderDate();
            LocalDateTime now = LocalDateTime.now();
            if (orderDate.isBefore(now.minusMinutes(5))) {
                order.setStatus(OrderStatus.CANCELED);
                orderRepository.save(order);
            }
        });
    }

    @Override
    public PaymentResponse PaymentRequest(PaymentRequest request) throws Exception {
        List<ItemData> listItems = new ArrayList<>();
        request.getItems().forEach(item -> {
            listItems.add(ItemData.builder().name(item.getName())
                    .quantity(item.getQuantity())
                    .price(item.getPrice().intValue()).build());
        });
        PaymentData paymentData = PaymentData.builder()
                .orderCode(request.getOrderCode())
                .amount(request.getAmount().intValue())
                .description(request.getDescription())
                .returnUrl(CANCEL_URL)
                .cancelUrl(RETURN_URL)
                .items(listItems)
                .build();
        CheckoutResponseData result = payOS.createPaymentLink(paymentData);
        Order order = new Order();
        order.setStatus(OrderStatus.AWAITING_PAYMENT);
        order.setOrderDate(LocalDateTime.now());
        User currentUser = userService.getCurrentUser();
        order.setUser(currentUser);
        orderRepository.save(order);
        return PaymentResponse.builder()
                .expiredAt(5)
                .amount(BigDecimal.valueOf(result.getAmount()))
                .description(result.getDescription())
                .orderCode(result.getOrderCode())
                .status(result.getStatus())
                .checkoutUrl(result.getCheckoutUrl())
                .QRcode(result.getQrCode())
                .build();
    }

    @Override
    public String UpdateStatus(Webhook webhook) {
        WebhookData data = webhook.getData();
        Long orderCode = data.getOrderCode();
        try {
            Order order = orderRepository.findById(orderCode)
                    .orElseThrow(() -> new NoSuchElementException("Order not found: " + orderCode));
            User user = order.getUser();

            if (data.getCode().equalsIgnoreCase("00")) {
                order.setStatus(OrderStatus.PROCESSING);
                orderRepository.save(order);

                Map<String, Object> variables = new HashMap<>();
                variables.put("orderCode", order.getId());
                variables.put("amount", order.getOrderDetails().stream()
                        .map(detail -> BigDecimal.valueOf(detail.getProduct().getPrice().doubleValue())
                                .multiply(BigDecimal.valueOf(detail.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add));

                if (user != null) {
                    try {
                        sendMailService.sendEmail(user, "Xác nhận thanh toán thành công", "paymentSuccessTemplate", variables);
                        User shopUser = new User();
                        shopUser.setEmail("admin@khiemcongdinh.id.vn");
                        sendMailService.sendEmail(shopUser, "Xác nhận thanh toán từ đơn hàng " + orderCode, "paymentSuccessTemplate", variables);
                        System.out.println("Email đã được gửi đến: " + user.getEmail());
                    } catch (Exception e) {
                        System.out.println("Có lỗi xảy ra khi gửi email: " + e.getMessage());
                    }
                } else {
                    System.out.println("User không được tìm thấy cho đơn hàng: " + orderCode);
                }
            } else {
                order.setStatus(OrderStatus.CANCELED);
                orderRepository.save(order);
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
        Order order = orderRepository.findById(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getStatus() != OrderStatus.AWAITING_PAYMENT) {
            throw new IllegalArgumentException("Cannot cancel. The order is not in 'awaiting payment' status.");
        }
        try {
            payOS.cancelPaymentLink(orderCode, "Customer requested cancellation");
            order.setStatus(OrderStatus.CANCELED);
            orderRepository.save(order);
            return "Order " + orderCode + " has been canceled on both system and third-party.";
        } catch (Exception e) {
            throw new Exception("Failed to cancel payment with third-party: " + e.getMessage());
        }
    }

}
