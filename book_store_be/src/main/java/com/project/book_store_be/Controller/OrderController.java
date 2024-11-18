package com.project.book_store_be.Controller;

import com.project.book_store_be.Enum.OrderStatus;
import com.project.book_store_be.Interface.OrderService;
import com.project.book_store_be.Request.OrderRequest;
import com.project.book_store_be.Response.OrderRes.OrderStatusResponse;
import com.project.book_store_be.Services.OrderServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/order")
public class OrderController {
    private final OrderService orderService;

    @PostMapping()
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> checkStatusOrder(@RequestParam Long orderCode) {
        try {
            return ResponseEntity.ok(orderService.checkStatus(orderCode));
        }catch (NoSuchElementException e){
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }
    @GetMapping()
    public ResponseEntity<?> getOrderByUser(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "15") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false)  OrderStatus status
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
            @RequestParam(required = false)  OrderStatus status
    ) {
        try {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(orderService.findAllOrders(page, pageSize, status, keyword));

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

    @PatchMapping("update-order/{id}")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody OrderStatus status) {
        try {
            return ResponseEntity.ok(orderService.updateOrderStatus(id,status));
        } catch (NoSuchElementException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Có lỗi xảy ra");
        }
    }
}
