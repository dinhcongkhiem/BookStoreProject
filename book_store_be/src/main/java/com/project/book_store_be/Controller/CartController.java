package com.project.book_store_be.Controller;

import com.project.book_store_be.Request.CartRequest;
import com.project.book_store_be.Response.CartResponse;
import com.project.book_store_be.Services.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/cart")
public class CartController {
    private final CartService cartService;

    @GetMapping()
    public ResponseEntity<?> getCartByUserId(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            CartResponse cartResponse = cartService.getCartByUserId(page, size);
            return ResponseEntity.ok(cartResponse);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy giỏ hàng của người dùng", "status", HttpStatus.NOT_FOUND.value()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Đã xảy ra lỗi không xác định", "status", HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    @PostMapping()
    public ResponseEntity<?> addToCart(@RequestBody CartRequest cartRequest) {
        try {
            cartService.addToCart(cartRequest);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy sản phẩm để thêm vào giỏ hàng", "status", HttpStatus.NOT_FOUND.value()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Số lượng không hợp lệ. Phải lớn hơn hoặc bằng 1 và nhỏ hơn hoặc bằng số lượng có sẵn.", "status", HttpStatus.BAD_REQUEST.value()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Đã xảy ra lỗi không xác định", "status", HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    @PutMapping("/{cartId}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long cartId,
            @RequestBody @Valid CartRequest cartRequest) {
        try {
            cartService.updateCartItem(cartId, cartRequest);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy sản phẩm trong giỏ hàng để cập nhật", "status", HttpStatus.NOT_FOUND.value()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Số lượng không hợp lệ. Phải lớn hơn hoặc bằng 1 và nhỏ hơn hoặc bằng số lượng có sẵn.", "status", HttpStatus.BAD_REQUEST.value()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Đã xảy ra lỗi không xác định", "status", HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    @DeleteMapping("/{cartId}")
    public ResponseEntity<?> removeCartItem(@PathVariable Long cartId) {
        try {
            cartService.removeCartItem(cartId);
            return ResponseEntity.ok().build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Không tìm thấy sản phẩm trong giỏ hàng để xóa", "status", HttpStatus.NOT_FOUND.value()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Đã xảy ra lỗi không xác định", "status", HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }
}