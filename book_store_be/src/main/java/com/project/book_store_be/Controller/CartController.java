package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.Cart;
import com.project.book_store_be.Request.CartRequest;
import com.project.book_store_be.Response.CartResponse;
import com.project.book_store_be.Services.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/cart")
public class CartController {
    private final CartService cartService;
    @PostMapping
    public ResponseEntity<Cart> createCart(@RequestBody Cart cart) {
        try {
            Cart createdCart = cartService.createCart(cart);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/{cartId}")
    public ResponseEntity<String> addProductToCart(
            @PathVariable Long cartId,
            @Valid @RequestBody CartRequest cartRequest) {
        try {
            cartService.addProductToCart(cartId, cartRequest);
            return ResponseEntity.status(HttpStatus.OK).body("Product added to cart successfully.");
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart not found: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid input: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/{cartId}")
    public ResponseEntity<CartResponse> getCartDetails(@PathVariable Long cartId) {
        try {
            CartResponse cartResponse = cartService.getCartDetails(cartId);
            return ResponseEntity.ok(cartResponse);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/detail/{cartDetailId}")
    public ResponseEntity<String> updateCartDetail(
            @PathVariable Long cartDetailId,
            @RequestParam Integer quantity) {
        try {
            cartService.updateCartDetail(cartDetailId, quantity);
            return ResponseEntity.status(HttpStatus.OK).body("Cart detail updated successfully.");
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart detail not found: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid input: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @DeleteMapping("/detail/{cartDetailId}")
    public ResponseEntity<String> removeProductFromCart(@PathVariable Long cartDetailId) {
        try {
            cartService.removeProductFromCart(cartDetailId);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("Product removed from cart successfully.");
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart detail not found: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/detail/{cartId}")
    public ResponseEntity<?> getCartDetailsPage(@PathVariable Long cartId, Pageable pageable) {
        try {
            return ResponseEntity.ok(cartService.getCartDetailsPage(cartId, pageable));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart not found: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
    }
}

