package com.project.book_store_be.Interface;

import com.project.book_store_be.Model.Cart;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Request.CartRequest;
import com.project.book_store_be.Response.CartResponse;
import com.project.book_store_be.Response.ProductRes.ProductCartResponse;
import org.springframework.data.domain.Page;


import java.math.BigDecimal;

public interface CartService {
    CartResponse getCartByUserId(int page, int size);

    void addToCart(CartRequest cartRequest);

    void updateCartItem(Long cartId, Integer quantity);

    void removeCartItem(Long cartId);

    CartResponse convertToCartResponse(Page<Cart> cartPage);

    ProductCartResponse convertToProductCartResponse(Cart cart);

    BigDecimal calculateDiscount(Product product);
}
