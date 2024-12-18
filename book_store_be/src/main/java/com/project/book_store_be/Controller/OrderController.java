package com.project.book_store_be.Controller;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Enum.OrderType;
import com.project.book_store_be.Enum.PaymentType;
import com.project.book_store_be.Exception.MaxFinalPriceOrderException;
import com.project.book_store_be.Exception.PriceHasChangedException;
import com.project.book_store_be.Exception.ProductQuantityNotEnough;
import com.project.book_store_be.Exception.VoucherQuantityNotEnough;
import com.project.book_store_be.Interface.OrderService;
import com.project.book_store_be.Request.OrderRequest;
import com.project.book_store_be.Request.UpdateOrderRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/order")
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/counter-sell")
    public ResponseEntity<?> createCounterSellOrder() {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrderCounterSales());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }

    @PostMapping("/order-detail")
    public ResponseEntity<?> createOrderDetail(@RequestParam Long orderId,
                                               @RequestBody List<OrderRequest.OrderDetailRequest> items) {
        try {
            orderService.createOrderDetail(items, orderId);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (MaxFinalPriceOrderException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }

    @PostMapping()
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
        } catch (ProductQuantityNotEnough e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Số lượng sản phẩm không đủ, vui lòng thử lại sau!");
        } catch (VoucherQuantityNotEnough | PriceHasChangedException | MaxFinalPriceOrderException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }

    @PostMapping("/re-payment")
    public ResponseEntity<?> rePaymentOrder(@RequestParam Long orderId, @RequestParam PaymentType paymentType) {
        try {
            return ResponseEntity.status(HttpStatus.OK).body(orderService.rePaymentOrder(orderId, paymentType));
        }catch (ProductQuantityNotEnough e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Số lượng sản phẩm không đủ, vui lòng thử lại sau!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> checkStatusOrder(@RequestParam Long orderCode) {
        try {
            return ResponseEntity.ok(orderService.checkStatus(orderCode));
        } catch (NoSuchElementException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }

    @GetMapping()
    public ResponseEntity<?> getOrderByUser(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "15") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) OrderStatus status
    ) {
        try {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(orderService.getOrdersByUser(page, pageSize, status, keyword));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "15") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) LocalDateTime start,
            @RequestParam(required = false) LocalDateTime end,
            @RequestParam(required = false) OrderType type,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false, defaultValue = "-1") Integer sort
    ) {
        try {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(orderService.findAllOrders(page, pageSize, status, start, end, type, keyword, sort));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }

    @GetMapping("/detail")
    public ResponseEntity<?> getOrderDetailById(@RequestParam Long id) {
        try {
            return ResponseEntity.ok(orderService.getOrderDetailById(id));
        } catch (NoSuchElementException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Order not found");
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody OrderStatus request) {
        try {
            orderService.updateOrderStatus(id, request);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }

    @PatchMapping("/success/{id}")
    public ResponseEntity<?> successOrderInCounterr(@PathVariable Long id, @RequestBody UpdateOrderRequest request) {
        try {
            byte[] pdfFile = orderService.successOrderInCounter(id, request);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment().filename("bill.pdf").build());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfFile);
        } catch (ProductQuantityNotEnough e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Số lượng sản phẩm không đủ, vui lòng thử lại sau!");
        } catch (NoSuchElementException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("detail-qty/{id}")
    public ResponseEntity<?> updateOrderDetailQuantity(@PathVariable Long id, @RequestBody Integer quantity) {
        try {
            orderService.updateQuantity(quantity, id);
            return ResponseEntity.ok().build();
        } catch (MaxFinalPriceOrderException | ProductQuantityNotEnough e ) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (NoSuchElementException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("detail/{id}")
    public ResponseEntity<?> deleteOrderDetail(@PathVariable Long id) {
        try {
            orderService.deleteOrderDetail(id);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("cancel/{id}")
    public ResponseEntity<?> cancelOrderInCounter(@PathVariable Long id) {
        try {
            orderService.cancelOrderInCounter(id);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }

}
