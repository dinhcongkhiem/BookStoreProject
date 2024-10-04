package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.DiscountStatus;
import com.project.book_store_be.Model.Cart;
import com.project.book_store_be.Model.CartDetail;
import com.project.book_store_be.Model.DisCount;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Repository.CartDetailRepository;
import com.project.book_store_be.Repository.CartRepository;
import com.project.book_store_be.Repository.DisCountRepository;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Request.CartRequest;
import com.project.book_store_be.Response.CartResponse;
import com.project.book_store_be.Response.ProductRes.ProductCartResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
    private final DisCountRepository disCountRepository;
    private final ImageProductService imageProductService;
    private final UserService userService;


    public CartResponse getCartByUserId(int page, int size) {
        Cart cart = cartRepository.findByUser(userService.getCurrentUser()).orElseThrow();
        Pageable pageable = PageRequest.of(page, size);
        Page<CartDetail> cartDetailsPage = cartDetailRepository.findByCart(cart, pageable);
        return convertToCartResponse(cartDetailsPage);
    }

    public void addToCart(CartRequest cartRequest) {
        Cart cart = cartRepository.findByUser(userService.getCurrentUser()).orElseThrow();
        Product product = productRepository.findById(cartRequest.getProductId())
                .orElseThrow(() -> new NoSuchElementException("Product not found"));
        Optional<CartDetail> cartDetailOptional = cartDetailRepository.findByCartAndProduct(cart, product);

        if (cartRequest.getCartQuantity() < 1 || cartRequest.getCartQuantity() > product.getQuantity()) {
            throw new IllegalArgumentException("Số lượng không hợp lệ. Phải lớn hơn hoặc bằng 1 và nhỏ hơn hoặc bằng số lượng có sẵn.");
        }
        if (cartDetailOptional.isPresent()) {
            CartDetail cartDetail = cartDetailOptional.get();
            cartDetail.setCartQuantity(cartRequest.getCartQuantity() + cartDetail.getCartQuantity());
            cartDetailRepository.save(cartDetail);
            return;
        }
        CartDetail cartDetail = new CartDetail();
        cartDetail.setProduct(product);
        cartDetail.setCartQuantity(cartRequest.getCartQuantity());
        cartDetail.setCart(cart);
        cartDetailRepository.save(cartDetail);
    }

    public void updateCartItem(Long cartDetailId, CartRequest cartRequest) {
        Cart cart = cartRepository.findByUser(userService.getCurrentUser()).orElseThrow();
        CartDetail cartDetail = cartDetailRepository.findById(cartDetailId)
                .orElseThrow(() -> new NoSuchElementException("Product not found in cart"));

        if (cartRequest.getCartQuantity() < 1 || cartRequest.getCartQuantity() > cartDetail.getProduct().getQuantity()) {
            throw new IllegalArgumentException("Số lượng không hợp lệ. Phải lớn hơn hoặc bằng 1 và nhỏ hơn hoặc bằng số lượng có sẵn.");
        }

        cartDetail.setCartQuantity(cartRequest.getCartQuantity());
        cartDetailRepository.save(cartDetail);
    }

    public void removeCartItem(Long productId) {
        Cart cart = cartRepository.findByUser(userService.getCurrentUser()).orElseThrow();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Product not found"));

        CartDetail cartDetail = cartDetailRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new NoSuchElementException("Product not found in cart"));

        cartDetailRepository.delete(cartDetail);
    }

    private CartResponse convertToCartResponse(Page<CartDetail> cartDetailsPage) {
        List<ProductCartResponse> productResponses = cartDetailsPage.getContent().stream()
                .map(this::convertToProductCartResponse)
                .collect(Collectors.toList());
        return CartResponse.builder()
                .cart(productResponses)
                .totalPages(cartDetailsPage.getTotalPages())
                .currentPage(cartDetailsPage.getNumber())
                .totalItems(cartDetailsPage.getTotalElements())
                .build();
    }

    private ProductCartResponse convertToProductCartResponse(CartDetail detail) {
        Product product = detail.getProduct();
        BigDecimal discountValue = calculateDiscount(product);
        String thumbnailUrl = imageProductService.getThumbnailProduct(product.getId()) != null
                ? imageProductService.getThumbnailProduct(product.getId()).getUrlImage()
                : null;
        return ProductCartResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .cartQuantity(detail.getCartQuantity())
                .original_price(product.getOriginal_price())
                .discount(discountValue)
                .price(product.getOriginal_price().subtract(discountValue))
                .thumbnail_url(thumbnailUrl)
                .build();
    }

    private BigDecimal calculateDiscount(Product product) {
        DisCount disCount = disCountRepository.findByStatus(DiscountStatus.ACTIVE).orElse(null);
        if (disCount != null && disCount.getProducts().contains(product)) {
            return product.getOriginal_price()
                    .multiply(BigDecimal.valueOf(disCount.getDiscountRate()))
                    .divide(BigDecimal.valueOf(100));
        }
        return BigDecimal.ZERO;
    }
}
