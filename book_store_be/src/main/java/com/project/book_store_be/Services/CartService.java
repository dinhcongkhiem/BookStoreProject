package com.project.book_store_be.Services;

import com.project.book_store_be.Exception.ProductQuantityNotEnough;
import com.project.book_store_be.Model.Cart;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Repository.CartRepository;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Request.CartRequest;
import com.project.book_store_be.Response.CartResponse;
import com.project.book_store_be.Response.ProductRes.ProductCartResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ImageProductService imageProductService;
    private final UserService userService;
    private final ProductService productService;

    public CartResponse getCartByUserId(int page, int size) {
        User currentUser = userService.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createDate"));
        Page<Cart> cartPage = cartRepository.findByUser(currentUser, pageable);
        return convertToCartResponse(cartPage);
    }

    public List<Cart> getCartsById(List<Long> ids) {
        User currentUser = userService.getCurrentUser();
        return cartRepository.findAllByIdInAndUser(ids, currentUser);
    }

    public void addToCart(CartRequest cartRequest) {
        User currentUser = userService.getCurrentUser();
        Product product = productRepository.findById(cartRequest.getProductId())
                .orElseThrow(() -> new NoSuchElementException("Product not found"));
        Optional<Cart> cartOptional = cartRepository.findByUserAndProduct(currentUser, product);

        if (cartRequest.getCartQuantity() < 1 || cartRequest.getCartQuantity() > product.getQuantity()) {
            throw new IllegalArgumentException("Số lượng không hợp lệ. Phải lớn hơn hoặc bằng 1 và nhỏ hơn hoặc bằng số lượng có sẵn.");
        }
        if (cartOptional.isPresent()) {
            Cart cart = cartOptional.get();
            int newQuantity = cart.getCartQuantity() + cartRequest.getCartQuantity();
            if (newQuantity > product.getQuantity()) {
                throw new IllegalArgumentException("Tổng số lượng trong giỏ hàng vượt quá số lượng có sẵn trong kho.");
            }
            cart.setCartQuantity(newQuantity);
            cart.setUpdateDate(LocalDateTime.now());
            cartRepository.save(cart);
            return;
        }
        Cart cart = new Cart();
        cart.setProduct(product);
        cart.setCartQuantity(cartRequest.getCartQuantity());
        cart.setUser(currentUser);
        cart.setCreateDate(LocalDateTime.now());
        cart.setUpdateDate(LocalDateTime.now());
        cartRepository.save(cart);
    }


    public void reBuyProducts(List<Long> productsId) {
        User currentUser = userService.getCurrentUser();
        productsId.forEach(p -> {
            Product product = productRepository.findById(p)
                    .orElseThrow(() -> new NoSuchElementException("Product not found"));
            Optional<Cart> cartOptional = cartRepository.findByUserAndProduct(currentUser, product);

            if (cartOptional.isPresent()) {
                Cart cart = cartOptional.get();
                int newQuantity = cart.getCartQuantity() + 1;
                if (newQuantity > product.getQuantity()) {
                    throw new ProductQuantityNotEnough("Tổng số lượng trong giỏ hàng vượt quá số lượng có sẵn trong kho.");
                }
                cart.setCartQuantity(newQuantity);
                cart.setUpdateDate(LocalDateTime.now());
                cartRepository.save(cart);
                return;
            }
            Cart cart = new Cart();
            cart.setProduct(product);
            cart.setCartQuantity(1);
            cart.setCreateDate(LocalDateTime.now());
            cart.setUpdateDate(LocalDateTime.now());
            cart.setUser(currentUser);
            cartRepository.save(cart);
        });
    }
    public void updateCartItem(Long cartId, Integer quantity) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new NoSuchElementException("Product not found in cart"));
        Product product = cart.getProduct();
        if (quantity < 1 || quantity > product.getQuantity()) {
            throw new IllegalArgumentException("Số lượng không hợp lệ. Phải lớn hơn hoặc bằng 1 và nhỏ hơn hoặc bằng số lượng có sẵn.");
        }
        cart.setCartQuantity(quantity);
        cart.setUpdateDate(LocalDateTime.now());
        cartRepository.save(cart);
    }

    public void removeCartItem(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new NoSuchElementException("Product not found in cart"));

        cartRepository.delete(cart);
    }

    private CartResponse convertToCartResponse(Page<Cart> cartPage) {
        List<ProductCartResponse> productResponses = cartPage.getContent().stream()
                .map(this::convertToProductCartResponse)
                .collect(Collectors.toList());
        return CartResponse.builder()
                .cart(productResponses)
                .totalPages(cartPage.getTotalPages())
                .currentPage(cartPage.getNumber())
                .totalItems(cartPage.getTotalElements())
                .build();
    }

    private ProductCartResponse convertToProductCartResponse(Cart cart) {
        Product product = cart.getProduct();
        BigDecimal discountVal = (BigDecimal) productService.getDiscountValue(product).get("discountVal");
        return ProductCartResponse.builder()
                .id(cart.getId())
                .productId(product.getId())
                .productName(product.getName())
                .quantity(cart.getCartQuantity())
                .productQuantity(product.getQuantity())
                .original_price(product.getOriginal_price())
                .discount(discountVal)
                .price(product.getOriginal_price().subtract(discountVal))
                .thumbnail_url(imageProductService.getThumbnailProduct(product.getId()))
                .build();
    }

}
