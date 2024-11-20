package com.project.book_store_be.Services;

import com.project.book_store_be.Interface.CheckoutService;
import com.project.book_store_be.Interface.OrderService;
import com.project.book_store_be.Interface.ShippingService;
import com.project.book_store_be.Interface.VoucherService;
import com.project.book_store_be.Model.*;
import com.project.book_store_be.Repository.OrderRepository;
import com.project.book_store_be.Response.CheckoutResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements CheckoutService {
    private final CartService cartService;
    private final ProductService productService;
    private final ImageProductService imageProductService;
    private final ShippingService shippingService;
    private final VoucherService voucherService;
    private final OrderRepository orderRepository;

    @Override
    public Map<String, Object> getCheckoutData(List<Long> cartIds, Long productId, Integer qty,
                                               String province, String district, String commune, String detail) {
        List<CheckoutResponse> responses = getCheckoutResponses(cartIds, productId, qty);

        BigDecimal originalSubtotal = calculateSubtotal(responses, true);
        BigDecimal totalDiscount = calculateSubtotal(responses, false);
        Integer totalWeight = calculateTotalWeight(responses);
        BigDecimal shippingFee = calculateShippingFee(province, district, commune, detail, totalWeight, originalSubtotal.subtract(totalDiscount));
        BigDecimal grandTotal = originalSubtotal.subtract(totalDiscount).add(shippingFee);

        return Map.of(
                "items", responses,
                "originalSubtotal", originalSubtotal,
                "totalDiscount", totalDiscount,
                "shippingFee", shippingFee,
                "grandTotal", grandTotal
        );
    }

    @Override
    public Map<?, ?> reCheckout(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new NoSuchElementException("Order not found"));
        final BigDecimal[] grandTotal = {BigDecimal.ZERO};
        final BigDecimal[] originalSubtotal = {BigDecimal.ZERO};
        final BigDecimal[] totalDiscount = {BigDecimal.ZERO};

        List<CheckoutResponse> responses = order.getOrderDetails().stream().map(detail -> {
            BigDecimal discount = detail.getDiscount() != null ? detail.getDiscount() : BigDecimal.ZERO;
            BigDecimal quantity = BigDecimal.valueOf(detail.getQuantity());

            BigDecimal originalPriceAtPurchase = detail.getOriginalPriceAtPurchase();
            BigDecimal priceAtPurchase = detail.getPriceAtPurchase();
            originalSubtotal[0] = originalSubtotal[0].add(originalPriceAtPurchase.multiply(quantity));
            grandTotal[0] = grandTotal[0].add(priceAtPurchase.multiply(quantity));
            totalDiscount[0] = totalDiscount[0].add(discount.multiply(quantity));
            return convertToResponseFromOrder(detail);

        }).toList();
        BigDecimal shippingFee = order.getShippingFee();
        grandTotal[0] = grandTotal[0].add(shippingFee);
        return Map.of(
                "items", responses,
                "originalSubtotal", originalSubtotal[0],
                "totalDiscount", totalDiscount[0],
                "shippingFee", shippingFee,
                "grandTotal", grandTotal[0],
                "voucher", voucherService.mapToResponse(order.getVoucher())

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
        } else {
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

    private CheckoutResponse convertToResponseFromOrder(OrderDetail orderDetail) {
        return CheckoutResponse.builder()
                .cartId(null)
                .productId(orderDetail.getProduct().getId())
                .productName(orderDetail.getProduct().getName())
                .quantity(orderDetail.getQuantity())
                .original_price(orderDetail.getOriginalPriceAtPurchase())
                .discount(orderDetail.getDiscount() != null ? orderDetail.getDiscount() : BigDecimal.ZERO)
                .price(orderDetail.getPriceAtPurchase())
                .weight(orderDetail.getProduct().getWeight())
                .thumbnail_url(imageProductService.getThumbnailProduct(orderDetail.getProduct().getId()))
                .build();
    }
}
