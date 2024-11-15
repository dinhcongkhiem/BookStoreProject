package com.project.book_store_be.Services;

import com.project.book_store_be.Interface.CheckoutService;
import com.project.book_store_be.Interface.ShippingService;
import com.project.book_store_be.Model.Cart;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Response.CheckoutResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements CheckoutService {
    private final CartService cartService;
    private final ProductService productService;
    private final ImageProductService imageProductService;
    private final ShippingService shippingService;

    @Override
    public Map<String, Object> getCheckoutData(List<Long> cartIds, Long productId, Integer qty,
                                               String province, String district, String commune, String detail) {
        List<CheckoutResponse> responses = getCheckoutResponses(cartIds, productId, qty);

        BigDecimal originalSubtotal = calculateSubtotal(responses, true);
        BigDecimal totalDiscount = calculateSubtotal(responses, false);
        Integer totalWeight = calculateTotalWeight(responses);
        BigDecimal shippingFee =  calculateShippingFee(province, district, commune, detail, totalWeight, originalSubtotal.subtract(totalDiscount));
        BigDecimal grandTotal = originalSubtotal.subtract(totalDiscount).add(shippingFee);

        return Map.of(
                "items", responses,
                "originalSubtotal", originalSubtotal,
                "totalDiscount", totalDiscount,
                "shippingFee", shippingFee,
                "grandTotal", grandTotal
        );
    }

    private List<CheckoutResponse> getCheckoutResponses(List<Long> cartIds, Long productId, Integer qty) {
        if (cartIds != null && !cartIds.isEmpty()) {
            List<Cart> carts = cartService.getCartsById(cartIds);
            return carts.stream().map(c -> convertToResponse(c, null, null)).toList();
        } else {
            return List.of(convertToResponse(null, productId, qty));
        }
    }

    private BigDecimal calculateSubtotal(List<CheckoutResponse> responses, boolean isOriginalPrice) {
        return responses.stream()
                .map(item -> (isOriginalPrice ? item.getOriginal_price() : item.getDiscount()).multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Integer calculateTotalWeight(List<CheckoutResponse> responses) {
        return responses.stream()
                .map(CheckoutResponse::getWeight)
                .reduce(0, Integer::sum);
    }

    private BigDecimal calculateShippingFee(String province, String district, String commune, String detail,
                                            Integer totalWeight, BigDecimal total) {
        if (isAddressValid(province, district, commune, detail)) {
            return shippingService.calculateShippingFee(province, district, commune, detail, totalWeight, total).getFee();
        }else {
            return shippingService.calculateShippingFee(totalWeight, total).getFee();
        }
    }

    private boolean isAddressValid(String province, String district, String commune, String detail) {
        return province != null && district != null && commune != null && detail != null;
    }

    private CheckoutResponse convertToResponse(Cart cart, Long productId, Integer qty) {
        Product product = Optional.ofNullable(cart)
                .map(Cart::getProduct)
                .orElseGet(() -> productService.findProductById(productId));

        BigDecimal discountVal = (BigDecimal) productService.getDiscountValue(product).get("discountVal");
        return CheckoutResponse.builder()
                .cartId(cart != null ? cart.getId() : null)
                .productId(product.getId())
                .productName(product.getName())
                .quantity(cart != null ? cart.getCartQuantity() : qty)
                .original_price(product.getOriginal_price())
                .discount(discountVal)
                .price(product.getOriginal_price().subtract(discountVal))
                .weight(product.getWeight())
                .thumbnail_url(imageProductService.getThumbnailProduct(product.getId()))
                .build();
    }
}
