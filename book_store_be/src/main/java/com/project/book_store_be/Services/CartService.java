package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Cart;
import com.project.book_store_be.Model.CartDetail;
import com.project.book_store_be.Model.DisCount;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Repository.CartDetailRepository;
import com.project.book_store_be.Repository.CartRepository;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Request.CartRequest;
import com.project.book_store_be.Response.CartResponse;
import com.project.book_store_be.Response.ProductRes.ProductCartResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final CartDetailRepository cartDetailRepository;
    private final ProductRepository productRepository;
    public Cart createCart(Cart cart){
        return cartRepository.save(cart);
    }
    public void addProductToCart(Long cartId, CartRequest cartRequest) {
        Product product = productRepository.findById(cartRequest.getProductId())
                .orElseThrow(() -> new NoSuchElementException("Product not found"));
        if (cartRequest.getQuantity() > product.getQuantity()) {
            throw new IllegalArgumentException("Quantity cannot exceed available stock");
        }
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new NoSuchElementException("Cart not found"));
        cart.setTotalQuantity(cart.getTotalQuantity() + cartRequest.getQuantity());
        cart.setTotalPrice(cart.getTotalPrice().add(product.getCost().multiply(BigDecimal.valueOf(cartRequest.getQuantity()))));
        CartDetail cartDetail = new CartDetail();
        cartDetail.setProduct(product);
        cartDetail.setCart(cart);
        cartDetail.setCartQuantity(cartRequest.getQuantity());
        cartDetailRepository.save(cartDetail);
        cartRepository.save(cart);
    }
    public CartResponse getCartDetails(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new NoSuchElementException("Cart not found"));
        List<ProductCartResponse> products = cartDetailRepository.findByCartId(cartId).stream()
                .map(cartDetail -> ProductCartResponse.builder()
                        .productId(cartDetail.getProduct().getId())
                        .productName(cartDetail.getProduct().getName())
                        .availableQuantity(cartDetail.getProduct().getQuantity())
                        .cartQuantity(cartDetail.getCartQuantity())
                        .price(cartDetail.getProduct().getCost())
                        .totalPrice(cartDetail.getProduct().getCost().multiply(BigDecimal.valueOf(cartDetail.getCartQuantity())))
                        .build())
                .collect(Collectors.toList());
        return CartResponse.builder()
                .id(cart.getId())
                .products(products)
                .totalPrice(cart.getTotalPrice())
                .build();
    }
    public void updateCartDetail(Long cartDetailId, Integer quantity) {
        CartDetail cartDetail = cartDetailRepository.findById(cartDetailId)
                .orElseThrow(() -> new NoSuchElementException("CartDetail not found"));
        Product product = cartDetail.getProduct();
        if (quantity > product.getQuantity()) {
            throw new IllegalArgumentException("Quantity cannot exceed available stock");
        }
        Cart cart = cartDetail.getCart();
        cart.setTotalQuantity(cart.getTotalQuantity() - cartDetail.getCartQuantity() + quantity);
        cart.setTotalPrice(cart.getTotalPrice()
                .subtract(product.getCost().multiply(BigDecimal.valueOf(cartDetail.getCartQuantity())))
                .add(product.getCost().multiply(BigDecimal.valueOf(quantity))));
        cartDetail.setCartQuantity(quantity);
        cartDetailRepository.save(cartDetail);
        cartRepository.save(cart);
    }
    public void removeProductFromCart(Long cartDetailId) {
        CartDetail cartDetail = cartDetailRepository.findById(cartDetailId)
                .orElseThrow(() -> new NoSuchElementException("CartDetail not found"));
        Cart cart = cartDetail.getCart();
        Product product = cartDetail.getProduct();
        cart.setTotalQuantity(cart.getTotalQuantity() - cartDetail.getCartQuantity());
        cart.setTotalPrice(cart.getTotalPrice().subtract(product.getCost().multiply(BigDecimal.valueOf(cartDetail.getCartQuantity()))));
        cartDetailRepository.delete(cartDetail);
        cartRepository.save(cart);
    }
    public Page<CartDetail> getCartDetailsPage(Long cartId, Pageable pageable) {
        return cartDetailRepository.findByCartId(cartId, pageable);
    }
}
