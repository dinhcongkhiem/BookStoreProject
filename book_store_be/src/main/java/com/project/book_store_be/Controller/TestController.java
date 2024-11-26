package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.Order;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Repository.OrderRepository;
import com.project.book_store_be.Services.ImageProductService;
import com.project.book_store_be.Services.SendMailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/test")
public class TestController {
    private final SendMailService sendMailService;
    private final OrderRepository orderRepository;
    private final ImageProductService imageProductService;

    // Endpoint to test sending email with order info
    @RequestMapping("")
    public ResponseEntity<?> testEmail(@RequestParam Long orderId) {
        // Fetch the order by ID
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));

        // Fetch user associated with the order (assuming this is part of the order)
        User user = order.getUser();  // Assuming Order has a reference to User

        // Prepare the product list details
        List<Map<String, Object>> productList = order.getOrderDetails().stream()
                .map(orderDetail -> {
                    Product product = orderDetail.getProduct();

                    // Get the thumbnail URL for the product
                    String thumbnailUrl = imageProductService != null ? imageProductService.getThumbnailProduct(product.getId()) : "default-thumbnail-url";


                    // Create the map explicitly with the correct types
                    Map<String, Object> productMap = Map.of(
                            "productName", product.getName(),
                            "quantity", orderDetail.getQuantity(),
                            "productPrice", orderDetail.getPriceAtPurchase(),
                            "thumbnailImage", thumbnailUrl
                    );
                    return productMap;  // Return the Map<String, Object>
                })
                .collect(Collectors.toList());  // Collect into a List<Map<String, Object>>





        // Prepare the other required variables (calculations, etc.)
        BigDecimal subTotal = order.getTotalPrice();
        BigDecimal shippingFee = order.getShippingFee() != null ? order.getShippingFee() : BigDecimal.ZERO;
        BigDecimal discount = order.getVoucher() != null ? order.getVoucher().getValue() : BigDecimal.ZERO;
        BigDecimal totalAmount = subTotal.add(shippingFee).subtract(discount);

        // Prepare template variables
        Map<String, Object> variables = Map.of(
                "orderCode", order.getId(),
                "orderDate", order.getOrderDate(),
                "user", user,  // Send the user information (name, address, etc.)
                "productList", productList,
                "subTotal", subTotal,
                "shippingFee", shippingFee,
                "discount", discount,
                "totalAmount", totalAmount,
                "order", order  // To include order-specific details if needed
        );

        // Send the email
        sendMailService.sendEmail(user, "Thanh toán thành công", "orderAdminCancelTemplate", variables);
//        sendMailService.sendEmail(user, "Thanh toán thành công", "paymentSuccessTemplate", variables);

        // Return success response
        return ResponseEntity.ok("Email sent successfully!");
    }
}
